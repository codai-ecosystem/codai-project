"""
API Integration Module
Week 2: Replace OpenAI dependency with RomAI inference

This module provides:
- OpenAI-compatible API interface
- Romanian AGI integration
- Cultural context handling
- Performance optimization
"""

import asyncio
from typing import Dict, List, Optional, Any, AsyncGenerator
import json
import time
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import uvicorn
from contextlib import asynccontextmanager

from .model_server import RomAIInferenceEngine, InferenceConfig

# Pydantic models for API requests/responses
class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the message sender")
    content: str = Field(..., description="Content of the message")

class ChatCompletionRequest(BaseModel):
    model: str = Field(default="romai-1.0", description="Model identifier")
    messages: List[ChatMessage] = Field(..., description="List of messages")
    max_tokens: Optional[int] = Field(default=150, description="Maximum tokens to generate")
    temperature: Optional[float] = Field(default=0.8, description="Sampling temperature")
    top_p: Optional[float] = Field(default=0.9, description="Top-p sampling parameter")
    top_k: Optional[int] = Field(default=50, description="Top-k sampling parameter")
    stream: Optional[bool] = Field(default=False, description="Whether to stream responses")
    
    # Romanian-specific parameters
    cultural_context: Optional[str] = Field(default=None, description="Romanian cultural context")
    dialect: Optional[str] = Field(default=None, description="Romanian dialect preference")
    formality: Optional[str] = Field(default="neutral", description="Formality level")
    regional_focus: Optional[str] = Field(default=None, description="Regional focus")

class ChatCompletionResponse(BaseModel):
    id: str
    object: str = "chat.completion"
    created: int
    model: str
    choices: List[Dict[str, Any]]
    usage: Dict[str, int]
    
    # Romanian-specific metadata
    linguistic_analysis: Optional[Dict[str, Any]] = None
    cultural_insights: Optional[Dict[str, Any]] = None

class TextCompletionRequest(BaseModel):
    model: str = Field(default="romai-1.0")
    prompt: str = Field(..., description="Text prompt")
    max_tokens: Optional[int] = Field(default=150)
    temperature: Optional[float] = Field(default=0.8)
    top_p: Optional[float] = Field(default=0.9)
    stream: Optional[bool] = Field(default=False)
    
    # Romanian-specific parameters
    cultural_context: Optional[str] = Field(default=None)
    dialect: Optional[str] = Field(default=None)
    formality: Optional[str] = Field(default="neutral")

class RomanianAnalysisRequest(BaseModel):
    text: str = Field(..., description="Romanian text to analyze")
    include_morphology: bool = Field(default=True)
    include_cultural_context: bool = Field(default=True)
    include_dialect_analysis: bool = Field(default=True)

class RomanianAnalysisResponse(BaseModel):
    text: str
    analysis: Dict[str, Any]
    processing_time: float

