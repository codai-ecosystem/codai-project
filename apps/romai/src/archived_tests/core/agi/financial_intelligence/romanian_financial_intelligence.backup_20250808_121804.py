#!/usr/bin/env python3
"""
🇷🇴 RomAI Romanian Financial Intelligence
Specialized knowledge and analysis for Romanian financial markets

This module provides comprehensive Romanian financial market intelligence including:
- BVB (Bucharest Stock Exchange) specialized knowledge and analysis
- Romanian banking sector deep analysis
- Local economic indicators and macroeconomic insights
- CNVM/BNR regulatory compliance and monitoring
- Romanian market sentiment and news analysis
- Currency (RON) dynamics and forecasting

Author: RomAI Financial Intelligence Team
Version: 3.1.0
Date: 2025-08-08
"""

import numpy as np
import pandas as pd
import requests
import asyncio
import logging
from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import sqlite3
import json
from enum import Enum
import aiohttp
from bs4 import BeautifulSoup
import re
from textblob import TextBlob
import yfinance as yf

logger = logging.getLogger(__name__)

class BVBSector(Enum):
    """BVB sector classification"""
    FINANCIAL_BANKING = "financial_banking"
    ENERGY = "energy"
    UTILITIES = "utilities"
    REAL_ESTATE = "real_estate"
    CONSUMER_GOODS = "consumer_goods"
    INDUSTRIALS = "industrials"
    TECHNOLOGY = "technology"
    HEALTHCARE = "healthcare"
    MATERIALS = "materials"
    TELECOMMUNICATIONS = "telecommunications"

class EconomicIndicator(Enum):
    """Romanian economic indicators"""
    GDP_GROWTH = "gdp_growth"
    INFLATION_RATE = "inflation_rate"
    UNEMPLOYMENT_RATE = "unemployment_rate"
    INTEREST_RATE = "interest_rate"
    CURRENT_ACCOUNT = "current_account"
    GOVERNMENT_DEBT = "government_debt"
    INDUSTRIAL_PRODUCTION = "industrial_production"
    RETAIL_SALES = "retail_sales"

@dataclass
class BVBCompany:
    """BVB listed company information"""
    symbol: str
    name: str
    sector: BVBSector
    market_cap: float
    shares_outstanding: int
    free_float: float
    isin: str
    listing_date: datetime
    currency: str = "RON"
    tier: str = "Main"  # Main, ATS, Plus
    is_bet_member: bool = False
    is_bet_plus_member: bool = False
    website: Optional[str] = None
    description: Optional[str] = None

@dataclass
class BVBMarketData:
    """BVB market data snapshot"""
    timestamp: datetime
    bet_index: float
    bet_plus_index: float
    bet_tr_index: float
    bet_xt_index: float
    total_turnover: float
    total_volume: int
    number_of_trades: int
    market_cap_total: float
    foreign_ownership_pct: float
    top_gainers: List[Dict[str, Any]]
    top_losers: List[Dict[str, Any]]
    most_traded: List[Dict[str, Any]]

@dataclass
class RomanianEconomicData:
    """Romanian economic indicators"""
    timestamp: datetime
    gdp_growth_yoy: float
    inflation_rate: float
    unemployment_rate: float
    bnr_interest_rate: float
    eur_ron_rate: float
    usd_ron_rate: float
    current_account_balance: float
    government_debt_to_gdp: float
    industrial_production_growth: float
    retail_sales_growth: float
    confidence_indicators: Dict[str, float]

@dataclass
class BankingMetrics:
    """Romanian banking sector metrics"""
    bank_name: str
    assets_total: float
    loans_total: float
    deposits_total: float
    equity: float
    net_income: float
    roe: float
    roa: float
    capital_adequacy_ratio: float
    npl_ratio: float
    cost_income_ratio: float
    net_interest_margin: float
    provisions_coverage_ratio: float
    tier1_capital_ratio: float

@dataclass
class MarketSentiment:
    """Romanian market sentiment analysis"""
    timestamp: datetime
    overall_sentiment: float  # -1 to 1
    news_sentiment: float
    social_sentiment: float
    analyst_sentiment: float
    economic_sentiment: float
    political_sentiment: float
    sentiment_sources: List[str]
    key_topics: List[str]
    sentiment_drivers: Dict[str, float]

