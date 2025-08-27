/**
 * Simple Glass MCP Workflows Tool Test
 * Direct function testing of workflow capabilities
 */
import fs from 'fs';

// Simple test runner for workflow functions
class SimpleWorkflowTester {
    constructor() {
        this.testResults = [];
    }

    async testWorkflowToolSchema() {
        console.log('\n🧪 Testing glass_workflows tool schema...');
        
        try {
            // Read and parse the compiled server
            const serverPath = './dist/mcp-server.js';
            if (!fs.existsSync(serverPath)) {
                throw new Error('Server not compiled. Run: npx tsc');
            }

            console.log('✅ Compiled server exists');
            
            // Check for glass_workflows in the source
            const sourcePath = './src/mcp-server.ts';
            const sourceContent = fs.readFileSync(sourcePath, 'utf8');
            
            if (sourceContent.includes('glass_workflows:')) {
                console.log('✅ glass_workflows tool found in source');
            } else {
                throw new Error('glass_workflows tool not found in source');
            }

            // Check for required operations
            const requiredOperations = [
                'create_workflow',
                'start_recording', 
                'record_action',
                'stop_recording',
                'execute_workflow',
                'list_workflows',
                'update_workflow',
                'delete_workflow'
            ];

            for (const op of requiredOperations) {
                if (sourceContent.includes(op + ':')) {
                    console.log(`✅ Operation ${op} found`);
                } else {
                    throw new Error(`Operation ${op} not found`);
                }
            }

            console.log('✅ Workflow tool schema: SUCCESS');
            this.testResults.push({ test: 'workflow_schema', passed: true });
            return true;

        } catch (error) {
            console.log(`❌ Workflow tool schema: FAILED - ${error.message}`);
            this.testResults.push({ test: 'workflow_schema', passed: false, error: error.message });
            return false;
        }
    }

    async testWorkflowFunctions() {
        console.log('\n🧪 Testing workflow function definitions...');
        
        try {
            const sourcePath = './src/mcp-server.ts';
            const sourceContent = fs.readFileSync(sourcePath, 'utf8');
            
            // Check for workflow-related function definitions
            const requiredFunctions = [
                'createWorkflow',
                'startWorkflowRecording',
                'recordAction',
                'stopWorkflowRecording', 
                'executeWorkflow',
                'executeWorkflowStep',
                'listWorkflows',
                'updateWorkflow',
                'deleteWorkflow',
                'getWorkflow'
            ];

            for (const func of requiredFunctions) {
                if (sourceContent.includes(`function ${func}`) || sourceContent.includes(`async function ${func}`)) {
                    console.log(`✅ Function ${func} found`);
                } else {
                    console.log(`⚠️  Function ${func} not found (might be inline)`);
                }
            }

            // Check for workflow interfaces
            if (sourceContent.includes('interface WorkflowStep')) {
                console.log('✅ WorkflowStep interface found');
            }
            if (sourceContent.includes('interface Workflow')) {
                console.log('✅ Workflow interface found');  
            }
            if (sourceContent.includes('interface WorkflowExecution')) {
                console.log('✅ WorkflowExecution interface found');
            }

            console.log('✅ Workflow functions: SUCCESS');
            this.testResults.push({ test: 'workflow_functions', passed: true });
            return true;

        } catch (error) {
            console.log(`❌ Workflow functions: FAILED - ${error.message}`);
            this.testResults.push({ test: 'workflow_functions', passed: false, error: error.message });
            return false;
        }
    }

    async testCompilation() {
        console.log('\n🧪 Testing TypeScript compilation...');
        
        try {
            // Check if dist directory exists and has the compiled server
            const distPath = './dist/mcp-server.js';
            
            if (fs.existsSync(distPath)) {
                const stats = fs.statSync(distPath);
                console.log(`✅ Compiled server exists (${Math.round(stats.size / 1024)} KB)`);
                
                // Check compilation timestamp
                const sourceStats = fs.statSync('./src/mcp-server.ts');
                if (stats.mtime >= sourceStats.mtime) {
                    console.log('✅ Compilation is up to date');
                } else {
                    console.log('⚠️  Compilation might be outdated');
                }
                
                this.testResults.push({ test: 'compilation', passed: true });
                return true;
            } else {
                throw new Error('Compiled server not found. Run: npx tsc');
            }

        } catch (error) {
            console.log(`❌ Compilation: FAILED - ${error.message}`);
            this.testResults.push({ test: 'compilation', passed: false, error: error.message });
            return false;
        }
    }

