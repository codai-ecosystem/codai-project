"""
🧠 RomAI Native Mathematical Reasoning Neural Network

This module implements RomAI's own mathematical reasoning capabilities using PyTorch.
No external AI dependencies during runtime - pure neural network inference.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.nn import Transformer
import numpy as np
from typing import Dict, List, Tuple, Optional
import re
import json
from dataclasses import dataclass
import math
from enum import Enum

class MathOperationType(Enum):
    ARITHMETIC = "arithmetic"
    ALGEBRA = "algebra"
    CALCULUS = "calculus"
    GEOMETRY = "geometry"
    STATISTICS = "statistics"
    NUMBER_THEORY = "number_theory"

@dataclass
class MathSolution:
    """Native solution structure from RomAI's own reasoning"""
    problem: str
    solution_steps: List[str]
    final_answer: str
    confidence: float
    operation_type: MathOperationType
    reasoning_chain: List[str]

class MathTokenizer:
    """Tokenizer for mathematical expressions"""
    
    def __init__(self):
        # Mathematical symbols and operations
        self.special_tokens = [
            '<PAD>', '<UNK>', '<START>', '<END>', '<NUM>', '<VAR>',
            '+', '-', '*', '/', '=', '(', ')', '^', '√', '∫', '∑',
            'sin', 'cos', 'tan', 'ln', 'log', 'exp', 'π', 'e'
        ]
        
        # Build vocabulary
        self.token_to_id = {token: i for i, token in enumerate(self.special_tokens)}
        self.id_to_token = {i: token for token, i in self.token_to_id.items()}
        self.vocab_size = len(self.special_tokens)
    
    def tokenize(self, expression: str) -> List[int]:
        """Convert mathematical expression to token IDs"""
        # Simple tokenization - in production, would be more sophisticated
        tokens = []
        i = 0
        while i < len(expression):
            char = expression[i]
            
            # Handle numbers
            if char.isdigit() or char == '.':
                num_str = ''
                while i < len(expression) and (expression[i].isdigit() or expression[i] == '.'):
                    num_str += expression[i]
                    i += 1
                tokens.append(self.token_to_id.get('<NUM>', self.token_to_id['<UNK>']))
            
            # Handle variables
            elif char.isalpha():
                var_str = ''
                while i < len(expression) and expression[i].isalpha():
                    var_str += expression[i]
                    i += 1
                
                if var_str in self.token_to_id:
                    tokens.append(self.token_to_id[var_str])
                else:
                    tokens.append(self.token_to_id.get('<VAR>', self.token_to_id['<UNK>']))
            
            # Handle operators and symbols
            elif char in self.token_to_id:
                tokens.append(self.token_to_id[char])
                i += 1
            
            else:
                i += 1  # Skip unknown characters
        
        return tokens
    
    def detokenize(self, token_ids: List[int]) -> str:
        """Convert token IDs back to expression"""
        tokens = [self.id_to_token.get(token_id, '<UNK>') for token_id in token_ids]
        return ' '.join(tokens)

