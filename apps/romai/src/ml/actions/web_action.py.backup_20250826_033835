"""
Web Action Controller Module

Specialized controller for web browser automation and interaction.
Provides comprehensive browser control, page navigation, element manipulation,
and web scraping capabilities for RUAGA's action-taking capabilities.

Key Capabilities:
- Browser automation with multiple engines
- Page navigation and interaction
- Element finding and manipulation
- Form filling and submission
- Screenshot and content extraction
- JavaScript execution
- Cookie and session management
"""

import time
import logging
import asyncio
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
from urllib.parse import urljoin, urlparse
import json


logger = logging.getLogger(__name__)


class BrowserEngine(Enum):
    """Browser engines for web automation."""
    PLAYWRIGHT_CHROMIUM = "playwright_chromium"
    PLAYWRIGHT_FIREFOX = "playwright_firefox"
    PLAYWRIGHT_WEBKIT = "playwright_webkit"
    SELENIUM_CHROME = "selenium_chrome"
    SELENIUM_FIREFOX = "selenium_firefox"


class WebActionType(Enum):
    """Types of web actions."""
    NAVIGATE = "navigate"
    CLICK = "click"
    FILL = "fill"
    SELECT = "select"
    SUBMIT = "submit"
    WAIT = "wait"
    SCROLL = "scroll"
    SCREENSHOT = "screenshot"
    GET_TEXT = "get_text"
    GET_ATTRIBUTE = "get_attribute"
    EXECUTE_SCRIPT = "execute_script"
    SET_COOKIE = "set_cookie"
    GET_COOKIES = "get_cookies"
    GO_BACK = "go_back"
    GO_FORWARD = "go_forward"
    REFRESH = "refresh"
    CLOSE_TAB = "close_tab"
    SWITCH_TAB = "switch_tab"


class ElementLocatorType(Enum):
    """Types of element locators for web elements."""
    CSS_SELECTOR = "css"
    XPATH = "xpath"
    ID = "id"
    NAME = "name"
    CLASS_NAME = "class"
    TAG_NAME = "tag"
    LINK_TEXT = "link_text"
    PARTIAL_LINK_TEXT = "partial_link_text"


class WebActionStatus(Enum):
    """Status of web action execution."""
    SUCCESS = "success"
    FAILED = "failed"
    TIMEOUT = "timeout"
    ELEMENT_NOT_FOUND = "element_not_found"
    NAVIGATION_FAILED = "navigation_failed"
    SCRIPT_ERROR = "script_error"
    NETWORK_ERROR = "network_error"


@dataclass
class WebElementLocator:
    """Web element locator specification."""
    locator_type: ElementLocatorType
    value: str
    timeout: float = 5.0
    wait_for_visible: bool = True
    wait_for_enabled: bool = False
    frame: Optional[str] = None


@dataclass
class WebActionRequest:
    """Web action request specification."""
    action_type: WebActionType
    url: Optional[str] = None
    element: Optional[WebElementLocator] = None
    value: Optional[str] = None
    options: Dict[str, Any] = field(default_factory=dict)
    timeout: float = 30.0
    retry_attempts: int = 2
    screenshot_on_failure: bool = True
    wait_for_network: bool = False


@dataclass
class WebActionResult:
    """Result of web action execution."""
    success: bool
    status: WebActionStatus
    message: str
    execution_time: float
    response_data: Optional[Any] = None
    screenshot_path: Optional[str] = None
    page_url: Optional[str] = None
    element_found: bool = False
    network_response: Optional[Dict[str, Any]] = None
    error_details: Optional[str] = None


class WebBrowserBackend:
    """Abstract base for web browser automation backends."""
    
    async def navigate(self, url: str, timeout: float = 30.0) -> bool:
        """Navigate to URL."""
        raise NotImplementedError
    
    async def find_element(self, locator: WebElementLocator) -> bool:
        """Find element on page."""
        raise NotImplementedError
    
    async def click_element(self, locator: WebElementLocator) -> bool:
        """Click element."""
        raise NotImplementedError
    
    async def fill_element(self, locator: WebElementLocator, value: str) -> bool:
        """Fill element with text."""
        raise NotImplementedError
    
    async def get_element_text(self, locator: WebElementLocator) -> Optional[str]:
        """Get element text content."""
        raise NotImplementedError
    
    async def execute_script(self, script: str) -> Any:
        """Execute JavaScript."""
        raise NotImplementedError
    
    async def take_screenshot(self, path: str = None) -> str:
        """Take screenshot."""
        raise NotImplementedError
    
    async def close(self):
        """Close browser."""
        raise NotImplementedError


