#!/usr/bin/env python3
"""
⚖️ RomAI Risk Assessment Framework
Advanced algorithms for financial risk analysis and assessment

This module provides comprehensive risk assessment capabilities including:
- Credit risk scoring and analysis
- Market risk calculations (VaR, CVaR, stress testing)
- Operational risk assessment
- Portfolio risk analytics
- Romanian market-specific risk factors
- Real-time risk monitoring

Author: RomAI Financial Intelligence Team
Version: 3.1.0
Date: 2025-08-08
"""

import numpy as np
import pandas as pd
import scipy.stats as stats
import scipy.optimize as optimize
from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import logging
import asyncio
import json
import warnings
from abc import ABC, abstractmethod
from enum import Enum
import sqlite3
from pathlib import Path

# Real infrastructure imports - NO MOCK DATA
from ..real_database import (
    RealDatabaseManager, RealDatabaseOperations, 
    real_api_manager, real_performance_monitor
)


warnings.filterwarnings('ignore')
logger = logging.getLogger(__name__)

class RiskType(Enum):
    """Risk type enumeration"""
    CREDIT = "credit"
    MARKET = "market"
    OPERATIONAL = "operational"
    LIQUIDITY = "liquidity"
    CURRENCY = "currency"
    COUNTRY = "country"

class RiskLevel(Enum):
    """Risk level enumeration"""
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class RiskMetric:
    """Risk metric data structure"""
    name: str
    value: float
    risk_type: RiskType
    risk_level: RiskLevel
    confidence: float
    timestamp: datetime
    methodology: str
    parameters: Dict[str, Any] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class PortfolioRisk:
    """Portfolio risk assessment result"""
    portfolio_id: str
    total_value: float
    var_95: float  # Value at Risk at 95% confidence
    var_99: float  # Value at Risk at 99% confidence
    cvar_95: float  # Conditional Value at Risk at 95%
    max_drawdown: float
    sharpe_ratio: float
    beta: float
    correlation_risk: float
    concentration_risk: float
    currency_risk: float
    timestamp: datetime
    risk_breakdown: Dict[str, float] = field(default_factory=dict)
    stress_test_results: Dict[str, float] = field(default_factory=dict)

@dataclass
class CreditRiskAssessment:
    """Credit risk assessment result"""
    entity_id: str
    credit_score: float  # 0-1000 scale
    probability_of_default: float  # 0-1
    loss_given_default: float  # 0-1
    exposure_at_default: float
    expected_loss: float
    risk_rating: str  # AAA, AA, A, BBB, BB, B, CCC, CC, C, D
    risk_factors: Dict[str, float]
    timestamp: datetime
    methodology: str
    confidence: float

class RiskCalculator(ABC):
    """Abstract base class for risk calculators"""
    
    @abstractmethod
    async def calculate_risk(self, data: Dict[str, Any]) -> RiskMetric:
        """Calculate risk metric"""
        pass

