'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart, Shield, Plus, Settings, Trash2, Edit, Copy, ExternalLink,
  Sparkles, Check, LogOut, ArrowRight, Music, Calendar, ChevronRight, RefreshCw, Layers
} from 'lucide-react';
import { LovePageConfig, RomanceTheme } from '@/components/RomancePage';

// Standard Template configurations for Admin manual generation
const TEMPLATES: Record<string, { name: string; description: string; config: LovePageConfig }> = {
  romantic: {
    name: "❤️ Romântico Clássico",
    description: "Ideal para namorados e comemorações gerais de datas com cores marcantes.",
    config: {
      titulo: "Nome Dele & Nome Dela",
      subtitulo: "Nossa história de carinho e risadas, escrita nas estrelas ✨",
      fotoPerfil: "/profile_avatar.png",
      dataInicio: "2023-08-12",
      tema: "sophisticated-dark",
      customSongUrl: "https://open.spotify.com/intl-pt/track/1Q7EgiMOuwDcB0PJC6AzON",
      customSongTitle: "Música do Spotify",
      customSongArtist: "Player Conectado",
      polaroids: [
        { id: "p1", fotoUrl: "/couple_casual.png", legenda: "Tarde com sorvete e sol no parque 🍦", data: "Setembro, 2023" },
        { id: "p2", fotoUrl: "/couple_red.png", legenda: "De mãos dadas olhando o pôr do sol 🌅", data: "Dezembro, 2023" },
        { id: "p3", fotoUrl: "/couple_white.png", legenda: "Primeira viagem juntos sob as estrelas ⛰️", data: "Fevereiro, 2024" }
      ],
      linhaDoTempo: [
        { id: "t1", data: "12 de Agosto, 2023", titulo: "O Primeiro Olhar", descricao: "Nossos olhos se cruzaram no meio da livraria. Você derrubou aquele livro, eu tentei ajudar e acabamos rindo, sem saber que começava ali o nosso sempre.", fotoUrl: "/wedding_arch.png" },
        { id: "t2", data: "20 de Setembro, 2023", titulo: "O Pedido Especial", descricao: "No topo do mirante, enquanto a noite cobria a cidade com luzes e o vento soprava seu cabelo, eu te pedi em namoro. O seu sorriso fez o tempo parar.", fotoUrl: "/wedding_bouquet.png" }
      ],
      postIts: [
        { id: "post1", texto: "Para mim, amar você é como escutar uma música linda que eu nunca quero tirar de repetição! Com todo o amor do universo.", cor: "pink", autor: "Nome Dele" },
        { id: "post2", texto: "Obrigada por ser meu porto seguro, meu riso mais sincero e o motivo preferido de todos os meus suspiros felizes diariamente!", cor: "yellow", autor: "Nome Dela" }
      ]
    }
  },
  anniversary: {
    name: "🎉 Aniversário de Namoro",
    description: "Foco em marcos temporais e lembranças de carinho de cada ano juntos.",
    config: {
      titulo: "Nosso Aniversário de Amor",
      subtitulo: "Celebrando mais um ano de risadas e infinitas cumplicidades ✨",
      fotoPerfil: "/couple_casual.png",
      dataInicio: "2022-05-20",
      tema: "vintage-rose",
      customSongUrl: "https://open.spotify.com/intl-pt/track/1Q7EgiMOuwDcB0PJC6AzON",
      customSongTitle: "Our Theme Song",
      customSongArtist: "Anniversary Special",
      polaroids: [
        { id: "ap1", fotoUrl: "/couple_white.png", legenda: "Sempre rindo quando estamos colados... 💕", data: "Maio, 2022" },
        { id: "ap2", fotoUrl: "/couple_casual.png", legenda: "Nosso primeiro café juntos de domingo", data: "Julho, 2022" },
        { id: "ap3", fotoUrl: "/couple_red.png", legenda: "Eternizados no abraço mais gostoso", data: "Outubro, 2022" }
      ],
      linhaDoTempo: [
        { id: "at1", data: "20 de Maio, 2022", titulo: "O Início do Sempre", descricao: "O dia em que decidimos dar as mãos e caminhar rumo ao mesmo horizonte. Nossa maior certeza.", fotoUrl: "/wedding_arch.png" },
        { id: "at2", data: "12 de Outubro, 2023", titulo: "Nossa Primeira Viagem", descricao: "Dias cheios de sol, passeios descalços na praia e o som do mar testemunhando a força do nosso carinho.", fotoUrl: "/wedding_bouquet.png" }
      ],
      postIts: [
        { id: "apost1", texto: "Você preenche os meus dias com cores fantásticas e um carinho que eu nem sabia existir. Te amo!", cor: "yellow", autor: "Ela" },
        { id: "apost2", texto: "Que a gente continue sempre assim: parceiros de risada, companheiros nos desafios e muito, muito apaixonados.", cor: "blue", autor: "Ele" }
      ]
    }
  },
  marriage: {
    name: "💍 Casamento / Bodas",
    description: "Estilo sofisticado e solene perfeito para noivados, casamentos e bodas.",
    config: {
      titulo: "Sempre e Para Sempre",
      subtitulo: "Nosso sim em frente ao altar foi apenas o começo de um amor infindável 🤍",
      fotoPerfil: "/profile_avatar.png",
      dataInicio: "2021-10-15",
      tema: "sophisticated-dark",
      customSongUrl: "https://open.spotify.com/intl-pt/track/1Q7EgiMOuwDcB0PJC6AzON",
      customSongTitle: "Nossa Canção Instrumental",
      customSongArtist: "Bodas Eternas",
      polaroids: [
        { id: "mp1", fotoUrl: "/couple_red.png", legenda: "O ensaio pré-wedding sob a luz dourada 🌅", data: "Julho, 2021" },
        { id: "mp2", fotoUrl: "/couple_white.png", legenda: "Seu olhar de admiração logo após o sim", data: "Outubro, 2021" },
        { id: "mp3", fotoUrl: "/profile_avatar.png", legenda: "O brinde de uma história linda construída juntos", data: "Janeiro, 2022" }
      ],
      linhaDoTempo: [
        { id: "mt1", data: "15 de Outubro, 2021", titulo: "O Dia do Nosso Sim", descricao: "Na frente de todos os que amamos, selamos nossos corações em um só propósito sob um lindo arco de luzes.", fotoUrl: "/wedding_arch.png" },
        { id: "mt2", data: "28 de Novembro, 2022", titulo: "Nossa Doce Lua de Mel", descricao: "Viagem marcante repleta de novas descobertas, abraços apertados e a certeza de que escolhemos a pessoa certa para a vida inteira.", fotoUrl: "/wedding_bouquet.png" }
      ],
      postIts: [
        { id: "mpost1", texto: "Amar você é um porto seguro, a calmaria após a tempestade e o riso mais fácil do meu dia.", cor: "pink", autor: "Esposo" },
        { id: "mpost2", texto: "Construir nosso lar dia após dia tem sido o privilégio mais lindo de toda a minha vida terrena.", cor: "purple", autor: "Esposa" }
      ]
    }
  }
};

