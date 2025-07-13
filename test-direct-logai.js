// Direct LogAI API test with correct format
async function testDirectLogAI() {
  console.log('Testing direct LogAI API with correct format...')

  try {
    const response = await fetch('http://localhost:4032/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        entries: [
          {
            level: 'info',
            service: 'test-service',
            message: 'Direct API test message',
            metadata: {
              testType: 'direct-api-test',
              timestamp: new Date().toISOString()
            },
            environment: 'development'
          }
        ]
      })
    })

    const result = await response.json()
    console.log('Response status:', response.status)
    console.log('Response body:', result)

    if (response.ok) {
      console.log('✅ Direct LogAI API test successful!')
    } else {
      console.log('❌ Direct LogAI API test failed')
    }

  } catch (error) {
    console.error('❌ Error testing LogAI API:', error.message)
  }
}

testDirectLogAI()
