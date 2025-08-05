"""
RomAI Validation System
=======================

Comprehensive validation utilities for the RomAI AGI system.
"""

import re
import os
from typing import Any, Dict, List, Optional, Union, Callable
from dataclasses import dataclass
from enum import Enum

from .exceptions import (
    DataValidationError,
    CulturalValidationError,
    ValidationError
)


class ValidationType(Enum):
    """Types of validation"""
    REQUIRED = "required"
    TYPE = "type"
    RANGE = "range"
    FORMAT = "format"
    CUSTOM = "custom"
    CULTURAL = "cultural"


@dataclass
class ValidationRule:
    """A single validation rule"""
    rule_type: ValidationType
    value: Any
    message: Optional[str] = None
    custom_validator: Optional[Callable] = None


@dataclass
class ValidationResult:
    """Result of validation"""
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    
    def add_error(self, message: str):
        """Add an error message"""
        self.errors.append(message)
        self.is_valid = False
    
    def add_warning(self, message: str):
        """Add a warning message"""
        self.warnings.append(message)


class DataValidator:
    """Main validation class for RomAI data"""
    
    # Romanian text patterns
    ROMANIAN_PATTERNS = {
        'diacritics': re.compile(r'[ăâîșțĂÂÎȘȚ]'),
        'romanian_words': re.compile(r'\b(și|în|de|la|cu|pe|pentru|către|din|prin|după|până|înainte|despre|între|asupra|sub|lângă|peste|contra|împotriva|datorită|conform|potrivit)\b', re.IGNORECASE),
        'traditional_names': re.compile(r'\b(Maria|Ion|Ana|Gheorghe|Elena|Vasile|Ioana|Nicolae|Mihai|Cristina|Alexandru|Andreea|Florin|Carmen|Dan|Alina|Bogdan|Diana|Cătălin|Oana|Adrian|Raluca|Marian|Simona|Claudiu|Monica|Sorin|Daniela|Dragoș|Livia|Ciprian|Roxana)\b'),
        'romanian_cities': re.compile(r'\b(București|Cluj-Napoca|Iași|Timișoara|Constanța|Craiova|Brașov|Galați|Ploiești|Oradea|Braila|Arad|Pitești|Sibiu|Bacău|Târgu Mureș|Baia Mare|Buzău|Botoșani|Satu Mare|Râmnicu Vâlcea|Drobeta-Turnu Severin|Suceava|Piatra Neamț|Tulcea|Focșani|Târgoviște|Târgu Jiu|Hunedoara|Miercurea Ciuc|Deva|Reșița|Alba Iulia|Bistrița|Călărași|Giurgiu|Rosiori de Vede|Zalău|Onești|Turda|Mediaș|Voluntari|Lugoj|Medgidia|Onești|Gheorgheni|Mangalia|Curtea de Argeș|Sfântu Gheorghe|Petroșani|Slobozia|Vaslui|Roman|Turnu Măgurele|Dorohoi|Râmnicu Sărat|Caracal|Dej|Devă|Făgăraș|Câmpina|Comănești|Mioveni|Caransebeș|Filiași|Codlea|Năvodari|Topoloveni|Roșiorii de Vede)\b', re.IGNORECASE)
    }
    
    def __init__(self):
        self.validation_rules: Dict[str, List[ValidationRule]] = {}
    
    def add_rule(self, field: str, rule: ValidationRule):
        """Add a validation rule for a field"""
        if field not in self.validation_rules:
            self.validation_rules[field] = []
        self.validation_rules[field].append(rule)
    
    def validate_required(self, value: Any, field_name: str) -> ValidationResult:
        """Validate that a value is required (not None, empty, etc.)"""
        result = ValidationResult(True, [], [])
        
        if value is None:
            result.add_error(f"{field_name} is required")
        elif isinstance(value, str) and not value.strip():
            result.add_error(f"{field_name} cannot be empty")
        elif isinstance(value, (list, dict)) and len(value) == 0:
            result.add_error(f"{field_name} cannot be empty")
        
        return result
    
    def validate_type(self, value: Any, expected_type: type, field_name: str) -> ValidationResult:
        """Validate that a value is of the expected type"""
        result = ValidationResult(True, [], [])
        
        if not isinstance(value, expected_type):
            result.add_error(f"{field_name} must be of type {expected_type.__name__}, got {type(value).__name__}")
        
        return result
    
    def validate_range(self, value: Union[int, float], min_val: Optional[float], max_val: Optional[float], field_name: str) -> ValidationResult:
        """Validate that a numeric value is within range"""
        result = ValidationResult(True, [], [])
        
        if min_val is not None and value < min_val:
            result.add_error(f"{field_name} must be >= {min_val}, got {value}")
        
        if max_val is not None and value > max_val:
            result.add_error(f"{field_name} must be <= {max_val}, got {value}")
        
        return result
    
    def validate_format(self, value: str, pattern: Union[str, re.Pattern], field_name: str) -> ValidationResult:
        """Validate that a string matches a pattern"""
        result = ValidationResult(True, [], [])
        
        if isinstance(pattern, str):
            pattern = re.compile(pattern)
        
        if not pattern.match(value):
            result.add_error(f"{field_name} format is invalid")
        
        return result
    
    def validate_romanian_cultural(self, value: str, field_name: str) -> ValidationResult:
        """Validate Romanian cultural authenticity"""
        result = ValidationResult(True, [], [])
        
        # Check for Romanian diacritics
        if not self.ROMANIAN_PATTERNS['diacritics'].search(value):
            result.add_warning(f"{field_name} lacks Romanian diacritics - consider authenticity")
        
        # Check for Romanian words
        if not self.ROMANIAN_PATTERNS['romanian_words'].search(value):
            result.add_warning(f"{field_name} lacks common Romanian words")
        
        # Validate Romanian place names
        if 'location' in field_name.lower() or 'city' in field_name.lower():
            if not self.ROMANIAN_PATTERNS['romanian_cities'].search(value):
                result.add_warning(f"{field_name} should use authentic Romanian place names")
        
        return result
    
    def validate_file_path(self, path: str, field_name: str, must_exist: bool = True) -> ValidationResult:
        """Validate file path"""
        result = ValidationResult(True, [], [])
        
        if not isinstance(path, str):
            result.add_error(f"{field_name} must be a string path")
            return result
        
        if must_exist and not os.path.exists(path):
            result.add_error(f"{field_name} path does not exist: {path}")
        
        # Check for valid path format
        try:
            os.path.normpath(path)
        except (ValueError, TypeError):
            result.add_error(f"{field_name} is not a valid path format")
        
        return result
    
    def validate_email(self, email: str, field_name: str) -> ValidationResult:
        """Validate email format"""
        result = ValidationResult(True, [], [])
        
        email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        if not email_pattern.match(email):
            result.add_error(f"{field_name} is not a valid email format")
        
        return result
    
    def validate_url(self, url: str, field_name: str) -> ValidationResult:
        """Validate URL format"""
        result = ValidationResult(True, [], [])
        
        url_pattern = re.compile(r'^https?://(?:[-\w.])+(?:\:[0-9]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$')
        if not url_pattern.match(url):
            result.add_error(f"{field_name} is not a valid URL format")
        
        return result
    
    def validate_model_path(self, path: str, field_name: str) -> ValidationResult:
        """Validate model file path"""
        result = ValidationResult(True, [], [])
        
        # First validate as file path
        path_result = self.validate_file_path(path, field_name, must_exist=False)
        result.errors.extend(path_result.errors)
        result.warnings.extend(path_result.warnings)
        
        # Check for model file extensions
        valid_extensions = ['.pt', '.pth', '.ckpt', '.pkl', '.joblib', '.h5', '.pb', '.onnx']
        if not any(path.endswith(ext) for ext in valid_extensions):
            result.add_warning(f"{field_name} does not have a recognized model file extension")
        
        return result
    
    def validate_data(self, data: Dict[str, Any]) -> ValidationResult:
        """Validate a data dictionary against all rules"""
        result = ValidationResult(True, [], [])
        
        for field_name, rules in self.validation_rules.items():
            if field_name not in data:
                # Check if field is required
                for rule in rules:
                    if rule.rule_type == ValidationType.REQUIRED:
                        result.add_error(f"Required field {field_name} is missing")
                        break
                continue
            
            field_value = data[field_name]
            
            for rule in rules:
                field_result = self._apply_rule(field_value, rule, field_name)
                result.errors.extend(field_result.errors)
                result.warnings.extend(field_result.warnings)
                if not field_result.is_valid:
                    result.is_valid = False
        
        return result
    
    def _apply_rule(self, value: Any, rule: ValidationRule, field_name: str) -> ValidationResult:
        """Apply a single validation rule"""
        if rule.rule_type == ValidationType.REQUIRED:
            return self.validate_required(value, field_name)
        elif rule.rule_type == ValidationType.TYPE:
            return self.validate_type(value, rule.value, field_name)
        elif rule.rule_type == ValidationType.RANGE:
            min_val, max_val = rule.value
            return self.validate_range(value, min_val, max_val, field_name)
        elif rule.rule_type == ValidationType.FORMAT:
            return self.validate_format(value, rule.value, field_name)
        elif rule.rule_type == ValidationType.CULTURAL:
            return self.validate_romanian_cultural(value, field_name)
        elif rule.rule_type == ValidationType.CUSTOM and rule.custom_validator:
            try:
                custom_result = rule.custom_validator(value, field_name)
                if isinstance(custom_result, bool):
                    result = ValidationResult(custom_result, [], [])
                    if not custom_result:
                        result.add_error(rule.message or f"{field_name} failed custom validation")
                else:
                    result = custom_result
                return result
            except Exception as e:
                result = ValidationResult(False, [], [])
                result.add_error(f"Custom validation failed for {field_name}: {e}")
                return result
        
        return ValidationResult(True, [], [])


