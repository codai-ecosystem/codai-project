"""
Prototype Networks for Romanian Language Processing
Advanced similarity-based classification with cultural embeddings

This module implements prototype networks specifically designed for Romanian
language understanding, with regional dialect support and cultural entity
embeddings. Optimized for few-shot learning scenarios.
"""

import asyncio
import time
import json
import logging
import math
from typing import List, Dict, Any, Optional, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
import numpy as np
from collections import defaultdict, Counter

# Configure logging
logger = logging.getLogger(__name__)

class RomanianEntityType(Enum):
    """Types of Romanian cultural entities"""
    PERSON = "person"
    PLACE = "place"
    TRADITION = "tradition"
    FOOD = "food"
    MUSIC = "music"
    DANCE = "dance"
    CLOTHING = "clothing"
    FESTIVAL = "festival"
    LANGUAGE_VARIANT = "language_variant"
    HISTORICAL_EVENT = "historical_event"

class RegionalDialect(Enum):
    """Romanian regional dialects"""
    WALLACHIAN = "wallachian"
    MOLDOVAN = "moldovan"
    TRANSYLVANIAN = "transylvanian"
    BANATIAN = "banatian"
    OLTENIAN = "oltenian"
    DOBRUDJAN = "dobrudjan"
    MARAMURES = "maramures"
    BUCOVINIAN = "bucovinian"

@dataclass
class RomanianEntityEmbedding:
    """Romanian cultural entity with embedding vector"""
    entity_id: str
    entity_type: RomanianEntityType
    name: str
    description: str
    regional_association: RegionalDialect
    cultural_significance: float
    embedding_vector: List[float] = field(default_factory=list)
    linguistic_features: Dict[str, Any] = field(default_factory=dict)
    related_entities: List[str] = field(default_factory=list)
    
    def __post_init__(self):
        """Initialize embedding if not provided"""
        if not self.embedding_vector:
            self.embedding_vector = self._generate_cultural_embedding()
    
    def _generate_cultural_embedding(self) -> List[float]:
        """Generate cultural embedding based on entity features"""
        # Simplified embedding generation for demonstration
        # In production, this would use pre-trained Romanian embeddings
        
        # Base embedding size
        embedding_size = 256
        
        # Cultural significance weight
        cultural_weight = self.cultural_significance
        
        # Regional component (first 32 dimensions)
        regional_component = [0.0] * 32
        regional_index = list(RegionalDialect).index(self.regional_association)
        regional_component[regional_index % 32] = cultural_weight
        
        # Entity type component (next 32 dimensions) 
        type_component = [0.0] * 32
        type_index = list(RomanianEntityType).index(self.entity_type)
        type_component[type_index % 32] = cultural_weight
        
        # Cultural features component (remaining dimensions)
        feature_component = []
        for i in range(embedding_size - 64):
            # Generate feature based on name and description
            feature_value = (hash(self.name + self.description + str(i)) % 1000) / 1000.0
            feature_value = (feature_value - 0.5) * cultural_weight
            feature_component.append(feature_value)
        
        return regional_component + type_component + feature_component

