import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { BaseSupabaseRepository } from './BaseSupabaseRepository';

class TestRepository extends BaseSupabaseRepository<any> {
  protected readonly tableName = 'test_table';
}

describe('BaseSupabaseRepository', () => {
  let mockClient: any;
  let repository: TestRepository;

  beforeEach(() => {
    mockClient = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
    };
    repository = new TestRepository(mockClient as unknown as SupabaseClient);
  });

  it('deve chamar o método insert corretamente no create', async () => {
    const data = { name: 'Test' };
    mockClient.select.mockReturnThis();
    await repository.create(data);
    expect(mockClient.from).toHaveBeenCalledWith('test_table');
    expect(mockClient.insert).toHaveBeenCalledWith([data]);
  });

  it('deve lançar erro quando a query falhar', async () => {
    const dbError = { message: 'DB Error' };
    mockClient.select.mockReturnThis();
    mockClient.single.mockResolvedValueOnce({ data: null, error: dbError });
    await expect(repository.create({})).rejects.toThrow(dbError);
  });
});
