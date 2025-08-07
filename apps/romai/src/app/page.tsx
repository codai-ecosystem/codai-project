'use client';

import React from 'react';
import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to dashboard for consistent navigation
  redirect('/dashboard');
}

