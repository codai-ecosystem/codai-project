"""
MemorAI MCP Server - Basic Integration Example (Python)

This example demonstrates basic memory operations including:
- Authentication setup
- Storing memories
- Retrieving memories 
- Error handling
- Rate limiting

Requirements:
    pip install requests aiohttp asyncio python-dotenv

Usage:
    python basic_integration.py
"""

import asyncio
import json
import os
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
import logging

import requests
import aiohttp
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class MemorAIClient:
    """MemorAI MCP Server client for Python applications."""
    
    def __init__(
        self, 
        api_key: str, 
        base_url: str = "https://api.memorai.com/v1",
        timeout: int = 30
    ):
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        
        # Setup session with default headers
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'User-Agent': 'MemorAI-Python-Client/1.0.0'
        })
        self.session.timeout = timeout

    def _handle_error(self, response: requests.Response) -> None:
        """Handle API errors with detailed logging."""
        try:
            error_data = response.json()
            error_info = error_data.get('error', {})
            
            logger.error(f"❌ API Error {response.status_code}: {error_info.get('message', 'Unknown error')}")
            
            # Handle specific error types
            if response.status_code == 401:
                logger.error("🔐 Authentication failed - check your API key")
            elif response.status_code == 429:
                logger.error("⏳ Rate limit exceeded - implement retry logic")
                reset_time = response.headers.get('X-RateLimit-Reset')
                if reset_time:
                    logger.error(f"⏰ Rate limit resets at: {reset_time}")
            elif response.status_code == 400:
                logger.error("📝 Invalid request - check your parameters")
                if 'details' in error_info:
                    logger.error(f"Details: {error_info['details']}")
            elif response.status_code >= 500:
                logger.error("🔥 Server error - try again later")
                
        except json.JSONDecodeError:
            logger.error(f"❌ HTTP {response.status_code}: {response.text}")

    def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict] = None,
        params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Make HTTP request with error handling."""
        url = f"{self.base_url}{endpoint}"
        
        logger.info(f"🚀 Making {method.upper()} request to {endpoint}")
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, params=params)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data, params=params)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, params=params)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            if response.ok:
                logger.info(f"✅ Request successful: {response.status_code} {response.reason}")
                return response.json()
            else:
                self._handle_error(response)
                response.raise_for_status()
                
        except requests.exceptions.Timeout:
            logger.error("⏰ Request timed out")
            raise
        except requests.exceptions.ConnectionError:
            logger.error("🌐 Connection error")
            raise
        except requests.exceptions.RequestException as e:
            logger.error(f"🔥 Request failed: {e}")
            raise

    def health_check(self) -> Dict[str, Any]:
        """Check server health."""
        logger.info("🏥 Checking server health...")
        result = self._make_request('GET', '/health')
        logger.info(f"Health status: {result.get('status', 'unknown')}")
        return result

    def remember_memory(
        self, 
        agent_id: str, 
        content: str, 
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Store a new memory."""
        if not agent_id:
            raise ValueError("Agent ID is required")
        if not content:
            raise ValueError("Memory content is required")
            
        payload = {
            'agentId': agent_id,
            'content': content,
            'metadata': {
                'importance': 5,
                'tags': [],
                'timestamp': datetime.now(timezone.utc).isoformat(),
                **(metadata or {})
            }
        }
        
        logger.info(f"🧠 Storing memory for agent: {agent_id}")
        result = self._make_request('POST', '/api/memory/remember', data=payload)
        
        logger.info(f"✨ Memory stored successfully: {result.get('memoryId')}")
        return result

    def recall_memories(
        self,
        agent_id: str,
        query: str,
        limit: int = 10,
        min_importance: int = 0,
        project: Optional[str] = None,
        session: Optional[str] = None,
        include_other_agents: bool = False
    ) -> Dict[str, Any]:
        """Retrieve memories using search."""
        if not agent_id:
            raise ValueError("Agent ID is required")
        if not query:
            raise ValueError("Search query is required")
            
        params = {
            'agentId': agent_id,
            'query': query,
            'limit': limit,
            'minImportance': min_importance,
            'includeOtherAgents': include_other_agents
        }
        
        if project:
            params['project'] = project
        if session:
            params['session'] = session
            
        logger.info(f"🔍 Searching memories for: {query}")
        result = self._make_request('GET', '/api/memory/recall', params=params)
        
        logger.info(f"📚 Found {result.get('totalResults', 0)} memories in {result.get('searchTime', 0)}ms")
        return result

    def get_context(self, agent_id: str, context_size: int = 5) -> Dict[str, Any]:
        """Get recent context for an agent."""
        if not agent_id:
            raise ValueError("Agent ID is required")
            
        params = {
            'agentId': agent_id,
            'contextSize': context_size
        }
        
        logger.info(f"📖 Getting context for agent: {agent_id}")
        result = self._make_request('GET', '/api/memory/context', params=params)
        
        logger.info(f"📝 Retrieved context with {result.get('contextSize', 0)} memories")
        return result

    def forget_memory(self, agent_id: str, structured_key: str) -> Dict[str, Any]:
        """Delete a memory."""
        if not agent_id:
            raise ValueError("Agent ID is required")
        if not structured_key:
            raise ValueError("Structured key is required")
            
        params = {
            'agentId': agent_id,
            'structuredKey': structured_key
        }
        
        logger.info(f"🗑️ Deleting memory: {structured_key}")
        result = self._make_request('DELETE', '/api/memory/forget', params=params)
        
        logger.info("✅ Memory deleted successfully")
        return result

    def batch_remember_memories(
        self, 
        agent_id: str, 
        memories: List[Dict[str, Any]]
    ) -> List[Optional[Dict[str, Any]]]:
        """Store multiple memories in batch."""
        logger.info(f"📦 Batch storing {len(memories)} memories...")
        
        results = []
        successful = 0
        
        for i, memory in enumerate(memories):
            try:
                result = self.remember_memory(
                    agent_id, 
                    memory['content'], 
                    memory.get('metadata', {})
                )
                results.append(result)
                successful += 1
                logger.info(f"  ✅ {i + 1}/{len(memories)}: {memory['content'][:50]}...")
            except Exception as e:
                logger.error(f"  ❌ {i + 1}/{len(memories)}: Failed - {e}")
                results.append(None)
        
        logger.info(f"📊 Batch operation completed: {successful}/{len(memories)} successful")
        return results


