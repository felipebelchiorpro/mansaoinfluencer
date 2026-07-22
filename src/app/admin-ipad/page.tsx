'use client';

import { useState, useEffect } from 'react';
import { pb, Candidato, VotacaoConfig, Patrocinador, Grupo, HistoricoVotacao, Etapa, GrupoVideo } from '@/lib/pocketbase';

type AdminTab = 'dashboard' | 'candidatos' | 'patrocinadores' | 'grupos' | 'etapas' | 'historico' | 'equipe' | 'metrics';

export default function AdminIpadPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Active Admin Sub-tab
  const [activeSubTab, setActiveSubTab] = useState<AdminTab>('dashboard');

  // Sidebar collapsibility state for responsiveness on tablets/mobiles
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Database Data
  const [candidates, setCandidates] = useState<Candidato[]>([]);
  const [sponsors, setSponsors] = useState<Patrocinador[]>([]);
  const [groups, setGroups] = useState<Grupo[]>([]);
  const [historyList, setHistoryList] = useState<HistoricoVotacao[]>([]);
  const [config, setConfig] = useState<VotacaoConfig | null>(null);

  // Calculations
  const activeCandidates = config?.tipo === 'repescagem'
    ? candidates.filter(c => c.ativo === true)
    : candidates.filter(c => c.ativo === true && !c.eliminado);
  const totalVotesCandidates = activeCandidates.reduce((sum, c) => sum + c.votos_count, 0);
  const totalVotesGroups = groups.reduce((sum, g) => sum + g.votos_count, 0);
  const activeTotalVotes = config?.tipo === 'grupo' ? totalVotesGroups : totalVotesCandidates;

  // Metrics & Database Health State
  const [pbStatus, setPbStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [pbLatency, setPbLatency] = useState<number | null>(null);
  const [latencyHistory, setLatencyHistory] = useState<number[]>(Array(20).fill(0));
  const [currentTime, setCurrentTime] = useState('');
  const [votesHistory, setVotesHistory] = useState<{ timestamp: number; votes: number }[]>([]);
  const [votesPerMin, setVotesPerMin] = useState<number>(0);
  const [webStatus, setWebStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [webLatency, setWebLatency] = useState<number | null>(null);
  const [webLatencyHistory, setWebLatencyHistory] = useState<number[]>(Array(20).fill(0));
  const [vpmHistory, setVpmHistory] = useState<number[]>(Array(20).fill(0));
  
  // Stages & Stage Videos Data
  const [stages, setStages] = useState<Etapa[]>([]);
  const [stageVideos, setStageVideos] = useState<GrupoVideo[]>([]);

  // Stage CRUD Form State
  const [newStageName, setNewStageName] = useState('');
  const [newStageDesc, setNewStageDesc] = useState('');
  const [stageSubmitLoading, setStageSubmitLoading] = useState(false);
  const [editingStage, setEditingStage] = useState<Etapa | null>(null);
  const [newStageAtiva, setNewStageAtiva] = useState(false);

  // Group Video Form State (for selected stage)
  const [selectedStageForVideos, setSelectedStageForVideos] = useState<string>('');
  const [videoGroup, setVideoGroup] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoSponsor, setVideoSponsor] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSubmitLoading, setVideoSubmitLoading] = useState(false);
  
  // Dashboard Config Form State
  const [editTitle, setEditTitle] = useState('');
  const [editExpire, setEditExpire] = useState('');
  const [editType, setEditType] = useState<'individual' | 'grupo' | 'repescagem'>('individual');
  const [saveLoading, setSaveLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  
  // Influencer CRUD Form State
  const [newCandName, setNewCandName] = useState('');
  const [newCandInstagram, setNewCandInstagram] = useState('');
  const [newCandFoto, setNewCandFoto] = useState('');
  const [candFile, setCandFile] = useState<File | null>(null);
  const [candSubmitLoading, setCandSubmitLoading] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidato | null>(null);

  // Sponsor CRUD Form State
  const [newSponName, setNewSponName] = useState('');
  const [newSponLogo, setNewSponLogo] = useState('');
  const [newSponLink, setNewSponLink] = useState('');
  const [newSponInstagram, setNewSponInstagram] = useState('');
  const [sponFile, setSponFile] = useState<File | null>(null);
  const [sponSubmitLoading, setSponSubmitLoading] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Patrocinador | null>(null);

  // Group CRUD Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupVideo, setNewGroupVideo] = useState('');
  const [newGroupSponsor, setNewGroupSponsor] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState<string[]>([]);
  const [groupVideoFile, setGroupVideoFile] = useState<File | null>(null);
  const [groupSubmitLoading, setGroupSubmitLoading] = useState(false);

  // Admin Management State
  const [admins, setAdmins] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminPasswordConfirm, setNewAdminPasswordConfirm] = useState('');
  const [adminSubmitLoading, setAdminSubmitLoading] = useState(false);
  const [adminActionError, setAdminActionError] = useState('');
  const [adminActionSuccess, setAdminActionSuccess] = useState('');

  // Global actions loading
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Cross-browser safe date parser (Avoids iOS Safari / legacy timezone parsing bugs)
  const safeParseDate = (dateStr: any): Date => {
    if (!dateStr) return new Date();
    let s = String(dateStr).trim();
    
    // Split on typical delimiters: -, T, :, space, dot, Z
    const parts = s.split(/[-T :.Z+]/);
    if (parts.length >= 5) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const hour = parseInt(parts[3], 10);
      const minute = parseInt(parts[4], 10);
      const second = parts[5] ? parseInt(parts[5], 10) : 0;
      
      // If it ends with Z or was parsed as UTC
      if (s.endsWith('Z') || s.includes('+00')) {
        return new Date(Date.UTC(year, month, day, hour, minute, second));
      }
      return new Date(year, month, day, hour, minute, second);
    }
    return new Date(s);
  };

  // Convert Date object to YYYY-MM-DDTHH:MM format locally for input value
  const formatDatetimeLocal = (date: Date): string => {
    if (isNaN(date.getTime())) return '';
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${y}-${m}-${d}T${h}:${min}`;
  };

  // Safe short date format (Avoids toLocaleDateString {dateStyle: 'short'} crash on iOS < 13)
  const formatShortDate = (dateStr: string): string => {
    const d = safeParseDate(dateStr);
    if (isNaN(d.getTime())) return '-';
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  // Check saved session on mount
  useEffect(() => {
    const savedSession = sessionStorage.getItem('admin_authenticated');
    if (savedSession === 'true' && pb.authStore.isValid && pb.authStore.isAdmin) {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch all backend data once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadAdminData() {
      try {
        // Fetch candidates
        const candidatesList = await pb.collection('candidatos').getFullList<Candidato>({
          sort: 'nome',
          requestKey: 'ipad_candidates_list'
        });
        setCandidates(candidatesList.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })));

        // Fetch sponsors
        const sponsorsList = await pb.collection('patrocinadores').getFullList<Patrocinador>({
          sort: 'nome',
          requestKey: 'ipad_sponsors_list'
        });
        setSponsors(sponsorsList);

        // Fetch groups
        const groupsList = await pb.collection('grupos').getFullList<Grupo>({
          sort: 'nome',
          expand: 'patrocinador,membros',
          requestKey: 'ipad_groups_list'
        });
        setGroups(groupsList);

        // Fetch history
        const historyData = await pb.collection('historico_votacoes').getFullList<HistoricoVotacao>({
          sort: '-created',
          requestKey: 'ipad_history_list'
        });
        setHistoryList(historyData);

        // Fetch configurations
        const configList = await pb.collection('votacoes_config').getFullList<VotacaoConfig>({
          sort: '-created',
          requestKey: 'ipad_config_list'
        });
        const activeConfig = configList.find(c => c.ativa === true) || configList[0] || null;
        setConfig(activeConfig);
        if (activeConfig) {
          setEditTitle(activeConfig.titulo);
          setEditType(activeConfig.tipo || 'individual');
          
          const date = safeParseDate(activeConfig.expira_em);
          setEditExpire(formatDatetimeLocal(date));
        }

        // Fetch stages (etapas)
        const stagesList = await pb.collection('etapas').getFullList<Etapa>({
          sort: 'created',
          requestKey: 'ipad_stages_list'
        });
        setStages(stagesList);
        const activeStage = stagesList.find(s => s.ativa === true);
        if (activeStage) {
          setSelectedStageForVideos(activeStage.id);
        } else if (stagesList.length > 0) {
          setSelectedStageForVideos(stagesList[0].id);
        }

        // Fetch stage videos (grupo_videos)
        const stageVideosList = await pb.collection('grupo_videos').getFullList<GrupoVideo>({
          sort: 'created',
          expand: 'grupo,etapa,patrocinador',
          requestKey: 'ipad_stage_videos_list'
        });
        setStageVideos(stageVideosList);

        // Fetch administrators
        try {
          const adminsList = await pb.admins.getFullList({
            requestKey: 'ipad_admins_list'
          });
          setAdmins(adminsList);
        } catch (err) {
          console.error('Error loading administrators:', err);
        }
      } catch (err) {
        console.error('Error loading admin dashboard data:', err);
      }
    }

    loadAdminData();

    // Subscribe to candidates
    pb.collection('candidatos').subscribe('*', (e) => {
      if (e.action === 'update') {
        setCandidates((prev) => prev.map((c) => (c.id === e.record.id ? { ...c, ...e.record } : c)));
      } else if (e.action === 'create') {
        setCandidates((prev) => [...prev, e.record as unknown as Candidato].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })));
      } else if (e.action === 'delete') {
        setCandidates((prev) => prev.filter((c) => c.id !== e.record.id));
      }
    });

    // Subscribe to sponsors
    pb.collection('patrocinadores').subscribe('*', (e) => {
      if (e.action === 'update') {
        setSponsors((prev) => prev.map((s) => (s.id === e.record.id ? { ...s, ...e.record } : s)));
      } else if (e.action === 'create') {
        setSponsors((prev) => [...prev, e.record as unknown as Patrocinador].sort((a, b) => a.nome.localeCompare(b.nome)));
      } else if (e.action === 'delete') {
        setSponsors((prev) => prev.filter((s) => s.id !== e.record.id));
      }
    });

    // Subscribe to groups
    pb.collection('grupos').subscribe('*', (e) => {
      if (e.action === 'update' || e.action === 'create' || e.action === 'delete') {
        pb.collection('grupos').getFullList<Grupo>({ sort: 'nome', expand: 'patrocinador,membros' })
          .then(list => setGroups(list));
      }
    });

    // Subscribe to stages
    pb.collection('etapas').subscribe('*', (e) => {
      pb.collection('etapas').getFullList<Etapa>({ sort: 'created' })
        .then(list => {
          setStages(list);
          setSelectedStageForVideos(current => {
            if (!list.some(s => s.id === current)) {
              const active = list.find(s => s.ativa === true);
              return active ? active.id : (list[0]?.id || '');
            }
            return current;
          });
        });
    });

    // Subscribe to stage videos
    pb.collection('grupo_videos').subscribe('*', (e) => {
      pb.collection('grupo_videos').getFullList<GrupoVideo>({ sort: 'created', expand: 'grupo,etapa,patrocinador' })
        .then(list => setStageVideos(list));
    });

    // Subscribe to history
    pb.collection('historico_votacoes').subscribe('*', (e) => {
      if (e.action === 'create') {
        setHistoryList((prev) => [e.record as unknown as HistoricoVotacao, ...prev]);
      } else if (e.action === 'delete') {
        setHistoryList((prev) => prev.filter((h) => h.id !== e.record.id));
      }
    });

    // Subscribe to configs
    pb.collection('votacoes_config').subscribe('*', (e) => {
      if (e.action === 'update' || e.action === 'create') {
        const updatedConfig = e.record as unknown as VotacaoConfig;
        setConfig(updatedConfig);
        setEditTitle(updatedConfig.titulo);
        setEditType(updatedConfig.tipo || 'individual');
        
        const date = safeParseDate(updatedConfig.expira_em);
        setEditExpire(formatDatetimeLocal(date));
      }
    });

    return () => {
      pb.collection('candidatos').unsubscribe('*');
      pb.collection('patrocinadores').unsubscribe('*');
      pb.collection('grupos').unsubscribe('*');
      pb.collection('etapas').unsubscribe('*');
      pb.collection('grupo_videos').unsubscribe('*');
      pb.collection('historico_votacoes').unsubscribe('*');
      pb.collection('votacoes_config').unsubscribe('*');
    };
  }, [isAuthenticated]);

  // 1. Health monitoring for PocketBase
  useEffect(() => {
    if (!isAuthenticated || activeSubTab !== 'metrics') return;

    const checkHealth = async () => {
      const start = performance.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        
        const baseUrl = pb.baseUrl || '';
        const response = await fetch(`${baseUrl}/api/health`, {
          signal: controller.signal,
          cache: 'no-store'
        });
        clearTimeout(timeoutId);
        
        const end = performance.now();
        const latency = Math.round(end - start);
        
        if (response.ok) {
          setPbStatus('online');
          setPbLatency(latency);
          setLatencyHistory((prev) => {
            const next = [...prev.slice(1), latency];
            return next;
          });
        } else {
          setPbStatus('offline');
          setPbLatency(null);
          setLatencyHistory((prev) => [...prev.slice(1), 0]);
        }
      } catch (err) {
        setPbStatus('offline');
        setPbLatency(null);
        setLatencyHistory((prev) => [...prev.slice(1), 0]);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated, activeSubTab]);

  // 2. Real-time Clock (HH:MM:SS)
  useEffect(() => {
    if (!isAuthenticated || activeSubTab !== 'metrics') return;

    const updateClock = () => {
      const now = new Date();
      const pad = (n: number) => (n < 10 ? '0' + n : n);
      setCurrentTime(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
    };
    
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, activeSubTab]);

  // 3. Request/Vote rate tracking (Votes Per Minute) over a 60s sliding window
  useEffect(() => {
    if (!isAuthenticated || activeSubTab !== 'metrics') return;

    const now = Date.now();
    setVotesHistory((prev) => {
      if (prev.length > 0 && activeTotalVotes < prev[prev.length - 1].votes) {
        return [{ timestamp: now, votes: activeTotalVotes }];
      }

      const next = [...prev, { timestamp: now, votes: activeTotalVotes }];
      const filtered = next.filter((item) => now - item.timestamp <= 60000);

      if (filtered.length >= 2) {
        const oldest = filtered[0];
        const newest = filtered[filtered.length - 1];
        const votesDiff = newest.votes - oldest.votes;
        const timeDiffSec = (newest.timestamp - oldest.timestamp) / 1000;
        const rate = timeDiffSec > 0 ? (votesDiff / timeDiffSec) * 60 : 0;
        setVotesPerMin(Math.round(rate));
      } else {
        setVotesPerMin(0);
      }

      return filtered;
    });
  }, [isAuthenticated, activeSubTab, activeTotalVotes]);

  // 4. Web Server Response Latency Monitoring (Main voting page '/')
  useEffect(() => {
    if (!isAuthenticated || activeSubTab !== 'metrics') return;

    const checkWebHealth = async () => {
      const start = performance.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        
        const response = await fetch('/', {
          signal: controller.signal,
          cache: 'no-store'
        });
        clearTimeout(timeoutId);
        
        const end = performance.now();
        const latency = Math.round(end - start);
        
        if (response.ok || response.status === 405 || response.status === 404 || response.status === 200) {
          setWebStatus('online');
          setWebLatency(latency);
          setWebLatencyHistory((prev) => {
            const next = [...prev.slice(1), latency];
            return next;
          });
        } else {
          setWebStatus('offline');
          setWebLatency(null);
          setWebLatencyHistory((prev) => [...prev.slice(1), 0]);
        }
      } catch (err) {
        setWebStatus('offline');
        setWebLatency(null);
        setWebLatencyHistory((prev) => [...prev.slice(1), 0]);
      }
    };

    checkWebHealth();
    const interval = setInterval(checkWebHealth, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated, activeSubTab]);

  // 5. VPM (Votes Per Minute) History update (ticks every 3s)
  useEffect(() => {
    if (!isAuthenticated || activeSubTab !== 'metrics') return;

    const interval = setInterval(() => {
      setVpmHistory((prev) => {
        const next = [...prev.slice(1), votesPerMin];
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated, activeSubTab, votesPerMin]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      await pb.admins.authWithPassword(adminEmail, adminPassword);
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
    } catch (err: any) {
      setAuthError('E-mail ou senha incorretos, ou erro de conexão.');
      console.error(err);
    } finally {
      setAuthLoading(false);
    }
  };

  // Toggle Active
  const handleToggleActive = async () => {
    if (!config) {
      alert('Por favor, configure e salve as configurações antes de abrir a votação!');
      return;
    }
    setStatusLoading(true);
    try {
      const updated = await pb.collection('votacoes_config').update<VotacaoConfig>(config.id, {
        ativa: !config.ativa
      });
      setConfig(updated);
    } catch (err) {
      console.error(err);
      alert('Erro ao alterar status da votação.');
    } finally {
      setStatusLoading(false);
    }
  };

  // Toggle Eliminated
  const handleToggleEliminated = async (candId: string, currentStatus: boolean) => {
    setActionLoadingId(candId);
    try {
      const willBeEliminated = !currentStatus;
      await pb.collection('candidatos').update(candId, {
        eliminado: willBeEliminated,
        ativo: willBeEliminated ? false : true
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao alterar status do participante.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Candidate Ativo (in/out of Paredão)
  const handleToggleCandidateAtivo = async (candId: string, currentStatus: boolean) => {
    setActionLoadingId(candId);
    try {
      await pb.collection('candidatos').update(candId, {
        ativo: !currentStatus
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao alterar status de votação do participante.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Save configurations
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveSuccess(false);

    try {
      const parsedDate = safeParseDate(editExpire);
      const data = {
        titulo: editTitle || 'Quem você quer que continue na Mansão?',
        expira_em: parsedDate.toISOString(),
        tipo: editType || 'individual'
      };

      let updated;
      if (config) {
        updated = await pb.collection('votacoes_config').update<VotacaoConfig>(config.id, data);
      } else {
        updated = await pb.collection('votacoes_config').create<VotacaoConfig>({
          ...data,
          ativa: false
        });
      }
      setConfig(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar as configurações.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Reset all votes in DB to 0
  const handleResetVotes = async () => {
    if (!confirm('Deseja realmente ZERAR todos os votos (candidatos e grupos)?')) return;
    try {
      for (const cand of candidates) {
        await pb.collection('candidatos').update(cand.id, { votos_count: 0 });
      }
      for (const grp of groups) {
        await pb.collection('grupos').update(grp.id, { votos_count: 0 });
      }
      alert('Todos os votos foram resetados com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao resetar votos.');
    }
  };

  // Archive Voting Log
  const handleArchiveRound = async () => {
    if (!config) return;
    if (activeTotalVotes === 0) {
      alert('Não é possível arquivar uma votação com 0 votos registrados!');
      return;
    }

    if (!confirm('Deseja encerrar e arquivar esta votação no histórico para auditoria pública?')) return;
    setArchiveLoading(true);

    try {
      let winnerName = '';
      let winnerVotes = 0;
      let detailsBreakdown: any[] = [];

      if (config.tipo === 'grupo') {
        const winner = [...groups].sort((a, b) => b.votos_count - a.votos_count)[0];
        winnerName = winner?.nome || 'Nenhum';
        winnerVotes = winner?.votos_count || 0;
        detailsBreakdown = groups.map(g => ({ id: g.id, nome: g.nome, votos: g.votos_count }));
      } else {
        const winner = [...activeCandidates].sort((a, b) => b.votos_count - a.votos_count)[0];
        winnerName = winner?.nome || 'Nenhum';
        winnerVotes = winner?.votos_count || 0;
        detailsBreakdown = activeCandidates.map(c => ({ id: c.id, nome: c.nome, votos: c.votos_count, eliminado: c.eliminado }));
      }

      await pb.collection('historico_votacoes').create({
        titulo: config.titulo,
        tipo: config.tipo,
        ganhador: winnerName,
        votos_ganhador: winnerVotes,
        votos_totais: activeTotalVotes,
        detalhes: detailsBreakdown,
        data_encerramento: new Date().toISOString()
      });

      alert('Votação arquivada com sucesso no histórico!');
    } catch (err) {
      console.error(err);
      alert('Erro ao arquivar votação.');
    } finally {
      setArchiveLoading(false);
    }
  };

  // Create Admin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminActionError('');
    setAdminActionSuccess('');

    if (!newAdminEmail || !newAdminPassword || !newAdminPasswordConfirm) {
      setAdminActionError('Todos os campos são obrigatórios.');
      return;
    }
    if (newAdminPassword !== newAdminPasswordConfirm) {
      setAdminActionError('As senhas não coincidem.');
      return;
    }
    if (newAdminPassword.length < 8) {
      setAdminActionError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    setAdminSubmitLoading(true);
    try {
      await pb.admins.create({
        email: newAdminEmail,
        password: newAdminPassword,
        passwordConfirm: newAdminPasswordConfirm,
      });

      setAdminActionSuccess('Administrador cadastrado com sucesso!');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminPasswordConfirm('');

      const adminsList = await pb.admins.getFullList();
      setAdmins(adminsList);
    } catch (err: any) {
      setAdminActionError(err.message || 'Erro ao cadastrar administrador. Verifique se o e-mail já está em uso.');
      console.error(err);
    } finally {
      setAdminSubmitLoading(false);
    }
  };

  // Delete Admin
  const handleDeleteAdmin = async (id: string, email: string) => {
    setAdminActionError('');
    setAdminActionSuccess('');

    const currentUser = pb.authStore.model;
    if (currentUser && currentUser.id === id) {
      alert('Você não pode excluir a sua própria conta ativa.');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja remover o administrador ${email}?`)) {
      return;
    }

    setActionLoadingId(id);
    try {
      await pb.admins.delete(id);
      setAdminActionSuccess(`Administrador ${email} removido com sucesso.`);
      const adminsList = await pb.admins.getFullList();
      setAdmins(adminsList);
    } catch (err: any) {
      console.error('Error deleting administrator:', err);
      setAdminActionError(err.message || 'Erro ao excluir administrador.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Add Candidate
  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandName || !newCandInstagram) {
      alert('Preencha nome e instagram!');
      return;
    }
    setCandSubmitLoading(true);
    try {
      const instagramHandle = newCandInstagram.startsWith('@') ? newCandInstagram : `@${newCandInstagram}`;
      const formData = new FormData();
      formData.append('nome', newCandName);
      formData.append('instagram', instagramHandle);

      if (candFile) {
        formData.append('foto_file', candFile);
      } else {
        const foto = newCandFoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop';
        formData.append('foto_url', foto);
      }

      if (editingCandidate) {
        await pb.collection('candidatos').update(editingCandidate.id, formData);
        setEditingCandidate(null);
        alert('Influenciador atualizado com sucesso!');
      } else {
        formData.append('votos_count', '0');
        formData.append('eliminado', 'false');
        await pb.collection('candidatos').create(formData);
        alert('Influenciador adicionado com sucesso!');
      }
      
      setNewCandName('');
      setNewCandInstagram('');
      setNewCandFoto('');
      setCandFile(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar influenciador.');
    } finally {
      setCandSubmitLoading(false);
    }
  };

  // Edit Candidate
  const triggerEditCandidate = (cand: Candidato) => {
    setEditingCandidate(cand);
    setNewCandName(cand.nome);
    setNewCandInstagram(cand.instagram);
    setNewCandFoto(cand.foto_url);
    setCandFile(null);
  };

  const cancelEditCandidate = () => {
    setEditingCandidate(null);
    setNewCandName('');
    setNewCandInstagram('');
    setNewCandFoto('');
    setCandFile(null);
  };

  // Delete Candidate
  const handleDeleteCandidate = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente deletar o participante "${name}"?`)) return;
    setActionLoadingId(id);
    try {
      await pb.collection('candidatos').delete(id);
      if (editingCandidate?.id === id) {
        cancelEditCandidate();
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao deletar influenciador.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Add Sponsor
  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSponName) {
      alert('Preencha o nome do patrocinador!');
      return;
    }
    setSponSubmitLoading(true);
    try {
      const link = newSponLink || 'https://google.com';
      const instagramHandle = newSponInstagram ? (newSponInstagram.startsWith('@') ? newSponInstagram : `@${newSponInstagram}`) : '';
      
      const formData = new FormData();
      formData.append('nome', newSponName);
      formData.append('link_site', link);
      formData.append('instagram', instagramHandle);

      if (sponFile) {
        formData.append('logo_file', sponFile);
      } else {
        const logo = newSponLogo || 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?q=80&w=200&auto=format&fit=crop';
        formData.append('logo_url', logo);
      }
      
      if (editingSponsor) {
        await pb.collection('patrocinadores').update(editingSponsor.id, formData);
        setEditingSponsor(null);
        alert('Patrocinador atualizado com sucesso!');
      } else {
        await pb.collection('patrocinadores').create(formData);
        alert('Patrocinador adicionado com sucesso!');
      }
      setNewSponName('');
      setNewSponLogo('');
      setNewSponLink('');
      setNewSponInstagram('');
      setSponFile(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar patrocinador.');
    } finally {
      setSponSubmitLoading(false);
    }
  };

  // Edit Sponsor
  const triggerEditSponsor = (spon: Patrocinador) => {
    setEditingSponsor(spon);
    setNewSponName(spon.nome);
    setNewSponLogo(spon.logo_url);
    setNewSponLink(spon.link_site);
    setNewSponInstagram(spon.instagram || '');
    setSponFile(null);
  };

  const cancelEditSponsor = () => {
    setEditingSponsor(null);
    setNewSponName('');
    setNewSponLogo('');
    setNewSponLink('');
    setNewSponInstagram('');
    setSponFile(null);
  };

  // Delete Sponsor
  const handleDeleteSponsor = async (id: string, name: string) => {
    if (!confirm(`Deseja deletar o patrocinador "${name}"?`)) return;
    setActionLoadingId(id);
    try {
      await pb.collection('patrocinadores').delete(id);
      if (editingSponsor?.id === id) {
        cancelEditSponsor();
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao deletar patrocinador.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Group Member
  const handleToggleGroupMember = (candId: string) => {
    setNewGroupMembers(prev => 
      prev.includes(candId) ? prev.filter(id => id !== candId) : [...prev, candId]
    );
  };

  // Add Group
  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName || !newGroupSponsor || newGroupMembers.length === 0) {
      alert('Preencha o nome do grupo, selecione o patrocinador e marque pelo menos 1 membro!');
      return;
    }
    setGroupSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.append('nome', newGroupName);
      formData.append('patrocinador', newGroupSponsor);
      formData.append('votos_count', '0');
      
      newGroupMembers.forEach(m => formData.append('membros', m));

      if (groupVideoFile) {
        formData.append('video_file', groupVideoFile);
      } else {
        const video = newGroupVideo || 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0227e3691a2063d7e5e9a2d3b3c10f8&profile_id=139&oauth2_token_id=57447761';
        formData.append('video_url', video);
      }

      await pb.collection('grupos').create(formData);

      setNewGroupName('');
      setNewGroupVideo('');
      setNewGroupSponsor('');
      setNewGroupMembers([]);
      setGroupVideoFile(null);
      alert('Grupo criado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao criar grupo.');
    } finally {
      setGroupSubmitLoading(false);
    }
  };

  // Delete Group
  const handleDeleteGroup = async (id: string, name: string) => {
    if (!confirm(`Deseja deletar o grupo "${name}"?`)) return;
    setActionLoadingId(id);
    try {
      await pb.collection('grupos').delete(id);
    } catch (err) {
      console.error(err);
      alert('Erro ao deletar grupo.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Add Stage
  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName) {
      alert('Preencha o nome da etapa!');
      return;
    }
    setStageSubmitLoading(true);
    try {
      if (newStageAtiva) {
        const stagesList = await pb.collection('etapas').getFullList<Etapa>();
        for (const stg of stagesList) {
          if (editingStage && stg.id === editingStage.id) continue;
          if (stg.ativa) {
            await pb.collection('etapas').update(stg.id, { ativa: false });
          }
        }
      }

      const data = {
        nome: newStageName,
        descricao: newStageDesc,
        ativa: newStageAtiva
      };
      
      if (editingStage) {
        await pb.collection('etapas').update(editingStage.id, data);
        setEditingStage(null);
        alert('Etapa atualizada com sucesso!');
      } else {
        await pb.collection('etapas').create(data);
        alert('Etapa cadastrada com sucesso!');
      }
      setNewStageName('');
      setNewStageDesc('');
      setNewStageAtiva(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar etapa.');
    } finally {
      setStageSubmitLoading(false);
    }
  };

  const triggerEditStage = (stage: Etapa) => {
    setEditingStage(stage);
    setNewStageName(stage.nome);
    setNewStageDesc(stage.descricao || '');
    setNewStageAtiva(stage.ativa);
  };

  const cancelEditStage = () => {
    setEditingStage(null);
    setNewStageName('');
    setNewStageDesc('');
    setNewStageAtiva(false);
  };

  const handleToggleStageActive = async (id: string, currentActive: boolean) => {
    setActionLoadingId(id);
    try {
      if (currentActive) {
        await pb.collection('etapas').update(id, { ativa: false });
      } else {
        const stagesList = await pb.collection('etapas').getFullList<Etapa>();
        for (const stg of stagesList) {
          if (stg.id === id) {
            await pb.collection('etapas').update(stg.id, { ativa: true });
          } else if (stg.ativa) {
            await pb.collection('etapas').update(stg.id, { ativa: false });
          }
        }
      }
      alert('Status da etapa atualizado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao alterar status da etapa.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSetActiveStage = async (id: string) => {
    try {
      const stagesList = await pb.collection('etapas').getFullList<Etapa>();
      for (const stg of stagesList) {
        if (stg.id === id) {
          if (!stg.ativa) {
            await pb.collection('etapas').update(stg.id, { ativa: true });
          }
        } else {
          if (stg.ativa) {
            await pb.collection('etapas').update(stg.id, { ativa: false });
          }
        }
      }
      alert('Etapa activa atualizada com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar a etapa ativa.');
    }
  };

  const handleDeleteStage = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente deletar a etapa "${name}"? Todos os vídeos vinculados a ela também serão excluídos.`)) return;
    setActionLoadingId(id);
    try {
      await pb.collection('etapas').delete(id);
      if (editingStage?.id === id) {
        cancelEditStage();
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao deletar etapa.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Add Group Video
  const handleAddGroupVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStageForVideos || !videoGroup) {
      alert('Selecione uma etapa e um grupo!');
      return;
    }
    
    setVideoSubmitLoading(true);
    try {
      const existing = stageVideos.find(v => v.grupo === videoGroup && v.etapa === selectedStageForVideos);
      const formData = new FormData();
      formData.append('grupo', videoGroup);
      formData.append('etapa', selectedStageForVideos);
      if (videoSponsor) {
        formData.append('patrocinador', videoSponsor);
      }
      
      if (videoFile) {
        formData.append('video_file', videoFile);
      } else {
        const defaultVideo = 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0227e3691a2063d7e5e9a2d3b3c10f8&profile_id=139&oauth2_token_id=57447761';
        formData.append('video_url', videoUrl || defaultVideo);
      }

      if (existing) {
        await pb.collection('grupo_videos').update(existing.id, formData);
        alert('Vídeo da etapa atualizado com sucesso!');
      } else {
        formData.append('votos_count', '0');
        await pb.collection('grupo_videos').create(formData);
        alert('Vídeo da etapa cadastrado com sucesso!');
      }

      setVideoGroup('');
      setVideoUrl('');
      setVideoSponsor('');
      setVideoFile(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar vídeo da etapa.');
    } finally {
      setVideoSubmitLoading(false);
    }
  };

  const handleDeleteGroupVideo = async (id: string) => {
    if (!confirm('Deseja realmente remover o vídeo deste grupo para esta etapa?')) return;
    setActionLoadingId(id);
    try {
      await pb.collection('grupo_videos').delete(id);
      alert('Vídeo removido com sucesso.');
    } catch (err) {
      console.error(err);
      alert('Erro ao remover vídeo.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete History
  const handleDeleteHistory = async (id: string) => {
    if (!confirm('Deseja realmente deletar este registro de histórico?')) return;
    setActionLoadingId(id);
    try {
      await pb.collection('historico_votacoes').delete(id);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir histórico.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Image Helper with 100x100 thumbnail default for dashboard lists
  const getCandFoto = (cand: Candidato, thumb: string = '100x100') => {
    if (cand.foto_file) {
      return pb.files.getUrl(cand, cand.foto_file, { thumb });
    }
    return cand.foto_url;
  };

  const getSponLogo = (spon: Patrocinador, thumb: string = '100x100') => {
    if (spon.logo_file) {
      return pb.files.getUrl(spon, spon.logo_file, { thumb });
    }
    return spon.logo_url;
  };

  const handleLogout = () => {
    pb.authStore.clear();
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setAdminEmail('');
    setAdminPassword('');
  };

  // Calculations (moved to the top of the component to be accessible by hooks)

  // Render Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif', padding: '40px 15px' }}>
        <div style={{ maxWidth: '400px', margin: '80px auto 0', padding: '30px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '40px' }}>🔒</span>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b', margin: '10px 0 5px 0' }}>Painel iPad Admin</h2>
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Acesso Restrito</p>
          </div>

          {authError && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '15px', fontWeight: 'bold' }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>E-mail Administrativo</label>
              <input 
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px', fontSize: '14px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                placeholder="exemplo@email.com"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '5px' }}>Senha de Segurança</label>
              <input 
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px', fontSize: '14px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={authLoading}
              style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 'bold', color: '#ffffff', backgroundColor: '#2563eb', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              {authLoading ? 'Verificando...' : 'Entrar no Sistema'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Active Tab Rendering Logic
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            {/* Sidebar Navigation Column */}
            <td 
              style={{ 
                width: isSidebarCollapsed ? '70px' : '240px', 
                verticalAlign: 'top', 
                backgroundColor: '#ffffff', 
                borderRight: '1px solid #e2e8f0', 
                padding: '15px 10px', 
                height: '100vh',
                transition: 'width 0.2s ease-out'
              }}
            >
              {/* Collapse/Expand Sidebar Trigger */}
              <div style={{ paddingBottom: '15px', borderBottom: '1px solid #f1f5f9', marginBottom: '15px' }}>
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  style={{
                    width: '100%',
                    padding: '8px 4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#2563eb',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '12px',
                    textAlign: 'center'
                  }}
                >
                  {isSidebarCollapsed ? '▶ Menu' : '◀ Recolher Menu'}
                </button>
                
                {!isSidebarCollapsed ? (
                  <>
                    <h2 style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', margin: '0 0 3px 0' }}>Mansão Admin</h2>
                    <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>iPad Compatível</span>
                  </>
                ) : (
                  <div style={{ fontSize: '11px', fontWeight: 'black', color: '#2563eb', textAlign: 'center' }}>M.A.</div>
                )}
              </div>

              {/* Navigation Links using table for layout */}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    { id: 'dashboard', label: 'Painel Geral', emoji: '📊' },
                    { id: 'candidatos', label: 'Influenciadores', emoji: '👥' },
                    { id: 'patrocinadores', label: 'Patrocinadores', emoji: '💎' },
                    { id: 'grupos', label: 'Grupos', emoji: '🛡️' },
                    { id: 'etapas', label: 'Etapas & Vídeos', emoji: '🎬' },
                    { id: 'historico', label: 'Histórico', emoji: '📜' },
                    { id: 'equipe', label: 'Equipe Admin', emoji: '👤' },
                    { id: 'metrics', label: 'Métricas & Saúde', emoji: '⚡' },
                  ].map((tab) => {
                    const isActive = activeSubTab === tab.id;
                    return (
                      <tr key={tab.id}>
                        <td style={{ padding: '3px 0' }}>
                          <button
                            onClick={() => setActiveSubTab(tab.id as AdminTab)}
                            style={{
                              width: '100%',
                              textAlign: isSidebarCollapsed ? 'center' : 'left',
                              padding: '10px 12px',
                              fontSize: '13px',
                              fontWeight: 'bold',
                              color: isActive ? '#ffffff' : '#475569',
                              backgroundColor: isActive ? '#2563eb' : 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            title={tab.label}
                          >
                            <span style={{ marginRight: isSidebarCollapsed ? '0' : '8px', fontSize: '14px' }}>{tab.emoji}</span>
                            {!isSidebarCollapsed && tab.label}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td style={{ padding: '15px 0 0 0' }}>
                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          textAlign: isSidebarCollapsed ? 'center' : 'left',
                          padding: '10px 12px',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          color: '#b91c1c',
                          backgroundColor: '#fef2f2',
                          border: '1px solid #fca5a5',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        title="Sair do Painel"
                      >
                        <span style={{ marginRight: isSidebarCollapsed ? '0' : '8px', fontSize: '14px' }}>🚪</span>
                        {!isSidebarCollapsed && 'Sair do Painel'}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>

            {/* Main Content Column */}
            <td style={{ 
              verticalAlign: 'top', 
              padding: '20px', 
              backgroundColor: activeSubTab === 'metrics' ? '#0f172a' : '#f8fafc',
              transition: 'background-color 0.3s ease'
            }}>
              
              {/* Header Info */}
              <div style={{ 
                marginBottom: '20px', 
                paddingBottom: '12px', 
                borderBottom: `1px solid ${activeSubTab === 'metrics' ? '#1e293b' : '#e2e8f0'}` 
              }}>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 'bold', 
                  color: activeSubTab === 'metrics' ? '#38bdf8' : '#3b82f6', 
                  textTransform: 'uppercase', 
                  letterSpacing: '1px' 
                }}>
                  {activeSubTab === 'metrics' ? 'Monitoramento em Tempo Real' : 'Controle em Tempo Real'}
                </span>
                <h1 style={{ 
                  fontSize: '22px', 
                  fontWeight: 900, 
                  color: activeSubTab === 'metrics' ? '#ffffff' : '#0f172a', 
                  margin: '4px 0 0 0' 
                }}>
                  {activeSubTab === 'dashboard' && 'Painel de Controle Geral'}
                  {activeSubTab === 'candidatos' && 'Gerenciamento de Participantes'}
                  {activeSubTab === 'patrocinadores' && 'Gerenciamento de Patrocinadores'}
                  {activeSubTab === 'grupos' && 'Gerenciamento de Grupos'}
                  {activeSubTab === 'etapas' && 'Gerenciamento de Etapas & Vídeos'}
                  {activeSubTab === 'historico' && 'Histórico de Votações'}
                  {activeSubTab === 'equipe' && 'Equipe de Administradores'}
                  {activeSubTab === 'metrics' && 'Métricas & Saúde do Banco'}
                </h1>
              </div>

              {/* TAB CONTENT: DASHBOARD */}
              {activeSubTab === 'dashboard' && (
                <div>
                  {/* Status Cards (float style for legacy layout) */}
                  <div style={{ clear: 'both', overflow: 'auto', marginBottom: '20px' }}>
                    <div style={{ float: 'left', width: '31%', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', marginRight: '3%', boxSizing: 'border-box' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Status da Votação</span>
                      <h3 style={{ fontSize: '16px', fontWeight: 900, color: config?.ativa ? '#16a34a' : '#dc2626', margin: '5px 0 10px 0' }}>
                        {config?.ativa ? '🟢 NO AR (ABERTA)' : '🔴 FORA DO AR (FECHADA)'}
                      </h3>
                      <button 
                        onClick={handleToggleActive} 
                        disabled={statusLoading}
                        style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', backgroundColor: config?.ativa ? '#dc2626' : '#16a34a', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        {config?.ativa ? 'Fechar Votação' : 'Abrir Votação'}
                      </button>
                    </div>

                    <div style={{ float: 'left', width: '31%', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', marginRight: '3%', boxSizing: 'border-box' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Total de Votos Registrados</span>
                      <h3 style={{ fontSize: '22px', fontWeight: 950, color: '#0f172a', margin: '5px 0 10px 0' }}>
                        {activeTotalVotes.toLocaleString('pt-BR')}
                      </h3>
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>Tipo: {config?.tipo.toUpperCase()}</span>
                    </div>

                    <div style={{ float: 'left', width: '31%', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', boxSizing: 'border-box' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Ações de Auditoria</span>
                      <div style={{ marginTop: '10px' }}>
                        <button 
                          onClick={handleArchiveRound} 
                          disabled={archiveLoading}
                          style={{ padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', color: '#ffffff', backgroundColor: '#4f46e5', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                        >
                          📦 Arquivar
                        </button>
                        <button 
                          onClick={handleResetVotes}
                          style={{ padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', color: '#ffffff', backgroundColor: '#ea580c', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          🔄 Zerar Votos
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Settings Form and Candidate Live Stats */}
                  <div style={{ clear: 'both', overflow: 'auto' }}>
                    
                    {/* Left: Configuration Form */}
                    <div style={{ float: 'left', width: '48%', marginRight: '4%', boxSizing: 'border-box' }}>
                      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', margin: '0 0 15px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                          ⚙️ Configurações da Rodada
                        </h3>
                        {saveSuccess && (
                          <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '8px', borderRadius: '4px', fontSize: '12px', marginBottom: '10px', fontWeight: 'bold' }}>
                            Configurações salvas com sucesso!
                          </div>
                        )}
                        <form onSubmit={handleSaveConfig}>
                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Título da Pergunta</label>
                            <input 
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                          </div>

                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Tipo de Votação</label>
                            <select 
                              value={editType} 
                              onChange={(e) => setEditType(e.target.value as any)}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            >
                              <option value="individual">Eliminação Individual</option>
                              <option value="grupo">Votação em Grupo</option>
                              <option value="repescagem">Repescagem</option>
                            </select>
                          </div>

                          <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Data/Hora de Expiração</label>
                            <input 
                              type="datetime-local"
                              value={editExpire}
                              onChange={(e) => setEditExpire(e.target.value)}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                          </div>

                          <button 
                            type="submit" 
                            disabled={saveLoading}
                            style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', backgroundColor: '#2563eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            {saveLoading ? 'Salvando...' : 'Salvar Configurações'}
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Right: Live Standings (Table layout) */}
                    <div style={{ float: 'left', width: '48%', boxSizing: 'border-box' }}>
                      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', margin: '0 0 15px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                          📊 Resultados em Tempo Real
                        </h3>

                        {config?.tipo === 'grupo' ? (
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                <th style={{ padding: '8px 0', color: '#64748b' }}>Grupo</th>
                                <th style={{ padding: '8px 0', color: '#64748b', textAlign: 'right' }}>Votos</th>
                                <th style={{ padding: '8px 0', color: '#64748b', textAlign: 'right' }}>%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {groups.map((group) => {
                                const pct = totalVotesGroups > 0 ? (group.votos_count / totalVotesGroups) * 100 : 0;
                                return (
                                  <tr key={group.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '10px 0', fontWeight: 'bold', color: '#1e293b' }}>{group.nome}</td>
                                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 'bold' }}>{group.votos_count.toLocaleString()}</td>
                                    <td style={{ padding: '10px 0', textAlign: 'right', color: '#2563eb', fontWeight: 'bold' }}>{pct.toFixed(1)}%</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        ) : (
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                <th style={{ padding: '8px 0', color: '#64748b' }}>Participante</th>
                                <th style={{ padding: '8px 0', color: '#64748b', textAlign: 'right' }}>Votos</th>
                                <th style={{ padding: '8px 0', color: '#64748b', textAlign: 'right' }}>%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeCandidates.map((cand) => {
                                const pct = totalVotesCandidates > 0 ? (cand.votos_count / totalVotesCandidates) * 100 : 0;
                                return (
                                  <tr key={cand.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '10px 0', fontWeight: 'bold', color: '#1e293b' }}>
                                      <img src={getCandFoto(cand, '100x100')} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', marginRight: '8px', verticalAlign: 'middle', objectFit: 'cover' }} />
                                      {cand.nome}
                                    </td>
                                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 'bold' }}>{cand.votos_count.toLocaleString()}</td>
                                    <td style={{ padding: '10px 0', textAlign: 'right', color: '#2563eb', fontWeight: 'bold' }}>{pct.toFixed(1)}%</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB CONTENT: INFLUENCERS (CANDIDATOS) */}
              {activeSubTab === 'candidatos' && (
                <div style={{ clear: 'both', overflow: 'auto' }}>
                  
                  {/* Left: Form */}
                  <div style={{ float: 'left', width: '38%', marginRight: '4%', boxSizing: 'border-box' }}>
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', margin: '0 0 15px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        {editingCandidate ? '📝 Editar Influenciador' : '➕ Novo Influenciador'}
                      </h3>
                      <form onSubmit={handleAddCandidate}>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Nome</label>
                          <input 
                            type="text"
                            required
                            value={newCandName}
                            onChange={(e) => setNewCandName(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            placeholder="Nome Completo"
                          />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Instagram</label>
                          <input 
                            type="text"
                            required
                            value={newCandInstagram}
                            onChange={(e) => setNewCandInstagram(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            placeholder="@perfil"
                          />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Imagem (Fazer Upload)</label>
                          <input 
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCandFile(e.target.files ? e.target.files[0] : null)}
                            style={{ width: '100%', fontSize: '12px' }}
                          />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Ou URL da Imagem (Fallback)</label>
                          <input 
                            type="text"
                            value={newCandFoto}
                            onChange={(e) => setNewCandFoto(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            placeholder="https://..."
                          />
                        </div>

                        <button 
                          type="submit"
                          disabled={candSubmitLoading}
                          style={{ padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', backgroundColor: '#2563eb', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                        >
                          {candSubmitLoading ? 'Enviando...' : (editingCandidate ? 'Atualizar' : 'Cadastrar')}
                        </button>

                        {editingCandidate && (
                          <button 
                            type="button"
                            onClick={cancelEditCandidate}
                            style={{ padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', color: '#475569', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Cancelar
                          </button>
                        )}
                      </form>
                    </div>
                  </div>

                  {/* Right: Table list */}
                  <div style={{ float: 'left', width: '58%', boxSizing: 'border-box' }}>
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', margin: '0 0 15px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        👥 Elenco Cadastrado ({candidates.length})
                      </h3>
                      
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', backgroundColor: '#f8fafc' }}>
                            <th style={{ padding: '8px' }}>Foto</th>
                            <th style={{ padding: '8px' }}>Nome</th>
                            <th style={{ padding: '8px', textAlign: 'center' }}>Votação</th>
                            <th style={{ padding: '8px', textAlign: 'center' }}>Status</th>
                            <th style={{ padding: '8px', textAlign: 'right' }}>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {candidates.map((cand) => (
                            <tr key={cand.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '8px' }}>
                                <img src={getCandFoto(cand, '100x100')} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                              </td>
                              <td style={{ padding: '8px', fontWeight: 'bold' }}>
                                <div>{cand.nome}</div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>{cand.instagram}</div>
                              </td>
                              <td style={{ padding: '8px', textAlign: 'center' }}>
                                <button 
                                  onClick={() => handleToggleCandidateAtivo(cand.id, cand.ativo !== false)}
                                  style={{ padding: '3px 6px', fontSize: '10px', fontWeight: 'bold', color: '#ffffff', backgroundColor: cand.ativo !== false ? '#16a34a' : '#64748b', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                  {cand.ativo !== false ? 'No Paredão' : 'Reservado'}
                                </button>
                              </td>
                              <td style={{ padding: '8px', textAlign: 'center' }}>
                                <button 
                                  onClick={() => handleToggleEliminated(cand.id, cand.eliminado)}
                                  style={{ padding: '3px 6px', fontSize: '10px', fontWeight: 'bold', color: '#ffffff', backgroundColor: cand.eliminado ? '#dc2626' : '#0284c7', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                  {cand.eliminado ? 'Eliminado' : 'Na Casa'}
                                </button>
                              </td>
                              <td style={{ padding: '8px', textAlign: 'right' }}>
                                <button 
                                  onClick={() => triggerEditCandidate(cand)}
                                  style={{ padding: '3px 6px', fontSize: '10px', color: '#2563eb', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', borderRadius: '4px', cursor: 'pointer', marginRight: '4px' }}
                                >
                                  Editar
                                </button>
                                <button 
                                  onClick={() => handleDeleteCandidate(cand.id, cand.nome)}
                                  style={{ padding: '3px 6px', fontSize: '10px', color: '#dc2626', border: '1px solid #fecaca', backgroundColor: '#fef2f2', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                  Excluir
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                    </div>
                  </div>

                </div>
              )}

              {/* TAB CONTENT: SPONSORS (PATROCINADORES) */}
              {activeSubTab === 'patrocinadores' && (
                <div style={{ clear: 'both', overflow: 'auto' }}>
                  {/* Left: Form */}
                  <div style={{ float: 'left', width: '38%', marginRight: '4%', boxSizing: 'border-box' }}>
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', margin: '0 0 15px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        {editingSponsor ? '📝 Editar Patrocinador' : '➕ Novo Patrocinador'}
                      </h3>
                      <form onSubmit={handleAddSponsor}>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Nome da Marca</label>
                          <input 
                            type="text"
                            required
                            value={newSponName}
                            onChange={(e) => setNewSponName(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Instagram da Marca</label>
                          <input 
                            type="text"
                            value={newSponInstagram}
                            onChange={(e) => setNewSponInstagram(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            placeholder="@patrocinador"
                          />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Website oficial</label>
                          <input 
                            type="text"
                            value={newSponLink}
                            onChange={(e) => setNewSponLink(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            placeholder="https://..."
                          />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Logotipo (Fazer Upload)</label>
                          <input 
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSponFile(e.target.files ? e.target.files[0] : null)}
                            style={{ width: '100%', fontSize: '12px' }}
                          />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Ou URL do Logotipo (Fallback)</label>
                          <input 
                            type="text"
                            value={newSponLogo}
                            onChange={(e) => setNewSponLogo(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            placeholder="https://..."
                          />
                        </div>

                        <button 
                          type="submit"
                          disabled={sponSubmitLoading}
                          style={{ padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', backgroundColor: '#2563eb', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                        >
                          {sponSubmitLoading ? 'Enviando...' : (editingSponsor ? 'Atualizar' : 'Cadastrar')}
                        </button>

                        {editingSponsor && (
                          <button 
                            type="button"
                            onClick={cancelEditSponsor}
                            style={{ padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', color: '#475569', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Cancelar
                          </button>
                        )}
                      </form>
                    </div>
                  </div>

                  {/* Right: Table List */}
                  <div style={{ float: 'left', width: '58%', boxSizing: 'border-box' }}>
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 950, color: '#0f172a', margin: '0 0 15px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        💎 Patrocinadores Cadastrados ({sponsors.length})
                      </h3>

                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', backgroundColor: '#f8fafc' }}>
                            <th style={{ padding: '8px' }}>Logo</th>
                            <th style={{ padding: '8px' }}>Marca</th>
                            <th style={{ padding: '8px' }}>Link</th>
                            <th style={{ padding: '8px', textAlign: 'right' }}>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sponsors.map((spon) => (
                            <tr key={spon.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '8px' }}>
                                <img src={getSponLogo(spon, '100x100')} alt="" style={{ height: '24px', width: 'auto', maxHeight: '24px', objectFit: 'contain', backgroundColor: '#f8fafc', padding: '2px', border: '1px solid #cbd5e1', borderRadius: '3px' }} />
                              </td>
                              <td style={{ padding: '8px', fontWeight: 'bold' }}>
                                <div>{spon.nome}</div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>{spon.instagram}</div>
                              </td>
                              <td style={{ padding: '8px' }}>
                                <a href={spon.link_site} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>Visitar 🔗</a>
                              </td>
                              <td style={{ padding: '8px', textAlign: 'right' }}>
                                <button 
                                  onClick={() => triggerEditSponsor(spon)}
                                  style={{ padding: '3px 6px', fontSize: '10px', color: '#2563eb', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', borderRadius: '4px', cursor: 'pointer', marginRight: '4px' }}
                                >
                                  Editar
                                </button>
                                <button 
                                  onClick={() => handleDeleteSponsor(spon.id, spon.nome)}
                                  style={{ padding: '3px 6px', fontSize: '10px', color: '#dc2626', border: '1px solid #fecaca', backgroundColor: '#fef2f2', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                  Excluir
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: GROUPS (GRUPOS) */}
              {activeSubTab === 'grupos' && (
                <div style={{ clear: 'both', overflow: 'auto' }}>
                  {/* Left: Form */}
                  <div style={{ float: 'left', width: '38%', marginRight: '4%', boxSizing: 'border-box' }}>
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', margin: '0 0 15px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        🛡️ Novo Grupo
                      </h3>
                      <form onSubmit={handleAddGroup}>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Nome do Grupo</label>
                          <input 
                            type="text"
                            required
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Patrocinador Principal</label>
                          <select 
                            required
                            value={newGroupSponsor}
                            onChange={(e) => setNewGroupSponsor(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          >
                            <option value="">Selecione...</option>
                            {sponsors.map(s => (
                              <option key={s.id} value={s.id}>{s.nome}</option>
                            ))}
                          </select>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Vídeo de Introdução (Upload)</label>
                          <input 
                            type="file"
                            accept="video/*"
                            onChange={(e) => setGroupVideoFile(e.target.files ? e.target.files[0] : null)}
                            style={{ width: '100%', fontSize: '12px' }}
                          />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Ou URL do Vídeo (Fallback)</label>
                          <input 
                            type="text"
                            value={newGroupVideo}
                            onChange={(e) => setNewGroupVideo(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            placeholder="https://..."
                          />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Membros do Grupo</label>
                          <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '4px' }}>
                            {candidates.map(cand => (
                              <div key={cand.id} style={{ marginBottom: '5px' }}>
                                <label style={{ fontSize: '12px', color: '#1e293b' }}>
                                  <input 
                                    type="checkbox"
                                    checked={newGroupMembers.includes(cand.id)}
                                    onChange={() => handleToggleGroupMember(cand.id)}
                                    style={{ marginRight: '6px' }}
                                  />
                                  {cand.nome}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button 
                          type="submit"
                          disabled={groupSubmitLoading}
                          style={{ padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', backgroundColor: '#2563eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          {groupSubmitLoading ? 'Criando...' : 'Criar Grupo'}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Right: Table list */}
                  <div style={{ float: 'left', width: '58%', boxSizing: 'border-box' }}>
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', margin: '0 0 15px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        🛡️ Grupos Cadastrados ({groups.length})
                      </h3>

                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', backgroundColor: '#f8fafc' }}>
                            <th style={{ padding: '8px' }}>Grupo</th>
                            <th style={{ padding: '8px' }}>Patrocinador</th>
                            <th style={{ padding: '8px' }}>Integrantes</th>
                            <th style={{ padding: '8px', textAlign: 'right' }}>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groups.map((group) => (
                            <tr key={group.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '8px', fontWeight: 'bold', color: '#0f172a' }}>
                                {group.nome}
                                <div style={{ fontSize: '9px', color: '#2563eb', marginTop: '2px' }}>{group.votos_count.toLocaleString()} votos</div>
                              </td>
                              <td style={{ padding: '8px' }}>
                                {group.expand?.patrocinador?.nome || 'Nenhum'}
                              </td>
                              <td style={{ padding: '8px' }}>
                                <div style={{ fontSize: '10px', color: '#475569' }}>
                                  {group.expand?.membros?.map(m => m.nome).join(', ') || 'Nenhum integrante'}
                                </div>
                              </td>
                              <td style={{ padding: '8px', textAlign: 'right' }}>
                                <button 
                                  onClick={() => handleDeleteGroup(group.id, group.nome)}
                                  style={{ padding: '3px 6px', fontSize: '10px', color: '#dc2626', border: '1px solid #fecaca', backgroundColor: '#fef2f2', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                  Excluir
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: STAGES & VIDEOS (ETAPAS & VÍDEOS) */}
              {activeSubTab === 'etapas' && (
                <div>
                  <div style={{ clear: 'both', overflow: 'auto', marginBottom: '25px' }}>
                    
                    {/* Left: Stage Form */}
                    <div style={{ float: 'left', width: '38%', marginRight: '4%', boxSizing: 'border-box' }}>
                      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', margin: '0 0 15px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                          {editingStage ? '📝 Editar Etapa' : '➕ Nova Etapa (Desafio)'}
                        </h3>
                        <form onSubmit={handleAddStage}>
                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Nome da Etapa</label>
                            <input 
                              type="text"
                              required
                              value={newStageName}
                              onChange={(e) => setNewStageName(e.target.value)}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                          </div>

                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Descrição</label>
                            <textarea 
                              value={newStageDesc}
                              onChange={(e) => setNewStageDesc(e.target.value)}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px', height: '60px' }}
                            />
                          </div>

                          <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontSize: '12px', color: '#1e293b' }}>
                              <input 
                                type="checkbox"
                                checked={newStageAtiva}
                                onChange={(e) => setNewStageAtiva(e.target.checked)}
                                style={{ marginRight: '6px' }}
                              />
                              Colocar esta Etapa no ar imediatamente
                            </label>
                          </div>

                          <button 
                            type="submit"
                            disabled={stageSubmitLoading}
                            style={{ padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', backgroundColor: '#2563eb', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                          >
                            {stageSubmitLoading ? 'Enviando...' : (editingStage ? 'Atualizar' : 'Salvar Etapa')}
                          </button>

                          {editingStage && (
                            <button 
                              type="button"
                              onClick={cancelEditStage}
                              style={{ padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', color: '#475569', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Cancelar
                            </button>
                          )}
                        </form>
                      </div>
                    </div>

                    {/* Right: Stage list */}
                    <div style={{ float: 'left', width: '58%', boxSizing: 'border-box' }}>
                      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', margin: '0 0 15px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                          🎬 Lista de Etapas (Desafios)
                        </h3>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', backgroundColor: '#f8fafc' }}>
                              <th style={{ padding: '8px' }}>Nome</th>
                              <th style={{ padding: '8px' }}>Descrição</th>
                              <th style={{ padding: '8px', textAlign: 'center' }}>Ativa</th>
                              <th style={{ padding: '8px', textAlign: 'right' }}>Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stages.map(st => (
                              <tr key={st.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '8px', fontWeight: 'bold' }}>{st.nome}</td>
                                <td style={{ padding: '8px', color: '#64748b' }}>{st.descricao || '-'}</td>
                                <td style={{ padding: '8px', textAlign: 'center' }}>
                                  <button 
                                    onClick={() => handleToggleStageActive(st.id, st.ativa)}
                                    style={{ padding: '3px 6px', fontSize: '10px', fontWeight: 'bold', color: '#ffffff', backgroundColor: st.ativa ? '#16a34a' : '#64748b', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                  >
                                    {st.ativa ? 'Ativa' : 'Inativa'}
                                  </button>
                                </td>
                                <td style={{ padding: '8px', textAlign: 'right' }}>
                                  <button 
                                    onClick={() => triggerEditStage(st)}
                                    style={{ padding: '3px 6px', fontSize: '10px', color: '#2563eb', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', borderRadius: '4px', cursor: 'pointer', marginRight: '4px' }}
                                  >
                                    Editar
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteStage(st.id, st.nome)}
                                    style={{ padding: '3px 6px', fontSize: '10px', color: '#dc2626', border: '1px solid #fecaca', backgroundColor: '#fef2f2', borderRadius: '4px', cursor: 'pointer' }}
                                  >
                                    Excluir
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>

                  {/* Videos management section */}
                  <div style={{ clear: 'both', overflow: 'auto' }}>
                    
                    {/* Left: Video upload form */}
                    <div style={{ float: 'left', width: '38%', marginRight: '4%', boxSizing: 'border-box' }}>
                      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', margin: '0 0 15px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                          🎥 Vincular Vídeo de Grupo a uma Etapa
                        </h3>
                        <form onSubmit={handleAddGroupVideo}>
                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Selecionar Etapa</label>
                            <select 
                              required
                              value={selectedStageForVideos}
                              onChange={(e) => setSelectedStageForVideos(e.target.value)}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            >
                              <option value="">Selecione...</option>
                              {stages.map(st => (
                                <option key={st.id} value={st.id}>{st.nome} {st.ativa ? '(Ativa)' : ''}</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Selecionar Grupo</label>
                            <select 
                              required
                              value={videoGroup}
                              onChange={(e) => setVideoGroup(e.target.value)}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            >
                              <option value="">Selecione...</option>
                              {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.nome}</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Patrocinador do Desafio (Opcional)</label>
                            <select 
                              value={videoSponsor}
                              onChange={(e) => setVideoSponsor(e.target.value)}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            >
                              <option value="">Usar o padrão do grupo</option>
                              {sponsors.map(s => (
                                <option key={s.id} value={s.id}>{s.nome}</option>
                              ))}
                            </select>
                          </div>

                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Vídeo do Desafio (Fazer Upload)</label>
                            <input 
                              type="file"
                              accept="video/*"
                              onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)}
                              style={{ width: '100%', fontSize: '12px' }}
                            />
                          </div>

                          <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Ou URL do Vídeo (Fallback)</label>
                            <input 
                              type="text"
                              value={videoUrl}
                              onChange={(e) => setVideoUrl(e.target.value)}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                              placeholder="https://..."
                            />
                          </div>

                          <button 
                            type="submit"
                            disabled={videoSubmitLoading}
                            style={{ padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', backgroundColor: '#2563eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            {videoSubmitLoading ? 'Enviando...' : 'Salvar Vídeo'}
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Right: Stage videos table list */}
                    <div style={{ float: 'left', width: '58%', boxSizing: 'border-box' }}>
                      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', margin: '0 0 15px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                          🎥 Vídeos Vinculados nas Etapas
                        </h3>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', backgroundColor: '#f8fafc' }}>
                              <th style={{ padding: '8px' }}>Etapa</th>
                              <th style={{ padding: '8px' }}>Grupo</th>
                              <th style={{ padding: '8px' }}>Patrocinador</th>
                              <th style={{ padding: '8px', textAlign: 'right' }}>Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stageVideos.map(vid => (
                              <tr key={vid.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '8px', fontWeight: 'bold' }}>{vid.expand?.etapa?.nome || 'Desconhecida'}</td>
                                <td style={{ padding: '8px', fontWeight: 'bold', color: '#1e293b' }}>{vid.expand?.grupo?.nome || 'Desconhecido'}</td>
                                <td style={{ padding: '8px' }}>
                                  {vid.expand?.patrocinador?.nome || vid.expand?.grupo?.expand?.patrocinador?.nome || 'Nenhum'}
                                </td>
                                <td style={{ padding: '8px', textAlign: 'right' }}>
                                  <button 
                                    onClick={() => handleDeleteGroupVideo(vid.id)}
                                    style={{ padding: '3px 6px', fontSize: '10px', color: '#dc2626', border: '1px solid #fecaca', backgroundColor: '#fef2f2', borderRadius: '4px', cursor: 'pointer' }}
                                  >
                                    Excluir
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB CONTENT: HISTORY (HISTÓRICO) */}
              {activeSubTab === 'historico' && (
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 950, color: '#0f172a', margin: '0 0 15px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                    📜 Histórico de Rodadas Arquivadas
                  </h3>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', backgroundColor: '#f8fafc' }}>
                        <th style={{ padding: '8px' }}>Pergunta / Título</th>
                        <th style={{ padding: '8px' }}>Tipo</th>
                        <th style={{ padding: '8px' }}>Vencedor / Ganhador</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Votos Ganhador</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Total Votos</th>
                        <th style={{ padding: '8px' }}>Data Encerramento</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyList.map((hist) => (
                        <tr key={hist.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '8px', fontWeight: 'bold' }}>{hist.titulo}</td>
                          <td style={{ padding: '8px', textTransform: 'uppercase', fontSize: '10px' }}>{hist.tipo}</td>
                          <td style={{ padding: '8px', fontWeight: 'bold', color: '#16a34a' }}>{hist.ganhador}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{hist.votos_ganhador.toLocaleString()}</td>
                          <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{hist.votos_totais.toLocaleString()}</td>
                          <td style={{ padding: '8px' }}>
                            {formatShortDate(hist.data_encerramento)}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>
                            <button 
                              onClick={() => handleDeleteHistory(hist.id)}
                              style={{ padding: '3px 6px', fontSize: '10px', color: '#dc2626', border: '1px solid #fecaca', backgroundColor: '#fef2f2', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Excluir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB CONTENT: ADMIN TEAM (EQUIPE ADMIN) */}
              {activeSubTab === 'equipe' && (
                <div style={{ clear: 'both', overflow: 'auto' }}>
                  {/* Left: Form */}
                  <div style={{ float: 'left', width: '38%', marginRight: '4%', boxSizing: 'border-box' }}>
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', margin: '0 0 15px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        👤 Cadastrar Administrador
                      </h3>

                      {adminActionError && (
                        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '8px', borderRadius: '4px', fontSize: '12px', marginBottom: '10px', fontWeight: 'bold' }}>
                          {adminActionError}
                        </div>
                      )}
                      
                      {adminActionSuccess && (
                        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '8px', borderRadius: '4px', fontSize: '12px', marginBottom: '10px', fontWeight: 'bold' }}>
                          {adminActionSuccess}
                        </div>
                      )}

                      <form onSubmit={handleCreateAdmin}>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>E-mail Administrador</label>
                          <input 
                            type="email"
                            required
                            value={newAdminEmail}
                            onChange={(e) => setNewAdminEmail(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                          />
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Senha de Acesso</label>
                          <input 
                            type="password"
                            required
                            value={newAdminPassword}
                            onChange={(e) => setNewAdminPassword(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            placeholder="Mínimo 8 caracteres"
                          />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Confirmar Senha</label>
                          <input 
                            type="password"
                            required
                            value={newAdminPasswordConfirm}
                            onChange={(e) => setNewAdminPasswordConfirm(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            placeholder="Mínimo 8 caracteres"
                          />
                        </div>

                        <button 
                          type="submit"
                          disabled={adminSubmitLoading}
                          style={{ padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', backgroundColor: '#2563eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          {adminSubmitLoading ? 'Cadastrando...' : 'Cadastrar Admin'}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Right: Table list */}
                  <div style={{ float: 'left', width: '58%', boxSizing: 'border-box' }}>
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', margin: '0 0 15px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        👤 Administradores do Sistema ({admins.length})
                      </h3>

                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left', backgroundColor: '#f8fafc' }}>
                            <th style={{ padding: '8px' }}>E-mail Administrativo</th>
                            <th style={{ padding: '8px' }}>Identificador (ID)</th>
                            <th style={{ padding: '8px', textAlign: 'right' }}>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {admins.map((adm) => (
                            <tr key={adm.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '8px', fontWeight: 'bold', color: '#0f172a' }}>{adm.email}</td>
                              <td style={{ padding: '8px', color: '#64748b', fontFamily: 'monospace' }}>{adm.id}</td>
                              <td style={{ padding: '8px', textAlign: 'right' }}>
                                <button 
                                  onClick={() => handleDeleteAdmin(adm.id, adm.email)}
                                  style={{ padding: '3px 6px', fontSize: '10px', color: '#dc2626', border: '1px solid #fecaca', backgroundColor: '#fef2f2', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                  Excluir
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: METRICS & HEALTH (MÉTRICAS & SAÚDE) */}
              {activeSubTab === 'metrics' && (
                <div style={{ clear: 'both', overflow: 'auto' }}>
                  {/* Grid Layout for Metrics cards */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                    gap: '20px', 
                    marginTop: '10px' 
                  }}>
                    
                    {/* Card 1: Saúde & Latência do Banco */}
                    <div style={{ 
                      backgroundColor: '#1e293b', 
                      borderRadius: '12px', 
                      border: '1px solid #334155', 
                      padding: '24px', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Saúde do Banco
                          </span>
                          <span style={{ 
                            padding: '4px 10px', 
                            fontSize: '11px', 
                            fontWeight: 'bold', 
                            borderRadius: '20px', 
                            backgroundColor: pbStatus === 'online' ? 'rgba(74, 222, 128, 0.15)' : pbStatus === 'offline' ? 'rgba(248, 113, 113, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                            color: pbStatus === 'online' ? '#4ade80' : pbStatus === 'offline' ? '#f87171' : '#94a3b8',
                            border: `1px solid ${pbStatus === 'online' ? 'rgba(74, 222, 128, 0.3)' : pbStatus === 'offline' ? 'rgba(248, 113, 113, 0.3)' : 'rgba(148, 163, 184, 0.3)'}`
                          }}>
                            {pbStatus.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                          <span style={{ fontSize: '36px', fontWeight: 900, color: '#ffffff' }}>
                            {pbLatency !== null ? `${pbLatency}` : '--'}
                          </span>
                          <span style={{ fontSize: '14px', color: '#94a3b8', marginLeft: '5px', fontWeight: 'bold' }}>ms</span>
                          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Latência de resposta da API do PocketBase</p>
                        </div>
                      </div>

                      {/* Sparkline Line Chart */}
                      <div style={{ marginTop: '15px', position: 'relative' }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '8px' }}>Latência do Banco (Últimos 20 pts)</span>
                        <div style={{ width: '100%', height: '80px', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px', padding: '6px', boxSizing: 'border-box', overflow: 'hidden' }}>
                          {(() => {
                            const width = 320;
                            const height = 68;
                            const padding = 6;
                            const chartHeight = height - padding * 2;
                            const maxVal = Math.max(...latencyHistory, 50);
                            const minVal = Math.min(...latencyHistory, 0);
                            const range = maxVal - minVal;
                            
                            const points = latencyHistory.map((val, i) => {
                              const x = (i / 19) * width;
                              const y = height - padding - ((val - minVal) / (range || 1)) * chartHeight;
                              return { x, y };
                            });

                            const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                            const fillD = `${d} L ${width} ${height} L 0 ${height} Z`;

                            return (
                              <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
                                <defs>
                                  <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>
                                <path 
                                  d={fillD} 
                                  fill="url(#latencyGrad)" 
                                  style={{ transition: 'd 0.3s ease-in-out' }}
                                />
                                <path 
                                  d={d} 
                                  fill="none" 
                                  stroke="#38bdf8" 
                                  strokeWidth="2" 
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  style={{ transition: 'd 0.3s ease-in-out' }}
                                />
                              </svg>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Desempenho & Latência da Página de Votação (Next.js) */}
                    <div style={{ 
                      backgroundColor: '#1e293b', 
                      borderRadius: '12px', 
                      border: '1px solid #334155', 
                      padding: '24px', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Desempenho da Web
                          </span>
                          <span style={{ 
                            padding: '4px 10px', 
                            fontSize: '11px', 
                            fontWeight: 'bold', 
                            borderRadius: '20px', 
                            backgroundColor: webStatus === 'online' ? 'rgba(74, 222, 128, 0.15)' : webStatus === 'offline' ? 'rgba(248, 113, 113, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                            color: webStatus === 'online' ? '#4ade80' : webStatus === 'offline' ? '#f87171' : '#94a3b8',
                            border: `1px solid ${webStatus === 'online' ? 'rgba(74, 222, 128, 0.3)' : webStatus === 'offline' ? 'rgba(248, 113, 113, 0.3)' : 'rgba(148, 163, 184, 0.3)'}`
                          }}>
                            {webStatus.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                          <span style={{ fontSize: '36px', fontWeight: 900, color: '#ffffff' }}>
                            {webLatency !== null ? `${webLatency}` : '--'}
                          </span>
                          <span style={{ fontSize: '14px', color: '#94a3b8', marginLeft: '5px', fontWeight: 'bold' }}>ms</span>
                          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Tempo de resposta do servidor Next.js</p>
                        </div>
                      </div>

                      {/* Sparkline Line Chart */}
                      <div style={{ marginTop: '15px', position: 'relative' }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '8px' }}>Latência da Web (Últimos 20 pts)</span>
                        <div style={{ width: '100%', height: '80px', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px', padding: '6px', boxSizing: 'border-box', overflow: 'hidden' }}>
                          {(() => {
                            const width = 320;
                            const height = 68;
                            const padding = 6;
                            const chartHeight = height - padding * 2;
                            const maxVal = Math.max(...webLatencyHistory, 50);
                            const minVal = Math.min(...webLatencyHistory, 0);
                            const range = maxVal - minVal;
                            
                            const points = webLatencyHistory.map((val, i) => {
                              const x = (i / 19) * width;
                              const y = height - padding - ((val - minVal) / (range || 1)) * chartHeight;
                              return { x, y };
                            });

                            const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                            const fillD = `${d} L ${width} ${height} L 0 ${height} Z`;

                            return (
                              <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
                                <defs>
                                  <linearGradient id="webGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#c084fc" stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>
                                <path 
                                  d={fillD} 
                                  fill="url(#webGrad)" 
                                  style={{ transition: 'd 0.3s ease-in-out' }}
                                />
                                <path 
                                  d={d} 
                                  fill="none" 
                                  stroke="#c084fc" 
                                  strokeWidth="2" 
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  style={{ transition: 'd 0.3s ease-in-out' }}
                                />
                              </svg>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Frequência de Votos & Gráfico de Atividade */}
                    <div style={{ 
                      backgroundColor: '#1e293b', 
                      borderRadius: '12px', 
                      border: '1px solid #334155', 
                      padding: '24px', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Frequência de Votos
                          </span>
                          <span style={{ 
                            padding: '4px 10px', 
                            fontSize: '11px', 
                            fontWeight: 'bold', 
                            borderRadius: '20px', 
                            backgroundColor: votesPerMin > 100 ? 'rgba(74, 222, 128, 0.15)' : votesPerMin > 0 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                            color: votesPerMin > 100 ? '#4ade80' : votesPerMin > 0 ? '#38bdf8' : '#94a3b8',
                            border: `1px solid ${votesPerMin > 100 ? 'rgba(74, 222, 128, 0.3)' : votesPerMin > 0 ? 'rgba(56, 189, 248, 0.3)' : 'rgba(148, 163, 184, 0.3)'}`
                          }}>
                            {votesPerMin > 100 ? 'ALTA ATIVIDADE' : votesPerMin > 0 ? 'MODERADA' : 'OCIOSO'}
                          </span>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                          <span style={{ fontSize: '36px', fontWeight: 900, color: '#4ade80' }}>
                            {votesPerMin}
                          </span>
                          <span style={{ fontSize: '14px', color: '#94a3b8', marginLeft: '5px', fontWeight: 'bold' }}>votos/min</span>
                          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Frequência de votos na sessão atual</p>
                        </div>
                      </div>

                      {/* Sparkline for Voting Activity */}
                      <div style={{ marginTop: '15px', position: 'relative' }}>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '8px' }}>Atividade de Votos (Últimos 20 pts)</span>
                        <div style={{ width: '100%', height: '80px', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px', padding: '6px', boxSizing: 'border-box', overflow: 'hidden' }}>
                          {(() => {
                            const width = 320;
                            const height = 68;
                            const padding = 6;
                            const chartHeight = height - padding * 2;
                            const maxVal = Math.max(...vpmHistory, 10);
                            const minVal = Math.min(...vpmHistory, 0);
                            const range = maxVal - minVal;
                            
                            const points = vpmHistory.map((val, i) => {
                              const x = (i / 19) * width;
                              const y = height - padding - ((val - minVal) / (range || 1)) * chartHeight;
                              return { x, y };
                            });

                            const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                            const fillD = `${d} L ${width} ${height} L 0 ${height} Z`;

                            return (
                              <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
                                <defs>
                                  <linearGradient id="vpmGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#4ade80" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#4ade80" stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>
                                <path 
                                  d={fillD} 
                                  fill="url(#vpmGrad)" 
                                  style={{ transition: 'd 0.3s ease-in-out' }}
                                />
                                <path 
                                  d={d} 
                                  fill="none" 
                                  stroke="#4ade80" 
                                  strokeWidth="2" 
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  style={{ transition: 'd 0.3s ease-in-out' }}
                                />
                              </svg>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Card 4: Total de Votos Registrados */}
                    <div style={{ 
                      backgroundColor: '#1e293b', 
                      borderRadius: '12px', 
                      border: '1px solid #334155', 
                      padding: '24px', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Volume de Votos
                          </span>
                          <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>
                            {config?.tipo.toUpperCase() || 'INDIVIDUAL'}
                          </span>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                          <span style={{ fontSize: '36px', fontWeight: 900, color: '#ffffff' }}>
                            {activeTotalVotes.toLocaleString('pt-BR')}
                          </span>
                          <span style={{ fontSize: '14px', color: '#94a3b8', marginLeft: '5px', fontWeight: 'bold' }}>total</span>
                          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>Votos válidos na rodada corrente</p>
                        </div>
                      </div>
                      <div style={{ borderTop: '1px solid #334155', paddingTop: '15px', marginTop: '15px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                          Divisão por Categoria
                        </span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1' }}>
                          <span>Votos em Influenciadores:</span>
                          <span style={{ fontWeight: 'bold' }}>{totalVotesCandidates.toLocaleString('pt-BR')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
                          <span>Votos em Grupos:</span>
                          <span style={{ fontWeight: 'bold' }}>{totalVotesGroups.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 5: Relógio de Evento */}
                    <div style={{ 
                      backgroundColor: '#1e293b', 
                      borderRadius: '12px', 
                      border: '1px solid #334155', 
                      padding: '24px', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Relógio do Evento
                          </span>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
                        </div>
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '10px 0',
                          backgroundColor: '#0f172a',
                          borderRadius: '8px',
                          border: '1px solid #1e293b',
                          margin: '10px 0'
                        }}>
                          <span style={{ 
                            fontSize: '40px', 
                            fontWeight: 900, 
                            color: '#38bdf8', 
                            fontFamily: 'Courier New, Courier, monospace',
                            textShadow: '0 0 10px rgba(56, 189, 248, 0.4)',
                            letterSpacing: '2px'
                          }}>
                            {currentTime || '00:00:00'}
                          </span>
                        </div>
                      </div>
                      <div style={{ borderTop: '1px solid #334155', paddingTop: '15px', marginTop: '15px' }}>
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, textAlign: 'center' }}>
                          Sincronizado com o horário do iPad
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
