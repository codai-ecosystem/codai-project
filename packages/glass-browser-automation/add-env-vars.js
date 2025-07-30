const { EnhancedVercelAutomation } = require('./dist/enhanced-vercel-automation');

async function addEnvironmentVariables() {
    console.log('🚀 Adding Environment Variables to Vercel...');
    console.log('===============================================\n');

    try {
        const vercelAutomation = new EnhancedVercelAutomation();
        const initResult = await vercelAutomation.initialize();

        console.log('✅ Initialized Vercel automation');
        console.log('📍 Current URL:', initResult.url);
        console.log('📄 Page Title:', initResult.title);

        const envVars = [
            {
                key: 'AZURE_OPENAI_ENDPOINT',
                value: 'https://your-azure-openai-endpoint.openai.azure.com/',
                environments: ['Production', 'Preview', 'Development']
            },
            {
                key: 'AZURE_OPENAI_API_KEY',
                value: 'your-azure-openai-api-key-here',
                environments: ['Production', 'Preview', 'Development']
            },
            {
                key: 'GITHUB_CLIENT_SECRET',
                value: 'your-github-client-secret-here',
                environments: ['Production', 'Preview', 'Development']
            },
            {
                key: 'NEXTAUTH_SECRET',
                value: 'your-nextauth-secret-here',
                environments: ['Production', 'Preview', 'Development']
            },
            {
                key: 'STRIPE_SECRET_KEY',
                value: 'your-stripe-secret-key-here',
                environments: ['Production', 'Preview', 'Development']
            }
        ];

        console.log('\n📝 Environment variables to add:');
        envVars.forEach((envVar, index) => {
            console.log(`${index + 1}. ${envVar.key}`);
        });

        // Navigate to environment variables page if not already there
        await vercelAutomation.navigateToEnvironmentVariables();
        console.log('✅ Navigated to Environment Variables page');

        // Try to find the interface for adding environment variables
        const interfaceResult = await vercelAutomation.findAddEnvironmentVariableInterface();
        console.log('🔍 Interface search result:', interfaceResult.success ? 'Found' : 'Not found');

        if (interfaceResult.success) {
            // Try adding the first environment variable
            const firstEnvVar = envVars[0];
            console.log(`\n📝 Adding: ${firstEnvVar.key}`);

            const result = await vercelAutomation.fillEnvironmentVariableForm({
                name: firstEnvVar.key,
                value: firstEnvVar.value,
                environments: firstEnvVar.environments
            });

            if (result.success) {
                console.log('✅ Successfully filled the form for the first environment variable');
                console.log('Please complete the process and add the remaining variables manually.');
            } else {
                console.log('❌ Failed to fill form:', result.message);
            }
        }

        console.log('\n📋 Manual steps needed:');
        console.log('1. Look for "Add" or "Add Environment Variable" button');
        console.log('2. Add each environment variable with the keys listed above');
        console.log('3. Set environments to Production, Preview, and Development for each');
        console.log('4. Use the actual secret values from your .env file');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\nPlease add the following environment variables manually:');
        console.log('1. AZURE_OPENAI_ENDPOINT');
        console.log('2. AZURE_OPENAI_API_KEY');
        console.log('3. GITHUB_CLIENT_SECRET');
        console.log('4. NEXTAUTH_SECRET');
        console.log('5. STRIPE_SECRET_KEY');
    }
}

if (require.main === module) {
    addEnvironmentVariables();
}
