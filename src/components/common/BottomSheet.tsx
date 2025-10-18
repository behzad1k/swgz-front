import { X } from '@/assets/svg';
import { getAltFromPath } from '@utils/helpers.ts';
import { FC, ReactNode } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

const BottomSheet: FC<BottomSheetProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-900 rounded-t-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center py-3">
          <div className="w-12 h-1 bg-gray-600 rounded-full" />
        </div>
        {title && (
          <div className="px-6 pb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <img src={X} alt={getAltFromPath(X)} width={24} />
            </button>
          </div>
        )}
        <div className="px-6 pb-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;