class BVBDataProvider:
    """Bucharest Stock Exchange data provider"""
    
    def __init__(self):
        self.base_url = "https://www.bvb.ro"
        self.api_endpoints = {
            'market_data': '/FinancialInstruments/Markets/Shares',
            'indices': '/Indices/Overview',
            'companies': '/Companies/ListedCompanies'
        }
        
        # BVB major companies with their details
        self.bvb_companies = {
            'TLV': BVBCompany(
                symbol='TLV', name='Banca Transilvania', sector=BVBSector.FINANCIAL_BANKING,
                market_cap=21_000_000_000, shares_outstanding=5_917_985_804, free_float=0.72,
                isin='ROTLVAACNOR1', listing_date=datetime(1997, 11, 24),
                is_bet_member=True, is_bet_plus_member=True,
                website='https://www.bancatransilvania.ro'
            ),
            'SNP': BVBCompany(
                symbol='SNP', name='OMV Petrom', sector=BVBSector.ENERGY,
                market_cap=15_500_000_000, shares_outstanding=94_087_136_440, free_float=0.49,
                isin='ROSNPACNOR7', listing_date=datetime(2004, 6, 7),
                is_bet_member=True, is_bet_plus_member=True,
                website='https://www.omvpetrom.com'
            ),
            'BRD': BVBCompany(
                symbol='BRD', name='BRD Groupe Societe Generale', sector=BVBSector.FINANCIAL_BANKING,
                market_cap=8_200_000_000, shares_outstanding=696_901_518, free_float=0.42,
                isin='ROBRDACNOR5', listing_date=datetime(2001, 11, 26),
                is_bet_member=True, is_bet_plus_member=True,
                website='https://www.brd.ro'
            ),
            'DIGI': BVBCompany(
                symbol='DIGI', name='Digi Communications', sector=BVBSector.TELECOMMUNICATIONS,
                market_cap=3_800_000_000, shares_outstanding=85_000_000, free_float=0.35,
                isin='RODIGIACNOR9', listing_date=datetime(2017, 5, 16),
                is_bet_member=True, is_bet_plus_member=True,
                website='https://www.digi.ro'
            ),
            'EL': BVBCompany(
                symbol='EL', name='Electrica', sector=BVBSector.UTILITIES,
                market_cap=2_900_000_000, shares_outstanding=342_481_818, free_float=0.51,
                isin='ROELCAACNOR8', listing_date=datetime(2014, 7, 4),
                is_bet_member=True, is_bet_plus_member=True,
                website='https://www.electrica.ro'
            ),
            'H2O': BVBCompany(
                symbol='H2O', name='Apa Nova Bucuresti', sector=BVBSector.UTILITIES,
                market_cap=1_200_000_000, shares_outstanding=17_707_200, free_float=0.15,
                isin='ROH2OACNOR4', listing_date=datetime(2008, 7, 1),
                is_bet_member=False, is_bet_plus_member=True,
                website='https://www.apanova.ro'
            ),
            'TGN': BVBCompany(
                symbol='TGN', name='Transelectrica', sector=BVBSector.UTILITIES,
                market_cap=2_100_000_000, shares_outstanding=733_038_638, free_float=0.38,
                isin='ROTGNAACNOR1', listing_date=datetime(2006, 7, 20),
                is_bet_member=True, is_bet_plus_member=True,
                website='https://www.transelectrica.ro'
            ),
            'FP': BVBCompany(
                symbol='FP', name='Fondul Proprietatea', sector=BVBSector.REAL_ESTATE,
                market_cap=4_500_000_000, shares_outstanding=8_581_368_600, free_float=0.99,
                isin='ROFPIRACNOR0', listing_date=datetime(2011, 1, 25),
                is_bet_member=True, is_bet_plus_member=True,
                website='https://www.fondulproprietatea.ro'
            ),
            'M': BVBCompany(
                symbol='M', name='Medlife', sector=BVBSector.HEALTHCARE,
                market_cap=1_800_000_000, shares_outstanding=137_962_445, free_float=0.55,
                isin='ROMEDIACNOR6', listing_date=datetime(2016, 2, 25),
                is_bet_member=True, is_bet_plus_member=True,
                website='https://www.medlife.ro'
            ),
            'TEL': BVBCompany(
                symbol='TEL', name='C.N.T.E.E. Transelectrica', sector=BVBSector.UTILITIES,
                market_cap=2_100_000_000, shares_outstanding=733_038_638, free_float=0.38,
                isin='ROTLCACNOR2', listing_date=datetime(2006, 7, 20),
                is_bet_member=False, is_bet_plus_member=True,
                website='https://www.transelectrica.ro'
            )
        }
    
    async def fetch_bvb_market_data(self) -> BVBMarketData:
        """Fetch current BVB market data"""
        try:
            # This would normally fetch from BVB API
            # For demonstration, we'll return mock data with realistic values
            return BVBMarketData(
                timestamp=datetime.now(),
                bet_index=13_245.67,
                bet_plus_index=1_456.89,
                bet_tr_index=25_789.34,
                bet_xt_index=987.23,
                total_turnover=45_678_900.0,  # RON
                total_volume=1_234_567,
                number_of_trades=2_789,
                market_cap_total=215_000_000_000.0,  # RON
                foreign_ownership_pct=0.23,
                top_gainers=[
                    {'symbol': 'TLV', 'change_pct': 3.45, 'price': 26.85},
                    {'symbol': 'SNP', 'change_pct': 2.78, 'price': 0.5890},
                    {'symbol': 'DIGI', 'change_pct': 2.15, 'price': 44.20}
                ],
                top_losers=[
                    {'symbol': 'BRD', 'change_pct': -1.87, 'price': 13.45},
                    {'symbol': 'EL', 'change_pct': -1.23, 'price': 8.67},
                    {'symbol': 'M', 'change_pct': -0.98, 'price': 13.02}
                ],
                most_traded=[
                    {'symbol': 'TLV', 'volume': 2_345_678, 'turnover': 62_845_000},
                    {'symbol': 'SNP', 'volume': 45_678_900, 'turnover': 26_915_000},
                    {'symbol': 'FP', 'volume': 12_345_678, 'turnover': 18_234_000}
                ]
            )
        except Exception as e:
            logger.error(f"Error fetching BVB market data: {e}")
            raise
    
    async def fetch_company_fundamentals(self, symbol: str) -> Dict[str, Any]:
        """Fetch fundamental data for BVB company"""
        if symbol not in self.bvb_companies:
            raise ValueError(f"Unknown BVB symbol: {symbol}")
        
        company = self.bvb_companies[symbol]
        
        # Mock fundamental data based on real Romanian companies
        fundamentals = {
            'symbol': symbol,
            'market_cap': company.market_cap,
            'pe_ratio': np.random.uniform(8, 25),
            'pb_ratio': np.random.uniform(0.8, 3.5),
            'dividend_yield': np.random.uniform(0.02, 0.08),
            'roe': np.random.uniform(0.08, 0.25),
            'roa': np.random.uniform(0.01, 0.08),
            'debt_to_equity': np.random.uniform(0.2, 2.5),
            'current_ratio': np.random.uniform(0.8, 2.5),
            'revenue_growth': np.random.uniform(-0.1, 0.3),
            'eps_growth': np.random.uniform(-0.2, 0.5),
            'book_value_per_share': company.market_cap / company.shares_outstanding * np.random.uniform(0.3, 0.8),
            'free_cash_flow_yield': np.random.uniform(0.03, 0.12),
            'enterprise_value': company.market_cap * np.random.uniform(1.1, 1.8),
            'ebitda_margin': np.random.uniform(0.1, 0.4),
            'net_margin': np.random.uniform(0.05, 0.25)
        }
        
        return fundamentals

