import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { profiles, workspaces, workspaceMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { inviteMemberAction, removeMemberAction, transferOwnershipAction } from './actions';
import { Users, UserPlus, Crown, Trash2, ShieldAlert } from 'lucide-react';
import { redirect } from 'next/navigation';
import { checkInviteQuota } from '@/lib/workspace-utils';

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }> | { workspaceId: string };
}) {
  const resolvedParams = await params;
  const workspaceId = resolvedParams.workspaceId;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Kiểm tra quyền
  const ws = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  if (!ws || ws.length === 0) redirect('/dashboard');
  
  const isOwner = ws[0].ownerId === user.id;

  // Lấy danh sách thành viên
  // (Thay vì JOIN phức tạp, làm nhanh qua logic memory để xử lý MVP)
  const allMembersRaw = await db.select().from(workspaceMembers).where(eq(workspaceMembers.workspaceId, workspaceId));
  const memberProfileIds = allMembersRaw.map(m => m.userId);
  
  const allProfiles = await db.select().from(profiles);
  const profilesMap = new Map(allProfiles.map(p => [p.id, p]));

  const members = allMembersRaw.map(m => ({
    ...m,
    profile: profilesMap.get(m.userId)
  }));

  // Kiểm tra Quota hiện tại của Owner
  const quotaInfo = isOwner ? await checkInviteQuota(user.id) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Cài đặt Nhóm: {ws[0].name}</h1>
        <p className="text-zinc-400 mt-2">Quản lý thành viên, hạn mức và phân quyền trong không gian này.</p>
      </div>

      {!isOwner && (
         <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 text-amber-500">
           <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
           <p className="text-sm">Bạn đang xem với quyền <strong>Thành viên</strong>. Chỉ Chủ sở hữu mới có quyền phân bổ thành viên.</p>
         </div>
      )}

      {/* BOX 1: THÊM THÀNH VIÊN */}
      {isOwner && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold flex items-center gap-2"><UserPlus className="w-5 h-5" /> Mời Thành Viên</h2>
             {quotaInfo && (
                <div className={`px-3 py-1 text-sm font-semibold rounded-full border ${quotaInfo.canInvite ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                   Quota: {quotaInfo.used} / {quotaInfo.total} người duy nhất
                </div>
             )}
          </div>
          
          <form action={async (formData) => {
            'use server';
            const email = formData.get('email') as string;
            if (!email) return;
            // Thực thi server action
            const res = await inviteMemberAction(workspaceId, email);
            // Có thể dùng useActionState ở Client Component để hứng lỗi UI đẹp hơn, 
            // hiện tại chạy ngầm server logic.
            if(res.error) console.log("Lỗi mời: ", res.error);
          }}>
            <div className="flex gap-4">
              <input 
                type="email" 
                name="email"
                required
                placeholder="Nhập địa chỉ email của thành viên..." 
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <button 
                type="submit" 
                disabled={!quotaInfo?.canInvite}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Gửi Lời Mời
              </button>
            </div>
            {!quotaInfo?.canInvite && (
               <p className="mt-2 text-sm text-rose-500">Bạn đã dùng hết hạn mức mời của gói. Vui lòng xoá bớt người cũ để thêm người mới.</p>
            )}
          </form>
        </div>
      )}

      {/* BOX 2: DANH SÁCH THÀNH VIÊN */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
         <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><Users className="w-5 h-5" /> Thành Viên ({members.length})</h2>
         
         <div className="space-y-4">
           {members.map((member) => {
              const isMemOwner = ws[0].ownerId === member.userId;
              const isMe = user.id === member.userId;
              
              return (
                <div key={member.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-800/30 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold uppercase">
                      {member.profile?.email.charAt(0)}
                    </div>
                    <div>
                       <p className="font-semibold">{member.profile?.firstName || 'Người dùng'} {isMe && '(Bạn)'}</p>
                       <p className="text-sm text-zinc-500">{member.profile?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                     {isMemOwner ? (
                       <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-3 py-1 rounded-md text-sm font-bold uppercase">
                         <Crown className="w-4 h-4" /> Chủ sở hữu
                       </span>
                     ) : (
                       <span className="text-zinc-400 bg-zinc-800 px-3 py-1 rounded-md text-sm font-semibold uppercase">
                         Thành viên
                       </span>
                     )}

                     {/* Các nút Hành động chỉ cho Owner */}
                     {isOwner && !isMemOwner && (
                       <div className="flex items-center gap-2 border-l border-zinc-800 pl-3 ml-2">
                          <form action={async () => {
                            'use server';
                            await transferOwnershipAction(workspaceId, member.userId);
                          }}>
                            <button type="submit" title="Chuyển nhượng Căn phòng cho Tên này" className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition">
                               <Crown className="w-5 h-5" />
                            </button>
                          </form>

                          <form action={async () => {
                            'use server';
                            await removeMemberAction(workspaceId, member.userId);
                          }}>
                            <button type="submit" title="Đuổi khỏi phòng" className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition">
                               <Trash2 className="w-5 h-5" />
                            </button>
                          </form>
                       </div>
                     )}
                  </div>
                </div>
              );
           })}
         </div>
      </div>
    </div>
  );
}
