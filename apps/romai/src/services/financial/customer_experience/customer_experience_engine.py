"""
RomAI Phase 4.2: BancAI Financial Intelligence - Customer Experience Engine
Personalized financial advice, investment recommendations, and financial education.

This module implements comprehensive customer experience capabilities including:
- Personalized financial advice and recommendations
- Investment recommendation engine with risk profiling
- Financial education tools and interactive learning
- Customer onboarding and KYC automation
- Portfolio management and tracking

Author: RomAI Development Team
Created: August 2025
License: Proprietary
"""

import asyncio
import logging
import sqlite3
import json
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass, asdict
from enum import Enum
import uuid
import math


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CustomerSegment(Enum):
    """Customer segmentation types."""
    RETAIL = "retail"
    PREMIUM = "premium"
    PRIVATE_BANKING = "private_banking"
    CORPORATE = "corporate"
    SME = "sme"
    INSTITUTIONAL = "institutional"


class RiskProfile(Enum):
    """Customer risk profiles."""
    CONSERVATIVE = "conservative"
    MODERATE_CONSERVATIVE = "moderate_conservative"
    MODERATE = "moderate"
    MODERATE_AGGRESSIVE = "moderate_aggressive"
    AGGRESSIVE = "aggressive"


class InvestmentGoal(Enum):
    """Investment goals."""
    WEALTH_PRESERVATION = "wealth_preservation"
    INCOME_GENERATION = "income_generation"
    CAPITAL_GROWTH = "capital_growth"
    RETIREMENT_PLANNING = "retirement_planning"
    EDUCATION_FUNDING = "education_funding"
    HOME_PURCHASE = "home_purchase"
    EMERGENCY_FUND = "emergency_fund"


