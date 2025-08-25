"""
RomAGI Advanced Code Generation Engine - Test Runner
===================================================

Test runner for the Advanced Code Generation Engine with proper imports.

Author: RomAGI Development Team  
License: MIT
Version: 2.0.0
"""

import sys
import os
import asyncio
import logging

# Add the current directory to the path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core import (
    CodeGenerationRequest, GeneratedCode, CodeAnalysis,
    ProgrammingLanguage, CodeComplexity, CodeType
)
from python_generator import PythonCodeGenerator
from advanced_code_generator import AdvancedCodeGenerationEngine, demonstrate_code_generation

logger = logging.getLogger(__name__)

async def test_code_generation_engine():
    """Test the code generation engine with proper imports"""
    logger.info("🧪 Testing Advanced Code Generation Engine")
    logger.info("=" * 60)
    
    # Initialize the engine
    engine = AdvancedCodeGenerationEngine()
    
    # Simple test case
    logger.info("🐍 Testing Python code generation...")
    
    try:
        generated_code = await engine.generate_code(
            description="Create a simple Romanian greeting function",
            language=ProgrammingLanguage.PYTHON,
            code_type=CodeType.FUNCTION,
            complexity=CodeComplexity.SIMPLE,
            requirements=["greeting message", "Romanian language"],
            romanian_concepts=True,
            tests_required=True,
            documentation_required=True
        )
        
        logger.info(f"✅ Generated code successfully!")
        logger.info(f"📝 Code ID: {generated_code.code_id}")
        logger.info(f"⭐ Quality Score: {generated_code.quality_score:.2f}")
        logger.info(f"🇷🇴 Cultural Integration: {generated_code.cultural_integration:.2f}")
        logger.info(f"🎭 Romanian Concepts: {', '.join(generated_code.romanian_concepts_used)}")
        
        # Show the generated code (first 500 characters)
        logger.info(f"📄 Generated Source Code (preview):")
        logger.info("-" * 40)
        logger.info(generated_code.source_code[:500] + "..." if len(generated_code.source_code) > 500 else generated_code.source_code)
        logger.info("-" * 40)
        
        # Test code analysis
        logger.info("\n🔍 Testing code analysis...")
        analysis = await engine.analyze_existing_code(
            generated_code.source_code, 
            ProgrammingLanguage.PYTHON
        )
        
        logger.info(f"📊 Analysis completed:")
        logger.info(f"   Quality Metrics: {len(analysis.quality_metrics)} categories")
        logger.info(f"   Security Issues: {len(analysis.security_issues)}")
        logger.info(f"   Performance Issues: {len(analysis.performance_issues)}")
        logger.info(f"   Cultural Adherence: {analysis.cultural_adherence:.2f}")
        logger.info(f"   Improvement Suggestions: {len(analysis.improvement_suggestions)}")
        
        # Get insights
        logger.info("\n📊 Getting system insights...")
        insights = await engine.get_code_insights()
        
        logger.info(f"🎯 Total Generated: {insights['total_generated_code']}")
        logger.info(f"⭐ Average Quality: {insights['quality_statistics']['average_quality']:.2f}")
        logger.info(f"🇷🇴 Average Cultural: {insights['quality_statistics']['average_cultural_integration']:.2f}")
        logger.info(f"⚡ Success Rate: {insights['system_statistics']['success_rate']:.1f}%")
        
        logger.info("\n✅ Advanced Code Generation Engine test completed successfully!")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO, format='%(levelname)s:%(name)s:%(message)s')
    
    # Run the test
    success = asyncio.run(test_code_generation_engine())
    
    if success:
        print("\n🎉 All tests passed! The Advanced Code Generation Engine is working correctly.")
    else:
        print("\n💥 Tests failed. Check the logs for details.")
        sys.exit(1)