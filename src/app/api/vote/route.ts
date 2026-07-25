import { NextResponse } from 'next/server';
import { pushVoteToQueue, checkRateLimit, VoteEvent } from '@/lib/redis';

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    
    // Support both new schema (targetId, isGroup, stageId) and legacy schema (candidatoId, grupoId)
    const candidatoId = body.candidatoId || (!body.isGroup ? body.targetId : undefined);
    const grupoId = body.grupoId || (body.isGroup ? body.targetId : undefined);
    const stageId = body.stageId;

    if (!candidatoId && !grupoId) {
      return NextResponse.json(
        { error: 'É necessário informar candidatoId, grupoId ou targetId.' },
        { status: 400 }
      );
    }

    // Extract client IP address
    const xForwardedFor = request.headers.get('x-forwarded-for');
    const ip = xForwardedFor ? xForwardedFor.split(',')[0].trim() : '127.0.0.1';

    // Rate Limiting Check (3s cooldown for individual candidate voting)
    if (candidatoId && !grupoId) {
      const rateLimitResult = await checkRateLimit(ip, 3);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { error: `Aguarde ${rateLimitResult.remainingSeconds}s para votar novamente.` },
          { status: 429 }
        );
      }
    }

    // Build ultra-lightweight vote event
    const voteEvent: VoteEvent = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      candidatoId,
      grupoId,
      stageId,
      ip,
      timestamp: Date.now(),
    };

    // Push to Redis Queue (Atomic & Fast)
    await pushVoteToQueue(voteEvent);

    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        message: 'Voto aceito e enfileirado!',
        latencyMs,
      },
      {
        status: 200,
        headers: {
          'X-Response-Time': `${latencyMs}ms`,
        },
      }
    );

  } catch (error: any) {
    console.error('API Vote Ingestion Error:', error);
    return NextResponse.json(
      { error: 'Erro interno ao enfileirar o voto.' },
      { status: 500 }
    );
  }
}
