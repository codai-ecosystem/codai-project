"""
Multi-Agent Coordination Test Suite
==================================

Comprehensive test suite for the ROMAI multi-agent coordination system.
Tests agent discovery, communication, distributed reasoning, and task coordination.

Author: ROMAI AGI Team
Date: 2025-08-28
Version: 1.0.0
"""

import asyncio
import pytest
import logging
import time
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import multi-agent coordination components
try:
    from multi_agent_coordination import (
        AgentCoordinator, InterAgentCommunication, DistributedReasoning,
        AgentRole, TaskPriority, CoordinationStatus, MessageType,
        AgentInfo, AgentCapability, CoordinationTask, InterAgentMessage
    )
    COORDINATION_AVAILABLE = True
except ImportError as e:
    COORDINATION_AVAILABLE = False
    logger.warning(f"Multi-agent coordination not available: {e}")


class MultiAgentCoordinationTestSuite:
    """Comprehensive test suite for multi-agent coordination system."""
    
    def __init__(self):
        """Initialize the test suite."""
        self.test_results = []
        self.test_agents = []
        self.performance_metrics = {
            "start_time": time.time(),
            "communication_tests": {},
            "coordination_tests": {},
            "distributed_reasoning_tests": {},
            "integration_tests": {}
        }
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all multi-agent coordination tests."""
        logger.info("🤖 ROMAI MULTI-AGENT COORDINATION TEST SUITE")
        logger.info("=" * 60)
        logger.info(f"Test suite started at: {datetime.now()}")
        logger.info("")
        
        if not COORDINATION_AVAILABLE:
            logger.error("❌ Multi-agent coordination module not available")
            return {"error": "Module not available", "tests_run": 0}
        
        # Core component tests
        await self.test_agent_coordinator_initialization()
        await self.test_inter_agent_communication()
        await self.test_agent_discovery()
        await self.test_capability_management()
        
        # Coordination tests
        await self.test_task_coordination()
        await self.test_distributed_reasoning()
        await self.test_consensus_formation()
        
        # Integration tests
        await self.test_multi_agent_network()
        await self.test_concurrent_coordination()
        await self.test_fault_tolerance()
        
        # Performance tests
        await self.test_scalability()
        await self.test_communication_latency()
        
        # Generate comprehensive report
        return await self.generate_test_report()
    
    async def test_agent_coordinator_initialization(self):
        """Test agent coordinator initialization."""
        logger.info("🤖 Testing Agent Coordinator Initialization...")
        
        test_start = time.time()
        
        try:
            # Test basic initialization
            coordinator = AgentCoordinator(
                agent_id="test-coordinator-001",
                name="Test Coordinator",
                role=AgentRole.COORDINATOR,
                port=8100
            )
            
            # Verify initialization
            assert coordinator.agent_id == "test-coordinator-001"
            assert coordinator.name == "Test Coordinator"
            assert coordinator.role == AgentRole.COORDINATOR
            assert coordinator.port == 8100
            assert isinstance(coordinator.communication, InterAgentCommunication)
            assert isinstance(coordinator.distributed_reasoning, DistributedReasoning)
            assert len(coordinator.known_agents) == 0
            assert len(coordinator.coordination_tasks) == 0
            
            # Test with different roles
            specialist = AgentCoordinator(
                "test-specialist-001", 
                "Test Specialist", 
                AgentRole.SPECIALIST, 
                8101
            )
            
            monitor = AgentCoordinator(
                "test-monitor-001",
                "Test Monitor",
                AgentRole.MONITOR,
                8102
            )
            
            # Store test agents for cleanup
            self.test_agents.extend([coordinator, specialist, monitor])
            
            elapsed = time.time() - test_start
            self.performance_metrics["communication_tests"]["initialization"] = elapsed
            self._record_test("agent_coordinator_initialization", True, 
                            f"Successfully initialized 3 agents ({elapsed:.2f}s)")
            
        except Exception as e:
            self._record_test("agent_coordinator_initialization", False, f"Error: {e}")
    
    async def test_inter_agent_communication(self):
        """Test inter-agent communication system."""
        logger.info("💬 Testing Inter-Agent Communication...")
        
        test_start = time.time()
        
        try:
            # Create communication systems
            comm1 = InterAgentCommunication("agent-001", 8200)
            comm2 = InterAgentCommunication("agent-002", 8201)
            
            # Test message creation
            test_message = InterAgentMessage(
                message_id="test-msg-001",
                sender_id="agent-001",
                recipient_id="agent-002",
                message_type=MessageType.HANDSHAKE,
                content={"greeting": "hello", "test": True}
            )
            
            # Verify message serialization
            message_dict = test_message.to_dict()
            assert message_dict["message_id"] == "test-msg-001"
            assert message_dict["sender_id"] == "agent-001"
            assert message_dict["message_type"] == "handshake"
            
            # Test message deserialization
            reconstructed_message = InterAgentMessage.from_dict(message_dict)
            assert reconstructed_message.message_id == test_message.message_id
            assert reconstructed_message.sender_id == test_message.sender_id
            assert reconstructed_message.message_type == test_message.message_type
            
            # Test message handlers registration
            async def test_handler(message):
                return InterAgentMessage(
                    message_id="response-001",
                    sender_id="agent-002",
                    recipient_id=message.sender_id,
                    message_type=MessageType.STATUS_UPDATE,
                    content={"status": "received"}
                )
            
            comm2.register_handler(MessageType.HANDSHAKE, test_handler)
            assert MessageType.HANDSHAKE in comm2.message_handlers
            
            elapsed = time.time() - test_start
            self.performance_metrics["communication_tests"]["messaging"] = elapsed
            self._record_test("inter_agent_communication", True, 
                            f"Communication system working ({elapsed:.2f}s)")
            
        except Exception as e:
            self._record_test("inter_agent_communication", False, f"Error: {e}")
    
    async def test_agent_discovery(self):
        """Test agent discovery mechanism."""
        logger.info("🔍 Testing Agent Discovery...")
        
        test_start = time.time()
        
        try:
            # Create a coordinator for discovery testing
            coordinator = AgentCoordinator(
                "discovery-test-coordinator",
                "Discovery Test Coordinator",
                AgentRole.COORDINATOR,
                8300
            )
            
            # Test discovery method (simplified since we don't have actual network agents)
            discovered_agents = await coordinator.discover_agents("localhost")
            
            # Verify discovery results (should be empty in test environment)
            assert isinstance(discovered_agents, list)
            
            # Test manual agent registration (simulating discovery)
            test_agent_info = AgentInfo(
                agent_id="discovered-agent-001",
                name="Discovered Agent",
                role=AgentRole.SPECIALIST,
                endpoint="ws://localhost:8301"
            )
            
            coordinator.known_agents["discovered-agent-001"] = test_agent_info
            
            # Verify registration
            assert len(coordinator.known_agents) == 1
            assert "discovered-agent-001" in coordinator.known_agents
            
            # Test agent health checking
            assert test_agent_info.is_healthy()
            
            # Test with old heartbeat (should be unhealthy)
            old_time = datetime.now() - timedelta(minutes=2)
            test_agent_info.last_heartbeat = old_time
            assert not test_agent_info.is_healthy(timeout_seconds=60)
            
            self.test_agents.append(coordinator)
            
            elapsed = time.time() - test_start
            self.performance_metrics["coordination_tests"]["discovery"] = elapsed
            self._record_test("agent_discovery", True, 
                            f"Discovery mechanism working ({elapsed:.2f}s)")
            
        except Exception as e:
            self._record_test("agent_discovery", False, f"Error: {e}")
    
    async def test_capability_management(self):
        """Test agent capability management."""
        logger.info("🔧 Testing Capability Management...")
        
        test_start = time.time()
        
        try:
            # Create test capabilities
            math_capability = AgentCapability(
                capability_id="mathematics",
                name="Mathematical Reasoning",
                description="Advanced mathematical problem solving",
                expertise_level=0.9,
                processing_speed=15.0,
                reliability_score=0.95,
                specializations=["algebra", "calculus", "geometry"]
            )
            
            logic_capability = AgentCapability(
                capability_id="logic",
                name="Logical Reasoning",
                description="Formal logic and deductive reasoning",
                expertise_level=0.8,
                processing_speed=20.0,
                reliability_score=0.9,
                specializations=["propositional_logic", "predicate_logic"]
            )
            
            # Verify capability properties
            assert math_capability.capability_id == "mathematics"
            assert math_capability.expertise_level == 0.9
            assert "algebra" in math_capability.specializations
            
            # Create agent with capabilities
            specialist = AgentCoordinator(
                "capability-test-specialist",
                "Capability Test Specialist",
                AgentRole.SPECIALIST,
                8400
            )
            
            # Add capabilities to agent
            specialist.local_capabilities.extend([math_capability, logic_capability])
            
            # Verify capabilities were added
            assert len(specialist.local_capabilities) >= 2  # Including default capabilities
            
            capability_ids = [cap.capability_id for cap in specialist.local_capabilities]
            assert "mathematics" in capability_ids
            assert "logic" in capability_ids
            
            self.test_agents.append(specialist)
            
            elapsed = time.time() - test_start
            self.performance_metrics["coordination_tests"]["capabilities"] = elapsed
            self._record_test("capability_management", True, 
                            f"Capability management working ({elapsed:.2f}s)")
            
        except Exception as e:
            self._record_test("capability_management", False, f"Error: {e}")
    
    async def test_task_coordination(self):
        """Test task coordination system."""
        logger.info("📋 Testing Task Coordination...")
        
        test_start = time.time()
        
        try:
            # Create coordinator
            coordinator = AgentCoordinator(
                "task-test-coordinator",
                "Task Test Coordinator",
                AgentRole.COORDINATOR,
                8500
            )
            
            # Create mock specialist agents
            math_agent = AgentInfo(
                agent_id="math-specialist",
                name="Math Specialist",
                role=AgentRole.SPECIALIST,
                endpoint="ws://localhost:8501",
                capabilities=[
                    AgentCapability(
                        capability_id="mathematics",
                        name="Mathematics",
                        description="Math problem solving",
                        expertise_level=0.9,
                        processing_speed=10.0,
                        reliability_score=0.95
                    )
                ]
            )
            
            logic_agent = AgentInfo(
                agent_id="logic-specialist",
                name="Logic Specialist", 
                role=AgentRole.SPECIALIST,
                endpoint="ws://localhost:8502",
                capabilities=[
                    AgentCapability(
                        capability_id="logical_reasoning",
                        name="Logical Reasoning",
                        description="Logic problem solving",
                        expertise_level=0.8,
                        processing_speed=12.0,
                        reliability_score=0.9
                    )
                ]
            )
            
            # Add agents to coordinator's known agents
            coordinator.known_agents["math-specialist"] = math_agent
            coordinator.known_agents["logic-specialist"] = logic_agent
            
            # Create coordination task
            task = CoordinationTask(
                task_id="test-task-001",
                description="Solve mathematical logic problem",
                priority=TaskPriority.HIGH,
                required_capabilities=["mathematics", "logical_reasoning"],
                input_data={"problem": "What is the logical basis for mathematical induction?"}
            )
            
            # Test task properties
            assert task.task_id == "test-task-001"
            assert task.priority == TaskPriority.HIGH
            assert task.status == CoordinationStatus.INITIALIZING
            assert not task.is_expired()
            
            # Test capability matching
            suitable_agents = coordinator._find_suitable_agents(["mathematics"])
            assert len(suitable_agents) >= 1
            assert any(agent.agent_id == "math-specialist" for agent in suitable_agents)
            
            # Test task assignment (without actual network communication)
            coordinator.coordination_tasks[task.task_id] = task
            task.assigned_agents = ["math-specialist", "logic-specialist"]
            task.status = CoordinationStatus.ACTIVE
            
            # Verify task state
            assert len(task.assigned_agents) == 2
            assert task.status == CoordinationStatus.ACTIVE
            
            self.test_agents.append(coordinator)
            
            elapsed = time.time() - test_start
            self.performance_metrics["coordination_tests"]["task_coordination"] = elapsed
            self._record_test("task_coordination", True, 
                            f"Task coordination working ({elapsed:.2f}s)")
            
        except Exception as e:
            self._record_test("task_coordination", False, f"Error: {e}")
    
    async def test_distributed_reasoning(self):
        """Test distributed reasoning system."""
        logger.info("🧠 Testing Distributed Reasoning...")
        
        test_start = time.time()
        
        try:
            # Create communication system
            comm = InterAgentCommunication("reasoning-test-agent", 8600)
            
            # Create distributed reasoning system
            reasoning = DistributedReasoning("reasoning-test-agent", comm)
            
            # Test local reasoning
            local_result = await reasoning._perform_local_reasoning(
                "What is 2 + 2?", 
                "mathematics"
            )
            
            # Verify local reasoning result
            assert "agent_id" in local_result
            assert "conclusion" in local_result
            assert "confidence" in local_result
            assert local_result["agent_id"] == "reasoning-test-agent"
            assert local_result["confidence"] > 0.0
            
            # Test reasoning result storage
            reasoning_id = "test-reasoning-001"
            reasoning.reasoning_results[reasoning_id] = {
                "agent-1": {"conclusion": "Answer is 4", "confidence": 0.9},
                "agent-2": {"conclusion": "Answer is 4", "confidence": 0.8},
                "agent-3": {"conclusion": "Answer is 4", "confidence": 0.95}
            }
            
            # Test consensus formation
            consensus_result = await reasoning._form_consensus(reasoning_id)
            
            # Verify consensus result
            assert "reasoning_id" in consensus_result
            assert "consensus_achieved" in consensus_result
            assert "consensus_confidence" in consensus_result
            assert consensus_result["reasoning_id"] == reasoning_id
            assert consensus_result["consensus_achieved"] == True  # All same conclusion
            
            elapsed = time.time() - test_start
            self.performance_metrics["distributed_reasoning_tests"]["basic"] = elapsed
            self._record_test("distributed_reasoning", True, 
                            f"Distributed reasoning working ({elapsed:.2f}s)")
            
        except Exception as e:
            self._record_test("distributed_reasoning", False, f"Error: {e}")
    
    async def test_consensus_formation(self):
        """Test consensus formation algorithms."""
        logger.info("🤝 Testing Consensus Formation...")
        
        test_start = time.time()
        
        try:
            # Create reasoning system for consensus testing
            comm = InterAgentCommunication("consensus-test-agent", 8700)
            reasoning = DistributedReasoning("consensus-test-agent", comm)
            
            # Test with unanimous consensus
            reasoning_id1 = "consensus-test-unanimous"
            reasoning.reasoning_results[reasoning_id1] = {
                "agent-1": {"conclusion": "Unanimous answer", "confidence": 0.9},
                "agent-2": {"conclusion": "Unanimous answer", "confidence": 0.8},
                "agent-3": {"conclusion": "Unanimous answer", "confidence": 0.85}
            }
            
            unanimous_result = await reasoning._form_consensus(reasoning_id1)
            assert unanimous_result["consensus_achieved"] == True
            assert unanimous_result["final_conclusion"] == "Unanimous answer"
            
            # Test with mixed conclusions
            reasoning_id2 = "consensus-test-mixed" 
            reasoning.reasoning_results[reasoning_id2] = {
                "agent-1": {"conclusion": "Answer A", "confidence": 0.7},
                "agent-2": {"conclusion": "Answer B", "confidence": 0.8},
                "agent-3": {"conclusion": "Answer A", "confidence": 0.75}
            }
            
            mixed_result = await reasoning._form_consensus(reasoning_id2)
            assert mixed_result["consensus_achieved"] == False
            assert mixed_result["final_conclusion"] == "Mixed conclusions"
            
            # Test with no results
            empty_result = await reasoning._form_consensus("no-results")
            assert "error" in empty_result
            assert empty_result["consensus"] == False
            
            elapsed = time.time() - test_start
            self.performance_metrics["distributed_reasoning_tests"]["consensus"] = elapsed
            self._record_test("consensus_formation", True, 
                            f"Consensus formation working ({elapsed:.2f}s)")
            
        except Exception as e:
            self._record_test("consensus_formation", False, f"Error: {e}")
    
    async def test_multi_agent_network(self):
        """Test complete multi-agent network functionality."""
        logger.info("🌐 Testing Multi-Agent Network...")
        
        test_start = time.time()
        
        try:
            # Create a small network of agents
            coordinator = AgentCoordinator(
                "network-coordinator",
                "Network Coordinator",
                AgentRole.COORDINATOR,
                8800
            )
            
            specialist1 = AgentCoordinator(
                "network-specialist-1",
                "Network Specialist 1",
                AgentRole.SPECIALIST,
                8801
            )
            
            specialist2 = AgentCoordinator(
                "network-specialist-2", 
                "Network Specialist 2",
                AgentRole.SPECIALIST,
                8802
            )
            
            monitor = AgentCoordinator(
                "network-monitor",
                "Network Monitor",
                AgentRole.MONITOR,
                8803
            )
            
            network_agents = [coordinator, specialist1, specialist2, monitor]
            
            # Add capabilities to specialists
            math_cap = AgentCapability(
                capability_id="mathematics",
                name="Mathematics",
                description="Mathematical reasoning",
                expertise_level=0.9,
                processing_speed=10.0,
                reliability_score=0.95
            )
            
            logic_cap = AgentCapability(
                capability_id="logic",
                name="Logic",
                description="Logical reasoning",
                expertise_level=0.8,
                processing_speed=12.0,
                reliability_score=0.9
            )
            
            specialist1.local_capabilities.append(math_cap)
            specialist2.local_capabilities.append(logic_cap)
            
            # Simulate agent discovery by manually adding to known agents
            for agent in network_agents:
                for other_agent in network_agents:
                    if agent != other_agent:
                        agent_info = AgentInfo(
                            agent_id=other_agent.agent_id,
                            name=other_agent.name,
                            role=other_agent.role,
                            endpoint=f"ws://localhost:{other_agent.port}",
                            capabilities=other_agent.local_capabilities
                        )
                        agent.known_agents[other_agent.agent_id] = agent_info
            
            # Test network statistics
            for agent in network_agents:
                stats = agent.get_coordination_statistics()
                assert "agent_id" in stats
                assert "known_agents" in stats
                assert "status" in stats
                assert stats["status"] == "active"
                assert stats["known_agents"] >= 3  # Should know other 3 agents
            
            # Test capability discovery across network
            math_agents = coordinator._find_suitable_agents(["mathematics"])
            assert len(math_agents) >= 1
            
            logic_agents = coordinator._find_suitable_agents(["logic"])
            assert len(logic_agents) >= 1
            
            # Store for cleanup
            self.test_agents.extend(network_agents)
            
            elapsed = time.time() - test_start
            self.performance_metrics["integration_tests"]["multi_agent_network"] = elapsed
            self._record_test("multi_agent_network", True, 
                            f"Multi-agent network working ({elapsed:.2f}s, {len(network_agents)} agents)")
            
        except Exception as e:
            self._record_test("multi_agent_network", False, f"Error: {e}")
    
    async def test_concurrent_coordination(self):
        """Test concurrent coordination capabilities."""
        logger.info("⚡ Testing Concurrent Coordination...")
        
        test_start = time.time()
        
        try:
            # Create coordinator
            coordinator = AgentCoordinator(
                "concurrent-test-coordinator",
                "Concurrent Test Coordinator",
                AgentRole.COORDINATOR,
                8900
            )
            
            # Add mock agents with capabilities
            for i in range(5):
                agent_info = AgentInfo(
                    agent_id=f"concurrent-agent-{i}",
                    name=f"Concurrent Agent {i}",
                    role=AgentRole.SPECIALIST,
                    endpoint=f"ws://localhost:{8901 + i}",
                    capabilities=[
                        AgentCapability(
                            capability_id=f"skill_{i}",
                            name=f"Skill {i}",
                            description=f"Specialized skill {i}",
                            expertise_level=0.8,
                            processing_speed=10.0,
                            reliability_score=0.9
                        )
                    ]
                )
                coordinator.known_agents[f"concurrent-agent-{i}"] = agent_info
            
            # Create multiple concurrent tasks
            tasks = []
            for i in range(3):
                task = CoordinationTask(
                    task_id=f"concurrent-task-{i}",
                    description=f"Concurrent task {i}",
                    priority=TaskPriority.NORMAL,
                    required_capabilities=[f"skill_{i}"],
                    input_data={"task_number": i}
                )
                tasks.append(task)
                coordinator.coordination_tasks[task.task_id] = task
            
            # Test concurrent task processing (simplified)
            concurrent_results = []
            for task in tasks:
                # Simulate task processing
                task.status = CoordinationStatus.ACTIVE
                suitable_agents = coordinator._find_suitable_agents(task.required_capabilities)
                
                if suitable_agents:
                    task.assigned_agents = [suitable_agents[0].agent_id]
                    task.status = CoordinationStatus.COMPLETED
                    task.progress = 1.0
                
                concurrent_results.append(task.status == CoordinationStatus.COMPLETED)
            
            # Verify all tasks were processed
            assert all(concurrent_results)
            assert len(concurrent_results) == 3
            
            # Test statistics
            stats = coordinator.get_coordination_statistics()
            assert stats["known_agents"] == 5
            assert stats["active_tasks"] == 3
            
            self.test_agents.append(coordinator)
            
            elapsed = time.time() - test_start
            self.performance_metrics["integration_tests"]["concurrent_coordination"] = elapsed
            self._record_test("concurrent_coordination", True, 
                            f"Concurrent coordination working ({elapsed:.2f}s, 3 tasks)")
            
        except Exception as e:
            self._record_test("concurrent_coordination", False, f"Error: {e}")
    
    async def test_fault_tolerance(self):
        """Test fault tolerance and error handling."""
        logger.info("🛡️ Testing Fault Tolerance...")
        
        test_start = time.time()
        
        try:
            # Create coordinator
            coordinator = AgentCoordinator(
                "fault-test-coordinator",
                "Fault Test Coordinator", 
                AgentRole.COORDINATOR,
                9000
            )
            
            # Add healthy agent
            healthy_agent = AgentInfo(
                agent_id="healthy-agent",
                name="Healthy Agent",
                role=AgentRole.SPECIALIST,
                endpoint="ws://localhost:9001",
                last_heartbeat=datetime.now()  # Recent heartbeat
            )
            
            # Add unhealthy agent (old heartbeat)
            unhealthy_agent = AgentInfo(
                agent_id="unhealthy-agent",
                name="Unhealthy Agent",
                role=AgentRole.SPECIALIST,
                endpoint="ws://localhost:9002",
                last_heartbeat=datetime.now() - timedelta(minutes=10)  # Old heartbeat
            )
            
            coordinator.known_agents["healthy-agent"] = healthy_agent
            coordinator.known_agents["unhealthy-agent"] = unhealthy_agent
            
            # Test health checking
            assert healthy_agent.is_healthy()
            assert not unhealthy_agent.is_healthy()
            
            # Test agent filtering (should only find healthy agents)
            healthy_agents = [
                agent for agent in coordinator.known_agents.values() 
                if agent.is_healthy()
            ]
            assert len(healthy_agents) == 1
            assert healthy_agents[0].agent_id == "healthy-agent"
            
            # Test task coordination with failed agents
            task = CoordinationTask(
                task_id="fault-test-task",
                description="Fault tolerance test task",
                priority=TaskPriority.NORMAL,
                required_capabilities=["test_capability"],
                input_data={"test": "fault_tolerance"}
            )
            
            # Test task timeout
            task.deadline = datetime.now() + timedelta(seconds=1)
            await asyncio.sleep(2)  # Wait for timeout
            assert task.is_expired()
            
            # Test message handling with invalid data
            comm = InterAgentCommunication("fault-test-comm", 9100)
            
            # Test invalid message deserialization
            try:
                invalid_data = {"invalid": "message", "missing_fields": True}
                InterAgentMessage.from_dict(invalid_data)
                assert False, "Should have raised exception"
            except (KeyError, ValueError):
                pass  # Expected exception
            
            self.test_agents.append(coordinator)
            
            elapsed = time.time() - test_start
            self.performance_metrics["integration_tests"]["fault_tolerance"] = elapsed
            self._record_test("fault_tolerance", True, 
                            f"Fault tolerance working ({elapsed:.2f}s)")
            
        except Exception as e:
            self._record_test("fault_tolerance", False, f"Error: {e}")
    
    async def test_scalability(self):
        """Test system scalability with increasing load."""
        logger.info("📈 Testing Scalability...")
        
        test_start = time.time()
        
        try:
            # Create coordinator
            coordinator = AgentCoordinator(
                "scalability-test-coordinator",
                "Scalability Test Coordinator",
                AgentRole.COORDINATOR,
                9200
            )
            
            # Test with increasing numbers of agents
            scalability_results = {}
            
            for agent_count in [10, 50, 100]:
                count_start = time.time()
                
                # Clear previous agents
                coordinator.known_agents.clear()
                
                # Add multiple agents
                for i in range(agent_count):
                    agent_info = AgentInfo(
                        agent_id=f"scale-agent-{i}",
                        name=f"Scale Agent {i}",
                        role=AgentRole.SPECIALIST,
                        endpoint=f"ws://localhost:{9300 + i}",
                        capabilities=[
                            AgentCapability(
                                capability_id=f"capability_{i}",
                                name=f"Capability {i}",
                                description=f"Test capability {i}",
                                expertise_level=0.8,
                                processing_speed=10.0,
                                reliability_score=0.9
                            )
                        ]
                    )
                    coordinator.known_agents[f"scale-agent-{i}"] = agent_info
                
                # Test agent lookup performance
                suitable_agents = coordinator._find_suitable_agents([f"capability_{agent_count // 2}"])
                
                # Test statistics generation
                stats = coordinator.get_coordination_statistics()
                assert stats["known_agents"] == agent_count
                
                count_elapsed = time.time() - count_start
                scalability_results[agent_count] = count_elapsed
                
                logger.info(f"   {agent_count} agents: {count_elapsed:.3f}s")
            
            # Analyze scalability
            times = list(scalability_results.values())
            if len(times) >= 2:
                # Simple scalability check
                growth_factor = times[-1] / times[0] if times[0] > 0 else 1
                agent_growth_factor = max(scalability_results.keys()) / min(scalability_results.keys())
                
                # Good scalability if time grows slower than linear
                good_scalability = growth_factor < (agent_growth_factor * 1.5)
            else:
                good_scalability = True
            
            self.test_agents.append(coordinator)
            
            elapsed = time.time() - test_start
            self.performance_metrics["integration_tests"]["scalability"] = elapsed
            self._record_test("scalability", good_scalability, 
                            f"Scalability test completed ({elapsed:.2f}s)")
            
        except Exception as e:
            self._record_test("scalability", False, f"Error: {e}")
    
    async def test_communication_latency(self):
        """Test communication latency and performance."""
        logger.info("🚄 Testing Communication Latency...")
        
        test_start = time.time()
        
        try:
            # Create communication systems
            comm1 = InterAgentCommunication("latency-test-1", 9500)
            comm2 = InterAgentCommunication("latency-test-2", 9501)
            
            # Test message creation speed
            message_creation_times = []
            
            for i in range(100):
                creation_start = time.time()
                
                message = InterAgentMessage(
                    message_id=f"latency-test-{i}",
                    sender_id="latency-test-1",
                    recipient_id="latency-test-2",
                    message_type=MessageType.STATUS_UPDATE,
                    content={"test_data": f"Message {i}", "timestamp": time.time()}
                )
                
                creation_elapsed = time.time() - creation_start
                message_creation_times.append(creation_elapsed)
            
            # Calculate message creation statistics
            avg_creation_time = sum(message_creation_times) / len(message_creation_times)
            max_creation_time = max(message_creation_times)
            
            # Test serialization speed
            serialization_times = []
            
            for i in range(100):
                message = InterAgentMessage(
                    message_id=f"serialize-test-{i}",
                    sender_id="test-sender",
                    recipient_id="test-recipient",
                    message_type=MessageType.TASK_REQUEST,
                    content={"data": f"Test data {i}" * 10}  # Larger content
                )
                
                serialize_start = time.time()
                message_dict = message.to_dict()
                serialize_elapsed = time.time() - serialize_start
                serialization_times.append(serialize_elapsed)
            
            avg_serialization_time = sum(serialization_times) / len(serialization_times)
            
            # Test deserialization speed
            deserialization_times = []
            
            for i in range(100):
                message_dict = {
                    "message_id": f"deserialize-test-{i}",
                    "sender_id": "test-sender",
                    "recipient_id": "test-recipient",
                    "message_type": "heartbeat",
                    "content": {"data": f"Test data {i}"},
                    "timestamp": datetime.now().isoformat(),
                    "priority": "normal",
                    "requires_response": False,
                    "correlation_id": None
                }
                
                deserialize_start = time.time()
                message = InterAgentMessage.from_dict(message_dict)
                deserialize_elapsed = time.time() - deserialize_start
                deserialization_times.append(deserialize_elapsed)
            
            avg_deserialization_time = sum(deserialization_times) / len(deserialization_times)
            
            # Verify performance is acceptable (< 1ms for basic operations)
            assert avg_creation_time < 0.001, f"Message creation too slow: {avg_creation_time:.4f}s"
            assert avg_serialization_time < 0.001, f"Serialization too slow: {avg_serialization_time:.4f}s"
            assert avg_deserialization_time < 0.001, f"Deserialization too slow: {avg_deserialization_time:.4f}s"
            
            elapsed = time.time() - test_start
            self.performance_metrics["communication_tests"]["latency"] = elapsed
            
            performance_summary = (
                f"Creation: {avg_creation_time*1000:.2f}ms, "
                f"Serialize: {avg_serialization_time*1000:.2f}ms, "
                f"Deserialize: {avg_deserialization_time*1000:.2f}ms"
            )
            
            self._record_test("communication_latency", True, 
                            f"Communication latency acceptable ({performance_summary})")
            
        except Exception as e:
            self._record_test("communication_latency", False, f"Error: {e}")
    
    def _record_test(self, test_name: str, passed: bool, details: str):
        """Record a test result."""
        result = {
            "test_name": test_name,
            "passed": passed,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASSED" if passed else "❌ FAILED"
        logger.info(f"   {status}: {test_name.replace('_', ' ').title()} - {details}")
    
    async def cleanup_test_agents(self):
        """Clean up test agents."""
        logger.info("🧹 Cleaning up test agents...")
        
        for agent in self.test_agents:
            try:
                await agent.stop()
            except:
                pass  # Ignore cleanup errors
        
        self.test_agents.clear()
    
    async def generate_test_report(self) -> Dict[str, Any]:
        """Generate comprehensive test report."""
        total_time = time.time() - self.performance_metrics["start_time"]
        
        # Count results
        passed_tests = sum(1 for r in self.test_results if r["passed"])
        total_tests = len(self.test_results)
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        # Categorize tests
        component_tests = [r for r in self.test_results if r["test_name"] in [
            "agent_coordinator_initialization", "inter_agent_communication", 
            "agent_discovery", "capability_management"
        ]]
        
        coordination_tests = [r for r in self.test_results if r["test_name"] in [
            "task_coordination", "distributed_reasoning", "consensus_formation"
        ]]
        
        integration_tests = [r for r in self.test_results if r["test_name"] in [
            "multi_agent_network", "concurrent_coordination", "fault_tolerance", 
            "scalability", "communication_latency"
        ]]
        
        # Generate report
        report = {
            "test_summary": {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": total_tests - passed_tests,
                "success_rate": success_rate,
                "total_execution_time": total_time
            },
            "module_availability": {
                "multi_agent_coordination": COORDINATION_AVAILABLE
            },
            "test_categories": {
                "component_tests": {
                    "count": len(component_tests),
                    "passed": sum(1 for t in component_tests if t["passed"]),
                    "success_rate": (sum(1 for t in component_tests if t["passed"]) / len(component_tests)) * 100 if component_tests else 0
                },
                "coordination_tests": {
                    "count": len(coordination_tests),
                    "passed": sum(1 for t in coordination_tests if t["passed"]),
                    "success_rate": (sum(1 for t in coordination_tests if t["passed"]) / len(coordination_tests)) * 100 if coordination_tests else 0
                },
                "integration_tests": {
                    "count": len(integration_tests),
                    "passed": sum(1 for t in integration_tests if t["passed"]),
                    "success_rate": (sum(1 for t in integration_tests if t["passed"]) / len(integration_tests)) * 100 if integration_tests else 0
                }
            },
            "performance_metrics": self.performance_metrics,
            "detailed_results": self.test_results,
            "recommendations": self._generate_recommendations()
        }
        
        # Log summary
        logger.info("\n" + "=" * 60)
        logger.info("📊 MULTI-AGENT COORDINATION TEST SUITE RESULTS")
        logger.info("=" * 60)
        logger.info(f"Total Tests: {total_tests}")
        logger.info(f"Passed: {passed_tests}")
        logger.info(f"Failed: {total_tests - passed_tests}")
        logger.info(f"Success Rate: {success_rate:.1f}%")
        logger.info(f"Total Time: {total_time:.2f}s")
        logger.info("")
        
        logger.info("Module Availability:")
        for module, available in report["module_availability"].items():
            status = "✅" if available else "❌"
            logger.info(f"  {status} {module.replace('_', ' ').title()}")
        
        logger.info("")
        logger.info("Test Category Results:")
        for category, results in report["test_categories"].items():
            logger.info(f"  {category.replace('_', ' ').title()}: {results['passed']}/{results['count']} ({results['success_rate']:.1f}%)")
        
        if report["recommendations"]:
            logger.info("\n🔧 Recommendations:")
            for rec in report["recommendations"]:
                logger.info(f"  • {rec}")
        
        logger.info("\n✅ Multi-agent coordination test suite completed!")
        
        return report
    
    def _generate_recommendations(self) -> List[str]:
        """Generate recommendations based on test results."""
        recommendations = []
        
        failed_tests = [r for r in self.test_results if not r["passed"]]
        
        if failed_tests:
            recommendations.append(f"Address {len(failed_tests)} failed tests for full system functionality")
        
        if not COORDINATION_AVAILABLE:
            recommendations.append("Install multi-agent coordination module for distributed AGI capabilities")
        
        # Performance recommendations
        comm_times = [t for t in self.performance_metrics["communication_tests"].values()]
        if comm_times and max(comm_times) > 1.0:
            recommendations.append("Optimize communication performance for better agent interaction")
        
        coord_times = [t for t in self.performance_metrics["coordination_tests"].values()]
        if coord_times and max(coord_times) > 5.0:
            recommendations.append("Optimize coordination algorithms for faster multi-agent task management")
        
        return recommendations


async def main():
    """Run the complete multi-agent coordination test suite."""
    test_suite = MultiAgentCoordinationTestSuite()
    
    try:
        report = await test_suite.run_all_tests()
        
        # Save report to file
        import json
        with open("multi_agent_coordination_test_report.json", "w") as f:
            json.dump(report, f, indent=2, default=str)
        
        return report
        
    finally:
        # Always cleanup test agents
        await test_suite.cleanup_test_agents()


if __name__ == "__main__":
    asyncio.run(main())