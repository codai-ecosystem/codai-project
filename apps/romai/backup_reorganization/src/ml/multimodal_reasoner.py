"""
Multi-Modal Reasoner - Phase 4
Cross-modal reasoning and integration capabilities
"""

import asyncio
import time
import json
from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass
from enum import Enum
import logging

# Import our existing components
from romai_api_client import RomAIAPIClient
from multimodal_intelligence_core import MultiModalInput, MultiModalOutput, ModalityType
from vision_language_processor import VisionLanguageQuery, VisionAnalysisResult
from document_processor import DocumentProcessingResult

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ReasoningType(Enum):
    COMPARATIVE = "comparative"           # Compare across modalities
    INFERENTIAL = "inferential"          # Make inferences from combined data
    ANALYTICAL = "analytical"            # Deep analysis across modalities
    CREATIVE = "creative"                # Creative synthesis
    PROBLEM_SOLVING = "problem_solving"  # Solve problems using multiple modalities
    EXPLANATORY = "explanatory"          # Explain relationships and connections

class ConfidenceLevel(Enum):
    LOW = "low"           # < 0.4
    MODERATE = "moderate" # 0.4 - 0.6
    HIGH = "high"         # 0.6 - 0.8
    VERY_HIGH = "very_high" # > 0.8

@dataclass
class CrossModalEvidence:
    modality_source: ModalityType
    evidence_type: str
    evidence_content: str
    confidence: float
    supporting_data: Dict[str, Any]

@dataclass
class ReasoningChain:
    premise: str
    reasoning_steps: List[str]
    conclusion: str
    evidence_used: List[CrossModalEvidence]
    confidence_score: float
    reasoning_type: ReasoningType

@dataclass
class MultiModalReasoningResult:
    query: str
    reasoning_chains: List[ReasoningChain]
    final_conclusion: str
    cross_modal_insights: List[str]
    contradictions_found: List[str]
    confidence_assessment: ConfidenceLevel
    processing_time: float
    modalities_analyzed: List[ModalityType]