export default function AdminDashboardPage() {
  const [passcode, setPasscode] = React.useState('');
  const [isAuthorized, setIsAuthorized] = React.useState(false);
  const [authError, setAuthError] = React.useState('');

  // Dashboard states
  const [pages, setPages] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Modal controllers
  const [showFormModal, setShowFormModal] = React.useState(false);
  const [formMode, setFormMode] = React.useState<'create' | 'edit'>('create');
  const [editingPageId, setEditingPageId] = React.useState<string | null>(null);

  // Custom Form states
  const [selectedPresetTemplate, setSelectedPresetTemplate] = React.useState<string>('romantic');
  const [formTitulo, setFormTitulo] = React.useState('');
  const [formSubtitulo, setFormSubtitulo] = React.useState('');
  const [formDataInicio, setFormDataInicio] = React.useState('2023-01-01');
  const [formTema, setFormTema] = React.useState<RomanceTheme>('sophisticated-dark');
  const [formSongUrl, setFormSongUrl] = React.useState('');
  const [formFotoPerfil, setFormFotoPerfil] = React.useState('/profile_avatar.png');

  // UI notifications
  const [savingLoading, setSavingLoading] = React.useState(false);
  const [apiMessage, setApiMessage] = React.useState({ type: '', text: '' });

  const fetchPages = React.useCallback(async (token?: string) => {
    const actToken = token || localStorage.getItem('saas_admin_lock') || '';
    setLoading(true);
    try {
      const res = await fetch('/api/admin/paginas', {
        headers: {
          'Authorization': actToken
        }
      });
      if (!res.ok) throw new Error('Não foi possível listar as páginas.');
      const data = await res.json();
      setPages(data);
    } catch (e: any) {
      console.error(e);
      setApiMessage({ type: 'error', text: 'Falha ao buscar páginas do banco de dados.' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Persistence local of session passcode
  React.useEffect(() => {
    const checkSession = async () => {
      const savedCode = localStorage.getItem('saas_admin_lock');
      const systemCode = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || 'amor123';
      if (savedCode === systemCode) {
        setIsAuthorized(true);
        await fetchPages(systemCode);
      }
    };
    checkSession();
  }, [fetchPages]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const systemCode = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || 'amor123';
    if (passcode === systemCode) {
      localStorage.setItem('saas_admin_lock', passcode);
      setIsAuthorized(true);
      setAuthError('');
      fetchPages(systemCode);
    } else {
      setAuthError('Senha de acesso incorreta. Código rejeitado.');
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem('saas_admin_lock');
    setIsAuthorized(false);
    setPages([]);
  };


  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir essa página permanentemente? Essa ação é irreversível.')) return;
    const actToken = localStorage.getItem('saas_admin_lock') || '';
    try {
      const res = await fetch(`/api/admin/paginas?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': actToken
        }
      });
      if (res.ok) {
        setPages(prev => prev.filter(p => p.id !== id));
        setApiMessage({ type: 'success', text: 'Página romântica deletada com sucesso.' });
      } else {
        throw new Error('Falha na resposta do servidor.');
      }
    } catch (e) {
      setApiMessage({ type: 'error', text: 'Erro ao remover registro do banco.' });
    }
  };

  // Open creation modal prefilled with selected template
  const openCreateModal = () => {
    setFormMode('create');
    setEditingPageId(null);
    loadTemplatePreset('romantic');
    setShowFormModal(true);
  };

  // Pre-fill model values
  const loadTemplatePreset = (presetKey: string) => {
    setSelectedPresetTemplate(presetKey);
    const model = TEMPLATES[presetKey];
    if (model) {
      setFormTitulo(model.config.titulo);
      setFormSubtitulo(model.config.subtitulo);
      setFormDataInicio(model.config.dataInicio);
      setFormTema(model.config.tema);
      setFormSongUrl(model.config.customSongUrl);
      setFormFotoPerfil(model.config.fotoPerfil);
    }
  };

  const openEditModal = (page: any) => {
    setFormMode('edit');
    setEditingPageId(page.id);
    const dados: LovePageConfig = page.dados;

    setFormTitulo(dados.titulo || '');
    setFormSubtitulo(dados.subtitulo || '');
    setFormDataInicio(dados.dataInicio || '2023-01-01');
    setFormTema(dados.tema || 'sophisticated-dark');
    setFormSongUrl(dados.customSongUrl || '');
    setFormFotoPerfil(dados.fotoPerfil || '/profile_avatar.png');
    setShowFormModal(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLoading(true);
    const actToken = localStorage.getItem('saas_admin_lock') || '';

    // If edit, fetch current full document payload to avoid destroying inner keys not in current modal edit fields (like polaroids array details!)
    let targetConfig: LovePageConfig;

    if (formMode === 'edit' && editingPageId) {
      const origPage = pages.find(p => p.id === editingPageId);
      targetConfig = {
        ...(origPage?.dados || TEMPLATES.romantic.config),
        titulo: formTitulo,
        subtitulo: formSubtitulo,
        dataInicio: formDataInicio,
        tema: formTema,
        customSongUrl: formSongUrl,
        fotoPerfil: formFotoPerfil,
      };
    } else {
      // Build from preset configuration basis to include beautiful structural blocks (polaroids, timeline, postits)
      const basePreset = TEMPLATES[selectedPresetTemplate]?.config || TEMPLATES.romantic.config;
      targetConfig = {
        ...basePreset,
        titulo: formTitulo,
        subtitulo: formSubtitulo,
        dataInicio: formDataInicio,
        tema: formTema,
        customSongUrl: formSongUrl,
        fotoPerfil: formFotoPerfil,
      };
    }

    try {
      if (formMode === 'create') {
        const res = await fetch('/api/criar-pagina', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(targetConfig)
        });
        if (res.ok) {
          setApiMessage({ type: 'success', text: 'Nova página criada com sucesso!' });
          setShowFormModal(false);
          await fetchPages();
        } else {
          throw new Error('Erro ao disparar api de criação.');
        }
      } else {
        // Edit submit PUT
        const res = await fetch('/api/admin/paginas', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': actToken,
          },
          body: JSON.stringify({
            id: editingPageId,
            dados: targetConfig
          })
        });
        if (res.ok) {
          setApiMessage({ type: 'success', text: 'Página editada com sucesso!' });
          setShowFormModal(false);
          await fetchPages();
        } else {
          throw new Error('Erro ao disparar api de atualização.');
        }
      }
    } catch (err) {
      setApiMessage({ type: 'error', text: 'Ops! Ocorreu um erro ao salvar.' });
    } finally {
      setSavingLoading(false);
    }
  };

  const handleCopyLink = (id: string) => {
    const link = `${window.location.origin}/p/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPages = pages.filter(p => {
    const label = `${p.dados?.titulo || ''} ${p.dados?.subtitulo || ''} ${p.id || ''}`.toLowerCase();
    return label.includes(searchQuery.toLowerCase());
  });

  // Login View Wrapper
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-neutral-950 font-sans text-neutral-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient Blur */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#D48C70]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Shield className="w-8 h-8 text-rose-500 fill-rose-500/10" />
            </div>
            <h1 className="text-xl font-bold font-sans tracking-tight text-white mb-1">
              Painel Operacional Admin
            </h1>
            <p className="text-xs text-neutral-400">
              Eternizando histórias românticas de clientes.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-900/90 border border-neutral-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-md"
          >
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                  Passcode Administrativo
                </label>
                <input
                  type="password"
                  placeholder="Insira a chave de liberação..."
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl px-4 py-3 text-sm text-center font-mono placeholder-neutral-600 transition"
                  required
                />
              </div>

              {authError && (
                <p className="text-xs text-red-400 text-center font-medium">
                  ⚠️ {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-rose-900/20 cursor-pointer flex items-center justify-center gap-2"
              >
                Entrar no Painel <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 font-sans text-neutral-100 pb-20">
      {/* Upper Area Header */}
      <header className="border-b border-neutral-800/60 bg-neutral-900/40 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500/10" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">
              SaaS Admin • Nossos Encontros
            </h1>
            <span className="text-[10px] font-mono text-neutral-400 tracking-wider">MODO MANUAL ATIVO</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchPages()}
            className="p-2 border border-neutral-800 bg-neutral-900 rounded-xl hover:bg-neutral-800 text-neutral-300 transition"
            title="Recarregar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogOut}
            className="flex items-center gap-2 px-3.5 py-1.5 border border-neutral-800/80 bg-neutral-900 text-xs font-semibold rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="max-w-6xl mx-auto px-6 pt-8">

        {/* Dynamic Alerts Banner */}
        <AnimatePresence>
          {apiMessage.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-xl border flex items-center justify-between gap-3 text-xs leading-normal ${apiMessage.type === 'error'
                ? 'bg-red-500/10 border-red-500/20 text-red-200'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-250'
                }`}
            >
              <span>{apiMessage.text}</span>
              <button onClick={() => setApiMessage({ type: '', text: '' })} className="font-bold underline cursor-pointer text-[10px] opacity-70">
                Fechar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard KPIs Metric bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-neutral-900/60 border border-neutral-800/60 p-5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Total de Páginas</span>
            <p className="text-3xl font-extrabold text-white mt-1 font-mono">{pages.length}</p>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800/60 p-5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-455">Faturamento Manual Estimado</span>
            <p className="text-3xl font-extrabold text-white mt-1 font-mono">R$ {(pages.length * 19.90).toFixed(2)}</p>
          </div>
          <div className="bg-neutral-900/60 border border-neutral-800/60 p-5 rounded-2xl">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500">Valor de Venda Recomendado</span>
            <p className="text-3xl font-extrabold text-amber-400 mt-1 font-mono">R$ 19,90/und</p>
          </div>
        </div>

        {/* Search controls and Creation Dispatch trigger */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por títulos, subtítulos ou ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-sm bg-neutral-900/80 border border-neutral-800/80 text-xs rounded-xl px-4 py-2.5 focus:border-rose-500 outline-none transition placeholder-neutral-500"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="py-2.5 px-5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Criar Página de Cliente Manualmente
          </button>
        </div>

        {/* Pages Management listing table */}
        <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-3xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center text-neutral-400">
              <RefreshCw className="w-8 h-8 animate-spin text-rose-500 mb-2" />
              <p className="text-xs">Buscando registros...</p>
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="py-20 text-center text-neutral-400 text-xs">
              📂 Nenhuma página de amor cadastrada ainda no banco de dados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 bg-neutral-900/60">
                    <th className="py-3 px-5 font-bold uppercase tracking-wider text-[10px]">Título do Casal</th>
                    <th className="py-3 px-5 font-bold uppercase tracking-wider text-[10px]">Data Especial</th>
                    <th className="py-3 px-5 font-bold uppercase tracking-wider text-[10px]">Tema Selecionado</th>
                    <th className="py-3 px-5 font-bold uppercase tracking-wider text-[10px]">Gerado Em</th>
                    <th className="py-3 px-5 font-bold uppercase tracking-wider text-[10px] text-right">Ações Operacionais</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {filteredPages.map((page) => {
                    const dados: LovePageConfig = page.dados;
                    const formattedDate = dados?.dataInicio
                      ? new Date(dados.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR')
                      : 'Não informada';
                    const creationDateStr = page.criado_em
                      ? new Date(page.criado_em).toLocaleString('pt-BR')
                      : 'N/A';

                    return (
                      <tr key={page.id} className="hover:bg-neutral-900/30 transition">
                        {/* Title and ID link indicator */}
                        <td className="py-4 px-5">
                          <span className="font-bold text-white block text-sm">{dados?.titulo || 'Sem título'}</span>
                          <span className="font-mono text-[9px] text-neutral-500 block mt-0.5">{page.id}</span>
                        </td>

                        {/* Date info */}
                        <td className="py-4 px-5 whitespace-nowrap text-neutral-300">
                          {formattedDate}
                        </td>

                        {/* Theme pill display */}
                        <td className="py-4 px-5 whitespace-nowrap capitalize">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 border border-neutral-700/50 text-neutral-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {dados?.tema?.replace('-', ' ')}
                          </span>
                        </td>

                        {/* Creation details timestamp */}
                        <td className="py-4 px-5 text-neutral-400 whitespace-nowrap font-mono text-[10px]">
                          {creationDateStr}
                        </td>

                        {/* Custom operational management buttons */}
                        <td className="py-4 px-5 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopyLink(page.id)}
                              className={`p-1.5 border border-neutral-800 rounded-lg transition ${copiedId === page.id
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
                                }`}
                              title="Copiar Link Único"
                            >
                              {copiedId === page.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <a
                              href={`/p/${page.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
                              title="Ver Página Pronta"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => openEditModal(page)}
                              className="p-1.5 border border-neutral-800 bg-neutral-900 text-neutral-450 hover:text-white hover:bg-neutral-800 rounded-lg transition"
                              title="Editar Página"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(page.id)}
                              className="p-1.5 border border-rose-950/40 bg-neutral-900 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg transition"
                              title="Excluir Permanentemente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* CREATION AND INLINE EDIT MODAL FOR PREMIUM RELATIONS PAGES */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-800 max-w-2xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8"
            >
              {/* Reset dialog */}
              <button
                onClick={() => setShowFormModal(false)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>

              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5 mb-2">
                <Sparkles className="w-5 h-5 text-rose-500" />
                {formMode === 'create' ? 'Adicionar História de Amor Manualmente' : 'Editar Página de Relacionamento'}
              </h2>
              <p className="text-xs text-neutral-400 mb-6">
                Todos os dados preenchidos serão injetados na estrutura do cliente. Você pode usar um modelo pronto para otimizar.
              </p>

              <form onSubmit={handleSaveForm} className="space-y-4">

                {/* 1. Template Presets Selection for instant fill keys (Only in creation) */}
                {formMode === 'create' && (
                  <div className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-2">
                    <label className="block text-[10px] uppercase font-bold text-neutral-450">
                      Escolher Modelo Temático Pronto (Template)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {Object.keys(TEMPLATES).map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => loadTemplatePreset(key)}
                          className={`px-3 py-2 border rounded-lg text-left text-xs font-semibold leading-tight transition cursor-pointer ${selectedPresetTemplate === key
                            ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                            : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                        >
                          <span className="block font-bold">{TEMPLATES[key].name}</span>
                          <span className="block text-[9px] font-normal text-neutral-500 mt-0.5">{TEMPLATES[key].description.substring(0, 32)}...</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grid inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Pair labels */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1.5">Título do Casal</label>
                    <input
                      type="text"
                      value={formTitulo}
                      onChange={(e) => setFormTitulo(e.target.value)}
                      placeholder="Ex: Pedro & Sofia"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white"
                      required
                    />
                  </div>

                  {/* Special anniversary date calendar */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1.5">Data de Início do Relacionamento</label>
                    <input
                      type="date"
                      value={formDataInicio}
                      onChange={(e) => setFormDataInicio(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white dark:[color-scheme:dark]"
                      required
                    />
                  </div>
                </div>

                {/* Subtitle wording */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1.5">Subtítulo / Slogan de Dedicatória</label>
                  <textarea
                    value={formSubtitulo}
                    onChange={(e) => setFormSubtitulo(e.target.value)}
                    placeholder="Ex: Nossa jornada de sorrisos eternos começou..."
                    rows={2}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white resize-none"
                    required
                  />
                </div>

                {/* Spotify Custom tracking URL sound */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1.5">Link Spotify (Música Compartilhada do Casal)</label>
                  <input
                    type="url"
                    value={formSongUrl}
                    onChange={(e) => setFormSongUrl(e.target.value)}
                    placeholder="Ex: https://open.spotify.com/track/..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white"
                  />
                </div>

                {/* Themes and background tones */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1.5">Esquema de Cores (Tema Visual)</label>
                    <select
                      value={formTema}
                      onChange={(e) => setFormTema(e.target.value as RomanceTheme)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white"
                    >
                      <option value="sophisticated-dark">Sophisticated Dark (Preto, Café & Bronze)</option>
                      <option value="vintage-rose">Vintage Rose (Rústico & Vinho)</option>
                      <option value="pink-blush">Pink Blush (Rosa Marcante & Puro)</option>
                      <option value="sunset-warmth">Sunset Warmth (Gradiente Laranja Sol)</option>
                      <option value="crimson-heart">Crimson Heart (Vermelho Paixão)</option>
                      <option value="cosmic-slate">Cosmic Slate (Roxo das Estrelas)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1.5">Foto de Perfil Principal (Avatar)</label>
                    <select
                      value={formFotoPerfil}
                      onChange={(e) => setFormFotoPerfil(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white"
                    >
                      <option value="/profile_avatar.png">Par Romântico Casados (Cartoon)</option>
                      <option value="/couple_casual.png">Casal com óculos e moletom (Casual)</option>
                      <option value="/couple_red.png">Abraço íntimo vestido vermelho (Romântico)</option>
                      <option value="/couple_white.png">Toque de nariz vestidos de Noivos</option>
                      <option value="/wedding_arch.png">Cena do Casamento na Floresta</option>
                      <option value="/wedding_bouquet.png">Noiva olhando Buquê de Fotos</option>
                    </select>
                  </div>
                </div>

                {/* Submission items */}
                <div className="pt-6 border-t border-neutral-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="py-2.5 px-4 bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-xs font-semibold rounded-xl text-neutral-400 hover:text-white transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingLoading}
                    className="py-2.5 px-6 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow transition duration-200 cursor-pointer flex items-center gap-1.5"
                  >
                    {savingLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    {formMode === 'create' ? 'Gravar e Ativar Link' : 'Salvar Alterações'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
