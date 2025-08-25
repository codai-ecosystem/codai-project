"""
RomAI Multimodal API Endpoints

Advanced vision-language processing endpoints integrating LLaVA, CLIP,
and custom Romanian cultural vision analysis with DeepSeek V3 architecture.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union
import logging
import time
import base64
import io
from PIL import Image
import numpy as np

from ..experts.enhanced_multimodal_expert import EnhancedMultimodalExpert

logger = logging.getLogger(__name__)

# Initialize the enhanced multimodal expert
multimodal_expert = None

def initialize_multimodal_expert(config: Dict[str, Any] = None):
    """Initialize the multimodal expert."""
    global multimodal_expert
    try:
        multimodal_expert = EnhancedMultimodalExpert(config)
        logger.info("✅ Enhanced Multimodal Expert initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize multimodal expert: {e}")
        multimodal_expert = None


# Pydantic models for API requests
class ImageCaptionRequest(BaseModel):
    """Request model for image captioning."""
    image_data: Optional[str] = Field(None, description="Base64 encoded image data")
    image_url: Optional[str] = Field(None, description="URL to image")
    prompt: Optional[str] = Field("Describe this image in detail.", description="Custom prompt")
    romanian_context: bool = Field(False, description="Include Romanian cultural context")


class VisualQARequest(BaseModel):
    """Request model for visual question answering."""
    image_data: Optional[str] = Field(None, description="Base64 encoded image data")
    image_url: Optional[str] = Field(None, description="URL to image")
    question: str = Field(..., description="Question about the image")
    romanian_context: bool = Field(False, description="Include Romanian cultural context")


class ImageTextMatchingRequest(BaseModel):
    """Request model for image-text similarity."""
    image_data: Optional[str] = Field(None, description="Base64 encoded image data")
    image_url: Optional[str] = Field(None, description="URL to image")
    text: str = Field(..., description="Text to match with image")


class SceneAnalysisRequest(BaseModel):
    """Request model for scene understanding."""
    image_data: Optional[str] = Field(None, description="Base64 encoded image data")
    image_url: Optional[str] = Field(None, description="URL to image")
    romanian_context: bool = Field(False, description="Include Romanian cultural context")


class RomanianCulturalAnalysisRequest(BaseModel):
    """Request model for Romanian cultural analysis."""
    image_data: Optional[str] = Field(None, description="Base64 encoded image data")
    image_url: Optional[str] = Field(None, description="URL to image")
    context: Optional[str] = Field(None, description="Additional context for analysis")


class MultimodalProcessingRequest(BaseModel):
    """General multimodal processing request."""
    query: str = Field(..., description="Text query or instruction")
    image_data: Optional[str] = Field(None, description="Base64 encoded image data")
    image_url: Optional[str] = Field(None, description="URL to image")
    task_type: str = Field("general", description="Type of multimodal task")
    romanian_context: bool = Field(False, description="Include Romanian cultural context")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Additional parameters")


# API Router for multimodal endpoints
multimodal_router = APIRouter(prefix="/multimodal", tags=["multimodal"])


def prepare_image_input(image_data: Optional[str] = None, image_url: Optional[str] = None, uploaded_file: Optional[UploadFile] = None) -> Optional[Union[str, Image.Image]]:
    """Prepare image input from various sources."""
    try:
        if uploaded_file:
            # Handle uploaded file
            image = Image.open(io.BytesIO(uploaded_file.file.read()))
            return image
        elif image_data:
            # Handle base64 data
            if image_data.startswith('data:image'):
                # Remove data URL prefix
                image_data = image_data.split(',')[1]
            return image_data
        elif image_url:
            # Return URL for processing
            return image_url
        else:
            return None
    except Exception as e:
        logger.error(f"Failed to prepare image input: {e}")
        return None


@multimodal_router.get("/capabilities")
async def get_multimodal_capabilities():
    """Get multimodal expert capabilities."""
    try:
        if not multimodal_expert:
            return {
                "available": False,
                "error": "Multimodal expert not initialized",
                "supported_tasks": [],
                "models": {}
            }
        
        capabilities = multimodal_expert.get_expert_capabilities()
        return {
            "available": True,
            "capabilities": capabilities,
            "status": "operational"
        }
    
    except Exception as e:
        logger.error(f"Failed to get multimodal capabilities: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@multimodal_router.post("/caption")
async def caption_image(request: ImageCaptionRequest):
    """Generate caption for an image using advanced vision-language models."""
    
    if not multimodal_expert:
        raise HTTPException(status_code=503, detail="Multimodal expert not available")
    
    try:
        image_input = prepare_image_input(request.image_data, request.image_url)
        if not image_input:
            raise HTTPException(status_code=400, detail="No valid image provided")
        
        result = multimodal_expert.caption_image(
            image_path=image_input,
            prompt=request.prompt,
            romanian_context=request.romanian_context
        )
        
        return {
            "status": "success",
            "caption": result.get("response", ""),
            "confidence": result.get("confidence", 0.0),
            "processing_time": result.get("processing_time", 0.0),
            "model_used": result.get("model_used", "unknown"),
            "romanian_cultural_insights": result.get("romanian_cultural_insights")
        }
    
    except Exception as e:
        logger.error(f"Image captioning failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@multimodal_router.post("/visual-qa")
async def visual_question_answering(request: VisualQARequest):
    """Answer questions about images using vision-language understanding."""
    
    if not multimodal_expert:
        raise HTTPException(status_code=503, detail="Multimodal expert not available")
    
    try:
        image_input = prepare_image_input(request.image_data, request.image_url)
        if not image_input:
            raise HTTPException(status_code=400, detail="No valid image provided")
        
        result = multimodal_expert.answer_visual_question(
            image_path=image_input,
            question=request.question,
            romanian_context=request.romanian_context
        )
        
        return {
            "status": "success",
            "answer": result.get("response", ""),
            "question": request.question,
            "confidence": result.get("confidence", 0.0),
            "processing_time": result.get("processing_time", 0.0),
            "model_used": result.get("model_used", "unknown"),
            "romanian_cultural_insights": result.get("romanian_cultural_insights")
        }
    
    except Exception as e:
        logger.error(f"Visual QA failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@multimodal_router.post("/image-text-similarity")
async def analyze_image_text_similarity(request: ImageTextMatchingRequest):
    """Analyze similarity between image and text using CLIP."""
    
    if not multimodal_expert:
        raise HTTPException(status_code=503, detail="Multimodal expert not available")
    
    try:
        image_input = prepare_image_input(request.image_data, request.image_url)
        if not image_input:
            raise HTTPException(status_code=400, detail="No valid image provided")
        
        result = multimodal_expert.analyze_image_text_similarity(
            image_path=image_input,
            text=request.text
        )
        
        return {
            "status": "success",
            "similarity_analysis": result.get("response", ""),
            "similarity_score": result.get("cross_modal_alignment", 0.0),
            "confidence": result.get("confidence", 0.0),
            "processing_time": result.get("processing_time", 0.0),
            "model_used": result.get("model_used", "unknown"),
            "text": request.text
        }
    
    except Exception as e:
        logger.error(f"Image-text similarity analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@multimodal_router.post("/object-detection")
async def detect_objects(image_data: Optional[str] = Form(None), 
                        image_url: Optional[str] = Form(None),
                        romanian_context: bool = Form(False),
                        file: Optional[UploadFile] = File(None)):
    """Detect objects in an image."""
    
    if not multimodal_expert:
        raise HTTPException(status_code=503, detail="Multimodal expert not available")
    
    try:
        image_input = prepare_image_input(image_data, image_url, file)
        if not image_input:
            raise HTTPException(status_code=400, detail="No valid image provided")
        
        result = multimodal_expert.detect_objects(
            image_path=image_input,
            romanian_context=romanian_context
        )
        
        return {
            "status": "success",
            "detection_results": result.get("response", ""),
            "detected_objects": result.get("detected_objects", []),
            "confidence": result.get("confidence", 0.0),
            "processing_time": result.get("processing_time", 0.0),
            "model_used": result.get("model_used", "unknown"),
            "romanian_cultural_insights": result.get("romanian_cultural_insights")
        }
    
    except Exception as e:
        logger.error(f"Object detection failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@multimodal_router.post("/scene-understanding")
async def understand_scene(request: SceneAnalysisRequest):
    """Analyze and understand scene content."""
    
    if not multimodal_expert:
        raise HTTPException(status_code=503, detail="Multimodal expert not available")
    
    try:
        image_input = prepare_image_input(request.image_data, request.image_url)
        if not image_input:
            raise HTTPException(status_code=400, detail="No valid image provided")
        
        result = multimodal_expert.understand_scene(
            image_path=image_input,
            romanian_context=request.romanian_context
        )
        
        return {
            "status": "success",
            "scene_analysis": result.get("response", ""),
            "scene_details": result.get("scene_analysis", {}),
            "confidence": result.get("confidence", 0.0),
            "processing_time": result.get("processing_time", 0.0),
            "model_used": result.get("model_used", "unknown"),
            "romanian_cultural_insights": result.get("romanian_cultural_insights")
        }
    
    except Exception as e:
        logger.error(f"Scene understanding failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@multimodal_router.post("/romanian-cultural-analysis")
async def analyze_romanian_cultural_content(request: RomanianCulturalAnalysisRequest):
    """Analyze Romanian cultural elements in an image."""
    
    if not multimodal_expert:
        raise HTTPException(status_code=503, detail="Multimodal expert not available")
    
    try:
        image_input = prepare_image_input(request.image_data, request.image_url)
        if not image_input:
            raise HTTPException(status_code=400, detail="No valid image provided")
        
        result = multimodal_expert.analyze_romanian_cultural_content(
            image_path=image_input,
            context=request.context
        )
        
        return {
            "status": "success",
            "cultural_analysis": result.get("response", ""),
            "cultural_insights": result.get("romanian_cultural_insights", {}),
            "confidence": result.get("confidence", 0.0),
            "processing_time": result.get("processing_time", 0.0),
            "model_used": result.get("model_used", "unknown")
        }
    
    except Exception as e:
        logger.error(f"Romanian cultural analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@multimodal_router.post("/process")
async def process_multimodal_request(request: MultimodalProcessingRequest):
    """General multimodal processing endpoint."""
    
    if not multimodal_expert:
        raise HTTPException(status_code=503, detail="Multimodal expert not available")
    
    try:
        image_input = prepare_image_input(request.image_data, request.image_url)
        
        result = multimodal_expert.process_multimodal_request(
            query=request.query,
            image_path=image_input,
            task_type=request.task_type,
            romanian_context=request.romanian_context,
            **(request.parameters or {})
        )
        
        return {
            "status": "success" if result.get("success", False) else "partial",
            "result": result
        }
    
    except Exception as e:
        logger.error(f"Multimodal processing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@multimodal_router.post("/upload-image")
async def upload_and_analyze_image(
    task_type: str = Form("caption"),
    query: Optional[str] = Form("Analyze this image"),
    romanian_context: bool = Form(False),
    file: UploadFile = File(...)
):
    """Upload an image and perform multimodal analysis."""
    
    if not multimodal_expert:
        raise HTTPException(status_code=503, detail="Multimodal expert not available")
    
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image = prepare_image_input(uploaded_file=file)
        if not image:
            raise HTTPException(status_code=400, detail="Failed to process uploaded image")
        
        result = multimodal_expert.process_multimodal_request(
            query=query,
            image_path=image,
            task_type=task_type,
            romanian_context=romanian_context
        )
        
        return {
            "status": "success" if result.get("success", False) else "partial",
            "filename": file.filename,
            "file_size": file.size,
            "content_type": file.content_type,
            "analysis_result": result
        }
    
    except Exception as e:
        logger.error(f"Image upload and analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@multimodal_router.get("/models/status")
async def get_model_status():
    """Get status of multimodal models."""
    
    try:
        if not multimodal_expert:
            return {
                "multimodal_expert": "not_initialized",
                "available_models": {},
                "ready": False
            }
        
        capabilities = multimodal_expert.get_expert_capabilities()
        
        return {
            "multimodal_expert": "initialized",
            "available_models": capabilities.get("model_capabilities", {}).get("available_models", {}),
            "ready": capabilities.get("expert_ready", False),
            "processed_requests": capabilities.get("processed_requests", 0),
            "success_rate": capabilities.get("success_rate", 0.0),
            "supported_tasks": capabilities.get("supported_tasks", [])
        }
    
    except Exception as e:
        logger.error(f"Failed to get model status: {e}")
        raise HTTPException(status_code=500, detail=str(e))