"""
🏭 RomAI Training Data Generation Pipeline

This module uses external AI models (Azure OpenAI, etc.) ONLY for generating 
high-quality training data for RomAI's own neural networks. The external AI
is never used during runtime - only for creating training datasets.

CRITICAL: External AI → Training Data → RomAI Neural Networks → Runtime Responses
"""

import asyncio
import json
import os
import random
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
import aiohttp
import logging

# Azure OpenAI integration (for training data generation only)
try:
    from openai import AsyncAzureOpenAI
except ImportError:
    AsyncAzureOpenAI = None
    print("Warning: OpenAI library not available. Training data generation will use mock data.")

class DatasetType(Enum):
    MATHEMATICAL = "mathematical"
    LOGICAL = "logical"
    CULTURAL = "cultural"

@dataclass
class MathematicalTrainingExample:
    """Training example for RomAI's mathematical reasoning model"""
    problem: str
    solution_steps: List[str]
    final_answer: str
    operation_type: str
    difficulty_level: str
    verification: str

@dataclass
class LogicalTrainingExample:
    """Training example for RomAI's logical reasoning model"""
    premise: str
    conclusion: str
    validity: str
    logical_form: str
    reasoning_steps: List[str]
    counterexamples: List[str]

@dataclass
class CulturalTrainingExample:
    """Training example for RomAI's Romanian cultural model"""
    query: str
    cultural_analysis: str
    historical_context: List[str]
    cultural_domain: str
    modern_relevance: str
    sources: List[str]

