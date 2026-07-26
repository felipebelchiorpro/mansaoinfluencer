const PocketBase = require('pocketbase/cjs');

async function testBoth() {
  const urls = ['http://127.0.0.1:8090', 'https://api.vortexsync.pro'];

  for (const url of urls) {
    try {
      console.log(`\nTesting ${url}...`);
      const pb = new PocketBase(url);
      const health = await pb.health.check();
      console.log(`✅ Health check OK para ${url}:`, health);

      const configs = await pb.collection('votacoes_config').getFullList({ requestKey: null });
      console.log(`Config em ${url}:`, configs.map(c => ({ id: c.id, ativa: c.ativa, expira_em: c.expira_em })));
    } catch (e) {
      console.error(`❌ Erro em ${url}:`, e.message);
    }
  }
}

testBoth().then(() => process.exit(0));
