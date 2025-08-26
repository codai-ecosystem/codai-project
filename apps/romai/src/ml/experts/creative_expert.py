"""
Creative Expert Module

Advanced creative reasoning and content generation expert for the RUAGA architecture.
Specializes in artistic creation, storytelling, design thinking, innovative problem-solving,
and creative content generation across multiple domains and formats.

Key Capabilities:
- Creative writing and storytelling
- Poetry and literary composition 
- Design thinking and innovation
- Artistic concept generation
- Creative problem-solving approaches
- Content adaptation and style transfer
- Multi-format creative output
"""

import re
import time
import random
import logging
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass
from enum import Enum
import torch
import torch.nn as nn
import json


logger = logging.getLogger(__name__)


class CreativeType(Enum):
    """Types of creative content."""
    STORYTELLING = "storytelling"
    POETRY = "poetry"
    DIALOGUE = "dialogue"
    DESIGN_CONCEPT = "design_concept"
    INNOVATION = "innovation"
    PROBLEM_SOLVING = "problem_solving"
    ARTISTIC_DESCRIPTION = "artistic_description"
    MARKETING_CONTENT = "marketing_content"
    EDUCATIONAL_CONTENT = "educational_content"
    ENTERTAINMENT = "entertainment"


class CreativeStyle(Enum):
    """Creative styles and approaches."""
    NARRATIVE = "narrative"
    DESCRIPTIVE = "descriptive"
    PERSUASIVE = "persuasive"
    INFORMATIVE = "informative"
    ENTERTAINING = "entertaining"
    INSPIRATIONAL = "inspirational"
    TECHNICAL = "technical"
    CONVERSATIONAL = "conversational"
    FORMAL = "formal"
    CASUAL = "casual"


class CreativeTone(Enum):
    """Creative tones and moods."""
    PROFESSIONAL = "professional"
    FRIENDLY = "friendly"
    HUMOROUS = "humorous"
    SERIOUS = "serious"
    OPTIMISTIC = "optimistic"
    DRAMATIC = "dramatic"
    MYSTERIOUS = "mysterious"
    ROMANTIC = "romantic"
    ADVENTUROUS = "adventurous"
    EDUCATIONAL = "educational"


class CreativeFormat(Enum):
    """Output formats for creative content."""
    PROSE = "prose"
    VERSE = "verse"
    SCRIPT = "script"
    OUTLINE = "outline"
    LIST = "list"
    DIALOGUE = "dialogue"
    DESCRIPTION = "description"
    CONCEPT = "concept"
    STORY = "story"
    ARTICLE = "article"


@dataclass
class CreativeRequest:
    """Creative task request."""
    prompt: str
    creative_type: CreativeType
    style: CreativeStyle = CreativeStyle.NARRATIVE
    tone: CreativeTone = CreativeTone.FRIENDLY
    format: CreativeFormat = CreativeFormat.PROSE
    length_target: str = "medium"  # short, medium, long, custom
    target_audience: str = "general"
    constraints: List[str] = None
    context: Dict[str, Any] = None
    inspiration_sources: List[str] = None


@dataclass
class CreativeAnalysis:
    """Analysis of creative content."""
    creativity_score: float
    originality_score: float
    coherence_score: float
    engagement_score: float
    technical_quality: float
    style_consistency: float
    tone_alignment: float
    strengths: List[str]
    improvements: List[str]
    metrics: Dict[str, Any]


@dataclass
class CreativeResponse:
    """Creative expert response."""
    success: bool
    content: str
    creative_type: CreativeType
    execution_time: float
    confidence: float
    analysis: Optional[CreativeAnalysis] = None
    alternatives: List[str] = None
    inspiration_used: List[str] = None
    style_notes: str = None


class CreativePatternProcessor(nn.Module):
    """Neural network for creative pattern recognition and generation."""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__()
        
        self.hidden_size = config.get('hidden_size', 512)
        self.num_layers = config.get('num_layers', 6)  # More layers for creativity
        self.vocab_size = config.get('vocab_size', 50000)
        
        # Token embedding for creative content
        self.token_embedding = nn.Embedding(self.vocab_size, self.hidden_size)
        
        # Positional encoding for sequence understanding
        # RomAI General Expert - Authentic Neural Inference
                try:
                    # Route to appropriate expert based on input analysis
                    expert_input = self._prepare_expert_input(input_data)

                    # Automatic expert selection
                    selected_expert = self.model.router.select_optimal_expert(expert_input)

                    # Process with selected expert
                    with torch.no_grad():
                        expert_outputs = self.model.route_to_expert(
                            expert_input,
                            expert_type=selected_expert,
                            use_mla_attention=True
                        )

                        # Generate response
                        response = self.model.generate_response(expert_outputs)

                        return {
                            "response": response["response"],
                            "reasoning": response["reasoning"],
                            "confidence": response["confidence"],
                            "expert_used": selected_expert,
                            "method": "neural_general_reasoning",
                            "quality_score": response["quality_score"]
                        }

                except Exception as e:
                    logger.error(f"General expert error: {e}")
                    # Ultimate fallback
                    return {"error": f"Neural inference failed: {e}", "fallback": True}
        
        # Transformer layers for creative understanding
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=self.hidden_size,
            nhead=8,
            dim_feedforward=self.hidden_size * 4,
            dropout=0.1,
            batch_first=True
        )
        self.transformer_encoder = nn.TransformerEncoder(
            encoder_layer, 
            num_layers=self.num_layers
        )
        
        # Creative analysis outputs
        self.creativity_predictor = nn.Linear(self.hidden_size, 1)
        self.originality_predictor = nn.Linear(self.hidden_size, 1)
        self.coherence_predictor = nn.Linear(self.hidden_size, 1)
        self.engagement_predictor = nn.Linear(self.hidden_size, 1)
        
        # Style and tone classifiers
        self.style_classifier = nn.Linear(self.hidden_size, len(CreativeStyle))
        self.tone_classifier = nn.Linear(self.hidden_size, len(CreativeTone))
        
    def forward(self, content_tokens: torch.Tensor) -> Dict[str, torch.Tensor]:
        """Forward pass for creative analysis."""
        
        seq_len = content_tokens.size(1)
        
        # Embed tokens
        embedded = self.token_embedding(content_tokens)
        
        # Add positional encoding
        embedded += self.positional_encoding[:seq_len].unsqueeze(0)
        
        # Process with transformer
        encoded = self.transformer_encoder(embedded)
        
        # Global average pooling
        pooled = encoded.mean(dim=1)
        
        # Predictions
        creativity = torch.sigmoid(self.creativity_predictor(pooled))
        originality = torch.sigmoid(self.originality_predictor(pooled))
        coherence = torch.sigmoid(self.coherence_predictor(pooled))
        engagement = torch.sigmoid(self.engagement_predictor(pooled))
        
        style_logits = self.style_classifier(pooled)
        tone_logits = self.tone_classifier(pooled)
        
        return {
            'creativity_score': creativity,
            'originality_score': originality,
            'coherence_score': coherence,
            'engagement_score': engagement,
            'style_logits': style_logits,
            'tone_logits': tone_logits,
            'features': pooled
        }


