"""
RomAI AGI Evolution Phase 1 - Autonomous Goal System

Autonomous goal setting, tracking, and achievement system.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from enum import Enum

logger = logging.getLogger(__name__)

class GoalStatus(Enum):
    CREATED = "created"
    ACTIVE = "active"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"

class AutonomousGoalSystem:
    """Autonomous goal management system"""
    
    def __init__(self):
        self.goals = {}
        self.goal_counter = 0
        self.active_goals = []
        self.completed_goals = []
        self.initialized = False
        
        logger.info("🎯 Autonomous Goal System initialized")
    
    async def initialize(self) -> bool:
        """Initialize autonomous goal system"""
        try:
            self.initialized = True
            logger.info("✅ Autonomous Goal System initialization completed")
            return True
        except Exception as e:
            logger.error(f"❌ Autonomous Goal System initialization failed: {e}")
            return False
    
    async def create_goal(self, description: str, priority: float = 1.0, 
                         deadline: Optional[datetime] = None) -> str:
        """Create a new goal"""
        self.goal_counter += 1
        goal_id = f"goal_{self.goal_counter}"
        
        goal = {
            'id': goal_id,
            'description': description,
            'priority': priority,
            'deadline': deadline.isoformat() if deadline else None,
            'status': GoalStatus.CREATED.value,
            'created_at': datetime.now().isoformat(),
            'progress': 0.0,
            'sub_goals': [],
            'completion_criteria': {}
        }
        
        self.goals[goal_id] = goal
        self.active_goals.append(goal_id)
        
        logger.info(f"🎯 Created goal: {description} (ID: {goal_id})")
        return goal_id
    
    async def update_goal_progress(self, goal_id: str, progress: float) -> bool:
        """Update goal progress"""
        if goal_id not in self.goals:
            return False
        
        goal = self.goals[goal_id]
        goal['progress'] = min(max(progress, 0.0), 1.0)
        goal['updated_at'] = datetime.now().isoformat()
        
        # Check if goal is completed
        if progress >= 1.0:
            await self.complete_goal(goal_id)
        elif progress > 0:
            goal['status'] = GoalStatus.IN_PROGRESS.value
        
        return True
    
    async def complete_goal(self, goal_id: str) -> bool:
        """Mark goal as completed"""
        if goal_id not in self.goals:
            return False
        
        goal = self.goals[goal_id]
        goal['status'] = GoalStatus.COMPLETED.value
        goal['completed_at'] = datetime.now().isoformat()
        goal['progress'] = 1.0
        
        # Move from active to completed
        if goal_id in self.active_goals:
            self.active_goals.remove(goal_id)
        
        if goal_id not in self.completed_goals:
            self.completed_goals.append(goal_id)
        
        logger.info(f"✅ Completed goal: {goal['description']} (ID: {goal_id})")
        return True
    
    async def get_active_goals(self) -> List[Dict[str, Any]]:
        """Get all active goals"""
        return [self.goals[goal_id] for goal_id in self.active_goals if goal_id in self.goals]
    
    async def prioritize_goals(self) -> List[str]:
        """Prioritize active goals by urgency and importance"""
        active_goals = await self.get_active_goals()
        
        # Sort by priority (higher first) and then by deadline (sooner first)
        def sort_key(goal):
            priority = goal.get('priority', 1.0)
            
            # Calculate urgency based on deadline
            if goal.get('deadline'):
                deadline = datetime.fromisoformat(goal['deadline'])
                time_left = (deadline - datetime.now()).total_seconds()
                urgency = max(0, 1.0 - time_left / (7 * 24 * 3600))  # Urgency increases as deadline approaches
            else:
                urgency = 0.5
            
            return -(priority + urgency)  # Negative for descending sort
        
        sorted_goals = sorted(active_goals, key=sort_key)
        return [goal['id'] for goal in sorted_goals]
    
    async def decompose_goal(self, goal_id: str, sub_goals: List[str]) -> bool:
        """Decompose a goal into sub-goals"""
        if goal_id not in self.goals:
            return False
        
        goal = self.goals[goal_id]
        
        # Create sub-goals
        sub_goal_ids = []
        for sub_goal_desc in sub_goals:
            sub_goal_id = await self.create_goal(
                description=f"{goal['description']} - {sub_goal_desc}",
                priority=goal['priority'] * 0.8,  # Slightly lower priority
                deadline=datetime.fromisoformat(goal['deadline']) if goal.get('deadline') else None
            )
            sub_goal_ids.append(sub_goal_id)
        
        goal['sub_goals'] = sub_goal_ids
        goal['updated_at'] = datetime.now().isoformat()
        
        return True
    
    def get_status(self) -> Dict[str, Any]:
        """Get goal system status"""
        return {
            'status': 'active' if self.initialized else 'inactive',
            'initialized': self.initialized,
            'total_goals': len(self.goals),
            'active_goals': len(self.active_goals),
            'completed_goals': len(self.completed_goals),
            'goal_counter': self.goal_counter
        }

logger.info("✅ Autonomous Goal System module loaded")