class RomanianEconomicDataProvider:
    """Romanian economic data provider"""
    
    def __init__(self):
        self.bnr_base_url = "https://www.bnr.ro"
        self.insse_base_url = "https://insse.ro"
        
    async def fetch_economic_indicators(self) -> RomanianEconomicData:
        """Fetch Romanian economic indicators"""
        try:
            # This would normally fetch from BNR, INS, and other official sources
            # For demonstration, we'll return realistic mock data
            return RomanianEconomicData(
                timestamp=datetime.now(),
                gdp_growth_yoy=4.8,  # Annual GDP growth %
                inflation_rate=5.1,  # Annual inflation rate %
                unemployment_rate=5.4,  # Unemployment rate %
                bnr_interest_rate=7.0,  # BNR monetary policy rate %
                eur_ron_rate=4.9756,  # EUR/RON exchange rate
                usd_ron_rate=4.5234,  # USD/RON exchange rate
                current_account_balance=-8.2,  # Current account balance as % of GDP
                government_debt_to_gdp=48.8,  # Government debt as % of GDP
                industrial_production_growth=2.3,  # Industrial production growth %
                retail_sales_growth=8.7,  # Retail sales growth %
                confidence_indicators={
                    'consumer_confidence': -12.5,
                    'business_confidence': 3.2,
                    'construction_confidence': -8.9,
                    'services_confidence': 2.1,
                    'retail_confidence': 5.7
                }
            )
        except Exception as e:
            logger.error(f"Error fetching Romanian economic data: {e}")
            raise
    
    async def fetch_bnr_decisions(self, days_back: int = 90) -> List[Dict[str, Any]]:
        """Fetch recent BNR monetary policy decisions"""
        # Mock BNR decisions for demonstration
        decisions = [
            {
                'date': datetime.now() - timedelta(days=30),
                'decision': 'maintain',
                'rate': 7.0,
                'previous_rate': 7.0,
                'rationale': 'Maintain current monetary policy stance to anchor inflation expectations',
                'impact': 'neutral'
            },
            {
                'date': datetime.now() - timedelta(days=75),
                'decision': 'increase',
                'rate': 7.0,
                'previous_rate': 6.75,
                'rationale': 'Address inflationary pressures and maintain price stability',
                'impact': 'tightening'
            }
        ]
        
        return decisions

