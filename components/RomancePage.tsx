'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Calendar, Camera, Trash2, Plus, Edit2, Sparkles, Copy, 
  Share2, Volume2, Play, Pause, Clock, Mail, Info, Music, Code, Compass, ArrowRight, RotateCcw
} from 'lucide-react';

// Color themes configuration
export type RomanceTheme = 'pink-blush' | 'vintage-rose' | 'sunset-warmth' | 'crimson-heart' | 'cosmic-slate' | 'sophisticated-dark';

export interface PolaroidData {
  id: string;
  fotoUrl: string;
  legenda: string;
  data: string;
}

export interface TimelineData {
  id: string;
  data: string;
  titulo: string;
  descricao: string;
  fotoUrl?: string;
}

export interface PostItData {
  id: string;
  texto: string;
  cor: 'yellow' | 'pink' | 'blue' | 'purple' | 'green';
  autor: string;
}

export interface LovePageConfig {
  titulo: string;
  subtitulo: string;
  fotoPerfil: string;
  dataInicio: string;  // YYYY-MM-DD
  tema: RomanceTheme;
  customSongUrl: string;
  customSongTitle: string;
  customSongArtist: string;
  polaroids: PolaroidData[];
  linhaDoTempo: TimelineData[];
  postIts: PostItData[];
}

interface RomancePageProps {
  config: LovePageConfig;
  onChange?: (newConfig: LovePageConfig) => void;
  isReadOnly?: boolean;
}

// Romantic preset audio sources
const ROMANTIC_SONGS = [
  {
    title: "Acoustic Warmth & Hope",
    artist: "Acoustic Guitar Preset",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    title: "Soft Piano Serenade",
    artist: "Minimalist Piano Preset",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    title: "Celestial Ambient Sparks",
    artist: "Cosmic Pads Preset",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  }
];

// Helper to extract Spotify Embed URL from share link or URI
const getSpotifyEmbedUrl = (url: string | null): string | null => {
  if (!url) return null;
  const reg = /(?:https?:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?|spotify:)(track|playlist|album|artist)(?:\/|:)([a-zA-Z0-9]+)/i;
  const match = url.match(reg);
  if (match) {
    const type = match[1];
    const id = match[2];
    return `https://open.spotify.com/embed/${type}/${id}`;
  }
  return null;
};

