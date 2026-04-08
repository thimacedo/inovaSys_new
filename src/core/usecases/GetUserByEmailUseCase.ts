import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { IUseCase } from './IUseCase';

// Nota: UserEntity aqui é o tipo retornado pelo repositório (User)
export class GetUserByEmailUseCase implements IUseCase<string, any | null> {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public async execute(email: string): Promise<any | null> {
    if (!email || !email.includes('@')) {
      throw new Error('Formato de e-mail inválido fornecido ao Use Case.');
    }

    return this.userRepository.getByEmail(email);
  }
}
