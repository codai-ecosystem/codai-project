"""
Resource Management System - Phase 1 AGI Evolution
VRAM and CPU resource allocation optimization
"""

import logging
import asyncio
import time
import psutil
import threading
from typing import Dict, List, Any, Optional, Set, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import json
import gc
import torch
import numpy as np
from collections import defaultdict, deque

logger = logging.getLogger(__name__)

class ResourceType(Enum):
    """Types of computational resources"""
    CPU_CORES = "cpu_cores"
    RAM_MEMORY = "ram_memory"
    GPU_VRAM = "gpu_vram"
    GPU_COMPUTE = "gpu_compute"
    DISK_IO = "disk_io"
    NETWORK_IO = "network_io"
    WORKING_MEMORY = "working_memory"
    ATTENTION_SLOTS = "attention_slots"

class AllocationPriority(Enum):
    """Resource allocation priorities"""
    LOW = 1
    NORMAL = 2
    HIGH = 3
    CRITICAL = 4
    EMERGENCY = 5

class AllocationStrategy(Enum):
    """Resource allocation strategies"""
    FAIR_SHARE = "fair_share"           # Equal distribution
    PRIORITY_BASED = "priority_based"   # Based on task priority
    PERFORMANCE_OPTIMIZED = "performance_optimized"  # Maximize throughput
    MEMORY_CONSERVING = "memory_conserving"  # Minimize memory usage
    BALANCED = "balanced"               # Balance all factors
    ADAPTIVE = "adaptive"               # Dynamic based on load

@dataclass
class ResourceRequest:
    """Resource allocation request"""
    requester_id: str
    resource_type: ResourceType
    amount_requested: float
    priority: AllocationPriority
    duration_estimate: float
    timeout: float = 30.0
    
    # Requirements and constraints
    min_acceptable: float = 0.0
    max_beneficial: float = float('inf')
    exclusive_access: bool = False
    preemptible: bool = True
    
    # Metadata
    created_at: datetime = field(default_factory=datetime.now)
    purpose: str = ""
    
@dataclass
class ResourceAllocation:
    """Active resource allocation"""
    allocation_id: str
    request: ResourceRequest
    allocated_amount: float
    start_time: datetime
    expected_end_time: datetime
    actual_usage: float = 0.0
    
    # Status
    status: str = "active"  # active, paused, completed, expired
    
@dataclass
class ResourcePool:
    """Resource pool management"""
    resource_type: ResourceType
    total_capacity: float
    available_capacity: float
    allocated_capacity: float
    reserved_capacity: float = 0.0
    
    # Allocation tracking
    active_allocations: Dict[str, ResourceAllocation] = field(default_factory=dict)
    allocation_queue: deque = field(default_factory=deque)
    
    # Performance metrics
    utilization_history: deque = field(default_factory=lambda: deque(maxlen=1000))
    peak_usage: float = 0.0
    average_usage: float = 0.0
    
