"""
RomAI Phase 4.2: BancAI Financial Intelligence - Financial Analysis Engine
Advanced financial AI with regulatory compliance and real-time market analysis.

This module implements comprehensive financial analysis capabilities including:
- Real-time market data analysis and processing
- Risk assessment algorithms and portfolio optimization
- Fraud detection systems with advanced pattern recognition
- Financial forecasting and predictive analytics
- Romanian market-specific financial intelligence

Author: RomAI Development Team
Created: August 2025
License: Proprietary
"""

import asyncio
import logging
import sqlite3
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass, asdict
from enum import Enum
import math
import statistics
from concurrent.futures import ThreadPoolExecutor
import threading
import time
import uuid


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MarketSector(Enum):
    """Market sectors for analysis."""
    BANKING = "banking"
    INSURANCE = "insurance"  
    INVESTMENT = "investment"
    FINTECH = "fintech"
    CRYPTOCURRENCY = "cryptocurrency"
    COMMODITY = "commodity"
    FOREX = "forex"
    BONDS = "bonds"
    EQUITIES = "equities"
    REAL_ESTATE = "real_estate"


class RiskLevel(Enum):
    """Risk assessment levels."""
    VERY_LOW = "very_low"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"
    CRITICAL = "critical"


class FraudAlert(Enum):
    """Fraud alert severity levels."""
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class MarketData:
    """Market data structure."""
    symbol: str
    price: float
    volume: int
    timestamp: datetime
    sector: MarketSector
    change_percent: float
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None


@dataclass
class RiskAssessment:
    """Risk assessment result structure."""
    asset_id: str
    risk_level: RiskLevel
    risk_score: float
    confidence: float
    factors: List[str]
    recommendations: List[str]
    timestamp: datetime


@dataclass
class FraudDetection:
    """Fraud detection result structure."""
    transaction_id: str
    alert_level: FraudAlert
    fraud_probability: float
    risk_indicators: List[str]
    recommended_action: str
    timestamp: datetime


@dataclass
class FinancialForecast:
    """Financial forecast structure."""
    asset_id: str
    forecast_horizon: str
    predicted_value: float
    confidence_interval: Tuple[float, float]
    methodology: str
    timestamp: datetime


class RealTimeMarketAnalyzer:
    """Real-time market data analysis and processing system."""
    
    def __init__(self):
        self.data_cache = {}
        self.analysis_cache = {}
        self.subscribers = []
        self.running = False
        self.update_interval = 5  # seconds
        
    async def start_real_time_analysis(self):
        """Start real-time market analysis."""
        try:
            self.running = True
            logger.info("Starting real-time market analysis")
            
            while self.running:
                await self._fetch_market_data()
                await self._analyze_market_trends()
                await self._notify_subscribers()
                await asyncio.sleep(self.update_interval)
                
        except Exception as e:
            logger.error(f"Error in real-time analysis: {e}")
            
    async def stop_real_time_analysis(self):
        """Stop real-time market analysis."""
        self.running = False
        logger.info("Stopped real-time market analysis")
        
    async def _fetch_market_data(self):
        """Fetch real-time market data."""
        try:
            # Simulate fetching real market data
            # In production, this would connect to actual market data APIs
            symbols = ["BRD", "BCR", "TLV", "BVB", "EUR/RON", "USD/RON"]
            
            for symbol in symbols:
                # Simulate market data
                price = 100 + np.random.normal(0, 5)
                volume = int(np.random.exponential(10000))
                change = np.random.normal(0, 2)
                
                market_data = MarketData(
                    symbol=symbol,
                    price=price,
                    volume=volume,
                    timestamp=datetime.now(),
                    sector=MarketSector.BANKING,
                    change_percent=change
                )
                
                self.data_cache[symbol] = market_data
                
            logger.info(f"Fetched market data for {len(symbols)} symbols")
            
        except Exception as e:
            logger.error(f"Error fetching market data: {e}")
            
    async def _analyze_market_trends(self):
        """Analyze market trends and patterns."""
        try:
            for symbol, data in self.data_cache.items():
                # Technical analysis
                trend = self._calculate_trend(symbol)
                volatility = self._calculate_volatility(symbol)
                momentum = self._calculate_momentum(symbol)
                
                analysis = {
                    "symbol": symbol,
                    "trend": trend,
                    "volatility": volatility,
                    "momentum": momentum,
                    "timestamp": datetime.now(),
                    "recommendation": self._generate_recommendation(trend, volatility, momentum)
                }
                
                self.analysis_cache[symbol] = analysis
                
            logger.info(f"Analyzed trends for {len(self.data_cache)} symbols")
            
        except Exception as e:
            logger.error(f"Error analyzing trends: {e}")
            
    def _calculate_trend(self, symbol: str) -> str:
        """Calculate trend direction."""
        # Simplified trend calculation
        data = self.data_cache.get(symbol)
        if not data:
            return "neutral"
            
        if data.change_percent > 2:
            return "bullish"
        elif data.change_percent < -2:
            return "bearish"
        else:
            return "neutral"
            
    def _calculate_volatility(self, symbol: str) -> float:
        """Calculate volatility measure."""
        # Simplified volatility calculation
        data = self.data_cache.get(symbol)
        if not data:
            return 0.0
            
        return abs(data.change_percent) / 100
        
    def _calculate_momentum(self, symbol: str) -> float:
        """Calculate momentum indicator."""
        # Simplified momentum calculation
        data = self.data_cache.get(symbol)
        if not data:
            return 0.0
            
        return data.change_percent / 100
        
    def _generate_recommendation(self, trend: str, volatility: float, momentum: float) -> str:
        """Generate trading recommendation."""
        if trend == "bullish" and volatility < 0.02:
            return "BUY"
        elif trend == "bearish" and volatility < 0.02:
            return "SELL"
        elif volatility > 0.05:
            return "HOLD - High Volatility"
        else:
            return "HOLD"
            
    async def _notify_subscribers(self):
        """Notify subscribers of market updates."""
        try:
            for subscriber in self.subscribers:
                await subscriber(self.analysis_cache)
        except Exception as e:
            logger.error(f"Error notifying subscribers: {e}")
            
    def subscribe(self, callback):
        """Subscribe to market updates."""
        self.subscribers.append(callback)
        
    def get_market_data(self, symbol: str) -> Optional[MarketData]:
        """Get current market data for symbol."""
        return self.data_cache.get(symbol)
        
    def get_analysis(self, symbol: str) -> Optional[Dict]:
        """Get current analysis for symbol."""
        return self.analysis_cache.get(symbol)


