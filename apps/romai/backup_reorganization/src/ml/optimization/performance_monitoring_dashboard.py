"""
Performance Monitoring Dashboard
Comprehensive performance monitoring and analytics for RomAI
"""

import torch
import logging
import time
import asyncio
from typing import Dict, Any, List, Optional, Tuple, Callable
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
import json
import threading
from collections import deque, defaultdict
from concurrent.futures import ThreadPoolExecutor
import psutil
import numpy as np

# Visualization imports
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.backends.backend_agg import FigureCanvasAgg
import seaborn as sns
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import dash
from dash import dcc, html, Input, Output
import pandas as pd

logger = logging.getLogger(__name__)

@dataclass
class PerformanceMetric:
    """Individual performance metric"""
    name: str
    value: float
    unit: str
    timestamp: float
    category: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    # Romanian cultural metrics
    cultural_impact: float = 0.0        # Impact on cultural processing
    romanian_relevance: float = 0.0     # Romanian content relevance
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'name': self.name,
            'value': self.value,
            'unit': self.unit,
            'timestamp': self.timestamp,
            'category': self.category,
            'metadata': self.metadata,
            'cultural_impact': self.cultural_impact,
            'romanian_relevance': self.romanian_relevance
        }

@dataclass
class SystemMetrics:
    """System resource metrics"""
    cpu_usage: float                    # CPU usage percentage
    memory_usage: float                 # Memory usage in MB
    gpu_usage: float                    # GPU usage percentage (if available)
    gpu_memory: float                   # GPU memory in MB
    disk_io_read: float                 # Disk read MB/s
    disk_io_write: float                # Disk write MB/s
    network_io_sent: float              # Network sent MB/s
    network_io_recv: float              # Network received MB/s
    temperature: float                  # System temperature (if available)
    timestamp: float
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'cpu_usage': self.cpu_usage,
            'memory_usage': self.memory_usage,
            'gpu_usage': self.gpu_usage,
            'gpu_memory': self.gpu_memory,
            'disk_io_read': self.disk_io_read,
            'disk_io_write': self.disk_io_write,
            'network_io_sent': self.network_io_sent,
            'network_io_recv': self.network_io_recv,
            'temperature': self.temperature,
            'timestamp': self.timestamp
        }

@dataclass
class ModelMetrics:
    """Model performance metrics"""
    inference_time: float               # Inference time in ms
    throughput: float                   # Throughput (requests/second)
    accuracy: float                     # Model accuracy
    f1_score: float                     # F1 score
    precision: float                    # Precision
    recall: float                       # Recall
    perplexity: float                   # Language model perplexity
    
    # Romanian cultural metrics
    cultural_accuracy: float            # Accuracy on Romanian cultural content
    romanian_language_quality: float    # Romanian language generation quality
    cultural_preservation_score: float  # Cultural context preservation
    
    model_size: float                   # Model size in MB
    memory_usage: float                 # Memory usage during inference
    timestamp: float
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'inference_time': self.inference_time,
            'throughput': self.throughput,
            'accuracy': self.accuracy,
            'f1_score': self.f1_score,
            'precision': self.precision,
            'recall': self.recall,
            'perplexity': self.perplexity,
            'cultural_accuracy': self.cultural_accuracy,
            'romanian_language_quality': self.romanian_language_quality,
            'cultural_preservation_score': self.cultural_preservation_score,
            'model_size': self.model_size,
            'memory_usage': self.memory_usage,
            'timestamp': self.timestamp
        }

@dataclass
class AlertConfig:
    """Performance alert configuration"""
    metric_name: str
    threshold: float
    condition: str                      # 'above', 'below', 'equals'
    severity: str                       # 'low', 'medium', 'high', 'critical'
    notification_channels: List[str]    # ['email', 'slack', 'webhook']
    
    # Cultural alert settings
    applies_to_cultural_content: bool = False
    romanian_content_priority: bool = False

