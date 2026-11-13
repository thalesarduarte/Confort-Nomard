import type { CommunityReport, Contribution, ModerationEvent } from '../types';
import { useAppStore } from '@/store/appStore';
import { wait } from './storage';

export const moderationRules=[
  'Publique experiência própria ou informação que possa ser conferida.',
  'Não inclua e-mail, telefone, endereço residencial ou dados que identifiquem alguém.',
  'Não aceitamos publicidade, assédio, discriminação ou alegações de segurança sem contexto e data.',
  'Contribuições novas entram como pendentes; um revisor simulado aprova ou pede ajustes com justificativa.',
];
const contactPattern=/(https?:\/\/|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\+?\d[\d\s().-]{7,})/i;
export function validateContribution(title:string,body:string):string|null{
  if(title.trim().length<5||title.trim().length>100)return 'errors.community.titleLength';
  if(body.trim().length<20||body.trim().length>1000)return 'errors.community.bodyLength';
  if(contactPattern.test(`${title} ${body}`))return 'errors.community.contact';
  return null;
}
const owned=(item:Contribution)=>item.authorId===useAppStore.getState().account?.id;

export const mockCommunityService={
  rules():string[]{return moderationRules;},
  async list():Promise<Contribution[]>{await wait(380);return useAppStore.getState().contributions;},
  async reports():Promise<CommunityReport[]>{await wait(120);return useAppStore.getState().communityReports;},
  async history(contributionId?:string):Promise<ModerationEvent[]>{await wait(120);const events=useAppStore.getState().moderationEvents;return contributionId?events.filter(event=>event.contributionId===contributionId):events;},
  async submit(input:Omit<Contribution,'id'|'status'|'author'|'authorId'|'votes'|'createdAt'|'note'>):Promise<void>{
    await wait(400);const error=validateContribution(input.title,input.body);if(error)throw new Error(error);
    if(!useAppStore.getState().account)throw new Error('errors.community.login');
    useAppStore.getState().addContribution(input);
  },
  async update(id:string,input:Pick<Contribution,'title'|'body'>):Promise<void>{await wait(250);const item=useAppStore.getState().contributions.find(entry=>entry.id===id);if(!item||!owned(item)||(item.status!=='pendente'&&item.status!=='ajustes'))throw new Error('errors.community.editOwn');const error=validateContribution(input.title,input.body);if(error)throw new Error(error);useAppStore.getState().updateContribution(id,input);},
  async remove(id:string):Promise<void>{await wait(250);const item=useAppStore.getState().contributions.find(entry=>entry.id===id);if(!item||!owned(item))throw new Error('errors.community.removeOwn');useAppStore.getState().removeContribution(id);},
  async vote(id:string,value:-1|1):Promise<void>{await wait(180);const item=useAppStore.getState().contributions.find(entry=>entry.id===id);if(item?.status==='aprovado')useAppStore.getState().voteContribution(id,value);},
  async report(id:string,reason:CommunityReport['reason'],details:string):Promise<void>{await wait(220);const item=useAppStore.getState().contributions.find(entry=>entry.id===id);const account=useAppStore.getState().account;if(!account)throw new Error('errors.community.login');if(!item||item.status!=='aprovado')throw new Error('errors.community.reportApproved');if(owned(item))throw new Error('errors.community.selfReport');if(useAppStore.getState().communityReports.some(report=>report.contributionId===id&&report.reporterId===account.id))throw new Error('errors.community.reportDuplicate');if(details.trim().length>300)throw new Error('errors.community.reportDetails');if(contactPattern.test(details))throw new Error('errors.community.contact');useAppStore.getState().reportContribution(id,reason,details);},
  async moderate(id:string,status:'aprovado'|'ajustes',note:string):Promise<void>{await wait(300);if(note.trim().length<5)throw new Error('errors.community.moderationJustification');const item=useAppStore.getState().contributions.find(entry=>entry.id===id);if(!item||item.status==='aprovado')throw new Error('errors.community.notPending');if(item.authorId===useAppStore.getState().account?.id)throw new Error('errors.community.selfModerate');useAppStore.getState().moderateContribution(id,status,note.trim());},
};
