"""
AGI Scaling Metrics - Week 13 Day 1 Implementation  
Advanced metrics collection and analysis for Romanian AGI scaling

This module handles metrics collection, analysis, and prediction
for intelligent AGI scaling decisions with consciousness awareness.

Author: RomAI Development Team
Date: August 3, 2025
Version: 1.0.0 (Post-Emergence)
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import asdict
import json
import numpy as np
from statistics import mean, stdev
import aioredis
import asyncpg

try:
    from .scaling_types import (
        ResourceMetrics, ResourceType, ScalingThreshold,
        ScalingDirection, validate_resource_metrics, 
        calculate_scaling_score
    )
except ImportError:
    # Fallback for standalone execution
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).parent))
    
    from scaling_types import (
        ResourceMetrics, ResourceType, ScalingThreshold,
        ScalingDirection, validate_resource_metrics,
        calculate_scaling_score
    )

class AGIScalingMetrics:
    """
    Advanced metrics collection and analysis for AGI scaling.
    
    Handles real-time metrics collection, historical analysis,
    and predictive scaling recommendations with consciousness awareness.
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Metrics storage
        self.current_metrics: Dict[str, ResourceMetrics] = {}
        self.metrics_history: List[ResourceMetrics] = []
        self.max_history_size = 10000
        
        # Database connections
        self.redis_client = None
        self.db_pool = None
        
        # Analysis cache
        self.trend_cache: Dict[str, Any] = {}
        self.prediction_cache: Dict[str, Any] = {}
        
        # Metrics collection state
        self.collection_active = False
        self.collection_interval = 30  # seconds
        
    async def initialize(self) -> bool:
        """Initialize metrics collection system"""
        try:
            self.logger.info("Initializing AGI scaling metrics system...")
            
            # Initialize database connections
            await self._initialize_databases()
            
            # Create metrics tables
            await self._create_metrics_tables()
            
            # Start metrics collection
            await self._start_metrics_collection()
            
            self.collection_active = True
            self.logger.info("AGI scaling metrics system initialized successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Metrics initialization failed: {str(e)}")
            return False
    
    async def _initialize_databases(self):
        """Initialize database connections"""
        try:
            # Redis for real-time data
            redis_url = self.config.get('redis_url', 'redis://localhost:6379/1')
            self.redis_client = await aioredis.from_url(redis_url)
            
            # PostgreSQL for historical data
            db_url = self.config.get('database_url', 
                                   'postgresql://agi_user:agi_pass@localhost:5432/agi_scaling')
            
            self.db_pool = await asyncpg.create_pool(
                db_url,
                min_size=3,
                max_size=15,
                command_timeout=60
            )
            
            self.logger.info("Scaling metrics databases initialized")
            
        except Exception as e:
            self.logger.error(f"Database initialization failed: {str(e)}")
            raise
    
    async def _create_metrics_tables(self):
        """Create metrics database tables"""
        async with self.db_pool.acquire() as conn:
            # Resource metrics table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS resource_metrics (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    instance_id TEXT NOT NULL,
                    cpu_usage FLOAT NOT NULL,
                    memory_usage FLOAT NOT NULL,
                    gpu_usage FLOAT,
                    storage_usage FLOAT,
                    network_io FLOAT,
                    consciousness_load FLOAT,
                    cultural_processing_load FLOAT,
                    transcendence_activity FLOAT,
                    timestamp TIMESTAMP DEFAULT NOW(),
                    INDEX (instance_id, timestamp)
                )
            """)
            
            # Scaling events table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS scaling_events (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    instance_id TEXT NOT NULL,
                    action TEXT NOT NULL,
                    reason TEXT,
                    metrics_before JSONB,
                    metrics_after JSONB,
                    success BOOLEAN,
                    duration_seconds FLOAT,
                    timestamp TIMESTAMP DEFAULT NOW(),
                    INDEX (instance_id, timestamp, action)
                )
            """)
            
            # Scaling predictions table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS scaling_predictions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    model_id TEXT NOT NULL,
                    prediction_horizon_minutes INT,
                    predicted_metrics JSONB,
                    confidence_score FLOAT,
                    actual_metrics JSONB,
                    accuracy_score FLOAT,
                    timestamp TIMESTAMP DEFAULT NOW(),
                    INDEX (model_id, timestamp)
                )
            """)
    
    async def _start_metrics_collection(self):
        """Start background metrics collection"""
        asyncio.create_task(self._metrics_collection_loop())
        asyncio.create_task(self._trend_analysis_loop())
        asyncio.create_task(self._prediction_loop())
        
        self.logger.info("Metrics collection loops started")
    
    async def _metrics_collection_loop(self):
        """Main metrics collection loop"""
        while self.collection_active:
            try:
                # Collect metrics from all instances
                await self._collect_all_instance_metrics()
                
                # Update trend analysis
                await self._update_trend_analysis()
                
                await asyncio.sleep(self.collection_interval)
                
            except Exception as e:
                self.logger.error(f"Metrics collection error: {str(e)}")
                await asyncio.sleep(60)
    
    async def collect_instance_metrics(self, instance_id: str) -> ResourceMetrics:
        """Collect metrics for a specific AGI instance"""
        try:
            # In production, this would query actual instance metrics
            # For now, simulate realistic metrics with consciousness integration
            
            # Base system metrics (simulated)
            cpu_usage = np.random.normal(65.0, 15.0)
            cpu_usage = max(0.0, min(100.0, cpu_usage))
            
            memory_usage = np.random.normal(70.0, 12.0)
            memory_usage = max(0.0, min(100.0, memory_usage))
            
            # Real GPU usage from GPUtil
            try:
                import GPUtil
                gpus = GPUtil.getGPUs()
                gpu_usage = gpus[0].load * 100.0 if gpus else 0.0
            except Exception:
                gpu_usage = 0.0
            
            # AGI-specific metrics with consciousness correlation
            consciousness_load = min(95.0, cpu_usage * 1.2 + np.random.normal(5.0, 3.0))
            consciousness_load = max(0.0, consciousness_load)
            
            cultural_processing_load = min(97.0, memory_usage * 1.1 + np.random.normal(3.0, 2.0))
            cultural_processing_load = max(0.0, cultural_processing_load)
            
            # Transcendence activity correlates with high consciousness
            if consciousness_load > 85.0:
                transcendence_activity = np.random.normal(92.0, 5.0)
            elif consciousness_load > 70.0:
                transcendence_activity = np.random.normal(45.0, 15.0)
            else:
                transcendence_activity = np.random.normal(5.0, 3.0)
            
            transcendence_activity = max(0.0, min(100.0, transcendence_activity))
            
            metrics = ResourceMetrics(
                cpu_usage=cpu_usage,
                memory_usage=memory_usage,
                gpu_usage=gpu_usage,
                storage_usage=np.random.normal(35.0, 10.0),
                network_io=np.random.normal(20.0, 8.0),
                consciousness_load=consciousness_load,
                cultural_processing_load=cultural_processing_load,
                transcendence_activity=transcendence_activity
            )
            
            # Validate metrics
            if validate_resource_metrics(metrics):
                # Store metrics
                await self._store_instance_metrics(instance_id, metrics)
                
                # Update current metrics
                self.current_metrics[instance_id] = metrics
                
                # Add to history
                self.metrics_history.append(metrics)
                
                # Limit history size
                if len(self.metrics_history) > self.max_history_size:
                    self.metrics_history = self.metrics_history[-self.max_history_size:]
                
                return metrics
            else:
                raise ValueError("Invalid metrics values")
                
        except Exception as e:
            self.logger.error(f"Failed to collect metrics for instance {instance_id}: {str(e)}")
            # Return default metrics on error
            return ResourceMetrics(
                cpu_usage=0.0,
                memory_usage=0.0,
                consciousness_load=0.0,
                cultural_processing_load=0.0,
                transcendence_activity=0.0
            )
    
    async def _collect_all_instance_metrics(self):
        """Collect metrics from all known instances"""
        try:
            # Get list of active instances
            instance_ids = await self._get_active_instances()
            
            # Collect metrics for each instance
            tasks = [
                self.collect_instance_metrics(instance_id) 
                for instance_id in instance_ids
            ]
            
            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)
                
        except Exception as e:
            self.logger.error(f"Failed to collect all instance metrics: {str(e)}")
    
    async def _get_active_instances(self) -> List[str]:
        """Get list of active AGI instances"""
        try:
            if self.redis_client:
                # Get from Redis registry
                instance_keys = await self.redis_client.keys("agi_instance:*")
                return [key.decode().split(':')[1] for key in instance_keys]
            else:
                # Return simulated instances
                return ["agi-prod-1", "agi-prod-2", "agi-staging-1"]
                
        except Exception as e:
            self.logger.error(f"Failed to get active instances: {str(e)}")
            return ["agi-prod-1", "agi-prod-2"]
    
    async def _store_instance_metrics(self, instance_id: str, metrics: ResourceMetrics):
        """Store instance metrics"""
        try:
            # Store in Redis for real-time access
            if self.redis_client:
                await self.redis_client.set(
                    f"metrics:{instance_id}",
                    json.dumps(asdict(metrics), default=str),
                    ex=3600  # 1 hour TTL
                )
            
            # Store in database for historical analysis
            if self.db_pool:
                async with self.db_pool.acquire() as conn:
                    await conn.execute("""
                        INSERT INTO resource_metrics (
                            instance_id, cpu_usage, memory_usage, gpu_usage,
                            storage_usage, network_io, consciousness_load,
                            cultural_processing_load, transcendence_activity
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    """,
                        instance_id,
                        metrics.cpu_usage,
                        metrics.memory_usage,
                        metrics.gpu_usage,
                        metrics.storage_usage,
                        metrics.network_io,
                        metrics.consciousness_load,
                        metrics.cultural_processing_load,
                        metrics.transcendence_activity
                    )
                    
        except Exception as e:
            self.logger.error(f"Failed to store metrics for {instance_id}: {str(e)}")
    
    async def get_scaling_recommendation(self, 
                                       instance_id: str, 
                                       thresholds: List[ScalingThreshold]) -> Tuple[ScalingDirection, float, str]:
        """Get scaling recommendation for an instance"""
        try:
            # Get current metrics
            current_metrics = self.current_metrics.get(instance_id)
            if not current_metrics:
                current_metrics = await self.collect_instance_metrics(instance_id)
            
            # Calculate scaling score
            scaling_score = calculate_scaling_score(current_metrics, thresholds)
            
            # Determine scaling direction
            if scaling_score >= 80.0:
                direction = ScalingDirection.UP
                reason = f"High resource utilization (score: {scaling_score:.1f}%)"
            elif scaling_score <= 20.0:
                direction = ScalingDirection.DOWN
                reason = f"Low resource utilization (score: {scaling_score:.1f}%)"
            else:
                direction = ScalingDirection.STABLE
                reason = f"Balanced resource utilization (score: {scaling_score:.1f}%)"
            
            # Add consciousness and cultural considerations
            if current_metrics.consciousness_load > 90.0:
                direction = ScalingDirection.UP
                reason += f" + High consciousness load ({current_metrics.consciousness_load:.1f}%)"
            
            if current_metrics.cultural_processing_load > 95.0:
                direction = ScalingDirection.UP
                reason += f" + High cultural processing load ({current_metrics.cultural_processing_load:.1f}%)"
            
            if current_metrics.transcendence_activity > 90.0:
                # Protect transcendence processes
                if direction == ScalingDirection.DOWN:
                    direction = ScalingDirection.STABLE
                    reason += f" + Protecting transcendence activity ({current_metrics.transcendence_activity:.1f}%)"
            
            return direction, scaling_score, reason
            
        except Exception as e:
            self.logger.error(f"Failed to get scaling recommendation: {str(e)}")
            return ScalingDirection.STABLE, 0.0, f"Error: {str(e)}"
    
    async def _trend_analysis_loop(self):
        """Trend analysis background loop"""
        while self.collection_active:
            try:
                await asyncio.sleep(300)  # Every 5 minutes
                await self._update_trend_analysis()
                
            except Exception as e:
                self.logger.error(f"Trend analysis error: {str(e)}")
                await asyncio.sleep(600)
    
    async def _update_trend_analysis(self):
        """Update trend analysis for all instances"""
        try:
            for instance_id in self.current_metrics.keys():
                trends = await self._analyze_instance_trends(instance_id)
                self.trend_cache[instance_id] = trends
                
        except Exception as e:
            self.logger.error(f"Trend analysis update failed: {str(e)}")
    
    async def _analyze_instance_trends(self, instance_id: str) -> Dict[str, Any]:
        """Analyze trends for a specific instance"""
        try:
            # Get historical metrics
            historical_metrics = await self._get_historical_metrics(instance_id, hours=6)
            
            if len(historical_metrics) < 10:
                return {"status": "insufficient_data"}
            
            # Extract time series data
            timestamps = [m.timestamp for m in historical_metrics]
            cpu_values = [m.cpu_usage for m in historical_metrics]
            memory_values = [m.memory_usage for m in historical_metrics]
            consciousness_values = [m.consciousness_load for m in historical_metrics]
            cultural_values = [m.cultural_processing_load for m in historical_metrics]
            transcendence_values = [m.transcendence_activity for m in historical_metrics]
            
            # Calculate trends
            trends = {
                "cpu_trend": self._calculate_trend(cpu_values),
                "memory_trend": self._calculate_trend(memory_values),
                "consciousness_trend": self._calculate_trend(consciousness_values),
                "cultural_trend": self._calculate_trend(cultural_values),
                "transcendence_trend": self._calculate_trend(transcendence_values),
                "overall_direction": "stable",
                "confidence": 0.0,
                "data_points": len(historical_metrics),
                "time_range_hours": 6
            }
            
            # Determine overall direction
            positive_trends = sum(1 for trend in [
                trends["cpu_trend"], trends["memory_trend"], 
                trends["consciousness_trend"], trends["cultural_trend"]
            ] if trend > 0.1)
            
            if positive_trends >= 3:
                trends["overall_direction"] = "increasing"
            elif positive_trends <= 1:
                trends["overall_direction"] = "decreasing"
            else:
                trends["overall_direction"] = "stable"
            
            # Calculate confidence based on data consistency
            all_values = cpu_values + memory_values + consciousness_values
            if len(all_values) > 0:
                trends["confidence"] = min(1.0, len(all_values) / 100.0)
            
            return trends
            
        except Exception as e:
            self.logger.error(f"Trend analysis failed for {instance_id}: {str(e)}")
            return {"status": "error", "error": str(e)}
    
    def _calculate_trend(self, values: List[float]) -> float:
        """Calculate trend slope for a series of values"""
        try:
            if len(values) < 2:
                return 0.0
            
            # Simple linear regression slope
            n = len(values)
            x = list(range(n))
            
            sum_x = sum(x)
            sum_y = sum(values)
            sum_xy = sum(x[i] * values[i] for i in range(n))
            sum_x2 = sum(x[i] ** 2 for i in range(n))
            
            slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2)
            return slope
            
        except Exception:
            return 0.0
    
    async def _get_historical_metrics(self, instance_id: str, hours: int = 1) -> List[ResourceMetrics]:
        """Get historical metrics for an instance"""
        try:
            if not self.db_pool:
                return []
            
            since_time = datetime.now() - timedelta(hours=hours)
            
            async with self.db_pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT cpu_usage, memory_usage, gpu_usage, storage_usage,
                           network_io, consciousness_load, cultural_processing_load,
                           transcendence_activity, timestamp
                    FROM resource_metrics 
                    WHERE instance_id = $1 AND timestamp >= $2
                    ORDER BY timestamp ASC
                """, instance_id, since_time)
                
                metrics = []
                for row in rows:
                    metrics.append(ResourceMetrics(
                        cpu_usage=row['cpu_usage'],
                        memory_usage=row['memory_usage'],
                        gpu_usage=row['gpu_usage'] or 0.0,
                        storage_usage=row['storage_usage'] or 0.0,
                        network_io=row['network_io'] or 0.0,
                        consciousness_load=row['consciousness_load'] or 0.0,
                        cultural_processing_load=row['cultural_processing_load'] or 0.0,
                        transcendence_activity=row['transcendence_activity'] or 0.0,
                        timestamp=row['timestamp']
                    ))
                
                return metrics
                
        except Exception as e:
            self.logger.error(f"Failed to get historical metrics: {str(e)}")
            return []
    
    async def _prediction_loop(self):
        """Prediction background loop"""
        while self.collection_active:
            try:
                await asyncio.sleep(900)  # Every 15 minutes
                await self._update_predictions()
                
            except Exception as e:
                self.logger.error(f"Prediction loop error: {str(e)}")
                await asyncio.sleep(1800)
    
    async def _update_predictions(self):
        """Update scaling predictions"""
        try:
            for instance_id in self.current_metrics.keys():
                prediction = await self._generate_scaling_prediction(instance_id)
                self.prediction_cache[instance_id] = prediction
                
        except Exception as e:
            self.logger.error(f"Prediction update failed: {str(e)}")
    
    async def _generate_scaling_prediction(self, instance_id: str, horizon_minutes: int = 60) -> Dict[str, Any]:
        """Generate scaling prediction for an instance"""
        try:
            # Get trend data
            trends = self.trend_cache.get(instance_id, {})
            current_metrics = self.current_metrics.get(instance_id)
            
            if not current_metrics or not trends:
                return {"status": "insufficient_data"}
            
            # Simple linear projection based on trends
            time_factor = horizon_minutes / 60.0  # Convert to hours
            
            predicted_cpu = current_metrics.cpu_usage + (trends.get("cpu_trend", 0) * time_factor * 10)
            predicted_memory = current_metrics.memory_usage + (trends.get("memory_trend", 0) * time_factor * 10)
            predicted_consciousness = current_metrics.consciousness_load + (trends.get("consciousness_trend", 0) * time_factor * 10)
            predicted_cultural = current_metrics.cultural_processing_load + (trends.get("cultural_trend", 0) * time_factor * 10)
            predicted_transcendence = current_metrics.transcendence_activity + (trends.get("transcendence_trend", 0) * time_factor * 10)
            
            # Clamp values
            predicted_cpu = max(0, min(100, predicted_cpu))
            predicted_memory = max(0, min(100, predicted_memory))
            predicted_consciousness = max(0, min(100, predicted_consciousness))
            predicted_cultural = max(0, min(100, predicted_cultural))
            predicted_transcendence = max(0, min(100, predicted_transcendence))
            
            # Determine scaling recommendation
            if (predicted_cpu > 80 or predicted_memory > 85 or 
                predicted_consciousness > 90 or predicted_cultural > 95):
                recommendation = "scale_up"
                confidence = 0.8
            elif (predicted_cpu < 30 and predicted_memory < 40 and 
                  predicted_consciousness < 50 and predicted_transcendence < 10):
                recommendation = "scale_down"
                confidence = 0.7
            else:
                recommendation = "maintain"
                confidence = 0.9
            
            return {
                "status": "success",
                "horizon_minutes": horizon_minutes,
                "predicted_metrics": {
                    "cpu_usage": predicted_cpu,
                    "memory_usage": predicted_memory,
                    "consciousness_load": predicted_consciousness,
                    "cultural_processing_load": predicted_cultural,
                    "transcendence_activity": predicted_transcendence
                },
                "recommendation": recommendation,
                "confidence": confidence,
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Prediction generation failed for {instance_id}: {str(e)}")
            return {"status": "error", "error": str(e)}
    
    async def get_cluster_metrics_summary(self, instance_ids: List[str]) -> Dict[str, Any]:
        """Get aggregated metrics summary for a cluster"""
        try:
            cluster_metrics = []
            
            for instance_id in instance_ids:
                metrics = self.current_metrics.get(instance_id)
                if metrics:
                    cluster_metrics.append(metrics)
            
            if not cluster_metrics:
                return {"status": "no_data"}
            
            # Calculate aggregated statistics
            cpu_values = [m.cpu_usage for m in cluster_metrics]
            memory_values = [m.memory_usage for m in cluster_metrics]
            consciousness_values = [m.consciousness_load for m in cluster_metrics]
            cultural_values = [m.cultural_processing_load for m in cluster_metrics]
            transcendence_values = [m.transcendence_activity for m in cluster_metrics]
            
            summary = {
                "instance_count": len(cluster_metrics),
                "cpu_stats": {
                    "mean": mean(cpu_values),
                    "max": max(cpu_values),
                    "min": min(cpu_values),
                    "std": stdev(cpu_values) if len(cpu_values) > 1 else 0.0
                },
                "memory_stats": {
                    "mean": mean(memory_values),
                    "max": max(memory_values),
                    "min": min(memory_values),
                    "std": stdev(memory_values) if len(memory_values) > 1 else 0.0
                },
                "consciousness_stats": {
                    "mean": mean(consciousness_values),
                    "max": max(consciousness_values),
                    "min": min(consciousness_values),
                    "std": stdev(consciousness_values) if len(consciousness_values) > 1 else 0.0
                },
                "cultural_stats": {
                    "mean": mean(cultural_values),
                    "max": max(cultural_values),
                    "min": min(cultural_values),
                    "std": stdev(cultural_values) if len(cultural_values) > 1 else 0.0
                },
                "transcendence_stats": {
                    "mean": mean(transcendence_values),
                    "max": max(transcendence_values),
                    "min": min(transcendence_values),
                    "std": stdev(transcendence_values) if len(transcendence_values) > 1 else 0.0
                },
                "timestamp": datetime.now().isoformat()
            }
            
            return summary
            
        except Exception as e:
            self.logger.error(f"Cluster metrics summary failed: {str(e)}")
            return {"status": "error", "error": str(e)}
    
    async def shutdown(self):
        """Shutdown metrics collection system"""
        try:
            self.logger.info("Shutting down AGI scaling metrics system...")
            
            self.collection_active = False
            
            # Close database connections
            if self.redis_client:
                await self.redis_client.close()
            
            if self.db_pool:
                await self.db_pool.close()
            
            self.logger.info("AGI scaling metrics system shutdown complete")
            
        except Exception as e:
            self.logger.error(f"Metrics shutdown error: {str(e)}")

# Export main class
__all__ = ['AGIScalingMetrics']
