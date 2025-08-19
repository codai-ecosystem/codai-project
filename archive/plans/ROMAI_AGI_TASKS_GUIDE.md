# 🤖 RomAI AGI Development Tasks Guide

## Overview
This guide documents the VS Code tasks configured for RomAI AGI development, including server management, testing, and monitoring.

## 🚀 Quick Start

### Start AGI Development Environment
```bash
# Use VS Code Command Palette: Tasks: Run Task
🤖 Start AGI Development Stack
```
This starts:
- MemorAI MCP Server (port 4950)
- CBD Database (port 8080) 
- RomAI AGI Model Server (port 8000)
- RomAI Frontend App (port 6100)

### Quick Test
```bash
🚀 Quick AGI Test
```
Runs a fast functionality test to verify the AGI server is working.

## 🛠️ Available Tasks

### 🤖 AI/ML Backend Services

#### `🤖 Start RomAI AGI Model Server (8000)`
- **Purpose**: Starts the FastAPI AGI model server with 103M+ parameters
- **Port**: 8000
- **Environment**: Optimized Python environment with GPU support
- **Background**: Yes
- **Dependencies**: None (but requires Python environment)

#### `🧪 Test RomAI AGI Server Health`
- **Purpose**: Comprehensive health check of all AGI endpoints
- **Script**: `health_check.py`
- **Output**: Detailed status report with response times
- **Exit Code**: 0 if healthy, 1 if issues detected

#### `⚡ Run RomAI AGI Performance Tests`
- **Purpose**: Performance benchmarking and SLO validation
- **Script**: `benchmark.py`
- **Output**: Performance metrics and recommendations
- **Duration**: ~2-5 minutes

#### `📊 Monitor RomAI AGI Resources`
- **Purpose**: Real-time resource monitoring
- **Script**: `profiler.py`
- **Background**: Yes
- **Output**: Continuous CPU/Memory/GPU monitoring

#### `🚀 Run RomAI AGI Load Tests`
- **Purpose**: Stress testing with various traffic patterns
- **Script**: `load_test.py`
- **Output**: Scalability and stability metrics
- **Duration**: ~5-10 minutes

#### `🚀 Quick AGI Test`
- **Purpose**: Fast functionality verification
- **Script**: `test_runner.py quick`
- **Duration**: ~30 seconds
- **Output**: Basic inference and capabilities test

### 🎯 Composite Tasks

#### `🤖 Start AGI Development Stack`
Sequential startup of AGI-specific services:
1. 🧹 Cleanup Ports
2. 🧠 Start MemorAI MCP Server
3. 🗃️ Start CBD Database
4. 🤖 Start RomAI AGI Model Server (8000)
5. 🇷🇴 Start RomAI App (6100)

#### `🧪 Run AGI Test Suite`
Sequential execution of all AGI tests:
1. Health check
2. Performance tests

#### `🚀 Start Development Environment`
Full backend stack (now includes AGI server):
1. Cleanup ports
2. MemorAI MCP Server
3. CBD Database
4. RomAI AGI Model Server
5. Gateway Service

## 📋 Usage Examples

### Development Workflow
```bash
# 1. Start AGI development stack
Task: 🤖 Start AGI Development Stack

# 2. Verify everything is working
Task: 🚀 Quick AGI Test

# 3. Run performance validation
Task: ⚡ Run RomAI AGI Performance Tests

# 4. Monitor resources during development
Task: 📊 Monitor RomAI AGI Resources
```

### Testing Workflow
```bash
# Health check before testing
Task: 🧪 Test RomAI AGI Server Health

# Run comprehensive test suite
Task: 🧪 Run AGI Test Suite

# Stress test for production readiness
Task: 🚀 Run RomAI AGI Load Tests
```

### Manual Script Execution
```bash
# Navigate to serving directory
cd apps/romai/src/ml/serving

# Quick test
python test_runner.py quick

# Health check
python health_check.py

# Performance benchmark
python benchmark.py

# Resource profiler (background)
python profiler.py

# Load testing
python load_test.py
```

## 🔧 Environment Configuration

### Required Environment Variables
```env
PYTHONPATH=apps/romai/src
PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:1024
TRANSFORMERS_CACHE=.cache/transformers
HF_HOME=.cache/huggingface
MODEL_CACHE_DIR=.cache/models
```

### Python Dependencies
- FastAPI + Uvicorn
- PyTorch 2.x
- Transformers
- Romanian language models
- Performance monitoring tools

## 📊 Monitoring and Diagnostics

### Health Check Output
```
🏥 RomAI AGI Model Server Health Check
==================================================
✅ HEALTHY /health (0.045s)
✅ HEALTHY /status (0.038s) 
  Model: RomAI-Hybrid-103M
  Parameters: 103,954,970
✅ HEALTHY /capabilities/scores (0.156s)
  Reasoning: 92.5%
  Language: 88.7%
⚠️  SLOW /training/metrics (2.340s)
  Loss: 2.13
  Accuracy: 85%
```

### Performance Metrics
- Response times for all endpoints
- Resource utilization (CPU/Memory/GPU)
- Throughput and concurrent request handling
- Error rates and failure modes

### Load Testing Scenarios
- **Burst Traffic**: Sudden spike in requests
- **Sustained Load**: Continuous high traffic
- **Mixed Workload**: Various request types
- **Stress Test**: Beyond normal capacity

## 🚨 Troubleshooting

### Server Won't Start
1. Check Python environment: `python --version`
2. Verify dependencies: `pip list | grep torch`
3. Check port availability: `netstat -an | findstr 8000`
4. Review server logs in task output

### Tests Failing
1. Ensure server is running: `🧪 Test RomAI AGI Server Health`
2. Check disk space and memory
3. Verify model files are downloaded
4. Check network connectivity

### Performance Issues
1. Monitor resources: `📊 Monitor RomAI AGI Resources`
2. Check GPU utilization if available
3. Review benchmark results for bottlenecks
4. Consider model optimization

## 🎯 Production Readiness

### SLO Validation
- Response time < 2s for inference
- Health check < 100ms
- 99.9% uptime target
- Error rate < 0.1%

### Scalability Testing
- Concurrent user simulation
- Auto-scaling validation
- Resource limit testing
- Failover scenarios

### Security Validation
- Input sanitization testing
- Rate limiting verification
- Authentication/authorization
- Data privacy compliance

## 🔄 Continuous Integration

### Pre-commit Checks
```bash
# Health check
python health_check.py

# Quick functionality test
python test_runner.py quick

# Performance regression test
python benchmark.py --quick
```

### Automated Testing Pipeline
1. Server startup validation
2. Health check verification
3. Performance baseline comparison
4. Load testing under CI limits
5. Resource cleanup

This task configuration provides a comprehensive development environment for RomAI AGI with proper testing, monitoring, and diagnostics capabilities.
