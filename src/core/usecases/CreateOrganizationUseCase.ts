import { OrganizationRepository, Organization } from '../../infrastructure/database/repositories/OrganizationRepository';

interface CreateOrganizationRequest {
  name: string;
  slug: string;
  created_by: string;
}

export class CreateOrganizationUseCase {
  constructor(private organizationRepository: OrganizationRepository) {}

  async execute(request: CreateOrganizationRequest): Promise<Organization> {
    const name = request.name.trim();
    const slug = request.slug.trim().toLowerCase();

    if (!name) {
      throw new Error('Organization name is strictly required.');
    }

    const existingOrg = await this.organizationRepository.findBySlug(slug);
    if (existingOrg) {
      throw new Error(`The slug '${slug}' is already in use.`);
    }

    return await this.organizationRepository.create({
      name,
      slug,
      created_by: request.created_by,
    });
  }
}