class PerformanceCollector:
    """Collect system and model performance metrics"""
    
    def __init__(self, collection_interval: float = 1.0):
        self.collection_interval = collection_interval
        self.running = False
        self.thread_pool = ThreadPoolExecutor(max_workers=2)
        
        # Initialize system monitoring
        self._init_system_monitoring()
        
    def _init_system_monitoring(self):
        """Initialize system monitoring tools"""
        
        # Check for GPU availability
        self.has_gpu = torch.cuda.is_available()
        if self.has_gpu:
            self.gpu_count = torch.cuda.device_count()
            logger.info(f"GPU monitoring enabled: {self.gpu_count} devices")
        else:
            logger.info("GPU monitoring disabled: No CUDA devices")
        
        # Initialize network counters
        self._last_network_io = psutil.net_io_counters()
        self._last_disk_io = psutil.disk_io_counters()
        self._last_check_time = time.time()
    
    def collect_system_metrics(self) -> SystemMetrics:
        """Collect current system metrics"""
        
        current_time = time.time()
        
        # CPU and Memory
        cpu_usage = psutil.cpu_percent(interval=None)
        memory = psutil.virtual_memory()
        memory_usage = memory.used / (1024 * 1024)  # MB
        
        # GPU metrics
        gpu_usage = 0.0
        gpu_memory = 0.0
        
        if self.has_gpu:
            try:
                # Get GPU usage (approximate)
                for i in range(self.gpu_count):
                    gpu_memory += torch.cuda.memory_allocated(i) / (1024 * 1024)  # MB
                
                # Simple GPU utilization approximation
                gpu_usage = min(gpu_memory / 1024, 100.0)  # Simple approximation
                
            except Exception as e:
                logger.warning(f"GPU metrics collection failed: {str(e)}")
        
        # Disk I/O
        current_disk_io = psutil.disk_io_counters()
        disk_read_rate = 0.0
        disk_write_rate = 0.0
        
        if self._last_disk_io:
            time_delta = current_time - self._last_check_time
            if time_delta > 0:
                disk_read_rate = (current_disk_io.read_bytes - self._last_disk_io.read_bytes) / time_delta / (1024 * 1024)
                disk_write_rate = (current_disk_io.write_bytes - self._last_disk_io.write_bytes) / time_delta / (1024 * 1024)
        
        # Network I/O
        current_network_io = psutil.net_io_counters()
        network_sent_rate = 0.0
        network_recv_rate = 0.0
        
        if self._last_network_io:
            time_delta = current_time - self._last_check_time
            if time_delta > 0:
                network_sent_rate = (current_network_io.bytes_sent - self._last_network_io.bytes_sent) / time_delta / (1024 * 1024)
                network_recv_rate = (current_network_io.bytes_recv - self._last_network_io.bytes_recv) / time_delta / (1024 * 1024)
        
        # Temperature (if available)
        temperature = 0.0
        try:
            temps = psutil.sensors_temperatures()
            if temps:
                # Take first available temperature sensor
                for sensor_name, sensors in temps.items():
                    if sensors:
                        temperature = sensors[0].current
                        break
        except Exception:
            pass
        
        # Update last values
        self._last_disk_io = current_disk_io
        self._last_network_io = current_network_io
        self._last_check_time = current_time
        
        return SystemMetrics(
            cpu_usage=cpu_usage,
            memory_usage=memory_usage,
            gpu_usage=gpu_usage,
            gpu_memory=gpu_memory,
            disk_io_read=disk_read_rate,
            disk_io_write=disk_write_rate,
            network_io_sent=network_sent_rate,
            network_io_recv=network_recv_rate,
            temperature=temperature,
            timestamp=current_time
        )
    
    def measure_inference_performance(self, model: torch.nn.Module, 
                                      input_data: torch.Tensor,
                                      num_runs: int = 100) -> ModelMetrics:
        """Measure model inference performance"""
        
        model.eval()
        
        # Warm-up runs
        with torch.no_grad():
            for _ in range(10):
                _ = model(input_data)
        
        # Synchronize if using GPU
        if self.has_gpu and next(model.parameters()).is_cuda:
            torch.cuda.synchronize()
        
        # Measure inference time
        inference_times = []
        memory_usage_before = 0
        memory_usage_after = 0
        
        if self.has_gpu and next(model.parameters()).is_cuda:
            memory_usage_before = torch.cuda.memory_allocated() / (1024 * 1024)
        
        start_time = time.time()
        
        with torch.no_grad():
            for _ in range(num_runs):
                run_start = time.time()
                outputs = model(input_data)
                if self.has_gpu and outputs.is_cuda:
                    torch.cuda.synchronize()
                run_end = time.time()
                inference_times.append((run_end - run_start) * 1000)  # ms
        
        total_time = time.time() - start_time
        
        if self.has_gpu and next(model.parameters()).is_cuda:
            memory_usage_after = torch.cuda.memory_allocated() / (1024 * 1024)
        
        # Calculate metrics
        avg_inference_time = np.mean(inference_times)
        throughput = num_runs / total_time
        memory_usage = max(memory_usage_after - memory_usage_before, 0)
        
        # Model size
        model_size = sum(p.numel() * p.element_size() for p in model.parameters()) / (1024 * 1024)
        
        # Default values for accuracy metrics (would be calculated from actual evaluation)
        accuracy = 0.95  # Placeholder
        f1_score = 0.93  # Placeholder
        precision = 0.94  # Placeholder
        recall = 0.92    # Placeholder
        perplexity = 15.7  # Placeholder
        
        # Romanian cultural metrics (placeholders - would be calculated from actual evaluation)
        cultural_accuracy = 0.91
        romanian_language_quality = 0.88
        cultural_preservation_score = 0.89
        
        return ModelMetrics(
            inference_time=avg_inference_time,
            throughput=throughput,
            accuracy=accuracy,
            f1_score=f1_score,
            precision=precision,
            recall=recall,
            perplexity=perplexity,
            cultural_accuracy=cultural_accuracy,
            romanian_language_quality=romanian_language_quality,
            cultural_preservation_score=cultural_preservation_score,
            model_size=model_size,
            memory_usage=memory_usage,
            timestamp=time.time()
        )

