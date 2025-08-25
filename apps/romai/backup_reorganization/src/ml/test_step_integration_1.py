"""
Phase 4 Integration Test - Multi-Modal Intelligence
Comprehensive testing of vision-language capabilities, document processing, and cross-modal reasoning
"""

import asyncio
import time
import logging
from pathlib import Path
from typing import Dict, List, Any
import sys

# Import Phase 4 components
from multimodal_intelligence_core import (
    MultiModalIntelligenceCore, MultiModalInput, ModalityType, ProcessingComplexity
)
from vision_language_processor import (
    VisionLanguageProcessor, VisionLanguageQuery
)
from document_processor import (
    DocumentProcessor, ProcessingMode
)
from multimodal_reasoner import (
    MultiModalReasoner, ReasoningType
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class Phase4IntegrationTester:
    """Comprehensive Phase 4 multi-modal intelligence testing"""
    
    def __init__(self):
        self.core_system = MultiModalIntelligenceCore()
        self.vision_processor = VisionLanguageProcessor()
        self.document_processor = DocumentProcessor()
        self.multimodal_reasoner = MultiModalReasoner()
        self.test_results = {
            "component_tests": {},
            "integration_tests": {},
            "performance_metrics": {},
            "overall_score": 0.0
        }
    
    async def test_multimodal_core(self) -> Dict[str, Any]:
        """Test multi-modal intelligence core"""
        print("🚀 Testing Multi-Modal Intelligence Core...")
        
        try:
            # Test 1: Text-only processing
            text_input = MultiModalInput(
                text="Analyze the environmental impact of renewable energy adoption in urban areas.",
                modalities=[ModalityType.TEXT]
            )
            
            start_time = time.time()
            result = await self.core_system.process_multimodal_input(text_input)
            processing_time = time.time() - start_time
            
            # Test 2: Multi-modal simulation (with error handling)
            multimodal_input = MultiModalInput(
                text="Compare the visual and textual information provided",
                image_data=b"simulated_image_data",
                modalities=[ModalityType.TEXT, ModalityType.IMAGE],
                processing_hints={"cross_modal_reasoning": True}
            )
            
            multimodal_result = await self.core_system.process_multimodal_input(multimodal_input)
            
            # Evaluate results
            score = 0.0
            
            # Text processing evaluation
            if result.primary_response and len(result.primary_response) > 50:
                score += 25
            
            if result.processing_time < 5.0:
                score += 15
            
            if len(result.modality_analysis) > 0:
                score += 20
            
            # Multi-modal handling evaluation
            if multimodal_result.complexity_assessment == ProcessingComplexity.COMPLEX:
                score += 20
            
            if len(multimodal_result.cross_modal_insights) > 0:
                score += 20
            
            return {
                "score": score,
                "max_score": 100,
                "processing_time": processing_time,
                "complexity_assessment": result.complexity_assessment.value,
                "modalities_processed": len(result.modality_analysis),
                "cross_modal_insights": len(multimodal_result.cross_modal_insights),
                "success": score >= 70
            }
        
        except Exception as e:
            logger.error(f"Multi-modal core test error: {str(e)}")
            return {
                "score": 0,
                "max_score": 100,
                "error": str(e),
                "success": False
            }
    
    async def test_vision_language_processor(self) -> Dict[str, Any]:
        """Test vision-language processing capabilities"""
        print("🔍 Testing Vision-Language Processor...")
        
        try:
            # Test vision query processing (graceful failure expected)
            vision_query = VisionLanguageQuery(
                image_data=b"test_image_data",
                text_query="Describe what you see in this image and identify key objects",
                query_type="general",
                expected_response_type="description"
            )
            
            start_time = time.time()
            result = await self.vision_processor.process_vision_language_query(vision_query)
            processing_time = time.time() - start_time
            
            # Component testing
            component_tests = []
            
            # Test color classification
            try:
                tone = self.vision_processor._classify_color_tone(180, 100, 80)
                component_tests.append(("Color Classification", True, tone))
            except Exception as e:
                component_tests.append(("Color Classification", False, str(e)))
            
            # Test resolution classification
            try:
                res_cat = self.vision_processor._classify_resolution(1920, 1080)
                component_tests.append(("Resolution Classification", True, res_cat))
            except Exception as e:
                component_tests.append(("Resolution Classification", False, str(e)))
            
            # Evaluate results
            score = 0.0
            
            # Processing capability
            if result.description and len(result.description) > 20:
                score += 30
            
            # Processing time
            if processing_time < 3.0:
                score += 20
            
            # Component functionality
            successful_components = sum(1 for _, success, _ in component_tests if success)
            component_score = (successful_components / len(component_tests)) * 30
            score += component_score
            
            # Error handling
            if result.confidence_score > 0.0:  # Handled gracefully
                score += 20
            
            return {
                "score": score,
                "max_score": 100,
                "processing_time": processing_time,
                "confidence_score": result.confidence_score,
                "component_tests": component_tests,
                "description_generated": bool(result.description),
                "success": score >= 60
            }
        
        except Exception as e:
            logger.error(f"Vision-language processor test error: {str(e)}")
            return {
                "score": 0,
                "max_score": 100,
                "error": str(e),
                "success": False
            }
    
    async def test_document_processor(self) -> Dict[str, Any]:
        """Test document processing capabilities"""
        print("📄 Testing Document Processor...")
        
        try:
            # Test document processing with sample content
            test_document = """# Multi-Modal AI Systems
            
This document explores the integration of various AI modalities for enhanced intelligence.

## Vision Processing
Vision processing enables AI systems to understand and analyze visual content.

### Key Features
- Image recognition
- Object detection
- Scene understanding

## Natural Language Processing
NLP capabilities allow understanding of text and speech.

```python
def process_text(text):
    return analyze_sentiment(text)
```

## Conclusion
Multi-modal AI represents the future of intelligent systems.
"""
            
            start_time = time.time()
            result = await self.document_processor.process_document(
                content=test_document,
                processing_mode=ProcessingMode.COMPREHENSIVE
            )
            processing_time = time.time() - start_time
            
            # Test document type detection
            detection_tests = [
                ("markdown", "# Heading\nContent", "markdown"),
                ("json", '{"key": "value"}', "json"),
                ("html", "<html><body>Test</body></html>", "html"),
            ]
            
            detection_results = []
            for name, content, expected in detection_tests:
                detected = self.document_processor.detect_document_type(content=content)
                correct = detected.value == expected
                detection_results.append((name, correct, detected.value))
            
            # Evaluate results
            score = 0.0
            
            # Processing accuracy
            if result.metadata.word_count > 0:
                score += 20
            
            if len(result.structure.headings) > 0:
                score += 20
            
            if len(result.structure.code_blocks) > 0:
                score += 15
            
            # Content analysis
            if result.content.summary and len(result.content.summary) > 20:
                score += 20
            
            # Document type detection
            correct_detections = sum(1 for _, correct, _ in detection_results if correct)
            detection_score = (correct_detections / len(detection_results)) * 15
            score += detection_score
            
            # Performance
            if processing_time < 4.0:
                score += 10
            
            return {
                "score": score,
                "max_score": 100,
                "processing_time": processing_time,
                "word_count": result.metadata.word_count,
                "headings_found": len(result.structure.headings),
                "code_blocks": len(result.structure.code_blocks),
                "detection_accuracy": correct_detections / len(detection_results),
                "confidence_score": result.confidence_score,
                "success": score >= 70
            }
        
        except Exception as e:
            logger.error(f"Document processor test error: {str(e)}")
            return {
                "score": 0,
                "max_score": 100,
                "error": str(e),
                "success": False
            }
    
    async def test_multimodal_reasoner(self) -> Dict[str, Any]:
        """Test multi-modal reasoning capabilities"""
        print("🧠 Testing Multi-Modal Reasoner...")
        
        try:
            # Create mock multimodal output for reasoning
            from multimodal_intelligence_core import MultiModalOutput
            from multimodal_reasoner import CrossModalEvidence
            
            mock_output = MultiModalOutput(
                primary_response="Comprehensive analysis of renewable energy impacts",
                modality_analysis={
                    ModalityType.TEXT: {
                        "analysis": "Text analysis reveals positive environmental trends",
                        "confidence": 0.8,
                        "word_count": 150
                    },
                    ModalityType.DOCUMENT: {
                        "analysis": "Document contains technical specifications and data",
                        "confidence": 0.75,
                        "text_length": 500
                    }
                },
                cross_modal_insights=[
                    "Text and document sources align on environmental benefits",
                    "Technical data supports positive trend analysis"
                ],
                confidence_scores={"text": 0.8, "document": 0.75},
                processing_time=2.1,
                complexity_assessment=ProcessingComplexity.COMPLEX
            )
            
            # Test reasoning across modalities
            test_query = "What conclusions can be drawn about renewable energy environmental impact from the available evidence?"
            
            start_time = time.time()
            reasoning_result = await self.multimodal_reasoner.reason_across_modalities(
                test_query, mock_output
            )
            processing_time = time.time() - start_time
            
            # Test reasoning type identification
            reasoning_types = self.multimodal_reasoner.identify_reasoning_requirements(
                test_query, []
            )
            
            # Test evidence extraction
            evidence = self.multimodal_reasoner.extract_evidence_from_modalities(mock_output)
            
            # Evaluate results
            score = 0.0
            
            # Reasoning chain generation
            if len(reasoning_result.reasoning_chains) > 0:
                score += 25
            
            # Evidence extraction
            if len(evidence) > 0:
                score += 20
            
            # Final conclusion
            if reasoning_result.final_conclusion and len(reasoning_result.final_conclusion) > 30:
                score += 20
            
            # Reasoning type identification
            if len(reasoning_types) > 0:
                score += 15
            
            # Confidence assessment
            if reasoning_result.confidence_assessment:
                score += 10
            
            # Performance
            if processing_time < 5.0:
                score += 10
            
            return {
                "score": score,
                "max_score": 100,
                "processing_time": processing_time,
                "reasoning_chains": len(reasoning_result.reasoning_chains),
                "evidence_extracted": len(evidence),
                "reasoning_types_identified": len(reasoning_types),
                "confidence_level": reasoning_result.confidence_assessment.value,
                "modalities_analyzed": len(reasoning_result.modalities_analyzed),
                "success": score >= 70
            }
        
        except Exception as e:
            logger.error(f"Multi-modal reasoner test error: {str(e)}")
            return {
                "score": 0,
                "max_score": 100,
                "error": str(e),
                "success": False
            }
    
    async def test_full_integration(self) -> Dict[str, Any]:
        """Test complete multi-modal intelligence pipeline"""
        print("🔗 Testing Full Multi-Modal Integration...")
        
        try:
            # Create comprehensive multi-modal input
            integration_input = MultiModalInput(
                text="Analyze this renewable energy report and provide insights on implementation strategies",
                document_data=b"""# Renewable Energy Implementation Report

## Executive Summary
The transition to renewable energy sources shows significant promise for urban sustainability.

## Key Findings
- Solar installations increased 40% in urban areas
- Wind energy adoption faces infrastructure challenges
- Energy storage solutions are critical for success

## Recommendations
1. Prioritize solar installations on commercial buildings
2. Develop micro-wind solutions for urban environments
3. Invest in battery storage infrastructure
""",
                modalities=[ModalityType.TEXT, ModalityType.DOCUMENT],
                processing_hints={"cross_modal_reasoning": True, "analytical_depth": "high"}
            )
            
            # Process through full pipeline
            start_time = time.time()
            
            # Step 1: Multi-modal processing
            multimodal_result = await self.core_system.process_multimodal_input(integration_input)
            
            # Step 2: Cross-modal reasoning
            reasoning_result = await self.multimodal_reasoner.reason_across_modalities(
                integration_input.text, multimodal_result
            )
            
            total_processing_time = time.time() - start_time
            
            # Evaluate integration
            score = 0.0
            
            # Multi-modal processing
            if len(multimodal_result.modality_analysis) >= 2:
                score += 25
            
            # Cross-modal insights
            if len(multimodal_result.cross_modal_insights) > 0:
                score += 20
            
            # Reasoning integration
            if len(reasoning_result.reasoning_chains) > 0:
                score += 25
            
            # Final synthesis
            if reasoning_result.final_conclusion and len(reasoning_result.final_conclusion) > 50:
                score += 20
            
            # Overall performance
            if total_processing_time < 10.0:
                score += 10
            
            return {
                "score": score,
                "max_score": 100,
                "total_processing_time": total_processing_time,
                "modalities_processed": len(multimodal_result.modality_analysis),
                "cross_modal_insights": len(multimodal_result.cross_modal_insights),
                "reasoning_chains": len(reasoning_result.reasoning_chains),
                "final_conclusion_length": len(reasoning_result.final_conclusion),
                "confidence_level": reasoning_result.confidence_assessment.value,
                "success": score >= 75
            }
        
        except Exception as e:
            logger.error(f"Full integration test error: {str(e)}")
            return {
                "score": 0,
                "max_score": 100,
                "error": str(e),
                "success": False
            }
    
    async def run_comprehensive_test(self) -> Dict[str, Any]:
        """Run comprehensive Phase 4 testing"""
        print("🎯 Starting Phase 4 Multi-Modal Intelligence Comprehensive Testing")
        print("=" * 70)
        
        overall_start_time = time.time()
        
        # Run all component tests
        test_methods = [
            ("Multi-Modal Core", self.test_multimodal_core),
            ("Vision-Language Processor", self.test_vision_language_processor),
            ("Document Processor", self.test_document_processor),
            ("Multi-Modal Reasoner", self.test_multimodal_reasoner),
            ("Full Integration", self.test_full_integration)
        ]
        
        test_results = {}
        total_score = 0
        max_total_score = 0
        
        for test_name, test_method in test_methods:
            print(f"\n{'-' * 50}")
            result = await test_method()
            test_results[test_name] = result
            
            score = result.get("score", 0)
            max_score = result.get("max_score", 100)
            success = result.get("success", False)
            
            total_score += score
            max_total_score += max_score
            
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"   {test_name}: {status} - {score}/{max_score} ({score/max_score:.1%})")
            
            if "processing_time" in result:
                print(f"   Processing Time: {result['processing_time']:.3f}s")
        
        # Calculate overall metrics
        overall_processing_time = time.time() - overall_start_time
        overall_percentage = total_score / max_total_score
        
        # Determine overall grade
        if overall_percentage >= 0.90:
            grade = "A+"
            status = "EXCELLENT"
        elif overall_percentage >= 0.85:
            grade = "A"
            status = "EXCELLENT"
        elif overall_percentage >= 0.80:
            grade = "B+"
            status = "VERY GOOD"
        elif overall_percentage >= 0.75:
            grade = "B"
            status = "GOOD"
        elif overall_percentage >= 0.70:
            grade = "B-"
            status = "SATISFACTORY"
        elif overall_percentage >= 0.60:
            grade = "C+"
            status = "NEEDS IMPROVEMENT"
        else:
            grade = "C"
            status = "REQUIRES ATTENTION"
        
        print(f"\n{'=' * 70}")
        print(f"📊 PHASE 4 MULTI-MODAL INTELLIGENCE - FINAL RESULTS")
        print(f"{'=' * 70}")
        print(f"🎯 Overall Score: {total_score}/{max_total_score} ({overall_percentage:.1%})")
        print(f"🏆 Grade: {grade} - {status}")
        print(f"⏱️  Total Testing Time: {overall_processing_time:.3f}s")
        print(f"🔧 Components Tested: {len(test_methods)}")
        
        # Component breakdown
        print(f"\n📋 Component Performance:")
        for test_name, result in test_results.items():
            score = result.get("score", 0)
            max_score = result.get("max_score", 100)
            percentage = score / max_score if max_score > 0 else 0
            status_icon = "✅" if percentage >= 0.7 else "⚠️" if percentage >= 0.5 else "❌"
            print(f"   {status_icon} {test_name}: {percentage:.1%}")
        
        # Success indicators
        successful_tests = sum(1 for result in test_results.values() if result.get("success", False))
        print(f"\n✅ Successful Tests: {successful_tests}/{len(test_methods)}")
        
        # Performance characteristics
        avg_processing_time = sum(
            result.get("processing_time", 0) 
            for result in test_results.values() 
            if "processing_time" in result
        ) / len([r for r in test_results.values() if "processing_time" in r])
        
        print(f"⚡ Average Processing Time: {avg_processing_time:.3f}s")
        
        return {
            "overall_score": total_score,
            "max_score": max_total_score,
            "percentage": overall_percentage,
            "grade": grade,
            "status": status,
            "total_testing_time": overall_processing_time,
            "successful_tests": successful_tests,
            "total_tests": len(test_methods),
            "test_results": test_results,
            "phase_4_complete": overall_percentage >= 0.75
        }

async def test_phase_4_integration():
    """Main test function for Phase 4"""
    try:
        tester = Phase4IntegrationTester()
        results = await tester.run_comprehensive_test()
        
        # Save results summary
        summary = {
            "phase": "Phase 4 - Multi-Modal Intelligence",
            "completion_status": "COMPLETED" if results["phase_4_complete"] else "PARTIAL",
            "final_score": f"{results['overall_score']}/{results['max_score']}",
            "grade": results["grade"],
            "success_rate": f"{results['successful_tests']}/{results['total_tests']}",
            "total_time": f"{results['total_testing_time']:.3f}s"
        }
        
        print(f"\n🎯 Phase 4 Summary:")
        for key, value in summary.items():
            print(f"   {key.replace('_', ' ').title()}: {value}")
        
        return results
        
    except Exception as e:
        logger.error(f"Phase 4 integration test failed: {str(e)}")
        print(f"❌ Phase 4 Integration Test FAILED: {str(e)}")
        return {
            "overall_score": 0,
            "max_score": 500,
            "error": str(e),
            "phase_4_complete": False
        }

if __name__ == "__main__":
    asyncio.run(test_phase_4_integration())