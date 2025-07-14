import http from 'http';

// Test LOGAI Authentication APIs
async function testLogaiAuth() {
    const baseUrl = 'http://localhost:4032';

    console.log('🧪 Testing LOGAI Authentication APIs');
    console.log('=====================================');

    try {
        // Test 1: GET Authentication Status
        console.log('\n1. Testing GET /api/auth (Status Check)');
        await makeRequest('GET', `${baseUrl}/api/auth`, null);

        // Test 2: POST Register User
        console.log('\n2. Testing POST /api/auth (Register User)');
        const registerData = {
            action: 'register',
            email: 'test@logai.com',
            password: 'TestPassword123!',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User'
        };
        await makeRequest('POST', `${baseUrl}/api/auth`, registerData);

        // Test 3: POST Login User
        console.log('\n3. Testing POST /api/auth (Login User)');
        const loginData = {
            action: 'login',
            email: 'test@logai.com',
            password: 'TestPassword123!'
        };
        await makeRequest('POST', `${baseUrl}/api/auth`, loginData);

    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
}

function makeRequest(method, url, data) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);

        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'LOGAI-Test-Client/1.0'
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);

                try {
                    const jsonResponse = JSON.parse(responseData);
                    console.log(`   Response:`, JSON.stringify(jsonResponse, null, 2));
                    resolve(jsonResponse);
                } catch (e) {
                    console.log(`   Raw Response: ${responseData}`);
                    resolve(responseData);
                }
            });
        });

        req.on('error', (err) => {
            console.error(`   ❌ Request failed: ${err.message}`);
            reject(err);
        });

        req.setTimeout(10000, () => {
            console.error('   ❌ Request timeout');
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (data && method === 'POST') {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

testLogaiAuth();
