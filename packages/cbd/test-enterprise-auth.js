// Test Enterprise Security Orchestrator Authentication
const https = require('https');
const http = require('http');

const testAuth = async () => {
    console.log('🔐 Testing Enterprise Security Orchestrator Authentication...');

    const postData = JSON.stringify({
        username: 'admin@codai.ro',
        password: 'admin123'
    });

    const options = {
        hostname: 'localhost',
        port: 4180,
        path: '/security/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('✅ Authentication Response:');
                    console.log(JSON.stringify(response, null, 2));
                    resolve(response);
                } catch (error) {
                    console.log('❌ Raw response:', data);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Request error:', error);
            reject(error);
        });

        req.write(postData);
        req.end();
    });
};

// Test security status endpoint
const testSecurityStatus = async () => {
    console.log('\n🛡️ Testing Security Status...');

    const options = {
        hostname: 'localhost',
        port: 4180,
        path: '/security/auth/status',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('✅ Security Status:');
                    console.log(JSON.stringify(response, null, 2));
                    resolve(response);
                } catch (error) {
                    console.log('❌ Raw response:', data);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Request error:', error);
            reject(error);
        });

        req.end();
    });
};

// Run tests
(async () => {
    try {
        await testAuth();
        await testSecurityStatus();
        console.log('\n🎉 Enterprise Security Orchestrator tests completed!');
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
})();
