import React from 'react';
import { IconProps } from '@/types';

const SearchIcon: React.FC<IconProps> = ({
  className = 'w-5 h-5',
  size,
  color = 'currentColor',
}) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      fill="none"
      stroke={color}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
};

export default SearchIcon;
