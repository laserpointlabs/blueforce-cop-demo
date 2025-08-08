"use client";
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';
export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  timeoutMs?: number;
}

interface ToastContextValue {
  notify: (message: string, variant?: ToastVariant, timeoutMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider />');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const notify = useCallback((message: string, variant: ToastVariant = 'info', timeoutMs = 3500) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { id, message, variant, timeoutMs };
    setItems((prev) => [...prev, item]);
    if (timeoutMs && timeoutMs > 0) {
      setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), timeoutMs);
    }
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-0 flex flex-col items-end gap-2 p-4" aria-live="polite" aria-atomic>
        {items.map((t) => (
          <div key={t.id} className="pointer-events-auto px-3 py-2 rounded border shadow" role="status"
            style={{
              backgroundColor: 'var(--theme-bg-secondary)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text-primary)'
            }}
          >
            <span className="text-xs mr-2" style={{ opacity: 0.7 }}>{iconFor(t.variant)}</span>
            <span className="text-sm">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function iconFor(v: ToastVariant): string {
  switch (v) {
    case 'success': return '✓';
    case 'warning': return '⚠';
    case 'error': return '⨯';
    default: return 'ℹ';
  }
}



