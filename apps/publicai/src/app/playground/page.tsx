import React from 'react';
import AIPlayground from '@/../../components/AIPlayground';

export default function PlaygroundPage() {
  const userId = 'demo-user-123'; // In a real app, this would come from auth

  return (
    <div>
      <AIPlayground userId={userId} />
    </div>
  );
}
