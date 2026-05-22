'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Sparkles, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Check if there's a cached session (valid for a short time or until tab closes)
  useEffect(() => {
    const access = sessionStorage.getItem('site_access');
    if (access === 'granted') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('site_access', 'granted');
      } else {
        setError(data.error || 'Senha incorreta.');
      }
    } catch (err: any) {
      setError('Ocorreu um erro ao verificar a senha.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 bg-stone-950 flex items-center justify-center p-4 z-50">
      {/* Decorative background blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-violet-900/30 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-rose-900/20 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-[#150F0F] border border-[#2A1E1E] p-8 rounded-3xl shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#251B1B] text-[#D48C70] flex items-center justify-center rounded-full mx-auto mb-4 border border-[#2A1E1E]">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Acesso Restrito</h1>
          <p className="text-sm text-[#EAD7D1]/70 leading-relaxed">
            Esta visualização está protegida. Digite a senha temporária para acessar.
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-6 p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-xs text-red-200 flex gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p>
              Supabase não configurado. Para testar o bloqueio de senha, configure as credenciais no painel de Settings (Environment Variables).
            </p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Digite a Senha..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0F0A0A] border border-[#2A1E1E] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#D48C70] transition-colors"
              disabled={isLoading || !isSupabaseConfigured}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-xs font-semibold"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading || !password || !isSupabaseConfigured}
            className="w-full bg-[#D48C70] hover:bg-[#E2A68E] text-[#0F0A0A] font-bold py-3 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="animate-pulse">Verificando...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Desbloquear Acesso
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
