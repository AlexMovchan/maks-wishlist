import type { ToastState } from '../../hooks/useToast';

type Props = { toast: ToastState | null; onClose: () => void };

export const Toast = ({ toast, onClose }: Props) =>
  toast && (
    <div className={`toast toast--${toast.kind}`} role="status" onClick={onClose}>
      {toast.message}
    </div>
  );
