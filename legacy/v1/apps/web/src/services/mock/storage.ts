const prefix = 'comfort-nomad:';
export const storage = {
  get<T>(key: string, fallback: T): T { try { const raw = localStorage.getItem(prefix+key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } },
  set<T>(key: string, value: T): void { try { localStorage.setItem(prefix+key, JSON.stringify(value)); } catch { /* storage unavailable */ } },
  remove(key: string): void { try { localStorage.removeItem(prefix+key); } catch { /* storage unavailable */ } },
};
