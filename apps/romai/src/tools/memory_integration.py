"""
ROMAI Memory Integration System - Tool Memory & Learning Architecture
===================================================================

Advanced memory integration system that connects the tool system with memory
architecture to enable learning from tool usage patterns, adaptive tool selection,
and self-improvement through experience accumulation.

Key Features:
- Tool execution memory with performance tracking
- Adaptive tool selection based on historical success
- Learning from tool usage patterns and contexts
- Memory-driven optimization of tool parameters
- Cross-session knowledge persistence
- Tool performance analytics and insights

Integration Points:
- Tool Manager for execution tracking
- Inference Engine for context-aware selection
- Memory Architecture for persistent storage
- AGI System for decision-making integration

Author: GitHub Copilot AGI Inspector
Date: August 27, 2025
Status: Production Implementation
"""

import asyncio
import logging
import json
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple, Set
from dataclasses import dataclass, field
from collections import defaultdict, deque
import statistics
import pickle
import hashlib
from pathlib import Path

# Import existing tool system components
try:
    from tool_manager import ToolManager, ToolResult
    from real_inference import RealInferenceEngine, GenerationConfig
    TOOL_SYSTEM_AVAILABLE = True
except ImportError:
    try:
        from .tool_manager import ToolManager, ToolResult
        from .real_inference import RealInferenceEngine, GenerationConfig
        TOOL_SYSTEM_AVAILABLE = True
    except ImportError as e:
        TOOL_SYSTEM_AVAILABLE = False
        print(f"Tool system not available: {e}")
        
        # Define minimal ToolResult for standalone operation
        from dataclasses import dataclass
        from typing import Dict, Any
        
        @dataclass
        class ToolResult:
            success: bool
            output: str = ""
            error: str = ""
            execution_time: float = 0.0
            tool_name: str = ""
            resource_usage: Dict[str, Any] = None
            timestamp: str = ""
            metadata: Dict[str, Any] = None
            
            def __post_init__(self):
                if self.resource_usage is None:
                    self.resource_usage = {}
                if self.metadata is None:
                    self.metadata = {}
            
            def to_dict(self) -> Dict[str, Any]:
                return {
                    'success': self.success,
                    'output': self.output,
                    'error': self.error,
                    'execution_time': self.execution_time,
                    'tool_name': self.tool_name,
                    'resource_usage': self.resource_usage,
                    'timestamp': self.timestamp,
                    'metadata': self.metadata
                }

# Configure logging
logger = logging.getLogger(__name__)


@dataclass
class ToolExecution:
    """Represents a single tool execution with context and results."""
    
    # Basic execution info
    tool_name: str
    parameters: Dict[str, Any]
    result: ToolResult
    context: Dict[str, Any] = field(default_factory=dict)
    
    # Performance metrics
    execution_time: float = 0.0
    success: bool = False
    error_message: str = ""
    
    # Context and learning data
    user_intent: str = ""
    task_domain: str = "general"
    reasoning_context: str = ""
    
    # Metadata
    timestamp: datetime = field(default_factory=datetime.now)
    session_id: str = ""
    execution_id: str = field(default_factory=lambda: hashlib.sha256(str(time.time()).encode()).hexdigest()[:12])
    
    # Learning annotations
    user_satisfaction: Optional[float] = None  # 0.0-1.0 rating
    effectiveness_score: Optional[float] = None  # Computed effectiveness
    learning_tags: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            'tool_name': self.tool_name,
            'parameters': self.parameters,
            'result': self.result.to_dict() if self.result else None,
            'context': self.context,
            'execution_time': self.execution_time,
            'success': self.success,
            'error_message': self.error_message,
            'user_intent': self.user_intent,
            'task_domain': self.task_domain,
            'reasoning_context': self.reasoning_context,
            'timestamp': self.timestamp.isoformat(),
            'session_id': self.session_id,
            'execution_id': self.execution_id,
            'user_satisfaction': self.user_satisfaction,
            'effectiveness_score': self.effectiveness_score,
            'learning_tags': self.learning_tags
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ToolExecution':
        """Create from dictionary."""
        data = data.copy()
        if 'timestamp' in data and isinstance(data['timestamp'], str):
            data['timestamp'] = datetime.fromisoformat(data['timestamp'])
        
        # Handle ToolResult reconstruction
        if 'result' in data and data['result']:
            result_data = data['result']
            data['result'] = ToolResult(
                success=result_data.get('success', False),
                output=result_data.get('output', ''),
                error=result_data.get('error', ''),
                execution_time=result_data.get('execution_time', 0.0),
                tool_name=result_data.get('tool_name', ''),
                resource_usage=result_data.get('resource_usage', {}),
                timestamp=result_data.get('timestamp', ''),
                metadata=result_data.get('metadata', {})
            )
        
        return cls(**data)


