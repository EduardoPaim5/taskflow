import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative w-full ${sizeClasses[size]} glass-card p-0 animate-in fade-in zoom-in-95 duration-200 overflow-hidden`}
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(220, 240, 255, 0.85) 50%, rgba(200, 230, 255, 0.8) 100%)',
        }}
      >
        {/* Glossy top highlight */}
        <div className="absolute top-0 left-4 right-4 h-16 bg-gradient-to-b from-white/60 to-transparent rounded-t-3xl pointer-events-none z-10" />
        
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/40 relative z-20">
            <h2 className="text-xl font-bold" style={{ color: '#1a365d' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/50 transition-colors"
              style={{
                background: 'rgba(255, 255, 255, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
              }}
            >
              <X className="w-5 h-5" style={{ color: '#4a6fa5' }} />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="p-6 relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
