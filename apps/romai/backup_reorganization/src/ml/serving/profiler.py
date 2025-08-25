#!/usr/bin/env python3
"""
RomAI AGI Resource Profiling and Monitoring Script
================================================

Comprehensive resource monitoring for AGI system performance profiling.
Monitors CPU, memory, GPU, network, and custom AGI metrics during operation.

Author: GitHub Copilot Agent
Date: August 5, 2025
Purpose: Day 4 Production Deployment Resource Analysis
"""

import psutil
import asyncio
import time
import json
import threading
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import httpx
from collections import deque

@dataclass
class ResourceSnapshot:
    """Single point-in-time resource measurement"""
    timestamp: datetime
    cpu_percent: float
    memory_percent: float
    memory_used_mb: float
    memory_available_mb: float
    disk_io_read_mb: float
    disk_io_write_mb: float
    network_sent_mb: float
    network_recv_mb: float
    gpu_percent: Optional[float] = None
    gpu_memory_mb: Optional[float] = None
    active_connections: int = 0
    response_time: Optional[float] = None
    requests_per_second: float = 0

@dataclass
class AGIMetrics:
    """AGI-specific performance metrics"""
    timestamp: datetime
    model_load_time: Optional[float] = None
    inference_time: Optional[float] = None
    training_loss: Optional[float] = None
    capability_scores: Optional[Dict[str, float]] = None
    active_models: int = 0
    cache_hit_rate: Optional[float] = None
    queue_size: int = 0

