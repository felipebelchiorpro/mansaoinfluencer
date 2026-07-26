'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Instagram, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  Trophy, 
  Crown, 
  Medal, 
  Award 
} from 'lucide-react';

type TabType = 'vencedores' | 'participantes';

interface StaticCandidate {
  id: string;
  nome: string;
  instagram: string;
  foto: string;
  eliminado?: boolean;
}

// Complete static list of all 25 influencers from the season
const INFLUENCERS_LIST: StaticCandidate[] = [
  {
    id: "u7k82f8lt2razei",
    nome: "Bitella Thiago Castro",
    instagram: "@bitellaofc",
    foto: "https://api.vortexsync.pro/api/files/candidatos/u7k82f8lt2razei/whats_app_image_2026_07_16_at_20_45_4DqSc3RmKq.37.jpeg"
  },
  {
    id: "371a9mdg2x7rm8j",
    nome: "Bruninho Anão",
    instagram: "@bruninho_souza28",
    foto: "https://api.vortexsync.pro/api/files/candidatos/371a9mdg2x7rm8j/whats_app_image_2026_07_16_at_20_50_5AwDjMOpAj.51.jpeg"
  },
  {
    id: "3zf9ms59m5qzi2c",
    nome: "By Flavinho",
    instagram: "@byflavinhoinfluencer",
    foto: "https://api.vortexsync.pro/api/files/candidatos/3zf9ms59m5qzi2c/491902552_18040491341552482_7831796608420274532_n_VZx53LfeU8.jpg"
  },
  {
    id: "wsgfpzhibniu76d",
    nome: "Chic Chic Boiadeira",
    instagram: "@chic_chic_boiadeira",
    foto: "https://api.vortexsync.pro/api/files/candidatos/wsgfpzhibniu76d/whats_app_image_2026_07_21_at_09_40_YHkmPiY6Wb.32.jpeg"
  },
  {
    id: "lklfpb7hhu3df3s",
    nome: "Claudia Pereira Uai",
    instagram: "@claudiapereiravipp",
    foto: "https://api.vortexsync.pro/api/files/candidatos/lklfpb7hhu3df3s/whats_app_image_2026_07_20_at_21_55_FF0ADuV4OJ.511.jpeg"
  },
  {
    id: "i0jprmd2342x2gq",
    nome: "Dedé Munhoz",
    instagram: "@dede.munhoz",
    foto: "https://api.vortexsync.pro/api/files/candidatos/i0jprmd2342x2gq/whats_app_image_2026_07_21_at_08_26_7Rcv3Go2HH.33.jpeg"
  },
  {
    id: "cqtmlxjrqhrx3zc",
    nome: "Dorado",
    instagram: "@odoradoai",
    foto: "https://api.vortexsync.pro/api/files/candidatos/cqtmlxjrqhrx3zc/whats_app_image_2026_07_22_at_14_48_GqHRJLRhYF.181.jpeg"
  },
  {
    id: "0v7nkqt29kiuoyo",
    nome: "Gabriel Vancinni",
    instagram: "@gabrielvancinni_oficial",
    foto: "https://api.vortexsync.pro/api/files/candidatos/0v7nkqt29kiuoyo/722666675_18322604623259464_6035309822006197393_n_1_UlxEhTckmg.jpg",
    eliminado: true
  },
  {
    id: "21hklxulzvr7ejm",
    nome: "Gino Oliveira",
    instagram: "@oginooliveira",
    foto: "https://api.vortexsync.pro/api/files/candidatos/21hklxulzvr7ejm/gino_P9cVohEMqY.jpeg"
  },
  {
    id: "36txtitdke53pdh",
    nome: "Halky Sósia Gustavo Lima",
    instagram: "@halky_uai",
    foto: "https://api.vortexsync.pro/api/files/candidatos/36txtitdke53pdh/whats_app_image_2026_07_20_at_21_47_PG7wXkyrZF.11.jpeg"
  },
  {
    id: "2c4btx1y5o1jxjf",
    nome: "Igor da Sanfona",
    instagram: "@igordasanfona",
    foto: "https://api.vortexsync.pro/api/files/candidatos/2c4btx1y5o1jxjf/730992499_17889979113589211_8420402598049016161_n_1_m56S34YN0u.jpg",
    eliminado: true
  },
  {
    id: "cgk76kj92nkmeuu",
    nome: "Joice India",
    instagram: "@eusoujoiceindia",
    foto: "https://api.vortexsync.pro/api/files/candidatos/cgk76kj92nkmeuu/whats_app_image_2026_07_20_at_23_40_1IAhROnX5V.14.jpeg"
  },
  {
    id: "adce5orreqmsayv",
    nome: "JáJá Ai Que Legal",
    instagram: "@jaja_ai_que_legall",
    foto: "https://api.vortexsync.pro/api/files/candidatos/adce5orreqmsayv/whats_app_image_2026_07_16_at_15_17_ISwGbgkDoG.33.jpeg"
  },
  {
    id: "wlwtmdqdq1bmszp",
    nome: "Lucas Osminerin",
    instagram: "@osminerin_",
    foto: "https://api.vortexsync.pro/api/files/candidatos/wlwtmdqdq1bmszp/whats_app_image_2026_07_18_at_20_27_FjVPFYo4tT.011.jpeg"
  },
  {
    id: "n79uu1emm3oaji4",
    nome: "Marcos Neves Vinicius",
    instagram: "@marcosviniciusoficial567",
    foto: "https://api.vortexsync.pro/api/files/candidatos/n79uu1emm3oaji4/670424229_17973763310993249_9047378025566341707_n_oIU4RxS3jY.jpg"
  },
  {
    id: "j4ux3dkfm8z0gp0",
    nome: "Marcos Roberto Motoboy",
    instagram: "@marcosrobertoo_16",
    foto: "https://api.vortexsync.pro/api/files/candidatos/j4ux3dkfm8z0gp0/688322892_18583729738040864_2328240496173124216_n_FW64vtQnu0.jpg"
  },
  {
    id: "ativxzcb4s8b1zy",
    nome: "Mayron",
    instagram: "@omayronoficial",
    foto: "https://api.vortexsync.pro/api/files/candidatos/ativxzcb4s8b1zy/whats_app_image_2026_07_18_at_19_22_9TEIZJoZ2e.08.jpeg"
  },
  {
    id: "49f3esxlyxeefg2",
    nome: "Paloma Fravante",
    instagram: "@palomafravante",
    foto: "https://api.vortexsync.pro/api/files/candidatos/49f3esxlyxeefg2/whats_app_image_2026_07_20_at_21_26_PFhQ7M5w2e.56.jpeg"
  },
  {
    id: "bsywqv9rd0af0zn",
    nome: "Paulinho Gogó Sócia",
    instagram: "@paulinhogogososia",
    foto: "https://api.vortexsync.pro/api/files/candidatos/bsywqv9rd0af0zn/whats_app_image_2026_07_20_at_21_33_a8JsDk9hjF.40.jpeg"
  },
  {
    id: "racxv2ozv3xzr3x",
    nome: "Rose de Jesus Influencer",
    instagram: "@rosejesus_influencier",
    foto: "https://api.vortexsync.pro/api/files/candidatos/racxv2ozv3xzr3x/whats_app_image_2026_07_21_at_01_33_zFBhmFgmtR.59.jpeg"
  },
  {
    id: "ztr6ouysdwwdctd",
    nome: "Salu do Rancho",
    instagram: "@salu_do_rancho_oficial",
    foto: "https://api.vortexsync.pro/api/files/candidatos/ztr6ouysdwwdctd/627926325_17876650713476989_2398062847076993535_n_nPx6aaEd41.jpg"
  },
  {
    id: "h9yu20t6k29yxpc",
    nome: "Seu Dedé",
    instagram: "@seudede1",
    foto: "https://api.vortexsync.pro/api/files/candidatos/h9yu20t6k29yxpc/630152022_17848690041650267_355417608212699277_n_MvOURX5mSm.jpg",
    eliminado: true
  },
  {
    id: "0m50axwqn1b25g8",
    nome: "Tata Araujo",
    instagram: "@tata_araujo_oficial",
    foto: "https://api.vortexsync.pro/api/files/candidatos/0m50axwqn1b25g8/whats_app_image_2026_07_16_at_21_30_FrDxAIrfGT.00.jpeg"
  },
  {
    id: "qklrj3nmp8r8gu5",
    nome: "Valéria Huston",
    instagram: "@valeriahuston_35991530598",
    foto: "https://api.vortexsync.pro/api/files/candidatos/qklrj3nmp8r8gu5/whats_app_image_2026_07_20_at_21_28_stsh3vuTXa.21.jpeg",
    eliminado: true
  },
  {
    id: "x5lfmnnp6tactv8",
    nome: "Will A Report",
    instagram: "@will_areport",
    foto: "https://api.vortexsync.pro/api/files/candidatos/x5lfmnnp6tactv8/whats_app_image_2026_07_16_at_15_15_TKUspOuQ8C.50.jpeg"
  }
];

