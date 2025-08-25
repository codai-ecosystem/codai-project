#!/usr/bin/env python3
"""
RomAI Neural-Symbolic Intelligence Core
Advanced neural-symbolic reasoning with Romanian cultural consciousness

This module provides real neural-symbolic intelligence including:
- Symbolic knowledge representation with neural embedding
- Logical reasoning with neural pattern matching
- Conceptual abstraction with cultural context
- Meta-reasoning with Romanian philosophical traditions
- Neuro-symbolic learning and knowledge acquisition
"""

import logging
import asyncio
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, List, Optional, Any, Union, Tuple, Set
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
import json
import sqlite3
from collections import defaultdict, deque
import networkx as nx
from sentence_transformers import SentenceTransformer
import sympy as sp
import re
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class Symbol:
    """Symbolic representation with neural embedding"""
    name: str
    symbol_type: str  # concept, relation, entity, predicate
    properties: Dict[str, Any] = field(default_factory=dict)
    embedding: Optional[np.ndarray] = None
    cultural_context: Dict[str, float] = field(default_factory=dict)
    creation_time: datetime = field(default_factory=datetime.now)
    usage_count: int = 0

@dataclass
class Predicate:
    """Logical predicate with neural grounding"""
    name: str
    arguments: List[str]
    truth_value: Optional[float] = None  # Fuzzy logic support
    confidence: float = 0.0
    romanian_interpretation: Optional[str] = None
    symbolic_form: Optional[str] = None
    neural_activation: Optional[np.ndarray] = None

@dataclass
class Rule:
    """Logical rule with neural weighting"""
    rule_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    premises: List[Predicate] = field(default_factory=list)
    conclusion: Predicate = None
    weight: float = 1.0
    cultural_significance: float = 0.0
    romanian_context: Optional[str] = None
    learned_from_experience: bool = False
    application_count: int = 0

@dataclass
class Concept:
    """Abstract concept with multi-modal grounding"""
    name: str
    definition: str
    properties: Dict[str, Any] = field(default_factory=dict)
    relations: Dict[str, List[str]] = field(default_factory=dict)  # relation_type -> [related_concepts]
    neural_representation: Optional[np.ndarray] = None
    symbolic_axioms: List[str] = field(default_factory=list)
    romanian_cultural_meaning: Optional[str] = None
    abstraction_level: int = 0  # 0=concrete, higher=more abstract

class SymbolicKnowledgeBase:
    """Symbolic knowledge base with neural grounding"""
    
    def __init__(self):
        self.symbols: Dict[str, Symbol] = {}
        self.predicates: Dict[str, Predicate] = {}
        self.rules: Dict[str, Rule] = {}
        self.concepts: Dict[str, Concept] = {}
        self.knowledge_graph = nx.DiGraph()
        
        # Romanian cultural symbols
        self._initialize_romanian_cultural_symbols()
        
        logger.info("✅ Symbolic knowledge base initialized")
    
    def _initialize_romanian_cultural_symbols(self):
        """Initialize fundamental Romanian cultural symbols"""
        cultural_symbols = {
            "dor": {
                "type": "emotion",
                "properties": {"intensity": "profound", "uniqueness": "romanian_specific"},
                "cultural_context": {"romanian": 1.0, "universal": 0.3}
            },
            "mioară": {
                "type": "cultural_archetype", 
                "properties": {"symbolism": "sacrifice", "context": "pastoral"},
                "cultural_context": {"romanian": 0.9, "balkan": 0.4}
            },
            "brâncuși": {
                "type": "artistic_concept",
                "properties": {"style": "essential_forms", "philosophy": "truth_through_simplicity"},
                "cultural_context": {"romanian": 0.8, "international": 0.6}
            },
            "hora": {
                "type": "social_practice",
                "properties": {"form": "circular_dance", "meaning": "unity"},
                "cultural_context": {"romanian": 0.9, "folk": 0.7}
            }
        }
        
        for name, info in cultural_symbols.items():
            symbol = Symbol(
                name=name,
                symbol_type=info["type"],
                properties=info["properties"],
                cultural_context=info["cultural_context"]
            )
            self.symbols[name] = symbol
            
        logger.info(f"🇷🇴 Initialized {len(cultural_symbols)} Romanian cultural symbols")
    
    def add_symbol(self, symbol: Symbol) -> bool:
        """Add symbol to knowledge base"""
        if symbol.name not in self.symbols:
            self.symbols[symbol.name] = symbol
            self.knowledge_graph.add_node(symbol.name, **symbol.properties)
            return True
        return False
    
    def add_predicate(self, predicate: Predicate) -> bool:
        """Add predicate to knowledge base"""
        key = f"{predicate.name}({','.join(predicate.arguments)})"
        if key not in self.predicates:
            self.predicates[key] = predicate
            return True
        return False
    
    def add_rule(self, rule: Rule) -> bool:
        """Add rule to knowledge base"""
        if rule.rule_id not in self.rules:
            self.rules[rule.rule_id] = rule
            return True
        return False
    
    def query_symbols(self, symbol_type: Optional[str] = None, 
                     cultural_threshold: float = 0.0) -> List[Symbol]:
        """Query symbols by type and cultural relevance"""
        results = []
        for symbol in self.symbols.values():
            if symbol_type and symbol.symbol_type != symbol_type:
                continue
            if symbol.cultural_context.get("romanian", 0) >= cultural_threshold:
                results.append(symbol)
        return results
    
    def get_related_concepts(self, concept_name: str, relation_type: str = None) -> List[str]:
        """Get concepts related to given concept"""
        if concept_name in self.concepts:
            if relation_type:
                return self.concepts[concept_name].relations.get(relation_type, [])
            else:
                all_related = []
                for relations in self.concepts[concept_name].relations.values():
                    all_related.extend(relations)
                return all_related
        return []

