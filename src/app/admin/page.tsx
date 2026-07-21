'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Settings, 
  Users, 
  Lock, 
  Unlock, 
  Check, 
  Clock, 
  Save, 
  Play, 
  Square,
  Sparkles,
  BarChart3,
  Video,
  UserX,
  UserCheck,
  PlusCircle,
  Trash2,
  ExternalLink,
  Award,
  LogOut,
  RefreshCw,
  Menu,
  X,
  Pencil,
  FileVideo,
  Upload,
  Archive,
  Eye,
  Shield,
  Radio
} from 'lucide-react';
import { pb, Candidato, VotacaoConfig, Patrocinador, Grupo, HistoricoVotacao, Etapa, GrupoVideo } from '@/lib/pocketbase';

type AdminTab = 'dashboard' | 'candidatos' | 'patrocinadores' | 'grupos' | 'etapas' | 'historico' | 'equipe';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Active Admin Sub-tab
  const [activeSubTab, setActiveSubTab] = useState<AdminTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Database Data
  const [candidates, setCandidates] = useState<Candidato[]>([]);
  const [sponsors, setSponsors] = useState<Patrocinador[]>([]);
  const [groups, setGroups] = useState<Grupo[]>([]);
  const [historyList, setHistoryList] = useState<HistoricoVotacao[]>([]);
  const [config, setConfig] = useState<VotacaoConfig | null>(null);
  
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
          requestKey: 'admin_candidates_list'
        });
        setCandidates(candidatesList.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })));

        // Fetch sponsors
        const sponsorsList = await pb.collection('patrocinadores').getFullList<Patrocinador>({
          sort: 'nome',
          requestKey: 'admin_sponsors_list'
        });
        setSponsors(sponsorsList);

        // Fetch groups
        const groupsList = await pb.collection('grupos').getFullList<Grupo>({
          sort: 'nome',
          expand: 'patrocinador,membros',
          requestKey: 'admin_groups_list'
        });
        setGroups(groupsList);

        // Fetch history
        const historyData = await pb.collection('historico_votacoes').getFullList<HistoricoVotacao>({
          sort: '-created',
          requestKey: 'admin_history_list'
        });
        setHistoryList(historyData);

        // Fetch configurations
        const configList = await pb.collection('votacoes_config').getFullList<VotacaoConfig>({
          sort: '-created',
          requestKey: 'admin_config_list'
        });
        const activeConfig = configList.find(c => c.ativa === true) || configList[0] || null;
        setConfig(activeConfig);
        if (activeConfig) {
          setEditTitle(activeConfig.titulo);
          setEditType(activeConfig.tipo || 'individual');
          
          // Format date for datetime-local
          const date = new Date(activeConfig.expira_em);
          const tzOffset = date.getTimezoneOffset() * 60000;
          const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
          setEditExpire(localISOTime);
        }

        // Fetch stages (etapas)
        const stagesList = await pb.collection('etapas').getFullList<Etapa>({
          sort: 'created',
          requestKey: 'admin_stages_list'
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
          requestKey: 'admin_stage_videos_list'
        });
        setStageVideos(stageVideosList);

        // Fetch administrators
        try {
          const adminsList = await pb.admins.getFullList({
            requestKey: 'admin_admins_list'
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
        const date = new Date(updatedConfig.expira_em);
        const tzOffset = date.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
        setEditExpire(localISOTime);
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

  // Handle Admin Email/Password Login
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

  // Toggle Voting Active status
  const handleToggleActive = async () => {
    if (!config) {
      alert('Por favor, configure e salve as configurações do Paredão antes de abrir a votação!');
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

  // Toggle Candidate Eliminated status
  const handleToggleEliminated = async (candId: string, currentStatus: boolean) => {
    setActionLoadingId(candId);
    try {
      const willBeEliminated = !currentStatus;
      await pb.collection('candidatos').update(candId, {
        eliminado: willBeEliminated,
        // Auto deactivate from Paredão if eliminated, or activate if returned to house
        ativo: willBeEliminated ? false : true
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao alterar status do participante.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Candidate Ativo status (in/out of Paredão)
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
      const data = {
        titulo: editTitle || 'Quem você quer que continue na Mansão?',
        expira_em: editExpire ? new Date(editExpire).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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

  // Archive and Record voting results in history (Auditing)
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
        // Find winning group
        const winner = [...groups].sort((a, b) => b.votos_count - a.votos_count)[0];
        winnerName = winner?.nome || 'Nenhum';
        winnerVotes = winner?.votos_count || 0;
        detailsBreakdown = groups.map(g => ({ id: g.id, nome: g.nome, votos: g.votos_count }));
      } else {
        // Find winning candidate
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

  // CRUD: Add Administrator account
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

      // Reload list
      const adminsList = await pb.admins.getFullList();
      setAdmins(adminsList);
    } catch (err: any) {
      setAdminActionError(err.message || 'Erro ao cadastrar administrador. Verifique se o e-mail já está em uso.');
      console.error(err);
    } finally {
      setAdminSubmitLoading(false);
    }
  };

  // CRUD: Delete Administrator account
  const handleDeleteAdmin = async (id: string, email: string) => {
    setAdminActionError('');
    setAdminActionSuccess('');

    // Prevent self-deletion
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
      
      // Reload list
      const adminsList = await pb.admins.getFullList();
      setAdmins(adminsList);
    } catch (err: any) {
      console.error('Error deleting administrator:', err);
      setAdminActionError(err.message || 'Erro ao excluir administrador.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // CRUD: Add or Update Candidate (Supports File Uploads)
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
        // Edit Mode
        await pb.collection('candidatos').update(editingCandidate.id, formData);
        setEditingCandidate(null);
        alert('Influenciador atualizado com sucesso!');
      } else {
        // Create Mode
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

  // CRUD: Trigger Candidate Edit Mode
  const triggerEditCandidate = (cand: Candidato) => {
    setEditingCandidate(cand);
    setNewCandName(cand.nome);
    setNewCandInstagram(cand.instagram);
    setNewCandFoto(cand.foto_url);
    setCandFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // CRUD: Cancel Candidate Edit Mode
  const cancelEditCandidate = () => {
    setEditingCandidate(null);
    setNewCandName('');
    setNewCandInstagram('');
    setNewCandFoto('');
    setCandFile(null);
  };

  // CRUD: Delete Candidate
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
      alert('Erro ao deletar participante.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // CRUD: Add or Update Sponsor (Supports File Uploads)
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
        // Edit Mode
        await pb.collection('patrocinadores').update(editingSponsor.id, formData);
        setEditingSponsor(null);
        alert('Patrocinador updated successfully!');
      } else {
        // Create Mode
        await pb.collection('patrocinadores').create(formData);
        alert('Patrocinador added successfully!');
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

  // CRUD: Trigger Sponsor Edit Mode
  const triggerEditSponsor = (spon: Patrocinador) => {
    setEditingSponsor(spon);
    setNewSponName(spon.nome);
    setNewSponLogo(spon.logo_url);
    setNewSponLink(spon.link_site);
    setNewSponInstagram(spon.instagram || '');
    setSponFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // CRUD: Cancel Sponsor Edit Mode
  const cancelEditSponsor = () => {
    setEditingSponsor(null);
    setNewSponName('');
    setNewSponLogo('');
    setNewSponLink('');
    setNewSponInstagram('');
    setSponFile(null);
  };

  // CRUD: Delete Sponsor
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

  // CRUD: Toggle Member check in Group form
  const handleToggleGroupMember = (candId: string) => {
    setNewGroupMembers(prev => 
      prev.includes(candId) ? prev.filter(id => id !== candId) : [...prev, candId]
    );
  };

  // CRUD: Add Group (Supports Video File Uploads)
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
      
      // Append members list
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
      alert('Grupo criado e lançado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao criar grupo.');
    } finally {
      setGroupSubmitLoading(false);
    }
  };

  // CRUD: Delete Group
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

  // CRUD: Add or Update Stage (Etapa)
  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName) {
      alert('Preencha o nome da etapa!');
      return;
    }
    setStageSubmitLoading(true);
    try {
      if (newStageAtiva) {
        // Deactivate all other stages first
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
      alert('Etapa ativa no ar atualizada com sucesso!');
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

  // CRUD: Add or Update Group Video for Stage
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

  // CRUD: Delete History Record
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

  // Image Getters inside Admin Dashboard (with file upload fallback)
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

  // Logout admin
  const handleLogout = () => {
    pb.authStore.clear();
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setAdminEmail('');
    setAdminPassword('');
  };

  // Calculations
  const activeCandidates = config?.tipo === 'repescagem'
    ? candidates.filter(c => c.ativo === true)
    : candidates.filter(c => c.ativo === true && !c.eliminado);
  const totalVotesCandidates = activeCandidates.reduce((sum, c) => sum + c.votos_count, 0);
  const totalVotesGroups = groups.reduce((sum, g) => sum + g.votos_count, 0);
  const activeTotalVotes = config?.tipo === 'grupo' ? totalVotesGroups : totalVotesCandidates;

  // Login Overlay
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans animate-fadeIn">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-200 shadow-xl rounded-2xl p-8 max-w-md w-full flex flex-col items-center"
        >
          <div className="bg-blue-50 text-blue-600 p-4 rounded-full mb-4">
            <Lock className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-black text-slate-800 text-center mb-1">
            Painel de Auditoria
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6 text-center">
            Mansão dos Influencers
          </p>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="adminEmail" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                E-mail de Administrador
              </label>
              <input
                id="adminEmail"
                type="email"
                required
                placeholder="nome@dominio.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="adminPassword" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Senha
              </label>
              <input
                id="adminPassword"
                type="password"
                required
                placeholder="Sua senha de acesso"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {authError && (
              <p className="text-xs font-semibold text-red-500 text-center">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {authLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  ACESSAR PAINEL
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Sidebar Menu Items Definition
  const menuItems = [
    { id: 'dashboard', name: 'Painel Votação', icon: BarChart3 },
    { id: 'candidatos', name: 'Influenciadores', icon: Users },
    { id: 'patrocinadores', name: 'Patrocinadores', icon: Award },
    { id: 'grupos', name: 'Grupos (Desafios)', icon: Video },
    { id: 'etapas', name: 'Etapas (Vídeos)', icon: FileVideo },
    { id: 'historico', name: 'Histórico Votos', icon: Clock },
    { id: 'equipe', name: 'Equipe (Admins)', icon: Shield }
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans antialiased">
      
      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-slate-200/80 px-5 py-4 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Mansão Logo" className="h-7 w-auto object-contain" />
          <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
            Mansão Admin
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-600 focus:outline-hidden p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Admin Left Sidebar */}
      <aside className={`fixed inset-y-0 left-0 transform ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-40 w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-screen overflow-y-auto`}>
        
        {/* Sidebar Brand Logo */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Mansão Logo" className="h-9 w-auto object-contain shrink-0" />
          <div className="flex flex-col">
            <h2 className="text-xs font-black text-slate-900 tracking-tight leading-none uppercase">
              Mansão Admin
            </h2>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Painel de Controle
            </span>
          </div>
        </div>

        {/* Auditor Profile Card */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-black text-sm shrink-0">
            DG
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-800 leading-tight">Direção Geral</h4>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Super Admin</span>
          </div>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const IconComp = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSubTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full py-2.5 px-3.5 rounded-xl font-bold text-xs tracking-wide uppercase transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <IconComp className="w-4 h-4 shrink-0" />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Bottom Actions */}
        <div className="p-4 border-t border-slate-150 flex flex-col gap-2 mt-auto bg-slate-50/20">
          <button
            onClick={handleResetVotes}
            className="w-full py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-[10px] tracking-wide uppercase transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Zerar Votos
          </button>
          
          <a
            href="/"
            target="_blank"
            className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-[10px] tracking-wide uppercase text-center block transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-blue-500" />
            Landing Page
          </a>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] tracking-wide uppercase transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto px-4 md:px-8 py-8 z-10">
        
        {/* Main Content Section Title */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
              {activeSubTab === 'dashboard' && 'Painel de Votações'}
              {activeSubTab === 'candidatos' && 'Gerenciador de Influenciadores'}
              {activeSubTab === 'patrocinadores' && 'Gerenciador de Patrocinadores'}
              {activeSubTab === 'grupos' && 'Montador de Grupos'}
              {activeSubTab === 'etapas' && 'Etapas dos Desafios (Batalha de Grupos)'}
              {activeSubTab === 'historico' && 'Histórico de Votações'}
              {activeSubTab === 'equipe' && 'Equipe de Administradores'}
            </h2>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">
              {activeSubTab === 'dashboard' && 'Monitoramento, Métricas e Rankings'}
              {activeSubTab === 'candidatos' && 'Cadastro, Remoção, Edição e Eliminação de Participantes'}
              {activeSubTab === 'patrocinadores' && 'Gestão de marcas patrocinadoras'}
              {activeSubTab === 'grupos' && 'Montagem, Sorteio e Vinculação de Vídeos dos Desafios'}
              {activeSubTab === 'etapas' && 'Gestão de Etapas e Vinculação de Vídeos específicos para cada Grupo'}
              {activeSubTab === 'historico' && 'Histórico auditado de rodadas encerradas'}
              {activeSubTab === 'equipe' && 'Gerenciamento de contas da equipe para controle do evento'}
            </p>
          </div>
          
          <span className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/50 text-emerald-600 font-bold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
            Auditoria Conectada
          </span>
        </div>

        {activeSubTab === 'dashboard' && (
          // ================= TAB 1: DASHBOARD =================
          <div className="flex flex-col gap-8 animate-fadeIn">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Total Votes */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center gap-5">
                <div className="bg-blue-50 text-blue-600 p-4 rounded-xl">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Votos ({config?.tipo === 'grupo' ? 'Grupos' : 'Candidatos'})</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">
                    {activeTotalVotes.toLocaleString('pt-BR')}
                  </h3>
                </div>
              </div>

              {/* Card 2: Status */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between gap-5">
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-xl ${config?.ativa ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {config?.ativa ? <Play className="w-8 h-8 fill-emerald-600" /> : <Square className="w-8 h-8 fill-red-600" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Global</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`h-2.5 w-2.5 rounded-full ${config?.ativa ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      <h3 className={`text-lg font-black uppercase ${config?.ativa ? 'text-emerald-600' : 'text-red-600'}`}>
                        {config?.ativa ? 'Ativa' : 'Pausada'}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={handleToggleActive}
                    disabled={statusLoading}
                    className={`px-4 py-2 rounded-xl font-bold text-xs tracking-wider transition-all select-none cursor-pointer ${
                      config?.ativa
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    {statusLoading ? 'Aguarde...' : config?.ativa ? 'PAUSAR VOTAÇÃO' : 'ABRIR VOTAÇÃO'}
                  </button>
                  {activeTotalVotes > 0 && (
                    <button
                      onClick={handleArchiveRound}
                      disabled={archiveLoading}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Archive className="w-3.5 h-3.5 text-blue-500" />
                      {archiveLoading ? 'Arquivando...' : 'Arquivar Votação'}
                    </button>
                  )}
                </div>
              </div>

              {/* Card 3: Expiration */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center gap-5">
                <div className="bg-amber-50 text-amber-600 p-4 rounded-xl">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Término Programado</p>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-700 mt-1">
                    {config?.expira_em 
                      ? new Date(config.expira_em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                      : 'Não definido'}
                  </h3>
                </div>
              </div>

            </div>

            {/* Config & Rankings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Rankings */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h2 className="text-lg font-black text-slate-800">
                      Resultados da Votação ({config?.tipo === 'grupo' ? 'Grupos' : 'Candidatos'})
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                    Tempo Real ON
                  </span>
                </div>

                <div className="flex flex-col gap-5">
                  {config?.tipo === 'grupo' ? (
                    groups.map((group, index) => {
                      const percentage = totalVotesGroups > 0 ? (group.votos_count / totalVotesGroups) * 100 : 0;
                      return (
                        <div key={group.id} className="flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-sm text-slate-800">{group.nome}</h4>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">
                                  Patrocinador: {group.expand?.patrocinador?.nome || 'Pendente'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-black text-slate-800">{percentage.toFixed(1)}%</span>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{group.votos_count.toLocaleString('pt-BR')} votos</p>
                            </div>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50">
                            <motion.div
                              className="h-full rounded-full bg-blue-600"
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    activeCandidates.map((candidate, index) => {
                      const percentage = totalVotesCandidates > 0 ? (candidate.votos_count / totalVotesCandidates) * 100 : 0;
                      return (
                        <div key={candidate.id} className={`flex flex-col gap-2 ${candidate.eliminado ? 'opacity-50' : ''}`}>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                {index + 1}
                              </div>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={getCandFoto(candidate)}
                                alt={candidate.nome}
                                className={`w-8 h-8 rounded-full object-cover border border-slate-200 ${candidate.eliminado ? 'grayscale' : ''}`}
                              />
                              <div>
                                <h4 className="font-extrabold text-sm text-slate-800">
                                  {candidate.nome} {candidate.eliminado && <span className="text-red-500 text-[10px] font-bold">(ELIMINADO)</span>}
                                </h4>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{candidate.instagram}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-black text-slate-800">{percentage.toFixed(1)}%</span>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{candidate.votos_count.toLocaleString('pt-BR')} votos</p>
                            </div>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50">
                            <motion.div
                              className={`h-full rounded-full ${candidate.eliminado ? 'bg-red-500' : 'bg-blue-600'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Config & Participant Status */}
              <div className="flex flex-col gap-6">
                
                {/* Form Config */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-500" />
                    <h2 className="text-lg font-black text-slate-800">
                      Configurações Globais
                    </h2>
                  </div>

                  <form onSubmit={handleSaveConfig} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="title" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Pergunta do Paredão
                      </label>
                      <textarea
                        id="title"
                        rows={3}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-sm resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="type" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Tipo de Votação
                      </label>
                      <select
                        id="type"
                        value={editType}
                        onChange={(e) => setEditType(e.target.value as 'individual' | 'grupo' | 'repescagem')}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold text-sm bg-white"
                      >
                        <option value="individual">Individual (Influenciadores)</option>
                        <option value="grupo">Grupo (Desafio de Patrocinadores)</option>
                        <option value="repescagem">Repescagem (Domingo - 4 Participantes)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="expire" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Data/Hora de Término
                      </label>
                      <input
                        id="expire"
                        type="datetime-local"
                        value={editExpire}
                        onChange={(e) => setEditExpire(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {saveLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : saveSuccess ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          SALVO!
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          SALVAR VOTAÇÃO
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Painel Realtime de Status dos Participantes */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-5 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <div>
                      <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider leading-none">
                        Participantes (Status)
                      </h2>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                        Controle em tempo real
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                    {candidates.map((cand) => {
                      const isEliminated = cand.eliminado;
                      const isActive = cand.ativo !== false;
                      
                      return (
                        <div key={cand.id} className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/50 transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={getCandFoto(cand)}
                              alt={cand.nome}
                              className={`w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 ${isEliminated ? 'grayscale' : ''}`}
                            />
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-xs text-slate-800 leading-tight truncate">
                                {cand.nome}
                              </h4>
                              <span className="text-[9px] font-bold text-slate-450 uppercase leading-none truncate block">
                                {cand.instagram}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {/* Toggle 1: No Paredão */}
                            <div className="flex flex-col items-center">
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Paredão</span>
                              <button
                                type="button"
                                onClick={() => handleToggleCandidateAtivo(cand.id, isActive)}
                                disabled={actionLoadingId === cand.id}
                                className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                  isActive && !isEliminated ? 'bg-blue-600' : 'bg-slate-200'
                                } ${isEliminated ? 'cursor-not-allowed opacity-50' : ''}`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                    isActive && !isEliminated ? 'translate-x-3' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>

                            {/* Toggle 2: Na Casa */}
                            <div className="flex flex-col items-center">
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Na Casa</span>
                              <button
                                type="button"
                                onClick={() => handleToggleEliminated(cand.id, isEliminated)}
                                disabled={actionLoadingId === cand.id}
                                className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                  !isEliminated ? 'bg-emerald-600' : 'bg-slate-200'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                    !isEliminated ? 'translate-x-3' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'candidatos' && (
          // ================= TAB 2: INFLUENCERS (CRUD / EDIT / FILE UPLOAD) =================
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            
            {/* Create / Edit Candidate Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-5 h-fit">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                {editingCandidate ? 'Editar Influenciador' : 'Cadastrar Influenciador'}
              </h2>
              
              <form onSubmit={handleAddCandidate} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="candName" className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                  <input
                    id="candName"
                    type="text"
                    required
                    value={newCandName}
                    onChange={(e) => setNewCandName(e.target.value)}
                    placeholder="Ex: Aline Faria"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="candInstagram" className="text-xs font-bold text-slate-500 uppercase">Instagram (@)</label>
                  <input
                    id="candInstagram"
                    type="text"
                    required
                    value={newCandInstagram}
                    onChange={(e) => setNewCandInstagram(e.target.value)}
                    placeholder="Ex: @alinefaria"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="candFotoFile" className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-blue-500" />
                    Enviar Imagem de Perfil (Local)
                  </label>
                  <input
                    id="candFotoFile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCandFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 p-1.5 rounded-xl"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="candFoto" className="text-xs font-bold text-slate-500 uppercase">Ou URL da Foto (Web)</label>
                  <input
                    id="candFoto"
                    type="url"
                    disabled={candFile !== null}
                    value={newCandFoto}
                    onChange={(e) => setNewCandFoto(e.target.value)}
                    placeholder={candFile ? "Desabilitado (imagem local selecionada)" : "Cole um link de imagem (Unsplash/Imgur)"}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={candSubmitLoading}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {candSubmitLoading ? 'Salvando...' : editingCandidate ? 'SALVAR ALTERAÇÕES' : 'ADICIONAR INFLUENCER'}
                  </button>
                  
                  {editingCandidate && (
                    <button
                      type="button"
                      onClick={cancelEditCandidate}
                      className="py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                    >
                      CANCELAR
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Candidates List */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-500" />
                Participantes Cadastrados
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {candidates.map((cand) => (
                  <div
                    key={cand.id}
                    className={`flex items-center justify-between p-4 bg-slate-50 border rounded-2xl transition-all ${
                      cand.eliminado ? 'border-red-100 opacity-75' : 'border-slate-200'
                    } ${editingCandidate?.id === cand.id ? 'ring-2 ring-blue-500 bg-blue-50/10' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getCandFoto(cand)}
                        alt={cand.nome}
                        className={`w-12 h-12 rounded-full object-cover border border-slate-200 ${
                          cand.eliminado ? 'grayscale' : ''
                        }`}
                      />
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800 leading-tight">
                          {cand.nome}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{cand.instagram}</span>
                        <p className="text-[9px] font-bold text-blue-600 uppercase mt-0.5">
                          {cand.votos_count.toLocaleString()} votos
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => triggerEditCandidate(cand)}
                        disabled={actionLoadingId === cand.id}
                        className="p-2 rounded-lg bg-slate-200 hover:bg-blue-100 hover:text-blue-600 text-slate-500 transition-colors cursor-pointer"
                        title="Editar participante"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleEliminated(cand.id, cand.eliminado)}
                        disabled={actionLoadingId === cand.id}
                        className={`p-2 rounded-lg cursor-pointer transition-colors ${
                          cand.eliminado
                            ? 'bg-slate-200 hover:bg-slate-350 text-slate-650'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                        title={cand.eliminado ? 'Re-admitir participante' : 'Eliminar participante'}
                      >
                        {cand.eliminado ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteCandidate(cand.id, cand.nome)}
                        disabled={actionLoadingId === cand.id}
                        className="p-2 rounded-lg bg-slate-200 hover:bg-red-100 hover:text-red-600 text-slate-500 transition-colors cursor-pointer"
                        title="Deletar participante"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {activeSubTab === 'patrocinadores' && (
          // ================= TAB 3: SPONSORS (CRUD / EDIT / FILE UPLOAD) =================
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            
            {/* Create / Edit Sponsor Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-5 h-fit">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                {editingSponsor ? 'Editar Patrocinador' : 'Cadastrar Patrocinador'}
              </h2>

              <form onSubmit={handleAddSponsor} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="sponName" className="text-xs font-bold text-slate-500 uppercase">Nome da Marca</label>
                  <input
                    id="sponName"
                    type="text"
                    required
                    value={newSponName}
                    onChange={(e) => setNewSponName(e.target.value)}
                    placeholder="Ex: Coca-Cola"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="sponLogoFile" className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-blue-500" />
                    Enviar Imagem do Logo (Local)
                  </label>
                  <input
                    id="sponLogoFile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSponFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 p-1.5 rounded-xl"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="sponLogo" className="text-xs font-bold text-slate-500 uppercase">Ou URL do Logo (Web)</label>
                  <input
                    id="sponLogo"
                    type="url"
                    disabled={sponFile !== null}
                    value={newSponLogo}
                    onChange={(e) => setNewSponLogo(e.target.value)}
                    placeholder={sponFile ? "Desabilitado (logo local selecionado)" : "Link do logo/imagem"}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="sponLink" className="text-xs font-bold text-slate-500 uppercase">Link do Site</label>
                  <input
                    id="sponLink"
                    type="url"
                    value={newSponLink}
                    onChange={(e) => setNewSponLink(e.target.value)}
                    placeholder="https://coca-cola.com.br"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="sponInstagram" className="text-xs font-bold text-slate-500 uppercase">Instagram (Opcional)</label>
                  <input
                    id="sponInstagram"
                    type="text"
                    value={newSponInstagram}
                    onChange={(e) => setNewSponInstagram(e.target.value)}
                    placeholder="@marca_oficial"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={sponSubmitLoading}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {sponSubmitLoading ? 'Salvando...' : editingSponsor ? 'SALVAR ALTERAÇÕES' : 'ADICIONAR PATROCINADOR'}
                  </button>

                  {editingSponsor && (
                    <button
                      type="button"
                      onClick={cancelEditSponsor}
                      className="py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                    >
                      CANCELAR
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Sponsors List */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-slate-500" />
                Marcas Cadastradas
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sponsors.map((spon) => (
                  <div
                    key={spon.id}
                    className={`flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl ${
                      editingSponsor?.id === spon.id ? 'ring-2 ring-blue-500 bg-blue-50/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getSponLogo(spon)}
                        alt={spon.nome}
                        className="w-12 h-12 rounded object-contain border border-slate-200 bg-white p-1"
                      />
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-850 leading-tight">
                          {spon.nome}
                        </h4>
                        <a
                          href={spon.link_site}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-0.5 mt-0.5"
                        >
                          Website <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        {spon.instagram && (
                          <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                            Instagram: <strong className="text-slate-550">{spon.instagram}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => triggerEditSponsor(spon)}
                        disabled={actionLoadingId === spon.id}
                        className="p-2 rounded-lg bg-slate-200 hover:bg-blue-100 hover:text-blue-600 text-slate-500 transition-colors cursor-pointer"
                        title="Editar patrocinador"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSponsor(spon.id, spon.nome)}
                        disabled={actionLoadingId === spon.id}
                        className="p-2 rounded-lg bg-slate-200 hover:bg-red-100 hover:text-red-600 text-slate-500 transition-colors cursor-pointer"
                        title="Deletar patrocinador"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {activeSubTab === 'grupos' && (
          // ================= TAB 4: GROUPS (CRUD / ASSEMBLY / VIDEO UPLOAD) =================
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            
            {/* Assemble Group Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-5 h-fit">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                Montar Grupo (Desafio)
              </h2>

              <form onSubmit={handleAddGroup} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="groupName" className="text-xs font-bold text-slate-500 uppercase">Nome do Grupo</label>
                  <input
                    id="groupName"
                    type="text"
                    required
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Ex: Grupo Roxo"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="groupSponsor" className="text-xs font-bold text-slate-500 uppercase">Patrocinador do Desafio</label>
                  <select
                    id="groupSponsor"
                    required
                    value={newGroupSponsor}
                    onChange={(e) => setNewGroupSponsor(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  >
                    <option value="">Selecione o Patrocinador...</option>
                    {sponsors.map((spon) => (
                      <option key={spon.id} value={spon.id}>{spon.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="groupVideoFile" className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 cursor-pointer">
                    <FileVideo className="w-3.5 h-3.5 text-blue-500" />
                    Enviar Arquivo de Vídeo (Local MP4)
                  </label>
                  <input
                    id="groupVideoFile"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setGroupVideoFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 p-1.5 rounded-xl"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="groupVideo" className="text-xs font-bold text-slate-500 uppercase">Ou URL do Vídeo (Vimeo/Web)</label>
                  <input
                    id="groupVideo"
                    type="url"
                    disabled={groupVideoFile !== null}
                    value={newGroupVideo}
                    onChange={(e) => setNewGroupVideo(e.target.value)}
                    placeholder={groupVideoFile ? "Desabilitado (vídeo local selecionado)" : "Link do vídeo para o player"}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>

                {/* Member Checkbox checklist */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Selecionar Integrantes</span>
                  <div className="border border-slate-200 rounded-xl p-3 max-h-48 overflow-y-auto flex flex-col gap-2">
                    {candidates.map((cand) => (
                      <label key={cand.id} className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newGroupMembers.includes(cand.id)}
                          onChange={() => handleToggleGroupMember(cand.id)}
                          className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 w-4 h-4"
                        />
                        {cand.nome} {cand.eliminado && <span className="text-red-500 font-extrabold text-[9px]">(Eliminado)</span>}
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={groupSubmitLoading}
                  className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {groupSubmitLoading ? 'Sorteando/Criando...' : 'MONTAR E LANÇAR GRUPO'}
                </button>
              </form>
            </div>

            {/* Groups list */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Video className="w-5 h-5 text-slate-500" />
                Grupos Ativos no Desafio
              </h2>

              <div className="flex flex-col gap-4">
                {groups.map((group) => {
                  const sponsorObj = group.expand?.patrocinador;
                  const membersList = group.expand?.membros || [];
                  const resolvedVideoUrl = group.video_file ? pb.files.getUrl(group, group.video_file) : group.video_url;
                  
                  return (
                    <div
                      key={group.id}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl"
                    >
                      <div className="flex flex-col gap-2">
                        <div>
                          <h4 className="font-extrabold text-base text-slate-800 leading-tight">
                            {group.nome}
                          </h4>
                          <span className="text-xs font-bold text-slate-400">
                            Patrocinador: <strong className="text-slate-600">{sponsorObj?.nome || 'Não definido'}</strong>
                          </span>
                        </div>

                        {/* Members tag list */}
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {membersList.map((m) => (
                            <span
                              key={m.id}
                              className="text-[9px] font-bold text-slate-600 bg-white border border-slate-250 px-2 py-0.5 rounded-full"
                            >
                              {m.nome}
                            </span>
                          ))}
                        </div>
                        
                        <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">
                          {group.votos_count.toLocaleString()} votos acumulados
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                        <span className="text-[10px] text-slate-400 font-mono text-ellipsis overflow-hidden max-w-44 block" title={resolvedVideoUrl}>
                          {resolvedVideoUrl.slice(0, 30)}...
                        </span>
                        <button
                          onClick={() => handleDeleteGroup(group.id, group.nome)}
                          disabled={actionLoadingId === group.id}
                          className="p-2 rounded-lg bg-slate-200 hover:bg-red-100 hover:text-red-600 text-slate-500 transition-colors cursor-pointer"
                          title="Deletar grupo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

        {activeSubTab === 'etapas' && (
          // ================= TAB: ETAPAS =================
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            
            {/* Column 1: Manage Stages */}
            <div className="flex flex-col gap-6 h-fit">
              
              {/* Form Create/Edit Stage */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-blue-600" />
                  {editingStage ? 'Editar Etapa' : 'Cadastrar Nova Etapa'}
                </h2>

                <form onSubmit={handleAddStage} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="stageName" className="text-xs font-bold text-slate-500 uppercase">Nome da Etapa</label>
                    <input
                      id="stageName"
                      type="text"
                      required
                      value={newStageName}
                      onChange={(e) => setNewStageName(e.target.value)}
                      placeholder="Ex: Etapa 1: Apresentação"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="stageDesc" className="text-xs font-bold text-slate-500 uppercase">Descrição (Opcional)</label>
                    <textarea
                      id="stageDesc"
                      value={newStageDesc}
                      onChange={(e) => setNewStageDesc(e.target.value)}
                      placeholder="Descreva brevemente o desafio desta etapa..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <input
                      id="stageAtiva"
                      type="checkbox"
                      checked={newStageAtiva}
                      onChange={(e) => setNewStageAtiva(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="stageAtiva" className="text-xs font-bold text-slate-600 cursor-pointer select-none uppercase">
                      Definir como etapa ativa (no ar)
                    </label>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      disabled={stageSubmitLoading}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      {stageSubmitLoading ? 'Salvando...' : editingStage ? 'SALVAR ALTERAÇÕES' : 'CRIAR ETAPA'}
                    </button>
                    
                    {editingStage && (
                      <button
                        type="button"
                        onClick={cancelEditStage}
                        className="py-3 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                      >
                        CANCELAR
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* List of Stages */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Archive className="w-4 h-4 text-slate-400" />
                  Etapas Cadastradas
                </h2>

                {/* Quick Active Stage Selector */}
                {stages.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <label htmlFor="activeStageSelect" className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        Etapa Ativa no Ar (Ao Vivo)
                      </label>
                    </div>
                    <select
                      id="activeStageSelect"
                      value={stages.find(s => s.ativa)?.id || ""}
                      onChange={async (e) => {
                        const targetId = e.target.value;
                        await handleSetActiveStage(targetId);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-250 text-slate-800 text-xs font-bold bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="">-- Nenhuma etapa ativa (Pausada) --</option>
                      {stages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {stages.length === 0 ? (
                  <p className="text-xs font-bold text-slate-400 text-center py-6">Nenhuma etapa cadastrada.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {stages.map((stage) => (
                      <div
                        key={stage.id}
                        className={`p-4 border rounded-xl flex flex-col gap-2 transition-all ${
                          stage.ativa 
                            ? 'bg-emerald-50/20 border-emerald-200' 
                            : 'bg-slate-50 border-slate-200'
                        } ${editingStage?.id === stage.id ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-800 leading-tight">
                              {stage.nome}
                            </h4>
                            {stage.descricao && (
                              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                                {stage.descricao}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => triggerEditStage(stage)}
                              className="p-1.5 rounded-md hover:bg-blue-50 hover:text-blue-600 text-slate-400 transition-colors cursor-pointer"
                              title="Editar etapa"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStage(stage.id, stage.nome)}
                              className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-650 text-slate-400 transition-colors cursor-pointer"
                              title="Excluir etapa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-1">
                          <span className={`text-[9px] font-bold uppercase ${
                            stage.ativa ? 'text-emerald-600' : 'text-slate-400'
                          }`}>
                            {stage.ativa ? 'Etapa Ativa' : 'Inativa'}
                          </span>
                          
                          <button
                            onClick={() => handleToggleStageActive(stage.id, stage.ativa)}
                            disabled={actionLoadingId === stage.id}
                            className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase transition-all select-none cursor-pointer border ${
                              stage.ativa 
                                ? 'bg-slate-150 border-slate-250 text-slate-650 hover:bg-slate-200' 
                                : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {stage.ativa ? 'DESATIVAR' : 'ATIVAR'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Stage Videos Management */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Stage Select and General Info */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <FileVideo className="w-5 h-5 text-slate-500" />
                      Vídeos por Etapa
                    </h2>
                    <p className="text-xs font-semibold text-slate-400 mt-1">
                      Selecione a etapa para gerenciar os vídeos enviados pelos grupos.
                    </p>
                  </div>
                  
                  <div className="w-full sm:w-64">
                    <select
                      value={selectedStageForVideos}
                      onChange={(e) => setSelectedStageForVideos(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white font-bold"
                    >
                      <option value="">Selecione uma etapa...</option>
                      {stages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.nome} {stage.ativa ? '(Ativa)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {selectedStageForVideos ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Form block to add video to stage */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-5 h-fit">
                    <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                      <PlusCircle className="w-4 h-4 text-blue-600" />
                      Enviar Vídeo de Grupo
                    </h3>
                    
                    <form onSubmit={handleAddGroupVideo} className="flex flex-col gap-4">
                      
                      <div className="flex flex-col gap-1">
                        <label htmlFor="videoGroupSelect" className="text-xs font-bold text-slate-500 uppercase">Selecione o Grupo</label>
                        <select
                          id="videoGroupSelect"
                          required
                          value={videoGroup}
                          onChange={(e) => setVideoGroup(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                        >
                          <option value="">Selecione o Grupo...</option>
                          {groups.map((group) => (
                            <option key={group.id} value={group.id}>{group.nome}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label htmlFor="videoSponsorSelect" className="text-xs font-bold text-slate-500 uppercase">Patrocinador da Etapa (Opcional)</label>
                        <select
                          id="videoSponsorSelect"
                          value={videoSponsor}
                          onChange={(e) => setVideoSponsor(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                        >
                          <option value="">Mesmo do Grupo / Nenhum...</option>
                          {sponsors.map((spon) => (
                            <option key={spon.id} value={spon.id}>{spon.nome}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label htmlFor="stageVideoFile" className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 cursor-pointer">
                          <Upload className="w-3.5 h-3.5 text-blue-500" />
                          Enviar Arquivo de Vídeo (Local MP4)
                        </label>
                        <input
                          id="stageVideoFile"
                          type="file"
                          accept="video/*"
                          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                          className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 p-1.5 rounded-xl"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label htmlFor="stageVideoUrl" className="text-xs font-bold text-slate-500 uppercase">Ou URL do Vídeo (Vimeo/Web)</label>
                        <input
                          id="stageVideoUrl"
                          type="url"
                          disabled={videoFile !== null}
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder={videoFile ? "Desabilitado (vídeo local selecionado)" : "Cole a URL do vídeo"}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={videoSubmitLoading}
                        className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        {videoSubmitLoading ? 'Enviando...' : 'SALVAR VÍDEO DA ETAPA'}
                      </button>
                    </form>
                  </div>

                  {/* Status / List of stage videos for the selected stage */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-5">
                    <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                      <Play className="w-4 h-4 text-slate-500" />
                      Vídeos Vinculados nesta Etapa
                    </h3>

                    <div className="flex flex-col gap-4">
                      {groups.map((group) => {
                        const sv = stageVideos.find(v => v.grupo === group.id && v.etapa === selectedStageForVideos);
                        const groupSponsorObj = group.expand?.patrocinador;
                        const stageSponsorObj = sv?.expand?.patrocinador;
                        const activeSponsor = stageSponsorObj || groupSponsorObj;
                        
                        return (
                          <div key={group.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-extrabold text-sm text-slate-800 leading-tight">
                                  {group.nome}
                                </h4>
                                <span className="text-[10px] font-bold text-slate-400 mt-1 block">
                                  Patrocinador: <strong className="text-slate-500">{activeSponsor?.nome || 'Nenhum'}</strong>
                                </span>
                              </div>
                              
                              {sv && (
                                <button
                                  onClick={() => handleDeleteGroupVideo(sv.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Remover vídeo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {sv ? (
                              <div className="flex flex-col gap-2">
                                <div className="h-[320px] w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                                  <video
                                    src={sv.video_file ? pb.files.getUrl(sv, sv.video_file) : sv.video_url}
                                    controls
                                    playsInline
                                    className="h-full max-w-full object-contain mx-auto"
                                  />
                                </div>
                                
                                <div className="flex items-center justify-between text-[10px] font-bold text-blue-600 uppercase border-t border-slate-200/50 pt-2 mt-1">
                                  <span>Votos na Etapa:</span>
                                  <span>{(sv.votos_count || 0).toLocaleString()} votos</span>
                                </div>
                              </div>
                            ) : (
                              <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center text-[11px] font-bold text-slate-400 uppercase bg-white">
                                Sem vídeo nesta etapa
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400 font-bold text-sm">
                  Crie ou selecione uma etapa no menu acima para gerenciar os vídeos dos grupos.
                </div>
              )}
            </div>

          </div>
        )}

        {activeSubTab === 'historico' && (
          // ================= TAB 5: HISTORY (AUDITING) =================
          <div className="flex flex-col gap-6 animate-fadeIn">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500" />
              Histórico de Votações Encerradas (Auditorias Salvas)
            </h2>

            {historyList.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400 font-bold text-sm">
                Nenhuma votação arquivada no histórico de auditoria até o momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {historyList.map((hist) => {
                  const breakdown = Array.isArray(hist.detalhes) ? hist.detalhes : [];
                  
                  return (
                    <div key={hist.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                            hist.tipo === 'grupo' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            Votação por {hist.tipo === 'grupo' ? 'Grupos' : 'Individual'}
                          </span>
                          <h4 className="font-extrabold text-sm text-slate-850 mt-1.5 leading-tight">{hist.titulo}</h4>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                            Encerrada em: {new Date(hist.data_encerramento).toLocaleString('pt-BR')}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteHistory(hist.id)}
                          disabled={actionLoadingId === hist.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                          title="Excluir do Histórico"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="border-t border-slate-100 pt-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Vencedor(a) Oficial</span>
                        <div className="flex items-center justify-between mt-1 bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-xl">
                          <span className="font-black text-xs text-emerald-700">{hist.ganhador}</span>
                          <span className="font-bold text-xs text-emerald-700">{hist.votos_ganhador.toLocaleString()} votos</span>
                        </div>
                      </div>

                      {/* Vote breakdown table */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Breakdown dos Votos</span>
                        <div className="border border-slate-100 rounded-xl overflow-hidden mt-1.5 text-[11px]">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 text-left">
                                <th className="p-2">Nome</th>
                                <th className="p-2 text-right">Votos</th>
                                <th className="p-2 text-right">%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {breakdown.map((item: any, idx: number) => {
                                const percentage = hist.votos_totais > 0 ? (item.votos / hist.votos_totais) * 100 : 0;
                                return (
                                  <tr key={idx} className="border-b border-slate-50 last:border-0 font-medium text-slate-650 hover:bg-slate-50/30">
                                    <td className="p-2">{item.nome} {item.eliminado && '(Eliminado)'}</td>
                                    <td className="p-2 text-right">{item.votos.toLocaleString()}</td>
                                    <td className="p-2 text-right font-semibold">{percentage.toFixed(1)}%</td>
                                  </tr>
                                );
                              })}
                              <tr className="bg-slate-100/50 font-bold border-t border-slate-100 text-slate-800">
                                <td className="p-2 text-slate-500">Total Auditado</td>
                                <td className="p-2 text-right">{hist.votos_totais.toLocaleString()}</td>
                                <td className="p-2 text-right">100%</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'equipe' && (
          // ================= TAB 7: TEAM (ADMINISTRATORS) =================
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            
            {/* Create Administrator Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-5 h-fit">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                Cadastrar Administrador
              </h2>
              
              <form onSubmit={handleCreateAdmin} className="flex flex-col gap-4">
                {adminActionError && (
                  <div className="bg-red-50 border border-red-200/50 text-red-650 text-xs font-bold p-3 rounded-xl">
                    {adminActionError}
                  </div>
                )}
                {adminActionSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200/50 text-emerald-750 text-xs font-bold p-3 rounded-xl">
                    {adminActionSuccess}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label htmlFor="adminEmail" className="text-xs font-bold text-slate-500 uppercase">E-mail de Acesso</label>
                  <input
                    id="adminEmail"
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="Ex: equipe@evento.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="adminPassword" className="text-xs font-bold text-slate-500 uppercase">Senha (mín. 8 caracteres)</label>
                  <input
                    id="adminPassword"
                    type="password"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Sua senha secreta"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="adminPasswordConfirm" className="text-xs font-bold text-slate-500 uppercase">Confirmar Senha</label>
                  <input
                    id="adminPasswordConfirm"
                    type="password"
                    required
                    value={newAdminPasswordConfirm}
                    onChange={(e) => setNewAdminPasswordConfirm(e.target.value)}
                    placeholder="Confirme a senha"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adminSubmitLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold text-xs tracking-wider uppercase shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {adminSubmitLoading ? 'Cadastrando...' : 'Adicionar à Equipe'}
                </button>
              </form>
            </div>

            {/* Administrators List */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Membros da Equipe ({admins.length})
                </h2>
                
                <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-full">
                  Acesso Total ao PocketBase
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left bg-slate-50/50">
                      <th className="py-3 px-4">Administrador (E-mail)</th>
                      <th className="py-3 px-4">Data de Cadastro</th>
                      <th className="py-3 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((adm) => {
                      const isCurrentUser = pb.authStore.model?.id === adm.id;
                      
                      return (
                        <tr key={adm.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/30 text-xs font-semibold text-slate-750">
                          <td className="py-4 px-4 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0"></span>
                            <span>{adm.email}</span>
                            {isCurrentUser && (
                              <span className="bg-blue-50 text-blue-600 font-bold text-[8px] uppercase tracking-wide px-1.5 py-0.5 rounded border border-blue-200/50">
                                Você
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-slate-400">
                            {new Date(adm.created).toLocaleString('pt-BR')}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleDeleteAdmin(adm.id, adm.email)}
                              disabled={actionLoadingId === adm.id || isCurrentUser}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center ${
                                isCurrentUser
                                  ? 'text-slate-200 cursor-not-allowed'
                                  : 'hover:bg-red-50 text-slate-400 hover:text-red-500'
                              }`}
                              title={isCurrentUser ? "Você não pode excluir a sua própria conta" : "Remover Administrador"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
