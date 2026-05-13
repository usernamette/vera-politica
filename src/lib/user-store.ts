// Mock user state stored in localStorage. No real auth.
import { useEffect, useState, useSyncExternalStore } from "react";

type User = { name: string; email: string };
type FollowedDeputado = {
  id: number;
  nome: string;
  siglaPartido: string;
  siglaUf: string;
  urlFoto: string;
  addedAt: string;
};

const KEYS = {
  user: "bav.user",
  favorites: "bav.favorites",
  voted: "bav.voted",
  prefs: "bav.preferences",
} as const;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  emit();
}

// ---------------- Auth ----------------
export const auth = {
  getUser: (): User | null => read<User | null>(KEYS.user, null),
  login: (email: string, name?: string) => {
    const derived = name?.trim() || email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    write<User>(KEYS.user, { email, name: derived });
  },
  logout: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(KEYS.user);
    emit();
  },
};

// ---------------- Favorites & Voted ----------------
export type RelationKind = "favorite" | "voted";

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  const onStorage = () => cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
};

export function useUser() {
  const user = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(KEYS.user),
    () => null
  );
  return user ? (JSON.parse(user) as User) : null;
}

export function useFollowed(kind: RelationKind): FollowedDeputado[] {
  const raw = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(kind === "favorite" ? KEYS.favorites : KEYS.voted),
    () => null
  );
  return raw ? (JSON.parse(raw) as FollowedDeputado[]) : [];
}

export const followStore = {
  list: (kind: RelationKind): FollowedDeputado[] =>
    read<FollowedDeputado[]>(kind === "favorite" ? KEYS.favorites : KEYS.voted, []),
  has: (kind: RelationKind, id: number) =>
    followStore.list(kind).some((d) => d.id === id),
  add: (kind: RelationKind, dep: Omit<FollowedDeputado, "addedAt">) => {
    const key = kind === "favorite" ? KEYS.favorites : KEYS.voted;
    const list = followStore.list(kind);
    if (list.some((d) => d.id === dep.id)) return;
    write(key, [...list, { ...dep, addedAt: new Date().toISOString() }]);
  },
  remove: (kind: RelationKind, id: number) => {
    const key = kind === "favorite" ? KEYS.favorites : KEYS.voted;
    write(key, followStore.list(kind).filter((d) => d.id !== id));
  },
  toggle: (kind: RelationKind, dep: Omit<FollowedDeputado, "addedAt">) => {
    if (followStore.has(kind, dep.id)) followStore.remove(kind, dep.id);
    else followStore.add(kind, dep);
  },
};

// ---------------- Preferences ----------------
export type Preferences = {
  alertVotacoes: boolean;
  alertGastos: boolean;
  alertProposicoes: boolean;
  alertDivergencias: boolean;
  temas: string[];
  displayName: string;
};
const defaultPrefs: Preferences = {
  alertVotacoes: true,
  alertGastos: true,
  alertProposicoes: false,
  alertDivergencias: true,
  temas: [],
  displayName: "",
};
export const prefsStore = {
  get: (): Preferences => ({ ...defaultPrefs, ...read<Partial<Preferences>>(KEYS.prefs, {}) }),
  set: (p: Partial<Preferences>) => write(KEYS.prefs, { ...prefsStore.get(), ...p }),
};
export function usePreferences(): Preferences {
  const raw = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(KEYS.prefs),
    () => null
  );
  return { ...defaultPrefs, ...(raw ? (JSON.parse(raw) as Partial<Preferences>) : {}) };
}

// SSR-safe mounted hook
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}
