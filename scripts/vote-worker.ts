import { processVoteBatch } from '../src/lib/voteProcessor';
import { getQueueSize } from '../src/lib/redis';

const POLL_INTERVAL_MS = parseInt(process.env.WORKER_POLL_INTERVAL || '2000', 10);
const BATCH_SIZE = parseInt(process.env.WORKER_BATCH_SIZE || '500', 10);

async function startWorkerDaemon() {
  console.log('====================================================');
  console.log('🚀 Worker Daemon de Votação Mansão Influencer');
  console.log(`⏱️ Intervalo de Polling: ${POLL_INTERVAL_MS}ms | Tamanho de Lote: ${BATCH_SIZE}`);
  console.log('====================================================');

  while (true) {
    try {
      const queueSize = await getQueueSize();
      if (queueSize > 0) {
        console.log(`[Worker] Fila atual: ${queueSize} votos pendentes. Processando...`);
        const result = await processVoteBatch(BATCH_SIZE);
        console.log(
          `[Worker] Lote finalizado com sucesso. ${result.processedCount} votos persistidos (${result.candidatesUpdated} cands, ${result.groupsUpdated} grps). Restantes: ${result.remainingInQueue}`
        );
      }
    } catch (err: any) {
      console.error('[Worker Error]', err?.message || err);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

startWorkerDaemon().catch((err) => {
  console.error('[Worker Fatal Error]', err);
  process.exit(1);
});