# Global inference engine
inference_engine: Optional[RomAIInferenceEngine] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan context manager"""
    global inference_engine
    
    # Startup
    print("🚀 Starting RomAI API Server...")
    
    # Initialize inference engine
    config = InferenceConfig(
        model_path="./checkpoints/romai_latest.pt",
        device="cuda" if torch.cuda.is_available() else "cpu",
        max_length=1024,
        temperature=0.8,
        use_cultural_context=True,
        use_morphology_features=True,
        enable_streaming=True
    )
    
    inference_engine = RomAIInferenceEngine(config)
    print("✅ RomAI Inference Engine loaded successfully")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down RomAI API Server...")
    inference_engine = None

# Create FastAPI app
app = FastAPI(
    title="RomAI API",
    description="Romanian AGI API - OpenAI Compatible Interface",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "RomAI API Server",
        "version": "1.0.0",
        "description": "Romanian AGI with cultural context awareness",
        "status": "running",
        "capabilities": [
            "Romanian text generation",
            "Cultural context understanding",
            "Morphological analysis",
            "Dialect recognition",
            "Historical context awareness"
        ]
    }

@app.get("/v1/models")
async def list_models():
    """List available models (OpenAI compatible)"""
    return {
        "object": "list",
        "data": [
            {
                "id": "romai-1.0",
                "object": "model",
                "created": int(time.time()),
                "owned_by": "romai",
                "permission": [],
                "root": "romai-1.0",
                "parent": None,
                "description": "Romanian AGI model with cultural context awareness"
            }
        ]
    }

@app.post("/v1/chat/completions")
async def create_chat_completion(request: ChatCompletionRequest):
    """Create chat completion (OpenAI compatible)"""
    if not inference_engine:
        raise HTTPException(status_code=503, detail="Inference engine not available")
    
    try:
        # Extract Romanian-specific context
        context = {
            'cultural_context': request.cultural_context,
            'dialect': request.dialect,
            'formality': request.formality,
            'regional_focus': request.regional_focus,
            'formal_style': request.formality == 'formal'
        }
        
        # Combine messages into prompt
        prompt = _combine_messages_to_prompt(request.messages)
        
        if request.stream:
            return StreamingResponse(
                _stream_chat_completion(request, prompt, context),
                media_type="text/plain"
            )
        
        # Generate response
        result = inference_engine.generate_text(
            prompt=prompt,
            max_length=request.max_tokens,
            context=context,
            temperature=request.temperature,
            top_p=request.top_p,
            top_k=request.top_k
        )
        
        # Format response
        response = ChatCompletionResponse(
            id=f"chatcmpl-{int(time.time())}",
            created=int(time.time()),
            model=request.model,
            choices=[
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": result['generated_text']
                    },
                    "finish_reason": "stop"
                }
            ],
            usage={
                "prompt_tokens": len(prompt.split()),
                "completion_tokens": len(result['generated_text'].split()),
                "total_tokens": len(prompt.split()) + len(result['generated_text'].split())
            },
            linguistic_analysis=result.get('linguistic_analysis'),
            cultural_insights=result.get('model_info')
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation error: {str(e)}")

@app.post("/v1/completions")
async def create_completion(request: TextCompletionRequest):
    """Create text completion (OpenAI compatible)"""
    if not inference_engine:
        raise HTTPException(status_code=503, detail="Inference engine not available")
    
    try:
        # Extract context
        context = {
            'cultural_context': request.cultural_context,
            'dialect': request.dialect,
            'formality': request.formality,
            'formal_style': request.formality == 'formal'
        }
        
        if request.stream:
            return StreamingResponse(
                _stream_completion(request, context),
                media_type="text/plain"
            )
        
        # Generate response
        result = inference_engine.generate_text(
            prompt=request.prompt,
            max_length=request.max_tokens,
            context=context,
            temperature=request.temperature,
            top_p=request.top_p
        )
        
        return {
            "id": f"cmpl-{int(time.time())}",
            "object": "text_completion",
            "created": int(time.time()),
            "model": request.model,
            "choices": [
                {
                    "text": result['generated_text'],
                    "index": 0,
                    "logprobs": None,
                    "finish_reason": "stop"
                }
            ],
            "usage": {
                "prompt_tokens": len(request.prompt.split()),
                "completion_tokens": len(result['generated_text'].split()),
                "total_tokens": len(request.prompt.split()) + len(result['generated_text'].split())
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation error: {str(e)}")

@app.post("/v1/romanian/analyze")
async def analyze_romanian_text(request: RomanianAnalysisRequest):
    """Analyze Romanian text (RomAI specific endpoint)"""
    if not inference_engine:
        raise HTTPException(status_code=503, detail="Inference engine not available")
    
    try:
        start_time = time.time()
        
        # Perform analysis
        analysis = inference_engine.analyze_romanian_text(request.text)
        
        # Filter analysis based on request parameters
        filtered_analysis = {}
        
        if request.include_morphology:
            filtered_analysis['morphology'] = analysis.get('morphology', [])
            filtered_analysis['tokens'] = analysis.get('tokens', [])
        
        if request.include_cultural_context:
            filtered_analysis['cultural_context'] = analysis.get('cultural_context', {})
        
        if request.include_dialect_analysis:
            filtered_analysis['dialect'] = analysis.get('dialect', 'standard')
        
        # Add general information
        filtered_analysis['token_count'] = analysis.get('token_count', 0)
        filtered_analysis['model_insights'] = analysis.get('model_insights', {})
        
        processing_time = time.time() - start_time
        
        return RomanianAnalysisResponse(
            text=request.text,
            analysis=filtered_analysis,
            processing_time=processing_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

@app.get("/v1/romanian/model/info")
async def get_model_info():
    """Get RomAI model information"""
    if not inference_engine:
        raise HTTPException(status_code=503, detail="Inference engine not available")
    
    try:
        model_info = inference_engine.get_model_info()
        return model_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting model info: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    if not inference_engine:
        return {"status": "unhealthy", "reason": "Inference engine not loaded"}
    
    return {
        "status": "healthy",
        "service": "RomAI API",
        "version": "1.0.0",
        "timestamp": int(time.time()),
        "inference_engine": "loaded",
        "capabilities": {
            "text_generation": True,
            "romanian_analysis": True,
            "cultural_context": True,
            "streaming": True
        }
    }

# Helper functions
def _combine_messages_to_prompt(messages: List[ChatMessage]) -> str:
    """Combine chat messages into a single prompt"""
    prompt_parts = []
    
    for message in messages:
        role = message.role
        content = message.content
        
        if role == "system":
            prompt_parts.append(f"Sistem: {content}")
        elif role == "user":
            prompt_parts.append(f"Utilizator: {content}")
        elif role == "assistant":
            prompt_parts.append(f"Asistent: {content}")
    
    return "\n".join(prompt_parts) + "\nAsistent:"

async def _stream_chat_completion(
    request: ChatCompletionRequest,
    prompt: str,
    context: Dict[str, Any]
) -> AsyncGenerator[str, None]:
    """Stream chat completion response"""
    if not inference_engine:
        yield "data: {\"error\": \"Inference engine not available\"}\n\n"
        return
    
    try:
        async for chunk_data in inference_engine.stream_generate(
            prompt=prompt,
            max_length=request.max_tokens,
            context=context,
            temperature=request.temperature,
            top_p=request.top_p,
            top_k=request.top_k
        ):
            
            if chunk_data.get('is_complete', False):
                # Final chunk
                final_response = {
                    "id": f"chatcmpl-{int(time.time())}",
                    "object": "chat.completion.chunk",
                    "created": int(time.time()),
                    "model": request.model,
                    "choices": [
                        {
                            "index": 0,
                            "delta": {},
                            "finish_reason": "stop"
                        }
                    ]
                }
                yield f"data: {json.dumps(final_response)}\n\n"
                yield "data: [DONE]\n\n"
            else:
                # Streaming chunk
                chunk_response = {
                    "id": f"chatcmpl-{int(time.time())}",
                    "object": "chat.completion.chunk",
                    "created": int(time.time()),
                    "model": request.model,
                    "choices": [
                        {
                            "index": 0,
                            "delta": {
                                "content": chunk_data.get('chunk', '')
                            },
                            "finish_reason": None
                        }
                    ]
                }
                yield f"data: {json.dumps(chunk_response)}\n\n"
                
    except Exception as e:
        error_response = {
            "error": {
                "message": f"Streaming error: {str(e)}",
                "type": "generation_error"
            }
        }
        yield f"data: {json.dumps(error_response)}\n\n"

async def _stream_completion(
    request: TextCompletionRequest,
    context: Dict[str, Any]
) -> AsyncGenerator[str, None]:
    """Stream text completion response"""
    if not inference_engine:
        yield "data: {\"error\": \"Inference engine not available\"}\n\n"
        return
    
    try:
        async for chunk_data in inference_engine.stream_generate(
            prompt=request.prompt,
            max_length=request.max_tokens,
            context=context,
            temperature=request.temperature,
            top_p=request.top_p
        ):
            
            if chunk_data.get('is_complete', False):
                yield "data: [DONE]\n\n"
            else:
                chunk_response = {
                    "id": f"cmpl-{int(time.time())}",
                    "object": "text_completion",
                    "created": int(time.time()),
                    "model": request.model,
                    "choices": [
                        {
                            "text": chunk_data.get('chunk', ''),
                            "index": 0,
                            "logprobs": None,
                            "finish_reason": None
                        }
                    ]
                }
                yield f"data: {json.dumps(chunk_response)}\n\n"
                
    except Exception as e:
        error_response = {
            "error": {
                "message": f"Streaming error: {str(e)}",
                "type": "generation_error"
            }
        }
        yield f"data: {json.dumps(error_response)}\n\n"

# Main server startup
if __name__ == "__main__":
    print("🇷🇴 Starting RomAI API Server...")
    uvicorn.run(
        "api_integration:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