class ResourceProfiler:
    """
    Comprehensive resource profiling for RomAI AGI system
    """
    
    def __init__(self, sample_interval: float = 1.0, max_samples: int = 3600):
        self.sample_interval = sample_interval
        self.max_samples = max_samples
        self.samples: deque = deque(maxlen=max_samples)
        self.agi_metrics: deque = deque(maxlen=max_samples)
        self.is_monitoring = False
        self.monitor_thread = None
        
        # Initialize baseline measurements
        self.baseline_cpu = 0
        self.baseline_memory = 0
        self.baseline_network = 0
        
        # AGI service URL
        self.agi_url = "http://localhost:8000"
        self.client = httpx.AsyncClient(timeout=10)
        
        print("🔍 Resource Profiler initialized")
        print(f"📊 Sampling every {sample_interval}s, max {max_samples} samples")
    
    def get_baseline_metrics(self) -> Dict[str, float]:
        """Capture baseline resource usage"""
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk_io = psutil.disk_io_counters()
        network_io = psutil.net_io_counters()
        
        baseline = {
            "cpu_percent": cpu_percent,
            "memory_percent": memory.percent,
            "memory_used_mb": memory.used / (1024 * 1024),
            "disk_read_mb": disk_io.read_bytes / (1024 * 1024) if disk_io else 0,
            "disk_write_mb": disk_io.write_bytes / (1024 * 1024) if disk_io else 0,
            "network_sent_mb": network_io.bytes_sent / (1024 * 1024) if network_io else 0,
            "network_recv_mb": network_io.bytes_recv / (1024 * 1024) if network_io else 0
        }
        
        self.baseline_cpu = baseline["cpu_percent"]
        self.baseline_memory = baseline["memory_percent"]
        self.baseline_network = baseline["network_sent_mb"] + baseline["network_recv_mb"]
        
        print(f"📈 Baseline captured: CPU {cpu_percent:.1f}%, Memory {memory.percent:.1f}%")
        return baseline
    
    def get_gpu_metrics(self) -> Dict[str, Optional[float]]:
        """Get GPU metrics if available"""
        try:
            import GPUtil
            gpus = GPUtil.getGPUs()
            if gpus:
                gpu = gpus[0]  # Primary GPU
                return {
                    "gpu_percent": gpu.load * 100,
                    "gpu_memory_mb": gpu.memoryUsed
                }
        except ImportError:
            pass
        except Exception as e:
            print(f"⚠️ GPU metrics unavailable: {e}")
        
        return {"gpu_percent": None, "gpu_memory_mb": None}
    
    async def get_agi_metrics(self) -> AGIMetrics:
        """Collect AGI-specific metrics"""
        timestamp = datetime.now()
        metrics = AGIMetrics(timestamp=timestamp)
        
        try:
            # Get health status
            start_time = time.time()
            health_response = await self.client.get(f"{self.agi_url}/health")
            response_time = time.time() - start_time
            
            if health_response.status_code == 200:
                health_data = health_response.json()
                metrics.response_time = response_time
                metrics.active_models = health_data.get('models_loaded', 0)
            
            # Get capability scores
            try:
                cap_response = await self.client.get(f"{self.agi_url}/capability_scores")
                if cap_response.status_code == 200:
                    metrics.capability_scores = cap_response.json()
            except:
                pass
            
            # Get training metrics
            try:
                train_response = await self.client.get(f"{self.agi_url}/training/metrics")
                if train_response.status_code == 200:
                    train_data = train_response.json()
                    metrics.training_loss = train_data.get('current_loss')
            except:
                pass
                
        except Exception as e:
            print(f"⚠️ AGI metrics collection failed: {e}")
        
        return metrics
    
    def capture_snapshot(self) -> ResourceSnapshot:
        """Capture a single resource snapshot"""
        timestamp = datetime.now()
        
        # System metrics
        cpu_percent = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        
        # I/O metrics
        disk_io = psutil.disk_io_counters()
        network_io = psutil.net_io_counters()
        
        # Connection count
        connections = len(psutil.net_connections())
        
        # GPU metrics
        gpu_metrics = self.get_gpu_metrics()
        
        snapshot = ResourceSnapshot(
            timestamp=timestamp,
            cpu_percent=cpu_percent,
            memory_percent=memory.percent,
            memory_used_mb=memory.used / (1024 * 1024),
            memory_available_mb=memory.available / (1024 * 1024),
            disk_io_read_mb=disk_io.read_bytes / (1024 * 1024) if disk_io else 0,
            disk_io_write_mb=disk_io.write_bytes / (1024 * 1024) if disk_io else 0,
            network_sent_mb=network_io.bytes_sent / (1024 * 1024) if network_io else 0,
            network_recv_mb=network_io.bytes_recv / (1024 * 1024) if network_io else 0,
            gpu_percent=gpu_metrics["gpu_percent"],
            gpu_memory_mb=gpu_metrics["gpu_memory_mb"],
            active_connections=connections
        )
        
        return snapshot
    
    async def monitoring_loop(self):
        """Main monitoring loop"""
        print("🔄 Starting resource monitoring...")
        
        while self.is_monitoring:
            try:
                # Capture system snapshot
                snapshot = self.capture_snapshot()
                self.samples.append(snapshot)
                
                # Capture AGI metrics
                agi_metrics = await self.get_agi_metrics()
                self.agi_metrics.append(agi_metrics)
                
                # Log current status periodically
                if len(self.samples) % 60 == 0:  # Every 60 samples (1 minute at 1s interval)
                    self.log_current_status(snapshot, agi_metrics)
                
                await asyncio.sleep(self.sample_interval)
                
            except Exception as e:
                print(f"❌ Monitoring error: {e}")
                await asyncio.sleep(self.sample_interval)
    
    def log_current_status(self, snapshot: ResourceSnapshot, agi_metrics: AGIMetrics):
        """Log current system status"""
        print(f"\n📊 Status at {snapshot.timestamp.strftime('%H:%M:%S')}")
        print(f"🖥️  CPU: {snapshot.cpu_percent:.1f}% | Memory: {snapshot.memory_percent:.1f}% ({snapshot.memory_used_mb:.0f}MB)")
        
        if snapshot.gpu_percent:
            print(f"🎮 GPU: {snapshot.gpu_percent:.1f}% | GPU Memory: {snapshot.gpu_memory_mb:.0f}MB")
        
        print(f"🌐 Connections: {snapshot.active_connections} | Network: ↑{snapshot.network_sent_mb:.1f}MB ↓{snapshot.network_recv_mb:.1f}MB")
        
        if agi_metrics.response_time:
            print(f"🧠 AGI Response: {agi_metrics.response_time:.3f}s | Models: {agi_metrics.active_models}")
        
        if agi_metrics.capability_scores:
            total_score = sum(agi_metrics.capability_scores.values()) / len(agi_metrics.capability_scores)
            print(f"🎯 AGI Capability: {total_score:.1f}%")
    
    def start_monitoring(self):
        """Start monitoring in a separate thread"""
        if self.is_monitoring:
            print("⚠️ Monitoring already running")
            return
        
        self.is_monitoring = True
        self.get_baseline_metrics()
        
        # Start async monitoring loop
        def run_monitoring():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                loop.run_until_complete(self.monitoring_loop())
            finally:
                loop.close()
        
        self.monitor_thread = threading.Thread(target=run_monitoring)
        self.monitor_thread.daemon = True
        self.monitor_thread.start()
        
        print("✅ Resource monitoring started")
    
    def stop_monitoring(self):
        """Stop monitoring"""
        if not self.is_monitoring:
            print("⚠️ Monitoring not running")
            return
        
        self.is_monitoring = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5)
        
        print("🛑 Resource monitoring stopped")
    
    def analyze_performance(self) -> Dict[str, Any]:
        """Analyze collected performance data"""
        if not self.samples:
            return {"error": "No samples collected"}
        
        # Convert to arrays for analysis
        cpu_data = [s.cpu_percent for s in self.samples]
        memory_data = [s.memory_percent for s in self.samples]
        response_times = [m.response_time for m in self.agi_metrics if m.response_time]
        
        analysis = {
            "sample_count": len(self.samples),
            "monitoring_duration": (self.samples[-1].timestamp - self.samples[0].timestamp).total_seconds(),
            
            "cpu_analysis": {
                "average": np.mean(cpu_data),
                "peak": np.max(cpu_data),
                "p95": np.percentile(cpu_data, 95),
                "baseline_increase": np.mean(cpu_data) - self.baseline_cpu
            },
            
            "memory_analysis": {
                "average": np.mean(memory_data),
                "peak": np.max(memory_data),
                "p95": np.percentile(memory_data, 95),
                "baseline_increase": np.mean(memory_data) - self.baseline_memory
            },
            
            "agi_performance": {},
            
            "resource_efficiency": {
                "cpu_efficiency": "good" if np.mean(cpu_data) < 80 else "needs_attention",
                "memory_efficiency": "good" if np.mean(memory_data) < 80 else "needs_attention"
            }
        }
        
        if response_times:
            analysis["agi_performance"] = {
                "avg_response_time": np.mean(response_times),
                "p95_response_time": np.percentile(response_times, 95),
                "max_response_time": np.max(response_times),
                "response_count": len(response_times)
            }
        
        return analysis
    
    def generate_plots(self, output_dir: str = "./"):
        """Generate performance visualization plots"""
        if not self.samples:
            print("⚠️ No data to plot")
            return
        
        # Prepare data
        timestamps = [s.timestamp for s in self.samples]
        cpu_data = [s.cpu_percent for s in self.samples]
        memory_data = [s.memory_percent for s in self.samples]
        
        # Create plots
        fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
        fig.suptitle('RomAI AGI Resource Performance Analysis', fontsize=16)
        
        # CPU Usage
        ax1.plot(timestamps, cpu_data, color='blue', alpha=0.7)
        ax1.set_title('CPU Usage Over Time')
        ax1.set_ylabel('CPU Percentage')
        ax1.grid(True, alpha=0.3)
        ax1.axhline(y=self.baseline_cpu, color='red', linestyle='--', alpha=0.5, label='Baseline')
        ax1.legend()
        
        # Memory Usage
        ax2.plot(timestamps, memory_data, color='green', alpha=0.7)
        ax2.set_title('Memory Usage Over Time')
        ax2.set_ylabel('Memory Percentage')
        ax2.grid(True, alpha=0.3)
        ax2.axhline(y=self.baseline_memory, color='red', linestyle='--', alpha=0.5, label='Baseline')
        ax2.legend()
        
        # Response Times
        if self.agi_metrics:
            response_times = [m.response_time for m in self.agi_metrics if m.response_time]
            response_timestamps = [m.timestamp for m in self.agi_metrics if m.response_time]
            
            if response_times:
                ax3.plot(response_timestamps, response_times, color='orange', alpha=0.7)
                ax3.set_title('AGI Response Times')
                ax3.set_ylabel('Response Time (seconds)')
                ax3.grid(True, alpha=0.3)
        
        # Resource Distribution
        ax4.hist(cpu_data, bins=20, alpha=0.6, color='blue', label='CPU')
        ax4.hist(memory_data, bins=20, alpha=0.6, color='green', label='Memory')
        ax4.set_title('Resource Usage Distribution')
        ax4.set_xlabel('Usage Percentage')
        ax4.set_ylabel('Frequency')
        ax4.legend()
        ax4.grid(True, alpha=0.3)
        
        # Save plot
        output_path = f"{output_dir}/romai_agi_performance_analysis.png"
        plt.tight_layout()
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"📊 Performance plots saved to {output_path}")
    
    def generate_report(self, output_file: str = None) -> str:
        """Generate comprehensive resource profiling report"""
        analysis = self.analyze_performance()
        
        if "error" in analysis:
            return f"❌ Report generation failed: {analysis['error']}"
        
        report_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        report = f"""
# 🔍 RomAI AGI Resource Profiling Report

**Generated**: {report_time}  
**Monitoring Duration**: {analysis['monitoring_duration']:.1f} seconds  
**Samples Collected**: {analysis['sample_count']}

## 📊 System Resource Analysis

### CPU Performance
- **Average Usage**: {analysis['cpu_analysis']['average']:.1f}%
- **Peak Usage**: {analysis['cpu_analysis']['peak']:.1f}%
- **95th Percentile**: {analysis['cpu_analysis']['p95']:.1f}%
- **Baseline Increase**: {analysis['cpu_analysis']['baseline_increase']:+.1f}%

### Memory Performance
- **Average Usage**: {analysis['memory_analysis']['average']:.1f}%
- **Peak Usage**: {analysis['memory_analysis']['peak']:.1f}%
- **95th Percentile**: {analysis['memory_analysis']['p95']:.1f}%
- **Baseline Increase**: {analysis['memory_analysis']['baseline_increase']:+.1f}%

## 🧠 AGI Performance Metrics
"""
        
        if analysis['agi_performance']:
            agi_perf = analysis['agi_performance']
            report += f"""
- **Average Response Time**: {agi_perf['avg_response_time']:.3f}s
- **95th Percentile Response**: {agi_perf['p95_response_time']:.3f}s
- **Maximum Response Time**: {agi_perf['max_response_time']:.3f}s
- **Total Responses**: {agi_perf['response_count']}
"""
        else:
            report += "\n- ⚠️ No AGI performance data collected\n"
        
        # Performance Assessment
        report += "\n## 🎯 Performance Assessment\n\n"
        
        cpu_eff = analysis['resource_efficiency']['cpu_efficiency']
        mem_eff = analysis['resource_efficiency']['memory_efficiency']
        
        if cpu_eff == "good" and mem_eff == "good":
            report += "✅ **Overall**: Excellent resource efficiency\n"
        elif cpu_eff == "good" or mem_eff == "good":
            report += "⚠️ **Overall**: Moderate resource efficiency - some optimization needed\n"
        else:
            report += "❌ **Overall**: Poor resource efficiency - optimization required\n"
        
        report += f"- CPU Efficiency: {'✅' if cpu_eff == 'good' else '⚠️'} {cpu_eff.replace('_', ' ').title()}\n"
        report += f"- Memory Efficiency: {'✅' if mem_eff == 'good' else '⚠️'} {mem_eff.replace('_', ' ').title()}\n"
        
        # Recommendations
        report += "\n## 💡 Optimization Recommendations\n\n"
        
        if analysis['cpu_analysis']['p95'] > 90:
            report += "- 🔥 High CPU usage detected. Consider CPU optimization or scaling.\n"
        if analysis['memory_analysis']['p95'] > 90:
            report += "- 💾 High memory usage detected. Consider memory optimization or scaling.\n"
        if analysis['agi_performance'] and analysis['agi_performance']['p95_response_time'] > 1.0:
            report += "- 🐌 Slow AGI response times. Optimize model inference or caching.\n"
        
        if (analysis['cpu_analysis']['p95'] < 70 and 
            analysis['memory_analysis']['p95'] < 70 and
            analysis['agi_performance'] and 
            analysis['agi_performance']['p95_response_time'] < 0.5):
            report += "- ✅ System performing optimally! Ready for production scaling.\n"
        
        print(report)
        
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(report)
            print(f"📄 Report saved to {output_file}")
        
        return report
    
    async def close(self):
        """Cleanup resources"""
        self.stop_monitoring()
        await self.client.aclose()

async def main():
    """Main profiling execution"""
    import argparse
    
    parser = argparse.ArgumentParser(description="RomAI AGI Resource Profiler")
    parser.add_argument("--duration", type=int, default=300, help="Monitoring duration in seconds")
    parser.add_argument("--interval", type=float, default=1.0, help="Sampling interval in seconds")
    parser.add_argument("--output", help="Output file for report")
    parser.add_argument("--plots", action="store_true", help="Generate performance plots")
    
    args = parser.parse_args()
    
    profiler = ResourceProfiler(sample_interval=args.interval)
    
    try:
        profiler.start_monitoring()
        
        print(f"🔍 Profiling for {args.duration} seconds...")
        await asyncio.sleep(args.duration)
        
        profiler.stop_monitoring()
        
        # Generate analysis
        profiler.generate_report(args.output)
        
        if args.plots:
            profiler.generate_plots()
        
        print("✅ Resource profiling completed!")
        
    except KeyboardInterrupt:
        print("\n🛑 Profiling interrupted by user")
    except Exception as e:
        print(f"❌ Profiling failed: {e}")
    finally:
        await profiler.close()

if __name__ == "__main__":
    asyncio.run(main())
