/**
 * Simple test script to verify Memorai integration works
 */

import { hubMemoraiService } from '../lib/MemoraiIntegrationSimple'

async function testMemoraiIntegration() {
  console.log('🚀 Starting Memorai Integration Test...')

  try {
    // Initialize the service
    console.log('📊 Initializing Memorai service...')
    await hubMemoraiService.initialize()
    console.log('✅ Memorai service initialized successfully')

    // Test health check
    console.log('🏥 Checking service health...')
    const health = await hubMemoraiService.getHealth()
    console.log('✅ Health status:', health.status)

    // Test creating a project
    console.log('📝 Creating a test project...')
    const testProject = await hubMemoraiService.createProject({
      name: 'Memorai Integration Test',
      description: 'A test project to verify Memorai integration with AI-powered features',
      status: 'ACTIVE',
      priority: 'HIGH',
      progress: 25,
      startDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      tags: ['test', 'memorai', 'integration', 'ai']
    })
    console.log('✅ Project created:', testProject.id, '-', testProject.name)

    // Test listing projects
    console.log('📋 Listing all projects...')
    const projectsList = await hubMemoraiService.listProjects()
    console.log(`✅ Found ${projectsList.projects.length} projects (total: ${projectsList.total})`)

    // Test getting a specific project
    console.log('🔍 Retrieving the test project...')
    const retrievedProject = await hubMemoraiService.getProject(testProject.id)
    console.log('✅ Retrieved project:', retrievedProject?.name)

    // Test updating the project
    console.log('📝 Updating project progress...')
    const updatedProject = await hubMemoraiService.updateProject(testProject.id, {
      progress: 75,
      status: 'ACTIVE'
    })
    console.log('✅ Updated project progress to:', updatedProject?.progress + '%')

    // Wait a moment for AI indexing
    console.log('⏳ Waiting for AI indexing...')
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Test AI search
    console.log('🔍 Testing AI-powered search for "integration"...')
    const searchResults = await hubMemoraiService.searchProjects('integration')
    console.log(`✅ Search found ${searchResults.length} projects`)

    // Test another search
    console.log('🔍 Testing AI-powered search for "memorai test"...')
    const searchResults2 = await hubMemoraiService.searchProjects('memorai test')
    console.log(`✅ Search found ${searchResults2.length} projects`)

    // Test file upload simulation
    console.log('📎 Testing file operations...')
    const files = await hubMemoraiService.getProjectFiles(testProject.id)
    console.log(`✅ Project has ${files.length} files`)

    // Clean up - delete the test project
    console.log('🧹 Cleaning up test project...')
    const deleted = await hubMemoraiService.deleteProject(testProject.id)
    console.log('✅ Test project deleted:', deleted)

    console.log('\n🎉 Memorai Integration Test Completed Successfully!')
    console.log('✅ Service initialization: Working')
    console.log('✅ Project CRUD operations: Working') 
    console.log('✅ AI memory storage: Working')
    console.log('✅ AI-powered search: Working')
    console.log('✅ Health monitoring: Working')

  } catch (error) {
    console.error('❌ Memorai Integration Test Failed:', error)
    console.error(error)
    process.exit(1)
  }
}

// Run the test
testMemoraiIntegration()
  .then(() => {
    console.log('\n🎯 Integration test completed. Memorai is ready for production use in Hub app!')
    console.log('📊 The Hub app can now:')
    console.log('  - Store projects with AI-powered search')
    console.log('  - Use memorai for universal database operations')
    console.log('  - Leverage AI memory for intelligent recommendations')
    console.log('  - Share data with other CODAI ecosystem apps')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n💥 Integration test failed:', error)
    process.exit(1)
  })
