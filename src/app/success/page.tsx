import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md text-center rounded-2xl border border-zinc-800 bg-zinc-900 p-12 shadow-2xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <CheckCircle className="h-12 w-12" />
        </div>
        <h1 className="mt-8 text-3xl font-bold text-white">Payment Successful!</h1>
        <p className="mt-4 text-zinc-400">
          Your account has been upgraded to PRO. You can now access all features.
        </p>
        <div className="mt-10">
          <Link
            href="/dashboard"
            className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-center font-bold text-white transition hover:bg-blue-500 active:scale-[0.98]"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
