import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import jsPDF from 'jspdf'
import {
  Building2, ClipboardList, FileText, HardHat, CalendarDays, AlertTriangle,
  Download, Plus, Trash2, Cloud, MapPin, Camera, Search, Train, BarChart3,
  Euro, Bot, Upload, Wand2, Save, CheckCircle2
} from 'lucide-react'
import './style.css'

const STORE = 'rjp_obras_v41'

const seedR = [
  { id:'ECA-COB-001', fonte:'ECAACR/RJP', cat:'Reabilitação', dom:'Coberturas', desc:'Substituição de cobertura em telha cerâmica', un:'m²', mo:0.75, prod:25, mat:'Telha; ripado; acessórios', eq:'Andaime; ferramentas', pu:42 },
  { id:'ECA-FAC-001', fonte:'ECAACR/RJP', cat:'Reabilitação', dom:'Fachadas', desc:'Reparação e pintura de fachada', un:'m²', mo:0.55, prod:35, mat:'Argamassa; primário; tinta', eq:'Andaime; lavadora', pu:28 },
  { id:'ECA-DEM-001', fonte:'ECAACR/RJP', cat:'Demolições', dom:'Demolições', desc:'Demolição manual de alvenaria', un:'m²', mo:0.65, prod:18, mat:'-', eq:'Martelo elétrico; contentor', pu:22 },
  { id:'FER-VED-001', fonte:'RJP Ferrovia', cat:'Ferrovia', dom:'Vedações', desc:'Execução/substituição de vedação metálica', un:'m', mo:0.40, prod:60, mat:'Postes; rede; fixações', eq:'Berbequim; viatura', pu:35 },
  { id:'FER-DRE-001', fonte:'RJP Ferrovia', cat:'Ferrovia', dom:'Drenagem', desc:'Limpeza/reperfilamento de valeta', un:'m', mo:0.18, prod:120, mat:'-', eq:'Mini-escavadora; viatura', pu:9 },
  { id:'FER-AMV-001', fonte:'RJP Ferrovia', cat:'Ferrovia', dom:'AMV', desc:'Inspeção funcional de AMV e MPS', un:'un', mo:2.5, prod:4, mat:'Lubrificante; consumíveis', eq:'Ferramentas de via', pu:180 }
]

const obraDemo = {
  id:'obra-demo', nome:'Exemplo - Reabilitação de Edifício Ferroviário', cliente:'Infraestruturas de Portugal',
  empreiteiro:'Empreiteiro Exemplo', fiscalizacao:'RJP', local:'Linha do Oeste', gps:'', inicio:'2026-06-01',
  fim:'2026-08-30', valor:'85000', estado:'Em curso', progresso:35, contrato:'CT-2026-001', obs:'Obra de demonstração.'
}

const empty = {
  obra:{ nome:'', cliente:'', empreiteiro:'', fiscalizacao:'', local:'', gps:'', inicio:'', fim:'', valor:'', estado:'Em preparação', progresso:0, contrato:'', obs:'' },
  diario:{ obraId:'', data:new Date().toISOString().slice(0,10), meteo:'', equipa:'', trab:'', ocor:'', gps:'', ia:'' },
  tarefa:{ obraId:'', tarefa:'', subtarefa:'', resp:'', inicio:'', fim:'', depende:'', estado:'Planeada', pct:0, prioridade:'Média' },
  auto:{ obraId:'', artigo:'', desc:'', un:'m²', qtdContratada:'', qtdExecutada:'', qtdAcumulada:'', pu:'', estado:'Por aprovar' },
  curva:{ obraId:'', mes:new Date().toISOString().slice(0,7), previsto:'', real:'' },
  ferrovia:{ obraId:'', tipo:'Edifícios', linha:'', local:'', pkIni:'', pkFim:'', lado:'', estado:'Razoável', acao:'', gps:'', obs:'' },
  rend:{ fonte:'RJP', cat:'Edificação', dom:'', desc:'', un:'m²', mo:'', prod:'', mat:'', eq:'', pu:'' },
  lic:{ obraId:'', tipo:'Licença de obra', entidade:'', num:'', emissao:'', validade:'', estado:'Válida', link:'', obs:'' },
  nc:{ obraId:'', data:new Date().toISOString().slice(0,10), local:'', desc:'', grav:'Média', resp:'', prazo:'', estado:'Aberta', gps:'' },
  foto:{ obraId:'', data:new Date().toISOString().slice(0,10), titulo:'', cat:'Obra', gps:'', desc:'', ficheiro:'', ia:'' }
}

