#!/usr/bin/env python3
"""
RomAI Phase 2 Mathematical Reasoning Processor
Advanced mathematical reasoning with multilingual support and enhanced parsing
"""

import os
import sys
import json
import asyncio
import logging
import re
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
import math
import sympy as sp
from sympy import symbols, expand, factor, diff, integrate, solve, simplify, latex
from sympy.parsing.sympy_parser import parse_expr
import numpy as np

# Add project root to path
sys.path.append('/home/ubuntu/romai_phase2')
from configs.phase2_config import Phase2Config

@dataclass
class MathematicalProblem:
    """Represents a mathematical problem with solution"""
    problem: str
    solution: str
    steps: List[str]
    difficulty: str
    category: str
    language: str = "en"
    confidence: float = 0.0
    processing_time: float = 0.0

@dataclass
class ProcessingStats:
    """Statistics for mathematical processing"""
    total_problems: int = 0
    successful: int = 0
    failed: int = 0
    by_category: Dict[str, int] = None
    by_difficulty: Dict[str, int] = None
    by_language: Dict[str, int] = None
    average_confidence: float = 0.0
    total_processing_time: float = 0.0
    
    def __post_init__(self):
        if self.by_category is None:
            self.by_category = {}
        if self.by_difficulty is None:
            self.by_difficulty = {}
        if self.by_language is None:
            self.by_language = {}