# Pre-configured validators for common use cases
def create_model_config_validator() -> DataValidator:
    """Create validator for model configuration"""
    validator = DataValidator()
    
    # Required fields
    validator.add_rule("model_name", ValidationRule(ValidationType.REQUIRED, None))
    validator.add_rule("model_path", ValidationRule(ValidationType.REQUIRED, None))
    
    # Type validations
    validator.add_rule("model_name", ValidationRule(ValidationType.TYPE, str))
    validator.add_rule("model_path", ValidationRule(ValidationType.TYPE, str))
    validator.add_rule("batch_size", ValidationRule(ValidationType.TYPE, int))
    validator.add_rule("learning_rate", ValidationRule(ValidationType.TYPE, float))
    
    # Range validations
    validator.add_rule("batch_size", ValidationRule(ValidationType.RANGE, (1, 1024)))
    validator.add_rule("learning_rate", ValidationRule(ValidationType.RANGE, (0.0001, 1.0)))
    
    return validator


def create_romanian_cultural_validator() -> DataValidator:
    """Create validator for Romanian cultural content"""
    validator = DataValidator()
    
    # Cultural authenticity checks
    validator.add_rule("content", ValidationRule(ValidationType.CULTURAL, None))
    validator.add_rule("location", ValidationRule(ValidationType.CULTURAL, None))
    validator.add_rule("cultural_context", ValidationRule(ValidationType.CULTURAL, None))
    
    return validator


def validate_performance_metrics(metrics: Dict[str, float]) -> ValidationResult:
    """Validate performance metrics dictionary"""
    validator = DataValidator()
    
    # Common performance metrics
    for metric in ["accuracy", "precision", "recall", "f1_score"]:
        if metric in metrics:
            validator.add_rule(metric, ValidationRule(ValidationType.RANGE, (0.0, 1.0)))
    
    return validator.validate_data(metrics)
