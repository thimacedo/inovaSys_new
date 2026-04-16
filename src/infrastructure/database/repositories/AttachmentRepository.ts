import { BaseSupabaseRepository } from '../BaseSupabaseRepository';
import { SupabaseClient } from '@supabase/supabase-js';

export interface AttachmentEntity {
  id: string;
  processo_id: string;
  nome_arquivo: string;
  caminho_storage: string;
  tamanho_bytes?: number;
  tipo_conteudo?: string;
  uploaded_by?: string;
  categoria?: string;
  metadados_ia?: any;
  created_at?: string;
}

export class AttachmentRepository extends BaseSupabaseRepository<AttachmentEntity> {
  protected readonly tableName = 'anexos';
  private readonly bucketName = 'documentos';

  constructor(client: SupabaseClient) {
    super(client);
  }

  public async listByProcesso(processoId: string): Promise<AttachmentEntity[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('processo_id', processoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AttachmentEntity[];
    } catch (error) {
      return this.handleError(error, 'listByProcesso');
    }
  }

  public async uploadFile(file: File, processoId: string, userId: string): Promise<AttachmentEntity> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${processoId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await this.client.storage
        .from(this.bucketName)
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const attachmentData: Partial<AttachmentEntity> = {
        processo_id: processoId,
        nome_arquivo: file.name,
        caminho_storage: fileName,
        tamanho_bytes: file.size,
        tipo_conteudo: file.type,
        uploaded_by: userId
      };

      return await this.create(attachmentData);
    } catch (error) {
      return this.handleError(error, 'uploadFile');
    }
  }

  public async deleteAttachment(id: string, storagePath: string): Promise<void> {
    try {
      const { error: removeError } = await this.client.storage
        .from(this.bucketName)
        .remove([storagePath]);

      if (removeError) throw removeError;

      await this.delete(id);
    } catch (error) {
      return this.handleError(error, 'deleteAttachment');
    }
  }

  public async getDownloadUrl(storagePath: string): Promise<string> {
    try {
      const { data } = this.client.storage.from(this.bucketName).getPublicUrl(storagePath);
      return data.publicUrl;
    } catch (error) {
      return this.handleError(error, 'getDownloadUrl');
    }
  }
}
