const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://api.vortexsync.pro');

async function testCredentials() {
  try {
    console.log(`Tentando admin: admin@mansao.com...`);
    await pb.admins.authWithPassword('admin@mansao.com', 'admin123456789');
    console.log(`✅ SUCESSO! Logado como admin: admin@mansao.com`);
    
    const configs = await pb.collection('votacoes_config').getFullList();
    if (configs.length > 0) {
      const config = configs[0];
      console.log(`Tentando atualizar votacoes_config ID: ${config.id}...`);
      const updated = await pb.collection('votacoes_config').update(config.id, {
        ativa: !config.ativa
      });
      console.log('✅ Update em votacoes_config SUCESSO! Novo ativa:', updated.ativa);
      
      // Reverter
      await pb.collection('votacoes_config').update(config.id, { ativa: config.ativa });
      console.log('✅ Revertido com sucesso!');
    }
  } catch (err) {
    console.error(`❌ Falhou:`, err.message, err.data || '');
  }
}

testCredentials().then(() => process.exit(0));
