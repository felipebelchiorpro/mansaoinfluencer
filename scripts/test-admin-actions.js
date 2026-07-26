const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://api.vortexsync.pro');

async function testAdmin() {
  try {
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL || 'antigravity@vortexsync.pro';
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD || 'jhgiBKSRGzmie7z';
    
    console.log(`Conectando em ${pb.baseUrl}...`);
    console.log('Tentando autenticar como Admin com:', adminEmail);
    const authData = await pb.admins.authWithPassword(adminEmail, adminPassword);
    console.log('✅ Admin autenticado com sucesso:', authData.admin.email);

    // List collections
    console.log('\nVerificando coleções no PocketBase...');
    const collections = await pb.collections.getFullList();
    console.log('Coleções existentes:', collections.map(c => c.name));

    // Test votacoes_config
    const configs = await pb.collection('votacoes_config').getFullList();
    console.log('\nConfigurações atuais (votacoes_config):', configs);

    if (configs.length > 0) {
      const cfg = configs[0];
      console.log(`Tentando atualizar status da config ${cfg.id} (atual ativa: ${cfg.ativa})...`);
      const updated = await pb.collection('votacoes_config').update(cfg.id, {
        ativa: !cfg.ativa
      });
      console.log('✅ Update votacoes_config SUCESSO! Novo ativa:', updated.ativa);
      
      // Reverter
      await pb.collection('votacoes_config').update(cfg.id, { ativa: cfg.ativa });
      console.log('✅ Revertido para o estado inicial com sucesso!');
    }

    // Test historico_votacoes
    console.log('\nTestando criação em historico_votacoes...');
    try {
      const hist = await pb.collection('historico_votacoes').getFullList();
      console.log('Histórico atual:', hist.length, 'registros.');
    } catch (hErr) {
      console.error('❌ Erro ao acessar historico_votacoes:', hErr.message, hErr.data);
    }

  } catch (err) {
    console.error('❌ ERRO NO TESTE DE ADMIN:', err.message, err.data || err);
  }
}

testAdmin();
