#!/usr/bin/env python3
"""
🤖 RomAI Financial AI Integration
Integration layer between financial intelligence components and RomAI AGI

This module provides comprehensive integration including:
- RomAI AGI model integration for financial analysis
- Financial-specific prompt engineering and response optimization
- MemorAI integration for financial knowledge storage and retrieval
- Real-time learning from financial data and market events
- Natural language financial advisory and insights
- Multi-modal financial data processing integration

Author: RomAI Financial Intelligence Team
Version: 3.1.0
Date: 2025-08-08
"""

import asyncio
import logging
import json
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
import sqlite3

# Import financial intelligence components
from .financial_data_engine import FinancialDataEngine, MarketData, FinancialIndicator
from .risk_assessment_framework import RiskAssessmentFramework, RiskType, RiskMetric
from .investment_analysis_system import InvestmentAnalysisSystem, RiskProfile, PortfolioAllocation
from .romanian_financial_intelligence import RomanianFinancialIntelligence, BVBSector

# AGI and Memory imports (assuming they exist in the parent structure)
try:
    from ..reasoning.advanced_reasoning import AdvancedReasoningEngine
    from ..memory.enhanced_memory import EnhancedMemorySystem
    from ..multimodal.multimodal_processor import MultimodalProcessor
except ImportError:
    logger = logging.getLogger(__name__)
    logger.warning("AGI components not found, using mock implementations")

logger = logging.getLogger(__name__)

@dataclass
class FinancialQuery:
    """Financial query structure"""
    user_id: str
    query_text: str
    query_type: str  # market_analysis, investment_advice, risk_assessment, etc.
    context: Dict[str, Any]
    preferred_language: str = "en"
    risk_profile: Optional[RiskProfile] = None
    investment_horizon: Optional[str] = None
    portfolio_data: Optional[Dict[str, Any]] = None
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class FinancialResponse:
    """Financial AI response structure"""
    query_id: str
    response_text: str
    confidence: float
    data_sources: List[str]
    analysis_type: str
    recommendations: List[Dict[str, Any]]
    risk_warnings: List[str]
    supporting_data: Dict[str, Any]
    visualizations: List[Dict[str, Any]]
    follow_up_questions: List[str]
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class FinancialKnowledge:
    """Financial knowledge structure for memory storage"""
    knowledge_id: str
    category: str  # market_data, company_analysis, economic_indicator, etc.
    title: str
    content: str
    relevance_score: float
    timestamp: datetime
    source: str
    tags: List[str]
    related_entities: List[str]
    expiry_date: Optional[datetime] = None

