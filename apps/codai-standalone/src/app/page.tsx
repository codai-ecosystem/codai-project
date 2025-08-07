import React from 'react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <main style={{
        textAlign: 'center',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '3rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '800px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          CODAI Platform
        </h1>

        <p style={{
          fontSize: '1.25rem',
          color: '#64748b',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          AI-Powered Development Platform with Integrated Services
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <Link href="/api/health" style={{
            display: 'block',
            padding: '1rem',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#475569',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s'
          }}>
            <strong>Health Check</strong>
            <br />
            <span style={{ fontSize: '0.875rem' }}>System Status</span>
          </Link>

          <Link href="/api/projects" style={{
            display: 'block',
            padding: '1rem',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#475569',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s'
          }}>
            <strong>Projects API</strong>
            <br />
            <span style={{ fontSize: '0.875rem' }}>Manage Projects</span>
          </Link>

          <Link href="/api/agents" style={{
            display: 'block',
            padding: '1rem',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#475569',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s'
          }}>
            <strong>AI Agents</strong>
            <br />
            <span style={{ fontSize: '0.875rem' }}>Agent Management</span>
          </Link>

          <Link href="/api/collaboration" style={{
            display: 'block',
            padding: '1rem',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#475569',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s'
          }}>
            <strong>Collaboration</strong>
            <br />
            <span style={{ fontSize: '0.875rem' }}>Team Tools</span>
          </Link>
        </div>

        <div style={{
          padding: '1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ marginTop: 0, color: '#374151' }}>Platform Features</h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.5rem',
            textAlign: 'left'
          }}>
            <li>✨ AI-Powered Development</li>
            <li>🚀 Automated Deployments</li>
            <li>🤝 Team Collaboration</li>
            <li>📊 Analytics & Insights</li>
            <li>🔒 Enterprise Security</li>
            <li>🌐 Multi-Cloud Support</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

