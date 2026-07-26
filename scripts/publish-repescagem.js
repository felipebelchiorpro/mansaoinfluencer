async function publishRepescagem() {
  try {
    const payload = {
      titulo: 'Quem merece estar na final do reality da Mansão dos Influenciadores 2.0???\nQuem volta para o jogo???',
      expira_em: '2026-07-26T23:02:00.000Z',
      tipo: 'repescagem',
      ativa: true
    };

    console.log('Publicando Repescagem via POST /api/save-config...');
    const res = await fetch('http://localhost:3000/api/save-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('Resposta do servidor:', JSON.stringify(data, null, 2));

    // Também atualiza o status de votação para aberto no Redis
    const statusRes = await fetch('http://localhost:3000/api/voting-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'open' })
    });
    console.log('Status de votação atualizado:', await statusRes.json());
  } catch (err) {
    console.error('Erro:', err.message);
  }
}

publishRepescagem();
