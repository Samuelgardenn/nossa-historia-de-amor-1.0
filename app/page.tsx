'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import RomancePage, { LovePageConfig, RomanceTheme, PolaroidData, TimelineData, PostItData } from '@/components/RomancePage';
import { Heart, Sparkles, X, Copy, Share2, Check, ExternalLink, HelpCircle } from 'lucide-react';


// pre-populated romantic placeholder data matching picsum seeds for seamless beautiful first load
const DEFAULT_ROMANTIC_STAGE: LovePageConfig = {
  titulo: "Nome Dele & Nome Dela",
  subtitulo: "Nossa história de carinho e risadas, escrita nas estrelas ✨",
  fotoPerfil: "/profile_avatar.png", 
  dataInicio: "2023-08-12",
  tema: "sophisticated-dark",
  customSongUrl: "https://open.spotify.com/intl-pt/track/1Q7EgiMOuwDcB0PJC6AzON",
  customSongTitle: "Música Integrada do Spotify",
  customSongArtist: "Player Conectado",
  polaroids: [
    {
      id: "pol1",
      fotoUrl: "/couple_casual.png",
      legenda: "Tarde com sorvete e sol no parque 🍦",
      data: "Setembro, 2023"
    },
    {
      id: "pol2",
      fotoUrl: "/couple_red.png",
      legenda: "De mãos dadas olhando o porto do sol 🌅",
      data: "Dezembro, 2023"
    },
    {
      id: "pol3",
      fotoUrl: "/couple_white.png",
      legenda: "Primeira viagem juntos sob as estrelas ⛰️",
      data: "Fevereiro, 2024"
    }
  ],
  linhaDoTempo: [
    {
      id: "time1",
      data: "12 de Agosto, 2023",
      titulo: "O Primeiro Olhar",
      descricao: "Nossos olhos se cruzaram no meio da livraria. Você derrubou aquele livro, eu tentei ajudar e acabamos rindo, sem saber que começava ali o nosso sempre.",
      fotoUrl: "/wedding_arch.png"
    },
    {
      id: "time2",
      data: "20 de Setembro, 2023",
      titulo: "O Pedido Especial",
      descricao: "No topo do mirante, enquanto a noite cobria a cidade com luzes e o vento sobrava seu cabelo, eu te pedi em namoro. O seu sorriso fez o tempo parar.",
      fotoUrl: "/wedding_bouquet.png"
    }
  ],
  postIts: [
    {
      id: "post1",
      texto: "Para mim, amar você é como escutar uma música linda que eu nunca quero tirar de repetição! Com todo o amor do universo, Nome Dele.",
      cor: "pink",
      autor: "Nome Dele"
    },
    {
      id: "post2",
      texto: "Obrigada por ser meu porto seguro, meu riso mais sincero e o motivo preferido de todos os meus suspiros felizes diariamente!",
      cor: "yellow",
      autor: "Nome Dela"
    }
  ]
};

// Hearts cascades particles interface
interface HeartParticle {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
}

// Rotating informative steps for premium loader
const LOADING_STEPS = [
  'Canalizando seus sentimentos românticos...',
  'Eternizando carinhos e lembranças...',
  'Afinando a melodia tocada no cassete...',
  'Organizando as fotos no painel de polaroides...',
  'Fidelizando as postagens no mural do coração...',
  'Selando seu amor nas estrelas...'
];

