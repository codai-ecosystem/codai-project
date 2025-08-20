#!/usr/bin/env node

// CBD Let's Encrypt SSL Certificate Manager
// Independent SSL solution without cloud provider dependencies

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const https = require('https');
const http = require('http');

class CBDSSLManager {
    constructor() {
        this.domain = 'cbd.memorai.ro';
        this.certPath = '/etc/letsencrypt/live/cbd.memorai.ro';
        this.certbotPath = 'certbot'; // Adjust if needed
        this.webRoot = path.join(__dirname, 'ssl-challenges');
        this.app = express();
        this.httpServer = null;
        this.httpsServer = null;

        this.setupRoutes();
    }

    setupRoutes() {
        // Serve ACME challenges
        this.app.use('/.well-known/acme-challenge', express.static(this.webRoot + '/.well-known/acme-challenge'));

        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                ssl: {
                    certificateExists: this.certificateExists(),
                    domain: this.domain,
                    renewalDate: this.getCertificateExpiry()
                }
            });
        });

        // Redirect HTTP to HTTPS (when HTTPS is available)
        this.app.use((req, res, next) => {
            if (req.headers.host === this.domain && !req.secure && this.httpsServer) {
                return res.redirect(301, `https://${req.headers.host}${req.url}`);
            }
            next();
        });

        // Proxy to CBD service
        this.app.use('/', (req, res) => {
            const options = {
                hostname: 'localhost',
                port: 4180,
                path: req.url,
                method: req.method,
                headers: req.headers
            };

            const proxyReq = http.request(options, (proxyRes) => {
                res.writeHead(proxyRes.statusCode, proxyRes.headers);
                proxyRes.pipe(res, { end: true });
            });

            proxyReq.on('error', (err) => {
                console.error('Proxy error:', err.message);
                res.status(502).json({ error: 'CBD service unavailable' });
            });

            req.pipe(proxyReq, { end: true });
        });
    }

    async certificateExists() {
        try {
            await fs.access(path.join(this.certPath, 'fullchain.pem'));
            await fs.access(path.join(this.certPath, 'privkey.pem'));
            return true;
        } catch {
            return false;
        }
    }

    async getCertificateExpiry() {
        try {
            const cert = await fs.readFile(path.join(this.certPath, 'fullchain.pem'));
            // Simple parsing - in production, use a proper certificate parser
            const certData = cert.toString();
            const match = certData.match(/Not After : (.+)/);
            return match ? match[1] : 'Unknown';
        } catch {
            return 'No certificate';
        }
    }

    async requestCertificate() {
        console.log('🔒 Requesting SSL certificate from Let\'s Encrypt...');

        // Ensure web root exists
        await fs.mkdir(path.join(this.webRoot, '.well-known/acme-challenge'), { recursive: true });

        return new Promise((resolve, reject) => {
            const certbotArgs = [
                'certonly',
                '--webroot',
                '--webroot-path', this.webRoot,
                '--email', 'codaiecosystem@gmail.com',
                '--agree-tos',
                '--non-interactive',
                '--domain', this.domain,
                '--keep-until-expiring'
            ];

            console.log('📋 Running certbot with args:', certbotArgs.join(' '));

            const certbot = spawn(this.certbotPath, certbotArgs, {
                stdio: ['inherit', 'pipe', 'pipe']
            });

            let output = '';
            let error = '';

            certbot.stdout.on('data', (data) => {
                const message = data.toString();
                output += message;
                console.log('📜 Certbot:', message.trim());
            });

            certbot.stderr.on('data', (data) => {
                const message = data.toString();
                error += message;
                console.log('⚠️ Certbot error:', message.trim());
            });

            certbot.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ SSL certificate obtained successfully!');
                    resolve({ success: true, output });
                } else {
                    console.log('❌ SSL certificate request failed with code:', code);
                    reject({ success: false, code, output, error });
                }
            });
        });
    }

    async setupHTTPSServer() {
        if (!await this.certificateExists()) {
            console.log('⚠️ SSL certificate not found. Running HTTP only.');
            return false;
        }

        try {
            const privateKey = await fs.readFile(path.join(this.certPath, 'privkey.pem'), 'utf8');
            const certificate = await fs.readFile(path.join(this.certPath, 'fullchain.pem'), 'utf8');

            const credentials = { key: privateKey, cert: certificate };

            this.httpsServer = https.createServer(credentials, this.app);

            this.httpsServer.listen(443, () => {
                console.log('🔒 HTTPS server running on port 443');
                console.log(`🌐 Secure access: https://${this.domain}`);
            });

            return true;
        } catch (error) {
            console.error('❌ Failed to setup HTTPS server:', error.message);
            return false;
        }
    }

    async startHTTPServer() {
        this.httpServer = http.createServer(this.app);

        this.httpServer.listen(80, () => {
            console.log('🌐 HTTP server running on port 80');
            console.log(`🔗 HTTP access: http://${this.domain}`);
            console.log('📁 ACME challenge directory:', this.webRoot);
        });
    }

    async renewCertificate() {
        console.log('🔄 Renewing SSL certificate...');

        return new Promise((resolve, reject) => {
            const renewArgs = ['renew', '--quiet'];

            const certbot = spawn(this.certbotPath, renewArgs, {
                stdio: ['inherit', 'pipe', 'pipe']
            });

            certbot.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ SSL certificate renewed successfully!');
                    resolve(true);
                } else {
                    console.log('❌ SSL certificate renewal failed with code:', code);
                    reject(false);
                }
            });
        });
    }

    async start() {
        console.log('🚀 Starting CBD SSL Manager...');
        console.log(`🎯 Domain: ${this.domain}`);

        // Start HTTP server for ACME challenges
        await this.startHTTPServer();

        // Check if certificate exists
        if (await this.certificateExists()) {
            console.log('✅ SSL certificate found, setting up HTTPS...');
            await this.setupHTTPSServer();
        } else {
            console.log('⏳ No SSL certificate found. Request one with: npm run ssl:request');
        }

        // Setup automatic renewal (check every 12 hours)
        setInterval(async () => {
            try {
                await this.renewCertificate();
                // Restart HTTPS server with new certificate
                if (this.httpsServer) {
                    this.httpsServer.close();
                    await this.setupHTTPSServer();
                }
            } catch (error) {
                console.error('🔄 Auto-renewal failed:', error);
            }
        }, 12 * 60 * 60 * 1000); // 12 hours

        console.log('🎉 CBD SSL Manager is ready!');
        console.log('📋 Available commands:');
        console.log('  - Request certificate: npm run ssl:request');
        console.log('  - Renew certificate: npm run ssl:renew');
        console.log('  - Check status: curl http://cbd.memorai.ro/health');
    }

    async requestCertificateCommand() {
        try {
            await this.requestCertificate();
            console.log('🔄 Setting up HTTPS server...');
            await this.setupHTTPSServer();
            console.log('🎉 SSL setup complete!');
        } catch (error) {
            console.error('❌ SSL request failed:', error);
            process.exit(1);
        }
    }

    async renewCertificateCommand() {
        try {
            await this.renewCertificate();
            console.log('🎉 SSL renewal complete!');
        } catch (error) {
            console.error('❌ SSL renewal failed:', error);
            process.exit(1);
        }
    }
}

// CLI interface
if (require.main === module) {
    const sslManager = new CBDSSLManager();

    const command = process.argv[2];

    switch (command) {
        case 'start':
            sslManager.start();
            break;
        case 'request':
            sslManager.requestCertificateCommand();
            break;
        case 'renew':
            sslManager.renewCertificateCommand();
            break;
        default:
            console.log('🔒 CBD SSL Manager');
            console.log('Usage:');
            console.log('  node cbd-ssl-manager.js start   - Start SSL proxy server');
            console.log('  node cbd-ssl-manager.js request - Request new SSL certificate');
            console.log('  node cbd-ssl-manager.js renew   - Renew existing certificate');
            process.exit(1);
    }
}

module.exports = CBDSSLManager;