class TrainingDataGenerator:
    """
    Generates training data using external AI models.
    
    IMPORTANT: This is the ONLY place where external AI is used.
    Runtime inference uses only RomAI's own trained models.
    """
    
    def __init__(self, azure_config: Optional[Dict] = None):
        self.azure_config = azure_config or {}
        
        # Initialize Azure OpenAI client (for training data generation only)
        if AsyncAzureOpenAI and self.azure_config.get('api_key'):
            self.azure_client = AsyncAzureOpenAI(
                api_key=self.azure_config['api_key'],
                api_version=self.azure_config.get('api_version', '2024-02-01'),
                azure_endpoint=self.azure_config.get('endpoint', '')
            )
        else:
            self.azure_client = None
            print("Using mock data generator - Azure OpenAI not configured")
        
        # Setup logging
        self.logger = logging.getLogger(__name__)
        
        # Training data storage
        self.training_data_dir = "apps/romai/training_data"
        os.makedirs(self.training_data_dir, exist_ok=True)
    
    async def generate_mathematical_training_data(self, num_examples: int = 1000) -> List[MathematicalTrainingExample]:
        """
        Generate mathematical training examples using external AI.
        These will train RomAI's own mathematical reasoning network.
        """
        
        self.logger.info(f"Generating {num_examples} mathematical training examples...")
        training_examples = []
        
        # Mathematical problem types to generate
        problem_types = [
            "basic arithmetic", "algebra", "geometry", "calculus",
            "trigonometry", "statistics", "number theory", "combinatorics"
        ]
        
        for i in range(num_examples):
            problem_type = random.choice(problem_types)
            difficulty = random.choice(["easy", "medium", "hard"])
            
            try:
                if self.azure_client:
                    example = await self._generate_math_example_ai(problem_type, difficulty)
                else:
                    example = self._generate_math_example_mock(problem_type, difficulty)
                
                training_examples.append(example)
                
                if (i + 1) % 100 == 0:
                    self.logger.info(f"Generated {i + 1}/{num_examples} mathematical examples")
            
            except Exception as e:
                self.logger.warning(f"Failed to generate math example {i}: {e}")
                continue
        
        # Save training data
        self._save_training_data(training_examples, "mathematical_training_data.json")
        
        return training_examples
    
    async def _generate_math_example_ai(self, problem_type: str, difficulty: str) -> MathematicalTrainingExample:
        """Generate mathematical example using Azure OpenAI"""
        
        prompt = f"""Generate a {difficulty} {problem_type} problem with complete solution.

Format your response as JSON with these fields:
- problem: The mathematical problem statement
- solution_steps: Array of step-by-step solution
- final_answer: The final numerical or algebraic answer
- operation_type: Type of mathematical operation
- verification: How to verify the answer

Example format:
{{"problem": "Solve: 2x + 5 = 13", "solution_steps": ["Subtract 5 from both sides: 2x = 8", "Divide by 2: x = 4"], "final_answer": "4", "operation_type": "linear_equation", "verification": "Substitute x=4: 2(4)+5=13 ✓"}}

Make it educational and clear for training a neural network."""
        
        response = await self.azure_client.chat.completions.create(
            model=self.azure_config.get('deployment_name', 'gpt-4'),
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.7
        )
        
        # Parse JSON response
        content = response.choices[0].message.content
        try:
            data = json.loads(content)
            return MathematicalTrainingExample(
                problem=data['problem'],
                solution_steps=data['solution_steps'],
                final_answer=data['final_answer'],
                operation_type=data['operation_type'],
                difficulty_level=difficulty,
                verification=data['verification']
            )
        except json.JSONDecodeError:
            # Fallback to mock if AI response is malformed
            return self._generate_math_example_mock(problem_type, difficulty)
    
    def _generate_math_example_mock(self, problem_type: str, difficulty: str) -> MathematicalTrainingExample:
        """Generate mock mathematical example when AI is not available"""
        
        mock_problems = {
            "basic arithmetic": {
                "problem": f"{random.randint(10, 99)} + {random.randint(10, 99)}",
                "operation_type": "addition"
            },
            "algebra": {
                "problem": f"{random.randint(2, 9)}x + {random.randint(1, 20)} = {random.randint(21, 50)}",
                "operation_type": "linear_equation"
            },
            "geometry": {
                "problem": f"Find area of rectangle: length={random.randint(5, 15)}, width={random.randint(3, 12)}",
                "operation_type": "area_calculation"
            }
        }
        
        base_problem = mock_problems.get(problem_type, mock_problems["basic arithmetic"])
        
        return MathematicalTrainingExample(
            problem=base_problem["problem"],
            solution_steps=[f"Step 1: Identify the {problem_type} problem", "Step 2: Apply mathematical rules", "Step 3: Calculate result"],
            final_answer="[calculated result]",
            operation_type=base_problem["operation_type"],
            difficulty_level=difficulty,
            verification="Verify by substitution or reverse operation"
        )
    
    async def generate_logical_training_data(self, num_examples: int = 800) -> List[LogicalTrainingExample]:
        """
        Generate logical reasoning training examples using external AI.
        These will train RomAI's own logical reasoning network.
        """
        
        self.logger.info(f"Generating {num_examples} logical training examples...")
        training_examples = []
        
        # Logical reasoning types to generate
        logic_types = [
            "syllogism", "modus_ponens", "modus_tollens", "hypothetical_syllogism",
            "disjunctive_syllogism", "constructive_dilemma", "absorption", "contradiction"
        ]
        
        for i in range(num_examples):
            logic_type = random.choice(logic_types)
            
            try:
                if self.azure_client:
                    example = await self._generate_logic_example_ai(logic_type)
                else:
                    example = self._generate_logic_example_mock(logic_type)
                
                training_examples.append(example)
                
                if (i + 1) % 100 == 0:
                    self.logger.info(f"Generated {i + 1}/{num_examples} logical examples")
            
            except Exception as e:
                self.logger.warning(f"Failed to generate logic example {i}: {e}")
                continue
        
        # Save training data
        self._save_training_data(training_examples, "logical_training_data.json")
        
        return training_examples
    
    async def _generate_logic_example_ai(self, logic_type: str) -> LogicalTrainingExample:
        """Generate logical example using Azure OpenAI"""
        
        prompt = f"""Generate a {logic_type} logical reasoning example.

Format your response as JSON with these fields:
- premise: The logical premise(s)
- conclusion: The logical conclusion
- validity: "valid" or "invalid"
- logical_form: The formal logical structure
- reasoning_steps: Array of reasoning steps
- counterexamples: Array of counterexamples (if invalid)

Example format:
{{"premise": "All birds can fly. Penguins are birds.", "conclusion": "Penguins can fly.", "validity": "invalid", "logical_form": "All A are B. C is A. Therefore, C is B.", "reasoning_steps": ["Premise 1: All birds can fly", "Premise 2: Penguins are birds", "Conclusion: Penguins can fly", "Analysis: Invalid due to false premise"], "counterexamples": ["Penguins cannot fly despite being birds"]}}

Make it educational for training a logical reasoning neural network."""
        
        response = await self.azure_client.chat.completions.create(
            model=self.azure_config.get('deployment_name', 'gpt-4'),
            messages=[{"role": "user", "content": prompt}],
            max_tokens=600,
            temperature=0.8
        )
        
        # Parse JSON response
        content = response.choices[0].message.content
        try:
            data = json.loads(content)
            return LogicalTrainingExample(
                premise=data['premise'],
                conclusion=data['conclusion'],
                validity=data['validity'],
                logical_form=data['logical_form'],
                reasoning_steps=data['reasoning_steps'],
                counterexamples=data.get('counterexamples', [])
            )
        except json.JSONDecodeError:
            return self._generate_logic_example_mock(logic_type)
    
    def _generate_logic_example_mock(self, logic_type: str) -> LogicalTrainingExample:
        """Generate mock logical example when AI is not available"""
        
        mock_examples = {
            "syllogism": {
                "premise": "All roses are flowers. This is a rose.",
                "conclusion": "This is a flower.",
                "validity": "valid"
            },
            "modus_ponens": {
                "premise": "If it rains, the ground gets wet. It is raining.",
                "conclusion": "The ground gets wet.",
                "validity": "valid"
            },
            "modus_tollens": {
                "premise": "If P then Q. Not Q.",
                "conclusion": "Not P.",
                "validity": "valid"
            }
        }
        
        base_example = mock_examples.get(logic_type, mock_examples["syllogism"])
        
        return LogicalTrainingExample(
            premise=base_example["premise"],
            conclusion=base_example["conclusion"],
            validity=base_example["validity"],
            logical_form=f"Formal {logic_type} structure",
            reasoning_steps=[f"Apply {logic_type} reasoning", "Analyze validity", "Draw conclusion"],
            counterexamples=[] if base_example["validity"] == "valid" else ["Example countercase"]
        )
    
    async def generate_cultural_training_data(self, num_examples: int = 600) -> List[CulturalTrainingExample]:
        """
        Generate Romanian cultural training examples using external AI.
        These will train RomAI's own cultural intelligence network.
        """
        
        self.logger.info(f"Generating {num_examples} Romanian cultural training examples...")
        training_examples = []
        
        # Romanian cultural topics to generate
        cultural_topics = [
            "istorie românească", "tradiții românești", "literatura română", 
            "folclorul românesc", "bucătăria românească", "muzica românească",
            "arhitectura românească", "personalități istorice", "sărbători românești",
            "geografia României", "politica românească", "religia în România"
        ]
        
        for i in range(num_examples):
            topic = random.choice(cultural_topics)
            
            try:
                if self.azure_client:
                    example = await self._generate_cultural_example_ai(topic)
                else:
                    example = self._generate_cultural_example_mock(topic)
                
                training_examples.append(example)
                
                if (i + 1) % 100 == 0:
                    self.logger.info(f"Generated {i + 1}/{num_examples} cultural examples")
            
            except Exception as e:
                self.logger.warning(f"Failed to generate cultural example {i}: {e}")
                continue
        
        # Save training data
        self._save_training_data(training_examples, "cultural_training_data.json")
        
        return training_examples
    
    async def _generate_cultural_example_ai(self, topic: str) -> CulturalTrainingExample:
        """Generate Romanian cultural example using Azure OpenAI"""
        
        prompt = f"""Generate educational content about Romanian culture: {topic}

Format your response as JSON with these fields:
- query: A question about this Romanian cultural topic
- cultural_analysis: Detailed analysis of the cultural aspect
- historical_context: Array of historical background points
- cultural_domain: The cultural domain (history, traditions, literature, etc.)
- modern_relevance: How this is relevant today
- sources: Array of reference sources

Write in Romanian when appropriate. Example format:
{{"query": "Ce este Miorița?", "cultural_analysis": "Miorița este cea mai cunoscută baladă populară românească...", "historical_context": ["Baladă cu origini în folclorul pastoral românesc", "Reflectă viziunea românească asupra morții"], "cultural_domain": "folclor", "modern_relevance": "Studiată în școlile românești", "sources": ["Literatura populară română", "Folclorul românesc"]}}

Make it educational for training a Romanian cultural AI."""
        
        response = await self.azure_client.chat.completions.create(
            model=self.azure_config.get('deployment_name', 'gpt-4'),
            messages=[{"role": "user", "content": prompt}],
            max_tokens=700,
            temperature=0.7
        )
        
        # Parse JSON response
        content = response.choices[0].message.content
        try:
            data = json.loads(content)
            return CulturalTrainingExample(
                query=data['query'],
                cultural_analysis=data['cultural_analysis'],
                historical_context=data['historical_context'],
                cultural_domain=data['cultural_domain'],
                modern_relevance=data['modern_relevance'],
                sources=data.get('sources', [])
            )
        except json.JSONDecodeError:
            return self._generate_cultural_example_mock(topic)
    
    def _generate_cultural_example_mock(self, topic: str) -> CulturalTrainingExample:
        """Generate mock Romanian cultural example when AI is not available"""
        
        return CulturalTrainingExample(
            query=f"Ce știi despre {topic}?",
            cultural_analysis=f"Analiza culturală despre {topic} - aspect important al culturii românești cu semnificație istorică și contemporană.",
            historical_context=[
                f"Context istoric pentru {topic}",
                "Importanță în dezvoltarea culturii românești",
                "Influențe și evoluție de-a lungul timpului"
            ],
            cultural_domain=topic.split()[0] if ' ' in topic else topic,
            modern_relevance=f"Relevanța contemporană a {topic} în cultura română actuală",
            sources=["Literatura de specialitate", "Studii culturale românești"]
        )
    
    def _save_training_data(self, training_examples: List[Any], filename: str) -> None:
        """Save training data to JSON file"""
        
        filepath = os.path.join(self.training_data_dir, filename)
        
        # Convert dataclasses to dictionaries
        data_dicts = [asdict(example) for example in training_examples]
        
        # Add metadata
        training_data = {
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "num_examples": len(training_examples),
                "generator_version": "1.0",
                "external_ai_used": self.azure_client is not None
            },
            "training_examples": data_dicts
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(training_data, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"Saved {len(training_examples)} training examples to {filepath}")
    
    async def generate_complete_training_dataset(self) -> Dict[str, int]:
        """
        Generate complete training dataset for all RomAI models.
        This uses external AI ONLY for generating training data.
        """
        
        self.logger.info("Starting complete training data generation...")
        
        results = {}
        
        # Generate mathematical training data
        math_examples = await self.generate_mathematical_training_data(1000)
        results['mathematical'] = len(math_examples)
        
        # Generate logical training data
        logic_examples = await self.generate_logical_training_data(800)
        results['logical'] = len(logic_examples)
        
        # Generate cultural training data
        cultural_examples = await self.generate_cultural_training_data(600)
        results['cultural'] = len(cultural_examples)
        
        # Generate summary report
        self._generate_training_report(results)
        
        self.logger.info(f"Training data generation complete: {results}")
        
        return results
    
    def _generate_training_report(self, results: Dict[str, int]) -> None:
        """Generate training data generation report"""
        
        report = {
            "training_data_generation_report": {
                "generated_at": datetime.now().isoformat(),
                "external_ai_usage": "TRAINING ONLY - No runtime dependencies",
                "datasets_generated": results,
                "total_examples": sum(results.values()),
                "storage_location": self.training_data_dir,
                "next_step": "Use this data to train RomAI's own neural networks",
                "runtime_operation": "RomAI will use ONLY its own trained models"
            }
        }
        
        report_path = os.path.join(self.training_data_dir, "training_generation_report.json")
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

