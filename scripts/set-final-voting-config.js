const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://api.vortexsync.pro');

async function setFinalVotingConfig() {
  console.log('=== ATUALIZANDO CONFIGURAÇÃO DA VOTAÇÃO FINAL (12h às 18h) ===');

  try {
    await pb.admins.authWithPassword('admin@mansao.com', 'admin123456789');

    // Expira em: Hoje 26/07/2026 às 18:00 BRT (6 horas da tarde)
    const expiraEm = new Date('2026-07-26T18:00:00-03:00').toISOString();
    const titulo = 'Quem merece ganhar a Mansão dos Influenciadores 2.0?';
    const tipo = 'individual';
    const ativa = true;

    const list = await pb.collection('votacoes_config').getFullList({ sort: '-created' });
    let configRecord;

    if (list.length === 0) {
      configRecord = await pb.collection('votacoes_config').create({
        titulo,
        expira_em: expiraEm,
        tipo,
        ativa
      });
      console.log('✅ Nova configuração criada:', configRecord.id);
    } else {
      configRecord = await pb.collection('votacoes_config').update(list[0].id, {
        titulo,
        expira_em: expiraEm,
        tipo,
        ativa
      });
      console.log('✅ Configuração existente atualizada no PocketBase:', configRecord.id);

      for (let i = 1; i < list.length; i++) {
        await pb.collection('votacoes_config').update(list[i].id, {
          titulo,
          expira_em: expiraEm,
          tipo,
          ativa
        }).catch(() => {});
      }
    }

    console.log('--- DETALHES DA CONFIGURAÇÃO SALVA ---');
    console.log(`Título: ${titulo}`);
    console.log(`Tipo: ${tipo}`);
    console.log(`Ativa: ${ativa}`);
    console.log(`Expira Em (UTC): ${expiraEm}`);

  } catch (err) {
    console.error('❌ Erro ao configurar votação:', err);
  }
}

setFinalVotingConfig();