class PlaywrightMCPBrowserBackend(WebBrowserBackend):
    """
    Browser backend using PlaywrightMCP server.
    Integrates with the PlaywrightMCP browser automation capabilities.
    """
    
    def __init__(self, mcp_client=None, browser_type: str = "chromium", headless: bool = False):
        self.mcp_client = mcp_client
        self.browser_type = browser_type
        self.headless = headless
        self.logger = logging.getLogger(__name__)
        
        # Browser state
        self.current_url = None
        self.browser_initialized = False
        
        # Performance tracking
        self.page_load_times = []
        self.action_times = []
    
    async def initialize_browser(self):
        """Initialize browser if not already done."""
        
        if self.browser_initialized:
            return True
        
        try:
            if self.mcp_client:
                # Use PlaywrightMCP to initialize browser
                # Note: This is a placeholder for actual MCP integration
                pass
            
            self.browser_initialized = True
            self.logger.info(f"Browser initialized: {self.browser_type}")
            return True
            
        except Exception as e:
            self.logger.error(f"Browser initialization failed: {str(e)}")
            return False
    
    async def navigate(self, url: str, timeout: float = 30.0) -> bool:
        """Navigate to URL using PlaywrightMCP."""
        
        try:
            await self.initialize_browser()
            
            start_time = time.time()
            
            if self.mcp_client:
                # Use PlaywrightMCP navigation
                # Placeholder for actual MCP navigate call
                self.logger.info(f"Navigating to: {url}")
                self.current_url = url
            else:
                # Fallback navigation
                self.logger.info(f"Mock navigation to: {url}")
                self.current_url = url
            
            load_time = time.time() - start_time
            self.page_load_times.append(load_time)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Navigation failed: {str(e)}")
            return False
    
    async def find_element(self, locator: WebElementLocator) -> bool:
        """Find element using PlaywrightMCP."""
        
        try:
            if self.mcp_client:
                # Use PlaywrightMCP element finding
                # Placeholder for actual MCP find_element call
                self.logger.info(f"Finding element: {locator.locator_type.value} = {locator.value}")
                return True
            
            # Mock element finding
            self.logger.info(f"Mock finding element: {locator.value}")
            return True
            
        except Exception as e:
            self.logger.error(f"Element finding failed: {str(e)}")
            return False
    
    async def click_element(self, locator: WebElementLocator) -> bool:
        """Click element using PlaywrightMCP."""
        
        try:
            start_time = time.time()
            
            if self.mcp_client:
                # Use PlaywrightMCP click
                # Placeholder for actual MCP click call
                self.logger.info(f"Clicking element: {locator.value}")
            else:
                # Mock click
                self.logger.info(f"Mock clicking element: {locator.value}")
            
            action_time = time.time() - start_time
            self.action_times.append(action_time)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Element click failed: {str(e)}")
            return False
    
    async def fill_element(self, locator: WebElementLocator, value: str) -> bool:
        """Fill element with text using PlaywrightMCP."""
        
        try:
            start_time = time.time()
            
            if self.mcp_client:
                # Use PlaywrightMCP fill
                # Placeholder for actual MCP fill call
                self.logger.info(f"Filling element {locator.value} with: {value[:50]}...")
            else:
                # Mock fill
                self.logger.info(f"Mock filling element {locator.value} with: {value[:50]}...")
            
            action_time = time.time() - start_time
            self.action_times.append(action_time)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Element fill failed: {str(e)}")
            return False
    
    async def get_element_text(self, locator: WebElementLocator) -> Optional[str]:
        """Get element text using PlaywrightMCP."""
        
        try:
            if self.mcp_client:
                # Use PlaywrightMCP get text
                # Placeholder for actual MCP get_text call
                return f"Text content from {locator.value}"
            
            # Mock text extraction
            return f"Mock text from {locator.value}"
            
        except Exception as e:
            self.logger.error(f"Get element text failed: {str(e)}")
            return None
    
    async def execute_script(self, script: str) -> Any:
        """Execute JavaScript using PlaywrightMCP."""
        
        try:
            if self.mcp_client:
                # Use PlaywrightMCP script execution
                # Placeholder for actual MCP evaluate call
                self.logger.info(f"Executing script: {script[:100]}...")
                return {"result": "Script executed successfully"}
            
            # Mock script execution
            self.logger.info(f"Mock executing script: {script[:100]}...")
            return {"result": "Mock script result"}
            
        except Exception as e:
            self.logger.error(f"Script execution failed: {str(e)}")
            return None
    
    async def take_screenshot(self, path: str = None) -> str:
        """Take screenshot using PlaywrightMCP."""
        
        try:
            import tempfile
            import os
            
            if not path:
                path = os.path.join(tempfile.gettempdir(), f"web_screenshot_{int(time.time())}.png")
            
            if self.mcp_client:
                # Use PlaywrightMCP screenshot
                # Placeholder for actual MCP screenshot call
                self.logger.info(f"Taking screenshot: {path}")
            else:
                # Mock screenshot
                self.logger.info(f"Mock taking screenshot: {path}")
            
            return path
            
        except Exception as e:
            self.logger.error(f"Screenshot failed: {str(e)}")
            raise
    
    async def get_page_content(self) -> str:
        """Get page HTML content using PlaywrightMCP."""
        
        try:
            if self.mcp_client:
                # Use PlaywrightMCP get HTML
                # Placeholder for actual MCP get_visible_html call
                return "<html>Mock HTML content</html>"
            
            return "<html>Mock HTML content</html>"
            
        except Exception as e:
            self.logger.error(f"Get page content failed: {str(e)}")
            return ""
    
    async def set_cookie(self, name: str, value: str, domain: str = None) -> bool:
        """Set browser cookie."""
        
        try:
            if self.mcp_client:
                # Use PlaywrightMCP cookie setting
                # Placeholder for cookie management
                self.logger.info(f"Setting cookie: {name}={value}")
            
            return True
            
        except Exception as e:
            self.logger.error(f"Set cookie failed: {str(e)}")
            return False
    
    async def get_cookies(self) -> List[Dict[str, str]]:
        """Get browser cookies."""
        
        try:
            if self.mcp_client:
                # Use PlaywrightMCP cookie retrieval
                # Placeholder for cookie management
                return [{"name": "session", "value": "mock_session_id"}]
            
            return [{"name": "mock_cookie", "value": "mock_value"}]
            
        except Exception as e:
            self.logger.error(f"Get cookies failed: {str(e)}")
            return []
    
    async def close(self):
        """Close browser using PlaywrightMCP."""
        
        try:
            if self.mcp_client:
                # Use PlaywrightMCP close
                # Placeholder for actual MCP close call
                self.logger.info("Closing browser")
            
            self.browser_initialized = False
            
        except Exception as e:
            self.logger.error(f"Browser close failed: {str(e)}")


