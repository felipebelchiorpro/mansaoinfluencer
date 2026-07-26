const https = require('https');

async function triggerHttpSave() {
  const payload = JSON.stringify({
    titulo: "Quem você quer que seja o ganhador da Mansão 2.0?",
    tipo: "individual",
    ativa: true,
    expira_em: new Date('2026-07-26T18:00:00-03:00').toISOString()
  });

  const options = {
    hostname: 'mansaoinfluencer.vercel.app',
    path: '/api/save-config',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('HTTP Status Vercel:', res.statusCode);
      console.log('Resposta Vercel:', data);
    });
  });

  req.on('error', (e) => {
    console.error('Erro HTTP Vercel:', e);
  });

  req.write(payload);
  req.end();
}

triggerHttpSave();
