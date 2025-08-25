#!/usr/bin/env python3
"""
💰 RomAI Investment Analysis System
Advanced portfolio optimization and investment analysis platform

This module provides comprehensive investment analysis capabilities including:
- Modern Portfolio Theory optimization
- Asset allocation recommendations
- ESG scoring and sustainable investing
- Romanian market-specific investment strategies
- Risk-adjusted performance analysis
- Alternative investment analysis

Author: RomAI Financial Intelligence Team
Version: 3.1.0
Date: 2025-08-08
"""

import numpy as np
import pandas as pd
import scipy.optimize as optimize
import scipy.stats as stats
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
import yfinance as yf
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import cvxpy as cp

warnings.filterwarnings('ignore')
logger = logging.getLogger(__name__)

class AssetClass(Enum):
    """Asset class enumeration"""
    STOCKS = "stocks"
    BONDS = "bonds"
    COMMODITIES = "commodities"
    REAL_ESTATE = "real_estate"
    CRYPTO = "crypto"
    CASH = "cash"
    ALTERNATIVES = "alternatives"

class InvestmentStyle(Enum):
    """Investment style enumeration"""
    VALUE = "value"
    GROWTH = "growth"
    BLEND = "blend"
    MOMENTUM = "momentum"
    QUALITY = "quality"
    INCOME = "income"

class RiskProfile(Enum):
    """Risk profile enumeration"""
    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"
    VERY_AGGRESSIVE = "very_aggressive"

@dataclass
class Asset:
    """Asset data structure"""
    symbol: str
    name: str
    asset_class: AssetClass
    currency: str
    market: str
    sector: Optional[str] = None
    expected_return: Optional[float] = None
    volatility: Optional[float] = None
    beta: Optional[float] = None
    market_cap: Optional[float] = None
    dividend_yield: Optional[float] = None
    esg_score: Optional[float] = None
    liquidity_score: Optional[float] = None

@dataclass
class PortfolioAllocation:
    """Portfolio allocation result"""
    assets: Dict[str, float]  # symbol -> weight
    expected_return: float
    expected_volatility: float
    sharpe_ratio: float
    max_drawdown: float
    asset_class_allocation: Dict[AssetClass, float]
    sector_allocation: Dict[str, float]
    currency_allocation: Dict[str, float]
    esg_score: float
    optimization_method: str
    constraints: Dict[str, Any]
    timestamp: datetime

@dataclass
class InvestmentRecommendation:
    """Investment recommendation"""
    symbol: str
    action: str  # BUY, SELL, HOLD
    target_weight: float
    current_weight: float
    confidence: float
    rationale: str
    price_target: Optional[float] = None
    time_horizon: Optional[str] = None
    risk_level: Optional[str] = None

@dataclass
class ESGMetrics:
    """ESG scoring metrics"""
    environmental_score: float
    social_score: float
    governance_score: float
    overall_score: float
    sector_percentile: float
    controversies_score: float
    sustainable_development_goals: List[str]

