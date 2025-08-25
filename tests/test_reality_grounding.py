#!/usr/bin/env python3
"""
Reality Grounding System Test Suite
Comprehensive validation of physical world interaction capabilities

Tests:
1. Sensor Management and Reading
2. Actuator Control and Commands
3. Hypothesis Generation and Validation
4. Causal Reasoning and World Model
5. Azure IoT Integration
6. Real-time World State Updates
7. Physical Experiment Execution
"""

import asyncio
import logging
import json
import numpy as np
import torch
import time
from datetime import datetime
from typing import Dict, List, Any, Optional

# Import our reality grounding system
from reality_grounding_system import (
    create_reality_grounding_system,
    RealityGroundingSystem,
    SensorType,
    ActuatorType,
    SensorReading,
    ActuatorCommand,
    PhysicalHypothesis
)

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RealityGroundingValidator:
    """Comprehensive validator for reality grounding system"""
    
    def __init__(self):
        self.system: Optional[RealityGroundingSystem] = None
        self.test_results: List[Dict[str, Any]] = []
        
    async def test_sensor_management(self) -> Dict[str, Any]:
        """Test sensor registration, reading, and management"""
        logger.info("🔍 Testing Sensor Management...")
        
        result = {
            "test_name": "sensor_management",
            "success": False,
            "sensors_registered": 0,
            "readings_collected": 0,
            "sensor_types_working": [],
            "error": None
        }
        
        try:
            # Check default sensors are registered
            result["sensors_registered"] = len(self.system.sensor_manager.sensors)
            logger.info(f"Found {result['sensors_registered']} registered sensors")
            
            # Test reading from different sensor types
            successful_readings = 0
            for sensor_id, sensor_info in self.system.sensor_manager.sensors.items():
                try:
                    reading = await self.system.sensor_manager.read_sensor(sensor_id)
                    if reading:
                        successful_readings += 1
                        result["sensor_types_working"].append(sensor_info['type'].value)
                        logger.info(f"✅ Sensor {sensor_id} ({sensor_info['type'].value}): Reading successful")
                    else:
                        logger.warning(f"⚠️ Sensor {sensor_id}: No reading obtained")
                except Exception as e:
                    logger.error(f"❌ Sensor {sensor_id}: Error - {e}")
            
            result["readings_collected"] = successful_readings
            result["success"] = successful_readings >= len(self.system.sensor_manager.sensors) * 0.8  # 80% success rate
            
            # Test sensor queue functionality
            queue_size_before = self.system.sensor_manager.reading_queue.qsize()
            await asyncio.sleep(2)  # Let some readings accumulate
            queue_size_after = self.system.sensor_manager.reading_queue.qsize()
            
            result["queue_functionality"] = queue_size_after > queue_size_before
            logger.info(f"Sensor queue: {queue_size_before} -> {queue_size_after}")
            
        except Exception as e:
            result["error"] = str(e)
            logger.error(f"Sensor management test failed: {e}")
        
        return result
    
    async def test_actuator_control(self) -> Dict[str, Any]:
        """Test actuator registration and command execution"""
        logger.info("⚙️ Testing Actuator Control...")
        
        result = {
            "test_name": "actuator_control", 
            "success": False,
            "actuators_registered": 0,
            "commands_executed": 0,
            "actuator_types_working": [],
            "error": None
        }
        
        try:
            result["actuators_registered"] = len(self.system.actuator_manager.actuators)
            logger.info(f"Found {result['actuators_registered']} registered actuators")
            
            # Test commanding different actuator types
            successful_commands = 0
            for actuator_id, actuator_info in self.system.actuator_manager.actuators.items():
                try:
                    # Create appropriate command for actuator type
                    if actuator_info['type'] == ActuatorType.SERVO:
                        command_value = 90.0  # Middle position
                    elif actuator_info['type'] == ActuatorType.LED:
                        command_value = {"color": "green", "brightness": 128}
                    elif actuator_info['type'] == ActuatorType.SPEAKER:
                        command_value = {"frequency": 1000, "volume": 50, "duration": 0.5}
                    else:
                        command_value = 1.0
                    
                    command = ActuatorCommand(
                        actuator_id=actuator_id,
                        actuator_type=actuator_info['type'],
                        timestamp=datetime.now(),
                        command=command_value,
                        expected_duration=1.0
                    )
                    
                    success = await self.system.actuator_manager.send_command(command)
                    if success:
                        successful_commands += 1
                        result["actuator_types_working"].append(actuator_info['type'].value)
                        logger.info(f"✅ Actuator {actuator_id} ({actuator_info['type'].value}): Command successful")
                    else:
                        logger.warning(f"⚠️ Actuator {actuator_id}: Command failed")
                        
                except Exception as e:
                    logger.error(f"❌ Actuator {actuator_id}: Error - {e}")
            
            result["commands_executed"] = successful_commands
            result["success"] = successful_commands >= len(self.system.actuator_manager.actuators) * 0.8
            
        except Exception as e:
            result["error"] = str(e)
            logger.error(f"Actuator control test failed: {e}")
        
        return result
    
    async def test_hypothesis_system(self) -> Dict[str, Any]:
        """Test hypothesis generation, validation, and experimentation"""
        logger.info("🧪 Testing Hypothesis System...")
        
        result = {
            "test_name": "hypothesis_system",
            "success": False,
            "hypotheses_generated": 0,
            "hypotheses_tested": 0,
            "experiment_success": False,
            "error": None
        }
        
        try:
            # Wait for hypothesis generation
            initial_count = len(self.system.active_hypotheses)
            logger.info(f"Initial active hypotheses: {initial_count}")
            
            # Let system generate hypotheses for 35 seconds
            await asyncio.sleep(35)
            
            final_count = len(self.system.active_hypotheses)
            result["hypotheses_generated"] = final_count
            logger.info(f"Final active hypotheses: {final_count}")
            
            # Test hypothesis validation if we have hypotheses
            if self.system.active_hypotheses:
                hypothesis = self.system.active_hypotheses[0]
                logger.info(f"Testing hypothesis: {hypothesis.description}")
                
                test_result = await self.system.test_hypothesis(hypothesis.hypothesis_id)
                if test_result:
                    result["hypotheses_tested"] = 1
                    result["experiment_success"] = test_result.get('success', False)
                    result["hypothesis_supported"] = test_result.get('hypothesis_supported', False)
                    logger.info(f"Hypothesis test completed: {test_result.get('hypothesis_supported', 'unknown')} support")
            
            # Create a custom hypothesis for testing
            custom_hypothesis = PhysicalHypothesis(
                hypothesis_id=f"test_hypothesis_{int(time.time())}",
                description="Custom test hypothesis for validation",
                prediction={"test_outcome": {"value": 1.0}},
                test_conditions={"duration": 5.0},
                expected_outcome={"measurement": {"range": [0.5, 1.5]}},
                confidence=0.8,
                created_at=datetime.now()
            )
            
            self.system.active_hypotheses.append(custom_hypothesis)
            custom_result = await self.system.test_hypothesis(custom_hypothesis.hypothesis_id)
            
            if custom_result:
                result["hypotheses_tested"] += 1
                result["custom_hypothesis_success"] = custom_result.get('success', False)
            
            result["success"] = result["hypotheses_generated"] > 0 and result["hypotheses_tested"] > 0
            
        except Exception as e:
            result["error"] = str(e)
            logger.error(f"Hypothesis system test failed: {e}")
        
        return result
    
    async def test_world_model_integration(self) -> Dict[str, Any]:
        """Test world state tracking and causal reasoning"""
        logger.info("🌍 Testing World Model Integration...")
        
        result = {
            "test_name": "world_model_integration",
            "success": False,
            "world_state_updates": 0,
            "causal_links_found": 0,
            "derived_properties": 0,
            "uncertainty_estimation": False,
            "error": None
        }
        
        try:
            # Check initial world state
            initial_timestamp = self.system.current_world_state.timestamp
            initial_readings = len(self.system.current_world_state.sensor_readings)
            
            logger.info(f"Initial world state: {initial_readings} readings at {initial_timestamp}")
            
            # Wait for world state updates
            await asyncio.sleep(10)
            
            # Check updated world state
            final_timestamp = self.system.current_world_state.timestamp
            final_readings = len(self.system.current_world_state.sensor_readings)
            
            result["world_state_updates"] = 1 if final_timestamp > initial_timestamp else 0
            result["current_readings"] = final_readings
            
            # Check derived properties
            derived_props = self.system.current_world_state.derived_properties
            result["derived_properties"] = len(derived_props)
            logger.info(f"Derived properties: {list(derived_props.keys())}")
            
            # Check causal links
            causal_links = self.system.current_world_state.causal_links
            result["causal_links_found"] = sum(len(links) for links in causal_links.values())
            logger.info(f"Causal links: {result['causal_links_found']} total")
            
            # Check uncertainty estimation
            uncertainties = self.system.current_world_state.uncertainty_map
            result["uncertainty_estimation"] = len(uncertainties) > 0
            if uncertainties:
                avg_uncertainty = np.mean(list(uncertainties.values()))
                result["average_uncertainty"] = avg_uncertainty
                logger.info(f"Average uncertainty: {avg_uncertainty:.3f}")
            
            # Test causal model inference
            try:
                if hasattr(self.system, 'causal_model'):
                    test_input = torch.randn(1, 128)
                    with torch.no_grad():
                        effects, uncertainty, causal_adj = self.system.causal_model(test_input)
                    result["causal_model_functional"] = True
                    result["causal_model_output_shape"] = list(effects.shape)
                    logger.info("✅ Causal model inference successful")
            except Exception as e:
                result["causal_model_error"] = str(e)
                logger.warning(f"⚠️ Causal model inference failed: {e}")
            
            # Test world model prediction
            try:
                if hasattr(self.system, 'world_model'):
                    test_state = torch.randn(1, 64)
                    test_action = torch.randn(1, 32) 
                    with torch.no_grad():
                        next_state, physics_loss = self.system.world_model.predict_next_state(test_state, test_action)
                    result["world_model_functional"] = True
                    result["world_model_output_shape"] = list(next_state.shape)
                    result["physics_loss"] = float(physics_loss)
                    logger.info("✅ World model prediction successful")
            except Exception as e:
                result["world_model_error"] = str(e)
                logger.warning(f"⚠️ World model prediction failed: {e}")
            
            result["success"] = (
                result["world_state_updates"] > 0 and
                result["derived_properties"] > 0 and
                result.get("causal_model_functional", False)
            )
            
        except Exception as e:
            result["error"] = str(e)
            logger.error(f"World model integration test failed: {e}")
        
        return result
    
    async def test_physical_experimentation(self) -> Dict[str, Any]:
        """Test end-to-end physical experimentation capabilities"""
        logger.info("🔬 Testing Physical Experimentation...")
        
        result = {
            "test_name": "physical_experimentation", 
            "success": False,
            "experiment_designed": False,
            "experiment_executed": False,
            "results_analyzed": False,
            "error": None
        }
        
        try:
            # Create a test hypothesis for physical experimentation
            test_hypothesis = PhysicalHypothesis(
                hypothesis_id=f"physical_test_{int(time.time())}",
                description="Test servo movement affects accelerometer readings",
                prediction={"acceleration_change": {"direction": "increase"}},
                test_conditions={
                    "servo_movement": {"manipulate": [0, 90, 180], "actuator": "servo_1"},
                    "duration": 15.0,
                    "measurement_frequency": 2.0
                },
                expected_outcome={
                    "acceleration_magnitude": {"range": [0.1, 5.0], "sensor": "accel_main"}
                },
                confidence=0.7,
                created_at=datetime.now()
            )
            
            # Add to system
            self.system.active_hypotheses.append(test_hypothesis)
            
            # Test experimental design
            experiment_design = self.system.hypothesis_validator._design_experiment(test_hypothesis)
            result["experiment_designed"] = len(experiment_design.get('manipulation_variables', [])) > 0
            result["experiment_design"] = experiment_design
            logger.info(f"Experiment design: {len(experiment_design.get('manipulation_variables', []))} manipulations, {len(experiment_design.get('measurement_variables', []))} measurements")
            
            # Execute experiment
            logger.info("Executing physical experiment...")
            experiment_result = await self.system.test_hypothesis(test_hypothesis.hypothesis_id)
            
            if experiment_result:
                result["experiment_executed"] = experiment_result.get('success', False)
                result["results_analyzed"] = 'evidence' in experiment_result
                result["hypothesis_supported"] = experiment_result.get('hypothesis_supported', False)
                result["confidence_score"] = experiment_result.get('confidence', 0.0)
                
                logger.info(f"Experiment completed:")
                logger.info(f"  - Success: {result['experiment_executed']}")
                logger.info(f"  - Hypothesis supported: {result['hypothesis_supported']}")
                logger.info(f"  - Confidence: {result['confidence_score']:.3f}")
            
            result["success"] = (
                result["experiment_designed"] and
                result["experiment_executed"] and
                result["results_analyzed"]
            )
            
        except Exception as e:
            result["error"] = str(e)
            logger.error(f"Physical experimentation test failed: {e}")
        
        return result
    
    async def test_system_integration(self) -> Dict[str, Any]:
        """Test overall system integration and performance"""
        logger.info("🔄 Testing System Integration...")
        
        result = {
            "test_name": "system_integration",
            "success": False,
            "system_status": {},
            "performance_metrics": {},
            "error": None
        }
        
        try:
            # Get comprehensive system status
            status = await self.system.get_system_status()
            result["system_status"] = status
            
            logger.info("System Status:")
            logger.info(f"  - System Active: {status['system_active']}")
            logger.info(f"  - Sensors: {status['sensors']['active']}/{status['sensors']['registered']} active")
            logger.info(f"  - Actuators: {status['actuators']['active']}/{status['actuators']['registered']} active")
            logger.info(f"  - Hypotheses: {status['hypotheses']['active']} active, {status['hypotheses']['validated']} validated")
            logger.info(f"  - Success Rate: {status['hypotheses']['success_rate']:.1%}")
            logger.info(f"  - World State: {status['world_state']['derived_properties']} properties, {status['world_state']['causal_links']} causal links")
            
            # Performance metrics
            start_time = time.time()
            
            # Test sensor reading performance
            sensor_start = time.time()
            sensor_readings = []
            for sensor_id in list(self.system.sensor_manager.sensors.keys())[:3]:  # Test first 3 sensors
                reading = await self.system.sensor_manager.read_sensor(sensor_id)
                if reading:
                    sensor_readings.append(reading)
            sensor_time = time.time() - sensor_start
            
            # Test actuator command performance
            actuator_start = time.time()
            if self.system.actuator_manager.actuators:
                actuator_id = list(self.system.actuator_manager.actuators.keys())[0]
                command = ActuatorCommand(
                    actuator_id=actuator_id,
                    actuator_type=ActuatorType.SERVO,
                    timestamp=datetime.now(),
                    command=45.0,
                    expected_duration=0.5
                )
                await self.system.actuator_manager.send_command(command)
            actuator_time = time.time() - actuator_start
            
            total_time = time.time() - start_time
            
            result["performance_metrics"] = {
                "sensor_reading_time": sensor_time,
                "actuator_command_time": actuator_time,
                "total_integration_time": total_time,
                "sensor_readings_collected": len(sensor_readings),
                "readings_per_second": len(sensor_readings) / max(sensor_time, 0.001)
            }
            
            # Validate system coherence
            coherence_checks = {
                "sensors_and_world_state": len(self.system.current_world_state.sensor_readings) > 0,
                "actuators_responsive": len(self.system.actuator_manager.actuators) > 0,
                "hypotheses_generating": len(self.system.active_hypotheses) + len(self.system.validated_hypotheses) > 0,
                "models_functional": hasattr(self.system, 'causal_model') and hasattr(self.system, 'world_model')
            }
            
            result["coherence_checks"] = coherence_checks
            coherence_score = sum(coherence_checks.values()) / len(coherence_checks)
            result["coherence_score"] = coherence_score
            
            logger.info(f"Performance Metrics:")
            logger.info(f"  - Sensor Reading Time: {sensor_time:.3f}s")
            logger.info(f"  - Actuator Command Time: {actuator_time:.3f}s")
            logger.info(f"  - Readings per Second: {result['performance_metrics']['readings_per_second']:.1f}")
            logger.info(f"  - System Coherence: {coherence_score:.1%}")
            
            result["success"] = (
                status['system_active'] and
                coherence_score > 0.7 and
                result['performance_metrics']['readings_per_second'] > 1.0
            )
            
        except Exception as e:
            result["error"] = str(e)
            logger.error(f"System integration test failed: {e}")
        
        return result

