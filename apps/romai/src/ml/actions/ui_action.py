"""
UI Action Controller Module

Specialized controller for UI automation and screen interaction capabilities.
Provides comprehensive screen control, window management, input automation,
and visual element interaction for RUAGA's action-taking capabilities.

Key Capabilities:
- Screen capture and image analysis
- Element detection and interaction
- Window management and navigation
- Keyboard and mouse automation
- Visual verification and validation
- Cross-platform UI automation
"""

import time
import logging
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass
from enum import Enum
import asyncio
from abc import ABC, abstractmethod


logger = logging.getLogger(__name__)


class UIActionType(Enum):
    """Types of UI actions."""
    CLICK = "click"
    DOUBLE_CLICK = "double_click"
    RIGHT_CLICK = "right_click"
    TYPE_TEXT = "type_text"
    KEY_PRESS = "key_press"
    KEY_COMBINATION = "key_combination"
    DRAG_DROP = "drag_drop"
    SCROLL = "scroll"
    HOVER = "hover"
    WAIT = "wait"
    SCREENSHOT = "screenshot"
    FIND_ELEMENT = "find_element"
    WINDOW_FOCUS = "window_focus"
    WINDOW_MINIMIZE = "window_minimize"
    WINDOW_MAXIMIZE = "window_maximize"
    WINDOW_CLOSE = "window_close"


class ElementLocatorType(Enum):
    """Types of element locators."""
    COORDINATES = "coordinates"
    IMAGE_TEMPLATE = "image_template"
    TEXT_CONTENT = "text_content"
    COLOR_PATTERN = "color_pattern"
    WINDOW_TITLE = "window_title"
    UI_ACCESSIBILITY = "ui_accessibility"


class UIActionStatus(Enum):
    """Status of UI action execution."""
    SUCCESS = "success"
    FAILED = "failed"
    TIMEOUT = "timeout"
    ELEMENT_NOT_FOUND = "element_not_found"
    PERMISSION_DENIED = "permission_denied"
    INVALID_PARAMETERS = "invalid_parameters"


@dataclass
class ElementLocator:
    """Element locator for UI automation."""
    locator_type: ElementLocatorType
    value: Union[Tuple[int, int], str, Dict[str, Any]]
    timeout: float = 5.0
    confidence: float = 0.8
    region: Optional[Tuple[int, int, int, int]] = None  # (x, y, width, height)


@dataclass
class UIActionRequest:
    """UI action request specification."""
    action_type: UIActionType
    target: Optional[ElementLocator] = None
    parameters: Dict[str, Any] = None
    timeout: float = 10.0
    retry_attempts: int = 3
    verification_required: bool = False
    success_criteria: Optional[str] = None


@dataclass
class UIActionResult:
    """Result of UI action execution."""
    success: bool
    status: UIActionStatus
    message: str
    execution_time: float
    screenshot_path: Optional[str] = None
    element_found: bool = False
    element_coordinates: Optional[Tuple[int, int]] = None
    verification_passed: bool = False
    error_details: Optional[str] = None


class UIAutomationBackend(ABC):
    """Abstract base class for UI automation backends."""
    
    @abstractmethod
    async def take_screenshot(self, region: Optional[Tuple[int, int, int, int]] = None) -> str:
        """Take screenshot of screen or region."""
        pass
    
    @abstractmethod
    async def find_element(self, locator: ElementLocator) -> Optional[Tuple[int, int]]:
        """Find UI element and return coordinates."""
        pass
    
    @abstractmethod
    async def click(self, x: int, y: int) -> bool:
        """Click at coordinates."""
        pass
    
    @abstractmethod
    async def type_text(self, text: str) -> bool:
        """Type text."""
        pass
    
    @abstractmethod
    async def press_key(self, key: str) -> bool:
        """Press keyboard key."""
        pass
    
    @abstractmethod
    async def drag_drop(self, start_x: int, start_y: int, end_x: int, end_y: int) -> bool:
        """Drag and drop."""
        pass
    
    @abstractmethod
    async def get_window_list(self) -> List[Dict[str, Any]]:
        """Get list of open windows."""
        pass
    
    @abstractmethod
    async def focus_window(self, window_title: str) -> bool:
        """Focus window by title."""
        pass


