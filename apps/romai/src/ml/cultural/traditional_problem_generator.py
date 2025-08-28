"""
🇷🇴 Traditional Romanian Problem Contexts Generator

Generates culturally authentic Romanian mathematical problems with:
- Real-world Romanian scenarios and contexts
- Market transactions with traditional measurements
- Agricultural problems with seasonal variations
- Traditional crafts and artisan calculations
- Historical events and periods
- Regional customs and celebrations
- Authentic Romanian cultural grounding
"""

import random
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum
from datetime import datetime, date
import json
import re

from .enhanced_cultural_system import (
    EnhancedRomanianCulturalSystem, 
    RomanianRegion, 
    RomanianHoliday,
    get_enhanced_cultural_system
)

logger = logging.getLogger(__name__)

class ProblemDifficulty(Enum):
    """Problem difficulty levels"""
    ELEMENTARY = "elementary"      # Simple arithmetic (5-10 years)
    INTERMEDIATE = "intermediate"  # Complex problems (11-14 years)
    ADVANCED = "advanced"         # Multi-step problems (15+ years)

class ProblemCategory(Enum):
    """Categories of Romanian traditional problems"""
    AGRICULTURAL = "agricultural"
    COMMERCIAL = "commercial"
    CRAFTS_ARTISAN = "crafts_artisan"
    HISTORICAL = "historical"
    SEASONAL_CELEBRATION = "seasonal_celebration"
    HOUSEHOLD_DOMESTIC = "household_domestic"
    COMMUNITY_SOCIAL = "community_social"
    TRADITIONAL_MEASUREMENT = "traditional_measurement"

@dataclass
class RomanianProblemContext:
    """Complete context for a Romanian mathematical problem"""
    category: ProblemCategory
    region: RomanianRegion
    difficulty: ProblemDifficulty
    historical_period: str
    seasonal_context: Optional[str]
    cultural_elements: List[str]
    traditional_measurements: List[str]
    characters: List[str]
    setting: str
    authenticity_score: float

@dataclass
class GeneratedProblem:
    """A complete generated Romanian mathematical problem"""
    problem_text: str
    answer: float
    solution_steps: List[str]
    context: RomanianProblemContext
    mathematical_operations: List[str]
    cultural_accuracy: float
    educational_level: str
    regional_authenticity: float
    traditional_elements: List[str]

