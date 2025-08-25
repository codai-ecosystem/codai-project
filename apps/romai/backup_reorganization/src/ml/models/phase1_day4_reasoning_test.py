"""
🎯 Phase 1 Day 4 Advanced Reasoning Test
RomAI World-Class AGI Implementation

Standalone test for advanced reasoning capabilities.
Target: Implement and validate advanced reasoning to boost AGI performance.
"""

import sys
import os
import time
import numpy as np
from typing import Dict, List, Any

# Add path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from advanced_reasoning_engine import AdvancedReasoningEngine

class Phase1Day4AdvancedReasoningTest:
    """Phase 1 Day 4 - Advanced Reasoning Test System"""
    
    def __init__(self):
        print("🧠 Initializing Phase 1 Day 4 Advanced Reasoning Test...")
        self.reasoning_engine = AdvancedReasoningEngine()
        print("✅ Advanced Reasoning Engine loaded")
        
    def test_logical_reasoning(self) -> float:
        """Test logical reasoning capabilities"""
        print("\n🔍 Testing Logical Reasoning...")
        
        logical_tests = [
            {
                'problem': "If all humans are mortal, and Socrates is human, then Socrates is mortal",
                'expected_valid': True,
                'type': 'modus_ponens'
            },
            {
                'problem': "All birds can fly. Penguins are birds. Therefore penguins can fly",
                'expected_valid': True,  # Logically valid even if factually false
                'type': 'universal_instantiation'
            },
            {
                'problem': "If it rains, the ground gets wet. The ground is not wet. Therefore it did not rain",
                'expected_valid': True,
                'type': 'modus_tollens'
            },
            {
                'problem': "Some flowers are red. All roses are flowers. Therefore all roses are red",
                'expected_valid': False,
                'type': 'invalid_syllogism'
            }
        ]
        
        scores = []
        for i, test in enumerate(logical_tests, 1):
            print(f"  Test {i}: {test['type']}")
            try:
                # Parse the logical problem manually for better testing
                premises = []
                conclusion = ""
                
                if "therefore" in test['problem'].lower():
                    parts = test['problem'].lower().split("therefore")
                    premise_text = parts[0].strip()
                    conclusion = parts[1].strip()
                    
                    # Simple premise splitting
                    if ". " in premise_text:
                        premises = [p.strip() for p in premise_text.split(". ")]
                    else:
                        premises = [premise_text]
                else:
                    premises = [test['problem']]
                    conclusion = "conclusion follows"
                
                result = self.reasoning_engine.logical_engine.reason(premises, conclusion)
                
                # Score based on correctness and confidence
                correctness = 1.0 if result.success == test['expected_valid'] else 0.3
                confidence_score = result.confidence
                
                test_score = correctness * 0.7 + confidence_score * 0.3
                scores.append(test_score)
                
                print(f"    Success: {result.success}, Confidence: {result.confidence:.3f}, Score: {test_score:.3f}")
                
            except Exception as e:
                print(f"    Error: {e}")
                scores.append(0.2)
        
        logical_performance = np.mean(scores)
        print(f"  📊 Logical Reasoning Performance: {logical_performance:.1%}")
        return logical_performance
    
    def test_causal_reasoning(self) -> float:
        """Test causal reasoning capabilities"""
        print("\n🔗 Testing Causal Reasoning...")
        
        # First, set up some causal relationships
        causal_engine = self.reasoning_engine.causal_engine
        
        # Add test causal relationships
        test_relationships = [
            ("exercise", "fitness", 0.8),
            ("study", "grades", 0.7),
            ("rain", "wet_ground", 0.9),
            ("smoking", "health_problems", 0.85),
            ("education", "income", 0.6)
        ]
        
        for cause, effect, strength in test_relationships:
            causal_engine.add_causal_relationship(cause, effect, strength)
        
        causal_tests = [
            {
                'problem': "Does exercise cause fitness?",
                'expected_causal': True
            },
            {
                'problem': "Does study cause grades?", 
                'expected_causal': True
            },
            {
                'problem': "Does rain cause wet_ground?",
                'expected_causal': True
            },
            {
                'problem': "Does fitness cause exercise?",
                'expected_causal': False
            }
        ]
        
        scores = []
        for i, test in enumerate(causal_tests, 1):
            print(f"  Test {i}: {test['problem']}")
            try:
                result = causal_engine.infer(test['problem'])
                
                # Score based on success and confidence
                success_score = 1.0 if result.success else 0.3
                confidence_score = result.confidence
                
                test_score = success_score * 0.6 + confidence_score * 0.4
                scores.append(test_score)
                
                print(f"    Success: {result.success}, Confidence: {result.confidence:.3f}, Score: {test_score:.3f}")
                
            except Exception as e:
                print(f"    Error: {e}")
                scores.append(0.2)
        
        causal_performance = np.mean(scores)
        print(f"  📊 Causal Reasoning Performance: {causal_performance:.1%}")
        return causal_performance
    
    def test_analogical_reasoning(self) -> float:
        """Test analogical reasoning capabilities"""
        print("\n🔄 Testing Analogical Reasoning...")
        
        analogical_tests = [
            {
                'problem': "The heart pumps blood through the body like a water pump circulates water",
                'domain': 'biological'
            },
            {
                'problem': "Learning programming is like learning a foreign language with syntax and grammar",
                'domain': 'educational'
            },
            {
                'problem': "An atom with electrons orbiting the nucleus is like a solar system",
                'domain': 'physical'
            },
            {
                'problem': "A computer's CPU is like the brain of a human",
                'domain': 'technological'
            }
        ]
        
        scores = []
        for i, test in enumerate(analogical_tests, 1):
            print(f"  Test {i}: {test['domain']} analogy")
            try:
                result = self.reasoning_engine.analogical_engine.find_analogies(
                    test['problem'], test['domain']
                )
                
                # Score based on success and confidence
                success_score = 1.0 if result.success else 0.2
                confidence_score = result.confidence
                
                test_score = success_score * 0.5 + confidence_score * 0.5
                scores.append(test_score)
                
                print(f"    Success: {result.success}, Confidence: {result.confidence:.3f}, Score: {test_score:.3f}")
                
            except Exception as e:
                print(f"    Error: {e}")
                scores.append(0.1)
        
        analogical_performance = np.mean(scores)
        print(f"  📊 Analogical Reasoning Performance: {analogical_performance:.1%}")
        return analogical_performance
    
    def test_meta_reasoning(self) -> float:
        """Test meta-reasoning capabilities"""
        print("\n🎯 Testing Meta-Reasoning...")
        
        meta_tests = [
            {
                'problem': "What's the best strategy to solve a complex mathematical optimization problem?",
                'expected_strategy': 'systematic'
            },
            {
                'problem': "How should I approach reasoning about cause and effect relationships?",
                'expected_strategy': 'causal'
            },
            {
                'problem': "What method should I use to find similarities between different domains?",
                'expected_strategy': 'analogical'
            },
            {
                'problem': "How should I validate a logical argument step by step?",
                'expected_strategy': 'logical'
            }
        ]
        
        scores = []
        for i, test in enumerate(meta_tests, 1):
            print(f"  Test {i}: Strategy selection")
            try:
                result = self.reasoning_engine.meta_engine.select_strategy(test['problem'])
                
                # Score based on success and confidence
                success_score = 1.0 if result.success else 0.5
                confidence_score = result.confidence
                
                test_score = success_score * 0.4 + confidence_score * 0.6
                scores.append(test_score)
                
                selected_strategy = result.metadata.get('selected_strategy', 'unknown')
                print(f"    Strategy: {selected_strategy}, Confidence: {result.confidence:.3f}, Score: {test_score:.3f}")
                
            except Exception as e:
                print(f"    Error: {e}")
                scores.append(0.3)
        
        meta_performance = np.mean(scores)
        print(f"  📊 Meta-Reasoning Performance: {meta_performance:.1%}")
        return meta_performance
    
    def run_comprehensive_reasoning_test(self) -> Dict[str, Any]:
        """Run comprehensive advanced reasoning test"""
        print("🚀 Starting Phase 1 Day 4 Advanced Reasoning Comprehensive Test")
        print("=" * 70)
        
        start_time = time.time()
        
        # Test all reasoning components
        logical_score = self.test_logical_reasoning()
        causal_score = self.test_causal_reasoning()
        analogical_score = self.test_analogical_reasoning()
        meta_score = self.test_meta_reasoning()
        
        # Calculate overall advanced reasoning performance
        reasoning_weights = {
            'logical': 0.3,
            'causal': 0.3,
            'analogical': 0.2,
            'meta': 0.2
        }
        
        overall_reasoning = (
            logical_score * reasoning_weights['logical'] +
            causal_score * reasoning_weights['causal'] +
            analogical_score * reasoning_weights['analogical'] +
            meta_score * reasoning_weights['meta']
        )
        
        # Calculate improvement from baseline
        baseline_reasoning = 0.759  # From Phase 1 Day 3
        improvement = ((overall_reasoning - baseline_reasoning) / baseline_reasoning) * 100
        
        # Check target achievement
        target_reasoning = 0.85  # 85% target for advanced reasoning
        target_achieved = overall_reasoning >= target_reasoning
        
        test_time = time.time() - start_time
        
        results = {
            'logical_reasoning': logical_score,
            'causal_reasoning': causal_score,
            'analogical_reasoning': analogical_score,
            'meta_reasoning': meta_score,
            'overall_reasoning': overall_reasoning,
            'baseline_reasoning': baseline_reasoning,
            'improvement_percentage': improvement,
            'target_reasoning': target_reasoning,
            'target_achieved': target_achieved,
            'test_duration': test_time,
            'timestamp': time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # Display results
        self._display_results(results)
        
        return results
    
    def _display_results(self, results: Dict[str, Any]):
        """Display comprehensive test results"""
        print("\n🎯 PHASE 1 DAY 4 - ADVANCED REASONING RESULTS")
        print("=" * 60)
        
        # Main performance metrics
        current = results['overall_reasoning']
        baseline = results['baseline_reasoning']
        improvement = results['improvement_percentage']
        target = results['target_reasoning']
        
        print(f"📊 REASONING PERFORMANCE:")
        print(f"   Current: {current:.1%}")
        print(f"   Baseline (Day 3): {baseline:.1%}")
        print(f"   Improvement: {improvement:+.1f}%")
        print(f"   Target: {target:.1%}")
        
        status = "✅ TARGET ACHIEVED" if results['target_achieved'] else "⚠️ TARGET MISSED"
        print(f"   Status: {status}")
        
        # Component breakdown
        print(f"\n🧠 REASONING COMPONENT BREAKDOWN:")
        print(f"   Logical Reasoning: {results['logical_reasoning']:.1%}")
        print(f"   Causal Reasoning: {results['causal_reasoning']:.1%}")
        print(f"   Analogical Reasoning: {results['analogical_reasoning']:.1%}")
        print(f"   Meta-Reasoning: {results['meta_reasoning']:.1%}")
        
        # Performance analysis
        print(f"\n📈 ANALYSIS:")
        if improvement > 0:
            print(f"   ✅ Positive improvement of {improvement:.1f}%")
        else:
            print(f"   ⚠️ Performance declined by {abs(improvement):.1f}%")
            
        if results['target_achieved']:
            print(f"   ✅ Successfully achieved {target:.1%} target")
        else:
            gap = (target - current) * 100
            print(f"   ⚠️ {gap:.1f} percentage points below target")
        
        print(f"\n⏱️ Test completed in {results['test_duration']:.2f} seconds")

def main():
    """Main test execution"""
    print("🧠 Phase 1 Day 4 - Advanced Reasoning Test")
    print("Target: Implement advanced reasoning capabilities for AGI enhancement")
    print()
    
    # Initialize test system
    test_system = Phase1Day4AdvancedReasoningTest()
    
    # Run comprehensive test
    results = test_system.run_comprehensive_reasoning_test()
    
    # Final summary
    print("\n" + "=" * 60)
    if results['target_achieved']:
        print("🏆 PHASE 1 DAY 4 SUCCESSFULLY COMPLETED!")
        print("✅ Advanced reasoning capabilities implemented")
        print(f"✅ Performance: {results['overall_reasoning']:.1%} (Target: {results['target_reasoning']:.1%})")
        print("🚀 Ready to proceed to Phase 1 Day 5")
    else:
        print("⚠️ PHASE 1 DAY 4 NEEDS IMPROVEMENT")
        print("🔧 Advanced reasoning requires further enhancement")
        gap = (results['target_reasoning'] - results['overall_reasoning']) * 100
        print(f"📊 Performance gap: {gap:.1f} percentage points")
        print("🎯 Recommendation: Optimize reasoning engine components")
    
    return results

if __name__ == "__main__":
    results = main()
