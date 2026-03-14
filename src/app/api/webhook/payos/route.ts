import { payos } from '@/lib/payos';
import { db } from '@/db';
import { profiles, payments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getPlan } from '@/lib/plans';

export async function POST(request: Request) {
  const body = await request.json();

  // Verify webhook signature (Crucial for production security)
  try {
    // PayOS SDK requires the body as-is for verification
    const verifiedData = payos.verifyPaymentWebhookData(body);
    // Use the verified data for processing
  } catch (err) {
    console.error('[Webhook] Invalid signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const { orderCode, status } = body.data || body;

  if (status === 'PAID') {
    // 1. Find the payment record to get userId and plan
    const payment = await db.query.payments.findFirst({
      where: eq(payments.id, String(orderCode)),
    });

    if (payment && payment.userId) {
      // 2. Update payment status
      await db.update(payments)
        .set({ status: 'paid' })
        .where(eq(payments.id, String(orderCode)));

      // 3. Look up plan to determine expiry days
      const plan = await getPlan(payment.plan ?? 'plus');
      const days = plan?.days ?? 30;

      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + days);

      // 4. Update user subscription with correct expiry and plan info
      await db.update(profiles)
        .set({
          subscriptionStatus: 'active',
          subscriptionExpiresAt: expirationDate,
          subscriptionId: plan?.id ?? payment.plan,
        })
        .where(eq(profiles.id, payment.userId));

      console.log(`[Webhook] User ${payment.userId} subscribed to "${plan?.name}" for ${days} days. Expires: ${expirationDate.toISOString()}`);
    }
  } else if (status === 'CANCELED' || status === 'CANCELLED' || status === 'FAILED') {
    // 5. User canceled or payment failed
    // Find payment record
    const payment = await db.query.payments.findFirst({
      where: eq(payments.id, String(orderCode)),
    });
    
    // Only update if it's currently pending
    if (payment && payment.status === 'pending') {
      await db.update(payments)
        .set({ status: 'cancelled' })
        .where(eq(payments.id, String(orderCode)));
        
      console.log(`[Webhook] Order ${orderCode} marked as failed/cancelled.`);
    }
  }

  return NextResponse.json({ success: true });
}
