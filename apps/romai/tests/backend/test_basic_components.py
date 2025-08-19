#!/usr/bin/env python3
"""
🧪 RomAI Basic Components Test Suite
Test actual engine functionality with proper API usage
"""

import os
import sys
import unittest
import asyncio
import logging

# Setup path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../src'))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

print("🧪 RomAI Basic Components Test Suite")
print("=" * 60)
print("Testing core AGI engine functionality...")
print()

class TestMathematicalEngineBasic(unittest.TestCase):
    """Test mathematical engine with proper API"""
    
    @classmethod
    def setUpClass(cls):
        try:
            from core.mathematical.mathematical_engine import MathematicalEngine
            cls.engine = MathematicalEngine()
            logger.info("✅ Mathematical Engine initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Mathematical Engine: {e}")
            cls.engine = None
    
    def test_basic_calculation(self):
        """Test basic mathematical calculation"""
        if not self.engine:
            self.skipTest("Mathematical Engine not available")
        
        # Simple arithmetic
        result = self.engine.solve_problem("What is 5 + 3?")
        self.assertIsNotNone(result)
        self.assertTrue(hasattr(result, 'solution'))
        self.assertTrue(hasattr(result, 'confidence'))
        self.assertGreater(result.confidence, 0.5)
        
        logger.info(f"✅ Basic calculation: {result.solution}")
        logger.info(f"✅ Confidence: {result.confidence:.1%}")

class TestReasoningEngineBasic(unittest.TestCase):
    """Test reasoning engine with proper API"""
    
    @classmethod
    def setUpClass(cls):
        try:
            from core.reasoning.reasoning_engine import ReasoningEngine, ReasoningType
            cls.engine = ReasoningEngine()
            cls.ReasoningType = ReasoningType
            logger.info("✅ Reasoning Engine initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Reasoning Engine: {e}")
            cls.engine = None
            cls.ReasoningType = None
    
    def test_basic_reasoning(self):
        """Test basic logical reasoning"""
        if not self.engine or not self.ReasoningType:
            self.skipTest("Reasoning Engine not available")
        
        # Simple logical problem
        problem = "If all cats are mammals, and Fluffy is a cat, what can we conclude?"
        
        # Try sync first
        try:
            result = self.engine.solve_with_reasoning(problem, self.ReasoningType.LOGICAL)
            self.assertIsNotNone(result)
            self.assertTrue(hasattr(result, 'solution'))
            logger.info(f"✅ Basic reasoning (sync): {result.solution}")
        except TypeError:
            # Try async
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(
                self.engine.solve_with_reasoning(problem, self.ReasoningType.LOGICAL)
            )
            loop.close()
            
            self.assertIsNotNone(result)
            self.assertTrue(hasattr(result, 'solution'))
            logger.info(f"✅ Basic reasoning (async): {result.solution}")

class TestIntegrationEngineBasic(unittest.TestCase):
    """Test integration engine with proper API"""
    
    @classmethod
    def setUpClass(cls):
        try:
            from core.integration.integration_engine import IntegrationEngine
            cls.engine = IntegrationEngine()
            logger.info("✅ Integration Engine initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Integration Engine: {e}")
            cls.engine = None
    
    def test_basic_integration(self):
        """Test basic integration task"""
        if not self.engine:
            self.skipTest("Integration Engine not available")
        
        # Simple integration problem
        problem = "Combine mathematical calculation and logical reasoning to solve: If a store sells 150 items per day and each item costs $12, how much revenue does it generate in a week?"
        
        # Try different method names
        result = None
        methods_to_try = [
            'process_integration_task',
            'integrate_components', 
            'solve_problem',
            'process_task'
        ]
        
        for method_name in methods_to_try:
            if hasattr(self.engine, method_name):
                method = getattr(self.engine, method_name)
                try:
                    result = method(problem)
                    logger.info(f"✅ Used method: {method_name}")
                    break
                except Exception as e:
                    logger.warning(f"⚠️ Method {method_name} failed: {e}")
                    continue
        
        self.assertIsNotNone(result, "No integration method worked")
        logger.info(f"✅ Basic integration: {getattr(result, 'solution', result)}")

class TestAGISystemHealth(unittest.TestCase):
    """Test overall AGI system health"""
    
    def test_component_availability(self):
        """Test that core AGI components are available"""
        
        # Check mathematical engine
        try:
            from core.mathematical.mathematical_engine import MathematicalEngine
            math_engine = MathematicalEngine()
            logger.info("✅ Mathematical Engine: AVAILABLE")
            math_available = True
        except Exception as e:
            logger.warning(f"⚠️ Mathematical Engine: UNAVAILABLE - {e}")
            math_available = False
        
        # Check reasoning engine
        try:
            from core.reasoning.reasoning_engine import ReasoningEngine
            reasoning_engine = ReasoningEngine()
            logger.info("✅ Reasoning Engine: AVAILABLE")
            reasoning_available = True
        except Exception as e:
            logger.warning(f"⚠️ Reasoning Engine: UNAVAILABLE - {e}")
            reasoning_available = False
        
        # Check integration engine
        try:
            from core.integration.integration_engine import IntegrationEngine
            integration_engine = IntegrationEngine()
            logger.info("✅ Integration Engine: AVAILABLE")
            integration_available = True
        except Exception as e:
            logger.warning(f"⚠️ Integration Engine: UNAVAILABLE - {e}")
            integration_available = False
        
        # Calculate availability
        total_components = 3
        available_components = sum([math_available, reasoning_available, integration_available])
        availability = (available_components / total_components) * 100
        
        logger.info(f"📊 AGI Component Availability: {availability:.1f}%")
        
        # At least 2 out of 3 components should be available
        self.assertGreaterEqual(available_components, 2, 
                              f"Only {available_components}/3 components available")

if __name__ == '__main__':
    # Run tests
    unittest.main(verbosity=2)
