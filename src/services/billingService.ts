import { supabase } from '../lib/supabase';

export interface CheckoutOptions {
  priceId: string;
  camaraId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}

export const billingService = {
  async createCheckoutSession(options: CheckoutOptions): Promise<{ url: string }> {
    const response = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar sessão de checkout');
    }

    return response.json();
  },

  async createPortalSession(camaraId: string, returnUrl: string): Promise<{ url: string }> {
    const response = await fetch('/api/stripe/create-portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ camaraId, returnUrl }),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar portal');
    }

    return response.json();
  },

  async getSubscriptionStatus(camaraId: string): Promise<any> {
    const { data, error } = await supabase
      .from('camaras')
      .select('status_assinatura, plano_id, stripe_subscription_id')
      .eq('id', camaraId)
      .single();
      
    if (error) throw error;
    return data;
  },
};