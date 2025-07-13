import * as React from 'react';

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Custom properties
    css?: any;
  }
}

// Common component prop types
export interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
  id?: string;
}

export interface ButtonProps extends ComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface InputProps extends ComponentProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
}

export interface ModalProps extends ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export interface FormProps extends ComponentProps {
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}

export type PropsWithChildren<P = {}> = P & { children?: React.ReactNode };