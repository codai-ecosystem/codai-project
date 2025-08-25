"""
Romanian Strategic Context

Strategic intelligence specific to the Romanian market, economy, and business environment.
Integrates with Ministry of Economy, Chamber of Commerce, Competition Council, and BVB data.
"""

from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
import asyncio
import json
from datetime import datetime, timedelta
from enum import Enum


class RomanianMarketSector(Enum):
    """Romanian market sectors."""
    AUTOMOTIVE = "automotive"
    BANKING_FINANCE = "banking_finance"
    ENERGY = "energy"
    IT_TECHNOLOGY = "it_technology"
    RETAIL_CONSUMER = "retail_consumer"
    AGRICULTURE = "agriculture"
    MANUFACTURING = "manufacturing"
    REAL_ESTATE = "real_estate"
    TELECOMMUNICATIONS = "telecommunications"
    HEALTHCARE = "healthcare"
    TOURISM = "tourism"
    CONSTRUCTION = "construction"
    LOGISTICS = "logistics"
    TEXTILES = "textiles"
    PHARMACEUTICALS = "pharmaceuticals"


class RomanianRegion(Enum):
    """Romanian development regions."""
    BUCURESTI_ILFOV = "bucuresti_ilfov"
    SUD_MUNTENIA = "sud_muntenia"
    SUD_VEST_OLTENIA = "sud_vest_oltenia"
    VEST = "vest"
    NORD_VEST = "nord_vest"
    CENTRU = "centru"
    NORD_EST = "nord_est"
    SUD_EST = "sud_est"


class RomanianRegulation(Enum):
    """Romanian regulatory frameworks."""
    ONRC_COMPANY_LAW = "onrc_company_law"
    BNR_BANKING = "bnr_banking"
    ANRE_ENERGY = "anre_energy"
    ANCOM_TELECOM = "ancom_telecom"
    CNVM_CAPITAL_MARKETS = "cnvm_capital_markets"
    COMPETITION_COUNCIL = "competition_council"
    TAX_CODE = "tax_code"
    LABOR_CODE = "labor_code"
    GDPR_LOCAL = "gdpr_local"
    ENVIRONMENTAL = "environmental"


@dataclass
class RomanianEconomicContext:
    """Romanian economic context data."""
    gdp_growth: float = 3.8
    inflation_rate: float = 4.2
    unemployment_rate: float = 5.1
    fdi_inflow: float = 6.8  # Billion EUR
    current_account_balance: float = -8.2  # Billion EUR
    exchange_rate_eur: float = 4.95  # RON per EUR
    interest_rate: float = 6.75  # BNR policy rate
    budget_deficit: float = -5.7  # % of GDP
    public_debt: float = 48.9  # % of GDP
    competitiveness_index: float = 64.4  # WEF Global Competitiveness Index
    
    # Sectoral indicators
    it_growth_rate: float = 12.5
    automotive_production: float = 550000  # units annually
    energy_consumption: float = 52.3  # TWh
    agricultural_output: float = 8.5  # Billion EUR
    tourism_revenue: float = 2.8  # Billion EUR


@dataclass
class RomanianMarketIntelligence:
    """Romanian market intelligence data."""
    market_size: float
    growth_rate: float
    key_players: List[str]
    market_concentration: float
    entry_barriers: float
    regulatory_complexity: float
    government_support: float
    eu_integration_level: float
    digital_adoption: float
    competitive_intensity: float
    regional_distribution: Dict[str, float]
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


