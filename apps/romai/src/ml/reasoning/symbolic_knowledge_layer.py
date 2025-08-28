"""
Symbolic Knowledge Layer for RomAI AGI System

This module implements symbolic reasoning components including knowledge graphs,
logical rule engines, and constraint solvers for precise symbolic manipulation.

Based on Microsoft Azure AI best practices for symbolic AI and logical reasoning
systems with support for first-order logic, constraint satisfaction, and knowledge
representation.
"""

import asyncio
import time
import logging
from typing import Dict, Any, List, Optional, Set, Tuple, Union
from dataclasses import dataclass, field
from collections import defaultdict, deque
import re
import json
from enum import Enum

from neural_symbolic_types import (
    SymbolicFact, SymbolicRule, ReasoningMode, KnowledgeType, SymbolicRepresentation,
    ConceptNode, ConceptRelationship, KnowledgeGraph, RelationType,
    SymbolicReasoningEngine, SymbolicReasoningException, ConsistencyException,
    NeuralSymbolicConfig, ConfidenceScore
)

logger = logging.getLogger(__name__)

class LogicalOperator(Enum):
    """Logical operators for symbolic reasoning"""
    AND = "and"
    OR = "or"
    NOT = "not"
    IMPLIES = "implies"
    EQUIVALENT = "equivalent"
    EXISTS = "exists"
    FORALL = "forall"

@dataclass
class LogicalExpression:
    """Represents a logical expression"""
    operator: LogicalOperator
    operands: List[Union['LogicalExpression', SymbolicFact]]
    variables: Set[str] = field(default_factory=set)
    
    def evaluate(self, bindings: Dict[str, Any]) -> bool:
        """Evaluate the logical expression with given variable bindings"""
        if self.operator == LogicalOperator.AND:
            return all(self._evaluate_operand(op, bindings) for op in self.operands)
        elif self.operator == LogicalOperator.OR:
            return any(self._evaluate_operand(op, bindings) for op in self.operands)
        elif self.operator == LogicalOperator.NOT:
            return not self._evaluate_operand(self.operands[0], bindings)
        elif self.operator == LogicalOperator.IMPLIES:
            antecedent = self._evaluate_operand(self.operands[0], bindings)
            consequent = self._evaluate_operand(self.operands[1], bindings)
            return not antecedent or consequent
        elif self.operator == LogicalOperator.EQUIVALENT:
            left = self._evaluate_operand(self.operands[0], bindings)
            right = self._evaluate_operand(self.operands[1], bindings)
            return left == right
        else:
            # EXISTS and FORALL would need more complex handling
            return True
    
    def _evaluate_operand(self, operand: Union['LogicalExpression', SymbolicFact], bindings: Dict[str, Any]) -> bool:
        """Evaluate a single operand"""
        if isinstance(operand, LogicalExpression):
            return operand.evaluate(bindings)
        elif isinstance(operand, SymbolicFact):
            # Simple fact evaluation - in practice would check against knowledge base
            return operand.confidence > 0.5
        else:
            return bool(operand)

