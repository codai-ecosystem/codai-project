#!/usr/bin/env node

// CBD SSL Proxy Server - Production Ready
// Handles ACME challenges and proxies to CBD service

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

class CBDSSLProxy {
    constructor() {
        this.domain = 'cbd.memorai.ro';
        this.cbdPort = 4180;
        this.httpPort = 8080;  // Use 8080 for testing without admin privileges
        this.httpsPort = 8443; // Use 8443 for HTTPS testing
        this.certPath = process.platform === 'win32'
            ? `C:\\Certbot\\live\\${this.domain}`
            : `/etc/letsencrypt/live/${this.domain}`;
        this.challengePath = path.join(__dirname, 'ssl-challenges');

        this.app = express();
        this.setupMiddleware();
    }

    setupMiddleware() {
        // Trust proxy (for proper HTTPS detection)
        this.app.set('trust proxy', true);

        // ACME Challenge endpoint - CRITICAL for Let's Encrypt
        this.app.use('/.well-known/acme-challenge',
            express.static(path.join(this.challengePath, '.well-known', 'acme-challenge'))
        );

        // Health check for SSL proxy
        this.app.get('/ssl-proxy-health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'CBD SSL Proxy',
                domain: this.domain,
                timestamp: new Date().toISOString(),
                ssl: {
                    certificateExists: this.checkCertificateSync(),
                    challengePath: this.challengePath,
                    platform: process.platform
                },
                proxy: {
                    target: `http://localhost:${this.cbdPort}`,
                    httpPort: this.httpPort,
                    httpsPort: this.httpsPort
                }
            });
        });

        // Add manual challenge endpoint for testing
        this.app.get('/add-challenge/:token', (req, res) => {
            const token = req.params.token;
            const response = req.query.response;

            if (!token || !response) {
                return res.status(400).json({
                    error: 'Missing token or response parameter',
                    usage: '/add-challenge/{token}?response={response}'
                });
            }

            this.addManualChallenge(token, response)
                .then(() => {
                    res.json({
                        success: true,
                        message: 'Challenge added successfully',
                        token,
                        verifyUrl: `http://${this.domain}/.well-known/acme-challenge/${token}`
                    });
                })
                .catch(error => {
                    res.status(500).json({
                        error: 'Failed to add challenge',
                        details: error.message
                    });
                });
        });

        // Redirect HTTP to HTTPS (only when HTTPS is available)
        this.app.use((req, res, next) => {
            if (req.headers.host === this.domain && !req.secure && this.httpsServer) {
                return res.redirect(301, `https://${req.headers.host}${req.url}`);
            }
            next();
        });

        // Proxy all other requests to CBD service
        this.app.use('/', createProxyMiddleware({
            target: `http://localhost:${this.cbdPort}`,
            changeOrigin: true,
            timeout: 30000,
            proxyTimeout: 30000,
            onError: (err, req, res) => {
                console.error('❌ Proxy error:', err.message);
                if (!res.headersSent) {
                    res.status(502).json({
                        error: 'CBD service unavailable',
                        details: err.message,
                        target: `http://localhost:${this.cbdPort}`
                    });
                }
            },
            onProxyReq: (proxyReq, req, res) => {
                // Add forwarded headers
                proxyReq.setHeader('X-Forwarded-Proto', req.secure ? 'https' : 'http');
                proxyReq.setHeader('X-Forwarded-Host', req.headers.host);
            }
        }));
    }

    async ensureDirectories() {
        const challengeDir = path.join(this.challengePath, '.well-known', 'acme-challenge');
        await fs.mkdir(challengeDir, { recursive: true });
        console.log('📁 Challenge directory created:', challengeDir);
    }

    checkCertificateSync() {
        try {
            const fs = require('fs');
            const fullchainExists = fs.existsSync(path.join(this.certPath, 'fullchain.pem'));
            const privkeyExists = fs.existsSync(path.join(this.certPath, 'privkey.pem'));
            return fullchainExists && privkeyExists;
        } catch {
            return false;
        }
    }

    async checkCertificate() {
        try {
            await fs.access(path.join(this.certPath, 'fullchain.pem'));
            await fs.access(path.join(this.certPath, 'privkey.pem'));
            return true;
        } catch {
            return false;
        }
    }

    async addManualChallenge(token, response) {
        const challengeDir = path.join(this.challengePath, '.well-known', 'acme-challenge');
        await fs.mkdir(challengeDir, { recursive: true });

        const challengeFile = path.join(challengeDir, token);
        await fs.writeFile(challengeFile, response, 'utf8');

        console.log('✅ ACME challenge added:');
        console.log(`   Token: ${token}`);
        console.log(`   File: ${challengeFile}`);
        console.log(`   Verify: http://${this.domain}/.well-known/acme-challenge/${token}`);
    }

    async startHTTP() {
        return new Promise((resolve, reject) => {
            this.httpServer = http.createServer(this.app);

            this.httpServer.listen(this.httpPort, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(`🌐 HTTP server running on port ${this.httpPort}`);
                    console.log(`🔗 HTTP access: http://${this.domain}`);
                    console.log(`📁 ACME challenges: ${this.challengePath}`);
                    resolve();
                }
            });
        });
    }

    async startHTTPS() {
        if (!await this.checkCertificate()) {
            console.log('⚠️ SSL certificate not found, skipping HTTPS server');
            return false;
        }

        try {
            const privateKey = await fs.readFile(path.join(this.certPath, 'privkey.pem'), 'utf8');
            const certificate = await fs.readFile(path.join(this.certPath, 'fullchain.pem'), 'utf8');

            const credentials = { key: privateKey, cert: certificate };

            this.httpsServer = https.createServer(credentials, this.app);

            return new Promise((resolve, reject) => {
                this.httpsServer.listen(this.httpsPort, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log(`🔒 HTTPS server running on port ${this.httpsPort}`);
                        console.log(`🌐 Secure access: https://${this.domain}`);
                        resolve(true);
                    }
                });
            });
        } catch (error) {
            console.error('❌ Failed to start HTTPS server:', error.message);
            return false;
        }
    }

    async testCBDConnection() {
        return new Promise((resolve) => {
            const req = http.request({
                hostname: 'localhost',
                port: this.cbdPort,
                path: '/health',
                method: 'GET',
                timeout: 5000
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const health = JSON.parse(data);
                        console.log('✅ CBD service connection verified');
                        console.log(`   Service: ${health.service}`);
                        console.log(`   Version: ${health.version}`);
                        console.log(`   Status: ${health.status}`);
                        resolve(true);
                    } catch {
                        resolve(false);
                    }
                });
            });

            req.on('error', (err) => {
                console.error(`❌ CBD service not accessible: ${err.message}`);
                resolve(false);
            });

            req.on('timeout', () => {
                console.error('❌ CBD service connection timeout');
                req.destroy();
                resolve(false);
            });

            req.end();
        });
    }

    async start() {
        console.log('🚀 Starting CBD SSL Proxy...');
        console.log(`🎯 Domain: ${this.domain}`);
        console.log(`🔌 CBD Port: ${this.cbdPort}`);
        console.log(`📋 Platform: ${process.platform}`);

        // Create necessary directories
        await this.ensureDirectories();

        // Test CBD service connection
        const cbdConnected = await this.testCBDConnection();
        if (!cbdConnected) {
            console.error('❌ CBD service is not accessible. Please start the CBD service first.');
            console.log('💡 Use VS Code task: "Backend: Start CBD Database"');
            process.exit(1);
        }

        // Start HTTP server
        try {
            await this.startHTTP();
        } catch (error) {
            console.error('❌ Failed to start HTTP server:', error.message);
            if (error.code === 'EACCES') {
                console.log('💡 Try running as Administrator/root for port 80');
            } else if (error.code === 'EADDRINUSE') {
                console.log('💡 Port 80 is already in use by another service');
            }
            process.exit(1);
        }

        // Try to start HTTPS server (optional)
        const httpsStarted = await this.startHTTPS();

        console.log('🎉 CBD SSL Proxy is ready!');
        console.log('');
        console.log('📋 Available endpoints:');
        console.log(`   HTTP Health: http://${this.domain}/ssl-proxy-health`);
        console.log(`   CBD Health: http://${this.domain}/health`);
        console.log(`   ACME Test: http://${this.domain}/.well-known/acme-challenge/test`);
        if (httpsStarted) {
            console.log(`   HTTPS Health: https://${this.domain}/ssl-proxy-health`);
        }
        console.log('');
        console.log('🔧 Commands:');
        console.log('   Add challenge: GET /add-challenge/{token}?response={response}');
        console.log('   Check proxy: curl http://cbd.memorai.ro/ssl-proxy-health');
        console.log('   Check CBD: curl http://cbd.memorai.ro/health');
    }
}

// Start the proxy if called directly
if (require.main === module) {
    const proxy = new CBDSSLProxy();
    proxy.start().catch(error => {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = CBDSSLProxy;
