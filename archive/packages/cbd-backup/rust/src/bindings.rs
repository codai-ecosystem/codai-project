//! Node.js bindings for CBD Engine

use neon::prelude::*;
use tokio::runtime::Runtime;
use std::sync::Arc;
use cbd_engine::{CBDEngine, CBDError};

// Global runtime for async operations
lazy_static::lazy_static! {
    static ref RUNTIME: Runtime = Runtime::new().unwrap();
}

// Global engine instance
static mut ENGINE: Option<Arc<CBDEngine>> = None;

/// Initialize the CBD engine
fn initialize_engine(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let engine = RUNTIME.block_on(async {
        CBDEngine::new().await
    });
    
    match engine {
        Ok(eng) => {
            unsafe {
                ENGINE = Some(Arc::new(eng));
            }
            Ok(cx.undefined())
        }
        Err(e) => cx.throw_error(format!("Failed to initialize engine: {}", e))
    }
}

/// Store a key-value pair
fn store(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let key = cx.argument::<JsString>(0)?.value(&mut cx);
    let value = cx.argument::<JsBuffer>(1)?;
    let value_bytes = value.as_slice(&cx).to_vec();
    
    let promise = cx.task(move || {
        let engine = unsafe { 
            ENGINE.as_ref().ok_or_else(|| CBDError::InternalError("Engine not initialized".to_string()))? 
        };
        
        RUNTIME.block_on(async {
            engine.store(&key, &value_bytes).await
        })
    }).promise(&mut cx, |mut cx, result| {
        match result {
            Ok(_) => Ok(cx.undefined()),
            Err(e) => cx.throw_error(e.to_string())
        }
    });
    
    Ok(promise)
}

/// Retrieve a value by key
fn retrieve(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let key = cx.argument::<JsString>(0)?.value(&mut cx);
    
    let promise = cx.task(move || {
        let engine = unsafe { 
            ENGINE.as_ref().ok_or_else(|| CBDError::InternalError("Engine not initialized".to_string()))? 
        };
        
        RUNTIME.block_on(async {
            engine.retrieve(&key).await
        })
    }).promise(&mut cx, |mut cx, result| {
        match result {
            Ok(Some(data)) => {
                let mut buffer = cx.buffer(data.len())?;
                buffer.as_mut_slice(&mut cx).copy_from_slice(&data);
                Ok(buffer)
            }
            Ok(None) => Ok(cx.null()),
            Err(e) => cx.throw_error(e.to_string())
        }
    });
    
    Ok(promise)
}

/// Store a vector
fn store_vector(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let key = cx.argument::<JsString>(0)?.value(&mut cx);
    let vector_array = cx.argument::<JsArray>(1)?;
    let metadata_json = cx.argument::<JsString>(2)?.value(&mut cx);
    
    // Convert JS array to Vec<f32>
    let vector: Vec<f32> = (0..vector_array.len(&mut cx))
        .map(|i| {
            let val = vector_array.get(&mut cx, i)?;
            Ok(val.downcast::<JsNumber, _>(&mut cx)?.value(&mut cx) as f32)
        })
        .collect::<NeonResult<Vec<f32>>>()?;
    
    // Parse metadata JSON
    let metadata = if metadata_json.is_empty() {
        None
    } else {
        Some(serde_json::from_str(&metadata_json)
            .or_else(|_| cx.throw_error("Invalid JSON metadata"))?)
    };
    
    let promise = cx.task(move || {
        let engine = unsafe { 
            ENGINE.as_ref().ok_or_else(|| CBDError::InternalError("Engine not initialized".to_string()))? 
        };
        
        RUNTIME.block_on(async {
            engine.store_vector(&key, &vector, metadata).await
        })
    }).promise(&mut cx, |mut cx, result| {
        match result {
            Ok(_) => Ok(cx.undefined()),
            Err(e) => cx.throw_error(e.to_string())
        }
    });
    
    Ok(promise)
}

/// Search for similar vectors
fn search_vectors(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let query_array = cx.argument::<JsArray>(0)?;
    let k = cx.argument::<JsNumber>(1)?.value(&mut cx) as usize;
    let threshold = if cx.len() > 2 {
        Some(cx.argument::<JsNumber>(2)?.value(&mut cx) as f32)
    } else {
        None
    };
    
    // Convert JS array to Vec<f32>
    let query: Vec<f32> = (0..query_array.len(&mut cx))
        .map(|i| {
            let val = query_array.get(&mut cx, i)?;
            Ok(val.downcast::<JsNumber, _>(&mut cx)?.value(&mut cx) as f32)
        })
        .collect::<NeonResult<Vec<f32>>>()?;
    
    let promise = cx.task(move || {
        let engine = unsafe { 
            ENGINE.as_ref().ok_or_else(|| CBDError::InternalError("Engine not initialized".to_string()))? 
        };
        
        RUNTIME.block_on(async {
            engine.search_vectors(&query, k, threshold).await
        })
    }).promise(&mut cx, |mut cx, result| {
        match result {
            Ok(results) => {
                let js_array = cx.empty_array();
                for (i, (key, score, metadata)) in results.into_iter().enumerate() {
                    let result_obj = cx.empty_object();
                    
                    let key_str = cx.string(key);
                    result_obj.set(&mut cx, "key", key_str)?;
                    
                    let score_num = cx.number(score);
                    result_obj.set(&mut cx, "score", score_num)?;
                    
                    if let Some(meta) = metadata {
                        let meta_str = cx.string(serde_json::to_string(&meta).unwrap_or_default());
                        result_obj.set(&mut cx, "metadata", meta_str)?;
                    } else {
                        result_obj.set(&mut cx, "metadata", cx.null())?;
                    }
                    
                    js_array.set(&mut cx, i as u32, result_obj)?;
                }
                Ok(js_array)
            }
            Err(e) => cx.throw_error(e.to_string())
        }
    });
    
    Ok(promise)
}

/// Get engine health status
fn health_check(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let promise = cx.task(move || {
        let engine = unsafe { 
            ENGINE.as_ref().ok_or_else(|| CBDError::InternalError("Engine not initialized".to_string()))? 
        };
        
        RUNTIME.block_on(async {
            engine.health_check().await
        })
    }).promise(&mut cx, |mut cx, result| {
        match result {
            Ok(health) => {
                let health_str = cx.string(serde_json::to_string(&health).unwrap_or_default());
                Ok(health_str)
            }
            Err(e) => cx.throw_error(e.to_string())
        }
    });
    
    Ok(promise)
}

/// Get engine statistics
fn get_stats(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let promise = cx.task(move || {
        let engine = unsafe { 
            ENGINE.as_ref().ok_or_else(|| CBDError::InternalError("Engine not initialized".to_string()))? 
        };
        
        RUNTIME.block_on(async {
            engine.get_stats().await
        })
    }).promise(&mut cx, |mut cx, result| {
        match result {
            Ok(stats) => {
                let stats_str = cx.string(serde_json::to_string(&stats).unwrap_or_default());
                Ok(stats_str)
            }
            Err(e) => cx.throw_error(e.to_string())
        }
    });
    
    Ok(promise)
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("initialize", initialize_engine)?;
    cx.export_function("store", store)?;
    cx.export_function("retrieve", retrieve)?;
    cx.export_function("storeVector", store_vector)?;
    cx.export_function("searchVectors", search_vectors)?;
    cx.export_function("healthCheck", health_check)?;
    cx.export_function("getStats", get_stats)?;
    
    Ok(())
}
