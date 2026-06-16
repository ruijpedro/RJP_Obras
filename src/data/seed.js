export const rendimentoSeed = [
  { id:'ECA-COB-001', fonte:'ECAACR/RJP', categoria:'Reabilitação', dominio:'Coberturas', descricao:'Substituição de cobertura em telha cerâmica', unidade:'m²', mo:0.75, producaoDia:25, materiais:'Telha cerâmica; ripado; acessórios', equipamento:'Andaime; ferramentas manuais', precoUnit:42 },
  { id:'ECA-FAC-001', fonte:'ECAACR/RJP', categoria:'Reabilitação', dominio:'Fachadas', descricao:'Reparação e pintura de fachada', unidade:'m²', mo:0.55, producaoDia:35, materiais:'Argamassa; primário; tinta', equipamento:'Andaime; lavadora', precoUnit:28 },
  { id:'ECA-DEM-001', fonte:'ECAACR/RJP', categoria:'Demolições', dominio:'Demolições e desmontes', descricao:'Demolição manual de alvenaria', unidade:'m²', mo:0.65, producaoDia:18, materiais:'-', equipamento:'Martelo elétrico; contentor', precoUnit:22 },
  { id:'FER-VED-001', fonte:'RJP Ferrovia', categoria:'Ferrovia', dominio:'Vedações', descricao:'Execução/substituição de vedação metálica', unidade:'m', mo:0.40, producaoDia:60, materiais:'Postes; rede; fixações', equipamento:'Berbequim; viatura; ferramentas', precoUnit:35 },
  { id:'FER-DRE-001', fonte:'RJP Ferrovia', categoria:'Ferrovia', dominio:'Drenagem', descricao:'Limpeza/reperfilamento de valeta', unidade:'m', mo:0.18, producaoDia:120, materiais:'-', equipamento:'Mini-escavadora; viatura', precoUnit:9 },
  { id:'FER-AMV-001', fonte:'RJP Ferrovia', categoria:'Ferrovia', dominio:'AMV', descricao:'Inspeção funcional de AMV e MPS', unidade:'un', mo:2.5, producaoDia:4, materiais:'Lubrificante; consumíveis', equipamento:'Ferramentas de via', precoUnit:180 },
  { id:'EDF-PIN-001', fonte:'RJP Edifícios', categoria:'Edificação', dominio:'Pinturas', descricao:'Pintura interior de paredes', unidade:'m²', mo:0.20, producaoDia:90, materiais:'Primário; tinta plástica', equipamento:'Rolo; trincha; escadote', precoUnit:8 }
]

export const obraSeed = [
  { id:'obra-demo', nome:'Exemplo - Reabilitação de Edifício Ferroviário', cliente:'Infraestruturas de Portugal', empreiteiro:'Empreiteiro Exemplo', fiscalizacao:'RJP', local:'Linha do Oeste', gps:'', inicio:'2026-06-01', fim:'2026-08-30', valor:85000, estado:'Em curso', progresso:35, contrato:'CT-2026-001', observacoes:'Obra de demonstração para testes.' }
]
