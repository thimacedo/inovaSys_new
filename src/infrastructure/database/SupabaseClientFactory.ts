import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

export class SupabaseClientFactory {
  private static instance: SupabaseClient | null = null;

  private constructor() {}

  /**
   * Retorna a instância Singleton do cliente Supabase para o Browser.
   * Evita a criação de múltiplas conexões websocket (Realtime) e vazamento de memória.
   */
  public static createBrowser(): SupabaseClient {
    if (!this.instance) {
      this.instance = supabase;
    }
    return this.instance;
  }
}
