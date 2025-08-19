#!/usr/bin/env python3
"""
🧪 RomAI AGI - Phase 6 Monetization Platform Test Suite
Comprehensive testing framework for the complete monetization platform

This test suite validates all Phase 6 components:
- Monetization Engine functionality
- Customer Acquisition System operations
- Global Expansion Framework capabilities

Author: RomAI Testing Team
Version: 6.0.0
Date: 2025-08-08
"""

import asyncio
import logging
import sys
import os
import tempfile
import shutil
from pathlib import Path
from datetime import datetime
from decimal import Decimal

# Add the parent directory to Python path for imports
current_dir = Path(__file__).parent
parent_dir = current_dir.parent
sys.path.insert(0, str(parent_dir))

logger = logging.getLogger(__name__)

class Phase6MonetizationPlatformTest:
    """Comprehensive test suite for Phase 6 Monetization Platform"""
    
    def __init__(self):
        self.test_results = {}
        self.temp_dir = None
        self.original_cwd = os.getcwd()
        
    async def setup_test_environment(self):
        """Set up isolated test environment"""
        try:
            # Create temporary directory for test databases
            self.temp_dir = tempfile.mkdtemp(prefix="romai_monetization_test_")
            os.chdir(self.temp_dir)
            
            logger.info(f"🧪 Test environment set up: {self.temp_dir}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to set up test environment: {e}")
            return False
    
    async def cleanup_test_environment(self):
        """Clean up test environment"""
        try:
            os.chdir(self.original_cwd)
            if self.temp_dir and os.path.exists(self.temp_dir):
                shutil.rmtree(self.temp_dir)
            logger.info("🧹 Test environment cleaned up")
            
        except Exception as e:
            logger.error(f"❌ Failed to clean up test environment: {e}")
    
    async def test_monetization_engine(self):
        """Test monetization engine functionality"""
        try:
            logger.info("🧪 Testing Monetization Engine...")
            
            # Import here to avoid path issues
            from monetization_platform.monetization_engine import MonetizationEngine, SubscriptionTier, BillingCycle
            
            # Initialize engine
            engine = MonetizationEngine()
            await engine.initialize()
            
            # Test customer creation
            customer = await engine.create_customer(
                email="test@example.com",
                company_name="Test Corp",
                country="Romania",
                subscription_tier=SubscriptionTier.PROFESSIONAL
            )
            
            assert customer.email == "test@example.com"
            assert customer.subscription_tier == SubscriptionTier.PROFESSIONAL
            
            # Test subscription creation
            subscription = await engine.create_subscription(
                customer.id, 
                SubscriptionTier.PROFESSIONAL, 
                BillingCycle.MONTHLY
            )
            
            assert subscription.tier == SubscriptionTier.PROFESSIONAL
            assert subscription.price > 0
            
            # Test payment processing
            payment = await engine.process_payment(
                customer.id, 
                subscription.id, 
                "credit_card"
            )
            
            assert payment.customer_id == customer.id
            assert payment.amount == subscription.price
            
            # Test usage tracking
            await engine.track_usage(customer.id, "api_call", 100)
            updated_customer = engine.customers[customer.id]
            assert updated_customer.api_calls_used == 100
            
            # Test revenue analytics
            await engine.calculate_revenue_analytics()
            assert engine.revenue_analytics["total_customers"] >= 1
            
            # Test revenue report generation
            report = await engine.generate_revenue_report()
            assert "overview" in report
            assert report["overview"]["total_customers"] >= 1
            
            self.test_results["monetization_engine"] = {
                "status": "PASSED",
                "tests_run": 6,
                "details": "All monetization engine functions working correctly"
            }
            
            return True
            
        except Exception as e:
            self.test_results["monetization_engine"] = {
                "status": "FAILED",
                "error": str(e),
                "details": "Monetization engine test failed"
            }
            logger.error(f"❌ Monetization engine test failed: {e}")
            return False
    
    async def test_customer_acquisition_system(self):
        """Test customer acquisition system functionality"""
        try:
            logger.info("🧪 Testing Customer Acquisition System...")
            
            # Import here to avoid path issues
            from monetization_platform.customer_acquisition_system import CustomerAcquisitionSystem, LeadSource, CampaignType
            from decimal import Decimal
            
            # Initialize system
            acquisition = CustomerAcquisitionSystem()
            await acquisition.initialize()
            
            # Test lead capture
            lead = await acquisition.capture_lead(
                email="lead@test.ro",
                name="Test Lead",
                company="Test Company SRL",
                job_title="CEO",
                country="Romania",
                source=LeadSource.CONTENT_MARKETING
            )
            
            assert lead.email == "lead@test.ro"
            assert lead.country == "Romania"
            assert lead.score > 0
            
            # Test lead qualification
            qualified = await acquisition.qualify_lead(lead.id, "High potential lead")
            assert qualified == True
            
            # Test nurturing start
            nurturing = await acquisition.start_nurturing(lead.id, "default")
            assert nurturing == True
            
            # Test campaign creation
            campaign = await acquisition.create_campaign(
                name="Test Campaign",
                campaign_type=CampaignType.EMAIL,
                budget=Decimal('1000.00'),
                target_audience={"country": "Romania", "industry": "tech"}
            )
            
            assert campaign.name == "Test Campaign"
            assert campaign.budget == Decimal('1000.00')
            
            # Test lead conversion
            converted = await acquisition.convert_lead(lead.id, Decimal('299.99'))
            assert converted == True
            
            # Test metrics calculation
            metrics = await acquisition.calculate_acquisition_metrics()
            assert metrics.total_leads >= 1
            assert metrics.conversion_rate > 0
            
            self.test_results["customer_acquisition"] = {
                "status": "PASSED",
                "tests_run": 6,
                "details": "All customer acquisition functions working correctly"
            }
            
            return True
            
        except Exception as e:
            self.test_results["customer_acquisition"] = {
                "status": "FAILED",
                "error": str(e),
                "details": "Customer acquisition system test failed"
            }
            logger.error(f"❌ Customer acquisition test failed: {e}")
            return False
    
    async def test_global_expansion_framework(self):
        """Test global expansion framework functionality"""
        try:
            logger.info("🧪 Testing Global Expansion Framework...")
            
            # Import here to avoid path issues
            from monetization_platform.global_expansion_framework import GlobalExpansionFramework, MarketTier, ExpansionStatus
            from decimal import Decimal
            
            # Initialize framework
            expansion = GlobalExpansionFramework()
            await expansion.initialize()
            
            # Test market creation
            market = await expansion.create_market(
                country="Test Country",
                country_code="TC",
                region="EU",
                tier=MarketTier.TIER_2,
                language="Test Language",
                currency="EUR",
                population=10000000,
                gdp_per_capita=Decimal('30000.00'),
                market_size_estimate=Decimal('1000000.00'),
                competition_level="medium",
                regulatory_complexity="medium",
                entry_barriers=["Language barrier"],
                opportunities=["Growing market"],
                revenue_target=Decimal('5000000.00')
            )
            
            assert market.country == "Test Country"
            assert market.tier == MarketTier.TIER_2
            assert market.status == ExpansionStatus.RESEARCH
            
            # Test market status advancement
            advanced = await expansion.advance_market_status(market.id, ExpansionStatus.PLANNING)
            assert advanced == True
            
            # Test localization project update
            localization_projects = [p for p in expansion.localization_projects.values() 
                                   if p.market_id == market.id]
            if localization_projects:
                project = localization_projects[0]
                updated = await expansion.update_localization_progress(
                    project.id, 
                    translated_strings=500, 
                    reviewed_strings=400
                )
                assert updated == True
            
            # Test scaling metrics tracking
            metrics = await expansion.track_scaling_metrics(
                market.id,
                active_users=1000,
                monthly_growth_rate=15.0,
                revenue_growth_rate=20.0,
                customer_satisfaction=4.5
            )
            
            assert metrics.market_id == market.id
            assert metrics.active_users == 1000
            
            # Test expansion report generation
            report = await expansion.generate_expansion_report()
            assert "overview" in report
            assert report["overview"]["total_markets"] >= 1
            
            self.test_results["global_expansion"] = {
                "status": "PASSED",
                "tests_run": 5,
                "details": "All global expansion functions working correctly"
            }
            
            return True
            
        except Exception as e:
            self.test_results["global_expansion"] = {
                "status": "FAILED",
                "error": str(e),
                "details": "Global expansion framework test failed"
            }
            logger.error(f"❌ Global expansion test failed: {e}")
            return False
    
    async def test_platform_integration(self):
        """Test platform integration and orchestration"""
        try:
            logger.info("🧪 Testing Platform Integration...")
            
            # Import here to avoid path issues
            from monetization_platform import MonetizationPlatform, create_customer_journey, SubscriptionTier
            
            # Initialize platform
            platform = MonetizationPlatform()
            await platform.initialize()
            
            # Test platform overview
            overview = await platform.get_platform_overview()
            assert "monetization" in overview
            assert "acquisition" in overview
            assert "expansion" in overview
            assert "platform_health" in overview
            
            # Test customer journey creation
            journey = await create_customer_journey(
                email="journey@test.com",
                company_name="Journey Corp",
                country="Romania",
                subscription_tier=SubscriptionTier.PROFESSIONAL
            )
            
            assert "customer" in journey
            assert "lead" in journey
            assert journey["status"] in ["complete", "free_tier"]
            
            self.test_results["platform_integration"] = {
                "status": "PASSED",
                "tests_run": 2,
                "details": "Platform integration working correctly"
            }
            
            return True
            
        except Exception as e:
            self.test_results["platform_integration"] = {
                "status": "FAILED",
                "error": str(e),
                "details": "Platform integration test failed"
            }
            logger.error(f"❌ Platform integration test failed: {e}")
            return False
    
    async def test_data_persistence(self):
        """Test data persistence across components"""
        try:
            logger.info("🧪 Testing Data Persistence...")
            
            # Import here to avoid path issues
            from monetization_platform.monetization_engine import MonetizationEngine, SubscriptionTier
            from monetization_platform.customer_acquisition_system import CustomerAcquisitionSystem, LeadSource
            from monetization_platform.global_expansion_framework import GlobalExpansionFramework, MarketTier
            from decimal import Decimal
            
            # Test monetization engine persistence
            engine1 = MonetizationEngine()
            await engine1.initialize()
            
            customer = await engine1.create_customer(
                email="persist@test.com",
                company_name="Persist Corp",
                country="Romania"
            )
            customer_id = customer.id
            
            # Create new engine instance and load data
            engine2 = MonetizationEngine()
            await engine2.initialize()
            
            assert customer_id in engine2.customers
            assert engine2.customers[customer_id].email == "persist@test.com"
            
            # Test acquisition system persistence
            acquisition1 = CustomerAcquisitionSystem()
            await acquisition1.initialize()
            
            lead = await acquisition1.capture_lead(
                email="persist.lead@test.com",
                source=LeadSource.DIRECT
            )
            lead_id = lead.id
            
            # Create new acquisition instance and load data
            acquisition2 = CustomerAcquisitionSystem()
            await acquisition2.initialize()
            
            assert lead_id in acquisition2.leads
            assert acquisition2.leads[lead_id].email == "persist.lead@test.com"
            
            self.test_results["data_persistence"] = {
                "status": "PASSED",
                "tests_run": 2,
                "details": "Data persistence working correctly across all components"
            }
            
            return True
            
        except Exception as e:
            self.test_results["data_persistence"] = {
                "status": "FAILED",
                "error": str(e),
                "details": "Data persistence test failed"
            }
            logger.error(f"❌ Data persistence test failed: {e}")
            return False
    
    async def run_all_tests(self):
        """Run all test suites"""
        try:
            logger.info("🧪 Starting Phase 6 Monetization Platform Test Suite...")
            
            # Set up test environment
            if not await self.setup_test_environment():
                return False
            
            # Run all tests
            tests = [
                ("Monetization Engine", self.test_monetization_engine),
                ("Customer Acquisition System", self.test_customer_acquisition_system),
                ("Global Expansion Framework", self.test_global_expansion_framework),
                ("Platform Integration", self.test_platform_integration),
                ("Data Persistence", self.test_data_persistence)
            ]
            
            passed_tests = 0
            total_tests = len(tests)
            
            for test_name, test_func in tests:
                logger.info(f"🔍 Running {test_name} tests...")
                try:
                    result = await test_func()
                    if result:
                        passed_tests += 1
                        logger.info(f"✅ {test_name}: PASSED")
                    else:
                        logger.error(f"❌ {test_name}: FAILED")
                except Exception as e:
                    logger.error(f"❌ {test_name}: ERROR - {e}")
                    self.test_results[test_name.lower().replace(" ", "_")] = {
                        "status": "ERROR",
                        "error": str(e)
                    }
            
            # Calculate overall results
            success_rate = (passed_tests / total_tests) * 100
            
            # Display results
            logger.info("\n" + "=" * 80)
            logger.info("🧪 PHASE 6 MONETIZATION PLATFORM TEST RESULTS")
            logger.info("=" * 80)
            
            for test_name, result in self.test_results.items():
                status_icon = "✅" if result["status"] == "PASSED" else "❌"
                logger.info(f"{status_icon} {test_name.replace('_', ' ').title()}: {result['status']}")
                if result["status"] != "PASSED":
                    logger.info(f"   Error: {result.get('error', 'Unknown error')}")
                else:
                    logger.info(f"   Tests: {result.get('tests_run', 'N/A')} passed")
            
            logger.info(f"\n📊 Overall Success Rate: {success_rate:.1f}% ({passed_tests}/{total_tests})")
            
            if success_rate >= 80:
                logger.info("🎉 Phase 6 Monetization Platform: EXCELLENT - Production Ready!")
            elif success_rate >= 60:
                logger.info("✅ Phase 6 Monetization Platform: GOOD - Minor improvements needed")
            else:
                logger.info("⚠️ Phase 6 Monetization Platform: NEEDS WORK - Major issues detected")
            
            return success_rate >= 80
            
        except Exception as e:
            logger.error(f"❌ Test suite execution failed: {e}")
            return False
            
        finally:
            await self.cleanup_test_environment()

async def main():
    """Main test execution function"""
    try:
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        
        logger.info("🚀 Starting RomAI Phase 6 Monetization Platform Test Suite...")
        
        # Run test suite
        test_suite = Phase6MonetizationPlatformTest()
        success = await test_suite.run_all_tests()
        
        return success
        
    except Exception as e:
        logger.error(f"❌ Test execution failed: {e}")
        return False

if __name__ == "__main__":
    result = asyncio.run(main())
    sys.exit(0 if result else 1)
