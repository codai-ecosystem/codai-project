#!/usr/bin/env python3
"""
RomAI Financial Reasoning Engine Test Suite
==========================================

Comprehensive test suite for validating financial analysis capabilities
including portfolio optimization, valuation models, risk assessment, and trading strategies.

Usage: python test_financial_engine.py
"""

import sys
import asyncio
import json
from pathlib import Path

# Add RomAI source to path
sys.path.insert(0, str(Path(__file__).parent / "apps" / "romai" / "src"))

from ml.reasoning.autonomous_financial_engine import AutonomousFinancialEngine

class FinancialEngineTestSuite:
    """Comprehensive test suite for RomAI Financial Reasoning Engine."""
    
    def __init__(self):
        """Initialize the test suite."""
        self.engine = None
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        
    async def initialize_engine(self):
        """Initialize the financial reasoning engine."""
        print("🧠 Initializing RomAI Financial Reasoning Engine...")
        self.engine = AutonomousFinancialEngine()
        print("✅ Financial engine initialized successfully\n")
    
    async def run_all_tests(self):
        """Run comprehensive financial analysis tests."""
        print("💹 RomAI FINANCIAL REASONING ENGINE - COMPREHENSIVE TEST SUITE")
        print("=" * 70)
        
        await self.initialize_engine()
        
        # Test portfolio optimization
        await self.test_portfolio_optimization()
        
        # Test DCF valuation
        await self.test_dcf_valuation()
        
        # Test risk assessment
        await self.test_risk_assessment()
        
        # Test trading strategy analysis
        await self.test_trading_strategy()
        
        # Test financial ratio analysis
        await self.test_financial_ratios()
        
        # Print comprehensive results
        await self.print_test_summary()
        
        return self.passed_tests == self.total_tests
    
    async def test_portfolio_optimization(self):
        """Test portfolio optimization capabilities."""
        print("📊 TEST 1: Portfolio Optimization Analysis")
        print("-" * 50)
        
        test_cases = [
            {
                "name": "Conservative Portfolio",
                "question": "Optimize portfolio for conservative investor with $1M",
                "data": {
                    "investment_amount": 1000000,
                    "risk_tolerance": "conservative", 
                    "time_horizon": "medium_term",
                    "assets": ["stocks", "bonds", "commodities", "cash"]
                },
                "expectations": {
                    "stocks_max": 0.40,
                    "bonds_min": 0.50,
                    "confidence_min": 0.80
                }
            },
            {
                "name": "Aggressive Portfolio",
                "question": "Create aggressive growth portfolio allocation",
                "data": {
                    "investment_amount": 500000,
                    "risk_tolerance": "aggressive",
                    "time_horizon": "long_term",
                    "assets": ["stocks", "bonds", "commodities"]
                },
                "expectations": {
                    "stocks_min": 0.70,
                    "expected_return_min": 0.08,
                    "confidence_min": 0.85
                }
            }
        ]
        
        for i, test_case in enumerate(test_cases, 1):
            await self._run_single_test(
                f"1.{i}", test_case["name"], 
                test_case["question"], test_case["data"],
                test_case["expectations"], "portfolio"
            )
        
        print()
    
    async def test_dcf_valuation(self):
        """Test DCF valuation capabilities.""" 
        print("💰 TEST 2: DCF Valuation Analysis")
        print("-" * 50)
        
        test_cases = [
            {
                "name": "Technology Company Valuation",
                "question": "Value tech company with 5-year cash flow projections",
                "data": {
                    "cash_flows": [500000, 750000, 1000000, 1200000, 1500000],
                    "discount_rate": 0.12,
                    "terminal_growth": 0.03,
                    "industry": "technology",
                    "revenue": 5000000,
                    "ebitda": 1800000
                },
                "expectations": {
                    "dcf_value_min": 3000000,
                    "fair_value_min": 3000000,
                    "confidence_min": 0.80
                }
            },
            {
                "name": "Healthcare Company Valuation", 
                "question": "DCF analysis for healthcare company",
                "data": {
                    "cash_flows": [2000000, 2300000, 2600000, 3000000, 3400000],
                    "discount_rate": 0.10,
                    "terminal_growth": 0.025,
                    "industry": "healthcare",
                    "revenue": 20000000,
                    "ebitda": 8000000
                },
                "expectations": {
                    "dcf_value_min": 10000000,
                    "confidence_min": 0.82
                }
            }
        ]
        
        for i, test_case in enumerate(test_cases, 1):
            await self._run_single_test(
                f"2.{i}", test_case["name"],
                test_case["question"], test_case["data"],
                test_case["expectations"], "valuation"
            )
        
        print()
    
    async def test_risk_assessment(self):
        """Test risk assessment capabilities."""
        print("⚠️ TEST 3: Risk Assessment Analysis")
        print("-" * 50)
        
        test_cases = [
            {
                "name": "Portfolio VaR Calculation",
                "question": "Calculate 95% VaR for $10M portfolio with 20% volatility", 
                "data": {
                    "portfolio_value": 10000000,
                    "volatility": 0.20,
                    "confidence_level": 0.95,
                    "time_horizon_days": 1,
                    "beta": 1.1
                },
                "expectations": {
                    "var_min": 200000,  # Realistic expectation ~2% VaR
                    "confidence_min": 0.90,
                    "risk_level": "MEDIUM"
                }
            },
            {
                "name": "High Risk Portfolio Assessment",
                "question": "Assess risk for high-volatility portfolio",
                "data": {
                    "portfolio_value": 5000000,
                    "volatility": 0.35,
                    "confidence_level": 0.99,
                    "time_horizon_days": 10,
                    "beta": 1.6
                },
                "expectations": {
                    "var_min": 500000,  # Realistic for high volatility over 10 days
                    "confidence_min": 0.88,
                    "risk_level": "HIGH"
                }
            }
        ]
        
        for i, test_case in enumerate(test_cases, 1):
            await self._run_single_test(
                f"3.{i}", test_case["name"],
                test_case["question"], test_case["data"], 
                test_case["expectations"], "risk"
            )
        
        print()
    
    async def test_trading_strategy(self):
        """Test trading strategy analysis."""
        print("📈 TEST 4: Trading Strategy Analysis") 
        print("-" * 50)
        
        test_cases = [
            {
                "name": "Successful Momentum Strategy",
                "question": "Evaluate momentum trading strategy performance",
                "data": {
                    "strategy_type": "momentum",
                    "returns": [0.08, -0.02, 0.12, 0.05, -0.01, 0.15, 0.03, -0.04, 0.09, 0.06],
                    "benchmark": [0.05, -0.01, 0.07, 0.04, 0.00, 0.08, 0.02, -0.02, 0.05, 0.03]
                },
                "expectations": {
                    "alpha_min": 0.05,  # Positive alpha expected
                    "sharpe_min": 0.50,  # Reasonable Sharpe ratio
                    "confidence_min": 0.85
                }
            },
            {
                "name": "Poor Performance Strategy",
                "question": "Analyze underperforming trading strategy",
                "data": {
                    "strategy_type": "contrarian", 
                    "returns": [-0.03, 0.01, -0.05, 0.02, -0.08, 0.01, -0.02, 0.03, -0.04, 0.00],
                    "benchmark": [0.02, 0.01, 0.03, 0.02, -0.01, 0.04, 0.01, 0.03, 0.02, 0.01]
                },
                "expectations": {
                    "alpha_max": 0.00,  # Negative alpha expected
                    "confidence_min": 0.80
                }
            }
        ]
        
        for i, test_case in enumerate(test_cases, 1):
            await self._run_single_test(
                f"4.{i}", test_case["name"],
                test_case["question"], test_case["data"],
                test_case["expectations"], "strategy"
            )
        
        print()
    
    async def test_financial_ratios(self):
        """Test financial ratio analysis."""
        print("📋 TEST 5: Financial Ratio Analysis")
        print("-" * 50)
        
        test_cases = [
            {
                "name": "Healthy Company Analysis",
                "question": "Analyze financial health of profitable company",
                "data": {
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
                },
                "expectations": {
                    "health_score_min": 50,  # Realistic for the actual data (high debt ratio)
                    "roe_min": 0.10,
                    "current_ratio_min": 2.0,
                    "confidence_min": 0.88
                }
            },
            {
                "name": "Struggling Company Analysis", 
                "question": "Evaluate financially distressed company",
                "data": {
                    "revenue": 5000000,
                    "net_income": 100000,  # Low profitability
                    "total_assets": 15000000,
                    "total_equity": 3000000,  # High leverage
                    "current_assets": 2000000,
                    "current_liabilities": 4000000,  # Liquidity issues
                    "total_debt": 12000000,  # High debt
                    "interest_expense": 800000,
                    "inventory": 1000000,
                    "cogs": 3500000
                },
                "expectations": {
                    "health_score_max": 50,
                    "current_ratio_max": 1.0,
                    "confidence_min": 0.85
                }
            }
        ]
        
        for i, test_case in enumerate(test_cases, 1):
            await self._run_single_test(
                f"5.{i}", test_case["name"],
                test_case["question"], test_case["data"],
                test_case["expectations"], "ratios"
            )
        
        print()
    
    async def _run_single_test(self, test_id: str, test_name: str, question: str, 
                              data: dict, expectations: dict, test_type: str):
        """Run a single financial analysis test."""
        self.total_tests += 1
        
        try:
            print(f"🧪 Running Test {test_id}: {test_name}")
            
            # Execute financial analysis
            result = await self.engine.analyze_investment(question, data)
            
            # Validate results based on test type
            is_valid = await self._validate_result(result, expectations, test_type)
            
            if is_valid:
                print(f"   ✅ PASSED - {result.financial_conclusion[:80]}...")
                print(f"   📊 Confidence: {result.confidence_score:.1%}, " + 
                      f"Processing: {result.processing_time:.3f}s")
                self.passed_tests += 1
                
                self.test_results.append({
                    "test_id": test_id,
                    "test_name": test_name,
                    "status": "PASSED",
                    "confidence": result.confidence_score,
                    "processing_time": result.processing_time,
                    "analysis_type": result.analysis_type
                })
            else:
                print(f"   ❌ FAILED - Validation failed")
                print(f"   📊 Confidence: {result.confidence_score:.1%}")
                
                self.test_results.append({
                    "test_id": test_id,
                    "test_name": test_name, 
                    "status": "FAILED",
                    "confidence": result.confidence_score,
                    "processing_time": result.processing_time,
                    "failure_reason": "Validation failed"
                })
            
        except Exception as e:
            print(f"   ❌ ERROR - {str(e)}")
            self.test_results.append({
                "test_id": test_id,
                "test_name": test_name,
                "status": "ERROR", 
                "error": str(e)
            })
    
    async def _validate_result(self, result, expectations: dict, test_type: str) -> bool:
        """Validate financial analysis result against expectations."""
        
        try:
            # Basic validations for all tests
            if result.confidence_score < expectations.get("confidence_min", 0.70):
                return False
            
            if not result.financial_conclusion or len(result.financial_reasoning) == 0:
                return False
            
            # Type-specific validations
            if test_type == "portfolio":
                return await self._validate_portfolio_result(result, expectations)
            elif test_type == "valuation":
                return await self._validate_valuation_result(result, expectations)
            elif test_type == "risk":
                return await self._validate_risk_result(result, expectations)
            elif test_type == "strategy":
                return await self._validate_strategy_result(result, expectations)
            elif test_type == "ratios":
                return await self._validate_ratios_result(result, expectations)
            
            return True
            
        except Exception as e:
            print(f"   ⚠️ Validation error: {str(e)}")
            return False
    
    async def _validate_portfolio_result(self, result, expectations: dict) -> bool:
        """Validate portfolio optimization results."""
        
        if not result.portfolio_allocation:
            return False
        
        # Check allocation constraints
        stocks_allocation = result.portfolio_allocation.get("stocks", 0)
        bonds_allocation = result.portfolio_allocation.get("bonds", 0)
        
        if "stocks_max" in expectations and stocks_allocation > expectations["stocks_max"]:
            return False
        if "stocks_min" in expectations and stocks_allocation < expectations["stocks_min"]:
            return False
        if "bonds_min" in expectations and bonds_allocation < expectations["bonds_min"]:
            return False
        
        # Check risk metrics
        if result.risk_metrics:
            expected_return = result.risk_metrics.get("expected_return", 0)
            if "expected_return_min" in expectations and expected_return < expectations["expected_return_min"]:
                return False
        
        return True
    
    async def _validate_valuation_result(self, result, expectations: dict) -> bool:
        """Validate DCF valuation results."""
        
        if not result.calculated_values:
            return False
        
        dcf_value = result.calculated_values.get("dcf_value", 0)
        fair_value = result.calculated_values.get("fair_value", 0)
        
        if "dcf_value_min" in expectations and dcf_value < expectations["dcf_value_min"]:
            return False
        if "fair_value_min" in expectations and fair_value < expectations["fair_value_min"]:
            return False
        
        return True
    
    async def _validate_risk_result(self, result, expectations: dict) -> bool:
        """Validate risk assessment results."""
        
        if not result.risk_metrics:
            return False
        
        var_value = result.risk_metrics.get("var", 0)
        
        if "var_min" in expectations and var_value < expectations["var_min"]:
            return False
        
        # Check risk level assessment
        if "risk_level" in expectations and result.risk_assessment:
            actual_risk_level = result.risk_assessment.get("risk_level", "UNKNOWN")
            if actual_risk_level != expectations["risk_level"]:
                return False
        
        return True
    
    async def _validate_strategy_result(self, result, expectations: dict) -> bool:
        """Validate trading strategy results."""
        
        if not result.calculated_values:
            return False
        
        alpha = result.calculated_values.get("alpha", 0)
        
        if "alpha_min" in expectations and alpha < expectations["alpha_min"]:
            return False
        if "alpha_max" in expectations and alpha > expectations["alpha_max"]:
            return False
        
        # Check risk-adjusted metrics
        if result.risk_metrics and "sharpe_min" in expectations:
            sharpe_ratio = result.risk_metrics.get("sharpe_ratio", 0)
            if sharpe_ratio < expectations["sharpe_min"]:
                return False
        
        return True
    
    async def _validate_ratios_result(self, result, expectations: dict) -> bool:
        """Validate financial ratios results."""
        
        # Check health score
        if "health_score_min" in expectations:
            health_score = result.calculated_values.get("financial_health_score", 0)
            if health_score < expectations["health_score_min"]:
                return False
        
        if "health_score_max" in expectations:
            health_score = result.calculated_values.get("financial_health_score", 100)
            if health_score > expectations["health_score_max"]:
                return False
        
        # Check specific ratios
        if result.financial_ratios:
            roe = result.financial_ratios.get("roe", 0)
            current_ratio = result.financial_ratios.get("current_ratio", 0)
            
            if "roe_min" in expectations and roe < expectations["roe_min"]:
                return False
            if "current_ratio_min" in expectations and current_ratio < expectations["current_ratio_min"]:
                return False
            if "current_ratio_max" in expectations and current_ratio > expectations["current_ratio_max"]:
                return False
        
        return True
    
    async def print_test_summary(self):
        """Print comprehensive test results summary."""
        print("=" * 70)
        print("🏆 RomAI FINANCIAL REASONING ENGINE - FINAL TEST RESULTS")
        print("=" * 70)
        
        success_rate = (self.passed_tests / self.total_tests) * 100 if self.total_tests > 0 else 0
        
        print(f"\n📊 Test Summary:")
        print(f"   Total Tests: {self.total_tests}")
        print(f"   Passed: {self.passed_tests}")
        print(f"   Failed: {self.total_tests - self.passed_tests}")
        print(f"   Success Rate: {success_rate:.1f}%")
        
        # Calculate average metrics
        passed_results = [r for r in self.test_results if r.get("status") == "PASSED"]
        if passed_results:
            avg_confidence = sum(r.get("confidence", 0) for r in passed_results) / len(passed_results)
            avg_processing_time = sum(r.get("processing_time", 0) for r in passed_results) / len(passed_results)
            
            print(f"\n⚡ Performance Metrics:")
            print(f"   Average Confidence: {avg_confidence:.1%}")
            print(f"   Average Processing Time: {avg_processing_time:.3f}s")
        
        # Analysis types coverage
        analysis_types = set(r.get("analysis_type") for r in passed_results if r.get("analysis_type"))
        print(f"\n🎯 Analysis Types Validated:")
        for analysis_type in sorted(analysis_types):
            count = sum(1 for r in passed_results if r.get("analysis_type") == analysis_type)
            print(f"   {analysis_type}: {count} tests")
        
        # Final assessment
        print(f"\n" + "="*70)
        if success_rate == 100:
            print("🎉 FINANCIAL REASONING ENGINE: PRODUCTION READY!")
            print("   All financial analysis capabilities validated successfully")
            print("   Portfolio optimization, valuation, risk assessment, and strategy analysis working perfectly")
        elif success_rate >= 90:
            print("✅ FINANCIAL REASONING ENGINE: EXCELLENT PERFORMANCE!")
            print("   Nearly all capabilities validated with high accuracy")
        elif success_rate >= 80:
            print("⚠️  FINANCIAL REASONING ENGINE: GOOD PERFORMANCE")
            print("   Most capabilities validated, minor improvements needed")
        else:
            print("❌ FINANCIAL REASONING ENGINE: NEEDS IMPROVEMENT")
            print("   Significant issues detected, requires development attention")
        
        print("="*70)

async def main():
    """Main test execution function."""
    test_suite = FinancialEngineTestSuite()
    success = await test_suite.run_all_tests()
    
    # Exit with appropriate code
    return 0 if success else 1

if __name__ == "__main__":
    import sys
    exit_code = asyncio.run(main())
    sys.exit(exit_code)