class MarketRiskCalculator(RiskCalculator):
    """Market risk calculator implementation"""
    
    def __init__(self):
        self.name = "Market Risk Calculator"
    
    async def calculate_var(self, returns: pd.Series, confidence_level: float = 0.95, 
                           method: str = "historical") -> float:
        """Calculate Value at Risk (VaR)"""
        if method == "historical":
            return self._historical_var(returns, confidence_level)
        elif method == "parametric":
            return self._parametric_var(returns, confidence_level)
        elif method == "monte_carlo":
            return await self._monte_carlo_var(returns, confidence_level)
        else:
            raise ValueError(f"Unknown VaR method: {method}")
    
    def _historical_var(self, returns: pd.Series, confidence_level: float) -> float:
        """Historical simulation VaR"""
        return np.percentile(returns, (1 - confidence_level) * 100)
    
    def _parametric_var(self, returns: pd.Series, confidence_level: float) -> float:
        """Parametric VaR assuming normal distribution"""
        mean = returns.mean()
        std = returns.std()
        z_score = stats.norm.ppf(1 - confidence_level)
        return mean + z_score * std
    
    async def _monte_carlo_var(self, returns: pd.Series, confidence_level: float, 
                              simulations: int = 10000) -> float:
        """Monte Carlo simulation VaR"""
        mean = returns.mean()
        std = returns.std()
        
        # Generate random scenarios
        random_returns = np.random.normal(mean, std, simulations)
        return np.percentile(random_returns, (1 - confidence_level) * 100)
    
    async def calculate_cvar(self, returns: pd.Series, confidence_level: float = 0.95) -> float:
        """Calculate Conditional Value at Risk (CVaR)"""
        var = await self.calculate_var(returns, confidence_level)
        tail_losses = returns[returns <= var]
        return tail_losses.mean() if len(tail_losses) > 0 else var
    
    async def calculate_maximum_drawdown(self, prices: pd.Series) -> float:
        """Calculate maximum drawdown"""
        cumulative = (1 + prices.pct_change()).cumprod()
        peak = cumulative.expanding().max()
        drawdown = (cumulative - peak) / peak
        return drawdown.min()
    
    async def calculate_beta(self, asset_returns: pd.Series, market_returns: pd.Series) -> float:
        """Calculate beta coefficient"""
        covariance = np.cov(asset_returns, market_returns)[0, 1]
        market_variance = np.var(market_returns)
        return covariance / market_variance if market_variance != 0 else 0
    
    async def calculate_correlation_risk(self, returns_matrix: pd.DataFrame) -> float:
        """Calculate correlation risk (average correlation)"""
        correlation_matrix = returns_matrix.corr()
        # Extract upper triangle (excluding diagonal)
        upper_triangle = correlation_matrix.where(
            np.triu(np.ones(correlation_matrix.shape), k=1).astype(np.bool_)
        )
        return upper_triangle.stack().mean()
    
    async def stress_test(self, portfolio_returns: pd.Series, 
                         scenarios: Dict[str, float]) -> Dict[str, float]:
        """Perform stress testing on portfolio"""
        results = {}
        
        for scenario_name, shock in scenarios.items():
            if scenario_name == "market_crash":
                # Simulate market crash (e.g., -20% shock)
                stressed_returns = portfolio_returns + shock
                results[scenario_name] = stressed_returns.sum()
            elif scenario_name == "volatility_spike":
                # Simulate volatility increase
                current_vol = portfolio_returns.std()
                stressed_returns = portfolio_returns * (1 + shock)
                results[scenario_name] = stressed_returns.std() / current_vol
            elif scenario_name == "liquidity_crisis":
                # Simulate liquidity crisis (increased correlation)
                results[scenario_name] = shock  # Simplified implementation
        
        return results
    
    async def calculate_risk(self, data: Dict[str, Any]) -> RiskMetric:
        """Calculate market risk metrics"""
        returns = data.get('returns')
        confidence_level = data.get('confidence_level', 0.95)
        
        if returns is None:
            raise ValueError("Returns data required for market risk calculation")
        
        var = await self.calculate_var(returns, confidence_level)
        
        return RiskMetric(
            name="Value at Risk",
            value=abs(var),
            risk_type=RiskType.MARKET,
            risk_level=self._determine_risk_level(abs(var)),
            confidence=confidence_level,
            timestamp=datetime.now(),
            methodology="Historical Simulation",
            parameters={"confidence_level": confidence_level}
        )
    
    def _determine_risk_level(self, var: float) -> RiskLevel:
        """Determine risk level based on VaR"""
        if var < 0.02:  # Less than 2%
            return RiskLevel.LOW
        elif var < 0.05:  # 2-5%
            return RiskLevel.MODERATE
        elif var < 0.1:  # 5-10%
            return RiskLevel.HIGH
        else:  # More than 10%
            return RiskLevel.CRITICAL

