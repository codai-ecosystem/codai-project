"""
RomAI AGI Evolution Phase 2.1: Semantic Memory System

Knowledge graph-based semantic memory for storing and retrieving factual
information with conceptual relationships. Supports hierarchical knowledge
organization, consistency checking, and intelligent knowledge updates.

Part of Advanced Memory Architecture building on Phase 1's success.
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple, Set
from dataclasses import dataclass, field
from enum import Enum
import json
import uuid
from collections import defaultdict, deque

logger = logging.getLogger(__name__)

class RelationType(Enum):
    """Types of semantic relationships"""
    IS_A = "is_a"                    # Hierarchical relationship
    HAS_PROPERTY = "has_property"    # Property relationship  
    PART_OF = "part_of"             # Composition relationship
    CAUSES = "causes"               # Causal relationship
    SIMILAR_TO = "similar_to"       # Similarity relationship
    OPPOSITE_OF = "opposite_of"     # Opposition relationship
    USED_FOR = "used_for"          # Functional relationship
    LOCATED_IN = "located_in"       # Spatial relationship
    HAPPENS_BEFORE = "happens_before" # Temporal relationship
    ASSOCIATED_WITH = "associated_with" # General association

class ConfidenceLevel(Enum):
    """Confidence levels for knowledge facts"""
    CERTAIN = 1.0      # Absolutely certain
    HIGH = 0.8         # High confidence
    MEDIUM = 0.6       # Medium confidence  
    LOW = 0.4          # Low confidence
    UNCERTAIN = 0.2    # Very uncertain

@dataclass
class KnowledgeFact:
    """Individual fact in the knowledge base"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    subject: str = ""
    predicate: str = ""
    object: str = ""
    confidence: float = 1.0
    source: str = "system"
    timestamp: datetime = field(default_factory=datetime.now)
    evidence: List[str] = field(default_factory=list)
    contradictions: List[str] = field(default_factory=list)  # IDs of contradicting facts
    
