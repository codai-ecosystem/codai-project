"""
Synthetic Data Generation Integration for RomAI AGI Model Server
===============================================================

FastAPI integration service providing REST endpoints for synthetic data generation
capabilities following Microsoft Azure ML best practices.

Endpoints:
- /synthetic/health - Service health check
- /synthetic/generate - Generate synthetic dataset
- /synthetic/config - Configure generation parameters
- /synthetic/export - Export generated datasets
- /synthetic/statistics - Get generation statistics
- /synthetic/domains - List available data domains
"""

import logging
import asyncio
from typing import Dict, List, Any, Optional
from fastapi import HTTPException
from pydantic import BaseModel, Field
from datetime import datetime
import json

logger = logging.getLogger(__name__)

# Import the main synthetic data generation system
try:
    from .synthetic_data_generation import (
        SyntheticDataGenerator,
        SyntheticDataConfig,
        DataDomain,
        QualityLevel,
        SyntheticDataSample
    )
    SYNTHETIC_DATA_AVAILABLE = True
    logger.info("✅ Synthetic Data Generation system imported successfully")
except ImportError as e:
    logger.warning(f"⚠️ Synthetic Data Generation system not available: {str(e)}")
    SYNTHETIC_DATA_AVAILABLE = False
    
    # Mock classes for fallback
    class DataDomain:
        ROMANIAN_CULTURE = "romanian_culture"
        TECHNICAL = "technical"
        CONVERSATIONAL = "conversational"
        REASONING = "reasoning"
        CODE_GENERATION = "code_generation"
        MATHEMATICAL = "mathematical"
        CREATIVE_WRITING = "creative_writing"
        SCIENTIFIC = "scientific"
    
    class QualityLevel:
        HIGH = "high"
        MEDIUM = "medium" 
        BASIC = "basic"

class SyntheticDataGenerationRequest(BaseModel):
    """Request model for synthetic data generation"""
    domain: str = Field(..., description="Data domain (romanian_culture, technical, conversational, reasoning, code_generation, mathematical, creative_writing, scientific)")
    num_samples: int = Field(100, description="Number of samples to generate", ge=1, le=10000)
    quality_level: str = Field("high", description="Quality level (high, medium, basic)")
    romanian_context_weight: float = Field(0.7, description="Weight for Romanian cultural context", ge=0.0, le=1.0)
    diversity_threshold: float = Field(0.85, description="Minimum diversity threshold", ge=0.0, le=1.0)
    batch_size: int = Field(50, description="Batch size for generation", ge=1, le=200)
    validation_enabled: bool = Field(True, description="Enable quality validation")
    include_metadata: bool = Field(True, description="Include generation metadata")
    export_format: str = Field("json", description="Export format (json)")

class SyntheticDataConfigRequest(BaseModel):
    """Request model for configuration"""
    default_quality: str = Field("high", description="Default quality level")
    default_romanian_weight: float = Field(0.7, description="Default Romanian context weight")
    enable_validation: bool = Field(True, description="Enable validation by default")
    max_batch_size: int = Field(100, description="Maximum allowed batch size")

class SyntheticDataResponse(BaseModel):
    """Response model for synthetic data generation"""
    success: bool
    dataset_id: str
    samples_generated: int
    generation_time_ms: float
    quality_metrics: Dict[str, Any]
    export_data: Optional[str] = None
    message: str

class SyntheticDataHealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    synthetic_data_available: bool
    supported_domains: List[str]
    max_samples_per_request: int
    version: str
    timestamp: datetime

class SyntheticDataStatisticsResponse(BaseModel):
    """Statistics response"""
    total_generated: int
    success_rate: float
    error_rate: float
    average_quality: float
    domain_distribution: Dict[str, int]
    generation_history: List[Dict[str, Any]]