class MultiModalReasoner:
    """Advanced cross-modal reasoning and analysis system"""
    
    def __init__(self):
        self.romai_client = RomAIAPIClient()
        self.reasoning_strategies = {
            ReasoningType.COMPARATIVE: self._comparative_reasoning,
            ReasoningType.INFERENTIAL: self._inferential_reasoning,
            ReasoningType.ANALYTICAL: self._analytical_reasoning,
            ReasoningType.CREATIVE: self._creative_reasoning,
            ReasoningType.PROBLEM_SOLVING: self._problem_solving_reasoning,
            ReasoningType.EXPLANATORY: self._explanatory_reasoning
        }
        
    def extract_evidence_from_modalities(self, multimodal_output: MultiModalOutput) -> List[CrossModalEvidence]:
        """Extract evidence from multi-modal analysis results"""
        evidence_list = []
        
        try:
            for modality_type, analysis_data in multimodal_output.modality_analysis.items():
                if modality_type == ModalityType.TEXT:
                    # Extract text evidence
                    if 'analysis' in analysis_data:
                        evidence_list.append(CrossModalEvidence(
                            modality_source=ModalityType.TEXT,
                            evidence_type="textual_analysis",
                            evidence_content=analysis_data['analysis'][:500],
                            confidence=analysis_data.get('confidence', 0.5),
                            supporting_data={
                                "word_count": analysis_data.get('word_count', 0),
                                "content_length": analysis_data.get('length', 0)
                            }
                        ))
                
                elif modality_type == ModalityType.IMAGE:
                    # Extract image evidence
                    if 'description' in analysis_data:
                        evidence_list.append(CrossModalEvidence(
                            modality_source=ModalityType.IMAGE,
                            evidence_type="visual_analysis",
                            evidence_content=analysis_data['description'][:500],
                            confidence=analysis_data.get('confidence', 0.5),
                            supporting_data=analysis_data.get('technical_analysis', {})
                        ))
                
                elif modality_type == ModalityType.DOCUMENT:
                    # Extract document evidence
                    if 'analysis' in analysis_data:
                        evidence_list.append(CrossModalEvidence(
                            modality_source=ModalityType.DOCUMENT,
                            evidence_type="document_analysis",
                            evidence_content=analysis_data['analysis'][:500],
                            confidence=analysis_data.get('confidence', 0.5),
                            supporting_data={
                                "text_length": analysis_data.get('text_length', 0),
                                "extracted_text": analysis_data.get('extracted_text', '')[:200]
                            }
                        ))
            
            return evidence_list
            
        except Exception as e:
            logger.error(f"Error extracting evidence: {str(e)}")
            return []
    
    def identify_reasoning_requirements(self, query: str, evidence: List[CrossModalEvidence]) -> List[ReasoningType]:
        """Identify what types of reasoning are needed for the query"""
        query_lower = query.lower()
        reasoning_types = []
        
        # Keyword-based reasoning type identification
        if any(word in query_lower for word in ['compare', 'contrast', 'difference', 'similar', 'versus']):
            reasoning_types.append(ReasoningType.COMPARATIVE)
        
        if any(word in query_lower for word in ['why', 'because', 'reason', 'cause', 'explain', 'how']):
            reasoning_types.append(ReasoningType.EXPLANATORY)
        
        if any(word in query_lower for word in ['solve', 'problem', 'fix', 'resolve', 'solution']):
            reasoning_types.append(ReasoningType.PROBLEM_SOLVING)
        
        if any(word in query_lower for word in ['analyze', 'examine', 'evaluate', 'assess', 'study']):
            reasoning_types.append(ReasoningType.ANALYTICAL)
        
        if any(word in query_lower for word in ['create', 'generate', 'design', 'invent', 'imagine']):
            reasoning_types.append(ReasoningType.CREATIVE)
        
        if any(word in query_lower for word in ['infer', 'deduce', 'conclude', 'predict', 'suggest']):
            reasoning_types.append(ReasoningType.INFERENTIAL)
        
        # Default to analytical if no specific type identified
        if not reasoning_types:
            reasoning_types.append(ReasoningType.ANALYTICAL)
        
        # Add inferential reasoning if multiple modalities present
        if len(evidence) > 1 and ReasoningType.INFERENTIAL not in reasoning_types:
            reasoning_types.append(ReasoningType.INFERENTIAL)
        
        return reasoning_types
    
    async def _comparative_reasoning(self, query: str, evidence: List[CrossModalEvidence]) -> ReasoningChain:
        """Perform comparative reasoning across modalities"""
        try:
            # Prepare evidence for comparison
            evidence_by_modality = {}
            for ev in evidence:
                if ev.modality_source not in evidence_by_modality:
                    evidence_by_modality[ev.modality_source] = []
                evidence_by_modality[ev.modality_source].append(ev)
            
            comparison_prompt = f"""Perform comparative reasoning across different modalities:

Query: {query}

Evidence Sources:
{self._format_evidence_for_prompt(evidence)}

Perform comparative analysis:
1. Identify similarities across modalities
2. Highlight key differences
3. Determine which modality provides strongest evidence
4. Draw comparative conclusions

Provide structured reasoning with clear steps and conclusion:"""
            
            response = self.romai_client.generate_response_sync(
                comparison_prompt, 
                task_type="comparative_reasoning"
            )
            
            if response.success:
                reasoning_steps = self._extract_reasoning_steps(response.content)
                conclusion = self._extract_conclusion(response.content)
                
                return ReasoningChain(
                    premise=f"Comparative analysis of {len(evidence_by_modality)} modalities",
                    reasoning_steps=reasoning_steps,
                    conclusion=conclusion,
                    evidence_used=evidence,
                    confidence_score=min(sum(e.confidence for e in evidence) / len(evidence), 0.9),
                    reasoning_type=ReasoningType.COMPARATIVE
                )
            else:
                return self._create_fallback_reasoning_chain(
                    "comparative", query, evidence, "Comparative reasoning failed"
                )
        
        except Exception as e:
            logger.error(f"Error in comparative reasoning: {str(e)}")
            return self._create_fallback_reasoning_chain(
                "comparative", query, evidence, f"Reasoning error: {str(e)}"
            )
    
    async def _inferential_reasoning(self, query: str, evidence: List[CrossModalEvidence]) -> ReasoningChain:
        """Perform inferential reasoning to make logical inferences"""
        try:
            inference_prompt = f"""Perform inferential reasoning based on multi-modal evidence:

Query: {query}

Available Evidence:
{self._format_evidence_for_prompt(evidence)}

Perform inferential analysis:
1. Identify patterns across modalities
2. Make logical inferences from combined evidence
3. Predict likely outcomes or explanations
4. Assess strength of inferences

Provide step-by-step inferential reasoning:"""
            
            response = self.romai_client.generate_response_sync(
                inference_prompt, 
                task_type="inferential_reasoning"
            )
            
            if response.success:
                reasoning_steps = self._extract_reasoning_steps(response.content)
                conclusion = self._extract_conclusion(response.content)
                
                # Calculate confidence based on evidence strength and consistency
                confidence = self._calculate_inferential_confidence(evidence)
                
                return ReasoningChain(
                    premise="Inferential analysis of multi-modal evidence",
                    reasoning_steps=reasoning_steps,
                    conclusion=conclusion,
                    evidence_used=evidence,
                    confidence_score=confidence,
                    reasoning_type=ReasoningType.INFERENTIAL
                )
            else:
                return self._create_fallback_reasoning_chain(
                    "inferential", query, evidence, "Inferential reasoning failed"
                )
        
        except Exception as e:
            logger.error(f"Error in inferential reasoning: {str(e)}")
            return self._create_fallback_reasoning_chain(
                "inferential", query, evidence, f"Reasoning error: {str(e)}"
            )
    
    async def _analytical_reasoning(self, query: str, evidence: List[CrossModalEvidence]) -> ReasoningChain:
        """Perform deep analytical reasoning"""
        try:
            analysis_prompt = f"""Perform deep analytical reasoning on multi-modal data:

Query: {query}

Evidence for Analysis:
{self._format_evidence_for_prompt(evidence)}

Conduct analytical reasoning:
1. Break down evidence into components
2. Analyze relationships and dependencies
3. Evaluate evidence quality and reliability
4. Synthesize comprehensive analysis
5. Draw analytical conclusions

Provide detailed analytical reasoning process:"""
            
            response = self.romai_client.generate_response_sync(
                analysis_prompt, 
                task_type="analytical_reasoning"
            )
            
            if response.success:
                reasoning_steps = self._extract_reasoning_steps(response.content)
                conclusion = self._extract_conclusion(response.content)
                
                return ReasoningChain(
                    premise=f"Analytical examination of {len(evidence)} evidence sources",
                    reasoning_steps=reasoning_steps,
                    conclusion=conclusion,
                    evidence_used=evidence,
                    confidence_score=self._calculate_analytical_confidence(evidence),
                    reasoning_type=ReasoningType.ANALYTICAL
                )
            else:
                return self._create_fallback_reasoning_chain(
                    "analytical", query, evidence, "Analytical reasoning failed"
                )
        
        except Exception as e:
            logger.error(f"Error in analytical reasoning: {str(e)}")
            return self._create_fallback_reasoning_chain(
                "analytical", query, evidence, f"Reasoning error: {str(e)}"
            )
    
    async def _creative_reasoning(self, query: str, evidence: List[CrossModalEvidence]) -> ReasoningChain:
        """Perform creative reasoning and synthesis"""
        try:
            creative_prompt = f"""Perform creative reasoning using multi-modal evidence:

Query: {query}

Available Evidence:
{self._format_evidence_for_prompt(evidence)}

Apply creative reasoning:
1. Look for unexpected connections across modalities
2. Generate novel insights and perspectives
3. Synthesize creative solutions or interpretations
4. Explore alternative viewpoints
5. Propose innovative applications

Provide creative reasoning process:"""
            
            response = self.romai_client.generate_response_sync(
                creative_prompt, 
                task_type="creative_reasoning"
            )
            
            if response.success:
                reasoning_steps = self._extract_reasoning_steps(response.content)
                conclusion = self._extract_conclusion(response.content)
                
                return ReasoningChain(
                    premise="Creative synthesis of multi-modal evidence",
                    reasoning_steps=reasoning_steps,
                    conclusion=conclusion,
                    evidence_used=evidence,
                    confidence_score=0.7,  # Creative reasoning has moderate confidence
                    reasoning_type=ReasoningType.CREATIVE
                )
            else:
                return self._create_fallback_reasoning_chain(
                    "creative", query, evidence, "Creative reasoning failed"
                )
        
        except Exception as e:
            logger.error(f"Error in creative reasoning: {str(e)}")
            return self._create_fallback_reasoning_chain(
                "creative", query, evidence, f"Reasoning error: {str(e)}"
            )
    
    async def _problem_solving_reasoning(self, query: str, evidence: List[CrossModalEvidence]) -> ReasoningChain:
        """Perform problem-solving reasoning"""
        try:
            problem_solving_prompt = f"""Apply problem-solving reasoning to multi-modal evidence:

Problem/Query: {query}

Available Evidence:
{self._format_evidence_for_prompt(evidence)}

Problem-solving approach:
1. Define the problem clearly
2. Identify constraints and requirements
3. Generate potential solutions using all modalities
4. Evaluate solution feasibility
5. Recommend optimal solution

Provide structured problem-solving reasoning:"""
            
            response = self.romai_client.generate_response_sync(
                problem_solving_prompt, 
                task_type="problem_solving_reasoning"
            )
            
            if response.success:
                reasoning_steps = self._extract_reasoning_steps(response.content)
                conclusion = self._extract_conclusion(response.content)
                
                return ReasoningChain(
                    premise=f"Problem-solving analysis using {len(evidence)} evidence sources",
                    reasoning_steps=reasoning_steps,
                    conclusion=conclusion,
                    evidence_used=evidence,
                    confidence_score=self._calculate_problem_solving_confidence(evidence),
                    reasoning_type=ReasoningType.PROBLEM_SOLVING
                )
            else:
                return self._create_fallback_reasoning_chain(
                    "problem_solving", query, evidence, "Problem-solving reasoning failed"
                )
        
        except Exception as e:
            logger.error(f"Error in problem-solving reasoning: {str(e)}")
            return self._create_fallback_reasoning_chain(
                "problem_solving", query, evidence, f"Reasoning error: {str(e)}"
            )
    
    async def _explanatory_reasoning(self, query: str, evidence: List[CrossModalEvidence]) -> ReasoningChain:
        """Perform explanatory reasoning"""
        try:
            explanatory_prompt = f"""Provide explanatory reasoning based on multi-modal evidence:

Question: {query}

Evidence Available:
{self._format_evidence_for_prompt(evidence)}

Explanatory reasoning:
1. Identify what needs to be explained
2. Gather relevant evidence from all modalities
3. Construct causal relationships
4. Provide clear explanations
5. Address potential counterarguments

Provide comprehensive explanatory reasoning:"""
            
            response = self.romai_client.generate_response_sync(
                explanatory_prompt, 
                task_type="explanatory_reasoning"
            )
            
            if response.success:
                reasoning_steps = self._extract_reasoning_steps(response.content)
                conclusion = self._extract_conclusion(response.content)
                
                return ReasoningChain(
                    premise=f"Explanatory analysis of query using multi-modal evidence",
                    reasoning_steps=reasoning_steps,
                    conclusion=conclusion,
                    evidence_used=evidence,
                    confidence_score=self._calculate_explanatory_confidence(evidence),
                    reasoning_type=ReasoningType.EXPLANATORY
                )
            else:
                return self._create_fallback_reasoning_chain(
                    "explanatory", query, evidence, "Explanatory reasoning failed"
                )
        
        except Exception as e:
            logger.error(f"Error in explanatory reasoning: {str(e)}")
            return self._create_fallback_reasoning_chain(
                "explanatory", query, evidence, f"Reasoning error: {str(e)}"
            )
    
    def _format_evidence_for_prompt(self, evidence: List[CrossModalEvidence]) -> str:
        """Format evidence for AI prompt"""
        try:
            formatted_evidence = []
            
            for i, ev in enumerate(evidence, 1):
                formatted_evidence.append(f"""
Evidence {i} - {ev.modality_source.value.upper()} ({ev.evidence_type}):
Content: {ev.evidence_content[:300]}...
Confidence: {ev.confidence:.3f}
Supporting Data: {json.dumps(ev.supporting_data, indent=2) if ev.supporting_data else 'None'}
""")
            
            return "\n".join(formatted_evidence)
        
        except Exception as e:
            logger.error(f"Error formatting evidence: {str(e)}")
            return "Evidence formatting error"
    
    def _extract_reasoning_steps(self, ai_response: str) -> List[str]:
        """Extract reasoning steps from AI response"""
        try:
            lines = ai_response.split('\n')
            steps = []
            
            for line in lines:
                line = line.strip()
                # Look for numbered steps or bullet points
                if re.match(r'^\d+[\.\)]\s', line) or line.startswith(('- ', '• ', '* ')):
                    # Clean up the step
                    step = re.sub(r'^\d+[\.\)]\s*|^[-•*]\s*', '', line)
                    if len(step) > 10:  # Meaningful step
                        steps.append(step)
                elif line and not line.startswith(('Query:', 'Evidence:', 'Conclusion:')):
                    # Add as step if it's substantial content
                    if len(line) > 20 and not line.endswith(':'):
                        steps.append(line)
            
            # If no structured steps found, use first few sentences
            if not steps:
                sentences = ai_response.split('.')
                steps = [s.strip() for s in sentences[:5] if len(s.strip()) > 20]
            
            return steps[:7]  # Limit to 7 steps max
        
        except Exception as e:
            logger.error(f"Error extracting reasoning steps: {str(e)}")
            return ["Step extraction failed"]
    
    def _extract_conclusion(self, ai_response: str) -> str:
        """Extract conclusion from AI response"""
        try:
            # Look for conclusion keywords
            conclusion_patterns = [
                r'(?i)conclusion[:\-]?\s*(.+?)(?:\n|$)',
                r'(?i)therefore[:\-]?\s*(.+?)(?:\n|$)',
                r'(?i)in summary[:\-]?\s*(.+?)(?:\n|$)',
                r'(?i)final answer[:\-]?\s*(.+?)(?:\n|$)'
            ]
            
            for pattern in conclusion_patterns:
                match = re.search(pattern, ai_response, re.MULTILINE | re.DOTALL)
                if match:
                    conclusion = match.group(1).strip()
                    if len(conclusion) > 10:
                        return conclusion[:500]  # Limit length
            
            # If no explicit conclusion, use last substantial sentence
            sentences = [s.strip() for s in ai_response.split('.') if s.strip()]
            if sentences:
                last_sentence = sentences[-1]
                if len(last_sentence) > 20:
                    return last_sentence[:500]
            
            return "Conclusion extraction incomplete"
        
        except Exception as e:
            logger.error(f"Error extracting conclusion: {str(e)}")
            return f"Conclusion extraction error: {str(e)}"
    
    def _create_fallback_reasoning_chain(self, reasoning_type: str, query: str, 
                                       evidence: List[CrossModalEvidence], 
                                       error_message: str) -> ReasoningChain:
        """Create fallback reasoning chain when AI processing fails"""
        return ReasoningChain(
            premise=f"Fallback {reasoning_type} reasoning",
            reasoning_steps=[
                f"Applied {reasoning_type} reasoning to available evidence",
                f"Processed {len(evidence)} evidence sources",
                "Generated fallback analysis due to processing limitations"
            ],
            conclusion=error_message,
            evidence_used=evidence,
            confidence_score=0.3,
            reasoning_type=ReasoningType.ANALYTICAL  # Default to analytical
        )
    
    def _calculate_inferential_confidence(self, evidence: List[CrossModalEvidence]) -> float:
        """Calculate confidence for inferential reasoning"""
        if not evidence:
            return 0.2
        
        # Base confidence on evidence quality and consistency
        avg_confidence = sum(e.confidence for e in evidence) / len(evidence)
        modality_diversity = len(set(e.modality_source for e in evidence))
        
        # Boost confidence for diverse modalities
        diversity_bonus = min(modality_diversity * 0.1, 0.3)
        
        return min(avg_confidence + diversity_bonus, 0.9)
    
    def _calculate_analytical_confidence(self, evidence: List[CrossModalEvidence]) -> float:
        """Calculate confidence for analytical reasoning"""
        if not evidence:
            return 0.2
        
        # Analytical confidence based on evidence depth
        avg_confidence = sum(e.confidence for e in evidence) / len(evidence)
        evidence_depth = sum(len(e.evidence_content) for e in evidence) / len(evidence)
        
        # Deeper evidence increases confidence
        depth_bonus = min(evidence_depth / 2000, 0.2)
        
        return min(avg_confidence + depth_bonus, 0.9)
    
    def _calculate_problem_solving_confidence(self, evidence: List[CrossModalEvidence]) -> float:
        """Calculate confidence for problem-solving reasoning"""
        if not evidence:
            return 0.3
        
        # Problem-solving confidence based on solution feasibility
        avg_confidence = sum(e.confidence for e in evidence) / len(evidence)
        
        # Multiple modalities increase solution confidence
        modality_count = len(set(e.modality_source for e in evidence))
        modality_bonus = min(modality_count * 0.15, 0.3)
        
        return min(avg_confidence + modality_bonus, 0.85)
    
    def _calculate_explanatory_confidence(self, evidence: List[CrossModalEvidence]) -> float:
        """Calculate confidence for explanatory reasoning"""
        if not evidence:
            return 0.3
        
        # Explanatory confidence based on evidence coverage
        avg_confidence = sum(e.confidence for e in evidence) / len(evidence)
        
        # More evidence types support better explanations
        evidence_types = len(set(e.evidence_type for e in evidence))
        coverage_bonus = min(evidence_types * 0.1, 0.25)
        
        return min(avg_confidence + coverage_bonus, 0.9)
    
    def detect_contradictions(self, reasoning_chains: List[ReasoningChain]) -> List[str]:
        """Detect contradictions between reasoning chains"""
        contradictions = []
        
        try:
            # Compare conclusions for contradictions
            for i, chain1 in enumerate(reasoning_chains):
                for j, chain2 in enumerate(reasoning_chains[i+1:], i+1):
                    # Simple contradiction detection using keyword analysis
                    conclusion1_lower = chain1.conclusion.lower()
                    conclusion2_lower = chain2.conclusion.lower()
                    
                    # Look for opposing terms
                    opposing_pairs = [
                        ('positive', 'negative'),
                        ('yes', 'no'),
                        ('true', 'false'),
                        ('support', 'oppose'),
                        ('increase', 'decrease'),
                        ('good', 'bad'),
                        ('effective', 'ineffective')
                    ]
                    
                    for pos_term, neg_term in opposing_pairs:
                        if pos_term in conclusion1_lower and neg_term in conclusion2_lower:
                            contradictions.append(
                                f"Contradiction between {chain1.reasoning_type.value} and {chain2.reasoning_type.value}: "
                                f"'{pos_term}' vs '{neg_term}'"
                            )
                        elif neg_term in conclusion1_lower and pos_term in conclusion2_lower:
                            contradictions.append(
                                f"Contradiction between {chain1.reasoning_type.value} and {chain2.reasoning_type.value}: "
                                f"'{neg_term}' vs '{pos_term}'"
                            )
            
            return contradictions[:5]  # Limit to 5 contradictions
        
        except Exception as e:
            logger.error(f"Error detecting contradictions: {str(e)}")
            return [f"Contradiction detection error: {str(e)}"]
    
    def assess_overall_confidence(self, reasoning_chains: List[ReasoningChain]) -> ConfidenceLevel:
        """Assess overall confidence level"""
        try:
            if not reasoning_chains:
                return ConfidenceLevel.LOW
            
            avg_confidence = sum(chain.confidence_score for chain in reasoning_chains) / len(reasoning_chains)
            
            if avg_confidence >= 0.8:
                return ConfidenceLevel.VERY_HIGH
            elif avg_confidence >= 0.6:
                return ConfidenceLevel.HIGH
            elif avg_confidence >= 0.4:
                return ConfidenceLevel.MODERATE
            else:
                return ConfidenceLevel.LOW
        
        except Exception:
            return ConfidenceLevel.LOW
    
    async def reason_across_modalities(self, query: str, 
                                     multimodal_output: MultiModalOutput) -> MultiModalReasoningResult:
        """Perform comprehensive cross-modal reasoning"""
        start_time = time.time()
        
        try:
            # Extract evidence from modalities
            evidence = self.extract_evidence_from_modalities(multimodal_output)
            
            if not evidence:
                return MultiModalReasoningResult(
                    query=query,
                    reasoning_chains=[],
                    final_conclusion="No evidence available for reasoning",
                    cross_modal_insights=["Insufficient evidence for cross-modal analysis"],
                    contradictions_found=[],
                    confidence_assessment=ConfidenceLevel.LOW,
                    processing_time=time.time() - start_time,
                    modalities_analyzed=[]
                )
            
            # Identify required reasoning types
            reasoning_types = self.identify_reasoning_requirements(query, evidence)
            
            # Perform reasoning for each type
            reasoning_chains = []
            for reasoning_type in reasoning_types:
                if reasoning_type in self.reasoning_strategies:
                    chain = await self.reasoning_strategies[reasoning_type](query, evidence)
                    reasoning_chains.append(chain)
            
            # Generate final conclusion
            final_conclusion = await self._generate_final_conclusion(query, reasoning_chains)
            
            # Extract cross-modal insights
            cross_modal_insights = multimodal_output.cross_modal_insights
            if not cross_modal_insights:
                cross_modal_insights = [f"Cross-modal reasoning applied across {len(evidence)} evidence sources"]
            
            # Detect contradictions
            contradictions = self.detect_contradictions(reasoning_chains)
            
            # Assess confidence
            confidence_assessment = self.assess_overall_confidence(reasoning_chains)
            
            # Identify modalities analyzed
            modalities_analyzed = list(set(e.modality_source for e in evidence))
            
            processing_time = time.time() - start_time
            
            return MultiModalReasoningResult(
                query=query,
                reasoning_chains=reasoning_chains,
                final_conclusion=final_conclusion,
                cross_modal_insights=cross_modal_insights,
                contradictions_found=contradictions,
                confidence_assessment=confidence_assessment,
                processing_time=processing_time,
                modalities_analyzed=modalities_analyzed
            )
        
        except Exception as e:
            logger.error(f"Error in cross-modal reasoning: {str(e)}")
            processing_time = time.time() - start_time
            
            return MultiModalReasoningResult(
                query=query,
                reasoning_chains=[],
                final_conclusion=f"Cross-modal reasoning error: {str(e)}",
                cross_modal_insights=[],
                contradictions_found=[],
                confidence_assessment=ConfidenceLevel.LOW,
                processing_time=processing_time,
                modalities_analyzed=[]
            )
    
    async def _generate_final_conclusion(self, query: str, reasoning_chains: List[ReasoningChain]) -> str:
        """Generate final conclusion from multiple reasoning chains"""
        try:
            if not reasoning_chains:
                return "No reasoning chains available for conclusion"
            
            # Prepare synthesis prompt
            chain_summaries = []
            for i, chain in enumerate(reasoning_chains, 1):
                chain_summaries.append(f"""
Reasoning Chain {i} ({chain.reasoning_type.value}):
Conclusion: {chain.conclusion}
Confidence: {chain.confidence_score:.3f}
""")
            
            synthesis_prompt = f"""Synthesize multiple reasoning chains into a final conclusion:

Original Query: {query}

Reasoning Chain Results:
{chr(10).join(chain_summaries)}

Synthesize a final, comprehensive conclusion that:
1. Integrates insights from all reasoning approaches
2. Weighs evidence based on confidence scores
3. Addresses the original query directly
4. Acknowledges uncertainty where appropriate

Final Conclusion:"""
            
            response = self.romai_client.generate_response_sync(
                synthesis_prompt, 
                task_type="conclusion_synthesis"
            )
            
            if response.success:
                return response.content
            else:
                # Fallback: Use highest confidence chain
                best_chain = max(reasoning_chains, key=lambda x: x.confidence_score)
                return f"Based on {best_chain.reasoning_type.value} reasoning: {best_chain.conclusion}"
        
        except Exception as e:
            logger.error(f"Error generating final conclusion: {str(e)}")
            return f"Final conclusion synthesis error: {str(e)}"

