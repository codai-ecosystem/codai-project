"""
RomAGI Advanced Code Generation Engine
=====================================

Main orchestrator for the advanced code generation system with Romanian cultural awareness.
Coordinates multiple language generators and provides unified interface.

Author: RomAGI Development Team  
License: MIT
Version: 2.0.0
"""

import asyncio
import logging
import sqlite3
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
from pathlib import Path
import uuid

from core import (
    CodeGenerationRequest, GeneratedCode, CodeAnalysis,
    ProgrammingLanguage, CodeComplexity, CodeType
)
from python_generator import PythonCodeGenerator

logger = logging.getLogger(__name__)

class AdvancedCodeGenerationEngine:
    """Advanced code generation engine with Romanian cultural integration"""
    
    def __init__(self, storage_path: str = "code_generation_storage"):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self.db_path = self.storage_path / "code_generation.db"
        
        # Initialize language generators
        self.generators = {
            ProgrammingLanguage.PYTHON: PythonCodeGenerator()
        }
        
        # Performance metrics
        self.metrics = {
            "total_requests": 0,
            "successful_generations": 0,
            "failed_generations": 0,
            "average_quality_score": 0.0,
            "average_cultural_integration": 0.0,
            "language_distribution": {},
            "complexity_distribution": {},
            "generation_time": 0.0
        }
        
        self.generated_code: Dict[str, GeneratedCode] = {}
        self.start_time = datetime.now()
        
        self._init_database()
        self._load_generated_code()
        
        logger.info("✅ Advanced Code Generation Engine initialized")
        logger.info(f"📁 Storage: {self.storage_path}")
        logger.info(f"🐍 Generators: {len(self.generators)} language(s)")
    
    def _init_database(self):
        """Initialize code generation database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS generated_code (
                    code_id TEXT PRIMARY KEY,
                    request_id TEXT,
                    source_code TEXT,
                    language TEXT,
                    code_type TEXT,
                    complexity_score REAL,
                    quality_score REAL,
                    cultural_integration REAL,
                    tests TEXT,
                    documentation TEXT,
                    explanation TEXT,
                    romanian_concepts_used TEXT,
                    dependencies TEXT,
                    performance_notes TEXT,
                    security_notes TEXT,
                    generated_at TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS generation_requests (
                    request_id TEXT PRIMARY KEY,
                    description TEXT,
                    language TEXT,
                    code_type TEXT,
                    complexity TEXT,
                    requirements TEXT,
                    constraints TEXT,
                    cultural_context TEXT,
                    examples TEXT,
                    tests_required INTEGER,
                    documentation_required INTEGER,
                    romanian_concepts INTEGER,
                    created_at TIMESTAMP
                )
            """)
            conn.commit()
    
    def _load_generated_code(self):
        """Load previously generated code"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute("SELECT * FROM generated_code")
                for row in cursor.fetchall():
                    code_data = {
                        "code_id": row[0],
                        "request_id": row[1],
                        "source_code": row[2],
                        "language": ProgrammingLanguage(row[3]),
                        "code_type": CodeType(row[4]),
                        "complexity_score": row[5],
                        "quality_score": row[6],
                        "cultural_integration": row[7],
                        "tests": row[8],
                        "documentation": row[9],
                        "explanation": row[10],
                        "romanian_concepts_used": json.loads(row[11]) if row[11] else [],
                        "dependencies": json.loads(row[12]) if row[12] else [],
                        "performance_notes": json.loads(row[13]) if row[13] else [],
                        "security_notes": json.loads(row[14]) if row[14] else [],
                        "generated_at": datetime.fromisoformat(row[15])
                    }
                    
                    generated_code = GeneratedCode(**code_data)
                    self.generated_code[generated_code.code_id] = generated_code
            
            logger.info(f"📦 Loaded {len(self.generated_code)} previously generated code files")
        except Exception as e:
            logger.warning(f"⚠️ Could not load generated code: {e}")
    
    async def generate_code(self, description: str, language: ProgrammingLanguage,
                          code_type: CodeType = CodeType.FUNCTION,
                          complexity: CodeComplexity = CodeComplexity.MODERATE,
                          requirements: List[str] = None,
                          constraints: List[str] = None,
                          cultural_context: Dict[str, Any] = None,
                          examples: List[str] = None,
                          tests_required: bool = True,
                          documentation_required: bool = True,
                          romanian_concepts: bool = True) -> GeneratedCode:
        """Generate code with Romanian cultural awareness"""
        
        start_time = datetime.now()
        request_id = str(uuid.uuid4())
        
        # Create generation request
        request = CodeGenerationRequest(
            request_id=request_id,
            description=description,
            language=language,
            code_type=code_type,
            complexity=complexity,
            requirements=requirements or [],
            constraints=constraints or [],
            cultural_context=cultural_context or {"romanian_awareness": True},
            examples=examples or [],
            tests_required=tests_required,
            documentation_required=documentation_required,
            romanian_concepts=romanian_concepts,
            timestamp=datetime.now()
        )
        
        logger.info(f"🚀 Generating {language.value} {code_type.value}")
        logger.info(f"📝 Description: {description}")
        
        try:
            # Store request
            self._store_request(request)
            
            # Get appropriate generator
            generator = self.generators.get(language)
            if not generator:
                raise ValueError(f"No generator available for {language.value}")
            
            # Generate code
            generated_code = await generator.generate_code(request)
            
            # Store generated code
            self.generated_code[generated_code.code_id] = generated_code
            self._store_generated_code(generated_code)
            
            # Update metrics
            generation_time = (datetime.now() - start_time).total_seconds()
            self._update_metrics(generated_code, generation_time, success=True)
            
            logger.info(f"✅ Code generated successfully: {generated_code.code_id}")
            logger.info(f"⭐ Quality score: {generated_code.quality_score:.2f}")
            logger.info(f"🇷🇴 Cultural integration: {generated_code.cultural_integration:.2f}")
            logger.info(f"⏱️ Generation time: {generation_time:.2f}s")
            
            return generated_code
            
        except Exception as e:
            self._update_metrics(None, 0, success=False)
            logger.error(f"❌ Code generation failed: {e}")
            raise
    
    async def analyze_existing_code(self, code: str, language: ProgrammingLanguage) -> CodeAnalysis:
        """Analyze existing code for quality and cultural adherence"""
        
        logger.info(f"🔍 Analyzing {language.value} code")
        
        generator = self.generators.get(language)
        if not generator:
            raise ValueError(f"No analyzer available for {language.value}")
        
        analysis = await generator.analyze_code(code)
        
        logger.info(f"📊 Analysis completed: {analysis.analysis_id}")
        logger.info(f"🎯 Quality score: {sum(analysis.quality_metrics.values()) / len(analysis.quality_metrics):.2f}")
        logger.info(f"🇷🇴 Cultural adherence: {analysis.cultural_adherence:.2f}")
        
        return analysis
    
    async def improve_code(self, code_id: str, improvement_suggestions: List[str] = None) -> GeneratedCode:
        """Improve existing generated code"""
        
        if code_id not in self.generated_code:
            raise ValueError(f"Code ID {code_id} not found")
        
        original_code = self.generated_code[code_id]
        
        logger.info(f"🔧 Improving code: {code_id}")
        
        # Analyze current code for improvement opportunities
        analysis = await self.analyze_existing_code(original_code.source_code, original_code.language)
        
        # Use analysis suggestions if none provided
        if not improvement_suggestions:
            improvement_suggestions = analysis.improvement_suggestions
        
        # Create new request with improvements
        improved_description = f"IMPROVED: {original_code.explanation} - {', '.join(improvement_suggestions)}"
        
        # Generate improved code
        improved_code = await self.generate_code(
            description=improved_description,
            language=original_code.language,
            code_type=original_code.code_type,
            complexity=CodeComplexity.COMPLEX,  # Higher complexity for improvements
            tests_required=True,
            documentation_required=True,
            romanian_concepts=True
        )
        
        logger.info(f"✨ Code improved: {original_code.code_id} → {improved_code.code_id}")
        logger.info(f"📈 Quality improvement: {original_code.quality_score:.2f} → {improved_code.quality_score:.2f}")
        
        return improved_code
    
    async def generate_code_family(self, base_description: str, variations: List[str],
                                 language: ProgrammingLanguage = ProgrammingLanguage.PYTHON) -> List[GeneratedCode]:
        """Generate a family of related code with variations"""
        
        logger.info(f"👨‍👩‍👧‍👦 Generating code family: {base_description}")
        logger.info(f"🔄 Variations: {len(variations)}")
        
        code_family = []
        
        for i, variation in enumerate(variations):
            description = f"{base_description} - {variation}"
            
            # Vary complexity and features
            complexity = list(CodeComplexity)[i % len(CodeComplexity)]
            code_type = CodeType.CLASS if i % 2 == 0 else CodeType.FUNCTION
            
            generated_code = await self.generate_code(
                description=description,
                language=language,
                code_type=code_type,
                complexity=complexity,
                cultural_context={"family_member": i + 1, "total_members": len(variations)},
                romanian_concepts=True
            )
            
            code_family.append(generated_code)
        
        logger.info(f"✅ Generated code family: {len(code_family)} members")
        
        return code_family
    
    async def get_code_insights(self) -> Dict[str, Any]:
        """Get comprehensive code generation insights"""
        
        uptime = (datetime.now() - self.start_time).total_seconds()
        
        # Quality analysis
        quality_scores = [code.quality_score for code in self.generated_code.values()]
        cultural_scores = [code.cultural_integration for code in self.generated_code.values()]
        
        # Language distribution
        language_dist = {}
        for code in self.generated_code.values():
            lang = code.language.value
            language_dist[lang] = language_dist.get(lang, 0) + 1
        
        # Code type distribution
        type_dist = {}
        for code in self.generated_code.values():
            code_type = code.code_type.value
            type_dist[code_type] = type_dist.get(code_type, 0) + 1
        
        # Romanian concepts usage
        concept_usage = {}
        for code in self.generated_code.values():
            for concept in code.romanian_concepts_used:
                concept_usage[concept] = concept_usage.get(concept, 0) + 1
        
        insights = {
            "performance_metrics": self.metrics.copy(),
            "total_generated_code": len(self.generated_code),
            "quality_statistics": {
                "average_quality": sum(quality_scores) / len(quality_scores) if quality_scores else 0.0,
                "average_cultural_integration": sum(cultural_scores) / len(cultural_scores) if cultural_scores else 0.0,
                "highest_quality": max(quality_scores) if quality_scores else 0.0,
                "lowest_quality": min(quality_scores) if quality_scores else 0.0
            },
            "distribution_analysis": {
                "languages": language_dist,
                "code_types": type_dist,
                "romanian_concepts": concept_usage
            },
            "system_statistics": {
                "uptime_seconds": uptime,
                "generations_per_minute": (self.metrics["total_requests"] / max(uptime / 60, 1)),
                "success_rate": (self.metrics["successful_generations"] / max(self.metrics["total_requests"], 1)) * 100,
                "storage_usage": len(list(self.storage_path.glob("**/*"))),
                "database_size": self.db_path.stat().st_size if self.db_path.exists() else 0
            },
            "cultural_impact": {
                "total_concepts_used": sum(concept_usage.values()),
                "unique_concepts_used": len(concept_usage),
                "cultural_integration_rate": len([c for c in cultural_scores if c > 0.5]) / len(cultural_scores) if cultural_scores else 0,
                "most_popular_concept": max(concept_usage.items(), key=lambda x: x[1]) if concept_usage else None
            }
        }
        
        return insights
    
    def get_generated_code(self, code_id: str) -> Optional[GeneratedCode]:
        """Get specific generated code by ID"""
        return self.generated_code.get(code_id)
    
    def list_generated_code(self, language: ProgrammingLanguage = None,
                          code_type: CodeType = None,
                          min_quality: float = 0.0) -> List[GeneratedCode]:
        """List generated code with optional filters"""
        
        filtered_code = []
        
        for code in self.generated_code.values():
            if language and code.language != language:
                continue
            if code_type and code.code_type != code_type:
                continue
            if code.quality_score < min_quality:
                continue
            
            filtered_code.append(code)
        
        # Sort by quality score (highest first)
        filtered_code.sort(key=lambda x: x.quality_score, reverse=True)
        
        return filtered_code
    
    def _store_request(self, request: CodeGenerationRequest):
        """Store generation request in database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO generation_requests 
                    (request_id, description, language, code_type, complexity,
                     requirements, constraints, cultural_context, examples,
                     tests_required, documentation_required, romanian_concepts, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    request.request_id,
                    request.description,
                    request.language.value,
                    request.code_type.value,
                    request.complexity.value,
                    json.dumps(request.requirements),
                    json.dumps(request.constraints),
                    json.dumps(request.cultural_context),
                    json.dumps(request.examples),
                    int(request.tests_required),
                    int(request.documentation_required),
                    int(request.romanian_concepts),
                    request.timestamp.isoformat()
                ))
                conn.commit()
        except Exception as e:
            logger.error(f"❌ Failed to store request: {e}")
    
    def _store_generated_code(self, generated_code: GeneratedCode):
        """Store generated code in database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT OR REPLACE INTO generated_code 
                    (code_id, request_id, source_code, language, code_type,
                     complexity_score, quality_score, cultural_integration,
                     tests, documentation, explanation, romanian_concepts_used,
                     dependencies, performance_notes, security_notes, generated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    generated_code.code_id,
                    generated_code.request_id,
                    generated_code.source_code,
                    generated_code.language.value,
                    generated_code.code_type.value,
                    generated_code.complexity_score,
                    generated_code.quality_score,
                    generated_code.cultural_integration,
                    generated_code.tests,
                    generated_code.documentation,
                    generated_code.explanation,
                    json.dumps(generated_code.romanian_concepts_used),
                    json.dumps(generated_code.dependencies),
                    json.dumps(generated_code.performance_notes),
                    json.dumps(generated_code.security_notes),
                    generated_code.generated_at.isoformat()
                ))
                conn.commit()
        except Exception as e:
            logger.error(f"❌ Failed to store generated code: {e}")
    
    def _update_metrics(self, generated_code: Optional[GeneratedCode], 
                       generation_time: float, success: bool):
        """Update performance metrics"""
        self.metrics["total_requests"] += 1
        
        if success and generated_code:
            self.metrics["successful_generations"] += 1
            
            # Update quality metrics
            current_avg_quality = self.metrics["average_quality_score"]
            total_successful = self.metrics["successful_generations"]
            
            self.metrics["average_quality_score"] = (
                (current_avg_quality * (total_successful - 1) + generated_code.quality_score) / total_successful
            )
            
            # Update cultural integration
            current_avg_cultural = self.metrics["average_cultural_integration"]
            self.metrics["average_cultural_integration"] = (
                (current_avg_cultural * (total_successful - 1) + generated_code.cultural_integration) / total_successful
            )
            
            # Update language distribution
            lang = generated_code.language.value
            self.metrics["language_distribution"][lang] = self.metrics["language_distribution"].get(lang, 0) + 1
            
            # Update complexity distribution  
            complexity = generated_code.complexity_score
            complexity_level = "high" if complexity > 0.7 else "medium" if complexity > 0.3 else "low"
            self.metrics["complexity_distribution"][complexity_level] = self.metrics["complexity_distribution"].get(complexity_level, 0) + 1
        
        else:
            self.metrics["failed_generations"] += 1
        
        # Update generation time
        self.metrics["generation_time"] = (self.metrics["generation_time"] + generation_time) / 2

# Demonstration function
async def demonstrate_code_generation():
    """Demonstrate the Advanced Code Generation Engine"""
    logger.info("🚀 Demonstrating Advanced Code Generation Engine")
    logger.info("============================================================")
    
    # Initialize engine
    engine = AdvancedCodeGenerationEngine()
    
    # Test cases for code generation
    test_cases = [
        {
            "description": "Create a Romanian cultural data processor that handles user information with cultural awareness",
            "language": ProgrammingLanguage.PYTHON,
            "code_type": CodeType.CLASS,
            "complexity": CodeComplexity.MODERATE,
            "requirements": ["data validation", "cultural context", "Romanian naming"],
            "romanian_concepts": True
        },
        {
            "description": "Build an async function that processes messages with Romanian patience (dor)",
            "language": ProgrammingLanguage.PYTHON,
            "code_type": CodeType.FUNCTION,
            "complexity": CodeComplexity.COMPLEX,
            "requirements": ["async processing", "error handling", "logging"],
            "romanian_concepts": True
        },
        {
            "description": "Create a web API endpoint for Romanian cultural content management",
            "language": ProgrammingLanguage.PYTHON,
            "code_type": CodeType.MODULE,
            "complexity": CodeComplexity.EXPERT,
            "requirements": ["Flask API", "JSON handling", "authentication", "cultural validation"],
            "romanian_concepts": True
        }
    ]
    
    generated_codes = []
    
    logger.info("🔧 Testing code generation...")
    for i, test_case in enumerate(test_cases):
        logger.info(f"\n📝 Test Case {i+1}: {test_case['description'][:50]}...")
        
        try:
            generated_code = await engine.generate_code(**test_case)
            generated_codes.append(generated_code)
            
            logger.info(f"✅ Generated {generated_code.language.value} {generated_code.code_type.value}")
            logger.info(f"📊 Quality: {generated_code.quality_score:.2f}")
            logger.info(f"🇷🇴 Cultural: {generated_code.cultural_integration:.2f}")
            logger.info(f"🧪 Tests: {'Yes' if generated_code.tests else 'No'}")
            logger.info(f"📚 Docs: {'Yes' if generated_code.documentation else 'No'}")
            logger.info(f"🎭 Concepts: {', '.join(generated_code.romanian_concepts_used)}")
            
        except Exception as e:
            logger.error(f"❌ Generation failed: {e}")
    
    logger.info("\n🔍 Testing code analysis...")
    if generated_codes:
        sample_code = generated_codes[0].source_code
        analysis = await engine.analyze_existing_code(sample_code, ProgrammingLanguage.PYTHON)
        
        logger.info(f"📊 Analysis ID: {analysis.analysis_id}")
        logger.info(f"📈 Quality Metrics:")
        for metric, value in analysis.quality_metrics.items():
            logger.info(f"   {metric}: {value:.3f}")
        
        logger.info(f"🔒 Security Issues: {len(analysis.security_issues)}")
        logger.info(f"⚡ Performance Issues: {len(analysis.performance_issues)}")
        logger.info(f"🇷🇴 Cultural Adherence: {analysis.cultural_adherence:.3f}")
        logger.info(f"💡 Suggestions: {len(analysis.improvement_suggestions)}")
    
    logger.info("\n✨ Testing code improvement...")
    if generated_codes:
        original_code = generated_codes[0]
        improved_code = await engine.improve_code(original_code.code_id)
        
        logger.info(f"📈 Quality improvement: {original_code.quality_score:.2f} → {improved_code.quality_score:.2f}")
        logger.info(f"🇷🇴 Cultural improvement: {original_code.cultural_integration:.2f} → {improved_code.cultural_integration:.2f}")
    
    logger.info("\n👨‍👩‍👧‍👦 Testing code family generation...")
    variations = [
        "with basic functionality",
        "with advanced error handling",
        "with performance optimization",
        "with security enhancements"
    ]
    
    code_family = await engine.generate_code_family(
        "Romanian cultural user manager",
        variations,
        ProgrammingLanguage.PYTHON
    )
    
    logger.info(f"👨‍👩‍👧‍👦 Generated code family: {len(code_family)} members")
    for i, member in enumerate(code_family):
        logger.info(f"   Member {i+1}: Quality {member.quality_score:.2f}, Cultural {member.cultural_integration:.2f}")
    
    logger.info("\n📊 Getting system insights...")
    insights = await engine.get_code_insights()
    
    logger.info("🎯 Performance Metrics:")
    for metric, value in insights["performance_metrics"].items():
        if isinstance(value, (int, float)):
            logger.info(f"   {metric}: {value:.3f}")
        else:
            logger.info(f"   {metric}: {value}")
    
    logger.info("📈 Quality Statistics:")
    for stat, value in insights["quality_statistics"].items():
        logger.info(f"   {stat}: {value:.3f}")
    
    logger.info("🔄 Distribution Analysis:")
    for category, distribution in insights["distribution_analysis"].items():
        logger.info(f"   {category}: {distribution}")
    
    logger.info("🇷🇴 Cultural Impact:")
    for impact, value in insights["cultural_impact"].items():
        logger.info(f"   {impact}: {value}")
    
    logger.info(f"\n⏱️ System uptime: {insights['system_statistics']['uptime_seconds']:.1f} seconds")
    logger.info(f"⚡ Success rate: {insights['system_statistics']['success_rate']:.1f}%")
    logger.info(f"📊 Generations per minute: {insights['system_statistics']['generations_per_minute']:.1f}")
    
    logger.info("\n✅ Advanced Code Generation Engine demonstration completed!")

if __name__ == "__main__":
    asyncio.run(demonstrate_code_generation())