class AssetAnalyzer:
    """Asset analysis and screening"""
    
    def __init__(self):
        self.name = "Asset Analyzer"
    
    async def calculate_expected_returns(self, price_data: pd.DataFrame, 
                                       method: str = "historical") -> pd.Series:
        """Calculate expected returns for assets"""
        if method == "historical":
            return self._historical_returns(price_data)
        elif method == "capm":
            return await self._capm_returns(price_data)
        elif method == "black_litterman":
            return await self._black_litterman_returns(price_data)
        else:
            raise ValueError(f"Unknown return calculation method: {method}")
    
    def _historical_returns(self, price_data: pd.DataFrame) -> pd.Series:
        """Calculate historical average returns"""
        returns = price_data.pct_change().dropna()
        # Annualize returns
        return returns.mean() * 252
    
    async def _capm_returns(self, price_data: pd.DataFrame, 
                           market_return: float = 0.08, 
                           risk_free_rate: float = 0.02) -> pd.Series:
        """Calculate expected returns using CAPM"""
        returns = price_data.pct_change().dropna()
        
        # Assume first column is market index
        market_returns = returns.iloc[:, 0]
        expected_returns = {}
        
        for asset in returns.columns[1:]:
            asset_returns = returns[asset]
            
            # Calculate beta
            covariance = np.cov(asset_returns, market_returns)[0, 1]
            market_variance = np.var(market_returns)
            beta = covariance / market_variance if market_variance != 0 else 1
            
            # CAPM formula
            expected_return = risk_free_rate + beta * (market_return - risk_free_rate)
            expected_returns[asset] = expected_return
        
        return pd.Series(expected_returns)
    
    async def calculate_covariance_matrix(self, price_data: pd.DataFrame,
                                        method: str = "sample") -> pd.DataFrame:
        """Calculate covariance matrix of returns"""
        returns = price_data.pct_change().dropna()
        
        if method == "sample":
            return returns.cov() * 252  # Annualized
        elif method == "shrinkage":
            return self._shrinkage_covariance(returns) * 252
        elif method == "exponential":
            return self._exponential_weighted_covariance(returns) * 252
        else:
            raise ValueError(f"Unknown covariance method: {method}")
    
    def _shrinkage_covariance(self, returns: pd.DataFrame, 
                             shrinkage: float = 0.2) -> pd.DataFrame:
        """Calculate shrinkage estimator of covariance matrix"""
        sample_cov = returns.cov()
        
        # Target matrix (identity scaled by average variance)
        avg_variance = np.trace(sample_cov) / len(sample_cov)
        target = np.eye(len(sample_cov)) * avg_variance
        
        # Shrinkage estimator
        shrunk_cov = (1 - shrinkage) * sample_cov + shrinkage * target
        return shrunk_cov
    
    def _exponential_weighted_covariance(self, returns: pd.DataFrame,
                                       decay: float = 0.94) -> pd.DataFrame:
        """Calculate exponentially weighted covariance matrix"""
        return returns.ewm(alpha=1-decay).cov().iloc[-len(returns.columns):]
    
    async def calculate_risk_metrics(self, price_data: pd.DataFrame) -> Dict[str, Dict[str, float]]:
        """Calculate comprehensive risk metrics for assets"""
        returns = price_data.pct_change().dropna()
        risk_metrics = {}
        
        for asset in returns.columns:
            asset_returns = returns[asset]
            
            # Volatility (annualized)
            volatility = asset_returns.std() * np.sqrt(252)
            
            # VaR and CVaR
            var_95 = np.percentile(asset_returns, 5)
            cvar_95 = asset_returns[asset_returns <= var_95].mean()
            
            # Maximum drawdown
            cumulative = (1 + asset_returns).cumprod()
            peak = cumulative.expanding().max()
            drawdown = (cumulative - peak) / peak
            max_drawdown = drawdown.min()
            
            # Skewness and kurtosis
            skewness = stats.skew(asset_returns)
            kurtosis = stats.kurtosis(asset_returns)
            
            risk_metrics[asset] = {
                'volatility': volatility,
                'var_95': abs(var_95),
                'cvar_95': abs(cvar_95),
                'max_drawdown': abs(max_drawdown),
                'skewness': skewness,
                'kurtosis': kurtosis
            }
        
        return risk_metrics

