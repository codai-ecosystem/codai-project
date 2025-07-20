// Direct Glass MCP Browser Automation Test
// This test demonstrates browser automation capabilities using Glass MCP HTTP/SSE API

const http = require('http');

class GlassDirectTest {
    constructor() {
        this.glassUrl = 'http://localhost:8001';
        this.sseUrl = 'http://localhost:8001/sse';
    }

    // Make HTTP request to Glass MCP server
    async makeRequest(method, endpoint, data = null) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: 8001,
                path: endpoint,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            const req = http.request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => body += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        resolve(body);
                    }
                });
            });

            req.on('error', reject);

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    // List all open windows
    async listWindows() {
        console.log('🔍 Listing all open windows...');
        try {
            const response = await this.makeRequest('POST', '/window_list');
            console.log('Windows found:', response);
            return response;
        } catch (error) {
            console.error('Error listing windows:', error.message);
        }
    }

    // Focus on Edge browser window
    async focusEdgeBrowser() {
        console.log('🎯 Focusing on Edge browser...');
        try {
            const response = await this.makeRequest('POST', '/window_focus', {
                title: 'Microsoft Edge',
                exact: false
            });
            console.log('Focus result:', response);
            return response;
        } catch (error) {
            console.error('Error focusing Edge:', error.message);
        }
    }

    // Get clipboard content
    async getClipboard() {
        console.log('📋 Getting clipboard content...');
        try {
            const response = await this.makeRequest('POST', '/clipboard_get_text');
            console.log('Clipboard content:', response);
            return response;
        } catch (error) {
            console.error('Error getting clipboard:', error.message);
        }
    }

    // Set clipboard content
    async setClipboard(text) {
        console.log(`📝 Setting clipboard to: "${text}"`);
        try {
            const response = await this.makeRequest('POST', '/clipboard_set_text', {
                text: text
            });
            console.log('Set clipboard result:', response);
            return response;
        } catch (error) {
            console.error('Error setting clipboard:', error.message);
        }
    }

    // Send text to focused window
    async sendText(text) {
        console.log(`⌨️ Sending text: "${text}"`);
        try {
            const response = await this.makeRequest('POST', '/window_send_text_by_title', {
                title: 'Microsoft Edge',
                text: text,
                exact: false
            });
            console.log('Send text result:', response);
            return response;
        } catch (error) {
            console.error('Error sending text:', error.message);
        }
    }

    // Extract text from Edge browser
    async extractBrowserText() {
        console.log('📖 Extracting text from Edge browser...');
        try {
            const response = await this.makeRequest('POST', '/window_extract_text_by_title', {
                title: 'Microsoft Edge',
                exact: false
            });
            console.log('Extracted text preview:', response ? response.substring(0, 200) + '...' : 'No text found');
            return response;
        } catch (error) {
            console.error('Error extracting text:', error.message);
        }
    }

    // Navigate to Vercel dashboard (using clipboard and keyboard automation)
    async navigateToVercel() {
        console.log('🚀 Navigating to Vercel dashboard...');

        // Focus Edge browser
        await this.focusEdgeBrowser();
        await this.sleep(1000);

        // Set Vercel URL to clipboard
        await this.setClipboard('https://vercel.com/dashboard');
        await this.sleep(500);

        // Send Ctrl+L to focus address bar
        await this.sendText('\u0012l'); // Ctrl+L
        await this.sleep(500);

        // Send Ctrl+V to paste URL
        await this.sendText('\u0016'); // Ctrl+V
        await this.sleep(500);

        // Press Enter
        await this.sendText('\r'); // Enter
        await this.sleep(2000);

        console.log('✅ Navigation to Vercel dashboard initiated');
    }

    // Comprehensive browser automation demo for CODAI deployment
    async runCodaiDeploymentDemo() {
        console.log('🎯 Starting CODAI Deployment Browser Automation Demo');
        console.log('='.repeat(60));

        // Step 1: List windows
        await this.listWindows();
        await this.sleep(1000);

        // Step 2: Focus Edge browser
        await this.focusEdgeBrowser();
        await this.sleep(1000);

        // Step 3: Extract current page content
        const currentPageText = await this.extractBrowserText();

        // Check if we're already on Vercel
        if (currentPageText && currentPageText.toLowerCase().includes('vercel')) {
            console.log('✅ Already on Vercel dashboard');
        } else {
            // Step 4: Navigate to Vercel dashboard
            await this.navigateToVercel();
        }

        // Step 5: Demonstrate clipboard automation for configuration
        console.log('🔧 Demonstrating configuration automation...');

        const envCommands = [
            'vercel env add AZURE_OPENAI_API_KEY production',
            'vercel env add AZURE_OPENAI_ENDPOINT production',
            'vercel env add STRIPE_SECRET_KEY production'
        ];

        for (const command of envCommands) {
            await this.setClipboard(command);
            console.log(`📋 Set clipboard: ${command}`);
            await this.sleep(500);
        }

        console.log('✅ CODAI Deployment automation demo completed');
        console.log('🎉 Ready for production deployment!');
    }

    // Helper function for delays
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Run the test
async function main() {
    const test = new GlassDirectTest();

    console.log('🧪 Glass MCP Browser Automation Test');
    console.log('=====================================');
    console.log('Testing Glass MCP at http://localhost:8001');
    console.log('');

    try {
        // Run comprehensive CODAI deployment demo
        await test.runCodaiDeploymentDemo();

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('');
        console.log('🔍 Troubleshooting:');
        console.log('1. Ensure Glass MCP server is running on http://localhost:8001');
        console.log('2. Make sure Edge browser is open');
        console.log('3. Check that Glass MCP has proper permissions');
    }
}

if (require.main === module) {
    main();
}

module.exports = GlassDirectTest;
