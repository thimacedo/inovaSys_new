// src/presentation/components/Email/EmailTemplateForm.tsx
import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '../../../types/EmailTemplate';
import { useEmailTemplateMutations } from '../../../hooks/useEmailTemplates';
import { useAuthStore } from '../../state/useAuthStore';

interface Props {
  template?: EmailTemplate | null;
  onClose: () => void;
}

export function EmailTemplateForm({ template, onClose }: Props) {
  const { currentUser } = useAuthStore();
  const organizationId = currentUser?.organization_id;
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');

  const { createTemplate, updateTemplate, isCreating, isUpdating } = useEmailTemplateMutations(organizationId || '');

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || '');
      setSubject(template.subject);
      setBodyHtml(template.body_html);
    } else {
      setName('');
      setDescription('');
      setSubject('');
      setBodyHtml('');
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;

    const templateData = { name, description, subject, body_html: bodyHtml, organization_id: organizationId };

    if (template) {
      updateTemplate({ id: template.id, templateData });
    } else {
      createTemplate(templateData);
    }
    onClose();
  };

  const isLoading = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">{template ? 'Editar' : 'Criar'} Modelo de E-mail</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Nome do Modelo</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Descrição</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Assunto do E-mail</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Corpo do E-mail (HTML)</label>
            <textarea value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 h-40" required />
            <p className="text-xs text-gray-500 mt-1">Use termos simples e placeholders como {"{{nome}}"} ou {"{{link}}"}.</p>
          </div>
          <div className="flex items-center justify-end">
            <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
