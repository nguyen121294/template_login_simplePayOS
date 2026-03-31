import { db } from '@/db';
import { workspaces, workspaceMembers, profiles } from '@/db/schema';
import { eq, and, countDistinct } from 'drizzle-orm';

const MAX_INVITES_PER_VIP_OWNER = 5; // Có thể chuyển thành config env sau
const MAX_WORKSPACES_DEFAULT = 1; // Gói Free tạo tối đa 1 phòng
const MAX_WORKSPACES_VIP = 999; // Lát nữa check nếu là gói VIP thì vô số phòng

/**
 * Kiểm tra xem Workspace hiện tại có phải là trạng thái VIP hay không, 
 * dựa vào trạng thái gói cước (subscription) của người tạo (Owner).
 */
export async function checkWorkspaceAccess(workspaceId: string): Promise<boolean> {
  const ws = await db.select({
      ownerId: workspaces.ownerId
    })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!ws || ws.length === 0) return false;

  const ownerProfile = await db.select({
      subStatus: profiles.subscriptionStatus
    })
    .from(profiles)
    .where(eq(profiles.id, ws[0].ownerId))
    .limit(1);

  if (!ownerProfile || ownerProfile.length === 0) return false;

  // Nếu owner là active -> Workspace này là VIP
  return ownerProfile[0].subStatus === 'active';
}

/**
 * Đếm số lượng người tham gia DUY NHẤT (Unique Users) trong tất cả các Workspace
 * do một user làm chủ. Để chặn khi mời quá Quota.
 */
export async function checkInviteQuota(ownerId: string): Promise<{ canInvite: boolean; used: number; total: number }> {
  // 1. Tìm tất cả các Workspace do ownerId làm chủ
  const ownerWorkspaces = await db.select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.ownerId, ownerId));

  if (ownerWorkspaces.length === 0) {
    return { canInvite: true, used: 0, total: MAX_INVITES_PER_VIP_OWNER };
  }

  const workspaceIds = ownerWorkspaces.map(w => w.id);

  // 2. Vì db.select().countDistinct chưa hỗ trợ mảng IN hoàn hảo theo API mới, 
  // tính qua việc lấy list unique users thuộc các workspaces này (loại trừ chính owner)
  const members = await db.select({ userId: workspaceMembers.userId })
    .from(workspaceMembers)
    .where(and(
      // Note: do not use inArray here if possible to keep simple, but drizzle 'inArray' works
      // using manual map filtering as fallback if we don't import inArray. Let's do a simple query.
    ));

  // Tạm tính Drizzle logic (Sẽ tối ưu truy vấn sau): 
  // Rút danh sách userId duy nhất đang tồn tại trong các workspace đó
  const allMembers = await db.select()
    .from(workspaceMembers);
    
  // Filter memory
  const uniqueMemberIds = new Set<string>();
  allMembers.forEach(m => {
    if (workspaceIds.includes(m.workspaceId) && m.userId !== ownerId) {
      uniqueMemberIds.add(m.userId);
    }
  });

  const used = uniqueMemberIds.size;
  return { 
    canInvite: used < MAX_INVITES_PER_VIP_OWNER, 
    used, 
    total: MAX_INVITES_PER_VIP_OWNER 
  };
}

/**
 * Chuyển giao Workspace cho 1 người khác. 
 * Điều kiện BẮT BUỘC: Người nhận phải đang có tài khoản VIP (active).
 */
export async function transferWorkspaceOwnership(workspaceId: string, currentOwnerId: string, newOwnerId: string): Promise<{ success: boolean; error?: string }> {
  // 1. Kiểm tra người nhận có gói VIP chưa
  const newOwner = await db.select({ subStatus: profiles.subscriptionStatus })
    .from(profiles)
    .where(eq(profiles.id, newOwnerId))
    .limit(1);

  if (!newOwner || newOwner.length === 0 || newOwner[0].subStatus !== 'active') {
    return { success: false, error: 'Người nhận phải sở hữu gói VIP đang hoạt động để nhận bàn giao.' };
  }

  // 2. Chuyển quyền Ownership trong bảng Workspaces
  await db.update(workspaces)
    .set({ ownerId: newOwnerId })
    .where(eq(workspaces.id, workspaceId));

  // 3. (Tuỳ chọn) Đổi Role trong mảng thành viên
  await db.update(workspaceMembers)
    .set({ role: 'owner' })
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, newOwnerId)));

  return { success: true };
}

/**
 * Mời người dùng vào Workspace bằng Email.
 * Nếu email chưa đăng ký tài khoản -> Báo lỗi.
 */
export async function inviteUserByEmail(workspaceId: string, inviterId: string, email: string): Promise<{ success: boolean; error?: string }> {
  // 1. Kiểm tra Email có tồn tại trong hệ thống chưa (chỉ lấy top 1)
  const targetUser = await db.select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.email, email))
    .limit(1);

  if (!targetUser || targetUser.length === 0) {
    return { success: false, error: 'Email này chưa đăng ký tài khoản trên hệ thống. Không thể mời!' };
  }

  const targetUserId = targetUser[0].id;

  // 2. Không được mời chính mình
  if (targetUserId === inviterId) {
    return { success: false, error: 'Bạn không thể tự mời chính mình.' };
  }

  // 3. Quota check (đã viết hàm checkInviteQuota)
  const quota = await checkInviteQuota(inviterId);
  if (!quota.canInvite) {
     return { success: false, error: `Bạn đã đạt giới hạn mời tối đa (${quota.total} người duy nhất). Vui lòng nâng cấp gói hoặc xoá bớt người.`};
  }

  // 4. Kiểm tra xem người này đã ở trong Workspace chưa
  const existingMember = await db.select({ id: workspaceMembers.id })
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, targetUserId)))
    .limit(1);

  if (existingMember && existingMember.length > 0) {
    return { success: false, error: 'Người này đã ở trong Workspace của bạn rồi.' };
  }

  // 5. Thêm vào Workspace
  await db.insert(workspaceMembers).values({
    id: crypto.randomUUID(),
    workspaceId: workspaceId,
    userId: targetUserId,
    role: 'member'
  });

  return { success: true };
}

/**
 * Kiểm tra xem User này còn được quyền tạo thêm Workspace mới hay không?
 */
export async function checkWorkspaceCreationQuota(userId: string): Promise<{ canCreate: boolean; used: number; total: number }> {
  // Lấy tổng số phòng user hiện ĐANG LÀM CHỦ
  const ownerWorkspaces = await db.select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.ownerId, userId));
  
  const used = ownerWorkspaces.length;

  // Lấy gói cước hiện tại của User
  const ownerProfile = await db.select({ subStatus: profiles.subscriptionStatus })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  const isVip = ownerProfile && ownerProfile.length > 0 && ownerProfile[0].subStatus === 'active';
  
  // Logic giới hạn: Vip = 999 (hoặc vô hạn), Free = 1 phòng mặc định.
  // Ở đây admin có thể tích hợp đọc config từ DB table `plans` trong tương lai.
  const totalAllowed = isVip ? MAX_WORKSPACES_VIP : MAX_WORKSPACES_DEFAULT;

  return {
    canCreate: used < totalAllowed,
    used,
    total: totalAllowed
  };
}
