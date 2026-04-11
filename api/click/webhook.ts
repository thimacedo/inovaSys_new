import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    const event = payload.event;
    const envelope = payload.envelope;

    let status: string | null = null;
    if (event === 'envelope.signed') status = 'signed';
    else if (event === 'envelope.canceled') status = 'canceled';
    else if (event === 'envelope.expired') status = 'expired';

    if (status && envelope?.key) {
      await supabase
        .from('documentos_assinatura')
        .update({ status, updated_at: new Date() })
        .eq('envelope_key', envelope.key);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}