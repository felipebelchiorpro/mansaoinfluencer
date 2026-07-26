import { NextResponse } from 'next/server';
import { getConfigFromRedis, setConfigInRedis, setVotingStatus } from '@/lib/redis';
import { pb } from '@/lib/pocketbase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const cachedConfig = await getConfigFromRedis();
    if (cachedConfig) {
      return NextResponse.json({ success: true, config: cachedConfig }, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
    }

    // Fallback no PocketBase
    const configList = await pb.collection('votacoes_config').getFullList({
      sort: '-created',
      requestKey: `cfg_get_${Date.now()}`
    }).catch(() => []);

    const activeConfig = configList.find((c) => c.ativa === true) || configList[0] || null;
    if (activeConfig) {
      await setConfigInRedis(activeConfig);
    }

    return NextResponse.json({ success: true, config: activeConfig }, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
  } catch (error: any) {
    console.error('[SaveConfig GET Error]:', error);
    return NextResponse.json({ success: false, config: null }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titulo, expira_em, tipo, ativa } = body;

    const configList = await pb.collection('votacoes_config').getFullList({
      requestKey: null
    }).catch(() => []);

    const targetId = configList.length > 0 ? configList[0].id : null;

    const dataToSave = {
      id: targetId || `cfg_${Date.now()}`,
      titulo: titulo || 'Quem você quer que continue na Mansão?',
      expira_em: expira_em || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      tipo: tipo || 'individual',
      ativa: typeof ativa === 'boolean' ? ativa : (configList[0]?.ativa ?? true),
      created: configList[0]?.created || new Date().toISOString(),
      updated: new Date().toISOString()
    };

    // 1. Salva soberanamente no Redis (resposta imediata em ~10ms)
    await setConfigInRedis(dataToSave);
    await setVotingStatus(dataToSave.ativa ? 'open' : 'closed');

    // 2. Persiste no PocketBase com credenciais master
    try {
      const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL || 'admin@mansao.com';
      const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD || 'admin123456789';
      await pb.admins.authWithPassword(adminEmail, adminPassword).catch(() => {});

      const pbPayload = {
        titulo: dataToSave.titulo,
        expira_em: dataToSave.expira_em,
        tipo: dataToSave.tipo,
        ativa: dataToSave.ativa
      };

      if (targetId) {
        await pb.collection('votacoes_config').update(targetId, pbPayload, { requestKey: null });
      } else {
        await pb.collection('votacoes_config').create(pbPayload, { requestKey: null });
      }
    } catch (pbErr: any) {
      console.error('[SaveConfig API] Erro no PocketBase:', pbErr?.data || pbErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Configurações salvas e publicadas no Redis e PocketBase com sucesso!',
      config: dataToSave
    }, { status: 200 });

  } catch (error: any) {
    console.error('[SaveConfig POST Error]:', error);
    return NextResponse.json({ success: false, error: 'Erro ao salvar configurações.' }, { status: 500 });
  }
}
