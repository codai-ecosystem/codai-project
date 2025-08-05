package ro.memorai.client;

/**
 * Base exception for all MemorAI client errors
 */
public class MemorAIException extends RuntimeException {
    private final String errorCode;
    private final int statusCode;
    
    public MemorAIException(String message) {
        super(message);
        this.errorCode = null;
        this.statusCode = 0;
    }
    
    public MemorAIException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = null;
        this.statusCode = 0;
    }
    
    public MemorAIException(String message, String errorCode, int statusCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
    }
    
    public MemorAIException(String message, String errorCode, int statusCode, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public int getStatusCode() {
        return statusCode;
    }
}

/**
 * Exception thrown when authentication fails
 */
class AuthenticationException extends MemorAIException {
    public AuthenticationException(String message) {
        super(message, "AUTHENTICATION_FAILED", 401);
    }
    
    public AuthenticationException(String message, Throwable cause) {
        super(message, "AUTHENTICATION_FAILED", 401, cause);
    }
}

/**
 * Exception thrown when authorization fails
 */
class AuthorizationException extends MemorAIException {
    public AuthorizationException(String message) {
        super(message, "AUTHORIZATION_FAILED", 403);
    }
    
    public AuthorizationException(String message, Throwable cause) {
        super(message, "AUTHORIZATION_FAILED", 403, cause);
    }
}

/**
 * Exception thrown when a resource is not found
 */
class NotFoundException extends MemorAIException {
    public NotFoundException(String message) {
        super(message, "RESOURCE_NOT_FOUND", 404);
    }
    
    public NotFoundException(String message, Throwable cause) {
        super(message, "RESOURCE_NOT_FOUND", 404, cause);
    }
}

/**
 * Exception thrown when rate limit is exceeded
 */
class RateLimitException extends MemorAIException {
    private final long retryAfter;
    
    public RateLimitException(String message, long retryAfter) {
        super(message, "RATE_LIMIT_EXCEEDED", 429);
        this.retryAfter = retryAfter;
    }
    
    public long getRetryAfter() {
        return retryAfter;
    }
}

/**
 * Exception thrown when validation fails
 */
class ValidationException extends MemorAIException {
    public ValidationException(String message) {
        super(message, "VALIDATION_FAILED", 400);
    }
    
    public ValidationException(String message, Throwable cause) {
        super(message, "VALIDATION_FAILED", 400, cause);
    }
}

/**
 * Exception thrown when server errors occur
 */
class ServerException extends MemorAIException {
    public ServerException(String message) {
        super(message, "SERVER_ERROR", 500);
    }
    
    public ServerException(String message, Throwable cause) {
        super(message, "SERVER_ERROR", 500, cause);
    }
}
