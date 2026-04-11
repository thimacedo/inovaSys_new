import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseSupabaseRepository } from './BaseSupabaseRepository';
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
  };

  // Garante que todos os mÃ©todos de encadeamento retornem o prÃ³prio builder
  builder.select.mockReturnValue(builder);
  builder.insert.mockReturnValue(builder);
  builder.update.mockReturnValue(builder);
  builder.delete.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
  builder.range.mockReturnValue(builder);

  return builder;
};

describe('BaseSupabaseRepository', () => {
  let mockClient: SupabaseClient;
  let mockBuilder: ReturnType<typeof createQueryBuilderMock>;
  let repository: BaseSupabaseRepository<any>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockBuilder = createQueryBuilderMock();

    mockClient = {
      from: vi.fn(() => mockBuilder),
    } as unknown as SupabaseClient;

    class TestRepository extends BaseSupabaseRepository<any> {
      protected tableName = 'test_table';
      constructor(client: any) {
        super(client);
      }
    }
    repository = new TestRepository(mockClient);
  });

  it('deve criar um registro e retornar os dados', async () => {
    const mockData = { id: '123', name: 'Teste' };
    mockBuilder.single.mockResolvedValueOnce({ data: mockData, error: null });

    const result = await repository.create({ name: 'Teste' });

    expect(mockClient.from).toHaveBeenCalledWith('test_table');
    expect(mockBuilder.insert).toHaveBeenCalledWith([{ name: 'Teste' }]);
    expect(mockBuilder.select).toHaveBeenCalled();
    expect(mockBuilder.single).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  it('deve lançar erro se a criação falhar', async () => {
    const mockError = { message: 'Erro no banco' };
    mockBuilder.single.mockResolvedValueOnce({ data: null, error: mockError });

    await expect(repository.create({ name: 'Teste' })).rejects.toThrow(
      'Falha na operação de banco de dados (create): Erro no banco'
    );
  });

  it('deve buscar um registro por ID', async () => {
    const mockData = { id: '123', name: 'Teste' };
    mockBuilder.single.mockResolvedValueOnce({ data: mockData, error: null });

    const result = await repository.getById('123');

    expect(mockClient.from).toHaveBeenCalledWith('test_table');
    expect(mockBuilder.select).toHaveBeenCalled();
    expect(mockBuilder.eq).toHaveBeenCalledWith('id', '123');
    expect(mockBuilder.single).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  it('deve retornar null se getById nÃ£o encontrar (cÃ³digo PGRST116)', async () => {
    mockBuilder.single.mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST116', message: 'Not found' },
    });

    const result = await repository.getById('999');
    expect(result).toBeNull();
  });

  it('deve lançar erro em getById para outros erros', async () => {
    const error = { code: 'OTHER', message: 'Erro qualquer' };
    mockBuilder.single.mockResolvedValueOnce({ data: null, error });

    await expect(repository.getById('123')).rejects.toThrow(
      'Falha na operação de banco de dados (getById): Erro qualquer'
    );
  });

  it('deve listar registros com paginaÃ§Ã£o', async () => {
    const mockData = [{ id: '1' }, { id: '2' }];
    mockBuilder.range.mockReturnValueOnce({
      data: mockData,
      error: null,
    });

    const result = await repository.list(0, 10);

    expect(mockClient.from).toHaveBeenCalledWith('test_table');
    expect(mockBuilder.select).toHaveBeenCalled();
    expect(mockBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(mockBuilder.range).toHaveBeenCalledWith(0, 9);
    expect(result).toEqual(mockData);
  });

  it('deve atualizar um registro', async () => {
    const oldData = { id: '123', name: 'Antigo' };
    const newData = { name: 'Novo' };
    const updatedData = { id: '123', name: 'Novo' };

    // getById (primeira chamada)
    mockBuilder.single.mockResolvedValueOnce({ data: oldData, error: null });
    // update (segunda chamada)
    mockBuilder.single.mockResolvedValueOnce({ data: updatedData, error: null });

    const result = await repository.update('123', newData);

    expect(mockClient.from).toHaveBeenCalledWith('test_table');
    expect(mockBuilder.select).toHaveBeenCalled();
    expect(mockBuilder.eq).toHaveBeenCalledWith('id', '123');
    expect(mockBuilder.single).toHaveBeenCalledTimes(2);
    expect(mockBuilder.update).toHaveBeenCalledWith(newData);
    expect(result).toEqual(updatedData);
  });

  it('deve lanÃ§ar erro ao atualizar registro inexistente', async () => {
    // getById retorna null
    mockBuilder.single.mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST116' },
    });

    await expect(repository.update('999', { name: 'Novo' })).rejects.toThrow(
      'Registro não encontrado para id 999'
    );
  });

  it('deve deletar um registro', async () => {
    const oldData = { id: '123', name: 'Antigo' };
    // Primeira chamada: getById dentro de delete
    mockBuilder.single.mockResolvedValueOnce({ data: oldData, error: null });
    // Para delete: eq() deve retornar Promise com { error: null }
    // Mas primeiro, quando getById chama eq(), ele precisa retornar builder para chain
    // Vamos usar mockImplementationOnce para controlar isso
    let eqCallCount = 0;
    mockBuilder.eq.mockImplementation(() => {
      eqCallCount++;
      if (eqCallCount === 1) {
        // Primeira chamada: de getById, retorna builder para chain
        return mockBuilder;
      } else {
        // Segunda chamada: de delete, retorna Promise com { error: null }
        return Promise.resolve({ error: null });
      }
    });

    await repository.delete('123');

    expect(mockClient.from).toHaveBeenCalledWith('test_table');
    expect(mockBuilder.delete).toHaveBeenCalled();
    expect(mockBuilder.eq).toHaveBeenCalledWith('id', '123');
    // eq foi chamado 2 vezes: uma no getById e outra no delete
    expect(eqCallCount).toBe(2);
  });

  it('deve lanÃ§ar erro ao deletar registro inexistente', async () => {
    mockBuilder.single.mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST116' },
    });

    await expect(repository.delete('999')).rejects.toThrow(
      'Registro não encontrado para id 999'
    );
  });
});

