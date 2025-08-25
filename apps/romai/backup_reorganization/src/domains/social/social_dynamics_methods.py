"""
Social Dynamics Methods for RomAI Social Intelligence Engine

This module contains the core social dynamics analysis methods separated for modular architecture.
"""

from typing import Dict, List, Optional, Union, Any, Tuple
from dataclasses import dataclass
from enum import Enum
from datetime import datetime, timedelta
import asyncio
import json
import logging
import numpy as np
from pathlib import Path


class SocialDynamicsMethods:
    """Core social dynamics analysis methods for the Social Intelligence Engine."""
    
    async def _extract_social_context(self, query: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Extract social context and parameters from the query and context."""
        try:
            social_context = {
                "query": query,
                "scenario_type": context.get("scenario_type") if context else None,
                "participants": context.get("participants", []) if context else [],
                "environment": context.get("environment", {}) if context else {},
                "cultural_context": context.get("cultural_context", "romanian") if context else "romanian",
                "urgency_level": context.get("urgency_level", "normal") if context else "normal",
                "complexity": context.get("complexity", "moderate") if context else "moderate"
            }
            
            # Extract social entities and relationships from query
            social_entities = await self._identify_social_entities(query)
            social_context["social_entities"] = social_entities
            
            # Extract participants if not provided
            if not social_context["participants"]:
                participants = await self._extract_participants_from_query(query)
                social_context["participants"] = participants
            
            # Identify social dynamics indicators
            dynamics_indicators = await self._identify_dynamics_indicators(query, social_context)
            social_context["dynamics_indicators"] = dynamics_indicators
            
            # Assess Romanian social relevance
            romanian_relevance = await self._assess_romanian_social_relevance(
                query, social_context
            )
            social_context["romanian_relevance"] = romanian_relevance
            
            return social_context
            
        except Exception as e:
            self.logger.error(f"Error extracting social context: {str(e)}")
            raise
    
    def _identify_social_domain(self, social_context: Dict[str, Any]) -> 'SocialDomain':
        """Identify the primary social domain for the analysis."""
        from .social_intelligence_engine import SocialDomain
        
        query = social_context.get("query", "").lower()
        domain_keywords = {
            SocialDomain.INTERPERSONAL_RELATIONSHIPS: ["relationship", "personal", "friendship", "marriage", "family"],
            SocialDomain.GROUP_DYNAMICS: ["group", "team", "collective", "dynamics", "interaction"],
            SocialDomain.ORGANIZATIONAL_BEHAVIOR: ["organization", "company", "workplace", "corporate", "management"],
            SocialDomain.CROSS_CULTURAL_COMMUNICATION: ["cultural", "cross-cultural", "international", "multicultural"],
            SocialDomain.SOCIAL_NETWORKS: ["network", "social media", "connections", "influence", "community"],
            SocialDomain.CONFLICT_RESOLUTION: ["conflict", "dispute", "disagreement", "resolution", "mediation"],
            SocialDomain.LEADERSHIP_DYNAMICS: ["leadership", "leader", "authority", "influence", "power"],
            SocialDomain.TEAM_COLLABORATION: ["collaboration", "teamwork", "cooperation", "partnership", "joint"],
            SocialDomain.SOCIAL_INFLUENCE: ["influence", "persuasion", "motivation", "social pressure", "conformity"],
            SocialDomain.CULTURAL_ADAPTATION: ["adaptation", "cultural fit", "integration", "adjustment", "assimilation"],
            SocialDomain.EMOTIONAL_INTELLIGENCE: ["emotion", "empathy", "emotional", "feeling", "mood"],
            SocialDomain.SOCIAL_CHANGE: ["change", "transformation", "evolution", "development", "progress"]
        }
        
        # Score each domain based on keyword matches
        domain_scores = {}
        for domain, keywords in domain_keywords.items():
            score = sum(1 for keyword in keywords if keyword in query)
            if score > 0:
                domain_scores[domain] = score
        
        # Return domain with highest score, default to INTERPERSONAL_RELATIONSHIPS
        if domain_scores:
            return max(domain_scores, key=domain_scores.get)
        else:
            return SocialDomain.INTERPERSONAL_RELATIONSHIPS
    
    def _assess_social_complexity(self, social_context: Dict[str, Any]) -> 'SocialComplexity':
        """Assess the complexity level of the social scenario."""
        from .social_intelligence_engine import SocialComplexity
        
        # Factors that increase complexity
        complexity_factors = {
            "participant_count": len(social_context.get("participants", [])),
            "cultural_diversity": len(set(p.get("culture", "romanian") for p in social_context.get("participants", []))),
            "conflict_indicators": len(social_context.get("dynamics_indicators", {}).get("conflicts", [])),
            "hierarchy_levels": len(set(p.get("hierarchy_level", 0) for p in social_context.get("participants", []))),
            "urgency_level": {"low": 1, "normal": 2, "high": 3, "critical": 4}.get(
                social_context.get("urgency_level", "normal"), 2
            )
        }
        
        # Calculate complexity score
        complexity_score = (
            min(complexity_factors["participant_count"] / 3, 3) +
            min(complexity_factors["cultural_diversity"] / 2, 3) +
            min(complexity_factors["conflict_indicators"] / 2, 3) +
            min(complexity_factors["hierarchy_levels"] / 2, 3) +
            complexity_factors["urgency_level"]
        ) / 5
        
        # Map score to complexity level
        if complexity_score >= 4:
            return SocialComplexity.CRISIS
        elif complexity_score >= 3:
            return SocialComplexity.HIGHLY_COMPLEX
        elif complexity_score >= 2:
            return SocialComplexity.COMPLEX
        elif complexity_score >= 1:
            return SocialComplexity.MODERATE
        else:
            return SocialComplexity.SIMPLE
    
    async def _conduct_social_analysis(
        self, 
        social_context: Dict[str, Any], 
        domain: 'SocialDomain',
        complexity: 'SocialComplexity'
    ) -> Dict[str, Any]:
        """Conduct comprehensive social analysis."""
        try:
            analysis = {
                "context_summary": social_context,
                "domain": domain.value,
                "complexity": complexity.value,
                "participant_profiles": {},
                "interaction_patterns": {},
                "power_dynamics": {},
                "communication_flows": {},
                "emotional_dynamics": {},
                "cultural_factors": {},
                "romanian_context": {}
            }
            
            # Analyze participant profiles
            analysis["participant_profiles"] = await self._analyze_participant_profiles(
                social_context.get("participants", [])
            )
            
            # Map interaction patterns
            analysis["interaction_patterns"] = await self._map_interaction_patterns(
                social_context, analysis["participant_profiles"]
            )
            
            # Analyze power dynamics
            analysis["power_dynamics"] = await self._analyze_power_dynamics(
                analysis["participant_profiles"], social_context
            )
            
            # Analyze communication flows
            analysis["communication_flows"] = await self._analyze_communication_flows(
                analysis["interaction_patterns"], analysis["power_dynamics"]
            )
            
            # Assess emotional dynamics
            analysis["emotional_dynamics"] = await self._assess_emotional_dynamics(
                social_context, analysis["participant_profiles"]
            )
            
            # Apply cultural analysis
            analysis["cultural_factors"] = await self._analyze_cultural_factors(
                social_context, analysis["participant_profiles"]
            )
            
            # Apply Romanian social context
            analysis["romanian_context"] = await self._apply_romanian_social_analysis(
                social_context, analysis
            )
            
            return analysis
            
        except Exception as e:
            self.logger.error(f"Error conducting social analysis: {str(e)}")
            raise
    
    async def _analyze_communication_patterns(
        self,
        social_context: Dict[str, Any],
        social_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze communication patterns and effectiveness."""
        try:
            communication_analysis = {
                "communication_styles": {},
                "effectiveness_metrics": {},
                "barriers_identified": [],
                "improvement_opportunities": [],
                "cultural_adaptations": {},
                "romanian_communication_patterns": {}
            }
            
            # Analyze individual communication styles
            communication_analysis["communication_styles"] = await self._analyze_individual_communication_styles(
                social_analysis["participant_profiles"]
            )
            
            # Assess communication effectiveness
            communication_analysis["effectiveness_metrics"] = await self._assess_communication_effectiveness(
                social_analysis["communication_flows"], communication_analysis["communication_styles"]
            )
            
            # Identify communication barriers
            communication_analysis["barriers_identified"] = await self._identify_communication_barriers(
                social_analysis, communication_analysis
            )
            
            # Find improvement opportunities
            communication_analysis["improvement_opportunities"] = await self._find_communication_improvements(
                communication_analysis["barriers_identified"], communication_analysis["effectiveness_metrics"]
            )
            
            # Apply cultural communication adaptations
            communication_analysis["cultural_adaptations"] = await self._apply_cultural_communication_adaptations(
                social_context, communication_analysis
            )
            
            # Apply Romanian communication patterns
            communication_analysis["romanian_communication_patterns"] = await self._apply_romanian_communication_patterns(
                social_context, communication_analysis
            )
            
            return communication_analysis
            
        except Exception as e:
            self.logger.error(f"Error analyzing communication patterns: {str(e)}")
            raise
    
    async def _apply_cultural_intelligence(
        self,
        social_context: Dict[str, Any],
        social_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Apply cultural intelligence frameworks."""
        try:
            cultural_intelligence = {
                "cultural_dimensions": {},
                "adaptation_strategies": {},
                "cross_cultural_competence": {},
                "cultural_sensitivity": {},
                "integration_recommendations": [],
                "romanian_cultural_integration": {}
            }
            
            # Analyze cultural dimensions
            cultural_intelligence["cultural_dimensions"] = await self._analyze_cultural_dimensions(
                social_analysis["participant_profiles"]
            )
            
            # Develop adaptation strategies
            cultural_intelligence["adaptation_strategies"] = await self._develop_cultural_adaptation_strategies(
                cultural_intelligence["cultural_dimensions"], social_context
            )
            
            # Assess cross-cultural competence
            cultural_intelligence["cross_cultural_competence"] = await self._assess_cross_cultural_competence(
                social_analysis["participant_profiles"], social_context
            )
            
            # Evaluate cultural sensitivity
            cultural_intelligence["cultural_sensitivity"] = await self._evaluate_cultural_sensitivity(
                social_analysis, cultural_intelligence["cultural_dimensions"]
            )
            
            # Generate integration recommendations
            cultural_intelligence["integration_recommendations"] = await self._generate_cultural_integration_recommendations(
                cultural_intelligence
            )
            
            # Apply Romanian cultural integration
            cultural_intelligence["romanian_cultural_integration"] = await self._apply_romanian_cultural_integration(
                social_context, cultural_intelligence
            )
            
            return cultural_intelligence
            
        except Exception as e:
            self.logger.error(f"Error applying cultural intelligence: {str(e)}")
            raise
    
    async def _generate_social_recommendations(
        self,
        social_analysis: Dict[str, Any],
        communication_analysis: Dict[str, Any],
        cultural_analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate comprehensive social recommendations."""
        try:
            recommendations = []
            
            # Generate relationship improvement recommendations
            relationship_recommendations = await self._generate_relationship_recommendations(
                social_analysis
            )
            recommendations.extend(relationship_recommendations)
            
            # Generate communication enhancement recommendations
            communication_recommendations = await self._generate_communication_enhancement_recommendations(
                communication_analysis
            )
            recommendations.extend(communication_recommendations)
            
            # Generate cultural integration recommendations
            cultural_recommendations = await self._generate_cultural_recommendations(
                cultural_analysis
            )
            recommendations.extend(cultural_recommendations)
            
            # Generate Romanian-specific recommendations
            romanian_recommendations = await self._generate_romanian_social_recommendations(
                social_analysis, communication_analysis, cultural_analysis
            )
            recommendations.extend(romanian_recommendations)
            
            # Prioritize and rank recommendations
            prioritized_recommendations = await self._prioritize_social_recommendations(
                recommendations, social_analysis
            )
            
            return prioritized_recommendations
            
        except Exception as e:
            self.logger.error(f"Error generating social recommendations: {str(e)}")
            raise
    
    async def _calculate_performance_score(
        self,
        social_analysis: Dict[str, Any],
        communication_analysis: Dict[str, Any],
        cultural_analysis: Dict[str, Any]
    ) -> float:
        """Calculate performance score for competitive advantage assessment."""
        try:
            # Base performance metrics
            analysis_depth_score = await self._calculate_analysis_depth(social_analysis)
            communication_accuracy_score = await self._calculate_communication_accuracy(communication_analysis)
            cultural_sensitivity_score = await self._calculate_cultural_sensitivity_score(cultural_analysis)
            relationship_insight_score = await self._calculate_relationship_insight_score(social_analysis)
            romanian_integration_score = await self._calculate_romanian_social_integration_score(
                social_analysis, cultural_analysis
            )
            
            # Weighted combination for overall performance
            weights = {
                "analysis_depth": 0.25,
                "communication_accuracy": 0.25,
                "cultural_sensitivity": 0.2,
                "relationship_insight": 0.15,
                "romanian_integration": 0.15
            }
            
            performance_score = (
                analysis_depth_score * weights["analysis_depth"] +
                communication_accuracy_score * weights["communication_accuracy"] +
                cultural_sensitivity_score * weights["cultural_sensitivity"] +
                relationship_insight_score * weights["relationship_insight"] +
                romanian_integration_score * weights["romanian_integration"]
            )
            
            # Ensure score is within valid range
            performance_score = max(0.0, min(1.0, performance_score))
            
            return performance_score
            
        except Exception as e:
            self.logger.error(f"Error calculating performance score: {str(e)}")
            return self.baseline_accuracy  # Return baseline if calculation fails
    
    # Additional helper methods for social analysis
    async def _identify_social_entities(self, query: str) -> List[str]:
        """Identify social entities and roles in the query."""
        social_keywords = [
            "person", "people", "individual", "group", "team", "family", "organization",
            "leader", "manager", "employee", "colleague", "friend", "partner", "client",
            "customer", "stakeholder", "community", "society", "culture", "relationship"
        ]
        
        query_lower = query.lower()
        return [keyword for keyword in social_keywords if keyword in query_lower]
    
    async def _extract_participants_from_query(self, query: str) -> List[Dict[str, Any]]:
        """Extract participant information from the query."""
        # Basic participant extraction - can be enhanced with NLP
        participant_keywords = {
            "individuals": ["person", "individual", "someone", "colleague", "friend"],
            "groups": ["team", "group", "committee", "organization", "department"],
            "roles": ["manager", "leader", "employee", "supervisor", "director"],
            "relationships": ["family", "spouse", "partner", "client", "customer"]
        }
        
        participants = []
        query_lower = query.lower()
        
        for category, keywords in participant_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                participants.append({
                    "type": category,
                    "identified_from": "query_analysis",
                    "role": "unspecified",
                    "relevance": "moderate"
                })
        
        return participants
    
    async def _identify_dynamics_indicators(
        self, 
        query: str, 
        social_context: Dict[str, Any]
    ) -> Dict[str, List[str]]:
        """Identify social dynamics indicators in the scenario."""
        indicators = {
            "cooperation": [],
            "conflicts": [],
            "leadership": [],
            "influence": [],
            "communication": []
        }
        
        # Cooperation indicators
        cooperation_patterns = ["collaborate", "work together", "support", "help", "cooperation"]
        indicators["cooperation"] = [pattern for pattern in cooperation_patterns if pattern in query.lower()]
        
        # Conflict indicators
        conflict_patterns = ["disagree", "conflict", "argue", "dispute", "tension", "problem"]
        indicators["conflicts"] = [pattern for pattern in conflict_patterns if pattern in query.lower()]
        
        # Leadership indicators
        leadership_patterns = ["lead", "manage", "direct", "guide", "authority", "decision"]
        indicators["leadership"] = [pattern for pattern in leadership_patterns if pattern in query.lower()]
        
        # Influence indicators
        influence_patterns = ["influence", "persuade", "convince", "motivate", "inspire"]
        indicators["influence"] = [pattern for pattern in influence_patterns if pattern in query.lower()]
        
        # Communication indicators
        communication_patterns = ["communicate", "discuss", "talk", "meeting", "conversation"]
        indicators["communication"] = [pattern for pattern in communication_patterns if pattern in query.lower()]
        
        return indicators