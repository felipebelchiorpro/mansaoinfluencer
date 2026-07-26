async function testPatch() {
  const url = 'https://api.vortexsync.pro';
  
  // 1. Auth Admin
  const authRes = await fetch(`${url}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identity: 'admin@mansao.com',
      password: 'admin123456789'
    })
  });
  
  const authData = await authRes.json();
  console.log('Auth status:', authRes.status);
  console.log('Token obtido:', !!authData.token);

  if (!authData.token) {
    console.error('Falha na autenticação:', authData);
    return;
  }

  // 2. Fetch record
  const getRes = await fetch(`${url}/api/collections/votacoes_config/records`, {
    headers: { Authorization: authData.token }
  });
  const getJson = await getRes.json();
  const record = getJson.items[0];
  console.log('Registro atual:', record.id, 'ativa:', record.ativa);

  // 3. Patch record
  console.log('Enviando PATCH...');
  const patchRes = await fetch(`${url}/api/collections/votacoes_config/records/${record.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authData.token
    },
    body: JSON.stringify({
      ativa: !record.ativa
    })
  });

  const patchJson = await patchRes.json();
  console.log('PATCH Status Code:', patchRes.status);
  console.log('PATCH Response Body:', patchJson);
}

testPatch().then(() => process.exit(0)).catch(e => console.error(e));
