import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logAudit } from './auditoriaService';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('auditoriaService', () => {
  let mockInsert: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({
      insert: mockInsert,
    });
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: { user: { id: 'user-123' } } },
      error: null,
    });
  });

  it('deve registrar log de auditoria com sucesso', async () => {
    await logAudit('create', 'processos', 'proc-123', { status: 'novo' }, { status: 'em_curso' });

    expect(supabase.from).toHaveBeenCalledWith('auditoria');
    expect(mockInsert).toHaveBeenCalledWith({
      acao: 'create',
      tabela: 'processos',
      registro_id: 'proc-123',
      usuario_id: 'user-123',
      dados_antigos: { status: 'novo' },
      dados_novos: { status: 'em_curso' },
    });
  });

  it('deve converter strings JSON se fornecidas nos dados', async () => {
    await logAudit('update', 'processos', 'proc-123', '{"a":1}', '{"a":2}');

    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      dados_antigos: { a: 1 },
      dados_novos: { a: 2 },
    }));
  });

  it('deve lidar com ausência de sessão', async () => {
    (supabase.auth.getSession as any).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    await logAudit('login', 'usuarios', 'user-123');

    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      usuario_id: undefined,
    }));
  });

  it('deve capturar e logar erro do supabase sem propagar', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockInsert.mockResolvedValueOnce({ error: { message: 'Erro Supabase' } });

    await logAudit('delete', 'processos', '123');

    expect(consoleSpy).toHaveBeenCalledWith('[Auditoria] Falha ao registrar log:', { message: 'Erro Supabase' });
    consoleSpy.mockRestore();
  });

  it('deve capturar erros não tratados sem propagar', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (supabase.from as any).mockImplementationOnce(() => {
      throw new Error('Crash total');
    });

    await expect(logAudit('create', 't', '1')).resolves.not.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith('[Auditoria] Erro não tratado:', expect.any(Error));
    consoleSpy.mockRestore();
  });
});
