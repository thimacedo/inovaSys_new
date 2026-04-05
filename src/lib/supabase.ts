import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Inicialização segura para evitar crash no bundle
export const supabase: SupabaseClient = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : new Proxy({} as SupabaseClient, {
      get: () => {
        throw new Error('CONFIG_ERROR: Faltam variáveis de ambiente do Supabase (VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY). Verifique as configurações no Vercel e faça Redeploy.');
      }
    });
