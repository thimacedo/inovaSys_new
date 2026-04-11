import { useState } from 'react';
import { userService } from '../../services/userService';
import { useModal } from '../../context/ModalContext';
import { isValidCPF } from '../../utils/validators';
import { supabase } from '../../lib/supabase';
import { DependencyRegistry } from '../../infrastructure/di/DependencyRegistry';
import type { CamaraEntity } from '../../core/domain/entities/Camara';

interface CamaraComPlano extends CamaraEntity {
  planos?: { limite_usuarios?: number };
  limite_usuarios_extra?: number;
}

/**
 * useTeamController
 * Hook de apresentação para separar a lógica de negócio da UI do componente Equipe.
 */
export function useTeamController(camaraId?: string, onAdded?: (password?: string) => void) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useModal();

  const handleAddMember = async (formData: {
    email: string;
    nome: string;
    tipoUsuario: string;
    cpf: string;
    endereco: string;
  }) => {
    const { email, nome, tipoUsuario, cpf, endereco } = formData;

    if (tipoUsuario === 'arbitro' && !isValidCPF(cpf)) {
      showToast('Atenção: CPF inválido.', 'attention');
      return false;
    }

    setLoading(true);
    try {
      // 1. Verificação de Limites (Regra de Negócio)
      const camara = camaraId ? await DependencyRegistry.getCamaraRepository().getWithSubscription(camaraId) : null;

      if (camara) {
        const { count } = await supabase
          .from('perfis')
          .select('*', { count: 'exact', head: true })
          .eq('camara_id', camaraId);

        const camaraWithPlan = camara as CamaraComPlano;
        const limiteTotal = (camaraWithPlan.planos?.limite_usuarios || 0) + (camaraWithPlan.limite_usuarios_extra || 0);
        
        if (count && count >= limiteTotal) {
          showToast(`Limite atingido (${limiteTotal} usuários).`, 'attention');
          return false;
        }
      }

      // 2. Criação de Usuário Auth (Lógica de Infra em transição)
      const tempPassword = Math.random().toString(36).slice(-12);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: tempPassword,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 3. Persistência via Service Modularizado
        await userService.update(authData.user.id, {
          nome: nome.trim(),
          tipo_usuario: tipoUsuario,
          camara_id: camaraId,
          cpf: tipoUsuario === 'arbitro' ? cpf.replace(/\D/g, "") : undefined,
          endereco: tipoUsuario === 'arbitro' ? endereco : undefined
        });

        showToast('Membro adicionado com sucesso!', 'success');
        if (onAdded) onAdded(tempPassword);
        return true;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      showToast(message || 'Erro ao processar cadastro.', 'error');
    } finally {
      setLoading(false);
    }
    return false;
  };

  return {
    loading,
    handleAddMember
  };
}
