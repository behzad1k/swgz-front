import { Check, X, AlertCircle, Info } from 'lucide-react';
import { FC, useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: FC<ToastProps> = ({ message, type = 'info', isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: <Check size={20} />,
    error: <X size={20} />,
    warning: <AlertCircle size={20} />,
    info: <Info size={20} />,
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-up">
      <div className={`${colors[type]} text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px]`}>
        {icons[type]}
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="hover:opacity-80 transition-opacity">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast;