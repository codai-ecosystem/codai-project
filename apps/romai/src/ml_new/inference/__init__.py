"""
🚀 RomAI Inference Package

Inference and serving components following Microsoft Azure ML best practices.
Contains AGI server, model server, and serving infrastructure.
"""

from .agi_server import AGIServer

__all__ = [
    'AGIServer'
]

__version__ = "1.0.0"
__author__ = "RomAI Team"
__description__ = "Inference and serving infrastructure"
