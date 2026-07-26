const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://api.vortexsync.pro');

async function cleanAndInspect() {
  try {
    await pb.admins.authWithPassword('admin@mansao.com', 'admin123456789');
    const list = await pb.collection('votacoes_config').getFullList({ sort: '-created' });
    console.log(`=== TOTAL DE REGISTROS EM VOTACOES_CONFIG: ${list.length} ===`);
    list.forEach((c, idx) => {
      console.log(`[${idx}] ID: ${c.id} | Ativa: ${c.ativa} | Tipo: "${c.tipo}" | Titulo: "${c.titulo}"`);
    });

    if (list.length > 1) {
      console.log(`⚠️ ATENÇÃO: Existem ${list.length} registros no banco! Removendo registros duplicados antigos...`);
      for (let i = 1; i < list.length; i++) {
        await pb.collection('votacoes_config').delete(list[i].id);
        console.log(`- Removido registro antigo ID: ${list[i].id}`);
      }
      console.log('✅ Banco limpo! Restou apenas 1 registro único de configuração.');
    }
  } catch (err) {
    console.error('Erro ao verificar/limpar registros:', err);
  }
}

cleanAndInspect();
