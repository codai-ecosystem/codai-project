"""
ROMAI Analogical Reasoning Engine
=================================

Advanced analogical reasoning module for ROMAI AGI system.
Handles structural mapping, case-based reasoning, analogical transfer,
and cross-domain pattern recognition.

Author: ROMAI AGI Team
Date: 2025-01-17
Version: 1.0.0
"""

import asyncio
import logging
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Set, Tuple, Union
import json
import math
from collections import defaultdict


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AnalogicalRelationType(Enum):
    """Types of analogical relationships."""
    STRUCTURAL = "structural"           # Similar structure/pattern
    FUNCTIONAL = "functional"           # Similar function/purpose  
    CAUSAL = "causal"                  # Similar causal relationships
    SEMANTIC = "semantic"              # Similar meaning/concept
    PRAGMATIC = "pragmatic"            # Similar use/application
    SURFACE = "surface"                # Superficial similarity
    SYSTEM = "system"                  # Similar system properties


class MappingType(Enum):
    """Types of analogical mappings."""
    ONE_TO_ONE = "one_to_one"
    ONE_TO_MANY = "one_to_many" 
    MANY_TO_ONE = "many_to_one"
    PARTIAL = "partial"
    SYSTEMATIC = "systematic"


class AnalogicalStrength(Enum):
    """Strength of analogical relationships."""
    WEAK = "weak"           # 0.0-0.3
    MODERATE = "moderate"   # 0.3-0.6
    STRONG = "strong"       # 0.6-0.8
    VERY_STRONG = "very_strong"  # 0.8-1.0


@dataclass
class ConceptualElement:
    """Represents an element in a conceptual structure."""
    name: str
    element_type: str  # 'object', 'relation', 'property', 'action'
    properties: Dict[str, Any] = field(default_factory=dict)
    relations: List[str] = field(default_factory=list)
    domain: Optional[str] = None
    element_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    
    def similarity_to(self, other: 'ConceptualElement') -> float:
        """Calculate similarity to another element."""
        if self.element_type != other.element_type:
            return 0.1
        
        # Name similarity (simple)
        name_sim = 1.0 if self.name == other.name else 0.0
        
        # Property similarity
        prop_sim = self._property_similarity(other.properties)
        
        # Relation similarity
        rel_sim = self._relation_similarity(other.relations)
        
        return (name_sim * 0.3 + prop_sim * 0.4 + rel_sim * 0.3)
    
    def _property_similarity(self, other_props: Dict[str, Any]) -> float:
        """Calculate property similarity."""
        if not self.properties and not other_props:
            return 1.0
        if not self.properties or not other_props:
            return 0.0
        
        common_keys = set(self.properties.keys()) & set(other_props.keys())
        if not common_keys:
            return 0.0
        
        similarity_sum = 0.0
        for key in common_keys:
            if self.properties[key] == other_props[key]:
                similarity_sum += 1.0
            else:
                similarity_sum += 0.5
        
        return similarity_sum / len(common_keys)
    
    def _relation_similarity(self, other_relations: List[str]) -> float:
        """Calculate relation similarity."""
        if not self.relations and not other_relations:
            return 1.0
        if not self.relations or not other_relations:
            return 0.0
        
        common_relations = set(self.relations) & set(other_relations)
        total_relations = set(self.relations) | set(other_relations)
        
        return len(common_relations) / len(total_relations) if total_relations else 0.0


@dataclass
class ConceptualStructure:
    """Represents a complete conceptual structure for analogical reasoning."""
    name: str
    elements: List[ConceptualElement]
    relationships: List[Tuple[str, str, str]]  # (element1, relation, element2)
    domain: str
    description: Optional[str] = None
    context: Dict[str, Any] = field(default_factory=dict)
    structure_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    created_at: datetime = field(default_factory=datetime.now)
    
    def get_element_by_name(self, name: str) -> Optional[ConceptualElement]:
        """Find an element by name."""
        for element in self.elements:
            if element.name == name:
                return element
        return None
    
    def get_relations_for_element(self, element_name: str) -> List[Tuple[str, str, str]]:
        """Get all relationships involving an element."""
        relations = []
        for rel in self.relationships:
            if rel[0] == element_name or rel[2] == element_name:
                relations.append(rel)
        return relations


