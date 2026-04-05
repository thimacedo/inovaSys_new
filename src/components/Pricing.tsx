import React from 'react';
import { authService } from '../services/authService';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-12 text-center space-y-8">
        <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        
        <h1 className="text-4xl font-black tracking-tight text-slate-900">
          Bem-vindo ao inovaSys!
        </h1>
        
        <p className="text-lg text-slate-600 max-w-xl mx-auto">
          Sua conta Google foi conectada com sucesso, mas não encontramos um perfil ativo associado a ela em nosso sistema.
        </p>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-left space-y-4">
          <h3 className="font-bold text-blue-900 text-lg">O que fazer agora?</h3>
          <ul className="space-y-3 text-blue-800">
            <li className="flex items-start gap-3">
              <svg className="mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span><strong>Se você já faz parte de uma equipe:</strong> Peça ao gestor da sua Câmara para adicionar o seu e-mail do Google na aba "Equipe". Depois disso, basta fazer login novamente.</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span><strong>Se você deseja criar uma nova Câmara:</strong> Conheça nossos planos e assine o inovaSys para começar a gerenciar seus processos arbitrais.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button 
            onClick={() => window.open('https://inovasys.com.br/planos', '_blank')}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2"
          >
            Ver Planos e Assinar
          </button>
          
          <button 
            onClick={() => authService.signOut()}
            className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            Sair e Voltar ao Login
          </button>
        </div>
      </div>
    </div>
  );
}
