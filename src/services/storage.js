const KEY = 'rjp_obras_v3_state';

export const seedState = {
  obras: [
    { id: crypto.randomUUID(), codigo: 'RJP-001', nome: 'Reabilitação de edifício', cliente: 'Cliente Exemplo', local: 'Leiria', estado: 'Em curso', inicio: '2026-06-01', fim: '2026-09-30', previsto: 85000, real: 12500, licencas: 'Em validação' }
  ],
  diarios: [],
  licencas: [],
  nc: [],
  tarefas: [
    { id: crypto.randomUUID(), obra: 'RJP-001', tarefa: 'Preparação de estaleiro', inicio: '2026-06-01', fim: '2026-06-07', estado: 'Concluída', depende: '' },
    { id: crypto.randomUUID(), obra: 'RJP-001', tarefa: 'Demolições e limpezas', inicio: '2026-06-08', fim: '2026-06-21', estado: 'Em curso', depende: 'Preparação de estaleiro' }
  ]
};

export function loadState(){
  try { return JSON.parse(localStorage.getItem(KEY)) || seedState; }
  catch { return seedState; }
}

export function saveState(state){
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function exportJson(state){
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `RJP_Obras_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
}
