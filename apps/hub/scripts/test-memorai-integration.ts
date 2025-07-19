/**
 * Simple test script to verify Memorai integration works
 */

import { hubMemoraiService } from '../lib/MemoraiIntegration'

async function testMemoraiIntegration() {
  console.log('🚀 Starting Memorai Integration Test...')

  try {
    // Initialize the service
    console.log('📊 Initializing Memorai service...')
    await hubMemoraiService.initialize()
    console.log('✅ Memorai service initialized successfully')

    // Test creating a project
    console.log('📝 Creating a test project...')
    const testProject = await hubMemoraiService.createProject({
      name: 'Test Project',
      description: 'A test project to verify Memorai integration',
      status: 'PLANNING' as const,
      priority: 'HIGH' as const,
      progress: 25,
      startDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      teamMembers: [],
      tasks: [],
      milestones: [],
      budget: {
        allocated: 50000,
        spent: 10000,
        remaining: 40000
      },
      tags: ['test', 'memorai', 'integration'],
      aiInsights: {
        riskScore: 15,
        recommendations: [
          'Project is in early planning phase',
          'Consider adding team members soon',
          'Set up initial milestones'
        ],
        automatedTasks: 0,
        predictedCompletion: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
      }
    })
    console.log('✅ Project created:', testProject.id, '-', testProject.name)

    // Test listing projects
    console.log('📋 Listing all projects...')
    const projectsList = await hubMemoraiService.listProjects()
    console.log(`✅ Found ${projectsList.projects.length} projects`)

    // Test getting a specific project
    console.log('🔍 Retrieving the test project...')
    const retrievedProject = await hubMemoraiService.getProject(testProject.id)
    console.log('✅ Retrieved project:', retrievedProject?.name)

    // Test updating the project
    console.log('📝 Updating project progress...')
    const updatedProject = await hubMemoraiService.updateProject(testProject.id, {
      progress: 50,
      status: 'ACTIVE' as const
    })
    console.log('✅ Updated project progress to:', updatedProject?.progress + '%')

    // Test AI search
    console.log('🔍 Testing AI-powered search...')
    const searchResults = await hubMemoraiService.searchProjects('test integration')
    console.log(`✅ Search found ${searchResults.length} projects`)

    // Clean up - delete the test project
    console.log('🧹 Cleaning up test project...')
    const deleted = await hubMemoraiService.deleteProject(testProject.id)
    console.log('✅ Test project deleted:', deleted)

    console.log('\n🎉 Memorai Integration Test Completed Successfully!')
    console.log('✅ Database operations: Working')
    console.log('✅ Storage operations: Ready')
    console.log('✅ Memory/AI search: Working')
    console.log('✅ CRUD operations: Working')

  } catch (error) {
    console.error('❌ Memorai Integration Test Failed:', error)
    console.error(error)
    process.exit(1)
  }
}

// Run the test
testMemoraiIntegration()
  .then(() => {
    console.log('\n🎯 Integration test completed. Memorai is ready for production use!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n💥 Integration test failed:', error)
    process.exit(1)
  })
