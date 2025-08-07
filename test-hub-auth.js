#!/usr/bin/env node

async function testHubAuthentication() {
    console.log('🧪 Testing Hub Authentication System...\n');

    try {
        // Test authentication login
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
            console.log('✅ Hub Authentication: SUCCESS');
            console.log('Token:', loginData.token ? '✅ Present' : '❌ Missing');

            if (loginData.token) {
                // Test project creation with token
                const createProjectResponse = await fetch('https://hub.codai.ro/api/ecosystem/projects', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${loginData.token}`
                    },
                    body: JSON.stringify({
                        name: 'Test Project from Hub',
                        description: 'Test project created through Hub authentication',
                        type: 'web-app'
                    })
                });

                if (createProjectResponse.ok) {
                    const projectData = await createProjectResponse.json();
                    console.log('✅ Project Creation: SUCCESS');
                    console.log('Project ID:', projectData.id);
                } else {
                    console.log('❌ Project Creation: FAILED');
                    console.log('Status:', createProjectResponse.status);
                }
            }
        } else {
            console.log('❌ Hub Authentication: FAILED');
            console.log('Status:', loginResponse.status);
            const error = await loginResponse.text();
            console.log('Error:', error);
        }

    } catch (error) {
        console.log('❌ Hub Authentication Test: ERROR');
        console.log('Error:', error.message);
    }
}

testHubAuthentication();
