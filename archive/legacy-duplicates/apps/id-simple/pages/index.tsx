import React from 'react'
import { useState, useEffect } from 'react'
import Head from 'next/head'

interface User {
  id: string
  email: string
  name?: string
  role: string
  createdAt: string
  lastLogin?: string
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([])
  const [token, setToken] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchUsers = async () => {
    if (!token) {
      setResponse('Please provide an authorization token')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      setResponse(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserDetails = async () => {
    if (!selectedUserId) {
      setResponse('Please select a user ID')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/users/${selectedUserId}`)
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setResponse(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    if (!token) {
      setResponse('Please provide an authorization token')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/roles', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setResponse(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>CODAI ID Service</title>
        <meta name="description" content="CODAI Identity Management Service - id.codai.ro" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>🆔 CODAI ID Service</h1>
        <p>Identity and user management service for id.codai.ro</p>

        <div style={{ marginBottom: '20px' }}>
          <h3>Authorization</h3>
          <input
            type="text"
            placeholder="Enter auth token (get from auth.codai.ro)"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            style={{ padding: '8px', width: '400px', marginRight: '10px' }}
          />
          <small style={{ color: '#666' }}>
            Use token from auth service (codai_xxxxx format)
          </small>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>User Management</h3>
          <div style={{ marginBottom: '10px' }}>
            <button
              onClick={fetchUsers}
              disabled={loading}
              style={{ padding: '8px 16px', marginRight: '10px' }}
            >
              {loading ? 'Loading...' : 'Get All Users'}
            </button>
            <button
              onClick={fetchRoles}
              disabled={loading}
              style={{ padding: '8px 16px' }}
            >
              {loading ? 'Loading...' : 'Get Roles'}
            </button>
          </div>
        </div>

        {users.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3>User Details</h3>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              style={{ padding: '8px', marginRight: '10px', width: '200px' }}
            >
              <option value="">Select a user</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email} ({user.role})
                </option>
              ))}
            </select>
            <button
              onClick={fetchUserDetails}
              disabled={loading || !selectedUserId}
              style={{ padding: '8px 16px' }}
            >
              {loading ? 'Loading...' : 'Get User Details'}
            </button>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <h3>API Endpoints</h3>
          <ul>
            <li><code>GET /api/users</code> - Get all users (requires auth)</li>
            <li><code>GET /api/users/[userId]</code> - Get user by ID</li>
            <li><code>PUT /api/users/[userId]</code> - Update user</li>
            <li><code>DELETE /api/users/[userId]</code> - Delete user</li>
            <li><code>GET /api/roles</code> - Get all roles (requires auth)</li>
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
              overflow: 'auto',
              maxHeight: '400px'
            }}>
              {response}
            </pre>
          </div>
        )}

        <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
          <p>🚀 Status: Active | Version: 1.0.0 | Environment: Production</p>
          <p>User management for CODAI ecosystem</p>
        </div>
      </div>
    </>
  )
}