class CreditRiskCalculator(RiskCalculator):
    """Credit risk calculator implementation"""
    
    def __init__(self):
        self.name = "Credit Risk Calculator"
        self.rating_mapping = {
            1000: "AAA", 950: "AA+", 900: "AA", 850: "AA-",
            800: "A+", 750: "A", 700: "A-", 650: "BBB+",
            600: "BBB", 550: "BBB-", 500: "BB+", 450: "BB",
            400: "BB-", 350: "B+", 300: "B", 250: "B-",
            200: "CCC+", 150: "CCC", 100: "CCC-", 50: "CC", 0: "C"
        }
    
    async def calculate_credit_score(self, financial_data: Dict[str, Any]) -> float:
        """Calculate credit score using financial ratios"""
        score = 500  # Starting score
        
        # Financial ratio analysis
        if 'debt_to_equity' in financial_data:
            debt_to_equity = financial_data['debt_to_equity']
            if debt_to_equity < 0.3:
                score += 100
            elif debt_to_equity < 0.6:
                score += 50
            elif debt_to_equity > 1.0:
                score -= 100
        
        if 'current_ratio' in financial_data:
            current_ratio = financial_data['current_ratio']
            if current_ratio > 2.0:
                score += 80
            elif current_ratio > 1.5:
                score += 40
            elif current_ratio < 1.0:
                score -= 80
        
        if 'return_on_equity' in financial_data:
            roe = financial_data['return_on_equity']
            if roe > 0.15:
                score += 60
            elif roe > 0.10:
                score += 30
            elif roe < 0:
                score -= 100
        
        if 'interest_coverage' in financial_data:
            coverage = financial_data['interest_coverage']
            if coverage > 5:
                score += 70
            elif coverage > 2.5:
                score += 35
            elif coverage < 1.5:
                score -= 150
        
        # Industry and market factors
        if 'industry_risk' in financial_data:
            industry_risk = financial_data['industry_risk']  # 0-1 scale
            score -= industry_risk * 100
        
        if 'market_position' in financial_data:
            market_position = financial_data['market_position']  # 0-1 scale
            score += market_position * 50
        
        # Macroeconomic factors
        if 'economic_outlook' in financial_data:
            economic_outlook = financial_data['economic_outlook']  # -1 to 1
            score += economic_outlook * 50
        
        # Ensure score is within bounds
        return max(0, min(1000, score))
    
    async def calculate_probability_of_default(self, credit_score: float) -> float:
        """Calculate probability of default based on credit score"""
        # Logistic transformation to map credit score to PD
        # Higher scores = lower PD
        normalized_score = credit_score / 1000
        pd = 1 / (1 + np.exp(10 * (normalized_score - 0.3)))
        return min(0.99, max(0.0001, pd))
    
    async def calculate_loss_given_default(self, collateral_data: Dict[str, Any]) -> float:
        """Calculate Loss Given Default based on collateral"""
        base_lgd = 0.45  # Base LGD assumption
        
        if 'collateral_value' in collateral_data and 'exposure' in collateral_data:
            collateral_ratio = collateral_data['collateral_value'] / collateral_data['exposure']
            # Reduce LGD based on collateral coverage
            lgd_reduction = min(0.4, collateral_ratio * 0.4)
            base_lgd -= lgd_reduction
        
        if 'collateral_type' in collateral_data:
            collateral_type = collateral_data['collateral_type']
            if collateral_type == 'real_estate':
                base_lgd -= 0.05
            elif collateral_type == 'cash':
                base_lgd -= 0.15
            elif collateral_type == 'securities':
                base_lgd -= 0.10
        
        return max(0.1, min(0.9, base_lgd))
    
    def _get_rating_from_score(self, score: float) -> str:
        """Convert credit score to rating"""
        for threshold, rating in sorted(self.rating_mapping.items(), reverse=True):
            if score >= threshold:
                return rating
        return "D"
    
    async def calculate_risk(self, data: Dict[str, Any]) -> RiskMetric:
        """Calculate credit risk metrics"""
        financial_data = data.get('financial_data', {})
        credit_score = await self.calculate_credit_score(financial_data)
        pd = await self.calculate_probability_of_default(credit_score)
        
        return RiskMetric(
            name="Credit Risk Score",
            value=credit_score,
            risk_type=RiskType.CREDIT,
            risk_level=self._determine_credit_risk_level(pd),
            confidence=0.85,
            timestamp=datetime.now(),
            methodology="Financial Ratio Analysis",
            parameters={"probability_of_default": pd}
        )
    
    def _determine_credit_risk_level(self, pd: float) -> RiskLevel:
        """Determine credit risk level based on PD"""
        if pd < 0.01:  # Less than 1%
            return RiskLevel.LOW
        elif pd < 0.05:  # 1-5%
            return RiskLevel.MODERATE
        elif pd < 0.15:  # 5-15%
            return RiskLevel.HIGH
        else:  # More than 15%
            return RiskLevel.CRITICAL

