const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://api.vortexsync.pro');

async function testArchive() {
  try {
    console.log('1. Autenticando admin...');
    await pb.admins.authWithPassword('admin@mansao.com', 'admin123456789');
    console.log('✅ Admin logado com sucesso!');

    // 2. Fetch config
    const config = await pb.collection('votacoes_config').getFirstListItem('');
    console.log('Config atual:', config);

    // 3. Test historico_votacoes.create
    console.log('3. Criando registro de teste em historico_votacoes...');
    const created = await pb.collection('historico_votacoes').create({
      titulo: config.titulo,
      tipo: config.tipo,
      ganhador: 'Grupo Teste',
      votos_ganhador: 10,
      votos_totais: 20,
      detalhes: JSON.stringify([{ id: '1', nome: 'Grupo Teste', votos: 10 }]),
      data_encerramento: new Date().toISOString()
    }, { requestKey: null });

    console.log('✅ Historico criado com sucesso! ID:', created.id);

    // Deletar o teste
    await pb.collection('historico_votacoes').delete(created.id, { requestKey: null });
    console.log('✅ Registro de teste removido!');

  } catch (err) {
    console.error('❌ ERRO NO ARQUIVAMENTO:', err.message, err.data || err);
  }
}

testArchive().then(() => process.exit(0));
