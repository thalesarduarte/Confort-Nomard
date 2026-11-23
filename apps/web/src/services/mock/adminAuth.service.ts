import { useAppStore } from '@/store/appStore';
import { wait } from './storage';

const demoEmail = 'admin@comfortnomad.demo';
const demoPassword = 'NomadAdmin2026!';

export const mockAdminAuthService = {
  async login(email: string, password: string): Promise<void> {
    await wait(260);
    if (email.trim().toLowerCase() !== demoEmail || password !== demoPassword) {
      throw new Error('errors.admin.login');
    }
    useAppStore.getState().setAdminSession({ email: demoEmail });
  },
  logout(): void {
    useAppStore.getState().clearAdminSession();
  },
};
