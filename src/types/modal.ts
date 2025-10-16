// types/modal.ts
import { ComponentType } from 'react';

export interface ModalConfig {
  id: string;
  component: ComponentType<any>;
  props?: Record<string, any>;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  animation?: 'fade' | 'slideUp' | 'slideDown' | 'scale';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  persistent?: boolean;
  onClose?: () => void;
}

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalAnimation = 'fade' | 'slideUp' | 'slideDown' | 'scale';