const PocketBase = require('pocketbase/cjs');

async function testHistory() {
  console.log('Starting programmatic verification of History Audit operations...');
  
  const pb = new PocketBase('http://127.0.0.1:8090');
  pb.autoCancellation(false);

  // Authenticate as Admin
  await pb.admins.authWithPassword('admin@mansao.com', 'admin123456789');
  console.log('Authenticated successfully as Admin.');

  // Create a mock history round
  console.log('Creating a mock archived round...');
  const round = await pb.collection('historico_votacoes').create({
    titulo: 'Paredão Teste Rodada 1',
    tipo: 'individual',
    ganhador: 'Aline Faria',
    votos_ganhador: 1500,
    votos_totais: 3200,
    detalhes: [
      { nome: 'Aline Faria', votos: 1500, eliminado: false },
      { nome: 'Bruno Gagliasso', votos: 1000, eliminado: false },
      { nome: 'Camila Coelho', votos: 700, eliminado: false }
    ],
    data_encerramento: new Date().toISOString()
  });

  console.log(`Mock round created with ID: ${round.id}`);
  
  // Verify reading history
  const historyList = await pb.collection('historico_votacoes').getFullList({
    filter: `id = "${round.id}"`
  });
  
  if (historyList.length === 0) {
    throw new Error('Archived round was not found in database');
  }
  
  const fetchedRound = historyList[0];
  console.log('Fetched archived round from database:');
  console.log(`- Title: ${fetchedRound.titulo}`);
  console.log(`- Winner: ${fetchedRound.ganhador} (${fetchedRound.votos_ganhador} votes)`);
  console.log(`- Total votes: ${fetchedRound.votos_totais}`);
  console.log(`- Details length: ${fetchedRound.detalhes.length}`);

  // Delete the mock round to keep DB clean
  await pb.collection('historico_votacoes').delete(round.id);
  console.log('Cleaned up mock archived round from database.');

  console.log('\nHistory Audit operations programmatic validation PASSED successfully!');
}

testHistory().catch(err => {
  console.error('\nHistory Validation FAILED:', err.message);
  process.exit(1);
});