class PortfolioOptimizer:
    """Modern Portfolio Theory optimizer"""
    
    def __init__(self):
        self.name = "Portfolio Optimizer"
    
    async def optimize_portfolio(self, expected_returns: pd.Series,
                               covariance_matrix: pd.DataFrame,
                               optimization_method: str = "max_sharpe",
                               constraints: Optional[Dict[str, Any]] = None,
                               risk_free_rate: float = 0.02) -> PortfolioAllocation:
        """Optimize portfolio allocation"""
        
        if constraints is None:
            constraints = {}
        
        if optimization_method == "max_sharpe":
            weights = await self._maximize_sharpe_ratio(
                expected_returns, covariance_matrix, constraints, risk_free_rate
            )
        elif optimization_method == "min_variance":
            weights = await self._minimize_variance(
                expected_returns, covariance_matrix, constraints
            )
        elif optimization_method == "efficient_frontier":
            weights = await self._efficient_frontier_portfolio(
                expected_returns, covariance_matrix, constraints, 
                target_return=constraints.get("target_return", expected_returns.mean())
            )
        elif optimization_method == "risk_parity":
            weights = await self._risk_parity_portfolio(
                covariance_matrix, constraints
            )
        elif optimization_method == "black_litterman":
            weights = await self._black_litterman_optimization(
                expected_returns, covariance_matrix, constraints
            )
        else:
            raise ValueError(f"Unknown optimization method: {optimization_method}")
        
        # Calculate portfolio metrics
        portfolio_return = np.dot(weights, expected_returns)
        portfolio_variance = np.dot(weights.T, np.dot(covariance_matrix, weights))
        portfolio_volatility = np.sqrt(portfolio_variance)
        sharpe_ratio = (portfolio_return - risk_free_rate) / portfolio_volatility
        
        # Create allocation object
        allocation = PortfolioAllocation(
            assets=dict(zip(expected_returns.index, weights)),
            expected_return=portfolio_return,
            expected_volatility=portfolio_volatility,
            sharpe_ratio=sharpe_ratio,
            max_drawdown=0.0,  # Would need historical simulation
            asset_class_allocation={},  # Would need asset class mapping
            sector_allocation={},  # Would need sector mapping
            currency_allocation={},  # Would need currency mapping
            esg_score=0.0,  # Would need ESG data
            optimization_method=optimization_method,
            constraints=constraints,
            timestamp=datetime.now()
        )
        
        return allocation
    
    async def _maximize_sharpe_ratio(self, expected_returns: pd.Series,
                                   covariance_matrix: pd.DataFrame,
                                   constraints: Dict[str, Any],
                                   risk_free_rate: float) -> np.ndarray:
        """Maximize Sharpe ratio optimization"""
        n_assets = len(expected_returns)
        
        # Objective function (negative Sharpe ratio for minimization)
        def objective(weights):
            portfolio_return = np.dot(weights, expected_returns)
            portfolio_variance = np.dot(weights.T, np.dot(covariance_matrix, weights))
            portfolio_volatility = np.sqrt(portfolio_variance)
            sharpe_ratio = (portfolio_return - risk_free_rate) / portfolio_volatility
            return -sharpe_ratio  # Negative for minimization
        
        # Constraints
        constraint_list = [{'type': 'eq', 'fun': lambda x: np.sum(x) - 1}]  # Weights sum to 1
        
        # Add additional constraints
        if 'min_weight' in constraints:
            min_weight = constraints['min_weight']
            for i in range(n_assets):
                constraint_list.append({
                    'type': 'ineq', 
                    'fun': lambda x, i=i: x[i] - min_weight
                })
        
        if 'max_weight' in constraints:
            max_weight = constraints['max_weight']
            for i in range(n_assets):
                constraint_list.append({
                    'type': 'ineq', 
                    'fun': lambda x, i=i: max_weight - x[i]
                })
        
        # Bounds (0 to 1 for long-only)
        bounds = tuple((0, 1) for _ in range(n_assets))
        if constraints.get('allow_short', False):
            bounds = tuple((-1, 1) for _ in range(n_assets))
        
        # Initial guess (equal weights)
        initial_guess = np.array([1/n_assets] * n_assets)
        
        # Optimize
        result = optimize.minimize(
            objective, initial_guess, method='SLSQP',
            bounds=bounds, constraints=constraint_list
        )
        
        if not result.success:
            logger.warning(f"Optimization failed: {result.message}")
            return initial_guess
        
        return result.x
    
    async def _minimize_variance(self, expected_returns: pd.Series,
                               covariance_matrix: pd.DataFrame,
                               constraints: Dict[str, Any]) -> np.ndarray:
        """Minimum variance optimization using CVXPY"""
        n_assets = len(expected_returns)
        
        # Define optimization variables
        weights = cp.Variable(n_assets)
        
        # Objective: minimize portfolio variance
        portfolio_variance = cp.quad_form(weights, covariance_matrix.values)
        objective = cp.Minimize(portfolio_variance)
        
        # Constraints
        constraint_list = [cp.sum(weights) == 1]  # Weights sum to 1
        
        # Long-only constraint
        if not constraints.get('allow_short', False):
            constraint_list.append(weights >= 0)
        
        # Weight bounds
        if 'min_weight' in constraints:
            constraint_list.append(weights >= constraints['min_weight'])
        
        if 'max_weight' in constraints:
            constraint_list.append(weights <= constraints['max_weight'])
        
        # Solve optimization problem
        problem = cp.Problem(objective, constraint_list)
        problem.solve()
        
        if problem.status not in ["infeasible", "unbounded"]:
            return weights.value
        else:
            logger.warning(f"Optimization failed with status: {problem.status}")
            return np.array([1/n_assets] * n_assets)
    
    async def _risk_parity_portfolio(self, covariance_matrix: pd.DataFrame,
                                   constraints: Dict[str, Any]) -> np.ndarray:
        """Risk parity portfolio optimization"""
        n_assets = len(covariance_matrix)
        
        def risk_parity_objective(weights):
            """Risk parity objective function"""
            weights = np.array(weights)
            portfolio_variance = np.dot(weights.T, np.dot(covariance_matrix, weights))
            
            # Risk contributions
            marginal_contrib = np.dot(covariance_matrix, weights)
            risk_contrib = weights * marginal_contrib / portfolio_variance
            
            # Target equal risk contribution
            target_risk = 1.0 / n_assets
            
            # Sum of squared deviations from target
            return np.sum((risk_contrib - target_risk) ** 2)
        
        # Constraints
        constraint_list = [{'type': 'eq', 'fun': lambda x: np.sum(x) - 1}]
        
        # Bounds
        bounds = tuple((0.01, 0.5) for _ in range(n_assets))  # Prevent zero weights
        
        # Initial guess
        initial_guess = np.array([1/n_assets] * n_assets)
        
        # Optimize
        result = optimize.minimize(
            risk_parity_objective, initial_guess, method='SLSQP',
            bounds=bounds, constraints=constraint_list
        )
        
        if result.success:
            return result.x
        else:
            logger.warning(f"Risk parity optimization failed: {result.message}")
            return initial_guess
    
    async def _efficient_frontier_portfolio(self, expected_returns: pd.Series,
                                          covariance_matrix: pd.DataFrame,
                                          constraints: Dict[str, Any],
                                          target_return: float) -> np.ndarray:
        """Efficient frontier portfolio for target return"""
        n_assets = len(expected_returns)
        
        # Define optimization variables
        weights = cp.Variable(n_assets)
        
        # Objective: minimize portfolio variance
        portfolio_variance = cp.quad_form(weights, covariance_matrix.values)
        objective = cp.Minimize(portfolio_variance)
        
        # Constraints
        constraint_list = [
            cp.sum(weights) == 1,  # Weights sum to 1
            weights.T @ expected_returns.values == target_return  # Target return
        ]
        
        # Long-only constraint
        if not constraints.get('allow_short', False):
            constraint_list.append(weights >= 0)
        
        # Solve optimization problem
        problem = cp.Problem(objective, constraint_list)
        problem.solve()
        
        if problem.status not in ["infeasible", "unbounded"]:
            return weights.value
        else:
            logger.warning(f"Efficient frontier optimization failed: {problem.status}")
            return np.array([1/n_assets] * n_assets)
    
    async def _black_litterman_optimization(self, expected_returns: pd.Series,
                                          covariance_matrix: pd.DataFrame,
                                          constraints: Dict[str, Any]) -> np.ndarray:
        """Black-Litterman optimization (simplified implementation)"""
        # This is a simplified version - full implementation would require views
        return await self._maximize_sharpe_ratio(expected_returns, covariance_matrix, constraints, 0.02)