class StorytellingEngine:
    """Engine for creative storytelling and narrative generation."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Story structures and patterns
        self.story_structures = {
            'three_act': ['setup', 'confrontation', 'resolution'],
            'hero_journey': ['ordinary_world', 'call_to_adventure', 'refusal', 'mentor', 
                           'crossing_threshold', 'tests', 'ordeal', 'reward', 'return'],
            'problem_solution': ['problem_introduction', 'complications', 'solution', 'outcome'],
            'mystery': ['setup', 'investigation', 'clues', 'revelation', 'conclusion'],
            'romance': ['meeting', 'attraction', 'obstacle', 'separation', 'reunion']
        }
        
        # Character archetypes
        self.character_archetypes = [
            'hero', 'mentor', 'threshold_guardian', 'herald', 'shapeshifter',
            'shadow', 'ally', 'trickster', 'innocent', 'explorer', 'sage', 
            'creator', 'ruler', 'caregiver', 'everyman', 'lover', 'jester'
        ]
        
        # Setting types
        self.setting_types = [
            'urban_modern', 'rural_countryside', 'fantasy_realm', 'sci_fi_future',
            'historical_period', 'post_apocalyptic', 'underwater', 'space',
            'magical_forest', 'corporate_office', 'school', 'hospital',
            'small_town', 'big_city', 'another_dimension'
        ]
        
    def generate_story(self, prompt: str, style: CreativeStyle, tone: CreativeTone, 
                      length: str) -> Dict[str, Any]:
        """Generate a complete story based on prompt and parameters."""
        
        # Analyze prompt for story elements
        story_elements = self._analyze_story_prompt(prompt)
        
        # Select appropriate story structure
        structure = self._select_story_structure(story_elements)
        
        # Generate story outline
        outline = self._create_story_outline(story_elements, structure)
        
        # Write the story
        story_content = self._write_story_from_outline(outline, style, tone, length)
        
        return {
            'story': story_content,
            'outline': outline,
            'structure_used': structure,
            'elements_identified': story_elements,
            'word_count': len(story_content.split()),
            'estimated_reading_time': f"{len(story_content.split()) // 200 + 1} minutes"
        }
    
    def _analyze_story_prompt(self, prompt: str) -> Dict[str, Any]:
        """Analyze the story prompt to identify key elements."""
        
        elements = {
            'characters': [],
            'setting': None,
            'conflict': None,
            'theme': None,
            'genre': 'general',
            'mood': 'neutral'
        }
        
        prompt_lower = prompt.lower()
        
        # Detect characters (names, pronouns, character types)
        character_indicators = ['person', 'man', 'woman', 'child', 'hero', 'villain', 'protagonist']
        for indicator in character_indicators:
            if indicator in prompt_lower:
                elements['characters'].append(indicator)
        
        # Detect setting
        for setting_type in self.setting_types:
            setting_words = setting_type.replace('_', ' ').split()
            if any(word in prompt_lower for word in setting_words):
                elements['setting'] = setting_type
                break
        
        # Detect conflict types
        conflict_words = ['conflict', 'problem', 'challenge', 'struggle', 'fight', 'battle', 'overcome']
        if any(word in prompt_lower for word in conflict_words):
            elements['conflict'] = 'present'
        
        # Detect genre
        genre_keywords = {
            'fantasy': ['magic', 'dragon', 'wizard', 'fantasy', 'enchanted'],
            'sci_fi': ['space', 'robot', 'future', 'technology', 'alien'],
            'mystery': ['mystery', 'detective', 'clue', 'solve', 'investigate'],
            'romance': ['love', 'romance', 'relationship', 'heart', 'dating'],
            'adventure': ['adventure', 'journey', 'quest', 'explore', 'travel'],
            'horror': ['scary', 'horror', 'ghost', 'haunted', 'nightmare']
        }
        
        for genre, keywords in genre_keywords.items():
            if any(keyword in prompt_lower for keyword in keywords):
                elements['genre'] = genre
                break
        
        return elements
    
    def _select_story_structure(self, elements: Dict[str, Any]) -> str:
        """Select appropriate story structure based on elements."""
        
        genre = elements.get('genre', 'general')
        
        if genre == 'mystery':
            return 'mystery'
        elif genre == 'romance':
            return 'romance'
        elif elements.get('conflict') == 'present':
            return 'problem_solution'
        elif genre in ['fantasy', 'adventure']:
            return 'hero_journey'
        else:
            return 'three_act'
    
    def _create_story_outline(self, elements: Dict[str, Any], structure: str) -> Dict[str, Any]:
        """Create detailed story outline."""
        
        structure_parts = self.story_structures.get(structure, ['beginning', 'middle', 'end'])
        
        outline = {
            'structure': structure,
            'parts': {},
            'characters': elements.get('characters', ['main character']),
            'setting': elements.get('setting', 'undefined'),
            'theme': elements.get('theme', 'personal growth')
        }
        
        # Create outline for each part
        for i, part in enumerate(structure_parts):
            outline['parts'][part] = {
                'description': f'Part {i+1}: {part.replace("_", " ").title()}',
                'key_events': [f'Key event for {part}'],
                'character_development': f'Character grows during {part}',
                'conflict_progression': f'Conflict evolves in {part}'
            }
        
        return outline
    
    def _write_story_from_outline(self, outline: Dict[str, Any], style: CreativeStyle, 
                                 tone: CreativeTone, length: str) -> str:
        """Write the complete story from outline."""
        
        # Determine target word count
        word_targets = {
            'short': 200,
            'medium': 500,
            'long': 1000,
            'custom': 500
        }
        
        target_words = word_targets.get(length, 500)
        words_per_part = target_words // len(outline['parts'])
        
        story_parts = []
        
        for part_name, part_details in outline['parts'].items():
            part_content = self._write_story_part(
                part_name, part_details, style, tone, words_per_part
            )
            story_parts.append(part_content)
        
        return '\n\n'.join(story_parts)
    
    def _write_story_part(self, part_name: str, part_details: Dict[str, Any], 
                         style: CreativeStyle, tone: CreativeTone, target_words: int) -> str:
        """Write a specific part of the story."""
        
        # This is a simplified story generation
        # In practice, this would use more sophisticated language models
        
        part_templates = {
            'setup': "The story begins with {character} in {setting}. {description}",
            'confrontation': "Suddenly, {character} faces {conflict}. {action}",
            'resolution': "Finally, {character} {resolution}. {conclusion}",
            'ordinary_world': "{character} lived a normal life in {setting}. {daily_life}",
            'call_to_adventure': "One day, {character} discovered {opportunity}. {decision}",
            'problem_introduction': "The problem began when {event}. {consequences}",
            'investigation': "{character} began to investigate {mystery}. {clues}",
            'meeting': "{character1} met {character2} {where}. {first_impression}"
        }
        
        template = part_templates.get(part_name, "{character} {action} in {setting}. {outcome}")
        
        # Fill in template with appropriate content based on tone and style
        content = self._fill_story_template(template, style, tone, target_words)
        
        return content
    
    def _fill_story_template(self, template: str, style: CreativeStyle, 
                           tone: CreativeTone, target_words: int) -> str:
        """Fill story template with appropriate content."""
        
        # Sample content based on tone and style
        sample_content = {
            'character': 'Alex',
            'setting': 'a quiet neighborhood',
            'action': 'walked thoughtfully',
            'description': 'The morning sun cast long shadows across the street.',
            'conflict': 'an unexpected challenge',
            'resolution': 'found a creative solution',
            'conclusion': 'The experience changed everything.',
            'daily_life': 'Each day followed the same comfortable routine.',
            'opportunity': 'a mysterious letter',
            'decision': 'The choice would define the future.',
            'event': 'the lights went out',
            'consequences': 'Everything changed in that moment.',
            'mystery': 'the disappearing messages',
            'clues': 'Each piece of evidence revealed more questions.',
            'character1': 'Sarah',
            'character2': 'a mysterious stranger',
            'where': 'at the old coffee shop',
            'first_impression': 'There was something intriguing about the encounter.',
            'outcome': 'The journey had just begun.'
        }
        
        # Apply tone adjustments
        if tone == CreativeTone.HUMOROUS:
            sample_content['description'] += ' It was almost comically perfect.'
            sample_content['action'] = 'stumbled cheerfully'
        elif tone == CreativeTone.DRAMATIC:
            sample_content['description'] += ' The atmosphere was thick with tension.'
            sample_content['action'] = 'strode purposefully'
        elif tone == CreativeTone.MYSTERIOUS:
            sample_content['description'] += ' Something felt different today.'
            sample_content['action'] = 'moved cautiously'
        
        # Fill template
        filled_content = template.format(**sample_content)
        
        # Expand to reach target word count
        if len(filled_content.split()) < target_words:
            expansion = self._expand_content(filled_content, style, tone, target_words)
            filled_content = expansion
        
        return filled_content
    
    def _expand_content(self, content: str, style: CreativeStyle, tone: CreativeTone, 
                       target_words: int) -> str:
        """Expand content to reach target word count."""
        
        current_words = len(content.split())
        if current_words >= target_words:
            return content
        
        expansions = {
            CreativeStyle.DESCRIPTIVE: [
                " The details were remarkable, each element carefully crafted.",
                " Colors and textures created a vivid tapestry of experience.",
                " Every sense was engaged in the unfolding moment."
            ],
            CreativeStyle.NARRATIVE: [
                " The story continued to unfold with unexpected twists.",
                " Each moment built upon the last, creating momentum.",
                " Time seemed to move differently in this space."
            ],
            CreativeStyle.CONVERSATIONAL: [
                " You know how these things go, right?",
                " It's funny how life works out sometimes.",
                " Anyone could relate to this kind of situation."
            ]
        }
        
        style_expansions = expansions.get(style, [
            " The experience was meaningful and transformative.",
            " Details emerged that would prove important later.",
            " This moment would be remembered for years to come."
        ])
        
        expanded_content = content
        while len(expanded_content.split()) < target_words and style_expansions:
            expansion = random.choice(style_expansions)
            expanded_content += expansion
            
        return expanded_content


class PoetryEngine:
    """Engine for poetry generation and analysis."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Poetry forms and structures
        self.poetry_forms = {
            'haiku': {'lines': 3, 'syllables': [5, 7, 5], 'style': 'nature_focused'},
            'sonnet': {'lines': 14, 'rhyme_scheme': 'ABAB CDCD EFEF GG', 'style': 'formal'},
            'free_verse': {'lines': 'variable', 'structure': 'flexible', 'style': 'modern'},
            'limerick': {'lines': 5, 'rhyme_scheme': 'AABBA', 'style': 'humorous'},
            'ballad': {'lines': 'quatrains', 'rhyme_scheme': 'ABAB', 'style': 'narrative'}
        }
        
        # Poetic devices
        self.poetic_devices = [
            'metaphor', 'simile', 'alliteration', 'assonance', 'imagery',
            'personification', 'hyperbole', 'symbolism', 'rhythm', 'repetition'
        ]
    
    def generate_poem(self, prompt: str, form: str, tone: CreativeTone) -> Dict[str, Any]:
        """Generate poetry based on prompt and form."""
        
        if form not in self.poetry_forms:
            form = 'free_verse'
        
        form_spec = self.poetry_forms[form]
        
        # Generate poem content
        poem_lines = self._generate_poem_lines(prompt, form_spec, tone)
        
        # Format poem
        poem_text = self._format_poem(poem_lines, form_spec)
        
        # Analyze poetic elements
        analysis = self._analyze_poem(poem_text, form)
        
        return {
            'poem': poem_text,
            'form': form,
            'analysis': analysis,
            'devices_used': self._identify_poetic_devices(poem_text),
            'line_count': len(poem_lines)
        }
    
    def _generate_poem_lines(self, prompt: str, form_spec: Dict[str, Any], 
                           tone: CreativeTone) -> List[str]:
        """Generate individual lines of poetry."""
        
        # Extract themes and imagery from prompt
        themes = self._extract_themes(prompt)
        
        # Determine number of lines
        if form_spec.get('lines') == 3:  # Haiku
            lines = [
                f"{themes[0]} in morning light",  # 5 syllables
                f"Gentle {themes[1]} whispers soft",    # 7 syllables  
                f"Peace fills the heart"              # 5 syllables
            ]
        elif form_spec.get('lines') == 5:  # Limerick
            lines = [
                f"There once was a {themes[0]} so bright",
                f"Who danced in the pale moonlight",
                f"With joy and with glee",
                f"As happy as can be",
                f"A truly magnificent sight"
            ]
        else:  # Free verse or other
            lines = [
                f"{themes[0]} speaks to the soul",
                f"In whispered {themes[1]} of hope",
                f"Where {themes[0]} meets tomorrow",
                f"And dreams take their shape",
                f"In the quiet moments",
                f"Between heartbeats"
            ]
        
        return lines
    
    def _extract_themes(self, prompt: str) -> List[str]:
        """Extract thematic elements from prompt."""
        
        # Common poetic themes
        theme_keywords = {
            'nature': ['tree', 'flower', 'river', 'mountain', 'sky', 'ocean'],
            'emotion': ['love', 'joy', 'sorrow', 'hope', 'peace', 'longing'],
            'time': ['morning', 'evening', 'season', 'year', 'moment', 'eternity'],
            'beauty': ['beautiful', 'elegant', 'graceful', 'stunning', 'lovely'],
            'journey': ['path', 'road', 'travel', 'journey', 'quest', 'adventure']
        }
        
        identified_themes = []
        prompt_lower = prompt.lower()
        
        for theme, keywords in theme_keywords.items():
            if any(keyword in prompt_lower for keyword in keywords):
                identified_themes.append(theme)
        
        # Default themes if none identified
        if not identified_themes:
            identified_themes = ['beauty', 'hope']
        
        return identified_themes[:3]  # Limit to 3 themes
    
    def _format_poem(self, lines: List[str], form_spec: Dict[str, Any]) -> str:
        """Format poem lines according to form specifications."""
        
        return '\n'.join(lines)
    
    def _analyze_poem(self, poem_text: str, form: str) -> Dict[str, Any]:
        """Analyze poetic elements and quality."""
        
        lines = poem_text.split('\n')
        
        analysis = {
            'line_count': len(lines),
            'average_line_length': sum(len(line.split()) for line in lines) / len(lines),
            'form_adherence': self._check_form_adherence(poem_text, form),
            'imagery_strength': self._assess_imagery(poem_text),
            'emotional_impact': self._assess_emotional_impact(poem_text),
            'technical_quality': 0.8  # Placeholder
        }
        
        return analysis
    
    def _check_form_adherence(self, poem_text: str, form: str) -> float:
        """Check how well the poem adheres to its form."""
        
        if form == 'haiku':
            lines = poem_text.split('\n')
            if len(lines) == 3:
                return 0.9  # Good adherence
        elif form == 'limerick':
            lines = poem_text.split('\n')
            if len(lines) == 5:
                return 0.8  # Good adherence
        
        return 0.7  # Default adherence score
    
    def _assess_imagery(self, poem_text: str) -> float:
        """Assess the strength of imagery in the poem."""
        
        imagery_words = [
            'bright', 'dark', 'whisper', 'dance', 'shimmer', 'glow',
            'shadow', 'light', 'soft', 'gentle', 'warm', 'cool'
        ]
        
        poem_lower = poem_text.lower()
        imagery_count = sum(1 for word in imagery_words if word in poem_lower)
        
        return min(imagery_count / 5, 1.0)  # Normalize to 0-1
    
    def _assess_emotional_impact(self, poem_text: str) -> float:
        """Assess the emotional impact of the poem."""
        
        emotional_words = [
            'love', 'hope', 'joy', 'peace', 'sorrow', 'longing',
            'heart', 'soul', 'dream', 'beauty', 'wonder', 'grace'
        ]
        
        poem_lower = poem_text.lower()
        emotion_count = sum(1 for word in emotional_words if word in poem_lower)
        
        return min(emotion_count / 3, 1.0)  # Normalize to 0-1
    
    def _identify_poetic_devices(self, poem_text: str) -> List[str]:
        """Identify poetic devices used in the poem."""
        
        devices_found = []
        
        # Simple device detection
        if 'like' in poem_text or 'as' in poem_text:
            devices_found.append('simile')
        
        # Check for repetition
        words = poem_text.lower().split()
        word_counts = {}
        for word in words:
            word_counts[word] = word_counts.get(word, 0) + 1
        
        if any(count > 2 for count in word_counts.values()):
            devices_found.append('repetition')
        
        # Check for alliteration (simplified)
        first_letters = [word[0].lower() for word in words if word]
        letter_counts = {}
        for letter in first_letters:
            letter_counts[letter] = letter_counts.get(letter, 0) + 1
        
        if any(count > 2 for count in letter_counts.values()):
            devices_found.append('alliteration')
        
        if not devices_found:
            devices_found.append('imagery')  # Default
        
        return devices_found


