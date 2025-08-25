#!/usr/bin/env python3
"""
MMLU Benchmark Implementation
============================

Implementation of the MMLU (Massive Multitask Language Understanding) benchmark
for testing reasoning and knowledge across 57 academic subjects.
"""

import asyncio
import aiohttp
import json
import random
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

# Sample MMLU problems across different subjects
MMLU_SAMPLE_PROBLEMS = [
    {
        "subject": "abstract_algebra",
        "question": "Find the degree for the given field extension Q(sqrt(2), sqrt(3), sqrt(18)) over Q.",
        "choices": ["0", "4", "2", "6"],
        "answer": 1  # Index of correct answer (4)
    },
    {
        "subject": "anatomy", 
        "question": "Which of the following is the body cavity that contains the pituitary gland?",
        "choices": ["Abdominal", "Cranial", "Pleural", "Spinal"],
        "answer": 1  # Cranial
    },
    {
        "subject": "astronomy",
        "question": "Where do most short-period comets come from and how do we know?",
        "choices": [
            "The Kuiper belt; short period comets tend to be in the plane of the solar system just like the Kuiper belt.",
            "The Kuiper belt; short period comets tend to come from random directions indicating a spherical distribution of comets called the Kuiper belt.",
            "The asteroid belt; short period comets have orbital periods similar to asteroids.",
            "The Oort cloud; short period comets tend to be in the plane of the solar system just like the Oort cloud."
        ],
        "answer": 0  # The Kuiper belt; planar distribution
    },
    {
        "subject": "business_ethics",
        "question": "According to Kant, the only thing that is good without qualification is a",
        "choices": ["virtue", "emotion", "good will", "right action"],
        "answer": 2  # good will
    },
    {
        "subject": "clinical_knowledge",
        "question": "A 22-year-old male marathon runner presents to the clinic with the complaint of right-sided rib pain when he runs long distances. Physical examination reveals normal heart and lung findings and an exquisitely tender area on the lateral aspect of the 8th rib, approximately 4 inches below the axilla. Radiologic findings are unremarkable. The most likely diagnosis is:",
        "choices": [
            "Pleuritis",
            "Rib stress fracture", 
            "Intercostal muscle strain",
            "Rib contusion"
        ],
        "answer": 1  # Rib stress fracture
    },
    {
        "subject": "college_biology",
        "question": "Which of the following is not a way to form recombinant DNA?",
        "choices": [
            "Translation",
            "Conjugation", 
            "Specialized transduction",
            "Transformation"
        ],
        "answer": 0  # Translation
    },
    {
        "subject": "college_chemistry",
        "question": "3 Cl2(g) + 6 NaOH(aq) → 5 NaCl(aq) + NaClO3(aq) + 3 H2O(l) How many moles of NaCl are produced when 3.0 mol of Cl2 are used?",
        "choices": ["1.0", "3.0", "5.0", "6.0"],
        "answer": 2  # 5.0
    },
    {
        "subject": "college_computer_science",
        "question": "Which of the following regular expressions is equivalent to (a+b)*abb?",
        "choices": [
            "(a|b)*abb",
            "(a|b)+abb", 
            "(a|b)*ab+",
            "(a|b)+ab+"
        ],
        "answer": 0  # (a|b)*abb
    },
    {
        "subject": "college_mathematics",
        "question": "Let (X, d) be a metric space. Which of the following statements is always true?",
        "choices": [
            "Compact sets are closed and bounded.",
            "Closed and bounded sets are compact.",
            "Every sequence has a convergent subsequence.",
            "Open sets are dense."
        ],
        "answer": 0  # Compact sets are closed and bounded
    },
    {
        "subject": "college_physics",
        "question": "A satellite of mass m orbits a planet of mass M in a circular orbit of radius R. What is the kinetic energy of the satellite?",
        "choices": [
            "GMm/(2R)",
            "GMm/R",
            "GMm/(4R)",
            "2GMm/R"
        ],
        "answer": 0  # GMm/(2R)
    }
]

