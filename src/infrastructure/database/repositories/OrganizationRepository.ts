export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_by: string;
  created_at: string;
}

export interface OrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  findByOwnerId(ownerId: string): Promise<Organization[]>;
  findAll(): Promise<Organization[]>;
  create(data: Omit<Organization, 'id' | 'created_at'>): Promise<Organization>;
  update(id: string, data: Partial<Organization>): Promise<Organization>;
  delete(id: string): Promise<void>;
}
