'use client';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

interface Ctx {
  paused: boolean;
  setPaused: (p: boolean) => void;
  say: (text: string) => void;
  connectOpen: boolean;
  openConnect: () => void;
  closeConnect: () => void;
}
const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null);
  useEffect(() => { setPaused(matchMedia('(prefers-reduced-motion: reduce)').matches); }, []);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(id);
  }, [toast]);
  const say = useCallback((text: string) => setToast({ text, id: Date.now() }), []);
  return (
    <AppCtx.Provider value={{ paused, setPaused, say, connectOpen, openConnect: () => setConnectOpen(true), closeConnect: () => setConnectOpen(false) }}>
      {children}
      {toast && <p key={toast.id} role="status" className="toast" style={{ position: 'fixed', zIndex: 300 }}>{toast.text}</p>}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp outside AppProvider');
  return c;
}
