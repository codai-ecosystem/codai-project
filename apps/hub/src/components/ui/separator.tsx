import React from 'react';

export const Separator = ({ className = '', orientation = 'horizontal', ...props }: any) => (
  <div
    className={`${orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full'} bg-gray-200 ${className}`}
    {...props}
  />
);