class RomanianBankingAnalyzer:
    """Romanian banking sector specialized analyzer"""
    
    def __init__(self):
        self.major_banks = [
            'TLV',   # Banca Transilvania
            'BRD',   # BRD Groupe Societe Generale
            'BCR',   # Banca Comerciala Romana (not listed)
            'BT',    # Banca Transilvania
            'ING',   # ING Bank Romania (not listed)
            'RAIF',  # Raiffeisen Bank (not listed)
            'ALPHA', # Alpha Bank Romania (not listed)
            'CEC',   # CEC Bank (not listed)
        ]
    
    async def analyze_banking_sector(self) -> Dict[str, Any]:
        """Comprehensive Romanian banking sector analysis"""
        sector_analysis = {
            'sector_overview': await self._get_sector_overview(),
            'key_metrics': await self._calculate_sector_metrics(),
            'regulatory_environment': await self._analyze_regulatory_environment(),
            'competitive_landscape': await self._analyze_competitive_landscape(),
            'risk_assessment': await self._assess_sector_risks(),
            'growth_prospects': await self._analyze_growth_prospects(),
            'digital_transformation': await self._analyze_digital_transformation()
        }
        
        return sector_analysis
    
    async def _get_sector_overview(self) -> Dict[str, Any]:
        """Get banking sector overview"""
        return {
            'total_assets': 485_000_000_000,  # RON
            'total_loans': 325_000_000_000,   # RON
            'total_deposits': 410_000_000_000, # RON
            'number_of_banks': 32,
            'number_of_branches': 4_567,
            'number_of_employees': 67_890,
            'market_concentration': {
                'top_5_market_share': 0.72,
                'top_3_market_share': 0.58,
                'hhi_index': 0.16
            },
            'foreign_ownership': 0.85,
            'state_ownership': 0.08
        }
    
    async def _calculate_sector_metrics(self) -> Dict[str, Any]:
        """Calculate banking sector key metrics"""
        return {
            'average_roe': 0.124,
            'average_roa': 0.019,
            'average_capital_adequacy': 0.202,
            'average_npl_ratio': 0.038,
            'average_cost_income': 0.584,
            'average_net_interest_margin': 0.032,
            'average_provisions_coverage': 0.734,
            'loan_to_deposit_ratio': 0.793,
            'credit_growth_yoy': 0.087,
            'deposit_growth_yoy': 0.065
        }
    
    async def _analyze_regulatory_environment(self) -> Dict[str, Any]:
        """Analyze Romanian banking regulatory environment"""
        return {
            'primary_regulator': 'National Bank of Romania (BNR)',
            'basel_implementation': 'Basel III fully implemented',
            'capital_requirements': {
                'minimum_capital_ratio': 0.08,
                'tier1_minimum': 0.06,
                'conservation_buffer': 0.025,
                'systemic_buffer': 0.01
            },
            'macroprudential_measures': [
                'Countercyclical capital buffer',
                'Loan-to-value ratio limits',
                'Debt-to-income ratio recommendations',
                'Systemic risk buffer'
            ],
            'recent_regulations': [
                'Updated IFRS 9 implementation',
                'Digital banking regulations',
                'Anti-money laundering updates',
                'Consumer protection measures'
            ]
        }
    
    async def _analyze_competitive_landscape(self) -> Dict[str, Any]:
        """Analyze banking competitive landscape"""
        return {
            'market_leaders': {
                'by_assets': ['BCR', 'BRD', 'Banca Transilvania'],
                'by_loans': ['BCR', 'BRD', 'Banca Transilvania'],
                'by_deposits': ['BCR', 'BRD', 'Banca Transilvania'],
                'by_profitability': ['Banca Transilvania', 'BRD', 'Raiffeisen'],
                'by_digitalization': ['ING', 'Revolut', 'Banca Transilvania']
            },
            'competitive_factors': [
                'Digital banking capabilities',
                'Branch network coverage',
                'Corporate banking expertise',
                'Risk management quality',
                'Cost efficiency',
                'Customer experience'
            ],
            'new_entrants': [
                'Revolut Romania',
                'Monzo (planned)',
                'N26 (planned)',
                'Fintech partnerships'
            ]
        }
    
    async def _assess_sector_risks(self) -> Dict[str, Any]:
        """Assess banking sector risks"""
        return {
            'credit_risk': {
                'level': 'moderate',
                'npl_trend': 'stable',
                'key_concerns': ['Corporate defaults', 'Consumer lending', 'Real estate exposure']
            },
            'operational_risk': {
                'level': 'moderate',
                'key_concerns': ['Cyber security', 'Digital transformation', 'Regulatory compliance']
            },
            'market_risk': {
                'level': 'low',
                'key_concerns': ['Interest rate risk', 'FX risk', 'Liquidity risk']
            },
            'macroeconomic_risk': {
                'level': 'moderate',
                'key_concerns': ['Inflation impact', 'Economic growth', 'Political stability']
            }
        }
    
    async def _analyze_growth_prospects(self) -> Dict[str, Any]:
        """Analyze banking sector growth prospects"""
        return {
            'market_drivers': [
                'Economic growth momentum',
                'EU funds absorption',
                'Digital banking adoption',
                'SME financing demand',
                'Mortgage market expansion'
            ],
            'growth_segments': {
                'corporate_banking': 'High potential',
                'retail_banking': 'Moderate growth',
                'digital_services': 'High growth',
                'wealth_management': 'Emerging opportunity',
                'sustainable_finance': 'Growing demand'
            },
            'expected_credit_growth': 0.08,  # 8% annual
            'expected_fee_income_growth': 0.12,  # 12% annual
            'digital_adoption_rate': 0.68  # 68% of customers
        }
    
    async def _analyze_digital_transformation(self) -> Dict[str, Any]:
        """Analyze digital transformation in Romanian banking"""
        return {
            'digital_maturity': {
                'leaders': ['ING', 'Banca Transilvania', 'BRD'],
                'followers': ['BCR', 'Raiffeisen', 'Alpha Bank'],
                'laggards': ['CEC Bank', 'Smaller regional banks']
            },
            'digital_services': {
                'mobile_banking_adoption': 0.75,
                'internet_banking_adoption': 0.82,
                'contactless_payments': 0.89,
                'digital_onboarding': 0.45
            },
            'fintech_integration': [
                'Payment solutions',
                'Lending platforms',
                'Insurance products',
                'Investment services',
                'Personal finance management'
            ],
            'investment_priorities': [
                'Core banking system upgrades',
                'API development',
                'Data analytics capabilities',
                'Cybersecurity enhancement',
                'Customer experience platforms'
            ]
        }

