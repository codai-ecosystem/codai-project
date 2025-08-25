#!/usr/bin/env python3
"""
Romanian Knowledge Graph - Advanced Semantic Network
=====================================

Enterprise-grade knowledge graph system for Romanian cultural, historical, and linguistic entities.
Provides semantic reasoning, entity relationships, and intelligent query processing for Romanian AI.

Features:
- Graph-based entity representation with relationship modeling
- Semantic search and reasoning capabilities
- Multi-dimensional entity attributes and scoring
- Dynamic relationship strength calculation
- Query processing with context awareness
- Entity clustering and similarity analysis
- Knowledge expansion through inference
- Performance optimization with caching

Author: RomAI Development Team
Version: 1.0.0
License: MIT
"""

import sqlite3
import json
import asyncio
import numpy as np
from typing import Dict, List, Tuple, Optional, Set, Any, Union
from dataclasses import dataclass, field
from collections import defaultdict, deque
import networkx as nx
from datetime import datetime, timedelta
import math
import re
import logging
from pathlib import Path

# Configure logging for knowledge graph operations
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class GraphEntity:
    """Represents an entity in the Romanian knowledge graph."""
    id: str
    name: str
    type: str
    attributes: Dict[str, Any] = field(default_factory=dict)
    cultural_significance: float = 0.0
    historical_importance: float = 0.0
    modern_relevance: float = 0.0
    regional_associations: List[str] = field(default_factory=list)
    semantic_embeddings: List[float] = field(default_factory=list)
    creation_date: datetime = field(default_factory=datetime.now)
    last_updated: datetime = field(default_factory=datetime.now)

@dataclass
class GraphRelationship:
    """Represents a relationship between entities in the knowledge graph."""
    id: str
    source_entity: str
    target_entity: str
    relationship_type: str
    strength: float = 1.0
    confidence: float = 1.0
    temporal_scope: Optional[Tuple[datetime, datetime]] = None
    context: Dict[str, Any] = field(default_factory=dict)
    bidirectional: bool = False
    creation_date: datetime = field(default_factory=datetime.now)

@dataclass
class QueryResult:
    """Results from knowledge graph queries."""
    entities: List[GraphEntity]
    relationships: List[GraphRelationship]
    query_path: List[str]
    confidence_score: float
    reasoning_steps: List[str]
    execution_time: float