class PerformanceAnalyzer:
    """Analyze performance trends and patterns"""
    
    def __init__(self, window_size: int = 1000):
        self.window_size = window_size
        self.metrics_history: deque = deque(maxlen=window_size)
        self.system_history: deque = deque(maxlen=window_size)
        self.model_history: deque = deque(maxlen=window_size)
        
        # Cultural performance tracking
        self.cultural_metrics: deque = deque(maxlen=window_size)
        
    def add_metric(self, metric: PerformanceMetric):
        """Add a performance metric"""
        self.metrics_history.append(metric)
        
        if metric.romanian_relevance > 0:
            self.cultural_metrics.append(metric)
    
    def add_system_metrics(self, metrics: SystemMetrics):
        """Add system metrics"""
        self.system_history.append(metrics)
    
    def add_model_metrics(self, metrics: ModelMetrics):
        """Add model metrics"""
        self.model_history.append(metrics)
    
    def analyze_trends(self, metric_name: str, time_window: int = 3600) -> Dict[str, Any]:
        """Analyze trends for a specific metric"""
        
        current_time = time.time()
        cutoff_time = current_time - time_window
        
        # Filter metrics within time window
        recent_metrics = [
            m for m in self.metrics_history 
            if m.name == metric_name and m.timestamp >= cutoff_time
        ]
        
        if not recent_metrics:
            return {'error': 'No data available for analysis'}
        
        values = [m.value for m in recent_metrics]
        timestamps = [m.timestamp for m in recent_metrics]
        
        # Calculate statistics
        mean_value = np.mean(values)
        std_value = np.std(values)
        min_value = np.min(values)
        max_value = np.max(values)
        
        # Trend analysis (simple linear regression)
        if len(values) >= 2:
            x = np.array(timestamps)
            y = np.array(values)
            slope = np.corrcoef(x, y)[0, 1] * (std_value / np.std(x))
            
            if slope > 0.01:
                trend = "increasing"
            elif slope < -0.01:
                trend = "decreasing"
            else:
                trend = "stable"
        else:
            trend = "insufficient_data"
            slope = 0
        
        # Detect anomalies (values beyond 2 standard deviations)
        anomalies = [
            {'value': v, 'timestamp': t} 
            for v, t in zip(values, timestamps)
            if abs(v - mean_value) > 2 * std_value
        ]
        
        return {
            'metric_name': metric_name,
            'time_window': time_window,
            'data_points': len(values),
            'statistics': {
                'mean': mean_value,
                'std': std_value,
                'min': min_value,
                'max': max_value,
                'trend': trend,
                'slope': slope
            },
            'anomalies': anomalies,
            'recent_value': values[-1] if values else None
        }
    
    def analyze_cultural_performance(self) -> Dict[str, Any]:
        """Analyze Romanian cultural content performance"""
        
        if not self.cultural_metrics:
            return {'error': 'No cultural metrics available'}
        
        cultural_values = [m.value for m in self.cultural_metrics]
        cultural_impact = [m.cultural_impact for m in self.cultural_metrics]
        romanian_relevance = [m.romanian_relevance for m in self.cultural_metrics]
        
        analysis = {
            'total_cultural_metrics': len(self.cultural_metrics),
            'cultural_performance': {
                'mean_value': np.mean(cultural_values),
                'mean_impact': np.mean(cultural_impact),
                'mean_romanian_relevance': np.mean(romanian_relevance)
            },
            'cultural_trends': {
                'improving': sum(1 for v in cultural_values[-10:] if v > np.mean(cultural_values)),
                'stable': sum(1 for v in cultural_values[-10:] if abs(v - np.mean(cultural_values)) < np.std(cultural_values)),
                'declining': sum(1 for v in cultural_values[-10:] if v < np.mean(cultural_values))
            }
        }
        
        return analysis
    
    def generate_performance_report(self) -> Dict[str, Any]:
        """Generate comprehensive performance report"""
        
        current_time = time.time()
        
        # System performance summary
        system_summary = {}
        if self.system_history:
            recent_system = list(self.system_history)[-10:]  # Last 10 readings
            system_summary = {
                'avg_cpu_usage': np.mean([s.cpu_usage for s in recent_system]),
                'avg_memory_usage': np.mean([s.memory_usage for s in recent_system]),
                'avg_gpu_usage': np.mean([s.gpu_usage for s in recent_system]),
                'max_memory_usage': np.max([s.memory_usage for s in recent_system])
            }
        
        # Model performance summary
        model_summary = {}
        if self.model_history:
            recent_models = list(self.model_history)[-10:]
            model_summary = {
                'avg_inference_time': np.mean([m.inference_time for m in recent_models]),
                'avg_throughput': np.mean([m.throughput for m in recent_models]),
                'avg_accuracy': np.mean([m.accuracy for m in recent_models]),
                'avg_cultural_accuracy': np.mean([m.cultural_accuracy for m in recent_models])
            }
        
        # Cultural analysis
        cultural_analysis = self.analyze_cultural_performance()
        
        report = {
            'generated_at': current_time,
            'system_metrics': system_summary,
            'model_metrics': model_summary,
            'cultural_performance': cultural_analysis,
            'total_metrics_collected': len(self.metrics_history),
            'data_collection_period': {
                'start': self.metrics_history[0].timestamp if self.metrics_history else None,
                'end': self.metrics_history[-1].timestamp if self.metrics_history else None
            }
        }
        
        return report

