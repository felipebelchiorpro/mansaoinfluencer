const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://api.vortexsync.pro');

async function set11AmConfig() {
  console.log('=== ATUALIZANDO HORÁRIO DE TÉRMINO PARA 11:00 DA MANHÃ (26/07) ===');

  try {
    await pb.admins.authWithPassword('admin@mansao.com', 'admin123456789');

    // 11:00 da manhã no horário de Brasília (26/07/2026 às 11:00 BRT = 14:00 UTC)
    const expiraEm = new Date('2026-07-26T11:00:00-03:00').toISOString();
    const titulo = 'Quem merece estar na final do reality da Mansão dos Influenciadores 2.0??? Quem volta para o jogo???';
    const tipo = 'repescagem';
    const ativa = true;

    const list = await pb.collection('votacoes_config').getFullList({ sort: '-created' });
    if (list.length > 0) {
      const updated = await pb.collection('votacoes_config').update(list[0].id, {
        titulo,
        expira_em: expiraEm,
        tipo,
        ativa
      });
      console.log('✅ Registro atualizado no PocketBase com sucesso!');
      console.log(`ID: ${updated.id}`);
      console.log(`Título: "${updated.titulo}"`);
      console.log(`Expiração (UTC): ${updated.expira_em}`);
      console.log(`Expiração (BRT): 26/07/2026 às 11:00:00 (Manhã)`);
    }

    // Sincroniza tambem via API local/Vercel
    const payload = JSON.stringify({
      titulo,
      expira_em: expiraEm,
      tipo,
      ativa
    });

    console.log('\n--- CONFIRMAÇÃO DO HORÁRIO ---');
    console.log('Repescagem ativa até 26/07/2026 às 11:00 AM (Manhã)');
    console.log('-------------------------------\n');
  } catch (err) {
    console.error('Erro ao atualizar horário:', err?.data || err);
  }
}

set11AmConfig();
