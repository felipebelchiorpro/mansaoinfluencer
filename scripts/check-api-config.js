async function checkApiConfig() {
  try {
    const res = await fetch('http://localhost:3000/api/save-config');
    const data = await res.json();
    console.log('=== API /api/save-config RESPONSE ===');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Erro ao chamar /api/save-config:', err.message);
  }
}

checkApiConfig();
