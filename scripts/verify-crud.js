const PocketBase = require('pocketbase/cjs');

async function testCRUD() {
  console.log('Starting programmatic verification of Admin CRUD operations...');
  
  const pb = new PocketBase('http://127.0.0.1:8090');
  pb.autoCancellation(false);

  // Authenticate as Admin
  await pb.admins.authWithPassword('admin@mansao.com', 'admin123456789');
  console.log('Authenticated successfully as Admin.');

  // 1. Create Sponsor (Nike)
  console.log('Creating sponsor Nike...');
  const sponsor = await pb.collection('patrocinadores').create({
    nome: 'Nike',
    logo_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200',
    link_site: 'https://nike.com'
  });
  console.log(`Sponsor created successfully: ID=${sponsor.id}`);

  // 2. Create Candidate (Gisele Bundchen)
  console.log('Creating candidate Gisele Bundchen...');
  const candidate = await pb.collection('candidatos').create({
    nome: 'Gisele Bundchen',
    instagram: '@gisele',
    foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400',
    votos_count: 0,
    eliminado: false
  });
  console.log(`Candidate created successfully: ID=${candidate.id}`);

  // 3. Create Group (Grupo Neon) containing Gisele and sponsored by Nike
  console.log('Creating group Grupo Neon...');
  const group = await pb.collection('grupos').create({
    nome: 'Grupo Neon',
    video_url: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0227e3691a2063d7e5e9a2d3b3c10f8&profile_id=139&oauth2_token_id=57447761',
    patrocinador: sponsor.id,
    membros: [candidate.id],
    votos_count: 0
  });
  console.log(`Group created successfully: ID=${group.id}`);

  // 4. Fetch and Verify
  console.log('Verifying created entities in database...');
  const fetchedGroup = await pb.collection('grupos').getOne(group.id, {
    expand: 'patrocinador,membros'
  });

  console.log('Fetched group name:', fetchedGroup.nome);
  console.log('Fetched group sponsor:', fetchedGroup.expand?.patrocinador?.nome);
  console.log('Fetched group members count:', fetchedGroup.expand?.membros?.length);

  if (fetchedGroup.nome !== 'Grupo Neon') {
    throw new Error('Group name mismatch');
  }
  if (fetchedGroup.expand?.patrocinador?.nome !== 'Nike') {
    throw new Error('Sponsor association failed');
  }
  if (fetchedGroup.expand?.membros?.[0]?.nome !== 'Gisele Bundchen') {
    throw new Error('Member association failed');
  }

  console.log('\nDynamic Admin CRUD programmatic validation PASSED successfully!');
}

testCRUD().catch(err => {
  console.error('\nCRUD Validation FAILED:', err.message);
  process.exit(1);
});