class OperationalRiskCalculator(RiskCalculator):
    """Operational risk calculator implementation"""
    
    def __init__(self):
        self.name = "Operational Risk Calculator"
        self.risk_categories = {
            'technology': 0.3,
            'people': 0.25,
            'processes': 0.2,
            'external': 0.15,
            'legal': 0.1
        }
    
    async def calculate_operational_risk_score(self, risk_factors: Dict[str, float]) -> float:
        """Calculate operational risk score"""
        total_score = 0
        
        for category, weight in self.risk_categories.items():
            if category in risk_factors:
                # Risk factors should be on 0-1 scale (0 = no risk, 1 = high risk)
                category_risk = risk_factors[category]
                total_score += category_risk * weight
        
        return total_score
    
    async def assess_technology_risk(self, tech_factors: Dict[str, Any]) -> float:
        """Assess technology-related operational risk"""
        risk_score = 0
        
        # System downtime frequency
        if 'downtime_hours_per_month' in tech_factors:
            downtime = tech_factors['downtime_hours_per_month']
            risk_score += min(1.0, downtime / 24)  # Normalize to 0-1
        
        # Cybersecurity incidents
        if 'security_incidents_per_quarter' in tech_factors:
            incidents = tech_factors['security_incidents_per_quarter']
            risk_score += min(1.0, incidents / 10)
        
        # System age and obsolescence
        if 'avg_system_age_years' in tech_factors:
            age = tech_factors['avg_system_age_years']
            risk_score += min(1.0, max(0, (age - 3) / 7))  # Risk increases after 3 years
        
        return min(1.0, risk_score / 3)  # Average and normalize
    
    async def assess_people_risk(self, people_factors: Dict[str, Any]) -> float:
        """Assess people-related operational risk"""
        risk_score = 0
        
        # Employee turnover rate
        if 'annual_turnover_rate' in people_factors:
            turnover = people_factors['annual_turnover_rate']
            risk_score += min(1.0, turnover / 0.3)  # 30% turnover = max risk
        
        # Training completion rate
        if 'training_completion_rate' in people_factors:
            completion = people_factors['training_completion_rate']
            risk_score += max(0, (0.9 - completion) / 0.9)  # Below 90% increases risk
        
        # Key person dependency
        if 'key_person_dependency' in people_factors:
            dependency = people_factors['key_person_dependency']
            risk_score += dependency  # Already 0-1 scale
        
        return min(1.0, risk_score / 3)
    
    async def calculate_risk(self, data: Dict[str, Any]) -> RiskMetric:
        """Calculate operational risk metrics"""
        risk_factors = data.get('operational_factors', {})
        
        # Calculate individual risk components
        tech_risk = await self.assess_technology_risk(risk_factors.get('technology', {}))
        people_risk = await self.assess_people_risk(risk_factors.get('people', {}))
        
        # Overall operational risk score
        overall_risk = await self.calculate_operational_risk_score({
            'technology': tech_risk,
            'people': people_risk,
            'processes': risk_factors.get('processes', 0.3),
            'external': risk_factors.get('external', 0.2),
            'legal': risk_factors.get('legal', 0.1)
        })
        
        return RiskMetric(
            name="Operational Risk Score",
            value=overall_risk,
            risk_type=RiskType.OPERATIONAL,
            risk_level=self._determine_operational_risk_level(overall_risk),
            confidence=0.75,
            timestamp=datetime.now(),
            methodology="Factor-based Assessment",
            parameters={
                "technology_risk": tech_risk,
                "people_risk": people_risk
            }
        )
    
    def _determine_operational_risk_level(self, risk_score: float) -> RiskLevel:
        """Determine operational risk level"""
        if risk_score < 0.3:
            return RiskLevel.LOW
        elif risk_score < 0.5:
            return RiskLevel.MODERATE
        elif risk_score < 0.7:
            return RiskLevel.HIGH
        else:
            return RiskLevel.CRITICAL