class MMLURunner:
    """Runner for MMLU benchmark tests"""
    
    def __init__(self, model_url: str):
        self.model_url = model_url
        self.max_tokens = 10  # Short answers for multiple choice
        self.temperature = 0.0  # Deterministic for consistency
    
    async def query_model(self, prompt: str) -> str:
        """Query RomAI model with prompt"""
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "prompt": prompt,
                    "max_tokens": self.max_tokens,
                    "temperature": self.temperature,
                    "stop": ["\n", ".", ","]
                }
                
                async with session.post(
                    f"{self.model_url}/generate",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=15)
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result.get('generated_text', '').strip()
                    else:
                        logger.error(f"RomAI API error: {response.status}")
                        return ""
                        
        except Exception as e:
            logger.error(f"Error querying model: {e}")
            return ""
    
    def format_question(self, problem: Dict[str, Any]) -> str:
        """Format MMLU question as prompt"""
        question = problem['question']
        choices = problem['choices']
        
        prompt = f"Question: {question}\n\nChoices:\n"
        for i, choice in enumerate(choices):
            prompt += f"({chr(65+i)}) {choice}\n"  # A, B, C, D
        
        prompt += "\nAnswer: The correct answer is ("
        
        return prompt
    
    def parse_answer(self, response: str, num_choices: int) -> Optional[int]:
        """Parse model response to extract answer choice"""
        response = response.strip().upper()
        
        # Look for letter choices (A, B, C, D)
        for i in range(num_choices):
            letter = chr(65 + i)  # A, B, C, D
            if letter in response:
                return i
        
        # Look for numbers (0, 1, 2, 3 or 1, 2, 3, 4)
        for i in range(num_choices):
            if str(i) in response or str(i+1) in response:
                return i
        
        # Random guess if we can't parse
        return random.randint(0, num_choices - 1)
    
    async def evaluate_problem(self, problem: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate a single MMLU problem"""
        prompt = self.format_question(problem)
        response = await self.query_model(prompt)
        
        num_choices = len(problem['choices'])
        predicted_answer = self.parse_answer(response, num_choices)
        correct_answer = problem['answer']
        
        is_correct = predicted_answer == correct_answer
        
        return {
            'subject': problem['subject'],
            'question': problem['question'],
            'correct_answer': correct_answer,
            'predicted_answer': predicted_answer,
            'is_correct': is_correct,
            'model_response': response,
            'correct_choice': problem['choices'][correct_answer],
            'predicted_choice': problem['choices'][predicted_answer] if predicted_answer is not None else "Unknown"
        }
    
    async def run_mmlu_benchmark(self, problems: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Run MMLU benchmark on given problems"""
        results = []
        total_problems = len(problems)
        correct_answers = 0
        
        # Subject-wise performance tracking
        subject_performance = {}
        
        logger.info(f"Running MMLU benchmark on {total_problems} problems")
        
        for i, problem in enumerate(problems):
            logger.info(f"Processing problem {i+1}/{total_problems}: {problem['subject']}")
            
            result = await self.evaluate_problem(problem)
            results.append(result)
            
            # Track overall performance
            if result['is_correct']:
                correct_answers += 1
                logger.info(f"✅ Correct: {problem['subject']}")
            else:
                logger.info(f"❌ Incorrect: {problem['subject']} - predicted {result['predicted_choice']}, correct was {result['correct_choice']}")
            
            # Track subject-wise performance
            subject = result['subject']
            if subject not in subject_performance:
                subject_performance[subject] = {'correct': 0, 'total': 0}
            
            subject_performance[subject]['total'] += 1
            if result['is_correct']:
                subject_performance[subject]['correct'] += 1
        
        # Calculate overall accuracy
        accuracy = correct_answers / total_problems if total_problems > 0 else 0.0
        
        # Calculate subject-wise accuracies
        subject_accuracies = {}
        for subject, perf in subject_performance.items():
            subject_accuracies[subject] = perf['correct'] / perf['total']
        
        return {
            'score': accuracy,
            'details': {
                'total_problems': total_problems,
                'correct_answers': correct_answers,
                'incorrect_answers': total_problems - correct_answers,
                'accuracy': accuracy,
                'subject_performance': subject_performance,
                'subject_accuracies': subject_accuracies,
                'individual_results': results,
                'benchmark': 'MMLU',
                'metric': 'accuracy'
            }
        }

async def run_benchmark(
    model_url: str,
    benchmark_spec: Any,
    custom_parameters: Dict[str, Any]
) -> Dict[str, Any]:
    """Main entry point for running MMLU benchmark"""
    
    # Use sample problems or custom problems if provided
    problems = custom_parameters.get('problems', MMLU_SAMPLE_PROBLEMS)
    
    # Shuffle problems for randomness
    if custom_parameters.get('shuffle', True):
        random.shuffle(problems)
    
    # Initialize runner
    runner = MMLURunner(model_url)
    
    # Run benchmark
    result = await runner.run_mmlu_benchmark(problems)
    
    logger.info(f"MMLU benchmark completed: {result['score']:.3f} accuracy")
    
    return result

# For testing purposes
async def test_mmlu_implementation():
    """Test the MMLU implementation"""
    print("🧪 Testing MMLU Implementation")
    
    # Mock model URL for testing
    model_url = "http://localhost:6101"
    
    class MockBenchmarkSpec:
        name = "MMLU"
        evaluation_metric = "accuracy"
    
    result = await run_benchmark(
        model_url=model_url,
        benchmark_spec=MockBenchmarkSpec(),
        custom_parameters={
            "problems": MMLU_SAMPLE_PROBLEMS[:5],  # Test with first 5 problems
            "shuffle": False
        }
    )
    
    print(f"✅ MMLU test completed")
    print(f"Score: {result['score']:.3f}")
    print(f"Details: {result['details']['correct_answers']}/{result['details']['total_problems']} problems correct")
    
    # Show subject performance
    print("\n📊 Subject Performance:")
    for subject, accuracy in result['details']['subject_accuracies'].items():
        print(f"  {subject}: {accuracy:.3f}")
    
    return result

if __name__ == "__main__":
    asyncio.run(test_mmlu_implementation())