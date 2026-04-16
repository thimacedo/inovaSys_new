// src/presentation/pages/Admin/EmailTemplatesPage.tsx
import React from 'react';
import { EmailTemplateManager } from '../../components/Email/EmailTemplateManager';

export function EmailTemplatesPage() {
  return (
    <div className="container mx-auto">
      <EmailTemplateManager />
    </div>
  );
}

export default EmailTemplatesPage;
