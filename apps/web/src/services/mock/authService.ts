import { storage } from './storage';
import { useUserStore } from '@/store/useUserStore';
import type { User } from '@/types';
interface LocalAccount extends User { password: string }
export const mockAuthService = {
 async register(name:string,email:string,password:string){ const users=storage.get<LocalAccount[]>('accounts',[]); if(users.some(u=>u.email.toLowerCase()===email.toLowerCase())) throw new Error('Este e-mail já possui uma conta.'); const user={id:`user-${Date.now()}`,name,email}; storage.set('accounts',[...users,{...user,password}]); const temp=useUserStore.getState().tempProfile; useUserStore.getState().setUser(user); if(temp) useUserStore.getState().setProfile(temp as any); },
 async login(email:string,password:string){ const user=storage.get<LocalAccount[]>('accounts',[]).find(u=>u.email.toLowerCase()===email.toLowerCase()&&u.password===password); if(!user) throw new Error('E-mail ou senha incorretos.'); useUserStore.getState().setUser({id:user.id,name:user.name,email:user.email}); const temp=useUserStore.getState().tempProfile; if(temp)useUserStore.getState().setProfile(temp as any); },
 logout(){useUserStore.getState().logout();},
};
