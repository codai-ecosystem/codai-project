"""
RomAI Multimodal Intelligence Test Suite

Comprehensive testing of the enhanced multimodal capabilities including:
- LLaVA vision-language understanding
- CLIP image-text similarity
- Romanian cultural visual analysis
- Multimodal API endpoints
"""

import requests
import json
import base64
import time
import asyncio
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import io
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Test configuration
SERVER_URL = "http://localhost:6101"
TEST_IMAGES_DIR = Path("test_images")

class RomAIMultimodalTester:
    """Comprehensive multimodal testing for RomAI."""
    
    def __init__(self, server_url: str = SERVER_URL):
        self.server_url = server_url
        self.session = requests.Session()
        self.test_results = {}
    
    def create_test_image(self, text: str, size: tuple = (400, 300)) -> bytes:
        """Create a test image with text."""
        image = Image.new('RGB', size, color='white')
        draw = ImageDraw.Draw(image)
        
        # Try to use a font, fall back to default if not available
        try:
            font = ImageFont.truetype("arial.ttf", 24)
        except:
            font = ImageFont.load_default()
        
        # Calculate text position (center)
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        position = ((size[0] - text_width) // 2, (size[1] - text_height) // 2)
        
        draw.text(position, text, font=font, fill='black')
        
        # Convert to bytes
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        return buffer.getvalue()
    
    def image_to_base64(self, image_bytes: bytes) -> str:
        """Convert image bytes to base64 string."""
        return base64.b64encode(image_bytes).decode('utf-8')
    
    def test_server_health(self) -> bool:
        """Test if the server is running and responsive."""
        try:
            response = self.session.get(f"{self.server_url}/health", timeout=10)
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Server health check failed: {e}")
            return False
    
    def test_multimodal_capabilities(self) -> dict:
        """Test multimodal capabilities endpoint."""
        try:
            response = self.session.get(f"{self.server_url}/multimodal/capabilities")
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"Status code: {response.status_code}"}
        except Exception as e:
            logger.error(f"Capabilities test failed: {e}")
            return {"error": str(e)}
    
    def test_image_captioning(self) -> dict:
        """Test image captioning functionality."""
        logger.info("Testing image captioning...")
        
        # Create test image
        test_text = "RomAI Multimodal Test"
        image_bytes = self.create_test_image(test_text)
        image_base64 = self.image_to_base64(image_bytes)
        
        # Test cases
        test_cases = [
            {
                "name": "basic_captioning",
                "data": {
                    "image_data": image_base64,
                    "prompt": "Describe this image in detail.",
                    "romanian_context": False
                }
            },
            {
                "name": "romanian_context_captioning",
                "data": {
                    "image_data": image_base64,
                    "prompt": "Descrie această imagine în română.",
                    "romanian_context": True
                }
            }
        ]
        
        results = {}
        for test_case in test_cases:
            try:
                response = self.session.post(
                    f"{self.server_url}/multimodal/caption",
                    json=test_case["data"],
                    timeout=30
                )
                
                if response.status_code == 200:
                    results[test_case["name"]] = {
                        "success": True,
                        "response": response.json()
                    }
                else:
                    results[test_case["name"]] = {
                        "success": False,
                        "error": f"Status {response.status_code}: {response.text}"
                    }
                    
            except Exception as e:
                results[test_case["name"]] = {
                    "success": False,
                    "error": str(e)
                }
                logger.error(f"Caption test {test_case['name']} failed: {e}")
        
        return results
    
    def test_visual_qa(self) -> dict:
        """Test visual question answering."""
        logger.info("Testing visual question answering...")
        
        # Create test image
        test_text = "Mathematics: 2 + 2 = 4"
        image_bytes = self.create_test_image(test_text)
        image_base64 = self.image_to_base64(image_bytes)
        
        test_cases = [
            {
                "name": "math_question",
                "data": {
                    "image_data": image_base64,
                    "question": "What mathematical equation do you see in this image?",
                    "romanian_context": False
                }
            },
            {
                "name": "romanian_question",
                "data": {
                    "image_data": image_base64,
                    "question": "Ce ecuație matematică vezi în această imagine?",
                    "romanian_context": True
                }
            }
        ]
        
        results = {}
        for test_case in test_cases:
            try:
                response = self.session.post(
                    f"{self.server_url}/multimodal/visual-qa",
                    json=test_case["data"],
                    timeout=30
                )
                
                if response.status_code == 200:
                    results[test_case["name"]] = {
                        "success": True,
                        "response": response.json()
                    }
                else:
                    results[test_case["name"]] = {
                        "success": False,
                        "error": f"Status {response.status_code}: {response.text}"
                    }
                    
            except Exception as e:
                results[test_case["name"]] = {
                    "success": False,
                    "error": str(e)
                }
                logger.error(f"Visual QA test {test_case['name']} failed: {e}")
        
        return results
    
    def test_image_text_similarity(self) -> dict:
        """Test image-text similarity using CLIP."""
        logger.info("Testing image-text similarity...")
        
        # Create test image
        test_text = "Romanian Flag Colors"
        image_bytes = self.create_test_image(test_text)
        image_base64 = self.image_to_base64(image_bytes)
        
        test_cases = [
            {
                "name": "high_similarity",
                "data": {
                    "image_data": image_base64,
                    "text": "Romanian flag colors text"
                }
            },
            {
                "name": "low_similarity",
                "data": {
                    "image_data": image_base64,
                    "text": "Space exploration mission"
                }
            }
        ]
        
        results = {}
        for test_case in test_cases:
            try:
                response = self.session.post(
                    f"{self.server_url}/multimodal/image-text-similarity",
                    json=test_case["data"],
                    timeout=30
                )
                
                if response.status_code == 200:
                    results[test_case["name"]] = {
                        "success": True,
                        "response": response.json()
                    }
                else:
                    results[test_case["name"]] = {
                        "success": False,
                        "error": f"Status {response.status_code}: {response.text}"
                    }
                    
            except Exception as e:
                results[test_case["name"]] = {
                    "success": False,
                    "error": str(e)
                }
                logger.error(f"Similarity test {test_case['name']} failed: {e}")
        
        return results
    
    def test_romanian_cultural_analysis(self) -> dict:
        """Test Romanian cultural analysis."""
        logger.info("Testing Romanian cultural analysis...")
        
        # Create test image with Romanian cultural reference
        test_text = "Castelul Peleș - Romanian Heritage"
        image_bytes = self.create_test_image(test_text)
        image_base64 = self.image_to_base64(image_bytes)
        
        test_case = {
            "image_data": image_base64,
            "context": "Analyze Romanian cultural elements"
        }
        
        try:
            response = self.session.post(
                f"{self.server_url}/multimodal/romanian-cultural-analysis",
                json=test_case,
                timeout=30
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "response": response.json()
                }
            else:
                return {
                    "success": False,
                    "error": f"Status {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            logger.error(f"Romanian cultural analysis test failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def test_object_detection(self) -> dict:
        """Test object detection."""
        logger.info("Testing object detection...")
        
        # Create test image
        test_text = "Person - Object"
        image_bytes = self.create_test_image(test_text)
        image_base64 = self.image_to_base64(image_bytes)
        
        try:
            response = self.session.post(
                f"{self.server_url}/multimodal/object-detection",
                data={
                    "image_data": image_base64,
                    "romanian_context": "false"
                },
                timeout=30
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "response": response.json()
                }
            else:
                return {
                    "success": False,
                    "error": f"Status {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            logger.error(f"Object detection test failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def test_model_status(self) -> dict:
        """Test model status endpoint."""
        try:
            response = self.session.get(f"{self.server_url}/multimodal/models/status")
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"Status code: {response.status_code}"}
        except Exception as e:
            logger.error(f"Model status test failed: {e}")
            return {"error": str(e)}
    
    def run_comprehensive_test_suite(self) -> dict:
        """Run the complete multimodal test suite."""
        logger.info("🎯 Starting RomAI Multimodal Intelligence Test Suite")
        
        # Check server health first
        if not self.test_server_health():
            return {
                "overall_status": "FAILED",
                "error": "Server not responding",
                "tests": {}
            }
        
        # Run all tests
        test_functions = [
            ("capabilities", self.test_multimodal_capabilities),
            ("model_status", self.test_model_status),
            ("image_captioning", self.test_image_captioning),
            ("visual_qa", self.test_visual_qa),
            ("image_text_similarity", self.test_image_text_similarity),
            ("romanian_cultural_analysis", self.test_romanian_cultural_analysis),
            ("object_detection", self.test_object_detection)
        ]
        
        results = {}
        successful_tests = 0
        total_tests = len(test_functions)
        
        for test_name, test_function in test_functions:
            logger.info(f"🔍 Running {test_name} test...")
            start_time = time.time()
            
            try:
                test_result = test_function()
                test_time = time.time() - start_time
                
                results[test_name] = {
                    "result": test_result,
                    "execution_time": test_time,
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
                }
                
                # Count successful tests
                if isinstance(test_result, dict):
                    if test_result.get("success", False) or "error" not in test_result:
                        successful_tests += 1
                        logger.info(f"✅ {test_name} test completed successfully")
                    else:
                        logger.warning(f"⚠️ {test_name} test had issues")
                else:
                    successful_tests += 1
                    logger.info(f"✅ {test_name} test completed")
                    
            except Exception as e:
                test_time = time.time() - start_time
                results[test_name] = {
                    "result": {"error": str(e)},
                    "execution_time": test_time,
                    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
                }
                logger.error(f"❌ {test_name} test failed: {e}")
        
        # Calculate overall success rate
        success_rate = (successful_tests / total_tests) * 100
        overall_status = "PASSED" if success_rate >= 70 else "PARTIAL" if success_rate >= 40 else "FAILED"
        
        return {
            "overall_status": overall_status,
            "success_rate": success_rate,
            "successful_tests": successful_tests,
            "total_tests": total_tests,
            "execution_time": time.strftime("%Y-%m-%d %H:%M:%S"),
            "tests": results
        }


def main():
    """Main test execution."""
    print("🚀 RomAI Multimodal Intelligence Test Suite")
    print("=" * 60)
    
    tester = RomAIMultimodalTester()
    results = tester.run_comprehensive_test_suite()
    
    # Print summary
    print("\n📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    print(f"Overall Status: {results['overall_status']}")
    print(f"Success Rate: {results['success_rate']:.1f}%")
    print(f"Successful Tests: {results['successful_tests']}/{results['total_tests']}")
    
    # Print detailed results
    print("\n🔍 DETAILED RESULTS")
    print("=" * 60)
    
    for test_name, test_data in results.get("tests", {}).items():
        test_result = test_data["result"]
        execution_time = test_data["execution_time"]
        
        if isinstance(test_result, dict) and "error" in test_result:
            print(f"❌ {test_name}: FAILED ({execution_time:.2f}s)")
            print(f"   Error: {test_result['error']}")
        else:
            print(f"✅ {test_name}: PASSED ({execution_time:.2f}s)")
    
    # Save detailed results to file
    results_file = f"multimodal_test_results_{int(time.time())}.json"
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📁 Detailed results saved to: {results_file}")
    
    return results['overall_status'] == 'PASSED'


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)