export default function HomeBuilderPage() {
  const [config, setConfig] = React.useState<LovePageConfig>(DEFAULT_ROMANTIC_STAGE);
  
  // Modal controllers
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [loadingStepText, setLoadingStepText] = React.useState('Eternizando seu amor...');
  const [generatedPageId, setGeneratedPageId] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  
  // Confetti particles
  const [particles, setParticles] = React.useState<HeartParticle[]>([]);

  // Particle regenerator when completing
  React.useEffect(() => {
    if (generatedPageId) {
      const arr = Array.from({ length: 45 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // percentage of screen width
        size: Math.random() * 16 + 12, // size between 12px and 28px
        delay: Math.random() * 6,
        duration: Math.random() * 3.5 + 3.5
      }));
      setTimeout(() => {
        setParticles(arr);
      }, 0);
    } else {
      setTimeout(() => {
        setParticles([]);
      }, 0);
    }
  }, [generatedPageId]);

  // Loading text cycler
  React.useEffect(() => {
    if (isUploading) {
      let idx = 0;
      const interval = setInterval(() => {
        idx = (idx + 1) % LOADING_STEPS.length;
        setLoadingStepText(LOADING_STEPS[idx]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isUploading]);

  // Helper to downscale base64 images before saving
  const compressBase64Local = (base64Str: string, quality = 0.5, maxWidth = 600, maxHeight = 600): Promise<string> => {
    return new Promise((resolve) => {
      if (!base64Str.startsWith('data:image/')) return resolve(base64Str); // Skip non-base64 or URLs
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
        } else {
          if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => resolve(base64Str);
      img.src = base64Str;
    });
  };

  // Trigger pagamento seguro via Stripe Checkout
  const handleEternalize = async () => {
    setShowConfirmModal(false);
    setIsUploading(true);
    setLoadingStepText('Preparando seu pagamento seguro...');

    try {
      let compressionQuality = 0.5;
      let maxDim = 600;
      let payloadToSave: any;
      let sizeInMB: string = '0';

      // Compressão iterativa para caber no limite do banco
      for (let attempts = 0; attempts < 3; attempts++) {
        payloadToSave = { ...config };
        
        // Comprimir avatar
        if (payloadToSave.fotoPerfil) {
          payloadToSave.fotoPerfil = await compressBase64Local(payloadToSave.fotoPerfil, compressionQuality, maxDim, maxDim);
        }
        
        // Comprimir polaroids
        if (payloadToSave.polaroids) {
          payloadToSave.polaroids = await Promise.all(payloadToSave.polaroids.map(async (pol: any) => ({
            ...pol,
            fotoUrl: await compressBase64Local(pol.fotoUrl, compressionQuality, maxDim, maxDim)
          })));
        }
        
        // Comprimir linha do tempo
        if (payloadToSave.linhaDoTempo) {
          payloadToSave.linhaDoTempo = await Promise.all(payloadToSave.linhaDoTempo.map(async (time: any) => ({
            ...time,
            fotoUrl: time.fotoUrl ? await compressBase64Local(time.fotoUrl, compressionQuality, maxDim, maxDim) : undefined
          })));
        }

        const payloadString = JSON.stringify(payloadToSave);
        sizeInMB = (new Blob([payloadString]).size / (1024 * 1024)).toFixed(2);
        console.log(`Tentativa ${attempts + 1} - Tamanho do payload: ${sizeInMB} MB`);
        
        if (parseFloat(sizeInMB) <= 0.95) {
          break;
        }
        
        compressionQuality -= 0.15;
        maxDim -= 150;
      }

      if (parseFloat(sizeInMB) > 0.95) {
        throw new Error('As fotos inseridas ainda estão muito grandes mesmo após forte compressão. Por favor, remova algumas ou tente com um número menor de fotos para não exceder o limite do banco de dados (Max 1MB).');
      }

      setLoadingStepText('Redirecionando para pagamento seguro...');

      // Criar sessão de checkout no Stripe via API
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageConfig: payloadToSave }),
      });

      const data = await response.json();
      
      if (data.url) {
        // Redirecionar para o Stripe Checkout
        window.location.href = data.url;
        return; // Não desligar o loading, pois o navegador está redirecionando
      } else {
        throw new Error(data.error || 'Erro ao criar sessão de pagamento.');
      }
    } catch (err: any) {
      alert(`Ops! Não conseguimos processar agora. ${err?.message || 'Tente novamente.'}`);
      setIsUploading(false);
    }
  };

  const currentThemeHexColor = () => {
    switch (config.tema) {
      case 'pink-blush': return 'from-pink-500 to-rose-600 shadow-rose-200/50';
      case 'vintage-rose': return 'from-amber-700 to-stone-800 shadow-stone-300';
      case 'sunset-warmth': return 'from-orange-500 to-amber-600 shadow-orange-200';
      case 'crimson-heart': return 'from-red-600 to-rose-800 shadow-rose-300';
      case 'cosmic-slate': return 'from-violet-600 to-fuchsia-700 shadow-violet-955/50';
      case 'sophisticated-dark': return 'from-[#D48C70] to-[#B06E54] shadow-[#D48C70]/30 hover:shadow-[0_0_15px_rgba(212,140,112,0.4)]';
    }
  };

  const getThemeTextClass = () => {
    switch (config.tema) {
      case 'cosmic-slate': return 'text-violet-400';
      case 'sophisticated-dark': return 'text-[#D48C70]';
      default: return 'text-rose-500';
    }
  };

  const currentHomeOriginLink = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/p/${generatedPageId}`;
    }
    return `meuamor.site/p/${generatedPageId}`;
  };

  const handleCopyLink = () => {
    const link = currentHomeOriginLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Web Share API matching
  const handleNativeShare = () => {
    const link = currentHomeOriginLink();
    if (navigator.share) {
      navigator.share({
        title: `Eternizamos Nosso Amor 💕`,
        text: `Veja nossa história permanente e fotos na caixinha de recordações online!`,
        url: link,
      }).catch(e => console.log('Compartilhamento cancelado', e));
    } else {
      // Fallback: copiar link para a área de transferência
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
      <div className="relative min-h-screen">
        
        {/* Heart floating particles confetti on completing */}
        {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -80, opacity: 0, x: `${p.x}vw` }}
          animate={{ 
            y: '110vh', 
            opacity: [0, 1, 1, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            delay: p.delay,
            duration: p.duration,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{ position: 'fixed', pointerEvents: 'none', zIndex: 1000 }}
        >
          <Heart className="text-red-500 fill-red-500" style={{ width: p.size, height: p.size }} />
        </motion.div>
      ))}

      {/* Primary Builder Stage preview */}
      <RomancePage config={config} onChange={setConfig} isReadOnly={false} />

      {/* Floating builder actions dashboard */}
      <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4">
        <motion.button
          onClick={() => setShowConfirmModal(true)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className={`flex items-center gap-2 px-8 py-4 text-white text-base font-bold rounded-full shadow-lg cursor-pointer bg-gradient-to-r transition-all animate-bounce ${currentThemeHexColor()}`}
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span>💳 Eternizar: </span>
          <span className="line-through text-white/65 text-sm">R$ 29,90</span>
          <span className="font-extrabold text-amber-300 ml-1">R$ 19,90</span>
        </motion.button>
      </div>

      {/* CONFIRMATION GATE DIALOG */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className={`max-w-md w-full p-6 shadow-2xl rounded-3xl border relative transition-all ${
                config.tema === 'sophisticated-dark'
                  ? 'bg-[#150F0F] border-[#2A1E1E] text-[#EAD7D1]'
                  : 'bg-white border-pink-100 text-slate-800'
              }`}
            >
              <button 
                onClick={() => setShowConfirmModal(false)}
                className={`absolute top-4 right-4 p-1.5 rounded-full ${
                  config.tema === 'sophisticated-dark' ? 'hover:bg-[#251B1B] text-[#D48C70]/70' : 'hover:bg-slate-100 text-slate-400'
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center pt-2">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-xl ${
                  config.tema === 'sophisticated-dark' ? 'bg-[#251B1B] text-[#D48C70]' : 'bg-pink-100 text-pink-600'
                }`}>
                  💕
                </div>
                <h3 className={`text-xl font-bold font-sans tracking-tight mb-2 ${
                  config.tema === 'sophisticated-dark' ? 'text-white' : 'text-rose-955'
                }`}>
                  Tudo pronto para eternizar?
                </h3>
                <p className={`text-sm leading-relaxed mb-4 ${
                  config.tema === 'sophisticated-dark' ? 'text-[#EAD7D1]/70' : 'text-slate-500'
                }`}>
                  Sua caixinha de memórias será guardada com segurança após o pagamento.
                  Você receberá um <strong>link exclusivo e permanente</strong> para compartilhar com seu amor!
                </p>
                <div className={`p-3 rounded-xl mb-4 flex items-center gap-3 text-left border ${
                  config.tema === 'sophisticated-dark'
                    ? 'bg-[#0F0A0A] border-[#2A1E1E]'
                    : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="text-2xl">🔒</div>
                  <div>
                    <span className={`text-xs font-bold block ${
                      config.tema === 'sophisticated-dark' ? 'text-[#D48C70]' : 'text-rose-600'
                    }`}>Pagamento Seguro via Mercado Pago</span>
                    <span className={`text-[10px] block ${
                      config.tema === 'sophisticated-dark' ? 'text-[#EAD7D1]/50' : 'text-slate-400'
                    }`}>De <span className="line-through">R$ 29,90</span> por apenas R$ 19,90 • Cartão de crédito, PIX ou boleto • Criptografia SSL</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={handleEternalize}
                    className={`w-full py-3 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      config.tema === 'sophisticated-dark'
                        ? 'bg-[#D48C70] hover:bg-[#E2A68E] text-[#0F0A0A]'
                        : 'bg-rose-500 hover:bg-rose-600 text-white'
                    }`}
                  >
                    💳 Pagar e Criar Nossa Página! 🌹
                  </button>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className={`w-full py-2.5 font-semibold rounded-xl text-xs transition cursor-pointer ${
                      config.tema === 'sophisticated-dark'
                        ? 'bg-[#251B1B] hover:bg-[#2A1E1E] text-[#D48C70]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Revisar mais um pouco
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CARING LOADER OVERLAY COMPONENT */}
      <AnimatePresence>
        {isUploading && (
          <div className="fixed inset-0 bg-stone-950 z-50 flex flex-col items-center justify-center text-center p-6 text-pink-200">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 animate-pulse">
                <Heart className="w-12 h-12 text-rose-500 animate-[pulse_1s_infinite_ease-in-out]" />
              </div>
              <div className="absolute inset-0 border-2 border-rose-500/20 rounded-full animate-ping" />
            </div>
            
            <h3 className="text-xl font-bold font-sans text-rose-100 tracking-tight transition-all duration-300">
              {loadingStepText}
            </h3>
            <p className="text-xs text-rose-200/50 mt-1 max-w-xs mx-auto italic">
              &ldquo;Enviando fotos, arrumando cassete e carimbando sentimento...&rdquo;
            </p>
          </div>
        )}
      </AnimatePresence>

      {/* SPECTACULAR SUCCESS MODAL FOR THE COUPLE */}
      <AnimatePresence>
        {generatedPageId && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`max-w-lg w-full p-8 shadow-2xl text-center border rounded-3xl relative overflow-hidden transition-all ${
                config.tema === 'sophisticated-dark'
                  ? 'bg-[#150F0F] border-[#2A1E1E] text-[#EAD7D1]'
                  : 'bg-white border-pink-100 text-slate-800'
              }`}
            >
              {/* background layout decor */}
              <div className={`absolute -top-12 -left-12 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
                config.tema === 'sophisticated-dark' ? 'bg-[#D48C70]/10' : 'bg-pink-100'
              }`} />
              <div className={`absolute -bottom-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
                config.tema === 'sophisticated-dark' ? 'bg-[#D48C70]/10' : 'bg-orange-100'
              }`} />

              <div className="text-6xl mb-4">🏆 💕 ✨</div>
              <h2 className={`text-2xl font-bold font-sans tracking-tight mb-2 ${
                config.tema === 'sophisticated-dark' ? 'text-white' : 'text-rose-955'
              }`}>
                Sua História Está Eternizada!
              </h2>
              <p className={`text-sm leading-relaxed max-w-sm mx-auto mb-6 ${
                config.tema === 'sophisticated-dark' ? 'text-[#EAD7D1]/70' : 'text-slate-500'
              }`}>
                Parabéns! O cantinho de vocês foi criado de forma permanente na web para resistir ao tempo. Guarde este link com carinho e envie agora para seu amor!
              </p>

              {/* Unique love address bar link box */}
              <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-left mb-6 border ${
                config.tema === 'sophisticated-dark'
                  ? 'bg-[#0F0A0A] border-[#2A1E1E]'
                  : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="truncate flex-1">
                  <span className={`text-[10px] uppercase font-bold block mb-0.5 ${
                    config.tema === 'sophisticated-dark' ? 'text-[#D48C70]/60' : 'text-slate-400'
                  }`}>Link Único Romântico</span>
                  <span className={`text-xs font-mono font-medium block truncate select-all ${
                    config.tema === 'sophisticated-dark' ? 'text-[#D48C70]' : 'text-rose-600'
                  }`}>{currentHomeOriginLink()}</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`p-3 border rounded-xl shadow-sm transition flex-shrink-0 cursor-pointer ${
                    config.tema === 'sophisticated-dark'
                      ? 'bg-[#251B1B] border-[#2A1E1E] text-[#D48C70] hover:bg-[#2A1E1E]'
                      : 'bg-white border-slate-100 text-rose-500 hover:bg-rose-50'
                  }`}
                  title="Copiar Link"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              {/* Action tray */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button
                  onClick={handleNativeShare}
                  className={`py-3 font-bold rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer ${
                    config.tema === 'sophisticated-dark'
                      ? 'bg-[#D48C70] hover:bg-[#E2A68E] text-[#0F0A0A]'
                      : 'bg-rose-500 hover:bg-rose-600 text-white'
                  }`}
                >
                  <Share2 className="w-4 h-4" /> Compartilhar com Meu Amor 📲
                </button>
                <a
                  href={`/p/${generatedPageId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`py-3 font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                    config.tema === 'sophisticated-dark'
                      ? 'bg-[#251B1B] hover:bg-[#2A1E1E] text-[#D48C70] border border-[#2A1E1E]'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <ExternalLink className="w-4 h-4" /> Visualizar Página Pronta 🔗
                </a>
              </div>


            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </div>
  );
}
