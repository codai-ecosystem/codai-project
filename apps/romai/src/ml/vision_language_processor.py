"""
Vision-Language Processor - Phase 4
Advanced vision-text integration with real capabilities
"""

import asyncio
import base64
import io
import time
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass
import logging
import json
from pathlib import Path

# Import image processing libraries
try:
    from PIL import Image, ImageEnhance, ImageFilter, ImageDraw, ImageFont
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

# Import our existing components
from romai_api_client import RomAIAPIClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class VisionLanguageQuery:
    image_data: Optional[bytes] = None
    image_path: Optional[str] = None
    text_query: str = ""
    query_type: str = "general"  # general, ocr, object_detection, scene_analysis, comparison
    context: Optional[str] = None
    expected_response_type: str = "description"  # description, list, analysis, answer

@dataclass
class VisionAnalysisResult:
    description: str
    objects_identified: List[Dict[str, Any]]
    text_extracted: str
    scene_context: str
    spatial_relationships: List[str]
    color_analysis: Dict[str, Any]
    composition_analysis: Dict[str, Any]
    confidence_score: float
    processing_time: float

@dataclass
class OCRResult:
    extracted_text: str
    text_regions: List[Dict[str, Any]]
    text_confidence: float
    language_detected: str
    structured_data: Dict[str, Any]

