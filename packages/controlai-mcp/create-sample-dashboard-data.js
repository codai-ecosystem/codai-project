#!/usr/bin/env node

/**
 * ControlAI Dashboard + CBD Integration Test
 * Creates sample data in CBD and tests dashboard connectivity
 */

import axios from 'axios';

const CBD_URL = 'http://localhost:4180';

// Create sample projects
const sampleProjects = [
    {
        id: `project-${Date.now()}-001`,
        name: 'ControlAI Production Readiness',
        description: 'Complete production readiness plan for ControlAI MCP with CBD integration',
        status: 'active',
        priority: 'critical',
        tags: ['production', 'mcp', 'cbd'],
        completionPercentage: 50
    },
    {
        id: `project-${Date.now()}-002`,
        name: 'Dashboard Development',
        description: 'Real-time dashboard implementation for ControlAI ecosystem monitoring',
        status: 'active',
        priority: 'high',
        tags: ['dashboard', 'ui', 'monitoring'],
        completionPercentage: 80
    },
    {
        id: `project-${Date.now()}-003`,
        name: 'Agent Coordination System',
        description: 'Multi-agent coordination and task management system',
        status: 'completed',
        priority: 'high',
        tags: ['agents', 'coordination', 'automation'],
        completionPercentage: 100
    }
];

// Create sample tasks
const sampleTasks = (projectIds) => [
    {
        id: `task-${Date.now()}-001`,
        title: 'CBD Database Migration',
        description: 'Migrate ControlAI MCP from SQLite to CBD database',
        status: 'done',
        priority: 'critical',
        projectId: projectIds[0],
        assignedTo: 'Senior Developer'
    },
    {
        id: `task-${Date.now()}-002`,
        title: 'Dashboard UI Implementation',
        description: 'Implement real-time dashboard with React and Next.js',
        status: 'in-progress',
        priority: 'high',
        projectId: projectIds[1],
        assignedTo: 'UX Designer'
    },
    {
        id: `task-${Date.now()}-003`,
        title: 'WebSocket Integration',
        description: 'Add real-time updates via WebSocket connection',
        status: 'todo',
        priority: 'medium',
        projectId: projectIds[1],
        assignedTo: null
    },
    {
        id: `task-${Date.now()}-004`,
        title: 'Agent Performance Monitoring',
        description: 'Monitor agent performance and resource utilization',
        status: 'review',
        priority: 'medium',
        projectId: projectIds[2],
        assignedTo: 'DevOps Engineer'
    }
];

// Create sample agents
const sampleAgents = [
    {
        id: `agent-${Date.now()}-001`,
        name: 'Senior Developer Agent',
        type: 'senior_developer',
        status: 'active',
        capabilities: ['programming', 'architecture', 'code-review', 'mentoring'],
        currentWorkload: 2,
        maxConcurrentTasks: 3,
        workspaceId: 'controlai-workspace'
    },
    {
        id: `agent-${Date.now()}-002`,
        name: 'UX Designer Agent',
        type: 'ux_designer',
        status: 'busy',
        capabilities: ['ui-design', 'user-research', 'prototyping', 'accessibility'],
        currentWorkload: 1,
        maxConcurrentTasks: 2,
        workspaceId: 'controlai-workspace'
    },
    {
        id: `agent-${Date.now()}-003`,
        name: 'DevOps Engineer Agent',
        type: 'devops_engineer',
        status: 'active',
        capabilities: ['deployment', 'monitoring', 'scaling', 'security'],
        currentWorkload: 1,
        maxConcurrentTasks: 2,
        workspaceId: 'controlai-workspace'
    },
    {
        id: `agent-${Date.now()}-004`,
        name: 'QA Engineer Agent',
        type: 'qa_engineer',
        status: 'idle',
        capabilities: ['testing', 'automation', 'quality-assurance', 'documentation'],
        currentWorkload: 0,
        maxConcurrentTasks: 3,
        workspaceId: 'controlai-workspace'
    }
];

