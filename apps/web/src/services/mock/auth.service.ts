import { DEFAULT_PROFILE, type Account, type Profile, type ProfilePatch } from '../types';
import { mergeAnonymousProfile } from '@/domain/simulation';
import { useAppStore } from '@/store/appStore';
import { storage, wait } from './storage';

async function passwordHash(value:string):Promise<string>{
  if(!globalThis.crypto?.subtle)throw new Error('errors.auth.secure');
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map(item=>item.toString(16).padStart(2,'0')).join('');
}
const mergeProfile=(...parts:Array<ProfilePatch|null>):Profile=>{
  const merged=parts.reduce<ProfilePatch>((current,part)=>part?{...current,...part,weights:{...DEFAULT_PROFILE.weights,...current.weights,...part.weights},comfortFoods:part.comfortFoods??current.comfortFoods,languages:part.languages??current.languages,freeformTags:[...new Set([...(current.freeformTags??[]),...(part.freeformTags??[])])]}:current,{});
  return {...DEFAULT_PROFILE,...merged,weights:{...DEFAULT_PROFILE.weights,...merged.weights},freeformTags:merged.freeformTags??[]};
};
export const mockAuthService={
  async register(name:string,email:string,password:string):Promise<void>{
    await wait(450);const cleanEmail=email.trim().toLocaleLowerCase();
    if(name.trim().length<2||!cleanEmail.includes('@')||password.length<8)throw new Error('errors.auth.fields');
    const accounts=storage.read<Account[]>('accounts',[]);if(accounts.some(account=>account.email===cleanEmail))throw new Error('errors.auth.exists');
    const account:Account={id:`local-${Date.now()}`,name:name.trim(),email:cleanEmail,passwordHash:await passwordHash(password)};
    storage.write('accounts',[...accounts,account]);const state=useAppStore.getState();
    const profile=mergeProfile(mergeAnonymousProfile(state.tempProfile,state.profile)??{});useAppStore.getState().setSession({id:account.id,name:account.name,email:account.email},profile);
  },
  async login(email:string,password:string):Promise<void>{
    await wait(450);const cleanEmail=email.trim().toLocaleLowerCase();const hash=await passwordHash(password);
    const account=storage.read<Account[]>('accounts',[]).find(item=>item.email===cleanEmail&&item.passwordHash===hash);
    if(!account)throw new Error('errors.auth.login');const state=useAppStore.getState();
    const profile=mergeProfile(mergeAnonymousProfile(state.tempProfile,state.profile)??{});useAppStore.getState().setSession({id:account.id,name:account.name,email:account.email},profile);
  },
  logout():void{useAppStore.getState().signOut();},
  deleteAccount():void{const active=useAppStore.getState().account;if(active){storage.write('accounts',storage.read<Account[]>('accounts',[]).filter(account=>account.id!==active.id));useAppStore.getState().clearAccount();}},
};

export function accountProfile(tempProfile:ProfilePatch|null,current:ProfilePatch|null):Profile{return mergeProfile(mergeAnonymousProfile(tempProfile,current)??{});}
