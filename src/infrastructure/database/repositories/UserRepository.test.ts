import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRepository } from './UserRepository';
import { SupabaseClient } from '@supabase/supabase-js';

// Mock do builder de query do Supabase
const createQueryBuilderMock = () => {
  const builder: any = {
    select: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    range: vi.fn(() => builder),
    single: vi.fn(),
    or: vi.fn(() => builder),
    limit: vi.fn(() => builder),
  };

  // Garante que os métodos retornem o builder por padrão para permitir encadeamento
  builder.select.mockReturnValue(builder);
  builder.insert.mockReturnValue(builder);
  builder.update.mockReturnValue(builder);
  builder.delete.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
  builder.range.mockReturnValue(builder);
  builder.or.mockReturnValue(builder);
  builder.limit.mockReturnValue(builder);

  return builder;
};

describe('UserRepository', () => {
  let mockClient: SupabaseClient;
  let mockBuilder: any;
  let repository: UserRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockBuilder = createQueryBuilderMock();
    mockClient = {
      from: vi.fn(() => mockBuilder),
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null })
      }
    } as any;
    repository = new UserRepository(mockClient);
  });

  it('deve buscar usuário por email', async () => {
    const mockUser = { id: '1', email: 'test@example.com', nome: 'Test' };
    mockBuilder.single.mockResolvedValueOnce({ data: mockUser, error: null });

    const result = await repository.findByEmail('test@example.com');

    expect(mockClient.from).toHaveBeenCalledWith('usuarios');
    expect(mockBuilder.select).toHaveBeenCalledWith('*');
    expect(mockBuilder.eq).toHaveBeenCalledWith('email', 'test@example.com');
    expect(result).toEqual(mockUser);
  });

  it('deve retornar null se usuário não for encontrado por email', async () => {
    mockBuilder.single.mockResolvedValueOnce({ 
      data: null, 
      error: { code: 'PGRST116', message: 'Not found' } 
    });

    const result = await repository.findByEmail('notfound@example.com');
    expect(result).toBeNull();
  });

  it('deve listar todos os árbitros', async () => {
    const mockArbitros = [{ id: '1', role: 'arbitro' }, { id: '2', role: 'arbitro' }];
    // Configura o mockBuilder para que a chamada final (eq) retorne o resultado
    mockBuilder.eq.mockResolvedValueOnce({ data: mockArbitros, error: null });

    const result = await repository.listAllArbitros();

    expect(mockClient.from).toHaveBeenCalledWith('usuarios');
    expect(mockBuilder.select).toHaveBeenCalled();
    expect(mockBuilder.eq).toHaveBeenCalledWith('role', 'arbitro');
    expect(result).toEqual(mockArbitros);
  });

  it('deve listar todos os usuários', async () => {
    const mockUsers = [{ id: '1' }, { id: '2' }];
    mockBuilder.select.mockResolvedValueOnce({ data: mockUsers, error: null });

    const result = await repository.listAll();

    expect(mockClient.from).toHaveBeenCalledWith('usuarios');
    expect(mockBuilder.select).toHaveBeenCalledWith('*');
    expect(result).toEqual(mockUsers);
  });
});