class EnhancedMathematicalProcessor:
    """Advanced mathematical reasoning processor with multilingual support"""
    
    def __init__(self):
        self.config = Phase2Config()
        self.logger = self._setup_logging()
        self.stats = ProcessingStats()
        
        # Enhanced parsing patterns for multilingual support
        self.parsing_patterns = self._initialize_parsing_patterns()
        
        # Mathematical operation mappings
        self.operations = {
            'derivative': self._compute_derivative,
            'integral': self._compute_integral,
            'solve': self._solve_equation,
            'simplify': self._simplify_expression,
            'factor': self._factor_expression,
            'expand': self._expand_expression,
            'limit': self._compute_limit,
            'series': self._compute_series
        }
        
    def _setup_logging(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger("math_processor")
        logger.setLevel(logging.INFO)
        
        # Create logs directory
        self.config.LOGS_DIR.mkdir(parents=True, exist_ok=True)
        
        # File handler
        fh = logging.FileHandler(self.config.LOGS_DIR / "math_processing.log")
        fh.setLevel(logging.INFO)
        
        # Console handler
        ch = logging.StreamHandler()
        ch.setLevel(logging.INFO)
        
        # Formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        fh.setFormatter(formatter)
        ch.setFormatter(formatter)
        
        logger.addHandler(fh)
        logger.addHandler(ch)
        
        return logger
    
    def _initialize_parsing_patterns(self) -> Dict[str, List[str]]:
        """Initialize comprehensive multilingual mathematical parsing patterns"""
        return {
            "english": [
                r"what is the derivative of (.+?)\?",
                r"find the derivative of (.+)",
                r"differentiate (.+)",
                r"solve (.+?) = (.+)",
                r"find the integral of (.+)",
                r"integrate (.+?) dx",
                r"factor (.+)",
                r"expand (.+)",
                r"simplify (.+)",
                r"what is (.+?)\?",
                r"calculate (.+)",
                r"find (.+)"
            ],
            "romanian": [
                r"care este derivata (?:funcției )?(.+?)\?",
                r"calculează derivata (?:pentru )?(.+)",
                r"diferențiază (.+)",
                r"rezolvă ecuația (.+?) = (.+)",
                r"găsește integrala (?:pentru )?(.+)",
                r"integrează (.+?) dx",
                r"factorizează (.+)",
                r"dezvoltă (.+)",
                r"simplifică (.+)",
                r"cât (?:face|este) (.+?)\?",
                r"calculează (.+)",
                r"găsește (.+)"
            ]
        }
    
    def _detect_language(self, text: str) -> str:
        """Detect language of mathematical problem"""
        # Romanian language indicators
        romanian_words = ['derivata', 'integrala', 'ecuația', 'calculează', 'găsește', 'simplifică', 'factorizează', 'dezvoltă']
        
        text_lower = text.lower()
        romanian_count = sum(1 for word in romanian_words if word in text_lower)
        
        return "ro" if romanian_count > 0 else "en"
    
    def _parse_mathematical_expression(self, text: str) -> Tuple[Optional[str], str, float]:
        """Parse mathematical expression from natural language"""
        text_clean = text.strip().lower()
        language = self._detect_language(text)
        
        # Try patterns for detected language
        patterns = self.parsing_patterns.get(language, self.parsing_patterns["english"])
        
        for pattern in patterns:
            match = re.search(pattern, text_clean, re.IGNORECASE)
            if match:
                expression = match.group(1).strip()
                
                # Clean mathematical expression
                expression = self._clean_mathematical_expression(expression)
                
                return expression, language, 0.9
        
        # Fallback: try to extract any mathematical expression
        math_pattern = r'([x-z]\^?\d*[+\-*/]?[x-z\d\^+\-*/()\.]+)'
        match = re.search(math_pattern, text_clean)
        if match:
            return match.group(1), language, 0.6
        
        return None, language, 0.0
    
    def _clean_mathematical_expression(self, expr: str) -> str:
        """Clean and normalize mathematical expression"""
        # Remove common words
        expr = re.sub(r'\b(of|the|function|f\(x\)|pentru|funcția)\b', '', expr, flags=re.IGNORECASE)
        
        # Normalize mathematical operators
        expr = expr.replace(' ', '').replace('×', '*').replace('÷', '/')
        
        # Handle power notation
        expr = re.sub(r'x\^(\d+)', r'x**\1', expr)
        expr = re.sub(r'(\w)\^(\d+)', r'\1**\2', expr)
        
        return expr.strip()
    
    def _compute_derivative(self, expression: str) -> Tuple[str, List[str]]:
        """Compute derivative of mathematical expression"""
        try:
            x = symbols('x')
            expr = parse_expr(expression)
            derivative = diff(expr, x)
            
            steps = [
                f"Original function: f(x) = {expression}",
                f"Apply differentiation rules",
                f"Result: f'(x) = {derivative}"
            ]
            
            return str(derivative), steps
            
        except Exception as e:
            self.logger.warning(f"Failed to compute derivative of {expression}: {e}")
            return f"Error computing derivative: {e}", []
    
    def _compute_integral(self, expression: str) -> Tuple[str, List[str]]:
        """Compute integral of mathematical expression"""
        try:
            x = symbols('x')
            expr = parse_expr(expression)
            integral = integrate(expr, x)
            
            steps = [
                f"Original function: f(x) = {expression}",
                f"Apply integration rules",
                f"Result: ∫f(x)dx = {integral} + C"
            ]
            
            return f"{integral} + C", steps
            
        except Exception as e:
            self.logger.warning(f"Failed to compute integral of {expression}: {e}")
            return f"Error computing integral: {e}", []
    
    def _solve_equation(self, equation: str) -> Tuple[str, List[str]]:
        """Solve mathematical equation"""
        try:
            # Handle equation format
            if '=' in equation:
                left, right = equation.split('=', 1)
                expr = parse_expr(f"({left}) - ({right})")
            else:
                expr = parse_expr(equation)
            
            x = symbols('x')
            solutions = solve(expr, x)
            
            steps = [
                f"Original equation: {equation}",
                f"Rearrange to standard form",
                f"Apply solution methods",
                f"Solutions: {solutions}"
            ]
            
            if len(solutions) == 1:
                return f"x = {solutions[0]}", steps
            else:
                return f"x = {solutions}", steps
            
        except Exception as e:
            self.logger.warning(f"Failed to solve equation {equation}: {e}")
            return f"Error solving equation: {e}", []
    
    def _simplify_expression(self, expression: str) -> Tuple[str, List[str]]:
        """Simplify mathematical expression"""
        try:
            expr = parse_expr(expression)
            simplified = simplify(expr)
            
            steps = [
                f"Original expression: {expression}",
                f"Apply simplification rules",
                f"Result: {simplified}"
            ]
            
            return str(simplified), steps
            
        except Exception as e:
            self.logger.warning(f"Failed to simplify {expression}: {e}")
            return f"Error simplifying: {e}", []
    
    def _factor_expression(self, expression: str) -> Tuple[str, List[str]]:
        """Factor mathematical expression"""
        try:
            expr = parse_expr(expression)
            factored = factor(expr)
            
            steps = [
                f"Original expression: {expression}",
                f"Apply factorization techniques",
                f"Result: {factored}"
            ]
            
            return str(factored), steps
            
        except Exception as e:
            self.logger.warning(f"Failed to factor {expression}: {e}")
            return f"Error factoring: {e}", []
    
    def _expand_expression(self, expression: str) -> Tuple[str, List[str]]:
        """Expand mathematical expression"""
        try:
            expr = parse_expr(expression)
            expanded = expand(expr)
            
            steps = [
                f"Original expression: {expression}",
                f"Apply expansion rules",
                f"Result: {expanded}"
            ]
            
            return str(expanded), steps
            
        except Exception as e:
            self.logger.warning(f"Failed to expand {expression}: {e}")
            return f"Error expanding: {e}", []
    
    def _compute_limit(self, expression: str) -> Tuple[str, List[str]]:
        """Compute limit of expression"""
        # Placeholder for limit computation
        return "Limit computation not implemented", ["Placeholder for limit steps"]
    
    def _compute_series(self, expression: str) -> Tuple[str, List[str]]:
        """Compute series expansion"""
        # Placeholder for series computation
        return "Series computation not implemented", ["Placeholder for series steps"]
    
    def _determine_operation_type(self, problem: str, language: str) -> str:
        """Determine the type of mathematical operation required"""
        problem_lower = problem.lower()
        
        # English patterns
        if language == "en":
            if any(word in problem_lower for word in ["derivative", "differentiate", "d/dx"]):
                return "derivative"
            elif any(word in problem_lower for word in ["integral", "integrate", "∫"]):
                return "integral"
            elif any(word in problem_lower for word in ["solve", "equation", "="]):
                return "solve"
            elif "factor" in problem_lower:
                return "factor"
            elif "expand" in problem_lower:
                return "expand"
            elif "simplify" in problem_lower:
                return "simplify"
        
        # Romanian patterns
        elif language == "ro":
            if any(word in problem_lower for word in ["derivata", "diferențiază"]):
                return "derivative"
            elif any(word in problem_lower for word in ["integrala", "integrează"]):
                return "integral"
            elif any(word in problem_lower for word in ["rezolvă", "ecuația", "="]):
                return "solve"
            elif "factorizează" in problem_lower:
                return "factor"
            elif "dezvoltă" in problem_lower:
                return "expand"
            elif "simplifică" in problem_lower:
                return "simplify"
        
        return "simplify"  # Default operation
    
    async def process_mathematical_problem(self, problem_text: str) -> MathematicalProblem:
        """Process a single mathematical problem"""
        start_time = datetime.now()
        
        # Parse expression from natural language
        expression, language, confidence = self._parse_mathematical_expression(problem_text)
        
        if not expression:
            return MathematicalProblem(
                problem=problem_text,
                solution="Could not parse mathematical expression",
                steps=["Failed to identify mathematical expression in problem"],
                difficulty="unknown",
                category="parsing_error",
                language=language,
                confidence=0.0,
                processing_time=0.0
            )
        
        # Determine operation type
        operation_type = self._determine_operation_type(problem_text, language)
        
        # Perform mathematical operation
        try:
            if operation_type in self.operations:
                solution, steps = self.operations[operation_type](expression)
            else:
                solution, steps = self._simplify_expression(expression)
            
            # Determine difficulty and category
            difficulty = self._assess_difficulty(expression, operation_type)
            category = self._categorize_problem(operation_type, expression)
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return MathematicalProblem(
                problem=problem_text,
                solution=solution,
                steps=steps,
                difficulty=difficulty,
                category=category,
                language=language,
                confidence=confidence,
                processing_time=processing_time
            )
            
        except Exception as e:
            self.logger.error(f"Error processing problem '{problem_text}': {e}")
            return MathematicalProblem(
                problem=problem_text,
                solution=f"Processing error: {e}",
                steps=[f"Error occurred during processing: {e}"],
                difficulty="error",
                category="processing_error",
                language=language,
                confidence=0.0,
                processing_time=(datetime.now() - start_time).total_seconds()
            )
    
    def _assess_difficulty(self, expression: str, operation: str) -> str:
        """Assess difficulty level of mathematical problem"""
        # Basic heuristics for difficulty assessment
        if operation in ["simplify", "expand"] and len(expression) < 10:
            return "basic"
        elif operation in ["derivative", "integral"] and "**" not in expression:
            return "basic"
        elif operation == "solve" and "**2" in expression:
            return "intermediate"
        elif operation in ["derivative", "integral"] and any(func in expression for func in ["sin", "cos", "tan", "log", "exp"]):
            return "advanced"
        else:
            return "intermediate"
    
    def _categorize_problem(self, operation: str, expression: str) -> str:
        """Categorize mathematical problem"""
        if operation in ["derivative", "integral", "limit", "series"]:
            return "calculus"
        elif operation in ["solve", "factor", "expand"]:
            return "algebra"
        elif any(func in expression for func in ["sin", "cos", "tan"]):
            return "trigonometry"
        elif any(func in expression for func in ["log", "exp"]):
            return "logarithmic"
        else:
            return "arithmetic"
    
    async def process_dataset(self, dataset_path: Path) -> List[MathematicalProblem]:
        """Process mathematical dataset"""
        self.logger.info(f"Processing mathematical dataset from {dataset_path}")
        
        processed_problems = []
        
        try:
            # Load dataset
            with open(dataset_path, 'r', encoding='utf-8') as f:
                dataset = json.load(f)
            
            self.stats.total_problems = len(dataset)
            
            # Process each problem
            for problem_data in dataset:
                problem_text = problem_data.get('problem', '')
                
                # Process the problem
                processed_problem = await self.process_mathematical_problem(problem_text)
                processed_problems.append(processed_problem)
                
                # Update statistics
                if "error" not in processed_problem.category:
                    self.stats.successful += 1
                    
                    # Update category stats
                    category = processed_problem.category
                    self.stats.by_category[category] = self.stats.by_category.get(category, 0) + 1
                    
                    # Update difficulty stats
                    difficulty = processed_problem.difficulty
                    self.stats.by_difficulty[difficulty] = self.stats.by_difficulty.get(difficulty, 0) + 1
                    
                    # Update language stats
                    language = processed_problem.language
                    self.stats.by_language[language] = self.stats.by_language.get(language, 0) + 1
                else:
                    self.stats.failed += 1
                
                # Update timing stats
                self.stats.total_processing_time += processed_problem.processing_time
            
            # Calculate average confidence
            confidences = [p.confidence for p in processed_problems if p.confidence > 0]
            self.stats.average_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            
            self.logger.info(f"Successfully processed {self.stats.successful}/{self.stats.total_problems} problems")
            
        except Exception as e:
            self.logger.error(f"Failed to process dataset {dataset_path}: {e}")
            
        return processed_problems
    
    def save_processed_results(self, processed_problems: List[MathematicalProblem], output_path: Path):
        """Save processed mathematical problems to file"""
        try:
            # Convert to dictionaries
            results_data = {
                "metadata": {
                    "processing_date": datetime.now().isoformat(),
                    "total_problems": len(processed_problems),
                    "processor_version": "2.0",
                    "statistics": asdict(self.stats)
                },
                "problems": [asdict(problem) for problem in processed_problems]
            }
            
            # Save to file
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(results_data, f, indent=2, ensure_ascii=False)
            
            self.logger.info(f"Saved processed results to {output_path}")
            
        except Exception as e:
            self.logger.error(f"Failed to save results to {output_path}: {e}")
    
    def print_processing_summary(self):
        """Print comprehensive processing summary"""
        print("\n🧮 RomAI Phase 2 Mathematical Processing Results:")
        print("=" * 65)
        print(f"📊 Total Problems: {self.stats.total_problems}")
        print(f"✅ Successfully Processed: {self.stats.successful}")
        print(f"❌ Failed: {self.stats.failed}")
        print(f"🎯 Success Rate: {(self.stats.successful/self.stats.total_problems*100):.1f}%")
        print(f"⚡ Average Confidence: {self.stats.average_confidence:.2f}")
        print(f"⏱️ Total Processing Time: {self.stats.total_processing_time:.3f}s")
        
        if self.stats.by_category:
            print(f"\n📚 By Category:")
            for category, count in self.stats.by_category.items():
                print(f"   {category}: {count}")
        
        if self.stats.by_difficulty:
            print(f"\n🎚️ By Difficulty:")
            for difficulty, count in self.stats.by_difficulty.items():
                print(f"   {difficulty}: {count}")
        
        if self.stats.by_language:
            print(f"\n🌍 By Language:")
            for language, count in self.stats.by_language.items():
                print(f"   {language}: {count}")

async def main():
    """Main entry point for mathematical processing"""
    processor = EnhancedMathematicalProcessor()
    config = Phase2Config()
    
    # Path to mathematical dataset
    dataset_path = config.get_dataset_path("mathematical", "raw") / "mathematical_problems.json"
    
    if not dataset_path.exists():
        print(f"❌ Mathematical dataset not found at {dataset_path}")
        return
    
    # Process the dataset
    processed_problems = await processor.process_dataset(dataset_path)
    
    # Save processed results
    output_path = config.get_dataset_path("mathematical", "processed") / "processed_mathematical_problems.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    processor.save_processed_results(processed_problems, output_path)
    
    # Print summary
    processor.print_processing_summary()

if __name__ == "__main__":
    asyncio.run(main())