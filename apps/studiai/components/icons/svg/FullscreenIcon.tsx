import React from 'react';
import { IconProps } from '@/types';

const FullscreenIcon: React.FC<IconProps> = ({
  className = 'w-5 h-5',
  size,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || '20'}
      height={size || '20'}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
      <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
      <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
      <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
    </svg>
  );
};

export default FullscreenIcon;
