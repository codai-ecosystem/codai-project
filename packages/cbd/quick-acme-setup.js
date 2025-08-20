#!/usr/bin/env tsx

/**  
 * Quick ACME Challenge Setup for Let's Encrypt
 * This script adds the challenge to the running ECS service via API
 */

const CHALLENGE_TOKEN = '1f1sScbQuBJBH47FNJzp9mGz7U27ZecznuyoQWAUkUQ';
const CHALLENGE_RESPONSE = '1f1sScbQuBJBH47FNJzp9mGz7U27ZecznuyoQWAUkUQ.uup0Q8uNsfMv97K8WFaC0ubO7nRMrn8YvocDBW8JxPM';

async function setupChallengeViaAPI() {
    console.log('🔐 Setting up ACME Challenge via API...');

    try {
        // Test if the CBD service is running
        const healthResponse = await fetch('http://cbd.memorai.ro/health');
        if (!healthResponse.ok) {
            throw new Error('CBD service not accessible');
        }

        console.log('✅ CBD service is accessible at cbd.memorai.ro');

        // Create a simple HTTP server to serve the challenge
        const express = require('express');
        const app = express();

        // Add CORS headers
        app.use((req: any, res: any, next: any) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            next();
        });

        // Add the specific ACME challenge
        app.get(`/.well-known/acme-challenge/${CHALLENGE_TOKEN}`, (req: any, res: any) => {
            console.log(`✅ ACME Challenge served: ${CHALLENGE_TOKEN}`);
            res.type('text/plain').send(CHALLENGE_RESPONSE);
        });

        // Start server on different port to proxy through ALB
        const port = 4181;
        app.listen(port, () => {
            console.log(`🚀 ACME Challenge server running on port ${port}`);
            console.log(`🔗 Challenge URL: http://localhost:${port}/.well-known/acme-challenge/${CHALLENGE_TOKEN}`);
            console.log(`🌐 Public URL: http://cbd.memorai.ro/.well-known/acme-challenge/${CHALLENGE_TOKEN}`);
            console.log('🎯 Ready for Let\'s Encrypt validation!');
            console.log('Press Ctrl+C to stop when certificate is generated');
        });

    } catch (error) {
        console.error('❌ Failed to setup challenge:', error);
        process.exit(1);
    }
}

setupChallengeViaAPI();
