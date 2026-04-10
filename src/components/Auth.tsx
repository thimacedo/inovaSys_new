import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';
import logoImg from '../assets/logo-inovasys.png';

export default function Auth({ onPublicView }: { onPublicView: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState(''); // Novo campo para validação
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInvite, setHasInvite] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('pending_invite_token');
    if (token) {
      setHasInvite(true);
      setIsSignUp(true); // Se tem convite, sugere o cadastro
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // No cadastro, passamos o nome como data para o perfil
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: nome }
          }
        });
        if (signUpError) throw signUpError;
        alert("Cadastro realizado! Verifique seu e-mail para confirmar a conta.");
      } else {
        await authService.signIn(email.trim(), password);
      }
    } catch (err: any) {
      setError(err.message || "Erro na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle,_#f8fafc_0%,_#e2e8f0_100%)] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-12 space-y-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          <img 
            src={logoImg} 
            alt="InovaSys" 
            className="w-48 h-auto mb-2 object-contain" 
          />
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">
              {hasInvite ? "Aceitar Convite" : isSignUp ? "Criar Conta" : "Acessar Painel"}
            </h1>
            <p className="text-slate-500 text-sm">
              {hasInvite ? "Complete seu cadastro para ingressar na câmara" : "Gestão Arbitral de Alta Performance"}
            </p>
          </div>
        </div>
        
        {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs border border-red-100">{error}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Seu Nome Completo</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required={isSignUp}
                placeholder="Como deseja ser chamado"
              />
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">E-mail</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Senha</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-blue-700 shadow-lg disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processando...' : isSignUp ? 'Cadastrar e Entrar' : 'Entrar'}
          </button>
        </form>

        <div className="text-center">
          {hasInvite && (
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-bold text-blue-600 uppercase tracking-wider"
            >
              {isSignUp ? "Já tenho conta? Fazer Login" : "Não tem conta? Cadastre-se"}
            </button>
          )}
          {!hasInvite && isSignUp && (
             <button 
              onClick={() => setIsSignUp(false)}
              className="text-xs font-bold text-blue-600 uppercase tracking-wider"
            >
              Voltar ao Login
            </button>
          )}
        </div>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
          <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-2 text-slate-400">Ou continue com</span></div>
        </div>

        <button 
          className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 flex items-center justify-center gap-3 shadow-sm" 
          onClick={async () => {
            setLoading(true);
            try { await authService.signInWithGoogle(); } catch (err: any) { setError(err.message); setLoading(false); }
          }}
          disabled={loading}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="Google" />
          Google Login
        </button>

        <button onClick={onPublicView} className="w-full text-xs text-slate-400 font-bold uppercase tracking-widest hover:text-slate-600">
          Consulta Pública
        </button>
      </div>
    </div>
  );
}
