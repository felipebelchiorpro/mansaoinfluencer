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
  EyeOff
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
  
  // Voting & Cooldown state (Individual only)
  const [votingForId, setVotingForId] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  // Helper functions to get files/logos/videos from PocketBase uploads with fallbacks
  const getCandFoto = (cand: Candidato) => {
    if (cand.foto_file) {
      return pb.files.getUrl(cand, cand.foto_file);
    }
    return cand.foto_url;
  };

  const getSponLogo = (spon: Patrocinador) => {
    if (spon.logo_file) {
      return pb.files.getUrl(spon, spon.logo_file);
    }
    return spon.logo_url;
  };

  const getGrpVideo = (grp: Grupo) => {
    if (grp.video_file) {
      return pb.files.getUrl(grp, grp.video_file);
    }
    return grp.video_url;
  };

  // Load initial data
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch config
        const configList = await pb.collection('votacoes_config').getFullList<VotacaoConfig>({
          sort: '-created',
          requestKey: 'page_config'
        });
        const activeConfig = configList.find(c => c.ativa === true) || configList[0] || null;
        setConfig(activeConfig);

        // Fetch candidates
        const candidatesList = await pb.collection('candidatos').getFullList<Candidato>({
          sort: 'nome',
          requestKey: 'page_candidates'
        });
        setCandidates(candidatesList);

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
        setCandidates((prev) => [...prev, e.record as unknown as Candidato].sort((a, b) => a.nome.localeCompare(b.nome)));
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

  // Cooldown sync (Individual)
  useEffect(() => {
    const lastVoteTime = localStorage.getItem('last_vote_timestamp');
    if (lastVoteTime) {
      const elapsed = Date.now() - parseInt(lastVoteTime, 10);
      if (elapsed < 3000) {
        setCooldownRemaining(Math.ceil((3000 - elapsed) / 1000));
      }
    }
  }, []);

  // Cooldown interval
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

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

  // Toast Helper
  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Vote Handler (Individual and Group)
  const handleVote = async (id: string, isGroup: boolean = false) => {
    if (!config || !config.ativa || isExpired) {
      addToast('A votação está encerrada no momento.', 'error');
      return;
    }

    if (!isGroup && cooldownRemaining > 0) {
      addToast(`Aguarde ${cooldownRemaining}s para votar novamente.`, 'error');
      return;
    }

    setVotingForId(id);

    try {
      if (isGroup) {
        // 1. Group Voting: increment cumulative votes for the group
        await pb.collection('grupos').update(id, {
          'votos_count+': 1
        });

        // 2. Also increment the active stage video if active stage is set
        if (activeStage) {
          const sv = stageVideos.find(v => v.grupo === id && v.etapa === activeStage.id);
          if (sv) {
            await pb.collection('grupo_videos').update(sv.id, {
              'votos_count+': 1
            });
          }
        }
        
        addToast('Voto registrado no grupo!', 'success');
      } else {
        // Individual Voting: increment candidate votes atomically
        await pb.collection('candidatos').update(id, {
          'votos_count+': 1
        });

        addToast('Voto registrado com sucesso!', 'success');

        // Apply visual cooldown of 3 seconds
        const now = Date.now();
        localStorage.setItem('last_vote_timestamp', now.toString());
        setCooldownRemaining(3);
      }
    } catch (err: any) {
      console.error(err);
      addToast('Erro ao registrar voto no banco de dados.', 'error');
    } finally {
      setVotingForId(null);
    }
  };

  const isVotingClosed = !config || !config.ativa || isExpired;

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
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Vote className="w-4 h-4" />
              Votação
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
              // TAB 1: VOTING (PAREDÃO)
              <div className="w-full flex flex-col items-center gap-8">
                
                {/* Hero Card */}
                <div className="w-full text-center bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col items-center max-w-3xl animate-fadeIn">
                  <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 mb-4">
                    <Sparkles className="w-3.5 h-3.5" />
                    {config?.tipo === 'grupo' ? 'Votação Especial de Grupos' : 'Paredão Individual'}
                  </div>
                  
                  <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-tight max-w-2xl">
                    {config?.titulo || 'Vote para decidir o rumo do reality!'}
                  </h2>

                  <div className="w-full border-t border-slate-100 my-6"></div>

                  {/* Status & Timer */}
                  {isVotingClosed ? (
                    <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-5 py-3 rounded-xl border border-slate-200">
                      <Lock className="w-5 h-5 text-slate-500" />
                      <span className="font-bold text-sm sm:text-base">Votação encerrada de forma oficial</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                        <Clock className="w-4 h-4 text-blue-600" />
                        Tempo restante
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="flex flex-col items-center bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg min-w-[50px]">
                          <span className="text-lg sm:text-2xl font-black text-slate-800">{timeLeft.hours.toString().padStart(2, '0')}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Horas</span>
                        </div>
                        <span className="text-xl font-bold text-slate-300 self-center">:</span>
                        <div className="flex flex-col items-center bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg min-w-[50px]">
                          <span className="text-lg sm:text-2xl font-black text-slate-800">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Min</span>
                        </div>
                        <span className="text-xl font-bold text-slate-300 self-center">:</span>
                        <div className="flex flex-col items-center bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg min-w-[50px]">
                          <span className="text-lg sm:text-2xl font-black text-slate-800">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Seg</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* dynamic rendering based on config.tipo */}
                {config?.tipo === 'grupo' ? (
                  
                  // GROUP VOTING VIEW
                  <div className="w-full max-w-4xl flex flex-col gap-6 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-center sm:text-left">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Batalha de Grupos (Vídeos e Patrocinadores)
                      </h3>
                      {activeStage && (
                        <span className="bg-blue-50 text-blue-600 border border-blue-100 rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase self-center sm:self-auto shadow-xs">
                          {activeStage.nome}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {groups.map((group) => {
                        const membersList = group.expand?.membros || [];
                        
                        // Check if we have a stage video for this group
                        const sv = activeStage ? stageVideos.find(v => v.grupo === group.id) : null;
                        const groupSponsor = group.expand?.patrocinador;
                        const stageSponsor = sv?.expand?.patrocinador;
                        const activeSponsor = stageSponsor || groupSponsor;
                        
                        // Decide which video to show
                        const videoSrc = sv 
                          ? (sv.video_file ? pb.files.getUrl(sv, sv.video_file) : sv.video_url)
                          : (group.video_file ? pb.files.getUrl(group, group.video_file) : group.video_url);

                        const hasVideo = !activeStage || !!sv;
                        
                        return (
                          <div
                            key={group.id}
                            className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
                          >
                            {/* Video Player or Placeholder */}
                            <div className="relative h-[480px] w-full bg-slate-950 overflow-hidden flex items-center justify-center border-b border-slate-100">
                              {hasVideo ? (
                                <video
                                  src={videoSrc}
                                  controls
                                  playsInline
                                  className="h-full max-w-full object-contain mx-auto"
                                />
                              ) : (
                                <div className="text-center p-6 flex flex-col items-center gap-2 text-slate-405">
                                  <Video className="w-8 h-8 opacity-40 animate-pulse text-blue-500" />
                                  <span className="text-[11px] font-bold uppercase tracking-wider">Aguardando envio do vídeo</span>
                                  <span className="text-[9px] text-slate-500 font-semibold">{activeStage?.nome}</span>
                                </div>
                              )}
                              <div className="absolute top-3 left-3 bg-blue-600/90 text-white font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1 shadow-sm">
                                <Video className="w-3 h-3" />
                                {activeStage ? 'Vídeo da Etapa' : 'Vídeo do Grupo'}
                              </div>
                            </div>

                            {/* Group Details */}
                            <div className="p-6 flex flex-col flex-1 gap-5">
                              <div>
                                <h4 className="font-extrabold text-slate-900 text-xl leading-none">
                                  {group.nome}
                                </h4>
                                {activeSponsor && (
                                  <span className="text-xs font-bold text-slate-400 mt-1.5 block">
                                    Desafio do patrocinador: <strong className="text-slate-600">{activeSponsor.nome}</strong>
                                  </span>
                                )}
                              </div>

                              {/* Members list (Bolinhas) */}
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                                  Membros do Grupo (Clique para abrir Instagram)
                                </span>
                                <div className="flex flex-wrap gap-4">
                                  {membersList.map((member) => (
                                    <a
                                      key={member.id}
                                      href={`https://instagram.com/${member.instagram.replace('@', '')}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      title={`Abrir Instagram de ${member.nome}`}
                                      className="flex flex-col items-center gap-1 group/member"
                                    >
                                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 group-hover/member:border-blue-500 transition-all duration-200 scale-100 group-hover/member:scale-105 shadow-xs">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={getCandFoto(member)}
                                          alt={member.nome}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <span className="text-[9px] font-bold text-slate-500 group-hover/member:text-blue-600 transition-colors">
                                        {member.nome.split(' ')[0]}
                                      </span>
                                    </a>
                                  ))}
                                </div>
                              </div>

                              {/* Vote Button (Unlimited) */}
                              <div className="mt-auto">
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase mb-3 px-1">
                                  <span>Contagem de Votos:</span>
                                  <span className="text-blue-600">
                                    {activeStage 
                                      ? `${(sv?.votos_count || 0).toLocaleString()} votos nesta etapa`
                                      : `${(group.votos_count || 0).toLocaleString()} votos acumulados`
                                    }
                                  </span>
                                </div>
                                
                                <button
                                  onClick={() => handleVote(group.id, true)}
                                  disabled={isVotingClosed || votingForId !== null || !hasVideo}
                                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.98] select-none flex items-center justify-center gap-2 cursor-pointer ${
                                    isVotingClosed || !hasVideo
                                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                      : votingForId === group.id
                                      ? 'bg-blue-600 text-white cursor-wait'
                                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm hover:shadow-md'
                                  }`}
                                >
                                  {votingForId === group.id ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                      Computando...
                                    </>
                                  ) : !hasVideo ? (
                                    'Aguardando Vídeo'
                                  ) : isVotingClosed ? (
                                    'Votação Encerrada'
                                  ) : (
                                    'VOTAR NO GRUPO'
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                ) : (
                  
                  // INDIVIDUAL VOTING VIEW (With eliminated grayscale block)
                  <div className="w-full max-w-4xl flex flex-col gap-6 animate-fadeIn">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center sm:text-left">
                      Quem você quer que continue na Mansão?
                    </h3>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                      {candidates.map((candidate) => {
                        const isEliminated = candidate.eliminado;
                        const isActive = candidate.ativo !== false;
                        const isGray = isEliminated || !isActive;
                        
                        return (
                          <div
                            key={candidate.id}
                            className={`bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full group ${
                              isGray ? 'opacity-85' : ''
                            }`}
                          >
                            {/* Candidate Photo */}
                            <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getCandFoto(candidate)}
                                alt={candidate.nome}
                                className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out ${
                                  isGray ? 'grayscale contrast-[1.05]' : ''
                                }`}
                                loading="lazy"
                              />
                              
                              {/* Overlays */}
                              {isEliminated ? (
                                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center gap-1.5 p-3">
                                  <Lock className="w-7 h-7 text-white/95" />
                                  <span className="bg-red-650 text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                                    Eliminado(a)
                                  </span>
                                </div>
                              ) : !isActive ? (
                                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center gap-1.5 p-3 animate-fadeIn">
                                  <EyeOff className="w-7 h-7 text-white/95" />
                                  <span className="bg-slate-700 text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                                    Fora do Paredão
                                  </span>
                                </div>
                              ) : isVotingClosed ? (
                                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
                                  <Lock className="w-8 h-8 text-white opacity-85" />
                                </div>
                              ) : null}
                            </div>

                            {/* Details */}
                            <div className="p-3 sm:p-4 flex flex-col flex-1 gap-1">
                              <h4 className="font-extrabold text-slate-900 text-sm sm:text-lg leading-tight truncate">
                                {candidate.nome}
                              </h4>
                              
                              <a
                                href={`https://instagram.com/${candidate.instagram.replace('@', '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 transition-colors self-start mb-3"
                              >
                                <Instagram className="w-3.5 h-3.5" />
                                {candidate.instagram}
                              </a>

                              {/* Button block */}
                              <div className="mt-auto">
                                <button
                                  onClick={() => handleVote(candidate.id, false)}
                                  disabled={isVotingClosed || isGray || votingForId !== null || cooldownRemaining > 0}
                                  className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all active:scale-[0.98] select-none flex items-center justify-center gap-2 cursor-pointer ${
                                    isEliminated
                                      ? 'bg-red-50 text-red-500 border border-red-100 cursor-not-allowed'
                                      : !isActive
                                      ? 'bg-slate-100 text-slate-405 border border-slate-200 cursor-not-allowed'
                                      : isVotingClosed
                                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                      : cooldownRemaining > 0
                                      ? 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
                                      : votingForId === candidate.id
                                      ? 'bg-blue-600 text-white cursor-wait'
                                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm'
                                  }`}
                                >
                                  {isEliminated ? (
                                    'INATIVO'
                                  ) : !isActive ? (
                                    'FORA DO PAREDÃO'
                                  ) : votingForId === candidate.id ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                      Registrando...
                                    </>
                                  ) : cooldownRemaining > 0 ? (
                                    `Aguarde (${cooldownRemaining}s)`
                                  ) : isVotingClosed ? (
                                    'Fechado'
                                  ) : (
                                    'VOTAR'
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Auditor Info Alert */}
                <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 items-center shadow-xs">
                  <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                    Votação monitorada e transparente. Os resultados agregados são consolidados de forma auditável e auditada instantaneamente.
                  </p>
                </div>

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
                            src={getCandFoto(candidate)}
                            alt={candidate.nome}
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
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            width: max-content;
            animation: marquee 30s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}} />

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
                      className="opacity-45 hover:opacity-100 transition-all duration-300 group flex items-center gap-2.5 shrink-0 cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getSponLogo(sponsor)}
                        alt={sponsor.nome}
                        className="h-6 sm:h-7 grayscale group-hover:grayscale-0 transition-all duration-300 rounded object-contain bg-white"
                      />
                      <span className="font-bold text-xs text-slate-500 sm:text-sm group-hover:text-slate-900 transition-colors">
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
                      className="opacity-45 hover:opacity-100 transition-all duration-300 group flex items-center gap-2.5 shrink-0 cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getSponLogo(sponsor)}
                        alt={sponsor.nome}
                        className="h-6 sm:h-7 grayscale group-hover:grayscale-0 transition-all duration-300 rounded object-contain bg-white"
                      />
                      <span className="font-bold text-xs text-slate-500 sm:text-sm group-hover:text-slate-900 transition-colors">
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
