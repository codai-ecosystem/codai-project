import * as React from "react";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function toast(props: ToastProps) {
  // Simple toast implementation for demo purposes with SSR safety
  // In production, you'd want a proper toast library like react-hot-toast or sonner
  console.log('Toast:', props);

  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.warn('Toast not available in server environment');
    return;
  }

  // Create a simple toast notification
  const toastElement = document.createElement('div');
  toastElement.className = `fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-sm ${props.variant === 'destructive'
    ? 'bg-red-600 text-white'
    : 'bg-green-600 text-white'
    }`;

  toastElement.innerHTML = `
    <div class="flex items-start space-x-2">
      <div class="flex-1">
        ${props.title ? `<div class="font-semibold">${props.title}</div>` : ''}
        ${props.description ? `<div class="text-sm opacity-90">${props.description}</div>` : ''}
      </div>
      <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
        ×
      </button>
    </div>
  `;

  document.body.appendChild(toastElement);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toastElement.parentNode) {
      toastElement.remove();
    }
  }, 5000);
}

export function useToast() {
  return { toast };
}
