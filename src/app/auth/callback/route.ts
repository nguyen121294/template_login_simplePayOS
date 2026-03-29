import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { profiles } from '@/db/schema';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  let next = searchParams.get('next') ?? '/dashboard';
  const type = searchParams.get('type');

  if (type === 'recovery') {
    next = '/update-password';
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      try {
        // Create user in our DB if not exists
        await db.insert(profiles)
          .values({
            id: data.user.id,
            email: data.user.email!,
          })
          .onConflictDoUpdate({
            target: profiles.id,
            set: { email: data.user.email! }
          });
      } catch (dbError) {
        console.error('Database insertion failed:', dbError);
        // We still redirect to dashboard because Supabase auth succeeded
        // The dashboard will show appropriate state
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}
