const PocketBase = require('pocketbase/cjs');

async function testEdit() {
  console.log('Starting programmatic verification of Candidate/Sponsor EDIT operations...');
  
  const pb = new PocketBase('http://127.0.0.1:8090');
  pb.autoCancellation(false);

  // Authenticate as Admin
  await pb.admins.authWithPassword('admin@mansao.com', 'admin123456789');
  console.log('Authenticated successfully as Admin.');

  // 1. Fetch Candidate Gisele Bundchen
  const candidates = await pb.collection('candidatos').getFullList({
    filter: 'nome = "Gisele Bundchen" || nome = "Gisele Bundchen Edit"'
  });
  const candidate = candidates[0];
  if (!candidate) {
    throw new Error('Please run verify-crud.js first to seed Gisele Bundchen');
  }

  // 2. Edit Candidate Name to "Gisele Bundchen Edit"
  console.log(`Updating candidate ${candidate.nome} to "Gisele Bundchen Edit"...`);
  const updatedCand = await pb.collection('candidatos').update(candidate.id, {
    nome: 'Gisele Bundchen Edit'
  });
  console.log('Updated Candidate Name:', updatedCand.nome);
  if (updatedCand.nome !== 'Gisele Bundchen Edit') {
    throw new Error('Candidate name update failed');
  }

  // Restore Name
  await pb.collection('candidatos').update(candidate.id, {
    nome: 'Gisele Bundchen'
  });
  console.log('Restored candidate name to "Gisele Bundchen".');

  // 3. Fetch Sponsor Nike
  const sponsors = await pb.collection('patrocinadores').getFullList({
    filter: 'nome = "Nike" || nome = "Nike Edit"'
  });
  const sponsor = sponsors[0];
  if (!sponsor) {
    throw new Error('Please run verify-crud.js first to seed Nike sponsor');
  }

  // 4. Edit Sponsor Name to "Nike Edit"
  console.log(`Updating sponsor ${sponsor.nome} to "Nike Edit"...`);
  const updatedSpon = await pb.collection('patrocinadores').update(sponsor.id, {
    nome: 'Nike Edit'
  });
  console.log('Updated Sponsor Name:', updatedSpon.nome);
  if (updatedSpon.nome !== 'Nike Edit') {
    throw new Error('Sponsor name update failed');
  }

  // Restore Name
  await pb.collection('patrocinadores').update(sponsor.id, {
    nome: 'Nike'
  });
  console.log('Restored sponsor name to "Nike".');

  console.log('\nDynamic Admin Edit operations programmatic validation PASSED successfully!');
}

testEdit().catch(err => {
  console.error('\nEdit Validation FAILED:', err.message);
  process.exit(1);
});
