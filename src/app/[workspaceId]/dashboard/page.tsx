import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { CreditCard, CheckCircle2, XCircle } from 'lucide-react';
import { checkWorkspaceAccess } from '@/lib/workspace-utils';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ workspaceId: string }> | { workspaceId: string };
}) {
  const resolvedParams = await params;
  const workspaceId = resolvedParams.workspaceId;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let dbUser;
  try {
    const results = await db.select().from(profiles).where(eq(profiles.id, user!.id)).limit(1);
    dbUser = results[0];
  } catch (error) {}

  // Thay vì check subscription cá nhân như cũ, check quyền VIP của Workspace hiện hành
  const isVipWorkspace = await checkWorkspaceAccess(workspaceId);

  // Xem thử tài khoản cá nhân của người dùng NÀY có phải VIP không (để hiện nút Mua gói)
  const isPersonalVip = dbUser?.subscriptionStatus === 'active' &&
    dbUser?.subscriptionExpiresAt &&
    new Date(dbUser.subscriptionExpiresAt) > new Date();

  return (
    <>
      <h1 className="text-4xl font-extrabold tracking-tight">Trang chủ không gian làm việc</h1>
      <p className="mt-2 text-zinc-400">Bạn đang ở trong phòng làm việc. Các dữ liệu bên dưới là riêng biệt.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* Quyền lợi Workspace */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl relative overflow-hidden">
          {isVipWorkspace && <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>}
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-lg font-semibold text-zinc-300">Cấp độ Không Gian (Team)</h3>
            {isVipWorkspace ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            ) : (
              <XCircle className="h-6 w-6 text-rose-500" />
            )}
          </div>
          <div className="mt-4 relative z-10">
            <div className={`text-3xl font-bold ${isVipWorkspace ? 'text-emerald-400 bg-emerald-500/10 p-2 rounded-lg inline-block' : 'text-rose-400'}`}>
              {isVipWorkspace ? '🌟 VIP WORKSPACE' : 'Free Tier'}
            </div>
            <p className="mt-2 text-sm text-zinc-400">
              {isVipWorkspace
                ? 'Không gian này được kế thừa ĐẶC QUYỀN PRO từ gói cước của Chủ sở hữu. Tài nguyên không giới hạn!'
                : 'Mọi tính năng nâng cao trong không gian này đang bị khóa. Hãy nói người tạo phòng nâng cấp gói.'}
            </p>
          </div>
        </div>

        {/* Trạng thái BẢN THÂN CÁ NHÂN */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
          <h3 className="text-lg font-semibold text-zinc-300">Ví Của Bạn (Personal Billing)</h3>
          <div className="mt-4">
             <div className="text-xl font-bold bg-zinc-800/50 p-2 rounded-xl text-zinc-300 border border-zinc-800">
               {isPersonalVip ? 'Tài khoản Đã Nâng Cấp' : 'Tài khoản Miễn phí'}
             </div>
          </div>
          <div className="mt-6">
            {isPersonalVip ? (
              <button
                disabled
                className="w-full rounded-xl bg-zinc-800 px-6 py-4 text-center font-bold text-zinc-500 cursor-not-allowed"
              >
                Bạn là Đại bàng
              </button>
            ) : (
               <a
                href="/pricing"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-center font-bold text-white transition hover:opacity-90 active:scale-[0.98]"
              >
                <CreditCard className="h-5 w-5" />
                Nâng cấp tài khoản bạn
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Pro Content */}
      <div className={`mt-12 rounded-2xl border p-12 text-center transition-all ${isVipWorkspace ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-dashed border-zinc-800'}`}>
        {isVipWorkspace ? (
           <>
              <h2 className="text-2xl font-bold text-indigo-400">🔥 Khu vực Premium Đã Mở Khóa</h2>
              <p className="mt-4 text-zinc-400">Do đang ở trong Vùng VIP, bạn (dù là user Free) cũng có thể thấy nội dung sịn sò này! Hãy quẩy đi Bờ rồ!</p>
              
              <div className="mt-8 flex justify-center gap-4">
                 <button className="bg-white text-black px-6 py-3 rounded-full font-bold">Chạy AI Models</button>
                 <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-full font-bold">Export PDF Data Khủng</button>
              </div>
           </>
        ) : (
           <>
               <h2 className="text-2xl font-bold text-zinc-600">Khu Vực Bị Khóa</h2>
               <p className="mt-4 text-zinc-500">Tính năng này yêu cầu Chủ phòng phải mua gói VIP.</p>
           </>
        )}
      </div>
    </>
  );
}
