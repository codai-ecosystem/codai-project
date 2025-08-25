"""
Memory Consolidation Engine - Phase 5 Component
Specialized system for consolidating working memory into long-term storage
"""

import asyncio
import time
import json
import uuid
from typing import Dict, List, Optional, Any, Union, Tuple, Set
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import logging
import math
from collections import defaultdict, deque

# Import our existing components
from romai_api_client import RomAIAPIClient
from .memory_core import MemoryType, MemoryStrength, ConsolidationStatus
from episodic_memory_system import EpisodicContext, EpisodicMemorySystem
from working_memory_processor import WorkingMemoryProcessor, WorkingMemoryPriority, MemoryChunkType
from long_term_storage_manager import LongTermStorageManager, StorageCategory

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConsolidationStrategy(Enum):
    IMMEDIATE = "immediate"           # Consolidate immediately
    THRESHOLD_BASED = "threshold_based"  # Consolidate when threshold reached
    TIME_BASED = "time_based"        # Consolidate at regular intervals
    INTELLIGENT = "intelligent"      # AI-driven consolidation decisions
    HYBRID = "hybrid"                # Combination of strategies

class ConsolidationTrigger(Enum):
    ACTIVATION_DECAY = "activation_decay"     # Low activation triggers consolidation
    TIME_EXPIRED = "time_expired"            # Time limit reached
    CAPACITY_PRESSURE = "capacity_pressure"  # Memory capacity pressure
    IMPORTANCE_BOOST = "importance_boost"    # High importance content
    PATTERN_DETECTED = "pattern_detected"    # Pattern recognition trigger
    USER_REQUEST = "user_request"            # Explicit user request
    SYSTEM_SHUTDOWN = "system_shutdown"      # System preparing to shutdown

class ConsolidationQuality(Enum):
    EXCELLENT = "excellent"          # 90-100% quality
    GOOD = "good"                   # 75-89% quality
    ACCEPTABLE = "acceptable"       # 60-74% quality
    POOR = "poor"                   # 40-59% quality
    FAILED = "failed"               # <40% quality

@dataclass
class ConsolidationTask:
    task_id: str
    source_memory_id: str
    source_content: Any
    source_type: MemoryType
    trigger: ConsolidationTrigger
    priority: float                  # 0.0 to 1.0
    estimated_value: float           # Expected long-term value
    processing_complexity: float     # Processing difficulty estimate
    dependencies: List[str]          # Other tasks this depends on
    created_timestamp: datetime
    deadline: Optional[datetime]
    metadata: Dict[str, Any]

@dataclass
class ConsolidationResult:
    task_id: str
    source_memory_id: str
    target_storage_id: Optional[str]
    consolidation_quality: ConsolidationQuality
    processing_time: float
    value_preserved: float           # How much value was preserved (0.0-1.0)
    compression_achieved: float      # Data compression ratio
    associations_created: int        # Number of associations discovered
    insights_generated: List[str]    # Insights generated during consolidation
    success: bool
    error_message: Optional[str]

@dataclass
class ConsolidationMetrics:
    total_tasks_processed: int
    successful_consolidations: int
    failed_consolidations: int
    average_quality_score: float
    average_processing_time: float
    total_value_preserved: float
    total_compression_ratio: float
    associations_discovered: int
    insights_generated: int
    consolidation_efficiency: float