class FinancialPromptEngine:
    """Financial-specific prompt engineering"""
    
    def __init__(self):
        self.prompt_templates = {
            'market_analysis': self._create_market_analysis_prompt,
            'investment_advice': self._create_investment_advice_prompt,
            'risk_assessment': self._create_risk_assessment_prompt,
            'portfolio_optimization': self._create_portfolio_optimization_prompt,
            'romanian_market': self._create_romanian_market_prompt,
            'economic_analysis': self._create_economic_analysis_prompt,
            'company_analysis': self._create_company_analysis_prompt,
            'sentiment_analysis': self._create_sentiment_analysis_prompt
        }
    
    def create_financial_prompt(self, query: FinancialQuery, 
                               context_data: Dict[str, Any]) -> str:
        """Create optimized financial prompt"""
        
        # Get appropriate template
        prompt_creator = self.prompt_templates.get(
            query.query_type, self._create_general_financial_prompt
        )
        
        base_prompt = prompt_creator(query, context_data)
        
        # Add Romanian market context if relevant
        if self._is_romanian_context(query):
            base_prompt += self._add_romanian_context()
        
        # Add risk warnings
        base_prompt += self._add_risk_warnings(query.risk_profile)
        
        # Add language preference
        if query.preferred_language == "ro":
            base_prompt += "\n\nVă rog să răspundeți în limba română."
        
        return base_prompt
    
    def _create_market_analysis_prompt(self, query: FinancialQuery, 
                                     context_data: Dict[str, Any]) -> str:
        """Create market analysis prompt"""
        market_data = context_data.get('market_data', {})
        economic_data = context_data.get('economic_data', {})
        
        prompt = f"""
        As a financial AI assistant specializing in market analysis, please analyze the following market situation:

        User Query: {query.query_text}

        Current Market Data:
        {json.dumps(market_data, indent=2) if market_data else "No market data available"}

        Economic Context:
        {json.dumps(economic_data, indent=2) if economic_data else "No economic data available"}

        Please provide:
        1. Comprehensive market analysis with key insights
        2. Technical and fundamental perspective
        3. Risk factors and opportunities
        4. Short-term and medium-term outlook
        5. Actionable recommendations

        Focus on providing evidence-based analysis with clear reasoning.
        """
        
        return prompt
    
    def _create_investment_advice_prompt(self, query: FinancialQuery,
                                       context_data: Dict[str, Any]) -> str:
        """Create investment advice prompt"""
        portfolio_data = query.portfolio_data or {}
        risk_profile = query.risk_profile.value if query.risk_profile else "moderate"
        
        prompt = f"""
        As a financial advisor AI, please provide investment advice for the following situation:

        User Query: {query.query_text}
        Risk Profile: {risk_profile}
        Investment Horizon: {query.investment_horizon or "Not specified"}

        Current Portfolio:
        {json.dumps(portfolio_data, indent=2) if portfolio_data else "No portfolio data provided"}

        Market Context:
        {json.dumps(context_data.get('market_context', {}), indent=2)}

        Please provide:
        1. Personalized investment recommendations
        2. Asset allocation suggestions
        3. Risk management strategies
        4. Diversification opportunities
        5. Implementation timeline

        Important: Include appropriate risk warnings and disclaimers.
        Consider the user's risk profile and investment horizon in all recommendations.
        """
        
        return prompt
    
    def _create_risk_assessment_prompt(self, query: FinancialQuery,
                                     context_data: Dict[str, Any]) -> str:
        """Create risk assessment prompt"""
        risk_data = context_data.get('risk_metrics', {})
        
        prompt = f"""
        As a risk management AI specialist, please assess the following risk scenario:

        User Query: {query.query_text}

        Risk Metrics:
        {json.dumps(risk_data, indent=2) if risk_data else "No risk data available"}

        Portfolio/Investment Details:
        {json.dumps(query.portfolio_data, indent=2) if query.portfolio_data else "No portfolio provided"}

        Please analyze:
        1. Current risk exposure levels
        2. Potential risk scenarios and stress testing
        3. Risk mitigation strategies
        4. Optimal risk-reward balance
        5. Monitoring and early warning indicators

        Provide quantitative analysis where possible and clear risk rating explanations.
        """
        
        return prompt
    
    def _create_portfolio_optimization_prompt(self, query: FinancialQuery,
                                            context_data: Dict[str, Any]) -> str:
        """Create portfolio optimization prompt"""
        optimization_data = context_data.get('optimization_results', {})
        
        prompt = f"""
        As a portfolio optimization AI expert, please analyze and optimize the following portfolio:

        User Query: {query.query_text}
        Risk Profile: {query.risk_profile.value if query.risk_profile else "moderate"}

        Current Portfolio:
        {json.dumps(query.portfolio_data, indent=2) if query.portfolio_data else "No portfolio provided"}

        Optimization Analysis:
        {json.dumps(optimization_data, indent=2) if optimization_data else "No optimization data"}

        Market Data:
        {json.dumps(context_data.get('market_data', {}), indent=2)}

        Please provide:
        1. Optimal asset allocation recommendations
        2. Expected risk-return profile
        3. Rebalancing strategy
        4. Tax-efficient implementation
        5. Performance monitoring framework

        Use Modern Portfolio Theory principles and consider real-world constraints.
        """
        
        return prompt
    
    def _create_romanian_market_prompt(self, query: FinancialQuery,
                                     context_data: Dict[str, Any]) -> str:
        """Create Romanian market-specific prompt"""
        bvb_data = context_data.get('bvb_data', {})
        economic_data = context_data.get('romanian_economic_data', {})
        
        prompt = f"""
        As a Romanian financial markets specialist AI, please analyze the following:

        User Query: {query.query_text}

        BVB Market Data:
        {json.dumps(bvb_data, indent=2) if bvb_data else "No BVB data available"}

        Romanian Economic Context:
        {json.dumps(economic_data, indent=2) if economic_data else "No economic data available"}

        Please provide analysis covering:
        1. BVB market dynamics and opportunities
        2. Romanian economic environment impact
        3. Currency (RON) considerations
        4. Regulatory and political factors
        5. Sector-specific insights (banking, energy, etc.)

        Consider Romanian market specifics including liquidity, foreign ownership, and local factors.
        Integrate European Union context and regional developments.
        """
        
        return prompt
    
    def _create_company_analysis_prompt(self, query: FinancialQuery,
                                      context_data: Dict[str, Any]) -> str:
        """Create company analysis prompt"""
        fundamental_data = context_data.get('fundamental_data', {})
        
        prompt = f"""
        As a fundamental analysis AI expert, please analyze the following company:

        User Query: {query.query_text}

        Company Fundamentals:
        {json.dumps(fundamental_data, indent=2) if fundamental_data else "No fundamental data available"}

        Market Context:
        {json.dumps(context_data.get('sector_data', {}), indent=2)}

        Please provide:
        1. Financial health assessment
        2. Valuation analysis (P/E, P/B, DCF considerations)
        3. Growth prospects and business model strength
        4. Competitive position and industry dynamics
        5. Investment recommendation with price target

        Include both quantitative metrics and qualitative factors in your analysis.
        """
        
        return prompt
    
    def _create_economic_analysis_prompt(self, query: FinancialQuery,
                                       context_data: Dict[str, Any]) -> str:
        """Create economic analysis prompt"""
        economic_indicators = context_data.get('economic_indicators', {})
        
        prompt = f"""
        As a macroeconomic analysis AI, please analyze the following economic situation:

        User Query: {query.query_text}

        Economic Indicators:
        {json.dumps(economic_indicators, indent=2) if economic_indicators else "No economic data available"}

        Please analyze:
        1. Current economic cycle and trends
        2. Monetary and fiscal policy implications
        3. Impact on different asset classes
        4. Regional and global economic context
        5. Investment implications and strategy adjustments

        Provide both technical analysis and practical investment insights.
        """
        
        return prompt
    
    def _create_sentiment_analysis_prompt(self, query: FinancialQuery,
                                        context_data: Dict[str, Any]) -> str:
        """Create sentiment analysis prompt"""
        sentiment_data = context_data.get('sentiment_data', {})
        
        prompt = f"""
        As a market sentiment analysis AI, please interpret the following sentiment indicators:

        User Query: {query.query_text}

        Sentiment Data:
        {json.dumps(sentiment_data, indent=2) if sentiment_data else "No sentiment data available"}

        Please analyze:
        1. Current market sentiment levels and trends
        2. Sentiment indicators and their reliability
        3. Contrarian vs. momentum implications
        4. Sentiment-driven opportunities and risks
        5. Integration with fundamental and technical analysis

        Consider both quantitative sentiment metrics and qualitative market psychology.
        """
        
        return prompt
    
    def _create_general_financial_prompt(self, query: FinancialQuery,
                                       context_data: Dict[str, Any]) -> str:
        """Create general financial prompt"""
        prompt = f"""
        As a comprehensive financial AI assistant, please help with the following:

        User Query: {query.query_text}

        Available Context:
        {json.dumps(context_data, indent=2) if context_data else "No additional context provided"}

        Please provide:
        1. Clear and comprehensive response to the query
        2. Supporting evidence and reasoning
        3. Relevant financial principles and concepts
        4. Practical recommendations where appropriate
        5. Important considerations and risk factors

        Ensure your response is accurate, helpful, and appropriately cautious about financial advice.
        """
        
        return prompt
    
    def _is_romanian_context(self, query: FinancialQuery) -> bool:
        """Check if query involves Romanian market context"""
        romanian_keywords = [
            'bvb', 'bucharest', 'romania', 'romanian', 'bnr', 'ron', 'leu',
            'tlv', 'snp', 'brd', 'digi', 'transilvania', 'petrom'
        ]
        
        query_lower = query.query_text.lower()
        return any(keyword in query_lower for keyword in romanian_keywords)
    
    def _add_romanian_context(self) -> str:
        """Add Romanian market context to prompt"""
        return """
        
        ROMANIAN MARKET CONTEXT:
        - Consider BVB (Bucharest Stock Exchange) specifics
        - Account for RON currency dynamics
        - Include BNR (National Bank of Romania) monetary policy
        - Consider EU membership and regional factors
        - Include local regulatory environment (CNVM/ASF)
        """
    
    def _add_risk_warnings(self, risk_profile: Optional[RiskProfile]) -> str:
        """Add appropriate risk warnings"""
        base_warning = """
        
        IMPORTANT DISCLAIMERS:
        - This is AI-generated analysis for informational purposes only
        - Not personalized financial advice - consult qualified professionals
        - Past performance does not guarantee future results
        - All investments carry risk of loss
        - Consider your personal financial situation and objectives
        """
        
        if risk_profile == RiskProfile.CONSERVATIVE:
            base_warning += "\n- Focus on capital preservation and low-risk investments"
        elif risk_profile == RiskProfile.AGGRESSIVE:
            base_warning += "\n- High-risk profile - ensure adequate diversification and risk management"
        
        return base_warning

