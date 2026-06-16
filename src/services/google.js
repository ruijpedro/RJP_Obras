export async function syncToAppsScript(url, payload){
  if(!url) throw new Error('URL Apps Script vazio')
  await fetch(url, {
    method:'POST',
    mode:'no-cors',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({app:'RJP Obras V3 WebApp', payload})
  })
  return true
}
