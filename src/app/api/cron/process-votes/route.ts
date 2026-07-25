import { NextResponse } from 'next/server';
import { processVoteBatch } from '@/lib/voteProcessor';

export async function GET(request: Request) {
  return handleCronRequest(request);
}

export async function POST(request: Request) {
  return handleCronRequest(request);
}

async function handleCronRequest(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret') || request.headers.get('x-cron-secret') || request.headers.get('authorization')?.replace('Bearer ', '');
  const expectedSecret = process.env.CRON_SECRET || 'mansao_secret_cron_key_2026';

  if (secret !== expectedSecret && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  }

  try {
    const result = await processVoteBatch(500);
    return NextResponse.json({
      success: true,
      message: `Lote processado com sucesso. ${result.processedCount} votos persistidos no PocketBase.`,
      ...result
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Erro durante o processamento do lote de votos.', details: err.message },
      { status: 500 }
    );
  }
}
