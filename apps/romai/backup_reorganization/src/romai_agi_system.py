"""
🧠 RomAI AGI System - Main Integration Class
============================================

Unified interface for Romanian Artificial General Intelligence system.
Integrates all reasoning engines into a cohesive AGI platform.
"""

import asyncio
import logging
from typing import Dict, Any, Optional, Union, List
from dataclasses import dataclass
from pathlib import Path
import sys

# Add current directory for imports
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

logger = logging.getLogger(__name__)

@dataclass
class RomAIConfig:
    """Configuration for RomAI system"""
    enable_math_engine: bool = True
    enable_logic_engine: bool = True
    enable_cultural_engine: bool = True
    enable_creative_engine: bool = True
    enable_multimodal: bool = True
    log_level: str = "INFO"
    max_retries: int = 3
    timeout_seconds: float = 30.0

@dataclass  
class RomAIResponse:
    """Unified response format for RomAI operations"""
    result: Any
    engine_used: str
    confidence: float
    processing_time: float
    success: bool
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class RomAI:
    """
    Romanian Artificial General Intelligence System
    
    Provides unified interface to mathematical reasoning, logical reasoning,
    Romanian cultural intelligence, and creative capabilities.
    """
    
    def __init__(self, config: Optional[RomAIConfig] = None):
        """Initialize RomAI with configuration"""
        self.config = config or RomAIConfig()
        
        # Configure logging
        logging.basicConfig(level=getattr(logging, self.config.log_level.upper()))
        logger.info("🧠 Initializing RomAI AGI System...")
        
        # Initialize engine references
        self._math_engine = None
        self._logic_engine = None
        self._cultural_engine = None
        self._creative_engine = None
        self._cross_modal_engine = None
        
        # Track initialization status
        self._engines_status = {}
        self._initialized = False
        
        # Initialize engines synchronously
        self._initialize_engines_sync()
        
    def _initialize_engines_sync(self):
        """Initialize all engines synchronously during construction"""
        logger.info("🔧 Loading reasoning engines synchronously...")
        
        # Mathematical Engine
        try:
            from ml.reasoning.autonomous_math_engine import AutonomousMathEngine
            self._math_engine = AutonomousMathEngine()
            self._engines_status['math'] = True
            logger.info("✅ Mathematical reasoning engine loaded")
        except Exception as e:
            logger.warning(f"⚠️ Mathematical engine failed: {e}")
            self._engines_status['math'] = False
        
        # Logical Engine
        try:
            from ml.reasoning.autonomous_logical_engine import AutonomousLogicalEngine
            self._logic_engine = AutonomousLogicalEngine()
            self._engines_status['logic'] = True
            logger.info("✅ Logical reasoning engine loaded")
        except Exception as e:
            logger.warning(f"⚠️ Logical engine failed: {e}")
            self._engines_status['logic'] = False
        
        # Romanian Cultural Engine
        try:
            from ml.reasoning.real_romanian_engine_simple import RealRomanianEngine
            self._cultural_engine = RealRomanianEngine()
            self._engines_status['cultural'] = True
            logger.info("✅ Romanian cultural engine loaded")
        except Exception as e:
            logger.warning(f"⚠️ Romanian cultural engine failed: {e}")
            self._engines_status['cultural'] = False
        
        # Creative Engine  
        try:
            from ml.reasoning.creative_intelligence_system import CreativeIntelligenceSystem
            self._creative_engine = CreativeIntelligenceSystem()
            self._engines_status['creative'] = True
            logger.info("✅ Creative intelligence engine loaded")
        except Exception as e:
            logger.warning(f"⚠️ Creative engine failed: {e}")
            self._engines_status['creative'] = False
        
        # Cross-Modal Engine
        try:
            from ml.reasoning.cross_modal_knowledge_integration_engine import CrossModalKnowledgeIntegrationEngine
            self._cross_modal_engine = CrossModalKnowledgeIntegrationEngine()
            self._engines_status['multimodal'] = True
            logger.info("✅ Cross-modal integration engine loaded")
        except Exception as e:
            logger.warning(f"⚠️ Cross-modal engine failed: {e}")
            self._engines_status['multimodal'] = False
        
        # Summary
        loaded = sum(1 for status in self._engines_status.values() if status)
        total = len(self._engines_status)
        logger.info(f"🎯 Engine initialization complete: {loaded}/{total} engines loaded")
        self._initialized = True

    async def initialize(self):
        """Initialize all available engines - for backwards compatibility"""
        if not self._initialized:
            self._initialize_engines_sync()
    
    async def _initialize_engines(self):
        """Initialize all available engines"""
        logger.info("🔧 Loading reasoning engines...")
        
        # Initialize mathematical engine
        if self.config.enable_math_engine:
            try:
                from ml.reasoning import AutonomousMathEngine
                self._math_engine = AutonomousMathEngine()
                self._engines_status['math'] = True
                logger.info("✅ Mathematical engine initialized")
            except Exception as e:
                self._engines_status['math'] = False
                logger.warning(f"⚠️ Mathematical engine failed to initialize: {e}")
        
        # Initialize logical engine
        if self.config.enable_logic_engine:
            try:
                from ml.reasoning import AutonomousLogicalEngine
                self._logic_engine = AutonomousLogicalEngine()
                self._engines_status['logic'] = True
                logger.info("✅ Logical engine initialized")
            except Exception as e:
                self._engines_status['logic'] = False
                logger.warning(f"⚠️ Logical engine failed to initialize: {e}")
                
        # Initialize Romanian cultural engine
        if self.config.enable_cultural_engine:
            try:
                from ml.reasoning import RealRomanianEngine
                self._cultural_engine = RealRomanianEngine()
                self._engines_status['cultural'] = True
                logger.info("✅ Romanian cultural engine initialized")
            except Exception as e:
                self._engines_status['cultural'] = False
                logger.warning(f"⚠️ Romanian cultural engine failed to initialize: {e}")
        
        # Initialize creative engine
        if self.config.enable_creative_engine:
            try:
                from ml.reasoning import CreativeIntelligenceSystem
                self._creative_engine = CreativeIntelligenceSystem()
                self._engines_status['creative'] = True
                logger.info("✅ Creative intelligence engine initialized")
            except Exception as e:
                self._engines_status['creative'] = False
                logger.warning(f"⚠️ Creative intelligence engine failed to initialize: {e}")
        
        # Initialize cross-modal engine
        if self.config.enable_multimodal:
            try:
                from ml.reasoning import CrossModalIntegrationSystem
                self._cross_modal_engine = CrossModalIntegrationSystem()
                self._engines_status['cross_modal'] = True
                logger.info("✅ Cross-modal integration engine initialized")
            except Exception as e:
                self._engines_status['cross_modal'] = False
                logger.warning(f"⚠️ Cross-modal integration engine failed to initialize: {e}")
        
        # Report initialization status
        available = sum(self._engines_status.values())
        total = len(self._engines_status)
        logger.info(f"🎯 RomAI Initialization Complete: {available}/{total} engines available")
    
    @property
    def math_engine(self):
        """Access to mathematical reasoning engine"""
        return self._math_engine
        
    @property 
    def logic_engine(self):
        """Access to logical reasoning engine"""
        return self._logic_engine
        
    @property
    def romanian_engine(self):
        """Access to Romanian cultural engine"""
        return self._cultural_engine
        
    @property
    def creative_engine(self):
        """Access to creative intelligence engine"""
        return self._creative_engine
        
    @property
    def cross_modal_engine(self):
        """Access to cross-modal integration engine"""
        return self._cross_modal_engine
    
    async def solve_math(self, problem: str) -> RomAIResponse:
        """
        Solve mathematical problems using neural-symbolic reasoning
        
        Args:
            problem: Mathematical problem as text
            
        Returns:
            RomAIResponse with mathematical solution
        """
        import time
        start_time = time.time()
        
        if not self._engines_status.get('math', False):
            return RomAIResponse(
                result=None,
                engine_used="math",
                confidence=0.0,
                processing_time=time.time() - start_time,
                success=False,
                error_message="Mathematical engine not available"
            )
        
        try:
            result = await self._math_engine.solve_mathematical_problem(problem)
            processing_time = time.time() - start_time
            
            return RomAIResponse(
                result=result.result,
                engine_used="neural_symbolic_math",
                confidence=result.confidence,
                processing_time=processing_time,
                success=True,
                metadata={
                    'steps': result.steps,
                    'method': result.method,
                    'domain': result.domain,
                    'neural_enhanced': result.neural_enhanced
                }
            )
            
        except Exception as e:
            return RomAIResponse(
                result=None,
                engine_used="math",
                confidence=0.0,
                processing_time=time.time() - start_time,
                success=False,
                error_message=str(e)
            )
    
    async def reason(self, premise: str) -> RomAIResponse:
        """
        Perform logical reasoning on given premises
        
        Args:
            premise: Logical premise or question
            
        Returns:
            RomAIResponse with logical conclusion
        """
        import time
        start_time = time.time()
        
        if not self._engines_status.get('logic', False):
            return RomAIResponse(
                result=None,
                engine_used="logic",
                confidence=0.0,
                processing_time=time.time() - start_time,
                success=False,
                error_message="Logical engine not available"
            )
        
        try:
            result = await self._logic_engine.reason(premise)
            processing_time = time.time() - start_time
            
            return RomAIResponse(
                result=result.conclusion,
                engine_used="neural_symbolic_logic", 
                confidence=result.confidence,
                processing_time=processing_time,
                success=True,
                metadata={
                    'reasoning_steps': result.reasoning_steps,
                    'method': result.reasoning_method,
                    'type': result.reasoning_type,
                    'premises': result.premises,
                    'validity': result.validity
                }
            )
            
        except Exception as e:
            return RomAIResponse(
                result=None,
                engine_used="logic",
                confidence=0.0,
                processing_time=time.time() - start_time,
                success=False,
                error_message=str(e)
            )
    
    async def analyze_culture(self, context: str) -> RomAIResponse:
        """
        Analyze Romanian cultural context
        
        Args:
            context: Cultural context or question
            
        Returns:
            RomAIResponse with cultural analysis
        """
        import time
        start_time = time.time()
        
        if not self._engines_status.get('cultural', False):
            return RomAIResponse(
                result=None,
                engine_used="cultural",
                confidence=0.0,
                processing_time=time.time() - start_time,
                success=False,
                error_message="Romanian cultural engine not available"
            )
        
        try:
            result = await self._cultural_engine.analyze_cultural_romanian(context)
            processing_time = time.time() - start_time
            
            return RomAIResponse(
                result=result.result,  # Access the result content, not the object
                engine_used="romanian_cultural",
                confidence=result.confidence,
                processing_time=processing_time,
                success=True,
                metadata={
                    'cultural_domain': 'romanian',
                    'insight': result.insight,
                    'cultural_significance': result.cultural_significance,
                    'analysis_type': result.analysis_type
                }
            )
            
        except Exception as e:
            return RomAIResponse(
                result=None,
                engine_used="cultural",
                confidence=0.0,
                processing_time=time.time() - start_time,
                success=False,
                error_message=str(e)
            )
    
    async def create(self, prompt: str, creativity_type: str = "general") -> RomAIResponse:
        """
        Generate creative content
        
        Args:
            prompt: Creative prompt
            creativity_type: Type of creativity (general, story, poem, etc.)
            
        Returns:
            RomAIResponse with creative content
        """
        import time
        start_time = time.time()
        
        if not self._engines_status.get('creative', False):
            return RomAIResponse(
                result=None,
                engine_used="creative",
                confidence=0.0,
                processing_time=time.time() - start_time,
                success=False,
                error_message="Creative intelligence engine not available"
            )
        
        try:
            result = await self._creative_engine.generate_creative_content(prompt, creativity_type)
            processing_time = time.time() - start_time
            
            return RomAIResponse(
                result=result.content,
                engine_used="creative_intelligence",
                confidence=result.confidence,
                processing_time=processing_time,
                success=True,
                metadata={
                    'creativity_type': creativity_type,
                    'method': result.method,
                    'inspiration_sources': getattr(result, 'sources', [])
                }
            )
            
        except Exception as e:
            return RomAIResponse(
                result=None,
                engine_used="creative",
                confidence=0.0,
                processing_time=time.time() - start_time,
                success=False,
                error_message=str(e)
            )
    
    async def process_query(self, query: str, domain: Optional[str] = None) -> RomAIResponse:
        """
        Process general query using most appropriate engine
        
        Args:
            query: Input query
            domain: Optional domain hint (math, logic, cultural, creative)
            
        Returns:
            RomAIResponse with processed result
        """
        # Auto-detect domain if not provided
        if not domain:
            domain = self._detect_query_domain(query)
        
        # Route to appropriate engine
        if domain == "math":
            return await self.solve_math(query)
        elif domain == "logic":
            return await self.reason(query)
        elif domain == "cultural":
            return await self.analyze_culture(query)
        elif domain == "creative":
            return await self.create(query)
        else:
            # Try multiple engines and return best result
            return await self._multi_engine_processing(query)
    
    def _detect_query_domain(self, query: str) -> str:
        """Detect the most appropriate domain for a query"""
        query_lower = query.lower()
        
        # Mathematical indicators
        math_keywords = ['calculate', 'solve', 'math', '√', '+', '-', '*', '/', '=', 'equation']
        if any(keyword in query_lower for keyword in math_keywords):
            return "math"
            
        # Logical reasoning indicators  
        logic_keywords = ['if', 'then', 'therefore', 'because', 'conclude', 'premise', 'syllogism']
        if any(keyword in query_lower for keyword in logic_keywords):
            return "logic"
            
        # Romanian cultural indicators
        cultural_keywords = ['romania', 'romanian', 'transilvania', 'bucuresti', 'castel', 'cultur']
        if any(keyword in query_lower for keyword in cultural_keywords):
            return "cultural"
            
        # Creative indicators
        creative_keywords = ['create', 'write', 'poem', 'story', 'imagine', 'invent']
        if any(keyword in query_lower for keyword in creative_keywords):
            return "creative"
            
        return "general"
    
    async def _multi_engine_processing(self, query: str) -> RomAIResponse:
        """Process query with multiple engines and return best result"""
        results = []
        
        # Try each available engine
        for engine_name, available in self._engines_status.items():
            if available:
                try:
                    if engine_name == "math":
                        result = await self.solve_math(query)
                    elif engine_name == "logic":
                        result = await self.reason(query)
                    elif engine_name == "cultural":
                        result = await self.analyze_culture(query)
                    elif engine_name == "creative":
                        result = await self.create(query)
                    else:
                        continue
                        
                    if result.success:
                        results.append(result)
                        
                except Exception:
                    continue
        
        # Return result with highest confidence
        if results:
            best_result = max(results, key=lambda r: r.confidence)
            best_result.engine_used = f"multi_engine_best_{best_result.engine_used}"
            return best_result
        
        # No engines succeeded
        import time
        return RomAIResponse(
            result=None,
            engine_used="multi_engine",
            confidence=0.0,
            processing_time=0.0,
            success=False,
            error_message="No engines could process the query successfully"
        )
    
    def get_status(self) -> Dict[str, Any]:
        """Get current system status"""
        available_engines = sum(self._engines_status.values())
        total_engines = len(self._engines_status)
        
        return {
            'engines': self._engines_status,
            'available_count': available_engines,
            'total_count': total_engines,
            'availability_rate': available_engines / total_engines if total_engines > 0 else 0,
            'is_fully_functional': available_engines == total_engines,
            'config': self.config.__dict__
        }
    
    def is_ready(self) -> bool:
        """Check if system is ready for processing"""
        return any(self._engines_status.values())
    
    async def __aenter__(self):
        """Async context manager entry"""
        await self._initialize_engines()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        logger.info("🧠 RomAI system shutdown complete")

# Convenience function for quick initialization
async def create_romai(config: Optional[RomAIConfig] = None) -> RomAI:
    """Create and initialize RomAI system"""
    system = RomAI(config)
    await system._initialize_engines()
    return system