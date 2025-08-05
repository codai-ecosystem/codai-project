"""
Hybrid API Client - Week 1 Day 3
Interface between Next.js API routes and the Hybrid Orchestrator

This script receives JSON input from stdin and returns JSON output to stdout
for seamless integration with the Next.js API routes.
"""

import sys
import json
import asyncio
import traceback
from pathlib import Path

# Add parent directories to path for imports
sys.path.append(str(Path(__file__).parent.parent.parent))
from api.orchestration.hybrid_orchestrator import HybridOrchestrator, UserRequest

# Fix Windows console encoding for Romanian characters
import io
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

async def process_hybrid_request(request_data):
    """Process a hybrid request using the orchestrator"""
    try:
        # Create orchestrator instance
        orchestrator = HybridOrchestrator()
        
        # Create user request from input data
        user_request = UserRequest(
            query=request_data.get('query', ''),
            user_id=request_data.get('user_id'),
            session_id=request_data.get('session_id'),
            preferences=request_data.get('preferences', {}),
            context=request_data.get('context', {}),
            timestamp=request_data.get('timestamp')
        )
        
        # Process the request
        response = await orchestrator.process_request(user_request)
        
        # Convert response to dictionary for JSON serialization
        return response.to_dict()
        
    except Exception as e:
        # Return error response
        return {
            'response': f'Îmi pare rău, am întâmpinat o problemă în procesare: {str(e)}',
            'processing_path': 'error_fallback',
            'processing_time': 0.01,
            'cultural_context': {},
            'performance_metrics': {'error': True, 'error_type': type(e).__name__},
            'confidence': 0.0,
            'cost_estimate': 0.0,
            'status': 'failed',
            'suggestions': ['Încearcă din nou cu o întrebare mai simplă'],
            'cache_hit': False,
            'error_message': str(e)
        }

def main():
    """Main function to handle stdin/stdout communication"""
    try:
        # Read input from stdin
        input_data = sys.stdin.read().strip()
        
        if not input_data:
            raise ValueError("No input data received")
        
        # Parse JSON input
        request_data = json.loads(input_data)
        
        # Process request asynchronously
        response = asyncio.run(process_hybrid_request(request_data))
        
        # Output JSON response to stdout
        print(json.dumps(response, ensure_ascii=True, indent=None))
        
    except json.JSONDecodeError as e:
        error_response = {
            'response': 'Eroare în parsarea cererii',
            'processing_path': 'json_error',
            'processing_time': 0.001,
            'cultural_context': {},
            'performance_metrics': {'json_error': True},
            'confidence': 0.0,
            'cost_estimate': 0.0,
            'status': 'failed',
            'suggestions': [],
            'cache_hit': False,
            'error_message': f'JSON parse error: {str(e)}'
        }
        print(json.dumps(error_response, ensure_ascii=False))
        
    except Exception as e:
        error_response = {
            'response': f'Eroare internă: {str(e)}',
            'processing_path': 'internal_error',
            'processing_time': 0.001,
            'cultural_context': {},
            'performance_metrics': {'internal_error': True},
            'confidence': 0.0,
            'cost_estimate': 0.0,
            'status': 'failed',
            'suggestions': [],
            'cache_hit': False,
            'error_message': str(e)
        }
        print(json.dumps(error_response, ensure_ascii=False))
        
        # Also print to stderr for debugging
        print(f"Error in hybrid API client: {e}", file=sys.stderr)
        print(traceback.format_exc(), file=sys.stderr)

if __name__ == "__main__":
    main()
