// Configuração futura: substituir pelos dados do projeto Google Cloud / Apps Script.
export const GOOGLE_CONFIG = {
  APP_NAME: 'RJP Obras',
  CLIENT_ID: '',
  API_KEY: '',
  APPS_SCRIPT_URL: ''
};

export async function sincronizarComAppsScript(state){
  if(!GOOGLE_CONFIG.APPS_SCRIPT_URL){
    throw new Error('Configura primeiro o APPS_SCRIPT_URL em src/services/google.js');
  }
  const res = await fetch(GOOGLE_CONFIG.APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ app: GOOGLE_CONFIG.APP_NAME, state })
  });
  return res.json();
}
