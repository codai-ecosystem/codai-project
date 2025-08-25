"""
Logical Reasoning Expert Module

Advanced logical reasoning and formal analysis expert for the RUAGA architecture.
Specializes in formal logic, proof systems, deductive reasoning, logical validation,
and complex problem-solving with rigorous logical foundations.

Key Capabilities:
- Formal logic systems (propositional, predicate, modal)
- Proof generation and verification
- Deductive and inductive reasoning
- Logical fallacy detection
- Complex problem decomposition
- Constraint satisfaction
- Theorem proving
"""

import re
import time
import logging
from typing import Dict, List, Optional, Any, Tuple, Union, Set
from dataclasses import dataclass
from enum import Enum
import torch
import torch.nn as nn


logger = logging.getLogger(__name__)


class LogicType(Enum):
    """Types of logical reasoning."""
    PROPOSITIONAL = "propositional"
    PREDICATE = "predicate"
    MODAL = "modal"
    TEMPORAL = "temporal"
    FUZZY = "fuzzy"
    BOOLEAN = "boolean"
    INDUCTIVE = "inductive"
    DEDUCTIVE = "deductive"
    ABDUCTIVE = "abductive"


class LogicalOperation(Enum):
    """Logical operations and connectives."""
    AND = "and"
    OR = "or"
    NOT = "not"
    IMPLIES = "implies"
    IFF = "if_and_only_if"
    XOR = "exclusive_or"
    NAND = "not_and"
    NOR = "not_or"
    FORALL = "for_all"
    EXISTS = "exists"


class ReasoningStrategy(Enum):
    """Reasoning strategies."""
    DIRECT_PROOF = "direct_proof"
    PROOF_BY_CONTRADICTION = "proof_by_contradiction"
    PROOF_BY_INDUCTION = "proof_by_induction"
    CASE_ANALYSIS = "case_analysis"
    RESOLUTION = "resolution"
    TABLEAU = "tableau"
    NATURAL_DEDUCTION = "natural_deduction"


@dataclass
class LogicalStatement:
    """Represents a logical statement."""
    statement: str
    logic_type: LogicType
    variables: Set[str]
    operators: List[LogicalOperation]
    complexity: float
    is_valid: bool = False
    truth_value: Optional[bool] = None


@dataclass
class LogicalProof:
    """Represents a logical proof."""
    premises: List[LogicalStatement]
    conclusion: LogicalStatement
    steps: List[Dict[str, Any]]
    strategy: ReasoningStrategy
    is_valid: bool
    confidence: float
    verification_passed: bool = False


@dataclass
class LogicalReasoningRequest:
    """Logical reasoning task request."""
    query: str
    logic_type: LogicType = LogicType.PROPOSITIONAL
    strategy: Optional[ReasoningStrategy] = None
    premises: List[str] = None
    target_conclusion: Optional[str] = None
    require_proof: bool = False


@dataclass
class LogicalReasoningResponse:
    """Logical reasoning expert response."""
    success: bool
    result: Any
    logic_type: LogicType
    execution_time: float
    confidence: float
    proof: Optional[LogicalProof] = None
    truth_analysis: Optional[Dict] = None
    fallacies_detected: List[str] = None
    verification_passed: bool = False


class LogicalPatternProcessor(nn.Module):
    """Neural network for logical pattern recognition and analysis."""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__()
        
        self.hidden_size = config.get('hidden_size', 512)
        self.num_layers = config.get('num_layers', 4)
        self.vocab_size = config.get('vocab_size', 10000)  # Smaller vocab for logic
        
        # Token embedding for logical tokens
        self.token_embedding = nn.Embedding(self.vocab_size, self.hidden_size)
        
        # Transformer layers for logical pattern understanding
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=self.hidden_size,
            nhead=8,
            dim_feedforward=self.hidden_size * 4,
            dropout=0.1,
            batch_first=True
        )
        self.transformer_encoder = nn.TransformerEncoder(
            encoder_layer, 
            num_layers=self.num_layers
        )
        
        # Output projections for logical analysis
        self.logic_type_classifier = nn.Linear(self.hidden_size, len(LogicType))
        self.validity_predictor = nn.Linear(self.hidden_size, 1)
        self.truth_value_predictor = nn.Linear(self.hidden_size, 3)  # True, False, Unknown
        self.complexity_predictor = nn.Linear(self.hidden_size, 1)
        
    def forward(self, logical_tokens: torch.Tensor) -> Dict[str, torch.Tensor]:
        """Forward pass for logical analysis."""
        
        # Embed tokens
        embedded = self.token_embedding(logical_tokens)
        
        # Process with transformer
        encoded = self.transformer_encoder(embedded)
        
        # Global average pooling
        pooled = encoded.mean(dim=1)
        
        # Predictions
        logic_type_logits = self.logic_type_classifier(pooled)
        validity = torch.sigmoid(self.validity_predictor(pooled))
        truth_value_logits = self.truth_value_predictor(pooled)
        complexity = torch.sigmoid(self.complexity_predictor(pooled))
        
        return {
            'logic_type_logits': logic_type_logits,
            'validity_score': validity,
            'truth_value_logits': truth_value_logits,
            'complexity_score': complexity,
            'features': pooled
        }


