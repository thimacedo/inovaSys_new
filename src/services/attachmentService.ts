import { supabase } from '../lib/supabase';
import { auditService } from './auditService';

export interface Anexo {
  id: string;
  processo_id: string;
  nome_arquivo: string;
  url: string;
  tamanho: number;
  tipo: string;
  created_at: string;
}

export const attachmentService = {
  async upload(processoId: string, file: File) {
    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID().replace(/-/g, '')}_${Date.now()}.${fileExt}`;
      const filePath = `processos/${processoId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('anexos')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message === 'Bucket not found') {
          throw new Error('O bucket "anexos" não foi encontrado no Supabase Storage. Por favor, crie um bucket chamado "anexos" com acesso público no painel do Supabase.');
        }
        throw uploadError;
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('anexos')
        .getPublicUrl(filePath);

      // 3. Save metadata to database
      const { data, error } = await supabase
        .from('anexos')
        .insert([{
          processo_id: processoId,
          nome_arquivo: file.name,
          url: publicUrl,
          tamanho: file.size,
          tipo: file.type
        }])
        .select()
        .single();

      if (error) throw error;

      await auditService.log('UPLOAD_ANEXO', { processo_id: processoId, arquivo: file.name });
      return data as Anexo;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }
  },

  async getByProcesso(processoId: string) {
    try {
      const { data, error } = await supabase
        .from('anexos')
        .select('*')
        .eq('processo_id', processoId)
        .order('created_at', { ascending: false });

      if (error) {
        // Se a tabela não existir, retorna vazio em vez de estourar erro
        if (error.code === 'PGRST204' || error.code === 'PGRST205' || error.message.includes('not found')) {
          console.warn('Tabela "anexos" ainda não foi criada no banco de dados.');
          return [];
        }
        throw error;
      }
      return data as Anexo[];
    } catch (e) {
      console.error('Erro ao buscar anexos:', e);
      return [];
    }
  },

  async delete(id: string, url: string) {
    try {
      // 1. Extract path from URL
      const urlParts = url.split('/anexos/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        // 2. Delete from Storage
        const { error: storageError } = await supabase.storage
          .from('anexos')
          .remove([filePath]);
        
        if (storageError) console.error('Erro ao deletar do storage:', storageError);
      }

      // 3. Delete from database
      const { error } = await supabase
        .from('anexos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await auditService.log('DELETAR_ANEXO', { anexo_id: id });
    } catch (error) {
      console.error('Erro ao deletar anexo:', error);
      throw error;
    }
  }
};