function defaultData(){
  return { obras:[obraDemo], diarios:[], tarefas:[], autos:[], curva:[], ferroviarios:[], rend:seedR, custos:[], licencas:[], ncs:[], fotos:[], settings:{url:''} }
}
function load(){ try { return { ...defaultData(), ...JSON.parse(localStorage.getItem(STORE) || '{}') } } catch { return defaultData() } }
function uid(prefix){ return `${prefix}_${Math.random().toString(36).slice(2,8)}_${Date.now().toString(36).slice(-5)}` }
function n(v){ return Number(v || 0) }

function Field({label, value, set, type='text'}){
  return <label className="field"><span>{label}</span><input type={type} value={value ?? ''} onChange={e=>set(e.target.value)} /></label>
}
function TextArea({label, value, set}){
  return <label className="field wide"><span>{label}</span><textarea value={value ?? ''} onChange={e=>set(e.target.value)} /></label>
}
function SelectField({label, value, set, opts}){
  return <label className="field"><span>{label}</span><select value={value ?? ''} onChange={e=>set(e.target.value)}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select></label>
}
function SelectObra({data, value, set}){
  return <label className="field"><span>Obra</span><select value={value ?? ''} onChange={e=>set(e.target.value)}><option value="">Selecionar obra</option>{data.obras.map(o=><option key={o.id} value={o.id}>{o.nome}</option>)}</select></label>
}
function Panel({title, children, action}){
  return <section className="panel"><div className="sectionHead"><h2>{title}</h2>{action}</div>{children}</section>
}
function Card({title, value, warn}){
  return <div className={warn ? 'metric warn' : 'metric'}><span>{title}</span><b>{value}</b></div>
}
function List({items, render, onDelete}){
  if(!items.length) return <p className="muted">Ainda sem registos.</p>
  return <div className="list">{items.map(item=><div className="listItem" key={item.id}><div>{render(item)}</div>{onDelete && <button className="icon danger" onClick={()=>onDelete(item.id)}><Trash2 size={16}/></button>}</div>)}</div>
}