# Configuration for Azure OpenAI (for training data generation only)
def get_azure_config() -> Dict:
    """Get Azure OpenAI configuration for training data generation"""
    
    return {
        'api_key': os.getenv('AZURE_OPENAI_API_KEY', ''),
        'endpoint': os.getenv('AZURE_OPENAI_ENDPOINT', ''),
        'api_version': os.getenv('AZURE_OPENAI_API_VERSION', '2024-02-01'),
        'deployment_name': os.getenv('AZURE_OPENAI_DEPLOYMENT_NAME', 'gpt-4')
    }

# Main execution function
async def generate_romai_training_data():
    """
    Main function to generate training data for RomAI.
    Uses external AI ONLY for training data generation.
    """
    
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    logger.info("🏭 Starting RomAI Training Data Generation Pipeline")
    logger.info("=" * 60)
    logger.info("IMPORTANT: External AI used ONLY for training data generation")
    logger.info("Runtime operation will use ONLY RomAI's own trained models")
    logger.info("=" * 60)
    
    # Initialize generator
    azure_config = get_azure_config()
    generator = TrainingDataGenerator(azure_config)
    
    # Generate complete training dataset
    results = await generator.generate_complete_training_dataset()
    
    logger.info("🎯 Training Data Generation Complete!")
    logger.info(f"Mathematical examples: {results.get('mathematical', 0)}")
    logger.info(f"Logical examples: {results.get('logical', 0)}")
    logger.info(f"Cultural examples: {results.get('cultural', 0)}")
    logger.info(f"Total training examples: {sum(results.values())}")
    
    return results

# Export main classes
__all__ = [
    'TrainingDataGenerator',
    'MathematicalTrainingExample',
    'LogicalTrainingExample', 
    'CulturalTrainingExample',
    'generate_romai_training_data',
    'get_azure_config'
]