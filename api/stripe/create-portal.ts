import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { camaraId, returnUrl } = req.body;

    // Busca o stripe_customer_id da câmara
    const { data: camara, error } = await supabase
      .from('camaras')
      .select('stripe_customer_id')
      .eq('id', camaraId)
      .single();

    if (error || !camara?.stripe_customer_id) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: camara.stripe_customer_id,
      return_url: returnUrl,
    });

    return res.status(200).json({ url: portalSession.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}