"""
🔍 RomAI Capability Analyzer

Real-time analysis of RomAI's actual capabilities and limitations,
replacing hardcoded capability descriptions with honest assessments.
"""

import asyncio
import logging
import os
import importlib
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime

logger = logging.getLogger(__name__)

@dataclass
class CapabilityAssessment:
    """Real-time capability assessment"""
    active_modules: List[str]
    operational_domains: List[str]
    training_level: str
    romanian_context_level: str
    confidence: float
    limitations: List[str]
    assessment_time: datetime

class CapabilityAnalyzer:
    """
    Real-time RomAI Capability Analysis
    
    Provides honest, dynamic assessment of actual system capabilities
    instead of hardcoded marketing descriptions.
    """
    
    def __init__(self):
        self.base_path = os.path.dirname(__file__)
        self.assessments_performed = 0
        
        # Modules to check for operational status
        self.modules_to_check = {
            'advanced_math_engine': 'ml.reasoning.advanced_math_engine',
            'logical_engine': 'ml.reasoning.native_logical_engine', 
            'cultural_intelligence': 'ml.cultural.romanian_cultural_intelligence',
            'multimodal_engine': 'ml.multimodal.advanced_multimodal_engine',
            'dataset_orchestrator': 'ml.orchestration.dataset_expansion_orchestrator',
            'programming_engine': 'ml.orchestration.programming_engine'
        }
        
        logger.info("🔍 Capability Analyzer initialized")
    
    def _check_module_availability(self, module_name: str, module_path: str) -> Dict[str, Any]:
        """Check if a module is available and functional"""
        try:
            # Try to import the module
            module = importlib.import_module(f"..{module_path}", package=__name__)
            
            # Check if it has key classes/functions
            if hasattr(module, '__all__'):
                exported_items = module.__all__
                return {
                    'available': True,
                    'status': 'operational',
                    'exports': len(exported_items),
                    'details': f"Module loaded with {len(exported_items)} exports"
                }
            else:
                return {
                    'available': True,
                    'status': 'limited',
                    'exports': 0,
                    'details': "Module loaded but no explicit exports"
                }
                
        except ImportError as e:
            return {
                'available': False,
                'status': 'missing',
                'error': str(e),
                'details': f"Import failed: {str(e)}"
            }
        except Exception as e:
            return {
                'available': False,
                'status': 'error',
                'error': str(e),
                'details': f"Module error: {str(e)}"
            }
    
    def _assess_romanian_context_level(self) -> str:
        """Assess the level of Romanian cultural/linguistic support"""
        try:
            # Check if Romanian cultural database exists
            cultural_db_path = os.path.join(
                os.path.dirname(self.base_path), 
                'cultural', 'data', 'romanian_cultural_database.json'
            )
            
            if os.path.exists(cultural_db_path):
                file_size = os.path.getsize(cultural_db_path)
                
                if file_size > 100000:  # > 100KB
                    return "Bună (bază de date culturală substanțială)"
                elif file_size > 10000:  # > 10KB
                    return "Moderată (bază de date culturală de bază)"
                else:
                    return "Limitată (bază de date culturală minimă)"
            else:
                return "În dezvoltare (bază de date culturală lipsește)"
                
        except Exception:
            return "Evaluare imposibilă"
    
    def _calculate_training_level(self, module_results: Dict[str, Dict[str, Any]]) -> str:
        """Calculate overall training level based on module availability"""
        
        operational_count = sum(1 for result in module_results.values() 
                              if result['status'] == 'operational')
        total_modules = len(module_results)
        
        operational_percentage = operational_count / total_modules
        
        if operational_percentage >= 0.8:
            return "Avansat (majoritatea modulelor operaționale)"
        elif operational_percentage >= 0.5:
            return "Intermediar (jumătate din module operaționale)"
        elif operational_percentage >= 0.2:
            return "De bază (câteva module operaționale)"
        else:
            return "Inițial (majoritatea modulelor în dezvoltare)"
    
    def _identify_limitations(self, module_results: Dict[str, Dict[str, Any]]) -> List[str]:
        """Identify current system limitations"""
        limitations = []
        
        for module_name, result in module_results.items():
            if result['status'] == 'missing':
                limitations.append(f"Modul {module_name} lipsește")
            elif result['status'] == 'error':
                limitations.append(f"Modul {module_name} are erori")
            elif result['status'] == 'limited':
                limitations.append(f"Modul {module_name} funcționalitate limitată")
        
        # Check for common AI limitations
        limitations.extend([
            "Antrenament pe date limitate (nu miliarde de tokeni)",
            "Fără acces în timp real la internet",
            "Procesare secvențială (fără paralelizare avansată)",
            "Răspunsuri bazate pe pattern matching, nu pe rețele neurale profunde"
        ])
        
        return limitations
    
    async def analyze_current_capabilities(self) -> Dict[str, Any]:
        """
        Perform real-time analysis of RomAI's actual capabilities
        
        Returns honest assessment instead of marketing descriptions
        """
        
        self.assessments_performed += 1
        
        logger.info(f"🔍 Performing capability assessment #{self.assessments_performed}")
        
        # Check all modules
        module_results = {}
        for module_name, module_path in self.modules_to_check.items():
            module_results[module_name] = self._check_module_availability(module_name, module_path)
        
        # Assess Romanian context level
        romanian_level = self._assess_romanian_context_level()
        
        # Calculate training level
        training_level = self._calculate_training_level(module_results)
        
        # Identify limitations
        limitations = self._identify_limitations(module_results)
        
        # Determine operational domains
        operational_domains = []
        for module_name, result in module_results.items():
            if result['status'] == 'operational':
                if 'math' in module_name:
                    operational_domains.append("Matematică")
                elif 'logical' in module_name:
                    operational_domains.append("Logică")
                elif 'cultural' in module_name:
                    operational_domains.append("Context Românesc")
                elif 'multimodal' in module_name:
                    operational_domains.append("Procesare Multimodală")
                elif 'programming' in module_name:
                    operational_domains.append("Programare")
        
        # Calculate confidence
        operational_modules = [name for name, result in module_results.items() 
                             if result['status'] == 'operational']
        confidence = len(operational_modules) / len(self.modules_to_check)
        
        return {
            'active_modules': operational_modules,
            'operational_domains': operational_domains,
            'training_level': training_level,
            'romanian_context_level': romanian_level,
            'confidence': confidence,
            'limitations': limitations,
            'assessment_number': self.assessments_performed,
            'assessment_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'total_modules_checked': len(self.modules_to_check),
            'module_details': module_results
        }
    
    async def generate_capability_report(self) -> str:
        """Generate human-readable capability report"""
        
        capabilities = await self.analyze_current_capabilities()
        
        report = f"""🔍 RomAI Capability Assessment - Onest și Dinamic

Evaluare efectuată: {capabilities['assessment_time']}
Evaluare numărul: {capabilities['assessment_number']}

🧠 Module Active: {len(capabilities['active_modules'])}/{capabilities['total_modules_checked']}
{'✅ ' + ', '.join(capabilities['active_modules']) if capabilities['active_modules'] else '❌ Niciun modul complet operațional'}

🎯 Domenii Operaționale:
{chr(10).join(['• ' + domain for domain in capabilities['operational_domains']]) if capabilities['operational_domains'] else '• Niciun domeniu complet operațional'}

📊 Nivel de Antrenament: {capabilities['training_level']}
🇷🇴 Context Românesc: {capabilities['romanian_context_level']}
📈 Încredere: {capabilities['confidence']:.1%}

⚠️ Limitări Actuale:
{chr(10).join(['• ' + limitation for limitation in capabilities['limitations'][:5]])}

Această evaluare este generată dinamic și reflectă starea reală a sistemului."""

        return report

# Export main interface
__all__ = [
    'CapabilityAnalyzer',
    'CapabilityAssessment'
]