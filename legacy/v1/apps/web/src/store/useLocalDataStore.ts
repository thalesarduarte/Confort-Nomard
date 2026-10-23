import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ArrivalPlan } from '@/services/types';

export type ContributionStatus = 'pendente' | 'aprovado' | 'requer ajustes';
export interface Contribution { id: string; kind: 'dica cultural' | 'lugar de comida' | 'avaliação de bairro'; city: string; title: string; description: string; status: ContributionStatus; votes: number; moderationNote?: string; voted?: boolean }
interface LocalData {
  favorites: string[]; compared: string[]; checklist: Record<string, boolean>; knownTips: string[]; contributions: Contribution[]; leads: Array<{company:string;email:string}>; arrivalPlan: ArrivalPlan | null; arrivalTasksDone: Record<string, boolean>;
  toggleFavorite: (id:string)=>void; toggleCompare:(id:string)=>void; toggleChecklist:(id:string)=>void; toggleTip:(id:string)=>void; saveArrivalPlan:(plan:ArrivalPlan)=>void; toggleArrivalTask:(id:string)=>void;
  addContribution:(item:Omit<Contribution,'id'|'status'|'votes'|'moderationNote'|'voted'>)=>void; vote:(id:string,delta?:1|-1)=>void; moderateContribution:(id:string,status:'aprovado'|'requer ajustes',note:string)=>void; deleteContribution:(id:string)=>void; addLead:(company:string,email:string)=>void;
}
const seedContributions: Contribution[] = [
  {id:'seed-1',kind:'dica cultural',city:'Lisboa',title:'Horários de comércio',description:'Lojas de bairro podem fechar para almoço; confira antes de sair.',status:'aprovado',votes:12},
  {id:'seed-2',kind:'lugar de comida',city:'Berlim',title:'Mercearia brasileira',description:'Uma opção comunitária para encontrar ingredientes familiares.',status:'aprovado',votes:8},
];
export const useLocalDataStore=create<LocalData>()(persist((set)=>({
  favorites:[], compared:[], checklist:{}, knownTips:[], contributions:seedContributions, leads:[], arrivalPlan:null, arrivalTasksDone:{},
  toggleFavorite:id=>set(s=>({favorites:s.favorites.includes(id)?s.favorites.filter(x=>x!==id):[...s.favorites,id]})),
  toggleCompare:id=>set(s=>({compared:s.compared.includes(id)?s.compared.filter(x=>x!==id):s.compared.length<3?[...s.compared,id]:s.compared})),
  toggleChecklist:id=>set(s=>({checklist:{...s.checklist,[id]:!s.checklist[id]}})),
  toggleTip:id=>set(s=>({knownTips:s.knownTips.includes(id)?s.knownTips.filter(x=>x!==id):[...s.knownTips,id]})),
  saveArrivalPlan:arrivalPlan=>set({arrivalPlan,arrivalTasksDone:{}}),
  toggleArrivalTask:id=>set(s=>({arrivalTasksDone:{...s.arrivalTasksDone,[id]:!s.arrivalTasksDone[id]}})),
  addContribution:item=>set(s=>({contributions:[{...item,id:`c-${Date.now()}`,status:'pendente',votes:0},...s.contributions]})),
  vote:(id,delta=1)=>set(s=>({contributions:s.contributions.map(x=>x.id===id&&!x.voted&&x.status==='aprovado'?{...x,votes:x.votes+delta,voted:true}:x)})),
  moderateContribution:(id,status,moderationNote)=>set(s=>({contributions:s.contributions.map(x=>x.id===id?{...x,status,moderationNote}:x)})),
  deleteContribution:id=>set(s=>({contributions:s.contributions.filter(x=>x.id!==id||x.id.startsWith('seed-'))})),
  addLead:(company,email)=>set(s=>({leads:[...s.leads,{company,email}]})),
}),{name:'comfort-nomad-community-v1'}));
