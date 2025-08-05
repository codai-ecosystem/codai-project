"""
MemorAI Python Client - Exception Classes
Custom exceptions for better error handling
"""


class MemorAIError(Exception):
    """Base exception for all MemorAI errors"""
    
    def __init__(self, message: str, details=None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class MemorAIAPIError(MemorAIError):
    """API-related errors"""
    
    def __init__(self, message: str, status_code: int = None, response_data=None):
        self.status_code = status_code
        self.response_data = response_data or {}
        super().__init__(message, {"status_code": status_code, "response": response_data})


class MemorAIAuthError(MemorAIAPIError):
    """Authentication/Authorization errors"""
    
    def __init__(self, message: str = "Authentication failed", status_code: int = 401):
        super().__init__(message, status_code)


class MemorAIRateLimitError(MemorAIAPIError):
    """Rate limiting errors"""
    
    def __init__(self, message: str = "Rate limit exceeded", retry_after: int = None):
        self.retry_after = retry_after
        super().__init__(message, 429, {"retry_after": retry_after})


class MemorAIConnectionError(MemorAIError):
    """Connection-related errors"""
    
    def __init__(self, message: str = "Connection failed", original_error=None):
        self.original_error = original_error
        super().__init__(message, {"original_error": str(original_error) if original_error else None})


class MemorAIValidationError(MemorAIError):
    """Data validation errors"""
    
    def __init__(self, message: str, field: str = None, value=None):
        self.field = field
        self.value = value
        super().__init__(message, {"field": field, "value": value})


class MemorAITimeoutError(MemorAIError):
    """Request timeout errors"""
    
    def __init__(self, message: str = "Request timed out", timeout: float = None):
        self.timeout = timeout
        super().__init__(message, {"timeout": timeout})


class MemorAIWebSocketError(MemorAIError):
    """WebSocket-related errors"""
    
    def __init__(self, message: str, event_type: str = None):
        self.event_type = event_type
        super().__init__(message, {"event_type": event_type})