class DesignThinkingEngine:
    """Engine for design thinking and innovation."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Design thinking process stages
        self.design_process = [
            'empathize', 'define', 'ideate', 'prototype', 'test'
        ]
        
        # Innovation techniques
        self.innovation_techniques = [
            'brainstorming', 'mind_mapping', 'scamper', 'six_thinking_hats',
            'assumption_challenging', 'random_word_technique', 'reverse_brainstorming'
        ]
    
    def generate_design_concept(self, problem: str, constraints: List[str]) -> Dict[str, Any]:
        """Generate design concept using design thinking methodology."""
        
        # Empathize: Understand the problem
        user_needs = self._analyze_user_needs(problem)
        
        # Define: Define the problem statement
        problem_statement = self._create_problem_statement(problem, user_needs)
        
        # Ideate: Generate ideas
        ideas = self._generate_ideas(problem_statement, constraints)
        
        # Select best concept
        best_concept = self._select_best_concept(ideas)
        
        # Prototype: Create concept description
        concept_description = self._describe_concept(best_concept)
        
        return {
            'concept': concept_description,
            'problem_statement': problem_statement,
            'user_needs': user_needs,
            'alternative_ideas': ideas[:3],  # Top 3 alternatives
            'design_rationale': self._create_design_rationale(best_concept),
            'next_steps': self._suggest_next_steps(best_concept)
        }
    
    def _analyze_user_needs(self, problem: str) -> List[str]:
        """Analyze user needs from problem description."""
        
        # Extract potential user needs
        needs_keywords = {
            'efficiency': ['faster', 'quicker', 'efficient', 'save time'],
            'convenience': ['easier', 'simple', 'convenient', 'accessible'],
            'cost_effective': ['cheaper', 'affordable', 'cost', 'budget'],
            'quality': ['better', 'quality', 'reliable', 'durable'],
            'user_friendly': ['user-friendly', 'intuitive', 'easy to use']
        }
        
        identified_needs = []
        problem_lower = problem.lower()
        
        for need, keywords in needs_keywords.items():
            if any(keyword in problem_lower for keyword in keywords):
                identified_needs.append(need)
        
        if not identified_needs:
            identified_needs = ['efficiency', 'user_friendly']  # Default needs
        
        return identified_needs
    
    def _create_problem_statement(self, problem: str, user_needs: List[str]) -> str:
        """Create a clear problem statement."""
        
        needs_text = ', '.join(user_needs)
        return f"How might we address: {problem} while ensuring {needs_text}?"
    
    def _generate_ideas(self, problem_statement: str, constraints: List[str]) -> List[Dict[str, Any]]:
        """Generate multiple solution ideas."""
        
        ideas = [
            {
                'title': 'Digital Solution',
                'description': 'A technology-based approach using digital tools and platforms',
                'feasibility': 0.8,
                'innovation_level': 0.7
            },
            {
                'title': 'Process Optimization',
                'description': 'Streamlining existing processes for better efficiency',
                'feasibility': 0.9,
                'innovation_level': 0.5
            },
            {
                'title': 'Collaborative Approach',
                'description': 'Involving multiple stakeholders in a coordinated solution',
                'feasibility': 0.7,
                'innovation_level': 0.6
            },
            {
                'title': 'Modular System',
                'description': 'Breaking the solution into adaptable, interchangeable components',
                'feasibility': 0.6,
                'innovation_level': 0.8
            }
        ]
        
        return ideas
    
    def _select_best_concept(self, ideas: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Select the best concept based on feasibility and innovation."""
        
        # Score each idea
        for idea in ideas:
            idea['score'] = (idea['feasibility'] * 0.6 + idea['innovation_level'] * 0.4)
        
        # Sort by score and return best
        return max(ideas, key=lambda x: x['score'])
    
    def _describe_concept(self, concept: Dict[str, Any]) -> str:
        """Create detailed concept description."""
        
        return f"""
**{concept['title']}**

{concept['description']}

**Key Features:**
- Innovative approach with {concept['innovation_level']:.0%} novelty
- High feasibility at {concept['feasibility']:.0%} implementation probability
- Addresses core user needs effectively
- Scalable and adaptable design

**Implementation Approach:**
The solution focuses on user-centered design principles, ensuring that every aspect serves the end user's needs while maintaining technical feasibility and business viability.
""".strip()
    
    def _create_design_rationale(self, concept: Dict[str, Any]) -> str:
        """Create design rationale explanation."""
        
        return f"This concept was selected because it balances innovation ({concept['innovation_level']:.0%}) with practical feasibility ({concept['feasibility']:.0%}). The {concept['title'].lower()} approach provides a sustainable solution that can be implemented effectively while meeting user needs."
    
    def _suggest_next_steps(self, concept: Dict[str, Any]) -> List[str]:
        """Suggest next steps for concept development."""
        
        return [
            "Create detailed user personas and journey maps",
            "Develop low-fidelity prototypes for testing",
            "Conduct user interviews and feedback sessions",
            "Refine concept based on user insights", 
            "Create implementation timeline and resource plan"
        ]