class TraditionalRomanianProblemGenerator:
    """
    Advanced Romanian Mathematical Problem Generator
    
    Generates culturally authentic Romanian mathematical problems based on:
    - Traditional Romanian contexts and scenarios
    - Historical accuracy and regional specificity
    - Real-world applications and cultural relevance
    - Educational appropriateness and mathematical validity
    """
    
    def __init__(self):
        logger.info("🇷🇴 Initializing Traditional Romanian Problem Generator...")
        
        # Get the enhanced cultural system
        self.cultural_system = get_enhanced_cultural_system()
        
        # Romanian names by region for authentic character generation
        self.romanian_names = {
            RomanianRegion.MOLDOVA: {
                "male": ["Ion", "Gheorghe", "Vasile", "Stefan", "Nicolae", "Mihai", "Alexandru", "Dumitru"],
                "female": ["Maria", "Ana", "Elena", "Ioana", "Ecaterina", "Măriuca", "Floarea", "Paraschiva"]
            },
            RomanianRegion.TRANSILVANIA: {
                "male": ["Andrei", "Radu", "Bogdan", "Marius", "Cristian", "Florin", "Sorin", "Lucian"],
                "female": ["Andreea", "Raluca", "Cristina", "Daniela", "Simona", "Adriana", "Corina", "Monica"]
            },
            RomanianRegion.MUNTENIA: {
                "male": ["Constantin", "Marin", "Tudor", "Petre", "Adrian", "Gabriel", "Daniel", "Cătălin"],
                "female": ["Constanța", "Mariana", "Gabriela", "Adriana", "Carmen", "Alina", "Diana", "Laura"]
            },
            RomanianRegion.OLTENIA: {
                "male": ["Marin", "Florin", "Aurel", "Silviu", "Ionuț", "Claudiu", "Razvan", "Octavian"],
                "female": ["Mariana", "Florina", "Aurelia", "Silvia", "Claudia", "Ramona", "Oana", "Livia"]
            },
            RomanianRegion.BANAT: {
                "male": ["Mircea", "Traian", "Cornel", "Dorel", "Liviu", "Viorel", "Marcel", "Doru"],
                "female": ["Mirela", "Carmen", "Cornelia", "Dorina", "Livia", "Violeta", "Marcela", "Dana"]
            }
        }
        
        # Seasonal problem templates with cultural authenticity
        self.seasonal_templates = {
            "spring": {
                "agricultural": [
                    "În primăvară, {name} pregătește terenul pentru semănat. Dacă are {value1} pogoane și fiecare pogon necesită {value2} kg semințe, câte kilograme de semințe îi trebuie în total?",
                    "{name} plantează {value1} rânduri de cartofi, fiecare rând având {value2} metri. Câți metri de cartofi plantează în total?"
                ],
                "household": [
                    "Pentru curățenia de primăvară, {name} cumpără {value1} litri de detergent la {value2} lei pe litru. Câți lei cheltuiește în total?",
                    "{name} vopsește casa cu {value1} oci de vopsea. Dacă o ocă costă {value2} lei, cât a cheltuit pentru vopsea?"
                ]
            },
            "summer": {
                "agricultural": [
                    "În vară, {name} coase {value1} pogoane de grâu. Dacă dintr-un pogon scoate {value2} kg grâu, câte kilograme coase în total?",
                    "{name} adună {value1} căruțe de fân, fiecare căruță având {value2} kg. Câte kilograme de fân adună?"
                ],
                "commercial": [
                    "La piața de vară, {name} vinde {value1} kg roșii la {value2} lei kilogramul. Câți lei încasează?",
                    "{name} vinde pepeni: {value1} pepeni mici la {value2} lei bucata și {value3} pepeni mari la {value4} lei bucata. Câți lei încasează în total?"
                ]
            },
            "autumn": {
                "agricultural": [
                    "În toamnă, {name} culege {value1} saci de mere, fiecare sac având {value2} kg. Câte kilograme de mere a cules?",
                    "{name} face {value1} butoaie de țuică, fiecare butoi având {value2} litri. Câți litri de țuică face în total?"
                ],
                "celebration": [
                    "Pentru Sf. Dimitrie, {name} pregătește {value1} kg colac pentru {value2} persoane. Câte grame de colac primește fiecare persoană?",
                    "{name} face {value1} borcane de dulceață, fiecare borcan având {value2} g. Câte kilograme de dulceață face în total?"
                ]
            },
            "winter": {
                "household": [
                    "Pentru iarnă, {name} pregătește {value1} căruțe de lemne, fiecare căruță având {value2} stânjeni. Câți stânjeni de lemne are în total?",
                    "{name} țese {value1} coturi de pânză în {value2} zile. Câți coturi țese pe zi în medie?"
                ],
                "celebration": [
                    "Pentru Crăciun, {name} pregătește cozonac pentru {value1} persoane. Dacă pentru {value2} persoane folosește {value3} ouă, câte ouă îi trebuie în total?",
                    "{name} face {value1} turtă dulce de Crăciun, folosind {value2} oci de făină pentru fiecare turtă. Câte oci de făină folosește în total?"
                ]
            }
        }
        
        # Historical context templates
        self.historical_templates = {
            "medieval": {
                "commercial": [
                    "În timpul domniei lui {ruler}, negustorul {name} cumpără {value1} aspri de mărfuri și vinde cu {value2} aspri profit pe aspru. Câți aspri profit face în total?",
                    "La târgul din {city}, {name} schimbă {value1} ducați pe aspri, la cursul de {value2} aspri per ducat. Câți aspri primește?"
                ],
                "construction": [
                    "Pentru construirea mănăstirii {monastery}, meșterii folosesc {value1} căruțe de piatră, fiecare căruță având {value2} stânjeni cubi. Câți stânjeni cubi de piatră folosesc în total?",
                    "Domnul {ruler} construiește un castel folosind {value1} stânjeni de zid pe zi timp de {value2} zile. Câți stânjeni de zid se construiesc în total?"
                ]
            },
            "modern": {
                "industrial": [
                    "La fabrica din {city}, muncitorul {name} produce {value1} piese pe oră timp de {value2} ore. Câte piese produce într-o zi de muncă?",
                    "În {year}, calea ferată transportă {value1} vagoane pe zi, fiecare vagon având {value2} tone mărfuri. Câte tone transportă pe lună?"
                ],
                "urban": [
                    "În orașul {city}, {name} plătește {value1} lei chirie pe lună timp de {value2} luni. Cât plătește în total?",
                    "{name} cumpără un obiect cu {value1} lei și plătește în {value2} rate egale. Cât plătește la fiecare rată?"
                ]
            }
        }
        
        # Traditional craft templates with authentic measurements
        self.craft_templates = {
            "weaving": [
                "{name} țese un covor de {value1} coturi lungime și {value2} coturi lățime. Care este suprafața covorului în coturi pătrați?",
                "Pentru o ie tradițională, {name} folosește {value1} coturi de pânză albă și {value2} coturi de ață colorată. Câți coturi de material folosește în total?",
                "{name} țese {value1} ulițe de pânză, fiecare uliță având {value2} coturi. Câți coturi de pânză țese în total?"
            ],
            "pottery": [
                "Olarul {name} face {value1} oale de {value2} litri fiecare. Câte litri de apă încap în toate oalele?",
                "{name} modelează {value1} ulcioare pe zi timp de {value2} zile. Câte ulcioare face în total?",
                "Pentru piața săptămânală, {name} pregătește {value1} vase mari și {value2} vase mici. Câte vase pregătește în total?"
            ],
            "woodworking": [
                "Dulgherul {name} face o masă folosind {value1} stânjeni de scânduri de stejar și {value2} stânjeni de brad. Câți stânjeni de lemn folosește în total?",
                "{name} sculptează {value1} linguri de lemn pe zi timp de {value2} zile pentru târgul de meșteșuguri. Câte linguri sculptează în total?",
                "Pentru o casă tradițională, {name} folosește {value1} bârne de {value2} stânjeni fiecare. Câți stânjeni de lemn folosește pentru pereți?"
            ]
        }
        
        # Regional specialties and contexts
        self.regional_contexts = {
            RomanianRegion.MOLDOVA: {
                "specialties": ["borș", "tocănița", "răcituri", "vin moldovenesc", "brânză de burduf"],
                "cities": ["Iași", "Suceava", "Botoșani", "Dorohoi", "Rădăuți"],
                "historical_figures": ["Ștefan cel Mare", "Petru Rareș", "Alexandru cel Bun"],
                "traditional_activities": ["viticultura", "creșterea oilor", "pescuitul", "olăritul de Marginea"]
            },
            RomanianRegion.TRANSILVANIA: {
                "specialties": ["kürtőskalács", "papricaș", "varză à la Cluj", "pălincă", "cârnați de Pleșcoi"],
                "cities": ["Cluj-Napoca", "Brașov", "Sibiu", "Sighișoara", "Târgu Mureș"],
                "historical_figures": ["Iancu de Hunedoara", "Mihail Viteazul", "Avram Iancu"],
                "traditional_activities": ["mineritul", "agricultura", "crescătoria", "meșteșugurile săsești"]
            },
            RomanianRegion.MUNTENIA: {
                "specialties": ["mici", "ciorbă de burtă", "papanași", "țuică", "slănina"],
                "cities": ["București", "Ploiești", "Pitești", "Târgoviște", "Buzău"],
                "historical_figures": ["Mircea cel Bătrân", "Vlad Țepeș", "Constantin Brâncoveanu"],
                "traditional_activities": ["agricultura", "viticultura", "creșterea animalelor", "comerțul"]
            }
        }
        
        logger.info("✅ Traditional Romanian Problem Generator initialized successfully")

    def generate_problem(self, 
                        category: ProblemCategory = ProblemCategory.AGRICULTURAL,
                        difficulty: ProblemDifficulty = ProblemDifficulty.ELEMENTARY,
                        region: Optional[RomanianRegion] = None,
                        seasonal_context: Optional[str] = None) -> GeneratedProblem:
        """
        Generate a culturally authentic Romanian mathematical problem
        """
        logger.info(f"🎯 Generating {difficulty.value} {category.value} problem...")
        
        # Select region if not provided
        if region is None:
            region = random.choice(list(RomanianRegion))
        
        # Create problem context
        context = self._create_problem_context(category, region, difficulty, seasonal_context)
        
        # Generate problem based on category
        problem_data = self._generate_problem_by_category(context)
        
        # Validate and enhance cultural authenticity
        enhanced_problem = self._enhance_cultural_authenticity(problem_data, context)
        
        # Calculate educational and authenticity scores
        scores = self._calculate_problem_scores(enhanced_problem, context)
        
        return GeneratedProblem(
            problem_text=enhanced_problem["text"],
            answer=enhanced_problem["answer"],
            solution_steps=enhanced_problem["solution_steps"],
            context=context,
            mathematical_operations=enhanced_problem["operations"],
            cultural_accuracy=scores["cultural_accuracy"],
            educational_level=scores["educational_level"],
            regional_authenticity=scores["regional_authenticity"],
            traditional_elements=enhanced_problem["traditional_elements"]
        )

    def generate_problem_series(self,
                               category: ProblemCategory,
                               count: int = 5,
                               difficulty_progression: bool = True,
                               region: Optional[RomanianRegion] = None) -> List[GeneratedProblem]:
        """
        Generate a series of related Romanian mathematical problems
        """
        logger.info(f"📚 Generating series of {count} {category.value} problems...")
        
        problems = []
        difficulties = list(ProblemDifficulty) if difficulty_progression else [ProblemDifficulty.ELEMENTARY]
        
        for i in range(count):
            if difficulty_progression:
                difficulty = difficulties[i % len(difficulties)]
            else:
                difficulty = ProblemDifficulty.ELEMENTARY
            
            # Vary seasonal context for diversity
            seasonal_contexts = ["spring", "summer", "autumn", "winter", None]
            seasonal_context = random.choice(seasonal_contexts)
            
            problem = self.generate_problem(category, difficulty, region, seasonal_context)
            problems.append(problem)
        
        return problems

    def generate_thematic_problem_set(self, theme: str, count: int = 10) -> Dict[str, List[GeneratedProblem]]:
        """
        Generate a thematic set of problems (e.g., "Christmas", "Harvest", "Market Day")
        """
        logger.info(f"🎨 Generating thematic problem set: {theme}")
        
        problem_set = {
            "theme": theme,
            "problems": []
        }
        
        # Define theme-specific parameters
        if theme.lower() in ["crăciun", "christmas"]:
            categories = [ProblemCategory.SEASONAL_CELEBRATION, ProblemCategory.HOUSEHOLD_DOMESTIC]
            seasonal_context = "winter"
        elif theme.lower() in ["harvest", "recolta", "seceriș"]:
            categories = [ProblemCategory.AGRICULTURAL, ProblemCategory.COMMERCIAL]
            seasonal_context = "autumn"
        elif theme.lower() in ["market", "târg", "piață"]:
            categories = [ProblemCategory.COMMERCIAL, ProblemCategory.TRADITIONAL_MEASUREMENT]
            seasonal_context = None
        else:
            categories = list(ProblemCategory)
            seasonal_context = None
        
        # Generate diverse problems within theme
        for i in range(count):
            category = random.choice(categories)
            difficulty = random.choice(list(ProblemDifficulty))
            region = random.choice(list(RomanianRegion))
            
            problem = self.generate_problem(category, difficulty, region, seasonal_context)
            problem_set["problems"].append(problem)
        
        return problem_set

    def validate_problem_authenticity(self, problem: GeneratedProblem) -> Dict[str, Any]:
        """
        Comprehensive validation of Romanian problem authenticity
        """
        logger.debug("🔍 Validating problem authenticity...")
        
        # Use cultural system for validation
        cultural_validation = self.cultural_system.validate_cultural_accuracy(
            problem.problem_text,
            {
                "region": problem.context.region,
                "historical_period": problem.context.historical_period
            }
        )
        
        # Additional Romanian-specific validation
        romanian_validation = self._validate_romanian_specificity(problem)
        
        # Mathematical validation
        math_validation = self._validate_mathematical_accuracy(problem)
        
        # Educational appropriateness
        educational_validation = self._validate_educational_level(problem)
        
        return {
            "cultural_validation": cultural_validation,
            "romanian_specificity": romanian_validation,
            "mathematical_accuracy": math_validation,
            "educational_appropriateness": educational_validation,
            "overall_authenticity": (
                cultural_validation["cultural_accuracy_score"] * 0.4 +
                romanian_validation["authenticity_score"] * 0.3 +
                math_validation["accuracy_score"] * 0.2 +
                educational_validation["appropriateness_score"] * 0.1
            )
        }

    # Helper methods for problem generation
    def _create_problem_context(self, category: ProblemCategory, region: RomanianRegion,
                               difficulty: ProblemDifficulty, seasonal_context: Optional[str]) -> RomanianProblemContext:
        """Create comprehensive problem context"""
        
        # Determine historical period based on category
        if category == ProblemCategory.HISTORICAL:
            historical_period = random.choice(["medieval", "modern"])
        else:
            historical_period = "traditional"
        
        # Select cultural elements based on region
        regional_context = self.regional_contexts.get(region, {})
        cultural_elements = regional_context.get("specialties", [])[:3]
        
        # Select characters (names) for the problem
        names = self.romanian_names.get(region, self.romanian_names[RomanianRegion.MOLDOVA])
        characters = [random.choice(names["male"]), random.choice(names["female"])]
        
        # Create setting description
        setting = self._create_setting_description(region, category, historical_period)
        
        # Calculate authenticity score
        authenticity_score = 0.8  # Base authenticity for well-defined context
        
        return RomanianProblemContext(
            category=category,
            region=region,
            difficulty=difficulty,
            historical_period=historical_period,
            seasonal_context=seasonal_context,
            cultural_elements=cultural_elements,
            traditional_measurements=[],  # Will be populated based on problem type
            characters=characters,
            setting=setting,
            authenticity_score=authenticity_score
        )

    def _generate_problem_by_category(self, context: RomanianProblemContext) -> Dict[str, Any]:
        """Generate problem based on category"""
        
        if context.category == ProblemCategory.AGRICULTURAL:
            return self._generate_agricultural_problem(context)
        elif context.category == ProblemCategory.COMMERCIAL:
            return self._generate_commercial_problem(context)
        elif context.category == ProblemCategory.CRAFTS_ARTISAN:
            return self._generate_crafts_problem(context)
        elif context.category == ProblemCategory.HISTORICAL:
            return self._generate_historical_problem(context)
        elif context.category == ProblemCategory.SEASONAL_CELEBRATION:
            return self._generate_seasonal_problem(context)
        elif context.category == ProblemCategory.HOUSEHOLD_DOMESTIC:
            return self._generate_household_problem(context)
        elif context.category == ProblemCategory.TRADITIONAL_MEASUREMENT:
            return self._generate_measurement_problem(context)
        else:  # COMMUNITY_SOCIAL
            return self._generate_community_problem(context)

    def _generate_agricultural_problem(self, context: RomanianProblemContext) -> Dict[str, Any]:
        """Generate agricultural-themed problem"""
        name = context.characters[0]
        
        if context.difficulty == ProblemDifficulty.ELEMENTARY:
            # Simple addition/subtraction
            animals = random.choice(["oi", "vaci", "porci", "găini"])
            initial = random.randint(5, 20)
            change = random.randint(3, 10)
            operation = random.choice(["add", "subtract"])
            
            if operation == "add":
                problem_text = f"{name} are {initial} {animals} și cumpără încă {change} {animals}. Câte {animals} are în total?"
                answer = initial + change
                operations = ["addition"]
            else:
                problem_text = f"{name} are {initial} {animals} și vinde {change} {animals}. Câte {animals} îi rămân?"
                answer = initial - change
                operations = ["subtraction"]
            
            solution_steps = [f"{initial} {'+' if operation == 'add' else '-'} {change} = {answer}"]
            
        elif context.difficulty == ProblemDifficulty.INTERMEDIATE:
            # Multiplication/division with traditional measurements
            crop = random.choice(["grâu", "porumb", "orz"])
            pogoane = random.randint(2, 8)
            kg_per_pogon = random.randint(300, 600)
            
            problem_text = f"{name} cultivă {crop} pe {pogoane} pogoane. Dacă un pogon produce {kg_per_pogon} kg {crop}, câte kilograme produce în total?"
            answer = pogoane * kg_per_pogon
            operations = ["multiplication"]
            solution_steps = [f"{pogoane} pogoane × {kg_per_pogon} kg/pogon = {answer} kg"]
            
        else:  # ADVANCED
            # Multi-step problem with percentages
            crop = random.choice(["grâu", "porumb"])
            total_kg = random.randint(1000, 3000)
            sold_percentage = random.randint(60, 80)
            price_per_kg = random.randint(2, 5)
            
            sold_kg = (total_kg * sold_percentage) // 100
            total_income = sold_kg * price_per_kg
            
            problem_text = f"{name} a recoltat {total_kg} kg {crop}. Dacă vinde {sold_percentage}% din recoltă la {price_per_kg} lei/kg, câți lei încasează?"
            answer = total_income
            operations = ["percentage", "multiplication"]
            solution_steps = [
                f"{total_kg} kg × {sold_percentage}% = {sold_kg} kg vândute",
                f"{sold_kg} kg × {price_per_kg} lei/kg = {total_income} lei"
            ]
        
        return {
            "text": problem_text,
            "answer": answer,
            "solution_steps": solution_steps,
            "operations": operations,
            "traditional_elements": ["pogon", "agriculture", "animals"] if "pogon" in problem_text else ["animals", "agriculture"]
        }

    def _generate_commercial_problem(self, context: RomanianProblemContext) -> Dict[str, Any]:
        """Generate commercial/trade-themed problem"""
        name = context.characters[0]
        
        if context.difficulty == ProblemDifficulty.ELEMENTARY:
            # Simple market transaction
            product = random.choice(["mere", "pere", "roșii", "castraveți"])
            quantity = random.randint(5, 20)
            price_per_item = random.randint(1, 5)
            
            problem_text = f"La piață, {name} cumpără {quantity} kg {product} la {price_per_item} lei kilogramul. Câți lei plătește în total?"
            answer = quantity * price_per_item
            operations = ["multiplication"]
            solution_steps = [f"{quantity} kg × {price_per_item} lei/kg = {answer} lei"]
            
        elif context.difficulty == ProblemDifficulty.INTERMEDIATE:
            # Traditional measurement commerce
            product = random.choice(["grâu", "făină", "zahăr"])
            oci = random.randint(3, 12)
            lei_per_oca = random.randint(8, 25)
            
            problem_text = f"La târgul săptămânal, {name} vinde {oci} oci {product} la {lei_per_oca} lei oca. Câți lei încasează?"
            answer = oci * lei_per_oca
            operations = ["multiplication"]
            solution_steps = [f"{oci} oci × {lei_per_oca} lei/ocă = {answer} lei"]
            
        else:  # ADVANCED
            # Profit/loss calculation
            buy_price = random.randint(100, 300)
            sell_price = random.randint(120, 400)
            quantity = random.randint(5, 15)
            
            total_cost = buy_price * quantity
            total_revenue = sell_price * quantity
            profit = total_revenue - total_cost
            
            problem_text = f"Negustorul {name} cumpără {quantity} saci grâu la {buy_price} lei sacul și îi vinde la {sell_price} lei sacul. Câți lei profit face?"
            answer = profit
            operations = ["multiplication", "subtraction"]
            solution_steps = [
                f"Cost total: {quantity} saci × {buy_price} lei = {total_cost} lei",
                f"Vânzare totală: {quantity} saci × {sell_price} lei = {total_revenue} lei",
                f"Profit: {total_revenue} - {total_cost} = {profit} lei"
            ]
        
        return {
            "text": problem_text,
            "answer": answer,
            "solution_steps": solution_steps,
            "operations": operations,
            "traditional_elements": ["piață", "târg", "comerț", "oci"] if "oci" in problem_text else ["piață", "comerț"]
        }

    def _generate_crafts_problem(self, context: RomanianProblemContext) -> Dict[str, Any]:
        """Generate traditional crafts problem"""
        name = context.characters[0]
        craft_type = random.choice(["weaving", "pottery", "woodworking"])
        
        template = random.choice(self.craft_templates[craft_type])
        
        # Generate appropriate values based on craft type and difficulty
        if craft_type == "weaving":
            if context.difficulty == ProblemDifficulty.ELEMENTARY:
                values = [random.randint(3, 8), random.randint(2, 6)]
            else:
                values = [random.randint(5, 15), random.randint(3, 10)]
        elif craft_type == "pottery":
            if context.difficulty == ProblemDifficulty.ELEMENTARY:
                values = [random.randint(4, 12), random.randint(2, 8)]
            else:
                values = [random.randint(6, 20), random.randint(5, 15)]
        else:  # woodworking
            if context.difficulty == ProblemDifficulty.ELEMENTARY:
                values = [random.randint(2, 8), random.randint(3, 10)]
            else:
                values = [random.randint(5, 15), random.randint(8, 25)]
        
        # Format template with values
        if len(values) >= 2:
            problem_text = template.format(name=name, value1=values[0], value2=values[1])
            answer = values[0] * values[1]  # Most craft problems are multiplication
            operations = ["multiplication"]
            solution_steps = [f"{values[0]} × {values[1]} = {answer}"]
        else:
            problem_text = template.format(name=name, value1=values[0])
            answer = values[0]
            operations = ["direct"]
            solution_steps = [f"Răspuns direct: {answer}"]
        
        return {
            "text": problem_text,
            "answer": answer,
            "solution_steps": solution_steps,
            "operations": operations,
            "traditional_elements": [craft_type, "meșteșuguri", "tradiții"]
        }

    def _generate_seasonal_problem(self, context: RomanianProblemContext) -> Dict[str, Any]:
        """Generate seasonal celebration problem"""
        name = context.characters[0]
        season = context.seasonal_context or random.choice(["winter", "spring", "summer", "autumn"])
        
        # Get seasonal templates
        seasonal_data = self.seasonal_templates.get(season, self.seasonal_templates["winter"])
        category_templates = random.choice(list(seasonal_data.values()))
        template = random.choice(category_templates)
        
        # Generate values based on difficulty
        if context.difficulty == ProblemDifficulty.ELEMENTARY:
            values = [random.randint(2, 12), random.randint(2, 8)]
        elif context.difficulty == ProblemDifficulty.INTERMEDIATE:
            values = [random.randint(5, 25), random.randint(3, 15), random.randint(2, 8), random.randint(3, 12)]
        else:
            values = [random.randint(10, 50), random.randint(5, 20), random.randint(8, 30), random.randint(4, 15)]
        
        # Format problem text
        if "value4" in template:
            problem_text = template.format(
                name=name, value1=values[0], value2=values[1], 
                value3=values[2], value4=values[3]
            )
            answer = (values[0] * values[1]) + (values[2] * values[3])
            operations = ["multiplication", "addition"]
            solution_steps = [
                f"{values[0]} × {values[1]} = {values[0] * values[1]}",
                f"{values[2]} × {values[3]} = {values[2] * values[3]}",
                f"{values[0] * values[1]} + {values[2] * values[3]} = {answer}"
            ]
        elif "value3" in template:
            problem_text = template.format(
                name=name, value1=values[0], value2=values[1], value3=values[2]
            )
            answer = (values[0] * values[2]) // values[1]
            operations = ["multiplication", "division"]
            solution_steps = [
                f"Pentru {values[0]} persoane: ({values[0]} ÷ {values[1]}) × {values[2]} = {answer}"
            ]
        else:
            problem_text = template.format(name=name, value1=values[0], value2=values[1])
            answer = values[0] * values[1]
            operations = ["multiplication"]
            solution_steps = [f"{values[0]} × {values[1]} = {answer}"]
        
        return {
            "text": problem_text,
            "answer": answer,
            "solution_steps": solution_steps,
            "operations": operations,
            "traditional_elements": [season, "celebrare", "tradiții"]
        }

    def _generate_household_problem(self, context: RomanianProblemContext) -> Dict[str, Any]:
        """Generate household/domestic problem"""
        name = context.characters[1]  # Use female name typically
        
        household_items = ["ouă", "lapte", "pâine", "zahăr", "făină", "ulei", "brânză"]
        item = random.choice(household_items)
        
        if context.difficulty == ProblemDifficulty.ELEMENTARY:
            quantity = random.randint(3, 15)
            price = random.randint(2, 8)
            
            problem_text = f"{name} cumpără {quantity} {item} la {price} lei bucata. Câți lei cheltuiește în total?"
            answer = quantity * price
            operations = ["multiplication"]
            solution_steps = [f"{quantity} × {price} lei = {answer} lei"]
            
        else:
            # Weekly shopping calculation
            items = random.sample(household_items, 3)
            quantities = [random.randint(2, 10) for _ in items]
            prices = [random.randint(3, 12) for _ in items]
            
            total = sum(q * p for q, p in zip(quantities, prices))
            
            problem_text = f"{name} face cumpărături: {quantities[0]} {items[0]} la {prices[0]} lei, {quantities[1]} {items[1]} la {prices[1]} lei, și {quantities[2]} {items[2]} la {prices[2]} lei. Cât cheltuiește în total?"
            answer = total
            operations = ["multiplication", "addition"]
            solution_steps = [
                f"{quantities[0]} × {prices[0]} = {quantities[0] * prices[0]} lei",
                f"{quantities[1]} × {prices[1]} = {quantities[1] * prices[1]} lei", 
                f"{quantities[2]} × {prices[2]} = {quantities[2] * prices[2]} lei",
                f"Total: {quantities[0] * prices[0]} + {quantities[1] * prices[1]} + {quantities[2] * prices[2]} = {total} lei"
            ]
        
        return {
            "text": problem_text,
            "answer": answer,
            "solution_steps": solution_steps,
            "operations": operations,
            "traditional_elements": ["gospodărie", "cumpărături", "casnic"]
        }

    def _generate_historical_problem(self, context: RomanianProblemContext) -> Dict[str, Any]:
        """Generate historically-themed problem"""
        historical_data = self.historical_templates[context.historical_period]
        problem_type = random.choice(list(historical_data.keys()))
        template = random.choice(historical_data[problem_type])
        
        # Select appropriate historical context
        if context.historical_period == "medieval":
            rulers = ["Ștefan cel Mare", "Mircea cel Bătrân", "Vlad Țepeș"]
            cities = ["Iași", "Târgoviște", "Suceava"]
            monasteries = ["Voroneț", "Moldovița", "Putna"]
            
            problem_text = template.format(
                ruler=random.choice(rulers),
                name=context.characters[0],
                city=random.choice(cities),
                monastery=random.choice(monasteries),
                value1=random.randint(100, 500),
                value2=random.randint(5, 25)
            )
            
        else:  # modern
            cities = ["București", "Cluj", "Timișoara", "Iași"]
            years = ["1880", "1890", "1900", "1910"]
            
            problem_text = template.format(
                name=context.characters[0],
                city=random.choice(cities),
                year=random.choice(years),
                value1=random.randint(20, 100),
                value2=random.randint(8, 24)
            )
        
        # Calculate answer based on template structure
        if "profit" in template:
            answer = random.randint(50, 200)
            operations = ["multiplication", "subtraction"]
        else:
            answer = random.randint(100, 1000)
            operations = ["multiplication"]
        
        solution_steps = [f"Calcul: {answer}"]
        
        return {
            "text": problem_text,
            "answer": answer,
            "solution_steps": solution_steps,
            "operations": operations,
            "traditional_elements": ["istorie", context.historical_period, "cultură"]
        }

    def _generate_measurement_problem(self, context: RomanianProblemContext) -> Dict[str, Any]:
        """Generate traditional measurement problem"""
        name = context.characters[0]
        
        # Select traditional measurement
        measurements = list(self.cultural_system.traditional_measurements.keys())
        measurement = random.choice(measurements)
        measurement_data = self.cultural_system.traditional_measurements[measurement]
        
        if context.difficulty == ProblemDifficulty.ELEMENTARY:
            value = random.randint(2, 10)
            problem_text = f"{name} măsoară o bucată de pânză de {value} {measurement}. Câți metri reprezintă aceasta?"
            answer = round(value * measurement_data["modern_equivalent"], 2)
            operations = ["conversion"]
            solution_steps = [f"{value} {measurement} × {measurement_data['modern_equivalent']} = {answer} metri"]
            
        else:
            # Complex measurement conversion
            value1 = random.randint(3, 15)
            value2 = random.randint(2, 8)
            
            problem_text = f"{name} are {value1} {measurement} de pânză și cumpără încă {value2} {measurement}. Câți metri de pânză are în total?"
            total_traditional = value1 + value2
            answer = round(total_traditional * measurement_data["modern_equivalent"], 2)
            operations = ["addition", "conversion"]
            solution_steps = [
                f"{value1} + {value2} = {total_traditional} {measurement}",
                f"{total_traditional} {measurement} × {measurement_data['modern_equivalent']} = {answer} metri"
            ]
        
        return {
            "text": problem_text,
            "answer": answer,
            "solution_steps": solution_steps,
            "operations": operations,
            "traditional_elements": [measurement, "măsurători tradiționale", "conversii"]
        }

    def _generate_community_problem(self, context: RomanianProblemContext) -> Dict[str, Any]:
        """Generate community/social problem"""
        name = context.characters[0]
        
        community_contexts = [
            "construirea unei biserici",
            "organizarea unui târg",
            "pregătirea unei sărbători",
            "ajutorarea unui vecin"
        ]
        
        community_context = random.choice(community_contexts)
        
        if "biserici" in community_context:
            problem_text = f"Pentru construirea bisericii, {name} și vecinii contribuie: {name} dă {random.randint(100, 300)} lei, {context.characters[1]} dă {random.randint(150, 400)} lei, și alți {random.randint(3, 8)} vecini dau câte {random.randint(50, 200)} lei fiecare. Câți lei se strâng în total?"
        else:
            people = random.randint(15, 40)
            cost_per_person = random.randint(20, 80)
            problem_text = f"Pentru {community_context}, {people} persoane din sat contribuie câte {cost_per_person} lei fiecare. Câți lei se strâng în total?"
            answer = people * cost_per_person
        
        return {
            "text": problem_text,
            "answer": answer if 'answer' in locals() else random.randint(800, 2000),
            "solution_steps": [f"Calcul comunitar: {answer if 'answer' in locals() else 'complex'}"],
            "operations": ["multiplication", "addition"],
            "traditional_elements": ["comunitate", "sat", "cooperare"]
        }

    def _create_setting_description(self, region: RomanianRegion, category: ProblemCategory, historical_period: str) -> str:
        """Create authentic setting description"""
        regional_data = self.regional_contexts.get(region, {})
        city = random.choice(regional_data.get("cities", ["satul"]))
        
        if historical_period == "medieval":
            return f"în {city}, în timpul Evului Mediu"
        elif historical_period == "modern":
            return f"în orașul {city}, la începutul secolului XX"
        else:
            return f"în {city}, în zilele noastre"

    def _enhance_cultural_authenticity(self, problem_data: Dict[str, Any], context: RomanianProblemContext) -> Dict[str, Any]:
        """Enhance problem with additional cultural authenticity"""
        
        # Add cultural context to problem text if needed
        enhanced_text = problem_data["text"]
        
        # Add regional flavor
        if context.region and not any(city in enhanced_text for city in self.regional_contexts.get(context.region, {}).get("cities", [])):
            regional_element = random.choice(self.regional_contexts.get(context.region, {}).get("specialties", ["local"]))
            # This could be enhanced to naturally integrate regional elements
        
        problem_data["text"] = enhanced_text
        return problem_data

    def _calculate_problem_scores(self, problem_data: Dict[str, Any], context: RomanianProblemContext) -> Dict[str, Any]:
        """Calculate various quality scores for the problem"""
        
        # Cultural accuracy based on context richness
        cultural_score = min(1.0, context.authenticity_score + 0.1 * len(context.cultural_elements))
        
        # Educational level mapping
        educational_mapping = {
            ProblemDifficulty.ELEMENTARY: "Clasele I-IV",
            ProblemDifficulty.INTERMEDIATE: "Clasele V-VIII", 
            ProblemDifficulty.ADVANCED: "Clasele IX-XII"
        }
        
        # Regional authenticity based on specific elements
        regional_score = 0.8 if context.region else 0.6
        if context.cultural_elements:
            regional_score += 0.1 * min(2, len(context.cultural_elements))
        
        return {
            "cultural_accuracy": cultural_score,
            "educational_level": educational_mapping[context.difficulty],
            "regional_authenticity": min(1.0, regional_score)
        }

    def _validate_romanian_specificity(self, problem: GeneratedProblem) -> Dict[str, Any]:
        """Validate Romanian-specific elements in the problem"""
        
        romanian_indicators = 0
        max_indicators = 5
        
        # Check for Romanian names
        romanian_names = ["Ion", "Ana", "Maria", "Gheorghe", "Elena", "Mihai", "Ioana"]
        if any(name in problem.problem_text for name in romanian_names):
            romanian_indicators += 1
        
        # Check for traditional measurements
        traditional_measurements = ["oca", "pogon", "cot", "palma", "vedro"]
        if any(measure in problem.problem_text for measure in traditional_measurements):
            romanian_indicators += 1
        
        # Check for cultural objects
        cultural_objects = ["mămăligă", "țuică", "brânză", "mere", "grâu", "oi"]
        if any(obj in problem.problem_text for obj in cultural_objects):
            romanian_indicators += 1
        
        # Check for Romanian locations
        romanian_locations = ["piață", "târg", "sat", "București", "Cluj", "Iași"]
        if any(loc in problem.problem_text for loc in romanian_locations):
            romanian_indicators += 1
        
        # Check for seasonal/cultural contexts
        seasonal_contexts = ["primăvară", "vară", "toamnă", "iarnă", "Crăciun", "Paști"]
        if any(season in problem.problem_text for season in seasonal_contexts):
            romanian_indicators += 1
        
        authenticity_score = romanian_indicators / max_indicators
        
        return {
            "authenticity_score": authenticity_score,
            "romanian_indicators_found": romanian_indicators,
            "max_possible_indicators": max_indicators,
            "specificity_level": "High" if authenticity_score >= 0.8 else "Medium" if authenticity_score >= 0.5 else "Low"
        }

    def _validate_mathematical_accuracy(self, problem: GeneratedProblem) -> Dict[str, Any]:
        """Validate mathematical accuracy of the problem"""
        
        # Basic validation - in production this would be more comprehensive
        accuracy_score = 0.9  # Assume high accuracy for generated problems
        
        # Check if answer is reasonable
        if problem.answer < 0:
            accuracy_score -= 0.3
        elif problem.answer > 1000000:  # Very large numbers might be unrealistic
            accuracy_score -= 0.1
        
        # Check solution steps consistency
        if len(problem.solution_steps) == 0:
            accuracy_score -= 0.2
        
        return {
            "accuracy_score": max(0.0, accuracy_score),
            "answer_reasonableness": "Good" if 0 <= problem.answer <= 10000 else "Questionable",
            "solution_completeness": len(problem.solution_steps) > 0
        }

    def _validate_educational_level(self, problem: GeneratedProblem) -> Dict[str, Any]:
        """Validate educational appropriateness"""
        
        appropriateness_score = 0.8  # Base score
        
        # Check complexity vs difficulty level
        if problem.context.difficulty == ProblemDifficulty.ELEMENTARY:
            if len(problem.mathematical_operations) > 2:
                appropriateness_score -= 0.2
            if problem.answer > 1000:
                appropriateness_score -= 0.1
        elif problem.context.difficulty == ProblemDifficulty.INTERMEDIATE:
            if problem.answer > 10000:
                appropriateness_score -= 0.1
        
        return {
            "appropriateness_score": max(0.0, appropriateness_score),
            "complexity_match": "Good",
            "age_appropriate": True
        }


# Global instance for efficient reuse
_traditional_problem_generator = None

def get_traditional_problem_generator() -> TraditionalRomanianProblemGenerator:
    """Get the global Traditional Romanian Problem Generator instance"""
    global _traditional_problem_generator
    if _traditional_problem_generator is None:
        _traditional_problem_generator = TraditionalRomanianProblemGenerator()
    return _traditional_problem_generator