class EducationLevel(Enum):
    """Financial education levels."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


@dataclass
class CustomerProfile:
    """Customer profile structure."""
    customer_id: str
    segment: CustomerSegment
    risk_profile: RiskProfile
    investment_goals: List[InvestmentGoal]
    financial_situation: Dict[str, Any]
    preferences: Dict[str, Any]
    education_level: EducationLevel
    created_date: datetime
    last_updated: datetime


@dataclass
class FinancialAdvice:
    """Financial advice structure."""
    advice_id: str
    customer_id: str
    advice_type: str
    recommendations: List[str]
    rationale: str
    priority: str
    estimated_impact: Dict[str, float]
    generated_date: datetime
    expires_date: Optional[datetime] = None


@dataclass
class InvestmentRecommendation:
    """Investment recommendation structure."""
    recommendation_id: str
    customer_id: str
    asset_class: str
    specific_instruments: List[str]
    allocation_percentage: float
    expected_return: float
    risk_level: RiskProfile
    time_horizon: str
    rationale: str
    generated_date: datetime


@dataclass
class EducationModule:
    """Financial education module structure."""
    module_id: str
    title: str
    description: str
    difficulty_level: EducationLevel
    topics: List[str]
    content: Dict[str, Any]
    duration_minutes: int
    completion_rate: float


class PersonalizedFinancialAdvisor:
    """AI-powered personalized financial advisory system."""
    
    def __init__(self):
        self.customer_profiles = {}
        self.advice_cache = {}
        self.recommendation_models = {}
        
    async def generate_financial_advice(self, customer_id: str) -> List[FinancialAdvice]:
        """Generate personalized financial advice."""
        try:
            logger.info(f"Generating financial advice for customer {customer_id}")
            
            # Get customer profile
            profile = await self._get_customer_profile(customer_id)
            if not profile:
                raise ValueError(f"Customer profile not found: {customer_id}")
                
            # Analyze financial situation
            analysis = await self._analyze_financial_situation(profile)
            
            # Generate advice recommendations
            advice_items = []
            
            # Budget optimization advice
            budget_advice = await self._generate_budget_advice(profile, analysis)
            if budget_advice:
                advice_items.append(budget_advice)
                
            # Debt management advice
            debt_advice = await self._generate_debt_advice(profile, analysis)
            if debt_advice:
                advice_items.append(debt_advice)
                
            # Savings advice
            savings_advice = await self._generate_savings_advice(profile, analysis)
            if savings_advice:
                advice_items.append(savings_advice)
                
            # Investment advice
            investment_advice = await self._generate_investment_advice(profile, analysis)
            if investment_advice:
                advice_items.append(investment_advice)
                
            # Insurance advice
            insurance_advice = await self._generate_insurance_advice(profile, analysis)
            if insurance_advice:
                advice_items.append(insurance_advice)
                
            logger.info(f"Generated {len(advice_items)} financial advice items")
            return advice_items
            
        except Exception as e:
            logger.error(f"Error generating financial advice: {e}")
            raise
            
    async def _get_customer_profile(self, customer_id: str) -> Optional[CustomerProfile]:
        """Get customer profile."""
        try:
            # In production, this would fetch from database
            # For demo, create a sample profile
            return CustomerProfile(
                customer_id=customer_id,
                segment=CustomerSegment.RETAIL,
                risk_profile=RiskProfile.MODERATE,
                investment_goals=[InvestmentGoal.CAPITAL_GROWTH, InvestmentGoal.RETIREMENT_PLANNING],
                financial_situation={
                    "monthly_income": 5000,
                    "monthly_expenses": 3500,
                    "total_assets": 50000,
                    "total_debt": 15000,
                    "emergency_fund": 8000,
                    "investment_portfolio": 25000
                },
                preferences={
                    "communication_frequency": "monthly",
                    "risk_tolerance": "moderate",
                    "investment_style": "diversified"
                },
                education_level=EducationLevel.INTERMEDIATE,
                created_date=datetime.now() - timedelta(days=365),
                last_updated=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error getting customer profile: {e}")
            return None
            
    async def _analyze_financial_situation(self, profile: CustomerProfile) -> Dict[str, Any]:
        """Analyze customer's financial situation."""
        try:
            situation = profile.financial_situation
            
            # Calculate key financial ratios
            monthly_income = situation.get("monthly_income", 0)
            monthly_expenses = situation.get("monthly_expenses", 0)
            total_assets = situation.get("total_assets", 0)
            total_debt = situation.get("total_debt", 0)
            emergency_fund = situation.get("emergency_fund", 0)
            
            # Savings rate
            savings_rate = (monthly_income - monthly_expenses) / monthly_income if monthly_income > 0 else 0
            
            # Debt-to-income ratio
            debt_to_income = (total_debt / (monthly_income * 12)) if monthly_income > 0 else 0
            
            # Emergency fund ratio (months of expenses covered)
            emergency_ratio = emergency_fund / monthly_expenses if monthly_expenses > 0 else 0
            
            # Net worth
            net_worth = total_assets - total_debt
            
            analysis = {
                "savings_rate": savings_rate,
                "debt_to_income_ratio": debt_to_income,
                "emergency_fund_months": emergency_ratio,
                "net_worth": net_worth,
                "financial_health_score": self._calculate_financial_health_score(
                    savings_rate, debt_to_income, emergency_ratio
                ),
                "strengths": [],
                "concerns": [],
                "opportunities": []
            }
            
            # Identify strengths and concerns
            if savings_rate > 0.2:
                analysis["strengths"].append("Excellent savings rate")
            elif savings_rate < 0.1:
                analysis["concerns"].append("Low savings rate")
                
            if debt_to_income > 0.4:
                analysis["concerns"].append("High debt-to-income ratio")
            elif debt_to_income < 0.2:
                analysis["strengths"].append("Low debt burden")
                
            if emergency_ratio < 3:
                analysis["concerns"].append("Insufficient emergency fund")
            elif emergency_ratio > 6:
                analysis["opportunities"].append("Excess emergency fund - consider investing")
                
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing financial situation: {e}")
            return {}
            
    def _calculate_financial_health_score(self, savings_rate: float, debt_to_income: float, 
                                        emergency_ratio: float) -> float:
        """Calculate overall financial health score."""
        try:
            score = 0.0
            
            # Savings rate component (30%)
            if savings_rate > 0.2:
                score += 30
            elif savings_rate > 0.15:
                score += 25
            elif savings_rate > 0.1:
                score += 20
            elif savings_rate > 0.05:
                score += 15
            else:
                score += 5
                
            # Debt-to-income component (40%)
            if debt_to_income < 0.2:
                score += 40
            elif debt_to_income < 0.3:
                score += 30
            elif debt_to_income < 0.4:
                score += 20
            elif debt_to_income < 0.5:
                score += 10
            else:
                score += 0
                
            # Emergency fund component (30%)
            if emergency_ratio >= 6:
                score += 30
            elif emergency_ratio >= 3:
                score += 25
            elif emergency_ratio >= 1:
                score += 15
            elif emergency_ratio >= 0.5:
                score += 10
            else:
                score += 0
                
            return min(score, 100)
            
        except Exception as e:
            logger.error(f"Error calculating financial health score: {e}")
            return 50.0
            
    async def _generate_budget_advice(self, profile: CustomerProfile, analysis: Dict) -> Optional[FinancialAdvice]:
        """Generate budget optimization advice."""
        try:
            recommendations = []
            rationale_parts = []
            
            savings_rate = analysis.get("savings_rate", 0)
            
            if savings_rate < 0.1:
                recommendations.append("Review and optimize monthly expenses to increase savings rate")
                recommendations.append("Consider the 50/30/20 budgeting rule (needs/wants/savings)")
                rationale_parts.append(f"Current savings rate of {savings_rate:.1%} is below recommended 10-20%")
                
            if savings_rate > 0.3:
                recommendations.append("Excellent savings rate - consider increasing investment allocation")
                rationale_parts.append(f"Outstanding savings rate of {savings_rate:.1%} provides investment opportunities")
                
            if not recommendations:
                return None
                
            return FinancialAdvice(
                advice_id=str(uuid.uuid4()),
                customer_id=profile.customer_id,
                advice_type="budget_optimization",
                recommendations=recommendations,
                rationale=" ".join(rationale_parts),
                priority="high" if savings_rate < 0.05 else "medium",
                estimated_impact={"monthly_savings_increase": 200 if savings_rate < 0.1 else 0},
                generated_date=datetime.now(),
                expires_date=datetime.now() + timedelta(days=90)
            )
            
        except Exception as e:
            logger.error(f"Error generating budget advice: {e}")
            return None
            
    async def _generate_debt_advice(self, profile: CustomerProfile, analysis: Dict) -> Optional[FinancialAdvice]:
        """Generate debt management advice."""
        try:
            recommendations = []
            rationale_parts = []
            
            debt_to_income = analysis.get("debt_to_income_ratio", 0)
            
            if debt_to_income > 0.4:
                recommendations.append("Prioritize debt reduction - consider debt consolidation")
                recommendations.append("Use debt avalanche method (pay highest interest rate first)")
                rationale_parts.append(f"Debt-to-income ratio of {debt_to_income:.1%} exceeds recommended 30%")
                
            if debt_to_income > 0.5:
                recommendations.append("Consider professional debt counseling")
                recommendations.append("Evaluate debt restructuring options")
                
            if debt_to_income < 0.2:
                recommendations.append("Excellent debt management - maintain current approach")
                rationale_parts.append(f"Low debt-to-income ratio of {debt_to_income:.1%} indicates good debt management")
                
            if not recommendations:
                return None
                
            return FinancialAdvice(
                advice_id=str(uuid.uuid4()),
                customer_id=profile.customer_id,
                advice_type="debt_management",
                recommendations=recommendations,
                rationale=" ".join(rationale_parts),
                priority="critical" if debt_to_income > 0.5 else "high" if debt_to_income > 0.4 else "low",
                estimated_impact={
                    "monthly_debt_payment_reduction": 150 if debt_to_income > 0.4 else 0,
                    "interest_savings_annual": 1200 if debt_to_income > 0.4 else 0
                },
                generated_date=datetime.now(),
                expires_date=datetime.now() + timedelta(days=60)
            )
            
        except Exception as e:
            logger.error(f"Error generating debt advice: {e}")
            return None
            
    async def _generate_savings_advice(self, profile: CustomerProfile, analysis: Dict) -> Optional[FinancialAdvice]:
        """Generate savings optimization advice."""
        try:
            recommendations = []
            rationale_parts = []
            
            emergency_months = analysis.get("emergency_fund_months", 0)
            
            if emergency_months < 3:
                recommendations.append("Build emergency fund to cover 3-6 months of expenses")
                recommendations.append("Consider high-yield savings account for emergency fund")
                rationale_parts.append(f"Emergency fund covers only {emergency_months:.1f} months of expenses")
                
            if emergency_months > 6:
                recommendations.append("Consider investing excess emergency fund for better returns")
                recommendations.append("Maintain 3-6 months in emergency fund, invest the rest")
                rationale_parts.append(f"Emergency fund of {emergency_months:.1f} months exceeds recommended 6 months")
                
            # Add general savings advice
            if profile.segment == CustomerSegment.RETAIL:
                recommendations.append("Automate savings transfers to build consistent saving habits")
                recommendations.append("Consider tax-advantaged savings accounts")
                
            if not recommendations:
                return None
                
            return FinancialAdvice(
                advice_id=str(uuid.uuid4()),
                customer_id=profile.customer_id,
                advice_type="savings_optimization",
                recommendations=recommendations,
                rationale=" ".join(rationale_parts),
                priority="high" if emergency_months < 3 else "medium",
                estimated_impact={
                    "emergency_fund_target": profile.financial_situation.get("monthly_expenses", 0) * 6,
                    "monthly_savings_needed": max(0, (profile.financial_situation.get("monthly_expenses", 0) * 3 - 
                                                     profile.financial_situation.get("emergency_fund", 0)) / 12)
                },
                generated_date=datetime.now(),
                expires_date=datetime.now() + timedelta(days=120)
            )
            
        except Exception as e:
            logger.error(f"Error generating savings advice: {e}")
            return None
            
    async def _generate_investment_advice(self, profile: CustomerProfile, analysis: Dict) -> Optional[FinancialAdvice]:
        """Generate investment advice."""
        try:
            recommendations = []
            rationale_parts = []
            
            # Check if ready for investing
            emergency_months = analysis.get("emergency_fund_months", 0)
            debt_to_income = analysis.get("debt_to_income_ratio", 0)
            
            if emergency_months < 3 or debt_to_income > 0.4:
                recommendations.append("Focus on emergency fund and debt reduction before investing")
                rationale_parts.append("Build financial foundation before investing")
            else:
                # Investment recommendations based on risk profile and goals
                if profile.risk_profile == RiskProfile.CONSERVATIVE:
                    recommendations.append("Consider low-risk investments like government bonds and CDs")
                    recommendations.append("Diversify with stable dividend-paying stocks")
                elif profile.risk_profile == RiskProfile.MODERATE:
                    recommendations.append("Build diversified portfolio with 60% stocks, 40% bonds")
                    recommendations.append("Consider low-cost index funds for broad market exposure")
                elif profile.risk_profile == RiskProfile.AGGRESSIVE:
                    recommendations.append("Focus on growth stocks and emerging market investments")
                    recommendations.append("Consider higher allocation to equities (80-90%)")
                    
                # Goal-specific advice
                if InvestmentGoal.RETIREMENT_PLANNING in profile.investment_goals:
                    recommendations.append("Maximize retirement account contributions for tax benefits")
                    
                rationale_parts.append(f"Strong financial foundation enables investment focus")
                
            if not recommendations:
                return None
                
            return FinancialAdvice(
                advice_id=str(uuid.uuid4()),
                customer_id=profile.customer_id,
                advice_type="investment_strategy",
                recommendations=recommendations,
                rationale=" ".join(rationale_parts),
                priority="medium",
                estimated_impact={
                    "potential_annual_return": 0.07 if emergency_months >= 3 and debt_to_income <= 0.4 else 0,
                    "recommended_monthly_investment": profile.financial_situation.get("monthly_income", 0) * 0.1
                },
                generated_date=datetime.now(),
                expires_date=datetime.now() + timedelta(days=180)
            )
            
        except Exception as e:
            logger.error(f"Error generating investment advice: {e}")
            return None
            
    async def _generate_insurance_advice(self, profile: CustomerProfile, analysis: Dict) -> Optional[FinancialAdvice]:
        """Generate insurance advice."""
        try:
            recommendations = []
            rationale_parts = []
            
            # Basic insurance recommendations
            recommendations.append("Ensure adequate health insurance coverage")
            recommendations.append("Consider life insurance if you have dependents")
            
            # Income-based recommendations
            monthly_income = profile.financial_situation.get("monthly_income", 0)
            if monthly_income > 3000:
                recommendations.append("Consider disability insurance to protect income")
                
            # Asset-based recommendations
            total_assets = profile.financial_situation.get("total_assets", 0)
            if total_assets > 100000:
                recommendations.append("Review property and casualty insurance coverage")
                recommendations.append("Consider umbrella insurance policy")
                
            rationale_parts.append("Insurance provides financial protection against unexpected events")
            
            return FinancialAdvice(
                advice_id=str(uuid.uuid4()),
                customer_id=profile.customer_id,
                advice_type="insurance_planning",
                recommendations=recommendations,
                rationale=" ".join(rationale_parts),
                priority="medium",
                estimated_impact={
                    "financial_protection_value": monthly_income * 12 * 10,  # 10x annual income
                    "monthly_premium_estimate": monthly_income * 0.05  # 5% of income
                },
                generated_date=datetime.now(),
                expires_date=datetime.now() + timedelta(days=365)
            )
            
        except Exception as e:
            logger.error(f"Error generating insurance advice: {e}")
            return None


