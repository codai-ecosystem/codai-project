import React from 'react';
import { IconProps } from '@/types';

const PlaybackSpeedIcon: React.FC<IconProps> = ({
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
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 10"></polyline>
    </svg>
  );
};

export default PlaybackSpeedIcon;
