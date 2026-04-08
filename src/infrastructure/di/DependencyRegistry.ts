import { SupabaseClientFactory } from '../database/SupabaseClientFactory';
import { UserRepository } from '../database/repositories/UserRepository';
import { ProcessRepository } from '../database/repositories/ProcessRepository';
import { CamaraRepository } from '../database/repositories/CamaraRepository';
import { GetUserByEmailUseCase } from '../../core/usecases/GetUserByEmailUseCase';

/**
 * Registry de Dependências (IoC Container) adaptado para a SPA.
 * Garante instâncias Singleton limitadas ao escopo de Repositórios.
 */
export class DependencyRegistry {
  private static userRepository: UserRepository | null = null;
  private static processRepository: ProcessRepository | null = null;
  private static camaraRepository: CamaraRepository | null = null;

  public static getUserRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = new UserRepository(SupabaseClientFactory.createBrowser());
    }
    return this.userRepository;
  }

  public static getProcessRepository(): ProcessRepository {
    if (!this.processRepository) {
      this.processRepository = new ProcessRepository(SupabaseClientFactory.createBrowser());
    }
    return this.processRepository;
  }

  public static getCamaraRepository(): CamaraRepository {
    if (!this.camaraRepository) {
      this.camaraRepository = new CamaraRepository(SupabaseClientFactory.createBrowser());
    }
    return this.camaraRepository;
  }

  public static getGetUserByEmailUseCase(): GetUserByEmailUseCase {
    return new GetUserByEmailUseCase(this.getUserRepository());
  }
}