class SymbolicKnowledgeBase:
    """Symbolic knowledge base for storing and querying facts and rules"""
    
    def __init__(self, config: NeuralSymbolicConfig):
        self.config = config
        self.facts: Dict[str, SymbolicFact] = {}
        self.rules: Dict[str, SymbolicRule] = {}
        self.knowledge_graph = KnowledgeGraph()
        self.fact_index: Dict[str, Set[str]] = defaultdict(set)  # Subject/predicate index
        self.rule_index: Dict[str, Set[str]] = defaultdict(set)  # Pattern index
        self.consistency_cache: Optional[bool] = None
        self.last_consistency_check = 0.0
        
        logger.info("Symbolic knowledge base initialized")
    
    def add_fact(self, fact: SymbolicFact) -> str:
        """Add a fact to the knowledge base"""
        fact_id = self._generate_fact_id(fact)
        
        # Check if fact already exists
        if fact_id in self.facts:
            existing_fact = self.facts[fact_id]
            # Update confidence using weighted average
            total_confidence = (existing_fact.confidence + fact.confidence) / 2
            existing_fact.confidence = min(1.0, total_confidence)
            existing_fact.timestamp = max(existing_fact.timestamp, fact.timestamp)
        else:
            self.facts[fact_id] = fact
            # Update indices
            self.fact_index[fact.subject].add(fact_id)
            self.fact_index[fact.predicate].add(fact_id)
            
            # Add to knowledge graph
            if fact.subject not in self.knowledge_graph.concepts:
                self.knowledge_graph.add_concept(ConceptNode(
                    concept_id=fact.subject,
                    name=fact.subject,
                    symbolic_properties={fact.predicate: fact.object}
                ))
        
        self.consistency_cache = None  # Invalidate cache
        return fact_id
    
    def add_rule(self, rule: SymbolicRule) -> str:
        """Add a rule to the knowledge base"""
        rule_id = f"rule_{len(self.rules)}_{int(time.time())}"
        self.rules[rule_id] = rule
        
        # Index rule by conclusion patterns
        for conclusion in rule.conclusions:
            pattern = f"{conclusion.subject}_{conclusion.predicate}"
            self.rule_index[pattern].add(rule_id)
        
        self.consistency_cache = None  # Invalidate cache
        return rule_id
    
    def query_facts(self, subject: Optional[str] = None, predicate: Optional[str] = None, 
                   object: Optional[Any] = None, min_confidence: float = 0.0) -> List[SymbolicFact]:
        """Query facts from the knowledge base"""
        candidate_ids = set(self.facts.keys())
        
        # Filter by subject
        if subject is not None:
            candidate_ids &= self.fact_index.get(subject, set())
        
        # Filter by predicate
        if predicate is not None:
            candidate_ids &= self.fact_index.get(predicate, set())
        
        # Apply additional filters
        results = []
        for fact_id in candidate_ids:
            fact = self.facts[fact_id]
            
            # Check object filter
            if object is not None and fact.object != object:
                continue
            
            # Check confidence filter
            if fact.confidence < min_confidence:
                continue
            
            results.append(fact)
        
        # Sort by confidence (descending)
        results.sort(key=lambda f: f.confidence, reverse=True)
        return results
    
    def query_rules(self, conclusion_pattern: Optional[str] = None) -> List[SymbolicRule]:
        """Query rules from the knowledge base"""
        if conclusion_pattern:
            rule_ids = self.rule_index.get(conclusion_pattern, set())
            return [self.rules[rid] for rid in rule_ids]
        else:
            return list(self.rules.values())
    
    def _generate_fact_id(self, fact: SymbolicFact) -> str:
        """Generate a unique ID for a fact"""
        return f"{fact.subject}_{fact.predicate}_{hash(str(fact.object))}"
    
    async def check_consistency(self) -> bool:
        """Check knowledge base for logical consistency"""
        current_time = time.time()
        
        # Use cache if recent
        if (self.consistency_cache is not None and 
            current_time - self.last_consistency_check < 60.0):  # Cache for 1 minute
            return self.consistency_cache
        
        try:
            # Check for contradictory facts
            fact_groups = defaultdict(list)
            for fact in self.facts.values():
                key = f"{fact.subject}_{fact.predicate}"
                fact_groups[key].append(fact)
            
            contradictions = 0
            for facts in fact_groups.values():
                if len(facts) > 1:
                    objects = {f.object for f in facts}
                    if len(objects) > 1:
                        # Check if objects are contradictory
                        if any(isinstance(obj, bool) for obj in objects):
                            if True in objects and False in objects:
                                contradictions += 1
            
            # Knowledge base is consistent if contradictions are below threshold
            consistency = contradictions / max(len(fact_groups), 1) < (1 - self.config.consistency_threshold)
            
            self.consistency_cache = consistency
            self.last_consistency_check = current_time
            
            if not consistency:
                logger.warning(f"Knowledge base inconsistency detected: {contradictions} contradictions")
            
            return consistency
            
        except Exception as e:
            logger.error(f"Consistency check failed: {e}")
            return False
    
    def get_related_facts(self, fact: SymbolicFact, max_distance: int = 2) -> List[SymbolicFact]:
        """Get facts related to the given fact"""
        related = []
        visited = set()
        queue = deque([(fact, 0)])
        
        while queue and len(related) < 50:  # Limit results
            current_fact, distance = queue.popleft()
            
            if distance > max_distance:
                continue
            
            fact_key = self._generate_fact_id(current_fact)
            if fact_key in visited:
                continue
            visited.add(fact_key)
            
            # Find facts with same subject or object
            subject_facts = self.query_facts(subject=current_fact.subject)
            object_facts = self.query_facts(object=current_fact.subject) if isinstance(current_fact.object, str) else []
            
            for related_fact in subject_facts + object_facts:
                if related_fact != current_fact:
                    related.append(related_fact)
                    if distance < max_distance:
                        queue.append((related_fact, distance + 1))
        
        return related

