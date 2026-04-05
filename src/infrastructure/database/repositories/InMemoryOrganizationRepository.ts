import { OrganizationRepository, Organization } from './OrganizationRepository';

export class InMemoryOrganizationRepository implements OrganizationRepository {
  public items: Organization[] = [];

  async findById(id: string): Promise<Organization | null> {
    const item = this.items.find(i => i.id === id);
    return item || null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const item = this.items.find(i => i.slug === slug);
    return item || null;
  }

  async findByOwnerId(ownerId: string): Promise<Organization[]> {
    return this.items.filter(i => i.created_by === ownerId);
  }

  async findAll(): Promise<Organization[]> {
    return this.items;
  }

  async create(data: Omit<Organization, 'id' | 'created_at'>): Promise<Organization> {
    const newItem: Organization = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    this.items.push(newItem);
    return newItem;
  }

  async update(id: string, data: Partial<Organization>): Promise<Organization> {
    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Organization not found');
    
    this.items[index] = { ...this.items[index], ...data };
    return this.items[index];
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex(i => i.id === id);
    if (index !== -1) this.items.splice(index, 1);
  }
}