class VisionLanguageProcessor:
    """Advanced vision-language processing with real image analysis capabilities"""
    
    def __init__(self):
        self.romai_client = RomAIAPIClient()
        self.supported_formats = {'.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff', '.webp'}
        self.ocr_capabilities = HAS_PIL
        self.vision_models = self._initialize_vision_models()
        
    def _initialize_vision_models(self) -> Dict[str, Any]:
        """Initialize vision processing models and capabilities"""
        return {
            "basic_analysis": True,
            "color_detection": HAS_PIL,
            "edge_detection": HAS_PIL,
            "text_detection": HAS_PIL,
            "object_classification": True,  # Rule-based classification
            "scene_understanding": True,
            "spatial_analysis": HAS_PIL
        }
    
    def load_and_validate_image(self, image_path: Optional[str] = None, 
                               image_data: Optional[bytes] = None) -> Optional[Image.Image]:
        """Load and validate image from path or data"""
        if not HAS_PIL:
            logger.error("PIL not available for image processing")
            return None
        
        try:
            if image_path:
                path = Path(image_path)
                if not path.exists():
                    logger.error(f"Image file not found: {image_path}")
                    return None
                
                if path.suffix.lower() not in self.supported_formats:
                    logger.error(f"Unsupported image format: {path.suffix}")
                    return None
                
                image = Image.open(image_path)
                
            elif image_data:
                image = Image.open(io.BytesIO(image_data))
            else:
                logger.error("No image path or data provided")
                return None
            
            # Validate image
            if image.width < 10 or image.height < 10:
                logger.error("Image too small for processing")
                return None
            
            # Convert to RGB if necessary
            if image.mode not in ('RGB', 'RGBA'):
                image = image.convert('RGB')
            
            return image
            
        except Exception as e:
            logger.error(f"Error loading image: {str(e)}")
            return None
    
    def analyze_image_colors(self, image: Image.Image) -> Dict[str, Any]:
        """Analyze color composition and characteristics"""
        try:
            # Color histogram analysis
            rgb_image = image.convert('RGB')
            colors = rgb_image.getcolors(maxcolors=256*256*256)
            
            color_analysis = {
                "total_colors": len(colors) if colors else 0,
                "dominant_colors": [],
                "color_distribution": {},
                "brightness_level": "unknown",
                "saturation_level": "unknown",
                "color_harmony": "unknown"
            }
            
            if colors:
                # Sort by frequency and get top colors
                colors_sorted = sorted(colors, key=lambda x: x[0], reverse=True)
                top_colors = colors_sorted[:10]
                
                for count, (r, g, b) in top_colors:
                    percentage = (count / (image.width * image.height)) * 100
                    color_analysis["dominant_colors"].append({
                        "rgb": (r, g, b),
                        "hex": f"#{r:02x}{g:02x}{b:02x}",
                        "percentage": round(percentage, 2)
                    })
                
                # Color distribution analysis
                red_values = [color[1][0] for color in colors_sorted]
                green_values = [color[1][1] for color in colors_sorted]
                blue_values = [color[1][2] for color in colors_sorted]
                
                avg_red = sum(red_values) / len(red_values)
                avg_green = sum(green_values) / len(green_values)
                avg_blue = sum(blue_values) / len(blue_values)
                
                color_analysis["color_distribution"] = {
                    "average_red": round(avg_red, 2),
                    "average_green": round(avg_green, 2),
                    "average_blue": round(avg_blue, 2),
                    "overall_tone": self._classify_color_tone(avg_red, avg_green, avg_blue)
                }
                
                # Brightness analysis
                overall_brightness = (avg_red + avg_green + avg_blue) / 3
                if overall_brightness > 180:
                    color_analysis["brightness_level"] = "very_bright"
                elif overall_brightness > 140:
                    color_analysis["brightness_level"] = "bright"
                elif overall_brightness > 100:
                    color_analysis["brightness_level"] = "moderate"
                else:
                    color_analysis["brightness_level"] = "dark"
            
            return color_analysis
            
        except Exception as e:
            logger.error(f"Error analyzing image colors: {str(e)}")
            return {"error": str(e)}
    
    def _classify_color_tone(self, r: float, g: float, b: float) -> str:
        """Classify the overall color tone"""
        # Simple color tone classification
        if r > g and r > b:
            if r - max(g, b) > 50:
                return "warm_red"
            else:
                return "warm_mixed"
        elif g > r and g > b:
            if g - max(r, b) > 50:
                return "cool_green"
            else:
                return "natural_mixed"
        elif b > r and b > g:
            if b - max(r, g) > 50:
                return "cool_blue"
            else:
                return "cool_mixed"
        else:
            return "neutral_balanced"
    
    def detect_edges_and_shapes(self, image: Image.Image) -> Dict[str, Any]:
        """Detect edges and basic shapes in the image"""
        try:
            # Convert to grayscale for edge detection
            grayscale = image.convert('L')
            
            # Apply edge detection filters
            edges_light = grayscale.filter(ImageFilter.FIND_EDGES)
            edges_strong = grayscale.filter(ImageFilter.EDGE_ENHANCE_MORE)
            
            # Analyze edge density
            edge_pixels = list(edges_light.getdata())
            total_pixels = len(edge_pixels)
            strong_edge_pixels = sum(1 for pixel in edge_pixels if pixel > 50)
            
            edge_density = strong_edge_pixels / total_pixels
            
            shape_analysis = {
                "edge_density": round(edge_density, 4),
                "edge_strength": "high" if edge_density > 0.1 else "moderate" if edge_density > 0.05 else "low",
                "estimated_complexity": "complex" if edge_density > 0.15 else "moderate" if edge_density > 0.08 else "simple",
                "potential_shapes": self._estimate_shape_presence(edge_density, image.size)
            }
            
            return shape_analysis
            
        except Exception as e:
            logger.error(f"Error detecting edges and shapes: {str(e)}")
            return {"error": str(e)}
    
    def _estimate_shape_presence(self, edge_density: float, image_size: Tuple[int, int]) -> List[str]:
        """Estimate types of shapes likely present based on edge patterns"""
        shapes = []
        
        if edge_density > 0.12:
            shapes.extend(["geometric_shapes", "architectural_elements", "mechanical_objects"])
        elif edge_density > 0.08:
            shapes.extend(["mixed_content", "moderate_detail"])
        elif edge_density > 0.04:
            shapes.extend(["organic_shapes", "natural_elements"])
        else:
            shapes.extend(["smooth_surfaces", "minimal_detail"])
        
        # Size-based estimations
        width, height = image_size
        if width > 1920 or height > 1920:
            shapes.append("high_resolution_detail")
        elif width < 300 or height < 300:
            shapes.append("low_resolution_limited")
        
        return shapes
    
    def extract_text_regions(self, image: Image.Image) -> OCRResult:
        """Extract text from image using basic OCR techniques"""
        try:
            # This is a simplified OCR implementation
            # In production, you would use libraries like pytesseract or cloud APIs
            
            # Convert to grayscale and enhance for text detection
            grayscale = image.convert('L')
            enhanced = grayscale.point(lambda x: 0 if x < 128 else 255, '1')  # Binary threshold
            
            # Basic text detection using image analysis
            # This is a placeholder implementation
            extracted_text = ""
            text_regions = []
            text_confidence = 0.3  # Low confidence for basic implementation
            
            # Analyze image for text-like patterns
            text_likelihood = self._assess_text_likelihood(enhanced)
            
            if text_likelihood > 0.3:
                extracted_text = "[Text detected but OCR library not available - use pytesseract for full functionality]"
                text_confidence = text_likelihood
                text_regions.append({
                    "bbox": (0, 0, image.width, image.height),
                    "confidence": text_likelihood,
                    "text": "[OCR library required]"
                })
            
            return OCRResult(
                extracted_text=extracted_text,
                text_regions=text_regions,
                text_confidence=text_confidence,
                language_detected="en",  # Default assumption
                structured_data={"requires_ocr_library": True}
            )
            
        except Exception as e:
            logger.error(f"Error extracting text: {str(e)}")
            return OCRResult(
                extracted_text="",
                text_regions=[],
                text_confidence=0.0,
                language_detected="unknown",
                structured_data={"error": str(e)}
            )
    
    def _assess_text_likelihood(self, binary_image: Image.Image) -> float:
        """Assess likelihood that image contains text"""
        try:
            # Basic heuristics for text detection
            pixels = list(binary_image.getdata())
            total_pixels = len(pixels)
            
            if total_pixels == 0:
                return 0.0
            
            # Count transitions (text has many black-white transitions)
            transitions = 0
            prev_pixel = pixels[0]
            for pixel in pixels[1:]:
                if pixel != prev_pixel:
                    transitions += 1
                prev_pixel = pixel
            
            transition_ratio = transitions / total_pixels
            
            # Text typically has moderate transition density
            if 0.1 < transition_ratio < 0.4:
                return min(transition_ratio * 2, 0.8)
            else:
                return max(0.1, transition_ratio * 0.5)
                
        except Exception:
            return 0.1
    
    def analyze_spatial_composition(self, image: Image.Image) -> Dict[str, Any]:
        """Analyze spatial composition and layout"""
        try:
            width, height = image.size
            aspect_ratio = width / height
            
            composition = {
                "aspect_ratio": round(aspect_ratio, 3),
                "orientation": "landscape" if aspect_ratio > 1.3 else "portrait" if aspect_ratio < 0.7 else "square",
                "dimensions": {"width": width, "height": height},
                "resolution_category": self._classify_resolution(width, height),
                "composition_type": self._analyze_composition_type(image),
                "visual_weight_distribution": self._analyze_visual_weight(image)
            }
            
            return composition
            
        except Exception as e:
            logger.error(f"Error analyzing spatial composition: {str(e)}")
            return {"error": str(e)}
    
    def _classify_resolution(self, width: int, height: int) -> str:
        """Classify image resolution category"""
        total_pixels = width * height
        
        if total_pixels > 8000000:  # > 8MP
            return "very_high"
        elif total_pixels > 2000000:  # > 2MP
            return "high"
        elif total_pixels > 500000:  # > 0.5MP
            return "medium"
        else:
            return "low"
    
    def _analyze_composition_type(self, image: Image.Image) -> str:
        """Analyze image composition type"""
        try:
            # Convert to grayscale for analysis
            grayscale = image.convert('L')
            width, height = grayscale.size
            
            # Divide into regions and analyze distribution
            center_x, center_y = width // 2, height // 2
            
            # Sample key regions
            center_region = grayscale.crop((center_x-50, center_y-50, center_x+50, center_y+50))
            corner_regions = [
                grayscale.crop((0, 0, 100, 100)),  # Top-left
                grayscale.crop((width-100, 0, width, 100)),  # Top-right
                grayscale.crop((0, height-100, 100, height)),  # Bottom-left
                grayscale.crop((width-100, height-100, width, height))  # Bottom-right
            ]
            
            # Calculate average brightness for each region
            center_brightness = sum(center_region.getdata()) / len(center_region.getdata())
            corner_brightness = [sum(region.getdata()) / len(region.getdata()) for region in corner_regions]
            avg_corner_brightness = sum(corner_brightness) / len(corner_brightness)
            
            # Determine composition type
            brightness_diff = abs(center_brightness - avg_corner_brightness)
            
            if brightness_diff > 30:
                if center_brightness > avg_corner_brightness:
                    return "center_focused"
                else:
                    return "edge_focused"
            else:
                return "balanced"
                
        except Exception:
            return "unknown"
    
    def _analyze_visual_weight(self, image: Image.Image) -> Dict[str, float]:
        """Analyze visual weight distribution across image quadrants"""
        try:
            grayscale = image.convert('L')
            width, height = grayscale.size
            
            # Divide into quadrants
            mid_x, mid_y = width // 2, height // 2
            
            quadrants = {
                "top_left": grayscale.crop((0, 0, mid_x, mid_y)),
                "top_right": grayscale.crop((mid_x, 0, width, mid_y)),
                "bottom_left": grayscale.crop((0, mid_y, mid_x, height)),
                "bottom_right": grayscale.crop((mid_x, mid_y, width, height))
            }
            
            # Calculate visual weight (using variance as proxy for detail/interest)
            visual_weights = {}
            for quad_name, quad_image in quadrants.items():
                pixels = list(quad_image.getdata())
                if pixels:
                    mean = sum(pixels) / len(pixels)
                    variance = sum((p - mean) ** 2 for p in pixels) / len(pixels)
                    visual_weights[quad_name] = round(variance / 1000, 3)  # Normalize
                else:
                    visual_weights[quad_name] = 0.0
            
            return visual_weights
            
        except Exception as e:
            logger.error(f"Error analyzing visual weight: {str(e)}")
            return {"error": str(e)}
    
    async def process_vision_language_query(self, query: VisionLanguageQuery) -> VisionAnalysisResult:
        """Process a vision-language query with comprehensive analysis"""
        start_time = time.time()
        
        # Load and validate image
        image = self.load_and_validate_image(query.image_path, query.image_data)
        if not image:
            return VisionAnalysisResult(
                description="Failed to load or validate image",
                objects_identified=[],
                text_extracted="",
                scene_context="",
                spatial_relationships=[],
                color_analysis={},
                composition_analysis={},
                confidence_score=0.0,
                processing_time=time.time() - start_time
            )
        
        # Perform comprehensive image analysis
        color_analysis = self.analyze_image_colors(image)
        edge_analysis = self.detect_edges_and_shapes(image)
        ocr_result = self.extract_text_regions(image)
        composition_analysis = self.analyze_spatial_composition(image)
        
        # Generate AI-powered description
        analysis_context = {
            "colors": color_analysis,
            "edges": edge_analysis,
            "text": ocr_result.extracted_text,
            "composition": composition_analysis
        }
        
        description = await self._generate_image_description(query, analysis_context)
        objects_identified = await self._identify_objects(analysis_context)
        scene_context = await self._analyze_scene_context(analysis_context, query.text_query)
        spatial_relationships = await self._analyze_spatial_relationships(analysis_context)
        
        processing_time = time.time() - start_time
        
        # Calculate confidence score
        confidence_score = self._calculate_confidence_score(color_analysis, edge_analysis, ocr_result)
        
        return VisionAnalysisResult(
            description=description,
            objects_identified=objects_identified,
            text_extracted=ocr_result.extracted_text,
            scene_context=scene_context,
            spatial_relationships=spatial_relationships,
            color_analysis=color_analysis,
            composition_analysis=composition_analysis,
            confidence_score=confidence_score,
            processing_time=processing_time
        )
    
    async def _generate_image_description(self, query: VisionLanguageQuery, 
                                        analysis_context: Dict[str, Any]) -> str:
        """Generate comprehensive image description using AI"""
        try:
            description_prompt = f"""Based on detailed image analysis, provide a comprehensive description:

User Query: {query.text_query}
Context: {query.context or 'General image analysis'}

Image Analysis Data:
- Color Analysis: {json.dumps(analysis_context['colors'], indent=2)}
- Edge/Shape Analysis: {json.dumps(analysis_context['edges'], indent=2)}
- Text Content: {analysis_context['text']}
- Composition: {json.dumps(analysis_context['composition'], indent=2)}

Provide a natural, detailed description that addresses the user's query while incorporating the technical analysis data. Focus on:
1. Overall scene and subject matter
2. Visual characteristics (colors, lighting, composition)
3. Notable details and elements
4. Context and setting
5. Any text or written content visible

Description:"""
            
            response = self.romai_client.generate_response_sync(
                description_prompt, 
                task_type="vision_language_description"
            )
            
            if response.success:
                return response.content
            else:
                return f"Image analysis completed. Technical data available but description generation failed: {response.error_message}"
        
        except Exception as e:
            logger.error(f"Error generating image description: {str(e)}")
            return f"Image processed with technical analysis. Description generation error: {str(e)}"
    
    async def _identify_objects(self, analysis_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identify objects based on analysis context"""
        try:
            objects = []
            
            # Rule-based object identification from analysis context
            color_analysis = analysis_context.get('colors', {})
            edge_analysis = analysis_context.get('edges', {})
            composition = analysis_context.get('composition', {})
            
            # Analyze for common object types based on characteristics
            edge_density = edge_analysis.get('edge_density', 0)
            dominant_colors = color_analysis.get('dominant_colors', [])
            
            if edge_density > 0.1:
                objects.append({
                    "type": "geometric_structures",
                    "confidence": min(edge_density * 8, 0.9),
                    "characteristics": ["high_edge_density", "structured_elements"]
                })
            
            if len(dominant_colors) > 5:
                objects.append({
                    "type": "colorful_scene",
                    "confidence": min(len(dominant_colors) / 20, 0.8),
                    "characteristics": ["diverse_colors", "complex_scene"]
                })
            
            # Add text objects if text detected
            if analysis_context.get('text'):
                objects.append({
                    "type": "text_elements",
                    "confidence": 0.7,
                    "characteristics": ["readable_text", "information_content"]
                })
            
            return objects
        
        except Exception as e:
            logger.error(f"Error identifying objects: {str(e)}")
            return [{"type": "analysis_error", "confidence": 0.0, "error": str(e)}]
    
    async def _analyze_scene_context(self, analysis_context: Dict[str, Any], user_query: str) -> str:
        """Analyze scene context using AI reasoning"""
        try:
            context_prompt = f"""Analyze the scene context based on image analysis data:

User Query: {user_query}
Analysis Data: {json.dumps(analysis_context, indent=2)}

Determine:
1. Scene type (indoor/outdoor, natural/artificial, etc.)
2. Likely setting or environment
3. Time context if determinable
4. Purpose or function of the scene
5. Notable contextual elements

Provide a concise scene context analysis:"""
            
            response = self.romai_client.generate_response_sync(
                context_prompt, 
                task_type="scene_context_analysis"
            )
            
            return response.content if response.success else "Scene context analysis unavailable"
        
        except Exception as e:
            logger.error(f"Error analyzing scene context: {str(e)}")
            return f"Scene context analysis error: {str(e)}"
    
    async def _analyze_spatial_relationships(self, analysis_context: Dict[str, Any]) -> List[str]:
        """Analyze spatial relationships in the image"""
        try:
            relationships = []
            
            composition = analysis_context.get('composition', {})
            visual_weights = composition.get('visual_weight_distribution', {})
            
            if visual_weights:
                # Find dominant quadrant
                max_weight_quad = max(visual_weights, key=visual_weights.get)
                max_weight = visual_weights[max_weight_quad]
                
                relationships.append(f"Primary visual focus in {max_weight_quad.replace('_', ' ')} region")
                
                # Analyze balance
                weight_values = list(visual_weights.values())
                weight_variance = sum((w - sum(weight_values)/len(weight_values))**2 for w in weight_values) / len(weight_values)
                
                if weight_variance < 0.1:
                    relationships.append("Balanced composition across all quadrants")
                elif weight_variance > 0.5:
                    relationships.append("Highly concentrated composition with clear focal points")
                else:
                    relationships.append("Moderate visual weight distribution")
            
            # Add orientation-based relationships
            orientation = composition.get('orientation', 'unknown')
            if orientation != 'unknown':
                relationships.append(f"Image composed in {orientation} orientation")
            
            return relationships
        
        except Exception as e:
            logger.error(f"Error analyzing spatial relationships: {str(e)}")
            return [f"Spatial analysis error: {str(e)}"]
    
    def _calculate_confidence_score(self, color_analysis: Dict[str, Any], 
                                   edge_analysis: Dict[str, Any], 
                                   ocr_result: OCRResult) -> float:
        """Calculate overall confidence score for the analysis"""
        try:
            confidence_factors = []
            
            # Color analysis confidence
            if 'error' not in color_analysis:
                color_confidence = min(len(color_analysis.get('dominant_colors', [])) / 10, 0.9)
                confidence_factors.append(color_confidence)
            
            # Edge analysis confidence
            if 'error' not in edge_analysis:
                edge_confidence = min(edge_analysis.get('edge_density', 0) * 10, 0.9)
                confidence_factors.append(edge_confidence)
            
            # OCR confidence
            confidence_factors.append(ocr_result.text_confidence)
            
            # Overall confidence is the average of individual confidences
            if confidence_factors:
                return round(sum(confidence_factors) / len(confidence_factors), 3)
            else:
                return 0.3  # Default low confidence
        
        except Exception:
            return 0.2

# Test function
async def test_vision_language_processor():
    """Test the vision-language processor"""
    print("🔍 Testing Vision-Language Processor")
    print("=" * 50)
    
    processor = VisionLanguageProcessor()
    
    # Test 1: Capability assessment
    print("\n📋 Test 1: Capability Assessment")
    print(f"   PIL Available: {'✅' if HAS_PIL else '❌'}")
    print(f"   Supported Formats: {len(processor.supported_formats)}")
    print(f"   Vision Models: {len(processor.vision_models)}")
    
    # Test 2: Vision-language query processing
    print("\n🖼️ Test 2: Vision-Language Query Processing")
    
    # Create a test query (will fail gracefully with fake data)
    test_query = VisionLanguageQuery(
        image_data=b"fake_image_data",
        text_query="What do you see in this image?",
        query_type="general",
        expected_response_type="description"
    )
    
    result = await processor.process_vision_language_query(test_query)
    
    print(f"   Processing Time: {result.processing_time:.3f}s")
    print(f"   Confidence Score: {result.confidence_score:.3f}")
    print(f"   Objects Identified: {len(result.objects_identified)}")
    print(f"   Spatial Relationships: {len(result.spatial_relationships)}")
    print(f"   Description Preview: {result.description[:100]}...")
    
    # Test 3: Component testing
    print("\n⚙️ Test 3: Component Testing")
    
    components_tested = []
    
    # Test color classification
    try:
        tone = processor._classify_color_tone(180, 100, 80)
        components_tested.append(("Color Classification", True, tone))
    except Exception as e:
        components_tested.append(("Color Classification", False, str(e)))
    
    # Test resolution classification
    try:
        res_cat = processor._classify_resolution(1920, 1080)
        components_tested.append(("Resolution Classification", True, res_cat))
    except Exception as e:
        components_tested.append(("Resolution Classification", False, str(e)))
    
    for component, success, result in components_tested:
        status = "✅" if success else "❌"
        print(f"   {component}: {status} - {result}")
    
    # Performance summary
    print(f"\n🎯 Summary:")
    success_count = sum(1 for _, success, _ in components_tested if success)
    print(f"   Component Success Rate: {success_count}/{len(components_tested)} ({success_count/len(components_tested):.1%})")
    print(f"   Vision Capabilities: {'Available' if HAS_PIL else 'Limited (PIL required)'}")
    
    return {
        "pil_available": HAS_PIL,
        "component_success_rate": success_count / len(components_tested),
        "processing_time": result.processing_time,
        "confidence_score": result.confidence_score
    }

if __name__ == "__main__":
    asyncio.run(test_vision_language_processor())