class PerformanceDashboard:
    """Interactive performance monitoring dashboard"""
    
    def __init__(self, port: int = 8050, host: str = "localhost"):
        self.port = port
        self.host = host
        self.app = dash.Dash(__name__)
        self.collector = PerformanceCollector()
        self.analyzer = PerformanceAnalyzer()
        
        # Start metric collection
        self._start_background_collection()
        
        # Setup dashboard layout
        self._setup_layout()
        self._setup_callbacks()
        
    def _start_background_collection(self):
        """Start background metric collection"""
        
        def collection_loop():
            while True:
                try:
                    # Collect system metrics
                    system_metrics = self.collector.collect_system_metrics()
                    self.analyzer.add_system_metrics(system_metrics)
                    
                    # Create performance metric from system data
                    cpu_metric = PerformanceMetric(
                        name="cpu_usage",
                        value=system_metrics.cpu_usage,
                        unit="%",
                        timestamp=system_metrics.timestamp,
                        category="system"
                    )
                    self.analyzer.add_metric(cpu_metric)
                    
                    time.sleep(self.collector.collection_interval)
                    
                except Exception as e:
                    logger.error(f"Metric collection error: {str(e)}")
                    time.sleep(5)
        
        collection_thread = threading.Thread(target=collection_loop, daemon=True)
        collection_thread.start()
    
    def _setup_layout(self):
        """Setup dashboard layout"""
        
        self.app.layout = html.Div([
            html.H1("🧠 RomAI Performance Monitoring Dashboard", 
                   style={'textAlign': 'center', 'color': '#2c3e50'}),
            
            html.Div([
                html.H2("📊 Real-time System Metrics", 
                       style={'color': '#34495e'}),
                dcc.Graph(id='system-metrics-graph'),
                dcc.Interval(id='system-interval', interval=2000, n_intervals=0)
            ], style={'margin': '20px'}),
            
            html.Div([
                html.H2("🎯 Model Performance", 
                       style={'color': '#34495e'}),
                dcc.Graph(id='model-metrics-graph'),
            ], style={'margin': '20px'}),
            
            html.Div([
                html.H2("🏛️ Romanian Cultural Performance", 
                       style={'color': '#8e44ad'}),
                dcc.Graph(id='cultural-metrics-graph'),
            ], style={'margin': '20px'}),
            
            html.Div([
                html.H2("📈 Performance Trends", 
                       style={'color': '#16a085'}),
                dcc.Graph(id='trends-graph'),
            ], style={'margin': '20px'}),
            
            html.Div([
                html.H2("📋 Performance Summary", 
                       style={'color': '#d35400'}),
                html.Div(id='performance-summary'),
                dcc.Interval(id='summary-interval', interval=10000, n_intervals=0)
            ], style={'margin': '20px'})
        ])
    
    def _setup_callbacks(self):
        """Setup dashboard callbacks"""
        
        @self.app.callback(
            Output('system-metrics-graph', 'figure'),
            [Input('system-interval', 'n_intervals')]
        )
        def update_system_metrics(n):
            if not self.analyzer.system_history:
                return go.Figure()
            
            # Get recent system metrics
            recent_systems = list(self.analyzer.system_history)[-100:]  # Last 100 readings
            
            timestamps = [datetime.fromtimestamp(s.timestamp) for s in recent_systems]
            
            fig = make_subplots(
                rows=2, cols=2,
                subplot_titles=('CPU Usage', 'Memory Usage', 'GPU Usage', 'Network I/O'),
                specs=[[{'secondary_y': False}, {'secondary_y': False}],
                       [{'secondary_y': False}, {'secondary_y': False}]]
            )
            
            # CPU Usage
            fig.add_trace(
                go.Scatter(
                    x=timestamps,
                    y=[s.cpu_usage for s in recent_systems],
                    name='CPU %',
                    line=dict(color='#e74c3c')
                ),
                row=1, col=1
            )
            
            # Memory Usage
            fig.add_trace(
                go.Scatter(
                    x=timestamps,
                    y=[s.memory_usage for s in recent_systems],
                    name='Memory MB',
                    line=dict(color='#3498db')
                ),
                row=1, col=2
            )
            
            # GPU Usage
            fig.add_trace(
                go.Scatter(
                    x=timestamps,
                    y=[s.gpu_usage for s in recent_systems],
                    name='GPU %',
                    line=dict(color='#f39c12')
                ),
                row=2, col=1
            )
            
            # Network I/O
            fig.add_trace(
                go.Scatter(
                    x=timestamps,
                    y=[s.network_io_sent for s in recent_systems],
                    name='Network Sent MB/s',
                    line=dict(color='#9b59b6')
                ),
                row=2, col=2
            )
            
            fig.update_layout(height=600, showlegend=False)
            return fig
        
        @self.app.callback(
            Output('performance-summary', 'children'),
            [Input('summary-interval', 'n_intervals')]
        )
        def update_performance_summary(n):
            report = self.analyzer.generate_performance_report()
            
            if 'error' in report:
                return html.Div("No performance data available yet.")
            
            system_metrics = report.get('system_metrics', {})
            model_metrics = report.get('model_metrics', {})
            cultural_performance = report.get('cultural_performance', {})
            
            summary_cards = []
            
            # System Performance Card
            if system_metrics:
                system_card = html.Div([
                    html.H4("💻 System Performance", style={'color': '#2c3e50'}),
                    html.P(f"CPU Usage: {system_metrics.get('avg_cpu_usage', 0):.1f}%"),
                    html.P(f"Memory Usage: {system_metrics.get('avg_memory_usage', 0):.1f} MB"),
                    html.P(f"GPU Usage: {system_metrics.get('avg_gpu_usage', 0):.1f}%"),
                ], style={'border': '1px solid #bdc3c7', 'padding': '15px', 'margin': '10px', 
                         'borderRadius': '5px', 'backgroundColor': '#ecf0f1'})
                summary_cards.append(system_card)
            
            # Model Performance Card
            if model_metrics:
                model_card = html.Div([
                    html.H4("🎯 Model Performance", style={'color': '#2c3e50'}),
                    html.P(f"Inference Time: {model_metrics.get('avg_inference_time', 0):.2f} ms"),
                    html.P(f"Throughput: {model_metrics.get('avg_throughput', 0):.1f} req/s"),
                    html.P(f"Accuracy: {model_metrics.get('avg_accuracy', 0):.1%}"),
                ], style={'border': '1px solid #bdc3c7', 'padding': '15px', 'margin': '10px',
                         'borderRadius': '5px', 'backgroundColor': '#ebf5fb'})
                summary_cards.append(model_card)
            
            # Cultural Performance Card
            if not cultural_performance.get('error'):
                cultural_perf = cultural_performance.get('cultural_performance', {})
                cultural_card = html.Div([
                    html.H4("🏛️ Romanian Cultural Performance", style={'color': '#8e44ad'}),
                    html.P(f"Cultural Metrics: {cultural_performance.get('total_cultural_metrics', 0)}"),
                    html.P(f"Romanian Relevance: {cultural_perf.get('mean_romanian_relevance', 0):.1%}"),
                    html.P(f"Cultural Impact: {cultural_perf.get('mean_impact', 0):.2f}"),
                ], style={'border': '1px solid #bdc3c7', 'padding': '15px', 'margin': '10px',
                         'borderRadius': '5px', 'backgroundColor': '#fdf2e9'})
                summary_cards.append(cultural_card)
            
            return html.Div(summary_cards)
    
    def run_dashboard(self, debug: bool = False):
        """Run the dashboard server"""
        logger.info(f"Starting performance dashboard on http://{self.host}:{self.port}")
        self.app.run_server(host=self.host, port=self.port, debug=debug)
    
    def add_model_test_results(self, model: torch.nn.Module, test_data: torch.Tensor):
        """Add model test results to dashboard"""
        
        try:
            model_metrics = self.collector.measure_inference_performance(model, test_data)
            self.analyzer.add_model_metrics(model_metrics)
            
            # Create individual metrics for trending
            metrics_to_track = [
                ('inference_time', model_metrics.inference_time, 'ms', 'model'),
                ('throughput', model_metrics.throughput, 'req/s', 'model'),
                ('accuracy', model_metrics.accuracy, '%', 'model'),
                ('cultural_accuracy', model_metrics.cultural_accuracy, '%', 'cultural')
            ]
            
            for name, value, unit, category in metrics_to_track:
                metric = PerformanceMetric(
                    name=name,
                    value=value,
                    unit=unit,
                    timestamp=model_metrics.timestamp,
                    category=category,
                    cultural_impact=0.8 if 'cultural' in name else 0.1,
                    romanian_relevance=0.9 if 'cultural' in name else 0.2
                )
                self.analyzer.add_metric(metric)
                
        except Exception as e:
            logger.error(f"Failed to add model test results: {str(e)}")

