"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ToastVariant = "success" | "error" | "info";

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  show: (message: string, opts?: { variant?: ToastVariant; duration?: number }) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // No-op fallback so hooks can be called outside the provider during SSR.
    return {
      show: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    } as ToastContextValue;
  }
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback(
    (
      message: string,
      opts: { variant?: ToastVariant; duration?: number } = {}
    ) => {
      const id = ++counter.current;
      const toast: Toast = {
        id,
        message,
        variant: opts.variant ?? "info",
        duration: opts.duration ?? 3800,
      };
      setToasts((t) => [...t, toast]);
      if (toast.duration > 0) {
        setTimeout(() => dismiss(id), toast.duration);
      }
    },
    [dismiss]
  );

  const value: ToastContextValue = {
    show,
    success: (m, d) => show(m, { variant: "success", duration: d }),
    error: (m, d) => show(m, { variant: "error", duration: d }),
    info: (m, d) => show(m, { variant: "info", duration: d }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  // CSS-driven progress bar tracks the auto-dismiss.
  const styles = variantStyles[toast.variant];
  return (
    <div
      role="status"
      className={`pointer-events-auto relative overflow-hidden rounded-xl border ${styles.border} ${styles.bg} shadow-2xl backdrop-blur-md animate-slideInRight`}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${styles.iconBg}`}>
          {styles.icon}
        </div>
        <div className="min-w-0 flex-1 pt-0.5 text-sm text-zinc-100">
          {toast.message}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="-mr-1 -mt-0.5 rounded-md p-1 text-muted hover:bg-white/5 hover:text-zinc-200"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      {toast.duration > 0 && (
        <div
          className={`absolute bottom-0 left-0 h-[2px] ${styles.bar}`}
          style={{
            animation: `toastBar ${toast.duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
}

const variantStyles: Record<
  ToastVariant,
  { border: string; bg: string; iconBg: string; bar: string; icon: ReactNode }
> = {
  success: {
    border: "border-brand-teal/30",
    bg: "bg-gradient-to-br from-brand-teal/10 to-bg-elevated/90",
    iconBg: "bg-brand-teal/20 text-brand-teal",
    bar: "bg-brand-teal",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  error: {
    border: "border-danger/30",
    bg: "bg-gradient-to-br from-danger/10 to-bg-elevated/90",
    iconBg: "bg-danger/20 text-danger",
    bar: "bg-danger",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
  info: {
    border: "border-brand-purple/30",
    bg: "bg-gradient-to-br from-brand-purple/10 to-bg-elevated/90",
    iconBg: "bg-brand-purple/20 text-brand-purple",
    bar: "bg-brand-purple",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
};
