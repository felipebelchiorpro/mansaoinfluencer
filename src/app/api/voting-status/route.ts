import { NextResponse } from 'next/server';
import { getVotingStatus, setVotingStatus } from '@/lib/redis';
import { pb } from '@/lib/pocketbase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const status = await getVotingStatus();

    // Se no Redis o status estiver explicitamente "closed", a votação está fechada
    if (status === 'closed') {
      return NextResponse.json(
        { status: 'closed', active: false },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }
      );
    }

    // Checa fallback de configuração no PocketBase (caso Redis não esteja sincronizado)
    try {
      const configList = await pb.collection('votacoes_config').getFullList({
        sort: '-created',
        requestKey: `status_check_${Date.now()}`,
      });
      const activeConfig = configList.find((c) => c.ativa === true);
      if (!activeConfig) {
        return NextResponse.json(
          { status: 'closed', active: false },
          {
            status: 200,
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
          }
        );
      }
    } catch (pbErr) {
      console.warn('[VotingStatus API] Fallback PocketBase indisponível:', pbErr);
      // Pela regra de resiliência visual, não encerra por oscilação se Redis permitiu
    }

    return NextResponse.json(
      { status: 'open', active: true },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('[VotingStatus API Error]:', error);
    // Em caso de falha de conexão/rede, não bloqueia a UI prematuramente
    return NextResponse.json(
      { status: 'open', active: true, fallback: true },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newStatus = body.status === 'closed' ? 'closed' : 'open';

    await setVotingStatus(newStatus);

    return NextResponse.json({ success: true, status: newStatus }, { status: 200 });
  } catch (error: any) {
    console.error('[VotingStatus POST Error]:', error);
    return NextResponse.json({ error: 'Erro ao atualizar status.' }, { status: 500 });
  }
}
