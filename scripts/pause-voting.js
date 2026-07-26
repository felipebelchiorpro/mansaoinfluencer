const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://api.vortexsync.pro');

async function pauseVoting() {
  try {
    console.log('Autenticando admin no PocketBase...');
    await pb.admins.authWithPassword('admin@mansao.com', 'admin123456789');

    const configList = await pb.collection('votacoes_config').getFullList();
    if (configList.length > 0) {
      await pb.collection('votacoes_config').update(configList[0].id, {
        ativa: false
      });
      console.log('✅ PocketBase votacao_config desativada (ativa: false)');
    }
  } catch (err) {
    console.error('Erro ao pausar votacao:', err);
  }
}

pauseVoting();
