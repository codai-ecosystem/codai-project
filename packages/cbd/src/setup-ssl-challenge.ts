/**
 * Add Let's Encrypt ACME Challenge to CBD Universal Database
 * This script adds the specific challenge token needed for SSL certificate validation
 */

import { CBDUniversalServiceSimple } from './CBDUniversalService.js';

// Challenge details from Let's Encrypt
const CHALLENGE_TOKEN = '1f1sScbQuBJBH47FNJzp9mGz7U27ZecznuyoQWAUkUQ';
const CHALLENGE_RESPONSE = '1f1sScbQuBJBH47FNJzp9mGz7U27ZecznuyoQWAUkUQ.uup0Q8uNsfMv97K8WFaC0ubO7nRMrn8YvocDBW8JxPM';

async function setupSSLChallenge() {
    console.log('🔐 Setting up Let\'s Encrypt SSL Challenge...');

    try {
        // Create CBD service instance
        const service = new CBDUniversalServiceSimple();

        // Add the challenge to the ACME handler
        (service as any).acmeHandler.addChallenge(CHALLENGE_TOKEN, CHALLENGE_RESPONSE);

        console.log('✅ Challenge added successfully!');
        console.log(`📍 Challenge URL: http://cbd.memorai.ro/.well-known/acme-challenge/${CHALLENGE_TOKEN}`);
        console.log(`📋 Response: ${CHALLENGE_RESPONSE.substring(0, 50)}...`);

        // Initialize and start the service
        const app = await service.initialize();
        const port = process.env.PORT || 4180;

        const server = app.listen(port, () => {
            console.log(`🚀 CBD Universal Database with SSL Challenge running on port ${port}`);
            console.log(`🔗 Test challenge: curl http://localhost:${port}/.well-known/acme-challenge/${CHALLENGE_TOKEN}`);
            console.log('🎯 Ready for Let\'s Encrypt validation!');
        });

        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down CBD service...');
            server.close(() => {
                console.log('✅ CBD service stopped.');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('❌ Failed to setup SSL challenge:', error);
        process.exit(1);
    }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    setupSSLChallenge();
}
