"""
Episodic Memory System - Phase 5 Component
Specialized system for storing and retrieving episodic memories and experiences
"""

import asyncio
import time
import json
import uuid
from typing import Dict, List, Optional, Any, Tuple, Set
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import logging
import math

# Import our existing components
from romai_api_client import RomAIAPIClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EpisodicContext(Enum):
    PERSONAL = "personal"           # Personal experiences
    PROFESSIONAL = "professional"   # Work-related experiences
    LEARNING = "learning"          # Educational experiences
    SOCIAL = "social"              # Social interactions
    PROBLEM_SOLVING = "problem_solving"  # Problem-solving episodes
    CREATIVE = "creative"          # Creative processes
    SYSTEM = "system"              # System-level events

class TemporalGranularity(Enum):
    INSTANT = "instant"         # Specific moments
    MINUTE = "minute"          # Within minutes
    HOUR = "hour"              # Within hours
    DAY = "day"                # Daily experiences
    WEEK = "week"              # Weekly patterns
    MONTH = "month"            # Monthly trends
    YEAR = "year"              # Yearly milestones

@dataclass
class EpisodicMemoryTrace:
    memory_id: str
    episode_title: str
    detailed_description: str
    timestamp: datetime
    context_type: EpisodicContext
    participants: List[str]
    location: Optional[str]
    outcomes: List[str]
    lessons_learned: List[str]
    emotional_state: Dict[str, float]  # emotion -> intensity
    sensory_details: Dict[str, str]    # sense -> description
    causal_relationships: List[str]    # what led to this episode
    consequences: List[str]            # what resulted from this episode
    importance_score: float            # 0.0 to 1.0
    vividness: float                   # 0.0 to 1.0 (how clearly remembered)
    confidence: float                  # 0.0 to 1.0 (confidence in accuracy)
    access_count: int
    last_accessed: datetime
    related_episodes: List[str]        # IDs of related episodes
    tags: Set[str]
    temporal_granularity: TemporalGranularity
    metadata: Dict[str, Any]

@dataclass
class EpisodicQuery:
    query_text: str
    time_range: Optional[Tuple[datetime, datetime]] = None
    context_filters: Optional[List[EpisodicContext]] = None
    participant_filters: Optional[List[str]] = None
    outcome_filters: Optional[List[str]] = None
    emotion_filters: Optional[Dict[str, Tuple[float, float]]] = None  # emotion -> (min, max)
    importance_threshold: Optional[float] = None
    max_results: int = 10
    include_related: bool = False

@dataclass
class EpisodicRetrievalResult:
    primary_episodes: List[EpisodicMemoryTrace]
    related_episodes: List[EpisodicMemoryTrace]
    relevance_scores: List[float]
    temporal_patterns: Dict[str, Any]
    retrieval_insights: List[str]
    query_processing_time: float

