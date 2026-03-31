import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { workspaceMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function DashboardRedirector() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Find user's workspaces
  const userWorkspaces = await db.select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, user.id));

  if (userWorkspaces.length > 0) {
    // Redirect to the first available workspace
    redirect(`/${userWorkspaces[0].workspaceId}/dashboard`);
  } else {
    // Nếu trong trường hợp rất hiếm hoi user không có workspace nào (lỗi callback tạo), 
    // chúng ta redirect về trang báo lỗi xử lý hoặc tự tạo lại.
    // Ở đây redirect tạm về auth callback để kích hoạt lại script tạo workspace.
    redirect('/auth/callback');
  }
}
