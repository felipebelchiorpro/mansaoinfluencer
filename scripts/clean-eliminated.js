const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://api.vortexsync.pro');

async function cleanEliminated() {
  try {
    const list = await pb.collection('candidatos').getFullList();
    console.log('=== LIMPANDO CANDIDATOS ELIMINADOS ===');
    for (const c of list) {
      if (c.eliminado && c.ativo) {
        console.log(`Atualizando ${c.nome} (id: ${c.id}): definindo ativo = false`);
        await pb.collection('candidatos').update(c.id, { ativo: false });
      }
    }
    console.log('Limpeza concluída com sucesso.');
  } catch (err) {
    console.error('Erro ao atualizar candidatos:', err);
  }
}

cleanEliminated();
