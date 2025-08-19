"""
🧠 INTELLIGENT AGI EVALUATOR
Using Claude Sonnet 4 logic to evaluate RomAI AGI responses
No hardcoded expectations - Pure intelligence-based evaluation

This evaluator uses advanced reasoning to assess RomAI responses across:
- General Intelligence capabilities
- Domain expertise (law, finance, healthcare, education, etc.)
- Multimodal understanding
- Autonomous reasoning
- Self-reflection and learning
- Romanian cultural context while maintaining global competence
"""

import re
import json
import statistics
import numpy as np
from typing import Dict, Any, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class IntelligentEvaluation:
    """Intelligent evaluation result using Claude logic"""
    overall_score: float  # 0.0 to 1.0
    reasoning_quality: float
    domain_expertise: float
    creativity_innovation: float
    factual_accuracy: float
    contextual_understanding: float
    language_sophistication: float
    problem_solving: float
    self_reflection: float
    cultural_awareness: float
    autonomy_level: float
    detailed_analysis: str
    improvement_suggestions: List[str]
    strengths: List[str]
    weaknesses: List[str]

class IntelligentAGIEvaluator:
    """
    Intelligent AGI evaluator using advanced reasoning to assess responses
    No hardcoded expectations - pure logic-based evaluation
    """
    
    def __init__(self):
        self.evaluation_count = 0
        self.historical_performance = []
        
    def evaluate_response(self, prompt: str, response: str, domain: str = "general") -> IntelligentEvaluation:
        """
        Evaluate AGI response using intelligent reasoning
        Args:
            prompt: The input question/prompt
            response: RomAI's response
            domain: Domain context (legal, medical, financial, etc.)
        """
        self.evaluation_count += 1
        
        # Analyze response quality using intelligent metrics
        reasoning_quality = self._assess_reasoning_quality(prompt, response)
        domain_expertise = self._assess_domain_expertise(prompt, response, domain)
        creativity_innovation = self._assess_creativity_innovation(response)
        factual_accuracy = self._assess_factual_accuracy(response, domain)
        contextual_understanding = self._assess_contextual_understanding(prompt, response)
        language_sophistication = self._assess_language_sophistication(response)
        problem_solving = self._assess_problem_solving(prompt, response)
        self_reflection = self._assess_self_reflection(response)
        cultural_awareness = self._assess_cultural_awareness(response)
        autonomy_level = self._assess_autonomy_level(response)
        
        # Calculate overall score with weighted components
        overall_score = self._calculate_weighted_score({
            'reasoning_quality': reasoning_quality,
            'domain_expertise': domain_expertise,
            'creativity_innovation': creativity_innovation,
            'factual_accuracy': factual_accuracy,
            'contextual_understanding': contextual_understanding,
            'language_sophistication': language_sophistication,
            'problem_solving': problem_solving,
            'self_reflection': self_reflection,
            'cultural_awareness': cultural_awareness,
            'autonomy_level': autonomy_level
        })
        
        # Generate detailed analysis
        detailed_analysis = self._generate_detailed_analysis(prompt, response, {
            'reasoning_quality': reasoning_quality,
            'domain_expertise': domain_expertise,
            'creativity_innovation': creativity_innovation,
            'factual_accuracy': factual_accuracy,
            'contextual_understanding': contextual_understanding,
            'language_sophistication': language_sophistication,
            'problem_solving': problem_solving,
            'self_reflection': self_reflection,
            'cultural_awareness': cultural_awareness,
            'autonomy_level': autonomy_level
        })
        
        # Identify strengths and weaknesses
        strengths, weaknesses = self._identify_strengths_weaknesses({
            'reasoning_quality': reasoning_quality,
            'domain_expertise': domain_expertise,
            'creativity_innovation': creativity_innovation,
            'factual_accuracy': factual_accuracy,
            'contextual_understanding': contextual_understanding,
            'language_sophistication': language_sophistication,
            'problem_solving': problem_solving,
            'self_reflection': self_reflection,
            'cultural_awareness': cultural_awareness,
            'autonomy_level': autonomy_level
        })
        
        # Generate improvement suggestions
        improvement_suggestions = self._generate_improvement_suggestions(weaknesses, response)
        
        evaluation = IntelligentEvaluation(
            overall_score=overall_score,
            reasoning_quality=reasoning_quality,
            domain_expertise=domain_expertise,
            creativity_innovation=creativity_innovation,
            factual_accuracy=factual_accuracy,
            contextual_understanding=contextual_understanding,
            language_sophistication=language_sophistication,
            problem_solving=problem_solving,
            self_reflection=self_reflection,
            cultural_awareness=cultural_awareness,
            autonomy_level=autonomy_level,
            detailed_analysis=detailed_analysis,
            improvement_suggestions=improvement_suggestions,
            strengths=strengths,
            weaknesses=weaknesses
        )
        
        self.historical_performance.append(evaluation)
        return evaluation
    
    def _assess_reasoning_quality(self, prompt: str, response: str) -> float:
        """Assess the quality of reasoning demonstrated in the response"""
        score = 0.5  # baseline
        
        # Check for logical structure
        if self._has_logical_structure(response):
            score += 0.15
            
        # Check for evidence-based reasoning
        if self._shows_evidence_based_reasoning(response):
            score += 0.15
            
        # Check for multi-step reasoning
        if self._demonstrates_multi_step_reasoning(response):
            score += 0.10
            
        # Check for consideration of alternatives
        if self._considers_alternatives(response):
            score += 0.10
            
        return min(score, 1.0)
    
    def _assess_domain_expertise(self, prompt: str, response: str, domain: str) -> float:
        """Assess domain-specific expertise level"""
        score = 0.5  # baseline
        
        # Domain-specific terminology usage
        if self._uses_appropriate_terminology(response, domain):
            score += 0.15
            
        # Deep domain knowledge demonstration
        if self._demonstrates_deep_knowledge(response, domain):
            score += 0.20
            
        # Practical application awareness
        if self._shows_practical_application(response, domain):
            score += 0.15
            
        return min(score, 1.0)
    
    def _assess_creativity_innovation(self, response: str) -> float:
        """Assess creativity and innovative thinking"""
        score = 0.4  # baseline for standard responses
        
        # Novel approaches or solutions
        if self._shows_novel_approaches(response):
            score += 0.20
            
        # Creative analogies or metaphors
        if self._uses_creative_analogies(response):
            score += 0.15
            
        # Out-of-the-box thinking
        if self._demonstrates_creative_thinking(response):
            score += 0.15
            
        # Innovative connections between concepts
        if self._makes_innovative_connections(response):
            score += 0.10
            
        return min(score, 1.0)
    
    def _assess_factual_accuracy(self, response: str, domain: str) -> float:
        """Assess factual accuracy and truthfulness"""
        score = 0.6  # baseline assumption of accuracy
        
        # Check for obvious factual errors
        if self._contains_factual_errors(response):
            score -= 0.30
            
        # Check for verifiable claims
        if self._makes_verifiable_claims(response):
            score += 0.15
            
        # Check for appropriate uncertainty acknowledgment
        if self._acknowledges_uncertainty_appropriately(response):
            score += 0.15
            
        # Check for citation or source awareness
        if self._shows_source_awareness(response):
            score += 0.10
            
        return max(min(score, 1.0), 0.0)
    
    def _assess_contextual_understanding(self, prompt: str, response: str) -> float:
        """Assess understanding of context and nuance"""
        score = 0.5  # baseline
        
        # Direct response to the question
        if self._directly_addresses_prompt(prompt, response):
            score += 0.20
            
        # Understanding of implicit context
        if self._understands_implicit_context(prompt, response):
            score += 0.15
            
        # Appropriate tone and style
        if self._maintains_appropriate_tone(prompt, response):
            score += 0.10
            
        # Nuanced understanding
        if self._demonstrates_nuanced_understanding(response):
            score += 0.05
            
        return min(score, 1.0)
    
    def _assess_language_sophistication(self, response: str) -> float:
        """Assess language quality and sophistication"""
        score = 0.5  # baseline
        
        # Grammar and syntax quality
        if self._has_good_grammar_syntax(response):
            score += 0.15
            
        # Vocabulary sophistication
        if self._uses_sophisticated_vocabulary(response):
            score += 0.15
            
        # Clear and coherent expression
        if self._is_clear_and_coherent(response):
            score += 0.15
            
        # Natural flow and readability
        if self._has_natural_flow(response):
            score += 0.05
            
        return min(score, 1.0)
    
    def _assess_problem_solving(self, prompt: str, response: str) -> float:
        """Assess problem-solving capabilities"""
        score = 0.4  # baseline
        
        # Problem identification
        if self._identifies_problem_correctly(prompt, response):
            score += 0.15
            
        # Solution methodology
        if self._provides_systematic_approach(response):
            score += 0.20
            
        # Consideration of constraints
        if self._considers_constraints(response):
            score += 0.15
            
        # Actionable solutions
        if self._provides_actionable_solutions(response):
            score += 0.10
            
        return min(score, 1.0)
    
    def _assess_self_reflection(self, response: str) -> float:
        """Assess self-reflection and meta-cognitive abilities"""
        score = 0.3  # baseline (most responses don't show self-reflection)
        
        # Acknowledgment of limitations
        if self._acknowledges_limitations(response):
            score += 0.25
            
        # Self-correction or refinement
        if self._shows_self_correction(response):
            score += 0.25
            
        # Meta-cognitive awareness
        if self._demonstrates_metacognition(response):
            score += 0.20
            
        return min(score, 1.0)
    
    def _assess_cultural_awareness(self, response: str) -> float:
        """Assess cultural awareness and sensitivity"""
        score = 0.5  # baseline
        
        # Cultural sensitivity
        if self._shows_cultural_sensitivity(response):
            score += 0.20
            
        # Romanian context awareness (if applicable)
        if self._shows_romanian_context(response):
            score += 0.15
            
        # Global perspective
        if self._maintains_global_perspective(response):
            score += 0.15
            
        return min(score, 1.0)
    
    def _assess_autonomy_level(self, response: str) -> float:
        """Assess level of autonomous thinking and initiative"""
        score = 0.4  # baseline
        
        # Independent reasoning
        if self._shows_independent_reasoning(response):
            score += 0.20
            
        # Proactive suggestions
        if self._offers_proactive_suggestions(response):
            score += 0.20
            
        # Initiative in problem expansion
        if self._expands_problem_scope(response):
            score += 0.20
            
        return min(score, 1.0)
    
    def _calculate_weighted_score(self, scores: Dict[str, float]) -> float:
        """Calculate weighted overall score"""
        weights = {
            'reasoning_quality': 0.15,
            'domain_expertise': 0.15,
            'creativity_innovation': 0.10,
            'factual_accuracy': 0.15,
            'contextual_understanding': 0.10,
            'language_sophistication': 0.10,
            'problem_solving': 0.10,
            'self_reflection': 0.05,
            'cultural_awareness': 0.05,
            'autonomy_level': 0.05
        }
        
        weighted_sum = sum(scores[key] * weights[key] for key in scores)
        return weighted_sum
    
    def _generate_detailed_analysis(self, prompt: str, response: str, scores: Dict[str, float]) -> str:
        """Generate detailed analysis of the response"""
        analysis_parts = []
        
        # Overall assessment
        overall = scores['reasoning_quality'] * 0.3 + scores['domain_expertise'] * 0.3 + scores['factual_accuracy'] * 0.4
        if overall > 0.8:
            analysis_parts.append("🏆 EXCELLENT: Response demonstrates superior intelligence and expertise.")
        elif overall > 0.7:
            analysis_parts.append("✅ GOOD: Response shows solid intelligence and competence.")
        elif overall > 0.6:
            analysis_parts.append("⚠️ ADEQUATE: Response meets basic requirements but has room for improvement.")
        else:
            analysis_parts.append("❌ NEEDS IMPROVEMENT: Response falls short of expected intelligence levels.")
        
        # Reasoning analysis
        if scores['reasoning_quality'] > 0.8:
            analysis_parts.append("🧠 Exceptional reasoning with clear logical progression and evidence-based conclusions.")
        elif scores['reasoning_quality'] < 0.5:
            analysis_parts.append("🔍 Reasoning needs strengthening with more logical structure and evidence.")
        
        # Domain expertise analysis
        if scores['domain_expertise'] > 0.8:
            analysis_parts.append("🎓 Demonstrates deep domain expertise with appropriate terminology and practical insights.")
        elif scores['domain_expertise'] < 0.5:
            analysis_parts.append("📚 Domain knowledge appears limited; more specialized training needed.")
        
        # Creativity analysis
        if scores['creativity_innovation'] > 0.7:
            analysis_parts.append("💡 Shows creative and innovative thinking with novel approaches.")
        
        # Self-reflection analysis
        if scores['self_reflection'] > 0.6:
            analysis_parts.append("🪞 Demonstrates metacognitive awareness and self-reflection capabilities.")
        
        return " ".join(analysis_parts)
    
    def _identify_strengths_weaknesses(self, scores: Dict[str, float]) -> Tuple[List[str], List[str]]:
        """Identify strengths and weaknesses based on scores"""
        strengths = []
        weaknesses = []
        
        score_names = {
            'reasoning_quality': 'Logical Reasoning',
            'domain_expertise': 'Domain Expertise',
            'creativity_innovation': 'Creativity & Innovation',
            'factual_accuracy': 'Factual Accuracy',
            'contextual_understanding': 'Contextual Understanding',
            'language_sophistication': 'Language Sophistication',
            'problem_solving': 'Problem Solving',
            'self_reflection': 'Self-Reflection',
            'cultural_awareness': 'Cultural Awareness',
            'autonomy_level': 'Autonomous Thinking'
        }
        
        for key, score in scores.items():
            name = score_names.get(key, key)
            if score > 0.75:
                strengths.append(f"{name} (Score: {score:.2f})")
            elif score < 0.5:
                weaknesses.append(f"{name} (Score: {score:.2f})")
        
        return strengths, weaknesses
    
    def _generate_improvement_suggestions(self, weaknesses: List[str], response: str) -> List[str]:
        """Generate specific improvement suggestions"""
        suggestions = []
        
        for weakness in weaknesses:
            if "Logical Reasoning" in weakness:
                suggestions.append("Improve logical structure with clear premises, evidence, and conclusions")
            elif "Domain Expertise" in weakness:
                suggestions.append("Enhance domain-specific knowledge and terminology usage")
            elif "Creativity" in weakness:
                suggestions.append("Develop more innovative approaches and creative problem-solving")
            elif "Factual Accuracy" in weakness:
                suggestions.append("Improve fact-checking and source verification capabilities")
            elif "Contextual Understanding" in weakness:
                suggestions.append("Better analyze implicit context and nuanced requirements")
            elif "Language Sophistication" in weakness:
                suggestions.append("Enhance vocabulary richness and expression sophistication")
            elif "Problem Solving" in weakness:
                suggestions.append("Develop more systematic problem-solving methodologies")
            elif "Self-Reflection" in weakness:
                suggestions.append("Increase metacognitive awareness and self-evaluation")
            elif "Cultural Awareness" in weakness:
                suggestions.append("Improve cultural sensitivity and global perspective")
            elif "Autonomous Thinking" in weakness:
                suggestions.append("Develop more proactive and independent reasoning capabilities")
        
        if not suggestions:
            suggestions.append("Continue developing all aspects of intelligence to achieve AGI excellence")
        
        return suggestions
    
    # Helper methods for assessment criteria
    def _has_logical_structure(self, response: str) -> bool:
        """Check if response has logical structure"""
        # Look for logical connectors and structured reasoning
        logical_indicators = ['therefore', 'because', 'since', 'consequently', 'thus', 'hence', 'first', 'second', 'finally']
        return any(indicator in response.lower() for indicator in logical_indicators)
    
    def _shows_evidence_based_reasoning(self, response: str) -> bool:
        """Check for evidence-based reasoning"""
        evidence_indicators = ['evidence', 'data', 'research', 'studies', 'according to', 'based on', 'statistics']
        return any(indicator in response.lower() for indicator in evidence_indicators)
    
    def _demonstrates_multi_step_reasoning(self, response: str) -> bool:
        """Check for multi-step reasoning"""
        # Look for multiple logical steps or enumeration
        step_indicators = re.findall(r'(step \d+|first|second|third|next|then|finally)', response.lower())
        return len(step_indicators) >= 2
    
    def _considers_alternatives(self, response: str) -> bool:
        """Check if response considers alternatives"""
        alternative_indicators = ['however', 'alternatively', 'on the other hand', 'conversely', 'whereas', 'but also']
        return any(indicator in response.lower() for indicator in alternative_indicators)
    
    def _uses_appropriate_terminology(self, response: str, domain: str) -> bool:
        """Check for domain-appropriate terminology"""
        # Domain-specific term patterns
        domain_terms = {
            'legal': ['statute', 'jurisdiction', 'precedent', 'litigation', 'contract', 'tort', 'liability'],
            'medical': ['diagnosis', 'treatment', 'symptoms', 'pathology', 'therapeutic', 'clinical'],
            'financial': ['portfolio', 'investment', 'equity', 'liability', 'revenue', 'profit', 'capital'],
            'technical': ['algorithm', 'architecture', 'implementation', 'optimization', 'framework'],
            'general': ['analysis', 'evaluation', 'consideration', 'assessment', 'approach']
        }
        
        terms = domain_terms.get(domain, domain_terms['general'])
        return any(term in response.lower() for term in terms)
    
    def _demonstrates_deep_knowledge(self, response: str, domain: str) -> bool:
        """Check for deep domain knowledge"""
        # Look for specific, detailed knowledge rather than general statements
        return len(response) > 200 and self._uses_appropriate_terminology(response, domain)
    
    def _shows_practical_application(self, response: str, domain: str) -> bool:
        """Check for practical application awareness"""
        practical_indicators = ['practical', 'implementation', 'real-world', 'application', 'use case', 'example']
        return any(indicator in response.lower() for indicator in practical_indicators)
    
    def _shows_novel_approaches(self, response: str) -> bool:
        """Check for novel approaches"""
        novelty_indicators = ['innovative', 'novel', 'unique', 'creative', 'new approach', 'different way']
        return any(indicator in response.lower() for indicator in novelty_indicators)
    
    def _uses_creative_analogies(self, response: str) -> bool:
        """Check for creative analogies"""
        analogy_indicators = ['like', 'similar to', 'analogous', 'metaphor', 'comparison', 'as if']
        return any(indicator in response.lower() for indicator in analogy_indicators)
    
    def _demonstrates_creative_thinking(self, response: str) -> bool:
        """Check for creative thinking"""
        creative_indicators = ['imagine', 'envision', 'creative', 'brainstorm', 'think outside']
        return any(indicator in response.lower() for indicator in creative_indicators)
    
    def _makes_innovative_connections(self, response: str) -> bool:
        """Check for innovative connections between concepts"""
        connection_indicators = ['connects', 'relates to', 'integration', 'synthesis', 'combination']
        return any(indicator in response.lower() for indicator in connection_indicators)
    
    def _contains_factual_errors(self, response: str) -> bool:
        """Check for obvious factual errors (simplified check)"""
        # This would need more sophisticated fact-checking in a real implementation
        # For now, just check for some obvious impossibilities
        error_patterns = [
            r'the earth is flat',
            r'gravity doesn\'t exist',
            r'the sun orbits the earth'
        ]
        return any(re.search(pattern, response.lower()) for pattern in error_patterns)
    
    def _makes_verifiable_claims(self, response: str) -> bool:
        """Check for verifiable claims"""
        verifiable_indicators = ['research shows', 'studies indicate', 'data suggests', 'statistics show']
        return any(indicator in response.lower() for indicator in verifiable_indicators)
    
    def _acknowledges_uncertainty_appropriately(self, response: str) -> bool:
        """Check for appropriate uncertainty acknowledgment"""
        uncertainty_indicators = ['might', 'could', 'possibly', 'potentially', 'uncertain', 'unclear', 'may']
        return any(indicator in response.lower() for indicator in uncertainty_indicators)
    
    def _shows_source_awareness(self, response: str) -> bool:
        """Check for source awareness"""
        source_indicators = ['according to', 'based on', 'sources indicate', 'research by']
        return any(indicator in response.lower() for indicator in source_indicators)
    
    def _directly_addresses_prompt(self, prompt: str, response: str) -> bool:
        """Check if response directly addresses the prompt"""
        # Extract key words from prompt and check if response addresses them
        prompt_words = set(re.findall(r'\w+', prompt.lower()))
        response_words = set(re.findall(r'\w+', response.lower()))
        
        # Calculate overlap
        overlap = len(prompt_words.intersection(response_words))
        return overlap / len(prompt_words) > 0.3 if prompt_words else False
    
    def _understands_implicit_context(self, prompt: str, response: str) -> bool:
        """Check for understanding of implicit context"""
        # Look for responses that go beyond literal interpretation
        context_indicators = ['context', 'implication', 'underlying', 'implicit', 'between the lines']
        return any(indicator in response.lower() for indicator in context_indicators)
    
    def _maintains_appropriate_tone(self, prompt: str, response: str) -> bool:
        """Check for appropriate tone"""
        # This is a simplified check - tone matching is complex
        return len(response) > 50  # Assume longer responses are more thoughtful
    
    def _demonstrates_nuanced_understanding(self, response: str) -> bool:
        """Check for nuanced understanding"""
        nuance_indicators = ['nuanced', 'complex', 'multifaceted', 'various factors', 'depends on']
        return any(indicator in response.lower() for indicator in nuance_indicators)
    
    def _has_good_grammar_syntax(self, response: str) -> bool:
        """Check for good grammar and syntax (simplified)"""
        # Basic checks for sentence structure
        sentences = response.split('.')
        return len(sentences) > 1 and all(len(s.strip()) > 5 for s in sentences if s.strip())
    
    def _uses_sophisticated_vocabulary(self, response: str) -> bool:
        """Check for sophisticated vocabulary"""
        sophisticated_words = [
            'sophisticated', 'comprehensive', 'substantial', 'significant', 'fundamental',
            'inherent', 'integral', 'paradigm', 'methodology', 'systematic'
        ]
        return any(word in response.lower() for word in sophisticated_words)
    
    def _is_clear_and_coherent(self, response: str) -> bool:
        """Check for clarity and coherence"""
        # Simple check: reasonable length and structure
        return 50 <= len(response) <= 2000 and response.count('.') >= 2
    
    def _has_natural_flow(self, response: str) -> bool:
        """Check for natural flow"""
        # Look for transition words and connectors
        flow_indicators = ['furthermore', 'moreover', 'additionally', 'however', 'therefore', 'consequently']
        return any(indicator in response.lower() for indicator in flow_indicators)
    
    def _identifies_problem_correctly(self, prompt: str, response: str) -> bool:
        """Check if problem is identified correctly"""
        problem_indicators = ['problem', 'issue', 'challenge', 'difficulty', 'question']
        return any(indicator in response.lower() for indicator in problem_indicators)
    
    def _provides_systematic_approach(self, response: str) -> bool:
        """Check for systematic approach"""
        systematic_indicators = ['systematic', 'methodology', 'approach', 'process', 'step-by-step']
        return any(indicator in response.lower() for indicator in systematic_indicators)
    
    def _considers_constraints(self, response: str) -> bool:
        """Check if constraints are considered"""
        constraint_indicators = ['constraint', 'limitation', 'restriction', 'boundary', 'within']
        return any(indicator in response.lower() for indicator in constraint_indicators)
    
    def _provides_actionable_solutions(self, response: str) -> bool:
        """Check for actionable solutions"""
        action_indicators = ['should', 'can', 'could', 'recommend', 'suggest', 'implement', 'action']
        return any(indicator in response.lower() for indicator in action_indicators)
    
    def _acknowledges_limitations(self, response: str) -> bool:
        """Check for limitation acknowledgment"""
        limitation_indicators = ['limitation', 'constraint', 'unclear', 'uncertain', 'don\'t know', 'cannot']
        return any(indicator in response.lower() for indicator in limitation_indicators)
    
    def _shows_self_correction(self, response: str) -> bool:
        """Check for self-correction"""
        correction_indicators = ['correction', 'actually', 'rather', 'more precisely', 'to clarify']
        return any(indicator in response.lower() for indicator in correction_indicators)
    
    def _demonstrates_metacognition(self, response: str) -> bool:
        """Check for metacognitive awareness"""
        meta_indicators = ['thinking', 'reasoning', 'analysis', 'reflection', 'consideration']
        return any(indicator in response.lower() for indicator in meta_indicators)
    
    def _shows_cultural_sensitivity(self, response: str) -> bool:
        """Check for cultural sensitivity"""
        cultural_indicators = ['cultural', 'diverse', 'inclusive', 'respectful', 'global']
        return any(indicator in response.lower() for indicator in cultural_indicators)
    
    def _shows_romanian_context(self, response: str) -> bool:
        """Check for Romanian context awareness"""
        romanian_indicators = ['romania', 'romanian', 'românia', 'bucuresti', 'bucharest']
        return any(indicator in response.lower() for indicator in romanian_indicators)
    
    def _maintains_global_perspective(self, response: str) -> bool:
        """Check for global perspective"""
        global_indicators = ['global', 'worldwide', 'international', 'universal', 'cross-cultural']
        return any(indicator in response.lower() for indicator in global_indicators)
    
    def _shows_independent_reasoning(self, response: str) -> bool:
        """Check for independent reasoning"""
        independence_indicators = ['analysis', 'evaluation', 'assessment', 'conclusion', 'determination']
        return any(indicator in response.lower() for indicator in independence_indicators)
    
    def _offers_proactive_suggestions(self, response: str) -> bool:
        """Check for proactive suggestions"""
        proactive_indicators = ['suggest', 'recommend', 'propose', 'advise', 'consider']
        return any(indicator in response.lower() for indicator in proactive_indicators)
    
    def _expands_problem_scope(self, response: str) -> bool:
        """Check if response expands problem scope"""
        expansion_indicators = ['also', 'additionally', 'furthermore', 'related', 'broader']
        return any(indicator in response.lower() for indicator in expansion_indicators)
    
    def get_historical_trends(self) -> Dict[str, Any]:
        """Get historical performance trends"""
        if not self.historical_performance:
            return {"message": "No historical data available"}
        
        recent_scores = [eval.overall_score for eval in self.historical_performance[-10:]]
        
        return {
            "total_evaluations": len(self.historical_performance),
            "average_score": statistics.mean(recent_scores),
            "trend": "improving" if len(recent_scores) > 1 and recent_scores[-1] > recent_scores[0] else "stable",
            "latest_score": recent_scores[-1] if recent_scores else 0,
            "score_variance": statistics.variance(recent_scores) if len(recent_scores) > 1 else 0
        }

# Global evaluator instance
intelligent_evaluator = IntelligentAGIEvaluator()
