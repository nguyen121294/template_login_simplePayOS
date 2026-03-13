import { createClient } from '@/lib/supabase/server';
import { payos } from '@/lib/payos';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { payments } from '@/db/schema';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const orderCode = Number(String(Date.now()).slice(-9)); // Simplified order code
  const amount = 100000; // 100,000 VND for example
  
  const paymentLinkData = {
    orderCode: orderCode,
    amount: amount,
    description: 'PRO Subscription',
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
  };

  try {
    const paymentLink = await payos.paymentRequests.create(paymentLinkData);
    
    // Log payment attempt
    await db.insert(payments).values({
      id: String(orderCode),
      userId: user.id,
      amount: amount,
      status: 'pending',
    });

    return NextResponse.redirect(paymentLink.checkoutUrl);
  } catch (error) {
    console.error('PayOS error:', error);
    return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 });
  }
}