class WebActionController:
    """
    Comprehensive web action controller for browser automation.
    Provides high-level interface for web interactions with error handling,
    retry logic, and performance monitoring.
    """
    
    def __init__(self, backend: WebBrowserBackend = None, mcp_client=None):
        self.backend = backend or PlaywrightMCPBrowserBackend(mcp_client=mcp_client)
        self.logger = logging.getLogger(__name__)
        
        # Performance tracking
        self.metrics = {
            'actions_executed': 0,
            'successful_actions': 0,
            'failed_actions': 0,
            'average_execution_time': 0.0,
            'action_type_distribution': {action.value: 0 for action in WebActionType},
            'navigation_count': 0,
            'screenshot_count': 0
        }
        
        # Action history
        self.action_history = []
        
        # Session state
        self.current_page_url = None
        self.session_cookies = {}
        
        self.logger.info("Web Action Controller initialized")
    
    async def execute_web_action(self, request: WebActionRequest) -> WebActionResult:
        """
        Execute a web action with comprehensive error handling.
        
        Args:
            request: Web action request specification
            
        Returns:
            WebActionResult with execution details and status
        """
        start_time = time.time()
        
        try:
            # Validate request
            if not self._validate_request(request):
                return WebActionResult(
                    success=False,
                    status=WebActionStatus.FAILED,
                    message="Invalid web action request parameters",
                    execution_time=0.0
                )
            
            # Execute action with retry logic
            result = await self._execute_with_retry(request)
            
            # Update metrics
            execution_time = time.time() - start_time
            result.execution_time = execution_time
            self._update_metrics(request, result)
            
            # Store in history
            self._store_action_history(request, result)
            
            return result
            
        except Exception as e:
            execution_time = time.time() - start_time
            self.logger.error(f"Web action execution failed: {str(e)}")
            
            self._update_metrics(request, None, failed=True)
            
            return WebActionResult(
                success=False,
                status=WebActionStatus.FAILED,
                message=f"Web action failed: {str(e)}",
                execution_time=execution_time,
                error_details=str(e)
            )
    
    async def execute_web_workflow(self, requests: List[WebActionRequest]) -> List[WebActionResult]:
        """
        Execute a sequence of web actions as a workflow.
        
        Args:
            requests: List of web action requests
            
        Returns:
            List of WebActionResult for each action
        """
        results = []
        
        for i, request in enumerate(requests):
            self.logger.info(f"Executing web action {i+1}/{len(requests)}: {request.action_type.value}")
            
            result = await self.execute_web_action(request)
            results.append(result)
            
            # Stop on first failure unless specified otherwise
            if not result.success and not getattr(request, 'continue_on_failure', False):
                self.logger.warning(f"Web workflow stopped at step {i+1} due to failure")
                break
            
            # Add delay between actions if specified
            delay = getattr(request, 'delay_after', 0.0)
            if delay > 0:
                await asyncio.sleep(delay)
        
        return results
    
    async def _execute_with_retry(self, request: WebActionRequest) -> WebActionResult:
        """Execute web action with retry logic."""
        
        last_error = None
        screenshot_path = None
        
        for attempt in range(request.retry_attempts + 1):
            try:
                if attempt > 0:
                    self.logger.info(f"Retry attempt {attempt}/{request.retry_attempts}")
                    await asyncio.sleep(min(attempt * 2, 10))  # Exponential backoff
                
                # Execute the specific action
                result = await self._execute_specific_action(request)
                
                if result.success:
                    return result
                else:
                    last_error = result.message
                    if request.screenshot_on_failure and hasattr(self.backend, 'take_screenshot'):
                        try:
                            screenshot_path = await self.backend.take_screenshot()
                            result.screenshot_path = screenshot_path
                        except:
                            pass
                
            except Exception as e:
                last_error = str(e)
                self.logger.warning(f"Web action attempt {attempt + 1} failed: {str(e)}")
        
        # All attempts failed
        return WebActionResult(
            success=False,
            status=WebActionStatus.FAILED,
            message=f"Web action failed after {request.retry_attempts + 1} attempts: {last_error}",
            execution_time=0.0,
            screenshot_path=screenshot_path
        )
    
    async def _execute_specific_action(self, request: WebActionRequest) -> WebActionResult:
        """Execute specific web action based on action type."""
        
        action_type = request.action_type
        
        if action_type == WebActionType.NAVIGATE:
            return await self._handle_navigate(request)
        elif action_type == WebActionType.CLICK:
            return await self._handle_click(request)
        elif action_type == WebActionType.FILL:
            return await self._handle_fill(request)
        elif action_type == WebActionType.SELECT:
            return await self._handle_select(request)
        elif action_type == WebActionType.SCREENSHOT:
            return await self._handle_screenshot(request)
        elif action_type == WebActionType.GET_TEXT:
            return await self._handle_get_text(request)
        elif action_type == WebActionType.EXECUTE_SCRIPT:
            return await self._handle_execute_script(request)
        elif action_type == WebActionType.SET_COOKIE:
            return await self._handle_set_cookie(request)
        elif action_type == WebActionType.GET_COOKIES:
            return await self._handle_get_cookies(request)
        elif action_type == WebActionType.WAIT:
            return await self._handle_wait(request)
        else:
            return WebActionResult(
                success=False,
                status=WebActionStatus.FAILED,
                message=f"Unsupported web action type: {action_type.value}",
                execution_time=0.0
            )
    
    async def _handle_navigate(self, request: WebActionRequest) -> WebActionResult:
        """Handle navigation action."""
        
        if not request.url:
            return WebActionResult(
                success=False,
                status=WebActionStatus.FAILED,
                message="Navigate action requires URL",
                execution_time=0.0
            )
        
        success = await self.backend.navigate(request.url, request.timeout)
        
        if success:
            self.current_page_url = request.url
            self.metrics['navigation_count'] += 1
        
        return WebActionResult(
            success=success,
            status=WebActionStatus.SUCCESS if success else WebActionStatus.NAVIGATION_FAILED,
            message=f"Navigation to {request.url} {'succeeded' if success else 'failed'}",
            execution_time=0.0,
            page_url=request.url if success else None
        )
    
    async def _handle_click(self, request: WebActionRequest) -> WebActionResult:
        """Handle click action."""
        
        if not request.element:
            return WebActionResult(
                success=False,
                status=WebActionStatus.FAILED,
                message="Click action requires element locator",
                execution_time=0.0
            )
        
        # Find element first
        element_found = await self.backend.find_element(request.element)
        if not element_found:
            return WebActionResult(
                success=False,
                status=WebActionStatus.ELEMENT_NOT_FOUND,
                message=f"Element not found: {request.element.value}",
                execution_time=0.0
            )
        
        # Click element
        success = await self.backend.click_element(request.element)
        
        return WebActionResult(
            success=success,
            status=WebActionStatus.SUCCESS if success else WebActionStatus.FAILED,
            message=f"Click on {request.element.value} {'succeeded' if success else 'failed'}",
            execution_time=0.0,
            element_found=element_found
        )
    
    async def _handle_fill(self, request: WebActionRequest) -> WebActionResult:
        """Handle fill action."""
        
        if not request.element or not request.value:
            return WebActionResult(
                success=False,
                status=WebActionStatus.FAILED,
                message="Fill action requires element locator and value",
                execution_time=0.0
            )
        
        # Find element first
        element_found = await self.backend.find_element(request.element)
        if not element_found:
            return WebActionResult(
                success=False,
                status=WebActionStatus.ELEMENT_NOT_FOUND,
                message=f"Element not found: {request.element.value}",
                execution_time=0.0
            )
        
        # Fill element
        success = await self.backend.fill_element(request.element, request.value)
        
        return WebActionResult(
            success=success,
            status=WebActionStatus.SUCCESS if success else WebActionStatus.FAILED,
            message=f"Fill {request.element.value} with '{request.value[:50]}...' {'succeeded' if success else 'failed'}",
            execution_time=0.0,
            element_found=element_found
        )
    
    async def _handle_screenshot(self, request: WebActionRequest) -> WebActionResult:
        """Handle screenshot action."""
        
        try:
            screenshot_path = request.options.get('path') if request.options else None
            screenshot_path = await self.backend.take_screenshot(screenshot_path)
            
            self.metrics['screenshot_count'] += 1
            
            return WebActionResult(
                success=True,
                status=WebActionStatus.SUCCESS,
                message=f"Screenshot saved: {screenshot_path}",
                execution_time=0.0,
                screenshot_path=screenshot_path
            )
            
        except Exception as e:
            return WebActionResult(
                success=False,
                status=WebActionStatus.FAILED,
                message=f"Screenshot failed: {str(e)}",
                execution_time=0.0
            )
    
    async def _handle_get_text(self, request: WebActionRequest) -> WebActionResult:
        """Handle get text action."""
        
        if not request.element:
            return WebActionResult(
                success=False,
                status=WebActionStatus.FAILED,
                message="Get text action requires element locator",
                execution_time=0.0
            )
        
        # Find element first
        element_found = await self.backend.find_element(request.element)
        if not element_found:
            return WebActionResult(
                success=False,
                status=WebActionStatus.ELEMENT_NOT_FOUND,
                message=f"Element not found: {request.element.value}",
                execution_time=0.0
            )
        
        # Get text
        text_content = await self.backend.get_element_text(request.element)
        
        return WebActionResult(
            success=text_content is not None,
            status=WebActionStatus.SUCCESS if text_content is not None else WebActionStatus.FAILED,
            message=f"Text extraction {'succeeded' if text_content else 'failed'}",
            execution_time=0.0,
            response_data=text_content,
            element_found=element_found
        )
    
    async def _handle_execute_script(self, request: WebActionRequest) -> WebActionResult:
        """Handle JavaScript execution."""
        
        script = request.value or request.options.get('script', '') if request.options else ''
        if not script:
            return WebActionResult(
                success=False,
                status=WebActionStatus.FAILED,
                message="Execute script action requires script content",
                execution_time=0.0
            )
        
        try:
            result = await self.backend.execute_script(script)
            
            return WebActionResult(
                success=True,
                status=WebActionStatus.SUCCESS,
                message="Script executed successfully",
                execution_time=0.0,
                response_data=result
            )
            
        except Exception as e:
            return WebActionResult(
                success=False,
                status=WebActionStatus.SCRIPT_ERROR,
                message=f"Script execution failed: {str(e)}",
                execution_time=0.0
            )
    
    async def _handle_set_cookie(self, request: WebActionRequest) -> WebActionResult:
        """Handle set cookie action."""
        
        if not request.options or 'name' not in request.options or 'value' not in request.options:
            return WebActionResult(
                success=False,
                status=WebActionStatus.FAILED,
                message="Set cookie action requires name and value",
                execution_time=0.0
            )
        
        name = request.options['name']
        value = request.options['value']
        domain = request.options.get('domain')
        
        success = await self.backend.set_cookie(name, value, domain)
        
        if success:
            self.session_cookies[name] = value
        
        return WebActionResult(
            success=success,
            status=WebActionStatus.SUCCESS if success else WebActionStatus.FAILED,
            message=f"Set cookie {name} {'succeeded' if success else 'failed'}",
            execution_time=0.0
        )
    
    async def _handle_get_cookies(self, request: WebActionRequest) -> WebActionResult:
        """Handle get cookies action."""
        
        try:
            cookies = await self.backend.get_cookies()
            
            return WebActionResult(
                success=True,
                status=WebActionStatus.SUCCESS,
                message=f"Retrieved {len(cookies)} cookies",
                execution_time=0.0,
                response_data=cookies
            )
            
        except Exception as e:
            return WebActionResult(
                success=False,
                status=WebActionStatus.FAILED,
                message=f"Get cookies failed: {str(e)}",
                execution_time=0.0
            )
    
    async def _handle_wait(self, request: WebActionRequest) -> WebActionResult:
        """Handle wait action."""
        
        duration = float(request.value or request.options.get('duration', 1.0) if request.options else 1.0)
        
        await asyncio.sleep(duration)
        
        return WebActionResult(
            success=True,
            status=WebActionStatus.SUCCESS,
            message=f"Wait completed: {duration} seconds",
            execution_time=duration
        )
    
    def _validate_request(self, request: WebActionRequest) -> bool:
        """Validate web action request parameters."""
        
        if not isinstance(request.action_type, WebActionType):
            return False
        
        # Action-specific validation
        if request.action_type == WebActionType.NAVIGATE:
            if not request.url:
                return False
        
        if request.action_type in [WebActionType.CLICK, WebActionType.FILL, WebActionType.GET_TEXT]:
            if not request.element:
                return False
        
        if request.action_type == WebActionType.FILL:
            if not request.value:
                return False
        
        return True
    
    def _update_metrics(self, request: WebActionRequest, result: WebActionResult = None, failed: bool = False):
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
    
    def _store_action_history(self, request: WebActionRequest, result: WebActionResult):
        """Store action in history."""
        
        self.action_history.append({
            'timestamp': time.time(),
            'action_type': request.action_type.value,
            'url': request.url,
            'element': request.element.value if request.element else None,
            'success': result.success,
            'execution_time': result.execution_time
        })
        
        # Keep only recent history
        if len(self.action_history) > 50:
            self.action_history = self.action_history[-25:]
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get web action performance metrics."""
        
        total_actions = self.metrics['actions_executed']
        
        if total_actions == 0:
            return {'message': 'No web actions executed yet'}
        
        success_rate = self.metrics['successful_actions'] / total_actions
        
        return {
            'performance_summary': {
                'total_actions': total_actions,
                'successful_actions': self.metrics['successful_actions'],
                'failed_actions': self.metrics['failed_actions'],
                'success_rate': success_rate,
                'average_execution_time': self.metrics['average_execution_time'],
                'navigation_count': self.metrics['navigation_count'],
                'screenshot_count': self.metrics['screenshot_count']
            },
            'action_distribution': self.metrics['action_type_distribution'],
            'session_state': {
                'current_page_url': self.current_page_url,
                'session_cookies': len(self.session_cookies),
                'browser_initialized': getattr(self.backend, 'browser_initialized', False)
            },
            'capabilities': {
                'supported_actions': [action.value for action in WebActionType],
                'locator_types': [locator.value for locator in ElementLocatorType],
                'backend_type': type(self.backend).__name__
            }
        }
    
    async def close_browser(self):
        """Close browser and cleanup resources."""
        
        try:
            await self.backend.close()
            self.logger.info("Browser closed successfully")
        except Exception as e:
            self.logger.error(f"Browser close failed: {str(e)}")