@dataclass
class ConceptNode:
    """Node representing a concept in the knowledge graph"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    concept_type: str = "entity"  # entity, property, action, etc.
    properties: Dict[str, Any] = field(default_factory=dict)
    relationships: Dict[str, List[str]] = field(default_factory=dict)  # relation_type -> concept_ids
    facts: List[str] = field(default_factory=list)  # Fact IDs associated with this concept
    confidence: float = 1.0
    importance: float = 0.5
    last_accessed: datetime = field(default_factory=datetime.now)
    access_count: int = 0

class SemanticMemorySystem:
    """
    Long-term knowledge storage with conceptual relationships.
    Implements graph-based knowledge representation with reasoning capabilities.
    """
    
    def __init__(self, max_concepts: int = 50000, max_facts: int = 100000):
        self.concepts: Dict[str, ConceptNode] = {}
        self.facts: Dict[str, KnowledgeFact] = {}
        self.concept_index: Dict[str, str] = {}  # name -> concept_id
        self.relation_index: Dict[str, List[Tuple[str, str]]] = defaultdict(list)  # relation -> (from, to)
        self.max_concepts = max_concepts
        self.max_facts = max_facts
        
        logger.info("🧠 Semantic Memory System initialized")
    
    async def store_knowledge(
        self, 
        concept: str, 
        relations: List[Tuple[str, RelationType, str]], 
        facts: List[Dict[str, str]],
        confidence: float = 1.0,
        source: str = "system"
    ) -> str:
        """Store conceptual knowledge with relationship mapping"""
        
        # Create or get concept node
        concept_node = await self._get_or_create_concept(concept, confidence)
        
        # Store relationships
        for relation_data in relations:
            subject, relation_type, obj = relation_data
            await self._store_relationship(subject, relation_type, obj, confidence, source)
        
        # Store facts
        for fact_data in facts:
            await self._store_fact(
                subject=fact_data.get('subject', concept),
                predicate=fact_data.get('predicate', ''),
                obj=fact_data.get('object', ''),
                confidence=confidence,
                source=source
            )
        
        logger.info(f"📚 Knowledge stored for concept: {concept}")
        return concept_node.id
    
    async def query_knowledge(
        self, 
        query: str, 
        depth: int = 3,
        min_confidence: float = 0.5
    ) -> Dict[str, Any]:
        """Retrieve knowledge with relationship traversal"""
        
        query_results = {
            'concepts': [],
            'facts': [],
            'relationships': [],
            'query': query,
            'depth': depth,
            'confidence_threshold': min_confidence
        }
        
        # Parse query to identify concepts
        query_concepts = await self._parse_query_concepts(query)
        
        # Search for relevant concepts
        for concept_name in query_concepts:
            concept_id = self.concept_index.get(concept_name.lower())
            if concept_id:
                concept_node = self.concepts[concept_id]
                
                # Update access patterns
                concept_node.access_count += 1
                concept_node.last_accessed = datetime.now()
                
                # Gather related information
                concept_info = await self._gather_concept_information(
                    concept_node, depth, min_confidence
                )
                query_results['concepts'].append(concept_info)
        
        # If no direct concept matches, perform broader search
        if not query_results['concepts']:
            broad_results = await self._broad_knowledge_search(query, min_confidence)
            query_results.update(broad_results)
        
        logger.info(f"🔍 Knowledge query returned {len(query_results['concepts'])} concepts")
        return query_results
    
    async def update_knowledge(
        self, 
        concept: str, 
        new_information: Dict[str, Any],
        resolve_contradictions: bool = True
    ) -> bool:
        """Update existing knowledge with consistency checking"""
        
        concept_id = self.concept_index.get(concept.lower())
        if not concept_id:
            # Concept doesn't exist, create new
            await self.store_knowledge(
                concept, 
                new_information.get('relations', []),
                new_information.get('facts', [])
            )
            return True
        
        concept_node = self.concepts[concept_id]
        
        # Check for contradictions
        contradictions = []
        if resolve_contradictions:
            contradictions = await self._detect_contradictions(
                concept_node, new_information
            )
        
        # Handle contradictions
        if contradictions and resolve_contradictions:
            resolution_success = await self._resolve_contradictions(
                concept_node, new_information, contradictions
            )
            if not resolution_success:
                logger.warning(f"⚠️ Could not resolve all contradictions for {concept}")
                return False
        
        # Apply updates
        success = await self._apply_knowledge_updates(concept_node, new_information)
        
        if success:
            logger.info(f"✅ Knowledge updated for concept: {concept}")
        else:
            logger.error(f"❌ Failed to update knowledge for concept: {concept}")
        
        return success
    
    async def get_concept_hierarchy(self, concept: str, max_depth: int = 5) -> Dict[str, Any]:
        """Get hierarchical structure of a concept"""
        concept_id = self.concept_index.get(concept.lower())
        if not concept_id:
            return {}
        
        concept_node = self.concepts[concept_id]
        hierarchy = await self._build_concept_hierarchy(concept_node, max_depth, set())
        
        return {
            'concept': concept,
            'hierarchy': hierarchy,
            'max_depth': max_depth
        }
    
    async def find_conceptual_similarities(
        self, 
        concept1: str, 
        concept2: str
    ) -> Dict[str, Any]:
        """Find similarities between two concepts"""
        
        id1 = self.concept_index.get(concept1.lower())
        id2 = self.concept_index.get(concept2.lower())
        
        if not id1 or not id2:
            return {'similarity_score': 0.0, 'shared_properties': [], 'shared_relations': []}
        
        node1 = self.concepts[id1]
        node2 = self.concepts[id2]
        
        # Calculate similarity based on shared properties and relationships
        similarity_data = await self._calculate_concept_similarity(node1, node2)
        
        return similarity_data
    
    async def _get_or_create_concept(self, concept_name: str, confidence: float) -> ConceptNode:
        """Get existing concept or create new one"""
        concept_key = concept_name.lower()
        
        if concept_key in self.concept_index:
            concept_id = self.concept_index[concept_key]
            return self.concepts[concept_id]
        
        # Create new concept
        concept_node = ConceptNode(
            name=concept_name,
            confidence=confidence
        )
        
        self.concepts[concept_node.id] = concept_node
        self.concept_index[concept_key] = concept_node.id
        
        return concept_node
    
    async def _store_relationship(
        self, 
        subject: str, 
        relation_type: RelationType, 
        obj: str,
        confidence: float,
        source: str
    ):
        """Store a relationship between concepts"""
        
        # Get or create concepts
        subject_node = await self._get_or_create_concept(subject, confidence)
        object_node = await self._get_or_create_concept(obj, confidence)
        
        # Add relationship to subject concept
        relation_key = relation_type.value
        if relation_key not in subject_node.relationships:
            subject_node.relationships[relation_key] = []
        
        if object_node.id not in subject_node.relationships[relation_key]:
            subject_node.relationships[relation_key].append(object_node.id)
        
        # Update relation index
        self.relation_index[relation_key].append((subject_node.id, object_node.id))
        
        # Create corresponding fact
        fact = KnowledgeFact(
            subject=subject,
            predicate=relation_key,
            object=obj,
            confidence=confidence,
            source=source
        )
        
        self.facts[fact.id] = fact
        subject_node.facts.append(fact.id)
    
    async def _store_fact(
        self, 
        subject: str, 
        predicate: str, 
        obj: str, 
        confidence: float, 
        source: str
    ) -> str:
        """Store an individual fact"""
        
        fact = KnowledgeFact(
            subject=subject,
            predicate=predicate,
            object=obj,
            confidence=confidence,
            source=source
        )
        
        self.facts[fact.id] = fact
        
        # Associate with subject concept
        subject_node = await self._get_or_create_concept(subject, confidence)
        subject_node.facts.append(fact.id)
        
        return fact.id
    
    async def _parse_query_concepts(self, query: str) -> List[str]:
        """Parse query to identify relevant concepts"""
        # Simple keyword extraction (in production, use NLP parsing)
        words = query.lower().split()
        
        # Filter for concepts that exist in our knowledge base
        relevant_concepts = []
        for word in words:
            if word in self.concept_index:
                relevant_concepts.append(word)
        
        # If no direct matches, try partial matching
        if not relevant_concepts:
            for concept_name in self.concept_index.keys():
                for word in words:
                    if word in concept_name or concept_name in word:
                        relevant_concepts.append(concept_name)
                        break
        
        return relevant_concepts[:5]  # Limit to top 5 concepts
    
    async def _gather_concept_information(
        self, 
        concept_node: ConceptNode, 
        depth: int, 
        min_confidence: float
    ) -> Dict[str, Any]:
        """Gather comprehensive information about a concept"""
        
        concept_info = {
            'name': concept_node.name,
            'id': concept_node.id,
            'type': concept_node.concept_type,
            'properties': concept_node.properties,
            'confidence': concept_node.confidence,
            'relationships': {},
            'facts': [],
            'related_concepts': []
        }
        
        # Gather relationships
        for relation_type, related_concept_ids in concept_node.relationships.items():
            concept_info['relationships'][relation_type] = []
            for related_id in related_concept_ids:
                related_concept = self.concepts.get(related_id)
                if related_concept and related_concept.confidence >= min_confidence:
                    concept_info['relationships'][relation_type].append({
                        'name': related_concept.name,
                        'id': related_concept.id,
                        'confidence': related_concept.confidence
                    })
        
        # Gather facts
        for fact_id in concept_node.facts:
            fact = self.facts.get(fact_id)
            if fact and fact.confidence >= min_confidence:
                concept_info['facts'].append({
                    'subject': fact.subject,
                    'predicate': fact.predicate,
                    'object': fact.object,
                    'confidence': fact.confidence,
                    'source': fact.source
                })
        
        # Recursively gather related concepts (if depth > 0)
        if depth > 0:
            for relation_type, related_concept_ids in concept_node.relationships.items():
                for related_id in related_concept_ids[:3]:  # Limit to prevent explosion
                    related_concept = self.concepts.get(related_id)
                    if related_concept and related_concept.confidence >= min_confidence:
                        related_info = await self._gather_concept_information(
                            related_concept, depth - 1, min_confidence
                        )
                        concept_info['related_concepts'].append(related_info)
        
        return concept_info
    
    async def _broad_knowledge_search(
        self, 
        query: str, 
        min_confidence: float
    ) -> Dict[str, Any]:
        """Perform broader search when no direct concept matches"""
        
        query_words = set(query.lower().split())
        results = {
            'concepts': [],
            'facts': [],
            'relationships': []
        }
        
        # Search through all facts for relevance
        for fact in self.facts.values():
            if fact.confidence >= min_confidence:
                fact_text = f"{fact.subject} {fact.predicate} {fact.object}".lower()
                fact_words = set(fact_text.split())
                
                # Check for word overlap
                if query_words.intersection(fact_words):
                    results['facts'].append({
                        'subject': fact.subject,
                        'predicate': fact.predicate,
                        'object': fact.object,
                        'confidence': fact.confidence,
                        'relevance': len(query_words.intersection(fact_words)) / len(query_words)
                    })
        
        # Sort by relevance
        results['facts'].sort(key=lambda x: x['relevance'], reverse=True)
        results['facts'] = results['facts'][:10]  # Limit results
        
        return results
    
    async def _detect_contradictions(
        self, 
        concept_node: ConceptNode, 
        new_information: Dict[str, Any]
    ) -> List[str]:
        """Detect contradictions between existing and new knowledge"""
        contradictions = []
        
        # Check for contradicting facts
        new_facts = new_information.get('facts', [])
        for new_fact in new_facts:
            for existing_fact_id in concept_node.facts:
                existing_fact = self.facts.get(existing_fact_id)
                if existing_fact and self._facts_contradict(existing_fact, new_fact):
                    contradictions.append(f"Fact contradiction: {existing_fact_id}")
        
        return contradictions
    
    def _facts_contradict(self, fact1: KnowledgeFact, fact2: Dict[str, str]) -> bool:
        """Check if two facts contradict each other"""
        # Simple contradiction detection (enhance with domain knowledge)
        if (fact1.subject == fact2.get('subject') and 
            fact1.predicate == fact2.get('predicate') and
            fact1.object != fact2.get('object')):
            return True
        
        return False
    
    async def _resolve_contradictions(
        self, 
        concept_node: ConceptNode, 
        new_information: Dict[str, Any], 
        contradictions: List[str]
    ) -> bool:
        """Attempt to resolve knowledge contradictions"""
        
        # Simple resolution strategy: trust higher confidence information
        resolution_count = 0
        
        for contradiction in contradictions:
            if "Fact contradiction:" in contradiction:
                fact_id = contradiction.split(": ")[1]
                existing_fact = self.facts.get(fact_id)
                
                if existing_fact:
                    # Compare confidence levels and resolve
                    new_confidence = new_information.get('confidence', 1.0)
                    if new_confidence > existing_fact.confidence:
                        # Remove old fact
                        del self.facts[fact_id]
                        if fact_id in concept_node.facts:
                            concept_node.facts.remove(fact_id)
                        resolution_count += 1
        
        logger.info(f"🔧 Resolved {resolution_count} contradictions")
        return resolution_count == len(contradictions)
    
    async def _apply_knowledge_updates(
        self, 
        concept_node: ConceptNode, 
        new_information: Dict[str, Any]
    ) -> bool:
        """Apply knowledge updates to concept"""
        
        try:
            # Update properties
            if 'properties' in new_information:
                concept_node.properties.update(new_information['properties'])
            
            # Add new relationships
            if 'relations' in new_information:
                for relation_data in new_information['relations']:
                    subject, relation_type, obj = relation_data
                    await self._store_relationship(
                        subject, relation_type, obj,
                        new_information.get('confidence', 1.0),
                        new_information.get('source', 'update')
                    )
            
            # Add new facts
            if 'facts' in new_information:
                for fact_data in new_information['facts']:
                    await self._store_fact(
                        subject=fact_data.get('subject', concept_node.name),
                        predicate=fact_data.get('predicate', ''),
                        obj=fact_data.get('object', ''),
                        confidence=new_information.get('confidence', 1.0),
                        source=new_information.get('source', 'update')
                    )
            
            return True
            
        except Exception as e:
            logger.error(f"Error applying knowledge updates: {e}")
            return False
    
    async def _build_concept_hierarchy(
        self, 
        concept_node: ConceptNode, 
        max_depth: int, 
        visited: Set[str]
    ) -> Dict[str, Any]:
        """Build hierarchical structure of concept relationships"""
        
        if max_depth <= 0 or concept_node.id in visited:
            return {'name': concept_node.name, 'id': concept_node.id}
        
        visited.add(concept_node.id)
        
        hierarchy = {
            'name': concept_node.name,
            'id': concept_node.id,
            'children': []
        }
        
        # Get "is_a" relationships for hierarchy
        if RelationType.IS_A.value in concept_node.relationships:
            for child_id in concept_node.relationships[RelationType.IS_A.value]:
                child_concept = self.concepts.get(child_id)
                if child_concept:
                    child_hierarchy = await self._build_concept_hierarchy(
                        child_concept, max_depth - 1, visited.copy()
                    )
                    hierarchy['children'].append(child_hierarchy)
        
        return hierarchy
    
    async def _calculate_concept_similarity(
        self, 
        concept1: ConceptNode, 
        concept2: ConceptNode
    ) -> Dict[str, Any]:
        """Calculate similarity between two concepts"""
        
        similarity_data = {
            'similarity_score': 0.0,
            'shared_properties': [],
            'shared_relations': [],
            'concept1': concept1.name,
            'concept2': concept2.name
        }
        
        # Calculate property similarity
        prop1_keys = set(concept1.properties.keys())
        prop2_keys = set(concept2.properties.keys())
        shared_props = prop1_keys.intersection(prop2_keys)
        
        similarity_data['shared_properties'] = list(shared_props)
        property_similarity = len(shared_props) / max(len(prop1_keys), len(prop2_keys), 1)
        
        # Calculate relationship similarity
        rel1_types = set(concept1.relationships.keys())
        rel2_types = set(concept2.relationships.keys())
        shared_rels = rel1_types.intersection(rel2_types)
        
        similarity_data['shared_relations'] = list(shared_rels)
        relation_similarity = len(shared_rels) / max(len(rel1_types), len(rel2_types), 1)
        
        # Combined similarity score
        similarity_data['similarity_score'] = (property_similarity + relation_similarity) / 2
        
        return similarity_data

# Global semantic memory instance
semantic_memory = None

def get_semantic_memory_system() -> SemanticMemorySystem:
    """Get global semantic memory system instance"""
    global semantic_memory
    if semantic_memory is None:
        semantic_memory = SemanticMemorySystem()
    return semantic_memory

if __name__ == "__main__":
    # Test semantic memory system
    async def test_semantic_memory():
        memory_system = SemanticMemorySystem()
        
        # Store test knowledge
        await memory_system.store_knowledge(
            concept="dog",
            relations=[
                ("dog", RelationType.IS_A, "animal"),
                ("dog", RelationType.HAS_PROPERTY, "loyal"),
                ("dog", RelationType.USED_FOR, "companionship")
            ],
            facts=[
                {"subject": "dog", "predicate": "has_legs", "object": "four"},
                {"subject": "dog", "predicate": "makes_sound", "object": "bark"}
            ]
        )
        
        # Query knowledge
        results = await memory_system.query_knowledge("What is a dog?")
        print(f"Query results: {len(results['concepts'])} concepts found")
        
        # Test hierarchy
        hierarchy = await memory_system.get_concept_hierarchy("dog")
        print(f"Concept hierarchy: {hierarchy}")
        
        # Test similarity
        await memory_system.store_knowledge(
            concept="cat",
            relations=[
                ("cat", RelationType.IS_A, "animal"),
                ("cat", RelationType.HAS_PROPERTY, "independent"),
                ("cat", RelationType.USED_FOR, "companionship")
            ],
            facts=[
                {"subject": "cat", "predicate": "has_legs", "object": "four"},
                {"subject": "cat", "predicate": "makes_sound", "object": "meow"}
            ]
        )
        
        similarity = await memory_system.find_conceptual_similarities("dog", "cat")
        print(f"Dog-Cat similarity: {similarity['similarity_score']:.2f}")
    
    asyncio.run(test_semantic_memory())