class CreativeReasoningExpert:
    """
    Advanced creative reasoning expert with comprehensive capabilities
    for artistic creation, storytelling, design thinking, and innovation.
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Initialize engines
        self.pattern_processor = CreativePatternProcessor(config)
        self.storytelling_engine = StorytellingEngine()
        self.poetry_engine = PoetryEngine()
        self.design_thinking_engine = DesignThinkingEngine()
        
        # Performance targets
        self.targets = {
            'creativity_score': 0.85,      # >85% creativity in outputs
            'engagement_rate': 0.80,       # >80% user engagement
            'originality_score': 0.75,     # >75% originality  
            'content_quality': 0.88        # >88% content quality
        }
        
        # Metrics tracking
        self.metrics = {
            'requests_processed': 0,
            'successful_creations': 0,
            'high_creativity_outputs': 0,
            'user_satisfaction_scores': [],
            'average_response_time': 0.0
        }
        
        self.logger.info(f"Creative reasoning expert initialized with targets: {self.targets}")
    
    def process_creative_request(self, request: CreativeRequest) -> CreativeResponse:
        """
        Process comprehensive creative reasoning request.
        
        Args:
            request: Creative task request
            
        Returns:
            CreativeResponse with creative content and analysis
        """
        start_time = time.time()
        
        try:
            if request.creative_type == CreativeType.STORYTELLING:
                result = self._process_storytelling(request)
            elif request.creative_type == CreativeType.POETRY:
                result = self._process_poetry(request)
            elif request.creative_type == CreativeType.DESIGN_CONCEPT:
                result = self._process_design_concept(request)
            elif request.creative_type == CreativeType.INNOVATION:
                result = self._process_innovation(request)
            elif request.creative_type == CreativeType.PROBLEM_SOLVING:
                result = self._process_creative_problem_solving(request)
            else:
                result = self._process_general_creative(request)
            
            execution_time = time.time() - start_time
            
            # Analyze creative content
            analysis = self._analyze_creative_content(result['content'])
            
            # Update metrics
            self._update_metrics(request.creative_type, True, execution_time, analysis)
            
            return CreativeResponse(
                success=True,
                content=result['content'],
                creative_type=request.creative_type,
                execution_time=execution_time,
                confidence=result.get('confidence', 0.8),
                analysis=analysis,
                alternatives=result.get('alternatives', []),
                inspiration_used=result.get('inspiration_sources', []),
                style_notes=result.get('style_notes', '')
            )
            
        except Exception as e:
            execution_time = time.time() - start_time
            self.logger.error(f"Creative reasoning failed: {str(e)}")
            
            # Update metrics
            self._update_metrics(request.creative_type, False, execution_time, None)
            
            return CreativeResponse(
                success=False,
                content=f"Creative processing failed: {str(e)}",
                creative_type=request.creative_type,
                execution_time=execution_time,
                confidence=0.1
            )
    
    def _process_storytelling(self, request: CreativeRequest) -> Dict[str, Any]:
        """Process storytelling requests."""
        
        story_result = self.storytelling_engine.generate_story(
            request.prompt, request.style, request.tone, request.length_target
        )
        
        return {
            'content': story_result['story'],
            'confidence': 0.85,
            'alternatives': [story_result['outline']],
            'style_notes': f"Structure: {story_result['structure_used']}, Word count: {story_result['word_count']}",
            'inspiration_sources': ['classic narrative structures', 'character archetypes']
        }
    
    def _process_poetry(self, request: CreativeRequest) -> Dict[str, Any]:
        """Process poetry creation requests."""
        
        # Determine poetry form from format or default to free verse
        poetry_form = 'free_verse'
        if request.format == CreativeFormat.VERSE:
            # Could analyze prompt for specific form requests
            if 'haiku' in request.prompt.lower():
                poetry_form = 'haiku'
            elif 'sonnet' in request.prompt.lower():
                poetry_form = 'sonnet'
        
        poetry_result = self.poetry_engine.generate_poem(
            request.prompt, poetry_form, request.tone
        )
        
        return {
            'content': poetry_result['poem'],
            'confidence': 0.80,
            'alternatives': [],
            'style_notes': f"Form: {poetry_result['form']}, Devices: {', '.join(poetry_result['devices_used'])}",
            'inspiration_sources': ['poetic traditions', 'natural imagery']
        }
    
    def _process_design_concept(self, request: CreativeRequest) -> Dict[str, Any]:
        """Process design concept creation."""
        
        constraints = request.constraints or []
        
        design_result = self.design_thinking_engine.generate_design_concept(
            request.prompt, constraints
        )
        
        return {
            'content': design_result['concept'],
            'confidence': 0.82,
            'alternatives': [idea['title'] + ': ' + idea['description'] for idea in design_result['alternative_ideas']],
            'style_notes': f"Design thinking approach: {design_result['design_rationale']}",
            'inspiration_sources': ['design thinking methodology', 'user-centered design']
        }
    
    def _process_innovation(self, request: CreativeRequest) -> Dict[str, Any]:
        """Process innovation and ideation requests."""
        
        # Use design thinking for innovation
        innovation_result = self.design_thinking_engine.generate_design_concept(
            request.prompt, request.constraints or []
        )
        
        # Focus on innovative aspects
        innovative_content = f"""
