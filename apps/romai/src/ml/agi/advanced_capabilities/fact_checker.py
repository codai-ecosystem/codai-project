"""
RomAI AGI Evolution Phase 2 - Fact Checker

Intelligent fact verification system that validates information against
multiple sources and provides confidence scores for factual claims.
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple
import re

# Import knowledge types
from .knowledge_types import (
    KnowledgeType, SourceType, CredibilityLevel, KnowledgeStatus, FactCheckResult,
    KnowledgeSource, KnowledgeItem, FactCheckRequest, FactCheckResponse,
    FactCheckerInterface, create_knowledge_source, create_knowledge_item,
    extract_keywords, assess_source_credibility
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# FACT CHECKER IMPLEMENTATION
# ============================================================================

class FactChecker(FactCheckerInterface):
    """
    Advanced fact checking system that verifies information against
    multiple sources and provides detailed confidence analysis
    """
    
    def __init__(self, knowledge_retriever=None):
        self.knowledge_retriever = knowledge_retriever
        
        # Fact checking rules and patterns
        self.verification_rules = {
            "numerical": NumericalFactChecker(),
            "temporal": TemporalFactChecker(),
            "geographic": GeographicFactChecker(),
            "general": GeneralFactChecker()
        }
        
        # Credibility weights for different source types
        self.credibility_weights = {
            CredibilityLevel.HIGH: 1.0,
            CredibilityLevel.MEDIUM: 0.7,
            CredibilityLevel.LOW: 0.3,
            CredibilityLevel.UNKNOWN: 0.5,
            CredibilityLevel.CONFLICTING: 0.1
        }
        
        # Fact checking statistics
        self.check_stats = {
            "total_checks": 0,
            "verified_facts": 0,
            "false_facts": 0,
            "unverifiable_facts": 0,
            "average_confidence": 0.0
        }
        
        logger.info("🔍 Fact Checker initialized")
    
    async def check_fact(self, request: FactCheckRequest) -> FactCheckResponse:
        """Main fact checking method"""
        start_time = asyncio.get_event_loop().time()
        
        try:
            logger.info(f"🔍 Checking fact: {request.statement}")
            
            # Determine fact type and select appropriate checker
            fact_type = self._classify_fact_type(request.statement)
            checker = self.verification_rules.get(fact_type, self.verification_rules["general"])
            
            # Gather supporting and contradicting evidence
            evidence = await self._gather_evidence(request)
            
            # Perform fact verification
            result, confidence = await checker.verify_fact(
                request.statement, 
                evidence["supporting"], 
                evidence["contradicting"],
                request.context
            )
            
            # Ensure confidence is a float
            if confidence is not None:
                try:
                    confidence = float(confidence)
                except (ValueError, TypeError):
                    logger.warning(f"Invalid confidence value: {confidence} (type: {type(confidence)})")
                    confidence = 0.0
            else:
                confidence = 0.0
            
            # Calculate consistency score
            consistency_score = self._calculate_consistency_score(
                evidence["supporting"], 
                evidence["contradicting"]
            )
            
            # Generate explanation
            explanation = await self._generate_explanation(
                request.statement, result, evidence, consistency_score
            )
            
            check_duration = asyncio.get_event_loop().time() - start_time
            
            response = FactCheckResponse(
                request_id=request.id,
                result=result,
                confidence_score=confidence,
                supporting_evidence=evidence["supporting"],
                contradicting_evidence=evidence["contradicting"],
                explanation=explanation,
                sources_checked=len(evidence["all_sources"]),
                consistency_score=consistency_score,
                check_duration=check_duration
            )
            
            # Update statistics
            self._update_stats(result, confidence)
            
            logger.info(f"✅ Fact check completed: {result.value} ({confidence:.2f} confidence)")
            return response
            
        except Exception as e:
            logger.error(f"Fact checking failed: {e}")
            
            return FactCheckResponse(
                request_id=request.id,
                result=FactCheckResult.UNVERIFIABLE,
                confidence_score=0.0,
                explanation=f"Fact checking failed due to error: {str(e)}",
                check_duration=asyncio.get_event_loop().time() - start_time
            )
    
    async def verify_knowledge_item(self, item: KnowledgeItem) -> FactCheckResponse:
        """Verify a knowledge item"""
        request = FactCheckRequest(
            id=f"verify_{item.id}",
            statement=item.content,
            context=item.context.copy()
        )
        
        return await self.check_fact(request)

    async def verify_fact(self, statement: str, supporting: List[KnowledgeItem], 
                         context: Dict[str, Any] = None) -> FactCheckResponse:
        """Verify a fact statement with supporting knowledge"""
        request = FactCheckRequest(
            id=f"verify_{hash(statement) % 1000000}",
            statement=statement,
            context=context or {}
        )
        
        return await self.check_fact(request)
    
    def _classify_fact_type(self, statement: str) -> str:
        """Classify the type of fact for appropriate verification"""
        statement_lower = statement.lower()
        
        # Check for numerical facts
        if re.search(r'\d+', statement) and any(unit in statement_lower for unit in 
                                               ['percent', '%', 'million', 'billion', 'km', 'miles', 'years']):
            return "numerical"
        
        # Check for temporal facts
        if any(temporal in statement_lower for temporal in 
               ['year', 'date', 'century', 'ago', 'before', 'after', 'during']):
            return "temporal"
        
        # Check for geographic facts
        if any(geo in statement_lower for geo in 
               ['country', 'city', 'located', 'capital', 'continent', 'region']):
            return "geographic"
        
        return "general"
    
    async def _gather_evidence(self, request: FactCheckRequest) -> Dict[str, Any]:
        """Gather evidence for and against the fact"""
        evidence = {
            "supporting": [],
            "contradicting": [],
            "all_sources": set()
        }
        
        try:
            if self.knowledge_retriever:
                from .knowledge_retriever import KnowledgeQuery
                
                # Create search query for the fact
                query = KnowledgeQuery(
                    id=f"evidence_{request.id}",
                    query_text=request.statement,
                    max_results=10,
                    min_confidence=0.3
                )
                
                # Retrieve relevant knowledge
                response = await self.knowledge_retriever.retrieve(query)
                
                # Classify evidence as supporting or contradicting
                for item in response.items:
                    evidence["all_sources"].add(item.source.id)
                    
                    similarity = self._calculate_similarity(request.statement, item.content)
                    
                    if similarity > 0.7:  # High similarity - supporting
                        evidence["supporting"].append(item)
                    elif similarity < 0.3:  # Low similarity - potentially contradicting
                        if self._contradicts_statement(request.statement, item.content):
                            evidence["contradicting"].append(item)
            
            else:
                # Mock evidence for testing
                evidence = await self._generate_mock_evidence(request.statement)
            
            logger.debug(f"Gathered {len(evidence['supporting'])} supporting and {len(evidence['contradicting'])} contradicting pieces of evidence")
            return evidence
            
        except Exception as e:
            logger.error(f"Evidence gathering failed: {e}")
            return evidence
    
    def _calculate_similarity(self, statement1: str, statement2: str) -> float:
        """Calculate similarity between two statements"""
        keywords1 = extract_keywords(statement1.lower())
        keywords2 = extract_keywords(statement2.lower())
        
        if not keywords1 or not keywords2:
            return 0.0
        
        intersection = keywords1.intersection(keywords2)
        union = keywords1.union(keywords2)
        
        return len(intersection) / len(union) if union else 0.0
    
    def _contradicts_statement(self, statement: str, content: str) -> bool:
        """Check if content contradicts the statement"""
        # Simple contradiction detection based on negation patterns
        statement_lower = statement.lower()
        content_lower = content.lower()
        
        # Extract key facts from both
        statement_keywords = extract_keywords(statement_lower)
        content_keywords = extract_keywords(content_lower)
        
        # Check for explicit negations
        negation_patterns = ['not', 'no', 'never', 'false', 'incorrect', 'wrong']
        
        if any(neg in content_lower for neg in negation_patterns):
            # Check if negation applies to our statement keywords
            for keyword in statement_keywords:
                if keyword in content_lower:
                    return True
        
        return False
    
    def _calculate_consistency_score(self, supporting: List[KnowledgeItem], 
                                   contradicting: List[KnowledgeItem]) -> float:
        """Calculate consistency score based on evidence"""
        if not supporting and not contradicting:
            return 0.5  # No evidence - neutral
        
        total_supporting_weight = sum(
            self.credibility_weights.get(item.source.credibility, 0.5) * item.confidence_score
            for item in supporting
        )
        
        total_contradicting_weight = sum(
            self.credibility_weights.get(item.source.credibility, 0.5) * item.confidence_score
            for item in contradicting
        )
        
        total_weight = total_supporting_weight + total_contradicting_weight
        
        if total_weight == 0:
            return 0.5
        
        return total_supporting_weight / total_weight
    
    async def _generate_explanation(self, statement: str, result: FactCheckResult,
                                  evidence: Dict[str, Any], consistency_score: float) -> str:
        """Generate human-readable explanation for the fact check result"""
        explanations = {
            FactCheckResult.TRUE: f"The statement '{statement}' appears to be TRUE based on {len(evidence['supporting'])} supporting sources.",
            FactCheckResult.FALSE: f"The statement '{statement}' appears to be FALSE based on {len(evidence['contradicting'])} contradicting sources.",
            FactCheckResult.PARTIALLY_TRUE: f"The statement '{statement}' is PARTIALLY TRUE with mixed evidence from multiple sources.",
            FactCheckResult.MISLEADING: f"The statement '{statement}' is technically accurate but potentially MISLEADING in context.",
            FactCheckResult.UNVERIFIABLE: f"The statement '{statement}' cannot be verified with available sources.",
            FactCheckResult.INSUFFICIENT_DATA: f"There is insufficient reliable data to verify the statement '{statement}'."
        }
        
        base_explanation = explanations.get(result, f"The statement '{statement}' has been evaluated.")
        
        # Add consistency information
        if consistency_score > 0.8:
            consistency_note = " The available evidence is highly consistent."
        elif consistency_score > 0.6:
            consistency_note = " The evidence shows moderate consistency."
        elif consistency_score > 0.4:
            consistency_note = " The evidence shows mixed results with some inconsistencies."
        else:
            consistency_note = " The available evidence is largely inconsistent or contradictory."
        
        # Add source information
        total_sources = len(evidence.get("all_sources", []))
        if total_sources > 0:
            source_note = f" This assessment is based on {total_sources} source(s)."
        else:
            source_note = " No reliable sources were found for verification."
        
        return base_explanation + consistency_note + source_note
    
    async def _generate_mock_evidence(self, statement: str) -> Dict[str, Any]:
        """Generate mock evidence for testing purposes"""
        # Create mock supporting evidence
        supporting_source = create_knowledge_source(
            name="Mock Reliable Source",
            source_type=SourceType.WEB_PAGE,
            url="https://reliable-source.com",
            credibility=CredibilityLevel.HIGH
        )
        
        supporting_item = create_knowledge_item(
            content=f"According to reliable sources, {statement.lower()} is well-documented and verified.",
            knowledge_type=KnowledgeType.FACTUAL,
            source=supporting_source,
            confidence_score=0.8
        )
        
        # Sometimes add contradicting evidence
        contradicting_evidence = []
        if "mock" in statement.lower():  # Add contradiction for testing
            contradicting_source = create_knowledge_source(
                name="Alternative Source",
                source_type=SourceType.WEB_PAGE,
                url="https://alternative-source.com",
                credibility=CredibilityLevel.MEDIUM
            )
            
            contradicting_item = create_knowledge_item(
                content=f"Some sources suggest that {statement.lower()} may not be entirely accurate.",
                knowledge_type=KnowledgeType.FACTUAL,
                source=contradicting_source,
                confidence_score=0.6
            )
            contradicting_evidence.append(contradicting_item)
        
        return {
            "supporting": [supporting_item],
            "contradicting": contradicting_evidence,
            "all_sources": {"mock_source_1", "mock_source_2"}
        }
    
    def _update_stats(self, result: FactCheckResult, confidence: float):
        """Update fact checking statistics"""
        self.check_stats["total_checks"] += 1
        
        if result == FactCheckResult.TRUE:
            self.check_stats["verified_facts"] += 1
        elif result == FactCheckResult.FALSE:
            self.check_stats["false_facts"] += 1
        else:
            self.check_stats["unverifiable_facts"] += 1
        
        # Update average confidence (moving average)
        current_avg = self.check_stats["average_confidence"]
        total_checks = self.check_stats["total_checks"]
        
        new_avg = ((current_avg * (total_checks - 1)) + confidence) / total_checks
        self.check_stats["average_confidence"] = new_avg
    
    async def get_statistics(self) -> Dict[str, Any]:
        """Get fact checking statistics"""
        return self.check_stats.copy()

# ============================================================================
# SPECIALIZED FACT CHECKERS
# ============================================================================

class NumericalFactChecker:
    """Specialized checker for numerical facts"""
    
    async def verify_fact(self, statement: str, supporting: List[KnowledgeItem],
                         contradicting: List[KnowledgeItem], context: Dict[str, Any]) -> Tuple[FactCheckResult, float]:
        """Verify numerical facts"""
        
        # Extract numbers from statement
        numbers = re.findall(r'\d+(?:\.\d+)?', statement)
        
        if not numbers:
            return FactCheckResult.UNVERIFIABLE, 0.0
        
        # Check if supporting evidence contains the same numbers
        supporting_matches = 0
        for item in supporting:
            item_numbers = re.findall(r'\d+(?:\.\d+)?', item.content)
            if any(num in item_numbers for num in numbers):
                supporting_matches += 1
        
        if supporting_matches > len(contradicting):
            confidence = min(0.9, supporting_matches * 0.3)
            return FactCheckResult.TRUE, confidence
        elif contradicting:
            return FactCheckResult.FALSE, 0.7
        else:
            return FactCheckResult.INSUFFICIENT_DATA, 0.2

class TemporalFactChecker:
    """Specialized checker for temporal facts"""
    
    async def verify_fact(self, statement: str, supporting: List[KnowledgeItem],
                         contradicting: List[KnowledgeItem], context: Dict[str, Any]) -> Tuple[FactCheckResult, float]:
        """Verify temporal facts"""
        
        # Extract years and dates
        years = re.findall(r'\b(19|20)\d{2}\b', statement)
        
        if not years:
            return FactCheckResult.UNVERIFIABLE, 0.0
        
        # Simple temporal verification
        if supporting and not contradicting:
            return FactCheckResult.TRUE, 0.8
        elif contradicting and not supporting:
            return FactCheckResult.FALSE, 0.7
        elif supporting and contradicting:
            return FactCheckResult.PARTIALLY_TRUE, 0.5
        else:
            return FactCheckResult.INSUFFICIENT_DATA, 0.3

class GeographicFactChecker:
    """Specialized checker for geographic facts"""
    
    async def verify_fact(self, statement: str, supporting: List[KnowledgeItem],
                         contradicting: List[KnowledgeItem], context: Dict[str, Any]) -> Tuple[FactCheckResult, float]:
        """Verify geographic facts"""
        
        # Simple geographic verification based on evidence
        if len(supporting) >= 2 and not contradicting:
            return FactCheckResult.TRUE, 0.85
        elif contradicting:
            return FactCheckResult.FALSE, 0.75
        elif supporting:
            return FactCheckResult.PARTIALLY_TRUE, 0.6
        else:
            return FactCheckResult.UNVERIFIABLE, 0.2

class GeneralFactChecker:
    """General purpose fact checker"""
    
    async def verify_fact(self, statement: str, supporting: List[KnowledgeItem],
                         contradicting: List[KnowledgeItem], context: Dict[str, Any]) -> Tuple[FactCheckResult, float]:
        """Verify general facts"""
        
        supporting_count = len(supporting)
        contradicting_count = len(contradicting)
        
        if supporting_count >= 2 and contradicting_count == 0:
            return FactCheckResult.TRUE, min(0.9, supporting_count * 0.2)
        elif contradicting_count > supporting_count:
            return FactCheckResult.FALSE, min(0.8, contradicting_count * 0.2)
        elif supporting_count > 0 and contradicting_count > 0:
            return FactCheckResult.PARTIALLY_TRUE, 0.5
        elif supporting_count == 1:
            return FactCheckResult.PARTIALLY_TRUE, 0.6
        else:
            return FactCheckResult.INSUFFICIENT_DATA, 0.1

# ============================================================================
# TESTING
# ============================================================================

async def test_fact_checker():
    """Test the Fact Checker functionality"""
    print("🔍 Testing RomAI Fact Checker")
    print("=" * 40)
    
    try:
        # Initialize fact checker
        fact_checker = FactChecker()
        
        # Test 1: Basic fact checking
        print("\n📋 Test 1: Basic Fact Checking")
        
        request = FactCheckRequest(
            id="test-1",
            statement="The Earth is approximately 4.5 billion years old",
            context={"domain": "science"}
        )
        
        response = await fact_checker.check_fact(request)
        
        print(f"✅ Fact check result: {response.result.value}")
        print(f"Confidence: {response.confidence_score:.2f}")
        print(f"Explanation: {response.explanation}")
        print(f"Sources checked: {response.sources_checked}")
        print(f"Duration: {response.check_duration:.2f}s")
        
        # Test 2: Numerical fact
        print("\n📋 Test 2: Numerical Fact Checking")
        
        numerical_request = FactCheckRequest(
            id="test-2",
            statement="Paris has approximately 2.2 million residents"
        )
        
        numerical_response = await fact_checker.check_fact(numerical_request)
        
        print(f"✅ Numerical fact result: {numerical_response.result.value}")
        print(f"Confidence: {numerical_response.confidence_score:.2f}")
        
        # Test 3: Statistics
        print("\n📊 Test 3: Fact Checking Statistics")
        
        stats = await fact_checker.get_statistics()
        print(f"✅ Statistics:")
        print(f"  • Total checks: {stats['total_checks']}")
        print(f"  • Verified facts: {stats['verified_facts']}")
        print(f"  • False facts: {stats['false_facts']}")
        print(f"  • Average confidence: {stats['average_confidence']:.2f}")
        
        print("\n🎉 Fact Checker test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Fact Checker test failed: {e}")
        return False

# ============================================================================
# MODULE INITIALIZATION
# ============================================================================

logger.info("✅ Fact Checker module loaded - Intelligent fact verification ready!")

if __name__ == "__main__":
    asyncio.run(test_fact_checker())