class SymbolicComputationLayer(nn.Module):
    """Neural-symbolic computation layer for mathematical operations"""
    
    def __init__(self, hidden_dim: int):
        super().__init__()
        self.hidden_dim = hidden_dim
        
        # Symbolic operation embeddings
        self.operation_embeddings = nn.Embedding(len(MathOperationType), hidden_dim)
        
        # Computation modules
        self.arithmetic_processor = nn.Linear(hidden_dim, hidden_dim)
        self.algebra_processor = nn.Linear(hidden_dim, hidden_dim)
        self.calculus_processor = nn.Linear(hidden_dim, hidden_dim)
        
        # Attention mechanism for operation selection
        self.operation_attention = nn.MultiheadAttention(hidden_dim, num_heads=8)
        
        # Output projection
        self.output_proj = nn.Linear(hidden_dim, hidden_dim)
    
    def forward(self, x: torch.Tensor, operation_type: Optional[torch.Tensor] = None) -> torch.Tensor:
        batch_size, seq_len, hidden_dim = x.shape
        
        # If operation type is provided, use it; otherwise, learn to predict it
        if operation_type is None:
            # Predict operation type from input
        # RomAI General Expert - Authentic Neural Inference
                    try:
                        # Route to appropriate expert based on input analysis
                        expert_input = self._prepare_expert_input(input_data)

                        # Automatic expert selection
                        selected_expert = self.model.router.select_optimal_expert(expert_input)

                        # Process with selected expert
                        with torch.no_grad():
                            expert_outputs = self.model.route_to_expert(
                                expert_input,
                                expert_type=selected_expert,
                                use_mla_attention=True
                            )

                            # Generate response
                            response = self.model.generate_response(expert_outputs)

                            return {
                                "response": response["response"],
                                "reasoning": response["reasoning"],
                                "confidence": response["confidence"],
                                "expert_used": selected_expert,
                                "method": "neural_general_reasoning",
                                "quality_score": response["quality_score"]
                            }

                    except Exception as e:
                        logger.error(f"General expert error: {e}")
                        # Ultimate fallback
                        return {"error": f"Neural inference failed: {e}", "fallback": True}
            operation_type = torch.argmax(operation_logits, dim=-1)
        
        # Get operation embeddings
        op_embeddings = self.operation_embeddings(operation_type).unsqueeze(1)  # [batch, 1, hidden]
        
        # Apply operation-specific processing
        processed = x
        for i, op_type in enumerate(MathOperationType):
            # Select relevant sequences for this operation type
            op_mask = (operation_type == i)
            if op_mask.any():
                if op_type == MathOperationType.ARITHMETIC:
                    processed[op_mask] = self.arithmetic_processor(processed[op_mask])
                elif op_type == MathOperationType.ALGEBRA:
                    processed[op_mask] = self.algebra_processor(processed[op_mask])
                elif op_type == MathOperationType.CALCULUS:
                    processed[op_mask] = self.calculus_processor(processed[op_mask])
        
        # Apply attention with operation context
        attn_output, _ = self.operation_attention(
            processed.transpose(0, 1),  # [seq, batch, hidden]
            op_embeddings.transpose(0, 1),  # [1, batch, hidden]
            op_embeddings.transpose(0, 1)
        )
        
        # Project to output
        output = self.output_proj(attn_output.transpose(0, 1))  # [batch, seq, hidden]
        
        return output

class StepByStepDecoder(nn.Module):
    """Generates step-by-step mathematical solutions"""
    
    def __init__(self, hidden_dim: int, vocab_size: int, max_steps: int = 10):
        super().__init__()
        self.hidden_dim = hidden_dim
        self.vocab_size = vocab_size
        self.max_steps = max_steps
        
        # Step generation layers
        self.step_embedding = nn.Embedding(max_steps, hidden_dim)
        self.step_decoder = nn.TransformerDecoder(
            nn.TransformerDecoderLayer(hidden_dim, nhead=8, batch_first=True),
            num_layers=4
        )
        
        # Output heads
        self.step_head = nn.Linear(hidden_dim, vocab_size)
        self.confidence_head = nn.Linear(hidden_dim, 1)
        
    def forward(self, encoder_output: torch.Tensor, max_decode_length: int = 50) -> Tuple[torch.Tensor, torch.Tensor]:
        batch_size = encoder_output.shape[0]
        device = encoder_output.device
        
        # Initialize step embeddings
        step_ids = torch.arange(self.max_steps, device=device).unsqueeze(0).repeat(batch_size, 1)
        step_embeds = self.step_embedding(step_ids)
        
        # Decode steps
        decoded_steps = self.step_decoder(step_embeds, encoder_output)
        
        # Generate step tokens
        step_logits = self.step_head(decoded_steps)
        confidence_scores = torch.sigmoid(self.confidence_head(decoded_steps))
        
        return step_logits, confidence_scores

