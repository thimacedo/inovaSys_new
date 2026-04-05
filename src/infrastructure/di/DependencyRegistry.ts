import { SupabaseClientFactory } from '../database/SupabaseClientFactory';
import { UserRepository } from '../database/repositories/UserRepository';
import { GetUserByEmailUseCase } from '../../core/usecases/GetUserByEmailUseCase';

/**
 * Registry de Dependências adaptado para Vite/React.
 * Como não temos Server Components aqui, sempre usamos o cliente de Browser.
 */
export class DependencyRegistry {
  private static userRepository: UserRepository | null = null;

  private static getUserRepository(): UserRepository {
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
