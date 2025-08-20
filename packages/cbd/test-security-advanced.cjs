// Test Enterprise Security Orchestrator Advanced Features
const http = require('http');

const testSecurityEndpoint = async (path, method = 'GET', data = null) => {
    console.log(`🔍 Testing ${method} ${path}...`);

    const options = {
        hostname: 'localhost',
        port: 4180,
        path: path,
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (data) {
        const postData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(responseData);
                    console.log(`✅ ${path} Response:`);
                    console.log(JSON.stringify(response, null, 2));
                    resolve(response);
                } catch (error) {
                    console.log(`❌ Raw response from ${path}:`, responseData);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.error(`❌ Request error for ${path}:`, error);
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
};

// Run comprehensive security tests
(async () => {
    try {
        console.log('🛡️ Testing Enterprise Security Orchestrator Advanced Features...\n');

        // Test threat detection
        await testSecurityEndpoint('/security/threats');

        console.log('\n' + '='.repeat(60) + '\n');

        // Test zero-trust verification
        await testSecurityEndpoint('/security/verify', 'POST', {
            email: 'admin@codai.ro',
            deviceId: 'test-device',
            location: 'localhost'
        });

        console.log('\n' + '='.repeat(60) + '\n');

        // Test compliance report
        await testSecurityEndpoint('/security/compliance/report');

        console.log('\n' + '='.repeat(60) + '\n');

        // Test security audit
        await testSecurityEndpoint('/security/audit/run', 'POST');

        console.log('\n🎉 All Enterprise Security Orchestrator tests completed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
})();