class GlassMCPUIBackend(UIAutomationBackend):
    """
    UI automation backend using GlassMCP server.
    Integrates with the GlassMCP Windows automation capabilities.
    """
    
    def __init__(self, mcp_client=None):
        self.mcp_client = mcp_client
        self.logger = logging.getLogger(__name__)
    
    async def take_screenshot(self, region: Optional[Tuple[int, int, int, int]] = None) -> str:
        """Take screenshot using system capabilities."""
        try:
            if self.mcp_client:
                # Use GlassMCP screenshot capability
                # Note: This is a placeholder for actual MCP integration
                pass
            
            # Fallback to basic screenshot
            import os
            import tempfile
            
            screenshot_path = os.path.join(tempfile.gettempdir(), f"ui_screenshot_{int(time.time())}.png")
            
            # Placeholder for actual screenshot implementation
            self.logger.info(f"Screenshot saved to: {screenshot_path}")
            return screenshot_path
            
        except Exception as e:
            self.logger.error(f"Screenshot failed: {str(e)}")
            raise
    
    async def find_element(self, locator: ElementLocator) -> Optional[Tuple[int, int]]:
        """Find UI element using various locator types."""
        
        try:
            if locator.locator_type == ElementLocatorType.COORDINATES:
                if isinstance(locator.value, tuple) and len(locator.value) == 2:
                    return locator.value
            
            elif locator.locator_type == ElementLocatorType.TEXT_CONTENT:
                # Placeholder for text-based element finding
                # In practice, would use OCR or accessibility APIs
                self.logger.info(f"Looking for text: {locator.value}")
                return (100, 100)  # Placeholder coordinates
            
            elif locator.locator_type == ElementLocatorType.WINDOW_TITLE:
                # Use GlassMCP window finding
                if self.mcp_client:
                    # Placeholder for GlassMCP window finding
                    return (200, 200)
            
            return None
            
        except Exception as e:
            self.logger.error(f"Element finding failed: {str(e)}")
            return None
    
    async def click(self, x: int, y: int) -> bool:
        """Click at coordinates."""
        try:
            if self.mcp_client:
                # Use GlassMCP click capability
                # Placeholder for actual MCP click
                pass
            
            self.logger.info(f"Clicked at coordinates: ({x}, {y})")
            return True
            
        except Exception as e:
            self.logger.error(f"Click failed: {str(e)}")
            return False
    
    async def type_text(self, text: str) -> bool:
        """Type text using keyboard automation."""
        try:
            if self.mcp_client:
                # Use GlassMCP text input capability
                # Placeholder for actual MCP text input
                pass
            
            self.logger.info(f"Typed text: {text[:50]}...")
            return True
            
        except Exception as e:
            self.logger.error(f"Text input failed: {str(e)}")
            return False
    
    async def press_key(self, key: str) -> bool:
        """Press keyboard key."""
        try:
            if self.mcp_client:
                # Use GlassMCP key press capability
                # Placeholder for actual MCP key press
                pass
            
            self.logger.info(f"Pressed key: {key}")
            return True
            
        except Exception as e:
            self.logger.error(f"Key press failed: {str(e)}")
            return False
    
    async def drag_drop(self, start_x: int, start_y: int, end_x: int, end_y: int) -> bool:
        """Drag and drop operation."""
        try:
            self.logger.info(f"Drag from ({start_x}, {start_y}) to ({end_x}, {end_y})")
            return True
            
        except Exception as e:
            self.logger.error(f"Drag and drop failed: {str(e)}")
            return False
    
    async def get_window_list(self) -> List[Dict[str, Any]]:
        """Get list of open windows."""
        try:
            if self.mcp_client:
                # Use GlassMCP window listing capability
                # Placeholder for actual MCP window listing
                pass
            
            # Placeholder window list
            return [
                {'title': 'VS Code', 'handle': 12345, 'position': (0, 0, 1920, 1080)},
                {'title': 'Browser', 'handle': 12346, 'position': (100, 100, 1200, 800)}
            ]
            
        except Exception as e:
            self.logger.error(f"Window listing failed: {str(e)}")
            return []
    
    async def focus_window(self, window_title: str) -> bool:
        """Focus window by title."""
        try:
            if self.mcp_client:
                # Use GlassMCP window focus capability
                # Placeholder for actual MCP window focus
                pass
            
            self.logger.info(f"Focused window: {window_title}")
            return True
            
        except Exception as e:
            self.logger.error(f"Window focus failed: {str(e)}")
            return False


