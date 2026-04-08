import { SupabaseClientFactory } from '../database/SupabaseClientFactory';
import { UserRepository } from '../database/repositories/UserRepository';
import { GetUserByEmailUseCase } from '../../core/usecases/GetUserByEmailUseCase';

/**
 * Registry de Dependências (IoC Container) adaptado para a SPA.
 * Utiliza o Singleton do SupabaseClientFactory para instanciar repositórios.
 */
export class DependencyRegistry {
  private static userRepository: UserRepository | null = null;

  public static getUserRepository(): UserRepository {
    if (!this.userRepository) {
      const client = SupabaseClientFactory.createBrowser();
      this.userRepository = new UserRepository(client);
    }
    return this.userRepository;
  }

  public static getGetUserByEmailUseCase(): GetUserByEmailUseCase {
    const repository = this.getUserRepository();
    return new GetUserByEmailUseCase(repository);
  }
}