class SyntheticDataService:
    """Synthetic data generation service"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        if SYNTHETIC_DATA_AVAILABLE:
            self.generator = SyntheticDataGenerator()
            self.logger.info("✅ Synthetic data generator initialized")
        else:
            self.generator = None
            self.logger.warning("⚠️ Running in mock mode - synthetic data generation not available")
        
        # Service configuration
        self.config = {
            "default_quality": "high",
            "default_romanian_weight": 0.7,
            "enable_validation": True,
            "max_batch_size": 200,
            "max_samples_per_request": 10000
        }
        
        # Generation history and statistics
        self.generation_history = []
        self.total_requests = 0
        self.successful_requests = 0
    
    async def get_service_health(self) -> SyntheticDataHealthResponse:
        """Get service health status"""
        
        supported_domains = [
            "romanian_culture", "technical", "conversational", "reasoning",
            "code_generation", "mathematical", "creative_writing", "scientific"
        ]
        
        return SyntheticDataHealthResponse(
            status="healthy" if SYNTHETIC_DATA_AVAILABLE else "degraded",
            service="RomAI Synthetic Data Generation",
            synthetic_data_available=SYNTHETIC_DATA_AVAILABLE,
            supported_domains=supported_domains,
            max_samples_per_request=self.config["max_samples_per_request"],
            version="1.0.0",
            timestamp=datetime.utcnow()
        )
    
    async def generate_synthetic_data(self, request: SyntheticDataGenerationRequest) -> SyntheticDataResponse:
        """Generate synthetic dataset"""
        
        start_time = datetime.utcnow()
        dataset_id = f"dataset_{start_time.strftime('%Y%m%d_%H%M%S')}"
        
        try:
            self.total_requests += 1
            
            if not SYNTHETIC_DATA_AVAILABLE:
                return await self._generate_mock_dataset(request, dataset_id, start_time)
            
            # Validate domain
            domain_mapping = {
                "romanian_culture": DataDomain.ROMANIAN_CULTURE,
                "technical": DataDomain.TECHNICAL,
                "conversational": DataDomain.CONVERSATIONAL,
                "reasoning": DataDomain.REASONING,
                "code_generation": DataDomain.CODE_GENERATION,
                "mathematical": DataDomain.MATHEMATICAL,
                "creative_writing": DataDomain.CREATIVE_WRITING,
                "scientific": DataDomain.SCIENTIFIC
            }
            
            if request.domain not in domain_mapping:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid domain: {request.domain}. Supported: {list(domain_mapping.keys())}"
                )
            
            # Validate quality level
            quality_mapping = {
                "high": QualityLevel.HIGH,
                "medium": QualityLevel.MEDIUM,
                "basic": QualityLevel.BASIC
            }
            
            if request.quality_level not in quality_mapping:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid quality level: {request.quality_level}. Supported: {list(quality_mapping.keys())}"
                )
            
            # Validate sample count
            if request.num_samples > self.config["max_samples_per_request"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"Too many samples requested: {request.num_samples}. Maximum: {self.config['max_samples_per_request']}"
                )
            
            # Create configuration
            config = SyntheticDataConfig(
                domain=domain_mapping[request.domain],
                num_samples=request.num_samples,
                quality_level=quality_mapping[request.quality_level],
                romanian_context_weight=request.romanian_context_weight,
                diversity_threshold=request.diversity_threshold,
                batch_size=min(request.batch_size, self.config["max_batch_size"]),
                validation_enabled=request.validation_enabled,
                include_metadata=request.include_metadata
            )
            
            # Generate dataset
            self.logger.info(f"🔄 Generating synthetic dataset: {request.domain}, {request.num_samples} samples")
            
            dataset = await self.generator.generate_synthetic_dataset(config)
            
            generation_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            # Calculate quality metrics
            quality_metrics = self._calculate_quality_metrics(dataset)
            
            # Export if requested
            export_data = None
            if request.export_format == "json":
                export_data = self.generator.export_dataset(dataset, "json")
            
            # Record successful generation
            self.successful_requests += 1
            self._record_generation_history(request, dataset_id, len(dataset), quality_metrics)
            
            self.logger.info(f"✅ Synthetic dataset generated: {len(dataset)} samples in {generation_time:.2f}ms")
            
            return SyntheticDataResponse(
                success=True,
                dataset_id=dataset_id,
                samples_generated=len(dataset),
                generation_time_ms=generation_time,
                quality_metrics=quality_metrics,
                export_data=export_data,
                message=f"Successfully generated {len(dataset)} synthetic data samples for {request.domain}"
            )
            
        except Exception as e:
            self.logger.error(f"❌ Synthetic data generation failed: {str(e)}")
            generation_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            return SyntheticDataResponse(
                success=False,
                dataset_id=dataset_id,
                samples_generated=0,
                generation_time_ms=generation_time,
                quality_metrics={},
                message=f"Synthetic data generation failed: {str(e)}"
            )
    
    async def _generate_mock_dataset(
        self, 
        request: SyntheticDataGenerationRequest, 
        dataset_id: str, 
        start_time: datetime
    ) -> SyntheticDataResponse:
        """Generate mock dataset when real system is not available"""
        
        self.logger.info(f"🔄 Generating mock synthetic dataset: {request.domain}")
        
        # Simulate processing time
        await asyncio.sleep(0.1 * min(request.num_samples / 10, 5))
        
        generation_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        # Mock quality metrics
        mock_quality_metrics = {
            "total_samples": min(request.num_samples, 100),  # Limit mock generation
            "avg_quality": 0.85,
            "min_quality": 0.70,
            "max_quality": 0.95,
            "avg_diversity": 0.75,
            "domain_distribution": {request.domain: min(request.num_samples, 100)},
            "romanian_content_ratio": request.romanian_context_weight
        }
        
        # Mock export data
        mock_export = None
        if request.export_format == "json":
            mock_samples = []
            for i in range(min(request.num_samples, 10)):  # Only show first 10 in mock
                mock_samples.append({
                    "id": f"mock_{i+1}",
                    "domain": request.domain,
                    "prompt": f"Mock prompt for {request.domain} sample {i+1}",
                    "response": f"Mock response generated for {request.domain} with quality {request.quality_level}",
                    "romanian_content": f"Mock Romanian content" if request.romanian_context_weight > 0.5 else None,
                    "quality_score": 0.85,
                    "diversity_score": 0.75,
                    "created_at": datetime.utcnow().isoformat()
                })
            
            mock_export = json.dumps(mock_samples, ensure_ascii=False, indent=2)
        
        # Record mock generation
        self.successful_requests += 1
        self._record_generation_history(request, dataset_id, min(request.num_samples, 100), mock_quality_metrics)
        
        self.logger.info(f"✅ Mock synthetic dataset generated: {min(request.num_samples, 100)} samples")
        
        return SyntheticDataResponse(
            success=True,
            dataset_id=dataset_id,
            samples_generated=min(request.num_samples, 100),
            generation_time_ms=generation_time,
            quality_metrics=mock_quality_metrics,
            export_data=mock_export,
            message=f"Mock synthetic data generated for {request.domain} (real system unavailable)"
        )
    
    def _calculate_quality_metrics(self, dataset: List) -> Dict[str, Any]:
        """Calculate quality metrics for generated dataset"""
        
        if not dataset:
            return {"error": "Empty dataset"}
        
        if SYNTHETIC_DATA_AVAILABLE and hasattr(dataset[0], 'quality_score'):
            # Real dataset with SyntheticDataSample objects
            quality_scores = [sample.quality_score for sample in dataset]
            diversity_scores = [sample.diversity_score for sample in dataset]
            
            domain_distribution = {}
            for sample in dataset:
                domain = sample.domain.value
                domain_distribution[domain] = domain_distribution.get(domain, 0) + 1
            
            return {
                "total_samples": len(dataset),
                "avg_quality": sum(quality_scores) / len(quality_scores),
                "min_quality": min(quality_scores),
                "max_quality": max(quality_scores),
                "avg_diversity": sum(diversity_scores) / len(diversity_scores),
                "domain_distribution": domain_distribution,
                "romanian_content_ratio": len([s for s in dataset if s.romanian_content]) / len(dataset)
            }
        else:
            # Mock dataset
            return {
                "total_samples": len(dataset),
                "avg_quality": 0.85,
                "mock_data": True
            }
    
    def _record_generation_history(
        self, 
        request: SyntheticDataGenerationRequest, 
        dataset_id: str, 
        samples_generated: int, 
        quality_metrics: Dict[str, Any]
    ):
        """Record generation in history"""
        
        history_entry = {
            "dataset_id": dataset_id,
            "timestamp": datetime.utcnow().isoformat(),
            "domain": request.domain,
            "num_samples_requested": request.num_samples,
            "num_samples_generated": samples_generated,
            "quality_level": request.quality_level,
            "romanian_context_weight": request.romanian_context_weight,
            "quality_metrics": quality_metrics
        }
        
        self.generation_history.append(history_entry)
        
        # Keep only last 100 entries
        if len(self.generation_history) > 100:
            self.generation_history = self.generation_history[-100:]
    
    async def configure_service(self, request: SyntheticDataConfigRequest) -> Dict[str, Any]:
        """Configure service parameters"""
        
        self.config.update({
            "default_quality": request.default_quality,
            "default_romanian_weight": request.default_romanian_weight,
            "enable_validation": request.enable_validation,
            "max_batch_size": min(request.max_batch_size, 500)  # Safety limit
        })
        
        self.logger.info(f"📝 Service configuration updated: {self.config}")
        
        return {
            "success": True,
            "message": "Configuration updated successfully",
            "config": self.config
        }
    
    async def get_service_statistics(self) -> SyntheticDataStatisticsResponse:
        """Get service usage statistics"""
        
        success_rate = (
            self.successful_requests / self.total_requests
            if self.total_requests > 0 else 0.0
        )
        
        error_rate = 1.0 - success_rate
        
        # Calculate average quality from history
        avg_quality = 0.0
        domain_distribution = {}
        
        for entry in self.generation_history:
            if "quality_metrics" in entry and "avg_quality" in entry["quality_metrics"]:
                avg_quality += entry["quality_metrics"]["avg_quality"]
            
            domain = entry["domain"]
            samples = entry["num_samples_generated"]
            domain_distribution[domain] = domain_distribution.get(domain, 0) + samples
        
        if self.generation_history:
            avg_quality /= len(self.generation_history)
        
        return SyntheticDataStatisticsResponse(
            total_generated=sum(entry["num_samples_generated"] for entry in self.generation_history),
            success_rate=success_rate,
            error_rate=error_rate,
            average_quality=avg_quality,
            domain_distribution=domain_distribution,
            generation_history=self.generation_history[-10:]  # Last 10 entries
        )
    
    async def list_supported_domains(self) -> Dict[str, Any]:
        """List supported data domains with descriptions"""
        
        domains = {
            "romanian_culture": {
                "description": "Romanian cultural scenarios, traditions, and values",
                "examples": ["Traditional celebrations", "Folk stories", "Regional customs"],
                "recommended_romanian_weight": 0.9
            },
            "technical": {
                "description": "Technical documentation and explanations",
                "examples": ["Software architecture", "API documentation", "Best practices"],
                "recommended_romanian_weight": 0.3
            },
            "conversational": {
                "description": "Natural dialogue and conversation samples",
                "examples": ["Customer service", "Friendly chat", "Professional discussion"],
                "recommended_romanian_weight": 0.7
            },
            "reasoning": {
                "description": "Logical reasoning and problem-solving",
                "examples": ["Logic puzzles", "Causal reasoning", "Mathematical proofs"],
                "recommended_romanian_weight": 0.5
            },
            "code_generation": {
                "description": "Programming code and software development",
                "examples": ["Algorithm implementation", "API endpoints", "Testing code"],
                "recommended_romanian_weight": 0.2
            },
            "mathematical": {
                "description": "Mathematical problems and solutions",
                "examples": ["Algebra problems", "Geometry calculations", "Statistics"],
                "recommended_romanian_weight": 0.4
            },
            "creative_writing": {
                "description": "Creative content and storytelling",
                "examples": ["Short stories", "Poetry", "Character descriptions"],
                "recommended_romanian_weight": 0.8
            },
            "scientific": {
                "description": "Scientific explanations and research",
                "examples": ["Physics concepts", "Biology processes", "Chemistry reactions"],
                "recommended_romanian_weight": 0.4
            }
        }
        
        return {
            "supported_domains": domains,
            "total_domains": len(domains),
            "synthetic_data_available": SYNTHETIC_DATA_AVAILABLE
        }

# Create global service instance
synthetic_data_service = SyntheticDataService()

async def get_synthetic_data_service() -> SyntheticDataService:
    """Get synthetic data service instance"""
    return synthetic_data_service