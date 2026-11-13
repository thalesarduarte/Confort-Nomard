import React,{useEffect,useRef} from 'react';
import {useTranslation} from 'react-i18next';

export function Button({variant='default',className='',...props}:React.ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'default'|'primary'|'quiet'|'danger'}){
  return <button className={`button ${variant==='primary'?'button-primary':variant==='quiet'?'button-quiet':variant==='danger'?'button-danger':''} ${className}`} {...props}/>;
}
export function Card({className='',...props}:React.HTMLAttributes<HTMLElement>){return <article className={`panel ${className}`} {...props}/>;}
export function Chip({children}:React.PropsWithChildren){return <span className="pill">{children}</span>;}
export function ScoreRing({score,label,size=92}:{score:number;label:string;size?:number}){
  const radius=41,circumference=2*Math.PI*radius,progress=Math.max(0,Math.min(100,score));
  return <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${label}: ${progress}%`}>
    <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--surface-2)" strokeWidth="9"/>
    <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--primary)" strokeWidth="9" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference*(1-progress/100)} transform="rotate(-90 50 50)"/>
    <text x="50" y="48" textAnchor="middle" dominantBaseline="middle" fill="var(--text)" fontSize="22" fontWeight="800">{progress}</text>
    <text x="50" y="68" textAnchor="middle" fill="var(--muted)" fontSize="10">{label}</text>
  </svg>;
}
export function Progress({value,max}:{value:number;max:number}){const progress=Math.max(0,Math.min(100,value/max*100));return <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}><span style={{width:`${progress}%`}}/></div>;}
export function Skeleton({height=120}:{height?:number}){return <div className="skeleton" aria-hidden="true" style={{minHeight:height}}/>;}
export interface TabItem {id:string;label:string}
export function Tabs({items,active,onChange}:{items:TabItem[];active:string;onChange:(id:string)=>void}){
  const moveFocus=(event:React.KeyboardEvent<HTMLButtonElement>)=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=[...event.currentTarget.closest('[role="tablist"]')!.querySelectorAll<HTMLButtonElement>('[role="tab"]')];const current=tabs.indexOf(event.currentTarget);const target=event.key==='Home'?0:event.key==='End'?tabs.length-1:(current+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[target]?.focus();tabs[target]?.click();};
  return <div className="tabs" role="tablist">{items.map(item=><button key={item.id} id={`tab-${item.id}`} aria-controls={`panel-${item.id}`} tabIndex={active===item.id?0:-1} className="tab" role="tab" aria-selected={active===item.id} onKeyDown={moveFocus} onClick={()=>onChange(item.id)}>{item.label}</button>)}</div>;
}
export function Modal({open,title,onClose,children}:{open:boolean;title:string;onClose:()=>void;children:React.ReactNode}){
  const ref=useRef<HTMLDivElement>(null);const {t}=useTranslation();
  useEffect(()=>{if(!open)return;const previous=document.activeElement as HTMLElement|null;ref.current?.querySelector<HTMLElement>('button,input,select,textarea,[href]')?.focus();const keydown=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose();};document.addEventListener('keydown',keydown);return()=>{document.removeEventListener('keydown',keydown);previous?.focus();};},[open,onClose]);
  if(!open)return null;
  return <div className="modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose();}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-heading" ref={ref} onKeyDown={event=>{if(event.key!=='Tab')return;const focusable=[...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]')];const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}}><div className="row spread"><h2 id="modal-heading">{title}</h2><Button variant="quiet" onClick={onClose} aria-label={t('ui.closeMenu')}>×</Button></div>{children}</section></div>;
}
