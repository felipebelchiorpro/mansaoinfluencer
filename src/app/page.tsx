'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { pb, Candidato, VotacaoConfig, Patrocinador, Etapa, Grupo } from '@/lib/pocketbase'

export default function Home() {
  const [config, setConfig] = useState<VotacaoConfig | null>(null)
  const [patrocinador, setPatrocinador] = useState<Patrocinador | null>(null)
  const [etapas, setEtapas] = useState<Etapa[]>([])
  const [activeStage, setActiveStage] = useState<Etapa | null>(null)
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(true)
  const [votingForId, setVotingForId] = useState<string | null>(null)
  const [votedSuccess, setVotedSuccess] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Fetch initial config and data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        // 1. Fetch main voting config
        const configs = await pb.collection('votacao_config').getFullList<VotacaoConfig>()
        const activeConfig = configs.find(c => c.ativa) || configs[0] || null
        setConfig(activeConfig)

        // 2. Fetch sponsor (com cast em any para evitar erro de tipo no build)
        const sponsorId = (activeConfig as any)?.patrocinador_id || (activeConfig as any)?.patrocinador
        if (sponsorId) {
          try {
            const pat = await pb.collection('patrocinadores').getOne<Patrocinador>(sponsorId)
            setPatrocinador(pat)
          } catch (e) {
            console.error('Erro ao carregar patrocinador:', e)
          }
        }

        // 3. Fetch active stages
        const stagesList = await pb.collection('etapas').getFullList<Etapa>({
          sort: 'ordem',
          filter: 'ativa = true'
        })
        setEtapas(stagesList)
        const currentActiveStage = stagesList.find(s => s.ativa) || null
        setActiveStage(currentActiveStage)

        // 4. Fetch candidates and groups
        const [candsList, groupsList] = await Promise.all([
          pb.collection('candidatos').getFullList<Candidato>({
            filter: 'ativo = true',
            sort: 'nome'
          }),
          pb.collection('grupos').getFullList<Grupo>({
            sort: 'nome',
            expand: 'membros'
          })
        ])

        setCandidatos(candsList)
        setGrupos(groupsList)
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
        setErrorMessage('Não foi possível carregar as informações da votação.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Voting handler
  const handleVote = async (targetId: string, isGroup: boolean) => {
    if (votingForId) return
    setVotingForId(targetId)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId,
          isGroup,
          stageId: activeStage?.id || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao processar voto')
      }

      setVotedSuccess(targetId)
      setTimeout(() => setVotedSuccess(null), 3000)

      // Refresh data after voting
      if (isGroup) {
        const updatedGroups = await pb.collection('grupos').getFullList<Grupo>({
          sort: 'nome',
          expand: 'membros'
        })
        setGrupos(updatedGroups)
      } else {
        const updatedCands = await pb.collection('candidatos').getFullList<Candidato>({
          filter: 'ativo = true',
          sort: 'nome'
        })
        setCandidatos(updatedCands)
      }
    } catch (err: any) {
      console.error('Erro de votação:', err)
      setErrorMessage(err.message || 'Ocorreu um erro ao votar. Tente novamente.')
    } finally {
      setVotingForId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  const isVotingClosed = config ? !config.ativa : false

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Header Banner */}
      <header className="bg-white border-b border-slate-200 py-6 px-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
              <Image src="/logo.png" alt="Logo" width={48} height={48} className="object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                {config?.titulo || 'Mansão dos Influencers'}
              </h1>
              {activeStage && (
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Etapa Atual: {activeStage.nome}
                </p>
              )}
            </div>
          </div>

          {patrocinador && (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Patrocínio:</span>
              <span className="text-xs font-bold text-slate-800">{patrocinador.nome}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col items-center">
        {errorMessage && (
          <div className="w-full mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700 font-bold ml-4">✕</button>
          </div>
        )}

        {/* Mode Selector / Section Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl">
            {config?.tipo === 'grupo' ? 'Grupos Participantes' : 'Participantes'}
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
            Escolha e vote na sua opção favorita nesta etapa do programa.
          </p>
        </div>

        {/* Group Cards Rendering */}
        {config?.tipo === 'grupo' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {grupos.map((group) => {
              const members = group.expand?.membros || []
              const hasVideo = Boolean(group.video_url)

              return (
                <div
                  key={group.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-900">{group.nome}</h3>
                      {patrocinador && (
                        <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-md">
                          Desafio: {patrocinador.nome}
                        </span>
                      )}
                    </div>

                    {/* Members Avatars */}
                    <div className="mb-6">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Membros do Grupo
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {members.map((member) => (
                          <a
                            key={member.id}
                            href={member.instagram ? `https://instagram.com/${member.instagram.replace('@', '')}` : '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col items-center"
                          >
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 group-hover:border-blue-500 transition-colors bg-slate-100 relative">
                              {member.foto_url ? (
                                <Image src={member.foto_url} alt={member.nome} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm">
                                  {member.nome.charAt(0)}
                                </div>
                              )}
                            </div>
                            <span className="text-[11px] font-bold text-slate-600 group-hover:text-blue-600 mt-1">
                              {member.nome.split(' ')[0]}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Vote Button Section */}
                  <div className="mt-auto">
                    <button
                      onClick={() => handleVote(group.id, true)}
                      disabled={isVotingClosed || votingForId !== null || !hasVideo}
                      className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
                        isVotingClosed || !hasVideo
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          : votingForId === group.id
                          ? 'bg-blue-600 text-white cursor-wait'
                          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg shadow-blue-500/25'
                      }`}
                    >
                      {votingForId === group.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Computando...</span>
                        </>
                      ) : !hasVideo ? (
                        'Aguardando Vídeo'
                      ) : isVotingClosed ? (
                        'Votação Encerrada'
                      ) : (
                        'VOTAR NO GRUPO'
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Individual Candidates Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
            {candidatos.map((cand) => (
              <div
                key={cand.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-slate-200 mb-3 bg-slate-100 relative">
                  {cand.foto_url ? (
                    <Image src={cand.foto_url} alt={cand.nome} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-lg">
                      {cand.nome.charAt(0)}
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight mb-1">
                  {cand.nome}
                </h3>

                {cand.instagram && (
                  <a
                    href={`https://instagram.com/${cand.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 font-medium hover:underline mb-4"
                  >
                    @{cand.instagram.replace('@', '')}
                  </a>
                )}

                <button
                  onClick={() => handleVote(cand.id, false)}
                  disabled={isVotingClosed || votingForId !== null}
                  className={`w-full mt-auto py-2.5 px-3 rounded-xl font-bold text-xs transition-all duration-200 ${
                    isVotingClosed
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : votingForId === cand.id
                      ? 'bg-blue-600 text-white cursor-wait'
                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md shadow-blue-500/20'
                  }`}
                >
                  {votingForId === cand.id ? 'Votando...' : isVotingClosed ? 'Encerrado' : 'VOTAR'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}