import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseSupabaseRepository } from './BaseSupabaseRepository';
import { SupabaseClient } from '@supabase/supabase-js';

// Mock do cliente Supabase
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockOrder = vi.fn();
const mockRange = vi.fn();

// Constrói a cadeia de mocks com encadeamento correto
mockFrom.mockImplementation(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
}));

mockInsert.mockImplementation(() => ({
  select: mockSelect,
}));

mockUpdate.mockImplementation(() => ({
  eq: mockEq,
}));

mockDelete.mockImplementation(() => ({
  eq: mockEq,
}));

mockSelect.mockImplementation(() => ({
  eq: mockEq,
  order: mockOrder,
  range: mockRange,
  single: mockSingle,
}));

mockEq.mockImplementation(() => ({
  select: mockSelect,
  single: mockSingle,
}));

mockOrder.mockImplementation(() => ({
  range: mockRange,
}));

mockRange.mockImplementation(() => ({
  select: mockSelect,
}));

// Classe concreta para teste (já que Base é abstract)
class TestRepository extends BaseSupabaseRepository<any> {
  protected readonly tableName = 'test_table';
}

describe('BaseSupabaseRepository', () => {
  let mockClient: SupabaseClient;
  let repository: TestRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = {
      from: mockFrom,
    } as unknown as SupabaseClient;
    repository = new TestRepository(mockClient);
  });

  it('deve criar um registro e retornar os dados', async () => {
    const mockData = { id: '123', name: 'Teste' };
    mockSingle.mockResolvedValueOnce({ data: mockData, error: null });

    const result = await repository.create({ name: 'Teste' });

    expect(mockFrom).toHaveBeenCalledWith('test_table');
    expect(mockInsert).toHaveBeenCalledWith([{ name: 'Teste' }]);
    expect(mockSelect).toHaveBeenCalled();
    expect(mockSingle).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  it('deve lançar erro se a criação falhar', async () => {
    const mockError = { message: 'Erro no banco' };
    mockSingle.mockResolvedValueOnce({ data: null, error: mockError });

    await expect(repository.create({ name: 'Teste' })).rejects.toEqual(mockError);
  });

  it('deve buscar um registro por ID', async () => {
    const mockData = { id: '123', name: 'Teste' };
    mockSingle.mockResolvedValueOnce({ data: mockData, error: null });

    const result = await repository.getById('123');

    expect(mockFrom).toHaveBeenCalledWith('test_table');
    expect(mockSelect).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('id', '123');
    expect(mockSingle).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  it('deve listar registros com paginação', async () => {
    const mockData = [{ id: '1' }, { id: '2' }];
    mockSelect.mockReturnValueOnce({ data: mockData, error: null });

    const result = await repository.list(0, 10);

    expect(mockFrom).toHaveBeenCalledWith('test_table');
    expect(mockSelect).toHaveBeenCalled();
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(mockRange).toHaveBeenCalledWith(0, 9);
    expect(result).toEqual(mockData);
  });

  it('deve atualizar um registro', async () => {
    const oldData = { id: '123', name: 'Antigo' };
    const newData = { name: 'Novo' };
    const updatedData = { id: '123', name: 'Novo' };

    // Mock para buscar dados antigos
    mockSingle.mockResolvedValueOnce({ data: oldData, error: null });
    // Mock para a atualização
    mockSingle.mockResolvedValueOnce({ data: updatedData, error: null });

    const result = await repository.update('123', newData);

    expect(mockFrom).toHaveBeenCalledWith('test_table');
    expect(mockUpdate).toHaveBeenCalledWith(newData);
    expect(mockEq).toHaveBeenCalledWith('id', '123');
    expect(result).toEqual(updatedData);
  });

  it('deve deletar um registro', async () => {
    const oldData = { id: '123', name: 'Antigo' };
    mockSingle.mockResolvedValueOnce({ data: oldData, error: null });
    mockEq.mockResolvedValueOnce({ error: null });

    await repository.delete('123');

    expect(mockFrom).toHaveBeenCalledWith('test_table');
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('id', '123');
  });

  it('deve lançar erro se o registro não for encontrado ao buscar por ID', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });

    await expect(repository.getById('999')).rejects.toEqual({ message: 'Not found' });
  });
});