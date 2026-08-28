import { verifyStripeWebhook } from '@/lib/payments/stripe';
import { createAdminClient } from '@/supabase-clients/admin';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return new Response('missing signature', { status: 400 });
  }

  let event;
  try {
    event = verifyStripeWebhook(body, signature);
  } catch {
    return new Response('invalid signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      const admin = createAdminClient();
      await admin
        .from('orders')
        .update({
          status: 'approved',
          provider_order_id: session.id,
          provider_payment_id:
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : null,
        })
        .eq('id', orderId);
    }
  }

  return new Response('ok', { status: 200 });
}