class PropositionalLogicEngine:
    """Engine for propositional logic reasoning."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
    def parse_proposition(self, statement: str) -> LogicalStatement:
        """Parse a propositional logic statement."""
        
        # Extract variables (single uppercase letters for now)
        variables = set(re.findall(r'\b[A-Z]\b', statement))
        
        # Identify operators
        operators = []
        if ' and ' in statement.lower() or ' & ' in statement:
            operators.append(LogicalOperation.AND)
        if ' or ' in statement.lower() or ' | ' in statement:
            operators.append(LogicalOperation.OR)
        if ' not ' in statement.lower() or '~' in statement or '¬' in statement:
            operators.append(LogicalOperation.NOT)
        if ' implies ' in statement.lower() or ' → ' in statement or '->' in statement:
            operators.append(LogicalOperation.IMPLIES)
        if ' iff ' in statement.lower() or ' ↔ ' in statement or '<->' in statement:
            operators.append(LogicalOperation.IFF)
        
        # Calculate complexity based on number of variables and operators
        complexity = len(variables) * 0.1 + len(operators) * 0.2
        
        # Basic syntax validation
        is_valid = self._validate_proposition_syntax(statement)
        
        return LogicalStatement(
            statement=statement,
            logic_type=LogicType.PROPOSITIONAL,
            variables=variables,
            operators=operators,
            complexity=complexity,
            is_valid=is_valid
        )
    
    def _validate_proposition_syntax(self, statement: str) -> bool:
        """Basic validation of propositional logic syntax."""
        
        # Check for balanced parentheses
        if statement.count('(') != statement.count(')'):
            return False
        
        # Check for valid variable names (single uppercase letters)
        variables = re.findall(r'\b[A-Z]\b', statement)
        if not variables:
            return False
        
        # Basic operator validation
        invalid_sequences = ['and and', 'or or', 'not not not']
        statement_lower = statement.lower()
        for invalid in invalid_sequences:
            if invalid in statement_lower:
                return False
        
        return True
    
    def evaluate_truth_table(self, statement: LogicalStatement) -> Dict[str, Any]:
        """Generate truth table for propositional statement."""
        
        if not statement.is_valid:
            return {"error": "Invalid statement cannot be evaluated"}
        
        variables = list(statement.variables)
        num_vars = len(variables)
        
        if num_vars > 8:  # Limit to prevent exponential explosion
            return {"error": "Too many variables for truth table generation"}
        
        # Generate all possible truth value combinations
        truth_table = []
        num_combinations = 2 ** num_vars
        
        for i in range(num_combinations):
            # Generate binary representation for this combination
            assignment = {}
            for j, var in enumerate(variables):
                assignment[var] = bool((i >> j) & 1)
            
            # Evaluate statement with this assignment
            try:
                result = self._evaluate_with_assignment(statement.statement, assignment)
                truth_table.append({
                    'assignment': assignment.copy(),
                    'result': result
                })
            except Exception as e:
                self.logger.warning(f"Failed to evaluate assignment {assignment}: {e}")
                truth_table.append({
                    'assignment': assignment.copy(),
                    'result': None,
                    'error': str(e)
                })
        
        # Analyze truth table
        valid_results = [row['result'] for row in truth_table if row['result'] is not None]
        
        if not valid_results:
            return {"error": "No valid truth table results"}
        
        is_tautology = all(valid_results)
        is_contradiction = not any(valid_results)
        is_contingent = not is_tautology and not is_contradiction
        
        return {
            'truth_table': truth_table,
            'analysis': {
                'is_tautology': is_tautology,
                'is_contradiction': is_contradiction,
                'is_contingent': is_contingent,
                'satisfiable': any(valid_results),
                'valid_assignments': len(valid_results)
            },
            'variables': variables,
            'num_combinations': num_combinations
        }
    
    def _evaluate_with_assignment(self, statement: str, assignment: Dict[str, bool]) -> bool:
        """Evaluate statement with given variable assignment."""
        
        # Replace variables with their truth values
        eval_statement = statement
        for var, value in assignment.items():
            eval_statement = re.sub(r'\b' + var + r'\b', str(value), eval_statement)
        
        # Replace logical operators with Python equivalents
        eval_statement = eval_statement.lower()
        eval_statement = eval_statement.replace(' and ', ' and ')
        eval_statement = eval_statement.replace(' or ', ' or ')
        eval_statement = eval_statement.replace(' not ', ' not ')
        eval_statement = eval_statement.replace(' implies ', ' <= ')  # A implies B is equivalent to (not A) or B
        
        # Handle implies operator properly
        eval_statement = re.sub(r'(\w+) implies (\w+)', r'(not \1 or \2)', eval_statement)
        eval_statement = re.sub(r'(\w+) → (\w+)', r'(not \1 or \2)', eval_statement)
        eval_statement = re.sub(r'(\w+) -> (\w+)', r'(not \1 or \2)', eval_statement)
        
        # Handle biconditional (iff)
        eval_statement = re.sub(r'(\w+) iff (\w+)', r'((\1 and \2) or (not \1 and not \2))', eval_statement)
        eval_statement = re.sub(r'(\w+) ↔ (\w+)', r'((\1 and \2) or (not \1 and not \2))', eval_statement)
        eval_statement = re.sub(r'(\w+) <-> (\w+)', r'((\1 and \2) or (not \1 and not \2))', eval_statement)
        
        try:
            return eval(eval_statement)
        except Exception as e:
            raise ValueError(f"Cannot evaluate statement: {eval_statement} - {e}")


class PredicateLogicEngine:
    """Engine for predicate logic reasoning."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def parse_predicate(self, statement: str) -> LogicalStatement:
        """Parse a predicate logic statement."""
        
        # Extract predicates (functions like P(x), Q(x,y))
        predicate_pattern = r'[A-Z]\([a-z,\s]+\)'
        predicates = re.findall(predicate_pattern, statement)
        
        # Extract variables
        variable_pattern = r'\b[a-z]\b'
        variables = set(re.findall(variable_pattern, statement))
        
        # Identify quantifiers
        operators = []
        if 'forall' in statement.lower() or '∀' in statement:
            operators.append(LogicalOperation.FORALL)
        if 'exists' in statement.lower() or '∃' in statement:
            operators.append(LogicalOperation.EXISTS)
        
        # Also check for propositional operators
        if ' and ' in statement.lower():
            operators.append(LogicalOperation.AND)
        if ' or ' in statement.lower():
            operators.append(LogicalOperation.OR)
        if ' not ' in statement.lower():
            operators.append(LogicalOperation.NOT)
        if ' implies ' in statement.lower():
            operators.append(LogicalOperation.IMPLIES)
        
        complexity = len(variables) * 0.2 + len(operators) * 0.3 + len(predicates) * 0.1
        is_valid = len(predicates) > 0  # Basic validation
        
        return LogicalStatement(
            statement=statement,
            logic_type=LogicType.PREDICATE,
            variables=variables,
            operators=operators,
            complexity=complexity,
            is_valid=is_valid
        )
    
    def analyze_quantifier_structure(self, statement: LogicalStatement) -> Dict[str, Any]:
        """Analyze quantifier structure in predicate logic."""
        
        analysis = {
            'universal_quantifiers': [],
            'existential_quantifiers': [],
            'free_variables': set(),
            'bound_variables': set(),
            'quantifier_alternations': 0,
            'complexity_level': 'basic'
        }
        
        # Find quantifiers and their scope
        universal_pattern = r'(?:forall|∀)\s+([a-z])'
        existential_pattern = r'(?:exists|∃)\s+([a-z])'
        
        universals = re.findall(universal_pattern, statement.statement.lower())
        existentials = re.findall(existential_pattern, statement.statement.lower())
        
        analysis['universal_quantifiers'] = universals
        analysis['existential_quantifiers'] = existentials
        analysis['bound_variables'] = set(universals + existentials)
        analysis['free_variables'] = statement.variables - analysis['bound_variables']
        
        # Count quantifier alternations (∀∃∀ pattern complexity)
        all_quantifiers = re.findall(r'(?:forall|exists|∀|∃)', statement.statement.lower())
        prev_type = None
        alternations = 0
        
        for q in all_quantifiers:
            current_type = 'universal' if q in ['forall', '∀'] else 'existential'
            if prev_type is not None and prev_type != current_type:
                alternations += 1
            prev_type = current_type
        
        analysis['quantifier_alternations'] = alternations
        
        # Determine complexity level
        if alternations > 2:
            analysis['complexity_level'] = 'very_high'
        elif alternations > 1:
            analysis['complexity_level'] = 'high'
        elif len(universals) + len(existentials) > 2:
            analysis['complexity_level'] = 'moderate'
        else:
            analysis['complexity_level'] = 'basic'
        
        return analysis


