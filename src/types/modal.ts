
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalAnimation = 'fade' | 'slideUp' | 'slideDown' | 'scale';

export interface ModalConfig {
  id: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  size?: ModalSize;
  animation?: ModalAnimation;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  persistent?: boolean; // Won't close on overlay click or escape
  onClose?: () => void;
}

export type ModalAction =
  | { type: 'OPEN_MODAL'; payload: ModalConfig }
  | { type: 'CLOSE_MODAL'; payload: string }
  | { type: 'CLOSE_ALL_MODALS' }
  | { type: 'CLOSE_TOP_MODAL' }
  | { type: 'UPDATE_MODAL'; payload: { id: string; props: Record<string, any> } };

