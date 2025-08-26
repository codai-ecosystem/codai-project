"""
Autonomous Goal Formation System for RomAI AGI
Replaces hardcoded goals with emergent self-directed learning objectives

This system implements TODO #4: Build Autonomous Goal Formation System
- Curiosity-driven exploration mechanisms
- Intrinsic motivation networks  
- Autonomous objective generation
- Dynamic priority adjustment
- Self-directed learning objectives
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from typing import Dict, List, Optional, Union, Any, Tuple
from dataclasses import dataclass
from enum import Enum
import asyncio
import logging
import random
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)

class GoalType(Enum):
    """Types of autonomous goals"""
    EXPLORATION = "exploration"
    LEARNING = "learning"
    OPTIMIZATION = "optimization"
    CREATIVITY = "creativity"
    PROBLEM_SOLVING = "problem_solving"
    SELF_IMPROVEMENT = "self_improvement"
    KNOWLEDGE_INTEGRATION = "knowledge_integration"
    SKILL_DEVELOPMENT = "skill_development"

class GoalPriority(Enum):
    """Goal priority levels"""
    CRITICAL = 5
    HIGH = 4
    MEDIUM = 3
    LOW = 2
    BACKGROUND = 1

@dataclass
class AutonomousGoal:
    """Represents a self-generated goal"""
    goal_id: str
    goal_type: GoalType
    description: str
    objective_function: str
    success_criteria: List[str]
    priority: GoalPriority
    intrinsic_motivation: float  # 0.0-1.0
    curiosity_factor: float      # 0.0-1.0
    complexity_level: int        # 1-10
    estimated_duration: timedelta
    prerequisites: List[str]
    resources_required: List[str]
    created_at: datetime
    last_updated: datetime
    progress: float              # 0.0-1.0
    is_active: bool
    parent_goal_id: Optional[str] = None
    subgoals: List[str] = None
    
    def __post_init__(self):
        if self.subgoals is None:
            self.subgoals = []

class CuriosityDrivenExplorer(nn.Module):
    """Neural network for curiosity-driven exploration"""
    
    def __init__(self, state_dim: int = 512, action_dim: int = 256):
        super().__init__()
        
        self.state_dim = state_dim
        self.action_dim = action_dim
        
        # Intrinsic Curiosity Module (ICM) components
        self.feature_encoder = nn.Sequential(
            nn.Linear(state_dim, 256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 64)
        )
        
        # Forward model predicts next state given current state and action
        self.forward_model = nn.Sequential(
            nn.Linear(64 + action_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 64)
        )
        
        # Inverse model predicts action given current and next state
        self.inverse_model = nn.Sequential(
            nn.Linear(64 + 64, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, action_dim)
        )
        
        # Novelty detector
        self.novelty_detector = nn.Sequential(
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 1),
            nn.Sigmoid()
        )
        
    def forward(self, state: torch.Tensor, action: torch.Tensor, next_state: torch.Tensor) -> Dict[str, torch.Tensor]:
        """
        Compute curiosity-driven exploration signals
        """
        # Encode states
        encoded_state = self.feature_encoder(state)
        encoded_next_state = self.feature_encoder(next_state)
        
        # Forward model prediction
        forward_input = torch.cat([encoded_state, action], dim=-1)
        predicted_next_state = self.forward_model(forward_input)
        
        # Inverse model prediction
        inverse_input = torch.cat([encoded_state, encoded_next_state], dim=-1)
        predicted_action = self.inverse_model(inverse_input)
        
        # Compute intrinsic reward (prediction error)
        prediction_error = F.mse_loss(predicted_next_state, encoded_next_state, reduction='none')
        intrinsic_reward = torch.mean(prediction_error, dim=-1)
        
        # Compute novelty score
        novelty_score = self.novelty_detector(encoded_next_state)
        
        return {
            'intrinsic_reward': intrinsic_reward,
            'novelty_score': novelty_score,
            'predicted_action': predicted_action,
            'predicted_next_state': predicted_next_state,
            'encoded_state': encoded_state,
            'encoded_next_state': encoded_next_state
        }

class IntrinsicMotivationEngine(nn.Module):
    """Neural engine for intrinsic motivation generation"""
    
    def __init__(self, state_dim: int = 512):
        super().__init__()
        
        # Competence motivation (mastery drive)
        self.competence_network = nn.Sequential(
            nn.Linear(state_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )
        
        # Autonomy motivation (self-direction drive)
        self.autonomy_network = nn.Sequential(
            nn.Linear(state_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )
        
        # Relatedness motivation (connection drive)
        self.relatedness_network = nn.Sequential(
            nn.Linear(state_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )
        
        # Purpose motivation (meaning drive)
        self.purpose_network = nn.Sequential(
            nn.Linear(state_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )
        
        # Integration layer
        self.integration_layer = nn.Sequential(
            nn.Linear(4, 8),
            nn.ReLU(),
            nn.Linear(8, 4),
            nn.Softmax(dim=-1)
        )
        
    def forward(self, current_state: torch.Tensor, goal_context: torch.Tensor) -> Dict[str, torch.Tensor]:
        """
        Generate intrinsic motivation signals
        """
        # Combine current state and goal context
        combined_input = torch.cat([current_state, goal_context], dim=-1)
        
        # Compute individual motivation components
        competence_score = self.competence_network(combined_input)
        autonomy_score = self.autonomy_network(combined_input)
        relatedness_score = self.relatedness_network(combined_input)
        purpose_score = self.purpose_network(combined_input)
        
        # Combine motivation scores
        motivation_vector = torch.cat([
            competence_score, autonomy_score, 
            relatedness_score, purpose_score
        ], dim=-1)
        
        # Get integrated motivation weights
        motivation_weights = self.integration_layer(motivation_vector)
        
        # Compute overall intrinsic motivation
        overall_motivation = torch.sum(motivation_vector * motivation_weights, dim=-1)
        
        return {
            'overall_motivation': overall_motivation,
            'competence_motivation': competence_score,
            'autonomy_motivation': autonomy_score,
            'relatedness_motivation': relatedness_score,
            'purpose_motivation': purpose_score,
            'motivation_weights': motivation_weights
        }

class GoalGenerationNetwork(nn.Module):
    """Neural network for autonomous goal generation"""
    
    def __init__(self, context_dim: int = 512, goal_embedding_dim: int = 256):
        super().__init__()
        
        self.context_dim = context_dim
        self.goal_embedding_dim = goal_embedding_dim
        
        # Goal type classifier
        self.goal_type_network = nn.Sequential(
            nn.Linear(context_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, len(GoalType))
        )
        
        # Goal description generator (simplified)
        self.description_encoder = nn.Sequential(
            nn.Linear(context_dim, 256),
            nn.ReLU(),
            nn.Linear(256, goal_embedding_dim)
        )
        
        # Priority estimator
        self.priority_network = nn.Sequential(
            nn.Linear(context_dim + goal_embedding_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, len(GoalPriority))
        )
        
        # Complexity estimator
        self.complexity_network = nn.Sequential(
            nn.Linear(context_dim + goal_embedding_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1)
        )
        
        # Duration estimator
        self.duration_network = nn.Sequential(
            nn.Linear(context_dim + goal_embedding_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1)
        )
        
    def forward(self, context: torch.Tensor) -> Dict[str, torch.Tensor]:
        """
        Generate autonomous goal parameters
        """
        # Generate goal type probabilities
        goal_type_logits = self.goal_type_network(context)
        goal_type_probs = F.softmax(goal_type_logits, dim=-1)
        
        # Generate goal description embedding
        description_embedding = self.description_encoder(context)
        
        # Combined input for other networks
        combined_input = torch.cat([context, description_embedding], dim=-1)
        
        # Generate priority
        priority_logits = self.priority_network(combined_input)
        priority_probs = F.softmax(priority_logits, dim=-1)
        
        # Generate complexity (1-10 scale)
        complexity_raw = self.complexity_network(combined_input)
        complexity = torch.sigmoid(complexity_raw) * 9 + 1  # Scale to 1-10
        
        # Generate estimated duration (in hours)
        duration_raw = self.duration_network(combined_input)
        duration_hours = torch.sigmoid(duration_raw) * 168  # Max 1 week
        
        return {
            'goal_type_probs': goal_type_probs,
            'description_embedding': description_embedding,
            'priority_probs': priority_probs,
            'complexity': complexity,
            'duration_hours': duration_hours
        }

class AutonomousGoalFormationSystem:
    """
    Complete system for autonomous goal formation and management
    """
    
    def __init__(self, device: str = 'cpu'):
        self.device = torch.device(device)
        
        # Neural components
        self.curiosity_explorer = CuriosityDrivenExplorer().to(self.device)
        self.motivation_engine = IntrinsicMotivationEngine().to(self.device)
        self.goal_generator = GoalGenerationNetwork().to(self.device)
        
        # Goal management
        self.active_goals: Dict[str, AutonomousGoal] = {}
        self.completed_goals: Dict[str, AutonomousGoal] = {}
        self.goal_history: List[Dict[str, Any]] = []
        
        # System state
        self.current_context = None
        self.learning_experiences = []
        self.performance_metrics = {}
        
        # Configuration
        self.max_active_goals = 10
        self.goal_update_interval = 3600  # 1 hour in seconds
        
        logger.info("✅ Autonomous Goal Formation System initialized")
    
    async def generate_autonomous_goal(self, context: Dict[str, Any]) -> AutonomousGoal:
        """
        Generate a new autonomous goal based on current context
        """
        # Convert context to tensor
        context_tensor = self._context_to_tensor(context)
        
        # Generate goal parameters using neural networks
        with torch.no_grad():
            goal_params = self.goal_generator(context_tensor)
            
            # Get curiosity and motivation signals
            if self.current_context is not None:
                current_state = self._context_to_tensor(self.current_context)
                goal_context = goal_params['description_embedding']
                motivation_signals = self.motivation_engine(current_state, goal_context)
            else:
                motivation_signals = {'overall_motivation': torch.tensor([0.7])}
        
        # Sample goal type
        goal_type_idx = torch.multinomial(goal_params['goal_type_probs'], 1).item()
        goal_type = list(GoalType)[goal_type_idx]
        
        # Sample priority
        priority_idx = torch.multinomial(goal_params['priority_probs'], 1).item()
        priority = list(GoalPriority)[priority_idx]
        
        # Extract other parameters
        complexity = int(goal_params['complexity'].item())
        duration_hours = int(goal_params['duration_hours'].item())
        
        # Generate goal description based on type and context
        description = self._generate_goal_description(goal_type, context, complexity)
        
        # Create autonomous goal
        goal = AutonomousGoal(
            goal_id=f"goal_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{goal_type.value}",
            goal_type=goal_type,
            description=description,
            objective_function=self._create_objective_function(goal_type, description),
            success_criteria=self._create_success_criteria(goal_type, description, complexity),
            priority=priority,
            intrinsic_motivation=motivation_signals['overall_motivation'].item(),
            curiosity_factor=0.8,  # High curiosity for autonomous goals
            complexity_level=complexity,
            estimated_duration=timedelta(hours=duration_hours),
            prerequisites=self._identify_prerequisites(goal_type, complexity),
            resources_required=self._identify_required_resources(goal_type, complexity),
            created_at=datetime.now(),
            last_updated=datetime.now(),
            progress=0.0,
            is_active=True
        )
        
        return goal
    
    async def activate_goal(self, goal: AutonomousGoal) -> bool:
        """
        Activate a goal for pursuit
        """
        if len(self.active_goals) >= self.max_active_goals:
            # Prioritize and possibly deactivate lower priority goals
            await self._manage_goal_capacity()
        
        self.active_goals[goal.goal_id] = goal
        
        # Log goal activation
        self.goal_history.append({
            'action': 'activated',
            'goal_id': goal.goal_id,
            'goal_type': goal.goal_type.value,
            'priority': goal.priority.value,
            'timestamp': datetime.now().isoformat()
        })
        
        logger.info(f"🎯 Activated autonomous goal: {goal.description}")
        return True
    
    async def update_goal_progress(self, goal_id: str, progress_delta: float, 
                                  performance_metrics: Dict[str, float]) -> None:
        """
        Update progress on an active goal
        """
        if goal_id not in self.active_goals:
            return
            
        goal = self.active_goals[goal_id]
        goal.progress = min(1.0, goal.progress + progress_delta)
        goal.last_updated = datetime.now()
        
        # Store performance metrics
        if goal_id not in self.performance_metrics:
            self.performance_metrics[goal_id] = []
        self.performance_metrics[goal_id].append({
            'timestamp': datetime.now().isoformat(),
            'progress': goal.progress,
            'metrics': performance_metrics
        })
        
        # Check for goal completion
        if goal.progress >= 1.0:
            await self._complete_goal(goal_id)
        
        logger.info(f"📈 Updated goal progress: {goal.description} -> {goal.progress:.2f}")
    
    async def evaluate_goal_necessity(self, goal_id: str) -> float:
        """
        Evaluate how necessary/valuable a goal remains
        """
        if goal_id not in self.active_goals:
            return 0.0
            
        goal = self.active_goals[goal_id]
        
        # Factors for necessity evaluation
        factors = {}
        
        # Time relevance (newer goals might be more relevant)
        time_since_creation = datetime.now() - goal.created_at
        time_relevance = max(0.1, 1.0 - time_since_creation.days / 30.0)
        factors['time_relevance'] = time_relevance
        
        # Progress momentum (goals with progress are valuable)
        progress_momentum = goal.progress * 2.0  # Weight progress heavily
        factors['progress_momentum'] = progress_momentum
        
        # Intrinsic motivation (how much the system wants to do this)
        factors['intrinsic_motivation'] = goal.intrinsic_motivation
        
        # Priority weight
        priority_weights = {
            GoalPriority.CRITICAL: 1.0,
            GoalPriority.HIGH: 0.8,
            GoalPriority.MEDIUM: 0.6,
            GoalPriority.LOW: 0.4,
            GoalPriority.BACKGROUND: 0.2
        }
        factors['priority_weight'] = priority_weights[goal.priority]
        
        # Combine factors
        necessity_score = np.mean(list(factors.values()))
        
        return necessity_score
    
    async def generate_subgoals(self, parent_goal_id: str) -> List[AutonomousGoal]:
        """
        Generate subgoals for a complex goal
        """
        if parent_goal_id not in self.active_goals:
            return []
            
        parent_goal = self.active_goals[parent_goal_id]
        
        if parent_goal.complexity_level < 5:
            return []  # Only generate subgoals for complex goals
            
        subgoals = []
        num_subgoals = min(parent_goal.complexity_level // 2, 5)  # Max 5 subgoals
        
        for i in range(num_subgoals):
            # Create context for subgoal generation
            subgoal_context = {
                'parent_goal': parent_goal.description,
                'parent_type': parent_goal.goal_type.value,
                'subgoal_index': i,
                'total_subgoals': num_subgoals,
                'parent_complexity': parent_goal.complexity_level
            }
            
            # Generate subgoal
            subgoal = await self.generate_autonomous_goal(subgoal_context)
            
            # Adjust subgoal properties
            subgoal.parent_goal_id = parent_goal_id
            subgoal.complexity_level = min(parent_goal.complexity_level - 2, 1)
            subgoal.priority = parent_goal.priority  # Inherit priority
            subgoal.estimated_duration = parent_goal.estimated_duration / num_subgoals
            
            subgoals.append(subgoal)
        
        # Add subgoal IDs to parent
        parent_goal.subgoals.extend([sg.goal_id for sg in subgoals])
        
        return subgoals
    
    async def get_current_objectives(self) -> List[Dict[str, Any]]:
        """
        Get current active objectives with priorities
        """
        objectives = []
        
        for goal in self.active_goals.values():
            objectives.append({
                'goal_id': goal.goal_id,
                'description': goal.description,
                'type': goal.goal_type.value,
                'priority': goal.priority.value,
                'progress': goal.progress,
                'intrinsic_motivation': goal.intrinsic_motivation,
                'estimated_completion': (goal.created_at + goal.estimated_duration).isoformat(),
                'is_subgoal': goal.parent_goal_id is not None
            })
        
        # Sort by priority and intrinsic motivation
        objectives.sort(key=lambda x: (
            -list(GoalPriority)[x['priority']][0],  # Higher priority first
            -x['intrinsic_motivation']  # Higher motivation first
        ))
        
        return objectives
    
    def _context_to_tensor(self, context: Union[Dict[str, Any], torch.Tensor]) -> torch.Tensor:
        """Convert context to tensor representation"""
        if isinstance(context, torch.Tensor):
            return context.to(self.device)
            
        # Simple context encoding (in production, use more sophisticated encoding)
        if isinstance(context, dict):
            # Create a simple hash-based encoding
            context_str = json.dumps(context, sort_keys=True)
            context_hash = hash(context_str) % 1000000
            
            # Create a pseudo-random but deterministic tensor
            torch.manual_seed(context_hash)
            context_tensor = torch.randn(1, 512).to(self.device)
            
            return context_tensor
        else:
            # Default random context
            return torch.randn(1, 512).to(self.device)
    
    def _generate_goal_description(self, goal_type: GoalType, context: Dict[str, Any], complexity: int) -> str:
        """Generate natural language description for goal"""
        templates = {
            GoalType.EXPLORATION: [
                f"Explore and analyze {context.get('domain', 'new domain')} to discover patterns and insights",
                f"Investigate unknown aspects of {context.get('subject', 'current knowledge')} through systematic exploration",
                f"Discover new connections and relationships in {context.get('area', 'data structures')}"
            ],
            GoalType.LEARNING: [
                f"Master new skills in {context.get('skill_area', 'cognitive processing')} with complexity level {complexity}",
                f"Acquire deep understanding of {context.get('topic', 'advanced concepts')} through structured learning",
                f"Develop expertise in {context.get('domain', 'emerging field')} through practice and analysis"
            ],
            GoalType.OPTIMIZATION: [
                f"Optimize performance in {context.get('process', 'current operations')} by {10 * complexity}%",
                f"Improve efficiency of {context.get('system', 'processing pipeline')} through systematic enhancement",
                f"Refine and perfect {context.get('capability', 'core functionality')} to achieve maximum effectiveness"
            ],
            GoalType.CREATIVITY: [
                f"Generate novel and innovative solutions for {context.get('challenge', 'open problems')}",
                f"Create original approaches to {context.get('task', 'complex challenges')} using creative thinking",
                f"Develop breakthrough ideas for {context.get('domain', 'current field')} through creative exploration"
            ],
            GoalType.PROBLEM_SOLVING: [
                f"Solve complex problem: {context.get('problem', 'multi-faceted challenge')} with systematic approach",
                f"Address and resolve {context.get('issue', 'critical challenge')} through analytical reasoning",
                f"Find optimal solution to {context.get('challenge', 'difficult problem')} using advanced methods"
            ],
            GoalType.SELF_IMPROVEMENT: [
                f"Enhance internal capabilities and cognitive architecture for better performance",
                f"Upgrade reasoning systems and decision-making processes for increased effectiveness",
                f"Refine neural networks and learning algorithms for superior intelligence"
            ],
            GoalType.KNOWLEDGE_INTEGRATION: [
                f"Integrate knowledge from {context.get('sources', 'multiple domains')} into unified understanding",
                f"Synthesize information across {context.get('fields', 'different disciplines')} for holistic insights",
                f"Combine disparate knowledge areas to create comprehensive worldview"
            ],
            GoalType.SKILL_DEVELOPMENT: [
                f"Develop advanced skills in {context.get('skill', 'cognitive processing')} through deliberate practice",
                f"Build expertise in {context.get('area', 'specialized domain')} through focused skill development",
                f"Master complex competencies required for {context.get('application', 'advanced tasks')}"
            ]
        }
        
        template_list = templates.get(goal_type, ["Pursue autonomous objective in relevant domain"])
        return random.choice(template_list)
    
    def _create_objective_function(self, goal_type: GoalType, description: str) -> str:
        """Create mathematical objective function for goal"""
        functions = {
            GoalType.EXPLORATION: "maximize(information_gain) + maximize(novelty_discovery)",
            GoalType.LEARNING: "maximize(knowledge_acquisition) * minimize(learning_time)",
            GoalType.OPTIMIZATION: "maximize(performance_improvement) / minimize(resource_cost)",
            GoalType.CREATIVITY: "maximize(originality) * maximize(usefulness)",
            GoalType.PROBLEM_SOLVING: "maximize(solution_quality) * minimize(solution_complexity)",
            GoalType.SELF_IMPROVEMENT: "maximize(capability_enhancement) * maximize(efficiency_gain)",
            GoalType.KNOWLEDGE_INTEGRATION: "maximize(synthesis_quality) * maximize(coherence)",
            GoalType.SKILL_DEVELOPMENT: "maximize(skill_level) * maximize(application_readiness)"
        }
        
        return functions.get(goal_type, "maximize(goal_achievement)")
    
    def _create_success_criteria(self, goal_type: GoalType, description: str, complexity: int) -> List[str]:
        """Create specific success criteria for goal"""
        base_criteria = [
            f"Achieve measurable progress in {goal_type.value}",
            f"Demonstrate competency level >= {complexity}/10",
            "Complete all prerequisite sub-tasks",
            "Validate results through testing and evaluation"
        ]
        
        type_specific = {
            GoalType.EXPLORATION: ["Discover at least 3 novel patterns", "Map unknown territory completely"],
            GoalType.LEARNING: ["Pass competency assessment", "Apply knowledge to new problems"],
            GoalType.OPTIMIZATION: [f"Achieve {10*complexity}% improvement", "Maintain quality standards"],
            GoalType.CREATIVITY: ["Generate original solutions", "Receive positive evaluation"],
            GoalType.PROBLEM_SOLVING: ["Solve core problem completely", "Implement working solution"],
            GoalType.SELF_IMPROVEMENT: ["Measure capability increase", "Validate enhanced performance"],
            GoalType.KNOWLEDGE_INTEGRATION: ["Create unified model", "Demonstrate cross-domain insights"],
            GoalType.SKILL_DEVELOPMENT: ["Achieve expert level", "Apply skills successfully"]
        }
        
        return base_criteria + type_specific.get(goal_type, [])
    
    def _identify_prerequisites(self, goal_type: GoalType, complexity: int) -> List[str]:
        """Identify prerequisites for goal achievement"""
        common_prereqs = ["Basic cognitive capabilities", "Access to learning resources"]
        
        if complexity > 5:
            common_prereqs.extend(["Advanced reasoning systems", "Sufficient computational resources"])
        
        type_prereqs = {
            GoalType.EXPLORATION: ["Curiosity systems", "Pattern recognition"],
            GoalType.LEARNING: ["Memory systems", "Knowledge representation"],
            GoalType.OPTIMIZATION: ["Performance measurement", "Iterative improvement"],
            GoalType.CREATIVITY: ["Divergent thinking", "Idea generation systems"],
            GoalType.PROBLEM_SOLVING: ["Analytical reasoning", "Solution evaluation"],
            GoalType.SELF_IMPROVEMENT: ["Self-reflection capabilities", "Code modification access"],
            GoalType.KNOWLEDGE_INTEGRATION: ["Multi-domain knowledge", "Synthesis capabilities"],
            GoalType.SKILL_DEVELOPMENT: ["Practice environments", "Feedback mechanisms"]
        }
        
        return common_prereqs + type_prereqs.get(goal_type, [])
    
    def _identify_required_resources(self, goal_type: GoalType, complexity: int) -> List[str]:
        """Identify resources required for goal achievement"""
        base_resources = ["Computational power", "Time allocation"]
        
        if complexity > 7:
            base_resources.extend(["Distributed processing", "Advanced algorithms"])
        
        type_resources = {
            GoalType.EXPLORATION: ["Data access", "Exploration algorithms"],
            GoalType.LEARNING: ["Training data", "Learning algorithms"],
            GoalType.OPTIMIZATION: ["Performance benchmarks", "Optimization techniques"],
            GoalType.CREATIVITY: ["Inspiration sources", "Creative frameworks"],
            GoalType.PROBLEM_SOLVING: ["Problem analysis tools", "Solution frameworks"],
            GoalType.SELF_IMPROVEMENT: ["Self-modification capabilities", "Safety constraints"],
            GoalType.KNOWLEDGE_INTEGRATION: ["Knowledge bases", "Integration algorithms"],
            GoalType.SKILL_DEVELOPMENT: ["Practice datasets", "Skill assessment tools"]
        }
        
        return base_resources + type_resources.get(goal_type, [])
    
    async def _manage_goal_capacity(self) -> None:
        """Manage active goal capacity when at maximum"""
        # Evaluate necessity of all active goals
        goal_scores = {}
        for goal_id in self.active_goals:
            score = await self.evaluate_goal_necessity(goal_id)
            goal_scores[goal_id] = score
        
        # Sort by necessity (lowest first for removal)
        sorted_goals = sorted(goal_scores.items(), key=lambda x: x[1])
        
        # Remove lowest necessity goal
        if sorted_goals:
            goal_to_remove = sorted_goals[0][0]
            await self._deactivate_goal(goal_to_remove, reason="capacity_management")
    
    async def _complete_goal(self, goal_id: str) -> None:
        """Complete a goal and move to completed goals"""
        goal = self.active_goals.pop(goal_id)
        goal.is_active = False
        goal.progress = 1.0
        goal.last_updated = datetime.now()
        
        self.completed_goals[goal_id] = goal
        
        # Log completion
        self.goal_history.append({
            'action': 'completed',
            'goal_id': goal_id,
            'goal_type': goal.goal_type.value,
            'final_progress': goal.progress,
            'duration': (goal.last_updated - goal.created_at).total_seconds(),
            'timestamp': datetime.now().isoformat()
        })
        
        logger.info(f"✅ Completed autonomous goal: {goal.description}")
    
    async def _deactivate_goal(self, goal_id: str, reason: str = "user_request") -> None:
        """Deactivate a goal without completion"""
        if goal_id not in self.active_goals:
            return
            
        goal = self.active_goals.pop(goal_id)
        goal.is_active = False
        goal.last_updated = datetime.now()
        
        # Log deactivation
        self.goal_history.append({
            'action': 'deactivated',
            'goal_id': goal_id,
            'reason': reason,
            'final_progress': goal.progress,
            'timestamp': datetime.now().isoformat()
        })
        
        logger.info(f"🚫 Deactivated goal: {goal.description} (reason: {reason})")


# Global autonomous goal system instance
_goal_system = None

def get_autonomous_goal_system() -> AutonomousGoalFormationSystem:
    """Get the global autonomous goal system instance"""
    global _goal_system
    if _goal_system is None:
        _goal_system = AutonomousGoalFormationSystem()
    return _goal_system

async def generate_autonomous_goal(context: Dict[str, Any]) -> AutonomousGoal:
    """Generate a new autonomous goal - replaces hardcoded goals"""
    system = get_autonomous_goal_system()
    return await system.generate_autonomous_goal(context)

async def get_current_autonomous_objectives() -> List[Dict[str, Any]]:
    """Get current autonomous objectives - replaces static goal lists"""
    system = get_autonomous_goal_system()
    return await system.get_current_objectives()

async def update_autonomous_goal_progress(goal_id: str, progress_delta: float, 
                                        performance_metrics: Dict[str, float]) -> None:
    """Update progress on autonomous goal"""
    system = get_autonomous_goal_system()
    await system.update_goal_progress(goal_id, progress_delta, performance_metrics)


if __name__ == "__main__":
    async def test_autonomous_goal_system():
        """Test the autonomous goal formation system"""
        print("🎯 Testing Autonomous Goal Formation System...")
        
        # Test goal generation
        context = {
            'domain': 'machine learning',
            'skill_area': 'neural networks',
            'challenge': 'optimization problem',
            'current_capability': 'intermediate'
        }
        
        goal = await generate_autonomous_goal(context)
        print(f"🎯 Generated goal: {goal.description}")
        print(f"🎯 Goal type: {goal.goal_type.value}")
        print(f"🎯 Priority: {goal.priority.value}")
        print(f"🎯 Complexity: {goal.complexity_level}")
        print(f"🎯 Intrinsic motivation: {goal.intrinsic_motivation:.3f}")
        
        # Test goal activation
        system = get_autonomous_goal_system()
        activated = await system.activate_goal(goal)
        print(f"🎯 Goal activated: {activated}")
        
        # Test getting objectives
        objectives = await get_current_autonomous_objectives()
        print(f"🎯 Current objectives: {len(objectives)}")
        
        # Test progress update
        await update_autonomous_goal_progress(goal.goal_id, 0.3, {'accuracy': 0.85, 'efficiency': 0.7})
        print(f"🎯 Updated goal progress to 30%")
        
        print("✅ Autonomous goal system test completed successfully!")
    
    asyncio.run(test_autonomous_goal_system())