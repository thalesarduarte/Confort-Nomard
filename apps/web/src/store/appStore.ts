import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_PROFILE, type Account, type ArrivalTask, type CommunityReport, type Contribution, type ModerationEvent, type Profile, type ProfilePatch } from '@/services/types';
import { communitySeed } from '@/services/mock/data/community';

type PublicAccount = Omit<Account,'passwordHash'>;
interface AppState {
  account: PublicAccount|null; profile: Profile|null; tempProfile: ProfilePatch|null; favorites: string[]; compared: string[]; history: string[];
  checklist: Record<string,boolean>; learnedTips: string[]; arrivalTasks: ArrivalTask[]; completedTasks: string[];
  contributions: Contribution[]; communityReports: CommunityReport[]; moderationEvents: ModerationEvent[]; votedIds: string[]; leads: Array<{company:string;email:string}>;
  language: 'pt-BR'|'en'|'es'; currency: 'BRL'|'EUR'|'USD'; theme: 'light'|'dark';
  setLanguage:(language:AppState['language'])=>void; setCurrency:(currency:AppState['currency'])=>void; setTheme:(theme:AppState['theme'])=>void;
  setTempProfile:(profile:ProfilePatch|null)=>void; setProfile:(profile:Profile)=>void; setSession:(account:PublicAccount,profile:Profile)=>void; signOut:()=>void; clearAccount:()=>void;
  toggleFavorite:(id:string)=>void; toggleCompare:(id:string)=>void; recordVisit:(id:string)=>void; toggleChecklist:(id:string)=>void; toggleLearnedTip:(id:string)=>void;
  setArrivalTasks:(tasks:ArrivalTask[])=>void; toggleArrivalTask:(id:string)=>void;
  addContribution:(input:Omit<Contribution,'id'|'status'|'author'|'authorId'|'votes'|'createdAt'|'note'>)=>void;
  updateContribution:(id:string,input:Pick<Contribution,'title'|'body'>)=>void; removeContribution:(id:string)=>void;
  voteContribution:(id:string,value:-1|1)=>void; moderateContribution:(id:string,status:'aprovado'|'ajustes',note:string)=>void;
  reportContribution:(contributionId:string,reason:CommunityReport['reason'],details:string)=>void;
  addLead:(company:string,email:string)=>void;
}

