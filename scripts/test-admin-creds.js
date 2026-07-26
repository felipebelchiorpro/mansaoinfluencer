const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('https://api.vortexsync.pro');

async function checkAdminCreds() {
  console.log('=== TESTANDO CREDENCIAIS DE ADMIN NO POCKETBASE ===');

  try {
    const auth1 = await pb.admins.authWithPassword('admin@mansao.com', 'admin123456789');
    console.log('1. admin@mansao.com -> SUCESSO! Token:', !!auth1.token);
  } catch (err) {
    console.log('1. admin@mansao.com -> FALHOU:', err.message);
  }

  try {
    const auth2 = await pb.admins.authWithPassword('antigravity@vortexsync.pro', 'jhgiBKSRGzmie7z');
    console.log('2. antigravity@vortexsync.pro -> SUCESSO! Token:', !!auth2.token);
  } catch (err) {
    console.log('2. antigravity@vortexsync.pro -> FALHOU:', err.message);
  }
}

checkAdminCreds();
