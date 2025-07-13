// Simple test to verify LogAI integration
async function testLogAIIntegration() {
  console.log('Testing LogAI integration...');

  try {
    // Test direct LogAI client connection
    const response = await fetch('http://localhost:4032/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ LogAI service is healthy:', data);

      // Test logging endpoint
      const logResponse = await fetch('http://localhost:4032/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service: 'codai',
          level: 'info',
          message: 'CodAI LogAI integration test',
          metadata: {
            component: 'logger-test',
            action: 'integration-test',
            timestamp: new Date().toISOString()
          }
        })
      });

      if (logResponse.ok) {
        console.log('✅ Successfully sent log to LogAI service');
      } else {
        console.error('❌ Failed to send log to LogAI service:', logResponse.status);
      }

    } else {
      console.error('❌ LogAI service is not responding:', response.status);
    }

  } catch (error) {
    console.error('❌ LogAI integration test failed:', error.message);
    console.log('Note: Make sure LogAI service is running on port 4032');
  }
}

testLogAIIntegration();
