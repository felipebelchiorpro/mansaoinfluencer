const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://api.vortexsync.pro');

async function inspectAllConfigsFull() {
  try {
    const list = await pb.collection('votacoes_config').getFullList({ sort: '-created' });
    console.log(`=== REGISTROS EM VOTACOES_CONFIG (${list.length}) ===`);
    list.forEach((c, idx) => {
      console.log(`[${idx}] ID: ${c.id} | Ativa: ${c.ativa} | Tipo: "${c.tipo}" | Titulo: "${c.titulo}" | Expira: "${c.expira_em}" | Created: "${c.created}"`);
    });
  } catch (err) {
    console.error('Erro ao buscar configs:', err);
  }
}

inspectAllConfigsFull();
