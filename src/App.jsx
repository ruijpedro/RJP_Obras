import React, { useMemo, useState } from 'react';
import { Building2, ClipboardList, FileText, HardHat, CalendarDays, AlertTriangle, Save, Download, Plus, Trash2, Cloud, MapPin, Camera, Search } from 'lucide-react';
import { rendimentosBase } from './data/rendimentos.js';
import { exportJson, loadState, saveState } from './services/storage.js';
import { gerarPdfResumo } from './services/pdf.js';
import { sincronizarComAppsScript } from './services/google.js';

const tabs = [
  ['dashboard','Dashboard', Building2], ['obras','Obras', HardHat], ['diario','Diário', ClipboardList],
  ['rendimentos','Rendimentos', Search], ['licencas','Licenças', FileText], ['nc','Não conformidades', AlertTriangle],
  ['planeamento','Planeamento', CalendarDays]
];

const blankObra = { codigo:'', nome:'', cliente:'', local:'', estado:'Em curso', inicio:'', fim:'', previsto:'', real:'', licencas:'Por tratar' };
const blankDiario = { obra:'', data:new Date().toISOString().slice(0,10), clima:'', equipas:'', equipamentos:'', materiais:'', trabalhos:'', gps:'', fotos:'', obs:'' };
const blankLic = { obra:'', tipo:'Licença de construção', estado:'Pendente', validade:'', responsavel:'', obs:'' };
const blankNc = { obra:'', tipo:'Qualidade', estado:'Aberta', prazo:'', responsavel:'', descricao:'' };
const blankTar = { obra:'', tarefa:'', inicio:'', fim:'', estado:'Planeada', depende:'' };

function Field({label, value, onChange, type='text', placeholder=''}){
  return <label className="field"><span>{label}</span><input type={type} value={value||''} placeholder={placeholder} onChange={e=>onChange(e.target.value)} /></label>;
}
function TextArea({label, value, onChange}){
  return <label className="field wide"><span>{label}</span><textarea value={value||''} onChange={e=>onChange(e.target.value)} /></label>;
}
function Select({label, value, onChange, options}){
  return <label className="field"><span>{label}</span><select value={value||''} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o}>{o}</option>)}</select></label>;
}
function Section({title, children, action}){ return <section className="card"><div className="sectionHead"><h2>{title}</h2>{action}</div>{children}</section>; }