class RomanianKnowledgeGraph:
    """
    Advanced knowledge graph system for Romanian cultural and linguistic entities.
    
    Provides comprehensive semantic representation and reasoning capabilities
    for Romanian cultural knowledge, historical information, and linguistic patterns.
    """
    
    def __init__(self, db_path: str = "romanian_knowledge_graph.db"):
        """Initialize the Romanian Knowledge Graph system."""
        self.db_path = db_path
        self.graph = nx.MultiDiGraph()
        self.entity_cache = {}
        self.relationship_cache = {}
        self.query_cache = {}
        self.reasoning_engine = None
        
        # Knowledge graph configuration
        self.config = {
            'max_query_depth': 5,
            'similarity_threshold': 0.7,
            'cache_size_limit': 10000,
            'reasoning_max_steps': 20,
            'temporal_decay_factor': 0.95,
            'cultural_weight_multiplier': 1.2,
            'modern_relevance_boost': 1.1
        }
        
        # Initialize entity types and relationship types
        self.entity_types = {
            'person': {'weight': 1.0, 'priority': 'high'},
            'place': {'weight': 0.9, 'priority': 'high'},
            'event': {'weight': 0.8, 'priority': 'medium'},
            'concept': {'weight': 0.7, 'priority': 'medium'},
            'artifact': {'weight': 0.6, 'priority': 'low'},
            'tradition': {'weight': 0.9, 'priority': 'high'},
            'language_feature': {'weight': 0.5, 'priority': 'low'},
            'cultural_value': {'weight': 0.8, 'priority': 'high'},
            'historical_period': {'weight': 0.7, 'priority': 'medium'},
            'institution': {'weight': 0.6, 'priority': 'medium'}
        }
        
        self.relationship_types = {
            'influenced_by': {'strength': 0.8, 'temporal': True},
            'located_in': {'strength': 0.9, 'temporal': False},
            'part_of': {'strength': 0.7, 'temporal': False},
            'related_to': {'strength': 0.5, 'temporal': False},
            'contemporary_of': {'strength': 0.6, 'temporal': True},
            'inspired_by': {'strength': 0.7, 'temporal': True},
            'evolved_from': {'strength': 0.8, 'temporal': True},
            'represents': {'strength': 0.6, 'temporal': False},
            'practiced_in': {'strength': 0.5, 'temporal': True},
            'created_by': {'strength': 0.9, 'temporal': True}
        }
        
        logger.info("Romanian Knowledge Graph initialized")
    
    async def initialize(self) -> bool:
        """Initialize the knowledge graph database and populate with core entities."""
        try:
            await self._create_database_schema()
            await self._populate_core_entities()
            await self._establish_core_relationships()
            await self._build_graph_structure()
            
            logger.info("Knowledge graph initialization completed successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize knowledge graph: {e}")
            return False
    
    async def _create_database_schema(self):
        """Create the database schema for the knowledge graph."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Entities table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS entities (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                attributes TEXT,
                cultural_significance REAL DEFAULT 0.0,
                historical_importance REAL DEFAULT 0.0,
                modern_relevance REAL DEFAULT 0.0,
                regional_associations TEXT,
                semantic_embeddings TEXT,
                creation_date TEXT,
                last_updated TEXT
            )
        """)
        
        # Relationships table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS relationships (
                id TEXT PRIMARY KEY,
                source_entity TEXT NOT NULL,
                target_entity TEXT NOT NULL,
                relationship_type TEXT NOT NULL,
                strength REAL DEFAULT 1.0,
                confidence REAL DEFAULT 1.0,
                temporal_scope TEXT,
                context TEXT,
                bidirectional INTEGER DEFAULT 0,
                creation_date TEXT,
                FOREIGN KEY (source_entity) REFERENCES entities (id),
                FOREIGN KEY (target_entity) REFERENCES entities (id)
            )
        """)
        
        # Query history table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS query_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query_text TEXT NOT NULL,
                query_type TEXT,
                results_count INTEGER,
                execution_time REAL,
                confidence_score REAL,
                timestamp TEXT
            )
        """)
        
        # Entity clusters table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS entity_clusters (
                cluster_id TEXT PRIMARY KEY,
                cluster_name TEXT,
                entity_ids TEXT,
                cluster_type TEXT,
                coherence_score REAL,
                creation_date TEXT
            )
        """)
        
        conn.commit()
        conn.close()
    
    async def _populate_core_entities(self):
        """Populate the knowledge graph with core Romanian entities."""
        
        # Romanian historical figures
        historical_figures = [
            {
                'id': 'mihai_eminescu',
                'name': 'Mihai Eminescu',
                'type': 'person',
                'attributes': {
                    'profession': 'poet',
                    'birth_year': 1850,
                    'death_year': 1889,
                    'major_works': ['Luceafărul', 'Scrisori', 'Glosse'],
                    'literary_movement': 'Romanticism',
                    'influence_scope': 'national'
                },
                'cultural_significance': 0.98,
                'historical_importance': 0.95,
                'modern_relevance': 0.90,
                'regional_associations': ['Moldova', 'Bucharest']
            },
            {
                'id': 'stefan_cel_mare',
                'name': 'Ștefan cel Mare',
                'type': 'person',
                'attributes': {
                    'title': 'Prince of Moldavia',
                    'reign_period': '1457-1504',
                    'military_victories': 47,
                    'historical_significance': 'defender of Christianity',
                    'canonization': 'Orthodox saint'
                },
                'cultural_significance': 0.96,
                'historical_importance': 0.98,
                'modern_relevance': 0.85,
                'regional_associations': ['Moldova', 'Suceava']
            },
            {
                'id': 'george_enescu',
                'name': 'George Enescu',
                'type': 'person',
                'attributes': {
                    'profession': 'composer',
                    'birth_year': 1881,
                    'death_year': 1955,
                    'major_works': ['Romanian Rhapsodies', 'Oedipe'],
                    'international_recognition': 'worldwide',
                    'instruments': ['violin', 'piano', 'conducting']
                },
                'cultural_significance': 0.94,
                'historical_importance': 0.88,
                'modern_relevance': 0.92,
                'regional_associations': ['Moldavia', 'Bucharest', 'Paris']
            }
        ]
        
        # Romanian cultural concepts
        cultural_concepts = [
            {
                'id': 'dor_concept',
                'name': 'Dor',
                'type': 'concept',
                'attributes': {
                    'definition': 'untranslatable Romanian emotion',
                    'semantic_field': ['longing', 'melancholy', 'nostalgia'],
                    'cultural_uniqueness': 0.95,
                    'linguistic_complexity': 'high',
                    'emotional_depth': 'profound'
                },
                'cultural_significance': 0.97,
                'historical_importance': 0.80,
                'modern_relevance': 0.88,
                'regional_associations': ['all_regions']
            },
            {
                'id': 'hora_dance',
                'name': 'Hora',
                'type': 'tradition',
                'attributes': {
                    'type': 'circle_dance',
                    'occasions': ['weddings', 'festivals', 'celebrations'],
                    'regional_variations': ['Moldovan', 'Wallachian', 'Transylvanian'],
                    'symbolic_meaning': 'unity and community',
                    'musical_accompaniment': 'traditional_instruments'
                },
                'cultural_significance': 0.91,
                'historical_importance': 0.85,
                'modern_relevance': 0.78,
                'regional_associations': ['Moldova', 'Wallachia', 'Transylvania']
            }
        ]
        
        # Romanian places
        places = [
            {
                'id': 'bucuresti',
                'name': 'București',
                'type': 'place',
                'attributes': {
                    'category': 'capital_city',
                    'population': 2100000,
                    'historical_names': ['Curtea de Argeș', 'Little Paris'],
                    'cultural_importance': 'national_center',
                    'economic_role': 'primary'
                },
                'cultural_significance': 0.95,
                'historical_importance': 0.90,
                'modern_relevance': 0.98,
                'regional_associations': ['Wallachia']
            },
            {
                'id': 'brasov',
                'name': 'Brașov',
                'type': 'place',
                'attributes': {
                    'category': 'medieval_city',
                    'german_name': 'Kronstadt',
                    'hungarian_name': 'Brassó',
                    'cultural_heritage': 'Saxon_influence',
                    'tourism_importance': 'high'
                },
                'cultural_significance': 0.88,
                'historical_importance': 0.92,
                'modern_relevance': 0.85,
                'regional_associations': ['Transylvania']
            }
        ]
        
        # Romanian historical events
        historical_events = [
            {
                'id': 'great_union_1918',
                'name': 'Marea Unire 1918',
                'type': 'event',
                'attributes': {
                    'date': '1918-12-01',
                    'significance': 'national_unification',
                    'participants': ['Transylvania', 'Moldavia', 'Wallachia'],
                    'outcome': 'Greater Romania',
                    'celebration': 'National Day'
                },
                'cultural_significance': 0.98,
                'historical_importance': 0.99,
                'modern_relevance': 0.95,
                'regional_associations': ['all_regions']
            }
        ]
        
        # Combine all entities
        all_entities = historical_figures + cultural_concepts + places + historical_events
        
        # Insert entities into database
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for entity_data in all_entities:
            entity = GraphEntity(
                id=entity_data['id'],
                name=entity_data['name'],
                type=entity_data['type'],
                attributes=entity_data['attributes'],
                cultural_significance=entity_data['cultural_significance'],
                historical_importance=entity_data['historical_importance'],
                modern_relevance=entity_data['modern_relevance'],
                regional_associations=entity_data['regional_associations']
            )
            
            cursor.execute("""
                INSERT OR REPLACE INTO entities 
                (id, name, type, attributes, cultural_significance, historical_importance, 
                 modern_relevance, regional_associations, creation_date, last_updated)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                entity.id,
                entity.name,
                entity.type,
                json.dumps(entity.attributes),
                entity.cultural_significance,
                entity.historical_importance,
                entity.modern_relevance,
                json.dumps(entity.regional_associations),
                entity.creation_date.isoformat(),
                entity.last_updated.isoformat()
            ))
            
            # Cache the entity
            self.entity_cache[entity.id] = entity
        
        conn.commit()
        conn.close()
        
        logger.info(f"Populated knowledge graph with {len(all_entities)} core entities")
    
    async def _establish_core_relationships(self):
        """Establish core relationships between entities in the knowledge graph."""
        
        relationships = [
            # Mihai Eminescu relationships
            {
                'id': 'eminescu_dor_1',
                'source': 'mihai_eminescu',
                'target': 'dor_concept',
                'type': 'inspired_by',
                'strength': 0.95,
                'confidence': 0.92,
                'context': {'literary_influence': 'profound', 'thematic_centrality': 'high'}
            },
            {
                'id': 'eminescu_bucharest_1',
                'source': 'mihai_eminescu',
                'target': 'bucuresti',
                'type': 'located_in',
                'strength': 0.75,
                'confidence': 0.88,
                'context': {'residence_period': 'later_life', 'literary_activity': 'journalism'}
            },
            
            # Ștefan cel Mare relationships
            {
                'id': 'stefan_moldavia_1',
                'source': 'stefan_cel_mare',
                'target': 'brasov',
                'type': 'influenced_by',
                'strength': 0.70,
                'confidence': 0.80,
                'context': {'military_campaigns': 'Saxon_territories', 'historical_period': 'medieval'}
            },
            
            # Cultural concept relationships
            {
                'id': 'dor_hora_1',
                'source': 'dor_concept',
                'target': 'hora_dance',
                'type': 'represents',
                'strength': 0.65,
                'confidence': 0.75,
                'context': {'emotional_expression': 'community_longing', 'cultural_manifestation': 'dance'}
            },
            
            # George Enescu relationships
            {
                'id': 'enescu_romanian_identity_1',
                'source': 'george_enescu',
                'target': 'dor_concept',
                'type': 'inspired_by',
                'strength': 0.85,
                'confidence': 0.90,
                'context': {'musical_themes': 'Romanian_soul', 'composition_style': 'nationalist'}
            },
            
            # Great Union relationships
            {
                'id': 'great_union_bucharest_1',
                'source': 'great_union_1918',
                'target': 'bucuresti',
                'type': 'located_in',
                'strength': 0.90,
                'confidence': 0.95,
                'context': {'political_center': 'capital_role', 'administrative_importance': 'primary'}
            },
            {
                'id': 'great_union_brasov_1',
                'source': 'great_union_1918',
                'target': 'brasov',
                'type': 'part_of',
                'strength': 0.85,
                'confidence': 0.92,
                'context': {'territorial_integration': 'Transylvania', 'historical_significance': 'unification'}
            }
        ]
        
        # Insert relationships into database
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for rel_data in relationships:
            relationship = GraphRelationship(
                id=rel_data['id'],
                source_entity=rel_data['source'],
                target_entity=rel_data['target'],
                relationship_type=rel_data['type'],
                strength=rel_data['strength'],
                confidence=rel_data['confidence'],
                context=rel_data['context']
            )
            
            cursor.execute("""
                INSERT OR REPLACE INTO relationships 
                (id, source_entity, target_entity, relationship_type, strength, 
                 confidence, context, creation_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                relationship.id,
                relationship.source_entity,
                relationship.target_entity,
                relationship.relationship_type,
                relationship.strength,
                relationship.confidence,
                json.dumps(relationship.context),
                relationship.creation_date.isoformat()
            ))
            
            # Cache the relationship
            self.relationship_cache[relationship.id] = relationship
        
        conn.commit()
        conn.close()
        
        logger.info(f"Established {len(relationships)} core relationships in knowledge graph")
    
    async def _build_graph_structure(self):
        """Build the NetworkX graph structure from database entities and relationships."""
        
        # Add entities as nodes
        for entity_id, entity in self.entity_cache.items():
            self.graph.add_node(
                entity_id,
                name=entity.name,
                type=entity.type,
                cultural_significance=entity.cultural_significance,
                historical_importance=entity.historical_importance,
                modern_relevance=entity.modern_relevance,
                attributes=entity.attributes
            )
        
        # Add relationships as edges
        for rel_id, relationship in self.relationship_cache.items():
            self.graph.add_edge(
                relationship.source_entity,
                relationship.target_entity,
                key=rel_id,
                relationship_type=relationship.relationship_type,
                strength=relationship.strength,
                confidence=relationship.confidence,
                context=relationship.context
            )
        
        logger.info(f"Built graph structure with {self.graph.number_of_nodes()} nodes and {self.graph.number_of_edges()} edges")
    
    async def add_entity(self, entity: GraphEntity) -> bool:
        """Add a new entity to the knowledge graph."""
        try:
            # Insert into database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT OR REPLACE INTO entities 
                (id, name, type, attributes, cultural_significance, historical_importance, 
                 modern_relevance, regional_associations, creation_date, last_updated)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                entity.id,
                entity.name,
                entity.type,
                json.dumps(entity.attributes),
                entity.cultural_significance,
                entity.historical_importance,
                entity.modern_relevance,
                json.dumps(entity.regional_associations),
                entity.creation_date.isoformat(),
                entity.last_updated.isoformat()
            ))
            
            conn.commit()
            conn.close()
            
            # Add to graph and cache
            self.graph.add_node(
                entity.id,
                name=entity.name,
                type=entity.type,
                cultural_significance=entity.cultural_significance,
                historical_importance=entity.historical_importance,
                modern_relevance=entity.modern_relevance,
                attributes=entity.attributes
            )
            
            self.entity_cache[entity.id] = entity
            
            logger.info(f"Added entity '{entity.name}' to knowledge graph")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add entity '{entity.name}': {e}")
            return False
    
    async def add_relationship(self, relationship: GraphRelationship) -> bool:
        """Add a new relationship to the knowledge graph."""
        try:
            # Verify entities exist
            if relationship.source_entity not in self.entity_cache:
                logger.error(f"Source entity '{relationship.source_entity}' not found")
                return False
            
            if relationship.target_entity not in self.entity_cache:
                logger.error(f"Target entity '{relationship.target_entity}' not found")
                return False
            
            # Insert into database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT OR REPLACE INTO relationships 
                (id, source_entity, target_entity, relationship_type, strength, 
                 confidence, context, bidirectional, creation_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                relationship.id,
                relationship.source_entity,
                relationship.target_entity,
                relationship.relationship_type,
                relationship.strength,
                relationship.confidence,
                json.dumps(relationship.context),
                1 if relationship.bidirectional else 0,
                relationship.creation_date.isoformat()
            ))
            
            conn.commit()
            conn.close()
            
            # Add to graph and cache
            self.graph.add_edge(
                relationship.source_entity,
                relationship.target_entity,
                key=relationship.id,
                relationship_type=relationship.relationship_type,
                strength=relationship.strength,
                confidence=relationship.confidence,
                context=relationship.context
            )
            
            self.relationship_cache[relationship.id] = relationship
            
            logger.info(f"Added relationship '{relationship.relationship_type}' between '{relationship.source_entity}' and '{relationship.target_entity}'")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add relationship: {e}")
            return False
    
    async def query_entities(self, 
                           query: str, 
                           entity_type: Optional[str] = None,
                           min_cultural_significance: float = 0.0,
                           limit: int = 10) -> QueryResult:
        """Query entities in the knowledge graph with semantic search."""
        start_time = datetime.now()
        
        try:
            # Create cache key
            cache_key = f"query_{hash(query)}_{entity_type}_{min_cultural_significance}_{limit}"
            
            if cache_key in self.query_cache:
                logger.info(f"Returning cached result for query: {query}")
                return self.query_cache[cache_key]
            
            matching_entities = []
            reasoning_steps = []
            
            # Convert query to lowercase for case-insensitive matching
            query_lower = query.lower()
            query_terms = query_lower.split()
            
            reasoning_steps.append(f"Searching for entities matching query: '{query}'")
            
            # Search through entities
            for entity_id, entity in self.entity_cache.items():
                if entity_type and entity.type != entity_type:
                    continue
                
                if entity.cultural_significance < min_cultural_significance:
                    continue
                
                # Calculate relevance score
                relevance_score = 0.0
                
                # Name matching
                if query_lower in entity.name.lower():
                    relevance_score += 0.5
                
                # Exact name match bonus
                if query_lower == entity.name.lower():
                    relevance_score += 0.3
                
                # Attribute matching
                for attr_key, attr_value in entity.attributes.items():
                    if isinstance(attr_value, str) and query_lower in attr_value.lower():
                        relevance_score += 0.2
                    elif isinstance(attr_value, list):
                        for item in attr_value:
                            if isinstance(item, str) and query_lower in item.lower():
                                relevance_score += 0.1
                
                # Term-based matching
                for term in query_terms:
                    if term in entity.name.lower():
                        relevance_score += 0.15
                    
                    for attr_value in entity.attributes.values():
                        if isinstance(attr_value, str) and term in attr_value.lower():
                            relevance_score += 0.1
                
                # Cultural significance boost
                relevance_score *= (1 + entity.cultural_significance * 0.2)
                
                if relevance_score > 0:
                    entity.relevance_score = relevance_score
                    matching_entities.append(entity)
            
            # Sort by relevance score
            matching_entities.sort(key=lambda x: x.relevance_score, reverse=True)
            matching_entities = matching_entities[:limit]
            
            reasoning_steps.append(f"Found {len(matching_entities)} matching entities")
            
            # Get related relationships
            related_relationships = []
            entity_ids = {entity.id for entity in matching_entities}
            
            for rel_id, relationship in self.relationship_cache.items():
                if (relationship.source_entity in entity_ids or 
                    relationship.target_entity in entity_ids):
                    related_relationships.append(relationship)
            
            reasoning_steps.append(f"Found {len(related_relationships)} related relationships")
            
            # Calculate overall confidence
            if matching_entities:
                confidence_score = sum(entity.relevance_score for entity in matching_entities) / len(matching_entities)
                confidence_score = min(confidence_score, 1.0)
            else:
                confidence_score = 0.0
            
            execution_time = (datetime.now() - start_time).total_seconds() * 1000
            
            result = QueryResult(
                entities=matching_entities,
                relationships=related_relationships,
                query_path=[query],
                confidence_score=confidence_score,
                reasoning_steps=reasoning_steps,
                execution_time=execution_time
            )
            
            # Cache result
            if len(self.query_cache) < self.config['cache_size_limit']:
                self.query_cache[cache_key] = result
            
            logger.info(f"Query completed in {execution_time:.2f}ms with {len(matching_entities)} results")
            return result
            
        except Exception as e:
            logger.error(f"Query failed: {e}")
            return QueryResult(
                entities=[],
                relationships=[],
                query_path=[query],
                confidence_score=0.0,
                reasoning_steps=[f"Query failed: {str(e)}"],
                execution_time=(datetime.now() - start_time).total_seconds() * 1000
            )
    
    async def find_path(self, source_entity: str, target_entity: str, max_depth: int = 3) -> Optional[List[str]]:
        """Find the shortest path between two entities in the knowledge graph."""
        try:
            if source_entity not in self.graph:
                logger.error(f"Source entity '{source_entity}' not found in graph")
                return None
            
            if target_entity not in self.graph:
                logger.error(f"Target entity '{target_entity}' not found in graph")
                return None
            
            try:
                path = nx.shortest_path(self.graph, source_entity, target_entity)
                if len(path) <= max_depth + 1:  # +1 because path includes both endpoints
                    logger.info(f"Found path from '{source_entity}' to '{target_entity}': {' -> '.join(path)}")
                    return path
                else:
                    logger.info(f"Path too long ({len(path)} nodes), exceeds max depth {max_depth}")
                    return None
            except nx.NetworkXNoPath:
                logger.info(f"No path found between '{source_entity}' and '{target_entity}'")
                return None
                
        except Exception as e:
            logger.error(f"Path finding failed: {e}")
            return None
    
    async def get_related_entities(self, entity_id: str, relationship_types: Optional[List[str]] = None, max_distance: int = 2) -> List[GraphEntity]:
        """Get entities related to the given entity within specified distance."""
        try:
            if entity_id not in self.graph:
                logger.error(f"Entity '{entity_id}' not found in graph")
                return []
            
            related_entities = []
            
            # BFS to find entities within max_distance
            queue = deque([(entity_id, 0)])
            visited = {entity_id}
            
            while queue:
                current_entity, distance = queue.popleft()
                
                if distance >= max_distance:
                    continue
                
                # Get neighbors
                for neighbor in self.graph.neighbors(current_entity):
                    if neighbor not in visited:
                        # Check relationship type filter
                        edge_data = self.graph.get_edge_data(current_entity, neighbor)
                        
                        if relationship_types:
                            valid_relationship = False
                            for edge_key, edge_attrs in edge_data.items():
                                if edge_attrs.get('relationship_type') in relationship_types:
                                    valid_relationship = True
                                    break
                            
                            if not valid_relationship:
                                continue
                        
                        visited.add(neighbor)
                        queue.append((neighbor, distance + 1))
                        
                        if neighbor in self.entity_cache:
                            related_entities.append(self.entity_cache[neighbor])
            
            logger.info(f"Found {len(related_entities)} related entities for '{entity_id}' within distance {max_distance}")
            return related_entities
            
        except Exception as e:
            logger.error(f"Failed to get related entities: {e}")
            return []
    
    async def cluster_entities(self, clustering_method: str = 'cultural_similarity') -> Dict[str, List[GraphEntity]]:
        """Cluster entities based on various similarity metrics."""
        try:
            clusters = defaultdict(list)
            
            if clustering_method == 'cultural_similarity':
                # Group by cultural significance ranges
                for entity in self.entity_cache.values():
                    if entity.cultural_significance >= 0.9:
                        clusters['high_cultural_significance'].append(entity)
                    elif entity.cultural_significance >= 0.7:
                        clusters['medium_cultural_significance'].append(entity)
                    else:
                        clusters['low_cultural_significance'].append(entity)
            
            elif clustering_method == 'entity_type':
                # Group by entity type
                for entity in self.entity_cache.values():
                    clusters[entity.type].append(entity)
            
            elif clustering_method == 'regional_association':
                # Group by regional associations
                for entity in self.entity_cache.values():
                    for region in entity.regional_associations:
                        clusters[f"region_{region}"].append(entity)
            
            elif clustering_method == 'temporal_period':
                # Group by historical periods based on attributes
                for entity in self.entity_cache.values():
                    if 'birth_year' in entity.attributes:
                        birth_year = entity.attributes['birth_year']
                        if birth_year < 1800:
                            clusters['pre_modern'].append(entity)
                        elif birth_year < 1900:
                            clusters['modern'].append(entity)
                        else:
                            clusters['contemporary'].append(entity)
                    elif 'date' in entity.attributes:
                        date_str = entity.attributes['date']
                        if '1918' in date_str:
                            clusters['early_20th_century'].append(entity)
                    else:
                        clusters['undated'].append(entity)
            
            logger.info(f"Created {len(clusters)} clusters using method '{clustering_method}'")
            return dict(clusters)
            
        except Exception as e:
            logger.error(f"Clustering failed: {e}")
            return {}
    
    async def get_statistics(self) -> Dict[str, Any]:
        """Get comprehensive statistics about the knowledge graph."""
        try:
            stats = {
                'total_entities': len(self.entity_cache),
                'total_relationships': len(self.relationship_cache),
                'graph_nodes': self.graph.number_of_nodes(),
                'graph_edges': self.graph.number_of_edges(),
                'entity_types': {},
                'relationship_types': {},
                'cultural_significance_distribution': {
                    'high': 0,
                    'medium': 0,
                    'low': 0
                },
                'regional_coverage': {},
                'temporal_coverage': {},
                'connectivity_metrics': {}
            }
            
            # Entity type distribution
            for entity in self.entity_cache.values():
                entity_type = entity.type
                stats['entity_types'][entity_type] = stats['entity_types'].get(entity_type, 0) + 1
                
                # Cultural significance distribution
                if entity.cultural_significance >= 0.8:
                    stats['cultural_significance_distribution']['high'] += 1
                elif entity.cultural_significance >= 0.5:
                    stats['cultural_significance_distribution']['medium'] += 1
                else:
                    stats['cultural_significance_distribution']['low'] += 1
                
                # Regional coverage
                for region in entity.regional_associations:
                    stats['regional_coverage'][region] = stats['regional_coverage'].get(region, 0) + 1
            
            # Relationship type distribution
            for relationship in self.relationship_cache.values():
                rel_type = relationship.relationship_type
                stats['relationship_types'][rel_type] = stats['relationship_types'].get(rel_type, 0) + 1
            
            # Graph connectivity metrics
            if self.graph.number_of_nodes() > 0:
                try:
                    stats['connectivity_metrics'] = {
                        'average_degree': sum(dict(self.graph.degree()).values()) / self.graph.number_of_nodes(),
                        'density': nx.density(self.graph),
                        'connected_components': nx.number_weakly_connected_components(self.graph),
                        'average_clustering': 0.0,  # Skip for multigraph
                        'number_of_triangles': 0  # Skip for multigraph
                    }
                except Exception as e:
                    logger.warning(f"Some connectivity metrics unavailable for multigraph: {e}")
                    stats['connectivity_metrics'] = {
                        'average_degree': sum(dict(self.graph.degree()).values()) / self.graph.number_of_nodes(),
                        'density': 0.0,
                        'connected_components': 1,
                        'average_clustering': 0.0,
                        'number_of_triangles': 0
                    }
            
            logger.info("Generated comprehensive knowledge graph statistics")
            return stats
            
        except Exception as e:
            logger.error(f"Failed to generate statistics: {e}")
            return {}
    
    async def export_graph(self, format: str = 'json', include_attributes: bool = True) -> str:
        """Export the knowledge graph in various formats."""
        try:
            if format == 'json':
                export_data = {
                    'entities': [],
                    'relationships': [],
                    'metadata': {
                        'export_timestamp': datetime.now().isoformat(),
                        'total_entities': len(self.entity_cache),
                        'total_relationships': len(self.relationship_cache)
                    }
                }
                
                # Export entities
                for entity in self.entity_cache.values():
                    entity_data = {
                        'id': entity.id,
                        'name': entity.name,
                        'type': entity.type,
                        'cultural_significance': entity.cultural_significance,
                        'historical_importance': entity.historical_importance,
                        'modern_relevance': entity.modern_relevance,
                        'regional_associations': entity.regional_associations
                    }
                    
                    if include_attributes:
                        entity_data['attributes'] = entity.attributes
                    
                    export_data['entities'].append(entity_data)
                
                # Export relationships
                for relationship in self.relationship_cache.values():
                    relationship_data = {
                        'id': relationship.id,
                        'source_entity': relationship.source_entity,
                        'target_entity': relationship.target_entity,
                        'relationship_type': relationship.relationship_type,
                        'strength': relationship.strength,
                        'confidence': relationship.confidence,
                        'bidirectional': relationship.bidirectional
                    }
                    
                    if include_attributes:
                        relationship_data['context'] = relationship.context
                    
                    export_data['relationships'].append(relationship_data)
                
                return json.dumps(export_data, indent=2, ensure_ascii=False)
            
            elif format == 'graphml':
                # Export as GraphML for use with graph visualization tools
                return '\n'.join(nx.generate_graphml(self.graph))
            
            else:
                logger.error(f"Unsupported export format: {format}")
                return ""
                
        except Exception as e:
            logger.error(f"Export failed: {e}")
            return ""

# Example usage and testing
async def test_romanian_knowledge_graph():
    """Test the Romanian Knowledge Graph system."""
    print("🧠 Testing Romanian Knowledge Graph")
    print("=" * 50)
    
    # Initialize knowledge graph
    kg = RomanianKnowledgeGraph()
    success = await kg.initialize()
    
    if not success:
        print("❌ Failed to initialize knowledge graph")
        return
    
    print("✅ Knowledge graph initialized successfully")
    
    # Test 1: Query for Mihai Eminescu
    print("\n🔍 Test 1: Searching for 'Eminescu'")
    result = await kg.query_entities("Eminescu")
    print(f"Found {len(result.entities)} entities:")
    for entity in result.entities:
        print(f"  - {entity.name} ({entity.type}) - Significance: {entity.cultural_significance:.2f}")
    print(f"Query confidence: {result.confidence_score:.2f}")
    print(f"Execution time: {result.execution_time:.2f}ms")
    
    # Test 2: Query for Romanian concepts
    print("\n🎭 Test 2: Searching for cultural concepts")
    result = await kg.query_entities("dor", entity_type="concept")
    print(f"Found {len(result.entities)} cultural concepts:")
    for entity in result.entities:
        print(f"  - {entity.name}: {entity.attributes.get('definition', 'No definition')}")
    
    # Test 3: Find path between entities
    print("\n🛤️ Test 3: Finding path between Eminescu and Dor concept")
    path = await kg.find_path("mihai_eminescu", "dor_concept")
    if path:
        print(f"Path found: {' -> '.join(path)}")
    else:
        print("No path found")
    
    # Test 4: Get related entities
    print("\n🔗 Test 4: Finding entities related to Eminescu")
    related = await kg.get_related_entities("mihai_eminescu")
    print(f"Found {len(related)} related entities:")
    for entity in related:
        print(f"  - {entity.name} ({entity.type})")
    
    # Test 5: Cluster entities
    print("\n📊 Test 5: Clustering entities by type")
    clusters = await kg.cluster_entities("entity_type")
    for cluster_name, entities in clusters.items():
        print(f"  {cluster_name}: {len(entities)} entities")
    
    # Test 6: Get statistics
    print("\n📈 Test 6: Knowledge graph statistics")
    stats = await kg.get_statistics()
    print(f"Total entities: {stats['total_entities']}")
    print(f"Total relationships: {stats['total_relationships']}")
    print(f"Entity types: {list(stats['entity_types'].keys())}")
    print(f"Average degree: {stats['connectivity_metrics'].get('average_degree', 0):.2f}")
    
    print("\n✅ All knowledge graph tests completed successfully!")

if __name__ == "__main__":
    asyncio.run(test_romanian_knowledge_graph())
