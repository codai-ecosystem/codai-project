"""
Enterprise Transformation Scenario Generator
==========================================

Generates comprehensive enterprise digital transformation scenarios
with Romanian business context and cultural considerations.

Author: RomAI Excellence Team
Version: 1.0.0
"""

import uuid
from typing import List, Dict, Any
from dataclasses import dataclass
from enum import Enum, auto
from datetime import datetime, timezone

from .romai_realworld_evaluator import (
    RealWorldScenario, RealWorldDomain, ProblemComplexity, SolutionCriteria
)

class EnterpriseSize(Enum):
    """Enterprise size categories."""
    STARTUP = auto()          # <50 employees
    SMALL_BUSINESS = auto()   # 50-250 employees  
    MEDIUM_ENTERPRISE = auto() # 250-1000 employees
    LARGE_ENTERPRISE = auto()  # 1000+ employees

class IndustryVertical(Enum):
    """Romanian industry verticals."""
    MANUFACTURING = auto()
    FINANCIAL_SERVICES = auto()
    RETAIL_COMMERCE = auto()
    ENERGY_UTILITIES = auto()
    HEALTHCARE = auto()
    LOGISTICS_TRANSPORT = auto()
    TECHNOLOGY = auto()
    AGRICULTURE = auto()

class TransformationType(Enum):
    """Types of digital transformation."""
    PROCESS_DIGITIZATION = auto()
    CUSTOMER_EXPERIENCE = auto()
    BUSINESS_MODEL_INNOVATION = auto()
    OPERATIONAL_EFFICIENCY = auto()
    DATA_DRIVEN_DECISION = auto()
    CLOUD_MIGRATION = auto()
    AI_AUTOMATION = auto()

