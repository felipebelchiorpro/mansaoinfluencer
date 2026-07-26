import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Candidato, Grupo, VotacaoConfig, HistoricoVotacao } from './pocketbase';

export interface GenerateAuditPDFOptions {
  candidates?: Candidato[];
  groups?: Grupo[];
  config?: VotacaoConfig | null;
  history?: HistoricoVotacao[];
  historyRecord?: HistoricoVotacao; // Se informado, gera PDF exclusivo desta rodada!
}

interface ImageMetadata {
  base64: string;
  width: number;
  height: number;
}

/**
 * Remove o fundo escuro da imagem em um canvas HTML para tornar a logomarca transparente no PDF.
 */
async function removeDarkBackground(base64: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(base64);

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Remove pixels de fundo escuro/preto ao redor do escudo (r < 28, g < 28, b < 36)
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r < 28 && g < 28 && b < 36) {
          data[i + 3] = 0; // Torna o fundo transparente
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
}

/**
 * Converte uma URL de imagem estática em Base64 mantendo as dimensões originais e removendo o fundo escuro.
 */
async function loadImageWithDimensions(url: string, cleanBackground: boolean = false): Promise<ImageMetadata | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    let base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });

    if (!base64) return null;

    if (cleanBackground) {
      base64 = await removeDarkBackground(base64);
    }

    const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
      img.onerror = () => resolve({ width: 100, height: 100 });
      img.src = base64;
    });

    return { base64, width: dimensions.width, height: dimensions.height };
  } catch (err) {
    console.warn(`[PDFGenerator] Não foi possível carregar imagem (${url}):`, err);
    return null;
  }
}

/**
 * Gera o Hash SHA-256 imutável a partir da string serializada.
 */