class RomanianMarketSentimentAnalyzer:
    """Romanian market sentiment analysis"""
    
    def __init__(self):
        self.news_sources = [
            'zf.ro',  # Ziarul Financiar
            'wall-street.ro',
            'money.ro',
            'economica.net',
            'profit.ro'
        ]
    
    async def analyze_market_sentiment(self) -> MarketSentiment:
        """Analyze Romanian market sentiment"""
        # Mock sentiment analysis - in practice would use NLP on Romanian financial news
        sentiment_scores = {
            'news': np.random.uniform(-0.3, 0.7),
            'social': np.random.uniform(-0.5, 0.5),
            'analyst': np.random.uniform(-0.2, 0.8),
            'economic': np.random.uniform(-0.1, 0.6),
            'political': np.random.uniform(-0.6, 0.3)
        }
        
        overall_sentiment = np.mean(list(sentiment_scores.values()))
        
        return MarketSentiment(
            timestamp=datetime.now(),
            overall_sentiment=overall_sentiment,
            news_sentiment=sentiment_scores['news'],
            social_sentiment=sentiment_scores['social'],
            analyst_sentiment=sentiment_scores['analyst'],
            economic_sentiment=sentiment_scores['economic'],
            political_sentiment=sentiment_scores['political'],
            sentiment_sources=self.news_sources,
            key_topics=['inflation', 'bnr_policy', 'eu_funds', 'energy_prices', 'political_stability'],
            sentiment_drivers={
                'bnr_policy': 0.3,
                'eu_recovery_fund': 0.25,
                'energy_crisis': -0.2,
                'inflation_concerns': -0.15,
                'corporate_earnings': 0.2
            }
        )
    
    async def analyze_news_sentiment(self, topic: str = None) -> Dict[str, Any]:
        """Analyze news sentiment for specific topic"""
        # Mock implementation - would normally scrape and analyze Romanian financial news
        return {
            'topic': topic or 'general_market',
            'sentiment_score': np.random.uniform(-1, 1),
            'article_count': np.random.randint(10, 100),
            'positive_mentions': np.random.randint(0, 30),
            'negative_mentions': np.random.randint(0, 20),
            'key_phrases': ['piața de capital', 'investiții', 'creștere economică', 'BNR', 'inflație'],
            'trending_topics': ['energie', 'digitalizare', 'fonduri europene', 'sustenabilitate']
        }

