import React, { createContext, useContext, useState, ReactNode } from 'react';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { applyMask } from '../utils/masks';

type ModalContextType = {
  showModal: (title: string, content: ReactNode, size?: 'small' | 'large') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string) => void;
  showPrompt: (title: string, label: string, initialValue: string, onConfirm: (value: string) => void, type?: 'text' | 'date' | 'time' | 'number' | 'textarea' | 'select', maskType?: 'doc' | 'money' | 'phone' | 'cep', options?: { label: string, value: string }[]) => void;
  hideModal: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'attention' | 'warning' | 'info') => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; content: ReactNode; size: 'small' | 'large' }>({ 
    isOpen: false, 
    title: '', 
    content: null, 
    size: 'large' 
  });
  const [toast, setToast] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' | 'attention' }>({ 
    isOpen: false, 
    message: '',
    type: 'success'
  });

  const getCamaraName = () => {
    const config = localStorage.getItem('camara_config');
    if (config) {
      const parsed = JSON.parse(config);
      return parsed.nome || 'inovaSys';
    }
    return 'inovaSys';
  };

  const showModal = (title: string, content: ReactNode, size: 'small' | 'large' = 'large') => {
    const camaraName = getCamaraName();
    const fullTitle = `${camaraName} | ${title}`;
    setModal({ isOpen: true, title: fullTitle, content, size });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, confirmText: string = 'Confirmar') => {
    const camaraName = getCamaraName();
    const fullTitle = `${camaraName} | ${title}`;
    const content = (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <p className="text-slate-600 text-base leading-relaxed">{message}</p>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button 
            onClick={hideModal} 
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={() => {
              console.log('Botão de confirmação clicado no modal');
              if (typeof onConfirm === 'function') {
                onConfirm();
              } else {
                console.error('onConfirm não é uma função:', onConfirm);
              }
              hideModal();
            }} 
            className={`px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm ${confirmText.includes('Excluir') ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    );
    setModal({ isOpen: true, title: fullTitle, content, size: 'small' });
  };

  const showPrompt = (title: string, label: string, initialValue: string, onConfirm: (value: string) => void, type: 'text' | 'date' | 'time' | 'number' | 'textarea' | 'select' = 'textarea', maskType?: 'doc' | 'money' | 'phone' | 'cep', options?: { label: string, value: string }[]) => {
    const camaraName = getCamaraName();
    const fullTitle = `${camaraName} | ${title}`;
    
    const PromptContent = () => {
      const [value, setValue] = useState(maskType ? applyMask(initialValue, maskType) : initialValue);
      
      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        let val = e.target.value;
        if (maskType && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
          val = applyMask(val, maskType);
        }
        setValue(val);
      };

      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</label>
            {type === 'textarea' ? (
              <textarea 
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]" 
                value={value} 
                onChange={handleChange}
                autoFocus
              />
            ) : type === 'select' && options ? (
              <select 
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={value}
                onChange={handleChange}
                autoFocus
              >
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            ) : (
              <input 
                type={maskType ? 'text' : type}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
                value={value} 
                onChange={handleChange}
                autoFocus
              />
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              onClick={hideModal} 
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                if (typeof onConfirm === 'function') {
                  onConfirm(value);
                } else {
                  console.error('onConfirm não é uma função:', onConfirm);
                }
                hideModal();
              }} 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md"
            >
              OK
            </button>
          </div>
        </div>
      );
    };

    setModal({ isOpen: true, title: fullTitle, content: <PromptContent />, size: 'small' });
  };

  const hideModal = () => setModal({ ...modal, isOpen: false });
  
  const showToast = (message: string, type?: 'success' | 'error' | 'attention') => {
    const prefixes = {
      success: 'Sucesso: ',
      error: 'Erro: ',
      attention: 'Atenção: '
    };

    // 1. Determine the actual type
    let finalType = type;
    const msgLower = message.toLowerCase();
    
    // Force error type if message contains error keywords and no type was provided
    if (!finalType) {
      if (msgLower.includes('erro') || msgLower.includes('falha')) {
        finalType = 'error';
      } else if (msgLower.includes('atenção') || msgLower.includes('aviso')) {
        finalType = 'attention';
      } else {
        finalType = 'success';
      }
    }

    // 2. Check if it already has a prefix or starts with a base word
    const allPrefixes = Object.values(prefixes).map(p => p.toLowerCase());
    const baseWords = ['sucesso', 'erro', 'atenção', 'aviso', 'falha'];
    
    const alreadyHasPrefix = allPrefixes.some(p => msgLower.startsWith(p)) || 
                             baseWords.some(w => msgLower.startsWith(w.toLowerCase()));

    // 3. Construct final message
    const prefix = prefixes[finalType];
    const fullMessage = alreadyHasPrefix ? message : `${prefix}${message}`;
    
    setToast({ isOpen: true, message: fullMessage, type: finalType as 'success' | 'error' | 'attention' });
  };

  return (
    <ModalContext.Provider value={{ showModal, showConfirm, showPrompt, hideModal, showToast }}>
      {children}
      <Modal 
        isOpen={modal.isOpen} 
        onClose={hideModal} 
        title={modal.title} 
        size={modal.size}
      >
        {modal.content}
      </Modal>
      <Toast 
        isOpen={toast.isOpen} 
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ isOpen: false, message: '', type: 'success' })} 
      />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within a ModalProvider');
  return context;
};