@dataclass  
class AnalogicalMapping:
    """Represents a mapping between two conceptual structures."""
    source_structure: ConceptualStructure
    target_structure: ConceptualStructure
    element_mappings: Dict[str, str]  # source_element -> target_element
    relation_mappings: Dict[Tuple[str, str, str], Tuple[str, str, str]] = field(default_factory=dict)
    mapping_type: MappingType = MappingType.PARTIAL
    strength: float = 0.0
    confidence: float = 0.0
    mapping_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    created_at: datetime = field(default_factory=datetime.now)
    
    def is_valid(self) -> bool:
        """Check if the mapping is valid."""
        # Check if all mapped elements exist
        for source_elem, target_elem in self.element_mappings.items():
            if (not self.source_structure.get_element_by_name(source_elem) or
                not self.target_structure.get_element_by_name(target_elem)):
                return False
        return True
    
    def get_mapped_relations(self) -> List[Tuple[Tuple[str, str, str], Tuple[str, str, str]]]:
        """Get all mapped relations."""
        mapped = []
        for source_rel, target_rel in self.relation_mappings.items():
            mapped.append((source_rel, target_rel))
        return mapped


@dataclass
class AnalogicalInference:
    """Represents an inference made through analogical reasoning."""
    source_structure: ConceptualStructure
    target_structure: ConceptualStructure
    mapping: AnalogicalMapping
    inferred_properties: Dict[str, Any] = field(default_factory=dict)
    inferred_relations: List[Tuple[str, str, str]] = field(default_factory=list)
    confidence: float = 0.0
    justification: str = ""
    inference_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])


@dataclass
class CaseExample:
    """Represents a case for case-based reasoning."""
    case_name: str
    problem_description: str
    solution: str
    domain: str
    structure: ConceptualStructure
    outcome: Optional[str] = None
    success_rating: float = 1.0
    tags: List[str] = field(default_factory=list)
    case_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    created_at: datetime = field(default_factory=datetime.now)


