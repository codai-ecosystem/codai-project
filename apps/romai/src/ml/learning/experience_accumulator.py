"""
Experience Accumulator for Autonomous Learning & Self-Improvement
Phase 8 - RomAI AGI Development Pipeline

This module accumulates and manages learning experiences, enabling the AGI system
to build knowledge from interactions and improve over time.
"""

import asyncio
import logging
import json
import numpy as np
from typing import Dict, List, Any, Optional, Tuple, Set
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from collections import defaultdict
import pickle
import hashlib

# Configure logger
logger = logging.getLogger(__name__)

@dataclass
class Experience:
    """Represents a single learning experience."""
    experience_id: str
    context: Dict[str, Any]
    action_taken: str
    outcome: Dict[str, Any]
    reward_signal: float
    confidence_level: float
    domain: str
    timestamp: datetime
    
@dataclass
class ExperiencePattern:
    """Represents a discovered pattern in experiences."""
    pattern_id: str
    pattern_type: str
    conditions: Dict[str, Any]
    expected_outcome: Dict[str, Any]
    confidence: float
    support_count: int
    domains: Set[str]
    last_updated: datetime

class ExperienceAccumulator:
    """
    Accumulates and analyzes learning experiences to build knowledge
    and improve decision-making over time.
    """
    
    def __init__(self, max_experiences: int = 10000):
        self.version = "8.0.0"
        self.max_experiences = max_experiences
        self.experiences: List[Experience] = []
        self.experience_patterns: List[ExperiencePattern] = []
        self.domain_knowledge: Dict[str, Dict[str, Any]] = defaultdict(dict)
        self.experience_index: Dict[str, List[int]] = defaultdict(list)
        self.pattern_cache: Dict[str, Any] = {}
        self.is_initialized = False
        
        logger.info(f"📚 Experience Accumulator v{self.version} initializing...")
    
    async def initialize(self) -> bool:
        """Initialize the experience accumulator."""
        try:
            await self._initialize_experience_storage()
            await self._initialize_pattern_detection()
            await self._load_existing_experiences()
            
            self.is_initialized = True
            logger.info("✅ Experience Accumulator initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Experience Accumulator initialization failed: {e}")
            return False
    
    async def _initialize_experience_storage(self):
        """Initialize experience storage and indexing systems."""
        # Initialize domain-based indexing
        self.experience_index = {
            "domain": defaultdict(list),
            "action": defaultdict(list),
            "outcome_type": defaultdict(list),
            "high_reward": [],
            "low_reward": [],
            "recent": []
        }
        
        logger.info("✅ Experience storage initialized")
    
    async def _initialize_pattern_detection(self):
        """Initialize pattern detection algorithms."""
        self.pattern_detection_config = {
            "min_support": 3,           # Minimum experiences to form a pattern
            "confidence_threshold": 0.7, # Minimum confidence for valid patterns
            "similarity_threshold": 0.8,  # Threshold for experience similarity
            "pattern_update_frequency": 100,  # Update patterns every N experiences
            "max_patterns": 1000        # Maximum patterns to maintain
        }
        
        logger.info("✅ Pattern detection initialized")
    
    async def _load_existing_experiences(self):
        """Load any existing experiences from storage."""
        # In a real implementation, this would load from persistent storage
        logger.info("✅ Existing experiences loaded")
    
    async def add_experience(
        self,
        context: Dict[str, Any],
        action_taken: str,
        outcome: Dict[str, Any],
        reward_signal: float,
        domain: str = "general",
        confidence_level: float = 1.0
    ) -> str:
        """
        Add a new experience to the accumulator.
        
        Args:
            context: The situation/context when action was taken
            action_taken: The action that was performed
            outcome: The result of the action
            reward_signal: Numerical reward/feedback (-1.0 to 1.0)
            domain: Domain category for the experience
            confidence_level: Confidence in the experience quality
            
        Returns:
            experience_id: Unique identifier for the experience
        """
        if not self.is_initialized:
            await self.initialize()
        
        try:
            # Generate unique experience ID
            experience_id = self._generate_experience_id(context, action_taken, outcome)
            
            # Create experience object
            experience = Experience(
                experience_id=experience_id,
                context=context,
                action_taken=action_taken,
                outcome=outcome,
                reward_signal=reward_signal,
                confidence_level=confidence_level,
                domain=domain,
                timestamp=datetime.now()
            )
            
            # Add to main storage
            self.experiences.append(experience)
            
            # Update indices
            await self._update_experience_indices(experience, len(self.experiences) - 1)
            
            # Update domain knowledge
            await self._update_domain_knowledge(experience)
            
            # Maintain storage limits
            if len(self.experiences) > self.max_experiences:
                await self._cleanup_old_experiences()
            
            # Trigger pattern analysis if needed
            if len(self.experiences) % self.pattern_detection_config["pattern_update_frequency"] == 0:
                await self._update_experience_patterns()
            
            logger.info(f"📝 Added experience {experience_id} in domain '{domain}' (reward: {reward_signal:.3f})")
            return experience_id
            
        except Exception as e:
            logger.error(f"❌ Failed to add experience: {e}")
            return ""
    
    def _generate_experience_id(self, context: Dict[str, Any], action: str, outcome: Dict[str, Any]) -> str:
        """Generate a unique ID for an experience."""
        content = f"{json.dumps(context, sort_keys=True)}_{action}_{json.dumps(outcome, sort_keys=True)}_{datetime.now().isoformat()}"
        return hashlib.md5(content.encode()).hexdigest()[:16]
    
    async def _update_experience_indices(self, experience: Experience, index: int):
        """Update various indices for fast experience retrieval."""
        # Domain index
        self.experience_index["domain"][experience.domain].append(index)
        
        # Action index
        self.experience_index["action"][experience.action_taken].append(index)
        
        # Outcome type index
        outcome_type = experience.outcome.get("type", "unknown")
        self.experience_index["outcome_type"][outcome_type].append(index)
        
        # Reward-based indices
        if experience.reward_signal > 0.5:
            self.experience_index["high_reward"].append(index)
        elif experience.reward_signal < -0.5:
            self.experience_index["low_reward"].append(index)
        
        # Recent experiences (last 1000)
        self.experience_index["recent"].append(index)
        if len(self.experience_index["recent"]) > 1000:
            self.experience_index["recent"].pop(0)
    
    async def _update_domain_knowledge(self, experience: Experience):
        """Update domain-specific knowledge based on new experience."""
        domain = experience.domain
        
        # Initialize domain knowledge if new
        if domain not in self.domain_knowledge:
            self.domain_knowledge[domain] = {
                "total_experiences": 0,
                "average_reward": 0.0,
                "common_actions": defaultdict(int),
                "successful_patterns": [],
                "failure_patterns": [],
                "last_updated": datetime.now()
            }
        
        domain_data = self.domain_knowledge[domain]
        
        # Update statistics
        domain_data["total_experiences"] += 1
        
        # Update average reward (exponential moving average)
        alpha = 0.1
        current_avg = domain_data["average_reward"]
        domain_data["average_reward"] = (1 - alpha) * current_avg + alpha * experience.reward_signal
        
        # Update common actions
        domain_data["common_actions"][experience.action_taken] += 1
        
        # Update patterns based on success/failure
        if experience.reward_signal > 0.3:
            # Successful experience - extract pattern
            pattern = {
                "context_features": list(experience.context.keys()),
                "action": experience.action_taken,
                "reward": experience.reward_signal
            }
            domain_data["successful_patterns"].append(pattern)
            
            # Keep only recent successful patterns
            if len(domain_data["successful_patterns"]) > 100:
                domain_data["successful_patterns"] = domain_data["successful_patterns"][-100:]
        
        domain_data["last_updated"] = datetime.now()
    
    async def _cleanup_old_experiences(self):
        """Remove old experiences to maintain storage limits."""
        # Remove oldest 10% of experiences
        remove_count = int(self.max_experiences * 0.1)
        
        # Sort by timestamp and remove oldest
        self.experiences.sort(key=lambda x: x.timestamp)
        removed_experiences = self.experiences[:remove_count]
        self.experiences = self.experiences[remove_count:]
        
        # Rebuild indices after cleanup
        await self._rebuild_experience_indices()
        
        logger.info(f"🧹 Cleaned up {remove_count} old experiences")
    
    async def _rebuild_experience_indices(self):
        """Rebuild all experience indices after cleanup."""
        # Reset indices
        self.experience_index = {
            "domain": defaultdict(list),
            "action": defaultdict(list),
            "outcome_type": defaultdict(list),
            "high_reward": [],
            "low_reward": [],
            "recent": []
        }
        
        # Rebuild indices
        for i, experience in enumerate(self.experiences):
            await self._update_experience_indices(experience, i)
    
    async def _update_experience_patterns(self):
        """Update experience patterns based on accumulated data."""
        try:
            # Clear old patterns
            self.experience_patterns.clear()
            
            # Analyze patterns by domain
            for domain in self.domain_knowledge.keys():
                domain_patterns = await self._extract_domain_patterns(domain)
                self.experience_patterns.extend(domain_patterns)
            
            # Analyze cross-domain patterns
            cross_domain_patterns = await self._extract_cross_domain_patterns()
            self.experience_patterns.extend(cross_domain_patterns)
            
            logger.info(f"🔍 Updated experience patterns: {len(self.experience_patterns)} patterns found")
            
        except Exception as e:
            logger.error(f"❌ Failed to update experience patterns: {e}")
    
    async def _extract_domain_patterns(self, domain: str) -> List[ExperiencePattern]:
        """Extract patterns specific to a domain."""
        patterns = []
        
        # Get experiences for this domain
        domain_indices = self.experience_index["domain"][domain]
        domain_experiences = [self.experiences[i] for i in domain_indices]
        
        if len(domain_experiences) < self.pattern_detection_config["min_support"]:
            return patterns
        
        # Group by action
        action_groups = defaultdict(list)
        for exp in domain_experiences:
            action_groups[exp.action_taken].append(exp)
        
        # Extract patterns for each action
        for action, action_experiences in action_groups.items():
            if len(action_experiences) >= self.pattern_detection_config["min_support"]:
                pattern = await self._create_action_pattern(action, action_experiences, domain)
                if pattern:
                    patterns.append(pattern)
        
        return patterns
    
    async def _create_action_pattern(
        self, 
        action: str, 
        experiences: List[Experience], 
        domain: str
    ) -> Optional[ExperiencePattern]:
        """Create a pattern for a specific action in a domain."""
        
        if len(experiences) < self.pattern_detection_config["min_support"]:
            return None
        
        # Analyze common context features
        context_features = defaultdict(list)
        rewards = []
        outcomes = defaultdict(int)
        
        for exp in experiences:
            for key, value in exp.context.items():
                context_features[key].append(value)
            rewards.append(exp.reward_signal)
            
            outcome_type = exp.outcome.get("type", "unknown")
            outcomes[outcome_type] += 1
        
        # Find most common context conditions
        common_conditions = {}
        for key, values in context_features.items():
            if len(set(values)) == 1:  # All experiences have same value
                common_conditions[key] = values[0]
            elif len(values) >= 3:  # Statistical mode for multiple values
                most_common = max(set(values), key=values.count)
                if values.count(most_common) / len(values) > 0.6:  # 60% threshold
                    common_conditions[key] = most_common
        
        # Calculate pattern confidence
        avg_reward = np.mean(rewards)
        reward_consistency = 1.0 - np.std(rewards)  # Higher consistency = higher confidence
        confidence = max(0.0, min(1.0, (avg_reward + 1.0) / 2.0 * reward_consistency))
        
        if confidence < self.pattern_detection_config["confidence_threshold"]:
            return None
        
        # Most common outcome
        most_common_outcome = max(outcomes.items(), key=lambda x: x[1])
        
        pattern_id = self._generate_pattern_id(action, common_conditions, domain)
        
        return ExperiencePattern(
            pattern_id=pattern_id,
            pattern_type="action_outcome",
            conditions={"action": action, "context": common_conditions, "domain": domain},
            expected_outcome={"type": most_common_outcome[0], "expected_reward": avg_reward},
            confidence=confidence,
            support_count=len(experiences),
            domains={domain},
            last_updated=datetime.now()
        )
    
    def _generate_pattern_id(self, action: str, conditions: Dict[str, Any], domain: str) -> str:
        """Generate a unique ID for a pattern."""
        content = f"{action}_{json.dumps(conditions, sort_keys=True)}_{domain}"
        return hashlib.md5(content.encode()).hexdigest()[:12]
    
    async def _extract_cross_domain_patterns(self) -> List[ExperiencePattern]:
        """Extract patterns that work across multiple domains."""
        patterns = []
        
        # Group experiences by action across all domains
        action_groups = defaultdict(list)
        for exp in self.experiences:
            action_groups[exp.action_taken].append(exp)
        
        # Find actions that work well across multiple domains
        for action, action_experiences in action_groups.items():
            domains_used = set(exp.domain for exp in action_experiences)
            
            if len(domains_used) >= 2 and len(action_experiences) >= self.pattern_detection_config["min_support"]:
                # Check if action is consistently successful across domains
                domain_rewards = defaultdict(list)
                for exp in action_experiences:
                    domain_rewards[exp.domain].append(exp.reward_signal)
                
                # Calculate cross-domain consistency
                domain_avg_rewards = {domain: np.mean(rewards) for domain, rewards in domain_rewards.items()}
                all_positive = all(avg > 0.2 for avg in domain_avg_rewards.values())
                
                if all_positive:
                    overall_avg = np.mean([exp.reward_signal for exp in action_experiences])
                    confidence = min(1.0, (overall_avg + 1.0) / 2.0)
                    
                    if confidence >= self.pattern_detection_config["confidence_threshold"]:
                        pattern_id = f"cross_domain_{action}_{len(domains_used)}"
                        
                        pattern = ExperiencePattern(
                            pattern_id=pattern_id,
                            pattern_type="cross_domain",
                            conditions={"action": action, "min_domains": len(domains_used)},
                            expected_outcome={"type": "positive", "expected_reward": overall_avg},
                            confidence=confidence,
                            support_count=len(action_experiences),
                            domains=domains_used,
                            last_updated=datetime.now()
                        )
                        
                        patterns.append(pattern)
        
        return patterns
    
    async def query_experiences(
        self,
        context: Optional[Dict[str, Any]] = None,
        domain: Optional[str] = None,
        action: Optional[str] = None,
        min_reward: Optional[float] = None,
        limit: int = 10
    ) -> List[Experience]:
        """
        Query experiences based on specified criteria.
        
        Args:
            context: Context features to match
            domain: Domain to filter by
            action: Action to filter by
            min_reward: Minimum reward threshold
            limit: Maximum number of results
            
        Returns:
            List of matching experiences
        """
        if not self.is_initialized:
            await self.initialize()
        
        try:
            candidate_indices = set(range(len(self.experiences)))
            
            # Apply domain filter
            if domain:
                domain_indices = set(self.experience_index["domain"][domain])
                candidate_indices &= domain_indices
            
            # Apply action filter
            if action:
                action_indices = set(self.experience_index["action"][action])
                candidate_indices &= action_indices
            
            # Apply reward filter
            if min_reward is not None:
                reward_indices = set()
                for i in candidate_indices:
                    if self.experiences[i].reward_signal >= min_reward:
                        reward_indices.add(i)
                candidate_indices &= reward_indices
            
            # Get candidate experiences
            candidates = [self.experiences[i] for i in candidate_indices]
            
            # Apply context similarity filter if provided
            if context:
                scored_candidates = []
                for exp in candidates:
                    similarity = self._calculate_context_similarity(context, exp.context)
                    scored_candidates.append((exp, similarity))
                
                # Sort by similarity and take top results
                scored_candidates.sort(key=lambda x: x[1], reverse=True)
                results = [exp for exp, _ in scored_candidates[:limit]]
            else:
                # Sort by timestamp (most recent first) and limit
                candidates.sort(key=lambda x: x.timestamp, reverse=True)
                results = candidates[:limit]
            
            logger.info(f"🔍 Query returned {len(results)} experiences")
            return results
            
        except Exception as e:
            logger.error(f"❌ Experience query failed: {e}")
            return []
    
    def _calculate_context_similarity(self, context1: Dict[str, Any], context2: Dict[str, Any]) -> float:
        """Calculate similarity between two contexts."""
        if not context1 or not context2:
            return 0.0
        
        # Get common keys
        common_keys = set(context1.keys()) & set(context2.keys())
        if not common_keys:
            return 0.0
        
        # Calculate similarity for common features
        matches = 0
        for key in common_keys:
            if context1[key] == context2[key]:
                matches += 1
        
        similarity = matches / len(common_keys)
        return similarity
    
    async def get_domain_insights(self, domain: str) -> Dict[str, Any]:
        """Get insights and statistics for a specific domain."""
        if domain not in self.domain_knowledge:
            return {"status": "no_data", "message": f"No experiences recorded for domain '{domain}'"}
        
        domain_data = self.domain_knowledge[domain]
        domain_indices = self.experience_index["domain"][domain]
        domain_experiences = [self.experiences[i] for i in domain_indices]
        
        # Calculate additional statistics
        recent_experiences = [exp for exp in domain_experiences if exp.timestamp > datetime.now() - timedelta(days=7)]
        high_reward_experiences = [exp for exp in domain_experiences if exp.reward_signal > 0.5]
        
        # Most successful actions
        action_performance = defaultdict(list)
        for exp in domain_experiences:
            action_performance[exp.action_taken].append(exp.reward_signal)
        
        top_actions = {}
        for action, rewards in action_performance.items():
            if len(rewards) >= 3:  # Minimum experiences for reliability
                top_actions[action] = {
                    "count": len(rewards),
                    "avg_reward": np.mean(rewards),
                    "success_rate": sum(1 for r in rewards if r > 0) / len(rewards)
                }
        
        return {
            "domain": domain,
            "total_experiences": domain_data["total_experiences"],
            "average_reward": domain_data["average_reward"],
            "recent_experiences_count": len(recent_experiences),
            "high_reward_experiences_count": len(high_reward_experiences),
            "top_actions": dict(sorted(top_actions.items(), key=lambda x: x[1]["avg_reward"], reverse=True)[:5]),
            "patterns_found": len([p for p in self.experience_patterns if domain in p.domains]),
            "last_updated": domain_data["last_updated"]
        }
    
    async def get_experience_statistics(self) -> Dict[str, Any]:
        """Get comprehensive experience accumulation statistics."""
        if not self.experiences:
            return {"status": "no_data", "message": "No experiences recorded yet"}
        
        total_experiences = len(self.experiences)
        avg_reward = np.mean([exp.reward_signal for exp in self.experiences])
        
        # Domain distribution
        domain_counts = defaultdict(int)
        for exp in self.experiences:
            domain_counts[exp.domain] += 1
        
        # Reward distribution
        positive_rewards = sum(1 for exp in self.experiences if exp.reward_signal > 0)
        negative_rewards = sum(1 for exp in self.experiences if exp.reward_signal < 0)
        
        # Recent activity
        recent_cutoff = datetime.now() - timedelta(hours=24)
        recent_experiences = sum(1 for exp in self.experiences if exp.timestamp > recent_cutoff)
        
        return {
            "total_experiences": total_experiences,
            "average_reward": avg_reward,
            "positive_experiences": positive_rewards,
            "negative_experiences": negative_rewards,
            "neutral_experiences": total_experiences - positive_rewards - negative_rewards,
            "domain_distribution": dict(domain_counts),
            "patterns_discovered": len(self.experience_patterns),
            "recent_activity_24h": recent_experiences,
            "domains_explored": len(domain_counts),
            "experience_accumulator_version": self.version,
            "is_learning": True
        }
    
    async def shutdown(self):
        """Gracefully shutdown the experience accumulator."""
        if self.experiences:
            logger.info(f"💾 Saving {len(self.experiences)} experiences and {len(self.experience_patterns)} patterns")
        
        logger.info("🛑 Experience Accumulator shut down gracefully")