export default function RomancePage({ config, onChange, isReadOnly = false }: RomancePageProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [audioVolume, setAudioVolume] = React.useState(0.5);
  const [activeSongIndex, setActiveSongIndex] = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const spotifyEmbedUrl = getSpotifyEmbedUrl(config.customSongUrl);

  // Time elapsed since relationship start
  const [timeDiffString, setTimeDiffString] = React.useState({
    anos: 0, meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0
  });

  // UI States for inline creators
  const [isEditingHeader, setIsEditingHeader] = React.useState(false);
  const [editedTitle, setEditedTitle] = React.useState(config.titulo);
  const [editedSubtitle, setEditedSubtitle] = React.useState(config.subtitulo);
  const [editedStartDate, setEditedStartDate] = React.useState(config.dataInicio);

  // Polaroid inline append
  const [newPolaroidCaption, setNewPolaroidCaption] = React.useState('');
  const [newPolaroidDate, setNewPolaroidDate] = React.useState('');
  const [newPolaroidBase64, setNewPolaroidBase64] = React.useState('');

  // Timeline snapshot inline append
  const [newTimelineTitle, setNewTimelineTitle] = React.useState('');
  const [newTimelineDate, setNewTimelineDate] = React.useState('');
  const [newTimelineDesc, setNewTimelineDesc] = React.useState('');
  const [newTimelineBase64, setNewTimelineBase64] = React.useState('');

  // Post-it list inline append
  const [newPostItText, setNewPostItText] = React.useState('');
  const [newPostItColor, setNewPostItColor] = React.useState<'yellow' | 'pink' | 'blue' | 'purple' | 'green'>('yellow');
  const [newPostItAuthor, setNewPostItAuthor] = React.useState('');

  // AI assistant helper
  const [isGeneratingMessage, setIsGeneratingMessage] = React.useState(false);
  const [aiSelectedType, setAiSelectedType] = React.useState('poema');
  const [aiTone, setAiTone] = React.useState('apaixonado');
  const [aiMemories, setAiMemories] = React.useState('');
  const [aiError, setAiError] = React.useState('');

  const updateConfig = (patchedFields: Partial<LovePageConfig>) => {
    if (onChange) {
      onChange({ ...config, ...patchedFields });
    }
  };

  // Keep internal states in sync with config changes
  React.useEffect(() => {
    setTimeout(() => {
      setEditedTitle(config.titulo);
      setEditedSubtitle(config.subtitulo);
      setEditedStartDate(config.dataInicio);
    }, 0);
  }, [config.titulo, config.subtitulo, config.dataInicio]);

  // Audio Playback Engine synced safely
  React.useEffect(() => {
    const isSpotify = config.customSongUrl && (config.customSongUrl.includes('spotify.com') || config.customSongUrl.startsWith('spotify:'));
    
    if (isSpotify) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    const currentUrl = config.customSongUrl || ROMANTIC_SONGS[activeSongIndex].url;
    audioRef.current = new Audio(currentUrl);
    audioRef.current.loop = true;
    audioRef.current.volume = audioVolume;

    if (isPlaying) {
      audioRef.current.play().catch(e => console.log("User interaction required for autoplay:", e));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [config.customSongUrl, activeSongIndex, isPlaying, audioVolume]);

  React.useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log(e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
    }
  }, [audioVolume]);

  // Chronometer Engine
  React.useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const start = new Date(config.dataInicio + 'T00:00:00');
      if (isNaN(start.getTime())) return;

      const diffMs = now.getTime() - start.getTime();
      if (diffMs < 0) {
        setTimeDiffString({ anos: 0, meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0 });
        return;
      }

      // Exact values
      const segundos = Math.floor((diffMs / 1000) % 60);
      const minutos = Math.floor((diffMs / (1000 * 60)) % 60);
      const horas = Math.floor((diffMs / (1000 * 60 * 60)) % 24);

      // Rough year/month/day conversion mapping
      const diffDaysTotal = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const anos = Math.floor(diffDaysTotal / 365);
      const meses = Math.floor((diffDaysTotal % 365) / 30);
      const dias = Math.floor((diffDaysTotal % 365) % 30);

      setTimeDiffString({ anos, meses, dias, horas, minutos, segundos });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [config.dataInicio]);

  // Color theme mapper
  const getThemeClasses = () => {
    switch (config.tema) {
      case 'pink-blush':
        return {
          bg: 'bg-gradient-to-br from-rose-50 to-pink-100/50',
          text: 'text-rose-900',
          textMuted: 'text-rose-700/80',
          card: 'bg-white/80 border-pink-100 shadow-rose-100/20',
          accent: 'bg-rose-500 hover:bg-rose-600',
          textColorAccent: 'text-rose-500',
          accentBorder: 'border-rose-400',
          gradientText: 'from-pink-600 to-rose-600',
          pill: 'bg-rose-50 text-rose-600',
          postit: {
            yellow: 'bg-amber-100 text-amber-900 border-amber-200',
            pink: 'bg-rose-100 text-rose-900 border-rose-200',
            blue: 'bg-sky-100 text-sky-900 border-sky-200',
            purple: 'bg-purple-100 text-purple-900 border-purple-200',
            green: 'bg-emerald-100 text-emerald-950 border-emerald-200',
          }
        };
      case 'vintage-rose':
        return {
          bg: 'bg-gradient-to-br from-stone-50 to-amber-50/30',
          text: 'text-stone-800',
          textMuted: 'text-stone-600',
          card: 'bg-amber-50/70 border-amber-100/50 shadow-amber-900/5',
          accent: 'bg-amber-700 hover:bg-amber-800',
          textColorAccent: 'text-amber-700',
          accentBorder: 'border-amber-600',
          gradientText: 'from-amber-800 to-stone-700',
          pill: 'bg-amber-100/50 text-amber-800',
          postit: {
            yellow: 'bg-yellow-100/90 text-yellow-950 border-yellow-200',
            pink: 'bg-red-100/90 text-red-950 border-red-200',
            blue: 'bg-teal-100/90 text-teal-950 border-teal-200',
            purple: 'bg-slate-100/90 text-slate-950 border-slate-200',
            green: 'bg-stone-100 text-stone-900 border-stone-200',
          }
        };
      case 'sunset-warmth':
        return {
          bg: 'bg-gradient-to-br from-amber-50 to-orange-100/40',
          text: 'text-amber-950',
          textMuted: 'text-amber-800/80',
          card: 'bg-white/90 border-orange-100/60 shadow-orange-900/5',
          accent: 'bg-orange-500 hover:bg-orange-600',
          textColorAccent: 'text-orange-600',
          accentBorder: 'border-orange-400',
          gradientText: 'from-amber-600 to-orange-600',
          pill: 'bg-orange-50 text-orange-600',
          postit: {
            yellow: 'bg-amber-100 text-amber-900 border-amber-200',
            pink: 'bg-orange-100 text-orange-900 border-orange-200',
            blue: 'bg-cyan-100 text-cyan-900 border-cyan-200',
            purple: 'bg-violet-100 text-violet-900 border-violet-200',
            green: 'bg-green-100 text-green-950 border-green-200',
          }
        };
      case 'crimson-heart':
        return {
          bg: 'bg-gradient-to-br from-red-50 to-stone-100',
          text: 'text-red-950',
          textMuted: 'text-stone-700',
          card: 'bg-white border-red-100 shadow-red-900/5',
          accent: 'bg-rose-700 hover:bg-rose-800',
          textColorAccent: 'text-rose-700',
          accentBorder: 'border-rose-700',
          gradientText: 'from-red-700 to-rose-900',
          pill: 'bg-red-50 text-red-700',
          postit: {
            yellow: 'bg-yellow-50 text-yellow-900 border-yellow-200',
            pink: 'bg-red-50 text-red-900 border-red-200',
            blue: 'bg-blue-50 text-blue-900 border-blue-200',
            purple: 'bg-purple-50 text-purple-900 border-purple-200',
            green: 'bg-emerald-50 text-emerald-950 border-emerald-200',
          }
        };
      case 'cosmic-slate':
        return {
          bg: 'bg-gradient-to-br from-slate-900 via-indigo-955 to-slate-950 text-slate-100',
          text: 'text-slate-100',
          textMuted: 'text-slate-400',
          card: 'bg-slate-800/85 border-slate-700/50 shadow-slate-950/40 shadow-xl',
          accent: 'bg-violet-600 hover:bg-violet-700',
          textColorAccent: 'text-violet-400',
          accentBorder: 'border-violet-500',
          gradientText: 'from-violet-400 to-fuchsia-400',
          pill: 'bg-violet-950/50 text-violet-400 border border-violet-800/40',
          postit: {
            yellow: 'bg-amber-900/90 text-amber-100 border-amber-800/50',
            pink: 'bg-rose-950/90 text-rose-100 border-rose-900/50',
            blue: 'bg-indigo-950/90 text-indigo-100 border-indigo-900/50',
            purple: 'bg-purple-950/90 text-purple-100 border-purple-900/50',
            green: 'bg-emerald-950/90 text-emerald-100 border-emerald-900/50',
          }
        };
      case 'sophisticated-dark':
        return {
          bg: 'bg-[#0F0A0A] text-[#EAD7D1]',
          text: 'text-[#EAD7D1]',
          textMuted: 'text-[#EAD7D1]/70',
          card: 'bg-[#150F0F] border-[#2A1E1E] shadow-[#D48C70]/5 shadow-2xl',
          accent: 'bg-[#D48C70] hover:bg-[#E2A68E] text-[#0F0A0A] font-bold shadow-[0_0_8px_#D48C70]',
          textColorAccent: 'text-[#D48C70]',
          accentBorder: 'border-[#D48C70]',
          gradientText: 'from-[#FFFFFF] via-[#EAD7D1] to-[#D48C70]',
          pill: 'bg-[#251B1B] text-[#D48C70] border border-[#2A1E1E]',
          postit: {
            yellow: 'bg-[#1A1313] text-[#EAD7D1] border-[#2A1E1E] shadow-[0_0_12px_rgba(212,140,112,0.1)] border-t-2 border-t-amber-500',
            pink: 'bg-[#1A1313] text-[#EAD7D1] border-[#2A1E1E] shadow-[0_0_12px_rgba(212,140,112,0.1)] border-t-2 border-t-pink-500',
            blue: 'bg-[#1A1313] text-[#EAD7D1] border-[#2A1E1E] shadow-[0_0_12px_rgba(212,140,112,0.1)] border-t-2 border-t-sky-500',
            purple: 'bg-[#1A1313] text-[#EAD7D1] border-[#2A1E1E] shadow-[0_0_12px_rgba(212,140,112,0.1)] border-t-2 border-t-violet-500',
            green: 'bg-[#1A1313] text-[#EAD7D1] border-[#2A1E1E] shadow-[0_0_12px_rgba(212,140,112,0.1)] border-t-2 border-t-emerald-500',
          }
        };
    }
  };

  const currentTheme = getThemeClasses();

  // Handle local picture convert to base64 helper with compression
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Oops! A foto deve possuir um tamanho menor que 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress into a very lightweight JPEG format to avoid Firestore 1MB limits
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          setter(compressedBase64);
        } else {
          // Fallback just in case
          if (typeof event.target?.result === 'string') {
            setter(event.target.result);
          }
        }
      };
      
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  // Add polaroid to state
  const handleAddPolaroid = () => {
    if (!newPolaroidBase64) {
      alert("Por favor, selecione uma foto para a Polaroid.");
      return;
    }
    const card: PolaroidData = {
      id: Math.random().toString(36).substring(2, 9),
      fotoUrl: newPolaroidBase64,
      legenda: newPolaroidCaption || 'Sem legenda',
      data: newPolaroidDate || new Date().getFullYear().toString()
    };
    updateConfig({
      polaroids: [card, ...config.polaroids]
    });
    setNewPolaroidBase64('');
    setNewPolaroidCaption('');
    setNewPolaroidDate('');
  };

  // Remove polaroid
  const handleRemovePolaroid = (id: string) => {
    updateConfig({
      polaroids: config.polaroids.filter(item => item.id !== id)
    });
  };

  // Add timeline element
  const handleAddTimeline = () => {
    if (!newTimelineTitle || !newTimelineDate) {
      alert("Preencha ao menos o Título e a Data do marco.");
      return;
    }
    const element: TimelineData = {
      id: Math.random().toString(36).substring(2, 9),
      data: newTimelineDate,
      titulo: newTimelineTitle,
      descricao: newTimelineDesc,
      fotoUrl: newTimelineBase64 || undefined
    };
    updateConfig({
      linhaDoTempo: [...config.linhaDoTempo, element]
    });
    setNewTimelineTitle('');
    setNewTimelineDate('');
    setNewTimelineDesc('');
    setNewTimelineBase64('');
  };

  // Remove timeline element
  const handleRemoveTimeline = (id: string) => {
    updateConfig({
      linhaDoTempo: config.linhaDoTempo.filter(item => item.id !== id)
    });
  };

  // Add postit note
  const handleAddPostIt = () => {
    if (!newPostItText) {
      alert("Sua cartinha não pode estar em branco.");
      return;
    }
    const note: PostItData = {
      id: Math.random().toString(36).substring(2, 9),
      texto: newPostItText,
      cor: newPostItColor,
      autor: newPostItAuthor || 'Seu amor'
    };
    updateConfig({
      postIts: [note, ...config.postIts]
    });
    setNewPostItText('');
    setNewPostItAuthor('');
  };

  // Remove postit note
  const handleRemovePostIt = (id: string) => {
    updateConfig({
      postIts: config.postIts.filter(item => item.id !== id)
    });
  };

  // AI Generator Call
  const handleGenerateAiMessage = async () => {
    setIsGeneratingMessage(true);
    setAiError('');
    try {
      const response = await fetch('/api/gemini/romantic-helper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageType: aiSelectedType,
          tone: aiTone,
          partnerName: editedTitle.split('&')[1]?.trim() || '',
          userName: editedTitle.split('&')[0]?.trim() || '',
          memories: aiMemories
        })
      });

      const data = await response.json();
      if (data.text) {
        setNewPostItText(data.text);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (e: any) {
      setAiError('Ops, tivemos dificuldade para canalizar seus sentimentos românticos com a IA. Digite manualmente ou tente de novo!');
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  return (
    <div className={`min-h-screen pb-24 transition-colors duration-500 font-sans ${currentTheme.bg}`}>
      {/* Cover Decorative Star Field */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-10 left-1/4 w-2 h-2 bg-yellow-200 rounded-full animate-ping" />
        <div className="absolute top-28 left-2/3 w-3 h-3 bg-red-200 rounded-full animate-pulse" />
        <div className="absolute top-80 right-10 w-1.5 h-1.5 bg-blue-100 rounded-full animate-ping" />
        <div className="absolute top-96 left-12 w-2 h-2 bg-pink-300 rounded-full animate-pulse" />
      </div>

      {/* Main Container */}
      <div className={`max-w-4xl mx-auto px-4 pt-10 relative z-10 ${currentTheme.text}`}>
        
        {/* EDIT COMPONENT PANEL BANNER */}
        {!isReadOnly && (
          <div className={`mb-8 p-4 rounded-2xl border backdrop-blur-md shadow-lg text-sm flex flex-wrap items-center justify-between gap-4 transition-all ${
            config.tema === 'sophisticated-dark' 
              ? 'bg-[#150F0F]/90 border-[#2A1E1E] text-[#EAD7D1]' 
              : 'bg-white/70 border-pink-100 text-slate-800'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`p-2 rounded-lg transition-colors ${
                config.tema === 'sophisticated-dark' ? 'bg-[#251B1B] text-[#D48C70]' : 'bg-rose-100 text-rose-600'
              }`}>✨</span>
              <div>
                <p className={`font-semibold ${config.tema === 'sophisticated-dark' ? 'text-white' : 'text-rose-950'}`}>Seu Cantinho de Amor em Edição</p>
                <p className="text-xs text-slate-500">Personalize abaixo e depois clique em Criar Página permanente!</p>
              </div>
            </div>
            
            {/* Theme Selector */}
            <div className="flex items-center gap-2">
              <span className="font-medium text-xs">Paleta de Cores:</span>
              <div className="flex gap-1.5">
                {(['pink-blush', 'vintage-rose', 'sunset-warmth', 'crimson-heart', 'cosmic-slate', 'sophisticated-dark'] as RomanceTheme[]).map(t => (
                  <button
                    key={t}
                    title={t.replace('-', ' ')}
                    onClick={() => updateConfig({ tema: t })}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      config.tema === t ? 'scale-110 shadow-md ring-2 ring-rose-300' : 'opacity-80'
                    }`}
                    style={{
                      backgroundColor: 
                        t === 'pink-blush' ? '#ec4899' :
                        t === 'vintage-rose' ? '#b45309' :
                        t === 'sunset-warmth' ? '#f97316' :
                        t === 'crimson-heart' ? '#be123c' :
                        t === 'cosmic-slate' ? '#4f46e5' : '#D48C70'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ROMANTIC PROFILE HERO HEADER */}
        <div className="text-center pt-8 pb-12 relative">
          
          {/* Couple portrait circle */}
          <div className="relative inline-block mb-6">
            <div className="w-36 h-36 rounded-full relative z-10 overflow-hidden border-4 border-white shadow-xl bg-pink-100/50 flex items-center justify-center">
              {config.fotoPerfil ? (
                <img src={config.fotoPerfil} alt="Couple portrait" className="w-full h-full object-cover" />
              ) : (
                <Heart className="w-16 h-16 text-rose-400 animate-pulse" />
              )}
              
              {/* Profile Upload inside editor */}
              {!isReadOnly && (
                <label className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 cursor-pointer flex flex-col items-center justify-center text-white text-xs transition-opacity duration-300 z-20">
                  <Camera className="w-6 h-6 mb-1 text-pink-200" />
                  Trocar Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, (base64) => updateConfig({ fotoPerfil: base64 }))}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            {/* Spinning heart background halo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full border border-dashed border-rose-400/40 animate-[spin_40s_linear_infinite]" />
            <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-md z-20 hover:scale-115 transition-transform duration-300">
              ❤️
            </div>
          </div>

          {/* Interactive Title & Subtitle block */}
          {isEditingHeader ? (
            <div className={`max-w-md mx-auto p-4 rounded-xl border shadow-md space-y-3 z-30 transition-all ${
              config.tema === 'sophisticated-dark' 
                ? 'bg-[#150F0F]/95 border-[#2A1E1E] text-[#EAD7D1]' 
                : 'bg-white/90 border-pink-100 text-slate-800'
            }`}>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${config.tema === 'sophisticated-dark' ? 'text-[#EAD7D1]/60' : 'text-slate-500'}`}>Nossos Nomes</label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-rose-400 ${
                    config.tema === 'sophisticated-dark' 
                      ? 'bg-[#251B1B] border-[#2A1E1E] text-white focus:outline-[#D48C70]' 
                      : 'bg-white border-gray-200'
                  }`}
                  placeholder="Ex: Nome Dele & Nome Dela"
                />
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1 ${config.tema === 'sophisticated-dark' ? 'text-[#EAD7D1]/60' : 'text-slate-500'}`}>Subtítulo Romântico</label>
                <input
                  type="text"
                  value={editedSubtitle}
                  onChange={(e) => setEditedSubtitle(e.target.value)}
                  className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-rose-400 ${
                    config.tema === 'sophisticated-dark' 
                      ? 'bg-[#251B1B] border-[#2A1E1E] text-white focus:outline-[#D48C70]' 
                      : 'bg-white border-gray-200'
                  }`}
                  placeholder="Ex: Eternizando nosso amor..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${config.tema === 'sophisticated-dark' ? 'text-[#EAD7D1]/60' : 'text-slate-500'}`}>Data de Início</label>
                  <input
                    type="date"
                    value={editedStartDate}
                    onChange={(e) => setEditedStartDate(e.target.value)}
                    className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-rose-400 ${
                      config.tema === 'sophisticated-dark' 
                        ? 'bg-[#251B1B] border-[#2A1E1E] text-white focus:outline-[#D48C70]' 
                        : 'bg-white border-gray-200'
                    }`}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      updateConfig({
                        titulo: editedTitle,
                        subtitulo: editedSubtitle,
                        dataInicio: editedStartDate
                      });
                      setIsEditingHeader(false);
                    }}
                    className={`w-full py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      config.tema === 'sophisticated-dark' 
                        ? 'bg-[#D48C70] hover:bg-[#E2A68E] text-[#0F0A0A]' 
                        : 'bg-rose-500 hover:bg-rose-600 text-white'
                    }`}
                  >
                    Salvar Dados
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <h1 className="text-4xl md:text-5xl font-sans font-bold tracking-tight mb-2">
                <span className={`bg-gradient-to-r bg-clip-text text-transparent ${currentTheme.gradientText}`}>
                  {config.titulo}
                </span>
              </h1>
              <p className={`text-base font-light md:text-lg max-w-xl mx-auto italic mb-4 ${currentTheme.textMuted}`}>
                &ldquo;{config.subtitulo}&rdquo;
              </p>
              
              {!isReadOnly && (
                <button
                  onClick={() => setIsEditingHeader(true)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium cursor-pointer transition hover:scale-105 ${
                    config.tema === 'sophisticated-dark' 
                      ? 'bg-[#150F0F]/80 hover:bg-[#1A1313] text-[#D48C70] border-[#2A1E1E]' 
                      : 'bg-white/70 hover:bg-white text-rose-600 border'
                  }`}
                >
                  <Edit2 className="w-3 h-3" /> Editar Título e Data
                </button>
              )}
            </div>
          )}
        </div>

        {/* COMPACT GOLD relationship SCOREBOARD (CHRONOMETER CARD) */}
        <div className={`p-6 rounded-3xl border mb-12 shadow-md ${currentTheme.card} text-center relative overflowing-hidden`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
          <h3 className="text-xs uppercase tracking-widest font-sans font-semibold opacity-70 mb-4 flex items-center justify-center gap-1">
            <Clock className={`w-4 h-4 animate-spin ${config.tema === 'sophisticated-dark' ? 'text-[#D48C70]' : 'text-rose-500'}`} /> Nosso Contador de Amor
          </h3>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { label: 'Anos', val: timeDiffString.anos },
              { label: 'Meses', val: timeDiffString.meses },
              { label: 'Dias', val: timeDiffString.dias },
              { label: 'Horas', val: timeDiffString.horas },
              { label: 'Minutos', val: timeDiffString.minutos },
              { label: 'Segundos', val: timeDiffString.segundos },
            ].map(item => (
              <div key={item.label} className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                config.tema === 'sophisticated-dark' 
                  ? 'bg-[#251B1B] border-[#2A1E1E]' 
                  : 'bg-white/50 border-pink-100/50'
              }`}>
                <span className={`text-2xl md:text-3xl font-bold font-mono tracking-tight leading-none mb-1 ${
                  config.tema === 'sophisticated-dark' 
                    ? 'text-[#D48C70] drop-shadow-[0_0_6px_rgba(212,140,112,0.3)]' 
                    : 'text-rose-600'
                }`}>
                  {String(item.val).padStart(2, '0')}
                </span>
                <span className="text-[10px] uppercase font-sans tracking-wider opacity-60 font-semibold">{item.label}</span>
              </div>
            ))}
          </div>

          <p className="text-xs mt-4 italic opacity-80">
            Cada segundo ao seu lado é uma eternidade de felicidade ✨
          </p>
        </div>

        {/* CASSETTE TAPE ROMANTIC MUSIC PLAYER */}
        <div id="music-player-container" className={`p-4 sm:p-6 rounded-3xl border mb-8 sm:mb-12 shadow-md ${currentTheme.card} transition-all duration-300`}>
          {spotifyEmbedUrl ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5 ml-1">
                    <Music className="w-4 h-4" /> Prévia do Spotify Conectada
                  </span>
                </div>
              </div>

              {/* Dynamic Responsive Spotify Player Embed */}
              <div className="rounded-2xl overflow-hidden border border-emerald-500/15 shadow-xl bg-black/10">
                <iframe
                  style={{ borderRadius: '12px' }}
                  src={spotifyEmbedUrl}
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="w-full h-[80px] sm:h-[152px] transition-all duration-300"
                />
              </div>

              {/* Dynamic instruction or editor widget inside */}
              {!isReadOnly && (
                <div className="space-y-2 p-3.5 bg-stone-500/5 rounded-xl border border-dashed border-stone-700/20">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Mudar o link do Spotify:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className={`w-full px-2.5 py-1.5 text-xs border rounded-lg transition-all ${
                        config.tema === 'sophisticated-dark' 
                          ? 'bg-[#251B1B] border-[#2A1E1E] text-white focus:outline-[#D48C70]' 
                          : 'bg-white border-gray-200 focus:outline-rose-400'
                      }`}
                      placeholder="Cole novo link do Spotify..."
                      value={config.customSongUrl || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const isSpot = val.includes('spotify.com') || val.startsWith('spotify:');
                        updateConfig({
                          customSongUrl: val,
                          customSongTitle: isSpot ? 'Música Integrada do Spotify' : 'Nossa Melodia Customizada',
                          customSongArtist: isSpot ? 'Player Conectado' : 'Nosso par de amor'
                        });
                      }}
                    />
                    <button
                      onClick={() => {
                        updateConfig({
                          customSongUrl: '',
                          customSongTitle: ROMANTIC_SONGS[0].title,
                          customSongArtist: ROMANTIC_SONGS[0].artist
                        });
                        setActiveSongIndex(0);
                      }}
                      className="px-3 py-1.5 bg-red-500 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold cursor-pointer transition flex-shrink-0"
                    >
                      Remover
                    </button>
                  </div>
                  <span className="text-[9px] text-slate-400 block leading-normal">
                    💡 Basta abrir o Spotify, selecionar a música, álbum ou playlist de vocês, clicar em <strong>Compartilhar &gt; Copiar Link</strong> e colar no campo acima!
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6">
              
              {/* Spinning Cassette Cassida */}
              <div className="relative w-44 h-28 bg-stone-800 rounded-xl border-4 border-stone-700 shadow-md p-2 flex flex-col justify-between overflow-hidden">
                {/* cassette face line decor */}
                <div className="w-full h-1 bg-stone-700 rounded-full" />
                
                {/* Tape Window and Spinning Spools */}
                <div className="h-10 bg-stone-900 border-2 border-stone-700 rounded-md p-1 flex justify-around items-center">
                  <div className={`w-8 h-8 rounded-full border-4 border-double border-stone-600 flex items-center justify-center ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
                    <div className="w-2 h-2 bg-stone-500 rounded-full" />
                  </div>
                  {/* Simulated ribbon level */}
                  <div className="w-14 h-4 bg-amber-900/40 relative overflow-hidden rounded-sm flex items-center justify-center">
                    <div className="w-8 h-1 bg-amber-500/80 rounded-full animate-pulse" />
                  </div>
                  <div className={`w-8 h-8 rounded-full border-4 border-double border-stone-600 flex items-center justify-center ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
                    <div className="w-2 h-2 bg-stone-500 rounded-full" />
                  </div>
                </div>

                {/* Casette Label */}
                <div className="w-full bg-amber-50 text-[9px] text-stone-900 font-mono py-0.5 px-2 rounded-sm truncate text-center font-bold">
                  {config.customSongTitle || ROMANTIC_SONGS[activeSongIndex].title}
                </div>
              </div>

              {/* casette player controls */}
              <div className="flex-1 space-y-3 text-center md:text-left">
                <div>
                  <span className="text-[10px] uppercase font-sans tracking-wider opacity-60 font-bold block mb-1">Tocando Nossa Melodia</span>
                  <h4 className="text-lg font-bold truncate">
                    {config.customSongTitle || ROMANTIC_SONGS[activeSongIndex].title}
                  </h4>
                  <p className="text-xs opacity-75 truncate">
                    {config.customSongArtist || ROMANTIC_SONGS[activeSongIndex].artist}
                  </p>
                </div>

                {/* Music preseter or custom builder */}
                {!isReadOnly && (
                  <div className="space-y-1.5 p-2 bg-stone-500/5 rounded-xl border border-dashed border-stone-700/20">
                    <p className="text-[10px] font-semibold text-slate-500">Mudar Melodia Original:</p>
                    <div className="grid grid-cols-3 gap-1">
                      {ROMANTIC_SONGS.map((song, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveSongIndex(idx);
                            updateConfig({
                              customSongUrl: song.url,
                              customSongTitle: song.title,
                              customSongArtist: song.artist
                            });
                          }}
                          className={`px-1.5 py-1 text-[9px] rounded-lg border font-medium truncate ${
                            activeSongIndex === idx && !config.customSongUrl ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          {song.title}
                        </button>
                      ))}
                    </div>

                    {/* Custom Spotify track URL option */}
                    <div className="pt-2">
                      <label className="block text-[9px] font-semibold text-slate-400">Ou cole link do Spotify / link mp3 direto:</label>
                      <input
                        type="text"
                        className="w-full mt-1 px-2 py-1 text-xs border rounded-lg focus:outline-rose-400 bg-white text-slate-800"
                        placeholder="Ex: https://open.spotify.com/track/..."
                        value={config.customSongUrl || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const isSpot = val.includes('spotify.com') || val.startsWith('spotify:');
                          updateConfig({
                            customSongUrl: val,
                            customSongTitle: isSpot ? 'Música Integrada do Spotify' : 'Nossa Melodia Customizada',
                            customSongArtist: isSpot ? 'Player Conectado' : 'Nosso par de amor'
                          });
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Player action tray */}
                <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow transition transform hover:scale-105 cursor-pointer ${currentTheme.accent}`}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                  </button>

                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 opacity-70" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={audioVolume}
                      onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                      className="w-20 md:w-28 h-1 accent-rose-500 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* POLAROIDS ALBUM MEMORIES ROW */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-sans flex items-center gap-2">
              <Camera className={`w-5 h-5 ${config.tema === 'sophisticated-dark' ? 'text-[#D48C70]' : 'text-rose-500'}`} /> Nossas Fotos Polaroides
            </h2>
            
            {/* Polaroid count count */}
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              config.tema === 'sophisticated-dark' ? 'bg-[#251B1B] text-[#D48C70] border border-[#2A1E1E]' : 'bg-rose-100 text-rose-600'
            }`}>
              {config.polaroids.length} Memorias
            </span>
          </div>

          {/* Add Polaroid inside editor */}
          {!isReadOnly && (
            <div className={`mb-8 p-5 border rounded-2xl backdrop-blur-md shadow-md space-y-4 transition-all ${
              config.tema === 'sophisticated-dark' 
                ? 'bg-[#150F0F]/90 border-[#2A1E1E] text-[#EAD7D1]' 
                : 'bg-white/80 border-pink-100 text-slate-800'
            }`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider ${config.tema === 'sophisticated-dark' ? 'text-[#D48C70]' : 'text-rose-600'}`}>📸 Pendurar Nova Polaroid no Painel</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Photo Drag selection area */}
                <div className={`border border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center relative h-36 ${
                  config.tema === 'sophisticated-dark' ? 'border-[#2A1E1E] bg-[#251B1B]' : 'border-rose-300 bg-rose-50/20'
                }`}>
                  {newPolaroidBase64 ? (
                    <div className="relative w-full h-full">
                      <img src={newPolaroidBase64} alt="Pre-upload Polaroid" className="w-full h-full object-cover rounded-lg" />
                      <button 
                        onClick={() => setNewPolaroidBase64('')}
                        className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Camera className={`w-8 h-8 mb-1 ${config.tema === 'sophisticated-dark' ? 'text-[#D48C70]/70' : 'text-rose-400'}`} />
                      <span className={`text-xs select-none font-medium mb-1 ${config.tema === 'sophisticated-dark' ? 'text-[#EAD7D1]' : 'text-rose-955'}`}>Carregar Imagem</span>
                      <span className="text-[9px] text-slate-400">Formatos JPG, PNG - Até 10MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => handlePhotoUpload(e, setNewPolaroidBase64)}
                      />
                    </>
                  )}
                </div>

                <div className="space-y-3 md:col-span-2">
                  <div>
                    <label className={`block text-[10px] font-semibold mb-1 ${config.tema === 'sophisticated-dark' ? 'text-[#EAD7D1]/60' : 'text-slate-500'}`}>Legenda Romântica</label>
                    <input
                      type="text"
                      className={`w-full px-3 py-1.5 text-xs border rounded-lg ${
                        config.tema === 'sophisticated-dark' 
                          ? 'bg-[#251B1B] border-[#2A1E1E] text-white focus:outline-[#D48C70]' 
                          : 'bg-white border-gray-200 focus:outline-rose-400'
                      }`}
                      placeholder="Ex: Piquenique sob a luz do luar 🌙"
                      value={newPolaroidCaption}
                      onChange={(e) => setNewPolaroidCaption(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={`block text-[10px] font-semibold mb-1 ${config.tema === 'sophisticated-dark' ? 'text-[#EAD7D1]/60' : 'text-slate-500'}`}>Ano / Data</label>
                      <input
                        type="text"
                        className={`w-full px-3 py-1.5 text-xs border rounded-lg ${
                          config.tema === 'sophisticated-dark' 
                            ? 'bg-[#251B1B] border-[#2A1E1E] text-white focus:outline-[#D48C70]' 
                            : 'bg-white border-gray-200 focus:outline-rose-400'
                        }`}
                        placeholder="Ex: Janeiro, 2021"
                        value={newPolaroidDate}
                        onChange={(e) => setNewPolaroidDate(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleAddPolaroid}
                        className={`w-full py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                          config.tema === 'sophisticated-dark' 
                            ? 'bg-[#D48C70] hover:bg-[#E2A68E] text-[#0F0A0A]' 
                            : 'bg-rose-500 hover:bg-rose-600 text-white'
                        }`}
                      >
                        Pendurar Polaroid
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Polaroids Mosaic Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <AnimatePresence initial={false}>
              {config.polaroids.map((card, idx) => {
                // Apply subtle rotation values for physical print layout look!
                const rotation = [2, -2, 1, -1, 3, -3][idx % 6];
                return (
                  <motion.div
                    key={card.id || idx}
                    initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                    animate={{ opacity: 1, scale: 1, rotate: rotation }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.03, rotate: 0 }}
                    className={`p-4 shadow-2xl rounded-sm w-full mx-auto relative group flex flex-col h-80 border transition-all ${
                      config.tema === 'sophisticated-dark' 
                        ? 'bg-[#150F0F] border-[#2A1E1E] text-[#EAD7D1] shadow-[#D48C70]/5' 
                        : 'bg-white border-slate-100 text-slate-800'
                    }`}
                  >
                    {/* Polaroid simulated snapshot clip */}
                    <div className={`flex-1 overflow-hidden relative border rounded-sm ${
                      config.tema === 'sophisticated-dark' ? 'bg-[#251B1B] border-[#2A1E1E]' : 'bg-stone-100 border-gray-100'
                    }`}>
                      <img src={card.fotoUrl} alt={card.legenda} className="w-full h-full object-cover select-none" />
                    </div>

                    {/* Polaroid paper margin label */}
                    <div className={`pt-4 pb-2 text-center flex flex-col justify-center select-none font-mono transition-all ${
                      config.tema === 'sophisticated-dark' ? 'text-[#EAD7D1]/90' : 'text-slate-800'
                    }`}>
                      <p className="text-sm font-semibold tracking-tight leading-tight truncate px-1">
                        {card.legenda}
                      </p>
                      <span className={`text-[10px] mt-1 transition-all ${
                        config.tema === 'sophisticated-dark' ? 'text-[#D48C70]/70' : 'text-slate-400'
                      }`}>{card.data}</span>
                    </div>

                    {/* Polaroid deletion button inside editor */}
                    {!isReadOnly && (
                      <button
                        onClick={() => handleRemovePolaroid(card.id)}
                        className="absolute top-2 right-2 p-2 bg-red-500/80 md:bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md flex md:hidden group-hover:flex transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* LOVE STORY TIMELINE SNAPSHOT SECTION */}
        <div className="mb-16">
          <h2 className="text-xl font-bold font-sans flex items-center gap-2 mb-6">
            <Calendar className={`w-5 h-5 ${config.tema === 'sophisticated-dark' ? 'text-[#D48C70]' : 'text-rose-500'}`} /> Nossa Linha do Tempo
          </h2>

          {/* Add Milestone inside editor */}
          {!isReadOnly && (
            <div className={`mb-8 p-5 border rounded-2xl backdrop-blur-md shadow-md space-y-4 transition-all ${
              config.tema === 'sophisticated-dark' 
                ? 'bg-[#150F0F]/90 border-[#2A1E1E] text-[#EAD7D1]' 
                : 'bg-white/80 border-pink-100 text-slate-800'
            }`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider ${config.tema === 'sophisticated-dark' ? 'text-[#D48C70]' : 'text-rose-600'}`}>📌 Adicionar Marco Histórico</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className={`block text-[10px] font-semibold mb-1 ${config.tema === 'sophisticated-dark' ? 'text-[#EAD7D1]/60' : 'text-slate-500'}`}>Título do Evento</label>
                    <input
                      type="text"
                      className={`w-full px-3 py-1.5 text-xs border rounded-lg ${
                        config.tema === 'sophisticated-dark' 
                          ? 'bg-[#251B1B] border-[#2A1E1E] text-white focus:outline-[#D48C70]' 
                          : 'bg-white border-gray-200 focus:outline-rose-400'
                      }`}
                      placeholder="Ex: O Primeiro Encontro / O Pedido de Namoro"
                      value={newTimelineTitle}
                      onChange={(e) => setNewTimelineTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-semibold mb-1 ${config.tema === 'sophisticated-dark' ? 'text-[#EAD7D1]/60' : 'text-slate-500'}`}>Data / Período Coerente</label>
                    <input
                      type="text"
                      className={`w-full px-3 py-1.5 text-xs border rounded-lg ${
                        config.tema === 'sophisticated-dark' 
                          ? 'bg-[#251B1B] border-[#2A1E1E] text-white focus:outline-[#D48C70]' 
                          : 'bg-white border-gray-200 focus:outline-rose-400'
                      }`}
                      placeholder="Ex: 12 de Março, 2021"
                      value={newTimelineDate}
                      onChange={(e) => setNewTimelineDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-semibold mb-1 ${config.tema === 'sophisticated-dark' ? 'text-[#EAD7D1]/60' : 'text-slate-500'}`}>O que aconteceu? (Descrição curta)</label>
                    <textarea
                      rows={2}
                      className={`w-full px-3 py-1.5 text-xs border rounded-lg ${
                        config.tema === 'sophisticated-dark' 
                          ? 'bg-[#251B1B] border-[#2A1E1E] text-white focus:outline-[#D48C70]' 
                          : 'bg-white border-gray-200 focus:outline-rose-400'
                      }`}
                      placeholder="Ex: Te vi atravessar a rua de moletom azul..."
                      value={newTimelineDesc}
                      onChange={(e) => setNewTimelineDesc(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3 flex flex-col justify-between">
                  <div className={`border border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center relative h-32 ${
                    config.tema === 'sophisticated-dark' ? 'border-[#2A1E1E] bg-[#251B1B]' : 'border-rose-300 bg-rose-50/20'
                  }`}>
                    {newTimelineBase64 ? (
                      <div className="relative w-full h-full">
                        <img src={newTimelineBase64} alt="Timeline snapshot preview" className="w-full h-full object-cover rounded-lg" />
                        <button 
                          onClick={() => setNewTimelineBase64('')}
                          className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow"
                        >
                          <Trash2 className="w-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Camera className={`w-6 h-6 mb-1 ${config.tema === 'sophisticated-dark' ? 'text-[#D48C70]/70' : 'text-rose-400'}`} />
                        <span className={`text-xs select-none font-medium mb-1 ${config.tema === 'sophisticated-dark' ? 'text-[#EAD7D1]' : 'text-rose-955'}`}>Ilustrar com Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => handlePhotoUpload(e, setNewTimelineBase64)}
                        />
                      </>
                    )}
                  </div>

                  <button
                    onClick={handleAddTimeline}
                    className={`w-full py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      config.tema === 'sophisticated-dark' 
                        ? 'bg-[#D48C70] hover:bg-[#E2A68E] text-[#0F0A0A]' 
                        : 'bg-rose-500 hover:bg-rose-600 text-white'
                    }`}
                  >
                    Adicionar ao Histórico
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Vertical Milestone Snapshots */}
          <div className={`relative border-l-2 border-dashed pl-6 ml-3 space-y-10 ${
            config.tema === 'sophisticated-dark' ? 'border-[#2A1E1E]' : 'border-rose-300'
          }`}>
            {config.linhaDoTempo.map((item, index) => (
              <div key={item.id || index} className="relative">
                
                {/* Timeline knot node icon */}
                <span className={`absolute -left-9 top-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white border-4 ${
                  config.tema === 'sophisticated-dark' 
                    ? 'bg-[#D48C70] border-[#0F0A0A]' 
                    : 'bg-rose-500 border-rose-100'
                }`}>
                  ❤️
                </span>

                <div className={`p-5 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-5 items-start ${currentTheme.card}`}>
                  
                  {/* Event Snapshot */}
                  {item.fotoUrl && (
                    <div className={`w-full md:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 border-2 shadow ${
                      config.tema === 'sophisticated-dark' ? 'bg-[#251B1B] border-[#2A1E1E]' : 'bg-rose-100/30 border-white'
                    }`}>
                      <img src={item.fotoUrl} alt={item.titulo} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex-1">
                    <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${
                      config.tema === 'sophisticated-dark' ? 'text-[#D48C70]' : 'text-rose-500'
                    }`}>
                      {item.data}
                    </span>
                    <h3 className={`text-lg font-bold mb-2 ${
                      config.tema === 'sophisticated-dark' ? 'text-white' : 'text-rose-955'
                    }`}>
                      {item.titulo}
                    </h3>
                    <p className={`text-sm font-light leading-relaxed ${currentTheme.textMuted}`}>
                      {item.descricao}
                    </p>
                  </div>

                  {/* Deletion button inside editor */}
                  {!isReadOnly && (
                    <button
                      onClick={() => handleRemoveTimeline(item.id)}
                      className="p-1 px-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-[10px] font-bold"
                    >
                      Remover Marco
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* POST-ITS LOVE NOTES MURAL / GUESTBOOK BOARD */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-sans flex items-center gap-2">
              <Mail className={`w-5 h-5 ${config.tema === 'sophisticated-dark' ? 'text-[#D48C70]' : 'text-rose-500'}`} /> Nosso Mural de Correspondências
            </h2>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              config.tema === 'sophisticated-dark' ? 'bg-[#251B1B] text-[#D48C70] border border-[#2A1E1E]' : 'bg-rose-100 text-rose-600'
            }`}>
              {config.postIts.length} Cartinhas
            </span>
          </div>

          {/* Add sticky letters note inside editor */}
          {!isReadOnly && (
            <div className={`mb-8 p-5 border rounded-2xl backdrop-blur-md shadow-md space-y-4 transition-all ${
              config.tema === 'sophisticated-dark' 
                ? 'bg-[#150F0F]/90 border-[#2A1E1E] text-[#EAD7D1]' 
                : 'bg-white/80 border-pink-100 text-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                  config.tema === 'sophisticated-dark' ? 'text-[#D48C70]' : 'text-rose-600'
                }`}>
                  ✏️ Fixar Nova Cartinha de Amor ou Poema
                </h4>
              </div>

              {/* Standard letters writing */}
              <div className="space-y-3">
                <textarea
                  rows={3}
                  className={`w-full px-3 py-1.5 text-xs border rounded-lg ${
                    config.tema === 'sophisticated-dark' 
                      ? 'bg-[#251B1B] border-[#2A1E1E] text-white focus:outline-[#D48C70]' 
                      : 'bg-white border-gray-200 focus:outline-rose-400'
                  }`}
                  placeholder="Escreva sua dedicatória sincera..."
                  value={newPostItText}
                  onChange={(e) => setNewPostItText(e.target.value)}
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold">Cor do Papel:</span>
                    <div className="flex gap-1.5">
                      {(['yellow', 'pink', 'blue', 'purple', 'green'] as const).map(color => (
                        <button
                          key={color}
                          onClick={() => setNewPostItColor(color)}
                          className={`w-6 h-6 rounded-md border transition-all ${
                            newPostItColor === color ? 'ring-2 ring-rose-300 scale-105' : 'opacity-70'
                          }`}
                          style={{
                            backgroundColor:
                              color === 'yellow' ? '#fef08a' :
                              color === 'pink' ? '#fbcfe8' :
                              color === 'blue' ? '#bae6fd' :
                              color === 'purple' ? '#e9d5ff' : '#a7f3d0'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      className={`px-2.5 py-1 text-xs border rounded-lg focus:outline-rose-400 ${
                        config.tema === 'sophisticated-dark' 
                          ? 'bg-[#251B1B] border-[#2A1E1E] text-white focus:outline-[#D48C70]' 
                          : 'bg-white border-gray-200'
                      }`}
                      placeholder="Assinado por: Ex: Seu Nome"
                      value={newPostItAuthor}
                      onChange={(e) => setNewPostItAuthor(e.target.value)}
                    />
                    <button
                      onClick={handleAddPostIt}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                        config.tema === 'sophisticated-dark' 
                          ? 'bg-[#D48C70] hover:bg-[#E2A68E] text-[#0F0A0A]' 
                          : 'bg-rose-500 hover:bg-rose-600 text-white'
                      }`}
                    >
                      Fixar Cartinha
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Staggered sticky note boards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence initial={false}>
              {config.postIts.map((note, idx) => {
                const rotation = [1.5, -2, -1, 2, -1.5, 1][idx % 6];
                
                // Color mapper for notes
                const getPaperColorClass = (color: string) => {
                  switch (color) {
                    case 'pink': return currentTheme.postit.pink;
                    case 'blue': return currentTheme.postit.blue;
                    case 'purple': return currentTheme.postit.purple;
                    case 'green': return currentTheme.postit.green;
                    default: return currentTheme.postit.yellow; // yellow
                  }
                };

                return (
                  <motion.div
                    key={note.id || idx}
                    initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                    animate={{ opacity: 1, scale: 1, rotate: rotation }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.02, rotate: 0 }}
                    className={`p-6 rounded-2xl border shadow-md relative group flex flex-col justify-between min-h-48 transform ${getPaperColorClass(note.cor)}`}
                  >
                    {/* Simulated heart clip pin on top */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-red-400/90 flex items-center justify-center text-[10px] text-white shadow">
                      📌
                    </div>

                    <div className="pt-2">
                      <p className="text-sm font-sans font-light leading-relaxed italic whitespace-pre-wrap">
                        &ldquo;{note.texto}&rdquo;
                      </p>
                    </div>

                    <div className="pt-4 border-t border-black/5 mt-3 flex justify-between items-center">
                      <span className="text-xs font-bold font-mono tracking-tight opacity-75">
                        — {note.autor}
                      </span>

                      {/* Remove sticky inside editor */}
                      {!isReadOnly && (
                        <button
                          onClick={() => handleRemovePostIt(note.id)}
                          className="p-1 text-red-700 hover:text-red-900 hover:bg-black/5 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Credit Tag, No Tech-Larping, pure honesty */}
        <div className={`pt-8 border-t text-center text-xs opacity-60 transition-all ${
          config.tema === 'sophisticated-dark' ? 'border-[#2A1E1E]' : 'border-rose-200/40'
        }`}>
          <p>Eternizado com todo o carinho do mundo para vocês! 💕</p>
          <p className="mt-1 font-mono text-[9px]">Geração de Páginas Permanentes • Nossos Encontros</p>
        </div>

      </div>
    </div>
  );
}
