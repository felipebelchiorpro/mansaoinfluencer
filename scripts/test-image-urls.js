const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://api.vortexsync.pro');

async function testImageUrls() {
  try {
    const list = await pb.collection('candidatos').getFullList();
    console.log('=== TESTANDO URLS DE FOTOS DOS CANDIDATOS ===');
    for (const c of list) {
      const collection = c.collectionId || c.collectionName || 'candidatos';
      const url = `https://api.vortexsync.pro/api/files/${collection}/${c.id}/${c.foto_file}`;
      console.log(`${c.nome}: ${url}`);
    }
  } catch (err) {
    console.error('Erro ao testar URLs:', err);
  }
}

testImageUrls();