class ESGAnalyzer:
    """ESG (Environmental, Social, Governance) analysis"""
    
    def __init__(self):
        self.name = "ESG Analyzer"
        self.esg_weights = {
            'environmental': 0.4,
            'social': 0.3,
            'governance': 0.3
        }
    
    async def calculate_esg_score(self, company_data: Dict[str, Any]) -> ESGMetrics:
        """Calculate comprehensive ESG score"""
        
        # Environmental score
        env_score = await self._calculate_environmental_score(company_data)
        
        # Social score
        social_score = await self._calculate_social_score(company_data)
        
        # Governance score
        gov_score = await self._calculate_governance_score(company_data)
        
        # Overall ESG score
        overall_score = (
            env_score * self.esg_weights['environmental'] +
            social_score * self.esg_weights['social'] +
            gov_score * self.esg_weights['governance']
        )
        
        return ESGMetrics(
            environmental_score=env_score,
            social_score=social_score,
            governance_score=gov_score,
            overall_score=overall_score,
            sector_percentile=0.0,  # Would need sector benchmarking
            controversies_score=company_data.get('controversies_score', 0.0),
            sustainable_development_goals=company_data.get('sdg_alignment', [])
        )
    
    async def _calculate_environmental_score(self, company_data: Dict[str, Any]) -> float:
        """Calculate environmental score"""
        score = 50.0  # Base score
        
        # Carbon emissions
        if 'carbon_intensity' in company_data:
            carbon_intensity = company_data['carbon_intensity']
            # Lower carbon intensity = higher score
            score += max(-25, min(25, (100 - carbon_intensity) / 4))
        
        # Renewable energy usage
        if 'renewable_energy_percentage' in company_data:
            renewable_pct = company_data['renewable_energy_percentage']
            score += renewable_pct * 0.3
        
        # Water usage efficiency
        if 'water_efficiency_score' in company_data:
            water_score = company_data['water_efficiency_score']
            score += water_score * 0.2
        
        # Waste management
        if 'waste_recycling_rate' in company_data:
            recycling_rate = company_data['waste_recycling_rate']
            score += recycling_rate * 0.15
        
        return max(0, min(100, score))
    
    async def _calculate_social_score(self, company_data: Dict[str, Any]) -> float:
        """Calculate social score"""
        score = 50.0  # Base score
        
        # Employee satisfaction
        if 'employee_satisfaction' in company_data:
            satisfaction = company_data['employee_satisfaction']
            score += (satisfaction - 0.5) * 40  # 0.5 = neutral, 1.0 = excellent
        
        # Diversity metrics
        if 'diversity_index' in company_data:
            diversity = company_data['diversity_index']
            score += diversity * 20
        
        # Community investment
        if 'community_investment_percentage' in company_data:
            community_investment = company_data['community_investment_percentage']
            score += community_investment * 100  # As percentage of revenue
        
        # Product safety
        if 'product_safety_score' in company_data:
            safety_score = company_data['product_safety_score']
            score += safety_score * 0.15
        
        return max(0, min(100, score))
    
    async def _calculate_governance_score(self, company_data: Dict[str, Any]) -> float:
        """Calculate governance score"""
        score = 50.0  # Base score
        
        # Board independence
        if 'board_independence_ratio' in company_data:
            independence = company_data['board_independence_ratio']
            score += independence * 25
        
        # Executive compensation alignment
        if 'exec_compensation_ratio' in company_data:
            comp_ratio = company_data['exec_compensation_ratio']
            # Lower ratios are better
            score += max(-15, min(15, (50 - comp_ratio) / 2))
        
        # Transparency score
        if 'transparency_score' in company_data:
            transparency = company_data['transparency_score']
            score += transparency * 0.2
        
        # Anti-corruption measures
        if 'anti_corruption_score' in company_data:
            anti_corruption = company_data['anti_corruption_score']
            score += anti_corruption * 0.15
        
        return max(0, min(100, score))
    
    async def screen_esg_portfolio(self, portfolio: Dict[str, float],
                                 esg_data: Dict[str, ESGMetrics],
                                 min_esg_score: float = 60.0) -> Dict[str, float]:
        """Screen portfolio for ESG compliance"""
        screened_portfolio = {}
        
        for symbol, weight in portfolio.items():
            if symbol in esg_data:
                esg_score = esg_data[symbol].overall_score
                if esg_score >= min_esg_score:
                    screened_portfolio[symbol] = weight
                else:
                    logger.info(f"Excluding {symbol} due to low ESG score: {esg_score:.1f}")
            else:
                logger.warning(f"No ESG data available for {symbol}")
        
        # Renormalize weights
        total_weight = sum(screened_portfolio.values())
        if total_weight > 0:
            screened_portfolio = {
                symbol: weight / total_weight 
                for symbol, weight in screened_portfolio.items()
            }
        
        return screened_portfolio

