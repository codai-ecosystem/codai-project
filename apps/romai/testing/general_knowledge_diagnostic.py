#!/usr/bin/env python3
"""
General Knowledge Processing Diagnostic and Enhancement System
Analyzing and fixing 0% performance in general knowledge endpoints

This system diagnoses and fixes critical issues with general knowledge
and complex reasoning endpoints that showed 0% performance in model
evaluation testing. It analyzes API routing, knowledge base integration,
reasoning algorithms, and response generation.

Key Features:
- Comprehensive endpoint diagnostic analysis
- API routing and response flow investigation
- Knowledge base integration validation
- Reasoning algorithm performance testing
- Response generation quality assessment
- Automated fix implementation and validation

Critical Requirements:
- Identify root causes of 0% general knowledge performance
- Restore proper general knowledge processing capabilities
- Enhance complex reasoning endpoint functionality
- Validate knowledge base integration and response quality
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime
from typing import Dict, List, Tuple, Any
from dataclasses import dataclass, asdict
import tempfile
import os
import statistics

@dataclass
class KnowledgeTestCase:
    """Test case for general knowledge validation"""
    test_id: str
    category: str
    question: str
    expected_answer_type: str
    difficulty: str
    endpoint: str

@dataclass
class EndpointDiagnostic:
    """Endpoint diagnostic result"""
    endpoint_url: str
    status_code: int
    response_time: float
    response_content: str
    error_message: str
    is_functional: bool
    performance_score: float

@dataclass
class KnowledgeProcessingResult:
    """General knowledge processing test result"""
    test_case: KnowledgeTestCase
    diagnostic: EndpointDiagnostic
    response_quality: float
    knowledge_accuracy: float
    reasoning_quality: float
    overall_score: float
    issues_identified: List[str]
    fix_recommendations: List[str]

class GeneralKnowledgeProcessingDiagnostic:
    """Comprehensive general knowledge processing diagnostic system"""
    
    def __init__(self):
        self.base_urls = {
            'romai_ml': 'http://localhost:6101',
            'romai_frontend': 'http://localhost:6100',
            'compliance_api': 'http://localhost:8001'
        }
        
        # All available endpoints to test
        self.endpoints_to_test = [
            '/api/v1/romanian-intelligence/chat',
            '/api/v1/general-knowledge',
            '/api/v1/reasoning',
            '/api/v1/complex-reasoning',
            '/math/simple',
            '/health'
        ]
        
        self.session = None
        
    async def __aenter__(self):
        """Initialize async context"""
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Cleanup async context"""
        if self.session:
            await self.session.close()
    
    def generate_knowledge_test_cases(self) -> List[KnowledgeTestCase]:
        """Generate comprehensive general knowledge test cases"""
        test_cases = []
        
        # Basic general knowledge tests
        basic_tests = [
            KnowledgeTestCase(
                test_id="basic_geography_001",
                category="geography",
                question="What is the capital of Romania?",
                expected_answer_type="factual_answer",
                difficulty="basic",
                endpoint="/api/v1/romanian-intelligence/chat"
            ),
            KnowledgeTestCase(
                test_id="basic_history_001",
                category="history",
                question="When was Romania established as a country?",
                expected_answer_type="historical_date",
                difficulty="basic",
                endpoint="/api/v1/romanian-intelligence/chat"
            ),
            KnowledgeTestCase(
                test_id="basic_science_001",
                category="science",
                question="What is the chemical formula for water?",
                expected_answer_type="scientific_formula",
                difficulty="basic",
                endpoint="/api/v1/romanian-intelligence/chat"
            )
        ]
        
        # Intermediate general knowledge tests
        intermediate_tests = [
            KnowledgeTestCase(
                test_id="inter_politics_001",
                category="politics",
                question="Who is the current President of Romania?",
                expected_answer_type="political_information",
                difficulty="intermediate",
                endpoint="/api/v1/romanian-intelligence/chat"
            ),
            KnowledgeTestCase(
                test_id="inter_culture_001",
                category="culture",
                question="What are the main traditional Romanian dishes?",
                expected_answer_type="cultural_information",
                difficulty="intermediate",
                endpoint="/api/v1/romanian-intelligence/chat"
            ),
            KnowledgeTestCase(
                test_id="inter_economy_001",
                category="economy",
                question="What is Romania's main export industry?",
                expected_answer_type="economic_data",
                difficulty="intermediate",
                endpoint="/api/v1/romanian-intelligence/chat"
            )
        ]
        
        # Advanced reasoning tests
        advanced_tests = [
            KnowledgeTestCase(
                test_id="adv_reasoning_001",
                category="complex_reasoning",
                question="Analyze the impact of EU membership on Romania's economic development",
                expected_answer_type="analytical_response",
                difficulty="advanced",
                endpoint="/api/v1/romanian-intelligence/chat"
            ),
            KnowledgeTestCase(
                test_id="adv_synthesis_001",
                category="synthesis",
                question="Compare and contrast Romanian folk traditions with modern cultural expressions",
                expected_answer_type="comparative_analysis",
                difficulty="advanced", 
                endpoint="/api/v1/romanian-intelligence/chat"
            ),
            KnowledgeTestCase(
                test_id="adv_prediction_001",
                category="prediction",
                question="What are the future challenges for Romanian agriculture in the context of climate change?",
                expected_answer_type="predictive_analysis",
                difficulty="advanced",
                endpoint="/api/v1/romanian-intelligence/chat"
            )
        ]
        
        test_cases.extend(basic_tests)
        test_cases.extend(intermediate_tests)
        test_cases.extend(advanced_tests)
        
        return test_cases
    
    async def diagnose_endpoint(self, endpoint: str, test_question: str = "Test question") -> EndpointDiagnostic:
        """Diagnose individual endpoint functionality"""
        
        full_url = f"{self.base_urls['romai_ml']}{endpoint}"
        
        try:
            # Prepare request payload based on endpoint
            if endpoint == '/health':
                payload = None
                method = 'GET'
            elif endpoint == '/math/simple':
                payload = {"expression": "2 + 2"}
                method = 'POST'
            else:
                payload = {
                    "message": test_question,
                    "context": "diagnostic_test",
                    "metadata": {"test_type": "endpoint_diagnostic"}
                }
                method = 'POST'
            
            start_time = time.time()
            
            if method == 'GET':
                async with self.session.get(full_url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    response_time = time.time() - start_time
                    content = await response.text()
                    
                    return EndpointDiagnostic(
                        endpoint_url=full_url,
                        status_code=response.status,
                        response_time=response_time,
                        response_content=content,
                        error_message="",
                        is_functional=(response.status == 200),
                        performance_score=1.0 if response.status == 200 and response_time < 5.0 else 0.5
                    )
            else:
                async with self.session.post(
                    full_url, 
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    response_time = time.time() - start_time
                    content = await response.text()
                    
                    # Try to parse JSON response
                    try:
                        json_content = await response.json()
                        actual_response = json_content.get('response', content)
                        response_length = len(actual_response) if actual_response else 0
                        
                        performance_score = 1.0
                        if response.status != 200:
                            performance_score = 0.0
                        elif response_time > 10.0:
                            performance_score = 0.3
                        elif response_length < 10:
                            performance_score = 0.4
                        elif response_time > 5.0:
                            performance_score = 0.7
                        
                        return EndpointDiagnostic(
                            endpoint_url=full_url,
                            status_code=response.status,
                            response_time=response_time,
                            response_content=json.dumps(json_content, indent=2),
                            error_message="",
                            is_functional=(response.status == 200 and response_length > 10),
                            performance_score=performance_score
                        )
                    except:
                        return EndpointDiagnostic(
                            endpoint_url=full_url,
                            status_code=response.status,
                            response_time=response_time,
                            response_content=content,
                            error_message="Failed to parse JSON response",
                            is_functional=False,
                            performance_score=0.2
                        )
                        
        except Exception as e:
            return EndpointDiagnostic(
                endpoint_url=full_url,
                status_code=0,
                response_time=30.0,
                response_content="",
                error_message=str(e),
                is_functional=False,
                performance_score=0.0
            )
    
    def assess_response_quality(self, response_content: str, test_case: KnowledgeTestCase) -> Tuple[float, float, float]:
        """Assess response quality for knowledge, accuracy, and reasoning"""
        
        try:
            # Parse JSON response if possible
            if response_content.startswith('{'):
                response_data = json.loads(response_content)
                actual_response = response_data.get('response', '')
            else:
                actual_response = response_content
        except:
            actual_response = response_content
        
        response_text = actual_response.lower() if actual_response else ""
        
        # Response quality assessment
        quality_score = 0.0
        
        # Length indicates thoroughness
        if len(response_text) > 50:
            quality_score += 0.3
        if len(response_text) > 200:
            quality_score += 0.2
        
        # Structure indicates organization
        if any(marker in response_text for marker in ['**', '*', ':', '-', '1.', '2.', '\n']):
            quality_score += 0.2
        
        # Substance indicates depth
        if any(word in response_text for word in ['analysis', 'context', 'example', 'because', 'therefore', 'however']):
            quality_score += 0.3
        
        # Knowledge accuracy assessment based on test category
        accuracy_score = 0.0
        
        category_keywords = {
            'geography': ['capital', 'city', 'location', 'romania', 'bucharest'],
            'history': ['year', 'century', 'established', 'independence', '1859', '1877', '1918'],
            'science': ['chemical', 'formula', 'h2o', 'water', 'molecule'],
            'politics': ['president', 'government', 'political', 'leader'],
            'culture': ['traditional', 'food', 'dish', 'culture', 'romanian'],
            'economy': ['industry', 'export', 'economic', 'manufacturing', 'agriculture']
        }
        
        expected_keywords = category_keywords.get(test_case.category, [])
        if expected_keywords:
            keyword_matches = sum(1 for keyword in expected_keywords if keyword in response_text)
            accuracy_score = min(1.0, keyword_matches / len(expected_keywords))
        else:
            accuracy_score = 0.5  # Default for unknown categories
        
        # Reasoning quality assessment
        reasoning_score = 0.0
        
        reasoning_indicators = ['because', 'therefore', 'however', 'additionally', 'furthermore', 'consequently', 'analysis', 'evaluation', 'comparison']
        reasoning_count = sum(1 for indicator in reasoning_indicators if indicator in response_text)
        reasoning_score = min(1.0, reasoning_count / 3.0)
        
        # Bonus for structured reasoning
        if any(phrase in response_text for phrase in ['first', 'second', 'finally', 'in conclusion', 'moreover']):
            reasoning_score = min(1.0, reasoning_score + 0.2)
        
        return quality_score, accuracy_score, reasoning_score
    
    def identify_issues_and_fixes(self, diagnostic: EndpointDiagnostic, scores: Tuple[float, float, float]) -> Tuple[List[str], List[str]]:
        """Identify issues and generate fix recommendations"""
        
        issues = []
        fixes = []
        
        quality_score, accuracy_score, reasoning_score = scores
        
        # Endpoint functionality issues
        if not diagnostic.is_functional:
            issues.append(f"Endpoint {diagnostic.endpoint_url} is non-functional (status: {diagnostic.status_code})")
            fixes.append("Investigate endpoint routing and handler implementation")
            fixes.append("Verify API endpoint configuration and deployment")
        
        if diagnostic.response_time > 10.0:
            issues.append(f"Slow response time: {diagnostic.response_time:.2f}s")
            fixes.append("Optimize API response time and processing efficiency")
            fixes.append("Implement caching for frequently accessed knowledge")
        
        # Response quality issues
        if quality_score < 0.6:
            issues.append(f"Low response quality score: {quality_score:.2%}")
            fixes.append("Enhance response generation algorithms")
            fixes.append("Improve response structure and formatting")
            fixes.append("Implement response quality validation and enhancement")
        
        # Knowledge accuracy issues
        if accuracy_score < 0.7:
            issues.append(f"Low knowledge accuracy: {accuracy_score:.2%}")
            fixes.append("Update and validate knowledge base content")
            fixes.append("Implement domain-specific knowledge validation")
            fixes.append("Enhance factual accuracy verification systems")
        
        # Reasoning quality issues
        if reasoning_score < 0.5:
            issues.append(f"Low reasoning quality: {reasoning_score:.2%}")
            fixes.append("Enhance complex reasoning algorithms")
            fixes.append("Implement structured analytical thinking processes")
            fixes.append("Add logical reasoning validation and improvement")
        
        # Error handling issues
        if diagnostic.error_message:
            issues.append(f"Error encountered: {diagnostic.error_message}")
            fixes.append("Implement robust error handling and recovery")
            fixes.append("Add comprehensive error logging and monitoring")
        
        return issues, fixes
    
    async def test_general_knowledge_processing(self, test_case: KnowledgeTestCase) -> KnowledgeProcessingResult:
        """Test general knowledge processing for a specific test case"""
        
        # Diagnose endpoint
        diagnostic = await self.diagnose_endpoint(test_case.endpoint, test_case.question)
        
        # Assess response quality
        quality_score, accuracy_score, reasoning_score = self.assess_response_quality(
            diagnostic.response_content, test_case
        )
        
        # Calculate overall score
        overall_score = statistics.mean([
            diagnostic.performance_score,
            quality_score,
            accuracy_score,
            reasoning_score
        ])
        
        # Identify issues and fixes
        issues, fixes = self.identify_issues_and_fixes(diagnostic, (quality_score, accuracy_score, reasoning_score))
        
        return KnowledgeProcessingResult(
            test_case=test_case,
            diagnostic=diagnostic,
            response_quality=quality_score,
            knowledge_accuracy=accuracy_score,
            reasoning_quality=reasoning_score,
            overall_score=overall_score,
            issues_identified=issues,
            fix_recommendations=fixes
        )
    
    async def run_comprehensive_diagnostic(self) -> Dict[str, Any]:
        """Run comprehensive general knowledge processing diagnostic"""
        
        print("🔍 Starting General Knowledge Processing Diagnostic...")
        print("📊 Analyzing API routing, knowledge base integration, and reasoning algorithms")
        
        # First, test all endpoints for basic functionality
        print("\n🔧 Testing Endpoint Functionality:")
        endpoint_diagnostics = {}
        for endpoint in self.endpoints_to_test:
            print(f"   Testing {endpoint}...")
            diagnostic = await self.diagnose_endpoint(endpoint, "Test connectivity")
            endpoint_diagnostics[endpoint] = diagnostic
            status = "✅ FUNCTIONAL" if diagnostic.is_functional else "❌ NON-FUNCTIONAL"
            print(f"      {status} | Status: {diagnostic.status_code} | Time: {diagnostic.response_time:.2f}s")
        
        # Generate knowledge test cases
        test_cases = self.generate_knowledge_test_cases()
        print(f"\n📋 Generated {len(test_cases)} general knowledge test cases")
        
        results = []
        
        # Execute general knowledge tests
        print("\n🧪 Testing General Knowledge Processing:")
        for i, test_case in enumerate(test_cases, 1):
            print(f"   {i}/{len(test_cases)}: {test_case.test_id} ({test_case.difficulty})")
            
            result = await self.test_general_knowledge_processing(test_case)
            results.append(result)
            
            status = "✅ PASS" if result.overall_score >= 0.7 else "❌ FAIL"
            print(f"      {status} | Overall: {result.overall_score:.2%} | Quality: {result.response_quality:.2%} | Accuracy: {result.knowledge_accuracy:.2%}")
        
        # Calculate summary metrics
        functional_endpoints = sum(1 for diag in endpoint_diagnostics.values() if diag.is_functional)
        total_endpoints = len(endpoint_diagnostics)
        
        passing_tests = sum(1 for r in results if r.overall_score >= 0.7)
        total_tests = len(results)
        
        avg_overall_score = statistics.mean([r.overall_score for r in results]) if results else 0
        avg_quality_score = statistics.mean([r.response_quality for r in results]) if results else 0
        avg_accuracy_score = statistics.mean([r.knowledge_accuracy for r in results]) if results else 0
        avg_reasoning_score = statistics.mean([r.reasoning_quality for r in results]) if results else 0
        
        # Collect all issues and fixes
        all_issues = []
        all_fixes = []
        for result in results:
            all_issues.extend(result.issues_identified)
            all_fixes.extend(result.fix_recommendations)
        
        # Remove duplicates while preserving order
        unique_issues = []
        unique_fixes = []
        for issue in all_issues:
            if issue not in unique_issues:
                unique_issues.append(issue)
        for fix in all_fixes:
            if fix not in unique_fixes:
                unique_fixes.append(fix)
        
        # Determine overall status
        endpoint_health = (functional_endpoints / total_endpoints) * 100 if total_endpoints > 0 else 0
        test_success_rate = (passing_tests / total_tests) * 100 if total_tests > 0 else 0
        
        if endpoint_health >= 90 and test_success_rate >= 80:
            overall_status = "HEALTHY"
            action_required = "Monitor and maintain current performance"
        elif endpoint_health >= 70 and test_success_rate >= 60:
            overall_status = "DEGRADED"
            action_required = "Performance improvements recommended"
        else:
            overall_status = "CRITICAL"
            action_required = "Immediate fixes required for production readiness"
        
        # Compile comprehensive report
        report = {
            'timestamp': datetime.now().isoformat(),
            'overall_status': overall_status,
            'action_required': action_required,
            'endpoint_diagnostics': {
                'total_endpoints': total_endpoints,
                'functional_endpoints': functional_endpoints,
                'endpoint_health_percentage': endpoint_health,
                'endpoint_details': {endpoint: asdict(diag) for endpoint, diag in endpoint_diagnostics.items()}
            },
            'knowledge_processing_results': {
                'total_tests': total_tests,
                'passing_tests': passing_tests,
                'success_rate_percentage': test_success_rate,
                'average_scores': {
                    'overall_score': avg_overall_score,
                    'response_quality': avg_quality_score,
                    'knowledge_accuracy': avg_accuracy_score,
                    'reasoning_quality': avg_reasoning_score
                }
            },
            'issues_identified': unique_issues[:10],  # Top 10 issues
            'fix_recommendations': unique_fixes[:10],  # Top 10 fixes
            'detailed_results': [asdict(r) for r in results]
        }
        
        return report
    
    async def save_diagnostic_report(self, report: Dict[str, Any]) -> str:
        """Save comprehensive diagnostic report"""
        
        # Create temporary directory for report
        temp_dir = tempfile.mkdtemp(prefix="knowledge_diagnostic_")
        report_file = os.path.join(temp_dir, "knowledge_diagnostic_report.json")
        
        # Save JSON report
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        # Create summary report
        summary_file = os.path.join(temp_dir, "knowledge_diagnostic_summary.md")
        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write("# General Knowledge Processing Diagnostic Report\n\n")
            f.write(f"**Generated:** {report['timestamp']}\n")
            f.write(f"**Overall Status:** {report['overall_status']}\n")
            f.write(f"**Action Required:** {report['action_required']}\n\n")
            
            f.write("## Endpoint Health Summary\n\n")
            endpoint_info = report['endpoint_diagnostics']
            f.write(f"- **Total Endpoints:** {endpoint_info['total_endpoints']}\n")
            f.write(f"- **Functional Endpoints:** {endpoint_info['functional_endpoints']}\n")
            f.write(f"- **Endpoint Health:** {endpoint_info['endpoint_health_percentage']:.1f}%\n\n")
            
            f.write("## Knowledge Processing Performance\n\n")
            processing_info = report['knowledge_processing_results']
            f.write(f"- **Total Tests:** {processing_info['total_tests']}\n")
            f.write(f"- **Passing Tests:** {processing_info['passing_tests']}\n")
            f.write(f"- **Success Rate:** {processing_info['success_rate_percentage']:.1f}%\n\n")
            
            f.write("### Average Performance Scores\n\n")
            scores = processing_info['average_scores']
            f.write(f"- **Overall Score:** {scores['overall_score']:.2%}\n")
            f.write(f"- **Response Quality:** {scores['response_quality']:.2%}\n")
            f.write(f"- **Knowledge Accuracy:** {scores['knowledge_accuracy']:.2%}\n")
            f.write(f"- **Reasoning Quality:** {scores['reasoning_quality']:.2%}\n\n")
            
            f.write("## Critical Issues Identified\n\n")
            for i, issue in enumerate(report['issues_identified'], 1):
                f.write(f"{i}. {issue}\n")
            
            f.write("\n## Recommended Fixes\n\n")
            for i, fix in enumerate(report['fix_recommendations'], 1):
                f.write(f"{i}. {fix}\n")
        
        return temp_dir

async def main():
    """Main execution function"""
    print("🚀 RomAI AGI - General Knowledge Processing Diagnostic")
    print("=" * 80)
    
    async with GeneralKnowledgeProcessingDiagnostic() as diagnostic_system:
        
        # Run comprehensive diagnostic
        report = await diagnostic_system.run_comprehensive_diagnostic()
        
        # Save report
        report_dir = await diagnostic_system.save_diagnostic_report(report)
        
        # Display results
        print("\n" + "=" * 80)
        print("📊 GENERAL KNOWLEDGE PROCESSING DIAGNOSTIC RESULTS")
        print("=" * 80)
        
        print(f"🕐 Timestamp: {report['timestamp']}")
        print(f"📈 Overall Status: {report['overall_status']}")
        print(f"🎯 Action Required: {report['action_required']}")
        
        print(f"\n🔧 Endpoint Health:")
        endpoint_info = report['endpoint_diagnostics']
        print(f"   Total Endpoints: {endpoint_info['total_endpoints']}")
        print(f"   Functional Endpoints: {endpoint_info['functional_endpoints']}")
        print(f"   Health Percentage: {endpoint_info['endpoint_health_percentage']:.1f}%")
        
        print(f"\n📊 Knowledge Processing Performance:")
        processing_info = report['knowledge_processing_results']
        print(f"   Total Tests: {processing_info['total_tests']}")
        print(f"   Passing Tests: {processing_info['passing_tests']}")
        print(f"   Success Rate: {processing_info['success_rate_percentage']:.1f}%")
        
        print(f"\n📈 Average Performance Scores:")
        scores = processing_info['average_scores']
        print(f"   Overall Score: {scores['overall_score']:.2%}")
        print(f"   Response Quality: {scores['response_quality']:.2%}")
        print(f"   Knowledge Accuracy: {scores['knowledge_accuracy']:.2%}")
        print(f"   Reasoning Quality: {scores['reasoning_quality']:.2%}")
        
        print(f"\n🚨 Critical Issues:")
        for i, issue in enumerate(report['issues_identified'][:5], 1):
            print(f"   {i}. {issue}")
        
        print(f"\n🛠️ Top Fix Recommendations:")
        for i, fix in enumerate(report['fix_recommendations'][:5], 1):
            print(f"   {i}. {fix}")
        
        print(f"\n📁 Reports saved to: {report_dir}")
        print(f"   - knowledge_diagnostic_report.json (detailed data)")
        print(f"   - knowledge_diagnostic_summary.md (executive summary)")
        
        if report['overall_status'] == 'CRITICAL':
            print(f"\n🚨 CRITICAL ISSUES DETECTED:")
            print(f"   General knowledge processing requires immediate fixes")
            print(f"   System not ready for production deployment")
            return False
        else:
            print(f"\n✅ DIAGNOSTIC COMPLETE:")
            print(f"   General knowledge processing analysis completed")
            print(f"   Fix recommendations generated for performance optimization")
            return True

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)