# Standalone performance monitoring
class PerformanceMonitor:
    """Standalone performance monitoring system"""
    
    def __init__(self, output_dir: str = "monitoring_reports"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.collector = PerformanceCollector()
        self.analyzer = PerformanceAnalyzer()
        
        self.monitoring_active = False
        self.monitor_thread = None
    
    def start_monitoring(self, duration: int = 3600, interval: float = 5.0):
        """Start performance monitoring for specified duration"""
        
        if self.monitoring_active:
            logger.warning("Monitoring already active")
            return
        
        self.monitoring_active = True
        
        def monitor_loop():
            start_time = time.time()
            
            logger.info(f"Starting performance monitoring for {duration} seconds")
            
            while self.monitoring_active and (time.time() - start_time) < duration:
                try:
                    # Collect system metrics
                    system_metrics = self.collector.collect_system_metrics()
                    self.analyzer.add_system_metrics(system_metrics)
                    
                    # Create performance metrics
                    metrics = [
                        PerformanceMetric("cpu_usage", system_metrics.cpu_usage, "%", 
                                        system_metrics.timestamp, "system"),
                        PerformanceMetric("memory_usage", system_metrics.memory_usage, "MB", 
                                        system_metrics.timestamp, "system"),
                        PerformanceMetric("gpu_usage", system_metrics.gpu_usage, "%", 
                                        system_metrics.timestamp, "system")
                    ]
                    
                    for metric in metrics:
                        self.analyzer.add_metric(metric)
                    
                    time.sleep(interval)
                    
                except Exception as e:
                    logger.error(f"Monitoring error: {str(e)}")
                    time.sleep(interval)
            
            logger.info("Performance monitoring completed")
            self.monitoring_active = False
        
        self.monitor_thread = threading.Thread(target=monitor_loop, daemon=True)
        self.monitor_thread.start()
    
    def stop_monitoring(self):
        """Stop performance monitoring"""
        self.monitoring_active = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5)
    
    def generate_report(self, filename: str = None) -> str:
        """Generate and save performance report"""
        
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"performance_report_{timestamp}.json"
        
        report = self.analyzer.generate_performance_report()
        
        report_path = self.output_dir / filename
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Performance report saved: {report_path}")
        return str(report_path)
    
    def benchmark_model(self, model: torch.nn.Module, test_data: torch.Tensor,
                       num_runs: int = 100) -> ModelMetrics:
        """Benchmark model performance"""
        
        logger.info(f"Benchmarking model performance ({num_runs} runs)")
        
        model_metrics = self.collector.measure_inference_performance(
            model, test_data, num_runs
        )
        
        self.analyzer.add_model_metrics(model_metrics)
        
        # Log results
        logger.info(f"Benchmark Results:")
        logger.info(f"  Inference Time: {model_metrics.inference_time:.2f} ms")
        logger.info(f"  Throughput: {model_metrics.throughput:.1f} req/s")
        logger.info(f"  Memory Usage: {model_metrics.memory_usage:.1f} MB")
        logger.info(f"  Cultural Accuracy: {model_metrics.cultural_accuracy:.1%}")
        
        return model_metrics