class RomanianMarketAnalyzer:
    """Romanian market-specific investment analysis"""
    
    def __init__(self):
        self.name = "Romanian Market Analyzer"
        self.bvb_sectors = {
            'banks': ['TLV', 'BRD', 'TGN'],
            'energy': ['SNP', 'EL', 'ROCE'],
            'utilities': ['AQ', 'ELGS'],
            'real_estate': ['DIGI', 'COTE'],
            'consumer': ['ALR', 'ARM']
        }
    
    async def analyze_bvb_opportunities(self, market_data: Dict[str, Any]) -> List[InvestmentRecommendation]:
        """Analyze BVB investment opportunities"""
        recommendations = []
        
        # Analyze major BVB indices
        bet_performance = market_data.get('bet_performance', {})
        
        for sector, symbols in self.bvb_sectors.items():
            sector_recommendation = await self._analyze_sector(sector, symbols, market_data)
            if sector_recommendation:
                recommendations.extend(sector_recommendation)
        
        return recommendations
    
    async def _analyze_sector(self, sector: str, symbols: List[str],
                            market_data: Dict[str, Any]) -> List[InvestmentRecommendation]:
        """Analyze specific sector in Romanian market"""
        recommendations = []
        
        for symbol in symbols:
            if symbol in market_data.get('stock_data', {}):
                stock_data = market_data['stock_data'][symbol]
                
                # Simple momentum analysis
                recent_performance = stock_data.get('1m_return', 0)
                pe_ratio = stock_data.get('pe_ratio', 20)
                
                action = "HOLD"
                confidence = 0.5
                rationale = f"Romanian {sector} sector analysis"
                
                if recent_performance > 0.05 and pe_ratio < 15:
                    action = "BUY"
                    confidence = 0.7
                    rationale = f"Strong momentum and attractive valuation in {sector}"
                elif recent_performance < -0.1 or pe_ratio > 25:
                    action = "SELL"
                    confidence = 0.6
                    rationale = f"Weak performance or overvaluation in {sector}"
                
                recommendations.append(InvestmentRecommendation(
                    symbol=symbol,
                    action=action,
                    target_weight=0.05,  # Default 5% allocation
                    current_weight=0.0,
                    confidence=confidence,
                    rationale=rationale,
                    time_horizon="medium_term",
                    risk_level="moderate"
                ))
        
        return recommendations
    
    async def calculate_romania_specific_metrics(self, portfolio: Dict[str, float]) -> Dict[str, float]:
        """Calculate Romania-specific investment metrics"""
        metrics = {}
        
        # Currency exposure (RON vs EUR/USD)
        ron_exposure = 0.0
        for symbol, weight in portfolio.items():
            if any(symbol in sector_stocks for sector_stocks in self.bvb_sectors.values()):
                ron_exposure += weight
        
        metrics['ron_currency_exposure'] = ron_exposure
        
        # BVB market cap exposure
        bvb_exposure = ron_exposure  # Simplified
        metrics['bvb_market_exposure'] = bvb_exposure
        
        # Sector concentration
        sector_exposure = {}
        for sector, symbols in self.bvb_sectors.items():
            sector_weight = sum(portfolio.get(symbol, 0) for symbol in symbols)
            sector_exposure[sector] = sector_weight
        
        metrics.update(sector_exposure)
        
        return metrics

