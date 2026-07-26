async function testRawFetch() {
  console.log('=== TESTE RAW FETCH POCKETBASE ===');
  try {
    // 1. Auth Admin
    const authRes = await fetch('https://api.vortexsync.pro/api/admins/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identity: 'admin@mansao.com',
        password: 'admin123456789'
      })
    });
    const authData = await authRes.json();
    console.log('1. Auth status:', authRes.status, 'Token:', !!authData.token);

    if (!authData.token) {
      console.error('Falha na autenticação!');
      return;
    }

    const token = authData.token;

    // 2. GET votacoes_config
    const getRes = await fetch('https://api.vortexsync.pro/api/collections/votacoes_config/records', {
      headers: { 'Authorization': token }
    });
    const getJson = await getRes.json();
    console.log('2. GET records status:', getRes.status, 'Total:', getJson.totalItems);
    const firstRecord = getJson.items[0];
    console.log('Registro atual:', firstRecord.id, firstRecord.titulo, firstRecord.tipo);

    // 3. PATCH record via fetch
    const newTitle = `Teste Direct Fetch ${Date.now()}`;
    const patchRes = await fetch(`https://api.vortexsync.pro/api/collections/votacoes_config/records/${firstRecord.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        titulo: newTitle,
        tipo: 'repescagem'
      })
    });

    const patchJson = await patchRes.json();
    console.log('3. PATCH status:', patchRes.status, 'Novo registro:', patchJson.id, patchJson.titulo, patchJson.tipo);

    if (patchRes.ok) {
      console.log('🎉 SUCESSO TOTAL! O PocketBase aceitou o PATCH direto via HTTP em milissegundos!');
    }
  } catch (err) {
    console.error('Erro no testRawFetch:', err);
  }
}

testRawFetch();
