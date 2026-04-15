import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { Building2, ChevronDown, Check } from 'lucide-react';

export const CamaraSwitcher: React.FC = () => {
  const [camaras, setCamaras] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, updateOrganization } = useAuthStore();

  useEffect(() => {
    const loadCamaras = async () => {
      const { data } = await supabase.from('camaras').select('id, nome').eq('ativa', true);
      if (data) setCamaras(data);
    };
    loadCamaras();
  }, []);

  const currentCamara = camaras.find(c => c.id === currentUser?.organization_id);

  if (!currentUser || !['god', 'gestor'].includes(currentUser.tipo_usuario?.toLowerCase())) {
    return null;
  }

  return (
    <div className="relative px-4 mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-colors">
            <Building2 size={16} />
          </div>
          <div className="text-left">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unidade Ativa</p>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
              {currentCamara?.nome || 'InovaSys Global'}
            </p>
          </div>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="max-h-[200px] overflow-y-auto py-2">
            {camaras.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  updateOrganization(c.id);
                  setIsOpen(false);
                  window.location.reload(); // Recarrega para limpar cache do TanStack Query
                }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
              >
                <span className={c.id === currentUser.organization_id ? "font-bold text-blue-600" : "text-slate-600 dark:text-slate-300"}>
                  {c.nome}
                </span>
                {c.id === currentUser.organization_id && <Check size={14} className="text-blue-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
