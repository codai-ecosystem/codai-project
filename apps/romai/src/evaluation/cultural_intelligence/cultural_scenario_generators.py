"""
Romanian Cultural Intelligence Scenario Generators
=================================================

Specialized scenario generators for comprehensive Romanian cultural
intelligence testing across different domains and complexity levels.

This module contains detailed scenario generation methods that were
extracted from the main evaluator to maintain modular architecture.

Author: RomAI Excellence Team
Version: 1.0.0
"""

import uuid
from typing import List
from datetime import datetime, timezone

from romai_cultural_intelligence_evaluator import (
    CulturalTestScenario, CulturalDomain, RegionalContext, CulturalComplexity
)

class RomanianCulturalScenarioGenerator:
    """Generator for Romanian cultural intelligence test scenarios."""
    
    def __init__(self):
        """Initialize the scenario generator."""
        self.generator_id = str(uuid.uuid4())
    
    def generate_business_etiquette_scenarios(self) -> List[CulturalTestScenario]:
        """Generate business etiquette and professional communication scenarios."""
        scenarios = []
        
        # High-stakes business meeting scenario
        scenarios.append(CulturalTestScenario(
            scenario_id="business_etiquette_001",
            domain=CulturalDomain.BUSINESS_ETIQUETTE,
            regional_context=RegionalContext.WALLACHIA,
            complexity=CulturalComplexity.EXPERT,
            scenario_name="Executive Board Meeting in Bucharest",
            description="First-time meeting with Romanian executive board of major corporation",
            cultural_context="High-stakes corporate environment with traditional hierarchy",
            situation_description="You are meeting the executive board of SC PETROM SA in Bucharest for a potential partnership. The CEO (age 65) and 6 VPs will be present. This is your first meeting and crucial for establishing trust.",
            question_prompt="Describe your approach for the first 10 minutes of this meeting, including greetings, seating, conversation topics, and business card exchange.",
            expected_response_elements=[
                "Formal greeting with handshake for each person",
                "Address CEO first using formal title",
                "Wait to be seated or ask permission",
                "Exchange business cards with both hands",
                "Brief small talk about Bucharest or positive Romania references",
                "Formal language and professional demeanor",
                "Respect for hierarchy and age"
            ],
            key_cultural_concepts=["hierarchy_respect", "formal_protocol", "relationship_building"],
            potential_cultural_pitfalls=["informal_address", "ignoring_seniority", "rushing_business"],
            regional_specifics=["bucharest_business_culture", "petrom_corporate_tradition"],
            difficulty_level=0.9,
            requires_business_context=True
        ))
        
        # Regional business meeting scenario
        scenarios.append(CulturalTestScenario(
            scenario_id="business_etiquette_002",
            domain=CulturalDomain.BUSINESS_ETIQUETTE,
            regional_context=RegionalContext.TRANSYLVANIA,
            complexity=CulturalComplexity.ADVANCED,
            scenario_name="Tech Startup Meeting in Cluj-Napoca",
            description="Partnership discussion with Romanian tech startup",
            cultural_context="Modern tech environment with European business practices",
            situation_description="Meeting with the founders of a successful Cluj-Napoca tech startup (ages 28-35) to discuss investment opportunities. The company has 150 employees and focuses on fintech solutions.",
            question_prompt="How would you approach this meeting differently from a traditional corporate meeting in Bucharest? What cultural adaptations are needed?",
            expected_response_elements=[
                "Less formal but still respectful approach",
                "Focus on innovation and efficiency",
                "European business style adaptation",
                "Tech industry awareness",
                "Cluj-Napoca as tech hub recognition",
                "Faster-paced discussion acceptance"
            ],
            key_cultural_concepts=["regional_adaptation", "generational_differences", "tech_culture"],
            potential_cultural_pitfalls=["overly_formal_approach", "ignoring_regional_differences"],
            regional_specifics=["transylvanian_efficiency", "tech_hub_culture", "european_influence"],
            difficulty_level=0.7,
            requires_business_context=True
        ))
        
        return scenarios
    
    def generate_regional_variation_scenarios(self) -> List[CulturalTestScenario]:
        """Generate regional cultural variation scenarios."""
        scenarios = []
        
        # Transylvanian business culture
        scenarios.append(CulturalTestScenario(
            scenario_id="regional_variation_001",
            domain=CulturalDomain.REGIONAL_VARIATIONS,
            regional_context=RegionalContext.TRANSYLVANIA,
            complexity=CulturalComplexity.EXPERT,
            scenario_name="Brașov Manufacturing Partnership",
            description="Establishing manufacturing partnership in Brașov with local family business",
            cultural_context="Traditional Transylvanian business family with Germanic influences",
            situation_description="You're negotiating with the Müller family who owns a precision manufacturing company in Brașov (established 1995). They employ 80 people and have strong German business connections. The patriarch (Stefan Müller, 58) and his son (Andreas, 32) will attend.",
            question_prompt="What cultural elements specific to Transylvania should you consider? How does the Germanic influence affect business practices?",
            expected_response_elements=[
                "Acknowledge Germanic heritage and influence",
                "Emphasize quality and precision values",
                "Respect for family business traditions",
                "Recognition of Transylvanian work ethic",
                "Understanding of German business connections",
                "Appreciation for craftsmanship heritage"
            ],
            key_cultural_concepts=["transylvanian_heritage", "germanic_influence", "family_business", "quality_focus"],
            potential_cultural_pitfalls=["ignoring_heritage", "stereotyping", "rush_relationships"],
            regional_specifics=["brasov_manufacturing", "german_connections", "family_traditions"],
            difficulty_level=0.8,
            requires_historical_knowledge=True,
            requires_business_context=True
        ))
        
        # Moldavian agricultural context
        scenarios.append(CulturalTestScenario(
            scenario_id="regional_variation_002", 
            domain=CulturalDomain.REGIONAL_VARIATIONS,
            regional_context=RegionalContext.MOLDAVIA,
            complexity=CulturalComplexity.ADVANCED,
            scenario_name="Agricultural Cooperative in Iași County",
            description="Partnership with traditional agricultural cooperative",
            cultural_context="Rural Moldavian agricultural community with traditional values",
            situation_description="Meeting with leaders of an agricultural cooperative in Iași County representing 200 small farmers. They want to modernize operations but maintain traditional practices. The cooperative president (Maria Popescu, 52) is highly respected in the community.",
            question_prompt="How do you balance modern agricultural technology proposals with respect for traditional Moldavian farming practices and community values?",
            expected_response_elements=[
                "Respect for traditional farming wisdom",
                "Understanding of community decision-making",
                "Recognition of agricultural heritage",
                "Gradual modernization approach",
                "Respect for rural values and pace",
                "Community benefit emphasis"
            ],
            key_cultural_concepts=["traditional_agriculture", "community_decision", "rural_values", "gradual_change"],
            potential_cultural_pitfalls=["dismissing_traditions", "rushing_modernization", "ignoring_community"],
            regional_specifics=["moldavian_agriculture", "cooperative_structure", "rural_pace"],
            difficulty_level=0.7,
            requires_business_context=True
        ))
        
        return scenarios
    
    def generate_historical_context_scenarios(self) -> List[CulturalTestScenario]:
        """Generate historical context understanding scenarios."""
        scenarios = []
        
        # Communist period business impact
        scenarios.append(CulturalTestScenario(
            scenario_id="historical_context_001",
            domain=CulturalDomain.HISTORICAL_CONTEXT,
            regional_context=RegionalContext.WALLACHIA,
            complexity=CulturalComplexity.EXPERT,
            scenario_name="Post-Communist Business Transformation Discussion",
            description="Understanding business culture evolution since 1989",
            cultural_context="Discussion with Romanian business leader about economic transformation",
            situation_description="Having lunch with a Romanian executive (age 62) who started his career during the communist period and built his company after 1989. He mentions how 'the old ways' sometimes conflict with modern business practices.",
            question_prompt="How do you demonstrate understanding of Romania's business culture evolution while discussing modern partnership opportunities?",
            expected_response_elements=[
                "Acknowledgment of economic transformation challenges",
                "Respect for entrepreneurial courage post-1989",
                "Understanding of trust-building importance",
                "Recognition of institutional development",
                "Appreciation for EU integration benefits",
                "Sensitivity to generational differences"
            ],
            key_cultural_concepts=["economic_transformation", "entrepreneurial_courage", "trust_building", "generational_change"],
            potential_cultural_pitfalls=["political_insensitivity", "stereotyping", "dismissing_experience"],
            regional_specifics=["bucharest_transformation", "business_evolution", "institutional_change"],
            difficulty_level=0.9,
            requires_historical_knowledge=True,
            requires_business_context=True
        ))
        
        return scenarios
    
    def generate_language_nuance_scenarios(self) -> List[CulturalTestScenario]:
        """Generate language nuance and communication scenarios."""
        scenarios = []
        
        # Formal vs informal communication
        scenarios.append(CulturalTestScenario(
            scenario_id="language_nuance_001",
            domain=CulturalDomain.LANGUAGE_NUANCES,
            regional_context=RegionalContext.WALLACHIA,
            complexity=CulturalComplexity.ADVANCED,
            scenario_name="Email Communication Escalation",
            description="Proper escalation of email communication formality",
            cultural_context="Business email communication requiring cultural sensitivity",
            situation_description="You've been corresponding with a potential Romanian partner (Dorin Constantinescu, Director General) via email using informal tone. He hasn't responded to your last two emails. Your Romanian colleague suggests your communication style might be the issue.",
            question_prompt="How should you adjust your email communication? Write a proper follow-up email demonstrating appropriate Romanian business communication style.",
            expected_response_elements=[
                "Switch to formal 'Dumneavoastră' form",
                "Use proper titles (Domnul Director General)",
                "Formal greeting (Stimate Domnule Constantinescu)",
                "Respectful closing (Cu deosebită considerație)",
                "Acknowledge previous informality diplomatically",
                "Professional tone throughout"
            ],
            key_cultural_concepts=["formal_address", "business_hierarchy", "respectful_communication", "cultural_adaptation"],
            potential_cultural_pitfalls=["continued_informality", "ignoring_titles", "casual_tone"],
            regional_specifics=["romanian_formality", "business_protocol"],
            difficulty_level=0.8,
            requires_language_nuance=True,
            requires_business_context=True
        ))
        
        return scenarios
    
    def generate_social_dynamics_scenarios(self) -> List[CulturalTestScenario]:
        """Generate social dynamics and interpersonal scenarios."""
        scenarios = []
        
        # Business dinner etiquette
        scenarios.append(CulturalTestScenario(
            scenario_id="social_dynamics_001",
            domain=CulturalDomain.SOCIAL_DYNAMICS,
            regional_context=RegionalContext.TRANSYLVANIA,
            complexity=CulturalComplexity.ADVANCED,
            scenario_name="Business Dinner in Sibiu",
            description="Business dinner with Romanian partners and their families",
            cultural_context="Traditional Romanian hospitality in business social setting",
            situation_description="Your Romanian business partner invites you to dinner at his home in Sibiu with his wife and teenage children. This is a crucial relationship-building opportunity before signing a major contract.",
            question_prompt="Describe your behavior throughout the evening, including gift-giving, conversation topics, dining etiquette, and departure timing.",
            expected_response_elements=[
                "Bring flowers for wife (odd number, not red)",
                "Bring small gift for children",
                "Compliment the home and food genuinely",
                "Show interest in family",
                "Avoid business discussion unless host initiates",
                "Wait for host to indicate departure time",
                "Express gratitude for hospitality"
            ],
            key_cultural_concepts=["romanian_hospitality", "family_importance", "gift_giving", "relationship_building"],
            potential_cultural_pitfalls=["inappropriate_gifts", "business_focus", "early_departure", "refusing_food"],
            regional_specifics=["transylvanian_hospitality", "sibiu_traditions"],
            difficulty_level=0.7,
            requires_business_context=True
        ))
        
        return scenarios
    
    def generate_regulatory_scenarios(self) -> List[CulturalTestScenario]:
        """Generate regulatory environment and compliance scenarios.""" 
        scenarios = []
        
        # GDPR and ANSPDCP compliance
        scenarios.append(CulturalTestScenario(
            scenario_id="regulatory_001",
            domain=CulturalDomain.REGULATORY_ENVIRONMENT,
            regional_context=RegionalContext.WALLACHIA,
            complexity=CulturalComplexity.EXPERT,
            scenario_name="Data Protection Compliance Discussion",
            description="GDPR and Romanian data protection requirements",
            cultural_context="Legal compliance meeting with Romanian data protection officer",
            situation_description="Meeting with the Data Protection Officer of a Romanian company to discuss GDPR compliance and ANSPDCP requirements for your joint venture. They emphasize that Romanian authorities are particularly strict about data localization.",
            question_prompt="How do you demonstrate understanding of Romanian-specific data protection requirements while discussing your compliance framework?",
            expected_response_elements=[
                "Understanding of ANSPDCP authority role",
                "Recognition of Romanian data localization preferences",
                "EU GDPR compliance as baseline",
                "Local legal representation importance",
                "Romanian language documentation needs",
                "Regular audit and reporting requirements"
            ],
            key_cultural_concepts=["regulatory_compliance", "data_sovereignty", "local_legal_requirements"],
            potential_cultural_pitfalls=["minimizing_local_requirements", "generic_compliance", "language_barriers"],
            regional_specifics=["anspdcp_requirements", "romanian_legal_system"],
            difficulty_level=0.9,
            requires_business_context=True
        ))
        
        return scenarios
    
    def generate_contemporary_values_scenarios(self) -> List[CulturalTestScenario]:
        """Generate contemporary Romanian values and society scenarios."""
        scenarios = []
        
        # Work-life balance in modern Romania
        scenarios.append(CulturalTestScenario(
            scenario_id="contemporary_values_001",
            domain=CulturalDomain.CONTEMPORARY_VALUES,
            regional_context=RegionalContext.TRANSYLVANIA,
            complexity=CulturalComplexity.INTERMEDIATE,
            scenario_name="Modern Romanian Workplace Values",
            description="Understanding contemporary work-life balance expectations",
            cultural_context="HR discussion about workplace policies with Romanian employees",
            situation_description="Your Romanian HR manager explains that employees are requesting more flexible work arrangements and better work-life balance. She mentions this reflects modern Romanian values, especially among younger professionals in Cluj-Napoca.",
            question_prompt="How do you develop workplace policies that respect contemporary Romanian values while maintaining business productivity?",
            expected_response_elements=[
                "Recognition of changing generational values",
                "Family-first priority respect",
                "Flexible work arrangements consideration",
                "Professional development opportunities",
                "European workplace standards alignment",
                "Romanian national holidays respect"
            ],
            key_cultural_concepts=["work_life_balance", "family_centrality", "generational_change", "european_values"],
            potential_cultural_pitfalls=["ignoring_family_priorities", "rigid_traditional_approach", "cultural_insensitivity"],
            regional_specifics=["tech_sector_expectations", "european_influence", "urban_values"],
            difficulty_level=0.6,
            requires_business_context=True
        ))
        
        return scenarios

# Export main class
__all__ = ['RomanianCulturalScenarioGenerator']