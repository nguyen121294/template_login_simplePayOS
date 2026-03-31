import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { profiles, workspaces, workspaceMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';

import { type EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  let next = searchParams.get('next') ?? '/dashboard';
  const type = searchParams.get('type') as EmailOtpType | null;

  if (type === 'recovery') {
    next = '/update-password';
  }

  const supabase = await createClient();
  let user = null;
  let authError = null;

  // Handle Token Hash (from the manual email template change)
  if (type && (token_hash || code)) {
    const hash = token_hash || code;
    if (hash) {
      const { data, error } = await supabase.auth.verifyOtp({
        type,
        token_hash: hash,
      });
      user = data?.user;
      authError = error;
    }
  } 
  // Handle PKCE Code (Default Magic Link / OAuth flow)
  else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    user = data?.user;
    authError = error;
  }

  if (!authError && user) {
    try {
      // Create user in our DB if not exists
      const insertedUsers = await db.insert(profiles)
        .values({
          id: user.id,
          email: user.email!,
          firstName: user.user_metadata?.firstName || null,
          lastName: user.user_metadata?.lastName || null,
        })
        .onConflictDoUpdate({
          target: profiles.id,
          set: { email: user.email! }
        })
        .returning({ id: profiles.id });

      const dbUserId = insertedUsers[0]?.id || user.id;

      // Ensure user has at least one workspace
      const userWorkspaces = await db.select()
        .from(workspaceMembers)
        .where(eq(workspaceMembers.userId, dbUserId))
        .limit(1);

      if (userWorkspaces.length === 0) {
        const workspaceId = crypto.randomUUID();
        const userName = user.user_metadata?.firstName || 'Cá nhân';
        
        await db.insert(workspaces).values({
          id: workspaceId,
          name: `Workspace của ${userName}`,
          ownerId: dbUserId
        });

        await db.insert(workspaceMembers).values({
          id: crypto.randomUUID(),
          workspaceId: workspaceId,
          userId: dbUserId,
          role: 'owner'
        });
      }

    } catch (dbError) {
      console.error('Database insertion failed:', dbError);
    }

    return NextResponse.redirect(`${origin}${next}`);
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}