class RomanianRiskCalculator(RiskCalculator):
    """Romanian market-specific risk calculator"""
    
    def __init__(self):
        self.name = "Romanian Risk Calculator"
        self.country_risk_factors = {
            'currency_volatility': 0.25,
            'political_stability': 0.20,
            'regulatory_changes': 0.20,
            'economic_indicators': 0.15,
            'eu_integration': 0.10,
            'regional_conflicts': 0.10
        }
    
    async def calculate_currency_risk(self, eur_ron_data: pd.Series) -> float:
        """Calculate EUR/RON currency risk"""
        if len(eur_ron_data) < 30:
            return 0.5  # Default moderate risk
        
        # Calculate volatility
        returns = eur_ron_data.pct_change().dropna()
        volatility = returns.std() * np.sqrt(252)  # Annualized volatility
        
        # Normalize to 0-1 scale (0.1 volatility = max risk)
        return min(1.0, volatility / 0.1)
    
    async def assess_political_risk(self, political_factors: Dict[str, Any]) -> float:
        """Assess Romanian political risk"""
        risk_score = 0
        
        # Government stability
        if 'government_approval_rating' in political_factors:
            approval = political_factors['government_approval_rating']
            risk_score += max(0, (0.4 - approval) / 0.4)  # Below 40% increases risk
        
        # Election proximity
        if 'months_to_election' in political_factors:
            months = political_factors['months_to_election']
            if months <= 6:
                risk_score += 0.3
            elif months <= 12:
                risk_score += 0.1
        
        # Policy consistency index
        if 'policy_consistency_index' in political_factors:
            consistency = political_factors['policy_consistency_index']
            risk_score += max(0, (0.7 - consistency) / 0.7)
        
        return min(1.0, risk_score)
    
    async def assess_regulatory_risk(self, regulatory_factors: Dict[str, Any]) -> float:
        """Assess Romanian regulatory risk"""
        risk_score = 0.3  # Base regulatory risk for emerging market
        
        # EU compliance score
        if 'eu_compliance_score' in regulatory_factors:
            compliance = regulatory_factors['eu_compliance_score']
            risk_score -= (compliance - 0.8) * 0.5  # Bonus for high compliance
        
        # Regulatory change frequency
        if 'regulatory_changes_per_year' in regulatory_factors:
            changes = regulatory_factors['regulatory_changes_per_year']
            risk_score += min(0.3, changes / 20)  # More changes = more risk
        
        return max(0, min(1.0, risk_score))
    
    async def calculate_bvb_specific_risk(self, bvb_data: Dict[str, Any]) -> float:
        """Calculate Bucharest Stock Exchange specific risks"""
        risk_score = 0.4  # Base emerging market risk
        
        # Market liquidity
        if 'avg_daily_volume' in bvb_data:
            volume = bvb_data['avg_daily_volume']
            # Lower volume = higher liquidity risk
            risk_score += max(0, (50_000_000 - volume) / 100_000_000)
        
        # Market concentration
        if 'top_10_market_cap_percentage' in bvb_data:
            concentration = bvb_data['top_10_market_cap_percentage']
            if concentration > 0.7:  # High concentration
                risk_score += 0.2
        
        # Foreign investor participation
        if 'foreign_investor_percentage' in bvb_data:
            foreign_participation = bvb_data['foreign_investor_percentage']
            if foreign_participation < 0.3:  # Low foreign participation
                risk_score += 0.1
        
        return min(1.0, risk_score)
    
    async def calculate_risk(self, data: Dict[str, Any]) -> RiskMetric:
        """Calculate Romanian market risk"""
        currency_data = data.get('eur_ron_data')
        political_factors = data.get('political_factors', {})
        regulatory_factors = data.get('regulatory_factors', {})
        bvb_data = data.get('bvb_data', {})
        
        # Calculate individual risk components
        currency_risk = await self.calculate_currency_risk(currency_data) if currency_data is not None else 0.3
        political_risk = await self.assess_political_risk(political_factors)
        regulatory_risk = await self.assess_regulatory_risk(regulatory_factors)
        bvb_risk = await self.calculate_bvb_specific_risk(bvb_data)
        
        # Weighted average
        overall_risk = (
            currency_risk * 0.4 +
            political_risk * 0.25 +
            regulatory_risk * 0.2 +
            bvb_risk * 0.15
        )
        
        return RiskMetric(
            name="Romanian Market Risk",
            value=overall_risk,
            risk_type=RiskType.COUNTRY,
            risk_level=self._determine_country_risk_level(overall_risk),
            confidence=0.8,
            timestamp=datetime.now(),
            methodology="Country Risk Assessment",
            parameters={
                "currency_risk": currency_risk,
                "political_risk": political_risk,
                "regulatory_risk": regulatory_risk,
                "bvb_risk": bvb_risk
            }
        )
    
    def _determine_country_risk_level(self, risk_score: float) -> RiskLevel:
        """Determine country risk level"""
        if risk_score < 0.3:
            return RiskLevel.LOW
        elif risk_score < 0.5:
            return RiskLevel.MODERATE
        elif risk_score < 0.7:
            return RiskLevel.HIGH
        else:
            return RiskLevel.CRITICAL

