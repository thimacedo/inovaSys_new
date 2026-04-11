import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CamaraRepository } from './CamaraRepository';
import { SupabaseClient } from '@supabase/supabase-js';

const createQueryBuilderMock = () => {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    single: vi.fn(),
  };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  return builder;
};

describe('CamaraRepository', () => {
  let mockClient: SupabaseClient;
  let mockBuilder: any;
  let repository: CamaraRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockBuilder = createQueryBuilderMock();
    mockClient = {
      from: vi.fn(() => mockBuilder),
    } as any;
    repository = new CamaraRepository(mockClient);
  });

  it('deve buscar câmara por domínio', async () => {
    const mockCamara = { id: '1', domain: 'test.com', nome: 'Test Camara' };
    mockBuilder.single.mockResolvedValueOnce({ data: mockCamara, error: null });

    const result = await repository.findByDomain('test.com');

    expect(mockClient.from).toHaveBeenCalledWith('camaras');
    expect(mockBuilder.select).toHaveBeenCalledWith('*');
    expect(mockBuilder.eq).toHaveBeenCalledWith('domain', 'test.com');
    expect(result).toEqual(mockCamara);
  });

  it('deve buscar câmara com assinatura', async () => {
    const mockCamara = { id: '1', nome: 'Test', plano: { id: 'premium' } };
    mockBuilder.single.mockResolvedValueOnce({ data: mockCamara, error: null });

    const result = await repository.getWithSubscription('1');

    expect(mockClient.from).toHaveBeenCalledWith('camaras');
    expect(mockBuilder.select).toHaveBeenCalledWith('*, plano:planos(*)');
    expect(mockBuilder.eq).toHaveBeenCalledWith('id', '1');
    expect(result).toEqual(mockCamara);
  });

  it('deve retornar null se não encontrar câmara por domínio', async () => {
    mockBuilder.single.mockResolvedValueOnce({ 
      data: null, 
      error: { code: 'PGRST116', message: 'Not found' } 
    });

    const result = await repository.findByDomain('invalid.com');
    expect(result).toBeNull();
  });
});
