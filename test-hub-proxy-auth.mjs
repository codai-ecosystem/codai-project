#!/usr/bin/env node

async function testHubProxyAuthentication() {
    console.log('🧪 Testing Hub Proxy Authentication...\n');

    try {
        // Test Hub ecosystem authentication
        console.log('1️⃣ Testing Hub proxy admin authentication...');
        const loginResponse = await fetch('https://hub.codai.ro/api/ecosystem/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@codai.ro',
                password: 'admin123'
            })
        });

        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log('✅ Hub proxy authentication: SUCCESS');
            console.log('User Name:', loginData.user?.name);
            console.log('User Role:', loginData.user?.role);
            console.log('Token:', loginData.token ? 'Generated ✅' : 'Missing ❌');

            if (loginData.token) {
                // Test project creation
                console.log('\n2️⃣ Testing project creation with Hub proxy...');
                const projectResponse = await fetch('https://hub.codai.ro/api/ecosystem/projects', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${loginData.token}`
                    },
                    body: JSON.stringify({
                        name: 'Test External Project',
                        description: 'Test project created through Hub proxy authentication',
                        type: 'web-app',
                        framework: 'nextjs'
                    })
                });

                if (projectResponse.ok) {
                    const projectData = await projectResponse.json();
                    console.log('✅ Project creation: SUCCESS');
                    console.log('Project ID:', projectData.id);
                    console.log('Project Name:', projectData.name);
                } else {
                    console.log('❌ Project creation: FAILED');
                    console.log('Status:', projectResponse.status);
                    const error = await projectResponse.text();
                    console.log('Error:', error);
                }
            }

        } else {
            console.log('❌ Hub proxy authentication: FAILED');
            console.log('Status:', loginResponse.status);
            const error = await loginResponse.text();
            console.log('Error:', error);
        }

        console.log('\n✅ Hub proxy authentication test completed!');

    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

testHubProxyAuthentication();
