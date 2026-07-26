const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://api.vortexsync.pro');

async function setRepescagem() {
  try {
    console.log('Autenticando admin no PocketBase...');
    await pb.admins.authWithPassword('admin@mansao.com', 'admin123456789');
    console.log('✅ Admin autenticado!');

    const configList = await pb.collection('votacoes_config').getFullList();
    if (configList.length === 0) {
      console.log('Nenhuma config encontrada!');
      return;
    }

    const config = configList[0];
    console.log('Configuração atual no PocketBase:', config);

    const updated = await pb.collection('votacoes_config').update(config.id, {
      titulo: 'Quem deve voltar para a Mansão?',
      tipo: 'repescagem',
      ativa: true,
      expira_em: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

    console.log('✅ POCKETBASE ATUALIZADO COM SUCESSO PARA REPESCAGEM:', updated);
  } catch (error) {
    console.error('❌ Erro ao atualizar PocketBase:', error);
  }
}

setRepescagem();
