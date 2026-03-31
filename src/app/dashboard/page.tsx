import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { workspaces, workspaceMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function DashboardRedirector() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Lấy danh sách Workspace của User
  const userWorkspaces = await db.select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, user.id));

  if (userWorkspaces.length > 0) {
    // Chuyển hướng tới Workspace đầu tiên tìm thấy
    redirect(`/${userWorkspaces[0].workspaceId}/dashboard`);
  } else {
    // KHẮC PHỤC LỖI: Nếu User chưa có Workspace nào (do là tài khoản cũ tạo từ trước),
    // chúng ta sẽ tự tạo luôn cho họ một "Workspace Cá nhân" ngay tại đây,
    // thay vì redirect về /auth/callback (như cũ) gây ra vòng lặp lỗi.
    
    const workspaceId = crypto.randomUUID();
    const userName = user.user_metadata?.firstName || 'Cá nhân';
    
    try {
      // 1. Tạo Workspace mới cứng
      await db.insert(workspaces).values({
        id: workspaceId,
        name: `Workspace của ${userName}`,
        ownerId: user.id
      });

      // 2. Nhét User vào làm Chủ Sở Hữu (Owner) của Workspace vừa tạo
      await db.insert(workspaceMembers).values({
        id: crypto.randomUUID(),
        workspaceId: workspaceId,
        userId: user.id,
        role: 'owner'
      });
      
      // 3. Đá họ vào cái Workspace tươi mới đó!
      redirect(`/${workspaceId}/dashboard`);
    } catch (e) {
      console.error('Error creating default workspace for legacy user:', e);
      // Nếu lỗi DB (VD mất mạng, sập Supabase), đá về login cho an toàn.
      redirect('/login?error=Lỗi khởi tạo phòng làm việc');
    }
  }
}