class MemoryConsolidationEngine:
    """Advanced memory consolidation system for transferring working memory to long-term storage"""
    
    def __init__(self, working_memory: WorkingMemoryProcessor,
                 episodic_memory: EpisodicMemorySystem,
                 long_term_storage: LongTermStorageManager):
        self.romai_client = RomAIAPIClient()
        
        # Memory system references
        self.working_memory = working_memory
        self.episodic_memory = episodic_memory
        self.long_term_storage = long_term_storage
        
        # Consolidation settings
        self.consolidation_strategy = ConsolidationStrategy.INTELLIGENT
        self.consolidation_threshold = 0.6  # Activation threshold for consolidation
        self.min_consolidation_interval = 300  # 5 minutes between consolidations
        self.max_batch_size = 10  # Maximum items per consolidation batch
        self.quality_threshold = ConsolidationQuality.ACCEPTABLE
        
        # Processing queues and storage
        self.consolidation_queue: List[ConsolidationTask] = []
        self.processing_history: deque = deque(maxlen=1000)
        self.active_tasks: Dict[str, ConsolidationTask] = {}
        
        # Performance tracking
        self.metrics = ConsolidationMetrics(
            total_tasks_processed=0,
            successful_consolidations=0,
            failed_consolidations=0,
            average_quality_score=0.0,
            average_processing_time=0.0,
            total_value_preserved=0.0,
            total_compression_ratio=0.0,
            associations_discovered=0,
            insights_generated=0,
            consolidation_efficiency=0.0
        )
        
        # System state
        self.last_consolidation_time = datetime.now()
        self.consolidation_running = False
        
        logger.info("Memory Consolidation Engine initialized")
    
    def _generate_task_id(self) -> str:
        """Generate unique consolidation task ID"""
        timestamp = int(time.time())
        unique_id = str(uuid.uuid4())[:8]
        return f"CONS_{timestamp}_{unique_id}"
    
    async def analyze_consolidation_candidates(self) -> List[ConsolidationTask]:
        """Analyze working memory to identify consolidation candidates"""
        try:
            candidates = []
            current_time = datetime.now()
            
            # Get working memory state
            memory_state = self.working_memory.get_memory_state()
            
            for chunk_info in memory_state.get('active_chunks', []):
                # Simulate chunk retrieval (in real implementation, would get full chunk data)
                chunk_activation = chunk_info.get('activation', 0.0)
                chunk_age_minutes = chunk_info.get('age_minutes', 0.0)
                chunk_priority = chunk_info.get('priority', 'medium')
                chunk_type = chunk_info.get('type', 'data')
                
                # Determine consolidation triggers
                triggers = []
                
                # Activation decay trigger
                if chunk_activation < self.consolidation_threshold:
                    triggers.append(ConsolidationTrigger.ACTIVATION_DECAY)
                
                # Time expired trigger
                if chunk_age_minutes > 30:  # 30 minutes threshold
                    triggers.append(ConsolidationTrigger.TIME_EXPIRED)
                
                # Importance boost trigger
                if chunk_priority in ['critical', 'high']:
                    triggers.append(ConsolidationTrigger.IMPORTANCE_BOOST)
                
                # Only create task if there are triggers
                if triggers:
                    # Estimate consolidation value
                    estimated_value = await self._estimate_consolidation_value(
                        chunk_info, triggers
                    )
                    
                    if estimated_value > 0.3:  # Minimum value threshold
                        task = ConsolidationTask(
                            task_id=self._generate_task_id(),
                            source_memory_id=chunk_info.get('chunk_id', ''),
                            source_content=f"Chunk content simulation for {chunk_info.get('type', 'unknown')}",
                            source_type=self._map_chunk_type_to_memory_type(chunk_type),
                            trigger=triggers[0],  # Primary trigger
                            priority=estimated_value,
                            estimated_value=estimated_value,
                            processing_complexity=self._estimate_processing_complexity(chunk_info),
                            dependencies=[],
                            created_timestamp=current_time,
                            deadline=current_time + timedelta(hours=1),
                            metadata={
                                "original_activation": chunk_activation,
                                "age_minutes": chunk_age_minutes,
                                "triggers": [t.value for t in triggers],
                                "chunk_priority": chunk_priority
                            }
                        )
                        
                        candidates.append(task)
            
            # Sort candidates by priority and estimated value
            candidates.sort(key=lambda t: (t.priority, t.estimated_value), reverse=True)
            
            logger.info(f"Identified {len(candidates)} consolidation candidates")
            
            return candidates[:self.max_batch_size]  # Limit batch size
            
        except Exception as e:
            logger.error(f"Error analyzing consolidation candidates: {str(e)}")
            return []
    
    def _map_chunk_type_to_memory_type(self, chunk_type: str) -> MemoryType:
        """Map working memory chunk type to memory type"""
        mapping = {
            "instruction": MemoryType.PROCEDURAL,
            "data": MemoryType.SEMANTIC,
            "context": MemoryType.SEMANTIC,
            "intermediate": MemoryType.SEMANTIC,
            "goal": MemoryType.PROCEDURAL,
            "feedback": MemoryType.EPISODIC,
            "association": MemoryType.ASSOCIATIVE
        }
        
        return mapping.get(chunk_type, MemoryType.SEMANTIC)
    
    async def _estimate_consolidation_value(self, chunk_info: Dict[str, Any], 
                                          triggers: List[ConsolidationTrigger]) -> float:
        """Estimate the long-term value of consolidating a memory chunk"""
        try:
            base_value = 0.3  # Base value for any memory
            
            # Priority-based value
            priority_values = {
                'critical': 0.4,
                'high': 0.3,
                'medium': 0.2,
                'low': 0.1
            }
            
            priority = chunk_info.get('priority', 'medium')
            base_value += priority_values.get(priority, 0.2)
            
            # Type-based value
            type_values = {
                'instruction': 0.3,
                'goal': 0.25,
                'data': 0.2,
                'feedback': 0.15,
                'context': 0.1,
                'intermediate': 0.1,
                'association': 0.05
            }
            
            chunk_type = chunk_info.get('type', 'data')
            base_value += type_values.get(chunk_type, 0.1)
            
            # Age-based value (older chunks that survived are more valuable)
            age_minutes = chunk_info.get('age_minutes', 0.0)
            if age_minutes > 60:  # Survived over an hour
                base_value += 0.15
            elif age_minutes > 30:  # Survived over 30 minutes
                base_value += 0.1
            
            # Activation level consideration (balanced - not too high or too low)
            activation = chunk_info.get('activation', 0.0)
            if 0.3 <= activation <= 0.7:  # Sweet spot for consolidation
                base_value += 0.1
            
            # Trigger-based adjustments
            for trigger in triggers:
                if trigger == ConsolidationTrigger.IMPORTANCE_BOOST:
                    base_value += 0.2
                elif trigger == ConsolidationTrigger.PATTERN_DETECTED:
                    base_value += 0.15
                elif trigger == ConsolidationTrigger.USER_REQUEST:
                    base_value += 0.3
            
            return min(base_value, 1.0)  # Cap at 1.0
            
        except Exception as e:
            logger.error(f"Error estimating consolidation value: {str(e)}")
            return 0.5  # Default moderate value
    
    def _estimate_processing_complexity(self, chunk_info: Dict[str, Any]) -> float:
        """Estimate processing complexity for consolidation"""
        try:
            base_complexity = 0.3
            
            # Type-based complexity
            type_complexity = {
                'instruction': 0.6,
                'goal': 0.5,
                'feedback': 0.4,
                'data': 0.3,
                'context': 0.2,
                'intermediate': 0.3,
                'association': 0.7
            }
            
            chunk_type = chunk_info.get('type', 'data')
            base_complexity += type_complexity.get(chunk_type, 0.3)
            
            # Priority affects complexity (higher priority needs more careful handling)
            priority = chunk_info.get('priority', 'medium')
            if priority == 'critical':
                base_complexity += 0.2
            elif priority == 'high':
                base_complexity += 0.1
            
            return min(base_complexity, 1.0)
            
        except Exception as e:
            logger.error(f"Error estimating processing complexity: {str(e)}")
            return 0.5
    
    async def process_consolidation_task(self, task: ConsolidationTask) -> ConsolidationResult:
        """Process a single consolidation task"""
        start_time = time.time()
        
        try:
            logger.info(f"Processing consolidation task: {task.task_id}")
            
            # Determine target storage system
            target_storage = await self._determine_target_storage(task)
            
            # Process based on target storage
            if target_storage == "episodic":
                result = await self._consolidate_to_episodic(task, start_time)
            elif target_storage == "long_term":
                result = await self._consolidate_to_long_term(task, start_time)
            else:
                result = ConsolidationResult(
                    task_id=task.task_id,
                    source_memory_id=task.source_memory_id,
                    target_storage_id=None,
                    consolidation_quality=ConsolidationQuality.FAILED,
                    processing_time=time.time() - start_time,
                    value_preserved=0.0,
                    compression_achieved=0.0,
                    associations_created=0,
                    insights_generated=[],
                    success=False,
                    error_message="Unknown target storage type"
                )
            
            # Update metrics
            await self._update_metrics(result)
            
            # Store result in history
            self.processing_history.append(result)
            
            logger.info(f"Consolidation task {task.task_id} completed: {result.consolidation_quality.value}")
            
            return result
            
        except Exception as e:
            processing_time = time.time() - start_time
            error_result = ConsolidationResult(
                task_id=task.task_id,
                source_memory_id=task.source_memory_id,
                target_storage_id=None,
                consolidation_quality=ConsolidationQuality.FAILED,
                processing_time=processing_time,
                value_preserved=0.0,
                compression_achieved=0.0,
                associations_created=0,
                insights_generated=[],
                success=False,
                error_message=str(e)
            )
            
            logger.error(f"Error processing consolidation task {task.task_id}: {str(e)}")
            return error_result
    
    async def _determine_target_storage(self, task: ConsolidationTask) -> str:
        """Determine appropriate target storage for consolidation"""
        try:
            # Episodic memory for experience-related content
            if task.source_type == MemoryType.EPISODIC:
                return "episodic"
            
            # Check for experiential content patterns
            content_str = str(task.source_content).lower()
            experiential_keywords = [
                'completed', 'achieved', 'discovered', 'learned', 'experienced',
                'found', 'realized', 'succeeded', 'failed', 'tried'
            ]
            
            if any(keyword in content_str for keyword in experiential_keywords):
                return "episodic"
            
            # Check for procedural content
            procedural_keywords = [
                'step', 'process', 'method', 'procedure', 'how to',
                'instructions', 'guide', 'tutorial'
            ]
            
            if any(keyword in content_str for keyword in procedural_keywords):
                return "long_term"
            
            # Default to long-term storage
            return "long_term"
            
        except Exception:
            return "long_term"  # Default fallback
    
    async def _consolidate_to_episodic(self, task: ConsolidationTask, start_time: float) -> ConsolidationResult:
        """Consolidate memory to episodic memory system"""
        try:
            # Create episodic memory entry
            context_type = EpisodicContext.SYSTEM  # Default context
            
            # Try to determine more specific context
            content_str = str(task.source_content).lower()
            if 'problem' in content_str or 'solve' in content_str:
                context_type = EpisodicContext.PROBLEM_SOLVING
            elif 'learn' in content_str or 'discover' in content_str:
                context_type = EpisodicContext.LEARNING
            elif 'work' in content_str or 'task' in content_str:
                context_type = EpisodicContext.PROFESSIONAL
            
            # Store in episodic memory
            episodic_entry = await self.episodic_memory.store_episodic_memory(
                episode_title=f"Consolidated memory from working memory",
                description=str(task.source_content),
                context_type=context_type,
                outcomes=[f"Consolidation from {task.trigger.value}"],
                importance_score=task.estimated_value,
                additional_metadata={
                    "consolidation_task_id": task.task_id,
                    "original_source": task.source_memory_id,
                    "consolidation_timestamp": datetime.now().isoformat()
                }
            )
            
            # Calculate quality metrics
            processing_time = time.time() - start_time
            value_preserved = min(task.estimated_value + 0.1, 1.0)  # Slight boost for successful consolidation
            
            # Generate insights
            insights = [
                f"Memory consolidated from {task.trigger.value} trigger",
                f"Preserved {value_preserved:.1%} of original value",
                f"Stored in {context_type.value} episodic context"
            ]
            
            return ConsolidationResult(
                task_id=task.task_id,
                source_memory_id=task.source_memory_id,
                target_storage_id=episodic_entry.memory_id,
                consolidation_quality=ConsolidationQuality.GOOD,
                processing_time=processing_time,
                value_preserved=value_preserved,
                compression_achieved=1.0,  # No compression in episodic
                associations_created=len(episodic_entry.related_episodes),
                insights_generated=insights,
                success=True,
                error_message=None
            )
            
        except Exception as e:
            processing_time = time.time() - start_time
            return ConsolidationResult(
                task_id=task.task_id,
                source_memory_id=task.source_memory_id,
                target_storage_id=None,
                consolidation_quality=ConsolidationQuality.FAILED,
                processing_time=processing_time,
                value_preserved=0.0,
                compression_achieved=0.0,
                associations_created=0,
                insights_generated=[f"Episodic consolidation failed: {str(e)}"],
                success=False,
                error_message=str(e)
            )
    
    async def _consolidate_to_long_term(self, task: ConsolidationTask, start_time: float) -> ConsolidationResult:
        """Consolidate memory to long-term storage system"""
        try:
            # Determine storage category
            storage_category = StorageCategory.FACTUAL  # Default
            
            if task.source_type == MemoryType.PROCEDURAL:
                storage_category = StorageCategory.PROCEDURAL
            elif task.source_type == MemoryType.EPISODIC:
                storage_category = StorageCategory.EXPERIENTIAL
            elif task.source_type == MemoryType.SEMANTIC:
                storage_category = StorageCategory.CONCEPTUAL
            elif task.source_type == MemoryType.ASSOCIATIVE:
                storage_category = StorageCategory.PATTERN
            
            # Store in long-term memory
            storage_id = await self.long_term_storage.store_entry(
                content=task.source_content,
                category=storage_category,
                importance_score=task.estimated_value,
                retention_priority=task.priority,
                source_context={
                    "consolidation_source": "working_memory",
                    "original_memory_id": task.source_memory_id,
                    "consolidation_trigger": task.trigger.value,
                    "consolidation_timestamp": datetime.now().isoformat()
                },
                metadata={
                    "consolidation_task_id": task.task_id,
                    "processing_complexity": task.processing_complexity,
                    "original_priority": task.metadata.get("chunk_priority", "unknown")
                }
            )
            
            # Calculate quality metrics
            processing_time = time.time() - start_time
            value_preserved = min(task.estimated_value + 0.15, 1.0)  # Boost for long-term storage
            
            # Simulate compression ratio (would be real in actual implementation)
            compression_achieved = 0.85  # Simulated compression
            
            # Generate insights
            insights = [
                f"Memory consolidated to {storage_category.value} storage",
                f"Achieved {compression_achieved:.1%} compression ratio",
                f"Long-term retention priority: {task.priority:.2f}"
            ]
            
            return ConsolidationResult(
                task_id=task.task_id,
                source_memory_id=task.source_memory_id,
                target_storage_id=storage_id,
                consolidation_quality=ConsolidationQuality.GOOD,
                processing_time=processing_time,
                value_preserved=value_preserved,
                compression_achieved=compression_achieved,
                associations_created=1,  # Assume at least one association created
                insights_generated=insights,
                success=True,
                error_message=None
            )
            
        except Exception as e:
            processing_time = time.time() - start_time
            return ConsolidationResult(
                task_id=task.task_id,
                source_memory_id=task.source_memory_id,
                target_storage_id=None,
                consolidation_quality=ConsolidationQuality.FAILED,
                processing_time=processing_time,
                value_preserved=0.0,
                compression_achieved=0.0,
                associations_created=0,
                insights_generated=[f"Long-term consolidation failed: {str(e)}"],
                success=False,
                error_message=str(e)
            )
    
    async def _update_metrics(self, result: ConsolidationResult) -> None:
        """Update consolidation metrics"""
        try:
            self.metrics.total_tasks_processed += 1
            
            if result.success:
                self.metrics.successful_consolidations += 1
                
                # Update quality score (running average)
                quality_scores = {
                    ConsolidationQuality.EXCELLENT: 1.0,
                    ConsolidationQuality.GOOD: 0.8,
                    ConsolidationQuality.ACCEPTABLE: 0.6,
                    ConsolidationQuality.POOR: 0.4,
                    ConsolidationQuality.FAILED: 0.0
                }
                
                quality_score = quality_scores.get(result.consolidation_quality, 0.0)
                
                # Running average calculation
                total_successful = self.metrics.successful_consolidations
                current_avg = self.metrics.average_quality_score
                self.metrics.average_quality_score = (
                    (current_avg * (total_successful - 1) + quality_score) / total_successful
                )
            else:
                self.metrics.failed_consolidations += 1
            
            # Update processing time (running average)
            total_processed = self.metrics.total_tasks_processed
            current_time_avg = self.metrics.average_processing_time
            self.metrics.average_processing_time = (
                (current_time_avg * (total_processed - 1) + result.processing_time) / total_processed
            )
            
            # Update other metrics
            self.metrics.total_value_preserved += result.value_preserved
            self.metrics.total_compression_ratio += result.compression_achieved
            self.metrics.associations_discovered += result.associations_created
            self.metrics.insights_generated += len(result.insights_generated)
            
            # Calculate efficiency (successful consolidations / total attempts)
            if self.metrics.total_tasks_processed > 0:
                self.metrics.consolidation_efficiency = (
                    self.metrics.successful_consolidations / self.metrics.total_tasks_processed
                )
            
        except Exception as e:
            logger.error(f"Error updating metrics: {str(e)}")
    
    async def run_consolidation_cycle(self) -> Dict[str, Any]:
        """Run a complete consolidation cycle"""
        cycle_start = time.time()
        
        try:
            if self.consolidation_running:
                return {"error": "Consolidation already running"}
            
            self.consolidation_running = True
            logger.info("Starting consolidation cycle")
            
            # Analyze candidates
            candidates = await self.analyze_consolidation_candidates()
            
            if not candidates:
                logger.info("No consolidation candidates found")
                return {
                    "candidates_found": 0,
                    "tasks_processed": 0,
                    "successful_consolidations": 0,
                    "cycle_time": time.time() - cycle_start
                }
            
            # Process consolidation tasks
            results = []
            successful_count = 0
            
            for task in candidates:
                self.active_tasks[task.task_id] = task
                
                result = await self.process_consolidation_task(task)
                results.append(result)
                
                if result.success:
                    successful_count += 1
                
                # Remove from active tasks
                if task.task_id in self.active_tasks:
                    del self.active_tasks[task.task_id]
            
            # Update system state
            self.last_consolidation_time = datetime.now()
            
            cycle_time = time.time() - cycle_start
            
            cycle_results = {
                "candidates_found": len(candidates),
                "tasks_processed": len(results),
                "successful_consolidations": successful_count,
                "failed_consolidations": len(results) - successful_count,
                "cycle_time": cycle_time,
                "average_task_time": cycle_time / len(results) if results else 0,
                "quality_distribution": self._analyze_quality_distribution(results),
                "insights_generated": sum(len(r.insights_generated) for r in results),
                "total_value_preserved": sum(r.value_preserved for r in results),
                "average_compression": sum(r.compression_achieved for r in results) / len(results) if results else 0
            }
            
            logger.info(f"Consolidation cycle completed: {successful_count}/{len(results)} successful")
            
            return cycle_results
            
        except Exception as e:
            logger.error(f"Error in consolidation cycle: {str(e)}")
            return {"error": str(e)}
        
        finally:
            self.consolidation_running = False
    
    def _analyze_quality_distribution(self, results: List[ConsolidationResult]) -> Dict[str, int]:
        """Analyze quality distribution of consolidation results"""
        try:
            quality_counts = defaultdict(int)
            
            for result in results:
                quality_counts[result.consolidation_quality.value] += 1
            
            return dict(quality_counts)
            
        except Exception:
            return {}
    
    def get_consolidation_metrics(self) -> Dict[str, Any]:
        """Get comprehensive consolidation metrics"""
        try:
            # Calculate additional derived metrics
            success_rate = 0.0
            if self.metrics.total_tasks_processed > 0:
                success_rate = self.metrics.successful_consolidations / self.metrics.total_tasks_processed
            
            average_value_per_task = 0.0
            if self.metrics.total_tasks_processed > 0:
                average_value_per_task = self.metrics.total_value_preserved / self.metrics.total_tasks_processed
            
            average_compression = 0.0
            if self.metrics.total_tasks_processed > 0:
                average_compression = self.metrics.total_compression_ratio / self.metrics.total_tasks_processed
            
            # Recent performance (from processing history)
            recent_results = list(self.processing_history)[-10:]  # Last 10 results
            recent_success_rate = 0.0
            if recent_results:
                recent_successes = sum(1 for r in recent_results if r.success)
                recent_success_rate = recent_successes / len(recent_results)
            
            return {
                "core_metrics": asdict(self.metrics),
                "derived_metrics": {
                    "success_rate": round(success_rate, 3),
                    "average_value_per_task": round(average_value_per_task, 3),
                    "average_compression": round(average_compression, 3),
                    "recent_success_rate": round(recent_success_rate, 3)
                },
                "system_state": {
                    "last_consolidation": self.last_consolidation_time.isoformat(),
                    "consolidation_running": self.consolidation_running,
                    "active_tasks": len(self.active_tasks),
                    "processing_history_size": len(self.processing_history)
                },
                "performance_indicators": {
                    "efficiency_healthy": self.metrics.consolidation_efficiency > 0.8,
                    "quality_healthy": self.metrics.average_quality_score > 0.6,
                    "speed_healthy": self.metrics.average_processing_time < 1.0,
                    "value_retention_healthy": average_value_per_task > 0.5
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting consolidation metrics: {str(e)}")
            return {"error": str(e)}

# Test function
async def test_memory_consolidation_engine():
    """Test the memory consolidation engine"""
    print("🔄 Testing Memory Consolidation Engine")
    print("=" * 50)
    
    # Initialize component systems (simplified for testing)
    working_memory = WorkingMemoryProcessor(capacity=5)
    episodic_memory = EpisodicMemorySystem()
    long_term_storage = LongTermStorageManager("./test_consolidation_storage.db")
    
    try:
        # Create consolidation engine
        consolidation_engine = MemoryConsolidationEngine(
            working_memory=working_memory,
            episodic_memory=episodic_memory,
            long_term_storage=long_term_storage
        )
        
        # Test 1: Load working memory with test data
        print("\n💾 Test 1: Loading Working Memory")
        
        test_chunks = [
            {
                "content": "Successfully completed Phase 4 multi-modal intelligence with 92% performance",
                "type": MemoryChunkType.FEEDBACK,
                "priority": WorkingMemoryPriority.HIGH,
                "metadata": {"phase": 4, "success": True}
            },
            {
                "content": "Phase 5 requires advanced memory systems including episodic, working, and long-term storage",
                "type": MemoryChunkType.INSTRUCTION,
                "priority": WorkingMemoryPriority.CRITICAL,
                "metadata": {"phase": 5, "requirements": True}
            },
            {
                "content": "Memory consolidation transfers important information from temporary to permanent storage",
                "type": MemoryChunkType.DATA,
                "priority": WorkingMemoryPriority.MEDIUM,
                "metadata": {"concept": "consolidation"}
            },
            {
                "content": "Current working memory utilization: 80%, consolidation recommended",
                "type": MemoryChunkType.INTERMEDIATE,
                "priority": WorkingMemoryPriority.LOW,
                "metadata": {"system_status": True}
            }
        ]
        
        loaded_chunks = []
        for chunk_data in test_chunks:
            chunk_id = await working_memory.load_chunk(
                content=chunk_data["content"],
                chunk_type=chunk_data["type"],
                priority=chunk_data["priority"],
                metadata=chunk_data["metadata"]
            )
            if chunk_id:
                loaded_chunks.append(chunk_id)
                print(f"   ✅ Loaded {chunk_data['type'].value}: {chunk_id[:16]}...")
        
        print(f"   📊 Working memory loaded: {len(loaded_chunks)} chunks")
        
        # Test 2: Analyze consolidation candidates
        print("\n🔍 Test 2: Analyzing Consolidation Candidates")
        
        candidates = await consolidation_engine.analyze_consolidation_candidates()
        
        print(f"   ✅ Found {len(candidates)} consolidation candidates")
        for candidate in candidates:
            print(f"      - Task {candidate.task_id[:16]}...")
            print(f"        Priority: {candidate.priority:.3f}")
            print(f"        Value: {candidate.estimated_value:.3f}")
            print(f"        Trigger: {candidate.trigger.value}")
        
        # Test 3: Process individual consolidation tasks
        print("\n⚙️ Test 3: Processing Consolidation Tasks")
        
        task_results = []
        for candidate in candidates[:3]:  # Process first 3 candidates
            result = await consolidation_engine.process_consolidation_task(candidate)
            task_results.append(result)
            
            status = "✅" if result.success else "❌"
            print(f"   {status} Task {result.task_id[:16]}...")
            print(f"      Quality: {result.consolidation_quality.value}")
            print(f"      Processing time: {result.processing_time:.3f}s")
            print(f"      Value preserved: {result.value_preserved:.3f}")
            if result.target_storage_id:
                print(f"      Target storage: {result.target_storage_id[:20]}...")
            if result.insights_generated:
                print(f"      Insights: {len(result.insights_generated)}")
        
        # Test 4: Full consolidation cycle
        print("\n🔄 Test 4: Full Consolidation Cycle")
        
        cycle_results = await consolidation_engine.run_consolidation_cycle()
        
        if "error" not in cycle_results:
            print(f"   ✅ Consolidation cycle completed:")
            print(f"      Candidates found: {cycle_results['candidates_found']}")
            print(f"      Tasks processed: {cycle_results['tasks_processed']}")
            print(f"      Successful: {cycle_results['successful_consolidations']}")
            print(f"      Failed: {cycle_results['failed_consolidations']}")
            print(f"      Cycle time: {cycle_results['cycle_time']:.3f}s")
            print(f"      Insights generated: {cycle_results['insights_generated']}")
            print(f"      Value preserved: {cycle_results['total_value_preserved']:.2f}")
        else:
            print(f"   ❌ Consolidation cycle error: {cycle_results['error']}")
        
        # Test 5: Consolidation metrics analysis
        print("\n📊 Test 5: Consolidation Metrics")
        
        metrics = consolidation_engine.get_consolidation_metrics()
        
        if "error" not in metrics:
            core_metrics = metrics['core_metrics']
            derived_metrics = metrics['derived_metrics']
            performance_indicators = metrics['performance_indicators']
            
            print(f"   📈 Performance Overview:")
            print(f"      Total tasks processed: {core_metrics['total_tasks_processed']}")
            print(f"      Success rate: {derived_metrics['success_rate']:.1%}")
            print(f"      Average quality: {core_metrics['average_quality_score']:.3f}")
            print(f"      Average processing time: {core_metrics['average_processing_time']:.3f}s")
            print(f"      Consolidation efficiency: {core_metrics['consolidation_efficiency']:.3f}")
            
            print(f"   🎯 Value Metrics:")
            print(f"      Total value preserved: {core_metrics['total_value_preserved']:.2f}")
            print(f"      Average value per task: {derived_metrics['average_value_per_task']:.3f}")
            print(f"      Average compression: {derived_metrics['average_compression']:.3f}")
            print(f"      Associations discovered: {core_metrics['associations_discovered']}")
            
            print(f"   💡 System Health:")
            health_status = "✅ Healthy" if all(performance_indicators.values()) else "⚠️ Needs attention"
            print(f"      Overall health: {health_status}")
            for indicator, healthy in performance_indicators.items():
                status = "✅" if healthy else "❌"
                print(f"      - {indicator.replace('_', ' ').title()}: {status}")
        
        # Performance summary
        print(f"\n🎯 Performance Summary:")
        if "error" not in metrics:
            success_rate = derived_metrics['success_rate']
            efficiency = core_metrics['consolidation_efficiency']
            print(f"   Success Rate: {success_rate:.1%}")
            print(f"   Consolidation Efficiency: {efficiency:.1%}")
            print(f"   System Performance: {'Excellent' if efficiency > 0.9 else 'Good' if efficiency > 0.7 else 'Needs Improvement'}")
            print(f"   Value Retention: {derived_metrics['average_value_per_task']:.1%}")
        
        return {
            "success_rate": derived_metrics.get('success_rate', 0),
            "consolidation_efficiency": core_metrics.get('consolidation_efficiency', 0),
            "average_quality": core_metrics.get('average_quality_score', 0),
            "tasks_processed": core_metrics.get('total_tasks_processed', 0),
            "system_healthy": all(metrics.get('performance_indicators', {}).values()) if "error" not in metrics else False
        }
        
    finally:
        long_term_storage.close()

if __name__ == "__main__":
    asyncio.run(test_memory_consolidation_engine())