const APP_NAME = 'RJP Obras V3 WebApp';
const ROOT_FOLDER = 'RJP Obras';

function doGet() {
  return json_({ ok:true, app:APP_NAME, message:'Apps Script ativo' });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const payload = body.payload || {};
    const ss = getOrCreateSpreadsheet_('RJP Obras V3 - Base de Dados');
    const root = getOrCreateFolder_(ROOT_FOLDER);

    writeJson_(ss, 'BACKUP_JSON', payload);
    writeList_(ss, 'OBRAS', payload.obras || [], ['id','nome','cliente','empreiteiro','fiscalizacao','local','inicio','fim','valor','estado','progresso','contrato']);
    writeList_(ss, 'DIARIOS', payload.diarios || [], ['id','obraId','data','meteorologia','equipas','trabalhos','ocorrencias','seguranca','gps','iaResumo']);
    writeList_(ss, 'LICENCAS', payload.licencas || [], ['id','obraId','tipo','entidade','numero','emissao','validade','estado','link']);
    writeList_(ss, 'NAO_CONFORMIDADES', payload.ncs || [], ['id','obraId','data','local','descricao','gravidade','responsavel','prazo','estado','gps']);
    writeList_(ss, 'CUSTOS_AUTOS', payload.custos || [], ['id','obraId','data','tipo','atividadeId','descricao','quantidade','previsto','real','auto']);
    writeList_(ss, 'RENDIMENTOS', payload.rendimentos || [], ['id','fonte','categoria','dominio','descricao','unidade','mo','producaoDia','materiais','equipamento','precoUnit']);
    writeList_(ss, 'FOTOS', payload.fotos || [], ['id','obraId','data','titulo','categoria','gps','descricao','ficheiro','ia']);

    createObraFolders_(root, payload.obras || []);
    return json_({ok:true, app:APP_NAME, updated:new Date()});
  } catch(err) {
    return json_({ok:false, error:String(err)});
  }
}

function writeJson_(ss, name, payload) {
  const sh = getSheet_(ss, name);
  sh.clear();
  sh.appendRow(['Data','JSON']);
  sh.appendRow([new Date(), JSON.stringify(payload)]);
}

function writeList_(ss, name, rows, fields) {
  const sh = getSheet_(ss, name);
  sh.clear();
  sh.appendRow(['Sync'].concat(fields));
  rows.forEach(r => sh.appendRow([new Date()].concat(fields.map(f => r[f] || ''))));
}

function createObraFolders_(root, obras) {
  obras.forEach(o => {
    const name = o.nome || o.id || 'Obra sem nome';
    const folder = getOrCreateFolder_(name, root);
    ['Diário','Fotos','Licenças','Autos','Relatórios','Projetos','PSS_PGRCD'].forEach(n => getOrCreateFolder_(n, folder));
  });
}

function getOrCreateSpreadsheet_(name) {
  const files = DriveApp.getFilesByName(name);
  if(files.hasNext()) return SpreadsheetApp.open(files.next());
  return SpreadsheetApp.create(name);
}

function getOrCreateFolder_(name, parent) {
  const files = parent ? parent.getFoldersByName(name) : DriveApp.getFoldersByName(name);
  if(files.hasNext()) return files.next();
  return parent ? parent.createFolder(name) : DriveApp.createFolder(name);
}

function getSheet_(ss, name) {
  let sh = ss.getSheetByName(name);
  if(!sh) sh = ss.insertSheet(name);
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
