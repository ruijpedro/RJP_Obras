import React from 'react'
import { Trash2 } from 'lucide-react'

export function Field({label,value,onChange,type='text',options,placeholder,wide}){
  return <label className={wide?'field wide':'field'}>
    <span>{label}</span>
    {options ? <select value={value || ''} onChange={e=>onChange(e.target.value)}>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select> : <input type={type} value={value || ''} placeholder={placeholder || ''} onChange={e=>onChange(e.target.value)} />}
  </label>
}

export function TextArea({label,value,onChange}){
  return <label className='field wide'><span>{label}</span><textarea value={value || ''} onChange={e=>onChange(e.target.value)} /></label>
}

export function Panel({title,children}){
  return <section className='panel'><h3>{title}</h3>{children}</section>
}

export function Card({title,value,warning}){
  return <div className={warning?'card warning':'card'}><span>{title}</span><strong>{value}</strong></div>
}

export function SelectObra({obras,value,onChange,label='Obra'}){
  return <label className='field'><span>{label}</span><select value={value || ''} onChange={e=>onChange(e.target.value)}>
    <option value=''>Selecionar obra</option>
    {obras.map(o=><option value={o.id} key={o.id}>{o.nome}</option>)}
  </select></label>
}

export function List({items,render,onDelete}){
  if(!items?.length) return <p className='muted'>Ainda sem registos.</p>
  return <div className='list'>{items.map(item=><div className='listItem' key={item.id}><div>{render(item)}</div>{onDelete && <button className='icon danger' onClick={()=>onDelete(item.id)}><Trash2 size={16}/></button>}</div>)}</div>
}
