/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const success = useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message, duration: 7000 });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Toast Container Component
function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

// Toast Item Component
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const config = {
    success: {
      icon: CheckCircle2,
      gradient: 'linear-gradient(135deg, rgba(129, 199, 132, 0.95) 0%, rgba(56, 142, 60, 0.95) 100%)',
      iconColor: '#fff',
    },
    error: {
      icon: AlertCircle,
      gradient: 'linear-gradient(135deg, rgba(239, 83, 80, 0.95) 0%, rgba(211, 47, 47, 0.95) 100%)',
      iconColor: '#fff',
    },
    warning: {
      icon: AlertTriangle,
      gradient: 'linear-gradient(135deg, rgba(255, 213, 79, 0.95) 0%, rgba(255, 152, 0, 0.95) 100%)',
      iconColor: '#fff',
    },
    info: {
      icon: Info,
      gradient: 'linear-gradient(135deg, rgba(79, 195, 247, 0.95) 0%, rgba(2, 136, 209, 0.95) 100%)',
      iconColor: '#fff',
    },
  };

  const { icon: Icon, gradient, iconColor } = config[toast.type];

  return (
    <div
      className="rounded-xl p-4 shadow-lg backdrop-blur-sm animate-slide-in flex items-start gap-3"
      style={{
        background: gradient,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: iconColor }} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white">{toast.title}</p>
        {toast.message && (
          <p className="text-sm text-white/90 mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}
