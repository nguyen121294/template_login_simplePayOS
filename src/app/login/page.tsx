'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [origin, setOrigin] = useState('');
  const supabase = createClient();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <LogIn className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">Welcome back</h2>
          <p className="mt-2 text-zinc-400">Sign in to your account</p>
        </div>
        
        <div className="mt-8">
          {origin ? (
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              theme="dark"
              providers={[]}
              redirectTo={`${origin}/auth/callback`}
            />
          ) : (
            <div className="flex justify-center p-4">
              <span className="text-zinc-500">Loading...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
