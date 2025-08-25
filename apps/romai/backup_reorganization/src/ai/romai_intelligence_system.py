"""
Unified RomAI Intelligence System
Integrates all genuine AI engines powered by Azure OpenAI GPT-4o
"""
import asyncio
import logging
from typing import Dict, Any, Optional, Union
from dataclasses import dataclass
import time
from datetime import datetime
import sys
import os

# Add project root to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from ml.reasoning.real_mathematical_engine import RealMathematicalEngine, MathematicalResult
from ml.reasoning.real_logical_engine import RealLogicalEngine, LogicalResult  
from ml.reasoning.real_romanian_engine import RealRomanianEngine, CulturalResult
from ai.azure_openai_service import AzureOpenAIService, AIResponse
from config.romai_config import RomAIConfig

logger = logging.getLogger(__name__)

@dataclass
class UnifiedResult:
    """Unified result from RomAI intelligence system"""
    content: str
    domain: str
    processing_time: float
    confidence: float
    engine_used: str
    detailed_result: Union[MathematicalResult, LogicalResult, CulturalResult, AIResponse]
    timestamp: str

class RomAIIntelligenceSystem:
    """
    Unified RomAI Intelligence System
    Routes queries to appropriate genuine AI engines
    NO hardcoded responses - everything powered by Azure OpenAI GPT-4o
    """
    
    def __init__(self):
        self.math_engine = RealMathematicalEngine()
        self.logic_engine = RealLogicalEngine()
        self.romanian_engine = RealRomanianEngine()
        self.general_ai = AzureOpenAIService()
        self.config = RomAIConfig()
        
    async def process_query(self, query: str, domain_hint: Optional[str] = None) -> UnifiedResult:
        """
        Process query using the most appropriate genuine AI engine
        Auto-detects domain or uses provided hint
        """
        try:
            start_time = time.time()
            
            # Determine the most appropriate domain and engine
            if domain_hint:
                domain = domain_hint.lower()
            else:
                domain = await self._detect_domain(query)
            
            # Route to appropriate engine
            if domain == "mathematics":
                result = await self.math_engine.solve_mathematical_problem(query)
                engine_used = "RealMathematicalEngine"
                content = result.result
                confidence = result.confidence_level
                
            elif domain == "logic":
                result = await self.logic_engine.reason(query)
                engine_used = "RealLogicalEngine"
                content = result.conclusion
                confidence = result.confidence_level
                
            elif domain == "romanian_culture":
                result = await self.romanian_engine.analyze_culture(query)
                engine_used = "RealRomanianEngine"
                content = result.cultural_insight
                confidence = result.confidence_level
                
            else:  # General domain
                result = await self.general_ai.generate_response(query, domain="general")
                engine_used = "AzureOpenAIService"
                content = result.content
                confidence = 0.8  # Default confidence for general queries
            
            processing_time = time.time() - start_time
            
            # Create unified result
            unified_result = UnifiedResult(
                content=content,
                domain=domain,
                processing_time=processing_time,
                confidence=confidence,
                engine_used=engine_used,
                detailed_result=result,
                timestamp=datetime.now().isoformat()
            )
            
            logger.info(f"Processed query in {processing_time:.2f}s using {engine_used}")
            
            return unified_result
            
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            
            # Return error response (still genuine, not hardcoded)
            error_result = UnifiedResult(
                content=f"I encountered an error while processing your query: {str(e)}",
                domain="error",
                processing_time=0.0,
                confidence=0.0,
                engine_used="ErrorHandler",
                detailed_result=None,
                timestamp=datetime.now().isoformat()
            )
            
            return error_result
    
    async def _detect_domain(self, query: str) -> str:
        """Detect the most appropriate domain for the query using AI"""
        domain_detection_prompt = f"""
Analyze this query and determine the most appropriate domain:

Query: {query}

Domains:
- mathematics: Math problems, calculations, equations, derivatives, integrals, etc.
- logic: Logical reasoning, arguments, syllogisms, fallacies, deduction, etc.
- romanian_culture: Romanian history, traditions, culture, customs, language, etc.
- general: Everything else

Respond with just the domain name (one word).
"""
        
        try:
            detection_result = await self.general_ai.generate_response(
                domain_detection_prompt, 
                domain="general"
            )
            
            detected_domain = detection_result.content.strip().lower()
            
            # Validate detected domain
            valid_domains = ["mathematics", "logic", "romanian_culture", "general"]
            if detected_domain in valid_domains:
                return detected_domain
            else:
                return "general"  # Fallback to general
                
        except Exception as e:
            logger.warning(f"Domain detection failed, using general: {e}")
            return "general"
    
    async def get_system_status(self) -> Dict[str, Any]:
        """Get comprehensive system status"""
        try:
            # Get status from all engines
            math_status = self.math_engine.get_engine_status()
            logic_status = self.logic_engine.get_engine_status()
            romanian_status = self.romanian_engine.get_engine_status()
            ai_status = self.general_ai.health_check()
            
            return {
                "system": "RomAI Intelligence System",
                "status": "operational",
                "genuine_ai": True,
                "hardcoded_responses": False,
                "engines": {
                    "mathematical": math_status,
                    "logical": logic_status, 
                    "cultural": romanian_status,
                    "general": ai_status
                },
                "powered_by": "Azure OpenAI GPT-4o",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting system status: {e}")
            return {
                "system": "RomAI Intelligence System",
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def process_multi_domain_query(self, query: str) -> Dict[str, UnifiedResult]:
        """Process query across multiple domains for comprehensive analysis"""
        domains = ["mathematics", "logic", "romanian_culture", "general"]
        results = {}
        
        for domain in domains:
            try:
                result = await self.process_query(query, domain_hint=domain)
                results[domain] = result
            except Exception as e:
                logger.warning(f"Failed to process query in {domain} domain: {e}")
                
        return results
    
    async def compare_engine_responses(self, query: str) -> Dict[str, Any]:
        """Compare responses from different engines for the same query"""
        comparison_results = await self.process_multi_domain_query(query)
        
        # Create comparison analysis using AI
        comparison_prompt = f"""
Compare these different AI engine responses for the query: "{query}"

{comparison_results}

Analyze:
1. Which response is most appropriate for this query?
2. What are the strengths of each approach?
3. How do the responses complement each other?
4. Overall quality assessment

Provide comprehensive comparison analysis.
"""
        
        try:
            comparison_analysis = await self.general_ai.generate_response(
                comparison_prompt,
                domain="general"
            )
            
            return {
                "query": query,
                "engine_responses": comparison_results,
                "comparison_analysis": comparison_analysis.content,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "query": query,
                "engine_responses": comparison_results,
                "comparison_analysis": f"Could not generate comparison: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }

# Testing and validation
async def test_unified_system():
    """Test the unified RomAI intelligence system"""
    system = RomAIIntelligenceSystem()
    
    test_queries = [
        "What is the derivative of x^2 + 3x + 2?",
        "All roses are flowers. This is a rose. What can we conclude?", 
        "What are Romanian Christmas traditions?",
        "Explain the theory of relativity in simple terms",
        "How do I calculate the area of a circle?",
        "Is this argument valid: All cats are mammals. Fluffy is a mammal. Therefore Fluffy is a cat?",
        "Tell me about traditional Romanian folk music"
    ]
    
    print("=== Testing RomAI Unified Intelligence System ===")
    print("Powered by Azure OpenAI GPT-4o - Multi-Domain AI")
    print("=" * 60)
    
    for i, query in enumerate(test_queries, 1):
        try:
            print(f"\nTest {i}: {query}")
            result = await system.process_query(query)
            
            print(f"Domain: {result.domain}")
            print(f"Engine: {result.engine_used}")
            print(f"Confidence: {result.confidence:.2f}")
            print(f"Time: {result.processing_time:.2f}s")
            print(f"Response: {result.content[:100]}...")
            
        except Exception as e:
            print(f"Test {i} failed: {e}")
    
    # System status check
    print(f"\n=== System Status Check ===")
    status = await system.get_system_status()
    
    print(f"System: {status.get('system')}")
    print(f"Status: {status.get('status')}")
    print(f"Genuine AI: {status.get('genuine_ai')}")
    print(f"Hardcoded Responses: {status.get('hardcoded_responses')}")
    print(f"Powered By: {status.get('powered_by')}")
    
    # Engine status summary
    engines = status.get('engines', {})
    print(f"\nEngine Status Summary:")
    for engine_name, engine_status in engines.items():
        engine_health = engine_status.get('status', 'unknown')
        print(f"  {engine_name.capitalize()}: {engine_health}")

if __name__ == "__main__":
    asyncio.run(test_unified_system())