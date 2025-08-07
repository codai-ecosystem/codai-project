import React from 'react'
// Simple progress component fallback
export function Progress({ value, className }: { value?: number; className?: string }) {
  return (
    <div className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-200 ${className || ''}`}>
      <div
        className="h-full bg-blue-500 transition-all duration-300"
        style={{ width: `${value || 0}%` }}
      />
    </div>
  );
}

