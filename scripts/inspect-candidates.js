const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://api.vortexsync.pro');

async function inspectCandidates() {
  try {
    const list = await pb.collection('candidatos').getFullList();
    console.log('=== CANDIDATOS NO POCKETBASE ===');
    for (const c of list) {
      console.log(`- ${c.nome}: foto_file="${c.foto_file || ''}" | foto_url="${c.foto_url || ''}"`);
    }
  } catch (err) {
    console.error('Erro ao buscar candidatos:', err);
  }
}

inspectCandidates();
