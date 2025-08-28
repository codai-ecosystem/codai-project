'use client';

import React from 'react';

export interface LocaleSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'inline' | 'compact';
  showFlag?: boolean;
  showLabel?: boolean;
  disabled?: boolean;
}

const LocaleSelector: React.FC<LocaleSelectorProps> = ({
  className = '',
  variant = 'dropdown', 
  showFlag = true,
  showLabel = true,
  disabled = false
}) => {
  return (
    <div className={`locale-selector ${className}`}>
      <span>EN</span>
    </div>
  );
};

export default LocaleSelector;
