const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://api.vortexsync.pro');

async function testSaveConfig() {
  try {
    await pb.admins.authWithPassword('admin@mansao.com', 'admin123456789');
    const list = await pb.collection('votacoes_config').getFullList();
    if (list.length === 0) {
      console.log('Nenhuma config encontrada.');
      return;
    }
    const target = list[0];
    console.log(`Antes do update - ID: ${target.id} | Titulo: "${target.titulo}" | Tipo: ${target.tipo}`);

    const updated = await pb.collection('votacoes_config').update(target.id, {
      titulo: 'QUEM DEVE VOLTAR NA REPESCAGEM OFICIAL?',
      tipo: 'repescagem'
    });

    console.log(`DEPOIS DO UPDATE NO BANCO - ID: ${updated.id} | Titulo: "${updated.titulo}" | Tipo: ${updated.tipo}`);
  } catch (err) {
    console.error('Erro ao testar update no PocketBase:', err?.data || err);
  }
}

testSaveConfig();