class MathematicalReasoningNetwork(nn.Module):
    """
    RomAI's own mathematical reasoning neural network.
    Trained to solve mathematical problems without external dependencies.
    """
    
    def __init__(
        self,
        vocab_size: int = 1000,
        hidden_dim: int = 512,
        num_heads: int = 8,
        num_encoder_layers: int = 6,
        num_decoder_layers: int = 6,
        max_seq_length: int = 256
    ):
        super().__init__()
        
        self.vocab_size = vocab_size
        self.hidden_dim = hidden_dim
        self.max_seq_length = max_seq_length
        
        # Embedding layers
        self.token_embedding = nn.Embedding(vocab_size, hidden_dim)
        self.position_embedding = nn.Embedding(max_seq_length, hidden_dim)
        
        # Core transformer
        self.transformer = Transformer(
            d_model=hidden_dim,
            nhead=num_heads,
            num_encoder_layers=num_encoder_layers,
            num_decoder_layers=num_decoder_layers,
            batch_first=True
        )
        
        # Symbolic computation layer
        self.symbolic_processor = SymbolicComputationLayer(hidden_dim)
        
        # Step-by-step decoder
        self.step_decoder = StepByStepDecoder(hidden_dim, vocab_size)
        
        # Output heads
        self.answer_head = nn.Linear(hidden_dim, vocab_size)
        self.confidence_head = nn.Linear(hidden_dim, 1)
        
        # Operation type classifier
        self.operation_classifier = nn.Linear(hidden_dim, len(MathOperationType))
        
    def forward(
        self, 
        input_ids: torch.Tensor, 
        target_ids: Optional[torch.Tensor] = None
    ) -> Dict[str, torch.Tensor]:
        batch_size, seq_length = input_ids.shape
        device = input_ids.device
        
        # Create embeddings
        token_embeds = self.token_embedding(input_ids)
        
        # Add positional embeddings
        positions = torch.arange(seq_length, device=device).unsqueeze(0).repeat(batch_size, 1)
        pos_embeds = self.position_embedding(positions)
        
        input_embeds = token_embeds + pos_embeds
        
        # If we have targets, use them; otherwise, create dummy targets for inference
        if target_ids is None:
            target_ids = torch.zeros_like(input_ids)
        
        target_embeds = self.token_embedding(target_ids)
        target_pos = torch.arange(target_ids.shape[1], device=device).unsqueeze(0).repeat(batch_size, 1)
        target_embeds += self.position_embedding(target_pos)
        
        # Transformer processing
        transformer_output = self.transformer(input_embeds, target_embeds)
        
        # Classify operation type
        operation_logits = self.operation_classifier(transformer_output.mean(dim=1))
        predicted_operations = torch.argmax(operation_logits, dim=-1)
        
        # Apply symbolic computation
        symbolic_output = self.symbolic_processor(transformer_output, predicted_operations)
        
        # Generate step-by-step solution
        step_logits, step_confidence = self.step_decoder(symbolic_output)
        
        # Generate final answer
        answer_logits = self.answer_head(symbolic_output)
        overall_confidence = torch.sigmoid(self.confidence_head(symbolic_output).mean(dim=1))
        
        return {
            'answer_logits': answer_logits,
            'step_logits': step_logits,
            'step_confidence': step_confidence,
            'overall_confidence': overall_confidence,
            'operation_logits': operation_logits,
            'predicted_operations': predicted_operations
        }

