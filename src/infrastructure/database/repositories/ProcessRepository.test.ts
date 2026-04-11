import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProcessRepository } from './ProcessRepository';
import { SupabaseClient } from '@supabase/supabase-js';

const createQueryBuilderMock = () => {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    range: vi.fn(() => builder),
    or: vi.fn(() => builder),
    single: vi.fn(),
  };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
  builder.range.mockReturnValue(builder);
  builder.or.mockReturnValue(builder);
  return builder;
};

describe('ProcessRepository', () => {
  let mockClient: SupabaseClient;
  let mockBuilder: any;
  let repository: ProcessRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockBuilder = createQueryBuilderMock();
    mockClient = {
      from: vi.fn(() => mockBuilder),
    } as any;
    repository = new ProcessRepository(mockClient);
  });

  it('deve listar processos por câmara', async () => {
    const mockProcessos = [{ id: '1', numero: '001', arbitro: { nome: 'João' } }];
    mockBuilder.range.mockResolvedValueOnce({ data: mockProcessos, error: null });

    const result = await repository.listByCamara('camara-123', 0, 10);

    expect(mockClient.from).toHaveBeenCalledWith('processos');
    expect(mockBuilder.select).toHaveBeenCalledWith('*, arbitro:arbitro_id(nome)');
    expect(mockBuilder.eq).toHaveBeenCalledWith('camara_id', 'camara-123');
    expect(mockBuilder.range).toHaveBeenCalledWith(0, 9);
    expect(result).toEqual(mockProcessos);
  });

  it('deve buscar processos publicamente', async () => {
    const mockProcessos = [{ id: '1', numero: 'ABC', titulo: 'Teste' }];
    mockBuilder.or.mockResolvedValueOnce({ data: mockProcessos, error: null });

    const result = await repository.publicSearch('ABC');

    expect(mockClient.from).toHaveBeenCalledWith('processos');
    expect(mockBuilder.or).toHaveBeenCalledWith('numero.ilike.%ABC%,titulo.ilike.%ABC%');
    expect(result).toEqual(mockProcessos);
  });

  it('deve listar com paginação simples', async () => {
    const mockProcessos = [{ id: '1' }];
    // Em listWithPagination, .order() é o último na cadeia antes do await
    mockBuilder.order.mockResolvedValueOnce({ data: mockProcessos, error: null });

    const result = await repository.listWithPagination(1, 5);

    expect(mockBuilder.range).toHaveBeenCalledWith(5, 9);
    expect(mockBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toEqual(mockProcessos);
  });
});
