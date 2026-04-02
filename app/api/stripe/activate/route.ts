import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2024-12-18.acacia' as any,
  });

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (supabaseAdmin) {
      const { data: existingSub } = await supabaseAdmin
        .from('subscriptions')
        .select('status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (existingSub) {
        return NextResponse.json({ activated: true, source: 'database' });
      }
    }

    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
    });

    const userSub = subscriptions.data.find(
      (sub) => sub.metadata?.userId === userId
    );

    if (userSub && supabaseAdmin) {
      await supabaseAdmin.from('users').update({ is_pro: true }).eq('id', userId);
      await supabaseAdmin.from('subscriptions').upsert({
        user_id: userId,
        status: 'active',
        plan: 'pro',
        price: 2.99,
        started_at: new Date().toISOString(),
        stripe_subscription_id: userSub.id,
        stripe_customer_id: userSub.customer as string,
        expires_at: new Date((userSub as any).current_period_end * 1000).toISOString(),
      }, { onConflict: 'user_id' });

      console.log('[Stripe Activate] Pro activated for user:', userId);
      return NextResponse.json({ activated: true, source: 'stripe_api' });
    }

    return NextResponse.json({ activated: false, message: 'No active subscription found' });
  } catch (error: any) {
    console.error('[Stripe Activate] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
