import React from 'react'
export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>CODAI Hub Service</h1>
      <p>Hub API service is running.</p>
      <h2>Available Endpoints:</h2>
      <ul>
        <li><a href="/api/health">/api/health</a> - Service health check</li>
        <li><a href="/api/services">/api/services</a> - Services status</li>
        <li><a href="/api/status">/api/status</a> - System status</li>
      </ul>
    </div>
  )
}

