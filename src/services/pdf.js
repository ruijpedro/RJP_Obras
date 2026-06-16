import jsPDF from 'jspdf';

export function gerarPdfResumo(state){
  const pdf = new jsPDF();
  const hoje = new Date().toLocaleDateString('pt-PT');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('RJP Obras - Relatório Resumo', 14, 18);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Data: ${hoje}`, 14, 26);
  pdf.text('Software de apoio técnico. Validar sempre por técnico responsável.', 14, 32);
  let y = 44;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Obras', 14, y); y += 8;
  pdf.setFont('helvetica', 'normal');
  state.obras.forEach((o, i) => {
    if (y > 275) { pdf.addPage(); y = 20; }
    pdf.text(`${i+1}. ${o.codigo} - ${o.nome}`, 14, y); y += 6;
    pdf.text(`Cliente: ${o.cliente || '-'} | Local: ${o.local || '-'} | Estado: ${o.estado}`, 18, y); y += 6;
    pdf.text(`Prazo: ${o.inicio || '-'} a ${o.fim || '-'} | Previsto: ${o.previsto || 0} € | Real: ${o.real || 0} €`, 18, y); y += 8;
  });
  y += 4;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Não Conformidades', 14, y); y += 8;
  pdf.setFont('helvetica', 'normal');
  if (!state.nc.length) { pdf.text('Sem não conformidades registadas.', 14, y); }
  state.nc.forEach((n, i) => { pdf.text(`${i+1}. ${n.obra} | ${n.tipo} | ${n.estado} | Prazo: ${n.prazo}`, 14, y); y += 7; });
  pdf.save(`RJP_Obras_resumo_${new Date().toISOString().slice(0,10)}.pdf`);
}
