const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://api.vortexsync.pro');

async function testUpdateConfig() {
  try {
    console.log('1. Autenticando admin...');
    await pb.admins.authWithPassword('admin@mansao.com', 'admin123456789');
    console.log('✅ Admin autenticado com sucesso!');

    const configList = await pb.collection('votacoes_config').getFullList();
    const config = configList[0];
    console.log('Config atual:', config);

    console.log('\n2. Testando update com payload completo...');
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    const updated = await pb.collection('votacoes_config').update(config.id, {
      titulo: config.titulo,
      tipo: config.tipo,
      expira_em: futureDate,
      ativa: !config.ativa
    });

    console.log('✅ SUCESSO! Config atualizado:', updated);

    // Reverte o status
    await pb.collection('votacoes_config').update(config.id, {
      ativa: config.ativa
    });
    console.log('✅ Revertido com sucesso!');

  } catch (err) {
    console.error('❌ ERRO NO UPDATE:', err.message, err.data || err);
  }
}

testUpdateConfig().then(() => process.exit(0));
