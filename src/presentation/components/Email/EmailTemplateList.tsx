// src/presentation/components/Email/EmailTemplateList.tsx
import React from 'react';
import { EmailTemplate } from '../../../types/EmailTemplate';
import { Edit, Trash2 } from 'lucide-react';

interface Props {
  templates: EmailTemplate[];
  onEdit: (template: EmailTemplate) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export function EmailTemplateList({ templates, onEdit, onDelete, isLoading }: Props) {
  if (isLoading) {
    return <div>Carregando templates...</div>;
  }

  if (templates.length === 0) {
    return <div className="text-center text-gray-500 py-8">Nenhum template de e-mail encontrado.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left py-3 px-4 font-semibold text-sm">Nome</th>
            <th className="text-left py-3 px-4 font-semibold text-sm">Assunto</th>
            <th className="text-left py-3 px-4 font-semibold text-sm">Ações</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <tr key={template.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">{template.name}</td>
              <td className="py-3 px-4">{template.subject}</td>
              <td className="py-3 px-4">
                <button onClick={() => onEdit(template)} className="text-blue-500 hover:text-blue-700 mr-4">
                  <Edit size={18} />
                </button>
                <button onClick={() => onDelete(template.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