export const useAppStore=create<AppState>()(persist((set,get)=>({
  account:null,profile:null,tempProfile:null,favorites:[],compared:[],history:[],checklist:{},learnedTips:[],arrivalTasks:[],completedTasks:[],
  contributions:communitySeed,communityReports:[],moderationEvents:[],votedIds:[],leads:[],language:'pt-BR',currency:'BRL',theme:'light',
  setLanguage:language=>set({language}),setCurrency:currency=>set({currency}),setTheme:theme=>set({theme}),
  setTempProfile:profile=>set(state=>({tempProfile:profile?{...state.tempProfile,...profile,weights:{...DEFAULT_PROFILE.weights,...state.tempProfile?.weights,...profile.weights},freeformTags:[...new Set([...(state.tempProfile?.freeformTags??[]),...(profile.freeformTags??[])])]}:null})),
  setProfile:profile=>set({profile}),
  setSession:(account,profile)=>set({account,profile,tempProfile:null}),
  signOut:()=>{const {profile,tempProfile}=get();set({account:null,profile:null,tempProfile:profile??tempProfile});},
  clearAccount:()=>set({account:null,profile:null}),
  toggleFavorite:id=>set(state=>({favorites:state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id]})),
  toggleCompare:id=>set(state=>({compared:state.compared.includes(id)?state.compared.filter(x=>x!==id):state.compared.length<3?[...state.compared,id]:state.compared})),
  recordVisit:id=>set(state=>({history:[id,...state.history.filter(x=>x!==id)].slice(0,20)})),
  toggleChecklist:id=>set(state=>({checklist:{...state.checklist,[id]:!state.checklist[id]}})),
  toggleLearnedTip:id=>set(state=>({learnedTips:state.learnedTips.includes(id)?state.learnedTips.filter(x=>x!==id):[...state.learnedTips,id]})),
  setArrivalTasks:arrivalTasks=>set({arrivalTasks,completedTasks:arrivalTasks.filter(task=>task.completed).map(task=>task.id)}),
  toggleArrivalTask:id=>set(state=>{const done=state.completedTasks.includes(id);return {completedTasks:done?state.completedTasks.filter(x=>x!==id):[...state.completedTasks,id],arrivalTasks:state.arrivalTasks.map(task=>task.id===id?{...task,completed:!done}:task)};}),
  addContribution:input=>{const account=get().account;if(!account)return;set(state=>{const itemId=`c-${Date.now()}`;return {contributions:[{...input,id:itemId,status:'pendente',author:account.name,authorId:account.id,votes:0,createdAt:new Date().toISOString().slice(0,10)},...state.contributions],moderationEvents:[{id:`event-${Date.now()}`,contributionId:itemId,action:'submitted',actorId:account.id,note:'Recebida para revisão prévia.',createdAt:new Date().toISOString()},...state.moderationEvents]};});},
  updateContribution:(id,input)=>set(state=>({contributions:state.contributions.map(item=>item.id===id&&item.authorId===state.account?.id&&(item.status==='pendente'||item.status==='ajustes')?{...item,...input}:item),moderationEvents:[{id:`event-${Date.now()}`,contributionId:id,action:'edited',actorId:state.account?.id??'local',note:'Autor atualizou título ou descrição.',createdAt:new Date().toISOString()},...state.moderationEvents]})),
  removeContribution:id=>set(state=>({contributions:state.contributions.filter(item=>item.id!==id||item.authorId!==state.account?.id||item.id.startsWith('seed-')),moderationEvents:[{id:`event-${Date.now()}`,contributionId:id,action:'removed',actorId:state.account?.id??'local',note:'Removida pelo autor.',createdAt:new Date().toISOString()},...state.moderationEvents]})),
  voteContribution:(id,value)=>set(state=>state.votedIds.includes(id)?{}:{contributions:state.contributions.map(item=>item.id===id&&item.status==='aprovado'?{...item,votes:item.votes+value}:item),votedIds:[...state.votedIds,id]}),
  moderateContribution:(id,status,note)=>set(state=>({contributions:state.contributions.map(item=>item.id===id?{...item,status,note}:item),moderationEvents:[{id:`event-${Date.now()}`,contributionId:id,action:status==='aprovado'?'approved':'changes_requested',actorId:state.account?.id??'local-reviewer',note:note.trim(),createdAt:new Date().toISOString()},...state.moderationEvents]})),
  reportContribution:(contributionId,reason,details)=>set(state=>{const account=state.account;if(!account||state.communityReports.some(report=>report.contributionId===contributionId&&report.reporterId===account.id))return {};const reportId=`report-${Date.now()}`;return {contributions:state.contributions.map(item=>item.id===contributionId?{...item,status:'denunciado',note:'Ocultada do mural enquanto a denúncia aguarda revisão.'}:item),communityReports:[{id:reportId,contributionId,reporterId:account.id,reason,details:details.trim(),createdAt:new Date().toISOString()},...state.communityReports],moderationEvents:[{id:`event-${Date.now()}`,contributionId,action:'reported',actorId:account.id,note:`Denúncia registrada: ${reason}. ${details.trim()}`,createdAt:new Date().toISOString()},...state.moderationEvents]};}),
  addLead:(company,email)=>set(state=>({leads:[...state.leads,{company,email}]})),
}),{name:'comfort-nomad-v2',version:3,migrate:(persisted,version)=>{if(version<3){const previous=persisted as Partial<AppState>;return {...previous,profile:previous.profile?{...DEFAULT_PROFILE,...previous.profile}:null,tempProfile:previous.tempProfile?{...previous.tempProfile,nationality:previous.tempProfile.nationality??DEFAULT_PROFILE.nationality}:null,arrivalTasks:[],completedTasks:[],communityReports:[],moderationEvents:[]};}return persisted as AppState;}}));
