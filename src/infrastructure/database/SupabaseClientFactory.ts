import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class SupabaseClientFactory {
  public static createBrowser(): SupabaseClient {
    // Debug flags (safe for production as they only log existence)
    console.log('VITE_SUPABASE_URL set?', !!import.meta.env.VITE_SUPABASE_URL);
    console.log('VITE_SUPABASE_ANON_KEY set?', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

    // Vite utiliza import.meta.env e exige o prefixo VITE_ para expor no build do cliente
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new Proxy({} as SupabaseClient, {
        get: () => {
          throw new Error('CONFIG_ERROR: Faltam variáveis de ambiente do Supabase (VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY). Verifique as configurações no Vercel e faça Redeploy.');
        }
      });
    }

    return createClient(supabaseUrl, supabaseKey);
  }
}
