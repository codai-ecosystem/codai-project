/**
 * Glass MCP Workflows Tool Test Suite
 * Comprehensive testing of workflow automation capabilities
 */
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

class WorkflowTester {
    constructor() {
        this.serverProcess = null;
        this.testResults = [];
        this.serverUrl = 'http://localhost:3000';
    }

    async startServer() {
        console.log('🚀 Starting Glass MCP Server...');
        
        // Build first
        const buildProcess = spawn('npx', ['tsc'], {
            cwd: process.cwd(),
            stdio: 'pipe',
            shell: true
        });

        await new Promise((resolve, reject) => {
            buildProcess.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ TypeScript build successful');
                    resolve();
                } else {
                    console.error('❌ TypeScript build failed');
                    reject(new Error(`Build failed with code ${code}`));
                }
            });
        });

        // Start the MCP server
        this.serverProcess = spawn('node', ['dist/mcp-server.js'], {
            cwd: process.cwd(),
            stdio: 'pipe',
            shell: true
        });

        // Wait for server startup
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('✅ Glass MCP Server started');
    }

    async sendMCPRequest(method, params) {
        const request = {
            jsonrpc: '2.0',
            id: Date.now(),
            method: method,
            params: params
        };

        console.log(`📤 Sending request: ${method}`);
        
        try {
            // Simulate MCP call through the server process
            this.serverProcess.stdin.write(JSON.stringify(request) + '\n');
            
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Request timeout'));
                }, 10000);

                this.serverProcess.stdout.on('data', (data) => {
                    try {
                        const response = JSON.parse(data.toString());
                        if (response.id === request.id) {
                            clearTimeout(timeout);
                            resolve(response);
                        }
                    } catch (e) {
                        // Ignore parsing errors for partial data
                    }
                });
            });
        } catch (error) {
            console.error(`❌ Request failed: ${error.message}`);
            throw error;
        }
    }

    async testWorkflowCreation() {
        console.log('\n🧪 Testing workflow creation...');
        
        try {
            const response = await this.sendMCPRequest('tools/call', {
                name: 'glass_workflows',
                arguments: {
                    operation: 'create_workflow',
                    name: 'test_workflow_1',
                    description: 'A test workflow for validation',
                    steps: [
                        {
                            type: 'click',
                            parameters: { target: { x: 100, y: 200 } },
                            description: 'Click at coordinates'
                        },
                        {
                            type: 'type',
                            parameters: { text: 'Hello World' },
                            description: 'Type text'
                        },
                        {
                            type: 'wait',
                            parameters: { duration: 1000 },
                            description: 'Wait 1 second'
                        }
                    ]
                }
            });

            if (response.result && response.result.content && response.result.content[0].text) {
                const result = JSON.parse(response.result.content[0].text);
                if (result.success) {
                    console.log('✅ Workflow creation: SUCCESS');
                    console.log(`   Workflow ID: ${result.workflowId}`);
                    this.testResults.push({ test: 'workflow_creation', passed: true, details: result });
                    return result.workflowId;
                } else {
                    throw new Error(result.message);
                }
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.log(`❌ Workflow creation: FAILED - ${error.message}`);
            this.testResults.push({ test: 'workflow_creation', passed: false, error: error.message });
            return null;
        }
    }

    async testWorkflowRecording() {
        console.log('\n🧪 Testing workflow recording...');
        
        try {
            // Start recording
            const startResponse = await this.sendMCPRequest('tools/call', {
                name: 'glass_workflows',
                arguments: {
                    operation: 'start_recording',
                    workflowName: 'recorded_test_workflow',
                    description: 'A workflow created through recording'
                }
            });

            let startResult = JSON.parse(startResponse.result.content[0].text);
            if (!startResult.success) {
                throw new Error(`Start recording failed: ${startResult.message}`);
            }

            console.log('✅ Recording started');

            // Record some actions
            const actions = [
                { actionType: 'click', target: { x: 150, y: 250 } },
                { actionType: 'type', value: 'Test input text' },
                { actionType: 'wait', value: '500' }
            ];

            for (const action of actions) {
                const recordResponse = await this.sendMCPRequest('tools/call', {
                    name: 'glass_workflows',
                    arguments: {
                        operation: 'record_action',
                        ...action
                    }
                });

                const recordResult = JSON.parse(recordResponse.result.content[0].text);
                if (!recordResult.success) {
                    throw new Error(`Recording action failed: ${recordResult.message}`);
                }
                console.log(`✅ Recorded ${action.actionType} action`);
            }

            // Stop recording
            const stopResponse = await this.sendMCPRequest('tools/call', {
                name: 'glass_workflows',
                arguments: {
                    operation: 'stop_recording',
                    save: true
                }
            });

            const stopResult = JSON.parse(stopResponse.result.content[0].text);
            if (stopResult.success) {
                console.log('✅ Workflow recording: SUCCESS');
                console.log(`   Steps recorded: ${stopResult.stepsRecorded}`);
                this.testResults.push({ test: 'workflow_recording', passed: true, details: stopResult });
                return stopResult.workflowId;
            } else {
                throw new Error(stopResult.message);
            }
        } catch (error) {
            console.log(`❌ Workflow recording: FAILED - ${error.message}`);
            this.testResults.push({ test: 'workflow_recording', passed: false, error: error.message });
            return null;
        }
    }

    async testWorkflowListing() {
        console.log('\n🧪 Testing workflow listing...');
        
        try {
            const response = await this.sendMCPRequest('tools/call', {
                name: 'glass_workflows',
                arguments: {
                    operation: 'list_workflows'
                }
            });

            const result = JSON.parse(response.result.content[0].text);
            if (result.workflows) {
                console.log('✅ Workflow listing: SUCCESS');
                console.log(`   Found ${result.totalCount} workflows`);
                for (const workflow of result.workflows) {
                    console.log(`   - ${workflow.name}: ${workflow.steps.length} steps`);
                }
                this.testResults.push({ test: 'workflow_listing', passed: true, details: result });
                return true;
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.log(`❌ Workflow listing: FAILED - ${error.message}`);
            this.testResults.push({ test: 'workflow_listing', passed: false, error: error.message });
            return false;
        }
    }

    async testWorkflowExecution() {
        console.log('\n🧪 Testing workflow execution...');
        
        try {
            const response = await this.sendMCPRequest('tools/call', {
                name: 'glass_workflows',
                arguments: {
                    operation: 'execute_workflow',
                    workflowName: 'test_workflow_1',
                    variables: {},
                    executionOptions: { timeout: 30000, retries: 1 }
                }
            });

            const result = JSON.parse(response.result.content[0].text);
            if (result.success) {
                console.log('✅ Workflow execution: SUCCESS');
                console.log(`   Execution ID: ${result.executionId}`);
                console.log(`   Steps executed: ${result.stepsExecuted}/${result.totalSteps}`);
                this.testResults.push({ test: 'workflow_execution', passed: true, details: result });
                return result.executionId;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.log(`❌ Workflow execution: FAILED - ${error.message}`);
            this.testResults.push({ test: 'workflow_execution', passed: false, error: error.message });
            return null;
        }
    }

    async testWorkflowUpdate() {
        console.log('\n🧪 Testing workflow update...');
        
        try {
            const response = await this.sendMCPRequest('tools/call', {
                name: 'glass_workflows',
                arguments: {
                    operation: 'update_workflow',
                    workflowName: 'test_workflow_1',
                    updates: {
                        description: 'Updated test workflow description',
                        tags: ['test', 'automation', 'updated']
                    }
                }
            });

            const result = JSON.parse(response.result.content[0].text);
            if (result.success) {
                console.log('✅ Workflow update: SUCCESS');
                console.log(`   Updated workflow: ${result.workflowName}`);
                this.testResults.push({ test: 'workflow_update', passed: true, details: result });
                return true;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.log(`❌ Workflow update: FAILED - ${error.message}`);
            this.testResults.push({ test: 'workflow_update', passed: false, error: error.message });
            return false;
        }
    }

    async testWorkflowDeletion() {
        console.log('\n🧪 Testing workflow deletion...');
        
        try {
            const response = await this.sendMCPRequest('tools/call', {
                name: 'glass_workflows',
                arguments: {
                    operation: 'delete_workflow',
                    workflowName: 'test_workflow_1',
                    confirm: true
                }
            });

            const result = JSON.parse(response.result.content[0].text);
            if (result.success) {
                console.log('✅ Workflow deletion: SUCCESS');
                console.log(`   Deleted workflow: test_workflow_1`);
                this.testResults.push({ test: 'workflow_deletion', passed: true, details: result });
                return true;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.log(`❌ Workflow deletion: FAILED - ${error.message}`);
            this.testResults.push({ test: 'workflow_deletion', passed: false, error: error.message });
            return false;
        }
    }

    async runAllTests() {
        console.log('🎯 Starting Glass MCP Workflows Comprehensive Test Suite');
        console.log('===========================================================');

        try {
            await this.startServer();

            // Run tests in sequence
            await this.testWorkflowCreation();
            await this.testWorkflowRecording();
            await this.testWorkflowListing();
            await this.testWorkflowExecution();
            await this.testWorkflowUpdate();
            await this.testWorkflowDeletion();

            this.generateTestReport();
        } catch (error) {
            console.error(`🚨 Test suite failed: ${error.message}`);
        } finally {
            if (this.serverProcess) {
                this.serverProcess.kill();
            }
        }
    }

    generateTestReport() {
        console.log('\n📊 Glass MCP Workflows Test Results');
        console.log('===================================');

        const passed = this.testResults.filter(t => t.passed).length;
        const total = this.testResults.length;
        const successRate = ((passed / total) * 100).toFixed(1);

        console.log(`\n✅ Tests Passed: ${passed}/${total} (${successRate}%)`);

        this.testResults.forEach(test => {
            const status = test.passed ? '✅' : '❌';
            const name = test.test.replace(/_/g, ' ').toUpperCase();
            console.log(`${status} ${name}: ${test.passed ? 'PASSED' : 'FAILED'}`);
            if (!test.passed && test.error) {
                console.log(`    Error: ${test.error}`);
            }
        });

        // Save detailed report
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total,
                passed,
                failed: total - passed,
                successRate: parseFloat(successRate)
            },
            tests: this.testResults
        };

        fs.writeFileSync('glass-workflows-test-report.json', JSON.stringify(report, null, 2));
        console.log('\n📋 Detailed report saved to: glass-workflows-test-report.json');

        if (successRate >= 85) {
            console.log('\n🎉 EXCELLENT! Glass Workflows tool is ready for production!');
        } else if (successRate >= 70) {
            console.log('\n⚠️  Good results, but some improvements needed');
        } else {
            console.log('\n🚨 Multiple failures detected - requires attention');
        }
    }
}

// Run the test suite if this file is executed directly
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new WorkflowTester();
    tester.runAllTests().catch(console.error);
}

export default WorkflowTester;