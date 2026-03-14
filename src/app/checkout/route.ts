import { createClient } from '@/lib/supabase/server';
import { payos } from '@/lib/payos';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { payments } from '@/db/schema';
import { getPlan, PLANS } from '@/lib/plans';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Read plan from query string, default to 'plus'
  const { searchParams } = new URL(request.url);
  const planId = searchParams.get('plan') ?? 'plus';
  const plan = getPlan(planId);

  if (!plan || plan.id === 'free') {
    return NextResponse.redirect(new URL('/pricing', request.url));
  }

  const orderCode = Number(String(Date.now()).slice(-9));

  const paymentLinkData = {
    orderCode: orderCode,
    amount: plan.price,
    description: `${plan.name} ${plan.days}d`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?cancelOrder=${orderCode}`,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
  };

  try {
    const paymentLink = await payos.paymentRequests.create(paymentLinkData);

    // Log payment attempt with plan info
    await db.insert(payments).values({
      id: String(orderCode),
      userId: user.id,
      amount: plan.price,
      status: 'pending',
      plan: plan.id,
    });

    return NextResponse.redirect(paymentLink.checkoutUrl);
  } catch (error) {
    console.error('PayOS error:', error);
    return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 });
  }
}
