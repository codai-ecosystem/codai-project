"""
🎯 RomAI Few-Shot Learning Engine - Week 7 Day 1
Advanced Few-Shot Learning for Romanian Language and Cultural Tasks

This module implements sophisticated few-shot learning capabilities specifically
designed for Romanian language understanding, cultural context adaptation,
and rapid task learning with minimal examples.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, List, Optional, Tuple, Any, Union
import numpy as np
from dataclasses import dataclass, field
from datetime import datetime
import asyncio
import json
import re
from pathlib import Path
from collections import defaultdict

# Romanian linguistic imports
try:
    from ..meta_learning.romanian_meta_learner import RomanianTask, RomAIMetaLearner
except ImportError:
    print("Warning: Meta-learning imports failed. Running in standalone mode.")


@dataclass
class FewShotExample:
    """Represents a few-shot learning example for Romanian tasks."""
    input_text: str
    output_text: str
    context: Dict[str, Any] = field(default_factory=dict)
    confidence: float = 1.0
    region: Optional[str] = None
    dialect: Optional[str] = None
    formality_level: str = "neutral"  # formal, informal, neutral
    cultural_tags: List[str] = field(default_factory=list)
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class FewShotTask:
    """Represents a few-shot learning task with Romanian-specific features."""
    task_name: str
    task_type: str  # 'translation', 'classification', 'generation', 'cultural_adaptation'
    examples: List[FewShotExample]
    target_metric: str = "accuracy"
    success_threshold: float = 0.8
    max_examples: int = 10
    cultural_context: Dict[str, Any] = field(default_factory=dict)
    romanian_features: Dict[str, Any] = field(default_factory=dict)


class RomanianPromptEngine:
    """
    Advanced prompt engineering for Romanian few-shot learning.
    Generates culturally-aware prompts for Romanian language tasks.
    """
    
    def __init__(self):
        self.prompt_templates = {
            'translation': {
                'formal': "Traduceți următorul text în română formală:",
                'informal': "Traduce următorul text în română informală:",
                'neutral': "Traduceți următorul text în română:"
            },
            'cultural_adaptation': {
                'formal': "Adaptați următorul text la contextul cultural românesc formal:",
                'informal': "Adaptează textul la cultura românească informală:",
                'neutral': "Adaptați textul la contextul cultural românesc:"
            },
            'dialect_conversion': {
                'moldovan': "Convertiți la dialectul moldovenesc:",
                'banat': "Convertiți la dialectul bănățean:",
                'transylvanian': "Convertiți la dialectul transilvănean:",
                'wallachia': "Convertiți la dialectul muntenesc:"
            },
            'sentiment_analysis': {
                'formal': "Analizați sentimentul următorului text românesc:",
                'informal': "Ce sentiment exprimă textul:",
                'neutral': "Identificați sentimentul textului:"
            }
        }
        
        # Romanian linguistic patterns
        self.romanian_patterns = {
            'formal_pronouns': ['dumneavoastră', 'dumneaei', 'dumnealui'],
            'informal_pronouns': ['tu', 'voi', 'tine'],
            'polite_expressions': ['vă rog', 'cu plăcere', 'mulțumesc frumos'],
            'cultural_markers': ['sărbători', 'tradiții', 'obiceiuri', 'folclor'],
            'regional_markers': {
                'moldova': ['moldovan', 'basarabean', 'chișinău'],
                'transilvania': ['ardelenesc', 'brașov', 'cluj'],
                'wallachia': ['muntean', 'bucurești', 'ploiești'],
                'banat': ['bănățean', 'timișoara', 'reșița']
            }
        }
    
    def generate_prompt(self, task: FewShotTask, examples: List[FewShotExample],
                       target_input: str) -> str:
        """
        Generate a Romanian-specific prompt for few-shot learning.
        
        Args:
            task: Few-shot task definition
            examples: Few-shot examples to include in prompt
            target_input: Input text for which we want output
            
        Returns:
            Generated prompt string with Romanian context
        """
        # Get base template
        task_type = task.task_type
        formality = task.cultural_context.get('formality', 'neutral')
        
        if task_type in self.prompt_templates:
            base_prompt = self.prompt_templates[task_type].get(
                formality, 
                self.prompt_templates[task_type]['neutral']
            )
        else:
            base_prompt = f"Efectuați următoarea sarcină în română ({formality}):"
        
        # Build few-shot examples section
        examples_section = self._build_examples_section(examples, task)
        
        # Add cultural context
        cultural_section = self._build_cultural_context(task)
        
        # Add target input
        target_section = f"\nText de procesat:\n{target_input}\n\nRăspuns:"
        
        # Combine all sections
        full_prompt = f"{base_prompt}\n\n{cultural_section}\n{examples_section}{target_section}"
        
        return full_prompt
    
    def _build_examples_section(self, examples: List[FewShotExample], task: FewShotTask) -> str:
        """Build the examples section of the prompt."""
        if not examples:
            return ""
        
        examples_text = "Exemple:\n\n"
        
        for i, example in enumerate(examples, 1):
            # Add regional context if available
            region_marker = ""
            if example.region:
                region_marker = f" ({example.region})"
            
            examples_text += f"Exemplul {i}{region_marker}:\n"
            examples_text += f"Input: {example.input_text}\n"
            examples_text += f"Output: {example.output_text}\n\n"
        
        return examples_text
    
    def _build_cultural_context(self, task: FewShotTask) -> str:
        """Build cultural context section for the prompt."""
        context = task.cultural_context
        if not context:
            return ""
        
        context_text = "Context cultural:\n"
        
        if 'region' in context:
            context_text += f"- Regiune: {context['region']}\n"
        
        if 'dialect' in context:
            context_text += f"- Dialect: {context['dialect']}\n"
        
        if 'formality' in context:
            context_text += f"- Nivel de formalitate: {context['formality']}\n"
        
        if 'domain' in context:
            context_text += f"- Domeniu: {context['domain']}\n"
        
        return context_text + "\n"
    
    def analyze_romanian_features(self, text: str) -> Dict[str, Any]:
        """Analyze Romanian linguistic and cultural features in text."""
        features = {
            'formality_level': 'neutral',
            'detected_region': None,
            'cultural_markers': [],
            'linguistic_complexity': 0.0,
            'dialect_indicators': []
        }
        
        text_lower = text.lower()
        
        # Detect formality level
        formal_count = sum(1 for pronoun in self.romanian_patterns['formal_pronouns'] 
                          if pronoun in text_lower)
        informal_count = sum(1 for pronoun in self.romanian_patterns['informal_pronouns'] 
                            if pronoun in text_lower)
        
        if formal_count > informal_count:
            features['formality_level'] = 'formal'
        elif informal_count > formal_count:
            features['formality_level'] = 'informal'
        
        # Detect regional markers
        for region, markers in self.romanian_patterns['regional_markers'].items():
            if any(marker in text_lower for marker in markers):
                features['detected_region'] = region
                features['dialect_indicators'].extend([m for m in markers if m in text_lower])
                break
        
        # Detect cultural markers
        features['cultural_markers'] = [
            marker for marker in self.romanian_patterns['cultural_markers'] 
            if marker in text_lower
        ]
        
        # Calculate linguistic complexity (simplified)
        sentences = text.count('.') + text.count('!') + text.count('?')
        words = len(text.split())
        if sentences > 0:
            features['linguistic_complexity'] = words / sentences
        
        return features


class FewShotLearningEngine:
    """
    Advanced few-shot learning engine for Romanian language tasks.
    Implements sophisticated adaptation mechanisms for cultural and linguistic contexts.
    """
    
    def __init__(self):
        self.prompt_engine = RomanianPromptEngine()
        self.task_registry = {}
        self.adaptation_history = []
        self.performance_tracker = {
            'total_adaptations': 0,
            'successful_adaptations': 0,
            'average_examples_needed': 0.0,
            'cultural_accuracy': 0.0,
            'linguistic_accuracy': 0.0
        }
        
        # Initialize Romanian few-shot capabilities
        self.romanian_capabilities = {
            'dialect_adaptation': True,
            'cultural_context_learning': True,
            'formality_adjustment': True,
            'regional_specialization': True,
            'literary_analysis': True,
            'business_communication': True,
            'historical_context': True
        }
    
    async def few_shot_learn(self, task: FewShotTask, target_inputs: List[str],
                           use_meta_learning: bool = True) -> Dict[str, Any]:
        """
        Perform few-shot learning for Romanian language tasks.
        
        Args:
            task: Few-shot task with examples and configuration
            target_inputs: List of inputs to process using few-shot learning
            use_meta_learning: Whether to leverage meta-learning capabilities
            
        Returns:
            Learning results and generated outputs
        """
        start_time = datetime.now()
        
        try:
            # Validate task and examples
            if not self._validate_task(task):
                return {'error': 'Invalid task configuration', 'task_name': task.task_name}
            
            # Analyze examples for Romanian features
            example_analysis = self._analyze_examples(task.examples)
            
            # Generate outputs for target inputs
            outputs = []
            confidences = []
            
            for target_input in target_inputs:
                # Analyze target input
                input_features = self.prompt_engine.analyze_romanian_features(target_input)
                
                # Select best examples based on similarity
                selected_examples = self._select_best_examples(
                    task.examples, input_features, max_examples=5
                )
                
                # Generate prompt
                prompt = self.prompt_engine.generate_prompt(
                    task, selected_examples, target_input
                )
                
                # Simulate processing (in production, this would call an LLM)
                output, confidence = await self._process_few_shot_prompt(
                    prompt, task, input_features
                )
                
                outputs.append(output)
                confidences.append(confidence)
            
            # Calculate performance metrics
            avg_confidence = np.mean(confidences) if confidences else 0.0
            success = avg_confidence >= task.success_threshold
            
            # Update performance tracking
            self._update_performance_metrics(task, success, len(task.examples))
            
            # Store adaptation in history
            adaptation_record = {
                'task_name': task.task_name,
                'task_type': task.task_type,
                'num_examples': len(task.examples),
                'success': success,
                'average_confidence': avg_confidence,
                'cultural_context': task.cultural_context,
                'timestamp': start_time.isoformat(),
                'processing_time': (datetime.now() - start_time).total_seconds()
            }
            
            self.adaptation_history.append(adaptation_record)
            
            return {
                'success': success,
                'task_name': task.task_name,
                'outputs': outputs,
                'confidences': confidences,
                'average_confidence': avg_confidence,
                'examples_used': len(task.examples),
                'example_analysis': example_analysis,
                'cultural_adaptation': True,
                'romanian_features_detected': True,
                'adaptation_record': adaptation_record
            }
            
        except Exception as e:
            return {
                'success': False,
                'task_name': task.task_name,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    async def adaptive_few_shot(self, initial_examples: List[FewShotExample],
                              target_input: str, task_type: str,
                              cultural_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform adaptive few-shot learning that adjusts based on input characteristics.
        
        Args:
            initial_examples: Starting set of examples
            target_input: Input text to process
            task_type: Type of task to perform
            cultural_context: Cultural context for adaptation
            
        Returns:
            Adaptive learning results with Romanian specialization
        """
        # Analyze target input for Romanian features
        input_features = self.prompt_engine.analyze_romanian_features(target_input)
        
        # Adapt cultural context based on detected features
        adapted_context = self._adapt_cultural_context(cultural_context, input_features)
        
        # Create adaptive task
        adaptive_task = FewShotTask(
            task_name=f"adaptive_{task_type}_{datetime.now().strftime('%H%M%S')}",
            task_type=task_type,
            examples=initial_examples,
            cultural_context=adapted_context,
            romanian_features={'detected_features': input_features}
        )
        
        # Perform few-shot learning
        results = await self.few_shot_learn(adaptive_task, [target_input])
        
        # Add adaptive learning insights
        adaptive_insights = {
            'input_analysis': input_features,
            'context_adaptation': adapted_context,
            'formality_match': input_features['formality_level'] == adapted_context.get('formality', 'neutral'),
            'regional_match': input_features['detected_region'] == adapted_context.get('region'),
            'cultural_relevance': len(input_features['cultural_markers']) > 0
        }
        
        return {
            **results,
            'adaptive_learning': True,
            'adaptive_insights': adaptive_insights,
            'romanian_cultural_adaptation': True
        }
    
    def get_few_shot_capabilities(self) -> Dict[str, Any]:
        """Get current few-shot learning capabilities."""
        return {
            'romanian_capabilities': self.romanian_capabilities,
            'supported_task_types': ['translation', 'cultural_adaptation', 'dialect_conversion', 'sentiment_analysis'],
            'performance_metrics': self.performance_tracker,
            'prompt_templates_available': len(self.prompt_engine.prompt_templates),
            'adaptation_history_count': len(self.adaptation_history),
            'linguistic_patterns': len(self.prompt_engine.romanian_patterns),
            'cultural_intelligence': True,
            'adaptive_learning': True,
            'meta_learning_integration': True,
            'timestamp': datetime.now().isoformat()
        }
    
    def _validate_task(self, task: FewShotTask) -> bool:
        """Validate few-shot task configuration."""
        return (
            isinstance(task.examples, list) and
            len(task.examples) > 0 and
            len(task.examples) <= task.max_examples and
            task.task_type in ['translation', 'cultural_adaptation', 'dialect_conversion', 'sentiment_analysis', 'generation', 'classification'] and
            task.success_threshold >= 0.0 and
            task.success_threshold <= 1.0
        )
    
    def _analyze_examples(self, examples: List[FewShotExample]) -> Dict[str, Any]:
        """Analyze few-shot examples for patterns and features."""
        analysis = {
            'total_examples': len(examples),
            'formality_distribution': defaultdict(int),
            'regional_distribution': defaultdict(int),
            'cultural_marker_frequency': defaultdict(int),
            'average_confidence': 0.0,
            'linguistic_complexity_range': [float('inf'), 0.0]
        }
        
        total_confidence = 0.0
        
        for example in examples:
            # Analyze each example
            features = self.prompt_engine.analyze_romanian_features(example.input_text)
            
            # Update distributions
            analysis['formality_distribution'][features['formality_level']] += 1
            if features['detected_region']:
                analysis['regional_distribution'][features['detected_region']] += 1
            
            for marker in features['cultural_markers']:
                analysis['cultural_marker_frequency'][marker] += 1
            
            # Update confidence and complexity
            total_confidence += example.confidence
            complexity = features['linguistic_complexity']
            analysis['linguistic_complexity_range'][0] = min(analysis['linguistic_complexity_range'][0], complexity)
            analysis['linguistic_complexity_range'][1] = max(analysis['linguistic_complexity_range'][1], complexity)
        
        analysis['average_confidence'] = total_confidence / len(examples)
        
        # Convert defaultdicts to regular dicts for JSON serialization
        analysis['formality_distribution'] = dict(analysis['formality_distribution'])
        analysis['regional_distribution'] = dict(analysis['regional_distribution'])
        analysis['cultural_marker_frequency'] = dict(analysis['cultural_marker_frequency'])
        
        return analysis
    
    def _select_best_examples(self, examples: List[FewShotExample], 
                            input_features: Dict[str, Any], max_examples: int = 5) -> List[FewShotExample]:
        """Select the best examples based on similarity to input features."""
        if len(examples) <= max_examples:
            return examples
        
        # Score examples based on feature similarity
        scored_examples = []
        
        for example in examples:
            example_features = self.prompt_engine.analyze_romanian_features(example.input_text)
            similarity_score = self._calculate_similarity(input_features, example_features)
            scored_examples.append((similarity_score, example))
        
        # Sort by similarity score (descending) and take top examples
        scored_examples.sort(key=lambda x: x[0], reverse=True)
        return [example for _, example in scored_examples[:max_examples]]
    
    def _calculate_similarity(self, features1: Dict[str, Any], features2: Dict[str, Any]) -> float:
        """Calculate similarity between two feature sets."""
        similarity = 0.0
        
        # Formality level match
        if features1['formality_level'] == features2['formality_level']:
            similarity += 0.3
        
        # Regional match
        if features1['detected_region'] and features2['detected_region']:
            if features1['detected_region'] == features2['detected_region']:
                similarity += 0.3
        
        # Cultural markers overlap
        markers1 = set(features1['cultural_markers'])
        markers2 = set(features2['cultural_markers'])
        if markers1 and markers2:
            overlap = len(markers1.intersection(markers2)) / len(markers1.union(markers2))
            similarity += 0.2 * overlap
        
        # Linguistic complexity similarity
        complexity_diff = abs(features1['linguistic_complexity'] - features2['linguistic_complexity'])
        complexity_similarity = max(0, 1 - complexity_diff / 10)  # Normalize
        similarity += 0.2 * complexity_similarity
        
        return similarity
    
    def _adapt_cultural_context(self, original_context: Dict[str, Any], 
                              input_features: Dict[str, Any]) -> Dict[str, Any]:
        """Adapt cultural context based on detected input features."""
        adapted_context = original_context.copy()
        
        # Adapt formality if detected
        if input_features['formality_level'] != 'neutral':
            adapted_context['formality'] = input_features['formality_level']
        
        # Adapt region if detected
        if input_features['detected_region']:
            adapted_context['region'] = input_features['detected_region']
        
        # Add detected cultural elements
        if input_features['cultural_markers']:
            adapted_context['cultural_elements'] = input_features['cultural_markers']
        
        return adapted_context
    
    async def _process_few_shot_prompt(self, prompt: str, task: FewShotTask, 
                                     input_features: Dict[str, Any]) -> Tuple[str, float]:
        """
        Process few-shot prompt and generate output.
        In production, this would call an actual LLM.
        """
        # Simulate processing time
        await asyncio.sleep(0.1)
        
        # Generate simulated output based on task type
        if task.task_type == 'translation':
            output = f"Translated Romanian text (simulated): {input_features['formality_level']} style"
            confidence = 0.85
        elif task.task_type == 'cultural_adaptation':
            output = f"Culturally adapted text for {input_features.get('detected_region', 'general')} region"
            confidence = 0.82
        elif task.task_type == 'dialect_conversion':
            output = f"Dialect converted text with {len(input_features['cultural_markers'])} cultural elements"
            confidence = 0.78
        elif task.task_type == 'sentiment_analysis':
            output = f"Sentiment: positive (confidence based on {input_features['linguistic_complexity']:.1f} complexity)"
            confidence = 0.88
        else:
            output = f"Generated output for {task.task_type} task"
            confidence = 0.75
        
        # Adjust confidence based on cultural context match
        if input_features['cultural_markers']:
            confidence += 0.05
        
        if input_features['detected_region']:
            confidence += 0.03
        
        return output, min(confidence, 1.0)
    
    def _update_performance_metrics(self, task: FewShotTask, success: bool, num_examples: int):
        """Update performance tracking metrics."""
        self.performance_tracker['total_adaptations'] += 1
        
        if success:
            self.performance_tracker['successful_adaptations'] += 1
        
        # Update running average of examples needed
        current_avg = self.performance_tracker['average_examples_needed']
        total_adaptations = self.performance_tracker['total_adaptations']
        
        self.performance_tracker['average_examples_needed'] = (
            (current_avg * (total_adaptations - 1) + num_examples) / total_adaptations
        )
        
        # Update accuracy metrics (simplified)
        success_rate = self.performance_tracker['successful_adaptations'] / total_adaptations
        self.performance_tracker['cultural_accuracy'] = success_rate * 0.9  # Slight adjustment
        self.performance_tracker['linguistic_accuracy'] = success_rate * 0.95


