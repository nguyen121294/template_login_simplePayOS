import { payos } from '@/lib/payos';
import { db } from '@/db';
import { profiles, payments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  
  // Verify webhook signature (optional but recommended in production)
  // const verifiedData = payos.webhooks.verifyPaymentWebhookData(body);
  
  const { orderCode, status } = body.data || body;

  if (status === 'PAID') {
    // 1. Find the payment record to get the userId
    const payment = await db.query.payments.findFirst({
      where: eq(payments.id, String(orderCode)),
    });

    if (payment && payment.userId) {
      // 2. Update payment status
      await db.update(payments)
        .set({ status: 'paid' })
        .where(eq(payments.id, String(orderCode)));

      // 3. Update user subscription (e.g., 30 days from now)
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);

      await db.update(profiles)
        .set({
          subscriptionStatus: 'active',
          subscriptionExpiresAt: expirationDate,
        })
        .where(eq(profiles.id, payment.userId));
    }
  }

  return NextResponse.json({ success: true });
}
