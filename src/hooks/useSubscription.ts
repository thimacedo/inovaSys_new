import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { billingService } from '../services/billingService';

export function useSubscription(camaraId: string) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [planoId, setPlanoId] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  const loadStatus = async () => {
    if (!camaraId) return;
    setLoading(true);

    const { data } = await supabase
      .from('camaras')
      .select('status_assinatura, plano_id, stripe_subscription_id')
      .eq('id', camaraId)
      .single();

    if (data) {
      setStatus(data.status_assinatura);
      setPlanoId(data.plano_id);
      setSubscriptionId(data.stripe_subscription_id);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camaraId]);

  const subscribe = async (priceId: string, userId: string) => {
    const result = await billingService.createCheckoutSession({
      priceId,
      camaraId,
      userId,
      successUrl: `${window.location.origin}/dashboard?checkout=success`,
      cancelUrl: `${window.location.origin}/planos?checkout=canceled`,
    });
    
    window.location.href = result.url;
  };

  const manageSubscription = async () => {
    const result = await billingService.createPortalSession(
      camaraId,
      `${window.location.origin}/dashboard`
    );
    
    window.location.href = result.url;
  };

  return {
    loading,
    status,
    planoId,
    subscriptionId,
    subscribe,
    manageSubscription,
    refresh: loadStatus,
  };
}