class InvestmentRecommendationEngine:
    """Advanced investment recommendation system."""
    
    def __init__(self):
        self.asset_models = {}
        self.recommendation_cache = {}
        
    async def generate_investment_recommendations(self, customer_id: str) -> List[InvestmentRecommendation]:
        """Generate personalized investment recommendations."""
        try:
            logger.info(f"Generating investment recommendations for customer {customer_id}")
            
            # Get customer profile
            profile = await self._get_customer_profile(customer_id)
            if not profile:
                raise ValueError(f"Customer profile not found: {customer_id}")
                
            recommendations = []
            
            # Asset allocation based on risk profile
            allocations = self._get_asset_allocation(profile.risk_profile)
            
            # Generate recommendations for each asset class
            for asset_class, allocation in allocations.items():
                if allocation > 0:
                    recommendation = await self._create_asset_recommendation(
                        profile, asset_class, allocation
                    )
                    if recommendation:
                        recommendations.append(recommendation)
                        
            logger.info(f"Generated {len(recommendations)} investment recommendations")
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating investment recommendations: {e}")
            raise
            
    def _get_asset_allocation(self, risk_profile: RiskProfile) -> Dict[str, float]:
        """Get recommended asset allocation based on risk profile."""
        try:
            allocations = {
                RiskProfile.CONSERVATIVE: {
                    "bonds": 0.7,
                    "stocks": 0.2,
                    "cash": 0.1
                },
                RiskProfile.MODERATE_CONSERVATIVE: {
                    "bonds": 0.5,
                    "stocks": 0.4,
                    "cash": 0.1
                },
                RiskProfile.MODERATE: {
                    "bonds": 0.4,
                    "stocks": 0.6,
                    "cash": 0.0
                },
                RiskProfile.MODERATE_AGGRESSIVE: {
                    "bonds": 0.2,
                    "stocks": 0.7,
                    "alternatives": 0.1
                },
                RiskProfile.AGGRESSIVE: {
                    "bonds": 0.1,
                    "stocks": 0.8,
                    "alternatives": 0.1
                }
            }
            
            return allocations.get(risk_profile, allocations[RiskProfile.MODERATE])
            
        except Exception as e:
            logger.error(f"Error getting asset allocation: {e}")
            return {"stocks": 0.6, "bonds": 0.4}
            
    async def _create_asset_recommendation(self, profile: CustomerProfile, 
                                         asset_class: str, allocation: float) -> Optional[InvestmentRecommendation]:
        """Create recommendation for specific asset class."""
        try:
            # Get specific instruments for asset class
            instruments = self._get_recommended_instruments(asset_class, profile)
            
            # Calculate expected returns
            expected_return = self._estimate_expected_return(asset_class, profile.risk_profile)
            
            # Determine time horizon
            time_horizon = self._determine_time_horizon(profile.investment_goals)
            
            # Generate rationale
            rationale = self._generate_investment_rationale(asset_class, allocation, profile)
            
            return InvestmentRecommendation(
                recommendation_id=str(uuid.uuid4()),
                customer_id=profile.customer_id,
                asset_class=asset_class,
                specific_instruments=instruments,
                allocation_percentage=allocation,
                expected_return=expected_return,
                risk_level=profile.risk_profile,
                time_horizon=time_horizon,
                rationale=rationale,
                generated_date=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error creating asset recommendation: {e}")
            return None
            
    def _get_recommended_instruments(self, asset_class: str, profile: CustomerProfile) -> List[str]:
        """Get specific investment instruments for asset class."""
        try:
            instruments_map = {
                "stocks": [
                    "S&P 500 Index Fund",
                    "Total Stock Market Index",
                    "European Stock Index",
                    "Emerging Markets Fund"
                ],
                "bonds": [
                    "Total Bond Market Index",
                    "Government Bond Fund",
                    "Corporate Bond Fund",
                    "International Bond Fund"
                ],
                "cash": [
                    "High-Yield Savings Account",
                    "Money Market Fund",
                    "Treasury Bills"
                ],
                "alternatives": [
                    "REIT Index Fund",
                    "Commodity Fund",
                    "Gold ETF"
                ]
            }
            
            base_instruments = instruments_map.get(asset_class, [])
            
            # Customize based on customer segment
            if profile.segment == CustomerSegment.PREMIUM:
                if asset_class == "alternatives":
                    base_instruments.extend(["Private Equity Fund", "Hedge Fund"])
                    
            return base_instruments[:3]  # Limit to top 3 recommendations
            
        except Exception as e:
            logger.error(f"Error getting recommended instruments: {e}")
            return []
            
    def _estimate_expected_return(self, asset_class: str, risk_profile: RiskProfile) -> float:
        """Estimate expected annual return for asset class."""
        try:
            base_returns = {
                "stocks": 0.10,
                "bonds": 0.04,
                "cash": 0.02,
                "alternatives": 0.08
            }
            
            # Adjust for risk profile
            risk_adjustments = {
                RiskProfile.CONSERVATIVE: -0.02,
                RiskProfile.MODERATE_CONSERVATIVE: -0.01,
                RiskProfile.MODERATE: 0.0,
                RiskProfile.MODERATE_AGGRESSIVE: 0.01,
                RiskProfile.AGGRESSIVE: 0.02
            }
            
            base_return = base_returns.get(asset_class, 0.06)
            adjustment = risk_adjustments.get(risk_profile, 0.0)
            
            return base_return + adjustment
            
        except Exception as e:
            logger.error(f"Error estimating expected return: {e}")
            return 0.06
            
    def _determine_time_horizon(self, investment_goals: List[InvestmentGoal]) -> str:
        """Determine investment time horizon based on goals."""
        try:
            if InvestmentGoal.RETIREMENT_PLANNING in investment_goals:
                return "long_term"
            elif InvestmentGoal.HOME_PURCHASE in investment_goals:
                return "medium_term"
            elif InvestmentGoal.EMERGENCY_FUND in investment_goals:
                return "short_term"
            else:
                return "medium_term"
                
        except Exception as e:
            logger.error(f"Error determining time horizon: {e}")
            return "medium_term"
            
    def _generate_investment_rationale(self, asset_class: str, allocation: float, 
                                     profile: CustomerProfile) -> str:
        """Generate rationale for investment recommendation."""
        try:
            rationale_parts = []
            
            rationale_parts.append(f"{allocation:.0%} allocation to {asset_class}")
            
            if asset_class == "stocks":
                rationale_parts.append("for long-term growth potential")
            elif asset_class == "bonds":
                rationale_parts.append("for income generation and portfolio stability")
            elif asset_class == "cash":
                rationale_parts.append("for liquidity and capital preservation")
            elif asset_class == "alternatives":
                rationale_parts.append("for diversification and inflation protection")
                
            rationale_parts.append(f"aligns with {profile.risk_profile.value} risk profile")
            
            return " ".join(rationale_parts)
            
        except Exception as e:
            logger.error(f"Error generating investment rationale: {e}")
            return f"Recommended {allocation:.0%} allocation to {asset_class}"
            
    async def _get_customer_profile(self, customer_id: str) -> Optional[CustomerProfile]:
        """Get customer profile (reuse from PersonalizedFinancialAdvisor)."""
        # Same implementation as in PersonalizedFinancialAdvisor
        return CustomerProfile(
            customer_id=customer_id,
            segment=CustomerSegment.RETAIL,
            risk_profile=RiskProfile.MODERATE,
            investment_goals=[InvestmentGoal.CAPITAL_GROWTH, InvestmentGoal.RETIREMENT_PLANNING],
            financial_situation={
                "monthly_income": 5000,
                "monthly_expenses": 3500,
                "total_assets": 50000,
                "total_debt": 15000,
                "emergency_fund": 8000,
                "investment_portfolio": 25000
            },
            preferences={
                "communication_frequency": "monthly",
                "risk_tolerance": "moderate",
                "investment_style": "diversified"
            },
            education_level=EducationLevel.INTERMEDIATE,
            created_date=datetime.now() - timedelta(days=365),
            last_updated=datetime.now()
        )


class FinancialEducationPlatform:
    """Interactive financial education and learning platform."""
    
    def __init__(self):
        self.education_modules = {}
        self.user_progress = {}
        self._load_education_content()
        
    def _load_education_content(self):
        """Load financial education content."""
        try:
            # Basic modules
            self.education_modules["budgeting_basics"] = EducationModule(
                module_id="budgeting_basics",
                title="Budgeting Fundamentals",
                description="Learn the basics of creating and managing a personal budget",
                difficulty_level=EducationLevel.BEGINNER,
                topics=["income tracking", "expense categorization", "50/30/20 rule", "budget tools"],
                content={
                    "lessons": [
                        {"title": "Understanding Income and Expenses", "duration": 10},
                        {"title": "The 50/30/20 Budgeting Rule", "duration": 15},
                        {"title": "Tracking Your Spending", "duration": 12},
                        {"title": "Budget Tools and Apps", "duration": 8}
                    ],
                    "exercises": [
                        {"title": "Create Your First Budget", "type": "interactive"},
                        {"title": "Expense Tracking Challenge", "type": "practical"}
                    ]
                },
                duration_minutes=45,
                completion_rate=0.0
            )
            
            self.education_modules["investment_fundamentals"] = EducationModule(
                module_id="investment_fundamentals",
                title="Investment Basics",
                description="Introduction to investing concepts and strategies",
                difficulty_level=EducationLevel.INTERMEDIATE,
                topics=["risk and return", "asset classes", "diversification", "compound interest"],
                content={
                    "lessons": [
                        {"title": "Risk and Return Relationship", "duration": 20},
                        {"title": "Understanding Asset Classes", "duration": 25},
                        {"title": "The Power of Diversification", "duration": 18},
                        {"title": "Compound Interest Magic", "duration": 15}
                    ],
                    "exercises": [
                        {"title": "Risk Assessment Quiz", "type": "quiz"},
                        {"title": "Portfolio Building Simulation", "type": "simulation"}
                    ]
                },
                duration_minutes=78,
                completion_rate=0.0
            )
            
            logger.info(f"Loaded {len(self.education_modules)} education modules")
            
        except Exception as e:
            logger.error(f"Error loading education content: {e}")
            
    async def get_personalized_learning_path(self, customer_id: str) -> List[EducationModule]:
        """Get personalized learning path for customer."""
        try:
            logger.info(f"Creating personalized learning path for customer {customer_id}")
            
            # Get customer profile to determine education level and needs
            # For demo, assume intermediate level
            education_level = EducationLevel.INTERMEDIATE
            
            # Filter modules by appropriate difficulty level
            suitable_modules = []
            for module in self.education_modules.values():
                if module.difficulty_level == education_level or \
                   (education_level == EducationLevel.INTERMEDIATE and 
                    module.difficulty_level == EducationLevel.BEGINNER):
                    suitable_modules.append(module)
                    
            # Sort by recommended order
            learning_path = sorted(suitable_modules, key=lambda x: x.difficulty_level.value)
            
            logger.info(f"Created learning path with {len(learning_path)} modules")
            return learning_path
            
        except Exception as e:
            logger.error(f"Error creating learning path: {e}")
            return []
            
    async def track_learning_progress(self, customer_id: str, module_id: str, 
                                    completion_percentage: float) -> Dict[str, Any]:
        """Track customer's learning progress."""
        try:
            logger.info(f"Tracking progress for customer {customer_id}, module {module_id}")
            
            if customer_id not in self.user_progress:
                self.user_progress[customer_id] = {}
                
            self.user_progress[customer_id][module_id] = {
                "completion_percentage": completion_percentage,
                "last_accessed": datetime.now(),
                "completed": completion_percentage >= 100
            }
            
            # Calculate overall progress
            user_modules = self.user_progress[customer_id]
            total_completion = sum(module["completion_percentage"] for module in user_modules.values())
            average_completion = total_completion / len(user_modules) if user_modules else 0
            
            completed_modules = sum(1 for module in user_modules.values() if module["completed"])
            
            progress_summary = {
                "customer_id": customer_id,
                "total_modules": len(user_modules),
                "completed_modules": completed_modules,
                "average_completion": average_completion,
                "last_activity": datetime.now().isoformat()
            }
            
            logger.info(f"Progress updated: {completed_modules}/{len(user_modules)} modules completed")
            return progress_summary
            
        except Exception as e:
            logger.error(f"Error tracking learning progress: {e}")
            return {}


class CustomerExperienceEngine:
    """Main customer experience engine coordinating all components."""
    
    def __init__(self, db_path: str = "customer_experience.db"):
        self.db_path = db_path
        self.financial_advisor = PersonalizedFinancialAdvisor()
        self.investment_engine = InvestmentRecommendationEngine()
        self.education_platform = FinancialEducationPlatform()
        self._init_database()
        
    def _init_database(self):
        """Initialize customer experience database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Customer profiles table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS customer_profiles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    customer_id TEXT UNIQUE NOT NULL,
                    segment TEXT NOT NULL,
                    risk_profile TEXT NOT NULL,
                    investment_goals TEXT,
                    financial_situation TEXT,
                    preferences TEXT,
                    education_level TEXT,
                    created_date TEXT,
                    last_updated TEXT
                )
            """)
            
            # Financial advice table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS financial_advice (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    advice_id TEXT UNIQUE NOT NULL,
                    customer_id TEXT NOT NULL,
                    advice_type TEXT NOT NULL,
                    recommendations TEXT,
                    rationale TEXT,
                    priority TEXT,
                    estimated_impact TEXT,
                    generated_date TEXT,
                    expires_date TEXT
                )
            """)
            
            # Investment recommendations table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS investment_recommendations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    recommendation_id TEXT UNIQUE NOT NULL,
                    customer_id TEXT NOT NULL,
                    asset_class TEXT NOT NULL,
                    specific_instruments TEXT,
                    allocation_percentage REAL,
                    expected_return REAL,
                    risk_level TEXT,
                    time_horizon TEXT,
                    rationale TEXT,
                    generated_date TEXT
                )
            """)
            
            # Learning progress table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS learning_progress (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    customer_id TEXT NOT NULL,
                    module_id TEXT NOT NULL,
                    completion_percentage REAL,
                    last_accessed TEXT,
                    completed BOOLEAN,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(customer_id, module_id)
                )
            """)
            
            conn.commit()
            conn.close()
            logger.info("Customer experience database initialized")
            
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
            
    async def comprehensive_customer_service(self, customer_id: str) -> Dict[str, Any]:
        """Provide comprehensive customer experience service."""
        try:
            logger.info(f"Providing comprehensive service for customer {customer_id}")
            
            # Generate financial advice
            financial_advice = await self.financial_advisor.generate_financial_advice(customer_id)
            
            # Generate investment recommendations
            investment_recommendations = await self.investment_engine.generate_investment_recommendations(customer_id)
            
            # Get personalized learning path
            learning_path = await self.education_platform.get_personalized_learning_path(customer_id)
            
            # Store results
            await self._store_financial_advice(financial_advice)
            await self._store_investment_recommendations(investment_recommendations)
            
            service_response = {
                "customer_id": customer_id,
                "financial_advice": [asdict(advice) for advice in financial_advice],
                "investment_recommendations": [asdict(rec) for rec in investment_recommendations],
                "learning_path": [asdict(module) for module in learning_path],
                "service_timestamp": datetime.now().isoformat(),
                "summary": {
                    "advice_items": len(financial_advice),
                    "investment_options": len(investment_recommendations),
                    "education_modules": len(learning_path)
                }
            }
            
            logger.info(f"Comprehensive service completed: {len(financial_advice)} advice items, "
                       f"{len(investment_recommendations)} investment recommendations")
            
            return service_response
            
        except Exception as e:
            logger.error(f"Error providing comprehensive customer service: {e}")
            raise
            
    async def _store_financial_advice(self, advice_list: List[FinancialAdvice]):
        """Store financial advice in database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            for advice in advice_list:
                cursor.execute("""
                    INSERT OR REPLACE INTO financial_advice 
                    (advice_id, customer_id, advice_type, recommendations, rationale, 
                     priority, estimated_impact, generated_date, expires_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    advice.advice_id,
                    advice.customer_id,
                    advice.advice_type,
                    json.dumps(advice.recommendations),
                    advice.rationale,
                    advice.priority,
                    json.dumps(advice.estimated_impact),
                    advice.generated_date.isoformat(),
                    advice.expires_date.isoformat() if advice.expires_date else None
                ))
                
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error storing financial advice: {e}")
            
    async def _store_investment_recommendations(self, recommendations: List[InvestmentRecommendation]):
        """Store investment recommendations in database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            for rec in recommendations:
                cursor.execute("""
                    INSERT OR REPLACE INTO investment_recommendations 
                    (recommendation_id, customer_id, asset_class, specific_instruments, 
                     allocation_percentage, expected_return, risk_level, time_horizon, 
                     rationale, generated_date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    rec.recommendation_id,
                    rec.customer_id,
                    rec.asset_class,
                    json.dumps(rec.specific_instruments),
                    rec.allocation_percentage,
                    rec.expected_return,
                    rec.risk_level.value,
                    rec.time_horizon,
                    rec.rationale,
                    rec.generated_date.isoformat()
                ))
                
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error storing investment recommendations: {e}")


# Main execution and testing
async def main():
    """Main function for testing and demonstration."""
    try:
        logger.info("Starting RomAI Customer Experience Engine Demo")
        
        # Initialize customer experience engine
        customer_engine = CustomerExperienceEngine()
        
        # Test customer service
        test_customer_id = "CUST_12345"
        
        logger.info("Providing comprehensive customer service...")
        service_response = await customer_engine.comprehensive_customer_service(test_customer_id)
        
        logger.info(f"Service Summary:")
        logger.info(f"- Financial advice items: {service_response['summary']['advice_items']}")
        logger.info(f"- Investment recommendations: {service_response['summary']['investment_options']}")
        logger.info(f"- Education modules: {service_response['summary']['education_modules']}")
        
        # Test education progress tracking
        logger.info("Testing education progress tracking...")
        progress = await customer_engine.education_platform.track_learning_progress(
            test_customer_id, "budgeting_basics", 75.0
        )
        logger.info(f"Learning progress: {progress['completed_modules']}/{progress['total_modules']} modules completed")
        
        logger.info("Customer Experience Engine demo completed successfully")
        
    except Exception as e:
        logger.error(f"Error in main demo: {e}")


if __name__ == "__main__":
    asyncio.run(main())