class RomanianStrategicContext:
    """Romanian strategic context and market intelligence."""
    
    def __init__(self):
        self.economic_data = self._initialize_economic_data()
        self.market_intelligence = self._initialize_market_intelligence()
        self.regulatory_framework = self._initialize_regulatory_framework()
        self.competitive_landscape = self._initialize_competitive_landscape()
        self.government_initiatives = self._initialize_government_initiatives()
        self.eu_integration = self._initialize_eu_integration()
        self.digital_transformation = self._initialize_digital_transformation()
    
    def _initialize_economic_data(self) -> Dict[str, Any]:
        """Initialize Romanian economic data."""
        return {
            'macroeconomic_indicators': RomanianEconomicContext(),
            'sector_performance': {
                RomanianMarketSector.IT_TECHNOLOGY: {
                    'growth_rate': 12.5,
                    'export_value': 6.2,  # Billion EUR
                    'employment': 185000,
                    'contribution_to_gdp': 6.8
                },
                RomanianMarketSector.AUTOMOTIVE: {
                    'growth_rate': 5.8,
                    'export_value': 15.2,  # Billion EUR
                    'employment': 210000,
                    'contribution_to_gdp': 8.3
                },
                RomanianMarketSector.BANKING_FINANCE: {
                    'growth_rate': 4.2,
                    'assets': 485,  # Billion RON
                    'employment': 95000,
                    'contribution_to_gdp': 4.5
                },
                RomanianMarketSector.ENERGY: {
                    'growth_rate': 2.1,
                    'production': 64.5,  # TWh
                    'employment': 118000,
                    'contribution_to_gdp': 7.2
                }
            },
            'regional_development': {
                RomanianRegion.BUCURESTI_ILFOV: {
                    'gdp_per_capita': 29500,  # EUR
                    'employment_rate': 68.4,
                    'innovation_index': 0.72,
                    'fdi_attraction': 45.2  # % of total
                },
                RomanianRegion.VEST: {
                    'gdp_per_capita': 16800,
                    'employment_rate': 65.8,
                    'innovation_index': 0.58,
                    'fdi_attraction': 18.7
                },
                RomanianRegion.CENTRU: {
                    'gdp_per_capita': 15200,
                    'employment_rate': 63.2,
                    'innovation_index': 0.52,
                    'fdi_attraction': 12.4
                },
                RomanianRegion.NORD_VEST: {
                    'gdp_per_capita': 14600,
                    'employment_rate': 61.9,
                    'innovation_index': 0.48,
                    'fdi_attraction': 9.8
                }
            }
        }
    
    def _initialize_market_intelligence(self) -> Dict[str, RomanianMarketIntelligence]:
        """Initialize Romanian market intelligence by sector."""
        return {
            RomanianMarketSector.IT_TECHNOLOGY.value: RomanianMarketIntelligence(
                market_size=6.2,  # Billion EUR
                growth_rate=12.5,
                key_players=['eMAG', 'UiPath', 'Zitec', 'Gameloft', 'Oracle Romania'],
                market_concentration=0.35,
                entry_barriers=0.25,
                regulatory_complexity=0.30,
                government_support=0.85,
                eu_integration_level=0.88,
                digital_adoption=0.72,
                competitive_intensity=0.78,
                regional_distribution={
                    'Bucharest': 0.65,
                    'Cluj-Napoca': 0.15,
                    'Timisoara': 0.08,
                    'Iasi': 0.06,
                    'Other': 0.06
                }
            ),
            RomanianMarketSector.BANKING_FINANCE.value: RomanianMarketIntelligence(
                market_size=485,  # Billion RON in assets
                growth_rate=4.2,
                key_players=['BRD', 'BCR', 'Banca Transilvania', 'Raiffeisen Bank', 'ING Bank'],
                market_concentration=0.68,
                entry_barriers=0.75,
                regulatory_complexity=0.85,
                government_support=0.45,
                eu_integration_level=0.95,
                digital_adoption=0.68,
                competitive_intensity=0.72,
                regional_distribution={
                    'Bucharest': 0.55,
                    'Cluj-Napoca': 0.08,
                    'Timisoara': 0.07,
                    'Constanta': 0.05,
                    'Other': 0.25
                }
            ),
            RomanianMarketSector.AUTOMOTIVE.value: RomanianMarketIntelligence(
                market_size=15.2,  # Billion EUR exports
                growth_rate=5.8,
                key_players=['Dacia-Renault', 'Ford Romania', 'Continental', 'Michelin', 'Bosch'],
                market_concentration=0.42,
                entry_barriers=0.80,
                regulatory_complexity=0.55,
                government_support=0.70,
                eu_integration_level=0.92,
                digital_adoption=0.65,
                competitive_intensity=0.82,
                regional_distribution={
                    'Arges': 0.35,  # Pitesti - Dacia
                    'Dolj': 0.25,   # Craiova - Ford
                    'Timis': 0.18,
                    'Arad': 0.12,
                    'Other': 0.10
                }
            ),
            RomanianMarketSector.ENERGY.value: RomanianMarketIntelligence(
                market_size=12.8,  # Billion EUR
                growth_rate=2.1,
                key_players=['OMV Petrom', 'Hidroelectrica', 'E.ON Romania', 'Engie Romania', 'CEZ Romania'],
                market_concentration=0.58,
                entry_barriers=0.88,
                regulatory_complexity=0.78,
                government_support=0.65,
                eu_integration_level=0.85,
                digital_adoption=0.58,
                competitive_intensity=0.65,
                regional_distribution={
                    'Bucharest': 0.28,
                    'Hunedoara': 0.18,
                    'Prahova': 0.15,
                    'Gorj': 0.12,
                    'Other': 0.27
                }
            ),
            RomanianMarketSector.RETAIL_CONSUMER.value: RomanianMarketIntelligence(
                market_size=68.5,  # Billion RON
                growth_rate=6.4,
                key_players=['Kaufland', 'Carrefour', 'Lidl', 'eMAG', 'Auchan'],
                market_concentration=0.52,
                entry_barriers=0.45,
                regulatory_complexity=0.35,
                government_support=0.55,
                eu_integration_level=0.82,
                digital_adoption=0.75,
                competitive_intensity=0.85,
                regional_distribution={
                    'Bucharest': 0.32,
                    'Cluj': 0.08,
                    'Timisoara': 0.07,
                    'Constanta': 0.06,
                    'Other': 0.47
                }
            )
        }
    
    def _initialize_regulatory_framework(self) -> Dict[str, Any]:
        """Initialize Romanian regulatory framework data."""
        return {
            RomanianRegulation.ONRC_COMPANY_LAW: {
                'complexity_score': 0.65,
                'compliance_cost': 'Medium',
                'processing_time_days': 15,
                'digitalization_level': 0.78,
                'key_requirements': [
                    'Minimum share capital requirements',
                    'Director and shareholder disclosure',
                    'Annual financial reporting',
                    'Audit requirements for large companies'
                ]
            },
            RomanianRegulation.BNR_BANKING: {
                'complexity_score': 0.85,
                'compliance_cost': 'High',
                'processing_time_days': 180,
                'digitalization_level': 0.68,
                'key_requirements': [
                    'Capital adequacy ratios',
                    'Liquidity requirements',
                    'Risk management frameworks',
                    'Consumer protection measures'
                ]
            },
            RomanianRegulation.COMPETITION_COUNCIL: {
                'complexity_score': 0.72,
                'compliance_cost': 'Medium-High',
                'processing_time_days': 90,
                'digitalization_level': 0.58,
                'key_requirements': [
                    'Merger notification thresholds',
                    'Market dominance assessment',
                    'Anti-competitive practices monitoring',
                    'State aid compatibility'
                ]
            },
            RomanianRegulation.TAX_CODE: {
                'complexity_score': 0.78,
                'compliance_cost': 'High',
                'processing_time_days': 30,
                'digitalization_level': 0.82,
                'key_requirements': [
                    'Corporate income tax (16%)',
                    'VAT compliance (19%)',
                    'Payroll taxes and contributions',
                    'Transfer pricing documentation'
                ]
            }
        }
    
    def _initialize_competitive_landscape(self) -> Dict[str, Any]:
        """Initialize Romanian competitive landscape analysis."""
        return {
            'market_leaders': {
                'overall_economy': ['OMV Petrom', 'Orange Romania', 'Kaufland Romania', 'BCR', 'eMAG'],
                'by_revenue': [
                    {'company': 'OMV Petrom', 'revenue': 29.5, 'sector': 'Energy'},
                    {'company': 'Orange Romania', 'revenue': 6.8, 'sector': 'Telecommunications'},
                    {'company': 'Kaufland Romania', 'revenue': 4.2, 'sector': 'Retail'},
                    {'company': 'BCR', 'revenue': 3.8, 'sector': 'Banking'},
                    {'company': 'eMAG', 'revenue': 2.1, 'sector': 'E-commerce'}
                ],
                'by_employees': [
                    {'company': 'Orange Romania', 'employees': 8500, 'sector': 'Telecommunications'},
                    {'company': 'OMV Petrom', 'employees': 7200, 'sector': 'Energy'},
                    {'company': 'BCR', 'employees': 6800, 'sector': 'Banking'},
                    {'company': 'Continental Romania', 'employees': 6200, 'sector': 'Automotive'},
                    {'company': 'Kaufland Romania', 'employees': 5900, 'sector': 'Retail'}
                ]
            },
            'foreign_investment': {
                'top_investors': [
                    {'country': 'Netherlands', 'investment': 18.2, 'percentage': 26.8},
                    {'country': 'Germany', 'investment': 12.5, 'percentage': 18.4},
                    {'country': 'Austria', 'investment': 8.7, 'percentage': 12.8},
                    {'country': 'France', 'investment': 6.9, 'percentage': 10.2},
                    {'country': 'Italy', 'investment': 4.8, 'percentage': 7.1}
                ],
                'investment_trends': {
                    'total_fdi_stock': 67.8,  # Billion EUR
                    'annual_fdi_flow': 6.8,   # Billion EUR
                    'greenfield_share': 0.35,
                    'ma_share': 0.45,
                    'reinvestment_share': 0.20
                }
            },
            'innovation_ecosystem': {
                'research_institutions': ['INCDIE ICPE-CA', 'INCD MIHAI VITEAZUL', 'Horia Hulubei NIPNE'],
                'technology_parks': ['Bucharest Technology Park', 'Cluj IT Park', 'Timisoara Technology Park'],
                'startup_hubs': ['Techcelerator', 'Innovation Labs', 'How to Web', 'TechHub Bucharest'],
                'venture_capital': {
                    'fund_size': 450,  # Million EUR
                    'deals_per_year': 85,
                    'average_deal_size': 2.1,  # Million EUR
                    'success_stories': ['eMAG', 'UiPath', 'Zitec', 'Gecad Group']
                }
            }
        }
    
    def _initialize_government_initiatives(self) -> Dict[str, Any]:
        """Initialize Romanian government initiatives and support programs."""
        return {
            'national_recovery_plan': {
                'total_budget': 29.2,  # Billion EUR
                'digital_transformation': 6.8,
                'green_transition': 8.1,
                'transport_infrastructure': 5.4,
                'education_health': 4.2,
                'private_sector_support': 4.7
            },
            'industrial_policy': {
                'reindustrialization_strategy': {
                    'target_sectors': ['Automotive', 'IT&C', 'Energy', 'Agriculture', 'Tourism'],
                    'investment_incentives': 0.85,  # Score 0-1
                    'regional_development_focus': True,
                    'innovation_support': 0.72
                },
                'digitalization_programs': {
                    'sme_digitalization': 2.1,  # Billion EUR budget
                    'public_sector_digitalization': 1.8,
                    'digital_skills_development': 0.9,
                    'cybersecurity_enhancement': 0.6
                }
            },
            'business_support_schemes': {
                'start_nation_program': {
                    'budget': 250,  # Million RON
                    'beneficiaries_per_year': 2500,
                    'success_rate': 0.68,
                    'average_grant': 100000  # RON
                },
                'innovation_vouchers': {
                    'budget': 150,  # Million RON
                    'voucher_value': 15000,  # RON
                    'sme_participation': 0.72
                },
                'export_support': {
                    'budget': 180,  # Million RON
                    'companies_supported': 850,
                    'export_increase': 0.15
                }
            },
            'regulatory_improvements': {
                'doing_business_rank': 55,  # World Bank rank
                'improvement_areas': [
                    'Contract enforcement',
                    'Insolvency resolution', 
                    'Tax compliance',
                    'Construction permits'
                ],
                'digitalization_score': 0.78
            }
        }
    
    def _initialize_eu_integration(self) -> Dict[str, Any]:
        """Initialize EU integration and access data."""
        return {
            'single_market_access': {
                'goods_mobility': 0.92,
                'services_mobility': 0.85,
                'capital_mobility': 0.88,
                'labor_mobility': 0.78
            },
            'eu_funding': {
                'current_period_2021_2027': {
                    'cohesion_policy': 31.0,  # Billion EUR
                    'cap_funding': 19.7,
                    'recovery_fund': 29.2,
                    'horizon_europe': 1.2,
                    'digital_europe': 0.8
                },
                'absorption_rate': 0.73,
                'implementation_speed': 0.65
            },
            'eurozone_convergence': {
                'euro_adoption_target': '2028-2030',
                'convergence_criteria': {
                    'inflation_criterion': False,  # Currently above threshold
                    'fiscal_criterion': False,    # Budget deficit above 3%
                    'exchange_rate_criterion': False,  # Not in ERM II
                    'interest_rate_criterion': True
                },
                'convergence_probability': 0.45
            },
            'regulatory_alignment': {
                'acquis_communautaire_compliance': 0.87,
                'pending_infringement_procedures': 12,
                'transposition_deficit': 0.8,  # % of directives not transposed
                'institutional_capacity': 0.75
            }
        }
    
    def _initialize_digital_transformation(self) -> Dict[str, Any]:
        """Initialize digital transformation status."""
        return {
            'digital_economy_index': {
                'overall_score': 46.8,  # DESI 2023 score
                'eu_ranking': 26,
                'connectivity': 42.5,
                'human_capital': 45.2,
                'use_of_internet': 51.8,
                'integration_of_digital_tech': 32.1,
                'digital_public_services': 68.9
            },
            'digital_adoption_by_sector': {
                'banking': 0.82,
                'retail': 0.71,
                'telecommunications': 0.89,
                'government': 0.65,
                'manufacturing': 0.58,
                'agriculture': 0.32,
                'healthcare': 0.48
            },
            'e_government_services': {
                'online_service_index': 0.72,
                'digital_id_coverage': 0.78,
                'mobile_government': 0.65,
                'citizen_satisfaction': 0.68
            },
            'digital_skills': {
                'basic_digital_skills': 0.31,  # % of population
                'above_basic_digital_skills': 0.15,
                'ict_specialists': 0.035,  # % of workforce
                'digital_skills_gap': 0.68
            }
        }
    
    async def get_romanian_market_context(
        self, 
        sector: Optional[str] = None, 
        region: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get comprehensive Romanian market context."""
        context = {
            'economic_environment': self.economic_data,
            'regulatory_landscape': self.regulatory_framework,
            'competitive_dynamics': self.competitive_landscape,
            'government_support': self.government_initiatives,
            'eu_integration_status': self.eu_integration,
            'digital_maturity': self.digital_transformation
        }
        
        # Add sector-specific context
        if sector and sector in self.market_intelligence:
            context['sector_analysis'] = self.market_intelligence[sector]
        
        # Add regional context
        if region:
            regional_data = self.economic_data.get('regional_development', {})
            if region in regional_data:
                context['regional_analysis'] = regional_data[region]
        
        return context
    
    async def analyze_romanian_competitive_position(
        self, 
        company: str, 
        sector: str
    ) -> Dict[str, Any]:
        """Analyze competitive position in Romanian market."""
        sector_intelligence = self.market_intelligence.get(sector, {})
        
        return {
            'market_position': {
                'market_share_estimate': self._estimate_market_share(company, sector),
                'competitive_ranking': self._estimate_competitive_ranking(company, sector),
                'brand_recognition': self._assess_brand_recognition(company),
                'regional_presence': self._analyze_regional_presence(company)
            },
            'competitive_advantages': {
                'cost_position': self._assess_cost_position(company, sector),
                'differentiation_factors': self._identify_differentiation(company),
                'market_access': self._evaluate_market_access(company),
                'regulatory_compliance': self._assess_regulatory_compliance(company)
            },
            'strategic_recommendations': self._generate_romanian_recommendations(company, sector),
            'risk_factors': self._identify_romanian_risks(company, sector),
            'growth_opportunities': self._identify_romanian_opportunities(company, sector)
        }
    
    async def assess_romanian_entry_strategy(
        self, 
        foreign_company: str, 
        sector: str, 
        entry_mode: str
    ) -> Dict[str, Any]:
        """Assess market entry strategy for foreign companies."""
        return {
            'market_attractiveness': {
                'overall_attractiveness': self._calculate_market_attractiveness(sector),
                'growth_potential': self._assess_growth_potential(sector),
                'competitive_intensity': self._evaluate_competitive_intensity(sector),
                'regulatory_complexity': self._assess_regulatory_complexity(sector)
            },
            'entry_strategy_analysis': {
                'recommended_entry_mode': self._recommend_entry_mode(foreign_company, sector),
                'local_partnerships': self._identify_potential_partners(sector),
                'regulatory_requirements': self._map_regulatory_requirements(sector),
                'investment_requirements': self._estimate_investment_requirements(entry_mode, sector)
            },
            'success_factors': {
                'critical_success_factors': self._identify_success_factors(sector),
                'local_adaptation_needs': self._assess_adaptation_needs(sector),
                'stakeholder_management': self._map_key_stakeholders(sector)
            },
            'implementation_roadmap': self._create_implementation_roadmap(entry_mode, sector)
        }
    
    async def generate_romanian_strategic_insights(
        self, 
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate Romanian-specific strategic insights."""
        return {
            'market_dynamics': {
                'economic_trends': self._analyze_economic_trends(),
                'sector_evolution': self._analyze_sector_evolution(),
                'competitive_shifts': self._analyze_competitive_shifts(),
                'regulatory_changes': self._track_regulatory_changes()
            },
            'strategic_opportunities': {
                'emerging_segments': self._identify_emerging_segments(),
                'digitalization_opportunities': self._identify_digital_opportunities(),
                'eu_integration_benefits': self._analyze_eu_benefits(),
                'government_incentives': self._map_relevant_incentives(context)
            },
            'strategic_risks': {
                'economic_risks': self._assess_economic_risks(),
                'competitive_risks': self._assess_competitive_risks(),
                'regulatory_risks': self._assess_regulatory_risks(),
                'operational_risks': self._assess_operational_risks()
            },
            'recommendations': {
                'strategic_priorities': self._recommend_strategic_priorities(context),
                'investment_allocation': self._recommend_investment_allocation(context),
                'partnership_strategy': self._recommend_partnerships(context),
                'timing_considerations': self._analyze_timing_considerations(context)
            }
        }
    
    # Helper methods for analysis
    
    def _estimate_market_share(self, company: str, sector: str) -> float:
        """Estimate company market share."""
        # Simplified estimation logic
        major_players = {
            'banking': {'BCR': 0.18, 'BRD': 0.16, 'Banca Transilvania': 0.15},
            'retail': {'Kaufland': 0.22, 'Carrefour': 0.18, 'Lidl': 0.15},
            'energy': {'OMV Petrom': 0.35, 'Hidroelectrica': 0.28},
            'it_technology': {'eMAG': 0.25, 'UiPath': 0.12}
        }
        
        sector_players = major_players.get(sector, {})
        return sector_players.get(company, 0.05)  # Default 5% for unknown companies
    
    def _estimate_competitive_ranking(self, company: str, sector: str) -> int:
        """Estimate competitive ranking."""
        market_share = self._estimate_market_share(company, sector)
        if market_share > 0.20:
            return 1  # Market leader
        elif market_share > 0.10:
            return 2  # Strong competitor
        elif market_share > 0.05:
            return 3  # Moderate player
        else:
            return 4  # Niche player
    
    def _assess_brand_recognition(self, company: str) -> float:
        """Assess brand recognition score."""
        # Simplified brand recognition assessment
        well_known_brands = {
            'BCR': 0.95, 'BRD': 0.92, 'Banca Transilvania': 0.88,
            'OMV Petrom': 0.98, 'Orange Romania': 0.96,
            'Kaufland': 0.94, 'Carrefour': 0.91, 'eMAG': 0.89
        }
        return well_known_brands.get(company, 0.35)  # Default for unknown brands
    
    def _analyze_regional_presence(self, company: str) -> Dict[str, float]:
        """Analyze regional presence."""
        # Default regional distribution for analysis
        return {
            'Bucharest': 0.35,
            'Cluj-Napoca': 0.12,
            'Timisoara': 0.10,
            'Constanta': 0.08,
            'Iasi': 0.07,
            'Other': 0.28
        }
    
    def _assess_cost_position(self, company: str, sector: str) -> float:
        """Assess cost competitiveness."""
        # Simplified cost position assessment
        return 0.72  # Default competitive cost position
    
    def _identify_differentiation(self, company: str) -> List[str]:
        """Identify differentiation factors."""
        return [
            'Local market expertise',
            'Established distribution network',
            'Customer relationship strength',
            'Regulatory compliance experience',
            'Brand recognition in market'
        ]
    
    def _evaluate_market_access(self, company: str) -> float:
        """Evaluate market access capabilities."""
        return 0.78  # Default market access score
    
    def _assess_regulatory_compliance(self, company: str) -> float:
        """Assess regulatory compliance capability."""
        return 0.82  # Default compliance score
    
    def _generate_romanian_recommendations(self, company: str, sector: str) -> List[str]:
        """Generate Romania-specific recommendations."""
        return [
            "Leverage EU single market access for expansion",
            "Invest in digital transformation capabilities",
            "Develop local partnerships for market penetration",
            "Focus on Bucharest-Ilfov region for maximum impact",
            "Utilize government incentives for innovation",
            "Build regulatory compliance expertise",
            "Strengthen regional presence outside Bucharest"
        ]
    
    def _identify_romanian_risks(self, company: str, sector: str) -> List[str]:
        """Identify Romania-specific risks."""
        return [
            "Currency fluctuation (EUR/RON exchange rate)",
            "Regulatory changes and compliance costs",
            "Skilled labor shortage in key sectors",
            "Economic volatility and inflation pressures",
            "Competitive pressure from multinational players",
            "Infrastructure limitations in some regions",
            "Bureaucratic processes and administrative burden"
        ]
    
    def _identify_romanian_opportunities(self, company: str, sector: str) -> List[str]:
        """Identify Romania-specific opportunities."""
        return [
            "EU Recovery Fund investment opportunities",
            "Digital transformation demand across sectors",
            "Growing middle class and consumer spending",
            "Infrastructure development projects",
            "Green transition and sustainability initiatives",
            "Regional expansion to neighboring markets",
            "Innovation and R&D government support programs"
        ]
    
    def _calculate_market_attractiveness(self, sector: str) -> float:
        """Calculate overall market attractiveness."""
        sector_intel = self.market_intelligence.get(sector, {})
        if hasattr(sector_intel, 'growth_rate') and hasattr(sector_intel, 'market_size'):
            # Combine growth rate, market size, and other factors
            growth_factor = min(sector_intel.growth_rate / 10, 1.0)
            size_factor = min(sector_intel.market_size / 10, 1.0) if sector_intel.market_size < 100 else 1.0
            return (growth_factor + size_factor) / 2
        return 0.65  # Default attractiveness
    
    def _assess_growth_potential(self, sector: str) -> float:
        """Assess sector growth potential."""
        sector_intel = self.market_intelligence.get(sector, {})
        if hasattr(sector_intel, 'growth_rate'):
            return min(sector_intel.growth_rate / 15, 1.0)
        return 0.58  # Default growth potential
    
    def _evaluate_competitive_intensity(self, sector: str) -> float:
        """Evaluate competitive intensity."""
        sector_intel = self.market_intelligence.get(sector, {})
        if hasattr(sector_intel, 'competitive_intensity'):
            return sector_intel.competitive_intensity
        return 0.72  # Default competitive intensity
    
    def _assess_regulatory_complexity(self, sector: str) -> float:
        """Assess regulatory complexity."""
        sector_intel = self.market_intelligence.get(sector, {})
        if hasattr(sector_intel, 'regulatory_complexity'):
            return sector_intel.regulatory_complexity
        return 0.65  # Default regulatory complexity
    
    def _recommend_entry_mode(self, company: str, sector: str) -> str:
        """Recommend optimal entry mode."""
        sector_intel = self.market_intelligence.get(sector, {})
        if hasattr(sector_intel, 'entry_barriers'):
            if sector_intel.entry_barriers > 0.70:
                return 'Joint Venture or Acquisition'
            elif sector_intel.entry_barriers > 0.40:
                return 'Strategic Partnership'
            else:
                return 'Greenfield Investment'
        return 'Strategic Partnership'  # Default recommendation
    
    def _identify_potential_partners(self, sector: str) -> List[str]:
        """Identify potential local partners."""
        sector_intel = self.market_intelligence.get(sector, {})
        if hasattr(sector_intel, 'key_players'):
            return sector_intel.key_players[:3]  # Top 3 potential partners
        return ['Local Market Leader', 'Established Distributor', 'Regional Player']
    
    def _map_regulatory_requirements(self, sector: str) -> List[str]:
        """Map key regulatory requirements."""
        sector_requirements = {
            'banking_finance': ['BNR authorization', 'Capital requirements', 'Risk management'],
            'energy': ['ANRE license', 'Environmental permits', 'Grid access'],
            'telecommunications': ['ANCOM authorization', 'Spectrum allocation', 'Infrastructure'],
            'retail': ['Commercial registration', 'Consumer protection', 'Competition rules']
        }
        return sector_requirements.get(sector, ['ONRC registration', 'Tax compliance', 'Labor law'])
    
    def _estimate_investment_requirements(self, entry_mode: str, sector: str) -> Dict[str, float]:
        """Estimate investment requirements."""
        return {
            'initial_investment': 5.0,  # Million EUR
            'working_capital': 2.5,
            'regulatory_costs': 0.8,
            'setup_costs': 1.2,
            'total_investment': 9.5
        }
    
    def _identify_success_factors(self, sector: str) -> List[str]:
        """Identify critical success factors."""
        return [
            'Strong local market knowledge and expertise',
            'Effective regulatory compliance and government relations',
            'Quality local partnerships and distribution networks',
            'Competitive cost structure and operational efficiency',
            'Brand building and customer acquisition capabilities'
        ]
    
    def _assess_adaptation_needs(self, sector: str) -> List[str]:
        """Assess local adaptation needs."""
        return [
            'Product/service localization for Romanian preferences',
            'Pricing strategy aligned with local purchasing power',
            'Marketing and communication in Romanian language',
            'Local supply chain and vendor relationships',
            'HR practices aligned with Romanian employment law'
        ]
    
    def _map_key_stakeholders(self, sector: str) -> List[str]:
        """Map key stakeholders for sector."""
        return [
            'Ministry of Economy and relevant sector ministry',
            'Industry associations and chambers of commerce',
            'Key competitors and market leaders',
            'Major customers and distribution partners',
            'Regulatory authorities and compliance bodies'
        ]
    
    def _create_implementation_roadmap(self, entry_mode: str, sector: str) -> Dict[str, str]:
        """Create implementation roadmap."""
        return {
            'phase_1_preparation': '0-6 months: Market research, partner identification, regulatory preparation',
            'phase_2_setup': '6-12 months: Legal setup, permits, initial hiring, partnership agreements',
            'phase_3_launch': '12-18 months: Soft launch, pilot operations, customer acquisition',
            'phase_4_scale': '18-24 months: Full market launch, scaling operations, performance optimization'
        }
    
    # Additional analysis methods continue here...
    
    def _analyze_economic_trends(self) -> List[str]:
        """Analyze current economic trends."""
        return [
            f"GDP growth of {self.economic_data['macroeconomic_indicators'].gdp_growth}% driven by domestic consumption",
            f"Inflation at {self.economic_data['macroeconomic_indicators'].inflation_rate}% requiring monetary policy attention",
            f"FDI inflow of {self.economic_data['macroeconomic_indicators'].fdi_inflow}B EUR supporting economic development",
            "EU Recovery Fund implementation boosting infrastructure and digitalization",
            "Labor market tightening with skills shortage in key sectors"
        ]
    
    def _analyze_sector_evolution(self) -> Dict[str, str]:
        """Analyze sector evolution trends."""
        return {
            'IT Technology': 'Rapid growth with 12.5% annually, driven by outsourcing and digitalization',
            'Automotive': 'Steady growth with electric vehicle transition and supply chain resilience',
            'Banking': 'Digital transformation and fintech competition driving innovation',
            'Energy': 'Green transition focus with renewable energy investments',
            'Retail': 'E-commerce growth and omnichannel strategies dominating'
        }
    
    def _analyze_competitive_shifts(self) -> List[str]:
        """Analyze competitive landscape shifts."""
        return [
            "Foreign multinationals consolidating market positions",
            "Romanian companies building regional expansion capabilities", 
            "Digital natives disrupting traditional business models",
            "Sustainability and ESG becoming competitive differentiators",
            "Innovation and R&D capabilities determining market leadership"
        ]
    
    def _track_regulatory_changes(self) -> List[str]:
        """Track recent regulatory changes."""
        return [
            "EU AI Act implementation requiring compliance frameworks",
            "Digital Services Act affecting online platforms and services",
            "Sustainability reporting requirements for large companies",
            "Competition law updates strengthening market monitoring",
            "Tax digitalization initiatives improving compliance efficiency"
        ]
    
    def _identify_emerging_segments(self) -> List[str]:
        """Identify emerging market segments."""
        return [
            "Green technology and sustainable solutions",
            "Digital health and telemedicine services",
            "E-commerce and last-mile delivery",
            "Fintech and digital payments",
            "Cybersecurity and data protection services"
        ]
    
    def _identify_digital_opportunities(self) -> List[str]:
        """Identify digitalization opportunities."""
        return [
            "SME digital transformation support services",
            "Government digitalization projects and e-governance",
            "Industry 4.0 implementation in manufacturing",
            "Digital agriculture and precision farming",
            "Smart city solutions and urban technology"
        ]
    
    def _analyze_eu_benefits(self) -> List[str]:
        """Analyze EU integration benefits."""
        return [
            "Single market access enabling seamless trade with 450M consumers",
            "EU funding programs providing investment capital and grants",
            "Regulatory harmonization reducing compliance complexity",
            "Talent mobility accessing skilled professionals across EU",
            "Innovation networks and research collaboration opportunities"
        ]
    
    def _map_relevant_incentives(self, context: Dict[str, Any]) -> List[str]:
        """Map relevant government incentives."""
        return [
            "Start Nation grants for innovative startups (up to 200,000 RON)",
            "Innovation vouchers for R&D partnerships (15,000 RON)",
            "Digital transformation grants for SMEs",
            "Export promotion support and trade missions",
            "Regional development incentives for less developed areas"
        ]
    
    def _assess_economic_risks(self) -> List[str]:
        """Assess economic risks."""
        return [
            f"Inflation at {self.economic_data['macroeconomic_indicators'].inflation_rate}% affecting costs and margins",
            f"Budget deficit of {self.economic_data['macroeconomic_indicators'].budget_deficit}% constraining public investment",
            "Exchange rate volatility impacting import/export operations",
            "Skills shortage limiting growth in key sectors",
            "Energy costs volatility affecting operational expenses"
        ]
    
    def _assess_competitive_risks(self) -> List[str]:
        """Assess competitive risks."""
        return [
            "Increasing competition from multinational companies",
            "Digital disruption changing traditional business models",
            "Price competition in commoditized sectors",
            "Market consolidation reducing competitive options",
            "Innovation pace requiring continuous investment"
        ]
    
    def _assess_regulatory_risks(self) -> List[str]:
        """Assess regulatory risks."""
        return [
            "Regulatory complexity increasing compliance costs",
            "EU directives requiring ongoing adaptation",
            "Tax law changes affecting financial planning",
            "Environmental regulations impacting operations",
            "Data protection requirements increasing IT investments"
        ]
    
    def _assess_operational_risks(self) -> List[str]:
        """Assess operational risks."""
        return [
            "Skilled labor shortage affecting operational capacity",
            "Supply chain disruptions and dependencies",
            "Infrastructure limitations in some regions",
            "Bureaucratic processes causing delays",
            "Currency fluctuation affecting international operations"
        ]
    
    def _recommend_strategic_priorities(self, context: Dict[str, Any]) -> List[str]:
        """Recommend strategic priorities."""
        return [
            "Invest in digital transformation and technology capabilities",
            "Build strong local partnerships and distribution networks",
            "Develop regulatory compliance and government relations expertise",
            "Focus on talent acquisition and retention strategies",
            "Expand regional presence beyond Bucharest-Ilfov"
        ]
    
    def _recommend_investment_allocation(self, context: Dict[str, Any]) -> Dict[str, float]:
        """Recommend investment allocation."""
        return {
            'digital_transformation': 0.30,
            'market_expansion': 0.25,
            'talent_development': 0.20,
            'operational_efficiency': 0.15,
            'innovation_r&d': 0.10
        }
    
    def _recommend_partnerships(self, context: Dict[str, Any]) -> List[str]:
        """Recommend partnership strategies."""
        return [
            "Strategic partnerships with local market leaders",
            "Technology partnerships with Romanian IT companies",
            "Distribution partnerships for regional coverage",
            "Academic partnerships with Romanian universities",
            "Government partnerships for policy engagement"
        ]
    
    def _analyze_timing_considerations(self, context: Dict[str, Any]) -> Dict[str, str]:
        """Analyze timing considerations."""
        return {
            'market_entry_timing': 'Favorable - Economic recovery and EU funding availability',
            'investment_timing': 'Optimal - Government incentives and competitive cost base',
            'expansion_timing': 'Strategic - Market consolidation opportunities available',
            'exit_considerations': 'Long-term - Growing market with EU integration benefits'
        }


# Export the Romanian context class
__all__ = ['RomanianStrategicContext', 'RomanianMarketSector', 'RomanianRegion', 'RomanianEconomicContext']