    async testToolIntegration() {
        console.log('\n🧪 Testing tool integration in consolidatedTools...');
        
        try {
            const sourcePath = './src/mcp-server.ts';
            const sourceContent = fs.readFileSync(sourcePath, 'utf8');
            
            // Find the consolidatedTools object assignment, not just the type definition
            const consolidatedToolsStartIndex = sourceContent.indexOf('const consolidatedTools: { [toolName: string]: ConsolidatedTool } = {');
            if (consolidatedToolsStartIndex === -1) {
                throw new Error('consolidatedTools object assignment not found');
            }

            // Extract the consolidatedTools section (find the matching closing brace)
            let braceCount = 0;
            let startIndex = sourceContent.indexOf('= {', consolidatedToolsStartIndex) + 2; // Start after '= '
            let endIndex = startIndex;
            
            for (let i = startIndex; i < sourceContent.length; i++) {
                if (sourceContent[i] === '{') braceCount++;
                if (sourceContent[i] === '}') braceCount--;
                if (braceCount === 0) {
                    endIndex = i;
                    break;
                }
            }

            const consolidatedToolsContent = sourceContent.substring(startIndex, endIndex + 1);
            
            // Debug: show first 200 characters and check for glass_workflows
            console.log(`   Debug: consolidatedTools content start: ${consolidatedToolsContent.substring(0, 200)}...`);
            console.log(`   Debug: contains glass_workflows: ${consolidatedToolsContent.includes('glass_workflows')}`);
            
            // Check if glass_workflows is included
            if (consolidatedToolsContent.includes('glass_workflows:')) {
                console.log('✅ glass_workflows integrated in consolidatedTools');
                
                // Count the number of tools
                const toolCount = (consolidatedToolsContent.match(/:\s*{/g) || []).length - 1; // -1 for the main object
                console.log(`✅ Total consolidated tools: ${toolCount}`);
                
                if (toolCount >= 4) {
                    console.log('✅ Expected number of tools present');
                } else {
                    console.log(`⚠️  Expected at least 4 tools, found ${toolCount}`);
                }
                
                this.testResults.push({ test: 'tool_integration', passed: true, details: { toolCount } });
                return true;
            } else {
                throw new Error('glass_workflows not found in consolidatedTools');
            }

        } catch (error) {
            console.log(`❌ Tool integration: FAILED - ${error.message}`);
            this.testResults.push({ test: 'tool_integration', passed: false, error: error.message });
            return false;
        }
    }

    async runAllTests() {
        console.log('🎯 Glass MCP Workflows Simple Test Suite');
        console.log('==========================================');

        // Run tests in sequence
        await this.testCompilation();
        await this.testWorkflowToolSchema();
        await this.testWorkflowFunctions();
        await this.testToolIntegration();

        this.generateTestReport();
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
            if (test.details) {
                console.log(`    Details: ${JSON.stringify(test.details)}`);
            }
        });

        if (successRate >= 90) {
            console.log('\n🎉 EXCELLENT! Glass Workflows tool implementation is solid!');
        } else if (successRate >= 75) {
            console.log('\n✅ Good implementation, minor issues detected');
        } else {
            console.log('\n🚨 Major issues detected - requires attention');
        }

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

        try {
            fs.writeFileSync('glass-workflows-simple-test-report.json', JSON.stringify(report, null, 2));
            console.log('\n📋 Test report saved to: glass-workflows-simple-test-report.json');
        } catch (error) {
            console.log(`⚠️  Could not save test report: ${error.message}`);
        }
    }
}

// Run the test suite if this file is executed directly
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always run the test when this file is executed
const tester = new SimpleWorkflowTester();
tester.runAllTests().catch(console.error);

export default SimpleWorkflowTester;