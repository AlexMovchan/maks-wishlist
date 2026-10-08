import { useCallback, useEffect, useState } from 'react';

export type ToastKind = 'ok' | 'error';
export type ToastState = { message: string; kind: ToastKind };
export type Notify = (message: string, kind?: ToastKind) => void;

const DURATION: Record<ToastKind, number> = { ok: 3500, error: 6000 };

export const useToast = () => {
  const [toast, setToast] = useState<ToastState | null>(null);

  const notify = useCallback<Notify>((message, kind = 'ok') => setToast({ message, kind }), []);
  const dismiss = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(dismiss, DURATION[toast.kind]);

    return () => clearTimeout(timer);
  }, [toast, dismiss]);

  return { toast, notify, dismiss };
};
