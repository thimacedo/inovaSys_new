import { DependencyRegistry } from '../infrastructure/di/DependencyRegistry';

export const attachmentService = {
  uploadFile: async (file: File, processoId: string, userId: string) => 
    DependencyRegistry.getAttachmentRepository().uploadFile(file, processoId, userId),
  listByProcesso: async (processoId: string) => 
    DependencyRegistry.getAttachmentRepository().listByProcesso(processoId),
  deleteAttachment: async (id: string, storagePath: string) => 
    DependencyRegistry.getAttachmentRepository().deleteAttachment(id, storagePath),
  getDownloadUrl: async (storagePath: string) => 
    DependencyRegistry.getAttachmentRepository().getDownloadUrl(storagePath)
};

export default attachmentService;