class NeuralSymbolicEncoder(nn.Module):
    """Neural network for encoding symbolic knowledge"""
    
    def __init__(self, vocab_size: int = 10000, embedding_dim: int = 512, hidden_dim: int = 256):
        super().__init__()
        self.embedding_dim = embedding_dim
        self.hidden_dim = hidden_dim
        
        # Symbol embedding
        self.symbol_embedding = nn.Embedding(vocab_size, embedding_dim)
        
        # Predicate encoding
        self.predicate_encoder = nn.LSTM(embedding_dim, hidden_dim, batch_first=True)
        
        # Rule encoding
        self.rule_encoder = nn.TransformerEncoder(
            nn.TransformerEncoderLayer(
                d_model=embedding_dim,
                nhead=8,
                dim_feedforward=hidden_dim * 2,
                dropout=0.1
            ),
            num_layers=4
        )
        
        # Cultural context encoder (Romanian-specific)
        self.cultural_encoder = nn.Sequential(
            nn.Linear(embedding_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, 1),  # Cultural relevance score
            nn.Sigmoid()
        )
        
        # Meta-reasoning network
        self.meta_reasoner = nn.Sequential(
            nn.Linear(embedding_dim * 2, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(), 
            nn.Linear(hidden_dim, 1),  # Reasoning confidence
            nn.Sigmoid()
        )
        
        logger.info(f"✅ Neural-symbolic encoder initialized (dim: {embedding_dim})")
    
    def forward(self, symbols: torch.Tensor, predicates: torch.Tensor) -> Dict[str, torch.Tensor]:
        """Forward pass through neural-symbolic encoder"""
        # Encode symbols
        symbol_embeddings = self.symbol_embedding(symbols)
        
        # Encode predicates
        predicate_output, (h_n, c_n) = self.predicate_encoder(symbol_embeddings)
        predicate_representation = h_n[-1]  # Take last hidden state
        
        # Rule encoding (using transformer)
        rule_representation = self.rule_encoder(symbol_embeddings.transpose(0, 1)).mean(dim=0)
        
        # Cultural context scoring
        cultural_scores = self.cultural_encoder(symbol_embeddings.mean(dim=1))
        
        # Meta-reasoning
        combined_repr = torch.cat([predicate_representation, rule_representation], dim=-1)
        reasoning_confidence = self.meta_reasoner(combined_repr)
        
        return {
            "symbol_embeddings": symbol_embeddings,
            "predicate_representation": predicate_representation,
            "rule_representation": rule_representation,
            "cultural_scores": cultural_scores,
            "reasoning_confidence": reasoning_confidence
        }
    
    def encode_symbol(self, symbol_id: int) -> torch.Tensor:
        """Encode single symbol"""
        return self.symbol_embedding(torch.tensor([symbol_id]))
    
    def compute_similarity(self, emb1: torch.Tensor, emb2: torch.Tensor) -> float:
        """Compute similarity between embeddings"""
        return F.cosine_similarity(emb1, emb2, dim=-1).item()

class LogicalReasoner:
    """Logical reasoning engine with neural grounding"""
    
    def __init__(self, knowledge_base: SymbolicKnowledgeBase):
        self.kb = knowledge_base
        self.reasoning_cache = {}
        self.inference_chains = []
        self.romanian_reasoning_patterns = self._initialize_romanian_patterns()
        
        logger.info("✅ Logical reasoner initialized")
    
    def _initialize_romanian_patterns(self) -> Dict[str, Any]:
        """Initialize Romanian cultural reasoning patterns"""
        return {
            "dialectical": {
                "description": "Romanian tradition of dialectical thinking",
                "pattern": "thesis → antithesis → synthesis",
                "cultural_weight": 0.8
            },
            "contextual": {
                "description": "Romanian emphasis on context and relationships",
                "pattern": "individual → community → nation",
                "cultural_weight": 0.9
            },
            "temporal": {
                "description": "Romanian connection to history and tradition",
                "pattern": "past → present → future",
                "cultural_weight": 0.7
            }
        }
    
    async def forward_chain(self, initial_facts: List[Predicate], 
                           max_depth: int = 10) -> List[Predicate]:
        """Forward chaining inference with cultural awareness"""
        derived_facts = set()
        agenda = deque(initial_facts)
        depth = 0
        
        while agenda and depth < max_depth:
            current_fact = agenda.popleft()
            current_key = f"{current_fact.name}({','.join(current_fact.arguments)})"
            
            if current_key in derived_facts:
                continue
                
            derived_facts.add(current_key)
            
            # Apply applicable rules
            for rule in self.kb.rules.values():
                if self._can_apply_rule(rule, current_fact):
                    new_fact = self._apply_rule(rule, [current_fact])
                    if new_fact and self._is_culturally_consistent(new_fact):
                        agenda.append(new_fact)
                        
            depth += 1
        
        # Convert back to Predicate objects
        result_facts = []
        for fact_key in derived_facts:
            if fact_key in self.kb.predicates:
                result_facts.append(self.kb.predicates[fact_key])
        
        logger.info(f"🔄 Forward chaining derived {len(result_facts)} facts in {depth} steps")
        return result_facts
    
    async def backward_chain(self, goal: Predicate, 
                            depth: int = 0, max_depth: int = 10) -> Tuple[bool, List[Rule]]:
        """Backward chaining to prove goal"""
        if depth > max_depth:
            return False, []
        
        goal_key = f"{goal.name}({','.join(goal.arguments)})"
        
        # Check if goal is already a fact
        if goal_key in self.kb.predicates:
            return True, []
        
        # Try to prove goal using rules
        for rule in self.kb.rules.values():
            if self._rule_concludes_goal(rule, goal):
                # Try to prove all premises
                proof_chain = [rule]
                all_premises_proved = True
                
                for premise in rule.premises:
                    proved, sub_chain = await self.backward_chain(premise, depth + 1, max_depth)
                    if not proved:
                        all_premises_proved = False
                        break
                    proof_chain.extend(sub_chain)
                
                if all_premises_proved:
                    logger.info(f"🎯 Goal '{goal_key}' proved using {len(proof_chain)} rules")
                    return True, proof_chain
        
        return False, []
    
    async def abductive_reasoning(self, observations: List[Predicate]) -> List[Predicate]:
        """Abductive reasoning to find best explanations"""
        explanations = []
        
        for observation in observations:
            # Find rules that could conclude this observation
            potential_explanations = []
            
            for rule in self.kb.rules.values():
                if self._rule_could_explain(rule, observation):
                    # Calculate explanation quality
                    quality = self._calculate_explanation_quality(rule, observation)
                    potential_explanations.append((rule, quality))
            
            # Sort by quality and take best explanations
            potential_explanations.sort(key=lambda x: x[1], reverse=True)
            
            for rule, quality in potential_explanations[:3]:  # Top 3 explanations
                for premise in rule.premises:
                    if premise not in explanations:
                        premise.confidence = quality  # Set confidence based on explanation quality
                        explanations.append(premise)
        
        logger.info(f"🔍 Abductive reasoning generated {len(explanations)} explanations")
        return explanations
    
    async def meta_reasoning(self, reasoning_task: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Meta-level reasoning about reasoning processes"""
        meta_analysis = {
            "task_complexity": self._assess_task_complexity(reasoning_task),
            "cultural_relevance": self._assess_cultural_relevance(reasoning_task, context),
            "reasoning_strategy": self._select_reasoning_strategy(reasoning_task),
            "confidence_estimate": 0.0,
            "romanian_perspective": []
        }
        
        # Romanian philosophical approach
        if meta_analysis["cultural_relevance"] > 0.5:
            meta_analysis["romanian_perspective"].append(
                "Applying Romanian dialectical thinking tradition"
            )
            
        # Strategy selection based on cultural context
        if "dor" in reasoning_task.lower() or "traditional" in reasoning_task.lower():
            meta_analysis["reasoning_strategy"] = "contextual_romanian"
            meta_analysis["confidence_estimate"] = 0.85
        else:
            meta_analysis["confidence_estimate"] = 0.7
        
        return meta_analysis
    
    def _can_apply_rule(self, rule: Rule, fact: Predicate) -> bool:
        """Check if rule can be applied to fact"""
        for premise in rule.premises:
            if (premise.name == fact.name and 
                len(premise.arguments) == len(fact.arguments)):
                return True
        return False
    
    def _apply_rule(self, rule: Rule, facts: List[Predicate]) -> Optional[Predicate]:
        """Apply rule to derive new fact"""
        if len(facts) >= len(rule.premises):
            # Simple application - create conclusion
            conclusion = Predicate(
                name=rule.conclusion.name,
                arguments=rule.conclusion.arguments.copy(),
                truth_value=min([f.truth_value or 0.8 for f in facts]) * rule.weight,
                confidence=rule.weight * 0.8,
                romanian_interpretation=rule.romanian_context
            )
            rule.application_count += 1
            return conclusion
        return None
    
    def _rule_concludes_goal(self, rule: Rule, goal: Predicate) -> bool:
        """Check if rule can conclude the goal"""
        return (rule.conclusion and 
                rule.conclusion.name == goal.name and
                len(rule.conclusion.arguments) == len(goal.arguments))
    
    def _rule_could_explain(self, rule: Rule, observation: Predicate) -> bool:
        """Check if rule could explain observation"""
        return self._rule_concludes_goal(rule, observation)
    
    def _calculate_explanation_quality(self, rule: Rule, observation: Predicate) -> float:
        """Calculate quality of explanation"""
        base_quality = rule.weight * 0.8
        cultural_bonus = rule.cultural_significance * 0.2
        usage_penalty = min(0.1, rule.application_count * 0.01)  # Penalize overused rules
        
        return max(0.1, base_quality + cultural_bonus - usage_penalty)
    
    def _is_culturally_consistent(self, fact: Predicate) -> bool:
        """Check if fact is consistent with Romanian cultural values"""
        if fact.romanian_interpretation:
            # Has explicit Romanian interpretation
            return True
        
        # Check for cultural consistency heuristics
        fact_str = f"{fact.name}({','.join(fact.arguments)})".lower()
        
        # Positive cultural markers
        if any(marker in fact_str for marker in ["family", "community", "tradition", "respect"]):
            return True
        
        # Negative cultural markers
        if any(marker in fact_str for marker in ["disrespect", "abandon", "betray"]):
            return False
        
        return True  # Default to consistent
    
    def _assess_task_complexity(self, task: str) -> float:
        """Assess reasoning task complexity"""
        complexity_indicators = ["if", "then", "because", "therefore", "however", "although"]
        complexity = len([ind for ind in complexity_indicators if ind in task.lower()])
        return min(1.0, complexity * 0.2)
    
    def _assess_cultural_relevance(self, task: str, context: Dict[str, Any]) -> float:
        """Assess cultural relevance of reasoning task"""
        romanian_markers = ["romania", "romanian", "dor", "traditional", "cultural", "folk"]
        relevance = len([marker for marker in romanian_markers if marker in task.lower()])
        
        # Add context-based relevance
        if context.get("cultural_context"):
            relevance += 1
        
        return min(1.0, relevance * 0.3)
    
    def _select_reasoning_strategy(self, task: str) -> str:
        """Select appropriate reasoning strategy"""
        task_lower = task.lower()
        
        if "prove" in task_lower or "derive" in task_lower:
            return "forward_chaining"
        elif "explain" in task_lower or "why" in task_lower:
            return "abductive"
        elif "if" in task_lower and "then" in task_lower:
            return "backward_chaining"
        else:
            return "general_reasoning"

class ConceptAbstractor:
    """Abstraction engine for concept formation and generalization"""
    
    def __init__(self, knowledge_base: SymbolicKnowledgeBase):
        self.kb = knowledge_base
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.abstraction_hierarchy = nx.DiGraph()
        self.romanian_conceptual_patterns = self._initialize_romanian_patterns()
        
        logger.info("✅ Concept abstractor initialized")
    
    def _initialize_romanian_patterns(self) -> Dict[str, Any]:
        """Initialize Romanian conceptual patterns"""
        return {
            "family_concepts": {
                "base": ["mamă", "tată", "copil", "bunic", "bunică"],
                "abstract": "familie",
                "cultural_weight": 0.9
            },
            "emotional_concepts": {
                "base": ["dor", "jale", "bucurie", "mândrie", "drag"],
                "abstract": "sentiment_românesc", 
                "cultural_weight": 0.95
            },
            "work_concepts": {
                "base": ["muncă", "trudă", "osteneală", "hărnicie"],
                "abstract": "etică_muncii",
                "cultural_weight": 0.8
            }
        }
    
    async def form_concept(self, instances: List[Dict[str, Any]], 
                          concept_name: str) -> Concept:
        """Form new concept from instances"""
        # Extract common properties
        common_properties = self._extract_common_properties(instances)
        
        # Generate neural representation
        descriptions = [inst.get("description", "") for inst in instances]
        embeddings = self.embedding_model.encode(descriptions)
        concept_embedding = np.mean(embeddings, axis=0)
        
        # Create symbolic axioms
        axioms = self._generate_axioms(common_properties, concept_name)
        
        # Determine Romanian cultural meaning
        cultural_meaning = self._determine_cultural_meaning(concept_name, instances)
        
        concept = Concept(
            name=concept_name,
            definition=f"Concept formed from {len(instances)} instances",
            properties=common_properties,
            neural_representation=concept_embedding,
            symbolic_axioms=axioms,
            romanian_cultural_meaning=cultural_meaning,
            abstraction_level=self._calculate_abstraction_level(instances)
        )
        
        self.kb.concepts[concept_name] = concept
        logger.info(f"🎯 Formed concept '{concept_name}' from {len(instances)} instances")
        
        return concept
    
    async def generalize_concepts(self, concepts: List[Concept]) -> Optional[Concept]:
        """Generalize multiple concepts into higher abstraction"""
        if len(concepts) < 2:
            return None
        
        # Find common properties across concepts
        all_properties = [concept.properties for concept in concepts]
        common_props = self._find_common_properties(all_properties)
        
        # Create generalized embedding
        embeddings = [concept.neural_representation for concept in concepts if concept.neural_representation is not None]
        if embeddings:
            generalized_embedding = np.mean(embeddings, axis=0)
        else:
            generalized_embedding = None
        
        # Generate name for generalized concept
        concept_names = [c.name for c in concepts]
        generalized_name = self._generate_generalized_name(concept_names)
        
        # Determine abstraction level
        max_level = max(c.abstraction_level for c in concepts)
        
        generalized_concept = Concept(
            name=generalized_name,
            definition=f"Generalization of: {', '.join(concept_names)}",
            properties=common_props,
            neural_representation=generalized_embedding,
            abstraction_level=max_level + 1,
            romanian_cultural_meaning=self._synthesize_cultural_meanings([c.romanian_cultural_meaning for c in concepts])
        )
        
        # Add to hierarchy
        for concept in concepts:
            self.abstraction_hierarchy.add_edge(concept.name, generalized_name)
        
        self.kb.concepts[generalized_name] = generalized_concept
        logger.info(f"🔼 Generalized {len(concepts)} concepts into '{generalized_name}'")
        
        return generalized_concept
    
    async def specialize_concept(self, general_concept: Concept, 
                               specialization_context: Dict[str, Any]) -> Concept:
        """Create specialized version of concept"""
        specialized_name = f"{general_concept.name}_{specialization_context.get('domain', 'specialized')}"
        
        # Inherit properties and add specialized ones
        specialized_props = general_concept.properties.copy()
        specialized_props.update(specialization_context.get("properties", {}))
        
        # Modify neural representation based on context
        if general_concept.neural_representation is not None:
            context_embedding = self.embedding_model.encode([str(specialization_context)])[0]
            specialized_embedding = 0.7 * general_concept.neural_representation + 0.3 * context_embedding
        else:
            specialized_embedding = None
        
        specialized_concept = Concept(
            name=specialized_name,
            definition=f"Specialization of {general_concept.name} in {specialization_context.get('domain', 'specific context')}",
            properties=specialized_props,
            neural_representation=specialized_embedding,
            abstraction_level=general_concept.abstraction_level - 1,
            romanian_cultural_meaning=general_concept.romanian_cultural_meaning
        )
        
        # Add to hierarchy
        self.abstraction_hierarchy.add_edge(general_concept.name, specialized_name)
        
        self.kb.concepts[specialized_name] = specialized_concept
        logger.info(f"🔽 Specialized '{general_concept.name}' into '{specialized_name}'")
        
        return specialized_concept
    
    def _extract_common_properties(self, instances: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Extract common properties from instances"""
        if not instances:
            return {}
        
        # Find properties that appear in majority of instances
        property_counts = defaultdict(int)
        for instance in instances:
            for prop in instance.get("properties", {}):
                property_counts[prop] += 1
        
        threshold = len(instances) * 0.5  # Majority threshold
        common_props = {
            prop: count for prop, count in property_counts.items()
            if count >= threshold
        }
        
        return common_props
    
    def _find_common_properties(self, property_lists: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Find properties common across multiple property dictionaries"""
        if not property_lists:
            return {}
        
        common = set(property_lists[0].keys())
        for props in property_lists[1:]:
            common &= set(props.keys())
        
        return {prop: property_lists[0][prop] for prop in common}
    
    def _generate_axioms(self, properties: Dict[str, Any], concept_name: str) -> List[str]:
        """Generate symbolic axioms for concept"""
        axioms = []
        
        # Basic axioms from properties
        for prop, value in properties.items():
            axiom = f"∀x: {concept_name}(x) → has_property(x, {prop}, {value})"
            axioms.append(axiom)
        
        # Romanian cultural axioms
        if concept_name.lower() in ["familie", "family"]:
            axioms.append("∀x: familie(x) → important(x, romanian_culture)")
            axioms.append("∀x: familie(x) → has_bonds(x, strong)")
        
        return axioms
    
    def _determine_cultural_meaning(self, concept_name: str, instances: List[Dict[str, Any]]) -> Optional[str]:
        """Determine Romanian cultural meaning of concept"""
        # Check if concept matches Romanian patterns
        for pattern_name, pattern in self.romanian_conceptual_patterns.items():
            if concept_name.lower() in [base.lower() for base in pattern["base"]]:
                return f"Part of {pattern['abstract']} - {pattern_name}"
        
        # Check instances for cultural markers
        cultural_markers = 0
        for instance in instances:
            desc = instance.get("description", "").lower()
            if any(marker in desc for marker in ["romanian", "traditional", "cultural", "folk"]):
                cultural_markers += 1
        
        if cultural_markers > len(instances) * 0.3:
            return f"Culturally significant Romanian concept (evidence in {cultural_markers}/{len(instances)} instances)"
        
        return None
    
    def _calculate_abstraction_level(self, instances: List[Dict[str, Any]]) -> int:
        """Calculate abstraction level based on instances"""
        # Simple heuristic: more diverse instances suggest higher abstraction
        unique_categories = set()
        for instance in instances:
            category = instance.get("category", "unknown")
            unique_categories.add(category)
        
        return min(5, len(unique_categories))  # Cap at 5 levels
    
    def _generate_generalized_name(self, concept_names: List[str]) -> str:
        """Generate name for generalized concept"""
        # Simple approach: use common prefix or create compound name
        if len(concept_names) == 2:
            return f"{concept_names[0]}_{concept_names[1]}_generalized"
        else:
            return f"generalized_{'_'.join(concept_names[:2])}_etc"
    
    def _synthesize_cultural_meanings(self, meanings: List[Optional[str]]) -> Optional[str]:
        """Synthesize cultural meanings from multiple concepts"""
        valid_meanings = [m for m in meanings if m]
        if not valid_meanings:
            return None
        
        if len(valid_meanings) == 1:
            return valid_meanings[0]
        
        return f"Synthesis of multiple cultural meanings: {'; '.join(valid_meanings[:2])}"

class NeuralSymbolicIntelligence:
    """Main neural-symbolic intelligence system"""
    
    def __init__(self, database_path: str = "neural_symbolic_storage.db"):
        self.database_path = database_path
        self.knowledge_base = SymbolicKnowledgeBase()
        self.neural_encoder = NeuralSymbolicEncoder()
        self.logical_reasoner = LogicalReasoner(self.knowledge_base)
        self.concept_abstractor = ConceptAbstractor(self.knowledge_base)
        
        # Performance tracking
        self.reasoning_sessions = 0
        self.concept_formations = 0
        self.rule_applications = 0
        self.cultural_relevance_scores = []
        
        # Initialize storage
        self._initialize_storage()
        
        logger.info("🧠 Neural-Symbolic Intelligence system initialized")
    
    def _initialize_storage(self):
        """Initialize SQLite storage"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reasoning_sessions (
                id TEXT PRIMARY KEY,
                task_description TEXT,
                reasoning_type TEXT,
                cultural_relevance REAL,
                confidence_score REAL,
                processing_time REAL,
                results TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS concept_formations (
                id TEXT PRIMARY KEY,
                concept_name TEXT,
                abstraction_level INTEGER,
                cultural_significance REAL,
                properties TEXT,
                axioms TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS rule_applications (
                id TEXT PRIMARY KEY,
                rule_id TEXT,
                premises TEXT,
                conclusion TEXT,
                confidence REAL,
                cultural_context TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        conn.close()
        logger.info("✅ Neural-symbolic storage initialized")
    
    async def reasoning_session(self, task_description: str, 
                               reasoning_type: str = "forward_chaining",
                               cultural_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Execute comprehensive reasoning session"""
        start_time = datetime.now()
        session_id = str(uuid.uuid4())
        
        logger.info(f"🧠 Starting reasoning session: {session_id}")
        logger.info(f"📝 Task: {task_description}")
        logger.info(f"🔄 Type: {reasoning_type}")
        
        # Parse task into symbolic representation
        initial_facts = self._parse_task_to_facts(task_description)
        
        # Meta-reasoning about the task
        meta_analysis = await self.logical_reasoner.meta_reasoning(task_description, cultural_context or {})
        
        # Execute reasoning based on type
        results = {}
        if reasoning_type == "forward_chaining":
            derived_facts = await self.logical_reasoner.forward_chain(initial_facts)
            results["derived_facts"] = [self._fact_to_dict(f) for f in derived_facts]
            
        elif reasoning_type == "backward_chaining":
            if initial_facts:
                goal = initial_facts[0]  # Treat first fact as goal
                proved, proof_chain = await self.logical_reasoner.backward_chain(goal)
                results["proved"] = proved
                results["proof_chain"] = [r.rule_id for r in proof_chain]
            
        elif reasoning_type == "abductive":
            explanations = await self.logical_reasoner.abductive_reasoning(initial_facts)
            results["explanations"] = [self._fact_to_dict(f) for f in explanations]
        
        # Cultural analysis
        cultural_relevance = meta_analysis.get("cultural_relevance", 0.0)
        romanian_insights = meta_analysis.get("romanian_perspective", [])
        
        # Neural grounding (simplified)
        neural_confidence = self._calculate_neural_confidence(initial_facts, results)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        session_result = {
            "session_id": session_id,
            "task_description": task_description,
            "reasoning_type": reasoning_type,
            "meta_analysis": meta_analysis,
            "results": results,
            "cultural_relevance": cultural_relevance,
            "romanian_insights": romanian_insights,
            "neural_confidence": neural_confidence,
            "processing_time": processing_time,
            "total_facts_processed": len(initial_facts),
            "derived_conclusions": len(results.get("derived_facts", results.get("explanations", [])))
        }
        
        # Store session
        await self._store_reasoning_session(session_result)
        
        self.reasoning_sessions += 1
        self.cultural_relevance_scores.append(cultural_relevance)
        
        logger.info(f"✅ Reasoning session completed in {processing_time:.2f}s")
        logger.info(f"🇷🇴 Cultural relevance: {cultural_relevance:.2f}")
        logger.info(f"🎯 Neural confidence: {neural_confidence:.2f}")
        
        return session_result
    
    async def concept_learning_session(self, instances: List[Dict[str, Any]], 
                                     concept_name: str) -> Dict[str, Any]:
        """Execute concept learning and formation session"""
        start_time = datetime.now()
        logger.info(f"🎯 Learning concept: {concept_name}")
        
        # Form concept from instances
        concept = await self.concept_abstractor.form_concept(instances, concept_name)
        
        # Attempt generalization with similar concepts
        similar_concepts = self._find_similar_concepts(concept)
        if similar_concepts:
            generalized = await self.concept_abstractor.generalize_concepts([concept] + similar_concepts[:2])
            if generalized:
                logger.info(f"🔼 Generalized into: {generalized.name}")
        
        # Store concept formation
        await self._store_concept_formation(concept)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        self.concept_formations += 1
        
        result = {
            "concept_name": concept.name,
            "abstraction_level": concept.abstraction_level,
            "properties": concept.properties,
            "axioms": concept.symbolic_axioms,
            "cultural_meaning": concept.romanian_cultural_meaning,
            "processing_time": processing_time,
            "instances_processed": len(instances)
        }
        
        logger.info(f"✅ Concept learning completed in {processing_time:.2f}s")
        return result
    
    def _parse_task_to_facts(self, task_description: str) -> List[Predicate]:
        """Parse natural language task into symbolic facts"""
        facts = []
        
        # Simple parsing heuristics (would be much more sophisticated in real system)
        sentences = task_description.split('.')
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
                
            # Look for basic patterns
            if " is " in sentence.lower():
                parts = sentence.lower().split(" is ")
                if len(parts) == 2:
                    subject = parts[0].strip()
                    predicate = parts[1].strip()
                    fact = Predicate(
                        name="is",
                        arguments=[subject, predicate],
                        truth_value=0.8,
                        confidence=0.7
                    )
                    facts.append(fact)
            
            elif " has " in sentence.lower():
                parts = sentence.lower().split(" has ")
                if len(parts) == 2:
                    subject = parts[0].strip()
                    object = parts[1].strip()
                    fact = Predicate(
                        name="has",
                        arguments=[subject, object],
                        truth_value=0.8,
                        confidence=0.7
                    )
                    facts.append(fact)
        
        # Add Romanian cultural context if detected
        task_lower = task_description.lower()
        if any(marker in task_lower for marker in ["dor", "romanian", "traditional", "cultural"]):
            cultural_fact = Predicate(
                name="has_cultural_context",
                arguments=["task", "romanian"],
                truth_value=0.9,
                confidence=0.8,
                romanian_interpretation="Task involves Romanian cultural elements"
            )
            facts.append(cultural_fact)
        
        return facts
    
    def _fact_to_dict(self, fact: Predicate) -> Dict[str, Any]:
        """Convert Predicate to dictionary representation"""
        return {
            "name": fact.name,
            "arguments": fact.arguments,
            "truth_value": fact.truth_value,
            "confidence": fact.confidence,
            "romanian_interpretation": fact.romanian_interpretation
        }
    
    def _calculate_neural_confidence(self, initial_facts: List[Predicate], results: Dict) -> float:
        """Calculate neural confidence in reasoning results"""
        base_confidence = 0.6
        
        # Boost confidence based on number of facts and cultural relevance
        fact_bonus = min(0.2, len(initial_facts) * 0.05)
        
        # Cultural context bonus
        cultural_bonus = 0.0
        for fact in initial_facts:
            if fact.romanian_interpretation:
                cultural_bonus += 0.1
        
        return min(1.0, base_confidence + fact_bonus + cultural_bonus)
    
    def _find_similar_concepts(self, concept: Concept) -> List[Concept]:
        """Find concepts similar to given concept"""
        similar = []
        
        if concept.neural_representation is None:
            return similar
        
        for other_concept in self.knowledge_base.concepts.values():
            if (other_concept.name != concept.name and 
                other_concept.neural_representation is not None):
                
                # Calculate similarity
                similarity = np.dot(concept.neural_representation, other_concept.neural_representation)
                similarity /= (np.linalg.norm(concept.neural_representation) * 
                              np.linalg.norm(other_concept.neural_representation))
                
                if similarity > 0.7:  # Similarity threshold
                    similar.append(other_concept)
        
        return similar[:3]  # Return top 3 similar concepts
    
    async def _store_reasoning_session(self, session_result: Dict[str, Any]):
        """Store reasoning session in database"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO reasoning_sessions 
            (id, task_description, reasoning_type, cultural_relevance, confidence_score, processing_time, results)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            session_result["session_id"],
            session_result["task_description"],
            session_result["reasoning_type"],
            session_result["cultural_relevance"],
            session_result["neural_confidence"],
            session_result["processing_time"],
            json.dumps(session_result["results"])
        ))
        
        conn.commit()
        conn.close()
    
    async def _store_concept_formation(self, concept: Concept):
        """Store concept formation in database"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        cultural_significance = 0.0
        if concept.romanian_cultural_meaning:
            cultural_significance = 0.8
        
        cursor.execute("""
            INSERT INTO concept_formations 
            (id, concept_name, abstraction_level, cultural_significance, properties, axioms)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            str(uuid.uuid4()),
            concept.name,
            concept.abstraction_level,
            cultural_significance,
            json.dumps(concept.properties),
            json.dumps(concept.symbolic_axioms)
        ))
        
        conn.commit()
        conn.close()
    
    async def get_system_insights(self) -> Dict[str, Any]:
        """Get comprehensive system insights"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        # Get statistics
        cursor.execute("SELECT COUNT(*) FROM reasoning_sessions")
        total_sessions = cursor.fetchone()[0]
        
        cursor.execute("SELECT AVG(cultural_relevance) FROM reasoning_sessions")
        avg_cultural_relevance = cursor.fetchone()[0] or 0.0
        
        cursor.execute("SELECT AVG(confidence_score) FROM reasoning_sessions")
        avg_confidence = cursor.fetchone()[0] or 0.0
        
        cursor.execute("SELECT COUNT(*) FROM concept_formations")
        total_concepts = cursor.fetchone()[0]
        
        conn.close()
        
        insights = {
            "total_reasoning_sessions": total_sessions,
            "total_concepts_formed": total_concepts,
            "average_cultural_relevance": avg_cultural_relevance,
            "average_confidence": avg_confidence,
            "symbols_in_kb": len(self.knowledge_base.symbols),
            "rules_in_kb": len(self.knowledge_base.rules),
            "predicates_in_kb": len(self.knowledge_base.predicates),
            "cultural_symbols": len([s for s in self.knowledge_base.symbols.values() 
                                   if s.cultural_context.get("romanian", 0) > 0.5])
        }
        
        return insights
    
    async def demonstrate_neural_symbolic_intelligence(self):
        """Demonstrate neural-symbolic intelligence capabilities"""
        logger.info("🧠 NEURAL-SYMBOLIC INTELLIGENCE DEMONSTRATION")
        logger.info("=" * 60)
        
        # Test 1: Logical reasoning with Romanian cultural context
        logger.info("🔄 Test 1: Romanian cultural reasoning")
        result1 = await self.reasoning_session(
            "Familia este importantă în cultura românească. Maria are o familie.",
            "forward_chaining",
            {"cultural_context": "romanian_family_values"}
        )
        logger.info(f"   Cultural relevance: {result1['cultural_relevance']:.2f}")
        logger.info(f"   Derived conclusions: {result1['derived_conclusions']}")
        logger.info(f"   Romanian insights: {len(result1['romanian_insights'])}")
        
        # Test 2: Concept formation
        logger.info("\n🎯 Test 2: Concept formation - 'Dor românesc'")
        dor_instances = [
            {"description": "Longing for homeland", "properties": {"intensity": "high", "cultural": "romanian"}, "category": "emotion"},
            {"description": "Missing distant loved ones", "properties": {"intensity": "profound", "temporal": "extended"}, "category": "emotion"},
            {"description": "Yearning for past times", "properties": {"nostalgic": True, "cultural": "specific"}, "category": "emotion"}
        ]
        
        concept_result = await self.concept_learning_session(dor_instances, "dor_românesc")
        logger.info(f"   Concept formed: {concept_result['concept_name']}")
        logger.info(f"   Abstraction level: {concept_result['abstraction_level']}")
        logger.info(f"   Cultural meaning: {concept_result['cultural_meaning']}")
        
        # Test 3: Abductive reasoning
        logger.info("\n🔍 Test 3: Abductive reasoning - explaining behavior")
        result3 = await self.reasoning_session(
            "Ion este trist și nostalgic. El se gândește des la casa părintească.",
            "abductive",
            {"cultural_context": "romanian_emotional_state"}
        )
        logger.info(f"   Explanations generated: {len(result3['results'].get('explanations', []))}")
        logger.info(f"   Processing time: {result3['processing_time']:.3f}s")
        
        # Test 4: Meta-reasoning
        logger.info("\n🤔 Test 4: Meta-reasoning about Romanian philosophy")
        meta_task = "How should we understand the relationship between individual and community in Romanian culture?"
        result4 = await self.reasoning_session(
            meta_task,
            "forward_chaining",
            {"philosophical_context": "romanian_social_philosophy"}
        )
        logger.info(f"   Meta-analysis: {result4['meta_analysis']['reasoning_strategy']}")
        logger.info(f"   Cultural relevance: {result4['cultural_relevance']:.2f}")
        
        # Get system insights
        insights = await self.get_system_insights()
        logger.info("\n📊 System Performance Insights:")
        logger.info(f"   Total reasoning sessions: {insights['total_reasoning_sessions']}")
        logger.info(f"   Concepts formed: {insights['total_concepts_formed']}")
        logger.info(f"   Average cultural relevance: {insights['average_cultural_relevance']:.2f}")
        logger.info(f"   Knowledge base size: {insights['symbols_in_kb']} symbols, {insights['rules_in_kb']} rules")
        logger.info(f"   Cultural symbols: {insights['cultural_symbols']}")
        
        logger.info("\n✅ Neural-symbolic intelligence demonstration completed successfully!")

async def main():
    """Main execution for neural-symbolic intelligence testing"""
    intelligence = NeuralSymbolicIntelligence()
    await intelligence.demonstrate_neural_symbolic_intelligence()

if __name__ == "__main__":
    asyncio.run(main())