@dataclass
class ToolPerformanceProfile:
    """Performance profile for a specific tool."""
    
    tool_name: str
    total_executions: int = 0
    successful_executions: int = 0
    failed_executions: int = 0
    
    # Timing statistics
    execution_times: List[float] = field(default_factory=list)
    average_execution_time: float = 0.0
    min_execution_time: float = float('inf')
    max_execution_time: float = 0.0
    
    # Context-specific performance
    domain_performance: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    parameter_effectiveness: Dict[str, float] = field(default_factory=dict)
    
    # User feedback
    satisfaction_scores: List[float] = field(default_factory=list)
    average_satisfaction: float = 0.0
    
    # Learning insights
    common_use_cases: List[str] = field(default_factory=list)
    failure_patterns: List[str] = field(default_factory=list)
    optimization_suggestions: List[str] = field(default_factory=list)
    
    # Temporal patterns
    usage_frequency: Dict[str, int] = field(default_factory=dict)  # hourly usage
    success_trends: List[Tuple[datetime, float]] = field(default_factory=list)
    
    @property
    def success_rate(self) -> float:
        """Calculate success rate."""
        if self.total_executions == 0:
            return 0.0
        return self.successful_executions / self.total_executions
    
    @property
    def reliability_score(self) -> float:
        """Calculate reliability score based on success rate and consistency."""
        if self.total_executions < 5:
            return 0.5  # Neutral for insufficient data
        
        base_score = self.success_rate
        
        # Adjust for consistency (lower variance in execution times is better)
        if len(self.execution_times) > 1:
            variance_penalty = min(0.2, statistics.stdev(self.execution_times) / max(0.1, self.average_execution_time))
            base_score *= (1 - variance_penalty)
        
        return min(1.0, max(0.0, base_score))
    
    def update_with_execution(self, execution: ToolExecution):
        """Update profile with new execution data."""
        self.total_executions += 1
        
        if execution.success:
            self.successful_executions += 1
        else:
            self.failed_executions += 1
        
        # Update timing statistics
        exec_time = execution.execution_time
        self.execution_times.append(exec_time)
        self.min_execution_time = min(self.min_execution_time, exec_time)
        self.max_execution_time = max(self.max_execution_time, exec_time)
        self.average_execution_time = statistics.mean(self.execution_times)
        
        # Keep execution times list manageable
        if len(self.execution_times) > 1000:
            self.execution_times = self.execution_times[-500:]
        
        # Update domain performance
        domain = execution.task_domain
        if domain not in self.domain_performance:
            self.domain_performance[domain] = {
                'executions': 0,
                'successes': 0,
                'avg_time': 0.0,
                'times': []
            }
        
        domain_data = self.domain_performance[domain]
        domain_data['executions'] += 1
        domain_data['times'].append(exec_time)
        domain_data['avg_time'] = statistics.mean(domain_data['times'])
        
        if execution.success:
            domain_data['successes'] += 1
        
        # Update satisfaction
        if execution.user_satisfaction is not None:
            self.satisfaction_scores.append(execution.user_satisfaction)
            self.average_satisfaction = statistics.mean(self.satisfaction_scores)
        
        # Update temporal patterns
        hour_key = execution.timestamp.strftime('%H')
        self.usage_frequency[hour_key] = self.usage_frequency.get(hour_key, 0) + 1
        
        # Update success trends
        self.success_trends.append((execution.timestamp, self.success_rate))
        if len(self.success_trends) > 100:
            self.success_trends = self.success_trends[-50:]


