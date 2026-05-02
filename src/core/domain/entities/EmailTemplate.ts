export interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  subject: string;
  body_html: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
}
