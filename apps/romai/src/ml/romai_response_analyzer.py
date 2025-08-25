#!/usr/bin/env python3
"""
RomAI Response Analyzer
Diagnostic tool to understand RomAI's response format for mathematical problems
"""

import asyncio
import logging
import sys
import re
from romai_api_client import RomAIAPIClient

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class RomAIResponseAnalyzer:
    """Analyzer for understanding RomAI response formats"""
    
    def __init__(self, api_client):
        self.api_client = api_client
    
    def analyze_response_format(self, problem: str, response: str) -> dict:
        """Analyze the format and content of RomAI responses"""
        analysis = {
            'problem': problem,
            'raw_response': response,
            'response_length': len(response),
            'contains_numbers': bool(re.search(r'\d+', response)),
            'number_patterns': re.findall(r'\d+(?:\.\d+)?', response),
            'contains_calculation': bool(re.search(r'[+\-*/=]', response)),
            'mathematical_operators': re.findall(r'[+\-*/=]', response),
            'contains_answer_keywords': bool(re.search(r'\b(?:answer|result|equals|total|sum)\b', response.lower())),
            'answer_keywords': re.findall(r'\b(?:answer|result|equals|total|sum)\b', response.lower()),
            'potential_answers': []
        }
        
        # Look for potential numerical answers
        answer_patterns = [
            r'(?:answer|result|total|sum)(?:\s*:?\s*|\s+is\s+)(\d+(?:\.\d+)?)',
            r'(?:equals|=)\s*(\d+(?:\.\d+)?)',
            r'(\d+(?:\.\d+)?)\s*(?:dollars?|miles?|hours?|days?|weeks?|slices?|boxes?|crayons?)',
            r'\$?\s*(\d+(?:\.\d+)?)\s*$',  # Final number at end
            r'\b(\d+(?:\.\d+)?)\b(?=\s*$)',  # Last standalone number
        ]
        
        for pattern in answer_patterns:
            matches = re.findall(pattern, response.lower())
            if matches:
                analysis['potential_answers'].extend(matches)
        
        # Remove duplicates while preserving order
        seen = set()
        analysis['potential_answers'] = [x for x in analysis['potential_answers'] if not (x in seen or seen.add(x))]
        
        return analysis
    
    async def test_mathematical_problems(self):
        """Test a variety of mathematical problems and analyze responses"""
        test_problems = [
            "What is 15 + 27?",
            "If a train travels at 60 mph for 2 hours, then 80 mph for 1.5 hours, what is the total distance traveled?",
            "Sarah saves $5 every week for 12 weeks. How much money has she saved in total?",
            "A pizza is cut into 8 equal slices. If 3 people each eat 2 slices, how many slices are left?",
            "Tom has 5 boxes of crayons. Each box has 24 crayons. He gives away 2 boxes to his friends. How many crayons does Tom have left?",
            "A store sells pencils for $0.25 each and erasers for $0.75 each. If someone buys 12 pencils and 8 erasers, what is the total cost?"
        ]
        
        expected_answers = [42, 240, 60, 2, 72, 9.0]
        
        logger.info("🧮 Analyzing RomAI Mathematical Response Formats")
        logger.info("=" * 60)
        
        for i, (problem, expected) in enumerate(zip(test_problems, expected_answers)):
            logger.info(f"\n📝 Problem {i+1}: {problem}")
            logger.info(f"Expected Answer: {expected}")
            
            try:
                # Test inference endpoint
                response = await self.api_client.generate_response(
                    prompt=problem,
                    task_type="math"
                )
                
                if response and response.success and response.content:
                    analysis = self.analyze_response_format(problem, response.content)
                    
                    logger.info(f"✅ Raw Response ({analysis['response_length']} chars): {response.content[:200]}...")
                    logger.info(f"📊 Analysis:")
                    logger.info(f"  - Contains numbers: {analysis['contains_numbers']}")
                    logger.info(f"  - Numbers found: {analysis['number_patterns']}")
                    logger.info(f"  - Contains calculations: {analysis['contains_calculation']}")
                    logger.info(f"  - Math operators: {analysis['mathematical_operators']}")
                    logger.info(f"  - Contains answer keywords: {analysis['contains_answer_keywords']}")
                    logger.info(f"  - Answer keywords: {analysis['answer_keywords']}")
                    logger.info(f"  - Potential answers: {analysis['potential_answers']}")
                    
                    # Check if expected answer is in potential answers
                    expected_str = str(expected)
                    found_expected = any(abs(float(ans) - expected) < 0.01 for ans in analysis['potential_answers'] 
                                       if ans.replace('.', '').isdigit())
                    logger.info(f"  - Expected answer found: {found_expected}")
                    
                else:
                    logger.error(f"❌ Failed to get response: {response}")
                    
            except Exception as e:
                logger.error(f"❌ Error testing problem {i+1}: {e}")
            
            logger.info("-" * 60)
    
    async def test_reasoning_endpoint(self):
        """Test the reasoning endpoint specifically"""
        logger.info("\n🧠 Testing Reasoning Endpoint")
        logger.info("=" * 60)
        
        reasoning_problem = """
        Solve this step by step:
        A bakery sells muffins for $2.50 each and cookies for $1.25 each.
        If someone buys 6 muffins and 8 cookies, what is the total cost?
        
        Please show your work and provide a clear numerical answer.
        """
        
        try:
            response = await self.api_client.generate_response(
                prompt=reasoning_problem,
                task_type="reasoning"
            )
            
            if response and response.success and response.content:
                analysis = self.analyze_response_format(reasoning_problem, response.content)
                
                logger.info(f"✅ Reasoning Response: {response.content}")
                logger.info(f"📊 Analysis: {analysis}")
            else:
                logger.error(f"❌ Failed to get reasoning response: {response}")
                
        except Exception as e:
            logger.error(f"❌ Error testing reasoning endpoint: {e}")

async def main():
    """Main diagnostic function"""
    logger.info("🔍 Starting RomAI Response Format Analysis")
    
    # Initialize API client
    api_client = RomAIAPIClient()
    
    # Test API health
    if not api_client.check_health():
        logger.error("❌ RomAI API is not healthy. Please start the RomAI AGI Model Server.")
        sys.exit(1)
    
    logger.info("✅ RomAI API is healthy")
    
    # Create analyzer
    analyzer = RomAIResponseAnalyzer(api_client)
    
    # Run tests
    await analyzer.test_mathematical_problems()
    await analyzer.test_reasoning_endpoint()
    
    logger.info("\n🎯 Analysis Complete!")
    logger.info("Use these insights to improve numerical answer extraction in the Mathematical Reasoning Engine")

if __name__ == "__main__":
    asyncio.run(main())