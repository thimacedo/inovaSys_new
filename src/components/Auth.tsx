import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';
import logoImg from '../assets/logo-inovasys.png';

export default function Auth({ onPublicView, onPricingView }: { onPublicView: () => void, onPricingView: () => void }) {
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
    <div className="relative min-h-screen flex items-center justify-center bg-md-surface overflow-hidden p-4">
      {/* Elementos Atmosféricos MD3 */}
      <div className="md-blur-shape w-[500px] h-[500px] bg-md-primary -top-24 -left-24 opacity-10" />
      <div className="md-blur-shape w-[400px] h-[400px] bg-md-secondary bottom-0 right-0 opacity-10" />
      <div className="md-blur-shape w-[300px] h-[300px] bg-md-tertiary top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5" />

      <div className="w-full max-w-md bg-white rounded-[32px] shadow-md-3 border border-md-outline/10 p-8 md:p-10 space-y-8 z-10 transition-all duration-500">
        <div className="flex flex-col items-center space-y-4 text-center">
          <img 
            src={logoImg} 
            alt="InovaSys" 
            className="w-40 h-auto mb-2 object-contain" 
          />
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-md-on-surface tracking-tight">
              {hasInvite ? "Aceitar Convite" : isSignUp ? "Criar Conta" : "Acessar Painel"}
            </h1>
            <p className="text-md-on-surface-variant text-sm font-medium">
              {hasInvite ? "Complete seu cadastro para ingressar na câmara" : "Gestão Arbitral de Alta Performance"}
            </p>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs border border-red-100 animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-md-primary ml-2 mb-1 block uppercase tracking-wider">Seu Nome Completo</label>
              <input 
                type="text" 
                className="w-full px-5 py-4 bg-md-surface-variant/30 border border-md-outline/20 rounded-2xl outline-none focus:ring-2 focus:ring-md-primary focus:border-transparent transition-all" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required={isSignUp}
                placeholder="Como deseja ser chamado"
              />
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-md-primary ml-2 mb-1 block uppercase tracking-wider">E-mail</label>
            <input 
              type="email" 
              className="w-full px-5 py-4 bg-md-surface-variant/30 border border-md-outline/20 rounded-2xl outline-none focus:ring-2 focus:ring-md-primary focus:border-transparent transition-all" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="seu@email.com"
              autoComplete="username"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-md-primary ml-2 mb-1 block uppercase tracking-wider">Senha</label>
            <input 
              type="password" 
              className="w-full px-5 py-4 bg-md-surface-variant/30 border border-md-outline/20 rounded-2xl outline-none focus:ring-2 focus:ring-md-primary focus:border-transparent transition-all" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="••••••••"
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-md-primary text-md-on-primary rounded-2xl font-bold uppercase tracking-widest text-sm hover:brightness-110 shadow-md-2 active:scale-95 transition-all disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processando...' : isSignUp ? 'Cadastrar e Entrar' : 'Entrar'}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-bold text-md-primary uppercase tracking-wider hover:underline"
          >
            {isSignUp ? "Já tem conta? Fazer Login" : "Não tem conta? Cadastre-se"}
          </button>
        </div>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-md-outline/10"></span></div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-white px-4 text-md-on-surface-variant">Ou continue com</span></div>
        </div>

        <button 
          className="w-full py-4 bg-white border border-md-outline/20 text-md-on-surface rounded-2xl font-bold hover:bg-md-surface-variant/20 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95" 
          onClick={async () => {
            setLoading(true);
            try { await authService.signInWithGoogle(); } catch (err: any) { setError(err.message); setLoading(false); }
          }}
          disabled={loading}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="Google" />
          Google Login
        </button>

        <div className="flex flex-col gap-3 pt-2">
          <button 
            onClick={onPricingView}
            className="w-full py-4 border-2 border-md-primary text-md-primary rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-md-primary hover:text-md-on-primary transition-all shadow-sm active:scale-95"
          >
            Conhecer Planos
          </button>
          <button onClick={onPublicView} className="w-full text-xs text-md-on-surface-variant font-bold uppercase tracking-widest hover:text-md-primary transition-colors">
            Consulta Pública
          </button>
        </div>
      </div>
    </div>
  );
}
