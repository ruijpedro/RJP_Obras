import { rendimentoSeed, obraSeed } from '../data/seed'

export const STORE_KEY = 'rjp_obras_v3_webapp_data'

export function defaultData(){
  return {
    obras: obraSeed,
    diarios: [],
    licencas: [],
    ncs: [],
    custos: [],
    fotos: [],
    rendimentos: rendimentoSeed,
    settings: { appsScriptUrl:'' },
    updatedAt: new Date().toISOString()
  }
}

export function loadData(){
  try{
    const raw = localStorage.getItem(STORE_KEY)
    if(!raw) return defaultData()
    return { ...defaultData(), ...JSON.parse(raw) }
  }catch{
    return defaultData()
  }
}

export function saveData(data){
  localStorage.setItem(STORE_KEY, JSON.stringify({ ...data, updatedAt:new Date().toISOString() }))
}

export function uid(prefix='rjp'){
  return `${prefix}_${Math.random().toString(36).slice(2,8)}_${Date.now().toString(36).slice(-5)}`
}