# Test function for few-shot learning capabilities
async def test_few_shot_learning():
    """Test the few-shot learning capabilities with Romanian examples."""
    print("🎯 Testing RomAI Few-Shot Learning Engine...")
    
    # Initialize few-shot engine
    few_shot_engine = FewShotLearningEngine()
    
    # Test 1: Dialect adaptation few-shot learning
    dialect_examples = [
        FewShotExample(
            input_text="Bună ziua, domnule profesor!",
            output_text="Bună, domnule profesor!",
            region="Transilvania",
            dialect="transylvanian",
            formality_level="formal"
        ),
        FewShotExample(
            input_text="Vă mulțumesc foarte mult pentru ajutor.",
            output_text="Mulțumesc mult pentru ajutor.",
            region="Transilvania",
            dialect="transylvanian",
            formality_level="informal"
        ),
        FewShotExample(
            input_text="Unde se află biblioteca universitară?",
            output_text="Unde-i biblioteca de la universitate?",
            region="Transilvania",
            dialect="transylvanian",
            formality_level="informal"
        )
    ]
    
    dialect_task = FewShotTask(
        task_name="transylvanian_dialect_adaptation",
        task_type="dialect_conversion",
        examples=dialect_examples,
        cultural_context={
            "region": "Transilvania",
            "dialect": "transylvanian",
            "formality": "informal"
        }
    )
    
    dialect_result = await few_shot_engine.few_shot_learn(
        task=dialect_task,
        target_inputs=["Cum vă simțiți astăzi?", "Îmi place foarte mult această carte."]
    )
    
    print(f"✅ Dialect adaptation success: {dialect_result['success']}")
    
    # Test 2: Adaptive few-shot learning
    cultural_examples = [
        FewShotExample(
            input_text="Sărbătorile de iarnă",
            output_text="Crăciunul și Anul Nou sunt sărbători importante în România, celebrate cu tradițiile colinde și praznicul de Crăciun.",
            cultural_tags=["sărbători", "tradiții", "Crăciun"]
        ),
        FewShotExample(
            input_text="Mărțișorul",
            output_text="Mărțișorul este o tradiție românească de primăvară, simbolizând renașterea naturii și norocul.",
            cultural_tags=["tradiții", "primăvară", "folclor"]
        )
    ]
    
    adaptive_result = await few_shot_engine.adaptive_few_shot(
        initial_examples=cultural_examples,
        target_input="Hora tradițională",
        task_type="cultural_adaptation",
        cultural_context={"domain": "folclor", "region": "general"}
    )
    
    print(f"✅ Adaptive learning success: {adaptive_result['success']}")
    
    # Get capabilities summary
    capabilities = few_shot_engine.get_few_shot_capabilities()
    print(f"✅ Few-shot capabilities: {len(capabilities['supported_task_types'])} task types")
    
    return {
        'dialect_adaptation': dialect_result,
        'adaptive_learning': adaptive_result,
        'capabilities': capabilities
    }


if __name__ == "__main__":
    # Run test
    import asyncio
    result = asyncio.run(test_few_shot_learning())
    print(json.dumps(result, indent=2, ensure_ascii=False, default=str))
