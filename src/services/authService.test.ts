import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './authService';
import { supabase } from '../lib/supabase';

// Mock do supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn()
    }
  }
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('signIn deve chamar supabase.auth.signInWithPassword', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ data: { user: { id: '1' } }, error: null } as any);
    
    const data = await authService.signIn('test@test.com', '123456');
    
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: '123456'
    });
    expect(data.user.id).toBe('1');
  });

  it('signIn deve lançar erro se houver erro no supabase', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ data: null, error: { message: 'Erro' } } as any);
    
    await expect(authService.signIn('a', 'b')).rejects.toThrow('Erro');
  });

  it('signOut deve chamar supabase.auth.signOut', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });
    await authService.signOut();
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('getCurrentUser deve retornar o usuário', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: { email: 'test@test.com' } }, error: null } as any);
    const user = await authService.getCurrentUser();
    expect(user?.email).toBe('test@test.com');
  });
});
