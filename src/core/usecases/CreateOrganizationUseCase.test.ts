import { describe, it, expect, beforeEach } from 'vitest';
import { CreateOrganizationUseCase } from './CreateOrganizationUseCase';
import { InMemoryOrganizationRepository } from '../../infrastructure/database/repositories/InMemoryOrganizationRepository';

describe('CreateOrganizationUseCase', () => {
  let useCase: CreateOrganizationUseCase;
  let repository: InMemoryOrganizationRepository;

  beforeEach(() => {
    repository = new InMemoryOrganizationRepository();
    useCase = new CreateOrganizationUseCase(repository);
  });

  it('should throw an error if organization name is empty', async () => {
    await expect(useCase.execute({ name: '', slug: 'valid-slug', created_by: 'uuid-123' }))
      .rejects.toThrow('Organization name is strictly required.');
  });

  it('should throw an error if organization slug is already in use', async () => {
    // Arrange: Add an existing organization to the repository
    await repository.create({
      name: 'Existing Org',
      slug: 'duplicate-slug',
      created_by: 'uuid-456',
    });

    // Act & Assert
    await expect(useCase.execute({ name: 'New Org', slug: 'duplicate-slug', created_by: 'uuid-123' }))
      .rejects.toThrow("The slug 'duplicate-slug' is already in use.");
  });

  it('should successfully create an organization when valid data is provided', async () => {
    // Act
    const result = await useCase.execute({
      name: ' InovaSys Corp ',
      slug: ' INOVASYS-CORP ',
      created_by: 'uuid-123',
    });

    // Assert: Check the result
    expect(result.name).toBe('InovaSys Corp');
    expect(result.slug).toBe('inovasys-corp');
    expect(result.created_by).toBe('uuid-123');

    // Assert: Verify state in repository
    const storedOrg = await repository.findBySlug('inovasys-corp');
    expect(storedOrg).not.toBeNull();
    expect(storedOrg?.id).toBe(result.id);
  });
});