def basic_integration_example():
    """Demonstrate basic MemorAI integration."""
    print("🚀 MemorAI Basic Integration Example")
    print("=====================================")
    
    # Initialize client
    api_key = os.getenv('MEMORAI_API_KEY', 'your-api-key-here')
    client = MemorAIClient(api_key)
    
    try:
        # 1. Health check
        print("\n1. Checking server health...")
        health = client.health_check()
        print(f"   Status: {health.get('status', 'unknown')}")
        print(f"   Version: {health.get('version', 'unknown')}")
        
        # 2. Store sample memories
        print("\n2. Storing sample memories...")
        
        import random
        agent_id = f"demo-agent-{random.randint(1000, 9999)}"
        
        memory1 = client.remember_memory(
            agent_id,
            "We discussed the new project architecture. The client wants a scalable microservices solution.",
            {
                'importance': 8,
                'tags': ['meeting', 'architecture', 'microservices'],
                'project': 'client-project-alpha',
                'session': 'meeting-2025-08-27'
            }
        )
        
        memory2 = client.remember_memory(
            agent_id,
            "Implemented Redis caching to improve response times. Saw 40% improvement in API performance.",
            {
                'importance': 7,
                'tags': ['redis', 'caching', 'performance'],
                'project': 'client-project-alpha',
                'entityType': 'technical_implementation'
            }
        )
        
        memory3 = client.remember_memory(
            agent_id,
            "Client feedback: They love the new dashboard design. Requested mobile optimization.",
            {
                'importance': 6,
                'tags': ['feedback', 'dashboard', 'mobile'],
                'project': 'client-project-alpha',
                'priority': 'high'
            }
        )
        
        # 3. Search for memories
        print("\n3. Searching for memories...")
        
        # Search by topic
        architecture_memories = client.recall_memories(
            agent_id, 
            'architecture microservices',
            limit=5
        )
        
        print("🏗️ Architecture-related memories:")
        for i, memory in enumerate(architecture_memories.get('memories', [])):
            relevance = memory.get('relevanceScore', 0)
            content = memory.get('content', '')[:80] + '...'
            tags = ', '.join(memory.get('metadata', {}).get('tags', []))
            timestamp = memory.get('timestamp', '')
            print(f"  {i+1}. [{relevance:.2f}] {content}")
            print(f"     📅 {timestamp} | 🏷️ {tags or 'No tags'}")
        
        # Search by project
        project_memories = client.recall_memories(
            agent_id,
            'client project',
            limit=10,
            project='client-project-alpha'
        )
        
        print("\n📁 Project-related memories:")
        for i, memory in enumerate(project_memories.get('memories', [])):
            relevance = memory.get('relevanceScore', 0)
            content = memory.get('content', '')[:80] + '...'
            print(f"  {i+1}. [{relevance:.2f}] {content}")
        
        # 4. Get recent context
        print("\n4. Getting recent context...")
        context = client.get_context(agent_id, 3)
        
        print(f"📚 Recent context ({context.get('contextSize', 0)} memories):")
        for i, memory in enumerate(context.get('memories', [])):
            content = memory.get('content', '')[:100] + '...'
            timestamp = memory.get('timestamp', '')
            importance = memory.get('metadata', {}).get('importance', 0)
            print(f"  {i+1}. {content}")
            print(f"     📅 {timestamp} | 💯 Importance: {importance}")
        
        if 'summary' in context:
            print(f"\n📝 Context Summary: {context['summary']}")
        
        # 5. Demonstrate error handling
        print("\n5. Demonstrating error handling...")
        
        try:
            # Try to recall with invalid agent ID
            client.recall_memories('', 'test query')
        except ValueError as e:
            print(f"✅ Error handling working correctly: {e}")
        
        # 6. Batch operations example
        print("\n6. Demonstrating batch operations...")
        
        batch_memories = [
            {
                'content': 'Database performance optimization completed. Query execution time reduced by 60%.',
                'metadata': {'importance': 7, 'tags': ['database', 'performance', 'optimization']}
            },
            {
                'content': 'Security audit passed. All vulnerabilities have been addressed.',
                'metadata': {'importance': 9, 'tags': ['security', 'audit', 'compliance']}
            },
            {
                'content': 'New feature deployment scheduled for next week. QA testing in progress.',
                'metadata': {'importance': 6, 'tags': ['deployment', 'feature', 'qa']}
            }
        ]
        
        batch_results = client.batch_remember_memories(agent_id, batch_memories)
        successful_count = sum(1 for r in batch_results if r is not None)
        print(f"   Batch operation: {successful_count}/{len(batch_memories)} successful")
        
        print("\n🎉 Basic integration example completed successfully!")
        print("\nNext Steps:")
        print("- Explore advanced memory management features")
        print("- Check out analytics dashboard integration")
        print("- Learn about network synchronization")
        print("- Review best practices documentation")
        
    except Exception as e:
        logger.error(f"💥 Example failed: {e}")
        return False
    
    return True


def advanced_search_example(client: MemorAIClient, agent_id: str):
    """Demonstrate advanced search capabilities."""
    print("\n🔬 Advanced Search Examples")
    print("============================")
    
    # Complex query with filters
    results = client.recall_memories(
        agent_id,
        'performance optimization caching',
        limit=20,
        min_importance=5
    )
    
    print(f"🎯 High-importance performance memories: {len(results.get('memories', []))}")
    
    # Project-specific search
    project_results = client.recall_memories(
        agent_id,
        'architecture',
        project='client-project-alpha',
        limit=15
    )
    
    print(f"📁 Project architecture memories: {len(project_results.get('memories', []))}")
    
    # Session-based search
    session_results = client.recall_memories(
        agent_id,
        'meeting discussion',
        session='meeting-2025-08-27',
        limit=10
    )
    
    print(f"💬 Meeting session memories: {len(session_results.get('memories', []))}")


if __name__ == "__main__":
    success = basic_integration_example()
    if not success:
        exit(1)