export default function App(){
  const [state,setState]=useState(loadState());
  const [tab,setTab]=useState('dashboard');
  const [obra,setObra]=useState(blankObra);
  const [diario,setDiario]=useState(blankDiario);
  const [lic,setLic]=useState(blankLic);
  const [nc,setNc]=useState(blankNc);
  const [tar,setTar]=useState(blankTar);
  const [filtro,setFiltro]=useState('');
  const [msg,setMsg]=useState('');

  const persist = (next)=>{ setState(next); saveState(next); };
  const obrasAtivas = state.obras.filter(o=>o.estado!=='Concluída').length;
  const totalPrevisto = state.obras.reduce((a,o)=>a+Number(o.previsto||0),0);
  const totalReal = state.obras.reduce((a,o)=>a+Number(o.real||0),0);
  const alertas = state.obras.filter(o=>o.fim && new Date(o.fim) < new Date() && o.estado!=='Concluída').length + state.nc.filter(n=>n.estado!=='Fechada').length;
  const rendFiltrados = useMemo(()=>rendimentosBase.filter(r=>JSON.stringify(r).toLowerCase().includes(filtro.toLowerCase())),[filtro]);

  const addItem=(key,item,blank,setter)=>{ if(!Object.values(item).some(Boolean)) return; persist({...state,[key]:[{...item,id:crypto.randomUUID()},...state[key]]}); setter(blank); };
  const delItem=(key,id)=>persist({...state,[key]:state[key].filter(x=>x.id!==id)});
  const getGps=()=>navigator.geolocation?.getCurrentPosition(p=>setDiario({...diario,gps:`${p.coords.latitude.toFixed(7)}, ${p.coords.longitude.toFixed(7)}`}),()=>setMsg('Não foi possível obter GPS.'));
  const sync=async()=>{ try{ const r=await sincronizarComAppsScript(state); setMsg(r?.ok?'Sincronização concluída.':'Resposta recebida do Apps Script.'); }catch(e){ setMsg(e.message); } };

  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="logo">RJP</div><div><b>RJP Obras</b><small>Gestão técnica de obras</small></div></div>
      <nav>{tabs.map(([id,label,Icon])=><button className={tab===id?'active':''} onClick={()=>setTab(id)} key={id}><Icon size={18}/>{label}</button>)}</nav>
      <div className="disclaimer">Software de apoio técnico. Validar todos os resultados antes de aplicação profissional.</div>
    </aside>
    <main>
      <header className="top"><div><h1>{tabs.find(t=>t[0]===tab)?.[1]}</h1><p>V3 profissional — Android/WebApp, PDF, dados locais e módulo Google pronto.</p></div><div className="topActions"><button onClick={()=>gerarPdfResumo(state)}><FileText size={17}/> PDF</button><button onClick={()=>exportJson(state)}><Download size={17}/> Backup</button><button onClick={sync}><Cloud size={17}/> Sincronizar</button></div></header>
      {msg && <div className="toast" onClick={()=>setMsg('')}>{msg}</div>}

      {tab==='dashboard' && <div className="grid dash">
        <div className="metric"><span>Obras ativas</span><b>{obrasAtivas}</b></div><div className="metric"><span>Orçamento previsto</span><b>{totalPrevisto.toLocaleString('pt-PT')} €</b></div><div className="metric"><span>Custo real</span><b>{totalReal.toLocaleString('pt-PT')} €</b></div><div className="metric warn"><span>Alertas</span><b>{alertas}</b></div>
        <Section title="Últimas obras"><div className="table">{state.obras.map(o=><div className="row" key={o.id}><b>{o.codigo}</b><span>{o.nome}</span><span>{o.estado}</span><span>{o.local}</span></div>)}</div></Section>
        <Section title="Próximas tarefas"><div className="table">{state.tarefas.map(t=><div className="row" key={t.id}><b>{t.obra}</b><span>{t.tarefa}</span><span>{t.inicio} → {t.fim}</span><span>{t.estado}</span></div>)}</div></Section>
      </div>}

      {tab==='obras' && <Section title="Registar obra" action={<button onClick={()=>addItem('obras',obra,blankObra,setObra)}><Plus size={17}/>Adicionar</button>}><div className="formgrid">
        <Field label="Código" value={obra.codigo} onChange={v=>setObra({...obra,codigo:v})}/><Field label="Nome" value={obra.nome} onChange={v=>setObra({...obra,nome:v})}/><Field label="Cliente" value={obra.cliente} onChange={v=>setObra({...obra,cliente:v})}/><Field label="Local" value={obra.local} onChange={v=>setObra({...obra,local:v})}/><Select label="Estado" value={obra.estado} onChange={v=>setObra({...obra,estado:v})} options={['Planeada','Em curso','Suspensa','Concluída']}/><Field label="Início" type="date" value={obra.inicio} onChange={v=>setObra({...obra,inicio:v})}/><Field label="Fim" type="date" value={obra.fim} onChange={v=>setObra({...obra,fim:v})}/><Field label="Previsto (€)" type="number" value={obra.previsto} onChange={v=>setObra({...obra,previsto:v})}/><Field label="Real (€)" type="number" value={obra.real} onChange={v=>setObra({...obra,real:v})}/><Select label="Licenças" value={obra.licencas} onChange={v=>setObra({...obra,licencas:v})} options={['Por tratar','Em validação','Aprovadas','Caducadas']}/>
      </div><List items={state.obras} cols={['codigo','nome','cliente','local','estado']} onDel={id=>delItem('obras',id)}/></Section>}

      {tab==='diario' && <Section title="Diário de obra" action={<button onClick={()=>addItem('diarios',diario,blankDiario,setDiario)}><Save size={17}/>Guardar</button>}><div className="formgrid">
        <Field label="Obra" value={diario.obra} onChange={v=>setDiario({...diario,obra:v})}/><Field label="Data" type="date" value={diario.data} onChange={v=>setDiario({...diario,data:v})}/><Field label="Clima" value={diario.clima} onChange={v=>setDiario({...diario,clima:v})}/><Field label="Equipas" value={diario.equipas} onChange={v=>setDiario({...diario,equipas:v})}/><Field label="Equipamentos" value={diario.equipamentos} onChange={v=>setDiario({...diario,equipamentos:v})}/><Field label="Materiais" value={diario.materiais} onChange={v=>setDiario({...diario,materiais:v})}/><Field label="Fotos / referências" value={diario.fotos} onChange={v=>setDiario({...diario,fotos:v})}/><label className="field"><span>GPS</span><button className="inline" onClick={getGps}><MapPin size={16}/>{diario.gps||'Obter GPS'}</button></label><TextArea label="Trabalhos executados" value={diario.trabalhos} onChange={v=>setDiario({...diario,trabalhos:v})}/><TextArea label="Observações / texto IA" value={diario.obs} onChange={v=>setDiario({...diario,obs:v})}/>
      </div><List items={state.diarios} cols={['data','obra','clima','trabalhos','gps']} onDel={id=>delItem('diarios',id)}/></Section>}

      {tab==='rendimentos' && <Section title="Biblioteca de rendimentos"><div className="search"><Search size={18}/><input placeholder="Pesquisar escavação, betão, cofragem, armaduras..." value={filtro} onChange={e=>setFiltro(e.target.value)}/></div><div className="cards">{rendFiltrados.map((r,i)=><div className="mini" key={i}><b>{r.atividade}</b><span>{r.grupo} · {r.unidade}</span><p><b>Mão-de-obra:</b> {r.maoObra}</p><p><b>Equip.:</b> {r.equipamento}</p><small>{r.notas}</small></div>)}</div></Section>}

      {tab==='licencas' && <Section title="Licenças e documentos" action={<button onClick={()=>addItem('licencas',lic,blankLic,setLic)}><Plus size={17}/>Adicionar</button>}><div className="formgrid"><Field label="Obra" value={lic.obra} onChange={v=>setLic({...lic,obra:v})}/><Select label="Tipo" value={lic.tipo} onChange={v=>setLic({...lic,tipo:v})} options={['Licença de construção','Plano de Segurança','Coordenação de Segurança','Seguro','Alvará','Outro']}/><Select label="Estado" value={lic.estado} onChange={v=>setLic({...lic,estado:v})} options={['Pendente','Submetida','Aprovada','Caducada']}/><Field label="Validade" type="date" value={lic.validade} onChange={v=>setLic({...lic,validade:v})}/><Field label="Responsável" value={lic.responsavel} onChange={v=>setLic({...lic,responsavel:v})}/><TextArea label="Observações" value={lic.obs} onChange={v=>setLic({...lic,obs:v})}/></div><List items={state.licencas} cols={['obra','tipo','estado','validade','responsavel']} onDel={id=>delItem('licencas',id)}/></Section>}

      {tab==='nc' && <Section title="Não conformidades" action={<button onClick={()=>addItem('nc',nc,blankNc,setNc)}><Plus size={17}/>Adicionar</button>}><div className="formgrid"><Field label="Obra" value={nc.obra} onChange={v=>setNc({...nc,obra:v})}/><Select label="Tipo" value={nc.tipo} onChange={v=>setNc({...nc,tipo:v})} options={['Qualidade','Segurança','Ambiente','Prazo','Custo','Outro']}/><Select label="Estado" value={nc.estado} onChange={v=>setNc({...nc,estado:v})} options={['Aberta','Em correção','Fechada']}/><Field label="Prazo" type="date" value={nc.prazo} onChange={v=>setNc({...nc,prazo:v})}/><Field label="Responsável" value={nc.responsavel} onChange={v=>setNc({...nc,responsavel:v})}/><TextArea label="Descrição" value={nc.descricao} onChange={v=>setNc({...nc,descricao:v})}/></div><List items={state.nc} cols={['obra','tipo','estado','prazo','responsavel']} onDel={id=>delItem('nc',id)}/></Section>}

      {tab==='planeamento' && <Section title="Planeamento / Gantt simples" action={<button onClick={()=>addItem('tarefas',tar,blankTar,setTar)}><Plus size={17}/>Adicionar</button>}><div className="formgrid"><Field label="Obra" value={tar.obra} onChange={v=>setTar({...tar,obra:v})}/><Field label="Tarefa" value={tar.tarefa} onChange={v=>setTar({...tar,tarefa:v})}/><Field label="Início" type="date" value={tar.inicio} onChange={v=>setTar({...tar,inicio:v})}/><Field label="Fim" type="date" value={tar.fim} onChange={v=>setTar({...tar,fim:v})}/><Select label="Estado" value={tar.estado} onChange={v=>setTar({...tar,estado:v})} options={['Planeada','Em curso','Concluída','Bloqueada']}/><Field label="Depende de" value={tar.depende} onChange={v=>setTar({...tar,depende:v})}/></div><div className="gantt">{state.tarefas.map(t=><div className="bar" key={t.id}><span>{t.tarefa}</span><i style={{width: t.estado==='Concluída'?'95%':t.estado==='Em curso'?'55%':'25%'}}></i><button onClick={()=>delItem('tarefas',t.id)}><Trash2 size={15}/></button></div>)}</div></Section>}
    </main>
  </div>;
}

function List({items, cols, onDel}){
  return <div className="table list">{items.map(item=><div className="row" key={item.id}>{cols.map(c=><span key={c}>{String(item[c]||'-').slice(0,80)}</span>)}<button onClick={()=>onDel(item.id)}><Trash2 size={15}/></button></div>)}</div>;
}