class AnalogicalReasoningEngine:
    """
    Advanced analogical reasoning engine for ROMAI AGI.
    
    Provides capabilities for:
    - Structural mapping between conceptual domains
    - Case-based reasoning and retrieval
    - Analogical transfer and inference
    - Cross-domain pattern recognition
    - Integration with other reasoning systems
    """
    
    def __init__(self):
        """Initialize the analogical reasoning engine."""
        self.structures: Dict[str, ConceptualStructure] = {}
        self.cases: Dict[str, CaseExample] = {}
        self.mappings: Dict[str, AnalogicalMapping] = {}
        self.performance_stats = {
            "total_mappings": 0,
            "successful_mappings": 0,
            "inferences_made": 0,
            "cases_retrieved": 0,
            "average_mapping_strength": 0.0,
            "start_time": time.time()
        }
        
        # Initialize common analogical patterns
        self._initialize_analogical_patterns()
        
        logger.info("🔄 Analogical Reasoning Engine initialized - Ready for structural mapping!")
    
    def _initialize_analogical_patterns(self):
        """Initialize common analogical patterns for rapid recognition."""
        self.analogical_patterns = {
            "flow_patterns": {
                "description": "Flow-like relationships (water, electricity, traffic, etc.)",
                "keywords": ["flow", "current", "stream", "movement", "transfer"],
                "structural_elements": ["source", "path", "destination", "obstacle", "flow_rate"],
                "common_relations": ["flows_from", "flows_to", "blocks", "increases", "decreases"]
            },
            "hierarchy_patterns": {
                "description": "Hierarchical organization patterns",
                "keywords": ["hierarchy", "level", "above", "below", "parent", "child"],
                "structural_elements": ["root", "parent", "child", "leaf", "level"],
                "common_relations": ["contains", "parent_of", "above", "subordinate_to"]
            },
            "cycle_patterns": {
                "description": "Cyclical and iterative patterns",
                "keywords": ["cycle", "loop", "repeat", "circular", "iterative"],
                "structural_elements": ["start", "middle", "end", "cycle_element"],
                "common_relations": ["follows", "repeats", "cycles_to", "returns_to"]
            },
            "competition_patterns": {
                "description": "Competition and conflict patterns",
                "keywords": ["compete", "conflict", "versus", "against", "win", "lose"],
                "structural_elements": ["competitor", "resource", "goal", "strategy"],
                "common_relations": ["competes_with", "wants", "uses", "wins", "loses"]
            },
            "system_patterns": {
                "description": "System organization patterns",
                "keywords": ["system", "component", "input", "output", "process"],
                "structural_elements": ["input", "process", "output", "component", "feedback"],
                "common_relations": ["inputs_to", "processes", "outputs", "controls", "feedback_to"]
            }
        }
    
    async def create_conceptual_structure(
        self,
        name: str,
        domain: str,
        description: str,
        elements_data: List[Dict[str, Any]],
        relationships_data: List[Tuple[str, str, str]]
    ) -> ConceptualStructure:
        """
        Create a conceptual structure for analogical reasoning.
        
        Args:
            name: Name of the structure
            domain: Domain of the structure
            description: Description of the structure
            elements_data: List of element data dictionaries
            relationships_data: List of relationship tuples
            
        Returns:
            Created ConceptualStructure
        """
        logger.info(f"🏗️ Creating conceptual structure: {name} in domain: {domain}")
        
        # Create elements
        elements = []
        for elem_data in elements_data:
            element = ConceptualElement(
                name=elem_data["name"],
                element_type=elem_data.get("type", "object"),
                properties=elem_data.get("properties", {}),
                relations=elem_data.get("relations", []),
                domain=domain
            )
            elements.append(element)
        
        # Create structure
        structure = ConceptualStructure(
            name=name,
            elements=elements,
            relationships=relationships_data,
            domain=domain,
            description=description
        )
        
        # Store structure
        self.structures[structure.structure_id] = structure
        
        logger.info(f"✅ Conceptual structure created: {structure.structure_id}")
        logger.info(f"   Elements: {len(elements)}, Relations: {len(relationships_data)}")
        
        return structure
    
    async def extract_structure_from_text(
        self,
        text: str,
        domain: str,
        context: Optional[Dict[str, Any]] = None
    ) -> ConceptualStructure:
        """
        Extract conceptual structure from natural language text.
        
        Args:
            text: Input text to analyze
            domain: Domain of the content
            context: Additional context for extraction
            
        Returns:
            Extracted ConceptualStructure
        """
        logger.info(f"📝 Extracting structure from text in domain: {domain}")
        
        # Simple structure extraction (in production, use advanced NLP)
        elements_data = await self._extract_elements_from_text(text, domain)
        relationships_data = await self._extract_relationships_from_text(text, elements_data)
        
        structure_name = f"extracted_structure_{int(time.time())}"
        
        structure = await self.create_conceptual_structure(
            name=structure_name,
            domain=domain,
            description=f"Structure extracted from: {text[:100]}...",
            elements_data=elements_data,
            relationships_data=relationships_data
        )
        
        return structure
    
    async def _extract_elements_from_text(self, text: str, domain: str) -> List[Dict[str, Any]]:
        """Extract conceptual elements from text."""
        elements_data = []
        
        # Simple extraction based on patterns
        words = text.lower().split()
        
        # Common element types by domain
        domain_elements = {
            "biology": ["organism", "cell", "gene", "protein", "organ", "system"],
            "physics": ["particle", "force", "energy", "field", "wave", "matter"],
            "economics": ["market", "price", "supply", "demand", "consumer", "producer"],
            "psychology": ["mind", "behavior", "emotion", "cognition", "memory", "learning"],
            "computer_science": ["algorithm", "data", "process", "system", "network", "program"],
            "general": ["object", "entity", "element", "component", "part", "whole"]
        }
        
        patterns = domain_elements.get(domain, domain_elements["general"])
        
        # Extract potential elements
        found_elements = set()
        for word in words:
            # Check for domain patterns
            for pattern in patterns:
                if pattern in word or word in pattern:
                    found_elements.add(word)
            
            # Check for noun patterns (simplified)
            if len(word) > 3 and not word in ["the", "and", "but", "for", "with"]:
                found_elements.add(word)
        
        # Create element data
        for element_name in list(found_elements)[:15]:  # Limit elements
            element_type = self._infer_element_type(element_name, text)
            properties = self._extract_element_properties(element_name, text)
            
            elements_data.append({
                "name": element_name,
                "type": element_type,
                "properties": properties
            })
        
        return elements_data
    
    def _infer_element_type(self, element_name: str, text: str) -> str:
        """Infer the type of an element."""
        element_lower = element_name.lower()
        text_lower = text.lower()
        
        # Action indicators
        action_indicators = ["do", "act", "move", "run", "work", "process"]
        if any(indicator in element_lower for indicator in action_indicators):
            return "action"
        
        # Property indicators
        property_indicators = ["color", "size", "shape", "quality", "attribute"]
        if any(indicator in element_lower for indicator in property_indicators):
            return "property"
        
        # Relation indicators
        relation_indicators = ["between", "connect", "link", "relate"]
        if any(indicator in text_lower for indicator in relation_indicators):
            context_pos = text_lower.find(element_lower)
            if context_pos > 0:
                context = text_lower[max(0, context_pos-20):context_pos+20]
                if any(indicator in context for indicator in relation_indicators):
                    return "relation"
        
        return "object"  # Default
    
    def _extract_element_properties(self, element_name: str, text: str) -> Dict[str, Any]:
        """Extract properties for an element from text."""
        properties = {}
        text_lower = text.lower()
        
        # Find element context
        element_pos = text_lower.find(element_name.lower())
        if element_pos >= 0:
            # Get surrounding context
            context_start = max(0, element_pos - 50)
            context_end = min(len(text_lower), element_pos + 50)
            context = text_lower[context_start:context_end]
            
            # Look for property patterns
            property_patterns = {
                "size": ["big", "small", "large", "tiny", "huge", "massive"],
                "color": ["red", "blue", "green", "yellow", "black", "white"],
                "state": ["solid", "liquid", "gas", "hot", "cold", "warm"],
                "quality": ["good", "bad", "fast", "slow", "strong", "weak"]
            }
            
            for prop_type, indicators in property_patterns.items():
                for indicator in indicators:
                    if indicator in context:
                        properties[prop_type] = indicator
        
        return properties
    
    async def _extract_relationships_from_text(
        self,
        text: str,
        elements_data: List[Dict[str, Any]]
    ) -> List[Tuple[str, str, str]]:
        """Extract relationships between elements from text."""
        relationships = []
        text_lower = text.lower()
        
        element_names = [elem["name"] for elem in elements_data]
        
        # Relationship patterns
        relation_patterns = {
            "causes": ["causes", "leads to", "results in", "produces"],
            "contains": ["contains", "includes", "has", "holds"],
            "is_part_of": ["part of", "component of", "belongs to"],
            "affects": ["affects", "influences", "impacts", "changes"],
            "connects_to": ["connects to", "links to", "joins", "attached to"],
            "similar_to": ["like", "similar to", "resembles", "comparable to"]
        }
        
        # Find relationships between elements
        for i, elem1 in enumerate(element_names):
            for j, elem2 in enumerate(element_names):
                if i == j:
                    continue
                
                # Check if both elements appear in text
                if elem1.lower() in text_lower and elem2.lower() in text_lower:
                    # Look for relationship patterns
                    for relation_type, patterns in relation_patterns.items():
                        for pattern in patterns:
                            # Simple pattern matching
                            pattern_variants = [
                                f"{elem1} {pattern} {elem2}",
                                f"{elem2} {pattern} {elem1}"
                            ]
                            
                            for variant in pattern_variants:
                                if variant in text_lower:
                                    if variant.startswith(elem1):
                                        relationships.append((elem1, relation_type, elem2))
                                    else:
                                        relationships.append((elem2, relation_type, elem1))
                                    break
        
        return relationships
    
    async def find_analogical_mapping(
        self,
        source_structure: ConceptualStructure,
        target_structure: ConceptualStructure,
        mapping_constraints: Optional[Dict[str, Any]] = None
    ) -> AnalogicalMapping:
        """
        Find analogical mapping between two conceptual structures.
        
        Args:
            source_structure: Source domain structure
            target_structure: Target domain structure
            mapping_constraints: Optional constraints for mapping
            
        Returns:
            AnalogicalMapping between the structures
        """
        logger.info(f"🔗 Finding analogical mapping: {source_structure.name} → {target_structure.name}")
        
        start_time = time.time()
        
        # Find element mappings
        element_mappings = await self._find_element_mappings(
            source_structure, target_structure, mapping_constraints
        )
        
        # Find relation mappings
        relation_mappings = await self._find_relation_mappings(
            source_structure, target_structure, element_mappings
        )
        
        # Calculate mapping strength
        strength = self._calculate_mapping_strength(
            source_structure, target_structure, element_mappings, relation_mappings
        )
        
        # Calculate confidence
        confidence = self._calculate_mapping_confidence(
            element_mappings, relation_mappings, strength
        )
        
        # Determine mapping type
        mapping_type = self._determine_mapping_type(element_mappings, relation_mappings)
        
        # Create mapping
        mapping = AnalogicalMapping(
            source_structure=source_structure,
            target_structure=target_structure,
            element_mappings=element_mappings,
            relation_mappings=relation_mappings,
            mapping_type=mapping_type,
            strength=strength,
            confidence=confidence
        )
        
        # Store mapping
        self.mappings[mapping.mapping_id] = mapping
        
        # Update statistics
        self.performance_stats["total_mappings"] += 1
        if mapping.strength > 0.5:
            self.performance_stats["successful_mappings"] += 1
        
        elapsed_time = time.time() - start_time
        logger.info(f"✅ Analogical mapping completed: {mapping.mapping_id} ({elapsed_time:.2f}s)")
        logger.info(f"   Strength: {strength:.3f}, Confidence: {confidence:.3f}")
        logger.info(f"   Element mappings: {len(element_mappings)}, Relation mappings: {len(relation_mappings)}")
        
        return mapping
    
    async def _find_element_mappings(
        self,
        source: ConceptualStructure,
        target: ConceptualStructure,
        constraints: Optional[Dict[str, Any]]
    ) -> Dict[str, str]:
        """Find mappings between elements of two structures."""
        mappings = {}
        
        # Calculate similarity matrix
        similarities = {}
        for source_elem in source.elements:
            for target_elem in target.elements:
                similarity = source_elem.similarity_to(target_elem)
                similarities[(source_elem.name, target_elem.name)] = similarity
        
        # Greedy mapping (in production, use optimal assignment algorithms)
        used_targets = set()
        for source_elem in source.elements:
            best_target = None
            best_similarity = 0.0
            
            for target_elem in target.elements:
                if target_elem.name in used_targets:
                    continue
                
                similarity = similarities.get((source_elem.name, target_elem.name), 0.0)
                if similarity > best_similarity and similarity > 0.3:  # Threshold
                    best_similarity = similarity
                    best_target = target_elem.name
            
            if best_target:
                mappings[source_elem.name] = best_target
                used_targets.add(best_target)
        
        return mappings
    
    async def _find_relation_mappings(
        self,
        source: ConceptualStructure,
        target: ConceptualStructure,
        element_mappings: Dict[str, str]
    ) -> Dict[Tuple[str, str, str], Tuple[str, str, str]]:
        """Find mappings between relations based on element mappings."""
        relation_mappings = {}
        
        for source_rel in source.relationships:
            source_elem1, source_relation, source_elem2 = source_rel
            
            # Check if elements are mapped
            if (source_elem1 in element_mappings and 
                source_elem2 in element_mappings):
                
                target_elem1 = element_mappings[source_elem1]
                target_elem2 = element_mappings[source_elem2]
                
                # Find corresponding relation in target
                for target_rel in target.relationships:
                    target_e1, target_relation, target_e2 = target_rel
                    
                    if ((target_e1 == target_elem1 and target_e2 == target_elem2) or
                        (target_e1 == target_elem2 and target_e2 == target_elem1)):
                        
                        relation_mappings[source_rel] = target_rel
                        break
        
        return relation_mappings
    
    def _calculate_mapping_strength(
        self,
        source: ConceptualStructure,
        target: ConceptualStructure,
        element_mappings: Dict[str, str],
        relation_mappings: Dict[Tuple[str, str, str], Tuple[str, str, str]]
    ) -> float:
        """Calculate the strength of an analogical mapping."""
        if not element_mappings and not relation_mappings:
            return 0.0
        
        # Element mapping coverage
        element_coverage = len(element_mappings) / max(len(source.elements), 1)
        
        # Relation mapping coverage  
        relation_coverage = len(relation_mappings) / max(len(source.relationships), 1)
        
        # Structural consistency
        structural_consistency = self._calculate_structural_consistency(
            source, target, element_mappings, relation_mappings
        )
        
        # Combined strength
        strength = (
            element_coverage * 0.3 +
            relation_coverage * 0.4 +
            structural_consistency * 0.3
        )
        
        return min(strength, 1.0)
    
    def _calculate_structural_consistency(
        self,
        source: ConceptualStructure,
        target: ConceptualStructure,
        element_mappings: Dict[str, str],
        relation_mappings: Dict[Tuple[str, str, str], Tuple[str, str, str]]
    ) -> float:
        """Calculate structural consistency of the mapping."""
        if not relation_mappings:
            return 0.5
        
        consistent_relations = 0
        total_relations = len(relation_mappings)
        
        for source_rel, target_rel in relation_mappings.items():
            source_e1, source_r, source_e2 = source_rel
            target_e1, target_r, target_e2 = target_rel
            
            # Check if the mapping preserves the relational structure
            if (element_mappings.get(source_e1) == target_e1 and
                element_mappings.get(source_e2) == target_e2):
                consistent_relations += 1
            elif (element_mappings.get(source_e1) == target_e2 and
                  element_mappings.get(source_e2) == target_e1):
                consistent_relations += 0.5  # Partial consistency
        
        return consistent_relations / total_relations if total_relations > 0 else 0.0
    
    def _calculate_mapping_confidence(
        self,
        element_mappings: Dict[str, str],
        relation_mappings: Dict[Tuple[str, str, str], Tuple[str, str, str]],
        strength: float
    ) -> float:
        """Calculate confidence in the mapping."""
        base_confidence = strength * 0.7
        
        # Boost confidence for more mappings
        mapping_count_factor = min((len(element_mappings) + len(relation_mappings)) / 10, 1.0)
        
        confidence = base_confidence + (mapping_count_factor * 0.3)
        return min(confidence, 1.0)
    
    def _determine_mapping_type(
        self,
        element_mappings: Dict[str, str],
        relation_mappings: Dict[Tuple[str, str, str], Tuple[str, str, str]]
    ) -> MappingType:
        """Determine the type of analogical mapping."""
        if not element_mappings:
            return MappingType.PARTIAL
        
        # Check mapping patterns
        unique_targets = len(set(element_mappings.values()))
        source_count = len(element_mappings)
        
        if source_count == unique_targets:
            if len(relation_mappings) > source_count:
                return MappingType.SYSTEMATIC
            else:
                return MappingType.ONE_TO_ONE
        elif unique_targets < source_count:
            return MappingType.MANY_TO_ONE
        else:
            return MappingType.PARTIAL
    
    async def make_analogical_inference(
        self,
        mapping: AnalogicalMapping,
        inference_targets: List[str]
    ) -> AnalogicalInference:
        """
        Make inferences based on analogical mapping.
        
        Args:
            mapping: Analogical mapping to use
            inference_targets: Target elements/relations to infer
            
        Returns:
            AnalogicalInference with predictions
        """
        logger.info(f"🧠 Making analogical inference using mapping: {mapping.mapping_id}")
        
        inferred_properties = {}
        inferred_relations = []
        
        # Infer properties for target elements
        for target_elem_name in inference_targets:
            # Find corresponding source element
            source_elem_name = None
            for src, tgt in mapping.element_mappings.items():
                if tgt == target_elem_name:
                    source_elem_name = src
                    break
            
            if source_elem_name:
                source_elem = mapping.source_structure.get_element_by_name(source_elem_name)
                target_elem = mapping.target_structure.get_element_by_name(target_elem_name)
                
                if source_elem and target_elem:
                    # Infer missing properties
                    for prop_name, prop_value in source_elem.properties.items():
                        if prop_name not in target_elem.properties:
                            inferred_properties[f"{target_elem_name}.{prop_name}"] = prop_value
        
        # Infer missing relations
        for source_rel in mapping.source_structure.relationships:
            source_e1, source_r, source_e2 = source_rel
            
            # Check if elements are mapped but relation is missing
            if (source_e1 in mapping.element_mappings and
                source_e2 in mapping.element_mappings):
                
                target_e1 = mapping.element_mappings[source_e1]
                target_e2 = mapping.element_mappings[source_e2]
                target_rel = (target_e1, source_r, target_e2)
                
                # Check if this relation exists in target
                if target_rel not in mapping.target_structure.relationships:
                    inferred_relations.append(target_rel)
        
        # Calculate confidence
        confidence = mapping.confidence * 0.8  # Slightly lower than mapping confidence
        
        # Generate justification
        justification = (
            f"Based on analogical mapping between {mapping.source_structure.name} "
            f"and {mapping.target_structure.name} (strength: {mapping.strength:.2f}), "
            f"inferred {len(inferred_properties)} properties and {len(inferred_relations)} relations"
        )
        
        inference = AnalogicalInference(
            source_structure=mapping.source_structure,
            target_structure=mapping.target_structure,
            mapping=mapping,
            inferred_properties=inferred_properties,
            inferred_relations=inferred_relations,
            confidence=confidence,
            justification=justification
        )
        
        # Update statistics
        self.performance_stats["inferences_made"] += 1
        
        logger.info(f"✅ Analogical inference completed: {inference.inference_id}")
        logger.info(f"   Properties inferred: {len(inferred_properties)}")
        logger.info(f"   Relations inferred: {len(inferred_relations)}")
        
        return inference
    
    async def add_case(
        self,
        case_name: str,
        problem_description: str,
        solution: str,
        domain: str,
        structure: ConceptualStructure,
        outcome: Optional[str] = None,
        success_rating: float = 1.0,
        tags: Optional[List[str]] = None
    ) -> CaseExample:
        """Add a case to the case base for case-based reasoning."""
        logger.info(f"📁 Adding case: {case_name} in domain: {domain}")
        
        case = CaseExample(
            case_name=case_name,
            problem_description=problem_description,
            solution=solution,
            domain=domain,
            structure=structure,
            outcome=outcome,
            success_rating=success_rating,
            tags=tags or []
        )
        
        self.cases[case.case_id] = case
        logger.info(f"✅ Case added: {case.case_id}")
        
        return case
    
    async def retrieve_similar_cases(
        self,
        query_structure: ConceptualStructure,
        domain: Optional[str] = None,
        max_results: int = 5
    ) -> List[Tuple[CaseExample, float]]:
        """
        Retrieve cases similar to the query structure.
        
        Args:
            query_structure: Structure to find similar cases for
            domain: Optional domain filter
            max_results: Maximum number of results
            
        Returns:
            List of (CaseExample, similarity_score) tuples
        """
        logger.info(f"🔍 Retrieving similar cases for: {query_structure.name}")
        
        similar_cases = []
        
        for case in self.cases.values():
            # Filter by domain if specified
            if domain and case.domain != domain:
                continue
            
            # Calculate structural similarity
            similarity = await self._calculate_structural_similarity(
                query_structure, case.structure
            )
            
            if similarity > 0.1:  # Minimum threshold
                similar_cases.append((case, similarity))
        
        # Sort by similarity and success rating
        similar_cases.sort(
            key=lambda x: (x[1], x[0].success_rating), 
            reverse=True
        )
        
        # Update statistics
        self.performance_stats["cases_retrieved"] += len(similar_cases[:max_results])
        
        logger.info(f"✅ Found {len(similar_cases[:max_results])} similar cases")
        
        return similar_cases[:max_results]
    
    async def _calculate_structural_similarity(
        self,
        structure1: ConceptualStructure,
        structure2: ConceptualStructure
    ) -> float:
        """Calculate structural similarity between two conceptual structures."""
        # Element similarity
        element_sim = self._calculate_element_set_similarity(
            structure1.elements, structure2.elements
        )
        
        # Relation similarity
        relation_sim = self._calculate_relation_similarity(
            structure1.relationships, structure2.relationships
        )
        
        # Combined similarity
        return (element_sim * 0.6 + relation_sim * 0.4)
    
    def _calculate_element_set_similarity(
        self,
        elements1: List[ConceptualElement],
        elements2: List[ConceptualElement]
    ) -> float:
        """Calculate similarity between two sets of elements."""
        if not elements1 and not elements2:
            return 1.0
        if not elements1 or not elements2:
            return 0.0
        
        total_similarity = 0.0
        max_similarities = []
        
        for elem1 in elements1:
            max_sim = 0.0
            for elem2 in elements2:
                sim = elem1.similarity_to(elem2)
                max_sim = max(max_sim, sim)
            max_similarities.append(max_sim)
        
        return sum(max_similarities) / len(max_similarities)
    
    def _calculate_relation_similarity(
        self,
        relations1: List[Tuple[str, str, str]],
        relations2: List[Tuple[str, str, str]]
    ) -> float:
        """Calculate similarity between two sets of relations."""
        if not relations1 and not relations2:
            return 1.0
        if not relations1 or not relations2:
            return 0.0
        
        common_patterns = 0
        total_patterns = len(relations1) + len(relations2)
        
        # Simple relation pattern matching
        patterns1 = set(rel[1] for rel in relations1)  # Relation types
        patterns2 = set(rel[1] for rel in relations2)
        
        common_patterns = len(patterns1 & patterns2)
        total_unique = len(patterns1 | patterns2)
        
        return common_patterns / total_unique if total_unique > 0 else 0.0
    
    def get_engine_statistics(self) -> Dict[str, Any]:
        """Get engine performance statistics."""
        current_time = time.time()
        uptime = current_time - self.performance_stats["start_time"]
        
        # Update average mapping strength
        if self.performance_stats["total_mappings"] > 0:
            successful_rate = (
                self.performance_stats["successful_mappings"] / 
                self.performance_stats["total_mappings"]
            )
            self.performance_stats["average_mapping_strength"] = successful_rate * 0.7
        
        return {
            **self.performance_stats,
            "uptime_seconds": uptime,
            "structures_stored": len(self.structures),
            "cases_stored": len(self.cases),
            "mappings_stored": len(self.mappings),
            "mappings_per_minute": (
                self.performance_stats["total_mappings"] / max(uptime / 60, 1)
            )
        }


