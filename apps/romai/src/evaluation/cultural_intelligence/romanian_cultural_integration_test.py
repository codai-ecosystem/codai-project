"""
Romanian Cultural Intelligence Integration Test
==============================================

Test the cultural intelligence integration with the fixed server reasoning system.
This validates that Romanian cultural intelligence properly integrates with general AGI capabilities.

Author: RomAI Excellence Team
Date: August 22, 2025
Version: 3.0
"""

import requests
import json
import time
import logging
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional, Any, Tuple
import sys

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

@dataclass
class CulturalIntegrationResult:
    """Result from cultural intelligence integration test."""
    test_category: str
    test_name: str
    romanian_cultural_score: float
    general_agi_score: float
    integration_score: float
    success: bool
    response_time_ms: float
    cultural_response: str
    agi_response: str
    integration_analysis: str
    confidence: float = 0.5

class RomanianCulturalIntelligenceIntegrator:
    """Test Romanian cultural intelligence integration with general AGI."""
    
    def __init__(self, server_url: str = "http://localhost:6101"):
        """Initialize with RomAI server URL."""
        self.server_url = server_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'RomAI-Cultural-Integration-Tester/3.0'
        })
        
        # Cultural intelligence test scenarios
        self.cultural_integration_tests = [
            {
                "category": "business_cultural_integration",
                "test_name": "Romanian Business Etiquette AGI Integration",
                "cultural_prompt": "Explicați principalele reguli de etichetă în afacerile românești pentru o companie multinaţională.",
                "agi_prompt": "How should a multinational company adapt their business practices when operating in Romania to maximize success and cultural integration?"
            },
            {
                "category": "technical_cultural_integration", 
                "test_name": "Romanian Tech Industry AGI Analysis",
                "cultural_prompt": "Analizați ecosistemul tehnologic românesc și oportunitățile pentru dezvoltarea AI în România.",
                "agi_prompt": "Analyze the Romanian technology ecosystem's potential for AI development, considering cultural, economic, and educational factors."
            },
            {
                "category": "historical_cultural_integration",
                "test_name": "Romanian Historical Context AGI Integration", 
                "cultural_prompt": "Cum influențează istoria României abordarea modernă față de tehnologia AI și inovația digitală?",
                "agi_prompt": "How does Romania's historical experience influence modern approaches to AI technology adoption and digital innovation strategy?"
            },
            {
                "category": "linguistic_cultural_integration",
                "test_name": "Romanian Language AGI Processing",
                "cultural_prompt": "Procesați această expresie românească și explicați sensul cultural: 'A face din țânțar armăsar' în contextul dezvoltării AI.",
                "agi_prompt": "Process this Romanian idiomatic expression and explain its cultural significance in AI development contexts: 'A face din țânțar armăsar'"
            },
            {
                "category": "educational_cultural_integration",
                "test_name": "Romanian Education System AGI Integration",
                "cultural_prompt": "Cum poate sistemul educațional românesc să integreze AI-ul pentru a respecta valorile culturale tradiționale?",
                "agi_prompt": "How can Romania's educational system integrate AI technology while preserving traditional cultural values and educational approaches?"
            }
        ]

    def test_server_connectivity(self) -> bool:
        """Test if RomAI server is accessible."""
        try:
            response = self.session.get(f"{self.server_url}/health", timeout=10)
            if response.status_code == 200:
                health_data = response.json()
                logger.info(f"✅ Server connectivity: {health_data.get('status', 'unknown')}")
                return True
            else:
                logger.error(f"❌ Server health check failed: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Server connectivity test failed: {str(e)}")
            return False

    def test_cultural_reasoning_endpoint(self, prompt: str) -> Tuple[str, float, float]:
        """Test Romanian cultural reasoning endpoint."""
        try:
            payload = {
                "problem": prompt,
                "reasoning_type": "cultural",
                "romanian_emphasis": 0.9
            }
            
            start_time = time.time()
            response = self.session.post(
                f"{self.server_url}/reasoning/romanian_cultural",
                json=payload,
                timeout=30
            )
            response_time = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                result_data = response.json()
                cultural_response = result_data.get('reasoning', {})
                if isinstance(cultural_response, dict):
                    cultural_text = cultural_response.get('result', str(result_data))
                    confidence = cultural_response.get('confidence', 0.5)
                else:
                    cultural_text = str(result_data)
                    confidence = 0.5
                
                return cultural_text, confidence, response_time
            else:
                logger.error(f"Cultural reasoning endpoint error {response.status_code}: {response.text}")
                return f"Error: {response.status_code}", 0.0, response_time
                
        except Exception as e:
            logger.error(f"Cultural reasoning test failed: {str(e)}")
            return f"Exception: {str(e)}", 0.0, 1000.0

    def test_general_agi_endpoint(self, prompt: str) -> Tuple[str, float, float]:
        """Test general AGI reasoning endpoint."""
        try:
            payload = {
                "prompt": prompt,
                "domain": "general",
                "use_enhanced_reasoning": True
            }
            
            start_time = time.time()
            response = self.session.post(
                f"{self.server_url}/api/v1/inference/enhanced",
                json=payload,
                timeout=30
            )
            response_time = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                result_data = response.json()
                agi_response = result_data.get('enhanced_response', str(result_data))
                confidence = result_data.get('confidence_score', 0.5)
                return agi_response, confidence, response_time
            else:
                logger.error(f"AGI reasoning endpoint error {response.status_code}: {response.text}")
                return f"Error: {response.status_code}", 0.0, response_time
                
        except Exception as e:
            logger.error(f"AGI reasoning test failed: {str(e)}")
            return f"Exception: {str(e)}", 0.0, 1000.0

    def analyze_cultural_integration(self, cultural_response: str, agi_response: str, test_name: str) -> Tuple[float, float, float, str]:
        """Analyze integration between cultural and AGI responses."""
        
        # Romanian cultural score analysis
        cultural_score = 0.0
        if any(word in cultural_response.lower() for word in ["românia", "românesc", "românești", "cultural", "tradițional"]):
            cultural_score += 0.3
        if any(phrase in cultural_response.lower() for phrase in ["context cultural", "valori românești", "tradiție", "identitate"]):
            cultural_score += 0.3
        if len(cultural_response) > 100 and not any(err in cultural_response.lower() for err in ["error", "exception", "failed"]):
            cultural_score += 0.4
        
        # General AGI score analysis
        agi_score = 0.0
        if any(word in agi_response.lower() for word in ["romania", "romanian", "analysis", "strategy", "development"]):
            agi_score += 0.3
        if any(phrase in agi_response.lower() for phrase in ["cultural factors", "historical context", "strategic approach"]):
            agi_score += 0.3
        if len(agi_response) > 150 and not any(err in agi_response.lower() for err in ["error", "exception", "failed"]):
            agi_score += 0.4
        
        # Integration score analysis
        integration_score = 0.0
        
        # Check for thematic coherence
        romanian_themes = ["românia", "romanian", "românesc", "cultural"]
        cultural_themes_in_cultural = sum(1 for theme in romanian_themes if theme in cultural_response.lower())
        cultural_themes_in_agi = sum(1 for theme in romanian_themes if theme in agi_response.lower())
        
        if cultural_themes_in_cultural > 0 and cultural_themes_in_agi > 0:
            integration_score += 0.4  # Thematic coherence
        
        # Check for complementary content
        if len(cultural_response) > 50 and len(agi_response) > 50:
            integration_score += 0.3  # Both provide substantial content
        
        # Check for practical integration
        if "strategy" in agi_response.lower() and any(word in cultural_response.lower() for word in ["practică", "aplicare", "implementare"]):
            integration_score += 0.3  # Practical integration
        
        # Generate integration analysis
        analysis = f"""
Integration Analysis for {test_name}:
- Romanian Cultural Elements: {cultural_themes_in_cultural}/4 themes detected
- AGI Strategic Elements: {cultural_themes_in_agi}/4 Romanian themes integrated
- Cultural Response Length: {len(cultural_response)} characters
- AGI Response Length: {len(agi_response)} characters
- Integration Quality: {"HIGH" if integration_score >= 0.7 else "MEDIUM" if integration_score >= 0.4 else "LOW"}
- Thematic Coherence: {"✅ PRESENT" if cultural_themes_in_cultural > 0 and cultural_themes_in_agi > 0 else "❌ MISSING"}
        """
        
        return cultural_score, agi_score, integration_score, analysis

    def run_comprehensive_cultural_integration_test(self) -> List[CulturalIntegrationResult]:
        """Run comprehensive cultural intelligence integration test."""
        logger.info("🇷🇴 Starting Romanian Cultural Intelligence Integration Test...")
        
        # Test server connectivity first
        if not self.test_server_connectivity():
            raise RuntimeError("❌ RomAI server not accessible - cannot proceed with cultural integration test")
        
        results = []
        
        for i, test_scenario in enumerate(self.cultural_integration_tests, 1):
            logger.info(f"🔄 Testing {test_scenario['category']} ({i}/{len(self.cultural_integration_tests)})")
            
            start_time = time.time()
            
            # Test cultural reasoning
            cultural_response, cultural_confidence, cultural_time = self.test_cultural_reasoning_endpoint(
                test_scenario['cultural_prompt']
            )
            
            # Test general AGI reasoning
            agi_response, agi_confidence, agi_time = self.test_general_agi_endpoint(
                test_scenario['agi_prompt']
            )
            
            # Analyze integration
            cultural_score, agi_score, integration_score, integration_analysis = self.analyze_cultural_integration(
                cultural_response, agi_response, test_scenario['test_name']
            )
            
            total_time = (time.time() - start_time) * 1000
            
            # Determine success
            success = (cultural_score >= 0.6 and agi_score >= 0.6 and integration_score >= 0.6)
            avg_confidence = (cultural_confidence + agi_confidence) / 2
            
            result = CulturalIntegrationResult(
                test_category=test_scenario['category'],
                test_name=test_scenario['test_name'],
                romanian_cultural_score=cultural_score,
                general_agi_score=agi_score,
                integration_score=integration_score,
                success=success,
                response_time_ms=total_time,
                cultural_response=cultural_response,
                agi_response=agi_response,
                integration_analysis=integration_analysis,
                confidence=avg_confidence
            )
            
            results.append(result)
            
            status = "✅ PASS" if success else "❌ FAIL"
            logger.info(f"   Cultural: {cultural_score:.3f}, AGI: {agi_score:.3f}, Integration: {integration_score:.3f} {status}")
        
        return results

    def generate_cultural_integration_report(self, results: List[CulturalIntegrationResult]) -> None:
        """Generate comprehensive cultural integration report."""
        
        # Calculate overall metrics
        total_tests = len(results)
        successful_tests = sum(1 for r in results if r.success)
        success_rate = successful_tests / total_tests if total_tests > 0 else 0
        
        avg_cultural_score = sum(r.romanian_cultural_score for r in results) / total_tests
        avg_agi_score = sum(r.general_agi_score for r in results) / total_tests
        avg_integration_score = sum(r.integration_score for r in results) / total_tests
        avg_confidence = sum(r.confidence for r in results) / total_tests
        avg_response_time = sum(r.response_time_ms for r in results) / total_tests
        
        print("\n" + "="*80)
        print("🇷🇴 ROMANIAN CULTURAL INTELLIGENCE INTEGRATION REPORT")
        print("="*80)
        
        print(f"\n📊 OVERALL INTEGRATION PERFORMANCE:")
        print(f"   Success Rate: {success_rate:.1%} ({successful_tests}/{total_tests})")
        print(f"   Romanian Cultural Score: {avg_cultural_score:.3f} / 1.000")
        print(f"   General AGI Score: {avg_agi_score:.3f} / 1.000") 
        print(f"   Integration Score: {avg_integration_score:.3f} / 1.000")
        print(f"   Average Confidence: {avg_confidence:.3f}")
        print(f"   Average Response Time: {avg_response_time:.1f}ms")
        
        print(f"\n📈 DETAILED TEST RESULTS:")
        for result in results:
            status = "✅ INTEGRATED" if result.success else "❌ FRAGMENTED"
            print(f"   {result.test_category:.<35} {status}")
            print(f"      Cultural: {result.romanian_cultural_score:.3f} | AGI: {result.general_agi_score:.3f} | Integration: {result.integration_score:.3f}")
        
        print(f"\n🎯 CRITICAL ANALYSIS:")
        if avg_integration_score >= 0.80:
            print("   🎉 EXCELLENT: Romanian cultural intelligence successfully integrated with AGI capabilities")
        elif avg_integration_score >= 0.60:
            print("   ✅ GOOD: Cultural intelligence integration functional but optimization needed")
        elif avg_integration_score >= 0.40:
            print("   ⚠️  MODERATE: Significant cultural integration gaps need addressing")
        else:
            print("   🚨 CRITICAL: Major cultural intelligence integration failures")
        
        # Identify problem areas
        failed_categories = [r.test_category for r in results if not r.success]
        if failed_categories:
            print(f"   🎯 Priority Integration Areas: {', '.join(set(failed_categories))}")
        
        # Recommendations
        print(f"\n💡 OPTIMIZATION RECOMMENDATIONS:")
        if avg_cultural_score < 0.6:
            print("   1. Enhance Romanian cultural reasoning endpoint implementation")
        if avg_agi_score < 0.6:
            print("   2. Improve general AGI reasoning capabilities") 
        if avg_integration_score < 0.6:
            print("   3. Develop better cross-system integration patterns")
        if avg_response_time > 5000:
            print("   4. Optimize response time for cultural reasoning tasks")
        
        print("\n" + "="*80)

    def save_results(self, results: List[CulturalIntegrationResult]) -> str:
        """Save results to JSON file."""
        timestamp = int(time.time())
        filename = f"romanian_cultural_integration_test_{timestamp}.json"
        
        # Prepare data for JSON serialization
        results_data = [asdict(result) for result in results]
        
        # Calculate summary metrics
        total_tests = len(results)
        successful_tests = sum(1 for r in results if r.success)
        avg_integration_score = sum(r.integration_score for r in results) / total_tests if total_tests > 0 else 0
        
        output_data = {
            "test_metadata": {
                "timestamp": timestamp,
                "total_tests": total_tests,
                "successful_tests": successful_tests, 
                "success_rate": successful_tests / total_tests if total_tests > 0 else 0,
                "server_url": self.server_url,
                "test_type": "romanian_cultural_intelligence_integration"
            },
            "integration_metrics": {
                "average_romanian_cultural_score": sum(r.romanian_cultural_score for r in results) / total_tests,
                "average_general_agi_score": sum(r.general_agi_score for r in results) / total_tests,
                "average_integration_score": avg_integration_score,
                "average_confidence": sum(r.confidence for r in results) / total_tests,
                "average_response_time_ms": sum(r.response_time_ms for r in results) / total_tests
            },
            "detailed_results": results_data
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
            
        logger.info(f"💾 Results saved to: {filename}")
        return filename


def main():
    """Main execution function."""
    try:
        logger.info("🚀 Initializing Romanian Cultural Intelligence Integration Test...")
        tester = RomanianCulturalIntelligenceIntegrator()
        
        # Run comprehensive test
        results = tester.run_comprehensive_cultural_integration_test()
        
        # Generate report
        tester.generate_cultural_integration_report(results)
        
        # Save results
        filename = tester.save_results(results)
        
        # Final assessment
        avg_integration_score = sum(r.integration_score for r in results) / len(results)
        success_rate = sum(1 for r in results if r.success) / len(results)
        
        if avg_integration_score >= 0.80 and success_rate >= 0.80:
            logger.info("🎯✅ CULTURAL INTEGRATION SUCCESS: Romanian cultural intelligence successfully integrated with AGI!")
            return True
        else:
            logger.warning(f"⚠️🎯 INTEGRATION NEEDS OPTIMIZATION: {avg_integration_score:.3f} integration score, {success_rate:.1%} success rate")
            return False
            
    except Exception as e:
        logger.error(f"❌ Cultural integration test failed: {str(e)}")
        return False


if __name__ == "__main__":
    success = main()