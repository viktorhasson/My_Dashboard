"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { X } from "lucide-react";

type ToastAction = { label: string; onClick: () => void };
type Toast = { id: number; message: string; action?: ToastAction };

const ToastContext = createContext<((message: string, action?: ToastAction) => void) | null>(
  null
);

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("useToast must be used within <Toaster>");
  return toast;
}

const TOAST_DURATION_MS = 5000;

export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, action?: ToastAction) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, action }]);
      setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-md bg-neutral-900 px-4 py-2.5 text-sm text-white shadow-lg dark:bg-white dark:text-neutral-900"
          >
            <span>{item.message}</span>
            {item.action && (
              <button
                onClick={() => {
                  item.action?.onClick();
                  dismiss(item.id);
                }}
                className="font-semibold underline underline-offset-4"
              >
                {item.action.label}
              </button>
            )}
            <button onClick={() => dismiss(item.id)} aria-label="Dismiss" className="opacity-70 hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