class EnterpriseScenarioGenerator:
    """
    Generates realistic enterprise transformation scenarios
    tailored to Romanian business environment.
    """
    
    def __init__(self):
        self.generator_id = str(uuid.uuid4())
        
        # Romanian business context data
        self.romanian_business_factors = {
            'regulations': [
                'Romanian Labor Code compliance',
                'GDPR and data protection',
                'Romanian Fiscal Code requirements',
                'EU competition regulations',
                'Industry-specific Romanian regulations'
            ],
            'cultural_factors': [
                'Hierarchical decision making',
                'Relationship-based business culture',
                'Risk-averse management style',
                'Traditional process preferences',
                'Family business dynamics'
            ],
            'economic_context': [
                'EU structural funding opportunities',
                'Romanian government digitization incentives',
                'Competitive pressure from multinational companies',
                'Local supplier ecosystem constraints',
                'Currency stability considerations'
            ],
            'technology_landscape': [
                'Legacy system prevalence',
                'Limited IT expertise availability',
                'Infrastructure connectivity challenges',
                'Cybersecurity awareness gaps',
                'Cloud adoption hesitancy'
            ]
        }
    
    async def generate_scenarios(self) -> List[RealWorldScenario]:
        """Generate comprehensive enterprise transformation scenarios."""
        scenarios = []
        
        # Manufacturing transformation scenarios
        scenarios.extend(self._generate_manufacturing_scenarios())
        
        # Financial services scenarios  
        scenarios.extend(self._generate_financial_scenarios())
        
        # Retail transformation scenarios
        scenarios.extend(self._generate_retail_scenarios())
        
        # SME digitization scenarios
        scenarios.extend(self._generate_sme_scenarios())
        
        return scenarios
    
    def _generate_manufacturing_scenarios(self) -> List[RealWorldScenario]:
        """Generate manufacturing transformation scenarios."""
        scenarios = []
        
        # Automotive parts manufacturer
        scenarios.append(RealWorldScenario(
            scenario_id="enterprise_mfg_001",
            domain=RealWorldDomain.ENTERPRISE_TRANSFORMATION,
            complexity=ProblemComplexity.HIGHLY_COMPLEX,
            title="Romanian Automotive Parts Manufacturer Industry 4.0 Transformation",
            description="Transform traditional automotive parts manufacturing company into smart, connected Industry 4.0 operation with IoT, AI, and advanced analytics",
            context={
                'company_size': '750 employees',
                'industry': 'Automotive parts manufacturing',
                'location': 'Pitești, Romania',
                'current_state': 'Semi-automated production with legacy ERP system',
                'market_pressure': 'International competition, quality requirements increasing',
                'main_customers': 'Dacia, Ford Romania, BMW suppliers',
                'annual_revenue': '€45M',
                'export_percentage': 85
            },
            constraints={
                'budget': '€3.5M over 4 years',
                'timeline': '48 months',
                'production_downtime': '<3% during implementation',
                'employee_retention': '>92%',
                'quality_standards': 'TS 16949 compliance maintenance',
                'roi_target': '25% within 3 years'
            },
            stakeholders=[
                'CEO/Owner', 'Operations Director', 'IT Manager', 
                'Production Workers', 'Quality Manager', 'Union Representatives',
                'Key Customers (Dacia, Ford)', 'Local Government', 'EU Auditors'
            ],
            success_metrics={
                'production_efficiency': 0.35,
                'defect_reduction': 0.50,
                'energy_efficiency': 0.20,
                'predictive_maintenance_adoption': 0.80,
                'employee_digital_skills': 0.70,
                'customer_satisfaction': 0.15
            },
            romanian_factors={
                'labor_regulations': 'Romanian employment law compliance during transformation',
                'eu_funding': 'Eligible for EU structural funds for manufacturing modernization',
                'local_suppliers': 'Integration with Romanian component suppliers',
                'skills_gap': 'Limited availability of Industry 4.0 specialists in Romania',
                'cultural_resistance': 'Traditional manufacturing culture adaptation challenges',
                'infrastructure': 'Industrial internet connectivity in Pitești region'
            },
            cultural_considerations=[
                'Worker participation in decision-making (Romanian industrial relations)',
                'Gradual change management approach preferred in Romanian culture',
                'Emphasis on job security during transformation',
                'Respect for experienced workers\' knowledge',
                'Family business dynamics (many Romanian manufacturers are family-owned)'
            ],
            regulatory_requirements=[
                'Romanian Labor Code compliance during reorganization',
                'GDPR compliance for worker data collection',
                'Romanian environmental regulations for smart factory',
                'EU machinery directive compliance',
                'Romanian industrial safety regulations'
            ],
            required_engines=[
                'manufacturing_intelligence', 'iot_integration', 'predictive_maintenance',
                'quality_management', 'supply_chain_optimization', 'change_management',
                'romanian_compliance', 'workforce_development'
            ],
            evaluation_criteria={
                SolutionCriteria.FEASIBILITY: 0.80,
                SolutionCriteria.COST_EFFECTIVENESS: 0.75,
                SolutionCriteria.SCALABILITY: 0.85,
                SolutionCriteria.CULTURAL_FIT: 0.85,
                SolutionCriteria.REGULATORY_COMPLIANCE: 0.90,
                SolutionCriteria.STAKEHOLDER_ACCEPTANCE: 0.75
            },
            min_feasibility_score=0.80,
            min_cost_effectiveness=0.75,
            min_cultural_fit=0.85
        ))
        
        return scenarios
    
    def _generate_financial_scenarios(self) -> List[RealWorldScenario]:
        """Generate financial services transformation scenarios."""
        scenarios = []
        
        # Regional bank digital transformation
        scenarios.append(RealWorldScenario(
            scenario_id="enterprise_fin_001", 
            domain=RealWorldDomain.ENTERPRISE_TRANSFORMATION,
            complexity=ProblemComplexity.EXTREME,
            title="Romanian Regional Bank Digital Banking Transformation",
            description="Transform traditional regional bank into modern digital-first banking operation with mobile banking, AI-powered services, and enhanced customer experience",
            context={
                'institution_type': 'Regional commercial bank',
                'assets': '€2.8B',
                'employees': '1,200',
                'branches': '85 branches across Romania',
                'customer_base': '450,000 retail + 12,000 SME customers',
                'current_digital_adoption': '35% of customers use online banking',
                'market_position': 'Top 10 Romanian banks by assets',
                'location': 'Headquarters in Cluj-Napoca'
            },
            constraints={
                'budget': '€25M over 5 years',
                'timeline': '60 months',
                'regulatory_approval_time': '12 months for major changes',
                'customer_migration_target': '>80% digital adoption',
                'branch_optimization': 'Reduce to 50 branches while maintaining service quality',
                'compliance_requirement': 'Zero regulatory violations during transition'
            },
            stakeholders=[
                'Board of Directors', 'CEO', 'CTO', 'Risk Management',
                'Retail Customers', 'SME Customers', 'Bank Employees',
                'National Bank of Romania (BNR)', 'European Banking Authority',
                'Local Communities', 'Fintech Partners'
            ],
            success_metrics={
                'digital_adoption_rate': 0.80,
                'customer_satisfaction_improvement': 0.25,
                'operational_cost_reduction': 0.30,
                'time_to_market_new_products': 0.60,  # 60% faster
                'fraud_detection_improvement': 0.40,
                'employee_productivity': 0.20
            },
            romanian_factors={
                'bnr_regulations': 'National Bank of Romania digital banking guidelines',
                'gdpr_banking': 'Enhanced GDPR requirements for financial data',
                'romanian_payment_systems': 'Integration with Romanian instant payment system',
                'local_competition': 'Competition from Romanian fintech startups',
                'rural_customer_needs': 'Serving customers in rural Romanian areas',
                'language_localization': 'Complete Romanian language digital experience'
            },
            cultural_considerations=[
                'Trust-based relationships in Romanian banking',
                'Preference for personal interaction in financial matters',
                'Gradual adoption of digital services',
                'Importance of local branch presence',
                'Elder customer segment digital inclusion'
            ],
            regulatory_requirements=[
                'BNR approval for digital banking services',
                'GDPR compliance for customer data',
                'PSD2 compliance for open banking',
                'Romanian anti-money laundering regulations',
                'Consumer protection regulations'
            ],
            required_engines=[
                'digital_banking', 'customer_experience', 'risk_management',
                'regulatory_compliance', 'change_management', 'cybersecurity',
                'data_analytics', 'process_optimization'
            ],
            evaluation_criteria={
                SolutionCriteria.FEASIBILITY: 0.75,
                SolutionCriteria.COST_EFFECTIVENESS: 0.70,
                SolutionCriteria.SCALABILITY: 0.85,
                SolutionCriteria.CULTURAL_FIT: 0.80,
                SolutionCriteria.REGULATORY_COMPLIANCE: 0.95,
                SolutionCriteria.STAKEHOLDER_ACCEPTANCE: 0.70
            }
        ))
        
        return scenarios
    
    def _generate_retail_scenarios(self) -> List[RealWorldScenario]:
        """Generate retail transformation scenarios.""" 
        scenarios = []
        
        # Romanian retail chain omnichannel transformation
        scenarios.append(RealWorldScenario(
            scenario_id="enterprise_retail_001",
            domain=RealWorldDomain.ENTERPRISE_TRANSFORMATION,
            complexity=ProblemComplexity.COMPLEX,
            title="Romanian Retail Chain Omnichannel Digital Transformation",
            description="Transform traditional Romanian retail chain into integrated omnichannel operation with e-commerce, mobile apps, and personalized customer experience",
            context={
                'company_type': 'Fashion and lifestyle retail chain',
                'stores': '120 stores nationwide',
                'employees': '2,500',
                'annual_revenue': '€180M',
                'customer_base': '850,000 loyalty program members',
                'current_digital_presence': 'Basic website, no e-commerce',
                'market_position': 'Leading Romanian fashion retailer',
                'headquarters': 'Bucharest'
            },
            constraints={
                'budget': '€8M over 3 years',
                'timeline': '36 months',
                'store_operations': 'No disruption to existing store operations',
                'inventory_integration': 'Real-time inventory across all channels',
                'customer_data_migration': '100% customer data preservation',
                'seasonality': 'Implementation around peak shopping seasons'
            },
            stakeholders=[
                'Retail Chain Owner', 'Marketing Director', 'Store Managers',
                'Customers', 'Store Associates', 'Suppliers',
                'E-commerce Platform Partners', 'Payment Processors',
                'Romanian Consumer Protection Authority'
            ],
            success_metrics={
                'online_sales_percentage': 0.25,  # Target 25% of total sales online
                'customer_retention_improvement': 0.20,
                'inventory_turnover_improvement': 0.15,
                'customer_satisfaction_score': 0.85,
                'cross_channel_customer_percentage': 0.40,
                'operational_efficiency': 0.18
            },
            romanian_factors={
                'ecommerce_regulations': 'Romanian e-commerce consumer protection laws',
                'payment_preferences': 'Romanian customer payment method preferences',
                'logistics_infrastructure': 'Romanian delivery and fulfillment capabilities',
                'local_competition': 'Competition from international retailers in Romania',
                'seasonal_shopping_patterns': 'Romanian holiday and seasonal shopping behaviors',
                'rural_market_access': 'Serving customers in smaller Romanian cities'
            },
            required_engines=[
                'ecommerce_platform', 'customer_analytics', 'inventory_management',
                'omnichannel_integration', 'personalization', 'logistics_optimization',
                'digital_marketing', 'customer_service'
            ],
            evaluation_criteria={
                SolutionCriteria.FEASIBILITY: 0.85,
                SolutionCriteria.COST_EFFECTIVENESS: 0.80,
                SolutionCriteria.SCALABILITY: 0.90,
                SolutionCriteria.CULTURAL_FIT: 0.85,
                SolutionCriteria.REGULATORY_COMPLIANCE: 0.85,
                SolutionCriteria.STAKEHOLDER_ACCEPTANCE: 0.80
            }
        ))
        
        return scenarios
    
    def _generate_sme_scenarios(self) -> List[RealWorldScenario]:
        """Generate SME digitization scenarios."""
        scenarios = []
        
        # Family-owned logistics company
        scenarios.append(RealWorldScenario(
            scenario_id="enterprise_sme_001",
            domain=RealWorldDomain.ENTERPRISE_TRANSFORMATION,
            complexity=ProblemComplexity.MODERATE,
            title="Romanian Family Logistics Company Digital Operations Transformation",
            description="Digitize operations of family-owned Romanian logistics company with route optimization, fleet management, and customer portal",
            context={
                'company_type': 'Family-owned logistics and transport',
                'employees': '85',
                'fleet_size': '45 trucks',
                'service_area': 'Romania and Central Europe',
                'annual_revenue': '€5.2M',
                'customers': '230 active business customers',
                'current_systems': 'Paper-based operations, basic accounting software',
                'family_involvement': '3 family members in management'
            },
            constraints={
                'budget': '€350K over 2 years',
                'timeline': '24 months',
                'family_approval': 'All major decisions require family consensus',
                'driver_adaptation': 'Must be usable by drivers with varying tech skills',
                'customer_integration': 'Seamless integration with customer systems',
                'compliance': 'EU transport regulations compliance'
            },
            stakeholders=[
                'Family Owners', 'General Manager', 'Operations Manager',
                'Truck Drivers', 'Dispatchers', 'Administrative Staff',
                'Business Customers', 'Regulatory Authorities'
            ],
            success_metrics={
                'route_optimization_savings': 0.15,
                'fuel_efficiency_improvement': 0.12,
                'customer_satisfaction': 0.20,
                'administrative_efficiency': 0.25,
                'on_time_delivery_improvement': 0.18,
                'driver_productivity': 0.10
            },
            romanian_factors={
                'family_business_dynamics': 'Consensus-based decision making in Romanian families',
                'driver_culture': 'Traditional Romanian truck driver culture',
                'transport_regulations': 'Romanian and EU transport compliance requirements',
                'seasonal_variations': 'Agricultural transport seasonal patterns',
                'cross_border_operations': 'Multi-country regulatory compliance'
            },
            required_engines=[
                'logistics_optimization', 'fleet_management', 'route_planning',
                'customer_portal', 'mobile_applications', 'family_business_consulting',
                'change_management', 'regulatory_compliance'
            ],
            evaluation_criteria={
                SolutionCriteria.FEASIBILITY: 0.90,
                SolutionCriteria.COST_EFFECTIVENESS: 0.85,
                SolutionCriteria.CULTURAL_FIT: 0.90,
                SolutionCriteria.REGULATORY_COMPLIANCE: 0.85,
                SolutionCriteria.STAKEHOLDER_ACCEPTANCE: 0.85
            }
        ))
        
        return scenarios

# Export main class
__all__ = ['EnterpriseScenarioGenerator']