class ToolMemoryManager:
    """
    Advanced memory management for tool executions and learning.
    
    Provides persistent storage, retrieval, and analysis of tool usage patterns
    to enable adaptive behavior and self-improvement capabilities.
    """
    
    def __init__(self, storage_dir: str = "./tool_memory", max_memory_size: int = 10000):
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(exist_ok=True)
        self.max_memory_size = max_memory_size
        
        # In-memory storage for fast access
        self.executions: List[ToolExecution] = []
        self.tool_profiles: Dict[str, ToolPerformanceProfile] = {}
        
        # Session tracking
        self.current_session_id = hashlib.sha256(str(datetime.now()).encode()).hexdigest()[:16]
        self.session_start_time = datetime.now()
        
        # Analytics caches
        self._analytics_cache: Dict[str, Any] = {}
        self._cache_timestamp = time.time()
        self._cache_ttl = 300  # 5 minutes
        
        # Load existing data
        self._load_persistent_data()
        
        logger.info(f"ToolMemoryManager initialized with storage: {self.storage_dir}")
        logger.info(f"Loaded {len(self.executions)} executions and {len(self.tool_profiles)} tool profiles")
    
    async def record_execution(
        self, 
        tool_name: str, 
        parameters: Dict[str, Any],
        result: ToolResult, 
        context: Dict[str, Any] = None,
        user_intent: str = "",
        task_domain: str = "general"
    ) -> ToolExecution:
        """
        Record a tool execution with context for learning.
        
        Args:
            tool_name: Name of the executed tool
            parameters: Parameters used for execution
            result: Result from tool execution
            context: Additional context information
            user_intent: User's intent or goal
            task_domain: Domain/category of the task
            
        Returns:
            ToolExecution record with computed metadata
        """
        try:
            # Create execution record
            execution = ToolExecution(
                tool_name=tool_name,
                parameters=parameters.copy() if parameters else {},
                result=result,
                context=context.copy() if context else {},
                execution_time=result.execution_time,
                success=result.success,
                error_message=result.error,
                user_intent=user_intent,
                task_domain=task_domain,
                session_id=self.current_session_id,
                timestamp=datetime.now()
            )
            
            # Compute effectiveness score
            execution.effectiveness_score = self._compute_effectiveness_score(execution)
            
            # Add to memory
            self.executions.append(execution)
            
            # Update tool performance profile
            if tool_name not in self.tool_profiles:
                self.tool_profiles[tool_name] = ToolPerformanceProfile(tool_name=tool_name)
            
            self.tool_profiles[tool_name].update_with_execution(execution)
            
            # Maintain memory size limits
            if len(self.executions) > self.max_memory_size:
                self._trim_memory()
            
            # Clear analytics cache
            self._analytics_cache.clear()
            
            # Asynchronously save to persistent storage
            asyncio.create_task(self._save_execution_async(execution))
            
            logger.debug(f"Recorded execution: {tool_name} (success: {result.success})")
            return execution
            
        except Exception as e:
            logger.error(f"Failed to record execution: {e}")
            raise
    
    def _compute_effectiveness_score(self, execution: ToolExecution) -> float:
        """Compute effectiveness score for an execution."""
        base_score = 1.0 if execution.success else 0.0
        
        # Adjust based on execution time (faster is better, within reason)
        if execution.execution_time > 0:
            # Penalty for very slow executions
            if execution.execution_time > 30:  # 30 seconds
                base_score *= 0.8
            elif execution.execution_time > 10:  # 10 seconds
                base_score *= 0.9
        
        # Bonus for providing useful output
        if execution.success and execution.result and execution.result.output:
            output_length = len(execution.result.output)
            if output_length > 10:  # Meaningful output
                base_score *= 1.1
        
        # Context-specific adjustments
        if execution.context:
            # Bonus for executions with rich context
            if len(execution.context) > 2:
                base_score *= 1.05
        
        return min(1.0, max(0.0, base_score))
    
    def get_tool_recommendations(
        self, 
        task_description: str, 
        domain: str = "general",
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Get tool recommendations based on task description and historical performance.
        
        Args:
            task_description: Description of the task to perform
            domain: Task domain for context
            limit: Maximum number of recommendations
            
        Returns:
            List of tool recommendations with confidence scores
        """
        try:
            recommendations = []
            task_lower = task_description.lower()
            
            for tool_name, profile in self.tool_profiles.items():
                # Calculate relevance score
                relevance_score = self._calculate_tool_relevance(
                    tool_name, task_lower, domain, profile
                )
                
                if relevance_score > 0.1:  # Minimum threshold
                    recommendations.append({
                        'tool_name': tool_name,
                        'relevance_score': relevance_score,
                        'reliability_score': profile.reliability_score,
                        'success_rate': profile.success_rate,
                        'average_execution_time': profile.average_execution_time,
                        'total_executions': profile.total_executions,
                        'confidence': relevance_score * profile.reliability_score,
                        'domain_performance': profile.domain_performance.get(domain, {}),
                        'recommended_parameters': self._suggest_parameters(tool_name, domain)
                    })
            
            # Sort by confidence score
            recommendations.sort(key=lambda x: x['confidence'], reverse=True)
            
            return recommendations[:limit]
            
        except Exception as e:
            logger.error(f"Failed to generate tool recommendations: {e}")
            return []
    
    def _calculate_tool_relevance(
        self, 
        tool_name: str, 
        task_description: str, 
        domain: str,
        profile: ToolPerformanceProfile
    ) -> float:
        """Calculate how relevant a tool is for a given task."""
        relevance = 0.0
        
        # Keyword matching
        tool_keywords = {
            'terminal': ['command', 'run', 'execute', 'shell', 'bash', 'cmd'],
            'read_file': ['read', 'file', 'content', 'text', 'document'],
            'write_file': ['write', 'create', 'save', 'file', 'text'],
            'list_directory': ['list', 'directory', 'files', 'folder', 'dir'],
            'system_info': ['system', 'info', 'hardware', 'memory', 'cpu'],
            'python_exec': ['calculate', 'compute', 'math', 'python', 'code'],
        }
        
        keywords = tool_keywords.get(tool_name, [])
        keyword_matches = sum(1 for keyword in keywords if keyword in task_description)
        relevance += min(0.5, keyword_matches * 0.1)
        
        # Domain performance bonus
        if domain in profile.domain_performance:
            domain_data = profile.domain_performance[domain]
            domain_success_rate = domain_data['successes'] / max(1, domain_data['executions'])
            relevance += domain_success_rate * 0.3
        
        # Usage frequency bonus (popular tools get slight preference)
        usage_bonus = min(0.2, profile.total_executions / 100)
        relevance += usage_bonus
        
        return min(1.0, relevance)
    
    def _suggest_parameters(self, tool_name: str, domain: str) -> Dict[str, Any]:
        """Suggest optimal parameters for a tool based on historical performance."""
        if tool_name not in self.tool_profiles:
            return {}
        
        profile = self.tool_profiles[tool_name]
        suggestions = {}
        
        # Analyze successful executions for common parameter patterns
        successful_executions = [
            exec for exec in self.executions 
            if exec.tool_name == tool_name and exec.success and exec.task_domain == domain
        ]
        
        if successful_executions:
            # Find most common parameter values
            param_frequency = defaultdict(lambda: defaultdict(int))
            
            for execution in successful_executions:
                for param_name, param_value in execution.parameters.items():
                    if isinstance(param_value, (str, int, bool, float)):
                        param_frequency[param_name][str(param_value)] += 1
            
            # Suggest most frequent values
            for param_name, value_counts in param_frequency.items():
                if value_counts:
                    most_common = max(value_counts.items(), key=lambda x: x[1])
                    suggestions[param_name] = {
                        'suggested_value': most_common[0],
                        'confidence': most_common[1] / len(successful_executions),
                        'usage_count': most_common[1]
                    }
        
        return suggestions
    
    def get_learning_insights(self) -> Dict[str, Any]:
        """Generate learning insights from tool usage patterns."""
        if time.time() - self._cache_timestamp < self._cache_ttl:
            cached_insights = self._analytics_cache.get('learning_insights')
            if cached_insights:
                return cached_insights
        
        insights = {
            'total_executions': len(self.executions),
            'unique_tools': len(self.tool_profiles),
            'session_count': len(set(exec.session_id for exec in self.executions)),
            'overall_success_rate': 0.0,
            'most_used_tools': [],
            'most_reliable_tools': [],
            'domain_analysis': {},
            'temporal_patterns': {},
            'improvement_opportunities': [],
            'learning_trends': {}
        }
        
        if not self.executions:
            return insights
        
        # Overall statistics
        successful_executions = sum(1 for exec in self.executions if exec.success)
        insights['overall_success_rate'] = successful_executions / len(self.executions)
        
        # Most used tools
        tool_usage = defaultdict(int)
        for execution in self.executions:
            tool_usage[execution.tool_name] += 1
        
        insights['most_used_tools'] = sorted(
            tool_usage.items(), key=lambda x: x[1], reverse=True
        )[:5]
        
        # Most reliable tools
        reliable_tools = [
            (name, profile.reliability_score)
            for name, profile in self.tool_profiles.items()
            if profile.total_executions >= 5
        ]
        insights['most_reliable_tools'] = sorted(
            reliable_tools, key=lambda x: x[1], reverse=True
        )[:5]
        
        # Domain analysis
        domain_stats = defaultdict(lambda: {'total': 0, 'successful': 0, 'tools': set()})
        for execution in self.executions:
            domain = execution.task_domain
            domain_stats[domain]['total'] += 1
            domain_stats[domain]['tools'].add(execution.tool_name)
            if execution.success:
                domain_stats[domain]['successful'] += 1
        
        insights['domain_analysis'] = {
            domain: {
                'total_executions': stats['total'],
                'success_rate': stats['successful'] / max(1, stats['total']),
                'unique_tools': len(stats['tools']),
                'tools': list(stats['tools'])
            }
            for domain, stats in domain_stats.items()
        }
        
        # Temporal patterns
        if len(self.executions) > 10:
            recent_executions = sorted(self.executions, key=lambda x: x.timestamp)[-50:]
            recent_success_rate = sum(1 for e in recent_executions if e.success) / len(recent_executions)
            
            insights['temporal_patterns'] = {
                'recent_success_rate': recent_success_rate,
                'trend': 'improving' if recent_success_rate > insights['overall_success_rate'] else 'declining',
                'most_active_hour': max(
                    [(hour, count) for hour, count in 
                     defaultdict(int, 
                        ((exec.timestamp.strftime('%H'), 1) for exec in self.executions)
                     ).items()],
                    key=lambda x: x[1]
                )[0] if self.executions else 'unknown'
            }
        
        # Improvement opportunities
        improvement_opportunities = []
        
        for tool_name, profile in self.tool_profiles.items():
            if profile.success_rate < 0.7 and profile.total_executions >= 5:
                improvement_opportunities.append({
                    'tool': tool_name,
                    'issue': 'low_success_rate',
                    'current_rate': profile.success_rate,
                    'suggestion': 'Analyze failure patterns and optimize parameters'
                })
            
            if profile.average_execution_time > 30 and profile.total_executions >= 3:
                improvement_opportunities.append({
                    'tool': tool_name,
                    'issue': 'slow_execution',
                    'current_time': profile.average_execution_time,
                    'suggestion': 'Optimize tool parameters or implementation for better performance'
                })
        
        insights['improvement_opportunities'] = improvement_opportunities
        
        # Cache insights
        self._analytics_cache['learning_insights'] = insights
        self._cache_timestamp = time.time()
        
        return insights
    
    def get_tool_performance_report(self, tool_name: str) -> Dict[str, Any]:
        """Get detailed performance report for a specific tool."""
        if tool_name not in self.tool_profiles:
            return {'error': f'No performance data for tool: {tool_name}'}
        
        profile = self.tool_profiles[tool_name]
        
        # Get recent executions for this tool
        tool_executions = [
            exec for exec in self.executions[-100:]  # Last 100 executions
            if exec.tool_name == tool_name
        ]
        
        report = {
            'tool_name': tool_name,
            'basic_stats': {
                'total_executions': profile.total_executions,
                'success_rate': profile.success_rate,
                'reliability_score': profile.reliability_score,
                'average_execution_time': profile.average_execution_time,
                'average_satisfaction': profile.average_satisfaction
            },
            'performance_trends': {
                'recent_executions': len(tool_executions),
                'recent_success_rate': sum(1 for e in tool_executions if e.success) / max(1, len(tool_executions)),
                'execution_time_trend': self._analyze_time_trend(tool_executions)
            },
            'domain_performance': profile.domain_performance,
            'usage_patterns': profile.usage_frequency,
            'common_use_cases': profile.common_use_cases,
            'failure_analysis': self._analyze_failures(tool_executions),
            'optimization_suggestions': profile.optimization_suggestions
        }
        
        return report
    
    def _analyze_time_trend(self, executions: List[ToolExecution]) -> str:
        """Analyze execution time trend for a tool."""
        if len(executions) < 5:
            return 'insufficient_data'
        
        times = [exec.execution_time for exec in sorted(executions, key=lambda x: x.timestamp)]
        
        # Simple trend analysis using first and last quartiles
        first_quarter = times[:len(times)//4] or times[:1]
        last_quarter = times[-len(times)//4:] or times[-1:]
        
        avg_early = statistics.mean(first_quarter)
        avg_recent = statistics.mean(last_quarter)
        
        if avg_recent < avg_early * 0.9:
            return 'improving'
        elif avg_recent > avg_early * 1.1:
            return 'degrading'
        else:
            return 'stable'
    
    def _analyze_failures(self, executions: List[ToolExecution]) -> Dict[str, Any]:
        """Analyze failure patterns for a tool."""
        failures = [exec for exec in executions if not exec.success]
        
        if not failures:
            return {'failure_count': 0, 'patterns': []}
        
        # Common error patterns
        error_patterns = defaultdict(int)
        for failure in failures:
            error_msg = failure.error_message.lower()
            if 'permission' in error_msg:
                error_patterns['permission_errors'] += 1
            elif 'timeout' in error_msg:
                error_patterns['timeout_errors'] += 1
            elif 'not found' in error_msg:
                error_patterns['not_found_errors'] += 1
            else:
                error_patterns['other_errors'] += 1
        
        return {
            'failure_count': len(failures),
            'failure_rate': len(failures) / len(executions) if executions else 0,
            'error_patterns': dict(error_patterns),
            'recent_failures': len([f for f in failures if (datetime.now() - f.timestamp).days < 7])
        }
    
    def _trim_memory(self):
        """Trim memory to maintain size limits."""
        if len(self.executions) <= self.max_memory_size:
            return
        
        # Keep most recent executions and high-value ones
        executions_by_value = sorted(
            self.executions,
            key=lambda x: (
                x.timestamp.timestamp(),  # Recent
                x.effectiveness_score or 0,  # Effective
                x.user_satisfaction or 0  # Satisfying
            ),
            reverse=True
        )
        
        # Keep 80% of max size
        keep_count = int(self.max_memory_size * 0.8)
        self.executions = executions_by_value[:keep_count]
        
        logger.info(f"Trimmed memory to {len(self.executions)} executions")
    
    async def _save_execution_async(self, execution: ToolExecution):
        """Asynchronously save execution to persistent storage."""
        try:
            # Save to daily file
            date_str = execution.timestamp.strftime('%Y-%m-%d')
            execution_file = self.storage_dir / f"executions_{date_str}.jsonl"
            
            with open(execution_file, 'a', encoding='utf-8') as f:
                f.write(json.dumps(execution.to_dict()) + '\n')
        
        except Exception as e:
            logger.error(f"Failed to save execution: {e}")
    
    def _load_persistent_data(self):
        """Load persistent data from storage."""
        try:
            # Load executions from last 30 days
            cutoff_date = datetime.now() - timedelta(days=30)
            
            for execution_file in self.storage_dir.glob("executions_*.jsonl"):
                try:
                    with open(execution_file, 'r', encoding='utf-8') as f:
                        for line in f:
                            if line.strip():
                                execution_data = json.loads(line)
                                execution = ToolExecution.from_dict(execution_data)
                                
                                if execution.timestamp >= cutoff_date:
                                    self.executions.append(execution)
                                    
                                    # Update tool profiles
                                    tool_name = execution.tool_name
                                    if tool_name not in self.tool_profiles:
                                        self.tool_profiles[tool_name] = ToolPerformanceProfile(tool_name=tool_name)
                                    
                                    self.tool_profiles[tool_name].update_with_execution(execution)
                
                except Exception as e:
                    logger.warning(f"Failed to load execution file {execution_file}: {e}")
        
        except Exception as e:
            logger.error(f"Failed to load persistent data: {e}")
    
    def save_profiles_snapshot(self):
        """Save current tool profiles snapshot."""
        try:
            snapshot_file = self.storage_dir / f"profiles_snapshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pkl"
            
            with open(snapshot_file, 'wb') as f:
                pickle.dump({
                    'tool_profiles': self.tool_profiles,
                    'timestamp': datetime.now(),
                    'session_id': self.current_session_id
                }, f)
            
            logger.info(f"Saved profiles snapshot: {snapshot_file}")
        
        except Exception as e:
            logger.error(f"Failed to save profiles snapshot: {e}")
    
    def get_memory_stats(self) -> Dict[str, Any]:
        """Get memory system statistics."""
        return {
            'total_executions': len(self.executions),
            'current_session_executions': len([e for e in self.executions if e.session_id == self.current_session_id]),
            'unique_tools': len(self.tool_profiles),
            'memory_usage_mb': len(json.dumps([e.to_dict() for e in self.executions[-100:]])) / 1024,  # Rough estimate
            'session_duration_minutes': (datetime.now() - self.session_start_time).total_seconds() / 60,
            'storage_location': str(self.storage_dir),
            'cache_status': {
                'cached_entries': len(self._analytics_cache),
                'cache_age_seconds': time.time() - self._cache_timestamp
            }
        }


# Example usage and testing
async def main():
    """Test the memory integration system."""
    print("🧠 ROMAI Memory Integration System Test")
    print("=" * 50)
    
    # Initialize memory manager
    memory_manager = ToolMemoryManager(storage_dir="./test_tool_memory")
    
    # Simulate some tool executions
    print("\n1. Simulating tool executions...")
    
    # Create mock ToolResult for testing
    from .tool_manager import ToolResult
    
    # Simulate successful execution
    success_result = ToolResult(
        success=True,
        output="Directory listing completed successfully",
        execution_time=1.2,
        tool_name="list_directory"
    )
    
    await memory_manager.record_execution(
        tool_name="list_directory",
        parameters={"dirpath": ".", "show_hidden": False},
        result=success_result,
        context={"user_request": "show me the files"},
        user_intent="explore directory structure",
        task_domain="filesystem"
    )
    
    # Simulate failed execution
    fail_result = ToolResult(
        success=False,
        output="",
        error="Permission denied",
        execution_time=0.5,
        tool_name="read_file"
    )
    
    await memory_manager.record_execution(
        tool_name="read_file",
        parameters={"filepath": "/restricted/file.txt"},
        result=fail_result,
        context={"user_request": "read this file"},
        user_intent="access file contents",
        task_domain="filesystem"
    )
    
    print("✅ Recorded sample executions")
    
    # Test tool recommendations
    print("\n2. Testing tool recommendations...")
    recommendations = memory_manager.get_tool_recommendations(
        task_description="I need to see what files are in my directory",
        domain="filesystem"
    )
    
    print(f"Found {len(recommendations)} recommendations:")
    for i, rec in enumerate(recommendations, 1):
        print(f"  {i}. {rec['tool_name']} (confidence: {rec['confidence']:.2f})")
    
    # Test learning insights
    print("\n3. Generating learning insights...")
    insights = memory_manager.get_learning_insights()
    
    print(f"Total executions: {insights['total_executions']}")
    print(f"Overall success rate: {insights['overall_success_rate']:.2f}")
    print(f"Unique tools: {insights['unique_tools']}")
    
    if insights['most_used_tools']:
        print("Most used tools:")
        for tool, count in insights['most_used_tools'][:3]:
            print(f"  - {tool}: {count} executions")
    
    # Test performance report
    print("\n4. Tool performance reports...")
    for tool_name in memory_manager.tool_profiles:
        report = memory_manager.get_tool_performance_report(tool_name)
        if 'basic_stats' in report:
            print(f"{tool_name}: {report['basic_stats']['success_rate']:.2f} success rate")
    
    # Show memory stats
    print("\n5. Memory system statistics:")
    stats = memory_manager.get_memory_stats()
    for key, value in stats.items():
        if key != 'cache_status':
            print(f"  {key}: {value}")
    
    # Save snapshot
    print("\n6. Saving profiles snapshot...")
    memory_manager.save_profiles_snapshot()
    
    print("🎯 Memory Integration Test Completed!")


if __name__ == "__main__":
    asyncio.run(main())