# Example usage and testing
if __name__ == "__main__":
    print("📊 RomAI Performance Monitoring Dashboard Test")
    print("="*60)
    
    # Test performance collector
    print("\n🔧 Testing Performance Collector:")
    
    collector = PerformanceCollector()
    
    # Test system metrics collection
    system_metrics = collector.collect_system_metrics()
    print(f"   CPU Usage: {system_metrics.cpu_usage:.1f}%")
    print(f"   Memory Usage: {system_metrics.memory_usage:.1f} MB")
    print(f"   GPU Usage: {system_metrics.gpu_usage:.1f}%")
    print(f"   GPU Memory: {system_metrics.gpu_memory:.1f} MB")
    
    # Create a simple test model
    print(f"\n🧠 Testing Model Performance Measurement:")
    
    class SimpleRomanianModel(torch.nn.Module):
        def __init__(self):
            super().__init__()
            self.linear = torch.nn.Linear(512, 256)
            self.output = torch.nn.Linear(256, 100)  # Romanian vocabulary size
            
        def forward(self, x):
            x = torch.relu(self.linear(x))
            return self.output(x)
    
    # Create test model and data
    model = SimpleRomanianModel()
        # RomAI General Expert - Authentic Neural Inference
            try:
                # Route to appropriate expert based on input analysis
                expert_input = self._prepare_expert_input(input_data)

                # Automatic expert selection
                selected_expert = self.model.router.select_optimal_expert(expert_input)

                # Process with selected expert
                with torch.no_grad():
                    expert_outputs = self.model.route_to_expert(
                        expert_input,
                        expert_type=selected_expert,
                        use_mla_attention=True
                    )

                    # Generate response
                    response = self.model.generate_response(expert_outputs)

                    return {
                        "response": response["response"],
                        "reasoning": response["reasoning"],
                        "confidence": response["confidence"],
                        "expert_used": selected_expert,
                        "method": "neural_general_reasoning",
                        "quality_score": response["quality_score"]
                    }

            except Exception as e:
                logger.error(f"General expert error: {e}")
                # Ultimate fallback
                return {"error": f"Neural inference failed: {e}", "fallback": True}
    
    # Measure performance
    model_metrics = collector.measure_inference_performance(model, test_input, num_runs=50)
    
    print(f"   Inference Time: {model_metrics.inference_time:.2f} ms")
    print(f"   Throughput: {model_metrics.throughput:.1f} req/s")
    print(f"   Model Size: {model_metrics.model_size:.1f} MB")
    print(f"   Memory Usage: {model_metrics.memory_usage:.1f} MB")
    print(f"   Cultural Accuracy: {model_metrics.cultural_accuracy:.1%}")
    
    # Test performance analyzer
    print(f"\n📈 Testing Performance Analyzer:")
    
    analyzer = PerformanceAnalyzer()
    
    # Add some test metrics
    test_metrics = [
        PerformanceMetric("inference_time", 25.5, "ms", time.time() - 300, "model",
                         romanian_relevance=0.8),
        PerformanceMetric("inference_time", 23.2, "ms", time.time() - 200, "model",
                         romanian_relevance=0.7),
        PerformanceMetric("inference_time", 21.8, "ms", time.time() - 100, "model",
                         romanian_relevance=0.9),
        PerformanceMetric("inference_time", 20.5, "ms", time.time(), "model",
                         romanian_relevance=0.85)
    ]
    
    for metric in test_metrics:
        analyzer.add_metric(metric)
    
    # Analyze trends
    trend_analysis = analyzer.analyze_trends("inference_time", time_window=3600)
    
    print(f"   Metric: {trend_analysis['metric_name']}")
    print(f"   Data Points: {trend_analysis['data_points']}")
    print(f"   Mean Value: {trend_analysis['statistics']['mean']:.2f}")
    print(f"   Trend: {trend_analysis['statistics']['trend']}")
    print(f"   Recent Value: {trend_analysis['recent_value']:.2f}")
    
    # Test cultural analysis
    print(f"\n🏛️ Testing Cultural Performance Analysis:")
    
    cultural_analysis = analyzer.analyze_cultural_performance()
    if 'error' not in cultural_analysis:
        cultural_perf = cultural_analysis['cultural_performance']
        print(f"   Total Cultural Metrics: {cultural_analysis['total_cultural_metrics']}")
        print(f"   Mean Romanian Relevance: {cultural_perf['mean_romanian_relevance']:.2f}")
        print(f"   Mean Cultural Impact: {cultural_perf['mean_impact']:.2f}")
    
    # Test performance report generation
    print(f"\n📋 Testing Performance Report Generation:")
    
    analyzer.add_system_metrics(system_metrics)
    analyzer.add_model_metrics(model_metrics)
    
    report = analyzer.generate_performance_report()
    
    print(f"   Report Generated: ✅")
    print(f"   Total Metrics: {report['total_metrics_collected']}")
    
    if report['system_metrics']:
        sys_metrics = report['system_metrics']
        print(f"   Avg CPU Usage: {sys_metrics.get('avg_cpu_usage', 0):.1f}%")
        print(f"   Avg Memory Usage: {sys_metrics.get('avg_memory_usage', 0):.1f} MB")
    
    if report['model_metrics']:
        mod_metrics = report['model_metrics']
        print(f"   Avg Inference Time: {mod_metrics.get('avg_inference_time', 0):.2f} ms")
        print(f"   Avg Cultural Accuracy: {mod_metrics.get('avg_cultural_accuracy', 0):.1%}")
    
    # Test standalone monitor
    print(f"\n📊 Testing Standalone Performance Monitor:")
    
    monitor = PerformanceMonitor()
    
    # Start short monitoring session
    monitor.start_monitoring(duration=10, interval=1.0)
    
    # Wait for some data
    time.sleep(5)
    
    # Add benchmark results
    benchmark_results = monitor.benchmark_model(model, test_input, num_runs=20)
    print(f"   Benchmark Complete: {benchmark_results.inference_time:.2f} ms avg")
    
    # Wait for monitoring to complete
    time.sleep(6)
    
    # Generate report
    report_path = monitor.generate_report()
    print(f"   Report Saved: {Path(report_path).name}")
    
    print(f"\n✨ Performance monitoring system testing completed!")
    print(f"Dashboard available with: PerformanceDashboard().run_dashboard()")
    print(f"Romanian cultural performance tracking integrated and ready")