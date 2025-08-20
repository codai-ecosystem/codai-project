//! Metrics collection for monitoring and observability

use std::collections::HashMap;
use std::sync::Arc;
use std::time::Instant;
use tokio::sync::RwLock;

pub struct MetricsCollector {
    counters: Arc<RwLock<HashMap<String, u64>>>,
    gauges: Arc<RwLock<HashMap<String, f64>>>,
    timers: Arc<RwLock<HashMap<String, Vec<f64>>>>,
}

impl MetricsCollector {
    pub fn new() -> Self {
        MetricsCollector {
            counters: Arc::new(RwLock::new(HashMap::new())),
            gauges: Arc::new(RwLock::new(HashMap::new())),
            timers: Arc::new(RwLock::new(HashMap::new())),
        }
    }
    
    pub async fn increment_counter(&self, name: &str) {
        let mut counters = self.counters.write().await;
        *counters.entry(name.to_string()).or_insert(0) += 1;
    }
    
    pub async fn set_gauge(&self, name: &str, value: f64) {
        let mut gauges = self.gauges.write().await;
        gauges.insert(name.to_string(), value);
    }
    
    pub fn start_timer(&self, name: &str) -> Timer {
        Timer::new(name.to_string(), self.timers.clone())
    }
    
    pub async fn collect(&self) -> serde_json::Value {
        let counters = self.counters.read().await;
        let gauges = self.gauges.read().await;
        let timers = self.timers.read().await;
        
        serde_json::json!({
            "counters": *counters,
            "gauges": *gauges,
            "timers": timers.iter().map(|(k, v)| {
                let avg = if v.is_empty() { 0.0 } else { v.iter().sum::<f64>() / v.len() as f64 };
                (k.clone(), serde_json::json!({
                    "count": v.len(),
                    "avg": avg,
                    "min": v.iter().fold(f64::INFINITY, |a, &b| a.min(b)),
                    "max": v.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b))
                }))
            }).collect::<HashMap<_, _>>()
        })
    }
}

pub struct Timer {
    name: String,
    start: Instant,
    timers: Arc<RwLock<HashMap<String, Vec<f64>>>>,
}

impl Timer {
    fn new(name: String, timers: Arc<RwLock<HashMap<String, Vec<f64>>>>) -> Self {
        Timer {
            name,
            start: Instant::now(),
            timers,
        }
    }
}

impl Drop for Timer {
    fn drop(&mut self) {
        let duration = self.start.elapsed().as_secs_f64();
        let timers = self.timers.clone();
        let name = self.name.clone();
        
        tokio::spawn(async move {
            let mut timers = timers.write().await;
            timers.entry(name).or_insert_with(Vec::new).push(duration);
        });
    }
}
