import jsPDF from 'jspdf'

export function gerarRelatorioGeral(data){
  const doc = new jsPDF()
  let y = 18
  doc.setFontSize(18)
  doc.text('RJP Obras V3 - Relatório Geral', 14, y)
  y += 9
  doc.setFontSize(9)
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, 14, y)
  y += 12

  const custoPrev = data.custos.reduce((s,c)=>s+(Number(c.previsto)||0),0)
  const custoReal = data.custos.reduce((s,c)=>s+(Number(c.real)||0),0)
  const ncsAbertas = data.ncs.filter(n=>n.estado !== 'Fechada').length

  doc.setFontSize(11)
  ;[
    `Obras: ${data.obras.length}`,
    `Diários: ${data.diarios.length}`,
    `Licenças: ${data.licencas.length}`,
    `Não conformidades abertas: ${ncsAbertas}`,
    `Custo previsto: ${custoPrev.toFixed(2)} EUR`,
    `Custo real: ${custoReal.toFixed(2)} EUR`
  ].forEach(l=>{ doc.text(l, 14, y); y+=7 })

  y += 7
  doc.setFontSize(14)
  doc.text('Obras', 14, y)
  y += 8
  doc.setFontSize(9)
  data.obras.forEach(o=>{
    if(y > 280){ doc.addPage(); y = 18 }
    doc.text(`• ${o.nome || '-'} | ${o.local || '-'} | ${o.estado || '-'} | ${o.progresso || 0}%`, 14, y)
    y += 6
  })

  doc.save('RJP_Obras_V3_Relatorio_Geral.pdf')
}

export function gerarDiarioPDF(obra, diarios){
  const doc = new jsPDF()
  let y = 18
  doc.setFontSize(17)
  doc.text('RJP Obras V3 - Diário de Obra', 14, y)
  y += 10
  doc.setFontSize(11)
  doc.text(`Obra: ${obra?.nome || 'Todas'}`, 14, y)
  y += 10
  doc.setFontSize(9)
  diarios.forEach(d=>{
    if(y > 275){ doc.addPage(); y = 18 }
    doc.text(`${d.data} | ${d.meteorologia || ''}`, 14, y); y+=5
    doc.text(`Trabalhos: ${(d.trabalhos || '').slice(0,110)}`, 14, y); y+=5
    doc.text(`Ocorrências: ${(d.ocorrencias || '').slice(0,110)}`, 14, y); y+=8
  })
  doc.save('RJP_Obras_V3_Diario.pdf')
}