async function calculateSHA256Hash(dataString: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(dataString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Gera e realiza o download do PDF Oficial de Auditoria da Mansão dos Influencers.
 * Cada relatório é 100% INDIVIDUAL para a rodada selecionada (sem mistura de múltiplos históricos).
 */
export async function generateAuditPDF({
  candidates = [],
  groups = [],
  config = null,
  historyRecord,
}: GenerateAuditPDFOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Carrega as duas imagens oficiais (com remoção de fundo escuro na logo da Mansão)
  const [mansaoImg, vortexImg] = await Promise.all([
    loadImageWithDimensions('/logo-mansao.png', true),
    loadImageWithDimensions('/logo-vortexsync.png', false),
  ]);

  const now = new Date();
  
  // Dados de entrada para o relatório individual de rodada
  let roundTitle = '';
  let roundStatus = '';
  let roundDateFormatted = '';
  let totalOverallVotes = 0;
  let rankingList: Array<{ pos: string; nome: string; tipo: string; votos: number; porcentagem: string }> = [];

  if (historyRecord) {
    // PDF de Rodada Arquivada do Histórico
    roundTitle = historyRecord.titulo || 'Paredão de Eliminação';
    roundStatus = 'VOTAÇÃO ENCERRADA E AUDITADA';
    roundDateFormatted = historyRecord.data_encerramento
      ? new Date(historyRecord.data_encerramento).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      : now.toLocaleDateString('pt-BR');

    totalOverallVotes = historyRecord.votos_totais || 0;

    const detailsBreakdown = Array.isArray(historyRecord.detalhes) ? historyRecord.detalhes : [];
    if (detailsBreakdown.length > 0) {
      rankingList = [...detailsBreakdown]
        .sort((a: any, b: any) => (b.votos || 0) - (a.votos || 0))
        .map((item: any, idx: number) => {
          const v = item.votos || 0;
          const pct = totalOverallVotes > 0 ? ((v / totalOverallVotes) * 100).toFixed(2) : '0.00';
          const isWinner = item.nome === historyRecord.ganhador;
          return {
            pos: `${idx + 1}º`,
            nome: item.nome,
            tipo: isWinner ? 'Vencedor(a) da Rodada' : (item.eliminado ? 'Eliminado(a)' : 'Participante'),
            votos: v,
            porcentagem: `${pct}%`,
          };
        });
    } else {
      rankingList = [
        {
          pos: '1º',
          nome: historyRecord.ganhador,
          tipo: 'Vencedor(a) Oficial',
          votos: historyRecord.votos_ganhador || 0,
          porcentagem: totalOverallVotes > 0 ? (((historyRecord.votos_ganhador || 0) / totalOverallVotes) * 100).toFixed(2) + '%' : '100.00%',
        },
      ];
    }
  } else {
    // PDF da Rodada Ativa no Dashboard
    roundTitle = config?.titulo || 'Votação Ativa Mansão dos Influencers';
    roundStatus = config?.ativa ? 'VOTAÇÃO EM ANDAMENTO (AUDITORIA PARCIAL)' : 'VOTAÇÃO ENCERRADA E AUDITADA';
    roundDateFormatted = now.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const isGroupVoting = config?.tipo === 'grupo';
    const isRepescagem = config?.tipo === 'repescagem';
    const activeCandidates: Candidato[] = isRepescagem
      ? candidates.filter((c) => c.ativo === true && !c.eliminado)
      : candidates.filter((c) => c.ativo === false && !c.eliminado);

    const totalVotesCandidates = activeCandidates.reduce((sum, c) => sum + (c.votos_count || 0), 0);
    const totalVotesGroups = groups.reduce((sum, g) => sum + (g.votos_count || 0), 0);
    totalOverallVotes = isGroupVoting ? totalVotesGroups : totalVotesCandidates;

    rankingList = isGroupVoting
      ? [...groups].sort((a, b) => (b.votos_count || 0) - (a.votos_count || 0)).map((g, idx) => {
          const votes = g.votos_count || 0;
          const pct = totalOverallVotes > 0 ? ((votes / totalOverallVotes) * 100).toFixed(2) : '0.00';
          return {
            pos: `${idx + 1}º`,
            nome: g.nome,
            tipo: 'Grupo',
            votos: votes,
            porcentagem: `${pct}%`,
          };
        })
      : [...activeCandidates].sort((a, b) => (b.votos_count || 0) - (a.votos_count || 0)).map((c, idx) => {
          const votes = c.votos_count || 0;
          const pct = totalOverallVotes > 0 ? ((votes / totalOverallVotes) * 100).toFixed(2) : '0.00';
          return {
            pos: `${idx + 1}º`,
            nome: c.nome,
            tipo: c.instagram ? `@${c.instagram.replace(/^@/, '')}` : 'Individual',
            votos: votes,
            porcentagem: `${pct}%`,
          };
        });
  }

  // Payload exclusivo da rodada para geração do Hash SHA-256 de imutabilidade
  const auditPayload = JSON.stringify({
    evento: 'Mansão dos Influencers',
    auditoriaPor: 'VortexSync',
    tipoRelatorio: 'AUDITORIA_DE_RODADA_INDIVIDUAL',
    rodadaId: historyRecord?.id || 'RODADA_ATIVA',
    dataConsolidacao: historyRecord?.data_encerramento || now.toISOString(),
    statusVotacao: roundStatus,
    tituloRodada: roundTitle,
    votosTotaisRodada: totalOverallVotes,
    rankingRodada: rankingList,
  });

  const sha256Signature = await calculateSHA256Hash(auditPayload);

  // Layout Setup
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;
  let currentY = 14;

  // -------------------------------------------------------------
  // CABEÇALHO COM AS DUAS LOGOS (FUNDO TRANSPARENTE E SEM CAIXA ESCURA)
  // -------------------------------------------------------------
  doc.setFillColor(15, 23, 42); // Slate-900 Dark Navy
  doc.rect(0, 0, pageWidth, 36, 'F');

  doc.setFillColor(217, 119, 6); // Amber-600 Gold
  doc.rect(0, 36, pageWidth, 2, 'F');

  let textStartX = marginX;

  // Renderiza Logo 1 (Mansão dos Influencers) transparente e proporcional
  if (mansaoImg) {
    try {
      const aspect = mansaoImg.width / mansaoImg.height;
      let renderH = 25;
      let renderW = renderH * aspect;
      if (renderW > 45) {
        renderW = 45;
        renderH = renderW / aspect;
      }
      const posY = 5.5 + (25 - renderH) / 2;
      doc.addImage(mansaoImg.base64, 'PNG', marginX, posY, renderW, renderH);
      textStartX = marginX + renderW + 5;
    } catch (e) {
      console.warn('Erro ao inserir logo Mansão:', e);
    }
  }

  // Renderiza Logo 2 (VortexSync) proporcionalmente no canto direito
  if (vortexImg) {
    try {
      const aspect = vortexImg.width / vortexImg.height;
      let renderH = 22;
      let renderW = renderH * aspect;
      if (renderW > 45) {
        renderW = 45;
        renderH = renderW / aspect;
      }
      const posX = pageWidth - marginX - renderW;
      const posY = 6 + (24 - renderH) / 2;
      doc.addImage(vortexImg.base64, 'PNG', posX, posY, renderW, renderH);
    } catch (e) {
      console.warn('Erro ao inserir logo VortexSync:', e);
    }
  }

  // Título e Subtítulos no Cabeçalho
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('RELATÓRIO OFICIAL DE AUDITORIA DE RODADA', textStartX, 13);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // Slate-300
  doc.text('MANSÃO DOS INFLUENCERS - APURAÇÃO INDIVIDUAL', textStartX, 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(251, 191, 36); // Amber-400
  doc.text('TECNOLOGIA DE AUDITORIA & SEGURANÇA POR VORTEXSYNC', textStartX, 27);

  currentY = 44;

  // -------------------------------------------------------------
  // CARTÃO DE METADADOS DA RODADA
  // -------------------------------------------------------------
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, currentY, pageWidth - marginX * 2, 34, 3, 3, 'FD');

  const col1X = marginX + 5;
  const col2X = marginX + 96;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('DATA E HORA DA CONSOLIDAÇÃO:', col1X, currentY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(roundDateFormatted, col1X, currentY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('STATUS DA RODADA:', col1X, currentY + 20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text(roundStatus, col1X, currentY + 25);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TÍTULO / DESAFIO DA RODADA:', col2X, currentY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const titleText = doc.splitTextToSize(roundTitle, 80);
  doc.text(titleText, col2X, currentY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL DE VOTOS PROCESSADOS NA RODADA:', col2X, currentY + 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235);
  doc.text(`${totalOverallVotes.toLocaleString('pt-BR')} VOTOS`, col2X, currentY + 26);

  currentY += 42;

  // -------------------------------------------------------------
  // CLASSIFICAÇÃO E APURAÇÃO EXCLUSIVA DA RODADA
  // -------------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('CLASSIFICAÇÃO E APURAÇÃO OFICIAL DA RODADA', marginX, currentY);

  currentY += 4;

  const rankingHeaders = [['Posição', 'Participante / Opção', 'Status / Identificador', 'Votos Totais', '% na Rodada']];
  const rankingRows = rankingList.map((item) => [
    item.pos,
    item.nome,
    item.tipo,
    item.votos.toLocaleString('pt-BR'),
    item.porcentagem,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: rankingHeaders,
    body: rankingRows,
    margin: { left: marginX, right: marginX },
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 3.5,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 65, fontStyle: 'bold' },
      2: { cellWidth: 45, textColor: [100, 116, 139] },
      3: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 26, halign: 'right', fontStyle: 'bold', textColor: [37, 99, 235] },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.row.index === 0) {
        // Destaca o 1º lugar da rodada em Dourado
        data.cell.styles.fillColor = [254, 243, 199];
        data.cell.styles.textColor = [146, 64, 14];
      }
    },
  });

  // -------------------------------------------------------------
  // RODAPÉ COM HASH DE IMUTABILIDADE SHA-256 E PAGINAÇÃO
  // -------------------------------------------------------------
  const totalPages = doc.getNumberOfPages();

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    const footerY = pageHeight - 16;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, footerY - 2, pageWidth - marginX, footerY - 2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text('ASSINATURA DIGITAL DE INTEGRIDADE DA AUDITORIA (SHA-256):', marginX, footerY + 1);

    doc.setFont('courier', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.text(sha256Signature.toUpperCase(), marginX, footerY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Este documento e sua assinatura criptográfica SHA-256 garantem a imutabilidade dos dados oficiais desta rodada coletados no PocketBase por VortexSync.',
      marginX,
      footerY + 9
    );

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Página ${p} de ${totalPages}`, pageWidth - marginX, footerY + 5, { align: 'right' });
  }

  const sanitizedDate = (historyRecord?.data_encerramento || now.toISOString()).slice(0, 10);
  const titleClean = (roundTitle || 'Rodada').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Relatorio_Auditoria_Mansao_Rodada_${titleClean}_${sanitizedDate}.pdf`;

  doc.save(fileName);
}