**Innovation Concept: {request.prompt}**

**Revolutionary Approach:**
{innovation_result['concept']}

**Innovation Potential:**
- Addresses unmet market needs
- Leverages emerging technologies
- Creates new value propositions
- Disrupts traditional approaches

**Implementation Strategy:**
{innovation_result['design_rationale']}

**Next Innovation Steps:**
{chr(10).join('- ' + step for step in innovation_result['next_steps'])}
""".strip()
        
        return {
            'content': innovative_content,
            'confidence': 0.78,
            'alternatives': innovation_result['alternative_ideas'],
            'style_notes': 'Innovation-focused approach with disruptive potential',
            'inspiration_sources': ['emerging trends', 'cross-industry insights']
        }
    
    def _process_creative_problem_solving(self, request: CreativeRequest) -> Dict[str, Any]:
        """Process creative problem-solving requests."""
        
        # Generate multiple creative approaches
        approaches = self._generate_creative_approaches(request.prompt)
        
        # Select most promising approach
        best_approach = approaches[0]  # For now, just take first
        
        solution_content = f"""
**Creative Problem-Solving: {request.prompt}**

**Innovative Solution:**
{best_approach['solution']}

**Creative Approach:**
{best_approach['methodology']}

**Implementation Steps:**
{chr(10).join('1. ' + step for step in best_approach['steps'])}

