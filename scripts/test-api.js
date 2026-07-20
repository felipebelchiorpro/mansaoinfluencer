const PocketBase = require('pocketbase/cjs');

async function test() {
  console.log('Starting automated Phase 2 API integration tests...');
  
  const pb = new PocketBase('http://127.0.0.1:8090');
  pb.autoCancellation(false);

  // Authenticate as Admin
  await pb.admins.authWithPassword('admin@mansao.com', 'admin123456789');
  console.log('Authenticated successfully as Admin.');

  // Find active config
  const configs = await pb.collection('votacoes_config').getFullList({ sort: '-created' });
  const activeConfig = configs[0];
  if (!activeConfig) throw new Error('No configuration found');
  console.log(`Using active config ID: ${activeConfig.id}`);

  // Fetch candidates and groups
  const candidates = await pb.collection('candidatos').getFullList({ sort: 'nome' });
  const activeCandidate = candidates.find(c => !c.eliminado);
  const eliminatedCandidate = candidates.find(c => c.eliminado);
  const groups = await pb.collection('grupos').getFullList({ sort: 'nome' });
  const firstGroup = groups[0];

  if (!activeCandidate || !eliminatedCandidate) {
    throw new Error('Please ensure you have seeded at least 1 active and 1 eliminated candidate');
  }
  if (!firstGroup) {
    throw new Error('Please ensure you have seeded at least 1 group');
  }

  // --- PART 1: TEST INDIVIDUAL VOTING ---
  console.log('\n--- Part 1: Testing Individual Voting ---');
  // Set config type to individual
  await pb.collection('votacoes_config').update(activeConfig.id, { tipo: 'individual' });
  console.log('Set voting type to: individual');

  // Test 1.1: Vote for active candidate (should succeed 200)
  console.log(`Testing voting for active candidate: ${activeCandidate.nome} (${activeCandidate.id})`);
  const vote1Res = await fetch('http://localhost:3000/api/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidatoId: activeCandidate.id })
  });
  const vote1Data = await vote1Res.json();
  console.log('Vote 1 Response Status (Expected: 200):', vote1Res.status);
  console.log('Vote 1 Response Body:', vote1Data);
  if (vote1Res.status !== 200 || !vote1Data.success) {
    throw new Error('Vote for active candidate failed');
  }

  // Test 1.2: Immediate second vote (should be rate-limited 429)
  console.log('Casting immediate second vote to test rate-limiting...');
  const vote2Res = await fetch('http://localhost:3000/api/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidatoId: activeCandidate.id })
  });
  const vote2Data = await vote2Res.json();
  console.log('Vote 2 Response Status (Expected: 429):', vote2Res.status);
  console.log('Vote 2 Response Body:', vote2Data);
  if (vote2Res.status !== 429) {
    throw new Error('Rate limiting did not trigger for individual voting');
  }

  // Test 1.3: Vote for eliminated candidate (should fail 400 after cooldown clears)
  console.log('Waiting 3.2 seconds for individual IP cooldown to clear...');
  await new Promise(r => setTimeout(r, 3200));
  console.log(`Testing voting for eliminated candidate: ${eliminatedCandidate.nome} (${eliminatedCandidate.id})`);
  const vote3Res = await fetch('http://localhost:3000/api/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidatoId: eliminatedCandidate.id })
  });
  const vote3Data = await vote3Res.json();
  console.log('Vote 3 Response Status (Expected: 400):', vote3Res.status);
  console.log('Vote 3 Response Body:', vote3Data);
  if (vote3Res.status !== 400 || !vote3Data.error.includes('eliminado')) {
    throw new Error('Voting for eliminated candidate did not return correct block error');
  }


  // --- PART 2: TEST GROUP VOTING ---
  console.log('\n--- Part 2: Testing Group Voting ---');
  // Set config type to grupo
  await pb.collection('votacoes_config').update(activeConfig.id, { tipo: 'grupo' });
  console.log('Set voting type to: grupo');

  // Test 2.1: Vote for group (should succeed 200)
  console.log(`Testing voting for group: ${firstGroup.nome} (${firstGroup.id})`);
  const groupVote1Res = await fetch('http://localhost:3000/api/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grupoId: firstGroup.id })
  });
  const groupVote1Data = await groupVote1Res.json();
  console.log('Group Vote 1 Response Status (Expected: 200):', groupVote1Res.status);
  console.log('Group Vote 1 Response Body:', groupVote1Data);
  if (groupVote1Res.status !== 200 || !groupVote1Data.success) {
    throw new Error('Group vote failed');
  }

  // Test 2.2: Immediate second group vote (should ALSO succeed 200 since group voting is unlimited)
  console.log('Casting immediate second group vote (should NOT be rate-limited)...');
  const groupVote2Res = await fetch('http://localhost:3000/api/vote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grupoId: firstGroup.id })
  });
  const groupVote2Data = await groupVote2Res.json();
  console.log('Group Vote 2 Response Status (Expected: 200):', groupVote2Res.status);
  console.log('Group Vote 2 Response Body:', groupVote2Data);
  if (groupVote2Res.status !== 200 || !groupVote2Data.success) {
    throw new Error('Immediate group vote got rate limited or failed');
  }

  // Restore config to individual for frontend display by default
  await pb.collection('votacoes_config').update(activeConfig.id, { tipo: 'individual' });
  console.log('\nRestored voting type to: individual');

  console.log('\nAPI Phase 2 integration tests PASSED successfully!');
}

test().catch(err => {
  console.error('\nTest FAILED:', err.message);
  process.exit(1);
});
