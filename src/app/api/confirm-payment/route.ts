import { createClient } from '@/lib/supabase/server';
import { payos } from '@/lib/payos';
import { db } from '@/db';
import { profiles, payments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getPlan } from '@/lib/plans';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderCode } = await request.json();

    if (!orderCode) {
      return NextResponse.json({ error: 'Missing orderCode' }, { status: 400 });
    }

    // 1. Find the payment record
    const payment = await db.query.payments.findFirst({
      where: eq(payments.id, String(orderCode)),
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Guard: only the owner can confirm their own payment
    if (payment.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If already marked paid, nothing to do
    if (payment.status === 'paid') {
      return NextResponse.json({ success: true, alreadyPaid: true });
    }

    // 2. Call PayOS API to verify actual payment status
    const paymentInfo = await payos.paymentRequests.get(String(orderCode));

    if (paymentInfo.status !== 'PAID') {
      return NextResponse.json({ success: false, status: paymentInfo.status });
    }

    // 3. Update payment record
    await db.update(payments)
      .set({ status: 'paid' })
      .where(eq(payments.id, String(orderCode)));

    // 4. Calculate subscription expiry from plan
    const plan = getPlan(payment.plan ?? 'plus');
    const days = plan?.days ?? 30;

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);

    // 5. Activate subscription
    await db.update(profiles)
      .set({
        subscriptionStatus: 'active',
        subscriptionExpiresAt: expirationDate,
        subscriptionId: plan?.id ?? payment.plan,
      })
      .where(eq(profiles.id, user.id));

    console.log(`[ConfirmPayment] User ${user.id} activated "${plan?.name}" for ${days} days.`);

    return NextResponse.json({
      success: true,
      plan: plan?.name,
      expiresAt: expirationDate.toISOString(),
    });
  } catch (error) {
    console.error('[ConfirmPayment] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