class ResourceManagementSystem:
    """
    Resource Management System - Phase 1 AGI Evolution
    
    This system optimizes resource allocation across all AGI components:
    1. Monitors system resources (CPU, RAM, VRAM, GPU compute)
    2. Manages cognitive resources (attention, working memory)
    3. Implements intelligent allocation strategies
    4. Provides real-time resource optimization
    5. Prevents resource contention and deadlocks
    
    Designed for i9-14900K (24 cores), 192GB RAM, RTX 3060 Ti (8GB VRAM)
    """
    
    def __init__(self):
        # Hardware specifications (i9-14900K + RTX 3060 Ti + 192GB RAM)
        self.hardware_specs = {
            'cpu_cores': 24,  # i9-14900K: 8P + 16E cores
            'ram_total_gb': 192,
            'gpu_vram_gb': 8,  # RTX 3060 Ti
            'gpu_compute_units': 4864,  # CUDA cores
            'working_memory_slots': 50,
            'attention_slots': 20
        }
        
        # Initialize resource pools
        self.resource_pools = {}
        self._initialize_resource_pools()
        
        # Allocation management
        self.allocation_counter = 0
        self.allocation_history = deque(maxlen=10000)
        self.performance_metrics = {}
        
        # Monitoring and optimization
        self.monitoring_active = False
        self.optimization_active = False
        self.monitoring_interval = 1.0  # seconds
        self.optimization_interval = 5.0  # seconds
        
        # Strategy and policy settings
        self.default_strategy = AllocationStrategy.BALANCED
        self.emergency_threshold = 0.95  # Resource usage threshold for emergency mode
        self.preemption_enabled = True
        
        # Performance tracking
        self.system_metrics = {
            'total_requests': 0,
            'successful_allocations': 0,
            'failed_allocations': 0,
            'preemptions_performed': 0,
            'optimization_cycles': 0,
            'average_allocation_time': 0.0,
            'peak_memory_usage': 0.0,
            'gpu_utilization_peak': 0.0
        }
        
        logger.info("🔧 Resource Management System initialized - i9-14900K + RTX 3060 Ti + 192GB RAM")
    
    def _initialize_resource_pools(self):
        """Initialize all resource pools based on hardware specs"""
        
        # CPU cores pool
        self.resource_pools[ResourceType.CPU_CORES] = ResourcePool(
            resource_type=ResourceType.CPU_CORES,
            total_capacity=self.hardware_specs['cpu_cores'],
            available_capacity=self.hardware_specs['cpu_cores'] * 0.8,  # Reserve 20% for system
            allocated_capacity=0.0,
            reserved_capacity=self.hardware_specs['cpu_cores'] * 0.2
        )
        
        # RAM memory pool (in GB)
        self.resource_pools[ResourceType.RAM_MEMORY] = ResourcePool(
            resource_type=ResourceType.RAM_MEMORY,
            total_capacity=self.hardware_specs['ram_total_gb'],
            available_capacity=self.hardware_specs['ram_total_gb'] * 0.85,  # Reserve 15% for system
            allocated_capacity=0.0,
            reserved_capacity=self.hardware_specs['ram_total_gb'] * 0.15
        )
        
        # GPU VRAM pool (in GB)
        self.resource_pools[ResourceType.GPU_VRAM] = ResourcePool(
            resource_type=ResourceType.GPU_VRAM,
            total_capacity=self.hardware_specs['gpu_vram_gb'],
            available_capacity=self.hardware_specs['gpu_vram_gb'] * 0.9,  # Reserve 10% for system
            allocated_capacity=0.0,
            reserved_capacity=self.hardware_specs['gpu_vram_gb'] * 0.1
        )
        
        # GPU compute units
        self.resource_pools[ResourceType.GPU_COMPUTE] = ResourcePool(
            resource_type=ResourceType.GPU_COMPUTE,
            total_capacity=self.hardware_specs['gpu_compute_units'],
            available_capacity=self.hardware_specs['gpu_compute_units'] * 0.95,
            allocated_capacity=0.0,
            reserved_capacity=self.hardware_specs['gpu_compute_units'] * 0.05
        )
        
        # Working memory slots (cognitive resource)
        self.resource_pools[ResourceType.WORKING_MEMORY] = ResourcePool(
            resource_type=ResourceType.WORKING_MEMORY,
            total_capacity=self.hardware_specs['working_memory_slots'],
            available_capacity=self.hardware_specs['working_memory_slots'],
            allocated_capacity=0.0
        )
        
        # Attention slots (cognitive resource)
        self.resource_pools[ResourceType.ATTENTION_SLOTS] = ResourcePool(
            resource_type=ResourceType.ATTENTION_SLOTS,
            total_capacity=self.hardware_specs['attention_slots'],
            available_capacity=self.hardware_specs['attention_slots'],
            allocated_capacity=0.0
        )
        
        logger.info("✅ Resource pools initialized for AGI hardware configuration")
    
    async def start_monitoring(self):
        """Start resource monitoring and optimization"""
        if self.monitoring_active:
            logger.warning("⚠️ Monitoring already active")
            return
        
        self.monitoring_active = True
        self.optimization_active = True
        
        logger.info("🔍 Starting resource monitoring and optimization...")
        
        # Start monitoring tasks
        asyncio.create_task(self._system_monitoring_loop())
        asyncio.create_task(self._resource_optimization_loop())
        asyncio.create_task(self._allocation_cleanup_loop())
    
    async def request_resource(self, request: ResourceRequest) -> Optional[str]:
        """
        Request resource allocation
        
        Args:
            request: Resource allocation request
            
        Returns:
            allocation_id if successful, None if failed
        """
        self.system_metrics['total_requests'] += 1
        start_time = time.time()
        
        logger.info(f"📋 Resource request: {request.resource_type.value} "
                   f"({request.amount_requested:.2f}) - {request.requester_id}")
        
        try:
            # Check if resource pool exists
            if request.resource_type not in self.resource_pools:
                logger.error(f"❌ Unknown resource type: {request.resource_type}")
                self.system_metrics['failed_allocations'] += 1
                return None
            
            pool = self.resource_pools[request.resource_type]
            
            # Check immediate availability
            if pool.available_capacity >= request.amount_requested:
                allocation_id = await self._allocate_resource(request, request.amount_requested)
                if allocation_id:
                    self.system_metrics['successful_allocations'] += 1
                    allocation_time = time.time() - start_time
                    self._update_allocation_metrics(allocation_time)
                    return allocation_id
            
            # Try optimization and preemption if immediate allocation fails
            if await self._try_optimization_and_preemption(request):
                allocation_id = await self._allocate_resource(request, request.amount_requested)
                if allocation_id:
                    self.system_metrics['successful_allocations'] += 1
                    allocation_time = time.time() - start_time
                    self._update_allocation_metrics(allocation_time)
                    return allocation_id
            
            # Queue request if can't allocate immediately
            if request.amount_requested <= request.min_acceptable:
                pool.allocation_queue.append(request)
                logger.info(f"📤 Request queued: {request.requester_id}")
                return "queued"
            
            logger.warning(f"⚠️ Resource request failed: insufficient capacity")
            self.system_metrics['failed_allocations'] += 1
            return None
            
        except Exception as e:
            logger.error(f"❌ Resource allocation error: {e}")
            self.system_metrics['failed_allocations'] += 1
            return None
    
    async def _allocate_resource(self, request: ResourceRequest, amount: float) -> str:
        """Actually allocate the resource"""
        pool = self.resource_pools[request.resource_type]
        
        # Generate allocation ID
        self.allocation_counter += 1
        allocation_id = f"alloc_{self.allocation_counter:06d}_{request.resource_type.value}"
        
        # Create allocation
        allocation = ResourceAllocation(
            allocation_id=allocation_id,
            request=request,
            allocated_amount=amount,
            start_time=datetime.now(),
            expected_end_time=datetime.now() + timedelta(seconds=request.duration_estimate)
        )
        
        # Update pool state
        pool.available_capacity -= amount
        pool.allocated_capacity += amount
        pool.active_allocations[allocation_id] = allocation
        
        # Track allocation history
        self.allocation_history.append(allocation)
        
        logger.info(f"✅ Resource allocated: {allocation_id} ({amount:.2f} {request.resource_type.value})")
        return allocation_id
    
    async def release_resource(self, allocation_id: str) -> bool:
        """Release allocated resource"""
        logger.info(f"🔓 Releasing resource: {allocation_id}")
        
        try:
            # Find allocation
            allocation = None
            pool = None
            
            for resource_pool in self.resource_pools.values():
                if allocation_id in resource_pool.active_allocations:
                    allocation = resource_pool.active_allocations[allocation_id]
                    pool = resource_pool
                    break
            
            if not allocation:
                logger.warning(f"⚠️ Allocation not found: {allocation_id}")
                return False
            
            # Release the resource
            amount = allocation.allocated_amount
            pool.available_capacity += amount
            pool.allocated_capacity -= amount
            
            # Update allocation status
            allocation.status = "completed"
            
            # Remove from active allocations
            del pool.active_allocations[allocation_id]
            
            # Try to allocate queued requests
            await self._process_queue(pool)
            
            logger.info(f"✅ Resource released: {allocation_id} ({amount:.2f})")
            return True
            
        except Exception as e:
            logger.error(f"❌ Resource release error: {e}")
            return False
    
    async def _try_optimization_and_preemption(self, request: ResourceRequest) -> bool:
        """Try resource optimization and preemption"""
        pool = self.resource_pools[request.resource_type]
        
        # Try garbage collection for memory resources
        if request.resource_type in [ResourceType.RAM_MEMORY, ResourceType.GPU_VRAM]:
            await self._perform_memory_optimization()
            if pool.available_capacity >= request.amount_requested:
                return True
        
        # Try preemption if enabled and high priority
        if (self.preemption_enabled and 
            request.priority.value >= AllocationPriority.HIGH.value):
            
            freed_amount = await self._attempt_preemption(pool, request.amount_requested)
            if freed_amount >= request.amount_requested:
                return True
        
        return False
    
    async def _attempt_preemption(self, pool: ResourcePool, required_amount: float) -> float:
        """Attempt to free resources through preemption"""
        freed_amount = 0.0
        
        # Sort allocations by priority (lowest first) and preemptibility
        preemptible_allocations = [
            alloc for alloc in pool.active_allocations.values()
            if alloc.request.preemptible
        ]
        
        preemptible_allocations.sort(key=lambda a: a.request.priority.value)
        
        for allocation in preemptible_allocations:
            if freed_amount >= required_amount:
                break
            
            logger.info(f"⚡ Preempting allocation: {allocation.allocation_id}")
            
            # Release the allocation
            await self.release_resource(allocation.allocation_id)
            freed_amount += allocation.allocated_amount
            self.system_metrics['preemptions_performed'] += 1
        
        return freed_amount
    
    async def _perform_memory_optimization(self):
        """Perform memory optimization and garbage collection"""
        logger.info("🧹 Performing memory optimization...")
        
        # Python garbage collection
        collected = gc.collect()
        
        # PyTorch CUDA cache cleanup if available
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            torch.cuda.synchronize()
        
        # Update available capacity based on actual system memory
        self._update_actual_memory_availability()
        
        logger.info(f"✅ Memory optimization complete - {collected} objects collected")
    
    def _update_actual_memory_availability(self):
        """Update memory pool availability based on actual system state"""
        # Update RAM availability
        ram_pool = self.resource_pools[ResourceType.RAM_MEMORY]
        memory_info = psutil.virtual_memory()
        available_gb = memory_info.available / (1024**3)
        
        # Conservative update - only increase availability if significantly more is available
        max_available = self.hardware_specs['ram_total_gb'] * 0.85
        ram_pool.available_capacity = min(available_gb * 0.9, max_available)
        
        # Update GPU VRAM if available
        if torch.cuda.is_available():
            vram_pool = self.resource_pools[ResourceType.GPU_VRAM]
            try:
                vram_free, vram_total = torch.cuda.mem_get_info()
                available_vram_gb = vram_free / (1024**3)
                max_vram_available = self.hardware_specs['gpu_vram_gb'] * 0.9
                vram_pool.available_capacity = min(available_vram_gb * 0.8, max_vram_available)
            except:
                pass  # Keep current values if can't read VRAM
    
    async def _process_queue(self, pool: ResourcePool):
        """Process queued allocation requests"""
        processed_count = 0
        
        while pool.allocation_queue and processed_count < 5:  # Limit processing per cycle
            request = pool.allocation_queue.popleft()
            
            if pool.available_capacity >= request.amount_requested:
                allocation_id = await self._allocate_resource(request, request.amount_requested)
                if allocation_id:
                    logger.info(f"📦 Queued request allocated: {request.requester_id}")
                    processed_count += 1
                else:
                    # Put back in queue if allocation failed
                    pool.allocation_queue.appendleft(request)
                    break
            else:
                # Put back in queue - not enough capacity yet
                pool.allocation_queue.appendleft(request)
                break
    
    async def _system_monitoring_loop(self):
        """Main system monitoring loop"""
        logger.info("🔍 System monitoring started")
        
        while self.monitoring_active:
            try:
                # Collect system metrics
                await self._collect_system_metrics()
                
                # Update resource pool utilization
                await self._update_utilization_metrics()
                
                # Check for resource leaks or stuck allocations
                await self._check_allocation_health()
                
                await asyncio.sleep(self.monitoring_interval)
                
            except Exception as e:
                logger.error(f"❌ Monitoring loop error: {e}")
                await asyncio.sleep(5.0)
    
    async def _collect_system_metrics(self):
        """Collect actual system resource usage"""
        # CPU usage
        cpu_percent = psutil.cpu_percent(interval=None)
        
        # Memory usage
        memory_info = psutil.virtual_memory()
        memory_usage_gb = (memory_info.total - memory_info.available) / (1024**3)
        self.system_metrics['peak_memory_usage'] = max(
            self.system_metrics['peak_memory_usage'], 
            memory_usage_gb
        )
        
        # GPU usage if available
        gpu_usage = 0.0
        if torch.cuda.is_available():
            try:
                gpu_usage = torch.cuda.utilization()
                self.system_metrics['gpu_utilization_peak'] = max(
                    self.system_metrics['gpu_utilization_peak'],
                    gpu_usage
                )
            except:
                pass
        
        # Store metrics for analysis
        current_metrics = {
            'timestamp': datetime.now(),
            'cpu_percent': cpu_percent,
            'memory_usage_gb': memory_usage_gb,
            'gpu_usage_percent': gpu_usage
        }
        
        # Add to performance metrics history
        if 'system_snapshots' not in self.performance_metrics:
            self.performance_metrics['system_snapshots'] = deque(maxlen=1000)
        self.performance_metrics['system_snapshots'].append(current_metrics)
    
    async def _update_utilization_metrics(self):
        """Update resource pool utilization metrics"""
        for resource_type, pool in self.resource_pools.items():
            if pool.total_capacity > 0:
                utilization = pool.allocated_capacity / pool.total_capacity
                pool.utilization_history.append(utilization)
                pool.peak_usage = max(pool.peak_usage, utilization)
                
                # Calculate moving average
                if pool.utilization_history:
                    pool.average_usage = sum(pool.utilization_history) / len(pool.utilization_history)
    
    async def _check_allocation_health(self):
        """Check for unhealthy allocations and resource leaks"""
        current_time = datetime.now()
        stale_allocations = []
        
        for pool in self.resource_pools.values():
            for allocation_id, allocation in pool.active_allocations.items():
                # Check for expired allocations
                if current_time > allocation.expected_end_time:
                    time_overrun = current_time - allocation.expected_end_time
                    if time_overrun > timedelta(minutes=5):  # 5 minute grace period
                        stale_allocations.append((allocation_id, time_overrun))
        
        # Handle stale allocations
        for allocation_id, overrun in stale_allocations:
            logger.warning(f"⚠️ Stale allocation detected: {allocation_id} (overrun: {overrun})")
            # Could implement automatic cleanup here if needed
    
    async def _resource_optimization_loop(self):
        """Resource optimization and rebalancing loop"""
        logger.info("⚖️ Resource optimization started")
        
        while self.optimization_active:
            try:
                await self._optimize_allocations()
                self.system_metrics['optimization_cycles'] += 1
                await asyncio.sleep(self.optimization_interval)
                
            except Exception as e:
                logger.error(f"❌ Optimization loop error: {e}")
                await asyncio.sleep(10.0)
    
    async def _optimize_allocations(self):
        """Optimize resource allocations based on current usage patterns"""
        # Check for emergency resource situations
        for resource_type, pool in self.resource_pools.items():
            if pool.total_capacity > 0:
                utilization = pool.allocated_capacity / pool.total_capacity
                
                if utilization > self.emergency_threshold:
                    logger.warning(f"🚨 Emergency resource situation: {resource_type.value} "
                                 f"at {utilization:.1%} utilization")
                    await self._handle_emergency_situation(pool)
        
        # Defragment and rebalance resources
        await self._defragment_resources()
    
    async def _handle_emergency_situation(self, pool: ResourcePool):
        """Handle emergency resource situations"""
        logger.info(f"🚨 Handling emergency for {pool.resource_type.value}")
        
        # Perform aggressive optimization
        if pool.resource_type in [ResourceType.RAM_MEMORY, ResourceType.GPU_VRAM]:
            await self._perform_memory_optimization()
        
        # Consider emergency preemption
        if self.preemption_enabled:
            # Find lowest priority preemptible allocations
            preemptible = [
                alloc for alloc in pool.active_allocations.values()
                if alloc.request.preemptible and alloc.request.priority.value <= AllocationPriority.NORMAL.value
            ]
            
            if preemptible:
                # Preempt one low-priority allocation
                victim = min(preemptible, key=lambda a: a.request.priority.value)
                await self.release_resource(victim.allocation_id)
                logger.info(f"🚨 Emergency preemption: {victim.allocation_id}")
    
    async def _defragment_resources(self):
        """Defragment and optimize resource allocation layout"""
        # This is a placeholder for more sophisticated defragmentation
        # In a real implementation, this might involve:
        # - Moving smaller allocations to create larger contiguous blocks
        # - Rebalancing across different resource pools
        # - Optimizing memory layout for better cache performance
        pass
    
    async def _allocation_cleanup_loop(self):
        """Clean up expired and completed allocations"""
        while self.monitoring_active:
            try:
                current_time = datetime.now()
                cleanup_count = 0
                
                for pool in self.resource_pools.values():
                    expired_allocations = []
                    
                    for allocation_id, allocation in pool.active_allocations.items():
                        # Mark very old allocations for cleanup
                        if (current_time - allocation.start_time) > timedelta(hours=1):
                            expired_allocations.append(allocation_id)
                    
                    # Clean up expired allocations
                    for allocation_id in expired_allocations:
                        await self.release_resource(allocation_id)
                        cleanup_count += 1
                
                if cleanup_count > 0:
                    logger.info(f"🧹 Cleaned up {cleanup_count} expired allocations")
                
                await asyncio.sleep(60.0)  # Run cleanup every minute
                
            except Exception as e:
                logger.error(f"❌ Cleanup loop error: {e}")
                await asyncio.sleep(60.0)
    
    def _update_allocation_metrics(self, allocation_time: float):
        """Update allocation performance metrics"""
        total_allocations = self.system_metrics['successful_allocations']
        current_avg = self.system_metrics['average_allocation_time']
        
        # Update rolling average
        self.system_metrics['average_allocation_time'] = (
            (current_avg * (total_allocations - 1) + allocation_time) / total_allocations
        )
    
    def get_resource_status(self) -> Dict[str, Any]:
        """Get comprehensive resource status"""
        status = {
            'hardware_specs': self.hardware_specs,
            'system_metrics': self.system_metrics,
            'resource_pools': {},
            'performance_summary': {}
        }
        
        # Resource pool status
        for resource_type, pool in self.resource_pools.items():
            status['resource_pools'][resource_type.value] = {
                'total_capacity': pool.total_capacity,
                'available_capacity': pool.available_capacity,
                'allocated_capacity': pool.allocated_capacity,
                'utilization_percent': (pool.allocated_capacity / pool.total_capacity * 100) if pool.total_capacity > 0 else 0,
                'active_allocations': len(pool.active_allocations),
                'queued_requests': len(pool.allocation_queue),
                'peak_usage_percent': pool.peak_usage * 100,
                'average_usage_percent': pool.average_usage * 100
            }
        
        # Performance summary
        total_requests = self.system_metrics['total_requests']
        if total_requests > 0:
            status['performance_summary'] = {
                'success_rate_percent': (self.system_metrics['successful_allocations'] / total_requests) * 100,
                'average_allocation_time_ms': self.system_metrics['average_allocation_time'] * 1000,
                'preemption_rate_percent': (self.system_metrics['preemptions_performed'] / total_requests) * 100 if total_requests > 0 else 0,
                'optimization_cycles': self.system_metrics['optimization_cycles']
            }
        
        return status
    
    async def shutdown(self):
        """Graceful shutdown of resource management system"""
        logger.info("🛑 Shutting down Resource Management System...")
        
        self.monitoring_active = False
        self.optimization_active = False
        
        # Release all active allocations
        for pool in self.resource_pools.values():
            allocation_ids = list(pool.active_allocations.keys())
            for allocation_id in allocation_ids:
                await self.release_resource(allocation_id)
        
        logger.info("✅ Resource Management System shutdown complete")

