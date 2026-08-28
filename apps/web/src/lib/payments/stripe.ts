import Stripe from 'stripe';

let stripeInstance: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (stripeInstance === undefined) {
    stripeInstance = new Stripe(key);
  }
  return stripeInstance;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export async function createStripeCheckoutSession(params: {
  orderId: string;
  userId: string;
  customerEmail: string;
  description: string;
  totalMinor: number;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error('Stripe no está configurado');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'mxn',
          product_data: {
            name: params.description,
          },
          unit_amount: params.totalMinor,
        },
        quantity: 1,
      },
    ],
    customer_email: params.customerEmail,
    metadata: {
      user_id: params.userId,
      order_id: params.orderId,
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });

  return session.url as string;
}

export function verifyStripeWebhook(
  body: string,
  signature: string
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = getStripe();
  if (!stripe || !secret) {
    throw new Error('Stripe webhook no está configurado');
  }
  return stripe.webhooks.constructEvent(body, signature, secret);
}
