import React, { useState } from 'react';
import { Info, Mail, Users, Shield, Fingerprint, MapPin, Loader2, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { useModal } from '../../context/ModalContext';
import { isValidCPF } from '../../utils/validators';
import { applyMask } from '../../utils/masks';

interface AddMemberFormProps {
  onAdded: (pwd?: string) => void;
  camaraId?: string;
  currentUserRole: string;
}

export const AddMemberForm: React.FC<AddMemberFormProps> = ({ onAdded, camaraId: propCamaraId, currentUserRole }) => {
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    tipo: 'assistente',
    cpf: '',
    endereco: ''
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.tipo === 'arbitro' && !isValidCPF(formData.cpf)) return showToast('CPF inválido.', 'attention');

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('perfis').select('camara_id').eq('id', user?.id).single();
      const targetCamaraId = propCamaraId || profile?.camara_id;

      // Lógica de Registro (Simplified for MD3 pattern)
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: { 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim(), password: Math.random().toString(36).slice(-10) })
      });
      
      if (!res.ok) throw new Error("Erro no registro.");

      const json = await res.json();
      if (json.user) {
        await supabase.from('perfis').update({
          tipo_usuario: formData.tipo,
          nome: formData.nome.trim(),
          camara_id: targetCamaraId,
          cpf: formData.tipo === 'arbitro' ? formData.cpf.replace(/\D/g, "") : null
        }).eq('id', json.user.id);
      }

      showToast('Membro convidado!', 'success');
      onAdded();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-1">
      <div className="bg-md-primary/5 rounded-[24px] p-6 border border-md-primary/10">
        <p className="font-bold flex items-center gap-3 text-md-primary mb-3">
          <Info size={20} />
          Convite Seguro
        </p>
        <p className="text-sm text-md-on-surface-variant leading-relaxed font-medium">
          O novo membro receberá um convite por e-mail. Para o primeiro acesso, basta utilizar o <strong className="text-md-primary">"Login com Google"</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-[10px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.2em] mb-2 ml-1">Nome Completo</label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant/40" size={18} />
            <input 
              type="text" required
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              className="input-md !pl-12 shadow-sm"
              placeholder="Ex: Dr. Ricardo Silva"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.2em] mb-2 ml-1">E-mail Corporativo</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant/40" size={18} />
            <input 
              type="email" required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="input-md !pl-12 shadow-sm"
              placeholder="ricardo@camara.com"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-[10px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.2em] mb-2 ml-1">Nível de Acesso</label>
          <div className="relative">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant/40" size={18} />
            <select 
              value={formData.tipo}
              onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              className="input-md !pl-12 shadow-sm appearance-none"
            >
              <option value="assistente">Assistente Administrativo</option>
              <option value="arbitro">Árbitro de Mediação</option>
              <option value="admin">Administrador Local</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-md-outline/5">
        <button 
          disabled={loading}
          type="submit"
          className="btn-md-primary !px-12 !py-4 shadow-xl"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Confirmar Convite
        </button>
      </div>
    </form>
  );
};
