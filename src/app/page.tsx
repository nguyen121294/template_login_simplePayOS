import Link from 'next/link';
import { ArrowRight, Shield, Zap, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-blue-500/30">
      {/* Hero Section */}
      <header className="relative overflow-hidden pt-16 pb-24 lg:pt-32">
        <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-full -translate-x-1/2 [background:radial-gradient(50%_50%_at_50%_0%,rgba(59,130,246,0.15)_0%,rgba(9,9,11,0)_100%)]" />
        
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400">
            <Sparkles className="h-4 w-4" />
            <span>Launch your SaaS in minutes</span>
          </div>
          
          <h1 className="mt-8 text-5xl font-extrabold tracking-tight sm:text-7xl">
             Next.js SaaS <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Starter</span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl">
            A minimalist, powerful template with Supabase Auth, Drizzle ORM, and PayOS integration. Everything you need to start charging.
          </p>
          
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-black transition hover:bg-zinc-200 active:scale-[0.98]"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold">Supabase Auth</h3>
              <p className="mt-2 text-zinc-400 text-sm leading-relaxed">
                Secure magic link authentication with server-side protection.
              </p>
            </div>
            
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold">Drizzle ORM</h3>
              <p className="mt-2 text-zinc-400 text-sm leading-relaxed">
                Type-safe, lightning fast database access using Drizzle ORM.
              </p>
            </div>
            
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold">PayOS Payments</h3>
              <p className="mt-2 text-zinc-400 text-sm leading-relaxed">
                Integrated payment gateway for seamless subscription upgrades.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