class FinancialMemoryManager:
    """Financial knowledge memory management"""
    
    def __init__(self, db_path: str = "financial_memory.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize financial memory database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS financial_knowledge (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    knowledge_id TEXT UNIQUE NOT NULL,
                    category TEXT NOT NULL,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    relevance_score REAL,
                    source TEXT,
                    tags TEXT,
                    related_entities TEXT,
                    timestamp DATETIME NOT NULL,
                    expiry_date DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.execute('''
                CREATE INDEX IF NOT EXISTS idx_financial_knowledge_category 
                ON financial_knowledge(category, timestamp)
            ''')
            
            conn.execute('''
                CREATE INDEX IF NOT EXISTS idx_financial_knowledge_tags 
                ON financial_knowledge(tags)
            ''')
    
    async def store_knowledge(self, knowledge: FinancialKnowledge):
        """Store financial knowledge in memory"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT OR REPLACE INTO financial_knowledge 
                (knowledge_id, category, title, content, relevance_score, source, 
                 tags, related_entities, timestamp, expiry_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                knowledge.knowledge_id, knowledge.category, knowledge.title,
                knowledge.content, knowledge.relevance_score, knowledge.source,
                json.dumps(knowledge.tags), json.dumps(knowledge.related_entities),
                knowledge.timestamp, knowledge.expiry_date
            ))
    
    async def retrieve_relevant_knowledge(self, query: str, category: Optional[str] = None,
                                        limit: int = 10) -> List[FinancialKnowledge]:
        """Retrieve relevant financial knowledge"""
        sql_query = '''
            SELECT knowledge_id, category, title, content, relevance_score, source,
                   tags, related_entities, timestamp, expiry_date
            FROM financial_knowledge 
            WHERE (expiry_date IS NULL OR expiry_date > datetime('now'))
        '''
        
        params = []
        
        if category:
            sql_query += ' AND category = ?'
            params.append(category)
        
        # Simple text search (could be enhanced with vector search)
        sql_query += ' AND (title LIKE ? OR content LIKE ?)'
        search_term = f'%{query}%'
        params.extend([search_term, search_term])
        
        sql_query += ' ORDER BY relevance_score DESC, timestamp DESC LIMIT ?'
        params.append(limit)
        
        knowledge_items = []
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(sql_query, params)
            for row in cursor.fetchall():
                knowledge_items.append(FinancialKnowledge(
                    knowledge_id=row[0],
                    category=row[1],
                    title=row[2],
                    content=row[3],
                    relevance_score=row[4],
                    source=row[5],
                    tags=json.loads(row[6]) if row[6] else [],
                    related_entities=json.loads(row[7]) if row[7] else [],
                    timestamp=datetime.fromisoformat(row[8]),
                    expiry_date=datetime.fromisoformat(row[9]) if row[9] else None
                ))
        
        return knowledge_items

class FinancialAIIntegration:
    """Main Financial AI Integration system"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        
        # Initialize components
        self.financial_data_engine = FinancialDataEngine()
        self.risk_framework = RiskAssessmentFramework()
        self.investment_system = InvestmentAnalysisSystem()
        self.romanian_intelligence = RomanianFinancialIntelligence()
        self.prompt_engine = FinancialPromptEngine()
        self.memory_manager = FinancialMemoryManager()
        
        # Initialize AGI components (with fallbacks)
        try:
            self.reasoning_engine = AdvancedReasoningEngine()
            self.memory_system = EnhancedMemorySystem()
            self.multimodal_processor = MultimodalProcessor()
        except (ImportError, NameError):
            logger.warning("AGI components not available, using mock implementations")
            self.reasoning_engine = None
            self.memory_system = None
            self.multimodal_processor = None
        
        # Query history
        self.query_history: List[FinancialQuery] = []
        self.response_history: List[FinancialResponse] = []
    
    async def process_financial_query(self, query: FinancialQuery) -> FinancialResponse:
        """Process comprehensive financial query"""
        
        # Store query in history
        self.query_history.append(query)
        
        # Gather relevant context data
        context_data = await self._gather_context_data(query)
        
        # Retrieve relevant financial knowledge
        relevant_knowledge = await self.memory_manager.retrieve_relevant_knowledge(
            query.query_text, category=None, limit=5
        )
        
        # Create optimized prompt
        financial_prompt = self.prompt_engine.create_financial_prompt(query, context_data)
        
        # Add relevant knowledge to context
        if relevant_knowledge:
            knowledge_context = "\n\nRelevant Historical Knowledge:\n"
            for knowledge in relevant_knowledge:
                knowledge_context += f"- {knowledge.title}: {knowledge.content[:200]}...\n"
            financial_prompt += knowledge_context
        
        # Process with AGI reasoning engine
        if self.reasoning_engine:
            ai_response = await self._process_with_agi(financial_prompt, context_data)
        else:
            ai_response = await self._process_with_mock_agi(financial_prompt, context_data)
        
        # Generate structured response
        response = await self._create_structured_response(query, ai_response, context_data)
        
        # Store response and learn from interaction
        self.response_history.append(response)
        await self._learn_from_interaction(query, response, context_data)
        
        return response
    
    async def _gather_context_data(self, query: FinancialQuery) -> Dict[str, Any]:
        """Gather relevant context data for query"""
        context_data = {}
        
        # Determine what data to fetch based on query type
        if query.query_type in ['market_analysis', 'investment_advice']:
            # Fetch current market data
            try:
                market_data = await self.financial_data_engine.get_latest_market_data()
                context_data['market_data'] = {
                    'timestamp': market_data.timestamp.isoformat(),
                    'price': market_data.price,
                    'volume': market_data.volume,
                    'market_cap': market_data.market_cap
                }
            except Exception as e:
                logger.warning(f"Failed to fetch market data: {e}")
        
        if query.query_type == 'risk_assessment' or query.portfolio_data:
            # Fetch risk metrics
            try:
                if query.portfolio_data:
                    # Create mock returns for risk calculation
                    returns = pd.Series(np.random.normal(0.001, 0.02, 252))
                    risk_data = {
                        'returns': returns,
                        'confidence_level': 0.95
                    }
                    risk_metric = await self.risk_framework.calculate_risk_metric(
                        RiskType.MARKET, risk_data
                    )
                    context_data['risk_metrics'] = {
                        'var_95': risk_metric.value,
                        'risk_level': risk_metric.risk_level.value,
                        'confidence': risk_metric.confidence
                    }
            except Exception as e:
                logger.warning(f"Failed to calculate risk metrics: {e}")
        
        if self._is_romanian_query(query):
            # Fetch Romanian market data
            try:
                romanian_analysis = await self.romanian_intelligence.get_comprehensive_market_analysis()
                context_data['romanian_data'] = {
                    'bvb_data': romanian_analysis['market_data'],
                    'economic_data': romanian_analysis['economic_context'],
                    'sentiment_data': romanian_analysis['sentiment_analysis']
                }
            except Exception as e:
                logger.warning(f"Failed to fetch Romanian data: {e}")
        
        return context_data
    
    def _is_romanian_query(self, query: FinancialQuery) -> bool:
        """Check if query is related to Romanian markets"""
        romanian_keywords = ['bvb', 'bucharest', 'romania', 'romanian', 'bnr', 'ron']
        return any(keyword in query.query_text.lower() for keyword in romanian_keywords)
    
    async def _process_with_agi(self, prompt: str, context_data: Dict[str, Any]) -> str:
        """Process prompt with AGI reasoning engine"""
        try:
            # Use the advanced reasoning engine
            reasoning_result = await self.reasoning_engine.reason_about_problem(
                problem_statement=prompt,
                context=context_data,
                reasoning_type="financial_analysis"
            )
            return reasoning_result.conclusion
        except Exception as e:
            logger.error(f"AGI processing failed: {e}")
            return await self._process_with_mock_agi(prompt, context_data)
    
    async def _process_with_mock_agi(self, prompt: str, context_data: Dict[str, Any]) -> str:
        """Mock AGI processing for demonstration"""
        # Simple rule-based response generation
        if "risk" in prompt.lower():
            return self._generate_risk_response(context_data)
        elif "investment" in prompt.lower():
            return self._generate_investment_response(context_data)
        elif "romanian" in prompt.lower() or "bvb" in prompt.lower():
            return self._generate_romanian_response(context_data)
        else:
            return self._generate_general_response(context_data)
    
    def _generate_risk_response(self, context_data: Dict[str, Any]) -> str:
        """Generate risk analysis response"""
        risk_metrics = context_data.get('risk_metrics', {})
        
        if risk_metrics:
            var_95 = risk_metrics.get('var_95', 0.05)
            risk_level = risk_metrics.get('risk_level', 'moderate')
            
            return f"""
            Based on the risk analysis, your portfolio shows a Value at Risk (95% confidence) of {var_95:.2%}, 
            indicating a {risk_level} risk level. 
            
            Key Risk Insights:
            1. Market Risk: Current volatility suggests {risk_level} market risk exposure
            2. Diversification: Consider spreading investments across different asset classes
            3. Time Horizon: Longer investment horizons can help mitigate short-term volatility
            4. Risk Management: Implement stop-loss strategies and regular portfolio reviews
            
            Recommendations:
            - Monitor risk metrics regularly
            - Consider hedging strategies if risk tolerance is exceeded
            - Maintain adequate cash reserves for liquidity needs
            - Review and rebalance portfolio quarterly
            """
        else:
            return """
            To provide accurate risk assessment, I would need specific portfolio data including:
            - Asset allocations and positions
            - Historical performance data
            - Investment timeline and objectives
            - Risk tolerance preferences
            
            General risk management principles include diversification, regular monitoring, 
            and alignment with your investment goals and risk capacity.
            """
    
    def _generate_investment_response(self, context_data: Dict[str, Any]) -> str:
        """Generate investment advice response"""
        market_data = context_data.get('market_data', {})
        
        return f"""
        Based on current market conditions and analysis:
        
        Investment Strategy Recommendations:
        1. Asset Allocation: Consider a balanced approach with 60% equities, 30% bonds, 10% alternatives
        2. Geographic Diversification: Include both domestic and international exposure
        3. Sector Allocation: Focus on technology, healthcare, and sustainable energy sectors
        4. Risk Management: Implement dollar-cost averaging for volatile markets
        
        Current Market Context:
        - Market conditions suggest {market_data.get('market_condition', 'mixed')} outlook
        - Consider defensive positioning during uncertain periods
        - Opportunities may exist in undervalued quality companies
        
        Implementation Steps:
        1. Assess current portfolio allocation
        2. Identify rebalancing opportunities
        3. Consider tax implications of any changes
        4. Implement changes gradually over time
        
        Remember: This is general guidance. Consult with a qualified financial advisor 
        for personalized recommendations based on your specific situation.
        """
    
    def _generate_romanian_response(self, context_data: Dict[str, Any]) -> str:
        """Generate Romanian market response"""
        romanian_data = context_data.get('romanian_data', {})
        
        return f"""
        Romanian Market Analysis:
        
        BVB Market Overview:
        The Bucharest Stock Exchange shows {romanian_data.get('market_sentiment', 'mixed')} sentiment 
        with key indices reflecting current economic conditions.
        
        Key Investment Themes:
        1. Banking Sector: Romanian banks benefit from economic growth and EU integration
        2. Energy Transition: Opportunities in renewable energy and utilities modernization
        3. Technology: Growing IT sector and digitalization trends
        4. Real Estate: Urban development and EU funding projects
        
        Romanian Market Considerations:
        - Currency Risk: RON volatility vs EUR/USD
        - Liquidity: Lower liquidity compared to major European markets
        - Regulatory Environment: Stable EU regulatory framework
        - Economic Growth: Supported by EU Recovery Fund investments
        
        Top BVB Opportunities:
        - TLV (Banca Transilvania): Leading Romanian bank with growth potential
        - SNP (OMV Petrom): Energy sector exposure with transition opportunities
        - DIGI: Telecommunications growth story
        
        Risk Factors:
        - Political stability and policy continuity
        - Regional geopolitical developments
        - Currency and inflation risks
        - Market concentration and liquidity constraints
        """
    
    def _generate_general_response(self, context_data: Dict[str, Any]) -> str:
        """Generate general financial response"""
        return """
        Based on current financial market conditions, here are key considerations:
        
        Market Environment:
        - Maintain a long-term perspective despite short-term volatility
        - Focus on quality investments with strong fundamentals
        - Consider the impact of macroeconomic factors on asset classes
        
        Investment Principles:
        1. Diversification across asset classes, sectors, and geographies
        2. Regular portfolio review and rebalancing
        3. Cost-conscious investment approach (minimize fees)
        4. Tax-efficient investment strategies
        
        Current Opportunities:
        - Value opportunities may exist in oversold quality companies
        - Technology and healthcare sectors show long-term growth potential
        - Sustainable and ESG investments are gaining momentum
        - Emerging markets may offer diversification benefits
        
        Risk Management:
        - Maintain appropriate cash reserves
        - Consider your investment timeline and goals
        - Don't invest more than you can afford to lose
        - Stay informed but avoid emotional decision-making
        
        This analysis is for informational purposes. Consider consulting 
        with qualified financial professionals for personalized advice.
        """
    
    async def _create_structured_response(self, query: FinancialQuery, 
                                        ai_response: str, 
                                        context_data: Dict[str, Any]) -> FinancialResponse:
        """Create structured financial response"""
        
        # Extract recommendations from AI response
        recommendations = self._extract_recommendations(ai_response)
        
        # Generate risk warnings
        risk_warnings = self._generate_risk_warnings(query, context_data)
        
        # Create visualizations metadata
        visualizations = self._suggest_visualizations(query.query_type, context_data)
        
        # Generate follow-up questions
        follow_up_questions = self._generate_follow_up_questions(query)
        
        return FinancialResponse(
            query_id=f"query_{len(self.query_history)}",
            response_text=ai_response,
            confidence=0.85,  # Could be calculated based on data quality and model confidence
            data_sources=self._identify_data_sources(context_data),
            analysis_type=query.query_type,
            recommendations=recommendations,
            risk_warnings=risk_warnings,
            supporting_data=context_data,
            visualizations=visualizations,
            follow_up_questions=follow_up_questions
        )
    
    def _extract_recommendations(self, ai_response: str) -> List[Dict[str, Any]]:
        """Extract actionable recommendations from AI response"""
        # Simple keyword-based extraction (could be enhanced with NLP)
        recommendations = []
        
        lines = ai_response.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['recommend', 'suggest', 'consider']):
                recommendations.append({
                    'text': line.strip(),
                    'confidence': 0.7,
                    'priority': 'medium'
                })
        
        return recommendations[:5]  # Limit to top 5
    
    def _generate_risk_warnings(self, query: FinancialQuery, 
                               context_data: Dict[str, Any]) -> List[str]:
        """Generate appropriate risk warnings"""
        warnings = [
            "This analysis is for informational purposes only and not personalized financial advice",
            "All investments carry risk of loss - past performance doesn't guarantee future results",
            "Consider your personal financial situation and consult qualified professionals"
        ]
        
        # Add specific warnings based on query type
        if query.query_type == 'investment_advice':
            warnings.append("Investment recommendations should be evaluated against your risk tolerance and goals")
        
        if query.risk_profile == RiskProfile.AGGRESSIVE:
            warnings.append("Aggressive risk profile investments can experience significant volatility")
        
        if self._is_romanian_query(query):
            warnings.append("Emerging market investments carry additional currency and political risks")
        
        return warnings
    
    def _suggest_visualizations(self, query_type: str, 
                               context_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Suggest relevant visualizations"""
        visualizations = []
        
        if query_type == 'market_analysis':
            visualizations.extend([
                {'type': 'line_chart', 'title': 'Market Performance Trend', 'data_key': 'market_data'},
                {'type': 'bar_chart', 'title': 'Sector Performance', 'data_key': 'sector_data'}
            ])
        
        if query_type == 'risk_assessment':
            visualizations.extend([
                {'type': 'risk_heatmap', 'title': 'Risk Assessment Matrix', 'data_key': 'risk_metrics'},
                {'type': 'monte_carlo', 'title': 'Risk Scenarios', 'data_key': 'stress_test'}
            ])
        
        if query_type == 'portfolio_optimization':
            visualizations.extend([
                {'type': 'pie_chart', 'title': 'Asset Allocation', 'data_key': 'allocation'},
                {'type': 'efficient_frontier', 'title': 'Risk-Return Profile', 'data_key': 'optimization'}
            ])
        
        return visualizations
    
    def _generate_follow_up_questions(self, query: FinancialQuery) -> List[str]:
        """Generate relevant follow-up questions"""
        base_questions = [
            "Would you like me to analyze specific sectors or companies?",
            "Do you need help with portfolio rebalancing strategies?",
            "Are you interested in risk management techniques?"
        ]
        
        if query.query_type == 'investment_advice':
            base_questions.extend([
                "What is your investment timeline and goals?",
                "Would you like ESG or sustainable investment options?",
                "Are you interested in tax-efficient investment strategies?"
            ])
        
        if self._is_romanian_query(query):
            base_questions.extend([
                "Would you like analysis of specific BVB companies?",
                "Are you interested in Romanian economic indicators?",
                "Do you need currency hedging strategies for RON exposure?"
            ])
        
        return base_questions[:4]  # Limit to 4 questions
    
    def _identify_data_sources(self, context_data: Dict[str, Any]) -> List[str]:
        """Identify data sources used in analysis"""
        sources = ["RomAI Financial Intelligence Engine"]
        
        if 'market_data' in context_data:
            sources.append("Real-time Market Data")
        
        if 'risk_metrics' in context_data:
            sources.append("Risk Assessment Framework")
        
        if 'romanian_data' in context_data:
            sources.append("Romanian Financial Intelligence")
        
        return sources
    
    async def _learn_from_interaction(self, query: FinancialQuery, 
                                    response: FinancialResponse, 
                                    context_data: Dict[str, Any]):
        """Learn from user interaction for continuous improvement"""
        
        # Store interaction knowledge
        knowledge = FinancialKnowledge(
            knowledge_id=f"interaction_{len(self.query_history)}",
            category="user_interaction",
            title=f"Query: {query.query_text[:50]}...",
            content=f"Query Type: {query.query_type}, Response: {response.response_text[:200]}...",
            relevance_score=0.8,
            timestamp=datetime.now(),
            source="user_interaction",
            tags=[query.query_type, query.preferred_language],
            related_entities=list(context_data.keys())
        )
        
        await self.memory_manager.store_knowledge(knowledge)
        
        # Update financial data if new market information was processed
        if 'market_data' in context_data:
            # This could trigger updates to financial models or data caches
            pass
    
    async def get_financial_insights_summary(self, user_id: str) -> Dict[str, Any]:
        """Get personalized financial insights summary"""
        # Get user's recent queries
        user_queries = [q for q in self.query_history if q.user_id == user_id]
        
        if not user_queries:
            return {"message": "No previous interactions found"}
        
        # Analyze user's interests and patterns
        query_types = [q.query_type for q in user_queries]
        most_common_type = max(set(query_types), key=query_types.count)
        
        # Generate insights based on user history
        insights = {
            "user_profile": {
                "primary_interest": most_common_type,
                "query_count": len(user_queries),
                "preferred_language": user_queries[-1].preferred_language,
                "last_interaction": user_queries[-1].timestamp.isoformat()
            },
            "market_updates": await self._get_relevant_market_updates(user_queries),
            "personalized_recommendations": await self._get_personalized_recommendations(user_queries),
            "learning_opportunities": self._suggest_learning_opportunities(user_queries)
        }
        
        return insights
    
    async def _get_relevant_market_updates(self, user_queries: List[FinancialQuery]) -> List[Dict[str, Any]]:
        """Get market updates relevant to user's interests"""
        # Analyze user's query patterns to determine relevant updates
        updates = []
        
        # Check if user is interested in Romanian markets
        if any(self._is_romanian_query(q) for q in user_queries):
            try:
                romanian_data = await self.romanian_intelligence.get_comprehensive_market_analysis()
                updates.append({
                    "type": "romanian_market",
                    "title": "BVB Market Update",
                    "summary": f"BET Index: {romanian_data['market_data']['current_levels']['BET']:.2f}",
                    "relevance": "high"
                })
            except Exception as e:
                logger.warning(f"Failed to get Romanian market updates: {e}")
        
        return updates
    
    async def _get_personalized_recommendations(self, user_queries: List[FinancialQuery]) -> List[Dict[str, Any]]:
        """Get personalized recommendations based on user history"""
        recommendations = []
        
        # Analyze user's risk profile and preferences
        recent_query = user_queries[-1] if user_queries else None
        
        if recent_query and recent_query.risk_profile:
            if recent_query.risk_profile == RiskProfile.CONSERVATIVE:
                recommendations.append({
                    "type": "asset_allocation",
                    "title": "Conservative Portfolio Review",
                    "description": "Consider reviewing your fixed income allocation",
                    "priority": "medium"
                })
            elif recent_query.risk_profile == RiskProfile.AGGRESSIVE:
                recommendations.append({
                    "type": "risk_management",
                    "title": "Risk Monitoring",
                    "description": "Set up regular portfolio risk assessments",
                    "priority": "high"
                })
        
        return recommendations
    
    def _suggest_learning_opportunities(self, user_queries: List[FinancialQuery]) -> List[Dict[str, Any]]:
        """Suggest learning opportunities based on user interests"""
        query_types = set(q.query_type for q in user_queries)
        
        opportunities = []
        
        if 'investment_advice' in query_types:
            opportunities.append({
                "topic": "Modern Portfolio Theory",
                "description": "Learn about optimal portfolio construction and diversification",
                "difficulty": "intermediate"
            })
        
        if 'risk_assessment' in query_types:
            opportunities.append({
                "topic": "Risk Management Techniques",
                "description": "Advanced risk measurement and mitigation strategies",
                "difficulty": "advanced"
            })
        
        if any(self._is_romanian_query(q) for q in user_queries):
            opportunities.append({
                "topic": "Emerging Markets Investing",
                "description": "Understanding opportunities and risks in developing markets",
                "difficulty": "intermediate"
            })
        
        return opportunities

# Usage example and testing
async def main():
    """Main function for testing Financial AI Integration"""
    ai_integration = FinancialAIIntegration()
    
    print("🤖 RomAI Financial AI Integration - Testing")
    print("=" * 50)
    
    # Test market analysis query
    print("📊 Testing Market Analysis Query...")
    market_query = FinancialQuery(
        user_id="test_user",
        query_text="What is the current market outlook for technology stocks?",
        query_type="market_analysis",
        context={"sector": "technology"},
        risk_profile=RiskProfile.MODERATE
    )
    
    market_response = await ai_integration.process_financial_query(market_query)
    print(f"   Response Length: {len(market_response.response_text)} characters")
    print(f"   Confidence: {market_response.confidence:.1%}")
    print(f"   Data Sources: {len(market_response.data_sources)}")
    print(f"   Recommendations: {len(market_response.recommendations)}")
    
    # Test Romanian market query
    print("\n🇷🇴 Testing Romanian Market Query...")
    romanian_query = FinancialQuery(
        user_id="test_user",
        query_text="How is the BVB performing and what are the best Romanian bank stocks?",
        query_type="romanian_market",
        context={"market": "bvb"},
        preferred_language="en"
    )
    
    romanian_response = await ai_integration.process_financial_query(romanian_query)
    print(f"   Response includes Romanian context: {'romanian' in romanian_response.response_text.lower()}")
    print(f"   Risk Warnings: {len(romanian_response.risk_warnings)}")
    print(f"   Follow-up Questions: {len(romanian_response.follow_up_questions)}")
    
    # Test investment advice query
    print("\n💰 Testing Investment Advice Query...")
    investment_query = FinancialQuery(
        user_id="test_user",
        query_text="I have $100,000 to invest for retirement in 20 years. What should I do?",
        query_type="investment_advice",
        context={"amount": 100000, "timeline": "20 years"},
        risk_profile=RiskProfile.MODERATE,
        investment_horizon="long_term",
        portfolio_data={"cash": 100000}
    )
    
    investment_response = await ai_integration.process_financial_query(investment_query)
    print(f"   Personalized Response: {len(investment_response.response_text)} characters")
    print(f"   Visualizations Suggested: {len(investment_response.visualizations)}")
    
    # Test risk assessment query
    print("\n⚖️ Testing Risk Assessment Query...")
    risk_query = FinancialQuery(
        user_id="test_user",
        query_text="What are the risks in my current portfolio?",
        query_type="risk_assessment",
        context={"portfolio_analysis": True},
        portfolio_data={"stocks": 0.7, "bonds": 0.2, "cash": 0.1}
    )
    
    risk_response = await ai_integration.process_financial_query(risk_query)
    print(f"   Risk Analysis Provided: {'risk' in risk_response.response_text.lower()}")
    print(f"   Risk Warnings Count: {len(risk_response.risk_warnings)}")
    
    # Test financial insights summary
    print("\n📈 Testing Financial Insights Summary...")
    insights = await ai_integration.get_financial_insights_summary("test_user")
    print(f"   User Profile: {insights['user_profile']['primary_interest']}")
    print(f"   Query Count: {insights['user_profile']['query_count']}")
    print(f"   Market Updates: {len(insights['market_updates'])}")
    print(f"   Recommendations: {len(insights['personalized_recommendations'])}")
    
    print("\n✅ Financial AI Integration testing complete!")

if __name__ == "__main__":
    asyncio.run(main())
