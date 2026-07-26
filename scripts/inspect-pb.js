const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://api.vortexsync.pro');

async function inspectPB() {
  try {
    console.log('--- TESTANDO ACESSO ÀS COLEÇÕES ---');
    
    // 1. Check votacoes_config
    try {
      const configs = await pb.collection('votacoes_config').getFullList();
      console.log('votacoes_config:', JSON.stringify(configs, null, 2));
    } catch (e) {
      console.error('Erro em votacoes_config:', e.message, e.data);
    }

    // 2. Check candidatos
    try {
      const candidates = await pb.collection('candidatos').getFullList({ fields: 'id,nome,ativo,eliminado' });
      console.log('candidatos (count):', candidates.length);
    } catch (e) {
      console.error('Erro em candidatos:', e.message);
    }

    // 3. Check historico_votacoes
    try {
      const history = await pb.collection('historico_votacoes').getFullList();
      console.log('historico_votacoes (count):', history.length);
    } catch (e) {
      console.error('Erro em historico_votacoes:', e.message, e.data);
    }

  } catch (err) {
    console.error('Erro geral:', err);
  }
}

inspectPB();