// Top 3 Winners static references
const WINNERS = {
  first: INFLUENCERS_LIST.find(c => c.id === '49f3esxlyxeefg2')!, // Paloma Fravante
  second: INFLUENCERS_LIST.find(c => c.id === 'i0jprmd2342x2gq')!, // Dedé Munhoz
  third: INFLUENCERS_LIST.find(c => c.id === 'wlwtmdqdq1bmszp')!, // Lucas Osminerin
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('vencedores');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* Header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200/80 pt-4 pb-0 px-6 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          <div className="relative w-full flex items-center justify-center min-h-[56px] sm:min-h-[72px]">
            
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo.png" 
                alt="Mansão dos Influenciadores Logo" 
                width={80}
                height={80}
                className="h-14 sm:h-18 w-auto object-contain drop-shadow-xs transition-all duration-300" 
              />
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight hidden min-[540px]:block">
                MANSÃO DOS <span className="text-amber-500">INFLUENCERS</span>
              </h1>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex justify-center border-t border-slate-100/60">
            <button
              onClick={() => setActiveTab('vencedores')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                activeTab === 'vencedores'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              Vencedores
            </button>
            <button
              onClick={() => setActiveTab('participantes')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                activeTab === 'participantes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Users className="w-4 h-4" />
              Influenciadores
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col items-center">
        <div className="w-full flex flex-col items-center gap-8">
          
          {activeTab === 'vencedores' ? (
            // TAB 1: VENCEDORES OFICIAIS DA TEMPORADA (PODIUM)
            <div className="w-full flex flex-col items-center gap-10 animate-fadeIn">
              
              {/* Hero Banner / Header */}
              <div className="w-full text-center bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col items-center max-w-4xl">
                
                {/* Ambient Glow Effects */}
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 blur-3xl rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-20 left-10 w-72 h-72 bg-blue-500/10 blur-3xl rounded-full pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase inline-flex items-center gap-2 mb-4 shadow-lg shadow-amber-500/20">
                    <Trophy className="w-4 h-4 fill-slate-950" />
                    Resultado Final da Votação
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-yellow-300 leading-tight max-w-3xl">
                    PÓDIO DOS VENCEDORES DA TEMPORADA 🏆
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl mt-3">
                    Votações oficialmente encerradas e auditadas. Confira abaixo os grandes campeões consagrados pelo público da Mansão dos Influencers!
                  </p>

                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-amber-300 border border-amber-500/30 px-4 py-2 rounded-xl mt-5 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    Votação Encerrada e Homologada
                  </div>
                </div>
              </div>

              {/* PODIUM DISPLAY (1st, 2nd, 3rd Place) */}
              <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-end pt-2 sm:pt-6">
                
                {/* 2nd Place: Dedé Munhoz (Silver 🥈) */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="order-2 md:order-1 bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-xl flex flex-col items-center relative overflow-hidden transition-all duration-300 hover:shadow-2xl"
                >
                  <div className="absolute top-0 inset-x-0 h-2 bg-slate-400"></div>
                  
                  <div className="relative mb-4 mt-2">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-slate-300 shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={WINNERS.second.foto} alt={WINNERS.second.nome} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-100 border border-slate-600 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-1 shadow-md whitespace-nowrap">
                      <Medal className="w-4 h-4 text-slate-300" />
                      2º Lugar
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-xl sm:text-2xl text-center leading-tight mt-2">
                    {WINNERS.second.nome}
                  </h3>
                  <a href={`https://instagram.com/${WINNERS.second.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-bold inline-flex items-center gap-1 mt-1 hover:underline">
                    <Instagram className="w-3.5 h-3.5" />
                    {WINNERS.second.instagram}
                  </a>

                  <div className="mt-5 w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-center">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Classificação Oficial</span>
                    <span className="text-base font-black text-slate-700">Vice-Campeão 🥈</span>
                  </div>
                </motion.div>

                {/* 1st Place: Paloma Fravante (Gold 🥇) - Highlighted Stage */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="order-1 md:order-2 bg-gradient-to-b from-amber-500/10 via-white to-white border-2 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center relative overflow-hidden transition-all duration-300 hover:scale-[1.02] md:-translate-y-4"
                >
                  <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500"></div>

                  <div className="bg-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-widest px-4 py-1 rounded-full mb-4 inline-flex items-center gap-1.5 shadow-md">
                    <Crown className="w-4 h-4 fill-slate-950" />
                    1º Lugar - Campeã 🏆
                  </div>

                  <div className="relative mb-4">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-amber-400 shadow-2xl ring-4 ring-amber-400/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={WINNERS.first.foto} alt={WINNERS.first.nome} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -top-3 right-0 bg-amber-400 text-slate-950 p-2.5 rounded-full shadow-lg border-2 border-white">
                      <Crown className="w-6 h-6 fill-slate-950" />
                    </div>
                  </div>

                  <h3 className="font-black text-slate-900 text-2xl sm:text-3xl text-center leading-tight">
                    {WINNERS.first.nome}
                  </h3>
                  <a href={`https://instagram.com/${WINNERS.first.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-bold inline-flex items-center gap-1 mt-1 hover:underline">
                    <Instagram className="w-3.5 h-3.5" />
                    {WINNERS.first.instagram}
                  </a>

                  <div className="mt-6 w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 rounded-2xl py-3 px-4 text-center shadow-lg shadow-amber-500/20">
                    <span className="text-[10px] font-black uppercase tracking-widest block text-slate-900/80">Vencedora da Temporada</span>
                    <span className="text-lg font-black text-slate-950">GRANDE CAMPEÃ 🏆</span>
                  </div>
                </motion.div>

                {/* 3rd Place: Lucas Osminerin (Bronze 🥉) */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="order-3 md:order-3 bg-white border-2 border-amber-700/20 rounded-3xl p-6 shadow-xl flex flex-col items-center relative overflow-hidden transition-all duration-300 hover:shadow-2xl"
                >
                  <div className="absolute top-0 inset-x-0 h-2 bg-amber-700"></div>

                  <div className="relative mb-4 mt-2">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-amber-700/40 shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={WINNERS.third.foto} alt={WINNERS.third.nome} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-900 text-amber-100 border border-amber-700 px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-1 shadow-md whitespace-nowrap">
                      <Award className="w-4 h-4 text-amber-300" />
                      3º Lugar
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-xl sm:text-2xl text-center leading-tight mt-2">
                    {WINNERS.third.nome}
                  </h3>
                  <a href={`https://instagram.com/${WINNERS.third.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-bold inline-flex items-center gap-1 mt-1 hover:underline">
                    <Instagram className="w-3.5 h-3.5" />
                    {WINNERS.third.instagram}
                  </a>

                  <div className="mt-5 w-full bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-center">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Classificação Oficial</span>
                    <span className="text-base font-black text-amber-900">3º Colocado 🥉</span>
                  </div>
                </motion.div>

              </div>

              {/* Auditor Info Alert */}
              <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-4 flex gap-3 items-center shadow-xs">
                <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                  Votação encerrada, monitorada e auditada com transparência total. Os resultados foram homologados de forma soberana.
                </p>
              </div>

            </div>
          ) : (
            
            // TAB 2: ALL PARTICIPANTS (INFLUENCERS) LIST - STATIC EMBED (25 INFLUENCERS)
            <div className="w-full max-w-4xl flex flex-col gap-6 animate-fadeIn">
              <div className="text-center sm:text-left">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Elenco Completo da Temporada
                </h3>
                <h2 className="text-2xl font-black text-slate-800">
                  Conheça os 25 Influenciadores
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {INFLUENCERS_LIST.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full group"
                  >
                    {/* Candidate Photo */}
                    <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={candidate.foto}
                        alt={candidate.nome}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                    </div>

                    {/* Details */}
                    <div className="p-3 sm:p-4 flex flex-col flex-1 gap-1">
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight truncate">
                        {candidate.nome}
                      </h4>
                      
                      <a
                        href={`https://instagram.com/${candidate.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 transition-colors self-start mt-1"
                      >
                        <Instagram className="w-3.5 h-3.5" />
                        {candidate.instagram}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-semibold">
          <p>© 2026 Mansão dos Influencers. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Sistema Auditado & Homologado</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
