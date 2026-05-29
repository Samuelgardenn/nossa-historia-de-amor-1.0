'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { Heart, Check, Copy, Share2, ExternalLink, Sparkles } from 'lucide-react';

export default function PagamentoSucessoPage() {
  const [status, setStatus] = React.useState<'verificando' | 'sucesso' | 'erro'>('verificando');
  const [pageId, setPageId] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const confirmedRef = React.useRef(false);

  React.useEffect(() => {
    if (confirmedRef.current) return;
    confirmedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get('payment_id') || params.get('collection_id');
    const pId = params.get('external_reference') || params.get('page_id');

    if (!paymentId || !pId) {
      setStatus('erro');
      setErrorMsg('Parâmetros de pagamento ausentes. Verifique o link.');
      return;
    }

    setPageId(pId);

    const confirmar = async () => {
      try {
        const res = await fetch('/api/confirmar-pagamento', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, pageId: pId }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setStatus('sucesso');
        } else {
          setStatus('erro');
          setErrorMsg(data.error || 'Não foi possível confirmar o pagamento.');
        }
      } catch {
        setStatus('erro');
        setErrorMsg('Erro de conexão. Tente recarregar a página.');
      }
    };

    confirmar();
  }, []);

  const getPageLink = () => {
    if (typeof window !== 'undefined' && pageId) {
      return `${window.location.origin}/p/${pageId}`;
    }
    return '';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getPageLink());
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
        {/* VERIFICANDO */}
        {status === 'verificando' && (
          <div className="bg-neutral-900/90 border border-neutral-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-md text-center">
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
          </div>
        )}

        {/* SUCESSO */}
        {status === 'sucesso' && (
          <div className="bg-neutral-900/90 border border-neutral-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-md text-center">
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
                onClick={handleCopy}
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
          </div>
        )}

        {/* ERRO */}
        {status === 'erro' && (
          <div className="bg-neutral-900/90 border border-red-900/40 p-8 rounded-3xl shadow-2xl backdrop-blur-md text-center">
            <div className="text-5xl mb-4">😔</div>
            <h2 className="text-xl font-bold text-white tracking-tight mb-2">
              Ops! Algo deu errado
            </h2>
            <p className="text-sm text-red-300/80 leading-relaxed mb-6 max-w-sm mx-auto">
              {errorMsg}
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 py-3 px-6 font-bold rounded-xl shadow transition cursor-pointer bg-rose-500 hover:bg-rose-600 text-white"
            >
              <Sparkles className="w-4 h-4" /> Voltar ao Início
            </a>
          </div>
        )}
      </motion.div>
    </div>
  );
}
