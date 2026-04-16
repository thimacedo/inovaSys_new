import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageRepository } from './MessageRepository';
import { SupabaseClient } from '@supabase/supabase-js';

describe('MessageRepository', () => {
  let repository: MessageRepository;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => Promise.resolve({ data: {}, error: null })),
    };
    repository = new MessageRepository(mockSupabase as unknown as SupabaseClient);
  });

  it('deve buscar mensagens por processo', async () => {
    const mockData = [{ id: '1', mensagem: 'Teste' }];
    mockSupabase.order.mockResolvedValueOnce({ data: mockData, error: null });

    const result = await repository.getByProcesso('proc-123');

    expect(mockSupabase.from).toHaveBeenCalledWith('mensagens_processo');
    expect(mockSupabase.eq).toHaveBeenCalledWith('processo_id', 'proc-123');
    expect(result).toEqual(mockData);
  });

  it('deve inserir uma nova mensagem', async () => {
    const newMessage = { processo_id: '1', autor_id: 'u1', mensagem: 'Olá' };
    await repository.create(newMessage);

    expect(mockSupabase.insert).toHaveBeenCalledWith([newMessage]);
  });
});
