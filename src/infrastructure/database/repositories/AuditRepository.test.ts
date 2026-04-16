import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditRepository } from './AuditRepository';
import { SupabaseClient } from '@supabase/supabase-js';

describe('AuditRepository', () => {
  let repository: AuditRepository;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => Promise.resolve({ data: {}, error: null })),
    };
    repository = new AuditRepository(mockSupabase as unknown as SupabaseClient);
  });

  it('deve listar auditorias ordenadas por data', async () => {
    const mockData = [{ id: '1', acao: 'LOGIN', created_at: '2026-04-16' }];
    mockSupabase.limit.mockResolvedValueOnce({ data: mockData, error: null });

    const result = await repository.listAll(5);

    expect(mockSupabase.from).toHaveBeenCalledWith('auditoria');
    expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(mockSupabase.limit).toHaveBeenCalledWith(5);
    expect(result).toEqual(mockData);
  });

  it('deve lidar com erros na listagem', async () => {
    mockSupabase.limit.mockResolvedValueOnce({ data: null, error: { message: 'Erro de Banco' } });

    await expect(repository.listAll()).rejects.toThrow('Falha na operação de banco de dados');
  });
});
