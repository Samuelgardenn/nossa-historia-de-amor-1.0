'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Check, Copy, Share2, ExternalLink, Sparkles, RefreshCw, Clock } from 'lucide-react';

type Status = 'verificando' | 'pendente' | 'sucesso' | 'erro';

const MAX_POLL_ATTEMPTS = 72; // 6 min (72 × 5s)
const POLL_INTERVAL_MS = 5000;

export default function PagamentoSucessoPage() {
  const [status, setStatus] = React.useState<Status>('verificando');
  const [pageId, setPageId] = React.useState<string | null>(null);
  const [paymentId, setPaymentId] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [pollCount, setPollCount] = React.useState(0);
  const [countdown, setCountdown] = React.useState(POLL_INTERVAL_MS / 1000);
  const confirmedRef = React.useRef(false);

  // Primeira verificação ao carregar
  React.useEffect(() => {
    if (confirmedRef.current) return;
    confirmedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const pid = params.get('payment_id') || params.get('collection_id');
    const pId = params.get('external_reference') || params.get('page_id');

    if (!pid || !pId) {
      setStatus('erro');
      setErrorMsg('Parâmetros de pagamento ausentes. Verifique o link ou volte ao início.');
      return;
    }

    setPaymentId(pid);
    setPageId(pId);

    verificarPagamento(pid, pId, true);
  }, []);

  // Polling para PIX pendente
  React.useEffect(() => {
    if (status !== 'pendente' || !paymentId || !pageId) return;

    if (pollCount >= MAX_POLL_ATTEMPTS) {
      setStatus('erro');
      setErrorMsg(
        'Seu PIX demorou mais que o esperado para confirmar. Não se preocupe: sua página será ativada automaticamente assim que o banco confirmar o pagamento. Guarde o link abaixo!'
      );
      return;
    }

    setCountdown(POLL_INTERVAL_MS / 1000);

    const timer = setTimeout(() => {
      verificarPagamento(paymentId, pageId, false);
    }, POLL_INTERVAL_MS);

    const countdownTimer = setInterval(() => {
      setCountdown(c => (c > 1 ? c - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownTimer);
    };
  }, [status, paymentId, pageId, pollCount]);

  async function verificarPagamento(pid: string, pId: string, isFirst: boolean) {
    try {
      const res = await fetch('/api/confirmar-pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: pid, pageId: pId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('sucesso');
      } else if (res.status === 202 && data.pending) {
        // PIX ainda aguardando confirmação bancária
        setStatus('pendente');
        if (!isFirst) {
          setPollCount(c => c + 1);
        }
      } else {
        setStatus('erro');
        setErrorMsg(data.error || 'Não foi possível confirmar o pagamento.');
      }
    } catch {
      if (isFirst) {
        setStatus('erro');
        setErrorMsg('Erro de conexão. Tente recarregar a página.');
      } else {
        // Em caso de erro de rede no polling, tenta novamente
        setPollCount(c => c + 1);
      }
    }
  }

  const getPageLink = () => {
    if (typeof window !== 'undefined' && pageId) {
      return `${window.location.origin}/p/${pageId}`;
    }
    return '';
  };

  const handleCopy = (text?: string) => {
    navigator.clipboard.writeText(text || getPageLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const link = getPageLink();
    if (navigator.share) {
      navigator.share({
        title: 'Eternizamos Nosso Amor 💕',
        text: 'Veja nossa história permanente e fotos na caixinha de recordações online!',
        url: link,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient Blur */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full relative z-10"
      >
        <AnimatePresence mode="wait">

          {/* ── VERIFICANDO ── */}
          {status === 'verificando' && (
            <motion.div
              key="verificando"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-neutral-900/90 border border-neutral-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-md text-center"
            >
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 animate-pulse">
                  <Heart className="w-10 h-10 text-rose-500" />
                </div>
                <div className="absolute inset-0 border-2 border-rose-500/20 rounded-full animate-ping" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight mb-2">
                Confirmando seu pagamento...
              </h2>
              <p className="text-sm text-neutral-400">
                Estamos verificando sua transação com segurança. Aguarde um instante 💕
              </p>
            </motion.div>
          )}

          {/* ── PIX PENDENTE ── */}
          {status === 'pendente' && (
            <motion.div
              key="pendente"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-neutral-900/90 border border-amber-600/30 p-8 rounded-3xl shadow-2xl backdrop-blur-md text-center"
            >
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
                  <Clock className="w-10 h-10 text-amber-400 animate-pulse" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight mb-2">
                ⏳ Aguardando confirmação do PIX
              </h2>
              <p className="text-sm text-neutral-400 leading-relaxed mb-6 max-w-sm mx-auto">
                Seu pagamento PIX foi enviado! Estamos aguardando a confirmação do banco.
                <span className="block mt-1 text-amber-400/80 font-medium">
                  Isso pode levar de alguns segundos a alguns minutos. Não feche esta página!
                </span>
              </p>

              {/* Verificando novamente em X s */}
              <div className="flex items-center justify-center gap-2 mb-6 text-xs text-neutral-500">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Verificando novamente em {countdown}s... (tentativa {pollCount + 1}/{MAX_POLL_ATTEMPTS})
              </div>

              {/* Link da página — para guardar */}
              {pageId && (
                <div className="p-4 rounded-2xl flex items-center justify-between gap-3 text-left mb-4 border bg-neutral-950/60 border-neutral-800">
                  <div className="truncate flex-1">
                    <span className="text-[10px] uppercase font-bold block mb-0.5 text-amber-500/60">
                      Guarde seu link (ficará ativo após confirmação)
                    </span>
                    <span className="text-xs font-mono font-medium block truncate select-all text-amber-400">
                      {getPageLink()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy()}
                    className="p-3 border border-neutral-800 bg-neutral-900 rounded-xl shadow-sm transition flex-shrink-0 cursor-pointer hover:bg-neutral-800 text-neutral-400 hover:text-white"
                    title="Copiar Link"
                  >
                    {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              )}

              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Não precisa fazer nada. A página será ativada automaticamente quando o banco confirmar o PIX.
              </p>
            </motion.div>
          )}

          {/* ── SUCESSO ── */}
          {status === 'sucesso' && (
            <motion.div
              key="sucesso"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-neutral-900/90 border border-neutral-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-md text-center"
            >
              <div className="text-6xl mb-4">🏆 💕 ✨</div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-8 h-8 text-emerald-400" />
              </motion.div>

              <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                Pagamento Confirmado! 🎉
              </h2>
              <p className="text-sm text-neutral-400 leading-relaxed mb-6 max-w-sm mx-auto">
                Parabéns! Sua página de amor foi ativada permanentemente.
                Guarde este link com carinho e envie agora para seu amor!
              </p>

              {/* Link da página */}
              <div className="p-4 rounded-2xl flex items-center justify-between gap-3 text-left mb-6 border bg-neutral-950/60 border-neutral-800">
                <div className="truncate flex-1">
                  <span className="text-[10px] uppercase font-bold block mb-0.5 text-rose-500/60">
                    Link Único Romântico
                  </span>
                  <span className="text-xs font-mono font-medium block truncate select-all text-rose-400">
                    {getPageLink()}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy()}
                  className="p-3 border border-neutral-800 bg-neutral-900 rounded-xl shadow-sm transition flex-shrink-0 cursor-pointer hover:bg-neutral-800 text-neutral-400 hover:text-white"
                  title="Copiar Link"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              {/* Ações */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleShare}
                  className="py-3 font-bold rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                >
                  <Share2 className="w-4 h-4" /> Compartilhar 📲
                </button>
                <a
                  href={`/p/${pageId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 font-bold rounded-xl transition flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700"
                >
                  <ExternalLink className="w-4 h-4" /> Ver Página 🔗
                </a>
              </div>
            </motion.div>
          )}

          {/* ── ERRO ── */}
          {status === 'erro' && (
            <motion.div
              key="erro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-900/90 border border-red-900/40 p-8 rounded-3xl shadow-2xl backdrop-blur-md text-center"
            >
              <div className="text-5xl mb-4">😔</div>
              <h2 className="text-xl font-bold text-white tracking-tight mb-2">
                Ops! Algo deu errado
              </h2>
              <p className="text-sm text-red-300/80 leading-relaxed mb-6 max-w-sm mx-auto">
                {errorMsg}
              </p>

              {/* Se tiver pageId, mostrar link para tentar acessar depois */}
              {pageId && (
                <div className="p-4 rounded-2xl flex items-center justify-between gap-3 text-left mb-6 border bg-neutral-950/60 border-neutral-800">
                  <div className="truncate flex-1">
                    <span className="text-[10px] uppercase font-bold block mb-0.5 text-amber-500/60">
                      Link da sua página (guarde!)
                    </span>
                    <span className="text-xs font-mono font-medium block truncate select-all text-amber-400">
                      {getPageLink()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy()}
                    className="p-3 border border-neutral-800 bg-neutral-900 rounded-xl shadow-sm transition flex-shrink-0 cursor-pointer hover:bg-neutral-800 text-neutral-400 hover:text-white"
                    title="Copiar Link"
                  >
                    {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              )}

              <div className="flex gap-3 flex-wrap justify-center">
                {paymentId && pageId && (
                  <button
                    onClick={() => {
                      setStatus('verificando');
                      verificarPagamento(paymentId, pageId, true);
                    }}
                    className="inline-flex items-center gap-2 py-3 px-6 font-bold rounded-xl shadow transition cursor-pointer bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <RefreshCw className="w-4 h-4" /> Tentar Novamente
                  </button>
                )}
                <a
                  href="/"
                  className="inline-flex items-center gap-2 py-3 px-6 font-bold rounded-xl shadow transition cursor-pointer bg-neutral-700 hover:bg-neutral-600 text-white"
                >
                  <Sparkles className="w-4 h-4" /> Voltar ao Início
                </a>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
