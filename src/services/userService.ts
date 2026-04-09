import { DependencyRegistry } from '../infrastructure/di/DependencyRegistry';
import auditService from './auditService';
import { UserEntity } from '../infrastructure/database/repositories/UserRepository';

/**
 * User Service v2.0 (Domain Orchestrator)
 * Centraliza a lógica de negócio e auditoria, delegando persistência ao Repository.
 */
export const userService = {
  async getAll() {
    return await DependencyRegistry.getUserRepository().listAll();
  },

  async getProfile(userId: string) {
    if (!userId || userId === "SEU_USER_ID_AQUI") {
      throw new Error("Sessão inválida: Identificador do usuário ausente.");
    }
    const profile = await DependencyRegistry.getUserRepository().getById(userId);
    if (!profile) throw new Error("Perfil não encontrado.");
    return profile;
  },

  async update(id: string, updates: Partial<UserEntity>) {
    if (!id || id === "SEU_USER_ID_AQUI") throw new Error("Sessão inválida.");
    
    const repository = DependencyRegistry.getUserRepository();
    
    // Captura estado antigo para auditoria rica
    const oldProfile = await repository.getById(id);
    
    const result = await repository.update(id, updates);

    await auditService.log('ATUALIZAR_USUARIO', {
      usuario_afetado_id: id,
      campos_alterados: Object.keys(updates),
      mudanca_tipo: oldProfile?.tipo_usuario !== updates.tipo_usuario
    }, 'perfis', id);

    return result;
  },

  async delete(id: string) {
    if (!id || id === "SEU_USER_ID_AQUI") throw new Error("Sessão inválida.");
    
    const repository = DependencyRegistry.getUserRepository();
    const user = await repository.getById(id);
    
    if (!user) throw new Error("Usuário não encontrado.");

    // Auditoria pré-exclusão
    await auditService.log('DELETAR_USUARIO', { 
      email: user.email 
    }, 'perfis', id);

    return await repository.delete(id);
  },

  async getArbitrosDisponiveis(orgId: string) {
    if (!orgId) return [];
    const data = await DependencyRegistry.getUserRepository().listArbitrosByOrg(orgId);
    
    return data.map((m: any) => ({
      id: m.user_id,
      nome: m.perfis?.nome || 'Árbitro sem nome',
      cpf: m.perfis?.cpf || '',
      email: m.perfis?.email || ''
    }));
  }
};

export default userService;
