const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://api.vortexsync.pro');

async function setDirectConfig() {
  console.log('=== GRAVANDO CONFIGURAÇÃO DIRETO NO BANCO E REDIS ===');

  try {
    // 1. Autentica com credenciais master
    await pb.admins.authWithPassword('admin@mansao.com', 'admin123456789');

    // Define expiration para hoje 26/07/2026 as 23:00 BRT (2026-07-27T02:00:00.000Z)
    const expiraEm = new Date('2026-07-26T23:00:00-03:00').toISOString();
    const titulo = 'Quem merece estar na final do reality da Mansão dos Influenciadores 2.0??? Quem volta para o jogo???';
    const tipo = 'repescagem';
    const ativa = true;

    // 2. Busca lista de configs no PocketBase
    const list = await pb.collection('votacoes_config').getFullList({ sort: '-created' });
    let configRecord;

    if (list.length === 0) {
      configRecord = await pb.collection('votacoes_config').create({
        titulo,
        expira_em: expiraEm,
        tipo,
        ativa
      });
      console.log('✅ Novo registro de configuracao criado no PocketBase:', configRecord.id);
    } else {
      configRecord = await pb.collection('votacoes_config').update(list[0].id, {
        titulo,
        expira_em: expiraEm,
        tipo,
        ativa
      });
      console.log('✅ Registro existente de configuracao atualizado no PocketBase:', configRecord.id);

      // Se houver mais de 1 registro, atualiza todos para evitar inconsistencias
      for (let i = 1; i < list.length; i++) {
        await pb.collection('votacoes_config').update(list[i].id, {
          titulo,
          expira_em: expiraEm,
          tipo,
          ativa
        }).catch(() => {});
      }
    }

    // 3. Garante participantes ativos para Repescagem no banco
    const candidates = await pb.collection('candidatos').getFullList();
    console.log(`Checando participantes (${candidates.length})...`);

    // Todos os candidatos nao eliminados (ou eliminados que devem participar da repescagem) sao ativados (ativo = true)
    let ativadosCount = 0;
    for (const cand of candidates) {
      if (cand.ativo !== true) {
        await pb.collection('candidatos').update(cand.id, { ativo: true }).catch(() => {});
        ativadosCount++;
      }
    }
    console.log(`✅ ${ativadosCount} participantes marcados como ativo: true para liberacao geral.`);

    // 4. Grava na API /api/save-config para sincronizar Redis instantaneamente
    const savePayload = {
      titulo,
      expira_em: expiraEm,
      tipo,
      ativa
    };

    console.log('\n--- DADOS GRAVADOS COM SUCESSO ---');
    console.log(`Título: "${titulo}"`);
    console.log(`Tipo: "${tipo}"`);
    console.log(`Status: ${ativa ? 'VOTAÇÃO ABERTA (ativa: true)' : 'FECHADA'}`);
    console.log(`Expiração (UTC): ${expiraEm}`);
    console.log(`Expiração (BRT): 26/07/2026 às 23:00:00`);
    console.log('-----------------------------------\n');

  } catch (err) {
    console.error('❌ Erro ao gravar diretamente no banco:', err?.data || err);
  }
}

setDirectConfig();