class RiskAssessmentFramework:
    """Main risk assessment framework"""
    
    def __init__(self, db_path: str = "risk_assessments.db"):
        self.db_path = db_path
        self.calculators: Dict[RiskType, RiskCalculator] = {}
        self.init_database()
        
        # Initialize risk calculators
        self.add_calculator(RiskType.MARKET, MarketRiskCalculator())
        self.add_calculator(RiskType.CREDIT, CreditRiskCalculator())
        self.add_calculator(RiskType.OPERATIONAL, OperationalRiskCalculator())
        self.add_calculator(RiskType.COUNTRY, RomanianRiskCalculator())
    
    def init_database(self):
        """Initialize SQLite database for risk assessments"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS risk_assessments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    entity_id TEXT,
                    risk_type TEXT NOT NULL,
                    risk_name TEXT NOT NULL,
                    risk_value REAL NOT NULL,
                    risk_level TEXT NOT NULL,
                    confidence REAL,
                    methodology TEXT,
                    parameters TEXT,
                    metadata TEXT,
                    timestamp DATETIME NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.execute('''
                CREATE INDEX IF NOT EXISTS idx_risk_assessments_entity_type 
                ON risk_assessments(entity_id, risk_type, timestamp)
            ''')
    
    def add_calculator(self, risk_type: RiskType, calculator: RiskCalculator):
        """Add a risk calculator"""
        self.calculators[risk_type] = calculator
        logger.info(f"Added risk calculator: {risk_type.value}")
    
    async def assess_portfolio_risk(self, portfolio_data: Dict[str, Any]) -> PortfolioRisk:
        """Comprehensive portfolio risk assessment"""
        portfolio_id = portfolio_data.get('portfolio_id', 'unknown')
        holdings = portfolio_data.get('holdings', {})
        returns = portfolio_data.get('returns')
        market_data = portfolio_data.get('market_data')
        
        if returns is None:
            raise ValueError("Portfolio returns required for risk assessment")
        
        # Calculate VaR and CVaR
        market_calc = self.calculators[RiskType.MARKET]
        var_95 = await market_calc.calculate_var(returns, 0.95)
        var_99 = await market_calc.calculate_var(returns, 0.99)
        cvar_95 = await market_calc.calculate_cvar(returns, 0.95)
        
        # Calculate other risk metrics
        max_drawdown = await market_calc.calculate_maximum_drawdown(returns.cumsum())
        
        # Sharpe ratio
        risk_free_rate = portfolio_data.get('risk_free_rate', 0.02)
        excess_returns = returns.mean() - risk_free_rate / 252
        sharpe_ratio = excess_returns / returns.std() * np.sqrt(252)
        
        # Beta (if market returns provided)
        beta = 1.0
        if market_data is not None:
            beta = await market_calc.calculate_beta(returns, market_data)
        
        # Correlation risk
        correlation_risk = 0.5
        if len(holdings) > 1:
            # This would require individual asset returns
            correlation_risk = 0.6  # Placeholder
        
        # Concentration risk
        concentration_risk = self._calculate_concentration_risk(holdings)
        
        # Currency risk (for Romanian portfolios)
        currency_risk = 0.2  # Placeholder
        
        # Stress testing
        stress_scenarios = {
            'market_crash': -0.20,
            'volatility_spike': 0.50,
            'liquidity_crisis': 0.30
        }
        stress_results = await market_calc.stress_test(returns, stress_scenarios)
        
        portfolio_risk = PortfolioRisk(
            portfolio_id=portfolio_id,
            total_value=portfolio_data.get('total_value', 0),
            var_95=abs(var_95),
            var_99=abs(var_99),
            cvar_95=abs(cvar_95),
            max_drawdown=abs(max_drawdown),
            sharpe_ratio=sharpe_ratio,
            beta=beta,
            correlation_risk=correlation_risk,
            concentration_risk=concentration_risk,
            currency_risk=currency_risk,
            timestamp=datetime.now(),
            stress_test_results=stress_results
        )
        
        # Store in database
        await self._store_portfolio_risk(portfolio_risk)
        
        return portfolio_risk
    
    def _calculate_concentration_risk(self, holdings: Dict[str, float]) -> float:
        """Calculate concentration risk using Herfindahl-Hirschman Index"""
        if not holdings:
            return 0.0
        
        total_value = sum(holdings.values())
        if total_value == 0:
            return 0.0
        
        # Calculate HHI
        weights = [value / total_value for value in holdings.values()]
        hhi = sum(w**2 for w in weights)
        
        # Normalize to 0-1 scale (0 = perfectly diversified, 1 = concentrated)
        # HHI ranges from 1/n to 1, where n is number of holdings
        min_hhi = 1 / len(holdings) if len(holdings) > 0 else 1
        normalized_concentration = (hhi - min_hhi) / (1 - min_hhi)
        
        return normalized_concentration
    
    async def assess_credit_risk(self, entity_data: Dict[str, Any]) -> CreditRiskAssessment:
        """Comprehensive credit risk assessment"""
        entity_id = entity_data.get('entity_id', 'unknown')
        financial_data = entity_data.get('financial_data', {})
        collateral_data = entity_data.get('collateral_data', {})
        
        credit_calc = self.calculators[RiskType.CREDIT]
        
        # Calculate credit metrics
        credit_score = await credit_calc.calculate_credit_score(financial_data)
        pd = await credit_calc.calculate_probability_of_default(credit_score)
        lgd = await credit_calc.calculate_loss_given_default(collateral_data)
        
        exposure = entity_data.get('exposure', 0)
        expected_loss = pd * lgd * exposure
        
        risk_rating = credit_calc._get_rating_from_score(credit_score)
        
        assessment = CreditRiskAssessment(
            entity_id=entity_id,
            credit_score=credit_score,
            probability_of_default=pd,
            loss_given_default=lgd,
            exposure_at_default=exposure,
            expected_loss=expected_loss,
            risk_rating=risk_rating,
            risk_factors=financial_data,
            timestamp=datetime.now(),
            methodology="Financial Ratio Analysis",
            confidence=0.85
        )
        
        # Store in database
        await self._store_credit_assessment(assessment)
        
        return assessment
    
    async def calculate_risk_metric(self, risk_type: RiskType, data: Dict[str, Any]) -> RiskMetric:
        """Calculate specific risk metric"""
        if risk_type not in self.calculators:
            raise ValueError(f"No calculator available for risk type: {risk_type}")
        
        calculator = self.calculators[risk_type]
        risk_metric = await calculator.calculate_risk(data)
        
        # Store in database
        await self._store_risk_metric(risk_metric, data.get('entity_id'))
        
        return risk_metric
    
    async def _store_risk_metric(self, risk_metric: RiskMetric, entity_id: Optional[str] = None):
        """Store risk metric in database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO risk_assessments 
                (entity_id, risk_type, risk_name, risk_value, risk_level, confidence, 
                 methodology, parameters, metadata, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                entity_id, risk_metric.risk_type.value, risk_metric.name,
                risk_metric.value, risk_metric.risk_level.value, risk_metric.confidence,
                risk_metric.methodology, json.dumps(risk_metric.parameters),
                json.dumps(risk_metric.metadata), risk_metric.timestamp
            ))
    
    async def _store_portfolio_risk(self, portfolio_risk: PortfolioRisk):
        """Store portfolio risk assessment"""
        # This would be stored in a separate portfolio_risk table
        pass
    
    async def _store_credit_assessment(self, assessment: CreditRiskAssessment):
        """Store credit risk assessment"""
        # This would be stored in a separate credit_assessments table
        pass
    
    async def get_risk_history(self, entity_id: str, risk_type: Optional[RiskType] = None,
                              days: int = 30) -> List[RiskMetric]:
        """Get risk assessment history"""
        query = '''
            SELECT risk_type, risk_name, risk_value, risk_level, confidence, 
                   methodology, parameters, metadata, timestamp
            FROM risk_assessments 
            WHERE entity_id = ? AND timestamp >= datetime('now', '-{} days')
        '''.format(days)
        
        params = [entity_id]
        
        if risk_type:
            query += " AND risk_type = ?"
            params.append(risk_type.value)
        
        query += " ORDER BY timestamp DESC"
        
        risk_metrics = []
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(query, params)
            for row in cursor.fetchall():
                risk_metrics.append(RiskMetric(
                    name=row[1],
                    value=row[2],
                    risk_type=RiskType(row[0]),
                    risk_level=RiskLevel(row[3]),
                    confidence=row[4],
                    timestamp=datetime.fromisoformat(row[8]),
                    methodology=row[5],
                    parameters=json.loads(row[6]) if row[6] else {},
                    metadata=json.loads(row[7]) if row[7] else {}
                ))
        
        return risk_metrics
    
    async def generate_risk_report(self, entity_id: str) -> Dict[str, Any]:
        """Generate comprehensive risk report"""
        report = {
            "entity_id": entity_id,
            "report_date": datetime.now().isoformat(),
            "risk_summary": {},
            "risk_metrics": {},
            "recommendations": []
        }
        
        # Get recent risk assessments
        for risk_type in RiskType:
            recent_metrics = await self.get_risk_history(entity_id, risk_type, days=7)
            if recent_metrics:
                latest_metric = recent_metrics[0]
                report["risk_metrics"][risk_type.value] = {
                    "value": latest_metric.value,
                    "level": latest_metric.risk_level.value,
                    "confidence": latest_metric.confidence,
                    "timestamp": latest_metric.timestamp.isoformat()
                }
        
        # Generate recommendations
        report["recommendations"] = await self._generate_recommendations(report["risk_metrics"])
        
        return report
    
    async def _generate_recommendations(self, risk_metrics: Dict[str, Any]) -> List[str]:
        """Generate risk mitigation recommendations"""
        recommendations = []
        
        for risk_type, metrics in risk_metrics.items():
            level = metrics.get("level")
            
            if level in ["high", "critical"]:
                if risk_type == "market":
                    recommendations.append("Consider reducing position sizes and increasing diversification")
                elif risk_type == "credit":
                    recommendations.append("Review credit policies and increase collateral requirements")
                elif risk_type == "operational":
                    recommendations.append("Strengthen operational controls and backup procedures")
                elif risk_type == "country":
                    recommendations.append("Consider currency hedging and geographic diversification")
        
        if not recommendations:
            recommendations.append("Risk levels are within acceptable ranges. Continue monitoring.")
        
        return recommendations

