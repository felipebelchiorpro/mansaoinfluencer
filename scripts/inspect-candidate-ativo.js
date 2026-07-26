const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://api.vortexsync.pro');

async function checkCandidatesAtivo() {
  try {
    const list = await pb.collection('candidatos').getFullList();
    console.log('=== ATIVO & ELIMINADO DOS CANDIDATOS ===');
    for (const c of list) {
      console.log(`- ${c.nome}: ativo=${c.ativo} (${typeof c.ativo}) | eliminado=${c.eliminado} (${typeof c.eliminado})`);
    }
  } catch (err) {
    console.error('Erro ao buscar candidatos:', err);
  }
}

checkCandidatesAtivo();
