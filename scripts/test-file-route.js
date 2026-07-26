const http = require('https');

function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ url, status: err.message });
    });
  });
}

async function run() {
  const url1 = 'https://api.vortexsync.pro/api/files/candidatos/21hklxulzvr7ejm/gino_P9cVohEMqY.jpeg';
  const url2 = 'https://api.vortexsync.pro/api/files/b1gwyu19v42bgf6/21hklxulzvr7ejm/gino_P9cVohEMqY.jpeg';

  const res1 = await checkUrl(url1);
  const res2 = await checkUrl(url2);

  console.log('Test 1 (candidatos name):', res1);
  console.log('Test 2 (b1gwyu19v42bgf6 ID):', res2);
}

run();
