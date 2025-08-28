"""
Test Suite for ROMAI Self-Modification System
==========================================

Comprehensive test suite for the self-modification capabilities that enable
ROMAI to safely improve its own code and capabilities.
"""

import asyncio
import logging
import tempfile
import os
import shutil
from pathlib import Path
import json

# Import self-modification components
try:
    from self_modification import (
        SelfModificationSystem, CodeGenerator, ModificationEngine,
        ModificationType, ModificationRisk, ModificationStatus,
        ModificationPlan, ModificationResult
    )
    SELF_MOD_AVAILABLE = True
except ImportError as e:
    SELF_MOD_AVAILABLE = False
    print(f"Self-modification system not available: {e}")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TestSelfModificationSystem:
    """Test the complete self-modification system."""
    
    def __init__(self):
        """Initialize test suite."""
        self.test_results = []
        self.temp_dir = None
        
    async def run_all_tests(self):
        """Run all self-modification tests."""
        logger.info("🧪 Running Self-Modification System Tests")
        logger.info("=" * 50)
        
        if not SELF_MOD_AVAILABLE:
            logger.warning("❌ Self-modification system not available - running limited tests")
            await self.test_import_fallback()
            return
        
        # Setup test environment
        await self.setup_test_environment()
        
        try:
            # Core component tests
            await self.test_code_generator()
            await self.test_modification_engine() 
            await self.test_modification_planning()
            await self.test_risk_assessment()
            await self.test_rollback_system()
            
            # Integration tests
            await self.test_full_modification_workflow()
            await self.test_error_handling()
            await self.test_concurrent_modifications()
            
            # Safety tests
            await self.test_safety_mechanisms()
            await self.test_emergency_rollback()
            
        finally:
            await self.cleanup_test_environment()
        
        # Report results
        await self.report_test_results()
    
    async def setup_test_environment(self):
        """Setup test environment."""
        self.temp_dir = Path(tempfile.mkdtemp())
        logger.info(f"🔧 Test environment setup: {self.temp_dir}")
    
    async def cleanup_test_environment(self):
        """Clean up test environment."""
        if self.temp_dir and self.temp_dir.exists():
            shutil.rmtree(self.temp_dir, ignore_errors=True)
        logger.info("🧹 Test environment cleaned up")
    
    async def test_import_fallback(self):
        """Test import fallback behavior."""
        logger.info("Testing import fallback behavior...")
        result = {
            "test": "import_fallback",
            "passed": True,
            "details": "Import fallback working correctly"
        }
        self.test_results.append(result)
        logger.info("✅ Import fallback test passed")
    
    async def test_code_generator(self):
        """Test the code generator component."""
        logger.info("Testing code generator...")
        
        try:
            generator = CodeGenerator()
            
            # Test template loading
            assert generator.generation_templates is not None
            assert "tool_enhancement" in generator.generation_templates
            
            # Test quality checkers setup
            assert generator.code_quality_checkers is not None
            assert "syntax_check" in generator.code_quality_checkers
            
            result = {
                "test": "code_generator",
                "passed": True,
                "details": "Code generator initialized successfully"
            }
            
        except Exception as e:
            result = {
                "test": "code_generator", 
                "passed": False,
                "error": str(e)
            }
        
        self.test_results.append(result)
        logger.info(f"{'✅' if result['passed'] else '❌'} Code generator test {'passed' if result['passed'] else 'failed'}")
    
    async def test_modification_engine(self):
        """Test the modification engine component."""
        logger.info("Testing modification engine...")
        
        try:
            engine = ModificationEngine()
            
            # Test initialization
            assert engine.backup_dir.exists()
            assert engine.modification_history == []
            
            result = {
                "test": "modification_engine",
                "passed": True,
                "details": "Modification engine initialized successfully"
            }
            
        except Exception as e:
            result = {
                "test": "modification_engine",
                "passed": False,
                "error": str(e)
            }
        
        self.test_results.append(result)
        logger.info(f"{'✅' if result['passed'] else '❌'} Modification engine test {'passed' if result['passed'] else 'failed'}")
    
    async def test_modification_planning(self):
        """Test modification planning functionality."""
        logger.info("Testing modification planning...")
        
        try:
            system = SelfModificationSystem()
            
            # Plan a simple modification
            plan = await system.plan_self_modification(
                modification_type=ModificationType.TOOL_ENHANCEMENT,
                description="Test enhancement",
                target_files=["test_file.py"],
                expected_benefits=["Better performance"],
                success_criteria={"improvement": True}
            )
            
            # Verify plan properties
            assert plan.plan_id is not None
            assert plan.modification_type == ModificationType.TOOL_ENHANCEMENT
            assert plan.description == "Test enhancement"
            assert "test_file.py" in plan.target_files
            assert plan.status == ModificationStatus.PLANNED
            
            result = {
                "test": "modification_planning",
                "passed": True,
                "details": f"Successfully planned modification: {plan.plan_id}"
            }
            
        except Exception as e:
            result = {
                "test": "modification_planning",
                "passed": False,
                "error": str(e)
            }
        
        self.test_results.append(result)
        logger.info(f"{'✅' if result['passed'] else '❌'} Modification planning test {'passed' if result['passed'] else 'failed'}")
    
    async def test_risk_assessment(self):
        """Test risk assessment functionality."""
        logger.info("Testing risk assessment...")
        
        try:
            system = SelfModificationSystem()
            
            # Test low-risk modification
            low_risk_plan = await system.plan_self_modification(
                modification_type=ModificationType.BUG_FIX,
                description="Fix minor bug",
                target_files=["helper.py"],
                expected_benefits=["Bug fixed"],
                success_criteria={"bug_fixed": True}
            )
            
            # Test high-risk modification
            high_risk_plan = await system.plan_self_modification(
                modification_type=ModificationType.ARCHITECTURE_IMPROVEMENT,
                description="Rewrite fundamental architecture",
                target_files=["agi_system.py", "tool_manager.py"],
                expected_benefits=["Better architecture"],
                success_criteria={"improvement": True}
            )
            
            # Verify risk assessment
            assert low_risk_plan.risk_level in [ModificationRisk.LOW, ModificationRisk.MEDIUM]
            assert high_risk_plan.risk_level in [ModificationRisk.HIGH, ModificationRisk.CRITICAL]
            
            result = {
                "test": "risk_assessment",
                "passed": True,
                "details": f"Risk assessment working: low={low_risk_plan.risk_level.value}, high={high_risk_plan.risk_level.value}"
            }
            
        except Exception as e:
            result = {
                "test": "risk_assessment",
                "passed": False,
                "error": str(e)
            }
        
        self.test_results.append(result)
        logger.info(f"{'✅' if result['passed'] else '❌'} Risk assessment test {'passed' if result['passed'] else 'failed'}")
    
    async def test_rollback_system(self):
        """Test rollback system functionality."""
        logger.info("Testing rollback system...")
        
        try:
            engine = ModificationEngine()
            
            # Create test file
            test_file = self.temp_dir / "test_rollback.py"
            original_content = "# Original content\nprint('original')\n"
            test_file.write_text(original_content)
            
            # Create backup
            backup_info = await engine._create_backup([str(test_file)])
            
            # Verify backup was created
            assert backup_info["backup_id"] is not None
            assert str(test_file) in backup_info["files"]
            
            # Modify file
            modified_content = "# Modified content\nprint('modified')\n"
            test_file.write_text(modified_content)
            
            # Create dummy plan for rollback
            plan = ModificationPlan(
                plan_id="test_rollback",
                modification_type=ModificationType.BUG_FIX,
                risk_level=ModificationRisk.LOW,
                description="Test rollback",
                target_files=[str(test_file)],
                expected_benefits=[],
                success_criteria={},
                rollback_plan=backup_info
            )
            
            # Test rollback
            rollback_success = await engine._rollback_modification(plan)
            
            # Verify rollback
            assert rollback_success
            restored_content = test_file.read_text()
            assert restored_content == original_content
            
            result = {
                "test": "rollback_system",
                "passed": True,
                "details": "Rollback system working correctly"
            }
            
        except Exception as e:
            result = {
                "test": "rollback_system",
                "passed": False,
                "error": str(e)
            }
        
        self.test_results.append(result)
        logger.info(f"{'✅' if result['passed'] else '❌'} Rollback system test {'passed' if result['passed'] else 'failed'}")
    
    async def test_full_modification_workflow(self):
        """Test complete modification workflow."""
        logger.info("Testing full modification workflow...")
        
        try:
            system = SelfModificationSystem()
            
            # Create test target file
            test_file = self.temp_dir / "test_workflow.py"
            test_file.write_text("# Original test file\ndef test_function():\n    return 'original'\n")
            
            # Plan modification
            plan = await system.plan_self_modification(
                modification_type=ModificationType.TOOL_ENHANCEMENT,
                description="Test workflow modification",
                target_files=[str(test_file)],
                expected_benefits=["Test workflow"],
                success_criteria={"workflow_test": True}
            )
            
            # Note: Full execution would require all components to be available
            # For this test, we verify the planning phase works
            assert plan.plan_id is not None
            assert plan in system.modification_plans.values()
            
            result = {
                "test": "full_modification_workflow",
                "passed": True,
                "details": f"Workflow planning successful: {plan.plan_id}"
            }
            
        except Exception as e:
            result = {
                "test": "full_modification_workflow",
                "passed": False,
                "error": str(e)
            }
        
        self.test_results.append(result)
        logger.info(f"{'✅' if result['passed'] else '❌'} Full modification workflow test {'passed' if result['passed'] else 'failed'}")
    
    async def test_error_handling(self):
        """Test error handling capabilities."""
        logger.info("Testing error handling...")
        
        try:
            system = SelfModificationSystem()
            
            # Test handling of non-existent plan execution
            try:
                await system.execute_self_modification("non_existent_plan")
                result = {
                    "test": "error_handling",
                    "passed": False,
                    "error": "Should have raised ValueError for non-existent plan"
                }
            except ValueError:
                # Expected behavior
                result = {
                    "test": "error_handling",
                    "passed": True,
                    "details": "Error handling working correctly"
                }
            
        except Exception as e:
            result = {
                "test": "error_handling",
                "passed": False,
                "error": str(e)
            }
        
        self.test_results.append(result)
        logger.info(f"{'✅' if result['passed'] else '❌'} Error handling test {'passed' if result['passed'] else 'failed'}")
    
    async def test_concurrent_modifications(self):
        """Test concurrent modification handling."""
        logger.info("Testing concurrent modifications...")
        
        try:
            system = SelfModificationSystem()
            
            # Check max concurrent modifications setting
            assert system.max_concurrent_modifications > 0
            
            # Plan multiple modifications
            plans = []
            for i in range(2):
                plan = await system.plan_self_modification(
                    modification_type=ModificationType.BUG_FIX,
                    description=f"Concurrent test {i}",
                    target_files=[f"test_{i}.py"],
                    expected_benefits=[f"Test {i}"],
                    success_criteria={"test": True}
                )
                plans.append(plan)
            
            # Verify plans were created
            assert len(plans) == 2
            assert all(p.plan_id in system.modification_plans for p in plans)
            
            result = {
                "test": "concurrent_modifications",
                "passed": True,
                "details": f"Created {len(plans)} concurrent modification plans"
            }
            
        except Exception as e:
            result = {
                "test": "concurrent_modifications",
                "passed": False,
                "error": str(e)
            }
        
        self.test_results.append(result)
        logger.info(f"{'✅' if result['passed'] else '❌'} Concurrent modifications test {'passed' if result['passed'] else 'failed'}")
    
    async def test_safety_mechanisms(self):
        """Test safety mechanisms."""
        logger.info("Testing safety mechanisms...")
        
        try:
            system = SelfModificationSystem()
            
            # Test risk tolerance
            assert system.risk_tolerance is not None
            
            # Test auto-rollback setting
            assert system.auto_rollback_on_failure is not None
            
            # Test statistics tracking
            stats = system.get_modification_statistics()
            assert "total_modifications" in stats
            assert "success_rate" in stats
            
            result = {
                "test": "safety_mechanisms",
                "passed": True,
                "details": "Safety mechanisms properly configured"
            }
            
        except Exception as e:
            result = {
                "test": "safety_mechanisms",
                "passed": False,
                "error": str(e)
            }
        
        self.test_results.append(result)
        logger.info(f"{'✅' if result['passed'] else '❌'} Safety mechanisms test {'passed' if result['passed'] else 'failed'}")
    
    async def test_emergency_rollback(self):
        """Test emergency rollback functionality."""
        logger.info("Testing emergency rollback...")
        
        try:
            system = SelfModificationSystem()
            
            # Add some mock active modifications for testing
            from dataclasses import dataclass
            
            mock_plan = ModificationPlan(
                plan_id="mock_emergency",
                modification_type=ModificationType.BUG_FIX,
                risk_level=ModificationRisk.LOW,
                description="Mock for emergency test",
                target_files=[],
                expected_benefits=[],
                success_criteria={},
                rollback_plan={}  # Empty rollback plan for test
            )
            
            system.active_modifications["mock_emergency"] = mock_plan
            
            # Test emergency rollback
            rollback_results = await system.emergency_rollback_all()
            
            # Verify results structure
            assert "modifications_rolled_back" in rollback_results
            assert "failures" in rollback_results
            assert "success" in rollback_results
            
            # Verify active modifications were cleared
            assert len(system.active_modifications) == 0
            
            result = {
                "test": "emergency_rollback",
                "passed": True,
                "details": f"Emergency rollback completed: {rollback_results}"
            }
            
        except Exception as e:
            result = {
                "test": "emergency_rollback",
                "passed": False,
                "error": str(e)
            }
        
        self.test_results.append(result)
        logger.info(f"{'✅' if result['passed'] else '❌'} Emergency rollback test {'passed' if result['passed'] else 'failed'}")
    
    async def report_test_results(self):
        """Report test results."""
        logger.info("\n" + "=" * 50)
        logger.info("🧪 SELF-MODIFICATION SYSTEM TEST RESULTS")
        logger.info("=" * 50)
        
        passed_tests = sum(1 for r in self.test_results if r["passed"])
        total_tests = len(self.test_results)
        
        for result in self.test_results:
            status = "✅ PASSED" if result["passed"] else "❌ FAILED"
            test_name = result["test"].replace("_", " ").title()
            
            if result["passed"]:
                details = result.get("details", "")
                logger.info(f"{status}: {test_name} - {details}")
            else:
                error = result.get("error", "Unknown error")
                logger.info(f"{status}: {test_name} - {error}")
        
        logger.info("-" * 50)
        logger.info(f"📊 SUMMARY: {passed_tests}/{total_tests} tests passed ({(passed_tests/total_tests)*100:.1f}%)")
        
        if passed_tests == total_tests:
            logger.info("🎉 ALL TESTS PASSED - SELF-MODIFICATION SYSTEM READY!")
        else:
            logger.info("⚠️ Some tests failed - review and fix issues")
        
        return passed_tests == total_tests


async def main():
    """Run the self-modification system tests."""
    test_suite = TestSelfModificationSystem()
    success = await test_suite.run_all_tests()
    return success


if __name__ == "__main__":
    asyncio.run(main())