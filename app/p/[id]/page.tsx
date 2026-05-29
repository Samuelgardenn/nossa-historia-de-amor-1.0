'use client';

import * as React from 'react';
import { use } from 'react';
import RomancePage, { LovePageConfig } from '@/components/RomancePage';
import { Heart, RefreshCw, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PermanentRomancePage({ params }: { params: Promise<{ id: string }> }) {
  // Await params safely for Next 15 compatibility
  const { id } = use(params);

  const [pageData, setPageData] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [errorString, setErrorString] = React.useState('');

  React.useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/pagina/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setErrorString('Esta página romântica ainda não foi escrita nos astros...');
          } else if (res.status === 402) {
            setErrorString('O pagamento desta página ainda está pendente de confirmação...');
          } else {
            setErrorString('Ops, tivemos dificuldade para carregar a caixinha de memórias.');
          }
          return;
        }

        const data = await res.json();
        setPageData(data);
      } catch (err) {
        setErrorString('Sua caixinha de memórias sumiu no espaço, tente recarregar.');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [id]);

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

  // Double check configuration data mapping
  const loveConfig: LovePageConfig = pageData.dados;

  return (
    <div className="relative">
      <RomancePage config={loveConfig} isReadOnly={true} />
    </div>
  );
}
