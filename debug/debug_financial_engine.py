#!/usr/bin/env python3
"""
Debug Financial Engine Results
=============================

Debug script to see what data the financial engine is actually returning
vs what the tests expect.
"""

import sys
import asyncio
from pathlib import Path

# Add RomAI source to path
sys.path.insert(0, str(Path(__file__).parent / "apps" / "romai" / "src"))

from ml.reasoning.autonomous_financial_engine import AutonomousFinancialEngine

async def debug_financial_results():
    """Debug what the financial engine actually returns."""
    engine = AutonomousFinancialEngine()
    
    print("🔍 DEBUGGING FINANCIAL ENGINE RESULTS")
    print("=" * 60)
    
    # Debug risk assessment
    print("\n⚠️ RISK ASSESSMENT DEBUG")
    print("-" * 30)
    
    risk_result = await engine.analyze_investment(
        "Calculate 95% VaR for $10M portfolio with 20% volatility",
        {
            "portfolio_value": 10000000,
            "volatility": 0.20,
            "confidence_level": 0.95,
            "time_horizon_days": 1,
            "beta": 1.1
        }
    )
    
    print(f"Analysis Type: {risk_result.analysis_type}")
    print(f"Conclusion: {risk_result.financial_conclusion}")
    print(f"Confidence: {risk_result.confidence_score}")
    print(f"Risk Metrics: {risk_result.risk_metrics}")
    print(f"Risk Assessment: {risk_result.risk_assessment}")
    print(f"Calculated Values: {risk_result.calculated_values}")
    
    # Debug financial ratios
    print("\n📊 FINANCIAL RATIOS DEBUG")
    print("-" * 30)
    
    ratio_result = await engine.analyze_investment(
        "Analyze financial health of profitable company",
        {
            "revenue": 10000000,
            "net_income": 1500000,
            "total_assets": 20000000,
            "total_equity": 12000000,
            "current_assets": 8000000,
            "current_liabilities": 3000000,
            "total_debt": 8000000,
            "interest_expense": 400000,
            "inventory": 2000000,
            "cogs": 6000000
        }
    )
    
    print(f"Analysis Type: {ratio_result.analysis_type}")
    print(f"Conclusion: {ratio_result.financial_conclusion}")
    print(f"Confidence: {ratio_result.confidence_score}")
    print(f"Financial Ratios: {ratio_result.financial_ratios}")
    print(f"Calculated Values: {ratio_result.calculated_values}")
    print(f"Recommendations: {ratio_result.recommendations}")
    
    # Debug valuation 
    print("\n💰 VALUATION DEBUG")
    print("-" * 30)
    
    val_result = await engine.analyze_investment(
        "Value tech company with 5-year cash flow projections",
        {
            "cash_flows": [500000, 750000, 1000000, 1200000, 1500000],
            "discount_rate": 0.12,
            "terminal_growth": 0.03,
            "industry": "technology",
            "revenue": 5000000,
            "ebitda": 1800000
        }
    )
    
    print(f"Analysis Type: {val_result.analysis_type}")
    print(f"Conclusion: {val_result.financial_conclusion}")
    print(f"Confidence: {val_result.confidence_score}")
    print(f"Calculated Values: {val_result.calculated_values}")
    print(f"Valuation Metrics: {val_result.valuation_metrics}")

if __name__ == "__main__":
    asyncio.run(debug_financial_results())