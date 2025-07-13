'use client';

import React from 'react';

export default function Dashboard() {
  const metrics = {
    users: 1250,
    growth: 12.5,
    revenue: 45000,
    satisfaction: 4.8
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Stocai Dashboard</h1>
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-4 rounded shadow">
          <h3>Users</h3>
          <p className="text-2xl">{metrics.users}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3>Growth</h3>
          <p className="text-2xl">{metrics.growth}%</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3>Revenue</h3>
          <p className="text-2xl">${metrics.revenue}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3>Rating</h3>
          <p className="text-2xl">{metrics.satisfaction}/5</p>
        </div>
      </div>
    </div>
  );
}