const https = require('https');

function testReferer(referer) {
  return new Promise((resolve) => {
    const url = 'https://api.vortexsync.pro/api/files/candidatos/21hklxulzvr7ejm/gino_P9cVohEMqY.jpeg';
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': referer
      }
    }, (res) => {
      resolve({ referer, status: res.statusCode });
    });
    req.on('error', (err) => resolve({ referer, status: err.message }));
  });
}

async function run() {
  const r1 = await testReferer('http://localhost:3000/');
  const r2 = await testReferer('https://mansaoinfluencer.vercel.app/');
  const r3 = await testReferer('https://mansao-influencer.vercel.app/');

  console.log('Localhost Referer:', r1);
  console.log('Vercel Referer 1:', r2);
  console.log('Vercel Referer 2:', r3);
}

run();
