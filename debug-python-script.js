const path = require('path');
const ROMAI_CONFIG = {
  romaiPath: process.env.ROMAI_PATH || '/app/romai-src'
};

function generatePythonImportCode(modulePath, functionName) {
  if (modulePath.includes('intelligence_integrator')) {
    return `
try:
    from ml.intelligence.intelligence_integrator import intelligence_integrator

    async def ${functionName}(data):
        try:
            if '${functionName}' == 'analyze_memory_patterns':
                return await intelligence_integrator.analyze_patterns(data)
            elif '${functionName}' == 'process_intelligence_request':
                return await intelligence_integrator.process_request(data)
            else:
                return await intelligence_integrator.integrate_intelligence(data)
        except Exception as exec_error:
            return {'error': f'Function execution failed: {str(exec_error)}', 'function': '${functionName}'}
except ImportError as import_error:
    async def ${functionName}(data):
        return {'error': f'Import failed: {str(import_error)}', 'fallback': True}
except Exception as setup_error:
    async def ${functionName}(data):
        return {'error': f'Setup failed: {str(setup_error)}', 'fallback': True}
`;
  }
  return 'No import code generated';
}

const modulePath = 'ml/intelligence/intelligence_integrator.py';
const functionName = 'process_intelligence_request';
const data = {query: 'test', context: {}};

const fullPath = path.join(ROMAI_CONFIG.romaiPath, modulePath);
const pythonScript = `
import sys
import os
import json
import asyncio
sys.path.append('${ROMAI_CONFIG.romaiPath}')
sys.path.append('${path.dirname(fullPath)}')

# Import based on the module path
${generatePythonImportCode(modulePath, functionName)}

async def main():
    try:
        # Parse input data
        data = json.loads('''${JSON.stringify(data)}''')

        # Call the function
        if asyncio.iscoroutinefunction(${functionName}):
            result = await ${functionName}(data)
        else:
            result = ${functionName}(data)

        # Return the result
        print(json.dumps(result, default=str))

    except Exception as error:
        error_result = {
            'error': str(error),
            'type': type(error).__name__,
            'module': '${modulePath}',
            'function': '${functionName}'
        }
        print(json.dumps(error_result, default=str))

if __name__ == '__main__':
    asyncio.run(main())
`;

console.log('Generated Python script:');
console.log(pythonScript);