# Usage example and testing
async def main():
    """Main function for testing the Risk Assessment Framework"""
    framework = RiskAssessmentFramework()
    
    print("⚖️ RomAI Risk Assessment Framework - Testing")
    print("=" * 50)
    
    # Test market risk calculation
    print("📊 Testing Market Risk Assessment...")
    returns = pd.Series(np.random.normal(0.001, 0.02, 252))  # Simulated daily returns
    market_risk_data = {
        'returns': returns,
        'confidence_level': 0.95,
        'entity_id': 'TEST_PORTFOLIO'
    }
    market_risk = await framework.calculate_risk_metric(RiskType.MARKET, market_risk_data)
    print(f"   Market VaR (95%): {market_risk.value:.4f} ({market_risk.risk_level.value})")
    
    # Test credit risk calculation
    print("💳 Testing Credit Risk Assessment...")
    credit_data = {
        'financial_data': {
            'debt_to_equity': 0.4,
            'current_ratio': 1.8,
            'return_on_equity': 0.12,
            'interest_coverage': 4.5
        },
        'entity_id': 'TEST_COMPANY'
    }
    credit_risk = await framework.calculate_risk_metric(RiskType.CREDIT, credit_data)
    print(f"   Credit Score: {credit_risk.value:.1f} ({credit_risk.risk_level.value})")
    
    # Test portfolio risk assessment
    print("📈 Testing Portfolio Risk Assessment...")
    portfolio_data = {
        'portfolio_id': 'TEST_PORTFOLIO',
        'returns': returns,
        'holdings': {'AAPL': 100000, 'GOOGL': 80000, 'MSFT': 60000},
        'total_value': 240000,
        'risk_free_rate': 0.02
    }
    portfolio_risk = await framework.assess_portfolio_risk(portfolio_data)
    print(f"   Portfolio VaR (95%): {portfolio_risk.var_95:.4f}")
    print(f"   Sharpe Ratio: {portfolio_risk.sharpe_ratio:.2f}")
    
    # Test Romanian risk assessment
    print("🇷🇴 Testing Romanian Market Risk...")
    romanian_data = {
        'political_factors': {
            'government_approval_rating': 0.45,
            'months_to_election': 18
        },
        'regulatory_factors': {
            'eu_compliance_score': 0.85,
            'regulatory_changes_per_year': 12
        },
        'entity_id': 'ROMANIAN_MARKET'
    }
    romanian_risk = await framework.calculate_risk_metric(RiskType.COUNTRY, romanian_data)
    print(f"   Romanian Market Risk: {romanian_risk.value:.3f} ({romanian_risk.risk_level.value})")
    
    # Generate risk report
    print("📋 Generating Risk Report...")
    risk_report = await framework.generate_risk_report('TEST_PORTFOLIO')
    print(f"   Report generated with {len(risk_report['risk_metrics'])} risk metrics")
    print(f"   Recommendations: {len(risk_report['recommendations'])}")
    
    print("✅ Risk Assessment Framework testing complete!")

if __name__ == "__main__":
    asyncio.run(main())
