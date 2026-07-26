const PocketBase = require('pocketbase/cjs');

const pb = new PocketBase('https://api.vortexsync.pro');

async function testIntegrity() {
  console.log('=== TESTE DE INTEGRIDADE DO POCKETBASE ===');
  try {
    // 1. Autenticar como Admin
    const authData = await pb.admins.authWithPassword('admin@mansao.com', 'admin123456789');
    console.log('✅ Auth Admin OK! Token obtido:', !!authData.token);

    // 2. Listar votacoes_config
    const configs = await pb.collection('votacoes_config').getFullList();
    console.log(`📋 Total de registros em votacoes_config: ${configs.length}`);
    console.log('Registros atuais:', JSON.stringify(configs, null, 2));

    if (configs.length > 0) {
      const firstConfig = configs[0];
      const testTitle = `Título Teste ${Date.now()}`;
      console.log(`\nModificando registro ${firstConfig.id} para "${testTitle}"...`);
      
      const updated = await pb.collection('votacoes_config').update(firstConfig.id, {
        titulo: testTitle,
        tipo: 'repescagem'
      });
      console.log('✅ Atualização retornada pelo PB:', updated.titulo, updated.tipo);

      // Re-leitura para verificar se persistiu no banco
      const reread = await pb.collection('votacoes_config').getOne(firstConfig.id);
      console.log('🔍 Re-leitura do banco:', reread.titulo, reread.tipo);

      if (reread.titulo === testTitle) {
        console.log('🎉 INTEGRIDADE CONFIRMADA: O PocketBase está salvando e mantendo os dados no disco!');
      } else {
        console.error('❌ ALERTA: O PocketBase não persistiu a alteração!');
      }
    }
  } catch (err) {
    console.error('❌ ERRO AO TESTAR POCKETBASE:', err);
  }
}

testIntegrity();
