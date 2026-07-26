'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Instagram, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Lock, 
  ShieldCheck, 
  AlertCircle,
  Vote,
  Users,
  Video,
  Play,
  EyeOff,
  Trophy,
  Crown,
  Medal,
  Award,
  Star
} from 'lucide-react';
import { pb, Candidato, VotacaoConfig, Patrocinador, Grupo, Etapa, GrupoVideo } from '@/lib/pocketbase';

type TabType = 'votacao' | 'participantes';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('votacao');
  
  // Database State
  const [candidates, setCandidates] = useState<Candidato[]>([]);
  const [config, setConfig] = useState<VotacaoConfig | null>(null);
  const [sponsors, setSponsors] = useState<Patrocinador[]>([]);
  const [groups, setGroups] = useState<Grupo[]>([]);
  const [activeStage, setActiveStage] = useState<Etapa | null>(null);
  const [stageVideos, setStageVideos] = useState<GrupoVideo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Voting state
  const [votingForId, setVotingForId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  // Winner Candidate references (1º Paloma Fravante, 2º Dedé Munhoz, 3º Lucas Osminerin)
  const palomaCandidate = candidates.find(c => c.nome.includes('Paloma') || c.instagram.includes('palomafravante')) || {
    id: '49f3esxlyxeefg2',
    nome: 'Paloma Fravante',
    instagram: '@palomafravante',
    foto_file: 'whats_app_image_2026_07_20_at_21_26_PFhQ7M5w2e.56.jpeg'
  } as unknown as Candidato;

  const dedeMunhozCandidate = candidates.find(c => c.nome.includes('Dedé Munhoz') || (c.nome.includes('Dedé') && !c.nome.includes('Seu'))) || {
    id: 'i0jprmd2342x2gq',
    nome: 'Dedé Munhoz',
    instagram: '@dede.munhoz',
    foto_file: 'whats_app_image_2026_07_21_at_08_26_7Rcv3Go2HH.33.jpeg'
  } as unknown as Candidato;

  const lucasCandidate = candidates.find(c => c.nome.includes('Lucas Osminerin') || c.nome.includes('Lucas')) || {
    id: 'wlwtmdqdq1bmszp',
    nome: 'Lucas Osminerin',
    instagram: '@osminerin_',
    foto_file: 'whats_app_image_2026_07_18_at_20_27_FjVPFYo4tT.011.jpeg'
  } as unknown as Candidato;

  // Helper functions to get files/logos/videos from PocketBase uploads with fallbacks
  const getCandFoto = (cand: Candidato, _thumb?: string) => {
    if (cand.foto_file) {
      const collection = (cand as any).collectionId || (cand as any).collectionName || 'candidatos';
      return `https://api.vortexsync.pro/api/files/${collection}/${cand.id}/${cand.foto_file}`;
    }
    if (cand.foto_url && cand.foto_url.startsWith('http')) {
      return cand.foto_url;
    }
    if (cand.foto_url) {
      return `https://api.vortexsync.pro${cand.foto_url.startsWith('/') ? '' : '/'}${cand.foto_url}`;
    }
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
  };

  const getSponLogo = (spon: Patrocinador, _thumb?: string) => {
    if (spon.logo_file) {
      const collection = (spon as any).collectionId || (spon as any).collectionName || 'patrocinadores';
      return `https://api.vortexsync.pro/api/files/${collection}/${spon.id}/${spon.logo_file}`;
    }
    return spon.logo_url;
  };

  const getGrpVideo = (grp: Grupo) => {
    if (grp.video_file) {
      const collection = (grp as any).collectionId || (grp as any).collectionName || 'grupos';
      return `https://api.vortexsync.pro/api/files/${collection}/${grp.id}/${grp.video_file}`;
    }
    return grp.video_url;
  };

  // Load initial data
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch config via API soberana
        try {
          const cfgRes = await fetch('/api/save-config', { cache: 'no-store' });
          if (cfgRes.ok) {
            const cfgData = await cfgRes.json();
            if (cfgData.config) {
              setConfig(cfgData.config);
            }
          }
        } catch (cErr) {
          const configList = await pb.collection('votacoes_config').getFullList<VotacaoConfig>({
            sort: '-created',
            requestKey: 'page_config'
          }).catch(() => []);
          const activeConfig = configList.find(c => c.ativa === true) || configList[0] || null;
          if (activeConfig) setConfig(activeConfig);
        }

        // Fetch candidates
        const candidatesList = await pb.collection('candidatos').getFullList<Candidato>({
          sort: 'nome',
          requestKey: 'page_candidates'
        });
        setCandidates(candidatesList.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })));

        // Fetch sponsors
        const sponsorsList = await pb.collection('patrocinadores').getFullList<Patrocinador>({
          sort: 'nome',
          requestKey: 'page_sponsors'
        });
        setSponsors(sponsorsList);

        // Fetch groups
        const groupsList = await pb.collection('grupos').getFullList<Grupo>({
          sort: 'nome',
          expand: 'patrocinador,membros',
          requestKey: 'page_groups'
        });
        setGroups(groupsList);

        // Fetch stages & active stage
        const stagesList = await pb.collection('etapas').getFullList<Etapa>({
          sort: 'created',
          requestKey: 'page_stages'
        });
        const active = stagesList.find(s => s.ativa === true) || null;
        setActiveStage(active);

        if (active) {
          const vList = await pb.collection('grupo_videos').getFullList<GrupoVideo>({
            filter: `etapa = "${active.id}"`,
            expand: 'grupo,patrocinador',
            requestKey: 'page_stage_videos'
          });
          setStageVideos(vList);
        }
      } catch (err) {
        console.error('Error fetching landing page data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // Subscribe to candidates
    pb.collection('candidatos').subscribe('*', (e) => {
      if (e.action === 'update') {
        setCandidates((prev) =>
          prev.map((c) => (c.id === e.record.id ? { ...c, ...e.record } : c))
        );
      } else if (e.action === 'create') {
        setCandidates((prev) => [...prev, e.record as unknown as Candidato].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })));
      } else if (e.action === 'delete') {
        setCandidates((prev) => prev.filter((c) => c.id !== e.record.id));
      }
    });

    // Subscribe to config
    pb.collection('votacoes_config').subscribe('*', (e) => {
      if (e.action === 'update' || e.action === 'create') {
        setConfig(e.record as unknown as VotacaoConfig);
      }
    });

    // Subscribe to groups
    pb.collection('grupos').subscribe('*', (e) => {
      if (e.action === 'update') {
        setGroups((prev) =>
          prev.map((g) => (g.id === e.record.id ? { ...g, ...e.record } : g))
        );
      } else if (e.action === 'create') {
        pb.collection('grupos').getFullList<Grupo>({ sort: 'nome', expand: 'patrocinador,membros' })
          .then(list => setGroups(list));
      }
    });

    // Subscribe to etapas
    pb.collection('etapas').subscribe('*', (e) => {
      pb.collection('etapas').getFullList<Etapa>({ sort: 'created' })
        .then(list => {
          const active = list.find(s => s.ativa === true) || null;
          setActiveStage(active);
          
          if (active) {
            pb.collection('grupo_videos').getFullList<GrupoVideo>({
              filter: `etapa = "${active.id}"`,
              expand: 'grupo,patrocinador'
            }).then(vList => setStageVideos(vList));
          } else {
            setStageVideos([]);
          }
        });
    });

    // Subscribe to grupo_videos
    pb.collection('grupo_videos').subscribe('*', (e) => {
      pb.collection('etapas').getFullList<Etapa>({ sort: 'created' })
        .then(list => {
          const active = list.find(s => s.ativa === true) || null;
          if (active) {
            pb.collection('grupo_videos').getFullList<GrupoVideo>({
              filter: `etapa = "${active.id}"`,
              expand: 'grupo,patrocinador'
            }).then(vList => setStageVideos(vList));
          }
        });
    });

    return () => {
      pb.collection('candidatos').unsubscribe('*');
      pb.collection('votacoes_config').unsubscribe('*');
      pb.collection('grupos').unsubscribe('*');
      pb.collection('etapas').unsubscribe('*');
      pb.collection('grupo_videos').unsubscribe('*');
    };
  }, []);



  // Countdown timer
  useEffect(() => {
    if (!config || !config.ativa || !config.expira_em) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const exp = new Date(config.expira_em).getTime();
      const diff = exp - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        setIsExpired(false);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [config]);

  // Checagem visual de status com Resiliência Visual no Front-End
  useEffect(() => {
    async function checkVotingStatus() {
      try {
        const res = await fetch('/api/voting-status', {
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'closed' || data.active === false) {
            setIsExpired(true);
          } else {
            setIsExpired(false);
          }
        }

        // Sincroniza tambem a config atualizada
        const cfgRes = await fetch('/api/save-config', { cache: 'no-store' }).catch(() => null);
        if (cfgRes && cfgRes.ok) {
          const cfgData = await cfgRes.json().catch(() => null);
          if (cfgData && cfgData.config) {
            setConfig(cfgData.config);
          }
        }
      } catch (err) {
        // Resiliência Visual: Se falhar por oscilação de rede ou timeout, MANTÉM a UI ativa!
        console.warn('[Status Check] Oscilação de rede ao checar status. Mantendo UI ativa para tentativa de voto:', err);
      }
    }

    checkVotingStatus();
    const statusInterval = setInterval(checkVotingStatus, 5000);
    return () => clearInterval(statusInterval);
  }, []);

  // Toast Helper
  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Vote Handler (Individual and Group) com Validação Soberana
  const handleVote = async (id: string, isGroup: boolean = false) => {
    if (isExpired) {
      addToast('A votação está encerrada no momento.', 'error');
      return;
    }

    setVotingForId(id);

    try {
      // 1. Validação Soberana no Backend (/api/vote)
      const voteResponse = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: id,
          isGroup,
          candidatoId: !isGroup ? id : undefined,
          grupoId: isGroup ? id : undefined,
          stageId: activeStage?.id,
        }),
      });

      if (voteResponse.status === 403) {
        // Se o Backend rejeitar com 403 / Votação Encerrada, atualiza a UI para encerrado
        setIsExpired(true);
        addToast('A votação foi oficialmente encerrada no sistema.', 'error');
        return;
      }

      if (!voteResponse.ok) {
        const errData = await voteResponse.json().catch(() => ({}));
        if (errData.closed) {
          setIsExpired(true);
          addToast('A votação foi oficialmente encerrada no sistema.', 'error');
          return;
        }
        addToast(errData.error || 'Erro ao registrar voto.', 'error');
        return;
      }

      // Voto aceito com sucesso pela API Soberana
      if (isGroup) {
        // Atualização visual otimista no front
        await pb.collection('grupos').update(id, {
          'votos_count+': 1
        }).catch(() => {});

        if (activeStage) {
          const sv = stageVideos.find(v => v.grupo === id && v.etapa === activeStage.id);
          if (sv) {
            await pb.collection('grupo_videos').update(sv.id, {
              'votos_count+': 1
            }).catch(() => {});
          }
        }
        
        addToast('Voto registrado no grupo!', 'success');
      } else {
        await pb.collection('candidatos').update(id, {
          'votos_count+': 1
        }).catch(() => {});

        addToast('Voto registrado com sucesso!', 'success');
      }
    } catch (err: any) {
      // Resiliência de rede: trata erro momentâneo de requisição de forma silenciosa no Front-end sem mudar o estado da UI
      console.warn('[Voto] Oscilação de rede ao enviar voto. Mantendo UI ativa para a próxima ação:', err);
    } finally {
      setVotingForId(null);
    }
  };

  const isVotingClosed = (config && config.ativa === false) || isExpired;


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`p-4 rounded-xl shadow-lg border flex items-start gap-3 ${
                toast.type === 'success'
                  ? 'bg-white border-emerald-100 text-slate-800'
                  : 'bg-white border-red-100 text-slate-800'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-sm font-medium leading-5">
                {toast.message}
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200/80 pt-4 pb-0 px-6 z-40">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          <div className="relative w-full flex items-center justify-center min-h-[56px] sm:min-h-[80px]">
            {/* Live Indicator */}
            <div className="absolute left-0 flex items-center gap-2 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-red-500 tracking-widest uppercase whitespace-nowrap">
                Ao Vivo da Casa
              </span>
            </div>

            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo.png" 
                alt="Mansão dos Influenciadores Logo" 
                width={80}
                height={80}
                className="h-14 sm:h-20 w-auto object-contain drop-shadow-xs transition-all duration-300" 
              />
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight hidden min-[540px]:block">
                MANSÃO DOS <span className="text-blue-600">INFLUENCERS</span>
              </h1>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex justify-center border-t border-slate-100/60">
            <button
              onClick={() => setActiveTab('votacao')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                activeTab === 'votacao'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              Vencedores
            </button>
            <button
              onClick={() => setActiveTab('participantes')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                activeTab === 'participantes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Users className="w-4 h-4" />
              Influenciadores
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col items-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-500">Carregando portal oficial...</p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-8">
            
            {activeTab === 'votacao' ? (
              // TAB 1: VENCEDORES OFICIAIS DA TEMPORADA (PODIUM)
              <div className="w-full flex flex-col items-center gap-10 animate-fadeIn">
                
                {/* Hero Banner / Header */}
                <div className="w-full text-center bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col items-center max-w-4xl">
                  
                  {/* Ambient Glow Effects */}
                  <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 blur-3xl rounded-full pointer-events-none"></div>
                  <div className="absolute -bottom-20 left-10 w-72 h-72 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase inline-flex items-center gap-2 mb-4 shadow-lg shadow-amber-500/20">
                      <Trophy className="w-4 h-4 fill-slate-950" />
                      Resultado Final da Votação
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-yellow-300 leading-tight max-w-3xl">
                      PÓDIO DOS VENCEDORES DA TEMPORADA 🏆
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl mt-3">
                      Votações oficialmente encerradas e auditadas. Confira abaixo os grandes campeões consagrados pelo público da Mansão dos Influencers!
                    </p>

                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-amber-300 border border-amber-500/30 px-4 py-2 rounded-xl mt-5 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      Votação Encerrada e Homologada
                    </div>
                  </div>
                </div>

                {/* PODIUM DISPLAY (1st, 2nd, 3rd Place) */}
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-end pt-2 sm:pt-6">
                  
                  {/* 2nd Place: Dedé Munhoz (Silver 🥈) */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="order-2 md:order-1 bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-xl flex flex-col items-center relative overflow-hidden transition-all duration-300 hover:shadow-2xl"
                  >
                    <div className="absolute top-0 inset-x-0 h-2 bg-slate-400"></div>
                    
                    <div className="relative mb-4 mt-2">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-slate-300 shadow-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={getCandFoto(dedeMunhozCandidate)} alt="Dedé Munhoz" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-100 border border-slate-600 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-1 shadow-md whitespace-nowrap">
                        <Medal className="w-4 h-4 text-slate-300" />
                        2º Lugar
                      </div>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-xl sm:text-2xl text-center leading-tight mt-2">
                      Dedé Munhoz
                    </h3>
                    <a href="https://instagram.com/dede.munhoz" target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-bold inline-flex items-center gap-1 mt-1 hover:underline">
                      <Instagram className="w-3.5 h-3.5" />
                      @dede.munhoz
                    </a>

                    <div className="mt-5 w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-center">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Classificação Oficial</span>
                      <span className="text-base font-black text-slate-700">Vice-Campeão 🥈</span>
                    </div>
                  </motion.div>

                  {/* 1st Place: Paloma Fravante (Gold 🥇) - Highlighted Stage */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="order-1 md:order-2 bg-gradient-to-b from-amber-500/10 via-white to-white border-2 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center relative overflow-hidden transition-all duration-300 hover:scale-[1.02] md:-translate-y-4"
                  >
                    <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500"></div>

                    <div className="bg-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-widest px-4 py-1 rounded-full mb-4 inline-flex items-center gap-1.5 shadow-md">
                      <Crown className="w-4 h-4 fill-slate-950" />
                      1º Lugar - Campeã 🏆
                    </div>

                    <div className="relative mb-4">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-amber-400 shadow-2xl ring-4 ring-amber-400/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={getCandFoto(palomaCandidate)} alt="Paloma Fravante" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -top-3 right-0 bg-amber-400 text-slate-950 p-2.5 rounded-full shadow-lg border-2 border-white">
                        <Crown className="w-6 h-6 fill-slate-950" />
                      </div>
                    </div>

                    <h3 className="font-black text-slate-900 text-2xl sm:text-3xl text-center leading-tight">
                      Paloma Fravante
                    </h3>
                    <a href="https://instagram.com/palomafravante" target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-bold inline-flex items-center gap-1 mt-1 hover:underline">
                      <Instagram className="w-3.5 h-3.5" />
                      @palomafravante
                    </a>

                    <div className="mt-6 w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 rounded-2xl py-3 px-4 text-center shadow-lg shadow-amber-500/20">
                      <span className="text-[10px] font-black uppercase tracking-widest block text-slate-900/80">Vencedora da Temporada</span>
                      <span className="text-lg font-black text-slate-950">GRANDE CAMPEÃ 🏆</span>
                    </div>
                  </motion.div>

                  {/* 3rd Place: Lucas Osminerin (Bronze 🥉) */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="order-3 md:order-3 bg-white border-2 border-amber-700/20 rounded-3xl p-6 shadow-xl flex flex-col items-center relative overflow-hidden transition-all duration-300 hover:shadow-2xl"
                  >
                    <div className="absolute top-0 inset-x-0 h-2 bg-amber-700"></div>

                    <div className="relative mb-4 mt-2">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-amber-700/40 shadow-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={getCandFoto(lucasCandidate)} alt="Lucas Osminerin" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-900 text-amber-100 border border-amber-700 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-1 shadow-md whitespace-nowrap">
                        <Award className="w-4 h-4 text-amber-300" />
                        3º Lugar
                      </div>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-xl sm:text-2xl text-center leading-tight mt-2">
                      Lucas Osminerin
                    </h3>
                    <a href="https://instagram.com/osminerin_" target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-bold inline-flex items-center gap-1 mt-1 hover:underline">
                      <Instagram className="w-3.5 h-3.5" />
                      @osminerin_
                    </a>

                    <div className="mt-5 w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-center">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Classificação Oficial</span>
                      <span className="text-base font-black text-amber-900">3º Colocado 🥉</span>
                    </div>
                  </motion.div>

                </div>

                {/* Auditor Info Alert */}
                <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 items-center shadow-xs">
                  <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                    Votação encerrada, monitorada e auditada com transparência total. Os resultados foram homologados de forma soberana.
                  </p>
                </div>

                {/* PRESERVED VOTING FORM SECTION (HIDDEN BUT CODE PRESERVED FOR FUTURE USE) */}
                {false && (
                  <div className="hidden">
                    {/* Voting Hero Card & Buttons Code Preserved */}
                    <div className="w-full text-center bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col items-center">
                      <h2>{config?.titulo}</h2>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              
              // TAB 2: ALL PARTICIPANTS (INFLUENCERS) LIST
              <div className="w-full max-w-4xl flex flex-col gap-6 animate-fadeIn">
                <div className="text-center sm:text-left">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Elenco da Temporada
                  </h3>
                  <h2 className="text-2xl font-black text-slate-800">
                    Conheça os Influenciadores
                  </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                  {candidates.map((candidate) => {
                    const isEliminated = candidate.eliminado;
                    
                    return (
                      <div
                        key={candidate.id}
                        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col h-full"
                      >
                        {/* Avatar photo */}
                        <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getCandFoto(candidate, '400x400')}
                            alt={candidate.nome}
                            width={400}
                            height={400}
                            className={`w-full h-full object-cover object-center ${
                              isEliminated ? 'grayscale' : ''
                            }`}
                          />
                          {isEliminated && (
                            <span className="absolute top-3 right-3 bg-slate-800/90 text-white font-extrabold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                              Fora da Casa
                            </span>
                          )}
                        </div>

                        {/* Name and Link */}
                        <div className="p-3 sm:p-4 flex flex-col gap-3 flex-1">
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight truncate">
                              {candidate.nome}
                            </h4>
                            <span className={`text-[9px] sm:text-[10px] font-bold ${isEliminated ? 'text-slate-400' : 'text-emerald-500'} uppercase mt-1 block`}>
                              {isEliminated ? 'Eliminado(a)' : 'Na Casa'}
                            </span>
                          </div>

                          <a
                            href={`https://instagram.com/${candidate.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2 sm:py-2.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-[10px] sm:text-xs font-bold text-slate-700 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-auto"
                          >
                            <Instagram className="w-3.5 h-3.5 text-blue-500" />
                            {candidate.instagram}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* Footer / Patrocinadores */}
      <footer className="bg-white border-t border-slate-200/80 py-8 px-6 mt-12 overflow-hidden">


        <div className="max-w-5xl mx-auto flex flex-col items-center gap-6">
          <div className="text-center w-full">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">
              Apoio & Patrocínio Oficial
            </span>
            
            {/* Infinite Marquee Container */}
            <div className="relative overflow-hidden w-full max-w-3xl py-4 mx-auto">
              {/* Fade masks for premium look */}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
              
              <div className="animate-marquee flex items-center gap-16 md:gap-24">
                {/* First Copy */}
                {sponsors.map((sponsor) => {
                  const targetLink = sponsor.instagram 
                    ? `https://instagram.com/${sponsor.instagram.replace('@', '')}` 
                    : sponsor.link_site;
                  
                  return (
                    <a
                      key={`${sponsor.id}-1`}
                      href={targetLink}
                      target="_blank"
                      rel="noreferrer"
                      title={sponsor.instagram ? `Abrir Instagram de ${sponsor.nome}` : `Visitar site de ${sponsor.nome}`}
                      className="opacity-45 hover:opacity-100 transition-all duration-300 group flex items-center gap-3 shrink-0 cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getSponLogo(sponsor, '200x0')}
                        alt={sponsor.nome}
                        width={150}
                        height={56}
                        className="h-10 sm:h-14 grayscale group-hover:grayscale-0 transition-all duration-300 rounded object-contain bg-white"
                      />
                      <span className="font-bold text-sm text-slate-500 sm:text-base group-hover:text-slate-900 transition-colors">
                        {sponsor.nome}
                      </span>
                    </a>
                  );
                })}

                {/* Second Copy for Infinite Scrolling Loop */}
                {sponsors.map((sponsor) => {
                  const targetLink = sponsor.instagram 
                    ? `https://instagram.com/${sponsor.instagram.replace('@', '')}` 
                    : sponsor.link_site;
                  
                  return (
                    <a
                      key={`${sponsor.id}-2`}
                      href={targetLink}
                      target="_blank"
                      rel="noreferrer"
                      title={sponsor.instagram ? `Abrir Instagram de ${sponsor.nome}` : `Visitar site de ${sponsor.nome}`}
                      className="opacity-45 hover:opacity-100 transition-all duration-300 group flex items-center gap-3 shrink-0 cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getSponLogo(sponsor, '200x0')}
                        alt={sponsor.nome}
                        width={150}
                        height={56}
                        className="h-10 sm:h-14 grayscale group-hover:grayscale-0 transition-all duration-300 rounded object-contain bg-white"
                      />
                      <span className="font-bold text-sm text-slate-500 sm:text-base group-hover:text-slate-900 transition-colors">
                        {sponsor.nome}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

          </div>
          
          <div className="border-t border-slate-100 w-full pt-6 text-center">
            <p className="text-[11px] font-medium text-slate-400">
              © {new Date().getFullYear()} Reality Mansão dos Influencers. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
