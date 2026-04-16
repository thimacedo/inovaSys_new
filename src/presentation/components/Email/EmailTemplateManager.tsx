// src/presentation/components/Email/EmailTemplateManager.tsx
import React, { useState } from 'react';
import { useAuthStore } from '../../state/useAuthStore';
import { useEmailTemplates, useEmailTemplateMutations } from '../../../hooks/useEmailTemplates';
import { EmailTemplateList } from './EmailTemplateList';
import { EmailTemplateForm } from './EmailTemplateForm';
import { EmailTemplate } from '../../../types/EmailTemplate';
import { Plus, Mail } from 'lucide-react';
import { Button } from '../../ui/components/Button';

export function EmailTemplateManager() {
  const { currentUser } = useAuthStore();
  const organizationId = currentUser?.organization_id;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  const { templates, isLoading } = useEmailTemplates(organizationId || '');
  const { deleteTemplate } = useEmailTemplateMutations(organizationId || '');

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este template?')) {
      deleteTemplate(id);
    }
  };

  if (!organizationId) {
    return <div className="p-8 text-center text-slate-500 font-medium">Selecione uma organização para gerenciar templates.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Mail size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Templates de E-mail</h2>
            <p className="text-sm text-slate-500 font-medium">Gerencie as comunicações automáticas da sua câmara.</p>
          </div>
        </div>
        <Button onClick={handleCreate} icon={Plus} size="lg" className="rounded-2xl">
          Novo Template
        </Button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <EmailTemplateList 
          templates={templates} 
          isLoading={isLoading} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      </div>

      {isFormOpen && (
        <EmailTemplateForm 
          template={editingTemplate} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
}

export default EmailTemplateManager;