class InvestmentAnalysisSystem:
    """Main investment analysis system"""
    
    def __init__(self, db_path: str = "investment_analysis.db"):
        self.db_path = db_path
        self.asset_analyzer = AssetAnalyzer()
        self.portfolio_optimizer = PortfolioOptimizer()
        self.esg_analyzer = ESGAnalyzer()
        self.romanian_analyzer = RomanianMarketAnalyzer()
        self.init_database()
    
    def init_database(self):
        """Initialize SQLite database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS portfolio_allocations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    portfolio_id TEXT NOT NULL,
                    optimization_method TEXT NOT NULL,
                    expected_return REAL,
                    expected_volatility REAL,
                    sharpe_ratio REAL,
                    esg_score REAL,
                    allocations TEXT NOT NULL,
                    constraints TEXT,
                    timestamp DATETIME NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS investment_recommendations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    symbol TEXT NOT NULL,
                    action TEXT NOT NULL,
                    target_weight REAL,
                    confidence REAL,
                    rationale TEXT,
                    price_target REAL,
                    recommendation_date DATETIME NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
    
    async def create_optimal_portfolio(self, 
                                     assets: List[str],
                                     price_data: pd.DataFrame,
                                     risk_profile: RiskProfile = RiskProfile.MODERATE,
                                     include_esg: bool = False,
                                     romanian_focus: bool = False) -> PortfolioAllocation:
        """Create optimal portfolio allocation"""
        
        # Calculate expected returns and covariance matrix
        expected_returns = await self.asset_analyzer.calculate_expected_returns(price_data)
        covariance_matrix = await self.asset_analyzer.calculate_covariance_matrix(price_data)
        
        # Set constraints based on risk profile
        constraints = self._get_constraints_for_risk_profile(risk_profile)
        
        # Determine optimization method
        optimization_method = "max_sharpe"
        if risk_profile == RiskProfile.CONSERVATIVE:
            optimization_method = "min_variance"
        elif romanian_focus:
            optimization_method = "efficient_frontier"
            constraints["target_return"] = 0.08  # 8% target for Romanian market
        
        # Optimize portfolio
        allocation = await self.portfolio_optimizer.optimize_portfolio(
            expected_returns, covariance_matrix, optimization_method, constraints
        )
        
        # Apply ESG screening if requested
        if include_esg:
            allocation = await self._apply_esg_screening(allocation, assets)
        
        # Apply Romanian market adjustments
        if romanian_focus:
            allocation = await self._apply_romanian_adjustments(allocation)
        
        # Store in database
        await self._store_portfolio_allocation(allocation)
        
        return allocation
    
    def _get_constraints_for_risk_profile(self, risk_profile: RiskProfile) -> Dict[str, Any]:
        """Get optimization constraints based on risk profile"""
        if risk_profile == RiskProfile.CONSERVATIVE:
            return {
                'min_weight': 0.02,
                'max_weight': 0.25,
                'allow_short': False
            }
        elif risk_profile == RiskProfile.MODERATE:
            return {
                'min_weight': 0.01,
                'max_weight': 0.35,
                'allow_short': False
            }
        elif risk_profile == RiskProfile.AGGRESSIVE:
            return {
                'min_weight': 0.0,
                'max_weight': 0.50,
                'allow_short': False
            }
        else:  # VERY_AGGRESSIVE
            return {
                'min_weight': 0.0,
                'max_weight': 0.70,
                'allow_short': True
            }
    
    async def _apply_esg_screening(self, allocation: PortfolioAllocation,
                                 assets: List[str]) -> PortfolioAllocation:
        """Apply ESG screening to portfolio allocation"""
        # This would require real ESG data
        # For now, just return the original allocation
        allocation.esg_score = 75.0  # Placeholder
        return allocation
    
    async def _apply_romanian_adjustments(self, allocation: PortfolioAllocation) -> PortfolioAllocation:
        """Apply Romanian market-specific adjustments"""
        # Increase allocation to Romanian assets if they exist
        romanian_symbols = []
        for sector_stocks in self.romanian_analyzer.bvb_sectors.values():
            romanian_symbols.extend(sector_stocks)
        
        # This would require more sophisticated logic
        return allocation
    
    async def generate_investment_recommendations(self,
                                                current_portfolio: Dict[str, float],
                                                target_allocation: PortfolioAllocation,
                                                market_data: Dict[str, Any]) -> List[InvestmentRecommendation]:
        """Generate specific investment recommendations"""
        recommendations = []
        
        # Compare current vs target allocations
        for symbol, target_weight in target_allocation.assets.items():
            current_weight = current_portfolio.get(symbol, 0.0)
            weight_diff = target_weight - current_weight
            
            if abs(weight_diff) > 0.01:  # 1% threshold
                action = "BUY" if weight_diff > 0 else "SELL"
                confidence = min(0.9, abs(weight_diff) * 10)  # Higher diff = higher confidence
                
                rationale = f"Rebalance to target allocation: {target_weight:.1%}"
                
                recommendations.append(InvestmentRecommendation(
                    symbol=symbol,
                    action=action,
                    target_weight=target_weight,
                    current_weight=current_weight,
                    confidence=confidence,
                    rationale=rationale,
                    time_horizon="short_term"
                ))
        
        # Add Romanian-specific recommendations
        if market_data:
            romanian_recs = await self.romanian_analyzer.analyze_bvb_opportunities(market_data)
            recommendations.extend(romanian_recs)
        
        # Store recommendations
        for rec in recommendations:
            await self._store_investment_recommendation(rec)
        
        return recommendations
    
    async def backtest_strategy(self, allocation: PortfolioAllocation,
                              historical_data: pd.DataFrame,
                              rebalance_frequency: str = "monthly") -> Dict[str, Any]:
        """Backtest investment strategy"""
        results = {
            'total_return': 0.0,
            'annual_return': 0.0,
            'volatility': 0.0,
            'sharpe_ratio': 0.0,
            'max_drawdown': 0.0,
            'win_rate': 0.0,
            'calmar_ratio': 0.0
        }
        
        if historical_data.empty:
            return results
        
        # Calculate portfolio returns
        weights = np.array(list(allocation.assets.values()))
        asset_returns = historical_data.pct_change().dropna()
        
        # Align weights with available assets
        available_assets = [asset for asset in allocation.assets.keys() 
                          if asset in asset_returns.columns]
        
        if not available_assets:
            return results
        
        aligned_weights = np.array([allocation.assets[asset] for asset in available_assets])
        aligned_returns = asset_returns[available_assets]
        
        # Renormalize weights
        aligned_weights = aligned_weights / aligned_weights.sum()
        
        # Calculate portfolio returns
        portfolio_returns = (aligned_returns * aligned_weights).sum(axis=1)
        
        # Calculate metrics
        total_return = (1 + portfolio_returns).prod() - 1
        annual_return = (1 + total_return) ** (252 / len(portfolio_returns)) - 1
        volatility = portfolio_returns.std() * np.sqrt(252)
        sharpe_ratio = annual_return / volatility if volatility > 0 else 0
        
        # Calculate drawdown
        cumulative_returns = (1 + portfolio_returns).cumprod()
        peak = cumulative_returns.expanding().max()
        drawdown = (cumulative_returns - peak) / peak
        max_drawdown = drawdown.min()
        
        # Win rate
        win_rate = (portfolio_returns > 0).mean()
        
        # Calmar ratio
        calmar_ratio = annual_return / abs(max_drawdown) if max_drawdown != 0 else 0
        
        results.update({
            'total_return': total_return,
            'annual_return': annual_return,
            'volatility': volatility,
            'sharpe_ratio': sharpe_ratio,
            'max_drawdown': max_drawdown,
            'win_rate': win_rate,
            'calmar_ratio': calmar_ratio
        })
        
        return results
    
    async def _store_portfolio_allocation(self, allocation: PortfolioAllocation):
        """Store portfolio allocation in database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO portfolio_allocations 
                (portfolio_id, optimization_method, expected_return, expected_volatility, 
                 sharpe_ratio, esg_score, allocations, constraints, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                'default', allocation.optimization_method, allocation.expected_return,
                allocation.expected_volatility, allocation.sharpe_ratio, allocation.esg_score,
                json.dumps(allocation.assets), json.dumps(allocation.constraints),
                allocation.timestamp
            ))
    
    async def _store_investment_recommendation(self, recommendation: InvestmentRecommendation):
        """Store investment recommendation in database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO investment_recommendations 
                (symbol, action, target_weight, confidence, rationale, price_target, recommendation_date)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                recommendation.symbol, recommendation.action, recommendation.target_weight,
                recommendation.confidence, recommendation.rationale, recommendation.price_target,
                datetime.now()
            ))

# Usage example and testing
async def main():
    """Main function for testing the Investment Analysis System"""
    analysis_system = InvestmentAnalysisSystem()
    
    print("💰 RomAI Investment Analysis System - Testing")
    print("=" * 50)
    
    # Create sample price data
    dates = pd.date_range(start='2023-01-01', end='2024-01-01', freq='D')
    n_assets = 5
    asset_names = ['AAPL', 'GOOGL', 'MSFT', 'TLV', 'BRD']
    
    # Generate realistic price data
    np.random.seed(42)
    price_data = pd.DataFrame(index=dates, columns=asset_names)
    
    for asset in asset_names:
        # Random walk with drift
        returns = np.random.normal(0.001, 0.02, len(dates))
        prices = [100]  # Starting price
        for ret in returns[1:]:
            prices.append(prices[-1] * (1 + ret))
        price_data[asset] = prices[:len(dates)]
    
    print("📊 Testing Portfolio Optimization...")
    
    # Test conservative portfolio
    conservative_allocation = await analysis_system.create_optimal_portfolio(
        assets=asset_names,
        price_data=price_data,
        risk_profile=RiskProfile.CONSERVATIVE
    )
    
    print(f"   Conservative Portfolio:")
    print(f"   Expected Return: {conservative_allocation.expected_return:.2%}")
    print(f"   Expected Volatility: {conservative_allocation.expected_volatility:.2%}")
    print(f"   Sharpe Ratio: {conservative_allocation.sharpe_ratio:.3f}")
    
    # Test aggressive portfolio
    aggressive_allocation = await analysis_system.create_optimal_portfolio(
        assets=asset_names,
        price_data=price_data,
        risk_profile=RiskProfile.AGGRESSIVE
    )
    
    print(f"\n   Aggressive Portfolio:")
    print(f"   Expected Return: {aggressive_allocation.expected_return:.2%}")
    print(f"   Expected Volatility: {aggressive_allocation.expected_volatility:.2%}")
    print(f"   Sharpe Ratio: {aggressive_allocation.sharpe_ratio:.3f}")
    
    # Test Romanian-focused portfolio
    romanian_allocation = await analysis_system.create_optimal_portfolio(
        assets=asset_names,
        price_data=price_data,
        risk_profile=RiskProfile.MODERATE,
        romanian_focus=True
    )
    
    print(f"\n   Romanian-Focused Portfolio:")
    print(f"   Expected Return: {romanian_allocation.expected_return:.2%}")
    print(f"   Sharpe Ratio: {romanian_allocation.sharpe_ratio:.3f}")
    
    # Test investment recommendations
    print("\n📈 Testing Investment Recommendations...")
    current_portfolio = {'AAPL': 0.3, 'GOOGL': 0.2, 'MSFT': 0.5}
    market_data = {
        'stock_data': {
            'TLV': {'1m_return': 0.08, 'pe_ratio': 12},
            'BRD': {'1m_return': -0.02, 'pe_ratio': 18}
        }
    }
    
    recommendations = await analysis_system.generate_investment_recommendations(
        current_portfolio, conservative_allocation, market_data
    )
    
    print(f"   Generated {len(recommendations)} recommendations")
    for rec in recommendations[:3]:  # Show first 3
        print(f"   {rec.symbol}: {rec.action} (confidence: {rec.confidence:.1%})")
    
    # Test backtesting
    print("\n📊 Testing Strategy Backtesting...")
    backtest_results = await analysis_system.backtest_strategy(
        conservative_allocation, price_data
    )
    
    print(f"   Annual Return: {backtest_results['annual_return']:.2%}")
    print(f"   Volatility: {backtest_results['volatility']:.2%}")
    print(f"   Sharpe Ratio: {backtest_results['sharpe_ratio']:.3f}")
    print(f"   Max Drawdown: {backtest_results['max_drawdown']:.2%}")
    
    print("\n✅ Investment Analysis System testing complete!")

if __name__ == "__main__":
    asyncio.run(main())
