"""
RomAI API Client for Competitive Analysis
========================================

Direct API client for connecting to RomAI AGI Model Server with proper endpoint handling.

Author: GitHub Copilot Agent
Date: August 21, 2025
Status: Production Implementation
"""

import asyncio
import json
import logging
from dataclasses import dataclass
from typing import Dict, List, Optional, Any
import aiohttp
import requests

logger = logging.getLogger(__name__)

@dataclass
class RomAIResponse:
    """Response from RomAI API"""
    content: str
    reasoning_steps: Optional[List[str]] = None
    confidence: Optional[float] = None
    performance_metrics: Optional[Dict[str, Any]] = None
    success: bool = True
    error: Optional[str] = None

class RomAIAPIClient:
    """Direct client for RomAI AGI Model Server"""
    
    def __init__(self, base_url: str = "http://localhost:6101"):
        self.base_url = base_url
        self.session = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def check_health(self) -> bool:
        """Check if RomAI server is healthy"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False
    
    async def generate_response(self, prompt: str, task_type: str = "general") -> RomAIResponse:
        """Generate response using RomAI inference endpoint"""
        
        # Choose appropriate endpoint based on task type
        if task_type in ["reasoning", "logic", "analysis"]:
            endpoint = "/reasoning"
        else:
            endpoint = "/inference"
            
        payload = {
            "text": prompt,
            "task_type": task_type,
            "max_tokens": 1000,
            "temperature": 0.1,  # Lower temperature for consistent testing
            "language": "en"
        }
        
        try:
            if not self.session:
                self.session = aiohttp.ClientSession()
                
            async with self.session.post(
                f"{self.base_url}{endpoint}",
                json=payload,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return RomAIResponse(
                        content=data.get("text", data.get("response", "")),
                        reasoning_steps=data.get("reasoning_steps", []),
                        confidence=data.get("confidence", 0.0),
                        performance_metrics=data.get("performance_metrics", {}),
                        success=True
                    )
                else:
                    error_text = await response.text()
                    logger.error(f"API Error {response.status}: {error_text}")
                    return RomAIResponse(
                        content="",
                        success=False,
                        error=f"HTTP {response.status}: {error_text}"
                    )
                    
        except Exception as e:
            logger.error(f"Request failed: {e}")
            return RomAIResponse(
                content="",
                success=False,
                error=str(e)
            )
    
    def generate_response_sync(self, prompt: str, task_type: str = "general") -> RomAIResponse:
        """Synchronous wrapper for generate_response using requests directly"""
        try:
            # Use requests library directly to avoid event loop conflicts
            endpoint = "/reasoning" if task_type in ["reasoning", "logic", "analysis"] else "/inference"
            
            payload = {
                "text": prompt,
                "task_type": task_type,
                "max_tokens": 1000,
                "temperature": 0.1,
                "language": "en"
            }
            
            response = requests.post(
                f"{self.base_url}{endpoint}",
                json=payload,
                timeout=30,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                return RomAIResponse(
                    content=data.get("text", data.get("response", "")),
                    reasoning_steps=data.get("reasoning_steps", []),
                    confidence=data.get("confidence", 0.0),
                    performance_metrics=data.get("performance_metrics", {}),
                    success=True,
                    error=None
                )
            else:
                return RomAIResponse(
                    content="",
                    success=False,
                    error=f"HTTP {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            logger.error(f"Sync request failed: {e}")
            return RomAIResponse(
                content="",
                success=False,
                error=str(e)
            )
    
    async def _async_generate(self, prompt: str, task_type: str) -> RomAIResponse:
        """Internal async method"""
        async with aiohttp.ClientSession() as session:
            endpoint = "/reasoning" if task_type in ["reasoning", "logic", "analysis"] else "/inference"
            
            payload = {
                "text": prompt,
                "task_type": task_type,
                "max_tokens": 1000,
                "temperature": 0.1,
                "language": "en"
            }
            
            try:
                async with session.post(
                    f"{self.base_url}{endpoint}",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return RomAIResponse(
                            content=data.get("text", data.get("response", "")),
                            reasoning_steps=data.get("reasoning_steps", []),
                            confidence=data.get("confidence", 0.0),
                            performance_metrics=data.get("performance_metrics", {}),
                            success=True
                        )
                    else:
                        error_text = await response.text()
                        return RomAIResponse(
                            content="",
                            success=False,
                            error=f"HTTP {response.status}: {error_text}"
                        )
            except Exception as e:
                return RomAIResponse(
                    content="",
                    success=False,
                    error=str(e)
                )

# Test the client if run directly
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    client = RomAIAPIClient()
    
    # Test health
    print("🏥 Testing RomAI Health...")
    if client.check_health():
        print("✅ RomAI Server is healthy")
    else:
        print("❌ RomAI Server is not responding")
        exit(1)
    
    # Test inference
    print("\n🧠 Testing RomAI Inference...")
    response = client.generate_response_sync("What is 2 + 2?", "math")
    if response.success:
        print(f"✅ Inference successful: {response.content}")
        print(f"   Confidence: {response.confidence}")
    else:
        print(f"❌ Inference failed: {response.error}")
    
    # Test reasoning
    print("\n🤔 Testing RomAI Reasoning...")
    response = client.generate_response_sync(
        "If all cats are mammals and some mammals are pets, what can we conclude about cats?",
        "reasoning"
    )
    if response.success:
        print(f"✅ Reasoning successful: {response.content}")
        if response.reasoning_steps:
            print(f"   Reasoning steps: {len(response.reasoning_steps)}")
    else:
        print(f"❌ Reasoning failed: {response.error}")
    
    print("\n🎯 RomAI API Client test completed!")