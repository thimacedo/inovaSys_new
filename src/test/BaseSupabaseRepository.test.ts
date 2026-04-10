import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseSupabaseRepository } from '../infrastructure/database/BaseSupabaseRepository';

/**
 * @file BaseSupabaseRepository.test.ts
 * @description Testes unitários para a classe BaseSupabaseRepository,
 * validando o fluxo de criação e tratamento de erros.
 */

// Mock da entidade para teste
interface TestEntity {
  id: string;
  nome: string;
}

// Implementação concreta para o teste
class ConcreteRepository extends BaseSupabaseRepository<TestEntity> {
  protected readonly tableName = 'tabela_teste';
}

describe('BaseSupabaseRepository', () => {
  let mockClient: any;
  let repo: ConcreteRepository;

  beforeEach(() => {
    // Mock estruturado do cliente Supabase
    mockClient = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user_123' } }, error: null })
      }
    };
    
    repo = new ConcreteRepository(mockClient);
  });

  it('deve chamar o insert e emitir auditoria ao criar um registro', async () => {
    const fakeData = { id: 'uuid-123', nome: 'Teste de Criação' };
    mockClient.single.mockResolvedValue({ data: fakeData, error: null });

    const result = await repo.create({ nome: 'Novo Registro' });

    expect(result).toEqual(fakeData);
    expect(mockClient.from).toHaveBeenCalledWith('tabela_teste');
    expect(mockClient.insert).toHaveBeenCalled();
  });

  it('deve tratar erros de operação via handleError', async () => {
    mockClient.single.mockResolvedValue({ data: null, error: { message: 'Erro de Banco' } });

    await expect(repo.create({ nome: 'Registro Falho' }))
      .rejects.toThrow('Falha na operação de banco de dados: Erro de Banco');
  });

  it('deve realizar update filtrando pelo ID correto', async () => {
    const updatedData = { id: '1', nome: 'Nome Alterado' };
    mockClient.single.mockResolvedValue({ data: updatedData, error: null });

    const result = await repo.update('1', { nome: 'Nome Alterado' });

    expect(result.nome).toBe('Nome Alterado');
    expect(mockClient.eq).toHaveBeenCalledWith('id', '1');
  });
});