async function createSampleData() {
    console.log('🎯 Creating Sample Dashboard Data...\n');

    try {
        // Test CBD connection
        console.log('📡 Testing CBD connection...');
        const healthResponse = await axios.get(`${CBD_URL}/health`);
        console.log('✅ CBD Status:', healthResponse.data.status);
        console.log('');

        // Create projects
        console.log('📊 Creating sample projects...');
        const projectIds = [];
        for (const project of sampleProjects) {
            const memoryData = {
                agentId: 'controlai-dashboard',
                content: JSON.stringify({
                    ...project,
                    entityType: 'project',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }),
                metadata: {
                    entityType: 'project',
                    entityId: project.id,
                    name: project.name,
                    status: project.status,
                    priority: project.priority,
                    tags: project.tags,
                    project: 'controlai-projects'
                }
            };

            await axios.post(`${CBD_URL}/api/data/memories`, memoryData);
            projectIds.push(project.id);
            console.log(`✅ Created project: ${project.name}`);
        }

        // Create tasks
        console.log('\n📝 Creating sample tasks...');
        const tasks = sampleTasks(projectIds);
        for (const task of tasks) {
            const memoryData = {
                agentId: 'controlai-dashboard',
                content: JSON.stringify({
                    ...task,
                    entityType: 'task',
                    createdAt: new Date(),
                    updatedAt: new Date()
                }),
                metadata: {
                    entityType: 'task',
                    entityId: task.id,
                    title: task.title,
                    status: task.status,
                    priority: task.priority,
                    projectId: task.projectId,
                    assignedAgentId: task.assignedTo,
                    project: 'controlai-tasks'
                }
            };

            await axios.post(`${CBD_URL}/api/data/memories`, memoryData);
            console.log(`✅ Created task: ${task.title}`);
        }

        // Create agents
        console.log('\n🤖 Creating sample agents...');
        for (const agent of sampleAgents) {
            const memoryData = {
                agentId: 'controlai-dashboard',
                content: JSON.stringify({
                    ...agent,
                    entityType: 'agent',
                    createdAt: new Date(),
                    lastActiveAt: new Date()
                }),
                metadata: {
                    entityType: 'agent',
                    entityId: agent.id,
                    name: agent.name,
                    type: agent.type,
                    status: agent.status,
                    workspaceId: agent.workspaceId,
                    capabilities: agent.capabilities,
                    project: 'controlai-agents'
                }
            };

            await axios.post(`${CBD_URL}/api/data/memories`, memoryData);
            console.log(`✅ Created agent: ${agent.name}`);
        }

        // Verify data creation
        console.log('\n🔍 Verifying data creation...');
        
        const projectsResponse = await axios.post(`${CBD_URL}/api/search/memories`, {
            query: 'controlai-projects',
            limit: 100
        });
        const projectCount = projectsResponse.data.data?.memories?.filter(m => 
            m.metadata?.entityType === 'project'
        ).length || 0;

        const tasksResponse = await axios.post(`${CBD_URL}/api/search/memories`, {
            query: 'controlai-tasks',
            limit: 100
        });
        const taskCount = tasksResponse.data.data?.memories?.filter(m => 
            m.metadata?.entityType === 'task'
        ).length || 0;

        const agentsResponse = await axios.post(`${CBD_URL}/api/search/memories`, {
            query: 'controlai-agents',
            limit: 100
        });
        const agentCount = agentsResponse.data.data?.memories?.filter(m => 
            m.metadata?.entityType === 'agent'
        ).length || 0;

        console.log(`✅ Verification Results:`);
        console.log(`   📊 Projects: ${projectCount}`);
        console.log(`   📝 Tasks: ${taskCount}`);
        console.log(`   🤖 Agents: ${agentCount}`);

        console.log('\n🎉 Sample dashboard data created successfully!');
        console.log(`🌐 Dashboard URL: http://localhost:4200`);
        console.log(`💾 CBD Service: ${CBD_URL}`);
        console.log('\n🚀 Phase 2 Dashboard Implementation: READY FOR TESTING');

    } catch (error) {
        console.error('❌ Failed to create sample data:', error.response?.data || error.message);
        process.exit(1);
    }
}