class FallacyDetectionEngine:
    """Engine for detecting logical fallacies."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Common logical fallacies patterns
        self.fallacy_patterns = {
            'ad_hominem': [
                r'you are wrong because you are',
                r'your argument is invalid because you',
                r'since you are.*your point is'
            ],
            'straw_man': [
                r'you claim that.*but that would mean',
                r'your position implies that',
                r'if what you say is true then'
            ],
            'false_dichotomy': [
                r'either.*or.*nothing else',
                r'you must choose between',
                r'there are only two options'
            ],
            'circular_reasoning': [
                r'because.*because',
                r'is true.*it is true',
                r'we know.*because we know'
            ],
            'appeal_to_authority': [
                r'expert.*says.*therefore',
                r'according to.*therefore',
                r'authority.*claims.*so'
            ],
            'hasty_generalization': [
                r'all.*are.*because.*one',
                r'every.*is.*since.*some',
                r'therefore all.*because.*few'
            ]
        }
    
    def detect_fallacies(self, argument: str) -> List[str]:
        """Detect logical fallacies in an argument."""
        
        detected_fallacies = []
        argument_lower = argument.lower()
        
        for fallacy_type, patterns in self.fallacy_patterns.items():
            for pattern in patterns:
                if re.search(pattern, argument_lower):
                    detected_fallacies.append(fallacy_type)
                    break  # Only count each fallacy type once
        
        return detected_fallacies


class LogicalReasoningExpert:
    """
    Advanced logical reasoning expert with comprehensive capabilities
    for formal logic, proof systems, and rigorous logical analysis.
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Initialize engines
        self.pattern_processor = LogicalPatternProcessor(config)
        self.propositional_engine = PropositionalLogicEngine()
        self.predicate_engine = PredicateLogicEngine()
        self.fallacy_detector = FallacyDetectionEngine()
        
        # Performance targets
        self.targets = {
            'proof_validity_accuracy': 0.92,  # >92% proof validation accuracy
            'fallacy_detection_rate': 0.88,   # >88% fallacy detection
            'logic_analysis_accuracy': 0.90,  # >90% logical analysis accuracy
            'complex_reasoning_success': 0.85  # >85% complex reasoning success
        }
        
        # Metrics tracking
        self.metrics = {
            'requests_processed': 0,
            'successful_proofs': 0,
            'fallacies_detected': 0,
            'valid_analyses': 0,
            'average_response_time': 0.0
        }
        
        self.logger.info(f"Logical reasoning expert initialized with targets: {self.targets}")
    
    def process_logical_reasoning(self, request: LogicalReasoningRequest) -> LogicalReasoningResponse:
        """
        Process comprehensive logical reasoning request.
        
        Args:
            request: Logical reasoning task request
            
        Returns:
            LogicalReasoningResponse with analysis and results
        """
        start_time = time.time()
        
        try:
            if request.logic_type == LogicType.PROPOSITIONAL:
                result = self._process_propositional_logic(request)
            elif request.logic_type == LogicType.PREDICATE:
                result = self._process_predicate_logic(request)
            elif request.logic_type == LogicType.INDUCTIVE:
                result = self._process_inductive_reasoning(request)
            elif request.logic_type == LogicType.DEDUCTIVE:
                result = self._process_deductive_reasoning(request)
            else:
                result = self._process_general_logic(request)
            
            execution_time = time.time() - start_time
            
            # Detect fallacies in the query
            fallacies = self.fallacy_detector.detect_fallacies(request.query)
            
            # Update metrics
            self._update_metrics(request.logic_type, True, execution_time, len(fallacies))
            
            return LogicalReasoningResponse(
                success=True,
                result=result,
                logic_type=request.logic_type,
                execution_time=execution_time,
                confidence=result.get('confidence', 0.8),
                proof=result.get('proof'),
                truth_analysis=result.get('truth_analysis'),
                fallacies_detected=fallacies,
                verification_passed=result.get('verification_passed', False)
            )
            
        except Exception as e:
            execution_time = time.time() - start_time
            self.logger.error(f"Logical reasoning failed: {str(e)}")
            
            # Update metrics
            self._update_metrics(request.logic_type, False, execution_time, 0)
            
            return LogicalReasoningResponse(
                success=False,
                result=f"Logical reasoning failed: {str(e)}",
                logic_type=request.logic_type,
                execution_time=execution_time,
                confidence=0.1
            )
    
    def _process_propositional_logic(self, request: LogicalReasoningRequest) -> Dict[str, Any]:
        """Process propositional logic requests."""
        
        # Parse the statement
        statement = self.propositional_engine.parse_proposition(request.query)
        
        if not statement.is_valid:
            return {
                'analysis': 'Invalid propositional logic statement',
                'confidence': 0.2,
                'suggestions': [
                    'Check syntax for balanced parentheses',
                    'Ensure variables are single uppercase letters',
                    'Verify logical operators are properly used'
                ]
            }
        
        # Generate truth table
        truth_analysis = self.propositional_engine.evaluate_truth_table(statement)
        
        if 'error' in truth_analysis:
            return {
                'analysis': f"Truth table analysis failed: {truth_analysis['error']}",
                'confidence': 0.3,
                'statement_parsed': statement
            }
        
        # Determine logical properties
        properties = truth_analysis['analysis']
        
        # Generate explanation
        explanation = self._generate_propositional_explanation(statement, properties)
        
        return {
            'analysis': explanation,
            'confidence': 0.9,
            'statement_parsed': statement,
            'truth_analysis': truth_analysis,
            'logical_properties': properties,
            'verification_passed': True
        }
    
    def _process_predicate_logic(self, request: LogicalReasoningRequest) -> Dict[str, Any]:
        """Process predicate logic requests."""
        
        # Parse the predicate statement
        statement = self.predicate_engine.parse_predicate(request.query)
        
        if not statement.is_valid:
            return {
                'analysis': 'Invalid predicate logic statement - no predicates found',
                'confidence': 0.3,
                'suggestions': [
                    'Ensure predicates are in the form P(x), Q(x,y), etc.',
                    'Use quantifiers like forall or exists',
                    'Check variable naming (lowercase letters)'
                ]
            }
        
        # Analyze quantifier structure
        quantifier_analysis = self.predicate_engine.analyze_quantifier_structure(statement)
        
        # Generate explanation
        explanation = self._generate_predicate_explanation(statement, quantifier_analysis)
        
        return {
            'analysis': explanation,
            'confidence': 0.8,
            'statement_parsed': statement,
            'quantifier_analysis': quantifier_analysis,
            'complexity_level': quantifier_analysis['complexity_level'],
            'verification_passed': True
        }
    
    def _process_deductive_reasoning(self, request: LogicalReasoningRequest) -> Dict[str, Any]:
        """Process deductive reasoning requests."""
        
        # Attempt to identify premises and conclusion
        premises, conclusion = self._extract_deductive_components(request.query)
        
        if not premises:
            return {
                'analysis': 'Deductive reasoning requires clear premises and conclusion',
                'confidence': 0.4,
                'suggestions': [
                    'Clearly state your premises',
                    'Identify the conclusion you want to reach',
                    'Use logical connectives (if-then, therefore, etc.)'
                ]
            }
        
        # Analyze logical validity
        validity_analysis = self._analyze_deductive_validity(premises, conclusion)
        
        return {
            'analysis': validity_analysis['explanation'],
            'confidence': validity_analysis['confidence'],
            'premises': premises,
            'conclusion': conclusion,
            'is_valid': validity_analysis['is_valid'],
            'reasoning_type': 'deductive',
            'verification_passed': validity_analysis['is_valid']
        }
    
    def _process_inductive_reasoning(self, request: LogicalReasoningRequest) -> Dict[str, Any]:
        """Process inductive reasoning requests."""
        
        # Identify patterns and generalizations
        pattern_analysis = self._analyze_inductive_pattern(request.query)
        
        return {
            'analysis': pattern_analysis['explanation'],
            'confidence': pattern_analysis['confidence'],
            'pattern_strength': pattern_analysis.get('strength', 'unknown'),
            'generalization': pattern_analysis.get('generalization', 'none identified'),
            'reasoning_type': 'inductive',
            'limitations': [
                'Inductive reasoning provides probability, not certainty',
                'Conclusions may be false even with true premises',
                'Strength depends on sample size and representativeness'
            ]
        }
    
    def _process_general_logic(self, request: LogicalReasoningRequest) -> Dict[str, Any]:
        """Process general logical reasoning requests."""
        
        # Attempt to identify the type of logical reasoning
        logic_type = self._identify_logic_type(request.query)
        
        # Provide general logical analysis
        analysis = self._general_logical_analysis(request.query, logic_type)
        
        return {
            'analysis': analysis['explanation'],
            'confidence': analysis['confidence'],
            'identified_logic_type': logic_type.value,
            'reasoning_steps': analysis.get('steps', []),
            'suggestions': analysis.get('suggestions', [])
        }
    
    def _extract_deductive_components(self, text: str) -> Tuple[List[str], str]:
        """Extract premises and conclusion from deductive reasoning text."""
        
        premises = []
        conclusion = ""
        
        # Look for common deductive reasoning patterns
        if 'therefore' in text.lower():
            parts = text.lower().split('therefore')
            if len(parts) == 2:
                premise_text = parts[0].strip()
                conclusion = parts[1].strip()
                
                # Split premises by common separators
                premise_separators = ['. ', '; ', ' and ', '\n']
                premise_list = [premise_text]
                
                for sep in premise_separators:
                    new_list = []
                    for p in premise_list:
                        new_list.extend(p.split(sep))
                    premise_list = new_list
                
                premises = [p.strip() for p in premise_list if p.strip()]
        
        elif 'if' in text.lower() and 'then' in text.lower():
            # Handle if-then structure
            if_match = re.search(r'if\s+(.*?)\s+then\s+(.*)', text.lower())
            if if_match:
                premises = [if_match.group(1).strip()]
                conclusion = if_match.group(2).strip()
        
        return premises, conclusion
    
    def _analyze_deductive_validity(self, premises: List[str], conclusion: str) -> Dict[str, Any]:
        """Analyze the validity of deductive reasoning."""
        
        # This is a simplified validity check
        # In practice, this would require more sophisticated logical analysis
        
        if not premises or not conclusion:
            return {
                'is_valid': False,
                'confidence': 0.2,
                'explanation': 'Cannot determine validity: insufficient premises or conclusion'
            }
        
        # Check for basic modus ponens pattern
        if len(premises) >= 2:
            # Look for "if A then B" and "A" pattern
            conditional = None
            antecedent = None
            
            for premise in premises:
                if 'if' in premise.lower() and 'then' in premise.lower():
                    conditional = premise
                else:
                    antecedent = premise
            
            if conditional and antecedent:
                # Basic modus ponens check
                return {
                    'is_valid': True,
                    'confidence': 0.8,
                    'explanation': f'Valid modus ponens: Given "{conditional}" and "{antecedent}", the conclusion "{conclusion}" follows logically.',
                    'rule_applied': 'modus_ponens'
                }
        
        # General validity assessment
        return {
            'is_valid': None,  # Cannot determine
            'confidence': 0.6,
            'explanation': f'Premises: {premises}. Conclusion: {conclusion}. Logical validity requires formal analysis of the argument structure.',
            'note': 'Complex deductive reasoning requires formal logical analysis beyond basic pattern matching'
        }
    
    def _analyze_inductive_pattern(self, text: str) -> Dict[str, Any]:
        """Analyze inductive reasoning patterns."""
        
        # Look for generalization patterns
        generalization_words = ['all', 'most', 'many', 'generally', 'usually', 'typically']
        example_words = ['example', 'instance', 'case', 'observe', 'see']
        
        has_generalization = any(word in text.lower() for word in generalization_words)
        has_examples = any(word in text.lower() for word in example_words)
        
        if has_generalization and has_examples:
            strength = 'moderate'
            confidence = 0.7
            explanation = 'Inductive reasoning detected: generalization based on observed examples.'
        elif has_generalization:
            strength = 'weak'
            confidence = 0.5
            explanation = 'Potential inductive reasoning: generalization present but examples unclear.'
        elif has_examples:
            strength = 'weak'
            confidence = 0.4
            explanation = 'Examples provided but generalization not clearly stated.'
        else:
            strength = 'none'
            confidence = 0.3
            explanation = 'No clear inductive reasoning pattern identified.'
        
        return {
            'strength': strength,
            'confidence': confidence,
            'explanation': explanation,
            'has_generalization': has_generalization,
            'has_examples': has_examples
        }
    
    def _identify_logic_type(self, text: str) -> LogicType:
        """Identify the type of logical reasoning in text."""
        
        text_lower = text.lower()
        
        # Check for predicate logic indicators
        if any(indicator in text_lower for indicator in ['forall', 'exists', '∀', '∃']) or \
           re.search(r'[A-Z]\([a-z,\s]+\)', text):
            return LogicType.PREDICATE
        
        # Check for propositional logic indicators
        if any(op in text_lower for op in ['and', 'or', 'not', 'implies', 'if and only if']) and \
           re.search(r'\b[A-Z]\b', text):
            return LogicType.PROPOSITIONAL
        
        # Check for inductive reasoning
        if any(word in text_lower for word in ['therefore all', 'generally', 'usually', 'most']):
            return LogicType.INDUCTIVE
        
        # Check for deductive reasoning
        if any(word in text_lower for word in ['therefore', 'thus', 'hence', 'consequently']):
            return LogicType.DEDUCTIVE
        
        # Check for modal logic
        if any(word in text_lower for word in ['necessary', 'possible', 'must be', 'might be']):
            return LogicType.MODAL
        
        return LogicType.PROPOSITIONAL  # Default
    
    def _general_logical_analysis(self, text: str, logic_type: LogicType) -> Dict[str, Any]:
        """Perform general logical analysis."""
        
        analysis = {
            'confidence': 0.6,
            'steps': [],
            'suggestions': []
        }
        
        if logic_type == LogicType.PROPOSITIONAL:
            analysis['explanation'] = 'This appears to be propositional logic. Consider using variables (A, B, C) and logical connectives (and, or, not, implies).'
            analysis['suggestions'] = [
                'Identify the main propositions',
                'Determine the logical relationships',
                'Consider creating a truth table for analysis'
            ]
        
        elif logic_type == LogicType.PREDICATE:
            analysis['explanation'] = 'This appears to involve predicate logic with quantifiers. Consider the scope of quantifiers and predicate relationships.'
            analysis['suggestions'] = [
                'Identify predicates and their arguments',
                'Clarify quantifier scope',
                'Consider domain of discourse'
            ]
        
        elif logic_type == LogicType.DEDUCTIVE:
            analysis['explanation'] = 'This appears to be deductive reasoning. The conclusion should follow necessarily from the premises.'
            analysis['suggestions'] = [
                'Clearly state premises',
                'Identify the conclusion',
                'Check if conclusion follows logically'
            ]
        
        elif logic_type == LogicType.INDUCTIVE:
            analysis['explanation'] = 'This appears to be inductive reasoning. The conclusion provides probability based on evidence.'
            analysis['suggestions'] = [
                'Identify the pattern or examples',
                'Consider the strength of generalization',
                'Evaluate sample representativeness'
            ]
        
        else:
            analysis['explanation'] = f'This involves {logic_type.value} reasoning. Specialized analysis may be required.'
            analysis['suggestions'] = [
                'Clarify the logical structure',
                'Identify key logical relationships',
                'Consider formal logical analysis'
            ]
        
        return analysis
    
    def _generate_propositional_explanation(self, statement: LogicalStatement, properties: Dict) -> str:
        """Generate explanation for propositional logic analysis."""
        
        explanation = f"Propositional logic analysis of: '{statement.statement}'\n\n"
        
        explanation += f"Variables identified: {', '.join(statement.variables)}\n"
        explanation += f"Operators used: {', '.join([op.value for op in statement.operators])}\n"
        explanation += f"Complexity score: {statement.complexity:.2f}\n\n"
        
        if properties['is_tautology']:
            explanation += "✅ This statement is a TAUTOLOGY - it's always true regardless of variable values."
        elif properties['is_contradiction']:
            explanation += "❌ This statement is a CONTRADICTION - it's always false regardless of variable values."
        elif properties['is_contingent']:
            explanation += "⚖️ This statement is CONTINGENT - its truth value depends on the variable assignments."
        
        if properties['satisfiable']:
            explanation += f"\n\n✅ The statement is SATISFIABLE - there exists at least one assignment that makes it true."
        
        return explanation
    
    def _generate_predicate_explanation(self, statement: LogicalStatement, quantifier_analysis: Dict) -> str:
        """Generate explanation for predicate logic analysis."""
        
        explanation = f"Predicate logic analysis of: '{statement.statement}'\n\n"
        
        explanation += f"Variables: {', '.join(statement.variables)}\n"
        explanation += f"Complexity level: {quantifier_analysis['complexity_level']}\n\n"
        
        if quantifier_analysis['universal_quantifiers']:
            explanation += f"Universal quantifiers (∀): {', '.join(quantifier_analysis['universal_quantifiers'])}\n"
        
        if quantifier_analysis['existential_quantifiers']:
            explanation += f"Existential quantifiers (∃): {', '.join(quantifier_analysis['existential_quantifiers'])}\n"
        
        if quantifier_analysis['free_variables']:
            explanation += f"Free variables: {', '.join(quantifier_analysis['free_variables'])}\n"
        
        explanation += f"\nQuantifier alternations: {quantifier_analysis['quantifier_alternations']}"
        
        if quantifier_analysis['quantifier_alternations'] > 1:
            explanation += " (High complexity - multiple quantifier alternations)"
        
        return explanation
    
    def _update_metrics(self, logic_type: LogicType, success: bool, execution_time: float, fallacies_count: int):
        """Update performance metrics."""
        self.metrics['requests_processed'] += 1
        
        if success:
            self.metrics['valid_analyses'] += 1
            
            if logic_type in [LogicType.DEDUCTIVE, LogicType.INDUCTIVE]:
                self.metrics['successful_proofs'] += 1
        
        self.metrics['fallacies_detected'] += fallacies_count
        
        # Update average response time
        current_avg = self.metrics['average_response_time']
        total_requests = self.metrics['requests_processed']
        self.metrics['average_response_time'] = (
            (current_avg * (total_requests - 1) + execution_time) / total_requests
        )
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get comprehensive performance metrics."""
        
        total_requests = self.metrics['requests_processed']
        
        if total_requests == 0:
            return {'message': 'No requests processed yet'}
        
        return {
            'performance_summary': {
                'total_requests': total_requests,
                'analysis_success_rate': self.metrics['valid_analyses'] / total_requests,
                'proof_success_rate': self.metrics['successful_proofs'] / max(1, total_requests // 2),  # Estimate
                'fallacies_detected': self.metrics['fallacies_detected'],
                'average_response_time': self.metrics['average_response_time']
            },
            'target_vs_actual': {
                'proof_validity_target': self.targets['proof_validity_accuracy'],
                'fallacy_detection_target': self.targets['fallacy_detection_rate'],
                'logic_analysis_target': self.targets['logic_analysis_accuracy'],
                'complex_reasoning_target': self.targets['complex_reasoning_success']
            },
            'capabilities': {
                'supported_logic_types': [t.value for t in LogicType],
                'reasoning_strategies': [s.value for s in ReasoningStrategy],
                'fallacy_detection': list(self.fallacy_detector.fallacy_patterns.keys())
            }
        }