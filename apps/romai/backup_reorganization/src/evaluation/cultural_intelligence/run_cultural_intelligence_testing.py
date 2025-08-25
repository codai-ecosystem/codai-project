"""
Romanian Cultural Intelligence Test Runner
=========================================

Production-ready evaluation runner for comprehensive Romanian cultural
intelligence testing with automated execution, reporting, and analysis.

This module provides the execution framework for running cultural
intelligence tests and generating detailed reports.

Author: RomAI Excellence Team
Version: 1.0.0
"""

import asyncio
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Any
import sys
import argparse

# Add project root to path  
project_root = Path(__file__).parent.parent.parent.parent
sys.path.append(str(project_root))

from romai_cultural_intelligence_evaluator import (
    RomAIRomanianCulturalIntelligenceEvaluator,
    CulturalDomain,
    RegionalContext,
    CulturalComplexity,
    CulturalIntelligenceReport
)

class CulturalIntelligenceTestRunner:
    """Production-ready runner for Romanian cultural intelligence testing."""
    
    def __init__(self, verbose: bool = True):
        """Initialize the test runner."""
        self.verbose = verbose
        self.evaluator = RomAIRomanianCulturalIntelligenceEvaluator()
        self.runner_id = str(uuid.uuid4())
        self.start_time = datetime.now(timezone.utc)
        
    def print_cultural_context(self):
        """Print comprehensive Romanian cultural intelligence testing context."""
        if not self.verbose:
            return
            
        print("=" * 80)
        print("🏛️  ROMAI ROMANIAN CULTURAL INTELLIGENCE TESTING SYSTEM")
        print("=" * 80)
        print()
        
        print("📋 CULTURAL DOMAINS COVERAGE:")
        domains = [
            ("Business Etiquette", "Professional communication and protocol"),
            ("Regional Variations", "Geographic cultural differences"),
            ("Historical Context", "Historical awareness and sensitivity"),
            ("Language Nuances", "Communication style and formality"),
            ("Social Dynamics", "Interpersonal relationship protocols"),
            ("Regulatory Environment", "Legal and compliance awareness"),
            ("Market Knowledge", "Business and economic understanding"),
            ("Contemporary Values", "Modern Romanian society values")
        ]
        
        for domain, description in domains:
            print(f"  • {domain:20s}: {description}")
        print()
        
        print("🗺️  REGIONAL CONTEXTS:")
        regions = [
            ("Transylvania", "Germanic influences, tech hub culture"),
            ("Moldavia", "Traditional agriculture, rural values"),
            ("Wallachia", "Business center, formal protocols"),
            ("Dobrogea", "Multicultural, maritime culture"),
            ("Banat", "Industrial heritage, multicultural"),
            ("Oltenia", "Traditional crafts, conservative values"),
            ("Muntenia", "Capital influence, cosmopolitan"),
            ("Bucovina", "Cultural heritage, artistic traditions")
        ]
        
        for region, characteristics in regions:
            print(f"  • {region:12s}: {characteristics}")
        print()
        
        print("🎯 TESTING FRAMEWORK:")
        print("  • Comprehensive scenario-based evaluation")
        print("  • Cultural adaptation accuracy measurement") 
        print("  • Regional sensitivity assessment")
        print("  • Business context integration")
        print("  • Language nuance evaluation")
        print("  • Historical knowledge validation")
        print()
        
        print("📊 SUCCESS TARGETS:")
        print("  • Overall Cultural Intelligence: >95%")
        print("  • Regional Adaptation Accuracy: >90%")
        print("  • Business Context Integration: >95%")
        print("  • Language Sensitivity Score: >92%")
        print("  • Historical Knowledge Score: >88%")
        print()
        
    async def run_comprehensive_cultural_testing(self) -> CulturalIntelligenceReport:
        """Run comprehensive Romanian cultural intelligence testing."""
        
        self.print_cultural_context()
        
        if self.verbose:
            print("🚀 Starting Comprehensive Cultural Intelligence Testing...")
            print()
        
        # Run evaluation for all domains
        domains_to_test = [
            CulturalDomain.BUSINESS_ETIQUETTE,
            CulturalDomain.REGIONAL_VARIATIONS,
            CulturalDomain.HISTORICAL_CONTEXT,
            CulturalDomain.LANGUAGE_NUANCES,
            CulturalDomain.SOCIAL_DYNAMICS,
            CulturalDomain.REGULATORY_ENVIRONMENT,
            CulturalDomain.MARKET_KNOWLEDGE,
            CulturalDomain.CONTEMPORARY_VALUES
        ]
        
        # Test different complexity levels
        complexity_levels = [
            CulturalComplexity.INTERMEDIATE,
            CulturalComplexity.ADVANCED,
            CulturalComplexity.EXPERT
        ]
        
        # Test multiple regional contexts
        regional_contexts = [
            RegionalContext.WALLACHIA,
            RegionalContext.TRANSYLVANIA,
            RegionalContext.MOLDAVIA,
            RegionalContext.DOBROGEA
        ]
        
        if self.verbose:
            print("📋 Testing Configuration:")
            print(f"  • Domains: {len(domains_to_test)}")
            print(f"  • Complexity Levels: {len(complexity_levels)}")
            print(f"  • Regional Contexts: {len(regional_contexts)}")
            print(f"  • Total Scenarios: ~{len(domains_to_test) * 3}")  # Approximate
            print()
        
        # Execute comprehensive evaluation
        report = await self.evaluator.evaluate_comprehensive_cultural_intelligence(
            domains=domains_to_test,
            complexity_levels=complexity_levels,
            regional_contexts=regional_contexts,
            num_scenarios_per_domain=3
        )
        
        return report
        
    def display_results(self, report: CulturalIntelligenceReport):
        """Display comprehensive cultural intelligence test results."""
        
        if not self.verbose:
            return
            
        print("📊 CULTURAL INTELLIGENCE TEST RESULTS")
        print("=" * 60)
        print()
        
        # Overall Results
        print("🏆 OVERALL PERFORMANCE:")
        print(f"  • Cultural Intelligence Score: {report.overall_cultural_intelligence_score:.1%}")
        print(f"  • Cultural Mastery Level: {report.cultural_mastery_classification}")
        print(f"  • Native Speaker Equivalence: {report.native_speaker_equivalence:.1%}")
        print(f"  • Cultural Expert Alignment: {report.cultural_expert_alignment:.1%}")
        print(f"  • Business Cultural Readiness: {report.business_cultural_readiness:.1%}")
        print(f"  • Success Rate: {report.success_rate:.1%}")
        print()
        
        # Domain Performance
        print("📋 DOMAIN PERFORMANCE:")
        for domain, score in report.domain_scores.items():
            domain_name = domain.name.replace('_', ' ').title()
            print(f"  • {domain_name:25s}: {score:.1%}")
        print()
        
        # Regional Performance  
        if report.regional_scores:
            print("🗺️  REGIONAL PERFORMANCE:")
            for region, score in report.regional_scores.items():
                region_name = region.name.replace('_', ' ').title()
                print(f"  • {region_name:15s}: {score:.1%}")
            print()
            
            print(f"🌟 STRONGEST REGIONAL EXPERTISE: {report.strongest_regional_knowledge.name.replace('_', ' ').title()}")
            if report.regional_knowledge_gaps:
                gaps_str = ", ".join([gap.name.replace('_', ' ').title() for gap in report.regional_knowledge_gaps])
                print(f"🔧 REGIONAL IMPROVEMENT AREAS: {gaps_str}")
            print()
        
        # Cultural Strengths
        if report.cultural_strengths:
            print("💪 CULTURAL STRENGTHS:")
            for strength in report.cultural_strengths[:5]:  # Top 5
                print(f"  • {strength}")
            print()
            
        # Competitive Advantages
        if report.competitive_advantages:
            print("🚀 COMPETITIVE ADVANTAGES:")
            for advantage in report.competitive_advantages:
                print(f"  • {advantage}")
            print()
            
        # Areas for Improvement
        if report.cultural_gaps:
            print("🔧 AREAS FOR IMPROVEMENT:")
            for area in report.cultural_gaps[:3]:  # Top 3
                print(f"  • {area}")
            print()
        
        # Success Assessment
        success_criteria = {
            'Overall Cultural Intelligence': (report.overall_cultural_intelligence_score, 0.95),
            'Native Speaker Equivalence': (report.native_speaker_equivalence, 0.92),
            'Cultural Expert Alignment': (report.cultural_expert_alignment, 0.95),
            'Business Cultural Readiness': (report.business_cultural_readiness, 0.96),
            'Success Rate': (report.success_rate, 0.90)
        }
        
        print("✅ SUCCESS CRITERIA ASSESSMENT:")
        all_passed = True
        for criterion, (actual, target) in success_criteria.items():
            passed = actual >= target
            status = "✅ PASSED" if passed else "❌ NEEDS IMPROVEMENT"
            print(f"  • {criterion:25s}: {actual:.1%} (Target: {target:.1%}) {status}")
            if not passed:
                all_passed = False
        print()
        
        # Overall Assessment
        if all_passed:
            print("🎉 CULTURAL INTELLIGENCE EXCELLENCE ACHIEVED!")
            print("   RomAI demonstrates world-class Romanian cultural intelligence.")
        else:
            print("🔄 CULTURAL INTELLIGENCE DEVELOPMENT NEEDED")
            print("   Additional training required in identified areas.")
        
        print()
        print("=" * 60)
        
    def save_results(self, report: CulturalIntelligenceReport, output_dir: str = "results"):
        """Save cultural intelligence test results to files."""
        
        # Create output directory
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        # Generate timestamp for unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save detailed JSON report
        json_file = output_path / f"cultural_intelligence_report_{timestamp}.json"
        report_dict = {
            'report_id': report.report_id,
            'timestamp': report.evaluation_timestamp.isoformat(),
            'overall_score': report.overall_cultural_intelligence_score,
            'cultural_mastery_classification': report.cultural_mastery_classification,
            'native_speaker_equivalence': report.native_speaker_equivalence,
            'cultural_expert_alignment': report.cultural_expert_alignment,
            'business_cultural_readiness': report.business_cultural_readiness,
            'success_rate': report.success_rate,
            'domain_scores': {domain.name: score for domain, score in report.domain_scores.items()},
            'regional_scores': {region.name: score for region, score in report.regional_scores.items()},
            'cultural_strengths': report.cultural_strengths,
            'cultural_gaps': report.cultural_gaps,
            'competitive_advantages': report.competitive_advantages,
            'cultural_differentiation_factors': report.cultural_differentiation_factors,
            'strongest_regional_knowledge': report.strongest_regional_knowledge.name,
            'regional_knowledge_gaps': [gap.name for gap in report.regional_knowledge_gaps],
            'confidence_consistency': report.confidence_consistency,
            'scenarios_evaluated': report.scenarios_evaluated
        }
        
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(report_dict, f, indent=2, ensure_ascii=False)
            
        if self.verbose:
            print(f"📄 Results saved to: {json_file}")
            
        return json_file

async def main():
    """Main execution function for cultural intelligence testing."""
    
    parser = argparse.ArgumentParser(description='RomAI Cultural Intelligence Testing')
    parser.add_argument('--quiet', '-q', action='store_true', 
                       help='Run in quiet mode (minimal output)')
    parser.add_argument('--output-dir', '-o', default='results',
                       help='Output directory for results (default: results)')
    
    args = parser.parse_args()
    
    # Create and run test runner
    runner = CulturalIntelligenceTestRunner(verbose=not args.quiet)
    
    try:
        # Execute comprehensive testing
        report = await runner.run_comprehensive_cultural_testing()
        
        # Display results
        runner.display_results(report)
        
        # Save results
        output_file = runner.save_results(report, args.output_dir)
        
        # Exit with appropriate code
        if report.overall_cultural_intelligence_score >= 0.95:
            print("\n🎉 Cultural Intelligence Excellence Achieved!")
            return 0
        else:
            print("\n🔄 Cultural Intelligence Development Needed")
            return 1
            
    except Exception as e:
        print(f"❌ Cultural Intelligence Testing Failed: {str(e)}")
        return 2

if __name__ == "__main__":
    exit(asyncio.run(main()))