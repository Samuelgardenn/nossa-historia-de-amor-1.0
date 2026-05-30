'use client';

import * as React from 'react';
import { use } from 'react';
import RomancePage, { LovePageConfig } from '@/components/RomancePage';
import { Heart, Sparkles, RefreshCw, Clock } from 'lucide-react';
import Link from 'next/link';

export default function PermanentRomancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [pageData, setPageData] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isPending, setIsPending] = React.useState(false);
  const [errorString, setErrorString] = React.useState('');
  const [pollCount, setPollCount] = React.useState(0);
  const [countdown, setCountdown] = React.useState(10);

  const fetchPage = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/pagina/${id}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 404) {
          setIsPending(false);
          setErrorString('Esta página romântica ainda não foi escrita nos astros...');
        } else if (res.status === 402) {
          // Pagamento pendente — mostrar tela de aguardo com polling
          setIsPending(true);
          setErrorString('');
        } else {
          setIsPending(false);
          setErrorString(data.error || 'Ops, tivemos dificuldade para carregar a caixinha de memórias.');
        }
        return;
      }

      const data = await res.json();
      setPageData(data);
      setIsPending(false);
      setErrorString('');
    } catch {
      setIsPending(false);
      setErrorString('Sua caixinha de memórias sumiu no espaço, tente recarregar.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Carregamento inicial
  React.useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  // Polling quando pagamento está pendente (máx 5 min = 30 tentativas × 10s)
  React.useEffect(() => {
    if (!isPending || pollCount >= 30) return;

    setCountdown(10);
    const timer = setTimeout(() => {
      setPollCount(c => c + 1);
      fetchPage();
    }, 10000);

    const countdownTimer = setInterval(() => {
      setCountdown(c => (c > 1 ? c - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownTimer);
    };
  }, [isPending, pollCount, fetchPage]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center text-center p-6 text-pink-200">
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 animate-pulse">
            <Heart className="w-12 h-12 text-rose-500 animate-[pulse_1.5s_infinite_ease-in-out]" />
          </div>
          <div className="absolute inset-0 border-2 border-rose-500/20 rounded-full animate-ping" />
        </div>
        <h3 className="text-xl font-bold text-rose-100 font-sans tracking-tight mb-2">
          Abrindo nossa caixinha de recordações...
        </h3>
        <p className="text-xs text-rose-200/60 max-w-xs mx-auto italic">
          &ldquo;O amor tudo sofre, tudo crê, tudo espera, tudo suporta&rdquo;
        </p>
      </div>
    );
  }

  // ── Pagamento Pendente ──
  if (isPending) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-center p-6 font-sans">
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Clock className="w-12 h-12 text-amber-400 animate-pulse" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-amber-200 tracking-tight mb-2">
          Confirmando o pagamento...
        </h3>
        <p className="text-sm text-amber-100/70 max-w-sm mb-4 leading-relaxed">
          Seu PIX está sendo processado pelo banco. A página será exibida automaticamente assim que confirmarmos o pagamento!
        </p>
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          {pollCount < 30
            ? `Verificando novamente em ${countdown}s...`
            : 'Aguardando confirmação manual do banco...'}
        </div>
        <button
          onClick={() => {
            setLoading(true);
            setPollCount(0);
            fetchPage();
          }}
          className="inline-flex items-center gap-2 py-2.5 px-5 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-sm font-semibold shadow-lg transition"
        >
          <RefreshCw className="w-4 h-4" /> Verificar Agora
        </button>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition"
        >
          <Sparkles className="w-3.5 h-3.5" /> Criar minha própria página
        </Link>
      </div>
    );
  }

  // ── Erro ──
  if (errorString || !pageData) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-center p-6 text-amber-100 leading-relaxed font-sans">
        <div className="text-5xl mb-4">✨ 💔 ✨</div>
        <h3 className="text-xl font-bold font-sans text-rose-200 tracking-tight mb-2">
          {errorString || 'Recordação protegida ou inacessível'}
        </h3>
        <p className="text-xs text-amber-100/60 max-w-sm mb-6 italic">
          Verifique o link ou crie seu próprio cantinho para eternizar sua história de amor agora mesmo!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-full text-sm font-semibold shadow-lg shadow-rose-900/30 transition transform hover:scale-103"
        >
          <Sparkles className="w-4 h-4" /> Criar Minha Página Romântica
        </Link>
      </div>
    );
  }

  // ── Página ──
  const loveConfig: LovePageConfig = pageData.dados;

  return (
    <div className="relative">
      <RomancePage config={loveConfig} isReadOnly={true} />
    </div>
  );
}
