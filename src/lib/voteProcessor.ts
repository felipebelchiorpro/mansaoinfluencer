import { popVoteBatch, requeueVotes, getQueueSize, VoteEvent } from './redis';
import { pb } from './pocketbase';

export interface BatchProcessingResult {
  processedCount: number;
  remainingInQueue: number;
  candidatesUpdated: number;
  groupsUpdated: number;
}

/**
 * Autentica o client do PocketBase como Admin para permitir escritas com privilégios.
 */
export async function authenticatePocketBaseAdmin() {
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL || 'antigravity@vortexsync.pro';
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD || 'jhgiBKSRGzmie7z';
  
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(adminEmail, adminPassword);
  }
}

/**
 * Consome os votos enfileirados no Redis, consolida os totais acumulados em memória
 * e executa atualizações agregadas no PocketBase em lote.
 * 
 * Reduz milhares de gravações individuais para poucas atualizações por ciclo.
 */
export async function processVoteBatch(batchSize: number = 500): Promise<BatchProcessingResult> {
  const votes: VoteEvent[] = await popVoteBatch(batchSize);

  if (!votes || votes.length === 0) {
    return {
      processedCount: 0,
      remainingInQueue: await getQueueSize(),
      candidatesUpdated: 0,
      groupsUpdated: 0,
    };
  }

  // Agrupa os incrementos de votos em memória
  const candidateVotes = new Map<string, number>();
  const groupVotes = new Map<string, number>();

  for (const vote of votes) {
    if (vote.candidatoId) {
      candidateVotes.set(vote.candidatoId, (candidateVotes.get(vote.candidatoId) || 0) + 1);
    }
    if (vote.grupoId) {
      groupVotes.set(vote.grupoId, (groupVotes.get(vote.grupoId) || 0) + 1);
    }
  }

  try {
    await authenticatePocketBaseAdmin();

    // Busca a etapa ativa atual (caso haja votação de grupo)
    let activeStageId: string | null = null;
    if (groupVotes.size > 0) {
      try {
        const activeStages = await pb.collection('etapas').getFullList({
          filter: 'ativa = true',
          requestKey: `proc_stage_${Date.now()}`
        });
        if (activeStages.length > 0) {
          activeStageId = activeStages[0].id;
        }
      } catch (err) {
        console.warn('[VoteProcessor] Aviso ao buscar etapa ativa:', err);
      }
    }

    let candidatesUpdated = 0;
    let groupsUpdated = 0;

    // 1. Atualização agregada por candidato
    for (const [candidateId, count] of candidateVotes.entries()) {
      try {
        await pb.collection('candidatos').update(candidateId, {
          'votos_count+': count,
        });
        candidatesUpdated++;
      } catch (err) {
        console.error(`[VoteProcessor] Erro ao atualizar candidato ${candidateId}:`, err);
      }
    }

    // 2. Atualização agregada por grupo & vídeo de etapa
    for (const [groupId, count] of groupVotes.entries()) {
      try {
        // Atualiza total acumulado do grupo
        await pb.collection('grupos').update(groupId, {
          'votos_count+': count,
        });
        groupsUpdated++;

        // Atualiza o vídeo do grupo na etapa ativa
        if (activeStageId) {
          const stageVideos = await pb.collection('grupo_videos').getFullList({
            filter: `grupo = "${groupId}" && etapa = "${activeStageId}"`,
            requestKey: `proc_sv_${groupId}_${Date.now()}`
          });
          if (stageVideos.length > 0) {
            await pb.collection('grupo_videos').update(stageVideos[0].id, {
              'votos_count+': count,
            });
          }
        }
      } catch (err) {
        console.error(`[VoteProcessor] Erro ao atualizar grupo ${groupId}:`, err);
      }
    }

    const remainingInQueue = await getQueueSize();
    return {
      processedCount: votes.length,
      remainingInQueue,
      candidatesUpdated,
      groupsUpdated,
    };

  } catch (error: any) {
    console.error('[VoteProcessor ERROR] Falha ao persistir no PocketBase. Reenfileirando votos...', error);
    // Garantia de ZERO Perda de Votos: Devolve os votos não persistidos de volta ao Redis
    await requeueVotes(votes);
    throw error;
  }
}