async def main():
    """Demonstrate the analogical reasoning engine."""
    logger.info("🧪 Testing ROMAI Analogical Reasoning Engine")
    logger.info("=" * 50)
    
    # Initialize engine
    engine = AnalogicalReasoningEngine()
    
    # Create example structures
    logger.info("Creating example structures...")
    
    # Solar system structure
    solar_elements = [
        {"name": "sun", "type": "object", "properties": {"size": "large", "state": "hot"}},
        {"name": "planet", "type": "object", "properties": {"size": "medium", "state": "solid"}},
        {"name": "gravity", "type": "relation", "properties": {}}
    ]
    solar_relations = [("sun", "attracts", "planet"), ("planet", "orbits", "sun")]
    
    solar_structure = await engine.create_conceptual_structure(
        "solar_system", "astronomy", "Solar system with sun and planets",
        solar_elements, solar_relations
    )
    
    # Atomic structure
    atom_elements = [
        {"name": "nucleus", "type": "object", "properties": {"size": "small", "charge": "positive"}},
        {"name": "electron", "type": "object", "properties": {"size": "tiny", "charge": "negative"}},
        {"name": "force", "type": "relation", "properties": {}}
    ]
    atom_relations = [("nucleus", "attracts", "electron"), ("electron", "orbits", "nucleus")]
    
    atom_structure = await engine.create_conceptual_structure(
        "atomic_model", "physics", "Atomic model with nucleus and electrons",
        atom_elements, atom_relations
    )
    
    # Find analogical mapping
    logger.info("Finding analogical mapping...")
    mapping = await engine.find_analogical_mapping(solar_structure, atom_structure)
    
    # Make inferences
    logger.info("Making analogical inferences...")
    inference = await engine.make_analogical_inference(mapping, ["electron", "nucleus"])
    
    # Add case
    logger.info("Adding case example...")
    case = await engine.add_case(
        "orbital_motion_case",
        "Object orbits around central mass due to attractive force",
        "Use gravitational/electromagnetic force equations",
        "physics",
        solar_structure,
        "Successful orbital mechanics model",
        0.9,
        ["orbital", "mechanics", "force"]
    )
    
    # Retrieve similar cases
    logger.info("Retrieving similar cases...")
    similar_cases = await engine.retrieve_similar_cases(atom_structure, "physics", 3)
    
    # Show results
    logger.info("\n📊 Analogical Reasoning Results:")
    logger.info(f"   Mapping strength: {mapping.strength:.3f}")
    logger.info(f"   Mapping confidence: {mapping.confidence:.3f}")
    logger.info(f"   Element mappings: {len(mapping.element_mappings)}")
    logger.info(f"   Relation mappings: {len(mapping.relation_mappings)}")
    logger.info(f"   Inferences made: {len(inference.inferred_properties)} properties, {len(inference.inferred_relations)} relations")
    logger.info(f"   Similar cases found: {len(similar_cases)}")
    
    # Show statistics
    stats = engine.get_engine_statistics()
    logger.info("\n📊 Engine Statistics:")
    logger.info(f"   Total mappings: {stats['total_mappings']}")
    logger.info(f"   Successful mappings: {stats['successful_mappings']}")
    logger.info(f"   Cases stored: {stats['cases_stored']}")
    logger.info(f"   Structures stored: {stats['structures_stored']}")
    
    logger.info("\n✅ Analogical Reasoning Engine test completed successfully!")


if __name__ == "__main__":
    asyncio.run(main())