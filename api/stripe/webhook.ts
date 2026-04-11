import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    const rawBody = await new Promise<string>((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { camara_id, user_id } = session.metadata!;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // Atualiza câmara com stripe_customer_id e subscription_id
        await supabase
          .from('camaras')
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status_assinatura: 'active',
            updated_at: new Date(),
          })
          .eq('id', camara_id);

        // Busca detalhes da subscription para saber o price_id (plano)
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;

        // Busca o plano correspondente no banco
        const { data: plano } = await supabase
          .from('planos')
          .select('id')
          .eq('stripe_price_id', priceId)
          .single();

        if (plano) {
          await supabase
            .from('camaras')
            .update({ plano_id: plano.id })
            .eq('id', camara_id);
        }

        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;

        // Mapeia status Stripe -> nosso status
        let assinaturaStatus = 'inactive';
        if (status === 'active' || status === 'trialing') assinaturaStatus = 'active';
        else if (status === 'past_due') assinaturaStatus = 'past_due';
        else if (status === 'canceled' || status === 'unpaid') assinaturaStatus = 'canceled';

        await supabase
          .from('camaras')
          .update({
            status_assinatura: assinaturaStatus,
            updated_at: new Date(),
          })
          .eq('stripe_customer_id', customerId);

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Busca camara pelo customer_id
        const { data: camara } = await supabase
          .from('camaras')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (camara) {
          // Registrar fatura paga
          await supabase.from('faturas').insert({
            camara_id: camara.id,
            stripe_invoice_id: invoice.id,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency,
            status: 'paid',
            paid_at: new Date(),
            invoice_url: invoice.hosted_invoice_url,
          });
        }

        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}