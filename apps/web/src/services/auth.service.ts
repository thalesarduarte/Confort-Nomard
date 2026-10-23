import { services } from './index';
import { useUserStore } from '@/store/useUserStore';
import { storage } from './mock/storage';
import type { UserPreferenceProfile } from '@/types';
export const authService={
 async register(payload:{name:string;email:string;password:string}){await services.auth.register(payload.name,payload.email,payload.password);},
 async login(email:string,password:string){await services.auth.login(email,password);},
 async getMe(){},
 async updateProfile(profile:Partial<UserPreferenceProfile>){useUserStore.getState().setProfile(profile as UserPreferenceProfile);},
 async updateUser(data:{name?:string;email?:string}){const u=useUserStore.getState().user;if(u)useUserStore.getState().setUser({...u,...data});},
 async deleteAccount(){const u=useUserStore.getState().user;if(u)storage.set('accounts',storage.get<{id:string}[]>('accounts',[]).filter(x=>x.id!==u.id));useUserStore.getState().logout();},
 logout(){services.auth.logout();},
};
