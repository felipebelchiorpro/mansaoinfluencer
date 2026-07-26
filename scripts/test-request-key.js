const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://api.vortexsync.pro');
pb.autoCancellation(false);

async function testRequestKey() {
  try {
    console.log('1. Logando como admin...');
    await pb.admins.authWithPassword('admin@mansao.com', 'admin123456789');
    console.log('✅ Admin logado com sucesso!');

    const configs = await pb.collection('votacoes_config').getFullList({ requestKey: null });
    const config = configs[0];
    console.log('Config atual:', config.id, 'ativa:', config.ativa);

    console.log('2. Atualizando status com requestKey: null...');
    const updated = await pb.collection('votacoes_config').update(
      config.id,
      { ativa: !config.ativa },
      { requestKey: null }
    );
    console.log('✅ SUCESSO! Config atualizado:', updated.id, 'novo ativa:', updated.ativa);

    // Reverte
    await pb.collection('votacoes_config').update(
      config.id,
      { ativa: config.ativa },
      { requestKey: null }
    );
    console.log('✅ Revertido com sucesso!');

  } catch (err) {
    console.error('❌ ERRO:', err.message, err.data || err);
  }
}

testRequestKey().then(() => process.exit(0));
