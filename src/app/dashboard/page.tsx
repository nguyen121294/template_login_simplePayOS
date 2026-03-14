import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { CreditCard, CheckCircle2, XCircle, LogOut } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let dbUser;
  try {
    console.log("Connecting to DB with:", process.env.DATABASE_URL);
    const results = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
    dbUser = results[0];
  } catch (error) {
    console.error('Dashboard DB Query Error:', error);
  }

  const isSubscribed = dbUser?.subscriptionStatus === 'active' &&
    dbUser?.subscriptionExpiresAt &&
    new Date(dbUser.subscriptionExpiresAt) > new Date();


  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            SaaS Starter
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-zinc-400 hover:text-white transition">
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Subscription Status Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-300">Subscription Status</h3>
              {isSubscribed ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              ) : (
                <XCircle className="h-6 w-6 text-rose-500" />
              )}
            </div>
            <div className="mt-4">
              <div className={`text-3xl font-bold ${isSubscribed ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isSubscribed ? 'PRO Account' : 'Free Tier'}
              </div>
              <p className="mt-2 text-sm text-zinc-400">
                {isSubscribed
                  ? `Your subscription expires on ${new Date(dbUser?.subscriptionExpiresAt!).toLocaleDateString()}`
                  : 'Upgrade to PRO to unlock all features'}
              </p>
            </div>
          </div>

          {/* Payment Action Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
            <h3 className="text-lg font-semibold text-zinc-300">Quick Actions</h3>
            <div className="mt-6">
              {isSubscribed ? (
                <button
                  disabled
                  className="w-full rounded-xl bg-zinc-800 px-6 py-4 text-center font-bold text-zinc-500 cursor-not-allowed"
                >
                  Manage Subscription
                </button>
              ) : (
                <a
                  href="/pricing"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-center font-bold text-white transition hover:opacity-90 active:scale-[0.98]"
                >
                  <CreditCard className="h-5 w-5" />
                  Xem các gói
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Pro Content */}
        {isSubscribed && (
          <div className="mt-12 rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
            <h2 className="text-2xl font-bold">🎉 Welcome to PRO Content</h2>
            <p className="mt-4 text-zinc-400">This section is only visible to active subscribers.</p>
          </div>
        )}
      </main>
    </div>
  );
}
