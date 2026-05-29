'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { Heart, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PagamentoCanceladoPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient Blur */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full relative z-10"
      >
        <div className="bg-neutral-900/90 border border-neutral-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-md text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-amber-400" />
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
            Pagamento Cancelado
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed mb-6 max-w-sm mx-auto">
            Sem problemas! Seu pagamento não foi processado e nenhuma cobrança foi feita.
            Você pode voltar e tentar novamente quando quiser. 💕
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 py-3 px-6 font-bold rounded-xl shadow transition cursor-pointer bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar e Tentar Novamente
            </a>
          </div>

          <p className="text-xs text-neutral-500 mt-6">
            Se encontrar dificuldades, entre em contato com nosso suporte. 
            Estamos aqui para ajudar! 🌹
          </p>
        </div>
      </motion.div>
    </div>
  );
}