**Expected Outcomes:**
- {best_approach['expected_outcome']}
- Enhanced creative thinking
- Sustainable solution implementation

**Alternative Approaches:**
{chr(10).join('- ' + alt['title'] for alt in approaches[1:3])}
""".strip()
        
        return {
            'content': solution_content,
            'confidence': 0.80,
            'alternatives': [alt['solution'] for alt in approaches[1:3]],
            'style_notes': 'Creative problem-solving methodology applied',
            'inspiration_sources': ['lateral thinking', 'creative problem-solving techniques']
        }
    
    def _process_general_creative(self, request: CreativeRequest) -> Dict[str, Any]:
        """Process general creative requests."""
        
        # Generate creative content based on style and tone
        content = self._generate_creative_content(
            request.prompt, request.style, request.tone, request.format
        )
        
        return {
            'content': content,
            'confidence': 0.75,
            'alternatives': [],
            'style_notes': f"Style: {request.style.value}, Tone: {request.tone.value}",
            'inspiration_sources': ['creative writing techniques', 'artistic expression']
        }
    
    def _generate_creative_approaches(self, problem: str) -> List[Dict[str, Any]]:
        """Generate multiple creative approaches to a problem."""
        
        approaches = [
            {
                'title': 'Reverse Thinking',
                'solution': f'Instead of solving "{problem}" directly, consider what would make it worse, then reverse that approach.',
                'methodology': 'Reverse brainstorming technique',
                'steps': ['Identify what makes the problem worse', 'Reverse each negative factor', 'Implement positive alternatives'],
                'expected_outcome': 'Unexpected solutions through reverse psychology'
            },
            {
                'title': 'Metaphorical Approach',
                'solution': f'Treat "{problem}" like a natural phenomenon and apply biological or physical solutions.',
                'methodology': 'Metaphorical thinking',
                'steps': ['Find natural analogy', 'Study natural solution', 'Adapt to human context'],
                'expected_outcome': 'Bio-inspired innovative solutions'
            },
            {
                'title': 'Systems Thinking',
                'solution': f'View "{problem}" as part of a larger system and address root causes.',
                'methodology': 'Systems analysis and design',
                'steps': ['Map system relationships', 'Identify leverage points', 'Design systemic interventions'],
                'expected_outcome': 'Comprehensive sustainable solutions'
            }
        ]
        
        return approaches
    
    def _generate_creative_content(self, prompt: str, style: CreativeStyle, 
                                  tone: CreativeTone, format: CreativeFormat) -> str:
        """Generate general creative content."""
        
        # Base content generation
        if format == CreativeFormat.LIST:
            content = self._generate_creative_list(prompt, style, tone)
        elif format == CreativeFormat.DIALOGUE:
            content = self._generate_creative_dialogue(prompt, style, tone)
        elif format == CreativeFormat.DESCRIPTION:
            content = self._generate_creative_description(prompt, style, tone)
        else:
            content = self._generate_creative_prose(prompt, style, tone)
        
        return content
    
    def _generate_creative_list(self, prompt: str, style: CreativeStyle, tone: CreativeTone) -> str:
        """Generate creative list format content."""
        
        return f"""**Creative Exploration: {prompt}**

