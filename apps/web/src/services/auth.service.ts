import { api } from './api';
import { useUserStore } from '@/store/useUserStore';
import { User, UserPreferenceProfile } from '@/types';

interface AuthResponse {
  access_token: string;
  user: User;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  locale?: string;
}

export const authService = {
  /** POST /auth/register â€” creates account and returns token */
  async register(payload: RegisterPayload): Promise<void> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    const store = useUserStore.getState();
    store.setToken(data.access_token);
    store.setUser(data.user);
    // set Authorization header for subsequent requests
    api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
  },

  /** POST /auth/login â€” validates credentials and returns token */
  async login(email: string, password: string): Promise<void> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    const store = useUserStore.getState();
    store.setToken(data.access_token);
    store.setUser(data.user);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
    // Fetch full profile (includes preferences)
    await authService.getMe();
  },

  /** GET /users/me â€” refresh user + profile from server */
  async getMe(): Promise<void> {
    try {
      const { data } = await api.get<{ profile?: UserPreferenceProfile } & { id: string; name: string; email: string }>('/users/me');
      const { profile, ...user } = data;
      const store = useUserStore.getState();
      store.setUser(user as User);
      if (profile) store.setProfile(profile);
    } catch {
      // token expired or invalid â€” logout silently
      useUserStore.getState().logout();
    }
  },

  /** PUT /users/me/profile â€” save preference profile */
  async updateProfile(profileData: Partial<UserPreferenceProfile>): Promise<void> {
    const { data } = await api.put<UserPreferenceProfile>('/users/me/profile', profileData);
    useUserStore.getState().setProfile(data);
  },

  /** PUT /users/me â€” update name/email */
  async updateUser(userData: { name?: string; email?: string }): Promise<void> {
    const { data } = await api.put<{ id: string; name: string; email: string }>('/users/me', userData);
    const store = useUserStore.getState();
    store.setUser(data as User);
  },

  /** Clear session */
  logout(): void {
    delete api.defaults.headers.common['Authorization'];
    useUserStore.getState().logout();
  },
};
