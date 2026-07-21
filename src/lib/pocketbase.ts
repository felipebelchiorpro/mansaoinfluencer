import PocketBase from 'pocketbase';

export interface Candidato {
  id: string;
  created: string;
  updated: string;
  nome: string;
  instagram: string;
  foto_url: string;
  foto_file?: string;
  votos_count: number;
  eliminado: boolean;
  ativo: boolean;
}

export interface VotacaoConfig {
  id: string;
  created: string;
  updated: string;
  titulo: string;
  ativa: boolean;
  expira_em: string;
  tipo: 'individual' | 'grupo' | 'repescagem';
}

export interface Patrocinador {
  id: string;
  created: string;
  updated: string;
  nome: string;
  logo_url: string;
  logo_file?: string;
  link_site: string;
  instagram?: string;
}

export interface Grupo {
  id: string;
  created: string;
  updated: string;
  nome: string;
  video_url: string;
  video_file?: string;
  patrocinador: string;
  membros: string[];
  votos_count: number;
  expand?: {
    patrocinador?: Patrocinador;
    membros?: Candidato[];
  };
}

export interface HistoricoVotacao {
  id: string;
  created: string;
  updated: string;
  titulo: string;
  tipo: 'individual' | 'grupo' | 'repescagem';
  ganhador: string;
  votos_ganhador: number;
  votos_totais: number;
  detalhes: any;
  data_encerramento: string;
}

export interface Etapa {
  id: string;
  created: string;
  updated: string;
  nome: string;
  ativa: boolean;
  descricao?: string;
}

export interface GrupoVideo {
  id: string;
  created: string;
  updated: string;
  grupo: string;
  etapa: string;
  video_url: string;
  video_file?: string;
  patrocinador?: string;
  votos_count: number;
  expand?: {
    grupo?: Grupo;
    etapa?: Etapa;
    patrocinador?: Patrocinador;
  };
}

const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://169.58.35.227';
const pb = new PocketBase(pocketbaseUrl);

// Disable auto cancellation to prevent concurrent request issues in Next.js
pb.autoCancellation(false);

export { pb };