@dataclass
class RomanianPrototype:
    """Prototype for Romanian classification task"""
    prototype_id: str
    class_label: str
    support_examples: List[RomanianEntityEmbedding]
    prototype_vector: List[float] = field(default_factory=list)
    cultural_context: str = "traditional_romanian"
    regional_weights: Dict[RegionalDialect, float] = field(default_factory=dict)
    confidence_score: float = 0.0
    
    def __post_init__(self):
        """Compute prototype vector from support examples"""
        if not self.prototype_vector and self.support_examples:
            self.prototype_vector = self._compute_prototype_vector()
            self.confidence_score = self._compute_confidence()
    
    def _compute_prototype_vector(self) -> List[float]:
        """Compute prototype vector as centroid of support examples"""
        if not self.support_examples:
            return [0.0] * 256
        
        # Get embedding vectors
        embeddings = [example.embedding_vector for example in self.support_examples]
        
        # Compute weighted centroid
        prototype = [0.0] * len(embeddings[0])
        total_weight = 0.0
        
        for example in self.support_examples:
            weight = example.cultural_significance
            total_weight += weight
            
            for i, value in enumerate(example.embedding_vector):
                prototype[i] += value * weight
        
        # Normalize by total weight
        if total_weight > 0:
            prototype = [value / total_weight for value in prototype]
        
        return prototype
    
    def _compute_confidence(self) -> float:
        """Compute confidence based on support example consistency"""
        if len(self.support_examples) < 2:
            return 0.5
        
        # Compute pairwise similarities between support examples
        similarities = []
        embeddings = [example.embedding_vector for example in self.support_examples]
        
        for i in range(len(embeddings)):
            for j in range(i + 1, len(embeddings)):
                sim = self._cosine_similarity(embeddings[i], embeddings[j])
                similarities.append(sim)
        
        # Confidence is average similarity
        return sum(similarities) / len(similarities) if similarities else 0.5
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Compute cosine similarity between two vectors"""
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        norm_a = math.sqrt(sum(a * a for a in vec1))
        norm_b = math.sqrt(sum(b * b for b in vec2))
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
        
        return dot_product / (norm_a * norm_b)

class RomanianPrototypeNetwork:
    """Prototype network for Romanian few-shot learning"""
    
    def __init__(self, embedding_dim: int = 256):
        self.embedding_dim = embedding_dim
        self.prototypes = {}
        self.cultural_entities = {}
        self.regional_embeddings = {}
        self.performance_metrics = {}
        self.adaptation_history = []
        
        # Initialize Romanian cultural knowledge
        self._initialize_cultural_entities()
        self._initialize_regional_embeddings()
        
        logger.info(f"Romanian Prototype Network initialized with {embedding_dim}D embeddings")
    
    def _initialize_cultural_entities(self):
        """Initialize Romanian cultural entity database"""
        
        # Traditional Romanian entities
        cultural_entities = [
            # People and Historical Figures
            RomanianEntityEmbedding(
                entity_id="mihai_viteazul",
                entity_type=RomanianEntityType.PERSON,
                name="Mihai Viteazul",
                description="Domnitor al Țării Românești, Moldova și Transilvaniei",
                regional_association=RegionalDialect.WALLACHIAN,
                cultural_significance=0.98,
                linguistic_features={"historical_period": "1593-1601", "title": "voievod"}
            ),
            RomanianEntityEmbedding(
                entity_id="stefan_cel_mare",
                entity_type=RomanianEntityType.PERSON,
                name="Ștefan cel Mare",
                description="Domnul Moldovei, apărător al creștinătății",
                regional_association=RegionalDialect.MOLDOVAN,
                cultural_significance=0.97,
                linguistic_features={"historical_period": "1457-1504", "title": "domnitor"}
            ),
            
            # Places and Regions
            RomanianEntityEmbedding(
                entity_id="castelul_bran",
                entity_type=RomanianEntityType.PLACE,
                name="Castelul Bran",
                description="Castel medieval în Transilvania, legat de Dracula",
                regional_association=RegionalDialect.TRANSYLVANIAN,
                cultural_significance=0.92,
                linguistic_features={"type": "fortification", "period": "medieval"}
            ),
            RomanianEntityEmbedding(
                entity_id="delta_dunarii",
                entity_type=RomanianEntityType.PLACE,
                name="Delta Dunării",
                description="Rezervație naturală unică în Europa",
                regional_association=RegionalDialect.DOBRUDJAN,
                cultural_significance=0.89,
                linguistic_features={"type": "natural_reserve", "unesco": True}
            ),
            
            # Traditions and Customs
            RomanianEntityEmbedding(
                entity_id="martisorul",
                entity_type=RomanianEntityType.TRADITION,
                name="Mărțișorul",
                description="Tradiție de primăvară cu simboluri alb-roșii",
                regional_association=RegionalDialect.WALLACHIAN,
                cultural_significance=0.96,
                linguistic_features={"season": "spring", "colors": ["white", "red"]}
            ),
            RomanianEntityEmbedding(
                entity_id="dragobete",
                entity_type=RomanianEntityType.TRADITION,
                name="Dragobete",
                description="Ziua îndrăgostiților în tradiția românească",
                regional_association=RegionalDialect.OLTENIAN,
                cultural_significance=0.85,
                linguistic_features={"season": "winter", "type": "love_celebration"}
            ),
            
            # Food and Gastronomy
            RomanianEntityEmbedding(
                entity_id="sarmale",
                entity_type=RomanianEntityType.FOOD,
                name="Sarmale",
                description="Rulouri de carne în foi de varză",
                regional_association=RegionalDialect.TRANSYLVANIAN,
                cultural_significance=0.94,
                linguistic_features={"main_ingredient": "cabbage", "occasions": ["Christmas", "New Year"]}
            ),
            RomanianEntityEmbedding(
                entity_id="mamaliga",
                entity_type=RomanianEntityType.FOOD,
                name="Mămăliga",
                description="Mâncare tradițională din mălai",
                regional_association=RegionalDialect.MOLDOVAN,
                cultural_significance=0.91,
                linguistic_features={"main_ingredient": "cornmeal", "type": "staple_food"}
            ),
            
            # Music and Dance
            RomanianEntityEmbedding(
                entity_id="hora",
                entity_type=RomanianEntityType.DANCE,
                name="Hora",
                description="Dans tradițional în cerc",
                regional_association=RegionalDialect.WALLACHIAN,
                cultural_significance=0.93,
                linguistic_features={"formation": "circle", "tempo": "moderate"}
            ),
            RomanianEntityEmbedding(
                entity_id="doina",
                entity_type=RomanianEntityType.MUSIC,
                name="Doina",
                description="Cântec popular melancolic",
                regional_association=RegionalDialect.MOLDOVAN,
                cultural_significance=0.88,
                linguistic_features={"mood": "melancholic", "structure": "free_form"}
            )
        ]
        
        # Store entities
        for entity in cultural_entities:
            self.cultural_entities[entity.entity_id] = entity
        
        logger.info(f"Initialized {len(cultural_entities)} Romanian cultural entities")
    
    def _initialize_regional_embeddings(self):
        """Initialize embeddings for Romanian regions"""
        
        regional_characteristics = {
            RegionalDialect.WALLACHIAN: {
                "linguistic_features": ["standard_romanian", "bucharest_influence"],
                "cultural_items": ["mărțișor", "hora", "mici"],
                "historical_significance": 0.95
            },
            RegionalDialect.MOLDOVAN: {
                "linguistic_features": ["eastern_variant", "russian_influence"],
                "cultural_items": ["mămăliga", "doina", "răcituri"],
                "historical_significance": 0.94
            },
            RegionalDialect.TRANSYLVANIAN: {
                "linguistic_features": ["hungarian_influence", "german_loanwords"],
                "cultural_items": ["sarmale", "kurtos_kalacs", "saxon_traditions"],
                "historical_significance": 0.93
            },
            RegionalDialect.BANATIAN: {
                "linguistic_features": ["serbian_influence", "german_colonists"],
                "cultural_items": ["ciolan_afumat", "multicultural_heritage"],
                "historical_significance": 0.87
            },
            RegionalDialect.DOBRUDJAN: {
                "linguistic_features": ["turkish_influence", "bulgarian_presence"],
                "cultural_items": ["delta_culture", "maritime_traditions"],
                "historical_significance": 0.82
            }
        }
        
        for dialect, characteristics in regional_characteristics.items():
            # Generate regional embedding
            embedding = self._generate_regional_embedding(characteristics)
            self.regional_embeddings[dialect] = {
                "embedding": embedding,
                "characteristics": characteristics
            }
        
        logger.info(f"Initialized embeddings for {len(regional_characteristics)} Romanian regions")
    
    def _generate_regional_embedding(self, characteristics: Dict[str, Any]) -> List[float]:
        """Generate embedding for regional characteristics"""
        
        embedding = [0.0] * self.embedding_dim
        
        # Encode linguistic features
        linguistic_features = characteristics.get("linguistic_features", [])
        for i, feature in enumerate(linguistic_features[:32]):
            embedding[i] = hash(feature) % 100 / 100.0
        
        # Encode cultural items
        cultural_items = characteristics.get("cultural_items", [])
        for i, item in enumerate(cultural_items[:32]):
            embedding[32 + i] = hash(item) % 100 / 100.0
        
        # Encode historical significance
        historical_sig = characteristics.get("historical_significance", 0.5)
        for i in range(64, min(96, self.embedding_dim)):
            embedding[i] = historical_sig
        
        # Fill remaining dimensions
        for i in range(96, self.embedding_dim):
            embedding[i] = (hash(str(characteristics) + str(i)) % 1000) / 1000.0
        
        return embedding
    
    async def create_prototype(
        self,
        class_label: str,
        support_examples: List[Dict[str, Any]],
        cultural_context: str = "traditional_romanian"
    ) -> RomanianPrototype:
        """Create prototype from support examples"""
        
        start_time = time.time()
        
        try:
            # Convert support examples to entity embeddings
            entity_embeddings = []
            
            for example in support_examples:
                entity = await self._create_entity_embedding(example, cultural_context)
                entity_embeddings.append(entity)
            
            # Create prototype
            prototype = RomanianPrototype(
                prototype_id=f"prototype_{class_label}_{int(time.time())}",
                class_label=class_label,
                support_examples=entity_embeddings,
                cultural_context=cultural_context
            )
            
            # Compute regional weights
            prototype.regional_weights = self._compute_regional_weights(entity_embeddings)
            
            # Store prototype
            self.prototypes[prototype.prototype_id] = prototype
            
            creation_time = (time.time() - start_time) * 1000
            
            logger.info(f"Created prototype '{class_label}' with {len(support_examples)} examples in {creation_time:.2f}ms")
            
            return prototype
            
        except Exception as e:
            logger.error(f"Failed to create prototype: {e}")
            raise
    
    async def _create_entity_embedding(
        self,
        example: Dict[str, Any],
        cultural_context: str
    ) -> RomanianEntityEmbedding:
        """Create entity embedding from example data"""
        
        # Extract entity information
        entity_id = example.get("id", f"entity_{int(time.time())}")
        entity_type = RomanianEntityType(example.get("type", "tradition"))
        name = example.get("name", "")
        description = example.get("description", "")
        regional_variant = example.get("regional_variant", "wallachian")
        
        # Map regional variant to dialect
        dialect_mapping = {
            "bucurești": RegionalDialect.WALLACHIAN,
            "cluj-napoca": RegionalDialect.TRANSYLVANIAN,
            "iași": RegionalDialect.MOLDOVAN,
            "timișoara": RegionalDialect.BANATIAN,
            "constanța": RegionalDialect.DOBRUDJAN,
            "craiova": RegionalDialect.OLTENIAN
        }
        
        regional_association = dialect_mapping.get(
            regional_variant.lower(),
            RegionalDialect.WALLACHIAN
        )
        
        # Determine cultural significance
        cultural_significance = example.get("confidence", 0.8)
        
        # Create entity embedding
        entity = RomanianEntityEmbedding(
            entity_id=entity_id,
            entity_type=entity_type,
            name=name,
            description=description,
            regional_association=regional_association,
            cultural_significance=cultural_significance,
            linguistic_features=example.get("linguistic_features", {})
        )
        
        return entity
    
    def _compute_regional_weights(
        self,
        entity_embeddings: List[RomanianEntityEmbedding]
    ) -> Dict[RegionalDialect, float]:
        """Compute regional distribution weights"""
        
        regional_counts = Counter(entity.regional_association for entity in entity_embeddings)
        total_entities = len(entity_embeddings)
        
        weights = {}
        for dialect in RegionalDialect:
            count = regional_counts.get(dialect, 0)
            weights[dialect] = count / total_entities if total_entities > 0 else 0.0
        
        return weights
    
    async def classify_query(
        self,
        query_embedding: List[float],
        top_k: int = 3,
        similarity_threshold: float = 0.7
    ) -> List[Tuple[str, float, Dict[str, Any]]]:
        """Classify query using prototype network"""
        
        start_time = time.time()
        
        try:
            if not self.prototypes:
                raise ValueError("No prototypes available for classification")
            
            # Compute similarities to all prototypes
            similarities = []
            
            for prototype_id, prototype in self.prototypes.items():
                similarity = self._cosine_similarity(query_embedding, prototype.prototype_vector)
                
                # Apply regional weighting if applicable
                regional_bonus = self._compute_regional_bonus(prototype)
                adjusted_similarity = similarity + regional_bonus
                
                metadata = {
                    "prototype_id": prototype_id,
                    "class_label": prototype.class_label,
                    "raw_similarity": similarity,
                    "regional_bonus": regional_bonus,
                    "prototype_confidence": prototype.confidence_score,
                    "support_examples_count": len(prototype.support_examples),
                    "cultural_context": prototype.cultural_context
                }
                
                similarities.append((adjusted_similarity, prototype.class_label, metadata))
            
            # Sort by similarity and filter by threshold
            similarities.sort(key=lambda x: x[0], reverse=True)
            filtered_results = [
                (label, sim, metadata) for sim, label, metadata in similarities
                if sim >= similarity_threshold
            ]
            
            # Return top-k results
            results = filtered_results[:top_k]
            
            classification_time = (time.time() - start_time) * 1000
            
            # Record performance metrics
            self.performance_metrics[f"classification_{int(time.time())}"] = {
                "classification_time_ms": classification_time,
                "num_prototypes": len(self.prototypes),
                "top_similarity": results[0][1] if results else 0.0,
                "results_count": len(results),
                "speed_target_met": classification_time < 50  # < 50ms target
            }
            
            logger.info(f"Classified query in {classification_time:.2f}ms, {len(results)} results above threshold")
            
            return results
            
        except Exception as e:
            logger.error(f"Classification failed: {e}")
            raise
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Compute cosine similarity between two vectors"""
        if len(vec1) != len(vec2):
            return 0.0
        
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        norm_a = math.sqrt(sum(a * a for a in vec1))
        norm_b = math.sqrt(sum(b * b for b in vec2))
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
        
        return dot_product / (norm_a * norm_b)
    
    def _compute_regional_bonus(self, prototype: RomanianPrototype) -> float:
        """Compute regional relevance bonus"""
        
        # Give bonus for balanced regional representation
        max_weight = max(prototype.regional_weights.values()) if prototype.regional_weights else 0
        min_weight = min(prototype.regional_weights.values()) if prototype.regional_weights else 0
        
        balance_score = 1.0 - (max_weight - min_weight)
        return balance_score * 0.1  # Small bonus for regional balance
    
    async def adapt_prototype(
        self,
        prototype_id: str,
        new_examples: List[Dict[str, Any]],
        adaptation_strength: float = 0.3
    ) -> bool:
        """Adapt existing prototype with new examples"""
        
        try:
            if prototype_id not in self.prototypes:
                raise ValueError(f"Prototype {prototype_id} not found")
            
            prototype = self.prototypes[prototype_id]
            
            # Convert new examples to entity embeddings
            new_entities = []
            for example in new_examples:
                entity = await self._create_entity_embedding(example, prototype.cultural_context)
                new_entities.append(entity)
            
            # Adaptive update of prototype vector
            if new_entities:
                # Compute new prototype vector from new examples
                new_prototype_vector = self._compute_prototype_vector_from_entities(new_entities)
                
                # Weighted combination with existing prototype
                updated_vector = []
                for i in range(len(prototype.prototype_vector)):
                    old_value = prototype.prototype_vector[i]
                    new_value = new_prototype_vector[i]
                    updated_value = (1 - adaptation_strength) * old_value + adaptation_strength * new_value
                    updated_vector.append(updated_value)
                
                # Update prototype
                prototype.prototype_vector = updated_vector
                prototype.support_examples.extend(new_entities)
                prototype.confidence_score = prototype._compute_confidence()
                prototype.regional_weights = self._compute_regional_weights(prototype.support_examples)
                
                # Record adaptation
                adaptation_record = {
                    "timestamp": time.time(),
                    "prototype_id": prototype_id,
                    "new_examples_count": len(new_examples),
                    "adaptation_strength": adaptation_strength,
                    "new_confidence": prototype.confidence_score
                }
                self.adaptation_history.append(adaptation_record)
                
                logger.info(f"Adapted prototype {prototype_id} with {len(new_examples)} new examples")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to adapt prototype: {e}")
            return False
    
    def _compute_prototype_vector_from_entities(
        self,
        entities: List[RomanianEntityEmbedding]
    ) -> List[float]:
        """Compute prototype vector from list of entities"""
        
        if not entities:
            return [0.0] * self.embedding_dim
        
        # Weighted centroid
        prototype = [0.0] * self.embedding_dim
        total_weight = 0.0
        
        for entity in entities:
            weight = entity.cultural_significance
            total_weight += weight
            
            for i, value in enumerate(entity.embedding_vector):
                prototype[i] += value * weight
        
        # Normalize
        if total_weight > 0:
            prototype = [value / total_weight for value in prototype]
        
        return prototype
    
    async def get_cultural_similarity(
        self,
        entity1_id: str,
        entity2_id: str
    ) -> Tuple[float, Dict[str, Any]]:
        """Compute cultural similarity between two entities"""
        
        try:
            entity1 = self.cultural_entities.get(entity1_id)
            entity2 = self.cultural_entities.get(entity2_id)
            
            if not entity1 or not entity2:
                return 0.0, {"error": "Entity not found"}
            
            # Compute embedding similarity
            embedding_similarity = self._cosine_similarity(
                entity1.embedding_vector,
                entity2.embedding_vector
            )
            
            # Cultural context bonus
            cultural_bonus = 0.0
            if entity1.regional_association == entity2.regional_association:
                cultural_bonus += 0.1
            
            if entity1.entity_type == entity2.entity_type:
                cultural_bonus += 0.05
            
            # Final similarity
            total_similarity = embedding_similarity + cultural_bonus
            
            metadata = {
                "embedding_similarity": embedding_similarity,
                "cultural_bonus": cultural_bonus,
                "entity1": {
                    "name": entity1.name,
                    "type": entity1.entity_type.value,
                    "region": entity1.regional_association.value
                },
                "entity2": {
                    "name": entity2.name,
                    "type": entity2.entity_type.value,
                    "region": entity2.regional_association.value
                }
            }
            
            return total_similarity, metadata
            
        except Exception as e:
            logger.error(f"Failed to compute cultural similarity: {e}")
            return 0.0, {"error": str(e)}
    
    async def get_network_metrics(self) -> Dict[str, Any]:
        """Get prototype network performance metrics"""
        
        try:
            # Performance summary
            recent_metrics = list(self.performance_metrics.values())[-10:]  # Last 10 classifications
            
            avg_classification_time = 0.0
            avg_similarity = 0.0
            speed_target_rate = 0.0
            
            if recent_metrics:
                avg_classification_time = sum(m["classification_time_ms"] for m in recent_metrics) / len(recent_metrics)
                avg_similarity = sum(m["top_similarity"] for m in recent_metrics) / len(recent_metrics)
                speed_target_rate = sum(1 for m in recent_metrics if m["speed_target_met"]) / len(recent_metrics)
            
            # Prototype statistics
            prototype_stats = {
                "total_prototypes": len(self.prototypes),
                "cultural_entities": len(self.cultural_entities),
                "regional_dialects": len(self.regional_embeddings),
                "adaptations_performed": len(self.adaptation_history)
            }
            
            # Regional distribution
            regional_distribution = defaultdict(int)
            for prototype in self.prototypes.values():
                for dialect, weight in prototype.regional_weights.items():
                    if weight > 0:
                        regional_distribution[dialect.value] += 1
            
            return {
                "performance_metrics": {
                    "average_classification_time_ms": avg_classification_time,
                    "average_top_similarity": avg_similarity,
                    "speed_target_achievement_rate": speed_target_rate,
                    "total_classifications": len(self.performance_metrics)
                },
                "prototype_statistics": prototype_stats,
                "regional_distribution": dict(regional_distribution),
                "targets": {
                    "classification_speed": "< 50ms",
                    "similarity_threshold": "> 0.7",
                    "accuracy_target": "> 90%"
                },
                "system_status": {
                    "embedding_dimension": self.embedding_dim,
                    "cultural_coverage": "Romanian traditional culture",
                    "dialect_support": "8 regional dialects",
                    "adaptation_enabled": True
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get network metrics: {e}")
            return {"error": str(e)}

# Export key classes
__all__ = [
    "RomanianPrototypeNetwork",
    "RomanianEntityEmbedding",
    "RomanianPrototype",
    "RomanianEntityType",
    "RegionalDialect"
]
