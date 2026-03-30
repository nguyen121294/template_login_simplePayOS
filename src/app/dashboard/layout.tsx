import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { XCircle, AlertTriangle, RefreshCcw, LogOut } from 'lucide-react';
import { reactivateAccount } from './account/actions'; // We will create this action

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let dbUser = null;
  try {
    const results = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
    dbUser = results[0];
  } catch (error) {
    console.error('Layout DB Query Error:', error);
  }

  // 1. Nếu bị Admin khóa vĩnh viễn
  if (dbUser?.status === 'locked') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-red-500/20 rounded-2xl p-8 text-center shadow-2xl">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Tài khoản bị khóa</h1>
          <p className="text-zinc-400 mb-6">
            Tài khoản của bạn đã bị quản trị viên khóa do vi phạm chính sách. Vui lòng liên hệ bộ phận hỗ trợ để biết thêm chi tiết.
          </p>
          <form action="/auth/signout" method="post">
            <button type="submit" className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition">
              Đăng xuất
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Nếu User tự vô hiệu hóa (Soft Delete)
  if (dbUser?.status === 'inactive') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-amber-500/20 rounded-2xl p-8 text-center shadow-2xl">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Tài khoản Đã Ngủ Đông</h1>
          <p className="text-zinc-400 mb-6">
            Bạn đã vô hiệu hóa tài khoản này. Hệ thống vẫn lưu trữ thông tin của bạn. Bạn có thể kích hoạt lại bất cứ lúc nào.
          </p>
          <div className="space-y-3">
            <form action={async () => {
              'use server';
              await reactivateAccount();
            }}>
              <button type="submit" className="flex items-center justify-center w-full gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-90 text-white font-bold py-3 rounded-xl transition">
                <RefreshCcw className="w-5 h-5" />
                Kích hoạt lại tài khoản
              </button>
            </form>
            <form action="/auth/signout" method="post">
              <button type="submit" className="flex items-center justify-center w-full gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition">
                <LogOut className="w-5 h-5" />
                Đăng xuất
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