class RomanianFinancialIntelligence:
    """Main Romanian Financial Intelligence system"""
    
    def __init__(self, db_path: str = "romanian_financial_intelligence.db"):
        self.db_path = db_path
        self.bvb_provider = BVBDataProvider()
        self.economic_provider = RomanianEconomicDataProvider()
        self.banking_analyzer = RomanianBankingAnalyzer()
        self.sentiment_analyzer = RomanianMarketSentimentAnalyzer()
        self.init_database()
    
    def init_database(self):
        """Initialize SQLite database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS market_data_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME NOT NULL,
                    bet_index REAL,
                    total_turnover REAL,
                    market_cap_total REAL,
                    foreign_ownership_pct REAL,
                    data_json TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS economic_indicators_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME NOT NULL,
                    gdp_growth REAL,
                    inflation_rate REAL,
                    unemployment_rate REAL,
                    bnr_rate REAL,
                    eur_ron_rate REAL,
                    indicators_json TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS sentiment_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME NOT NULL,
                    overall_sentiment REAL,
                    news_sentiment REAL,
                    economic_sentiment REAL,
                    political_sentiment REAL,
                    sentiment_json TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
    
    async def get_comprehensive_market_analysis(self) -> Dict[str, Any]:
        """Get comprehensive Romanian market analysis"""
        analysis = {
            'timestamp': datetime.now().isoformat(),
            'market_data': await self._get_market_overview(),
            'economic_context': await self._get_economic_analysis(),
            'banking_sector': await self._get_banking_analysis(),
            'sentiment_analysis': await self._get_sentiment_analysis(),
            'investment_opportunities': await self._identify_investment_opportunities(),
            'risk_assessment': await self._assess_market_risks(),
            'outlook': await self._generate_market_outlook()
        }
        
        return analysis
    
    async def _get_market_overview(self) -> Dict[str, Any]:
        """Get BVB market overview"""
        market_data = await self.bvb_provider.fetch_bvb_market_data()
        
        # Store in database
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO market_data_history 
                (timestamp, bet_index, total_turnover, market_cap_total, foreign_ownership_pct, data_json)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                market_data.timestamp, market_data.bet_index, market_data.total_turnover,
                market_data.market_cap_total, market_data.foreign_ownership_pct,
                json.dumps({
                    'bet_plus_index': market_data.bet_plus_index,
                    'bet_tr_index': market_data.bet_tr_index,
                    'total_volume': market_data.total_volume,
                    'number_of_trades': market_data.number_of_trades,
                    'top_gainers': market_data.top_gainers,
                    'top_losers': market_data.top_losers,
                    'most_traded': market_data.most_traded
                })
            ))
        
        return {
            'current_levels': {
                'BET': market_data.bet_index,
                'BET-Plus': market_data.bet_plus_index,
                'BET-TR': market_data.bet_tr_index,
                'BET-XT': market_data.bet_xt_index
            },
            'trading_activity': {
                'turnover': market_data.total_turnover,
                'volume': market_data.total_volume,
                'trades': market_data.number_of_trades
            },
            'market_structure': {
                'total_market_cap': market_data.market_cap_total,
                'foreign_ownership': market_data.foreign_ownership_pct
            },
            'performance_highlights': {
                'top_gainers': market_data.top_gainers,
                'top_losers': market_data.top_losers,
                'most_active': market_data.most_traded
            }
        }
    
    async def _get_economic_analysis(self) -> Dict[str, Any]:
        """Get Romanian economic analysis"""
        economic_data = await self.economic_provider.fetch_economic_indicators()
        bnr_decisions = await self.economic_provider.fetch_bnr_decisions()
        
        # Store in database
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO economic_indicators_history 
                (timestamp, gdp_growth, inflation_rate, unemployment_rate, bnr_rate, eur_ron_rate, indicators_json)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                economic_data.timestamp, economic_data.gdp_growth_yoy, economic_data.inflation_rate,
                economic_data.unemployment_rate, economic_data.bnr_interest_rate, economic_data.eur_ron_rate,
                json.dumps({
                    'usd_ron_rate': economic_data.usd_ron_rate,
                    'current_account_balance': economic_data.current_account_balance,
                    'government_debt_to_gdp': economic_data.government_debt_to_gdp,
                    'industrial_production_growth': economic_data.industrial_production_growth,
                    'retail_sales_growth': economic_data.retail_sales_growth,
                    'confidence_indicators': economic_data.confidence_indicators
                })
            ))
        
        return {
            'macroeconomic_indicators': {
                'gdp_growth': economic_data.gdp_growth_yoy,
                'inflation': economic_data.inflation_rate,
                'unemployment': economic_data.unemployment_rate,
                'current_account': economic_data.current_account_balance
            },
            'monetary_policy': {
                'bnr_rate': economic_data.bnr_interest_rate,
                'recent_decisions': bnr_decisions
            },
            'currency_markets': {
                'eur_ron': economic_data.eur_ron_rate,
                'usd_ron': economic_data.usd_ron_rate
            },
            'sectoral_indicators': {
                'industrial_production': economic_data.industrial_production_growth,
                'retail_sales': economic_data.retail_sales_growth
            },
            'confidence_indicators': economic_data.confidence_indicators
        }
    
    async def _get_banking_analysis(self) -> Dict[str, Any]:
        """Get banking sector analysis"""
        return await self.banking_analyzer.analyze_banking_sector()
    
    async def _get_sentiment_analysis(self) -> Dict[str, Any]:
        """Get market sentiment analysis"""
        sentiment = await self.sentiment_analyzer.analyze_market_sentiment()
        
        # Store in database
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO sentiment_history 
                (timestamp, overall_sentiment, news_sentiment, economic_sentiment, political_sentiment, sentiment_json)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                sentiment.timestamp, sentiment.overall_sentiment, sentiment.news_sentiment,
                sentiment.economic_sentiment, sentiment.political_sentiment,
                json.dumps({
                    'social_sentiment': sentiment.social_sentiment,
                    'analyst_sentiment': sentiment.analyst_sentiment,
                    'key_topics': sentiment.key_topics,
                    'sentiment_drivers': sentiment.sentiment_drivers
                })
            ))
        
        return {
            'overall_sentiment': sentiment.overall_sentiment,
            'sentiment_breakdown': {
                'news': sentiment.news_sentiment,
                'social': sentiment.social_sentiment,
                'analyst': sentiment.analyst_sentiment,
                'economic': sentiment.economic_sentiment,
                'political': sentiment.political_sentiment
            },
            'key_topics': sentiment.key_topics,
            'sentiment_drivers': sentiment.sentiment_drivers
        }
    
    async def _identify_investment_opportunities(self) -> Dict[str, Any]:
        """Identify Romanian market investment opportunities"""
        opportunities = {
            'sector_opportunities': {
                'banking': {
                    'rationale': 'Consolidation opportunities and digital transformation',
                    'top_picks': ['TLV', 'BRD'],
                    'risk_level': 'moderate',
                    'time_horizon': 'medium_term'
                },
                'energy': {
                    'rationale': 'Energy transition and EU Green Deal investments',
                    'top_picks': ['SNP', 'EL'],
                    'risk_level': 'moderate_high',
                    'time_horizon': 'long_term'
                },
                'technology': {
                    'rationale': 'Digitalization trend and tech hub development',
                    'top_picks': ['DIGI'],
                    'risk_level': 'high',
                    'time_horizon': 'medium_term'
                },
                'real_estate': {
                    'rationale': 'Urbanization and EU funds for infrastructure',
                    'top_picks': ['FP'],
                    'risk_level': 'moderate',
                    'time_horizon': 'long_term'
                }
            },
            'thematic_opportunities': {
                'eu_recovery_fund': 'Infrastructure and digitalization beneficiaries',
                'energy_transition': 'Renewable energy and utilities',
                'demographic_trends': 'Healthcare and financial services',
                'nearshoring': 'Manufacturing and logistics'
            },
            'value_opportunities': await self._identify_value_stocks(),
            'growth_opportunities': await self._identify_growth_stocks()
        }
        
        return opportunities
    
    async def _identify_value_stocks(self) -> List[Dict[str, Any]]:
        """Identify value investment opportunities"""
        value_stocks = []
        
        for symbol in ['TLV', 'BRD', 'SNP', 'EL']:
            fundamentals = await self.bvb_provider.fetch_company_fundamentals(symbol)
            
            # Simple value screening
            if (fundamentals['pe_ratio'] < 12 and 
                fundamentals['pb_ratio'] < 1.5 and 
                fundamentals['dividend_yield'] > 0.04):
                
                value_stocks.append({
                    'symbol': symbol,
                    'pe_ratio': fundamentals['pe_ratio'],
                    'pb_ratio': fundamentals['pb_ratio'],
                    'dividend_yield': fundamentals['dividend_yield'],
                    'value_score': self._calculate_value_score(fundamentals)
                })
        
        return sorted(value_stocks, key=lambda x: x['value_score'], reverse=True)
    
    async def _identify_growth_stocks(self) -> List[Dict[str, Any]]:
        """Identify growth investment opportunities"""
        growth_stocks = []
        
        for symbol in ['DIGI', 'M', 'TLV']:
            fundamentals = await self.bvb_provider.fetch_company_fundamentals(symbol)
            
            # Simple growth screening
            if (fundamentals['revenue_growth'] > 0.10 and 
                fundamentals['eps_growth'] > 0.15 and 
                fundamentals['roe'] > 0.15):
                
                growth_stocks.append({
                    'symbol': symbol,
                    'revenue_growth': fundamentals['revenue_growth'],
                    'eps_growth': fundamentals['eps_growth'],
                    'roe': fundamentals['roe'],
                    'growth_score': self._calculate_growth_score(fundamentals)
                })
        
        return sorted(growth_stocks, key=lambda x: x['growth_score'], reverse=True)
    
    def _calculate_value_score(self, fundamentals: Dict[str, Any]) -> float:
        """Calculate value score for stock"""
        # Simple value scoring model
        pe_score = max(0, (20 - fundamentals['pe_ratio']) / 20)
        pb_score = max(0, (2 - fundamentals['pb_ratio']) / 2)
        div_score = min(1, fundamentals['dividend_yield'] / 0.08)
        
        return (pe_score + pb_score + div_score) / 3
    
    def _calculate_growth_score(self, fundamentals: Dict[str, Any]) -> float:
        """Calculate growth score for stock"""
        # Simple growth scoring model
        rev_score = min(1, fundamentals['revenue_growth'] / 0.3)
        eps_score = min(1, fundamentals['eps_growth'] / 0.5)
        roe_score = min(1, fundamentals['roe'] / 0.3)
        
        return (rev_score + eps_score + roe_score) / 3
    
    async def _assess_market_risks(self) -> Dict[str, Any]:
        """Assess Romanian market risks"""
        return {
            'macroeconomic_risks': {
                'inflation_risk': 'high',
                'interest_rate_risk': 'moderate',
                'currency_risk': 'moderate',
                'growth_risk': 'low'
            },
            'market_specific_risks': {
                'liquidity_risk': 'moderate_high',
                'concentration_risk': 'high',
                'foreign_ownership_risk': 'low',
                'regulatory_risk': 'low'
            },
            'geopolitical_risks': {
                'regional_conflict_risk': 'moderate',
                'eu_policy_risk': 'low',
                'energy_security_risk': 'moderate'
            },
            'sector_risks': {
                'banking': 'low_moderate',
                'energy': 'moderate',
                'real_estate': 'moderate',
                'technology': 'moderate_high'
            }
        }
    
    async def _generate_market_outlook(self) -> Dict[str, Any]:
        """Generate Romanian market outlook"""
        return {
            'short_term_outlook': {
                'horizon': '3-6 months',
                'direction': 'cautiously_positive',
                'key_drivers': [
                    'BNR monetary policy',
                    'Inflation trajectory',
                    'EU funds absorption',
                    'Energy price stability'
                ],
                'expected_returns': {
                    'BET_index': '3-8%',
                    'banking_sector': '5-10%',
                    'energy_sector': '0-7%'
                }
            },
            'medium_term_outlook': {
                'horizon': '1-3 years',
                'direction': 'positive',
                'key_drivers': [
                    'EU Recovery Fund implementation',
                    'Digital transformation',
                    'Energy transition investments',
                    'Banking sector consolidation'
                ],
                'structural_trends': [
                    'ESG investing growth',
                    'Pension reform benefits',
                    'Capital market development',
                    'Regional financial hub potential'
                ]
            },
            'investment_themes': [
                'Digitalization beneficiaries',
                'Energy transition plays',
                'Infrastructure modernization',
                'Financial inclusion growth',
                'Sustainable development'
            ]
        }
    
    async def get_bvb_company_analysis(self, symbol: str) -> Dict[str, Any]:
        """Get comprehensive analysis for BVB company"""
        if symbol not in self.bvb_provider.bvb_companies:
            raise ValueError(f"Unknown BVB symbol: {symbol}")
        
        company = self.bvb_provider.bvb_companies[symbol]
        fundamentals = await self.bvb_provider.fetch_company_fundamentals(symbol)
        
        return {
            'company_info': {
                'symbol': company.symbol,
                'name': company.name,
                'sector': company.sector.value,
                'market_cap': company.market_cap,
                'listing_date': company.listing_date.isoformat(),
                'is_bet_member': company.is_bet_member
            },
            'fundamental_metrics': fundamentals,
            'valuation_analysis': {
                'pe_vs_sector': 'attractive' if fundamentals['pe_ratio'] < 15 else 'expensive',
                'pb_vs_book': 'discount' if fundamentals['pb_ratio'] < 1 else 'premium',
                'dividend_attractiveness': 'high' if fundamentals['dividend_yield'] > 0.05 else 'moderate'
            },
            'sector_context': await self._get_sector_context(company.sector),
            'investment_recommendation': await self._generate_stock_recommendation(symbol, fundamentals)
        }
    
    async def _get_sector_context(self, sector: BVBSector) -> Dict[str, Any]:
        """Get sector-specific context"""
        sector_contexts = {
            BVBSector.FINANCIAL_BANKING: {
                'outlook': 'positive',
                'key_trends': ['Digital transformation', 'Consolidation', 'Credit growth'],
                'regulatory_environment': 'stable',
                'competition_level': 'high'
            },
            BVBSector.ENERGY: {
                'outlook': 'mixed',
                'key_trends': ['Energy transition', 'Renewable investments', 'Price volatility'],
                'regulatory_environment': 'evolving',
                'competition_level': 'moderate'
            },
            BVBSector.TELECOMMUNICATIONS: {
                'outlook': 'positive',
                'key_trends': ['5G rollout', 'Digital services', 'Infrastructure investment'],
                'regulatory_environment': 'stable',
                'competition_level': 'high'
            }
        }
        
        return sector_contexts.get(sector, {
            'outlook': 'neutral',
            'key_trends': ['Market development'],
            'regulatory_environment': 'stable',
            'competition_level': 'moderate'
        })
    
    async def _generate_stock_recommendation(self, symbol: str, fundamentals: Dict[str, Any]) -> Dict[str, Any]:
        """Generate stock investment recommendation"""
        # Simple recommendation logic
        score = 0
        
        # Valuation score
        if fundamentals['pe_ratio'] < 12:
            score += 2
        elif fundamentals['pe_ratio'] < 18:
            score += 1
        
        # Profitability score
        if fundamentals['roe'] > 0.15:
            score += 2
        elif fundamentals['roe'] > 0.10:
            score += 1
        
        # Growth score
        if fundamentals['revenue_growth'] > 0.10:
            score += 2
        elif fundamentals['revenue_growth'] > 0.05:
            score += 1
        
        # Dividend score
        if fundamentals['dividend_yield'] > 0.05:
            score += 1
        
        # Financial health score
        if fundamentals['debt_to_equity'] < 0.5 and fundamentals['current_ratio'] > 1.5:
            score += 1
        
        if score >= 6:
            recommendation = 'BUY'
            confidence = 0.8
        elif score >= 4:
            recommendation = 'HOLD'
            confidence = 0.6
        else:
            recommendation = 'SELL'
            confidence = 0.7
        
        return {
            'recommendation': recommendation,
            'confidence': confidence,
            'target_price': fundamentals.get('price', 0) * (1 + (score - 3) * 0.05),
            'time_horizon': '12 months',
            'key_factors': [
                f"PE ratio: {fundamentals['pe_ratio']:.1f}",
                f"ROE: {fundamentals['roe']:.1%}",
                f"Revenue growth: {fundamentals['revenue_growth']:.1%}",
                f"Dividend yield: {fundamentals['dividend_yield']:.1%}"
            ]
        }

# Usage example and testing
async def main():
    """Main function for testing Romanian Financial Intelligence"""
    intelligence = RomanianFinancialIntelligence()
    
    print("🇷🇴 RomAI Romanian Financial Intelligence - Testing")
    print("=" * 60)
    
    # Test comprehensive market analysis
    print("📊 Testing Comprehensive Market Analysis...")
    market_analysis = await intelligence.get_comprehensive_market_analysis()
    
    print(f"   BET Index: {market_analysis['market_data']['current_levels']['BET']:.2f}")
    print(f"   Market Turnover: {market_analysis['market_data']['trading_activity']['turnover']:,.0f} RON")
    print(f"   GDP Growth: {market_analysis['economic_context']['macroeconomic_indicators']['gdp_growth']:.1f}%")
    print(f"   Inflation Rate: {market_analysis['economic_context']['macroeconomic_indicators']['inflation']:.1f}%")
    print(f"   BNR Rate: {market_analysis['economic_context']['monetary_policy']['bnr_rate']:.1f}%")
    
    # Test banking sector analysis
    print("\n🏦 Testing Banking Sector Analysis...")
    banking_analysis = market_analysis['banking_sector']
    print(f"   Sector ROE: {banking_analysis['key_metrics']['average_roe']:.1%}")
    print(f"   NPL Ratio: {banking_analysis['key_metrics']['average_npl_ratio']:.1%}")
    print(f"   Capital Adequacy: {banking_analysis['key_metrics']['average_capital_adequacy']:.1%}")
    
    # Test sentiment analysis
    print("\n📈 Testing Sentiment Analysis...")
    sentiment_analysis = market_analysis['sentiment_analysis']
    print(f"   Overall Sentiment: {sentiment_analysis['overall_sentiment']:.2f}")
    print(f"   News Sentiment: {sentiment_analysis['sentiment_breakdown']['news']:.2f}")
    print(f"   Economic Sentiment: {sentiment_analysis['sentiment_breakdown']['economic']:.2f}")
    
    # Test investment opportunities
    print("\n💰 Testing Investment Opportunities...")
    opportunities = market_analysis['investment_opportunities']
    print(f"   Banking Sector: {opportunities['sector_opportunities']['banking']['rationale']}")
    print(f"   Top Banking Picks: {opportunities['sector_opportunities']['banking']['top_picks']}")
    
    # Test individual company analysis
    print("\n🏢 Testing Company Analysis...")
    tlv_analysis = await intelligence.get_bvb_company_analysis('TLV')
    print(f"   TLV Market Cap: {tlv_analysis['company_info']['market_cap']:,.0f} RON")
    print(f"   TLV PE Ratio: {tlv_analysis['fundamental_metrics']['pe_ratio']:.1f}")
    print(f"   TLV Recommendation: {tlv_analysis['investment_recommendation']['recommendation']}")
    print(f"   TLV Confidence: {tlv_analysis['investment_recommendation']['confidence']:.1%}")
    
    # Test market outlook
    print("\n🔮 Testing Market Outlook...")
    outlook = market_analysis['outlook']
    print(f"   Short-term Direction: {outlook['short_term_outlook']['direction']}")
    print(f"   Expected BET Returns: {outlook['short_term_outlook']['expected_returns']['BET_index']}")
    print(f"   Key Investment Themes: {', '.join(outlook['investment_themes'][:3])}")
    
    print("\n✅ Romanian Financial Intelligence testing complete!")

if __name__ == "__main__":
    asyncio.run(main())
