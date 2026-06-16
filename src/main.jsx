import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Building2, ClipboardList, CalendarDays, FileCheck2, Euro, AlertTriangle,
  Camera, Cloud, BarChart3, BookOpen, Bot, Save, PlusCircle, MapPin,
  Download, RefreshCw, Trash2, Wand2, FileText, HardHat
} from 'lucide-react'
import { loadData, saveData, uid, defaultData } from './services/storage'
import { gerarRelatorioGeral, gerarDiarioPDF } from './services/pdf'
import { syncToAppsScript } from './services/google'
import { Field, TextArea, Panel, Card, SelectObra, List } from './components/UI'
import './style.css'

const tabs = [
  ['dashboard','Dashboard',BarChart3],
  ['obras','Obras',Building2],
  ['diario','Diário IA',ClipboardList],
  ['rendimentos','Rendimentos',BookOpen],
  ['custos','Custos/Autos',Euro],
  ['licencas','Licenças',FileCheck2],
  ['nc','Não Conformidades',AlertTriangle],
  ['fotos','Fotos GPS',Camera],
  ['planeamento','Planeamento',CalendarDays],
  ['google','Google',Cloud],
  ['ia','Assistente IA',Bot]
]

const emptyObra = {nome:'',cliente:'',empreiteiro:'',fiscalizacao:'',local:'',gps:'',inicio:'',fim:'',valor:'',estado:'Em preparação',progresso:0,contrato:'',observacoes:''}
const emptyDiario = {obraId:'',data:new Date().toISOString().slice(0,10),meteorologia:'',equipas:'',trabalhos:'',ocorrencias:'',seguranca:'',gps:'',iaResumo:''}
const emptyRend = {fonte:'RJP',categoria:'Edificação',dominio:'',descricao:'',unidade:'m²',mo:'',producaoDia:'',materiais:'',equipamento:'',precoUnit:''}
const emptyCusto = {obraId:'',data:new Date().toISOString().slice(0,10),atividadeId:'',descricao:'',quantidade:'',previsto:'',real:'',auto:'',tipo:'Custo'}
const emptyLic = {obraId:'',tipo:'Licença de obra',entidade:'',numero:'',emissao:'',validade:'',estado:'Válida',link:'',observacoes:''}
const emptyNc = {obraId:'',data:new Date().toISOString().slice(0,10),local:'',descricao:'',gravidade:'Média',responsavel:'',prazo:'',estado:'Aberta',gps:''}
const emptyFoto = {obraId:'',data:new Date().toISOString().slice(0,10),titulo:'',categoria:'Obra',gps:'',descricao:'',ficheiro:'',ia:''}

