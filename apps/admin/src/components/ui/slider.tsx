import React from 'react';

export const Slider = ({ 
  value = [0], 
  onValueChange, 
  min = 0, 
  max = 100, 
  step = 1,
  className = '',
  ...props 
}: any) => (
  <input
    type="range"
    min={min}
    max={max}
    step={step}
    value={value[0]}
    onChange={(e) => onValueChange?.([parseInt(e.target.value)])}
    className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${className}`}
    {...props}
  />
);