function App(){
  const [data,setData] = useState(load())
  const [tab,setTab] = useState('dashboard')
  const [q,setQ] = useState('')
  const [msg,setMsg] = useState('')
  const [obra,setObra] = useState(empty.obra)
  const [diario,setDiario] = useState(empty.diario)
  const [tarefa,setTarefa] = useState(empty.tarefa)
  const [auto,setAuto] = useState(empty.auto)
  const [curva,setCurva] = useState(empty.curva)
  const [ferrovia,setFerrovia] = useState(empty.ferrovia)
  const [rend,setRend] = useState(empty.rend)
  const [lic,setLic] = useState(empty.lic)
  const [nc,setNc] = useState(empty.nc)
  const [foto,setFoto] = useState(empty.foto)
  const [ia,setIa] = useState('')

  const persist = next => { setData(next); localStorage.setItem(STORE, JSON.stringify(next)) }
  const obraName = id => data.obras.find(o=>o.id===id)?.nome || 'Sem obra'
  const filtered = arr => arr.filter(x=>JSON.stringify(x).toLowerCase().includes(q.toLowerCase()))
  const add = (key,obj,setter,blank,prefix) => { if(!Object.values(obj).some(Boolean)) return; persist({...data, [key]:[{...obj,id:uid(prefix)}, ...data[key]]}); setter(blank) }
  const del = (key,id) => persist({...data, [key]:data[key].filter(x=>x.id!==id)})

  const totalAutos = data.autos.reduce((s,a)=>s+n(a.qtdExecutada)*n(a.pu),0)
  const totalPrevisto = data.curva.reduce((s,c)=>s+n(c.previsto),0)
  const totalReal = data.curva.reduce((s,c)=>s+n(c.real),0)
  const progresso = data.obras.length ? Math.round(data.obras.reduce((s,o)=>s+n(o.progresso),0)/data.obras.length) : 0
  const tarefasAtraso = data.tarefas.filter(t=>t.fim && new Date(t.fim)<new Date() && t.estado!=='Concluída').length
  const lic30 = data.licencas.filter(l=>l.validade && ((new Date(l.validade)-new Date())/864e5)<=30 && ((new Date(l.validade)-new Date())/864e5)>=0).length
  const ncCriticas = data.ncs.filter(x=>x.grav==='Crítica' && x.estado!=='Fechada').length

  const curvaSorted = useMemo(()=>[...data.curva].sort((a,b)=>(a.mes||'').localeCompare(b.mes||'')),[data.curva])

  function gps(setter,obj){
    if(!navigator.geolocation){ setMsg('GPS não disponível.'); return }
    navigator.geolocation.getCurrentPosition(
      p=>setter({...obj, gps:`${p.coords.latitude.toFixed(7)}, ${p.coords.longitude.toFixed(7)}`}),
      ()=>setMsg('Não foi possível obter GPS.'),
      { enableHighAccuracy:true, timeout:15000 }
    )
  }
  function exportJson(){
    const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'})
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'RJP_Obras_V41_backup.json'; a.click()
  }
  function importJson(e){
    const f = e.target.files?.[0]; if(!f) return
    const r = new FileReader(); r.onload = () => { try { persist({...defaultData(), ...JSON.parse(r.result)}); setMsg('Backup importado.') } catch { setMsg('Ficheiro inválido.') } }; r.readAsText(f)
  }
  function pdf(){
    const d = new jsPDF(); let y=18
    d.setFontSize(18); d.text('RJP Obras V4.1 - Relatório Executivo',14,y); y+=10
    d.setFontSize(10); [`Obras: ${data.obras.length}`,`Tarefas em atraso: ${tarefasAtraso}`,`Licenças a vencer: ${lic30}`,`NC críticas: ${ncCriticas}`,`Autos: ${totalAutos.toFixed(2)} EUR`,`Curva S previsto/real: ${totalPrevisto.toFixed(2)} / ${totalReal.toFixed(2)} EUR`].forEach(l=>{d.text(l,14,y); y+=7})
    y+=6; d.setFontSize(13); d.text('Obras',14,y); y+=8; d.setFontSize(9)
    data.obras.forEach(o=>{ if(y>280){d.addPage(); y=18} d.text(`• ${o.nome} | ${o.local} | ${o.estado} | ${o.progresso}%`,14,y); y+=6 })
    d.save('RJP_Obras_V41_Relatorio.pdf')
  }
  function diarioIA(){
    const t = `${diario.trab} ${diario.ocor}`.toLowerCase(); let r='Resumo IA: '
    if(t.includes('ved')||t.includes('rede')) r+='atividade de vedações; '
    if(t.includes('cob')||t.includes('telha')) r+='atividade de cobertura; '
    if(t.includes('hum')||t.includes('infil')) r+='possível humidade/infiltração; '
    if(t.includes('atras')) r+='risco de atraso; '
    if(r==='Resumo IA: ') r+='sem alertas automáticos.'
    setDiario({...diario, ia:r})
  }
  function assistente(){
    const t = ia.toLowerCase(); const m = t.match(/(\d+[\.,]?\d*)\s*(m2|m²|m|ml|un)/); const qtd = m ? Number(m[1].replace(',','.')) : 0
    let r = null
    if(t.includes('ved')) r=data.rend.find(x=>x.dom==='Vedações')
    if(t.includes('cob')) r=data.rend.find(x=>x.dom==='Coberturas')
    if(t.includes('fach')) r=data.rend.find(x=>x.dom==='Fachadas')
    if(t.includes('dren')) r=data.rend.find(x=>x.dom==='Drenagem')
    if(t.includes('atras')) return setIa(`Tarefas em atraso: ${tarefasAtraso}`)
    if(t.includes('licen')) return setIa(`Licenças a vencer nos próximos 30 dias: ${lic30}`)
    if(r && qtd) return setIa(`Sugestão IA RJP Obras V4.1:\nAtividade: ${r.desc}\nQuantidade: ${qtd} ${r.un}\nDuração: ${Math.ceil(qtd/(n(r.prod)||1))} dias/equipa\nCusto: ${(qtd*n(r.pu)).toFixed(2)} EUR\nMão-de-obra: ${(qtd*n(r.mo)).toFixed(2)} h`)
    setIa('Exemplos: executar 120 m de vedação; substituir 850 m² de cobertura; que tarefas estão em atraso?')
  }
  async function sync(){
    try{
      if(!data.settings.url) throw new Error('URL Apps Script vazio')
      await fetch(data.settings.url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify({app:'RJP Obras V4.1', payload:data})})
      setMsg('Sincronização enviada.')
    }catch(e){ setMsg(e.message) }
  }

  const tabs = [
    ['dashboard','Dashboard',Building2], ['obras','Obras',HardHat], ['diario','Diário IA',ClipboardList],
    ['planeamento','Planeamento',CalendarDays], ['autos','Autos',Euro], ['curvas','Curva S',BarChart3],
    ['rendimentos','Rendimentos',Search], ['ferrovia','Ferrovia IP',Train], ['licencas','Licenças',FileText],
    ['nc','NC',AlertTriangle], ['fotos','Fotos GPS',Camera], ['google','Google',Cloud], ['ia','Assistente IA',Bot]
  ]

  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="logo">RJP</div><div><b>RJP Obras</b><small>V4.1 · APK + WebApp</small></div></div>
      <nav>{tabs.map(([id,label,Icon])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><Icon size={18}/>{label}</button>)}</nav>
      <button className="sideDanger" onClick={()=>confirm('Repor dados?')&&persist(defaultData())}><Trash2 size={16}/>Repor dados</button>
      <div className="disclaimer">Software de apoio técnico. Validar antes de uso profissional.</div>
    </aside>
    <main>
      <header className="top"><div><h1>{tabs.find(t=>t[0]===tab)?.[1]}</h1><p>Gestão de obra, planeamento, autos, Curva S, ferrovia IP, GPS, Google e PDF.</p></div><div className="topActions"><button onClick={pdf}><FileText size={17}/>PDF</button><button onClick={exportJson}><Download size={17}/>Backup</button><label className="upload"><Upload size={17}/>Importar<input type="file" accept="application/json" onChange={importJson}/></label><button onClick={sync}><Cloud size={17}/>Sync</button></div></header>
      {msg && <div className="toast" onClick={()=>setMsg('')}>{msg}</div>}
      <div className="search"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Pesquisar em todos os registos..."/></div>

      {tab==='dashboard' && <><div className="grid dash"><Card title="Obras" value={data.obras.length}/><Card title="Progresso" value={`${progresso}%`}/><Card title="Tarefas atraso" value={tarefasAtraso} warn={tarefasAtraso}/><Card title="Licenças 30d" value={lic30} warn={lic30}/><Card title="NC críticas" value={ncCriticas} warn={ncCriticas}/><Card title="Autos" value={`${totalAutos.toFixed(0)} €`}/><Card title="Previsto" value={`${totalPrevisto.toFixed(0)} €`}/><Card title="Real" value={`${totalReal.toFixed(0)} €`}/></div><Panel title="Curva S executiva"><div className="curve"><div style={{width:Math.min(progresso,100)+'%'}}>{progresso}%</div></div></Panel><Panel title="Últimas obras"><List items={filtered(data.obras).slice(0,8)} render={o=><><b>{o.nome}</b><span>{o.local} · {o.estado} · {o.progresso}%</span></>}/></Panel></>}

      {tab==='obras' && <><Panel title="Cadastro de obra"><div className="formgrid"><Field label="Nome" value={obra.nome} set={v=>setObra({...obra,nome:v})}/><Field label="Cliente" value={obra.cliente} set={v=>setObra({...obra,cliente:v})}/><Field label="Empreiteiro" value={obra.empreiteiro} set={v=>setObra({...obra,empreiteiro:v})}/><Field label="Fiscalização" value={obra.fiscalizacao} set={v=>setObra({...obra,fiscalizacao:v})}/><Field label="Contrato" value={obra.contrato} set={v=>setObra({...obra,contrato:v})}/><Field label="Local" value={obra.local} set={v=>setObra({...obra,local:v})}/><Field label="GPS" value={obra.gps} set={v=>setObra({...obra,gps:v})}/><Field label="Início" type="date" value={obra.inicio} set={v=>setObra({...obra,inicio:v})}/><Field label="Fim" type="date" value={obra.fim} set={v=>setObra({...obra,fim:v})}/><Field label="Valor" type="number" value={obra.valor} set={v=>setObra({...obra,valor:v})}/><Field label="Progresso" type="number" value={obra.progresso} set={v=>setObra({...obra,progresso:v})}/><SelectField label="Estado" value={obra.estado} set={v=>setObra({...obra,estado:v})} opts={['Em preparação','Em curso','Suspensa','Concluída','Encerrada']}/><TextArea label="Observações" value={obra.obs} set={v=>setObra({...obra,obs:v})}/></div><div className="row"><button onClick={()=>gps(setObra,obra)}><MapPin size={16}/>GPS</button><button className="primary" onClick={()=>add('obras',obra,setObra,empty.obra,'obra')}><Plus size={16}/>Guardar</button></div></Panel><Panel title="Obras registadas"><List items={filtered(data.obras)} onDelete={id=>del('obras',id)} render={o=><><b>{o.nome}</b><span>{o.cliente} · {o.local} · {o.estado}</span></>}/></Panel></>}

      {tab==='diario' && <><Panel title="Diário de obra IA"><div className="formgrid"><SelectObra data={data} value={diario.obraId} set={v=>setDiario({...diario,obraId:v})}/><Field label="Data" type="date" value={diario.data} set={v=>setDiario({...diario,data:v})}/><Field label="Meteorologia" value={diario.meteo} set={v=>setDiario({...diario,meteo:v})}/><Field label="Equipas" value={diario.equipa} set={v=>setDiario({...diario,equipa:v})}/><Field label="GPS" value={diario.gps} set={v=>setDiario({...diario,gps:v})}/><TextArea label="Trabalhos" value={diario.trab} set={v=>setDiario({...diario,trab:v})}/><TextArea label="Ocorrências" value={diario.ocor} set={v=>setDiario({...diario,ocor:v})}/><TextArea label="Resumo IA" value={diario.ia} set={v=>setDiario({...diario,ia:v})}/></div><div className="row"><button onClick={()=>gps(setDiario,diario)}><MapPin size={16}/>GPS</button><button onClick={diarioIA}><Wand2 size={16}/>Analisar</button><button className="primary" onClick={()=>add('diarios',diario,setDiario,empty.diario,'dia')}><Save size={16}/>Guardar</button></div></Panel><Panel title="Diários"><List items={filtered(data.diarios)} onDelete={id=>del('diarios',id)} render={d=><><b>{d.data} · {obraName(d.obraId)}</b><span>{d.trab}</span><small>{d.ia}</small></>}/></Panel></>}

      {tab==='planeamento' && <><Panel title="Planeamento / Gantt V4.1"><div className="formgrid"><SelectObra data={data} value={tarefa.obraId} set={v=>setTarefa({...tarefa,obraId:v})}/><Field label="Tarefa" value={tarefa.tarefa} set={v=>setTarefa({...tarefa,tarefa:v})}/><Field label="Subtarefa" value={tarefa.subtarefa} set={v=>setTarefa({...tarefa,subtarefa:v})}/><Field label="Responsável" value={tarefa.resp} set={v=>setTarefa({...tarefa,resp:v})}/><Field label="Início" type="date" value={tarefa.inicio} set={v=>setTarefa({...tarefa,inicio:v})}/><Field label="Fim" type="date" value={tarefa.fim} set={v=>setTarefa({...tarefa,fim:v})}/><Field label="% concluído" type="number" value={tarefa.pct} set={v=>setTarefa({...tarefa,pct:v})}/><Field label="Depende de" value={tarefa.depende} set={v=>setTarefa({...tarefa,depende:v})}/><SelectField label="Prioridade" value={tarefa.prioridade} set={v=>setTarefa({...tarefa,prioridade:v})} opts={['Baixa','Média','Alta','Crítica']}/><SelectField label="Estado" value={tarefa.estado} set={v=>setTarefa({...tarefa,estado:v})} opts={['Planeada','Em curso','Concluída','Bloqueada']}/></div><button className="primary" onClick={()=>add('tarefas',tarefa,setTarefa,empty.tarefa,'tar')}><Plus size={16}/>Adicionar tarefa</button></Panel><Panel title="Gantt simples">{filtered(data.tarefas).map(t=><div className="gantt" key={t.id}><span>{t.tarefa} · {obraName(t.obraId)} · {t.resp}</span><i className={(t.fim&&new Date(t.fim)<new Date()&&t.estado!=='Concluída')?'late':''} style={{width:Math.min(n(t.pct),100)+'%'}}></i><button onClick={()=>del('tarefas',t.id)}><Trash2 size={15}/></button></div>)}</Panel></>}

      {tab==='autos' && <><Panel title="Autos profissionais"><div className="formgrid"><SelectObra data={data} value={auto.obraId} set={v=>setAuto({...auto,obraId:v})}/><Field label="Artigo" value={auto.artigo} set={v=>setAuto({...auto,artigo:v})}/><Field label="Descrição" value={auto.desc} set={v=>setAuto({...auto,desc:v})}/><Field label="Unidade" value={auto.un} set={v=>setAuto({...auto,un:v})}/><Field label="Qtd contratada" type="number" value={auto.qtdContratada} set={v=>setAuto({...auto,qtdContratada:v})}/><Field label="Qtd executada" type="number" value={auto.qtdExecutada} set={v=>setAuto({...auto,qtdExecutada:v})}/><Field label="Qtd acumulada" type="number" value={auto.qtdAcumulada} set={v=>setAuto({...auto,qtdAcumulada:v})}/><Field label="Preço unitário" type="number" value={auto.pu} set={v=>setAuto({...auto,pu:v})}/><SelectField label="Estado" value={auto.estado} set={v=>setAuto({...auto,estado:v})} opts={['Por aprovar','Calculado','Aprovado','Rejeitado']}/></div><div className="row"><button onClick={()=>setAuto({...auto,qtdAcumulada:auto.qtdExecutada,estado:'Calculado'})}><CheckCircle2 size={16}/>Calcular</button><button className="primary" onClick={()=>add('autos',auto,setAuto,empty.auto,'auto')}><Save size={16}/>Guardar</button></div></Panel><Panel title="Autos registados"><List items={filtered(data.autos)} onDelete={id=>del('autos',id)} render={a=><><b>{a.artigo} · {obraName(a.obraId)}</b><span>{a.desc} · {a.qtdExecutada||0} {a.un} × {a.pu||0}€ = {(n(a.qtdExecutada)*n(a.pu)).toFixed(2)}€ · {a.estado}</span></>}/></Panel></>}

      {tab==='curvas' && <><Panel title="Curva S real"><div className="formgrid"><SelectObra data={data} value={curva.obraId} set={v=>setCurva({...curva,obraId:v})}/><Field label="Mês" type="month" value={curva.mes} set={v=>setCurva({...curva,mes:v})}/><Field label="Previsto acumulado (€)" type="number" value={curva.previsto} set={v=>setCurva({...curva,previsto:v})}/><Field label="Real acumulado (€)" type="number" value={curva.real} set={v=>setCurva({...curva,real:v})}/></div><button className="primary" onClick={()=>add('curva',curva,setCurva,empty.curva,'curva')}><Plus size={16}/>Adicionar ponto</button></Panel><Panel title="Gráfico Curva S">{curvaSorted.map(c=><div className="srow" key={c.id}><b>{c.mes}</b><span>{obraName(c.obraId)}</span><div><i style={{width:Math.min(n(c.previsto)/1000,100)+'%'}}></i><em style={{width:Math.min(n(c.real)/1000,100)+'%'}}></em></div><small>Desvio: {(n(c.real)-n(c.previsto)).toFixed(2)}€</small><button onClick={()=>del('curva',c.id)}><Trash2 size={15}/></button></div>)}</Panel></>}

      {tab==='rendimentos' && <><Panel title="Biblioteca de rendimentos"><div className="formgrid"><SelectField label="Fonte" value={rend.fonte} set={v=>setRend({...rend,fonte:v})} opts={['RJP','LNEC/Paz Branco','ECAACR','RJP Ferrovia']}/><SelectField label="Categoria" value={rend.cat} set={v=>setRend({...rend,cat:v})} opts={['Edificação','Reabilitação','Ferrovia','Demolições','Ensaios']}/><Field label="Domínio" value={rend.dom} set={v=>setRend({...rend,dom:v})}/><Field label="Descrição" value={rend.desc} set={v=>setRend({...rend,desc:v})}/><Field label="Unidade" value={rend.un} set={v=>setRend({...rend,un:v})}/><Field label="MO h/un" type="number" value={rend.mo} set={v=>setRend({...rend,mo:v})}/><Field label="Produção dia" type="number" value={rend.prod} set={v=>setRend({...rend,prod:v})}/><Field label="Preço unitário" type="number" value={rend.pu} set={v=>setRend({...rend,pu:v})}/><TextArea label="Materiais" value={rend.mat} set={v=>setRend({...rend,mat:v})}/><TextArea label="Equipamento" value={rend.eq} set={v=>setRend({...rend,eq:v})}/></div><button className="primary" onClick={()=>add('rend',rend,setRend,empty.rend,'rend')}><Plus size={16}/>Adicionar</button></Panel><Panel title="Base técnica"><List items={filtered(data.rend)} onDelete={id=>del('rend',id)} render={r=><><b>{r.id} · {r.desc}</b><span>{r.fonte} · {r.dom} · {r.un} · {r.pu}€/un · {r.prod} un/dia</span></>}/></Panel></>}

      {tab==='ferrovia' && <><Panel title="Modo Ferrovia IP"><div className="formgrid"><SelectObra data={data} value={ferrovia.obraId} set={v=>setFerrovia({...ferrovia,obraId:v})}/><SelectField label="Tipo" value={ferrovia.tipo} set={v=>setFerrovia({...ferrovia,tipo:v})} opts={['Edifícios','Coberturas','Vedações','Drenagem','AMV','Passagens Hidráulicas','Passagens Superiores','Passagens Inferiores']}/><Field label="Linha" value={ferrovia.linha} set={v=>setFerrovia({...ferrovia,linha:v})}/><Field label="Local" value={ferrovia.local} set={v=>setFerrovia({...ferrovia,local:v})}/><Field label="PK início" value={ferrovia.pkIni} set={v=>setFerrovia({...ferrovia,pkIni:v})}/><Field label="PK fim" value={ferrovia.pkFim} set={v=>setFerrovia({...ferrovia,pkFim:v})}/><Field label="Lado" value={ferrovia.lado} set={v=>setFerrovia({...ferrovia,lado:v})}/><SelectField label="Estado" value={ferrovia.estado} set={v=>setFerrovia({...ferrovia,estado:v})} opts={['Bom','Razoável','Mau','Crítico']}/><Field label="GPS" value={ferrovia.gps} set={v=>setFerrovia({...ferrovia,gps:v})}/><TextArea label="Ação / Observações" value={ferrovia.acao} set={v=>setFerrovia({...ferrovia,acao:v})}/></div><div className="row"><button onClick={()=>gps(setFerrovia,ferrovia)}><MapPin size={16}/>GPS</button><button className="primary" onClick={()=>add('ferroviarios',ferrovia,setFerrovia,empty.ferrovia,'fer')}><Save size={16}/>Guardar</button></div></Panel><Panel title="Registos Ferrovia"><List items={filtered(data.ferroviarios)} onDelete={id=>del('ferroviarios',id)} render={f=><><b>{f.tipo} · {obraName(f.obraId)}</b><span>{f.linha} · {f.local} · PK {f.pkIni}-{f.pkFim} · {f.estado}</span></>}/></Panel></>}

      {tab==='licencas' && <><Panel title="Licenças"><div className="formgrid"><SelectObra data={data} value={lic.obraId} set={v=>setLic({...lic,obraId:v})}/><Field label="Tipo" value={lic.tipo} set={v=>setLic({...lic,tipo:v})}/><Field label="Entidade" value={lic.entidade} set={v=>setLic({...lic,entidade:v})}/><Field label="Número" value={lic.num} set={v=>setLic({...lic,num:v})}/><Field label="Emissão" type="date" value={lic.emissao} set={v=>setLic({...lic,emissao:v})}/><Field label="Validade" type="date" value={lic.validade} set={v=>setLic({...lic,validade:v})}/><SelectField label="Estado" value={lic.estado} set={v=>setLic({...lic,estado:v})} opts={['Válida','A vencer','Expirada','Pendente','Não aplicável']}/><Field label="Link" value={lic.link} set={v=>setLic({...lic,link:v})}/><TextArea label="Observações" value={lic.obs} set={v=>setLic({...lic,obs:v})}/></div><button className="primary" onClick={()=>add('licencas',lic,setLic,empty.lic,'lic')}><Save size={16}/>Guardar</button></Panel><Panel title="Licenças registadas"><List items={filtered(data.licencas)} onDelete={id=>del('licencas',id)} render={l=><><b>{l.tipo} · {obraName(l.obraId)}</b><span>{l.estado} · validade: {l.validade||'-'}</span></>}/></Panel></>}

      {tab==='nc' && <><Panel title="Não conformidades"><div className="formgrid"><SelectObra data={data} value={nc.obraId} set={v=>setNc({...nc,obraId:v})}/><Field label="Data" type="date" value={nc.data} set={v=>setNc({...nc,data:v})}/><Field label="Local" value={nc.local} set={v=>setNc({...nc,local:v})}/><SelectField label="Gravidade" value={nc.grav} set={v=>setNc({...nc,grav:v})} opts={['Baixa','Média','Alta','Crítica']}/><Field label="Responsável" value={nc.resp} set={v=>setNc({...nc,resp:v})}/><Field label="Prazo" type="date" value={nc.prazo} set={v=>setNc({...nc,prazo:v})}/><SelectField label="Estado" value={nc.estado} set={v=>setNc({...nc,estado:v})} opts={['Aberta','Em tratamento','Resolvida','Fechada']}/><Field label="GPS" value={nc.gps} set={v=>setNc({...nc,gps:v})}/><TextArea label="Descrição" value={nc.desc} set={v=>setNc({...nc,desc:v})}/></div><div className="row"><button onClick={()=>gps(setNc,nc)}><MapPin size={16}/>GPS</button><button className="primary" onClick={()=>add('ncs',nc,setNc,empty.nc,'nc')}><Save size={16}/>Guardar</button></div></Panel><Panel title="NC registadas"><List items={filtered(data.ncs)} onDelete={id=>del('ncs',id)} render={ncf=><><b>{ncf.grav} · {obraName(ncf.obraId)}</b><span>{ncf.desc} · {ncf.estado} · prazo {ncf.prazo||'-'}</span></>}/></Panel></>}

      {tab==='fotos' && <><Panel title="Fotografias GPS"><div className="formgrid"><SelectObra data={data} value={foto.obraId} set={v=>setFoto({...foto,obraId:v})}/><Field label="Data" type="date" value={foto.data} set={v=>setFoto({...foto,data:v})}/><Field label="Título" value={foto.titulo} set={v=>setFoto({...foto,titulo:v})}/><Field label="Categoria" value={foto.cat} set={v=>setFoto({...foto,cat:v})}/><Field label="GPS" value={foto.gps} set={v=>setFoto({...foto,gps:v})}/><Field label="Ficheiro/Link" value={foto.ficheiro} set={v=>setFoto({...foto,ficheiro:v})}/><TextArea label="Descrição" value={foto.desc} set={v=>setFoto({...foto,desc:v})}/><TextArea label="Análise IA" value={foto.ia} set={v=>setFoto({...foto,ia:v})}/></div><div className="row"><button onClick={()=>gps(setFoto,foto)}><MapPin size={16}/>GPS</button><button onClick={()=>setFoto({...foto,ia:'Análise IA: verificar fissuras, corrosão, humidades e segurança.'})}><Wand2 size={16}/>IA</button><button className="primary" onClick={()=>add('fotos',foto,setFoto,empty.foto,'foto')}><Save size={16}/>Guardar</button></div></Panel><Panel title="Fotos"><List items={filtered(data.fotos)} onDelete={id=>del('fotos',id)} render={f=><><b>{f.titulo||f.cat} · {obraName(f.obraId)}</b><span>{f.data} · {f.gps}</span><small>{f.ia}</small></>}/></Panel></>}

      {tab==='google' && <Panel title="Google Drive / Sheets"><p className="muted">Cola o URL /exec do Apps Script. A app envia a base e o script cria folhas e pastas por obra.</p><Field label="URL Apps Script" value={data.settings.url} set={v=>persist({...data,settings:{...data.settings,url:v}})}/><button className="primary" onClick={sync}><Cloud size={16}/>Sincronizar</button></Panel>}
      {tab==='ia' && <Panel title="Assistente IA de obra"><TextArea label="Pedido" value={ia} set={setIa}/><button className="primary" onClick={assistente}><Bot size={16}/>Calcular sugestão</button><p className="muted">Exemplos: executar 120 m de vedação; substituir 850 m² de cobertura; que tarefas estão em atraso?</p></Panel>}
    </main>
  </div>
}

createRoot(document.getElementById('root')).render(<App/>)
