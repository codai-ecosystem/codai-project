import { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [response, setResponse] = useState('')

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
      if (data.success) {
        setToken(data.token)
      }
    } catch (error) {
      setResponse(`Error: ${error}`)
    }
  }

  const handleVerify = async () => {
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setResponse(`Error: ${error}`)
    }
  }

  const handleProfile = async () => {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setResponse(`Error: ${error}`)
    }
  }

  return (
    <>
      <Head>
        <title>CODAI Auth Service</title>
        <meta name="description" content="CODAI Authentication Service - auth.codai.ro" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>🔐 CODAI Auth Service</h1>
        <p>Simple authentication service for auth.codai.ro</p>

        <div style={{ marginBottom: '20px' }}>
          <h3>Test Authentication</h3>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="email"
              placeholder="Email (try: admin@codai.ro)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '8px', marginRight: '10px', width: '200px' }}
            />
            <input
              type="password"
              placeholder="Password (try: admin123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '8px', marginRight: '10px', width: '200px' }}
            />
            <button onClick={handleLogin} style={{ padding: '8px 16px' }}>
              Login
            </button>
          </div>
        </div>

        {token && (
          <div style={{ marginBottom: '20px' }}>
            <h3>Token Operations</h3>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                style={{ padding: '8px', marginRight: '10px', width: '300px' }}
              />
              <button onClick={handleVerify} style={{ padding: '8px 16px', marginRight: '10px' }}>
                Verify Token
              </button>
              <button onClick={handleProfile} style={{ padding: '8px 16px' }}>
                Get Profile
              </button>
            </div>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <h3>API Endpoints</h3>
          <ul>
            <li><code>POST /api/login</code> - User authentication</li>
            <li><code>POST /api/register</code> - User registration</li>
            <li><code>POST /api/verify</code> - Token verification</li>
            <li><code>POST /api/profile</code> - Get user profile</li>
            <li><code>POST /api/logout</code> - User logout</li>
            <li><code>GET /api/health</code> - Service health check</li>
          </ul>
        </div>

        {response && (
          <div style={{ marginTop: '20px' }}>
            <h3>Response</h3>
            <pre style={{
              background: '#f5f5f5',
              padding: '10px',
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {response}
            </pre>
          </div>
        )}

        <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
          <p>🚀 Status: Active | Version: 1.0.0 | Environment: Production</p>
          <p>Demo credentials: admin@codai.ro / admin123 or demo@codai.ro / demo123</p>
        </div>
      </div>
    </>
  )
}
