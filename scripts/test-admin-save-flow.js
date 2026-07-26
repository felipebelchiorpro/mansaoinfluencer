const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://api.vortexsync.pro');

async function testSaveFlow() {
  console.log('=== TESTANDO FLUXO COMPLETO DE SALVAMENTO NO POCKETBASE ===');

  try {
    await pb.admins.authWithPassword('admin@mansao.com', 'admin123456789');

    // 1. Busca lista de configs
    const list = await pb.collection('votacoes_config').getFullList();
    console.log(`Configs encontradas no banco: ${list.length}`);
    if (list.length === 0) {
      console.log('Criando novo registro de config...');
      const created = await pb.collection('votacoes_config').create({
        titulo: 'VOTAÇÃO OFICIAL DA MANSÃO INFLUENCER',
        tipo: 'repescagem',
        ativa: true,
        expira_em: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
      console.log('✅ Novo registro criado:', created);
      return;
    }

    const target = list[0];
    console.log(`Antes - ID: ${target.id} | Titulo: "${target.titulo}" | Tipo: ${target.tipo} | Ativa: ${target.ativa}`);

    const newTitle = `VOTAÇÃO DA MANSÃO (TESTE ${Date.now()})`;
    const updated = await pb.collection('votacoes_config').update(target.id, {
      titulo: newTitle,
      tipo: target.tipo || 'individual',
      ativa: true
    });

    console.log(`✅ DEPOIS DO UPDATE NO BANCO - ID: ${updated.id} | Titulo: "${updated.titulo}" | Updated: ${updated.updated}`);

    // Re-busca do banco para confirmar gravação física
    const verify = await pb.collection('votacoes_config').getOne(target.id);
    console.log(`🔍 CONFIRMAÇÃO DE LEITURA DO BANCO - Titulo no SQLite: "${verify.titulo}"`);
    if (verify.titulo === newTitle) {
      console.log('🎉 TESTE BEM SUCEDIDO: O banco de dados PocketBase está gravando 100% perfeitamente!');
    } else {
      console.error('❌ ERRO: O titulo lido do banco difere do enviado!');
    }
  } catch (err) {
    console.error('❌ Erro no teste de salvamento:', err?.data || err);
  }
}

testSaveFlow();