class LogicalRuleEngine:
    """Logical rule engine for symbolic reasoning"""
    
    def __init__(self, knowledge_base: SymbolicKnowledgeBase, config: NeuralSymbolicConfig):
        self.knowledge_base = knowledge_base
        self.config = config
        self.inference_history: List[Dict[str, Any]] = []
        
        logger.info("Logical rule engine initialized")
    
    async def apply_rules(self, max_iterations: int = 10) -> List[SymbolicFact]:
        """Apply all rules to derive new facts"""
        new_facts = []
        iteration = 0
        
        while iteration < max_iterations:
            iteration_facts = []
            
            for rule in self.knowledge_base.rules.values():
                rule_facts = await self.apply_single_rule(rule)
                iteration_facts.extend(rule_facts)
            
            if not iteration_facts:
                break  # No new facts derived
            
            new_facts.extend(iteration_facts)
            iteration += 1
        
        logger.info(f"Rule application completed after {iteration} iterations, derived {len(new_facts)} new facts")
        return new_facts
    
    async def apply_single_rule(self, rule: SymbolicRule) -> List[SymbolicFact]:
        """Apply a single rule to derive new facts"""
        try:
            # Find all possible variable bindings that satisfy conditions
            bindings_list = await self._find_bindings(rule.conditions)
            
            new_facts = []
            for bindings in bindings_list:
                # Apply bindings to conclusions
                for conclusion_template in rule.conclusions:
                    conclusion = self._substitute_variables(conclusion_template, bindings)
                    
                    # Calculate confidence for derived fact
                    condition_confidences = [
                        self._get_fact_confidence(self._substitute_variables(cond, bindings))
                        for cond in rule.conditions
                    ]
                    
                    derived_confidence = min(condition_confidences) * rule.strength if condition_confidences else rule.strength
                    
                    derived_fact = SymbolicFact(
                        subject=conclusion.subject,
                        predicate=conclusion.predicate,
                        object=conclusion.object,
                        confidence=derived_confidence,
                        source=f"rule_inference_{rule.description}",
                        metadata={'rule_application': True, 'bindings': bindings}
                    )
                    
                    # Add to knowledge base if confidence is sufficient
                    if derived_confidence >= 0.1:  # Minimum threshold
                        fact_id = self.knowledge_base.add_fact(derived_fact)
                        new_facts.append(derived_fact)
                        
                        # Record inference
                        self.inference_history.append({
                            'rule': rule.description,
                            'conditions': rule.conditions,
                            'conclusion': derived_fact,
                            'bindings': bindings,
                            'confidence': derived_confidence,
                            'timestamp': time.time()
                        })
            
            return new_facts
            
        except Exception as e:
            logger.error(f"Rule application failed: {e}")
            return []
    
    async def _find_bindings(self, conditions: List[SymbolicFact]) -> List[Dict[str, Any]]:
        """Find all variable bindings that satisfy the rule conditions"""
        if not conditions:
            return [{}]
        
        # Extract variables from conditions
        variables = set()
        for condition in conditions:
            variables.update(self._extract_variables(condition))
        
        if not variables:
            # No variables, check if all conditions are satisfied
            all_satisfied = True
            for condition in conditions:
                matching_facts = self.knowledge_base.query_facts(
                    subject=condition.subject,
                    predicate=condition.predicate,
                    object=condition.object,
                    min_confidence=0.1
                )
                if not matching_facts:
                    all_satisfied = False
                    break
            
            return [{}] if all_satisfied else []
        
        # Generate bindings through backtracking
        bindings_list = []
        await self._backtrack_bindings(conditions, variables, {}, 0, bindings_list)
        
        return bindings_list
    
    async def _backtrack_bindings(self, conditions: List[SymbolicFact], variables: Set[str],
                                current_bindings: Dict[str, Any], condition_index: int,
                                result_bindings: List[Dict[str, Any]]) -> None:
        """Backtracking algorithm to find variable bindings"""
        if condition_index >= len(conditions):
            result_bindings.append(current_bindings.copy())
            return
        
        condition = conditions[condition_index]
        
        # Get all facts that could potentially match this condition
        candidate_facts = self.knowledge_base.query_facts()
        
        for fact in candidate_facts:
            # Try to unify the condition with this fact
            unification = self._unify(condition, fact, current_bindings.copy())
            
            if unification is not None:
                # Recurse with the new bindings
                await self._backtrack_bindings(
                    conditions, variables, unification, condition_index + 1, result_bindings
                )
                
                # Limit the number of bindings to prevent combinatorial explosion
                if len(result_bindings) > 1000:
                    return
    
    def _unify(self, pattern: SymbolicFact, fact: SymbolicFact, bindings: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Attempt to unify a pattern with a fact"""
        # Check predicate match
        if not self._unify_term(pattern.predicate, fact.predicate, bindings):
            return None
        
        # Check subject match
        if not self._unify_term(pattern.subject, fact.subject, bindings):
            return None
        
        # Check object match
        if not self._unify_term(pattern.object, fact.object, bindings):
            return None
        
        return bindings
    
    def _unify_term(self, pattern_term: Any, fact_term: Any, bindings: Dict[str, Any]) -> bool:
        """Unify a single term (subject, predicate, or object)"""
        # If pattern term is a variable (starts with ?)
        if isinstance(pattern_term, str) and pattern_term.startswith('?'):
            var_name = pattern_term[1:]  # Remove ?
            
            if var_name in bindings:
                return bindings[var_name] == fact_term
            else:
                bindings[var_name] = fact_term
                return True
        
        # Direct match
        return pattern_term == fact_term
    
    def _extract_variables(self, fact: SymbolicFact) -> Set[str]:
        """Extract variables from a symbolic fact"""
        variables = set()
        
        for term in [fact.subject, fact.predicate, str(fact.object)]:
            if isinstance(term, str) and term.startswith('?'):
                variables.add(term[1:])  # Remove ?
        
        return variables
    
    def _substitute_variables(self, fact_template: SymbolicFact, bindings: Dict[str, Any]) -> SymbolicFact:
        """Substitute variables in a fact template with their bindings"""
        def substitute_term(term: Any) -> Any:
            if isinstance(term, str) and term.startswith('?'):
                var_name = term[1:]
                return bindings.get(var_name, term)
            return term
        
        return SymbolicFact(
            subject=substitute_term(fact_template.subject),
            predicate=substitute_term(fact_template.predicate),
            object=substitute_term(fact_template.object),
            confidence=fact_template.confidence,
            source=fact_template.source,
            metadata=fact_template.metadata.copy()
        )
    
    def _get_fact_confidence(self, fact: SymbolicFact) -> float:
        """Get confidence for a fact from the knowledge base"""
        matching_facts = self.knowledge_base.query_facts(
            subject=fact.subject,
            predicate=fact.predicate,
            object=fact.object
        )
        
        return max([f.confidence for f in matching_facts], default=0.0)

class ConstraintSolver:
    """Constraint satisfaction solver for symbolic reasoning"""
    
    def __init__(self, config: NeuralSymbolicConfig):
        self.config = config
        self.constraints: List[Dict[str, Any]] = []
        self.variables: Dict[str, Any] = {}
        
        logger.info("Constraint solver initialized")
    
    def add_constraint(self, constraint_type: str, variables: List[str], 
                      condition: callable, description: str = "") -> str:
        """Add a constraint to the solver"""
        constraint_id = f"constraint_{len(self.constraints)}_{int(time.time())}"
        
        constraint = {
            'id': constraint_id,
            'type': constraint_type,
            'variables': variables,
            'condition': condition,
            'description': description
        }
        
        self.constraints.append(constraint)
        
        # Initialize variables if not present
        for var in variables:
            if var not in self.variables:
                self.variables[var] = None
        
        return constraint_id
    
    async def solve(self, max_attempts: int = 1000) -> Dict[str, Any]:
        """Solve the constraint satisfaction problem"""
        if not self.constraints:
            return self.variables.copy()
        
        # Simple backtracking CSP solver
        solution = await self._backtrack_solve(list(self.variables.keys()), {}, 0, max_attempts)
        
        if solution is not None:
            logger.info(f"Constraint solving successful: {solution}")
            return solution
        else:
            logger.warning("Constraint solving failed - no solution found")
            return {}
    
    async def _backtrack_solve(self, variables: List[str], assignment: Dict[str, Any],
                             var_index: int, max_attempts: int) -> Optional[Dict[str, Any]]:
        """Backtracking constraint solver"""
        if var_index >= len(variables):
            # Check if all constraints are satisfied
            if await self._check_constraints(assignment):
                return assignment
            else:
                return None
        
        if max_attempts <= 0:
            return None
        
        variable = variables[var_index]
        
        # Try different values for the variable
        for value in self._get_domain(variable):
            assignment[variable] = value
            
            # Check if assignment is consistent with constraints
            if await self._is_consistent(assignment, variable):
                result = await self._backtrack_solve(variables, assignment, var_index + 1, max_attempts - 1)
                if result is not None:
                    return result
            
            del assignment[variable]
        
        return None
    
    def _get_domain(self, variable: str) -> List[Any]:
        """Get the domain of possible values for a variable"""
        # Simple domain - could be expanded based on variable type
        return [True, False, 0, 1, 2, 3, 4, 5, "unknown", "yes", "no"]
    
    async def _is_consistent(self, assignment: Dict[str, Any], variable: str) -> bool:
        """Check if partial assignment is consistent with constraints"""
        for constraint in self.constraints:
            # Only check constraints involving the current variable
            if variable in constraint['variables']:
                # Check if all variables in constraint are assigned
                all_assigned = all(var in assignment for var in constraint['variables'])
                
                if all_assigned:
                    # Extract values for constraint variables
                    values = {var: assignment[var] for var in constraint['variables']}
                    
                    try:
                        if not constraint['condition'](**values):
                            return False
                    except Exception:
                        # If constraint evaluation fails, assume inconsistent
                        return False
        
        return True
    
    async def _check_constraints(self, assignment: Dict[str, Any]) -> bool:
        """Check if complete assignment satisfies all constraints"""
        for constraint in self.constraints:
            values = {var: assignment[var] for var in constraint['variables']}
            
            try:
                if not constraint['condition'](**values):
                    return False
            except Exception:
                return False
        
        return True

class SymbolicKnowledgeLayer(SymbolicReasoningEngine):
    """Main symbolic knowledge layer implementation"""
    
    def __init__(self, config: NeuralSymbolicConfig):
        self.config = config
        self.knowledge_base = SymbolicKnowledgeBase(config)
        self.rule_engine = LogicalRuleEngine(self.knowledge_base, config)
        self.constraint_solver = ConstraintSolver(config)
        
        # Initialize with basic logical rules
        self._initialize_basic_rules()
        
        logger.info("Symbolic Knowledge Layer initialized")
    
    def _initialize_basic_rules(self):
        """Initialize with fundamental logical rules"""
        # Transitivity rule for "is_a" relationships
        transitivity_rule = SymbolicRule(
            conditions=[
                SymbolicFact("?x", "is_a", "?y", 1.0, "pattern"),
                SymbolicFact("?y", "is_a", "?z", 1.0, "pattern")
            ],
            conclusions=[
                SymbolicFact("?x", "is_a", "?z", 1.0, "inference")
            ],
            rule_type=ReasoningMode.DEDUCTIVE,
            strength=0.95,
            description="Transitivity of is_a relationships"
        )
        
        self.knowledge_base.add_rule(transitivity_rule)
        
        # Symmetry rule for "similar_to" relationships
        symmetry_rule = SymbolicRule(
            conditions=[
                SymbolicFact("?x", "similar_to", "?y", 1.0, "pattern")
            ],
            conclusions=[
                SymbolicFact("?y", "similar_to", "?x", 1.0, "inference")
            ],
            rule_type=ReasoningMode.DEDUCTIVE,
            strength=0.9,
            description="Symmetry of similarity relationships"
        )
        
        self.knowledge_base.add_rule(symmetry_rule)
    
    async def reason(self, facts: List[SymbolicFact], rules: List[SymbolicRule]) -> List[SymbolicFact]:
        """Apply symbolic reasoning to derive new facts"""
        try:
            # Add input facts and rules to knowledge base
            for fact in facts:
                self.knowledge_base.add_fact(fact)
            
            for rule in rules:
                self.knowledge_base.add_rule(rule)
            
            # Apply rule-based inference
            new_facts = await self.rule_engine.apply_rules(max_iterations=self.config.reasoning_depth)
            
            logger.info(f"Symbolic reasoning derived {len(new_facts)} new facts")
            return new_facts
            
        except Exception as e:
            logger.error(f"Symbolic reasoning failed: {e}")
            raise SymbolicReasoningException(f"Failed to perform symbolic reasoning: {e}")
    
    async def validate_consistency(self, knowledge_base: List[SymbolicFact]) -> bool:
        """Check knowledge base for logical consistency"""
        try:
            # Add facts to temporary knowledge base
            for fact in knowledge_base:
                self.knowledge_base.add_fact(fact)
            
            # Check consistency
            is_consistent = await self.knowledge_base.check_consistency()
            
            if not is_consistent:
                raise ConsistencyException("Knowledge base contains logical inconsistencies")
            
            return is_consistent
            
        except Exception as e:
            logger.error(f"Consistency validation failed: {e}")
            return False
    
    async def explain_inference(self, conclusion: SymbolicFact) -> str:
        """Generate explanation for how conclusion was reached"""
        try:
            # Find inference history for this conclusion
            relevant_inferences = [
                inf for inf in self.rule_engine.inference_history
                if self._facts_match(inf['conclusion'], conclusion)
            ]
            
            if not relevant_inferences:
                return f"Fact '{conclusion.subject} {conclusion.predicate} {conclusion.object}' was directly asserted."
            
            # Get the most recent inference
            latest_inference = max(relevant_inferences, key=lambda x: x['timestamp'])
            
            explanation = f"Conclusion: {conclusion.subject} {conclusion.predicate} {conclusion.object}\n"
            explanation += f"Rule applied: {latest_inference['rule']}\n"
            explanation += f"Conditions that were satisfied:\n"
            
            for i, condition in enumerate(latest_inference['conditions'], 1):
                substituted = self.rule_engine._substitute_variables(condition, latest_inference['bindings'])
                explanation += f"  {i}. {substituted.subject} {substituted.predicate} {substituted.object}\n"
            
            explanation += f"Variable bindings: {latest_inference['bindings']}\n"
            explanation += f"Confidence: {latest_inference['confidence']:.3f}"
            
            return explanation
            
        except Exception as e:
            logger.error(f"Explanation generation failed: {e}")
            return f"Unable to explain inference for: {conclusion.subject} {conclusion.predicate} {conclusion.object}"
    
    def _facts_match(self, fact1: SymbolicFact, fact2: SymbolicFact) -> bool:
        """Check if two facts match (same subject, predicate, object)"""
        return (fact1.subject == fact2.subject and
                fact1.predicate == fact2.predicate and
                fact1.object == fact2.object)
    
    def add_knowledge(self, subject: str, predicate: str, object: Any, confidence: float = 1.0, source: str = "user") -> str:
        """Add knowledge to the symbolic layer"""
        fact = SymbolicFact(
            subject=subject,
            predicate=predicate,
            object=object,
            confidence=confidence,
            source=source
        )
        
        return self.knowledge_base.add_fact(fact)
    
    def query_knowledge(self, subject: Optional[str] = None, predicate: Optional[str] = None,
                       object: Optional[Any] = None, min_confidence: float = 0.0) -> List[SymbolicFact]:
        """Query knowledge from the symbolic layer"""
        return self.knowledge_base.query_facts(subject, predicate, object, min_confidence)
    
    def get_knowledge_stats(self) -> Dict[str, Any]:
        """Get statistics about the knowledge base"""
        return {
            'total_facts': len(self.knowledge_base.facts),
            'total_rules': len(self.knowledge_base.rules),
            'total_concepts': len(self.knowledge_base.knowledge_graph.concepts),
            'total_relationships': len(self.knowledge_base.knowledge_graph.relationships),
            'inference_history_size': len(self.rule_engine.inference_history),
            'consistency_status': self.knowledge_base.consistency_cache
        }

# Factory function for easy instantiation
def create_symbolic_knowledge_layer(config: Optional[NeuralSymbolicConfig] = None) -> SymbolicKnowledgeLayer:
    """Create a symbolic knowledge layer with optional configuration"""
    if config is None:
        config = NeuralSymbolicConfig()
    
    return SymbolicKnowledgeLayer(config)

# Example usage and testing
async def test_symbolic_knowledge():
    """Test the symbolic knowledge layer"""
    config = NeuralSymbolicConfig(
        max_facts=1000,
        max_rules=100,
        reasoning_depth=5,
        verbose_logging=True
    )
    
    knowledge_layer = create_symbolic_knowledge_layer(config)
    
    # Add some facts
    knowledge_layer.add_knowledge("Socrates", "is_a", "human", 1.0, "premise")
    knowledge_layer.add_knowledge("human", "is_a", "mortal", 1.0, "premise")
    knowledge_layer.add_knowledge("bird", "can", "fly", 0.9, "general_rule")
    knowledge_layer.add_knowledge("penguin", "is_a", "bird", 1.0, "fact")
    knowledge_layer.add_knowledge("penguin", "cannot", "fly", 1.0, "exception")
    
    # Add a custom rule
    mortality_rule = SymbolicRule(
        conditions=[
            SymbolicFact("?x", "is_a", "human", 1.0, "pattern")
        ],
        conclusions=[
            SymbolicFact("?x", "is", "mortal", 1.0, "inference")
        ],
        rule_type=ReasoningMode.DEDUCTIVE,
        strength=1.0,
        description="All humans are mortal"
    )
    
    knowledge_layer.knowledge_base.add_rule(mortality_rule)
    
    # Test reasoning
    print("\n=== Testing Symbolic Reasoning ===")
    
    # Test basic query
    humans = knowledge_layer.query_knowledge(predicate="is_a", object="human")
    print(f"Humans: {[f.subject for f in humans]}")
    
    # Apply reasoning
    new_facts = await knowledge_layer.reason([], [])
    print(f"Derived {len(new_facts)} new facts:")
    for fact in new_facts:
        print(f"  {fact.subject} {fact.predicate} {fact.object} (confidence: {fact.confidence:.3f})")
        
        # Get explanation
        explanation = await knowledge_layer.explain_inference(fact)
        print(f"  Explanation: {explanation}\n")
    
    # Check consistency
    all_facts = list(knowledge_layer.knowledge_base.facts.values())
    is_consistent = await knowledge_layer.validate_consistency(all_facts)
    print(f"Knowledge base consistent: {is_consistent}")
    
    # Print statistics
    stats = knowledge_layer.get_knowledge_stats()
    print(f"Knowledge base statistics: {stats}")

if __name__ == "__main__":
    # Run test
    asyncio.run(test_symbolic_knowledge())