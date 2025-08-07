import React from 'react'
"use client";

export default function SignUp() {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
        }}>
            <div style={{
                maxWidth: '400px',
                width: '100%',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                padding: '32px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#111827',
                        marginBottom: '8px'
                    }}>
                        📝 Sign Up
                    </h1>
                    <p style={{
                        color: '#6b7280',
                        marginBottom: '32px'
                    }}>
                        Create your CODAI account
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <input
                            type="text"
                            placeholder="Full Name"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />

                        <button style={{
                            width: '100%',
                            padding: '12px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}>
                            Create Account
                        </button>
                    </div>

                    <div style={{
                        marginTop: '24px',
                        paddingTop: '24px',
                        borderTop: '1px solid #e5e7eb'
                    }}>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                            Phase 1 Implementation - Registration Ready
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

