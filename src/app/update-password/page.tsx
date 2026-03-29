'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setSessionChecked(true);
      }
    };
    
    checkSession();
  }, [router, supabase.auth]);

  // Auth UI callback on successful password update
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          // You could show a specialized message here
        }
        if (event === 'USER_UPDATED') {
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        }
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  if (!sessionChecked) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">Reset Password</h2>
          <p className="mt-2 text-zinc-400">Enter your new password</p>
        </div>
        
        <div className="mt-8 [&_button]:!bg-blue-600 [&_button:hover]:!bg-blue-500 [&_input]:!border-zinc-800 [&_input]:!bg-zinc-950 [&_input]:!text-white [&_input:focus]:!border-blue-500 [&_input:focus]:!ring-blue-500 [&_label]:!text-zinc-300">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="dark"
            view="update_password"
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
}