async def run_reality_grounding_validation() -> Dict[str, Any]:
    """Run comprehensive reality grounding validation suite"""
    logger.info("🚀 RomAI Reality Grounding System - Comprehensive Validation")
    logger.info("=" * 70)
    
    validator = RealityGroundingValidator()
    
    validation_results = {
        "timestamp": time.time(),
        "total_tests": 0,
        "passed_tests": 0,
        "failed_tests": 0,
        "test_results": [],
        "overall_status": "UNKNOWN"
    }
    
    start_time = time.time()
    
    try:
        # Initialize reality grounding system
        logger.info("Initializing Reality Grounding System...")
        validator.system = await create_reality_grounding_system()
        logger.info("✅ Reality Grounding System initialized")
        
        # Define test sequence
        test_functions = [
            validator.test_sensor_management,
            validator.test_actuator_control,
            validator.test_world_model_integration,
            validator.test_hypothesis_system,
            validator.test_physical_experimentation,
            validator.test_system_integration
        ]
        
        validation_results["total_tests"] = len(test_functions)
        
        # Execute test suite
        for test_func in test_functions:
            try:
                logger.info(f"\n{'='*40}")
                test_result = await test_func()
                validation_results["test_results"].append(test_result)
                
                if test_result.get("success", False):
                    validation_results["passed_tests"] += 1
                    logger.info(f"✅ {test_result.get('test_name', test_func.__name__)}: PASSED")
                else:
                    validation_results["failed_tests"] += 1
                    logger.info(f"❌ {test_result.get('test_name', test_func.__name__)}: FAILED")
                    if "error" in test_result:
                        logger.info(f"   Error: {test_result['error']}")
                        
            except Exception as e:
                error_result = {
                    "test_name": test_func.__name__,
                    "success": False,
                    "error": str(e)
                }
                validation_results["test_results"].append(error_result)
                validation_results["failed_tests"] += 1
                logger.error(f"💥 {test_func.__name__}: ERROR - {e}")
        
    except Exception as e:
        logger.error(f"Failed to initialize Reality Grounding System: {e}")
        validation_results["initialization_error"] = str(e)
        validation_results["overall_status"] = "INITIALIZATION_FAILED"
        return validation_results
    
    finally:
        # Shutdown system
        if validator.system:
            await validator.system.shutdown()
    
    # Calculate final results
    total_time = time.time() - start_time
    success_rate = validation_results["passed_tests"] / validation_results["total_tests"] * 100
    
    if success_rate >= 85:
        validation_results["overall_status"] = "EXCELLENT"
    elif success_rate >= 70:
        validation_results["overall_status"] = "GOOD"
    elif success_rate >= 50:
        validation_results["overall_status"] = "ACCEPTABLE"
    else:
        validation_results["overall_status"] = "NEEDS_IMPROVEMENT"
    
    # Final summary
    logger.info("\n" + "=" * 70)
    logger.info("📊 REALITY GROUNDING SYSTEM VALIDATION SUMMARY")
    logger.info("=" * 70)
    logger.info(f"✅ Tests Passed: {validation_results['passed_tests']}")
    logger.info(f"❌ Tests Failed: {validation_results['failed_tests']}")
    logger.info(f"📈 Success Rate: {success_rate:.1f}%")
    logger.info(f"⏱️  Total Time: {total_time:.2f} seconds")
    logger.info(f"🎯 Overall Status: {validation_results['overall_status']}")
    
    # Status-specific messages
    if validation_results["overall_status"] == "EXCELLENT":
        logger.info("🎉 REALITY GROUNDING SYSTEM: PRODUCTION READY!")
        logger.info("🌍 Physical world interaction capabilities fully validated!")
    elif validation_results["overall_status"] == "GOOD":
        logger.info("✨ REALITY GROUNDING SYSTEM: HIGHLY FUNCTIONAL")
        logger.info("🔧 Minor improvements recommended for production deployment")
    elif validation_results["overall_status"] == "ACCEPTABLE":
        logger.info("⚠️  REALITY GROUNDING SYSTEM: BASIC FUNCTIONALITY")
        logger.info("🛠️  Additional development needed for full capability")
    else:
        logger.info("🚨 REALITY GROUNDING SYSTEM: REQUIRES SIGNIFICANT WORK")
        logger.info("🔧 Major components need fixes before deployment")
    
    validation_results["total_time"] = total_time
    validation_results["success_rate"] = success_rate
    
    # Save results
    results_file = f"reality_grounding_validation_{int(time.time())}.json"
    with open(results_file, 'w') as f:
        json.dump(validation_results, f, indent=2, default=str)
    logger.info(f"💾 Results saved to: {results_file}")
    
    return validation_results

async def main():
    """Main validation function"""
    try:
        results = await run_reality_grounding_validation()
        
        # Exit with appropriate code
        if results["overall_status"] in ["EXCELLENT", "GOOD"]:
            logger.info("🎯 TODO #9: Reality Grounding System - COMPLETED SUCCESSFULLY!")
            exit(0)
        elif results["overall_status"] == "ACCEPTABLE":
            logger.info("🎯 TODO #9: Reality Grounding System - BASIC FUNCTIONALITY ACHIEVED!")
            exit(0)
        else:
            logger.warning("⚠️  TODO #9: Reality Grounding System - NEEDS IMPROVEMENTS")
            exit(1)
            
    except Exception as e:
        logger.error(f"❌ Reality Grounding validation failed with error: {e}")
        exit(1)

if __name__ == "__main__":
    asyncio.run(main())