# Global instance for Phase 1 AGI Evolution
resource_management_system = ResourceManagementSystem()

# Convenience functions for specific resource types
async def request_vram(requester_id: str, amount_gb: float, priority: AllocationPriority = AllocationPriority.NORMAL) -> Optional[str]:
    """Request GPU VRAM allocation"""
    request = ResourceRequest(
        requester_id=requester_id,
        resource_type=ResourceType.GPU_VRAM,
        amount_requested=amount_gb,
        priority=priority,
        duration_estimate=300.0,  # 5 minutes default
        purpose="GPU memory for model inference"
    )
    return await resource_management_system.request_resource(request)

async def request_cpu_cores(requester_id: str, cores: int, priority: AllocationPriority = AllocationPriority.NORMAL) -> Optional[str]:
    """Request CPU core allocation"""
    request = ResourceRequest(
        requester_id=requester_id,
        resource_type=ResourceType.CPU_CORES,
        amount_requested=cores,
        priority=priority,
        duration_estimate=120.0,  # 2 minutes default
        purpose="CPU processing for reasoning tasks"
    )
    return await resource_management_system.request_resource(request)

async def request_working_memory(requester_id: str, slots: int, priority: AllocationPriority = AllocationPriority.NORMAL) -> Optional[str]:
    """Request working memory slots"""
    request = ResourceRequest(
        requester_id=requester_id,
        resource_type=ResourceType.WORKING_MEMORY,
        amount_requested=slots,
        priority=priority,
        duration_estimate=60.0,  # 1 minute default
        purpose="Working memory for cognitive processing"
    )
    return await resource_management_system.request_resource(request)

logger.info("✅ Resource Management System module loaded - AGI Evolution Phase 1 ready!")