class EpisodicMemorySystem:
    """Advanced episodic memory system for storing and retrieving experiential memories"""
    
    def __init__(self):
        self.romai_client = RomAIAPIClient()
        
        # Memory storage
        self.episodic_memories: Dict[str, EpisodicMemoryTrace] = {}
        self.temporal_index: Dict[str, List[str]] = {}  # date -> memory_ids
        self.context_index: Dict[EpisodicContext, List[str]] = {}  # context -> memory_ids
        self.participant_index: Dict[str, List[str]] = {}  # participant -> memory_ids
        self.outcome_index: Dict[str, List[str]] = {}  # outcome -> memory_ids
        
        # System settings
        self.importance_decay_rate = 0.98  # Daily decay for importance
        self.vividness_decay_rate = 0.95   # Daily decay for vividness
        self.access_boost_factor = 0.1     # Boost for accessed memories
        self.association_threshold = 0.6    # Threshold for automatic association
        
        # Performance tracking
        self.system_stats = {
            "episodes_stored": 0,
            "retrievals_performed": 0,
            "associations_discovered": 0,
            "temporal_patterns_found": 0
        }
        
        logger.info("Episodic Memory System initialized")
    
    def generate_episode_id(self, context_type: EpisodicContext) -> str:
        """Generate unique episodic memory ID"""
        prefix = f"EP_{context_type.value[:3].upper()}"
        timestamp = int(time.time())
        unique_id = str(uuid.uuid4())[:8]
        return f"{prefix}_{timestamp}_{unique_id}"
    
    async def store_episodic_memory(self, episode_title: str, description: str,
                                  context_type: EpisodicContext,
                                  participants: Optional[List[str]] = None,
                                  location: Optional[str] = None,
                                  outcomes: Optional[List[str]] = None,
                                  lessons_learned: Optional[List[str]] = None,
                                  emotional_state: Optional[Dict[str, float]] = None,
                                  sensory_details: Optional[Dict[str, str]] = None,
                                  importance_score: float = 0.5,
                                  temporal_granularity: TemporalGranularity = TemporalGranularity.HOUR,
                                  additional_metadata: Optional[Dict[str, Any]] = None) -> EpisodicMemoryTrace:
        """Store a new episodic memory"""
        try:
            memory_id = self.generate_episode_id(context_type)
            current_time = datetime.now()
            
            # Set defaults
            if participants is None:
                participants = []
            if outcomes is None:
                outcomes = []
            if lessons_learned is None:
                lessons_learned = []
            if emotional_state is None:
                emotional_state = {}
            if sensory_details is None:
                sensory_details = {}
            if additional_metadata is None:
                additional_metadata = {}
            
            # Automatically extract insights using RomAI
            insights = await self._extract_episode_insights(description, context_type)
            
            # Calculate initial vividness and confidence
            vividness = self._calculate_vividness(description, sensory_details, emotional_state)
            confidence = self._calculate_confidence(description, participants, outcomes)
            
            # Create episodic memory trace
            episode = EpisodicMemoryTrace(
                memory_id=memory_id,
                episode_title=episode_title,
                detailed_description=description,
                timestamp=current_time,
                context_type=context_type,
                participants=participants,
                location=location,
                outcomes=outcomes,
                lessons_learned=lessons_learned,
                emotional_state=emotional_state,
                sensory_details=sensory_details,
                causal_relationships=insights.get('causal_relationships', []),
                consequences=insights.get('consequences', []),
                importance_score=importance_score,
                vividness=vividness,
                confidence=confidence,
                access_count=0,
                last_accessed=current_time,
                related_episodes=[],
                tags=set(insights.get('tags', [])),
                temporal_granularity=temporal_granularity,
                metadata={
                    **additional_metadata,
                    "creation_method": "direct_storage",
                    "insights_extracted": True,
                    "processing_timestamp": current_time.isoformat()
                }
            )
            
            # Store episode
            self.episodic_memories[memory_id] = episode
            
            # Update indexes
            await self._update_indexes(episode)
            
            # Discover and create associations
            await self._discover_associations(episode)
            
            # Update statistics
            self.system_stats["episodes_stored"] += 1
            
            logger.info(f"Stored episodic memory: {memory_id} - {episode_title}")
            
            return episode
            
        except Exception as e:
            logger.error(f"Error storing episodic memory: {str(e)}")
            raise
    
    async def _extract_episode_insights(self, description: str, context_type: EpisodicContext) -> Dict[str, Any]:
        """Extract insights from episode description using RomAI"""
        try:
            prompt = f"""
            Analyze this episodic memory and extract structured insights:
            
            Context: {context_type.value}
            Description: {description}
            
            Please identify:
            1. Causal relationships (what led to this episode)
            2. Consequences (what resulted from this episode)
            3. Key tags/themes (3-7 relevant tags)
            4. Implicit lessons or patterns
            
            Return as JSON with keys: causal_relationships, consequences, tags, implicit_lessons
            """
            
            response = await self.romai_client.generate_response_async(prompt)
            
            # Parse response (simplified - in production use robust JSON parsing)
            try:
                import re
                json_match = re.search(r'\{.*\}', response, re.DOTALL)
                if json_match:
                    insights = json.loads(json_match.group())
                else:
                    # Fallback extraction
                    insights = self._fallback_insight_extraction(description, context_type)
            except:
                insights = self._fallback_insight_extraction(description, context_type)
            
            return insights
            
        except Exception as e:
            logger.warning(f"Error extracting insights, using fallback: {str(e)}")
            return self._fallback_insight_extraction(description, context_type)
    
    def _fallback_insight_extraction(self, description: str, context_type: EpisodicContext) -> Dict[str, Any]:
        """Fallback method for insight extraction"""
        words = description.lower().split()
        
        # Simple keyword-based extraction
        causal_keywords = ['because', 'due to', 'caused by', 'resulted from', 'led to']
        consequence_keywords = ['therefore', 'as a result', 'consequently', 'outcome', 'result']
        
        causal_relationships = [phrase for phrase in description.split('.') 
                              if any(keyword in phrase.lower() for keyword in causal_keywords)]
        consequences = [phrase for phrase in description.split('.') 
                       if any(keyword in phrase.lower() for keyword in consequence_keywords)]
        
        # Extract key terms as tags
        common_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
        significant_words = [word for word in words if len(word) > 4 and word not in common_words]
        tags = significant_words[:5]  # Limit to 5 tags
        
        return {
            'causal_relationships': causal_relationships[:3],
            'consequences': consequences[:3],
            'tags': tags,
            'implicit_lessons': [f"Experience in {context_type.value} domain"]
        }
    
    def _calculate_vividness(self, description: str, sensory_details: Dict[str, str], 
                           emotional_state: Dict[str, float]) -> float:
        """Calculate memory vividness based on detail richness"""
        try:
            base_vividness = 0.5
            
            # Description detail boost
            detail_score = min(len(description) / 500.0, 0.3)  # Up to 0.3 boost
            base_vividness += detail_score
            
            # Sensory details boost
            sensory_boost = len(sensory_details) * 0.1  # 0.1 per sensory detail
            base_vividness += min(sensory_boost, 0.2)
            
            # Emotional intensity boost
            if emotional_state:
                avg_emotion_intensity = sum(emotional_state.values()) / len(emotional_state)
                emotion_boost = avg_emotion_intensity * 0.2
                base_vividness += emotion_boost
            
            return min(base_vividness, 1.0)
            
        except Exception:
            return 0.5  # Default moderate vividness
    
    def _calculate_confidence(self, description: str, participants: List[str], 
                            outcomes: List[str]) -> float:
        """Calculate confidence in memory accuracy"""
        try:
            base_confidence = 0.6
            
            # Detail specificity boost
            if len(description) > 100:
                base_confidence += 0.1
            if len(description) > 300:
                base_confidence += 0.1
            
            # Participant verification potential
            participant_boost = min(len(participants) * 0.05, 0.15)
            base_confidence += participant_boost
            
            # Outcome clarity boost
            outcome_boost = min(len(outcomes) * 0.05, 0.15)
            base_confidence += outcome_boost
            
            return min(base_confidence, 1.0)
            
        except Exception:
            return 0.7  # Default high confidence
    
    async def _update_indexes(self, episode: EpisodicMemoryTrace) -> None:
        """Update all indexes with new episode"""
        try:
            memory_id = episode.memory_id
            
            # Temporal index (by date)
            date_key = episode.timestamp.strftime('%Y-%m-%d')
            if date_key not in self.temporal_index:
                self.temporal_index[date_key] = []
            self.temporal_index[date_key].append(memory_id)
            
            # Context index
            if episode.context_type not in self.context_index:
                self.context_index[episode.context_type] = []
            self.context_index[episode.context_type].append(memory_id)
            
            # Participant index
            for participant in episode.participants:
                if participant not in self.participant_index:
                    self.participant_index[participant] = []
                self.participant_index[participant].append(memory_id)
            
            # Outcome index
            for outcome in episode.outcomes:
                outcome_key = outcome.lower().strip()
                if outcome_key not in self.outcome_index:
                    self.outcome_index[outcome_key] = []
                self.outcome_index[outcome_key].append(memory_id)
                
        except Exception as e:
            logger.error(f"Error updating indexes: {str(e)}")
    
    async def _discover_associations(self, new_episode: EpisodicMemoryTrace) -> None:
        """Automatically discover associations with existing episodes"""
        try:
            associations_found = 0
            
            for existing_id, existing_episode in self.episodic_memories.items():
                if existing_id == new_episode.memory_id:
                    continue
                
                # Calculate association strength
                association_strength = await self._calculate_association_strength(new_episode, existing_episode)
                
                if association_strength >= self.association_threshold:
                    # Create bidirectional association
                    if existing_id not in new_episode.related_episodes:
                        new_episode.related_episodes.append(existing_id)
                    if new_episode.memory_id not in existing_episode.related_episodes:
                        existing_episode.related_episodes.append(new_episode.memory_id)
                    
                    associations_found += 1
            
            if associations_found > 0:
                self.system_stats["associations_discovered"] += associations_found
                logger.debug(f"Discovered {associations_found} associations for {new_episode.memory_id}")
                
        except Exception as e:
            logger.error(f"Error discovering associations: {str(e)}")
    
    async def _calculate_association_strength(self, episode1: EpisodicMemoryTrace, 
                                           episode2: EpisodicMemoryTrace) -> float:
        """Calculate strength of association between two episodes"""
        try:
            association_score = 0.0
            
            # Temporal proximity (episodes close in time are more likely related)
            time_diff = abs((episode1.timestamp - episode2.timestamp).total_seconds())
            hours_diff = time_diff / 3600
            if hours_diff < 24:  # Same day
                association_score += 0.3
            elif hours_diff < 168:  # Same week
                association_score += 0.2
            elif hours_diff < 720:  # Same month
                association_score += 0.1
            
            # Context similarity
            if episode1.context_type == episode2.context_type:
                association_score += 0.2
            
            # Participant overlap
            common_participants = set(episode1.participants).intersection(set(episode2.participants))
            if common_participants:
                association_score += len(common_participants) * 0.15
            
            # Outcome similarity
            common_outcomes = set([o.lower() for o in episode1.outcomes]).intersection(
                set([o.lower() for o in episode2.outcomes]))
            if common_outcomes:
                association_score += len(common_outcomes) * 0.1
            
            # Tag overlap
            common_tags = episode1.tags.intersection(episode2.tags)
            if common_tags:
                association_score += len(common_tags) * 0.05
            
            # Location similarity
            if episode1.location and episode2.location and episode1.location == episode2.location:
                association_score += 0.1
            
            return min(association_score, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating association strength: {str(e)}")
            return 0.0
    
    async def retrieve_episodes(self, query: EpisodicQuery) -> EpisodicRetrievalResult:
        """Retrieve episodic memories based on complex query"""
        start_time = time.time()
        
        try:
            candidate_episodes = []
            
            # Apply filters to get candidate set
            all_episodes = list(self.episodic_memories.values())
            
            for episode in all_episodes:
                if await self._episode_matches_query(episode, query):
                    candidate_episodes.append(episode)
            
            # Calculate relevance scores
            scored_episodes = []
            for episode in candidate_episodes:
                relevance = await self._calculate_episode_relevance(episode, query)
                scored_episodes.append((episode, relevance))
            
            # Sort by relevance
            scored_episodes.sort(key=lambda x: x[1], reverse=True)
            
            # Get primary results
            primary_episodes = [episode for episode, score in scored_episodes[:query.max_results]]
            relevance_scores = [score for episode, score in scored_episodes[:query.max_results]]
            
            # Get related episodes if requested
            related_episodes = []
            if query.include_related:
                related_ids = set()
                for episode in primary_episodes:
                    related_ids.update(episode.related_episodes)
                
                for related_id in related_ids:
                    if related_id in self.episodic_memories:
                        related_episodes.append(self.episodic_memories[related_id])
            
            # Analyze temporal patterns
            temporal_patterns = self._analyze_temporal_patterns(primary_episodes)
            
            # Generate retrieval insights
            insights = self._generate_retrieval_insights(primary_episodes, query)
            
            # Update access statistics
            for episode in primary_episodes:
                episode.access_count += 1
                episode.last_accessed = datetime.now()
            
            self.system_stats["retrievals_performed"] += 1
            
            processing_time = time.time() - start_time
            
            result = EpisodicRetrievalResult(
                primary_episodes=primary_episodes,
                related_episodes=related_episodes,
                relevance_scores=relevance_scores,
                temporal_patterns=temporal_patterns,
                retrieval_insights=insights,
                query_processing_time=processing_time
            )
            
            logger.info(f"Retrieved {len(primary_episodes)} episodes in {processing_time:.3f}s")
            
            return result
            
        except Exception as e:
            logger.error(f"Error retrieving episodes: {str(e)}")
            return EpisodicRetrievalResult([], [], [], {}, [f"Retrieval error: {str(e)}"], 0.0)
    
    async def _episode_matches_query(self, episode: EpisodicMemoryTrace, query: EpisodicQuery) -> bool:
        """Check if episode matches query filters"""
        try:
            # Time range filter
            if query.time_range:
                start_time, end_time = query.time_range
                if not (start_time <= episode.timestamp <= end_time):
                    return False
            
            # Context filter
            if query.context_filters and episode.context_type not in query.context_filters:
                return False
            
            # Participant filter
            if query.participant_filters:
                if not any(participant in episode.participants for participant in query.participant_filters):
                    return False
            
            # Outcome filter
            if query.outcome_filters:
                episode_outcomes_lower = [outcome.lower() for outcome in episode.outcomes]
                if not any(outcome.lower() in episode_outcomes_lower for outcome in query.outcome_filters):
                    return False
            
            # Emotion filter
            if query.emotion_filters:
                for emotion, (min_val, max_val) in query.emotion_filters.items():
                    if emotion in episode.emotional_state:
                        intensity = episode.emotional_state[emotion]
                        if not (min_val <= intensity <= max_val):
                            return False
                    else:
                        return False  # Required emotion not present
            
            # Importance threshold
            if query.importance_threshold and episode.importance_score < query.importance_threshold:
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error checking episode match: {str(e)}")
            return False
    
    async def _calculate_episode_relevance(self, episode: EpisodicMemoryTrace, 
                                         query: EpisodicQuery) -> float:
        """Calculate relevance score for episode to query"""
        try:
            relevance_score = 0.0
            
            # Text relevance
            query_words = set(query.query_text.lower().split())
            episode_words = set(episode.detailed_description.lower().split())
            episode_title_words = set(episode.episode_title.lower().split())
            
            # Title relevance (weighted higher)
            title_overlap = len(query_words.intersection(episode_title_words))
            if episode_title_words:
                title_relevance = title_overlap / len(query_words)
                relevance_score += title_relevance * 0.4
            
            # Description relevance
            desc_overlap = len(query_words.intersection(episode_words))
            if episode_words:
                desc_relevance = desc_overlap / len(query_words)
                relevance_score += desc_relevance * 0.3
            
            # Importance boost
            relevance_score += episode.importance_score * 0.2
            
            # Vividness boost
            relevance_score += episode.vividness * 0.1
            
            # Recency boost (more recent episodes slightly favored)
            days_since = (datetime.now() - episode.timestamp).days
            recency_boost = max(0, (365 - days_since) / 365 * 0.1)
            relevance_score += recency_boost
            
            # Access frequency boost (frequently accessed episodes slightly favored)
            access_boost = min(episode.access_count * 0.01, 0.1)
            relevance_score += access_boost
            
            return min(relevance_score, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating episode relevance: {str(e)}")
            return 0.0
    
    def _analyze_temporal_patterns(self, episodes: List[EpisodicMemoryTrace]) -> Dict[str, Any]:
        """Analyze temporal patterns in retrieved episodes"""
        try:
            if not episodes:
                return {}
            
            # Group by time periods
            hourly_distribution = {}
            daily_distribution = {}
            monthly_distribution = {}
            
            for episode in episodes:
                hour = episode.timestamp.hour
                day = episode.timestamp.strftime('%A')
                month = episode.timestamp.strftime('%B')
                
                hourly_distribution[hour] = hourly_distribution.get(hour, 0) + 1
                daily_distribution[day] = daily_distribution.get(day, 0) + 1
                monthly_distribution[month] = monthly_distribution.get(month, 0) + 1
            
            # Calculate patterns
            time_span = max(episodes, key=lambda x: x.timestamp).timestamp - min(episodes, key=lambda x: x.timestamp).timestamp
            time_span_days = time_span.total_seconds() / (24 * 3600)
            
            return {
                "time_span_days": round(time_span_days, 1),
                "hourly_distribution": hourly_distribution,
                "daily_distribution": daily_distribution,
                "monthly_distribution": monthly_distribution,
                "peak_hour": max(hourly_distribution.items(), key=lambda x: x[1])[0] if hourly_distribution else None,
                "peak_day": max(daily_distribution.items(), key=lambda x: x[1])[0] if daily_distribution else None,
                "episode_frequency": round(len(episodes) / max(time_span_days, 1), 2)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing temporal patterns: {str(e)}")
            return {"error": str(e)}
    
    def _generate_retrieval_insights(self, episodes: List[EpisodicMemoryTrace], 
                                   query: EpisodicQuery) -> List[str]:
        """Generate insights about retrieved episodes"""
        try:
            insights = []
            
            if not episodes:
                insights.append("No episodes matched the query criteria")
                return insights
            
            # Context distribution
            contexts = [ep.context_type for ep in episodes]
            most_common_context = max(set(contexts), key=contexts.count)
            context_count = contexts.count(most_common_context)
            
            if len(set(contexts)) == 1:
                insights.append(f"All {len(episodes)} episodes are from {most_common_context.value} context")
            else:
                insights.append(f"Most episodes ({context_count}/{len(episodes)}) are from {most_common_context.value} context")
            
            # Emotional analysis
            all_emotions = {}
            for episode in episodes:
                for emotion, intensity in episode.emotional_state.items():
                    if emotion not in all_emotions:
                        all_emotions[emotion] = []
                    all_emotions[emotion].append(intensity)
            
            if all_emotions:
                dominant_emotion = max(all_emotions.items(), 
                                     key=lambda x: sum(x[1]) / len(x[1]))
                avg_intensity = sum(dominant_emotion[1]) / len(dominant_emotion[1])
                insights.append(f"Dominant emotional theme: {dominant_emotion[0]} (avg intensity: {avg_intensity:.2f})")
            
            # Importance analysis
            avg_importance = sum(ep.importance_score for ep in episodes) / len(episodes)
            high_importance_count = sum(1 for ep in episodes if ep.importance_score > 0.7)
            
            insights.append(f"Average importance: {avg_importance:.2f}")
            if high_importance_count > 0:
                insights.append(f"{high_importance_count} high-importance episodes (>0.7)")
            
            # Association analysis
            total_associations = sum(len(ep.related_episodes) for ep in episodes)
            if total_associations > 0:
                insights.append(f"Episodes have {total_associations} total associations with other memories")
            
            # Outcome patterns
            all_outcomes = []
            for episode in episodes:
                all_outcomes.extend([outcome.lower() for outcome in episode.outcomes])
            
            if all_outcomes:
                outcome_counts = {}
                for outcome in all_outcomes:
                    outcome_counts[outcome] = outcome_counts.get(outcome, 0) + 1
                
                if outcome_counts:
                    most_common_outcome = max(outcome_counts.items(), key=lambda x: x[1])
                    if most_common_outcome[1] > 1:
                        insights.append(f"Common outcome pattern: '{most_common_outcome[0]}' ({most_common_outcome[1]} occurrences)")
            
            return insights[:5]  # Limit to 5 insights
            
        except Exception as e:
            logger.error(f"Error generating retrieval insights: {str(e)}")
            return [f"Error generating insights: {str(e)}"]
    
    def get_system_statistics(self) -> Dict[str, Any]:
        """Get comprehensive system statistics"""
        try:
            total_episodes = len(self.episodic_memories)
            
            if total_episodes == 0:
                return {
                    "total_episodes": 0,
                    "system_stats": self.system_stats
                }
            
            # Context distribution
            context_distribution = {}
            for episode in self.episodic_memories.values():
                context = episode.context_type.value
                context_distribution[context] = context_distribution.get(context, 0) + 1
            
            # Temporal granularity distribution
            granularity_distribution = {}
            for episode in self.episodic_memories.values():
                granularity = episode.temporal_granularity.value
                granularity_distribution[granularity] = granularity_distribution.get(granularity, 0) + 1
            
            # Memory quality metrics
            avg_importance = sum(ep.importance_score for ep in self.episodic_memories.values()) / total_episodes
            avg_vividness = sum(ep.vividness for ep in self.episodic_memories.values()) / total_episodes
            avg_confidence = sum(ep.confidence for ep in self.episodic_memories.values()) / total_episodes
            
            # Access patterns
            total_accesses = sum(ep.access_count for ep in self.episodic_memories.values())
            avg_accesses = total_accesses / total_episodes
            
            # Association metrics
            total_associations = sum(len(ep.related_episodes) for ep in self.episodic_memories.values())
            avg_associations = total_associations / total_episodes if total_episodes > 0 else 0
            
            # Index efficiency
            temporal_index_size = sum(len(ids) for ids in self.temporal_index.values())
            context_index_size = sum(len(ids) for ids in self.context_index.values())
            
            return {
                "total_episodes": total_episodes,
                "context_distribution": context_distribution,
                "temporal_granularity_distribution": granularity_distribution,
                "quality_metrics": {
                    "average_importance": round(avg_importance, 3),
                    "average_vividness": round(avg_vividness, 3),
                    "average_confidence": round(avg_confidence, 3)
                },
                "access_patterns": {
                    "total_accesses": total_accesses,
                    "average_accesses_per_episode": round(avg_accesses, 2)
                },
                "association_metrics": {
                    "total_associations": total_associations,
                    "average_associations_per_episode": round(avg_associations, 2)
                },
                "index_efficiency": {
                    "temporal_index_entries": len(self.temporal_index),
                    "temporal_index_size": temporal_index_size,
                    "context_index_size": context_index_size,
                    "participant_index_size": len(self.participant_index),
                    "outcome_index_size": len(self.outcome_index)
                },
                "system_stats": self.system_stats
            }
            
        except Exception as e:
            logger.error(f"Error getting system statistics: {str(e)}")
            return {"error": str(e)}

# Test function
async def test_episodic_memory_system():
    """Test the episodic memory system"""
    print("📅 Testing Episodic Memory System")
    print("=" * 50)
    
    system = EpisodicMemorySystem()
    
    # Test 1: Store diverse episodic memories
    print("\n💾 Test 1: Storing Episodic Memories")
    
    episodes_data = [
        {
            "title": "Phase 4 Multi-Modal Intelligence Success",
            "description": "Successfully completed Phase 4 of RomAI enhancement project with comprehensive multi-modal intelligence implementation. All components passed testing with Grade A+ performance (460/500 points, 92%). The integration of vision-language processing, document understanding, and cross-modal reasoning exceeded expectations.",
            "context": EpisodicContext.PROFESSIONAL,
            "participants": ["AI Agent", "Testing System", "RomAI Core"],
            "location": "Development Environment",
            "outcomes": ["Grade A+ achievement", "92% performance score", "All tests passed"],
            "lessons_learned": ["Modular architecture ensures scalability", "Real integration testing reveals true performance"],
            "emotional_state": {"satisfaction": 0.9, "pride": 0.8, "excitement": 0.7},
            "importance": 0.9,
            "granularity": TemporalGranularity.HOUR
        },
        {
            "title": "Advanced Memory Architecture Planning",
            "description": "Planned and designed Phase 5 advanced memory systems including episodic memory, working memory, long-term storage, and memory consolidation. Identified key requirements for sophisticated memory architectures with temporal patterns and association discovery.",
            "context": EpisodicContext.LEARNING,
            "participants": ["AI Agent", "Memory System Designer"],
            "outcomes": ["Comprehensive architecture design", "Component specifications defined"],
            "lessons_learned": ["Memory systems require multiple specialized components", "Association discovery is crucial for intelligence"],
            "emotional_state": {"curiosity": 0.8, "anticipation": 0.7},
            "importance": 0.8,
            "granularity": TemporalGranularity.HOUR
        },
        {
            "title": "Competitive AI Analysis Discovery",
            "description": "Discovered RomAI's initial performance gap through comprehensive validation against leading AI models. Initial 67.1% overall performance versus 95% world-class targets revealed critical areas for improvement across mathematical reasoning, code generation, and multi-modal capabilities.",
            "context": EpisodicContext.PROBLEM_SOLVING,
            "participants": ["AI Agent", "Validation System"],
            "outcomes": ["Performance gaps identified", "12-phase improvement plan created", "Clear roadmap established"],
            "lessons_learned": ["Validation reveals gaps between aspirations and reality", "Systematic improvement requires structured approach"],
            "emotional_state": {"concern": 0.6, "determination": 0.9},
            "importance": 0.95,
            "granularity": TemporalGranularity.DAY
        }
    ]
    
    stored_episodes = []
    for episode_data in episodes_data:
        episode = await system.store_episodic_memory(
            episode_title=episode_data["title"],
            description=episode_data["description"],
            context_type=episode_data["context"],
            participants=episode_data["participants"],
            location=episode_data.get("location"),
            outcomes=episode_data["outcomes"],
            lessons_learned=episode_data["lessons_learned"],
            emotional_state=episode_data["emotional_state"],
            importance_score=episode_data["importance"],
            temporal_granularity=episode_data["granularity"]
        )
        stored_episodes.append(episode)
        print(f"   ✅ Stored: {episode.episode_title[:50]}...")
        print(f"      Importance: {episode.importance_score:.2f}, Vividness: {episode.vividness:.2f}")
    
    # Test 2: Complex episodic query
    print("\n🔍 Test 2: Complex Episodic Query")
    
    query = EpisodicQuery(
        query_text="Phase 4 multi-modal intelligence performance testing results",
        context_filters=[EpisodicContext.PROFESSIONAL, EpisodicContext.LEARNING],
        importance_threshold=0.7,
        max_results=5,
        include_related=True
    )
    
    retrieval_result = await system.retrieve_episodes(query)
    
    print(f"   ✅ Retrieved {len(retrieval_result.primary_episodes)} primary episodes")
    print(f"   🔗 Retrieved {len(retrieval_result.related_episodes)} related episodes")
    print(f"   ⏱️ Query processing time: {retrieval_result.query_processing_time:.3f}s")
    
    for i, episode in enumerate(retrieval_result.primary_episodes):
        score = retrieval_result.relevance_scores[i] if i < len(retrieval_result.relevance_scores) else 0
        print(f"      {i+1}. {episode.episode_title[:40]}... (relevance: {score:.3f})")
    
    # Test 3: Temporal pattern analysis
    print("\n📊 Test 3: Temporal Pattern Analysis")
    
    if retrieval_result.temporal_patterns:
        patterns = retrieval_result.temporal_patterns
        print(f"   📈 Time span: {patterns.get('time_span_days', 0):.1f} days")
        print(f"   📅 Episode frequency: {patterns.get('episode_frequency', 0):.2f} per day")
        if patterns.get('peak_hour') is not None:
            print(f"   🕐 Peak hour: {patterns['peak_hour']}:00")
    
    # Test 4: Retrieval insights
    print("\n💡 Test 4: Retrieval Insights")
    
    for insight in retrieval_result.retrieval_insights:
        print(f"   🧠 {insight}")
    
    # Test 5: System statistics
    print("\n📊 Test 5: System Statistics")
    
    stats = system.get_system_statistics()
    
    print(f"   📚 Total episodes: {stats['total_episodes']}")
    print(f"   🎯 Average importance: {stats['quality_metrics']['average_importance']:.3f}")
    print(f"   👁️ Average vividness: {stats['quality_metrics']['average_vividness']:.3f}")
    print(f"   🤝 Average associations: {stats['association_metrics']['average_associations_per_episode']:.2f}")
    print(f"   📈 Total accesses: {stats['access_patterns']['total_accesses']}")
    print(f"   🔗 Total associations: {stats['association_metrics']['total_associations']}")
    
    # Context distribution
    print(f"   📂 Context distribution:")
    for context, count in stats['context_distribution'].items():
        print(f"      - {context}: {count}")
    
    # Performance summary
    print(f"\n🎯 Performance Summary:")
    success_rate = 1.0 if len(stored_episodes) == len(episodes_data) else 0.8
    print(f"   Success Rate: {success_rate:.1%}")
    print(f"   Episodes Stored: {len(stored_episodes)}")
    print(f"   Query Performance: {retrieval_result.query_processing_time:.3f}s")
    print(f"   Association Discovery: {stats['system_stats']['associations_discovered']}")
    
    return {
        "success_rate": success_rate,
        "episodes_stored": len(stored_episodes),
        "query_performance": retrieval_result.query_processing_time,
        "associations_discovered": stats['system_stats']['associations_discovered'],
        "average_relevance": sum(retrieval_result.relevance_scores) / len(retrieval_result.relevance_scores) if retrieval_result.relevance_scores else 0
    }

if __name__ == "__main__":
    asyncio.run(test_episodic_memory_system())