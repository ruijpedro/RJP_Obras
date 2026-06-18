const APP_NAME = 'RJP Obras V4.1';
const ROOT_FOLDER = 'RJP Obras';

function doGet(){
  return json_({ok:true, app:APP_NAME, message:'Apps Script ativo'});
}

function doPost(e){
  try{
    const body = JSON.parse(e.postData.contents || '{}');
    const p = body.payload || {};
    const ss = getOrCreateSpreadsheet_('RJP Obras V4.1 - Base de Dados');
    const root = getOrCreateFolder_(ROOT_FOLDER);

    writeJson_(ss, 'BACKUP_JSON', p);
    writeList_(ss, 'OBRAS', p.obras || [], ['id','nome','cliente','empreiteiro','fiscalizacao','local','inicio','fim','valor','estado','progresso','contrato','obs']);
    writeList_(ss, 'DIARIOS', p.diarios || [], ['id','obraId','data','meteo','equipa','trab','ocor','gps','ia']);
    writeList_(ss, 'PLANEAMENTO', p.tarefas || [], ['id','obraId','tarefa','subtarefa','resp','inicio','fim','depende','estado','pct','prioridade']);
    writeList_(ss, 'AUTOS', p.autos || [], ['id','obraId','artigo','desc','un','qtdContratada','qtdExecutada','qtdAcumulada','pu','estado']);
    writeList_(ss, 'CURVA_S', p.curva || [], ['id','obraId','mes','previsto','real']);
    writeList_(ss, 'FERROVIA_IP', p.ferroviarios || [], ['id','obraId','tipo','linha','local','pkIni','pkFim','lado','estado','acao','gps','obs']);
    writeList_(ss, 'RENDIMENTOS', p.rend || [], ['id','fonte','cat','dom','desc','un','mo','prod','mat','eq','pu']);
    writeList_(ss, 'LICENCAS', p.licencas || [], ['id','obraId','tipo','entidade','num','emissao','validade','estado','link','obs']);
    writeList_(ss, 'NAO_CONFORMIDADES', p.ncs || [], ['id','obraId','data','local','desc','grav','resp','prazo','estado','gps']);
    writeList_(ss, 'FOTOS', p.fotos || [], ['id','obraId','data','titulo','cat','gps','desc','ficheiro','ia']);

    createObraFolders_(root, p.obras || []);
    return json_({ok:true, app:APP_NAME, updated:new Date()});
  }catch(err){
    return json_({ok:false, error:String(err)});
  }
}

function writeJson_(ss, name, payload){
  const sh = getSheet_(ss, name);
  sh.clear();
  sh.appendRow(['Data','JSON']);
  sh.appendRow([new Date(), JSON.stringify(payload)]);
}

function writeList_(ss, name, rows, fields){
  const sh = getSheet_(ss, name);
  sh.clear();
  sh.appendRow(['Sync'].concat(fields));
  rows.forEach(r => sh.appendRow([new Date()].concat(fields.map(f => r[f] || ''))));
}

function createObraFolders_(root, obras){
  obras.forEach(o => {
    const folder = getOrCreateFolder_(o.nome || o.id || 'Obra sem nome', root);
    ['Diário','Planeamento','Autos','Curva_S','Custos','NC','Fotos','Licenças','Relatórios','Projetos','PSS_PGRCD','Ferrovia_IP'].forEach(n => getOrCreateFolder_(n, folder));
  });
}

function getOrCreateSpreadsheet_(name){
  const files = DriveApp.getFilesByName(name);
  if(files.hasNext()) return SpreadsheetApp.open(files.next());
  return SpreadsheetApp.create(name);
}

function getOrCreateFolder_(name, parent){
  const files = parent ? parent.getFoldersByName(name) : DriveApp.getFoldersByName(name);
  if(files.hasNext()) return files.next();
  return parent ? parent.createFolder(name) : DriveApp.createFolder(name);
}

function getSheet_(ss, name){
  let sh = ss.getSheetByName(name);
  if(!sh) sh = ss.insertSheet(name);
  return sh;
}

function json_(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