class RomAIMathematicalReasoner:
    """
    High-level interface for RomAI's mathematical reasoning capabilities.
    Uses only RomAI's own trained models - no external dependencies.
    """
    
    def __init__(self, model_path: Optional[str] = None):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.tokenizer = MathTokenizer()
        
        # Initialize the neural network
        self.model = MathematicalReasoningNetwork(
            vocab_size=self.tokenizer.vocab_size,
            hidden_dim=512,
            num_heads=8,
            num_encoder_layers=6,
            num_decoder_layers=6
        ).to(self.device)
        
        # Load trained weights if available
        if model_path and torch.cuda.is_available():
            try:
                self.model.load_state_dict(torch.load(model_path))
                self.model.eval()
            except FileNotFoundError:
                print(f"Model file not found: {model_path}. Using untrained model.")
        
        # Mathematical operation patterns for untrained fallback
        self.math_patterns = {
            r'√(\d+\.?\d*)': self._handle_sqrt,
            r'(\d+\.?\d*)\s*\+\s*(\d+\.?\d*)': self._handle_addition,
            r'(\d+\.?\d*)\s*-\s*(\d+\.?\d*)': self._handle_subtraction,
            r'(\d+\.?\d*)\s*\*\s*(\d+\.?\d*)': self._handle_multiplication,
            r'(\d+\.?\d*)\s*/\s*(\d+\.?\d*)': self._handle_division,
            r'(\d+\.?\d*)\s*\^\s*(\d+\.?\d*)': self._handle_power,
        }
    
    def _handle_sqrt(self, match) -> Tuple[float, List[str]]:
        """Handle square root operations"""
        number = float(match.group(1))
        result = math.sqrt(number)
        steps = [
            f"Calculate square root of {number}",
            f"√{number} = {result}"
        ]
        return result, steps
    
    def _handle_addition(self, match) -> Tuple[float, List[str]]:
        """Handle addition operations"""
        a, b = float(match.group(1)), float(match.group(2))
        result = a + b
        steps = [
            f"Add {a} + {b}",
            f"Result: {result}"
        ]
        return result, steps
    
    def _handle_subtraction(self, match) -> Tuple[float, List[str]]:
        """Handle subtraction operations"""
        a, b = float(match.group(1)), float(match.group(2))
        result = a - b
        steps = [
            f"Subtract {a} - {b}",
            f"Result: {result}"
        ]
        return result, steps
    
    def _handle_multiplication(self, match) -> Tuple[float, List[str]]:
        """Handle multiplication operations"""
        a, b = float(match.group(1)), float(match.group(2))
        result = a * b
        steps = [
            f"Multiply {a} × {b}",
            f"Result: {result}"
        ]
        return result, steps
    
    def _handle_division(self, match) -> Tuple[float, List[str]]:
        """Handle division operations"""
        a, b = float(match.group(1)), float(match.group(2))
        if b == 0:
            return float('inf'), ["Error: Division by zero"]
        result = a / b
        steps = [
            f"Divide {a} ÷ {b}",
            f"Result: {result}"
        ]
        return result, steps
    
    def _handle_power(self, match) -> Tuple[float, List[str]]:
        """Handle exponentiation operations"""
        base, exp = float(match.group(1)), float(match.group(2))
        result = base ** exp
        steps = [
            f"Calculate {base}^{exp}",
            f"Result: {result}"
        ]
        return result, steps
    
    async def solve_mathematical_problem(self, problem: str) -> MathSolution:
        """
        Solve mathematical problem using RomAI's own neural network.
        Falls back to pattern matching if model is not trained yet.
        """
        
        # Try neural network inference first (when model is trained)
        try:
            return await self._neural_solve(problem)
        except Exception as e:
            print(f"Neural network not ready, using pattern-based fallback: {e}")
            return await self._pattern_solve(problem)
    
    async def _neural_solve(self, problem: str) -> MathSolution:
        """Solve using trained neural network"""
        
        # Tokenize input
        input_tokens = self.tokenizer.tokenize(problem)
        input_tensor = torch.tensor([input_tokens], device=self.device)
        
        # Run inference
        with torch.no_grad():
            outputs = self.model(input_tensor)
        
        # Decode results
        answer_tokens = torch.argmax(outputs['answer_logits'], dim=-1)
        answer = self.tokenizer.detokenize(answer_tokens[0].cpu().tolist())
        
        step_tokens = torch.argmax(outputs['step_logits'], dim=-1)
        steps = [
            self.tokenizer.detokenize(step.cpu().tolist()) 
            for step in step_tokens[0]
        ]
        
        confidence = outputs['overall_confidence'][0].item()
        operation_type = MathOperationType(outputs['predicted_operations'][0].item())
        
        return MathSolution(
            problem=problem,
            solution_steps=steps,
            final_answer=answer,
            confidence=confidence,
            operation_type=operation_type,
            reasoning_chain=[f"Neural network reasoning: {step}" for step in steps]
        )
    
    async def _pattern_solve(self, problem: str) -> MathSolution:
        """Fallback pattern-based solving for untrained model"""
        
        problem_clean = problem.strip()
        
        # Try each mathematical pattern
        for pattern, handler in self.math_patterns.items():
            match = re.search(pattern, problem_clean)
            if match:
                try:
                    result, steps = handler(match)
                    
                    # Determine operation type
                    if '√' in problem:
                        op_type = MathOperationType.ARITHMETIC
                    elif any(op in problem for op in ['+', '-', '*', '/', '^']):
                        op_type = MathOperationType.ARITHMETIC
                    else:
                        op_type = MathOperationType.ARITHMETIC
                    
                    return MathSolution(
                        problem=problem,
                        solution_steps=steps,
                        final_answer=str(result),
                        confidence=0.8,  # Pattern matching confidence
                        operation_type=op_type,
                        reasoning_chain=[
                            f"Pattern recognition: {pattern}",
                            f"Applied mathematical operation",
                            *steps
                        ]
                    )
                
                except Exception as e:
                    continue
        
        # If no pattern matches, return basic response
        return MathSolution(
            problem=problem,
            solution_steps=[
                "Analyzing mathematical problem...",
                "Problem requires advanced neural network training",
                "Currently operating with basic pattern recognition"
            ],
            final_answer="Unable to solve - requires model training",
            confidence=0.1,
            operation_type=MathOperationType.ARITHMETIC,
            reasoning_chain=[
                "No matching mathematical pattern found",
                "RomAI's mathematical neural network needs training",
                "This demonstrates the need for proper AI training"
            ]
        )

# Factory function for easy instantiation
def create_mathematical_reasoner(model_path: Optional[str] = None) -> RomAIMathematicalReasoner:
    """Create RomAI's mathematical reasoning system"""
    return RomAIMathematicalReasoner(model_path)

# Export main classes
__all__ = [
    'MathematicalReasoningNetwork',
    'RomAIMathematicalReasoner', 
    'MathSolution',
    'MathOperationType',
    'create_mathematical_reasoner'
]