# Test function
async def test_multimodal_reasoner():
    """Test the multi-modal reasoner"""
    print("🧠 Testing Multi-Modal Reasoner")
    print("=" * 50)
    
    reasoner = MultiModalReasoner()
    
    # Test 1: Reasoning type identification
    print("\n🔍 Test 1: Reasoning Type Identification")
    test_queries = [
        "Compare these two documents",
        "Why does this image show what it shows?",
        "Solve this problem using all available information",
        "Analyze the relationship between text and image",
        "Create a new idea based on this content"
    ]
    
    for query in test_queries:
        # Create dummy evidence for testing
        dummy_evidence = [
            CrossModalEvidence(
                modality_source=ModalityType.TEXT,
                evidence_type="test",
                evidence_content="test content",
                confidence=0.7,
                supporting_data={}
            )
        ]
        
        reasoning_types = reasoner.identify_reasoning_requirements(query, dummy_evidence)
        print(f"   '{query[:30]}...': {[rt.value for rt in reasoning_types]}")
    
    # Test 2: Evidence extraction simulation
    print("\n📊 Test 2: Evidence Processing")
    
    # Create mock multimodal output
    from multimodal_intelligence_core import MultiModalOutput, ModalityType
    
    mock_output = MultiModalOutput(
        primary_response="Test response",
        modality_analysis={
            ModalityType.TEXT: {
                "analysis": "Text analysis result",
                "confidence": 0.8,
                "word_count": 100
            },
            ModalityType.IMAGE: {
                "description": "Image description result",
                "confidence": 0.7,
                "technical_analysis": {"brightness": "moderate"}
            }
        },
        cross_modal_insights=["Test insight 1", "Test insight 2"],
        confidence_scores={"text": 0.8, "image": 0.7},
        processing_time=1.5,
        complexity_assessment=None
    )
    
    evidence = reasoner.extract_evidence_from_modalities(mock_output)
    print(f"   Evidence Extracted: {len(evidence)} sources")
    for i, ev in enumerate(evidence, 1):
        print(f"   Evidence {i}: {ev.modality_source.value} ({ev.confidence:.3f} confidence)")
    
    # Test 3: Cross-modal reasoning
    print("\n🔗 Test 3: Cross-Modal Reasoning")
    
    test_query = "What insights can be drawn from combining this text and image information?"
    reasoning_result = await reasoner.reason_across_modalities(test_query, mock_output)
    
    print(f"   Processing Time: {reasoning_result.processing_time:.3f}s")
    print(f"   Reasoning Chains: {len(reasoning_result.reasoning_chains)}")
    print(f"   Modalities Analyzed: {[m.value for m in reasoning_result.modalities_analyzed]}")
    print(f"   Confidence Level: {reasoning_result.confidence_assessment.value}")
    print(f"   Contradictions Found: {len(reasoning_result.contradictions_found)}")
    print(f"   Final Conclusion Preview: {reasoning_result.final_conclusion[:100]}...")
    
    # Test 4: Contradiction detection
    print("\n⚖️ Test 4: Contradiction Detection")
    
    # Create test reasoning chains with potential contradictions
    test_chains = [
        ReasoningChain(
            premise="Test premise 1",
            reasoning_steps=["Step 1", "Step 2"],
            conclusion="The result is positive and effective",
            evidence_used=evidence,
            confidence_score=0.8,
            reasoning_type=ReasoningType.ANALYTICAL
        ),
        ReasoningChain(
            premise="Test premise 2",
            reasoning_steps=["Step A", "Step B"],
            conclusion="The outcome is negative and ineffective",
            evidence_used=evidence,
            confidence_score=0.7,
            reasoning_type=ReasoningType.COMPARATIVE
        )
    ]
    
    contradictions = reasoner.detect_contradictions(test_chains)
    print(f"   Contradictions Detected: {len(contradictions)}")
    for contradiction in contradictions:
        print(f"   - {contradiction}")
    
    # Summary
    print(f"\n🎯 Summary:")
    print(f"   Reasoning Strategies Available: {len(reasoner.reasoning_strategies)}")
    print(f"   Evidence Processing: {'✅' if len(evidence) > 0 else '❌'}")
    print(f"   Cross-Modal Analysis: {'✅' if reasoning_result.final_conclusion else '❌'}")
    print(f"   Contradiction Detection: {'✅' if len(contradictions) > 0 else '✅ (No contradictions)'}")
    
    return {
        "reasoning_strategies": len(reasoner.reasoning_strategies),
        "evidence_extraction": len(evidence) > 0,
        "cross_modal_processing": reasoning_result.processing_time,
        "confidence_assessment": reasoning_result.confidence_assessment.value
    }

if __name__ == "__main__":
    import re  # Add missing import
    asyncio.run(test_multimodal_reasoner())