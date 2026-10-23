import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserPreferenceProfile } from '@/types';

interface UserStore {
  user: User | null;
  profile: UserPreferenceProfile | null;
  token: string | null;
  isLoggedIn: boolean;
  setUser: (user: User) => void;
  setProfile: (profile: UserPreferenceProfile) => void;
  setToken: (token: string) => void;
  logout: () => void;
  tempProfile: Partial<UserPreferenceProfile> | null;
  setTempProfile: (profile: Partial<UserPreferenceProfile>) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      token: null,
      isLoggedIn: false,
      setUser: (user) => set({ user, isLoggedIn: true }),
      setProfile: (profile) => set({ profile }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, profile: null, token: null, isLoggedIn: false }),
      tempProfile: null,
      setTempProfile: (tempProfile) => set((state) => ({ 
        tempProfile: { ...state.tempProfile, ...tempProfile } 
      })),
    }),
    {
      name: 'comfort-nomad-user-storage',
    }
  )
);
