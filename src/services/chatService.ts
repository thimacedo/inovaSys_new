import { supabase } from '../lib/supabase';

export interface ChatMessage {
  id: string;
  processo_id: string;
  autor_id: string;
  autor_nome: string;
  mensagem: string;
  created_at: string;
}

export const chatService = {
  async getMessages(processoId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('mensagens_processo')
      .select('*')
      .eq('processo_id', processoId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },
  
  async sendMessage(processoId: string, autorId: string, autorNome: string, mensagem: string): Promise<void> {
    const { error } = await supabase
      .from('mensagens_processo')
      .insert([{ 
        processo_id: processoId, 
        autor_id: autorId, 
        autor_nome: autorNome, 
        mensagem 
      }]);
    
    if (error) throw error;
  },

  subscribeToMessages(processoId: string, onMessage: (payload: any) => void) {
    return supabase
      .channel(`chat:${processoId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'mensagens_processo',
        filter: `processo_id=eq.${processoId}` 
      }, onMessage)
      .subscribe();
  }
};
