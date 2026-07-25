import { pushVoteToQueue, popVoteBatch, getQueueSize } from '../src/lib/redis';

async function runBenchmark() {
  console.log('🧪 Iniciando teste de carga e enfileiramento em Redis...');

  const TOTAL_VOTES = 500;
  const startTime = Date.now();

  const promises = [];
  for (let i = 0; i < TOTAL_VOTES; i++) {
    const isGroup = i % 2 === 0;
    const vote = {
      id: `bench-${i}-${Date.now()}`,
      candidatoId: !isGroup ? 'test_candidato_1' : undefined,
      grupoId: isGroup ? 'test_grupo_1' : undefined,
      ip: `192.168.1.${(i % 250) + 1}`,
      timestamp: Date.now(),
    };
    promises.push(pushVoteToQueue(vote));
  }

  await Promise.all(promises);
  const duration = Date.now() - startTime;
  const rps = Math.round((TOTAL_VOTES / duration) * 1000);

  console.log(`✅ ${TOTAL_VOTES} votos inseridos em ${duration}ms (${rps} votos/segundo).`);

  const queueSize = await getQueueSize();
  console.log(`📊 Tamanho da fila no Redis: ${queueSize} votos.`);

  console.log('📦 Testando retirada em lote (popVoteBatch)...');
  const batch = await popVoteBatch(100);
  console.log(`✅ Lote extraído com ${batch.length} votos.`);
  console.log(`📊 Novo tamanho da fila no Redis: ${await getQueueSize()} votos.`);

  // Cleanup rest of test queue
  await popVoteBatch(1000);
  console.log('🎉 Teste de benchmark concluído com sucesso!');
}

runBenchmark().catch(console.error);