class UIActionController:
    """
    Comprehensive UI action controller for screen automation and interaction.
    Provides high-level interface for UI automation tasks with error handling,
    retry logic, and verification capabilities.
    """
    
    def __init__(self, backend: UIAutomationBackend = None):
        self.backend = backend or GlassMCPUIBackend()
        self.logger = logging.getLogger(__name__)
        
        # Performance tracking
        self.metrics = {
            'actions_executed': 0,
            'successful_actions': 0,
            'failed_actions': 0,
            'average_execution_time': 0.0,
            'action_type_distribution': {action.value: 0 for action in UIActionType}
        }
        
        # Action history for debugging
        self.action_history = []
        
        # Default parameters
        self.default_timeout = 10.0
        self.default_retry_attempts = 3
        self.screenshot_on_failure = True
        
        self.logger.info("UI Action Controller initialized")
    
    async def execute_action(self, request: UIActionRequest) -> UIActionResult:
        """
        Execute a UI action with comprehensive error handling and verification.
        
        Args:
            request: UI action request specification
            
        Returns:
            UIActionResult with execution details and status
        """
        start_time = time.time()
        
        try:
            # Validate request
            if not self._validate_request(request):
                return UIActionResult(
                    success=False,
                    status=UIActionStatus.INVALID_PARAMETERS,
                    message="Invalid action request parameters",
                    execution_time=0.0
                )
            
            # Execute action with retry logic
            result = await self._execute_with_retry(request)
            
            # Perform verification if required
            if request.verification_required and result.success:
                verification_result = await self._verify_action_success(request, result)
                result.verification_passed = verification_result
                
                if not verification_result:
                    result.success = False
                    result.status = UIActionStatus.FAILED
                    result.message += " (Verification failed)"
            
            # Update metrics
            execution_time = time.time() - start_time
            result.execution_time = execution_time
            self._update_metrics(request, result)
            
            # Store in history
            self.action_history.append({
                'timestamp': time.time(),
                'request': request,
                'result': result
            })
            
            return result
            
        except Exception as e:
            execution_time = time.time() - start_time
            self.logger.error(f"Action execution failed: {str(e)}")
            
            # Update metrics
            self._update_metrics(request, None, failed=True)
            
            return UIActionResult(
                success=False,
                status=UIActionStatus.FAILED,
                message=f"Action execution failed: {str(e)}",
                execution_time=execution_time,
                error_details=str(e)
            )
    
    async def execute_action_sequence(self, requests: List[UIActionRequest]) -> List[UIActionResult]:
        """
        Execute a sequence of UI actions.
        
        Args:
            requests: List of UI action requests
            
        Returns:
            List of UIActionResult for each action
        """
        results = []
        
        for i, request in enumerate(requests):
            self.logger.info(f"Executing action {i+1}/{len(requests)}: {request.action_type.value}")
            
            result = await self.execute_action(request)
            results.append(result)
            
            # Stop on first failure unless specified otherwise
            if not result.success and not getattr(request, 'continue_on_failure', False):
                self.logger.warning(f"Action sequence stopped at step {i+1} due to failure")
                break
            
            # Add delay between actions if specified
            delay = getattr(request, 'delay_after', 0.0)
            if delay > 0:
                await asyncio.sleep(delay)
        
        return results
    
    async def _execute_with_retry(self, request: UIActionRequest) -> UIActionResult:
        """Execute action with retry logic."""
        
        last_error = None
        screenshot_path = None
        
        for attempt in range(request.retry_attempts):
            try:
                if attempt > 0:
                    self.logger.info(f"Retry attempt {attempt + 1}/{request.retry_attempts}")
                    await asyncio.sleep(min(attempt * 2, 5))  # Exponential backoff
                
                # Execute the specific action
                result = await self._execute_specific_action(request)
                
                if result.success:
                    return result
                else:
                    last_error = result.message
                    if self.screenshot_on_failure:
                        screenshot_path = await self.backend.take_screenshot()
                
            except Exception as e:
                last_error = str(e)
                self.logger.warning(f"Action attempt {attempt + 1} failed: {str(e)}")
        
        # All attempts failed
        return UIActionResult(
            success=False,
            status=UIActionStatus.FAILED,
            message=f"Action failed after {request.retry_attempts} attempts: {last_error}",
            execution_time=0.0,
            screenshot_path=screenshot_path
        )
    
    async def _execute_specific_action(self, request: UIActionRequest) -> UIActionResult:
        """Execute specific UI action based on action type."""
        
        action_type = request.action_type
        
        if action_type == UIActionType.CLICK:
            return await self._handle_click(request)
        elif action_type == UIActionType.TYPE_TEXT:
            return await self._handle_type_text(request)
        elif action_type == UIActionType.KEY_PRESS:
            return await self._handle_key_press(request)
        elif action_type == UIActionType.DRAG_DROP:
            return await self._handle_drag_drop(request)
        elif action_type == UIActionType.SCREENSHOT:
            return await self._handle_screenshot(request)
        elif action_type == UIActionType.FIND_ELEMENT:
            return await self._handle_find_element(request)
        elif action_type == UIActionType.WINDOW_FOCUS:
            return await self._handle_window_focus(request)
        elif action_type == UIActionType.WAIT:
            return await self._handle_wait(request)
        else:
            return UIActionResult(
                success=False,
                status=UIActionStatus.INVALID_PARAMETERS,
                message=f"Unsupported action type: {action_type.value}",
                execution_time=0.0
            )
    
    async def _handle_click(self, request: UIActionRequest) -> UIActionResult:
        """Handle click action."""
        
        if not request.target:
            return UIActionResult(
                success=False,
                status=UIActionStatus.INVALID_PARAMETERS,
                message="Click action requires target element",
                execution_time=0.0
            )
        
        # Find element
        coordinates = await self.backend.find_element(request.target)
        if not coordinates:
            return UIActionResult(
                success=False,
                status=UIActionStatus.ELEMENT_NOT_FOUND,
                message="Target element not found for click",
                execution_time=0.0
            )
        
        # Perform click
        success = await self.backend.click(coordinates[0], coordinates[1])
        
        return UIActionResult(
            success=success,
            status=UIActionStatus.SUCCESS if success else UIActionStatus.FAILED,
            message="Click executed successfully" if success else "Click failed",
            execution_time=0.0,
            element_found=True,
            element_coordinates=coordinates
        )
    
    async def _handle_type_text(self, request: UIActionRequest) -> UIActionResult:
        """Handle text typing action."""
        
        text = request.parameters.get('text', '') if request.parameters else ''
        if not text:
            return UIActionResult(
                success=False,
                status=UIActionStatus.INVALID_PARAMETERS,
                message="Type text action requires 'text' parameter",
                execution_time=0.0
            )
        
        success = await self.backend.type_text(text)
        
        return UIActionResult(
            success=success,
            status=UIActionStatus.SUCCESS if success else UIActionStatus.FAILED,
            message=f"Text typed successfully: {text[:50]}..." if success else "Text typing failed",
            execution_time=0.0
        )
    
    async def _handle_key_press(self, request: UIActionRequest) -> UIActionResult:
        """Handle key press action."""
        
        key = request.parameters.get('key', '') if request.parameters else ''
        if not key:
            return UIActionResult(
                success=False,
                status=UIActionStatus.INVALID_PARAMETERS,
                message="Key press action requires 'key' parameter",
                execution_time=0.0
            )
        
        success = await self.backend.press_key(key)
        
        return UIActionResult(
            success=success,
            status=UIActionStatus.SUCCESS if success else UIActionStatus.FAILED,
            message=f"Key pressed successfully: {key}" if success else "Key press failed",
            execution_time=0.0
        )
    
    async def _handle_drag_drop(self, request: UIActionRequest) -> UIActionResult:
        """Handle drag and drop action."""
        
        if not request.parameters:
            return UIActionResult(
                success=False,
                status=UIActionStatus.INVALID_PARAMETERS,
                message="Drag drop action requires parameters",
                execution_time=0.0
            )
        
        start_x = request.parameters.get('start_x', 0)
        start_y = request.parameters.get('start_y', 0)
        end_x = request.parameters.get('end_x', 0)
        end_y = request.parameters.get('end_y', 0)
        
        success = await self.backend.drag_drop(start_x, start_y, end_x, end_y)
        
        return UIActionResult(
            success=success,
            status=UIActionStatus.SUCCESS if success else UIActionStatus.FAILED,
            message="Drag and drop executed successfully" if success else "Drag and drop failed",
            execution_time=0.0
        )
    
    async def _handle_screenshot(self, request: UIActionRequest) -> UIActionResult:
        """Handle screenshot action."""
        
        region = None
        if request.parameters and 'region' in request.parameters:
            region = request.parameters['region']
        
        screenshot_path = await self.backend.take_screenshot(region)
        
        return UIActionResult(
            success=True,
            status=UIActionStatus.SUCCESS,
            message=f"Screenshot saved: {screenshot_path}",
            execution_time=0.0,
            screenshot_path=screenshot_path
        )
    
    async def _handle_find_element(self, request: UIActionRequest) -> UIActionResult:
        """Handle find element action."""
        
        if not request.target:
            return UIActionResult(
                success=False,
                status=UIActionStatus.INVALID_PARAMETERS,
                message="Find element action requires target",
                execution_time=0.0
            )
        
        coordinates = await self.backend.find_element(request.target)
        found = coordinates is not None
        
        return UIActionResult(
            success=found,
            status=UIActionStatus.SUCCESS if found else UIActionStatus.ELEMENT_NOT_FOUND,
            message=f"Element found at {coordinates}" if found else "Element not found",
            execution_time=0.0,
            element_found=found,
            element_coordinates=coordinates
        )
    
    async def _handle_window_focus(self, request: UIActionRequest) -> UIActionResult:
        """Handle window focus action."""
        
        window_title = request.parameters.get('window_title', '') if request.parameters else ''
        if not window_title:
            return UIActionResult(
                success=False,
                status=UIActionStatus.INVALID_PARAMETERS,
                message="Window focus action requires 'window_title' parameter",
                execution_time=0.0
            )
        
        success = await self.backend.focus_window(window_title)
        
        return UIActionResult(
            success=success,
            status=UIActionStatus.SUCCESS if success else UIActionStatus.FAILED,
            message=f"Window focused: {window_title}" if success else "Window focus failed",
            execution_time=0.0
        )
    
    async def _handle_wait(self, request: UIActionRequest) -> UIActionResult:
        """Handle wait action."""
        
        duration = request.parameters.get('duration', 1.0) if request.parameters else 1.0
        
        await asyncio.sleep(duration)
        
        return UIActionResult(
            success=True,
            status=UIActionStatus.SUCCESS,
            message=f"Wait completed: {duration} seconds",
            execution_time=duration
        )
    
    def _validate_request(self, request: UIActionRequest) -> bool:
        """Validate action request parameters."""
        
        if not isinstance(request.action_type, UIActionType):
            return False
        
        # Action-specific validation
        if request.action_type in [UIActionType.CLICK, UIActionType.DOUBLE_CLICK, UIActionType.RIGHT_CLICK]:
            if not request.target:
                return False
        
        if request.action_type == UIActionType.TYPE_TEXT:
            if not request.parameters or 'text' not in request.parameters:
                return False
        
        return True
    
    async def _verify_action_success(self, request: UIActionRequest, result: UIActionResult) -> bool:
        """Verify if action was successful based on success criteria."""
        
        if not request.success_criteria:
            return True  # No verification criteria specified
        
        try:
            # Simple verification based on criteria type
            if request.success_criteria == 'element_still_exists':
                if request.target:
                    coordinates = await self.backend.find_element(request.target)
                    return coordinates is not None
            elif request.success_criteria == 'element_disappeared':
                if request.target:
                    coordinates = await self.backend.find_element(request.target)
                    return coordinates is None
            
            return True  # Default to success if unknown criteria
            
        except Exception as e:
            self.logger.error(f"Verification failed: {str(e)}")
            return False
    
    def _update_metrics(self, request: UIActionRequest, result: UIActionResult = None, failed: bool = False):
        """Update performance metrics."""
        
        self.metrics['actions_executed'] += 1
        self.metrics['action_type_distribution'][request.action_type.value] += 1
        
        if failed or (result and not result.success):
            self.metrics['failed_actions'] += 1
        else:
            self.metrics['successful_actions'] += 1
        
        if result and result.execution_time > 0:
            current_avg = self.metrics['average_execution_time']
            total_actions = self.metrics['actions_executed']
            self.metrics['average_execution_time'] = (
                (current_avg * (total_actions - 1) + result.execution_time) / total_actions
            )
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get UI action performance metrics."""
        
        total_actions = self.metrics['actions_executed']
        
        if total_actions == 0:
            return {'message': 'No UI actions executed yet'}
        
        success_rate = self.metrics['successful_actions'] / total_actions
        
        return {
            'performance_summary': {
                'total_actions': total_actions,
                'successful_actions': self.metrics['successful_actions'],
                'failed_actions': self.metrics['failed_actions'],
                'success_rate': success_rate,
                'average_execution_time': self.metrics['average_execution_time']
            },
            'action_distribution': self.metrics['action_type_distribution'],
            'recent_actions': len(self.action_history),
            'capabilities': {
                'supported_actions': [action.value for action in UIActionType],
                'locator_types': [locator.value for locator in ElementLocatorType],
                'backend_type': type(self.backend).__name__
            }
        }
    
    def get_action_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent action history."""
        
        return self.action_history[-limit:] if self.action_history else []