• First creative insight emerges from unexpected connections
• Second perspective challenges conventional thinking
• Third approach combines multiple disciplines
• Fourth dimension adds emotional depth
• Fifth element introduces sustainable solutions
• Sixth pathway explores collaborative possibilities

*Generated with {style.value} style and {tone.value} tone*"""
    
    def _generate_creative_dialogue(self, prompt: str, style: CreativeStyle, tone: CreativeTone) -> str:
        """Generate creative dialogue format content."""
        
        return f"""**Creative Dialogue: {prompt}**

CREATIVE: "What if we approached this completely differently?"

PRACTICAL: "Different how? We need concrete solutions."

CREATIVE: "That's exactly the point. Sometimes the most concrete solutions come from the most abstract thinking."

PRACTICAL: "Give me an example."

CREATIVE: "Well, {prompt.lower()} - what if instead of solving it, we transformed it into an opportunity?"

PRACTICAL: "Now that's interesting. Tell me more..."

*Dialogue style: {style.value} with {tone.value} tone*"""
    
    def _generate_creative_description(self, prompt: str, style: CreativeStyle, tone: CreativeTone) -> str:
        """Generate creative description format content."""
        
        tone_words = {
            CreativeTone.DRAMATIC: "intense and powerful",
            CreativeTone.MYSTERIOUS: "enigmatic and intriguing", 
            CreativeTone.OPTIMISTIC: "bright and hopeful",
            CreativeTone.HUMOROUS: "playful and amusing",
            CreativeTone.ROMANTIC: "beautiful and enchanting"
        }
        
        tone_desc = tone_words.get(tone, "thoughtful and engaging")
        
        return f"""The concept of '{prompt}' unfolds like a {tone_desc} narrative, revealing layers of meaning and possibility. 

