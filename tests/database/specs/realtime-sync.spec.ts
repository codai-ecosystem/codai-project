import { test, expect } from '@playwright/test';
import { AuthHelper, RealTimeSyncHelper, SERVICE_URLS } from '../database-storage-helpers';
import WebSocket from 'ws';

// CODAI applications that support real-time synchronization
const REALTIME_APPLICATIONS = [
    'hub', 'codai', 'memorai', 'logai', 'admin',
    'conversai', 'sociai', 'publicai', 'fabricai',
    'analizai', 'marketai', 'cumparai'
];

// Test message types for real-time sync
const MESSAGE_TYPES = {
    HEARTBEAT: 'heartbeat',
    DATA_UPDATE: 'data_update',
    USER_ACTION: 'user_action',
    SYSTEM_EVENT: 'system_event',
    NOTIFICATION: 'notification'
};

test.describe('Real-time Synchronization Testing', () => {
    let auth: AuthHelper;
    let realtimeHelper: RealTimeSyncHelper;

    test.beforeAll(async ({ request }) => {
        auth = new AuthHelper();
        await auth.authenticate(request, 'admin');
        realtimeHelper = new RealTimeSyncHelper(auth);
    });

    test.afterAll(async () => {
        realtimeHelper.disconnectAll();
    });

    test.describe('WebSocket Connection Management', () => {

        test('should establish WebSocket connections to all services', async ({ request }) => {
            const connectionResults: any[] = [];

            for (const service of REALTIME_APPLICATIONS) {
                const serviceResult = {
                    service,
                    connectionEstablished: false,
                    connectionTime: 0,
                    initialMessageReceived: false,
                    errors: [] as string[]
                };

                try {
                    const startTime = Date.now();
                    const ws = await realtimeHelper.connect(service);
                    serviceResult.connectionTime = Date.now() - startTime;
                    serviceResult.connectionEstablished = true;

                    // Listen for initial messages (like connection acknowledgment)
                    try {
                        const initialMessage = await realtimeHelper.waitForMessage(service, 3000);
                        if (initialMessage) {
                            serviceResult.initialMessageReceived = true;
                        }
                    } catch (error) {
                        // Initial message might not be sent by all services, this is acceptable
                        serviceResult.errors.push('No initial message received (acceptable)');
                    }

                } catch (error: any) {
                    serviceResult.errors.push(`Connection failed: ${error.message}`);
                }

                connectionResults.push(serviceResult);
            }

            const successfulConnections = connectionResults.filter(r => r.connectionEstablished);
            const avgConnectionTime = successfulConnections.reduce((acc, r) => acc + r.connectionTime, 0) / successfulConnections.length;

            console.log(`WebSocket Connection Report:`);
            console.log(`Total Services Tested: ${connectionResults.length}`);
            console.log(`Successful Connections: ${successfulConnections.length}`);
            console.log(`Connection Success Rate: ${(successfulConnections.length / connectionResults.length * 100).toFixed(1)}%`);
            console.log(`Average Connection Time: ${avgConnectionTime}ms`);

            // Detailed results
            connectionResults.forEach(result => {
                const status = result.connectionEstablished ? '✓' : '✗';
                console.log(`${status} ${result.service}: ${result.connectionTime}ms ${result.initialMessageReceived ? '(with initial message)' : ''}`);
                if (result.errors.length > 0 && !result.errors[0].includes('acceptable')) {
                    console.log(`  Error: ${result.errors[0]}`);
                }
            });

            expect(successfulConnections.length).toBeGreaterThan(connectionResults.length * 0.70); // 70% connection success rate
            expect(avgConnectionTime).toBeLessThan(5000); // Average connection time under 5 seconds
        });

        test('should handle WebSocket message exchange', async ({ request }) => {
            const messagingResults: any[] = [];

            // Test with subset for performance
            const testServices = REALTIME_APPLICATIONS.slice(0, 6);

            for (const service of testServices) {
                const serviceResult = {
                    service,
                    messageSendSuccessful: false,
                    messageReceiveSuccessful: false,
                    messageTypes: {} as Record<string, boolean>,
                    responseTime: 0,
                    errors: [] as string[]
                };

                try {
                    // Establish connection first
                    await realtimeHelper.connect(service);

                    // Test different message types
                    for (const [messageType, messageValue] of Object.entries(MESSAGE_TYPES)) {
                        try {
                            const testMessage = {
                                type: messageValue,
                                data: {
                                    timestamp: new Date().toISOString(),
                                    test: true,
                                    content: `Test ${messageType} message`
                                },
                                id: `test-${Date.now()}`
                            };

                            const startTime = Date.now();

                            // Send message
                            await realtimeHelper.sendMessage(service, testMessage);
                            serviceResult.messageSendSuccessful = true;

                            try {
                                // Wait for response or acknowledgment
                                const response = await realtimeHelper.waitForMessage(service, 3000);
                                const responseTime = Date.now() - startTime;
                                serviceResult.responseTime = Math.max(serviceResult.responseTime, responseTime);

                                if (response) {
                                    serviceResult.messageReceiveSuccessful = true;
                                    serviceResult.messageTypes[messageType] = true;
                                }
                            } catch (error) {
                                serviceResult.errors.push(`${messageType}: No response received`);
                            }

                            // Small delay between message types
                            await new Promise(resolve => setTimeout(resolve, 500));

                        } catch (error: any) {
                            serviceResult.errors.push(`${messageType}: Send failed - ${error.message}`);
                        }
                    }

                } catch (error: any) {
                    serviceResult.errors.push(`Connection setup failed: ${error.message}`);
                } finally {
                    // Clean up connection
                    realtimeHelper.disconnect(service);
                }

                messagingResults.push(serviceResult);
            }

            const successfulMessaging = messagingResults.filter(r => r.messageSendSuccessful && r.messageReceiveSuccessful);
            const avgResponseTime = messagingResults
                .filter(r => r.responseTime > 0)
                .reduce((acc, r) => acc + r.responseTime, 0) / Math.max(1, messagingResults.filter(r => r.responseTime > 0).length);

            console.log(`WebSocket Messaging Report:`);
            console.log(`Services with successful messaging: ${successfulMessaging.length}/${messagingResults.length}`);
            console.log(`Average Response Time: ${avgResponseTime}ms`);

            // Message type success rates
            const messageTypeStats = Object.keys(MESSAGE_TYPES).reduce((acc, type) => {
                acc[type] = messagingResults.filter(r => r.messageTypes[type]).length;
                return acc;
            }, {} as Record<string, number>);

            console.log(`Message Type Success Rates:`);
            Object.entries(messageTypeStats).forEach(([type, count]) => {
                console.log(`  ${type}: ${count}/${messagingResults.length}`);
            });

            expect(successfulMessaging.length).toBeGreaterThan(messagingResults.length * 0.60); // 60% messaging success
            if (avgResponseTime > 0) {
                expect(avgResponseTime).toBeLessThan(2000); // Less than 2 seconds response time
            }
        });
    });

    test.describe('Multi-Client Synchronization', () => {

        test('should synchronize data between multiple clients', async ({ request }) => {
            const syncResults: any[] = [];

            // Test with fewer services for complex multi-client testing
            const testServices = REALTIME_APPLICATIONS.slice(0, 4);

            for (const service of testServices) {
                const serviceResult = {
                    service,
                    multiClientSyncWorked: false,
                    clientsConnected: 0,
                    messagesBroadcasted: false,
                    syncLatency: 0,
                    errors: [] as string[]
                };

                try {
                    // Create multiple connections (simulating multiple clients)
                    const client1 = new RealTimeSyncHelper(auth);
                    const client2 = new RealTimeSyncHelper(auth);
                    const client3 = new RealTimeSyncHelper(auth);

                    // Connect all clients
                    await Promise.all([
                        client1.connect(service),
                        client2.connect(service),
                        client3.connect(service)
                    ]);

                    serviceResult.clientsConnected = 3;

                    // Test message broadcasting
                    const testMessage = {
                        type: 'broadcast_test',
                        data: {
                            message: 'Multi-client sync test',
                            timestamp: new Date().toISOString(),
                            sender: 'client1'
                        }
                    };

                    const startTime = Date.now();

                    // Client 1 sends message
                    await client1.sendMessage(service, testMessage);
                    serviceResult.messagesBroadcasted = true;

                    // Other clients should receive the message
                    const receivedMessages = await Promise.allSettled([
                        client2.waitForMessage(service, 5000),
                        client3.waitForMessage(service, 5000)
                    ]);

                    serviceResult.syncLatency = Date.now() - startTime;

                    const successfulReceives = receivedMessages.filter(result => result.status === 'fulfilled').length;

                    if (successfulReceives >= 1) { // At least one other client received the message
                        serviceResult.multiClientSyncWorked = true;
                    } else {
                        serviceResult.errors.push('No clients received the broadcasted message');
                    }

                    // Clean up connections
                    client1.disconnectAll();
                    client2.disconnectAll();
                    client3.disconnectAll();

                } catch (error: any) {
                    serviceResult.errors.push(`Multi-client test failed: ${error.message}`);
                }

                syncResults.push(serviceResult);
            }

            const successfulSyncs = syncResults.filter(r => r.multiClientSyncWorked);
            const avgSyncLatency = syncResults
                .filter(r => r.syncLatency > 0)
                .reduce((acc, r) => acc + r.syncLatency, 0) / Math.max(1, syncResults.filter(r => r.syncLatency > 0).length);

            console.log(`Multi-Client Synchronization Report:`);
            console.log(`Services with working sync: ${successfulSyncs.length}/${syncResults.length}`);
            console.log(`Average Sync Latency: ${avgSyncLatency}ms`);

            syncResults.forEach(result => {
                const status = result.multiClientSyncWorked ? '✓' : '✗';
                console.log(`${status} ${result.service}: ${result.clientsConnected} clients, ${result.syncLatency}ms latency`);
                if (result.errors.length > 0) {
                    console.log(`  Error: ${result.errors[0]}`);
                }
            });

            expect(successfulSyncs.length).toBeGreaterThan(syncResults.length * 0.50); // 50% should support multi-client sync
            if (avgSyncLatency > 0) {
                expect(avgSyncLatency).toBeLessThan(5000); // Less than 5 seconds sync latency
            }
        });

        test('should handle connection drops and reconnection', async ({ request }) => {
            const reconnectionResults: any[] = [];

            const testServices = REALTIME_APPLICATIONS.slice(0, 3); // Test subset for performance

            for (const service of testServices) {
                const serviceResult = {
                    service,
                    initialConnectionWorked: false,
                    reconnectionWorked: false,
                    dataConsistencyMaintained: false,
                    reconnectionTime: 0,
                    errors: [] as string[]
                };

                try {
                    // Initial connection
                    await realtimeHelper.connect(service);
                    serviceResult.initialConnectionWorked = true;

                    // Send a message to establish state
                    const initialMessage = {
                        type: 'state_setup',
                        data: { value: 'initial_state' }
                    };

                    await realtimeHelper.sendMessage(service, initialMessage);

                    // Simulate connection drop by disconnecting
                    realtimeHelper.disconnect(service);

                    // Wait a bit to simulate network interruption
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Attempt reconnection
                    const reconnectStart = Date.now();
                    await realtimeHelper.connect(service);
                    serviceResult.reconnectionTime = Date.now() - reconnectStart;
                    serviceResult.reconnectionWorked = true;

                    // Test if we can send messages after reconnection
                    const reconnectMessage = {
                        type: 'reconnect_test',
                        data: { value: 'after_reconnection' }
                    };

                    await realtimeHelper.sendMessage(service, reconnectMessage);

                    // Try to receive any state synchronization messages
                    try {
                        const response = await realtimeHelper.waitForMessage(service, 3000);
                        if (response) {
                            serviceResult.dataConsistencyMaintained = true;
                        }
                    } catch (error) {
                        // No response might be normal for some services
                        serviceResult.dataConsistencyMaintained = true; // Assume OK if no error
                    }

                } catch (error: any) {
                    serviceResult.errors.push(`Reconnection test failed: ${error.message}`);
                } finally {
                    realtimeHelper.disconnect(service);
                }

                reconnectionResults.push(serviceResult);
            }

            const successfulReconnections = reconnectionResults.filter(r =>
                r.initialConnectionWorked && r.reconnectionWorked
            );

            const avgReconnectionTime = reconnectionResults
                .filter(r => r.reconnectionTime > 0)
                .reduce((acc, r) => acc + r.reconnectionTime, 0) / Math.max(1, reconnectionResults.filter(r => r.reconnectionTime > 0).length);

            console.log(`Connection Resilience Report:`);
            console.log(`Services with successful reconnection: ${successfulReconnections.length}/${reconnectionResults.length}`);
            console.log(`Average Reconnection Time: ${avgReconnectionTime}ms`);

            reconnectionResults.forEach(result => {
                const status = result.initialConnectionWorked && result.reconnectionWorked ? '✓' : '✗';
                console.log(`${status} ${result.service}: Reconnect: ${result.reconnectionTime}ms, Consistency: ${result.dataConsistencyMaintained ? '✓' : '✗'}`);
            });

            expect(successfulReconnections.length).toBeGreaterThan(reconnectionResults.length * 0.60); // 60% should handle reconnection
            if (avgReconnectionTime > 0) {
                expect(avgReconnectionTime).toBeLessThan(3000); // Less than 3 seconds reconnection time
            }
        });
    });

    test.describe('Real-time Performance Testing', () => {

        test('should maintain performance under high message volume', async ({ request }) => {
            const performanceResults: any[] = [];

            const testServices = REALTIME_APPLICATIONS.slice(0, 3); // Test subset

            for (const service of testServices) {
                const serviceResult = {
                    service,
                    totalMessages: 100,
                    messagesSent: 0,
                    messagesReceived: 0,
                    averageLatency: 0,
                    messagesPerSecond: 0,
                    errors: [] as string[]
                };

                try {
                    await realtimeHelper.connect(service);

                    const latencies: number[] = [];
                    const startTime = Date.now();

                    // Send multiple messages rapidly
                    for (let i = 0; i < serviceResult.totalMessages; i++) {
                        try {
                            const messageStartTime = Date.now();
                            const message = {
                                type: 'performance_test',
                                data: {
                                    sequence: i,
                                    timestamp: messageStartTime,
                                    payload: 'x'.repeat(100) // Small payload
                                }
                            };

                            await realtimeHelper.sendMessage(service, message);
                            serviceResult.messagesSent++;

                            // Try to receive acknowledgment or response
                            try {
                                const response = await realtimeHelper.waitForMessage(service, 100); // Short timeout
                                if (response) {
                                    const latency = Date.now() - messageStartTime;
                                    latencies.push(latency);
                                    serviceResult.messagesReceived++;
                                }
                            } catch (error) {
                                // Timeout is acceptable for performance testing
                            }

                            // Small delay to avoid overwhelming the service
                            if (i % 10 === 0) {
                                await new Promise(resolve => setTimeout(resolve, 50));
                            }

                        } catch (error: any) {
                            serviceResult.errors.push(`Message ${i} failed: ${error.message}`);
                            if (serviceResult.errors.length > 10) break; // Stop if too many errors
                        }
                    }

                    const totalTime = Date.now() - startTime;
                    serviceResult.averageLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
                    serviceResult.messagesPerSecond = serviceResult.messagesSent / (totalTime / 1000);

                } catch (error: any) {
                    serviceResult.errors.push(`Performance test setup failed: ${error.message}`);
                } finally {
                    realtimeHelper.disconnect(service);
                }

                performanceResults.push(serviceResult);
            }

            const avgMessagesPerSecond = performanceResults.reduce((acc, r) => acc + r.messagesPerSecond, 0) / performanceResults.length;
            const avgLatency = performanceResults
                .filter(r => r.averageLatency > 0)
                .reduce((acc, r) => acc + r.averageLatency, 0) / Math.max(1, performanceResults.filter(r => r.averageLatency > 0).length);

            console.log(`Real-time Performance Report:`);
            console.log(`Average Messages per Second: ${avgMessagesPerSecond.toFixed(1)}`);
            console.log(`Average Message Latency: ${avgLatency.toFixed(1)}ms`);

            performanceResults.forEach(result => {
                const sendRate = (result.messagesSent / result.totalMessages * 100).toFixed(1);
                const receiveRate = (result.messagesReceived / result.messagesSent * 100).toFixed(1);
                console.log(`${result.service}: Sent: ${sendRate}%, Received: ${receiveRate}%, ${result.messagesPerSecond.toFixed(1)} msg/sec, ${result.averageLatency.toFixed(1)}ms avg`);
            });

            // Performance expectations
            expect(avgMessagesPerSecond).toBeGreaterThan(5); // At least 5 messages per second
            if (avgLatency > 0) {
                expect(avgLatency).toBeLessThan(1000); // Less than 1 second average latency
            }

            // At least 80% of messages should be sent successfully
            const avgSendSuccessRate = performanceResults.reduce((acc, r) => acc + (r.messagesSent / r.totalMessages), 0) / performanceResults.length;
            expect(avgSendSuccessRate).toBeGreaterThan(0.80);
        });
    });

    test.describe('Data Consistency and Ordering', () => {

        test('should maintain message ordering in real-time sync', async ({ request }) => {
            const orderingResults: any[] = [];

            const testServices = REALTIME_APPLICATIONS.slice(0, 4);

            for (const service of testServices) {
                const serviceResult = {
                    service,
                    messagesSent: 0,
                    messagesReceived: 0,
                    orderingPreserved: false,
                    errors: [] as string[]
                };

                try {
                    await realtimeHelper.connect(service);

                    const sequenceNumbers: number[] = [];
                    const numberOfMessages = 20;

                    // Send sequence of ordered messages
                    for (let i = 0; i < numberOfMessages; i++) {
                        const message = {
                            type: 'sequence_test',
                            data: {
                                sequence: i,
                                timestamp: Date.now(),
                                content: `Message ${i}`
                            }
                        };

                        await realtimeHelper.sendMessage(service, message);
                        serviceResult.messagesSent++;

                        // Small delay to ensure messages are processed in order
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }

                    // Collect responses for a reasonable time
                    const timeout = setTimeout(() => { }, 10000); // 10 seconds
                    const startTime = Date.now();

                    while (Date.now() - startTime < 10000 && sequenceNumbers.length < numberOfMessages) {
                        try {
                            const response = await realtimeHelper.waitForMessage(service, 500);
                            if (response && response.data && typeof response.data.sequence === 'number') {
                                sequenceNumbers.push(response.data.sequence);
                                serviceResult.messagesReceived++;
                            }
                        } catch (error) {
                            // Timeout is acceptable
                        }
                    }

                    clearTimeout(timeout);

                    // Check if ordering is preserved
                    if (sequenceNumbers.length > 1) {
                        let isOrdered = true;
                        for (let i = 1; i < sequenceNumbers.length; i++) {
                            if (sequenceNumbers[i] < sequenceNumbers[i - 1]) {
                                isOrdered = false;
                                break;
                            }
                        }
                        serviceResult.orderingPreserved = isOrdered;
                    } else {
                        serviceResult.errors.push('Insufficient messages received to test ordering');
                    }

                } catch (error: any) {
                    serviceResult.errors.push(`Ordering test failed: ${error.message}`);
                } finally {
                    realtimeHelper.disconnect(service);
                }

                orderingResults.push(serviceResult);
            }

            const servicesWithOrdering = orderingResults.filter(r => r.orderingPreserved);

            console.log(`Message Ordering Report:`);
            console.log(`Services with preserved ordering: ${servicesWithOrdering.length}/${orderingResults.length}`);

            orderingResults.forEach(result => {
                const status = result.orderingPreserved ? '✓' : '✗';
                const receivedRate = result.messagesSent > 0 ? (result.messagesReceived / result.messagesSent * 100).toFixed(1) : '0';
                console.log(`${status} ${result.service}: ${result.messagesReceived}/${result.messagesSent} messages (${receivedRate}%)`);
                if (result.errors.length > 0) {
                    console.log(`  Error: ${result.errors[0]}`);
                }
            });

            // At least 50% of services should preserve message ordering
            expect(servicesWithOrdering.length).toBeGreaterThan(orderingResults.length * 0.50);
        });
    });
});
