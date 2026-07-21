import { NextResponse } from 'next/server';
import { pb } from '@/lib/pocketbase';

// In-memory rate limiting map for IPs (only applies to individual voting)
const ipCooldownMap = new Map<string, number>();
const COOLDOWN_MS = 3000;

// Periodic cleanup of the rate-limit map
if (typeof global !== 'undefined') {
  if (!(global as any)._rateLimitInterval) {
    (global as any)._rateLimitInterval = setInterval(() => {
      const now = Date.now();
      for (const [ip, time] of ipCooldownMap.entries()) {
        if (now - time > COOLDOWN_MS) {
          ipCooldownMap.delete(ip);
        }
      }
    }, 60000);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidatoId, grupoId } = body;

    if (!candidatoId && !grupoId) {
      return NextResponse.json(
        { error: 'ID de candidato ou grupo é obrigatório.' },
        { status: 400 }
      );
    }

    const now = Date.now();
    const xForwardedFor = request.headers.get('x-forwarded-for');
    const ip = xForwardedFor ? xForwardedFor.split(',')[0].trim() : '127.0.0.1';

    // 1. Authenticate as Admin to access write permissions
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL || 'antigravity@vortexsync.pro';
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD || 'jhgiBKSRGzmie7z';
    try {
      await pb.admins.authWithPassword(adminEmail, adminPassword);
    } catch (authErr: any) {
      console.error('PocketBase Admin Auth failed:', authErr.message);
      return NextResponse.json(
        { error: 'Erro de comunicação com o banco de dados.' },
        { status: 500 }
      );
    }

    // 2. Fetch active configuration
    const configs = await pb.collection('votacoes_config').getFullList({
      sort: '-created',
      requestKey: 'api_vote_config'
    });

    const activeConfig = configs.find(c => c.ativa === true);
    if (!activeConfig) {
      return NextResponse.json(
        { error: 'A votação não está ativa no momento.' },
        { status: 400 }
      );
    }

    // Check expiration date
    const expiration = new Date(activeConfig.expira_em);
    if (expiration.getTime() < now) {
      return NextResponse.json(
        { error: 'A votação já está encerrada (tempo expirado).' },
        { status: 400 }
      );
    }

    // 3. Process vote based on voting type
    if (activeConfig.tipo === 'grupo') {
      // Group Voting Mode
      if (!grupoId) {
        return NextResponse.json(
          { error: 'ID do grupo é obrigatório para votação em grupo.' },
          { status: 400 }
        );
      }

      // No cooldown for group voting - "votar à vontade"
      try {
        // Find active stage
        const activeStages = await pb.collection('etapas').getFullList({
          filter: 'ativa = true',
          requestKey: 'api_active_stage'
        });
        const activeStage = activeStages[0];

        if (activeStage) {
          // Find the corresponding stage video for this group
          const stageVideos = await pb.collection('grupo_videos').getFullList({
            filter: `grupo = "${grupoId}" && etapa = "${activeStage.id}"`,
            requestKey: 'api_group_stage_video'
          });
          const stageVideo = stageVideos[0];
          
          if (stageVideo) {
            // Increment stage video vote count atomically
            await pb.collection('grupo_videos').update(stageVideo.id, {
              'votos_count+': 1
            });
          }
        }

        // Also increment main group's votes (for cumulative total)
        await pb.collection('grupos').update(grupoId, {
          'votos_count+': 1
        });
      } catch (err) {
        console.error('PocketBase update group error:', err);
        return NextResponse.json(
          { error: 'Grupo não encontrado ou erro ao registrar o voto.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Voto registrado no grupo com sucesso!'
      });

    } else {
      // Individual Voting Mode
      if (!candidatoId) {
        return NextResponse.json(
          { error: 'ID do candidato é obrigatório para votação individual.' },
          { status: 400 }
        );
      }

      // Check IP Cooldown (3 seconds) for individual voting
      const lastVote = ipCooldownMap.get(ip);
      if (lastVote && now - lastVote < COOLDOWN_MS) {
        const remaining = Math.ceil((COOLDOWN_MS - (now - lastVote)) / 1000);
        return NextResponse.json(
          { error: `Aguarde ${remaining} segundos para votar novamente.` },
          { status: 429 }
        );
      }

      // Check if candidate is eliminated
      let candidate;
      try {
        candidate = await pb.collection('candidatos').getOne(candidatoId);
      } catch (err) {
        return NextResponse.json(
          { error: 'Candidato não encontrado.' },
          { status: 404 }
        );
      }

      if (activeConfig.tipo !== 'repescagem' && candidate.eliminado) {
        return NextResponse.json(
          { error: 'Este candidato está eliminado e não pode receber votos.' },
          { status: 400 }
        );
      }

      if (candidate.ativo === false) {
        return NextResponse.json(
          { error: 'Este candidato não está no Paredão ativo nesta rodada.' },
          { status: 400 }
        );
      }

      // Increment candidate votes atomically
      try {
        await pb.collection('candidatos').update(candidatoId, {
          'votos_count+': 1
        });
      } catch (err) {
        console.error('PocketBase update candidate error:', err);
        return NextResponse.json(
          { error: 'Erro ao registrar o voto do candidato.' },
          { status: 500 }
        );
      }

      // Update cooldown map
      ipCooldownMap.set(ip, now);

      return NextResponse.json({
        success: true,
        message: 'Voto registrado com sucesso!'
      });
    }

  } catch (error: any) {
    console.error('API Vote error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