Each element connects to create a tapestry of understanding, where traditional boundaries dissolve and new perspectives emerge. The {style.value} approach illuminates hidden aspects, transforming the familiar into something extraordinary.

This creative exploration invites deeper contemplation, challenging assumptions while opening pathways to innovative solutions and fresh insights."""
    
    def _generate_creative_prose(self, prompt: str, style: CreativeStyle, tone: CreativeTone) -> str:
        """Generate creative prose format content."""
        
        return f"""**Creative Expression: {prompt}**

In the realm of creative thinking, '{prompt}' becomes a catalyst for transformation. The {style.value} approach, infused with a {tone.value} sensibility, opens doorways to unexplored possibilities.

Here, conventional wisdom meets innovative thinking, creating a dynamic space where ideas flourish and solutions emerge organically. Each perspective adds richness to the creative process, building towards outcomes that surprise and delight.

The journey of creative exploration continues, inviting participation and collaboration in the ongoing dance of imagination and reality."""
    
    def _analyze_creative_content(self, content: str) -> CreativeAnalysis:
        """Analyze creative content for quality and characteristics."""
        
        # Simplified analysis - in practice would use the neural processor
        word_count = len(content.split())
        sentence_count = content.count('.') + content.count('!') + content.count('?')
        
        # Basic metrics
        creativity_indicators = ['innovative', 'unique', 'original', 'creative', 'imaginative']
        creativity_score = sum(1 for word in creativity_indicators if word in content.lower()) / len(creativity_indicators)
        
        engagement_indicators = ['you', 'we', 'explore', 'discover', 'journey', 'experience']
        engagement_score = sum(1 for word in engagement_indicators if word in content.lower()) / len(engagement_indicators)
        
        return CreativeAnalysis(
            creativity_score=min(0.3 + creativity_score, 1.0),
            originality_score=0.75,  # Default good score
            coherence_score=0.85,    # Default good score
            engagement_score=min(0.4 + engagement_score, 1.0),
            technical_quality=0.80,  # Default good score
            style_consistency=0.85,  # Default good score
            tone_alignment=0.80,     # Default good score
            strengths=[
                'Clear creative vision',
                'Engaging presentation',
                'Coherent structure'
            ],
            improvements=[
                'Could add more specific examples',
                'Consider additional creative techniques',
                'Expand on practical applications'
            ],
            metrics={
                'word_count': word_count,
                'sentence_count': sentence_count,
                'avg_sentence_length': word_count / max(sentence_count, 1)
            }
        )
    
    def _update_metrics(self, creative_type: CreativeType, success: bool, execution_time: float, 
                       analysis: Optional[CreativeAnalysis]):
        """Update performance metrics."""
        self.metrics['requests_processed'] += 1
        
        if success:
            self.metrics['successful_creations'] += 1
            
            if analysis and analysis.creativity_score > 0.8:
                self.metrics['high_creativity_outputs'] += 1
        
        # Update average response time
        current_avg = self.metrics['average_response_time']
        total_requests = self.metrics['requests_processed']
        self.metrics['average_response_time'] = (
            (current_avg * (total_requests - 1) + execution_time) / total_requests
        )
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get comprehensive performance metrics."""
        
        total_requests = self.metrics['requests_processed']
        
        if total_requests == 0:
            return {'message': 'No requests processed yet'}
        
        return {
            'performance_summary': {
                'total_requests': total_requests,
                'success_rate': self.metrics['successful_creations'] / total_requests,
                'high_creativity_rate': self.metrics['high_creativity_outputs'] / total_requests,
                'average_response_time': self.metrics['average_response_time']
            },
            'target_vs_actual': {
                'creativity_target': self.targets['creativity_score'],
                'engagement_target': self.targets['engagement_rate'],
                'originality_target': self.targets['originality_score'],
                'quality_target': self.targets['content_quality']
            },
            'capabilities': {
                'creative_types': [t.value for t in CreativeType],
                'supported_styles': [s.value for s in CreativeStyle],
                'available_tones': [t.value for t in CreativeTone],
                'output_formats': [f.value for f in CreativeFormat]
            }
        }


# Alias for compatibility with the existing codebase
CreativeArtisticExpert = CreativeReasoningExpert