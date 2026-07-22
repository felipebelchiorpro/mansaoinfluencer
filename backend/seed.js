const fs = require('fs');
const path = require('path');
const PocketBase = require('pocketbase/cjs');

const PB_URL = process.env.POCKETBASE_URL || 'https://api.vortexsync.pro';

async function seed() {
  console.log('Seeding PocketBase using JS SDK...');

  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false);

  // Auth as Admin
  try {
    await pb.admins.authWithPassword('antigravity@vortexsync.pro', 'jhgiBKSRGzmie7z');
    console.log('Authenticated successfully as Admin.');
  } catch (authErr) {
    throw new Error(`Admin authentication failed: ${authErr.message}`);
  }

  // 2. Load and Sync Collections
  const schemaPath = path.join(__dirname, 'pb_schema.json');
  const collections = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

  // Get existing collections list to map IDs
  const existingCollectionMap = {};
  const currentCollections = await pb.collections.getFullList();
  currentCollections.forEach(c => {
    existingCollectionMap[c.name] = c.id;
  });

  // Resolve relation fields collectionIds and create/update collections
  for (const coll of collections) {
    // Resolve relation fields
    if (coll.schema) {
      coll.schema.forEach(field => {
        if (field.type === 'relation' && field.options && field.options.collectionId) {
          const targetName = field.options.collectionId;
          const actualId = existingCollectionMap[targetName];
          if (actualId) {
            field.options.collectionId = actualId;
            console.log(`Resolved relation field '${field.name}' in collection '${coll.name}': '${targetName}' -> '${actualId}'`);
          }
        }
      });
    }

    const collId = existingCollectionMap[coll.name];
    if (collId) {
      console.log(`Updating schema for existing collection ${coll.name} (${collId})...`);
      await pb.collections.update(collId, coll);
    } else {
      console.log(`Creating collection ${coll.name}...`);
      const newColl = await pb.collections.create(coll);
      existingCollectionMap[coll.name] = newColl.id;
    }
  }

  // 3. Seed Candidates (candidatos)
  // Delete all existing candidates first to ensure fresh seed IDs and data
  try {
    const existingCands = await pb.collection('candidatos').getFullList();
    for (const cand of existingCands) {
      await pb.collection('candidatos').delete(cand.id);
    }
    console.log('Cleared existing candidates.');
  } catch (err) {
    console.log('No existing candidates to clear or error clearing:', err.message);
  }

  const candidates = [
    {
      nome: 'Aline Faria',
      instagram: '@alinefaria',
      foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
      votos_count: 0,
      eliminado: false,
      ativo: true
    },
    {
      nome: 'Bruno Gagliasso',
      instagram: '@brunogagliasso',
      foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
      votos_count: 0,
      eliminado: false,
      ativo: true
    },
    {
      nome: 'Camila Coelho',
      instagram: '@camilacoelho',
      foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      votos_count: 0,
      eliminado: false,
      ativo: true
    },
    {
      nome: 'Douglas Silva',
      instagram: '@douglassilva',
      foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
      votos_count: 0,
      eliminado: true,
      ativo: false // Eliminated is not active in Paredão
    }
  ];

  const candidateMap = {};
  console.log('Creating candidates...');
  for (const cand of candidates) {
    const record = await pb.collection('candidatos').create(cand);
    candidateMap[cand.nome] = record.id;
    console.log(`Candidate ${cand.nome} created with ID ${record.id}.`);
  }

  // 4. Seed Sponsors (patrocinadores)
  try {
    const existingSpons = await pb.collection('patrocinadores').getFullList();
    for (const spon of existingSpons) {
      await pb.collection('patrocinadores').delete(spon.id);
    }
    console.log('Cleared existing sponsors.');
  } catch (err) {
    console.log('No existing sponsors to clear:', err.message);
  }

  const sponsors = [
    {
      nome: 'Coca-Cola',
      logo_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=200&auto=format&fit=crop',
      link_site: 'https://coca-cola.com.br',
      instagram: '@cocacola_br'
    },
    {
      nome: 'Samsung',
      logo_url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=200&auto=format&fit=crop',
      link_site: 'https://samsung.com.br',
      instagram: '@samsungbrasil'
    },
    {
      nome: 'Mercado Livre',
      logo_url: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?q=80&w=200&auto=format&fit=crop',
      link_site: 'https://mercadolivre.com.br',
      instagram: '@mercadolivre'
    }
  ];

  const sponsorMap = {};
  console.log('Creating sponsors...');
  for (const spon of sponsors) {
    const record = await pb.collection('patrocinadores').create(spon);
    sponsorMap[spon.nome] = record.id;
    console.log(`Sponsor ${spon.nome} created with ID ${record.id}.`);
  }

  // 5. Seed Configurations (votacoes_config)
  try {
    const existingConfigs = await pb.collection('votacoes_config').getFullList();
    for (const conf of existingConfigs) {
      await pb.collection('votacoes_config').delete(conf.id);
    }
  } catch (err) {
    // Ignore
  }

  const futureDate = new Date();
  futureDate.setHours(futureDate.getHours() + 24);

  const config = {
    titulo: 'Quem você quer que continue na Mansão dos Influencers?',
    ativa: true,
    expira_em: futureDate.toISOString(),
    tipo: 'individual'
  };

  console.log('Creating configurations...');
  await pb.collection('votacoes_config').create(config);
  console.log('Configuration created successfully.');

  // 7. Seed Stages (etapas)
  try {
    const existingStages = await pb.collection('etapas').getFullList();
    for (const stg of existingStages) {
      await pb.collection('etapas').delete(stg.id);
    }
  } catch (err) {
    // Ignore
  }

  // 8. Seed Group Videos (grupo_videos)
  try {
    const existingGroupVideos = await pb.collection('grupo_videos').getFullList();
    for (const gv of existingGroupVideos) {
      await pb.collection('grupo_videos').delete(gv.id);
    }
  } catch (err) {
    // Ignore
  }

  console.log('Creating groups...');
  
  // Group Azul (Aline Faria & Bruno Gagliasso) sponsored by Coca-Cola
  const groupA = {
    nome: 'Grupo Azul',
    video_url: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0227e3691a2063d7e5e9a2d3b3c10f8&profile_id=139&oauth2_token_id=57447761',
    patrocinador: sponsorMap['Coca-Cola'] || '',
    membros: [candidateMap['Aline Faria'] || '', candidateMap['Bruno Gagliasso'] || ''].filter(Boolean),
    votos_count: 0
  };

  // Group Laranja (Camila Coelho & Douglas Silva) sponsored by Samsung
  const groupB = {
    nome: 'Grupo Laranja',
    video_url: 'https://player.vimeo.com/external/435674703.sd.mp4?s=7f5564c78d4615a133b3d1b7cfb0ffb307cf90b2&profile_id=139&oauth2_token_id=57447761',
    patrocinador: sponsorMap['Samsung'] || '',
    membros: [candidateMap['Camila Coelho'] || '', candidateMap['Douglas Silva'] || ''].filter(Boolean),
    votos_count: 0
  };

  const createdGroupA = await pb.collection('grupos').create(groupA);
  console.log(`Group ${groupA.nome} created successfully.`);
  const createdGroupB = await pb.collection('grupos').create(groupB);
  console.log(`Group ${groupB.nome} created successfully.`);

  console.log('Creating stages...');
  const stage1 = await pb.collection('etapas').create({
    nome: 'Etapa 1: Apresentação',
    ativa: true,
    descricao: 'Vídeos de apresentação dos grupos para o reality.'
  });
  const stage2 = await pb.collection('etapas').create({
    nome: 'Etapa 2: Patrocinador Coca-Cola',
    ativa: false,
    descricao: 'Desafio especial patrocinado pela Coca-Cola.'
  });

  console.log('Creating group videos for stages...');
  // Seed videos for Stage 1
  await pb.collection('grupo_videos').create({
    grupo: createdGroupA.id,
    etapa: stage1.id,
    video_url: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0227e3691a2063d7e5e9a2d3b3c10f8&profile_id=139&oauth2_token_id=57447761',
    patrocinador: sponsorMap['Coca-Cola'] || '',
    votos_count: 0
  });
  await pb.collection('grupo_videos').create({
    grupo: createdGroupB.id,
    etapa: stage1.id,
    video_url: 'https://player.vimeo.com/external/435674703.sd.mp4?s=7f5564c78d4615a133b3d1b7cfb0ffb307cf90b2&profile_id=139&oauth2_token_id=57447761',
    patrocinador: sponsorMap['Samsung'] || '',
    votos_count: 0
  });

  // Seed videos for Stage 2
  await pb.collection('grupo_videos').create({
    grupo: createdGroupA.id,
    etapa: stage2.id,
    video_url: 'https://player.vimeo.com/external/435674703.sd.mp4?s=7f5564c78d4615a133b3d1b7cfb0ffb307cf90b2&profile_id=139&oauth2_token_id=57447761',
    patrocinador: sponsorMap['Coca-Cola'] || '',
    votos_count: 0
  });
  await pb.collection('grupo_videos').create({
    grupo: createdGroupB.id,
    etapa: stage2.id,
    video_url: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0227e3691a2063d7e5e9a2d3b3c10f8&profile_id=139&oauth2_token_id=57447761',
    patrocinador: sponsorMap['Samsung'] || '',
    votos_count: 0
  });

  console.log('PocketBase Seeding complete.');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
