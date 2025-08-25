"""
RomAI Logging System
====================

Centralized logging configuration for the RomAI AGI system.
"""

import logging
import logging.handlers
import os
import sys
from datetime import datetime
from typing import Optional
from .config import get_config


class ColoredFormatter(logging.Formatter):
    """Colored console formatter for better readability"""
    
    COLORS = {
        'DEBUG': '\033[36m',     # Cyan
        'INFO': '\033[32m',      # Green
        'WARNING': '\033[33m',   # Yellow
        'ERROR': '\033[31m',     # Red
        'CRITICAL': '\033[35m',  # Magenta
        'RESET': '\033[0m'       # Reset
    }
    
    def format(self, record):
        if record.levelname in self.COLORS:
            record.levelname = f"{self.COLORS[record.levelname]}{record.levelname}{self.COLORS['RESET']}"
        return super().format(record)


def setup_logging(
    level: Optional[str] = None,
    log_file: Optional[str] = None,
    console: bool = True
) -> logging.Logger:
    """
    Set up the logging system for RomAI
    
    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Path to log file (optional)
        console: Whether to log to console (default: True)
    
    Returns:
        Configured logger instance
    """
    config = get_config()
    
    # Use provided level or config level or default to INFO
    if level is None:
        level = config.log_level
    
    # Create logger
    logger = logging.getLogger("romai")
    logger.setLevel(getattr(logging, level.upper()))
    
    # Clear existing handlers
    logger.handlers.clear()
    
    # Create formatters
    detailed_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    simple_formatter = ColoredFormatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%H:%M:%S'
    )
    
    # Console handler
    if console:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(simple_formatter)
        logger.addHandler(console_handler)
    
    # File handler
    if log_file:
        # Create log directory if it doesn't exist
        log_dir = os.path.dirname(log_file)
        if log_dir:
            os.makedirs(log_dir, exist_ok=True)
        
        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        file_handler.setFormatter(detailed_formatter)
        logger.addHandler(file_handler)
    
    # Add a null handler to prevent "No handler found" warnings
    logger.addHandler(logging.NullHandler())
    
    return logger


def get_logger(name: str = "romai") -> logging.Logger:
    """
    Get a logger instance with the specified name
    
    Args:
        name: Logger name (default: "romai")
    
    Returns:
        Logger instance
    """
    logger = logging.getLogger(name)
    
    # If this is the first time getting this logger, set it up
    if not logger.handlers and name == "romai":
        config = get_config()
        log_file = None
        
        if config.log_path:
            timestamp = datetime.now().strftime("%Y%m%d")
            log_file = os.path.join(config.log_path, f"romai_{timestamp}.log")
        
        setup_logging(
            level=config.log_level,
            log_file=log_file,
            console=config.debug
        )
    
    return logger


# Convenience functions for different log levels
def debug(msg: str, *args, **kwargs):
    """Log debug message"""
    get_logger().debug(msg, *args, **kwargs)


def info(msg: str, *args, **kwargs):
    """Log info message"""
    get_logger().info(msg, *args, **kwargs)


def warning(msg: str, *args, **kwargs):
    """Log warning message"""
    get_logger().warning(msg, *args, **kwargs)


def error(msg: str, *args, **kwargs):
    """Log error message"""
    get_logger().error(msg, *args, **kwargs)


def critical(msg: str, *args, **kwargs):
    """Log critical message"""
    get_logger().critical(msg, *args, **kwargs)