function App(){
  const [data,setData] = useState(loadData())
  const [tab,setTab] = useState('dashboard')
  const [obra,setObra] = useState(emptyObra)
  const [diario,setDiario] = useState(emptyDiario)
  const [rend,setRend] = useState(emptyRend)
  const [custo,setCusto] = useState(emptyCusto)
  const [lic,setLic] = useState(emptyLic)
  const [nc,setNc] = useState(emptyNc)
  const [foto,setFoto] = useState(emptyFoto)
  const [iaText,setIaText] = useState('')

  const persist = (next) => { setData(next); saveData(next) }
  const obraName = id => data.obras.find(o=>o.id===id)?.nome || 'Sem obra'
  const custosPrev = data.custos.reduce((s,c)=>s+(Number(c.previsto)||0),0)
  const custosReal = data.custos.reduce((s,c)=>s+(Number(c.real)||0),0)
  const progresso = data.obras.length ? Math.round(data.obras.reduce((s,o)=>s+(Number(o.progresso)||0),0)/data.obras.length) : 0
  const licVencer = data.licencas.filter(l=>l.validade && ((new Date(l.validade)-new Date())/86400000)<=30 && ((new Date(l.validade)-new Date())/86400000)>=0).length
  const ncsAbertas = data.ncs.filter(n=>n.estado!=='Fechada').length

  function gps(setter,current){
    if(!navigator.geolocation){ alert('GPS não disponível.'); return }
    navigator.geolocation.getCurrentPosition(
      p=>setter({...current,gps:`${p.coords.latitude.toFixed(7)}, ${p.coords.longitude.toFixed(7)}`}),
      ()=>alert('Não foi possível obter GPS.'),
      {enableHighAccuracy:true,timeout:15000}
    )
  }

  function add(key,obj,resetter,empty,prefix){
    persist({...data,[key]:[{...obj,id:uid(prefix)},...data[key]]})
    resetter(empty)
  }
  function remove(key,id){ persist({...data,[key]:data[key].filter(x=>x.id!==id)}) }

  function gerarDiarioIA(){
    const txt = `${diario.trabalhos} ${diario.ocorrencias}`.toLowerCase()
    let resumo = 'Resumo IA: diário registado. '
    if(txt.includes('vedação') || txt.includes('rede')) resumo += 'Atividade provável: vedações. Verificar produção em metros lineares. '
    if(txt.includes('cobertura') || txt.includes('telha')) resumo += 'Atividade provável: cobertura. Verificar área executada e condições de segurança. '
    if(txt.includes('humidade') || txt.includes('infiltra')) resumo += 'Anomalia provável: humidades/infiltrações. Criar NC se persistente. '
    if(txt.includes('atraso')) resumo += 'Alerta: possível desvio de prazo. '
    setDiario({...diario, iaResumo:resumo})
  }

  function calcularCustoPorRendimento(){
    const r = data.rendimentos.find(x=>x.id===custo.atividadeId)
    if(!r){ alert('Seleciona uma atividade da biblioteca.'); return }
    const q = Number(custo.quantidade)||0
    const previsto = q * (Number(r.precoUnit)||0)
    setCusto({...custo, descricao:r.descricao, previsto:previsto.toFixed(2)})
  }

  function assistenteIA(){
    const txt = iaText.toLowerCase()
    let out = 'Sugestão IA RJP Obras:\n'
    const matchM = txt.match(/(\d+[\.,]?\d*)\s*(m2|m²|m|ml|un)/)
    const qtd = matchM ? Number(matchM[1].replace(',','.')) : 0
    let atividade = data.rendimentos.find(r=>txt.includes((r.dominio||'').toLowerCase()) || txt.includes((r.descricao||'').toLowerCase().split(' ')[0]))
    if(!atividade && txt.includes('ved')) atividade = data.rendimentos.find(r=>r.dominio==='Vedações')
    if(!atividade && txt.includes('cob')) atividade = data.rendimentos.find(r=>r.dominio==='Coberturas')
    if(!atividade && txt.includes('fach')) atividade = data.rendimentos.find(r=>r.dominio==='Fachadas')
    if(atividade && qtd){
      const dur = atividade.producaoDia ? Math.ceil(qtd / Number(atividade.producaoDia)) : '-'
      const custo = qtd * Number(atividade.precoUnit||0)
      out += `Atividade: ${atividade.descricao}\nQuantidade: ${qtd} ${atividade.unidade}\nDuração estimada: ${dur} dias/equipa\nCusto estimado: ${custo.toFixed(2)} EUR\nMão-de-obra: ${(qtd*Number(atividade.mo||0)).toFixed(2)} h`
    } else {
      out += 'Não consegui associar automaticamente. Usa termos como vedação, cobertura, fachada, demolição, drenagem ou AMV e indica quantidade.'
    }
    setIaText(out)
  }

  async function sync(){
    try{
      await syncToAppsScript(data.settings.appsScriptUrl, data)
      alert('Sincronização enviada.')
    }catch(e){ alert(e.message) }
  }

  return <div className='app'>
    <aside>
      <div className='brand'><div className='logo'>RJP</div><div><h1>RJP Obras</h1><p>V3 · WebApp</p></div></div>
      <nav>{tabs.map(([id,label,Icon])=><button key={id} onClick={()=>setTab(id)} className={tab===id?'active':''}><Icon size={18}/><span>{label}</span></button>)}</nav>
      <button className='sideDanger' onClick={()=>{ if(confirm('Limpar todos os dados locais?')) persist(defaultData()) }}><Trash2 size={16}/> Repor dados</button>
    </aside>

    <main>
      <header className='topbar'>
        <div><h2>{tabs.find(t=>t[0]===tab)?.[1]}</h2><p>Gestão de obras, produção, rendimentos, licenças, custos, Google e relatórios.</p></div>
        <div className='actions'>
          <button onClick={()=>gerarRelatorioGeral(data)}><Download size={16}/> PDF geral</button>
          <button onClick={()=>{const b=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='RJP_Obras_V3.json';a.click()}}><Download size={16}/> JSON</button>
        </div>
      </header>

      {tab==='dashboard' && <section>
        <div className='cards'>
          <Card title='Obras' value={data.obras.length}/>
          <Card title='Progresso médio' value={`${progresso}%`}/>
          <Card title='Licenças a vencer' value={licVencer} warning={licVencer>0}/>
          <Card title='NC abertas' value={ncsAbertas} warning={ncsAbertas>0}/>
          <Card title='Custo previsto' value={`${custosPrev.toFixed(0)} €`}/>
          <Card title='Custo real' value={`${custosReal.toFixed(0)} €`}/>
        </div>
        <Panel title='Curva S simplificada'><div className='curve'><div style={{width:`${Math.min(progresso,100)}%`}}>Previsto/Real {progresso}%</div></div></Panel>
        <Panel title='Últimas obras'><List items={data.obras.slice(0,6)} render={o=><><b>{o.nome}</b><span>{o.local} · {o.estado} · {o.progresso}%</span></>} /></Panel>
      </section>}

      {tab==='obras' && <section>
        <Panel title='Cadastro completo de obra'>
          <div className='grid'>
            <Field label='Nome da obra' value={obra.nome} onChange={v=>setObra({...obra,nome:v})}/>
            <Field label='Cliente / Dono de obra' value={obra.cliente} onChange={v=>setObra({...obra,cliente:v})}/>
            <Field label='Empreiteiro' value={obra.empreiteiro} onChange={v=>setObra({...obra,empreiteiro:v})}/>
            <Field label='Fiscalização' value={obra.fiscalizacao} onChange={v=>setObra({...obra,fiscalizacao:v})}/>
            <Field label='Contrato' value={obra.contrato} onChange={v=>setObra({...obra,contrato:v})}/>
            <Field label='Local' value={obra.local} onChange={v=>setObra({...obra,local:v})}/>
            <Field label='GPS' value={obra.gps} onChange={v=>setObra({...obra,gps:v})}/>
            <Field label='Início' type='date' value={obra.inicio} onChange={v=>setObra({...obra,inicio:v})}/>
            <Field label='Fim' type='date' value={obra.fim} onChange={v=>setObra({...obra,fim:v})}/>
            <Field label='Valor (€)' type='number' value={obra.valor} onChange={v=>setObra({...obra,valor:v})}/>
            <Field label='Estado' value={obra.estado} options={['Em preparação','Em curso','Suspensa','Concluída','Encerrada']} onChange={v=>setObra({...obra,estado:v})}/>
            <Field label='Progresso (%)' type='number' value={obra.progresso} onChange={v=>setObra({...obra,progresso:v})}/>
            <TextArea label='Observações' value={obra.observacoes} onChange={v=>setObra({...obra,observacoes:v})}/>
          </div>
          <div className='row'><button onClick={()=>gps(setObra,obra)}><MapPin size={16}/> GPS</button><button className='primary' onClick={()=>add('obras',obra,setObra,emptyObra,'obra')}><PlusCircle size={16}/> Guardar obra</button></div>
        </Panel>
        <Panel title='Obras registadas'><List items={data.obras} onDelete={id=>remove('obras',id)} render={o=><><b>{o.nome}</b><span>{o.cliente} · {o.local} · {o.estado} · {o.progresso}%</span></>}/></Panel>
      </section>}

      {tab==='diario' && <section>
        <Panel title='Diário de obra com apoio IA'>
          <div className='grid'>
            <SelectObra obras={data.obras} value={diario.obraId} onChange={v=>setDiario({...diario,obraId:v})}/>
            <Field label='Data' type='date' value={diario.data} onChange={v=>setDiario({...diario,data:v})}/>
            <Field label='Meteorologia' value={diario.meteorologia} onChange={v=>setDiario({...diario,meteorologia:v})}/>
            <Field label='Equipas / Recursos' value={diario.equipas} onChange={v=>setDiario({...diario,equipas:v})}/>
            <Field label='GPS' value={diario.gps} onChange={v=>setDiario({...diario,gps:v})}/>
            <TextArea label='Trabalhos executados' value={diario.trabalhos} onChange={v=>setDiario({...diario,trabalhos:v})}/>
            <TextArea label='Ocorrências' value={diario.ocorrencias} onChange={v=>setDiario({...diario,ocorrencias:v})}/>
            <TextArea label='Segurança' value={diario.seguranca} onChange={v=>setDiario({...diario,seguranca:v})}/>
            <TextArea label='Resumo IA' value={diario.iaResumo} onChange={v=>setDiario({...diario,iaResumo:v})}/>
          </div>
          <div className='row'><button onClick={()=>gps(setDiario,diario)}><MapPin size={16}/> GPS</button><button onClick={gerarDiarioIA}><Wand2 size={16}/> Analisar IA</button><button className='primary' onClick={()=>add('diarios',diario,setDiario,emptyDiario,'dia')}><Save size={16}/> Guardar diário</button><button onClick={()=>gerarDiarioPDF(null, data.diarios)}><FileText size={16}/> PDF diário</button></div>
        </Panel>
        <Panel title='Diários'><List items={data.diarios} onDelete={id=>remove('diarios',id)} render={d=><><b>{d.data} · {obraName(d.obraId)}</b><span>{d.trabalhos}</span><small>{d.iaResumo}</small></>}/></Panel>
      </section>}

      {tab==='rendimentos' && <section>
        <Panel title='Biblioteca de Rendimentos · LNEC + ECAACR + RJP'>
          <div className='grid'>
            <Field label='Fonte' value={rend.fonte} options={['RJP','LNEC/Paz Branco','ECAACR','RJP Ferrovia']} onChange={v=>setRend({...rend,fonte:v})}/>
            <Field label='Categoria' value={rend.categoria} options={['Edificação','Reabilitação','Ferrovia','Demolições','Ensaios']} onChange={v=>setRend({...rend,categoria:v})}/>
            <Field label='Domínio' value={rend.dominio} onChange={v=>setRend({...rend,dominio:v})}/>
            <Field label='Descrição' value={rend.descricao} onChange={v=>setRend({...rend,descricao:v})}/>
            <Field label='Unidade' value={rend.unidade} onChange={v=>setRend({...rend,unidade:v})}/>
            <Field label='Mão de obra h/un' type='number' value={rend.mo} onChange={v=>setRend({...rend,mo:v})}/>
            <Field label='Produção dia/equipa' type='number' value={rend.producaoDia} onChange={v=>setRend({...rend,producaoDia:v})}/>
            <Field label='Preço unitário (€)' type='number' value={rend.precoUnit} onChange={v=>setRend({...rend,precoUnit:v})}/>
            <TextArea label='Materiais' value={rend.materiais} onChange={v=>setRend({...rend,materiais:v})}/>
            <TextArea label='Equipamento' value={rend.equipamento} onChange={v=>setRend({...rend,equipamento:v})}/>
          </div>
          <button className='primary' onClick={()=>add('rendimentos',rend,setRend,emptyRend,'rend')}><PlusCircle size={16}/> Adicionar rendimento</button>
        </Panel>
        <Panel title='Base técnica'><List items={data.rendimentos} onDelete={id=>remove('rendimentos',id)} render={r=><><b>{r.id} · {r.descricao}</b><span>{r.fonte} · {r.dominio} · {r.unidade} · {r.precoUnit} €/un · {r.producaoDia} un/dia</span></>}/></Panel>
      </section>}

      {tab==='custos' && <section>
        <Panel title='Custos, autos e cálculo por rendimento'>
          <div className='grid'>
            <SelectObra obras={data.obras} value={custo.obraId} onChange={v=>setCusto({...custo,obraId:v})}/>
            <Field label='Data' type='date' value={custo.data} onChange={v=>setCusto({...custo,data:v})}/>
            <label className='field'><span>Atividade da biblioteca</span><select value={custo.atividadeId||''} onChange={e=>setCusto({...custo,atividadeId:e.target.value})}><option value=''>Selecionar</option>{data.rendimentos.map(r=><option key={r.id} value={r.id}>{r.id} · {r.descricao}</option>)}</select></label>
            <Field label='Tipo' value={custo.tipo} options={['Custo','Auto de medição','Trabalho a mais','Trabalho a menos']} onChange={v=>setCusto({...custo,tipo:v})}/>
            <Field label='Quantidade' type='number' value={custo.quantidade} onChange={v=>setCusto({...custo,quantidade:v})}/>
            <Field label='Previsto (€)' type='number' value={custo.previsto} onChange={v=>setCusto({...custo,previsto:v})}/>
            <Field label='Real (€)' type='number' value={custo.real} onChange={v=>setCusto({...custo,real:v})}/>
            <Field label='Auto nº' value={custo.auto} onChange={v=>setCusto({...custo,auto:v})}/>
            <TextArea label='Descrição' value={custo.descricao} onChange={v=>setCusto({...custo,descricao:v})}/>
          </div>
          <div className='row'><button onClick={calcularCustoPorRendimento}><Wand2 size={16}/> Calcular</button><button className='primary' onClick={()=>add('custos',custo,setCusto,emptyCusto,'cus')}><Save size={16}/> Guardar</button></div>
        </Panel>
        <Panel title='Registos de custos/autos'><List items={data.custos} onDelete={id=>remove('custos',id)} render={c=><><b>{c.tipo} · {obraName(c.obraId)}</b><span>{c.descricao} · Qtd {c.quantidade || '-'} · Prev. {c.previsto || 0} € · Real {c.real || 0} €</span></>}/></Panel>
      </section>}

      {tab==='licencas' && <section>
        <Panel title='Licenças e documentação'>
          <div className='grid'>
            <SelectObra obras={data.obras} value={lic.obraId} onChange={v=>setLic({...lic,obraId:v})}/>
            <Field label='Tipo' value={lic.tipo} options={['Licença de obra','Licença camarária','PSS','PGRCD','Seguro','Alvará','Projeto','Outro']} onChange={v=>setLic({...lic,tipo:v})}/>
            <Field label='Entidade' value={lic.entidade} onChange={v=>setLic({...lic,entidade:v})}/>
            <Field label='Número' value={lic.numero} onChange={v=>setLic({...lic,numero:v})}/>
            <Field label='Emissão' type='date' value={lic.emissao} onChange={v=>setLic({...lic,emissao:v})}/>
            <Field label='Validade' type='date' value={lic.validade} onChange={v=>setLic({...lic,validade:v})}/>
            <Field label='Estado' value={lic.estado} options={['Válida','A vencer','Expirada','Pendente','Não aplicável']} onChange={v=>setLic({...lic,estado:v})}/>
            <Field label='Link Drive/Ficheiro' value={lic.link} onChange={v=>setLic({...lic,link:v})}/>
            <TextArea label='Observações' value={lic.observacoes} onChange={v=>setLic({...lic,observacoes:v})}/>
          </div>
          <button className='primary' onClick={()=>add('licencas',lic,setLic,emptyLic,'lic')}><Save size={16}/> Guardar licença</button>
        </Panel>
        <Panel title='Licenças'><List items={data.licencas} onDelete={id=>remove('licencas',id)} render={l=><><b>{l.tipo} · {obraName(l.obraId)}</b><span>{l.estado} · validade: {l.validade || '-'}</span></>}/></Panel>
      </section>}

      {tab==='nc' && <section>
        <Panel title='Não conformidades'>
          <div className='grid'>
            <SelectObra obras={data.obras} value={nc.obraId} onChange={v=>setNc({...nc,obraId:v})}/>
            <Field label='Data' type='date' value={nc.data} onChange={v=>setNc({...nc,data:v})}/>
            <Field label='Local' value={nc.local} onChange={v=>setNc({...nc,local:v})}/>
            <Field label='Gravidade' value={nc.gravidade} options={['Baixa','Média','Alta','Crítica']} onChange={v=>setNc({...nc,gravidade:v})}/>
            <Field label='Responsável' value={nc.responsavel} onChange={v=>setNc({...nc,responsavel:v})}/>
            <Field label='Prazo' type='date' value={nc.prazo} onChange={v=>setNc({...nc,prazo:v})}/>
            <Field label='Estado' value={nc.estado} options={['Aberta','Em tratamento','Resolvida','Fechada']} onChange={v=>setNc({...nc,estado:v})}/>
            <Field label='GPS' value={nc.gps} onChange={v=>setNc({...nc,gps:v})}/>
            <TextArea label='Descrição' value={nc.descricao} onChange={v=>setNc({...nc,descricao:v})}/>
          </div>
          <div className='row'><button onClick={()=>gps(setNc,nc)}><MapPin size={16}/> GPS</button><button className='primary' onClick={()=>add('ncs',nc,setNc,emptyNc,'nc')}><Save size={16}/> Guardar NC</button></div>
        </Panel>
        <Panel title='NC registadas'><List items={data.ncs} onDelete={id=>remove('ncs',id)} render={n=><><b>{n.gravidade} · {obraName(n.obraId)}</b><span>{n.descricao} · {n.estado} · prazo {n.prazo || '-'}</span></>}/></Panel>
      </section>}

      {tab==='fotos' && <section>
        <Panel title='Fotografias GPS com análise IA preparada'>
          <div className='grid'>
            <SelectObra obras={data.obras} value={foto.obraId} onChange={v=>setFoto({...foto,obraId:v})}/>
            <Field label='Data' type='date' value={foto.data} onChange={v=>setFoto({...foto,data:v})}/>
            <Field label='Título' value={foto.titulo} onChange={v=>setFoto({...foto,titulo:v})}/>
            <Field label='Categoria' value={foto.categoria} options={['Obra','Cobertura','Fachada','Vedação','AMV','Drenagem','Anomalia','Segurança']} onChange={v=>setFoto({...foto,categoria:v})}/>
            <Field label='GPS' value={foto.gps} onChange={v=>setFoto({...foto,gps:v})}/>
            <Field label='Ficheiro/Link' value={foto.ficheiro} onChange={v=>setFoto({...foto,ficheiro:v})}/>
            <TextArea label='Descrição' value={foto.descricao} onChange={v=>setFoto({...foto,descricao:v})}/>
            <TextArea label='Análise IA' value={foto.ia} onChange={v=>setFoto({...foto,ia:v})}/>
          </div>
          <div className='row'><button onClick={()=>gps(setFoto,foto)}><MapPin size={16}/> GPS</button><button onClick={()=>setFoto({...foto,ia:'Análise IA preparada: verificar fissuras, corrosão, humidades, deformações, elementos soltos e condições de segurança.'})}><Wand2 size={16}/> Análise IA</button><button className='primary' onClick={()=>add('fotos',foto,setFoto,emptyFoto,'foto')}><Save size={16}/> Guardar foto</button></div>
        </Panel>
        <Panel title='Fotos registadas'><List items={data.fotos} onDelete={id=>remove('fotos',id)} render={f=><><b>{f.titulo || f.categoria} · {obraName(f.obraId)}</b><span>{f.data} · {f.gps}</span><small>{f.ia}</small></>}/></Panel>
      </section>}

      {tab==='planeamento' && <section><Panel title='Planeamento V3'><p className='muted'>Base preparada para Gantt, dependências, caminho crítico e curva S. Para já, o planeamento é calculado no Assistente IA com base nos rendimentos.</p><div className='railBox'><HardHat/> <span>Próxima iteração: tarefas com predecessoras, datas, duração, equipas e exportação PDF.</span></div></Panel></section>}

      {tab==='google' && <section>
        <Panel title='Google Drive / Sheets / Calendar'>
          <p className='muted'>Cola o URL da Web App do Apps Script. Esta versão envia a base local para Google Sheets e cria pastas no Drive.</p>
          <div className='grid'><Field label='URL Apps Script /exec' value={data.settings.appsScriptUrl} onChange={v=>persist({...data,settings:{...data.settings,appsScriptUrl:v}})} wide/></div>
          <button className='primary' onClick={sync}><RefreshCw size={16}/> Sincronizar Google</button>
        </Panel>
      </section>}

      {tab==='ia' && <section>
        <Panel title='Assistente IA de Obra'>
          <TextArea label='Pedido' value={iaText} onChange={setIaText}/>
          <div className='row'><button className='primary' onClick={assistenteIA}><Bot size={16}/> Calcular sugestão</button></div>
          <p className='muted'>Exemplo: “Substituir 850 m² de cobertura” ou “executar 120 m de vedação”.</p>
        </Panel>
      </section>}
    </main>
  </div>
}

createRoot(document.getElementById('root')).render(<App/>)
