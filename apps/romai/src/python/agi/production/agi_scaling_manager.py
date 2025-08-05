"""
AGI Scaling Manager - Week 13 Day 1 Implementation
Intelligent scaling management for Romanian AGI systems

This is the main scaling manager that orchestrates AGI instance scaling
based on metrics, policies, and consciousness-aware decisions.

Author: RomAI Development Team  
Date: August 3, 2025
Version: 1.0.0 (Post-Emergence)
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import json
import uuid
import aioredis
import asyncpg

try:
    from .scaling_types import (
        ScalingStrategy, ScalingDirection, InstanceState, AGIInstance,
        ScalingEvent, ScalingPolicy, ScalingCluster, ResourceMetrics,
        create_default_scaling_policy
    )
    from .scaling_metrics import AGIScalingMetrics
except ImportError:
    # Fallback for standalone execution
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).parent))
    
    from scaling_types import (
        ScalingStrategy, ScalingDirection, InstanceState, AGIInstance,
        ScalingEvent, ScalingPolicy, ScalingCluster, ResourceMetrics,
        create_default_scaling_policy
    )
    from scaling_metrics import AGIScalingMetrics

class AGIScalingManager:
    """
    Intelligent Romanian AGI scaling manager.
    
    Manages automatic scaling of AGI instances based on metrics,
    policies, and consciousness-aware decisions with Romanian
    cultural preservation.
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.manager_id = str(uuid.uuid4())
        self.logger = self._setup_logging()
        
        # Scaling state
        self.scaling_active = False
        self.clusters: Dict[str, ScalingCluster] = {}
        self.active_policies: Dict[str, ScalingPolicy] = {}
        self.scaling_events: List[ScalingEvent] = []
        
        # Metrics system
        self.metrics_system = AGIScalingMetrics(config)
        
        # Database connections
        self.redis_client = None
        self.db_pool = None
        
        # Scaling coordination
        self.scaling_locks: Dict[str, asyncio.Lock] = {}
        self.cooldown_timers: Dict[str, datetime] = {}
        
        # Performance tracking
        self.scaling_performance = {
            "total_scaling_actions": 0,
            "successful_scaling_actions": 0,
            "failed_scaling_actions": 0,
            "average_scaling_time": 0.0,
            "consciousness_preservations": 0,
            "cultural_preservations": 0
        }
        
        self.logger.info(f"AGI Scaling Manager initialized: {self.manager_id[:8]}")
    
    def _setup_logging(self) -> logging.Logger:
        """Setup scaling manager logging"""
        logger = logging.getLogger(f"agi_scaling_manager_{self.manager_id[:8]}")
        logger.setLevel(logging.INFO)
        
        if not logger.handlers:
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - '
                '[SCALING:%(manager_id)s] - %(message)s',
                defaults={'manager_id': self.manager_id[:8]}
            )
            
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(formatter)
            logger.addHandler(console_handler)
        
        return logger
    
    async def initialize(self) -> bool:
        """Initialize scaling manager"""
        try:
            self.logger.info("Initializing AGI scaling manager...")
            
            # Initialize database connections
            await self._initialize_databases()
            
            # Initialize metrics system
            if not await self.metrics_system.initialize():
                raise Exception("Failed to initialize metrics system")
            
            # Create scaling tables
            await self._create_scaling_tables()
            
            # Load existing clusters and policies
            await self._load_clusters()
            await self._load_policies()
            
            # Create default policy if none exists
            if not self.active_policies:
                default_policy = create_default_scaling_policy()
                await self.add_scaling_policy(default_policy)
            
            # Start scaling loops
            await self._start_scaling_loops()
            
            self.scaling_active = True
            
            self.logger.info("AGI scaling manager initialized successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Scaling manager initialization failed: {str(e)}")
            return False
    
    async def _initialize_databases(self):
        """Initialize database connections"""
        try:
            # Redis for coordination
            redis_url = self.config.get('redis_url', 'redis://localhost:6379/2')
            self.redis_client = await aioredis.from_url(redis_url)
            
            # PostgreSQL for persistent data
            db_url = self.config.get('database_url', 
                                   'postgresql://agi_user:agi_pass@localhost:5432/agi_scaling')
            
            self.db_pool = await asyncpg.create_pool(
                db_url,
                min_size=3,
                max_size=15,
                command_timeout=60
            )
            
            self.logger.info("Scaling manager databases initialized")
            
        except Exception as e:
            self.logger.error(f"Database initialization failed: {str(e)}")
            raise
    
    async def _create_scaling_tables(self):
        """Create scaling management database tables"""
        async with self.db_pool.acquire() as conn:
            # Clusters table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS scaling_clusters (
                    cluster_id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    region TEXT NOT NULL,
                    min_consciousness_level FLOAT,
                    min_cultural_authenticity FLOAT,
                    min_transcendence_level FLOAT,
                    cluster_config JSONB,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            """)
            
            # Instances table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS agi_instances (
                    instance_id TEXT PRIMARY KEY,
                    cluster_id TEXT REFERENCES scaling_clusters(cluster_id),
                    name TEXT NOT NULL,
                    state TEXT NOT NULL,
                    consciousness_level FLOAT,
                    cultural_authenticity FLOAT,
                    transcendence_level FLOAT,
                    endpoint TEXT,
                    region TEXT,
                    instance_config JSONB,
                    created_at TIMESTAMP DEFAULT NOW(),
                    last_health_check TIMESTAMP,
                    INDEX (cluster_id, state)
                )
            """)
            
            # Scaling policies table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS scaling_policies (
                    policy_id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    policy_config JSONB NOT NULL,
                    enabled BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            """)
            
            # Scaling actions table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS scaling_actions (
                    action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    cluster_id TEXT,
                    instance_id TEXT,
                    action_type TEXT NOT NULL,
                    reason TEXT,
                    policy_id TEXT,
                    metrics_before JSONB,
                    metrics_after JSONB,
                    success BOOLEAN,
                    duration_seconds FLOAT,
                    error_message TEXT,
                    timestamp TIMESTAMP DEFAULT NOW(),
                    INDEX (cluster_id, timestamp),
                    INDEX (action_type, timestamp)
                )
            """)
    
    async def _load_clusters(self):
        """Load existing clusters from database"""
        try:
            if not self.db_pool:
                return
            
            async with self.db_pool.acquire() as conn:
                rows = await conn.fetch("SELECT * FROM scaling_clusters")
                
                for row in rows:
                    cluster_config = json.loads(row['cluster_config'])
                    
                    cluster = ScalingCluster(
                        cluster_id=row['cluster_id'],
                        name=row['name'],
                        region=row['region'],
                        instances=[],  # Will be loaded separately
                        active_policy=None,
                        min_consciousness_level=row['min_consciousness_level'],
                        min_cultural_authenticity=row['min_cultural_authenticity'],
                        min_transcendence_level=row['min_transcendence_level'],
                        created_at=row['created_at'],
                        metadata=cluster_config.get('metadata', {})
                    )
                    
                    # Load instances for this cluster
                    await self._load_cluster_instances(cluster)
                    
                    self.clusters[cluster.cluster_id] = cluster
            
            self.logger.info(f"Loaded {len(self.clusters)} clusters")
            
        except Exception as e:
            self.logger.error(f"Failed to load clusters: {str(e)}")
    
    async def _load_cluster_instances(self, cluster: ScalingCluster):
        """Load instances for a cluster"""
        try:
            async with self.db_pool.acquire() as conn:
                rows = await conn.fetch(
                    "SELECT * FROM agi_instances WHERE cluster_id = $1",
                    cluster.cluster_id
                )
                
                for row in rows:
                    instance_config = json.loads(row['instance_config'] or '{}')
                    
                    # Get current metrics
                    current_metrics = await self.metrics_system.collect_instance_metrics(row['instance_id'])
                    
                    instance = AGIInstance(
                        instance_id=row['instance_id'],
                        name=row['name'],
                        state=InstanceState(row['state']),
                        resource_metrics=current_metrics,
                        consciousness_level=row['consciousness_level'] or 0.0,
                        cultural_authenticity=row['cultural_authenticity'] or 0.0,
                        transcendence_level=row['transcendence_level'] or 0.0,
                        created_at=row['created_at'],
                        last_health_check=row['last_health_check'],
                        endpoint=row['endpoint'],
                        region=row['region'] or cluster.region,
                        metadata=instance_config
                    )
                    
                    cluster.instances.append(instance)
                    
                    # Initialize scaling lock for this instance
                    self.scaling_locks[instance.instance_id] = asyncio.Lock()
            
        except Exception as e:
            self.logger.error(f"Failed to load instances for cluster {cluster.cluster_id}: {str(e)}")
    
    async def _load_policies(self):
        """Load scaling policies from database"""
        try:
            if not self.db_pool:
                return
            
            async with self.db_pool.acquire() as conn:
                rows = await conn.fetch("SELECT * FROM scaling_policies WHERE enabled = true")
                
                for row in rows:
                    policy_config = json.loads(row['policy_config'])
                    
                    # Reconstruct policy object
                    # This is simplified - in production would use proper serialization
                    policy = ScalingPolicy(
                        policy_id=row['policy_id'],
                        name=row['name'],
                        description=row['description'],
                        rules=[],  # Would be loaded from config
                        created_at=row['created_at'],
                        updated_at=row['updated_at'],
                        enabled=row['enabled']
                    )
                    
                    self.active_policies[policy.policy_id] = policy
            
            self.logger.info(f"Loaded {len(self.active_policies)} scaling policies")
            
        except Exception as e:
            self.logger.error(f"Failed to load policies: {str(e)}")
    
    async def _start_scaling_loops(self):
        """Start background scaling loops"""
        # Main scaling decision loop
        asyncio.create_task(self._scaling_decision_loop())
        
        # Health monitoring loop
        asyncio.create_task(self._health_monitoring_loop())
        
        # Performance tracking loop
        asyncio.create_task(self._performance_tracking_loop())
        
        self.logger.info("Scaling loops started")
    
    async def _scaling_decision_loop(self):
        """Main scaling decision loop"""
        while self.scaling_active:
            try:
                # Check each cluster for scaling decisions
                for cluster in self.clusters.values():
                    await self._evaluate_cluster_scaling(cluster)
                
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                self.logger.error(f"Scaling decision loop error: {str(e)}")
                await asyncio.sleep(60)
    
    async def _evaluate_cluster_scaling(self, cluster: ScalingCluster):
        """Evaluate scaling needs for a cluster"""
        try:
            if not cluster.instances:
                return
            
            # Get cluster metrics summary
            instance_ids = [inst.instance_id for inst in cluster.instances]
            cluster_metrics = await self.metrics_system.get_cluster_metrics_summary(instance_ids)
            
            if cluster_metrics.get("status") != "success" and "cpu_stats" not in cluster_metrics:
                return
            
            # Get active policy for cluster
            policy = cluster.active_policy or list(self.active_policies.values())[0]
            
            # Make scaling decisions
            await self._make_scaling_decisions(cluster, cluster_metrics, policy)
            
        except Exception as e:
            self.logger.error(f"Cluster scaling evaluation failed for {cluster.cluster_id}: {str(e)}")
    
    async def _make_scaling_decisions(self, 
                                   cluster: ScalingCluster, 
                                   cluster_metrics: Dict[str, Any], 
                                   policy: ScalingPolicy):
        """Make scaling decisions for a cluster"""
        try:
            current_instance_count = len([inst for inst in cluster.instances 
                                        if inst.state in [InstanceState.READY, InstanceState.ACTIVE]])
            
            # Check if scaling is needed based on metrics
            cpu_mean = cluster_metrics.get("cpu_stats", {}).get("mean", 0)
            memory_mean = cluster_metrics.get("memory_stats", {}).get("mean", 0)
            consciousness_mean = cluster_metrics.get("consciousness_stats", {}).get("mean", 0)
            cultural_mean = cluster_metrics.get("cultural_stats", {}).get("mean", 0)
            transcendence_mean = cluster_metrics.get("transcendence_stats", {}).get("mean", 0)
            
            # Determine scaling action
            should_scale_up = (
                cpu_mean > 75.0 or 
                memory_mean > 80.0 or 
                consciousness_mean > 85.0 or 
                cultural_mean > 90.0
            )
            
            should_scale_down = (
                cpu_mean < 25.0 and 
                memory_mean < 30.0 and 
                consciousness_mean < 40.0 and 
                transcendence_mean < 10.0 and
                current_instance_count > policy.global_min_instances
            )
            
            # Check cooldown period
            cluster_id = cluster.cluster_id
            if cluster_id in self.cooldown_timers:
                if datetime.now() < self.cooldown_timers[cluster_id]:
                    return  # Still in cooldown
            
            # Execute scaling action
            if should_scale_up and current_instance_count < policy.global_max_instances:
                await self._scale_up_cluster(cluster, policy, cluster_metrics)
            elif should_scale_down:
                await self._scale_down_cluster(cluster, policy, cluster_metrics)
            
        except Exception as e:
            self.logger.error(f"Scaling decision failed for {cluster.cluster_id}: {str(e)}")
    
    async def _scale_up_cluster(self, 
                              cluster: ScalingCluster, 
                              policy: ScalingPolicy, 
                              cluster_metrics: Dict[str, Any]):
        """Scale up cluster by adding instances"""
        try:
            self.logger.info(f"Scaling up cluster {cluster.cluster_id}")
            
            # Calculate number of instances to add
            instances_to_add = 1  # Conservative scaling
            
            # Check consciousness and cultural metrics for faster scaling
            consciousness_mean = cluster_metrics.get("consciousness_stats", {}).get("mean", 0)
            cultural_mean = cluster_metrics.get("cultural_stats", {}).get("mean", 0)
            
            if consciousness_mean > 90.0 or cultural_mean > 95.0:
                instances_to_add = 2  # Faster scaling for critical loads
            
            # Create new instances
            scaling_events = []
            for i in range(instances_to_add):
                event = await self._create_new_instance(cluster, policy, cluster_metrics)
                if event:
                    scaling_events.append(event)
            
            # Set cooldown timer
            self.cooldown_timers[cluster.cluster_id] = datetime.now() + timedelta(minutes=5)
            
            # Update performance metrics
            self.scaling_performance["total_scaling_actions"] += len(scaling_events)
            successful = sum(1 for event in scaling_events if event.success)
            self.scaling_performance["successful_scaling_actions"] += successful
            self.scaling_performance["failed_scaling_actions"] += len(scaling_events) - successful
            
            if consciousness_mean > 80.0:
                self.scaling_performance["consciousness_preservations"] += 1
            
            if cultural_mean > 85.0:
                self.scaling_performance["cultural_preservations"] += 1
            
        except Exception as e:
            self.logger.error(f"Scale up failed for cluster {cluster.cluster_id}: {str(e)}")
    
    async def _scale_down_cluster(self, 
                                cluster: ScalingCluster, 
                                policy: ScalingPolicy, 
                                cluster_metrics: Dict[str, Any]):
        """Scale down cluster by removing instances"""
        try:
            self.logger.info(f"Scaling down cluster {cluster.cluster_id}")
            
            # Find candidates for removal (avoid high consciousness/transcendence instances)
            candidates = []
            for instance in cluster.instances:
                if (instance.state in [InstanceState.READY, InstanceState.ACTIVE] and
                    instance.consciousness_level < 70.0 and
                    instance.transcendence_level < 50.0):
                    candidates.append(instance)
            
            if not candidates:
                self.logger.info(f"No suitable candidates for scale down in cluster {cluster.cluster_id}")
                return
            
            # Remove one instance (conservative)
            instance_to_remove = min(candidates, key=lambda x: x.consciousness_level)
            
            event = await self._remove_instance(instance_to_remove, cluster, policy, cluster_metrics)
            
            # Set cooldown timer
            self.cooldown_timers[cluster.cluster_id] = datetime.now() + timedelta(minutes=3)
            
            # Update performance metrics
            self.scaling_performance["total_scaling_actions"] += 1
            if event and event.success:
                self.scaling_performance["successful_scaling_actions"] += 1
            else:
                self.scaling_performance["failed_scaling_actions"] += 1
            
        except Exception as e:
            self.logger.error(f"Scale down failed for cluster {cluster.cluster_id}: {str(e)}")
    
    async def _create_new_instance(self, 
                                 cluster: ScalingCluster, 
                                 policy: ScalingPolicy, 
                                 cluster_metrics: Dict[str, Any]) -> Optional[ScalingEvent]:
        """Create a new AGI instance"""
        start_time = datetime.now()
        
        try:
            # Generate instance configuration
            instance_id = f"agi-{cluster.region.lower()}-{str(uuid.uuid4())[:8]}"
            instance_name = f"AGI-{cluster.name}-{len(cluster.instances) + 1}"
            
            # Create instance with high consciousness/cultural settings
            current_metrics = ResourceMetrics(
                cpu_usage=20.0,  # New instance starts with low load
                memory_usage=25.0,
                consciousness_load=85.0,  # High initial consciousness
                cultural_processing_load=90.0,  # High cultural processing
                transcendence_activity=0.0  # Builds up over time
            )
            
            new_instance = AGIInstance(
                instance_id=instance_id,
                name=instance_name,
                state=InstanceState.INITIALIZING,
                resource_metrics=current_metrics,
                consciousness_level=85.0,
                cultural_authenticity=90.0,
                transcendence_level=0.0,
                created_at=datetime.now(),
                endpoint=f"http://{instance_id}.{cluster.region}.agi.local:6100",
                region=cluster.region
            )
            
            # Simulate instance creation process
            await asyncio.sleep(2)  # Simulate provisioning time
            
            # Add to cluster
            cluster.instances.append(new_instance)
            self.scaling_locks[instance_id] = asyncio.Lock()
            
            # Store in database
            await self._store_instance(new_instance, cluster.cluster_id)
            
            # Mark as ready
            new_instance.state = InstanceState.READY
            await self._update_instance_state(new_instance)
            
            # Create scaling event
            duration = (datetime.now() - start_time).total_seconds()
            
            event = ScalingEvent(
                event_id=str(uuid.uuid4()),
                timestamp=start_time,
                instance_id=instance_id,
                action=ScalingDirection.UP,
                reason=f"Scale up due to high resource utilization in cluster {cluster.cluster_id}",
                rule_id=policy.policy_id,
                resource_metrics=current_metrics,
                success=True,
                duration_seconds=duration
            )
            
            await self._store_scaling_event(event)
            self.scaling_events.append(event)
            
            self.logger.info(f"Successfully created instance {instance_id} in cluster {cluster.cluster_id}")
            return event
            
        except Exception as e:
            duration = (datetime.now() - start_time).total_seconds()
            
            event = ScalingEvent(
                event_id=str(uuid.uuid4()),
                timestamp=start_time,
                instance_id=instance_id if 'instance_id' in locals() else "unknown",
                action=ScalingDirection.UP,
                reason=f"Failed to scale up cluster {cluster.cluster_id}",
                rule_id=policy.policy_id,
                resource_metrics=ResourceMetrics(0, 0, 0, 0, 0, 0, 0, 0),
                success=False,
                duration_seconds=duration,
                error_message=str(e)
            )
            
            await self._store_scaling_event(event)
            self.scaling_events.append(event)
            
            self.logger.error(f"Failed to create instance in cluster {cluster.cluster_id}: {str(e)}")
            return event
    
    async def _remove_instance(self, 
                             instance: AGIInstance, 
                             cluster: ScalingCluster, 
                             policy: ScalingPolicy, 
                             cluster_metrics: Dict[str, Any]) -> Optional[ScalingEvent]:
        """Remove an AGI instance"""
        start_time = datetime.now()
        
        try:
            instance_id = instance.instance_id
            
            # Check if instance can be safely removed
            if instance.consciousness_level > 80.0:
                self.logger.warning(f"Avoiding removal of high-consciousness instance {instance_id}")
                return None
            
            if instance.transcendence_level > 70.0:
                self.logger.warning(f"Avoiding removal of transcendent instance {instance_id}")
                return None
            
            # Drain instance (graceful shutdown)
            instance.state = InstanceState.DRAINING
            await self._update_instance_state(instance)
            
            # Wait for graceful shutdown
            await asyncio.sleep(5)  # Simulate drain time
            
            # Terminate instance
            instance.state = InstanceState.TERMINATING
            await self._update_instance_state(instance)
            
            # Remove from cluster
            cluster.instances = [inst for inst in cluster.instances if inst.instance_id != instance_id]
            
            # Remove from database
            await self._remove_instance_from_db(instance_id)
            
            # Clean up locks
            if instance_id in self.scaling_locks:
                del self.scaling_locks[instance_id]
            
            # Create scaling event
            duration = (datetime.now() - start_time).total_seconds()
            
            event = ScalingEvent(
                event_id=str(uuid.uuid4()),
                timestamp=start_time,
                instance_id=instance_id,
                action=ScalingDirection.DOWN,
                reason=f"Scale down due to low resource utilization in cluster {cluster.cluster_id}",
                rule_id=policy.policy_id,
                resource_metrics=instance.resource_metrics,
                success=True,
                duration_seconds=duration
            )
            
            await self._store_scaling_event(event)
            self.scaling_events.append(event)
            
            self.logger.info(f"Successfully removed instance {instance_id} from cluster {cluster.cluster_id}")
            return event
            
        except Exception as e:
            duration = (datetime.now() - start_time).total_seconds()
            
            event = ScalingEvent(
                event_id=str(uuid.uuid4()),
                timestamp=start_time,
                instance_id=instance.instance_id,
                action=ScalingDirection.DOWN,
                reason=f"Failed to scale down cluster {cluster.cluster_id}",
                rule_id=policy.policy_id,
                resource_metrics=instance.resource_metrics,
                success=False,
                duration_seconds=duration,
                error_message=str(e)
            )
            
            await self._store_scaling_event(event)
            self.scaling_events.append(event)
            
            self.logger.error(f"Failed to remove instance {instance.instance_id}: {str(e)}")
            return event
    
    async def _store_instance(self, instance: AGIInstance, cluster_id: str):
        """Store instance in database"""
        try:
            if self.db_pool:
                async with self.db_pool.acquire() as conn:
                    await conn.execute("""
                        INSERT INTO agi_instances (
                            instance_id, cluster_id, name, state, consciousness_level,
                            cultural_authenticity, transcendence_level, endpoint, 
                            region, instance_config
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    """,
                        instance.instance_id,
                        cluster_id,
                        instance.name,
                        instance.state.value,
                        instance.consciousness_level,
                        instance.cultural_authenticity,
                        instance.transcendence_level,
                        instance.endpoint,
                        instance.region,
                        json.dumps(instance.metadata)
                    )
                    
        except Exception as e:
            self.logger.error(f"Failed to store instance {instance.instance_id}: {str(e)}")
    
    async def _update_instance_state(self, instance: AGIInstance):
        """Update instance state in database"""
        try:
            if self.db_pool:
                async with self.db_pool.acquire() as conn:
                    await conn.execute("""
                        UPDATE agi_instances 
                        SET state = $1, last_health_check = NOW()
                        WHERE instance_id = $2
                    """, instance.state.value, instance.instance_id)
                    
        except Exception as e:
            self.logger.error(f"Failed to update instance state {instance.instance_id}: {str(e)}")
    
    async def _remove_instance_from_db(self, instance_id: str):
        """Remove instance from database"""
        try:
            if self.db_pool:
                async with self.db_pool.acquire() as conn:
                    await conn.execute(
                        "DELETE FROM agi_instances WHERE instance_id = $1",
                        instance_id
                    )
                    
        except Exception as e:
            self.logger.error(f"Failed to remove instance {instance_id} from database: {str(e)}")
    
    async def _store_scaling_event(self, event: ScalingEvent):
        """Store scaling event in database"""
        try:
            if self.db_pool:
                async with self.db_pool.acquire() as conn:
                    await conn.execute("""
                        INSERT INTO scaling_actions (
                            cluster_id, instance_id, action_type, reason, policy_id,
                            metrics_before, success, duration_seconds, error_message
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    """,
                        None,  # cluster_id would be determined from instance
                        event.instance_id,
                        event.action.value,
                        event.reason,
                        event.rule_id,
                        json.dumps(asdict(event.resource_metrics), default=str),
                        event.success,
                        event.duration_seconds,
                        event.error_message
                    )
                    
        except Exception as e:
            self.logger.error(f"Failed to store scaling event: {str(e)}")
    
    async def add_scaling_policy(self, policy: ScalingPolicy) -> bool:
        """Add a new scaling policy"""
        try:
            self.active_policies[policy.policy_id] = policy
            
            # Store in database
            if self.db_pool:
                async with self.db_pool.acquire() as conn:
                    await conn.execute("""
                        INSERT INTO scaling_policies (
                            policy_id, name, description, policy_config, enabled
                        ) VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT (policy_id) DO UPDATE SET
                            name = EXCLUDED.name,
                            description = EXCLUDED.description,
                            policy_config = EXCLUDED.policy_config,
                            enabled = EXCLUDED.enabled,
                            updated_at = NOW()
                    """,
                        policy.policy_id,
                        policy.name,
                        policy.description,
                        json.dumps(asdict(policy), default=str),
                        policy.enabled
                    )
            
            self.logger.info(f"Added scaling policy: {policy.name}")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to add scaling policy: {str(e)}")
            return False
    
    async def create_cluster(self, 
                           name: str, 
                           region: str, 
                           min_consciousness_level: float = 70.0,
                           min_cultural_authenticity: float = 85.0) -> Optional[ScalingCluster]:
        """Create a new scaling cluster"""
        try:
            cluster_id = str(uuid.uuid4())
            
            cluster = ScalingCluster(
                cluster_id=cluster_id,
                name=name,
                region=region,
                instances=[],
                active_policy=None,
                min_consciousness_level=min_consciousness_level,
                min_cultural_authenticity=min_cultural_authenticity,
                load_balancer_endpoint=f"https://{name.lower()}.{region}.agi.local"
            )
            
            # Store in database
            if self.db_pool:
                async with self.db_pool.acquire() as conn:
                    await conn.execute("""
                        INSERT INTO scaling_clusters (
                            cluster_id, name, region, min_consciousness_level,
                            min_cultural_authenticity, min_transcendence_level,
                            cluster_config
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                    """,
                        cluster.cluster_id,
                        cluster.name,
                        cluster.region,
                        cluster.min_consciousness_level,
                        cluster.min_cultural_authenticity,
                        cluster.min_transcendence_level,
                        json.dumps(cluster.metadata)
                    )
            
            self.clusters[cluster_id] = cluster
            
            self.logger.info(f"Created cluster: {name} in region {region}")
            return cluster
            
        except Exception as e:
            self.logger.error(f"Failed to create cluster: {str(e)}")
            return None
    
    async def _health_monitoring_loop(self):
        """Monitor health of all instances"""
        while self.scaling_active:
            try:
                for cluster in self.clusters.values():
                    for instance in cluster.instances:
                        # Update instance metrics
                        instance.resource_metrics = await self.metrics_system.collect_instance_metrics(
                            instance.instance_id
                        )
                        instance.last_health_check = datetime.now()
                        
                        # Check instance health
                        if instance.resource_metrics.cpu_usage == 0.0:
                            if instance.state == InstanceState.ACTIVE:
                                instance.state = InstanceState.FAILED
                                await self._update_instance_state(instance)
                        
                await asyncio.sleep(60)  # Health check every minute
                
            except Exception as e:
                self.logger.error(f"Health monitoring error: {str(e)}")
                await asyncio.sleep(120)
    
    async def _performance_tracking_loop(self):
        """Track scaling performance metrics"""
        while self.scaling_active:
            try:
                await asyncio.sleep(300)  # Update every 5 minutes
                
                # Calculate average scaling time
                recent_events = [e for e in self.scaling_events 
                               if (datetime.now() - e.timestamp).total_seconds() < 3600]
                
                if recent_events:
                    successful_events = [e for e in recent_events if e.success]
                    if successful_events:
                        avg_time = sum(e.duration_seconds for e in successful_events) / len(successful_events)
                        self.scaling_performance["average_scaling_time"] = avg_time
                
                # Log performance summary
                self.logger.info(f"Scaling Performance: "
                               f"Success Rate: {self._get_success_rate():.1f}%, "
                               f"Avg Time: {self.scaling_performance['average_scaling_time']:.1f}s")
                
            except Exception as e:
                self.logger.error(f"Performance tracking error: {str(e)}")
                await asyncio.sleep(600)
    
    def _get_success_rate(self) -> float:
        """Calculate scaling success rate"""
        total = self.scaling_performance["total_scaling_actions"]
        if total == 0:
            return 100.0
        
        successful = self.scaling_performance["successful_scaling_actions"]
        return (successful / total) * 100.0
    
    async def get_scaling_status(self) -> Dict[str, Any]:
        """Get current scaling system status"""
        try:
            active_instances = 0
            total_consciousness = 0.0
            total_cultural = 0.0
            
            for cluster in self.clusters.values():
                for instance in cluster.instances:
                    if instance.state in [InstanceState.READY, InstanceState.ACTIVE]:
                        active_instances += 1
                        total_consciousness += instance.consciousness_level
                        total_cultural += instance.cultural_authenticity
            
            avg_consciousness = total_consciousness / active_instances if active_instances > 0 else 0.0
            avg_cultural = total_cultural / active_instances if active_instances > 0 else 0.0
            
            return {
                "scaling_active": self.scaling_active,
                "clusters_count": len(self.clusters),
                "active_instances": active_instances,
                "total_instances": sum(len(cluster.instances) for cluster in self.clusters.values()),
                "active_policies": len(self.active_policies),
                "average_consciousness_level": avg_consciousness,
                "average_cultural_authenticity": avg_cultural,
                "scaling_performance": self.scaling_performance.copy(),
                "success_rate": self._get_success_rate(),
                "recent_events": len([e for e in self.scaling_events 
                                    if (datetime.now() - e.timestamp).total_seconds() < 3600])
            }
            
        except Exception as e:
            self.logger.error(f"Failed to get scaling status: {str(e)}")
            return {"error": str(e)}
    
    async def shutdown(self):
        """Shutdown scaling manager"""
        try:
            self.logger.info("Shutting down AGI scaling manager...")
            
            self.scaling_active = False
            
            # Shutdown metrics system
            await self.metrics_system.shutdown()
            
            # Close database connections
            if self.redis_client:
                await self.redis_client.close()
            
            if self.db_pool:
                await self.db_pool.close()
            
            self.logger.info("AGI scaling manager shutdown complete")
            
        except Exception as e:
            self.logger.error(f"Scaling manager shutdown error: {str(e)}")

# Export main class
__all__ = ['AGIScalingManager']
