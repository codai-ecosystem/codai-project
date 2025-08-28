const https = require('https');

function testDeployment() {
    const url = 'https://codai-coming-soon-pd1e1cpe6-codai-ro.vercel.app';

    console.log('🔍 Testing deployment:', url);

    https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log(`📊 Status Code: ${res.statusCode}`);
            console.log(`🌐 Headers:`, res.headers);

            // Check if it's the auth page or our content
            const isAuthPage = data.includes('Authentication Required');
            const hasOurContent = data.includes('CODAI') && data.includes('Coming Soon');

            console.log(`🔒 Is Auth Page: ${isAuthPage ? '❌ YES' : '✅ NO'}`);
            console.log(`🎯 Has Our Content: ${hasOurContent ? '✅ YES' : '❌ NO'}`);

            if (isAuthPage) {
                console.log('🚨 Deployment is still protected by authentication');
            } else if (hasOurContent) {
                console.log('🎉 Deployment is working correctly!');
            } else {
                console.log('⚠️ Unknown page content');
                console.log('First 500 characters:', data.substring(0, 500));
            }
        });

    }).on('error', (err) => {
        console.error('❌ Error:', err.message);
    });
}

testDeployment();