class RiskAssessmentEngine:
    """Advanced risk assessment algorithms and portfolio optimization."""
    
    def __init__(self):
        self.risk_models = {}
        self.portfolio_cache = {}
        
    async def assess_portfolio_risk(self, portfolio: Dict[str, float]) -> RiskAssessment:
        """Assess overall portfolio risk."""
        try:
            logger.info(f"Assessing risk for portfolio with {len(portfolio)} assets")
            
            # Calculate individual asset risks
            asset_risks = []
            total_value = sum(portfolio.values())
            
            for asset_id, value in portfolio.items():
                weight = value / total_value
                asset_risk = await self._assess_individual_risk(asset_id)
                asset_risks.append((asset_risk, weight))
                
            # Calculate weighted portfolio risk
            portfolio_risk = self._calculate_portfolio_risk(asset_risks)
            
            # Determine risk level
            risk_level = self._determine_risk_level(portfolio_risk)
            
            # Generate recommendations
            recommendations = self._generate_risk_recommendations(portfolio_risk, asset_risks)
            
            return RiskAssessment(
                asset_id="PORTFOLIO",
                risk_level=risk_level,
                risk_score=portfolio_risk,
                confidence=0.85,
                factors=self._identify_risk_factors(asset_risks),
                recommendations=recommendations,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error assessing portfolio risk: {e}")
            raise
            
    async def _assess_individual_risk(self, asset_id: str) -> float:
        """Assess risk for individual asset."""
        try:
            # Simplified risk calculation based on volatility and market conditions
            # In production, this would use sophisticated risk models
            
            # Base risk factors
            volatility_risk = np.random.uniform(0.1, 0.8)
            liquidity_risk = np.random.uniform(0.1, 0.6)
            credit_risk = np.random.uniform(0.1, 0.7)
            market_risk = np.random.uniform(0.1, 0.5)
            
            # Weighted risk score
            total_risk = (
                volatility_risk * 0.4 +
                liquidity_risk * 0.2 +
                credit_risk * 0.3 +
                market_risk * 0.1
            )
            
            return min(total_risk, 1.0)
            
        except Exception as e:
            logger.error(f"Error assessing individual risk for {asset_id}: {e}")
            return 0.5  # Default moderate risk
            
    def _calculate_portfolio_risk(self, asset_risks: List[Tuple[float, float]]) -> float:
        """Calculate weighted portfolio risk."""
        try:
            weighted_risk = sum(risk * weight for risk, weight in asset_risks)
            
            # Apply correlation adjustments (simplified)
            correlation_factor = 0.8  # Assume some diversification benefit
            adjusted_risk = weighted_risk * correlation_factor
            
            return min(adjusted_risk, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating portfolio risk: {e}")
            return 0.5
            
    def _determine_risk_level(self, risk_score: float) -> RiskLevel:
        """Determine risk level from risk score."""
        if risk_score < 0.2:
            return RiskLevel.VERY_LOW
        elif risk_score < 0.4:
            return RiskLevel.LOW
        elif risk_score < 0.6:
            return RiskLevel.MODERATE
        elif risk_score < 0.8:
            return RiskLevel.HIGH
        else:
            return RiskLevel.VERY_HIGH
            
    def _identify_risk_factors(self, asset_risks: List[Tuple[float, float]]) -> List[str]:
        """Identify primary risk factors."""
        factors = []
        
        avg_risk = sum(risk for risk, weight in asset_risks) / len(asset_risks)
        
        if avg_risk > 0.7:
            factors.append("High individual asset volatility")
        if len(asset_risks) < 5:
            factors.append("Insufficient diversification")
        if any(weight > 0.3 for risk, weight in asset_risks):
            factors.append("Concentration risk")
            
        return factors
        
    def _generate_risk_recommendations(self, portfolio_risk: float, asset_risks: List[Tuple[float, float]]) -> List[str]:
        """Generate risk management recommendations."""
        recommendations = []
        
        if portfolio_risk > 0.7:
            recommendations.append("Consider reducing position sizes")
            recommendations.append("Add defensive assets to portfolio")
            
        if len(asset_risks) < 10:
            recommendations.append("Increase portfolio diversification")
            
        # Check for concentration
        max_weight = max(weight for risk, weight in asset_risks)
        if max_weight > 0.25:
            recommendations.append("Reduce concentration in largest position")
            
        return recommendations
        
    async def optimize_portfolio(self, assets: List[str], constraints: Dict) -> Dict[str, float]:
        """Optimize portfolio allocation using modern portfolio theory."""
        try:
            logger.info(f"Optimizing portfolio with {len(assets)} assets")
            
            # Simplified optimization (in production, use sophisticated algorithms)
            n_assets = len(assets)
            
            # Equal weight as baseline
            equal_weight = 1.0 / n_assets
            optimized_weights = {}
            
            for asset in assets:
                # Apply some optimization logic
                risk_adjustment = np.random.uniform(0.8, 1.2)
                weight = equal_weight * risk_adjustment
                optimized_weights[asset] = weight
                
            # Normalize to sum to 1
            total_weight = sum(optimized_weights.values())
            for asset in optimized_weights:
                optimized_weights[asset] /= total_weight
                
            logger.info("Portfolio optimization completed")
            return optimized_weights
            
        except Exception as e:
            logger.error(f"Error optimizing portfolio: {e}")
            raise


class FraudDetectionSystem:
    """Advanced fraud detection with pattern recognition."""
    
    def __init__(self):
        self.ml_models = {}
        self.pattern_database = {}
        self.alert_thresholds = {
            FraudAlert.INFO: 0.1,
            FraudAlert.LOW: 0.3,
            FraudAlert.MEDIUM: 0.5,
            FraudAlert.HIGH: 0.7,
            FraudAlert.CRITICAL: 0.9
        }
        
    async def analyze_transaction(self, transaction: Dict) -> FraudDetection:
        """Analyze transaction for fraud indicators."""
        try:
            transaction_id = transaction.get("id", str(uuid.uuid4()))
            logger.info(f"Analyzing transaction {transaction_id} for fraud")
            
            # Extract transaction features
            features = self._extract_transaction_features(transaction)
            
            # Run fraud detection algorithms
            fraud_scores = await self._run_fraud_algorithms(features)
            
            # Calculate overall fraud probability
            fraud_probability = self._calculate_fraud_probability(fraud_scores)
            
            # Determine alert level
            alert_level = self._determine_alert_level(fraud_probability)
            
            # Identify risk indicators
            risk_indicators = self._identify_risk_indicators(features, fraud_scores)
            
            # Generate recommended action
            recommended_action = self._generate_fraud_action(alert_level, fraud_probability)
            
            return FraudDetection(
                transaction_id=transaction_id,
                alert_level=alert_level,
                fraud_probability=fraud_probability,
                risk_indicators=risk_indicators,
                recommended_action=recommended_action,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error analyzing transaction for fraud: {e}")
            raise
            
    def _extract_transaction_features(self, transaction: Dict) -> Dict:
        """Extract features for fraud analysis."""
        try:
            amount = transaction.get("amount", 0)
            timestamp = transaction.get("timestamp", datetime.now())
            location = transaction.get("location", "unknown")
            account_id = transaction.get("account_id", "unknown")
            merchant = transaction.get("merchant", "unknown")
            
            # Time-based features
            hour = timestamp.hour if isinstance(timestamp, datetime) else 12
            is_weekend = timestamp.weekday() >= 5 if isinstance(timestamp, datetime) else False
            
            # Amount-based features
            is_large_amount = amount > 10000  # Threshold for large transactions
            is_round_amount = amount % 100 == 0
            
            features = {
                "amount": amount,
                "hour": hour,
                "is_weekend": is_weekend,
                "is_large_amount": is_large_amount,
                "is_round_amount": is_round_amount,
                "location": location,
                "account_id": account_id,
                "merchant": merchant,
                "timestamp": timestamp
            }
            
            return features
            
        except Exception as e:
            logger.error(f"Error extracting transaction features: {e}")
            return {}
            
    async def _run_fraud_algorithms(self, features: Dict) -> Dict[str, float]:
        """Run various fraud detection algorithms."""
        try:
            scores = {}
            
            # Amount-based anomaly detection
            scores["amount_anomaly"] = self._detect_amount_anomaly(features)
            
            # Time-based pattern analysis
            scores["time_pattern"] = self._detect_time_pattern_anomaly(features)
            
            # Location-based analysis
            scores["location_anomaly"] = self._detect_location_anomaly(features)
            
            # Velocity analysis
            scores["velocity_check"] = self._detect_velocity_anomaly(features)
            
            # Merchant pattern analysis
            scores["merchant_pattern"] = self._detect_merchant_anomaly(features)
            
            return scores
            
        except Exception as e:
            logger.error(f"Error running fraud algorithms: {e}")
            return {}
            
    def _detect_amount_anomaly(self, features: Dict) -> float:
        """Detect anomalies in transaction amount."""
        try:
            amount = features.get("amount", 0)
            
            # Simple anomaly detection based on amount
            if amount > 50000:  # Very large transaction
                return 0.8
            elif amount > 20000:  # Large transaction
                return 0.5
            elif features.get("is_round_amount", False) and amount > 5000:
                return 0.3  # Suspicious round amounts
            else:
                return 0.1
                
        except Exception as e:
            logger.error(f"Error detecting amount anomaly: {e}")
            return 0.0
            
    def _detect_time_pattern_anomaly(self, features: Dict) -> float:
        """Detect anomalies in transaction timing."""
        try:
            hour = features.get("hour", 12)
            is_weekend = features.get("is_weekend", False)
            
            # Unusual time patterns
            if hour < 6 or hour > 23:  # Very early or very late
                return 0.6
            elif is_weekend and features.get("amount", 0) > 10000:
                return 0.4  # Large weekend transactions
            else:
                return 0.1
                
        except Exception as e:
            logger.error(f"Error detecting time pattern anomaly: {e}")
            return 0.0
            
    def _detect_location_anomaly(self, features: Dict) -> float:
        """Detect anomalies in transaction location."""
        try:
            location = features.get("location", "unknown")
            
            # Simple location-based scoring
            if location == "unknown":
                return 0.4
            elif location in ["foreign", "high_risk_country"]:
                return 0.7
            else:
                return 0.1
                
        except Exception as e:
            logger.error(f"Error detecting location anomaly: {e}")
            return 0.0
            
    def _detect_velocity_anomaly(self, features: Dict) -> float:
        """Detect transaction velocity anomalies."""
        try:
            # Simplified velocity check
            # In production, this would analyze transaction frequency
            account_id = features.get("account_id", "unknown")
            
            # Simulate velocity analysis
            if account_id != "unknown":
                # Random velocity score for simulation
                return np.random.uniform(0.1, 0.6)
            else:
                return 0.3
                
        except Exception as e:
            logger.error(f"Error detecting velocity anomaly: {e}")
            return 0.0
            
    def _detect_merchant_anomaly(self, features: Dict) -> float:
        """Detect merchant-related anomalies."""
        try:
            merchant = features.get("merchant", "unknown")
            
            # Simple merchant analysis
            if merchant == "unknown":
                return 0.3
            elif merchant in ["high_risk_merchant", "blacklisted"]:
                return 0.9
            else:
                return 0.1
                
        except Exception as e:
            logger.error(f"Error detecting merchant anomaly: {e}")
            return 0.0
            
    def _calculate_fraud_probability(self, fraud_scores: Dict[str, float]) -> float:
        """Calculate overall fraud probability from individual scores."""
        try:
            if not fraud_scores:
                return 0.0
                
            # Weighted average of fraud scores
            weights = {
                "amount_anomaly": 0.3,
                "time_pattern": 0.2,
                "location_anomaly": 0.2,
                "velocity_check": 0.2,
                "merchant_pattern": 0.1
            }
            
            total_score = 0.0
            total_weight = 0.0
            
            for algorithm, score in fraud_scores.items():
                weight = weights.get(algorithm, 0.1)
                total_score += score * weight
                total_weight += weight
                
            return min(total_score / total_weight if total_weight > 0 else 0.0, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating fraud probability: {e}")
            return 0.0
            
    def _determine_alert_level(self, fraud_probability: float) -> FraudAlert:
        """Determine fraud alert level based on probability."""
        if fraud_probability >= 0.9:
            return FraudAlert.CRITICAL
        elif fraud_probability >= 0.7:
            return FraudAlert.HIGH
        elif fraud_probability >= 0.5:
            return FraudAlert.MEDIUM
        elif fraud_probability >= 0.3:
            return FraudAlert.LOW
        else:
            return FraudAlert.INFO
            
    def _identify_risk_indicators(self, features: Dict, fraud_scores: Dict[str, float]) -> List[str]:
        """Identify specific risk indicators."""
        indicators = []
        
        if fraud_scores.get("amount_anomaly", 0) > 0.5:
            indicators.append("Unusual transaction amount")
            
        if fraud_scores.get("time_pattern", 0) > 0.5:
            indicators.append("Suspicious transaction timing")
            
        if fraud_scores.get("location_anomaly", 0) > 0.5:
            indicators.append("High-risk location")
            
        if fraud_scores.get("velocity_check", 0) > 0.5:
            indicators.append("High transaction velocity")
            
        if fraud_scores.get("merchant_pattern", 0) > 0.5:
            indicators.append("Suspicious merchant")
            
        if features.get("is_large_amount", False):
            indicators.append("Large transaction amount")
            
        return indicators
        
    def _generate_fraud_action(self, alert_level: FraudAlert, fraud_probability: float) -> str:
        """Generate recommended action based on fraud analysis."""
        if alert_level == FraudAlert.CRITICAL:
            return "BLOCK_TRANSACTION - Immediate investigation required"
        elif alert_level == FraudAlert.HIGH:
            return "HOLD_TRANSACTION - Manual review required"
        elif alert_level == FraudAlert.MEDIUM:
            return "FLAG_TRANSACTION - Enhanced monitoring"
        elif alert_level == FraudAlert.LOW:
            return "LOG_TRANSACTION - Standard monitoring"
        else:
            return "APPROVE_TRANSACTION - No action required"


class FinancialForecastingEngine:
    """Financial forecasting and predictive analytics system."""
    
    def __init__(self):
        self.models = {}
        self.historical_data = {}
        
    async def generate_price_forecast(self, asset_id: str, horizon: str = "1_month") -> FinancialForecast:
        """Generate price forecast for asset."""
        try:
            logger.info(f"Generating {horizon} price forecast for {asset_id}")
            
            # Get historical data
            historical_data = await self._get_historical_data(asset_id)
            
            # Apply forecasting model
            forecast_result = await self._apply_forecasting_model(historical_data, horizon)
            
            # Calculate confidence intervals
            confidence_interval = self._calculate_confidence_interval(forecast_result)
            
            return FinancialForecast(
                asset_id=asset_id,
                forecast_horizon=horizon,
                predicted_value=forecast_result["predicted_value"],
                confidence_interval=confidence_interval,
                methodology=forecast_result["methodology"],
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error generating forecast for {asset_id}: {e}")
            raise
            
    async def _get_historical_data(self, asset_id: str) -> List[float]:
        """Get historical price data for asset."""
        try:
            # Simulate historical data
            # In production, this would fetch real historical data
            np.random.seed(42)  # For reproducible results
            
            # Generate synthetic price series
            n_days = 252  # Trading days in a year
            returns = np.random.normal(0.001, 0.02, n_days)  # Daily returns
            prices = [100]  # Starting price
            
            for ret in returns:
                prices.append(prices[-1] * (1 + ret))
                
            return prices
            
        except Exception as e:
            logger.error(f"Error getting historical data for {asset_id}: {e}")
            return []
            
    async def _apply_forecasting_model(self, historical_data: List[float], horizon: str) -> Dict:
        """Apply forecasting model to historical data."""
        try:
            if not historical_data or len(historical_data) < 30:
                raise ValueError("Insufficient historical data for forecasting")
                
            # Simple trend-based forecasting
            # In production, use sophisticated models like ARIMA, LSTM, etc.
            
            # Calculate trend and volatility
            recent_prices = historical_data[-30:]  # Last 30 data points
            trend = (recent_prices[-1] - recent_prices[0]) / len(recent_prices)
            volatility = np.std(np.diff(recent_prices))
            
            # Forecast based on horizon
            horizon_days = self._parse_horizon(horizon)
            
            # Simple linear trend projection with noise
            current_price = historical_data[-1]
            predicted_price = current_price + (trend * horizon_days)
            
            # Add some uncertainty based on volatility
            uncertainty = volatility * math.sqrt(horizon_days)
            
            return {
                "predicted_value": predicted_price,
                "uncertainty": uncertainty,
                "methodology": "Trend-based linear projection",
                "horizon_days": horizon_days
            }
            
        except Exception as e:
            logger.error(f"Error applying forecasting model: {e}")
            raise
            
    def _parse_horizon(self, horizon: str) -> int:
        """Parse horizon string to number of days."""
        horizon_map = {
            "1_day": 1,
            "1_week": 7,
            "1_month": 30,
            "3_months": 90,
            "6_months": 180,
            "1_year": 365
        }
        return horizon_map.get(horizon, 30)
        
    def _calculate_confidence_interval(self, forecast_result: Dict) -> Tuple[float, float]:
        """Calculate confidence interval for forecast."""
        try:
            predicted_value = forecast_result["predicted_value"]
            uncertainty = forecast_result.get("uncertainty", 0)
            
            # 95% confidence interval
            confidence_level = 1.96  # For 95% CI
            
            lower_bound = predicted_value - (confidence_level * uncertainty)
            upper_bound = predicted_value + (confidence_level * uncertainty)
            
            return (lower_bound, upper_bound)
            
        except Exception as e:
            logger.error(f"Error calculating confidence interval: {e}")
            return (0.0, 0.0)


class FinancialAnalysisEngine:
    """Main financial analysis engine coordinating all components."""
    
    def __init__(self, db_path: str = "financial_analysis.db"):
        self.db_path = db_path
        self.market_analyzer = RealTimeMarketAnalyzer()
        self.risk_engine = RiskAssessmentEngine()
        self.fraud_detector = FraudDetectionSystem()
        self.forecasting_engine = FinancialForecastingEngine()
        self._init_database()
        
    def _init_database(self):
        """Initialize SQLite database for financial analysis."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Market data table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS market_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    symbol TEXT NOT NULL,
                    price REAL NOT NULL,
                    volume INTEGER,
                    timestamp TEXT NOT NULL,
                    sector TEXT,
                    change_percent REAL
                )
            """)
            
            # Risk assessments table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS risk_assessments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    asset_id TEXT NOT NULL,
                    risk_level TEXT NOT NULL,
                    risk_score REAL NOT NULL,
                    confidence REAL,
                    factors TEXT,
                    recommendations TEXT,
                    timestamp TEXT NOT NULL
                )
            """)
            
            # Fraud detections table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS fraud_detections (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    transaction_id TEXT NOT NULL,
                    alert_level TEXT NOT NULL,
                    fraud_probability REAL NOT NULL,
                    risk_indicators TEXT,
                    recommended_action TEXT,
                    timestamp TEXT NOT NULL
                )
            """)
            
            # Forecasts table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS forecasts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    asset_id TEXT NOT NULL,
                    forecast_horizon TEXT NOT NULL,
                    predicted_value REAL NOT NULL,
                    confidence_lower REAL,
                    confidence_upper REAL,
                    methodology TEXT,
                    timestamp TEXT NOT NULL
                )
            """)
            
            conn.commit()
            conn.close()
            logger.info("Financial analysis database initialized")
            
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
            
    async def start_analysis_services(self):
        """Start all analysis services."""
        try:
            logger.info("Starting financial analysis services")
            
            # Start real-time market analysis
            await self.market_analyzer.start_real_time_analysis()
            
            logger.info("Financial analysis services started successfully")
            
        except Exception as e:
            logger.error(f"Error starting analysis services: {e}")
            
    async def stop_analysis_services(self):
        """Stop all analysis services."""
        try:
            logger.info("Stopping financial analysis services")
            
            # Stop real-time market analysis
            await self.market_analyzer.stop_real_time_analysis()
            
            logger.info("Financial analysis services stopped successfully")
            
        except Exception as e:
            logger.error(f"Error stopping analysis services: {e}")
            
    async def analyze_investment_opportunity(self, asset_id: str, investment_amount: float) -> Dict:
        """Comprehensive investment opportunity analysis."""
        try:
            logger.info(f"Analyzing investment opportunity: {asset_id} for {investment_amount}")
            
            # Get market data
            market_data = self.market_analyzer.get_market_data(asset_id)
            
            # Risk assessment
            portfolio = {asset_id: investment_amount}
            risk_assessment = await self.risk_engine.assess_portfolio_risk(portfolio)
            
            # Price forecast
            forecast = await self.forecasting_engine.generate_price_forecast(asset_id)
            
            # Generate investment recommendation
            recommendation = self._generate_investment_recommendation(
                market_data, risk_assessment, forecast, investment_amount
            )
            
            # Store analysis
            await self._store_investment_analysis(asset_id, recommendation)
            
            return {
                "asset_id": asset_id,
                "investment_amount": investment_amount,
                "market_data": asdict(market_data) if market_data else None,
                "risk_assessment": asdict(risk_assessment),
                "forecast": asdict(forecast),
                "recommendation": recommendation,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing investment opportunity: {e}")
            raise
            
    def _generate_investment_recommendation(self, market_data, risk_assessment, forecast, amount):
        """Generate comprehensive investment recommendation."""
        try:
            recommendation = {
                "action": "HOLD",
                "confidence": 0.5,
                "reasoning": [],
                "risk_factors": risk_assessment.factors,
                "expected_return": 0.0,
                "time_horizon": "medium_term"
            }
            
            # Analyze risk level
            if risk_assessment.risk_level in [RiskLevel.VERY_HIGH, RiskLevel.CRITICAL]:
                recommendation["action"] = "AVOID"
                recommendation["reasoning"].append("Risk level too high for investment")
                recommendation["confidence"] = 0.8
            elif risk_assessment.risk_level == RiskLevel.VERY_LOW:
                recommendation["action"] = "BUY"
                recommendation["reasoning"].append("Low risk investment opportunity")
                recommendation["confidence"] = 0.7
                
            # Analyze forecast
            if forecast.predicted_value > (amount * 1.1):  # Expected 10%+ return
                if recommendation["action"] != "AVOID":
                    recommendation["action"] = "BUY"
                    recommendation["reasoning"].append("Positive price forecast")
                    recommendation["confidence"] = min(recommendation["confidence"] + 0.2, 1.0)
                    
            # Calculate expected return
            if forecast.predicted_value > 0:
                recommendation["expected_return"] = (forecast.predicted_value - amount) / amount
                
            return recommendation
            
        except Exception as e:
            logger.error(f"Error generating investment recommendation: {e}")
            return {"action": "HOLD", "confidence": 0.5, "reasoning": ["Analysis error"]}
            
    async def _store_investment_analysis(self, asset_id: str, recommendation: Dict):
        """Store investment analysis results."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO investment_analyses 
                (asset_id, action, confidence, reasoning, expected_return, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                asset_id,
                recommendation.get("action", "HOLD"),
                recommendation.get("confidence", 0.5),
                json.dumps(recommendation.get("reasoning", [])),
                recommendation.get("expected_return", 0.0),
                datetime.now().isoformat()
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error storing investment analysis: {e}")
            
    async def process_transaction_fraud_check(self, transaction: Dict) -> FraudDetection:
        """Process transaction through fraud detection system."""
        try:
            logger.info(f"Processing fraud check for transaction: {transaction.get('id', 'unknown')}")
            
            # Run fraud detection
            fraud_result = await self.fraud_detector.analyze_transaction(transaction)
            
            # Store fraud detection result
            await self._store_fraud_detection(fraud_result)
            
            return fraud_result
            
        except Exception as e:
            logger.error(f"Error processing fraud check: {e}")
            raise
            
    async def _store_fraud_detection(self, fraud_result: FraudDetection):
        """Store fraud detection result."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO fraud_detections 
                (transaction_id, alert_level, fraud_probability, risk_indicators, 
                 recommended_action, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                fraud_result.transaction_id,
                fraud_result.alert_level.value,
                fraud_result.fraud_probability,
                json.dumps(fraud_result.risk_indicators),
                fraud_result.recommended_action,
                fraud_result.timestamp.isoformat()
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error storing fraud detection: {e}")
            
    async def get_market_analysis_report(self) -> Dict:
        """Generate comprehensive market analysis report."""
        try:
            logger.info("Generating market analysis report")
            
            # Get current market data
            market_overview = {}
            for symbol in ["BRD", "BCR", "TLV", "BVB", "EUR/RON", "USD/RON"]:
                data = self.market_analyzer.get_market_data(symbol)
                analysis = self.market_analyzer.get_analysis(symbol)
                
                if data and analysis:
                    market_overview[symbol] = {
                        "price": data.price,
                        "change_percent": data.change_percent,
                        "volume": data.volume,
                        "trend": analysis.get("trend"),
                        "recommendation": analysis.get("recommendation")
                    }
                    
            # Generate market summary
            report = {
                "timestamp": datetime.now().isoformat(),
                "market_overview": market_overview,
                "market_sentiment": self._calculate_market_sentiment(market_overview),
                "key_insights": self._generate_market_insights(market_overview),
                "recommendations": self._generate_market_recommendations(market_overview)
            }
            
            return report
            
        except Exception as e:
            logger.error(f"Error generating market analysis report: {e}")
            raise
            
    def _calculate_market_sentiment(self, market_overview: Dict) -> str:
        """Calculate overall market sentiment."""
        try:
            positive_count = 0
            negative_count = 0
            
            for symbol, data in market_overview.items():
                change = data.get("change_percent", 0)
                if change > 1:
                    positive_count += 1
                elif change < -1:
                    negative_count += 1
                    
            if positive_count > negative_count:
                return "Bullish"
            elif negative_count > positive_count:
                return "Bearish"
            else:
                return "Neutral"
                
        except Exception as e:
            logger.error(f"Error calculating market sentiment: {e}")
            return "Neutral"
            
    def _generate_market_insights(self, market_overview: Dict) -> List[str]:
        """Generate key market insights."""
        insights = []
        
        try:
            # Analyze performance
            performers = []
            for symbol, data in market_overview.items():
                change = data.get("change_percent", 0)
                performers.append((symbol, change))
                
            # Sort by performance
            performers.sort(key=lambda x: x[1], reverse=True)
            
            if performers:
                best_performer = performers[0]
                worst_performer = performers[-1]
                
                insights.append(f"Best performer: {best_performer[0]} (+{best_performer[1]:.2f}%)")
                insights.append(f"Worst performer: {worst_performer[0]} ({worst_performer[1]:.2f}%)")
                
            # Analyze volatility
            high_vol_count = sum(1 for symbol, data in market_overview.items() 
                               if abs(data.get("change_percent", 0)) > 3)
            
            if high_vol_count > 0:
                insights.append(f"{high_vol_count} assets showing high volatility")
                
            return insights
            
        except Exception as e:
            logger.error(f"Error generating market insights: {e}")
            return ["Market analysis unavailable"]
            
    def _generate_market_recommendations(self, market_overview: Dict) -> List[str]:
        """Generate market-level recommendations."""
        recommendations = []
        
        try:
            # Count recommendations
            buy_count = sum(1 for symbol, data in market_overview.items() 
                          if data.get("recommendation") == "BUY")
            sell_count = sum(1 for symbol, data in market_overview.items() 
                           if data.get("recommendation") == "SELL")
            
            if buy_count > sell_count:
                recommendations.append("Market showing buying opportunities")
            elif sell_count > buy_count:
                recommendations.append("Exercise caution - multiple sell signals")
            else:
                recommendations.append("Mixed signals - maintain balanced approach")
                
            # General recommendations
            recommendations.append("Monitor regulatory developments in Romanian market")
            recommendations.append("Consider currency exposure for EUR/RON positions")
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating market recommendations: {e}")
            return ["Maintain diversified portfolio"]


# Main execution and testing
async def main():
    """Main function for testing and demonstration."""
    try:
        logger.info("Starting RomAI Financial Analysis Engine Demo")
        
        # Initialize financial analysis engine
        engine = FinancialAnalysisEngine()
        
        # Start analysis services
        await engine.start_analysis_services()
        
        # Simulate some operations
        logger.info("Running demonstration operations...")
        
        # 1. Investment analysis
        investment_analysis = await engine.analyze_investment_opportunity("BRD", 10000)
        logger.info(f"Investment analysis completed: {investment_analysis['recommendation']['action']}")
        
        # 2. Fraud detection
        test_transaction = {
            "id": "TXN123",
            "amount": 25000,
            "timestamp": datetime.now(),
            "location": "foreign",
            "account_id": "ACC456",
            "merchant": "unknown"
        }
        
        fraud_result = await engine.process_transaction_fraud_check(test_transaction)
        logger.info(f"Fraud check completed: {fraud_result.alert_level.value}")
        
        # 3. Market analysis report
        market_report = await engine.get_market_analysis_report()
        logger.info(f"Market sentiment: {market_report['market_sentiment']}")
        
        # Wait a bit for real-time analysis
        await asyncio.sleep(10)
        
        # Stop services
        await engine.stop_analysis_services()
        
        logger.info("Financial Analysis Engine demo completed successfully")
        
    except Exception as e:
        logger.error(f"Error in main demo: {e}")


if __name__ == "__main__":
    asyncio.run(main())
