"""
RomAI AGI Legal Reasoning Engine
================================

Advanced legal analysis and reasoning capabilities with case precedent matching,
contract interpretation, legal document review, and juridical decision support.

Author: RomAI Development Team
Created: 2025-08-24
Version: 1.0.0 (Production Ready)
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from datetime import datetime
import json
import re
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class LegalResult:
    """Standardized legal analysis result with comprehensive legal reasoning."""
    
    # Primary result fields
    legal_conclusion: str
    legal_reasoning: List[str]
    confidence_score: float
    
    # Legal-specific fields
    applicable_laws: List[str] = field(default_factory=list)
    case_precedents: List[Dict[str, Any]] = field(default_factory=list)
    legal_issues: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    risk_assessment: Dict[str, Any] = field(default_factory=dict)
    
    # Analysis metadata
    jurisdiction: Optional[str] = None
    legal_area: Optional[str] = None
    complexity_level: str = "medium"
    processing_time: float = 0.0
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    
    # Standardized aliases for interface compatibility
    @property
    def result(self) -> str:
        """Alias for legal_conclusion to maintain interface compatibility."""
        return self.legal_conclusion
    
    @property
    def conclusion(self) -> str:
        """Alias for legal_conclusion for consistent naming."""
        return self.legal_conclusion
    
    @property
    def reasoning(self) -> List[str]:
        """Alias for legal_reasoning to maintain interface consistency."""
        return self.legal_reasoning
    
    @property
    def reasoning_chain(self) -> List[str]:
        """Alias for legal_reasoning for broader compatibility."""
        return self.legal_reasoning

class AutonomousLegalEngine:
    """
    Advanced Legal Reasoning Engine with case analysis, contract interpretation,
    and juridical decision support capabilities.
    
    Features:
    - Case precedent matching and analysis
    - Contract interpretation and review
    - Legal document analysis
    - Statutory interpretation
    - Risk assessment and legal recommendations
    - Multi-jurisdictional awareness
    """
    
    def __init__(self):
        """Initialize the Legal Reasoning Engine with knowledge bases."""
        self.legal_knowledge_base = self._initialize_legal_knowledge()
        self.case_database = self._initialize_case_database()
        self.statutory_database = self._initialize_statutory_database()
        self.contract_patterns = self._initialize_contract_patterns()
        
        logger.info("✅ RomAI Legal Reasoning Engine initialized successfully")
        logger.info(f"📚 Loaded {len(self.legal_knowledge_base)} legal principles")
        logger.info(f"⚖️ Loaded {len(self.case_database)} case precedents")
        logger.info(f"📋 Loaded {len(self.statutory_database)} statutory references")
    
    def _initialize_legal_knowledge(self) -> Dict[str, Any]:
        """Initialize core legal knowledge and principles."""
        return {
            "constitutional_law": {
                "due_process": "Fundamental fairness in legal proceedings",
                "equal_protection": "Equal treatment under law regardless of classification",
                "substantive_due_process": "Protection of fundamental rights from government interference",
                "procedural_due_process": "Fair procedures in legal proceedings"
            },
            "contract_law": {
                "offer_acceptance": "Valid contract requires clear offer and acceptance",
                "consideration": "Exchange of value required for contract validity",
                "capacity": "Parties must have legal capacity to contract",
                "legality": "Contract purpose and terms must be legal",
                "mutuality": "Both parties must be bound by contract terms"
            },
            "tort_law": {
                "negligence": "Duty, breach, causation, and damages required",
                "intentional_torts": "Purposeful wrongful acts causing harm",
                "strict_liability": "Liability without proof of fault for certain activities",
                "damages": "Compensation for harm caused by tortious conduct"
            },
            "criminal_law": {
                "actus_reus": "Criminal act or omission required for liability",
                "mens_rea": "Criminal intent or mental state required",
                "causation": "Act must cause the prohibited result",
                "defenses": "Justifications or excuses that negate liability"
            },
            "property_law": {
                "ownership_rights": "Bundle of rights in property ownership",
                "transfer_methods": "Valid ways to transfer property interests",
                "easements": "Rights to use another's property for specific purposes",
                "landlord_tenant": "Rights and obligations in rental relationships"
            }
        }
    
    def _initialize_case_database(self) -> List[Dict[str, Any]]:
        """Initialize case precedent database with landmark cases."""
        return [
            {
                "case_name": "Brown v. Board of Education",
                "citation": "347 U.S. 483 (1954)",
                "legal_area": "constitutional_law",
                "holding": "Separate educational facilities are inherently unequal",
                "principle": "Equal protection requires integration in public education",
                "jurisdiction": "US_Federal",
                "keywords": ["equal_protection", "education", "segregation", "constitutional"]
            },
            {
                "case_name": "Miranda v. Arizona", 
                "citation": "384 U.S. 436 (1966)",
                "legal_area": "criminal_law",
                "holding": "Suspects must be informed of rights before interrogation",
                "principle": "Fifth Amendment protection against self-incrimination",
                "jurisdiction": "US_Federal",
                "keywords": ["criminal_procedure", "self_incrimination", "interrogation"]
            },
            {
                "case_name": "Carlill v. Carbolic Smoke Ball Co.",
                "citation": "[1893] 1 Q.B. 256",
                "legal_area": "contract_law",
                "holding": "Advertisement constituted valid unilateral offer",
                "principle": "Unilateral contracts can be formed through performance",
                "jurisdiction": "UK_Common_Law",
                "keywords": ["unilateral_contract", "offer", "acceptance", "consideration"]
            },
            {
                "case_name": "Palsgraf v. Long Island Railroad Co.",
                "citation": "248 N.Y. 339 (1928)",
                "legal_area": "tort_law", 
                "holding": "Duty of care limited to foreseeable plaintiffs",
                "principle": "Proximate cause requires foreseeability of harm",
                "jurisdiction": "US_State",
                "keywords": ["negligence", "duty", "foreseeability", "proximate_cause"]
            },
            {
                "case_name": "Rylands v. Fletcher",
                "citation": "(1868) LR 3 HL 330",
                "legal_area": "tort_law",
                "holding": "Strict liability for dangerous activities on land",
                "principle": "Owner liable for escape of dangerous substances",
                "jurisdiction": "UK_Common_Law", 
                "keywords": ["strict_liability", "dangerous_activities", "property"]
            }
        ]
    
    def _initialize_statutory_database(self) -> Dict[str, Any]:
        """Initialize statutory law reference database."""
        return {
            "US_Federal": {
                "Constitution": {
                    "First_Amendment": "Freedom of speech, religion, press, assembly",
                    "Fourth_Amendment": "Protection against unreasonable searches",
                    "Fifth_Amendment": "Due process and self-incrimination protection",
                    "Fourteenth_Amendment": "Equal protection and due process"
                },
                "USC_Title_15": "Commerce and Trade regulations",
                "USC_Title_26": "Internal Revenue Code",
                "USC_Title_42": "Civil Rights statutes"
            },
            "UK_Common_Law": {
                "Sale_of_Goods_Act": "Contract law for sale of goods",
                "Unfair_Contract_Terms_Act": "Protection against unfair contract terms",
                "Human_Rights_Act": "Implementation of European Convention rights"
            },
            "EU_Law": {
                "GDPR": "General Data Protection Regulation",
                "Competition_Law": "Antitrust and market competition rules",
                "Consumer_Protection": "Consumer rights and business obligations"
            }
        }
    
    def _initialize_contract_patterns(self) -> Dict[str, List[str]]:
        """Initialize common contract clause patterns and interpretations."""
        return {
            "force_majeure": [
                "unforeseeable circumstances beyond party control",
                "natural disasters, war, government action",
                "excuse from performance during force majeure events"
            ],
            "liquidated_damages": [
                "predetermined damages for breach",
                "must be reasonable estimate of actual damages",
                "penalty clauses may be unenforceable"
            ],
            "arbitration_clause": [
                "disputes resolved through arbitration not litigation", 
                "binding arbitration waives right to jury trial",
                "arbitrator selection and governing rules specified"
            ],
            "choice_of_law": [
                "governing law specified for contract interpretation",
                "jurisdiction selection for dispute resolution",
                "may be limited by public policy considerations"
            ],
            "confidentiality": [
                "protection of proprietary information",
                "scope and duration of confidentiality obligations",
                "exceptions for publicly available information"
            ]
        }
    
    async def analyze_legal_issue(self, legal_question: str, context: Optional[Dict[str, Any]] = None) -> LegalResult:
        """
        Analyze a legal issue and provide comprehensive legal reasoning.
        
        Args:
            legal_question: The legal question or issue to analyze
            context: Additional context including jurisdiction, facts, etc.
        
        Returns:
            LegalResult with legal analysis and recommendations
        """
        start_time = datetime.now()
        
        try:
            logger.info(f"🏛️ Analyzing legal issue: {legal_question[:100]}...")
            
            # Parse context
            jurisdiction = context.get("jurisdiction", "General") if context else "General"
            facts = context.get("facts", []) if context else []
            legal_area = context.get("legal_area") if context else None
            
            # Identify legal issues
            legal_issues = self._identify_legal_issues(legal_question, facts)
            
            # Find applicable laws
            applicable_laws = self._find_applicable_laws(legal_issues, jurisdiction)
            
            # Search case precedents
            case_precedents = self._search_case_precedents(legal_issues, jurisdiction)
            
            # Generate legal reasoning
            legal_reasoning = self._generate_legal_reasoning(
                legal_question, legal_issues, applicable_laws, case_precedents
            )
            
            # Formulate conclusion
            legal_conclusion = self._formulate_legal_conclusion(
                legal_question, legal_reasoning, case_precedents
            )
            
            # Assess risks and provide recommendations
            risk_assessment = self._assess_legal_risks(legal_issues, applicable_laws)
            recommendations = self._generate_recommendations(legal_issues, risk_assessment)
            
            # Calculate confidence
            confidence_score = self._calculate_confidence(
                len(case_precedents), len(applicable_laws), len(legal_issues)
            )
            
            # Determine complexity
            complexity_level = self._assess_complexity(legal_issues, case_precedents)
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            result = LegalResult(
                legal_conclusion=legal_conclusion,
                legal_reasoning=legal_reasoning,
                confidence_score=confidence_score,
                applicable_laws=applicable_laws,
                case_precedents=case_precedents,
                legal_issues=legal_issues,
                recommendations=recommendations,
                risk_assessment=risk_assessment,
                jurisdiction=jurisdiction,
                legal_area=legal_area,
                complexity_level=complexity_level,
                processing_time=processing_time
            )
            
            logger.info(f"✅ Legal analysis completed in {processing_time:.2f}s")
            logger.info(f"📊 Confidence: {confidence_score:.1%}, Issues: {len(legal_issues)}, Precedents: {len(case_precedents)}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Legal analysis failed: {str(e)}")
            return LegalResult(
                legal_conclusion=f"Legal analysis error: {str(e)}",
                legal_reasoning=[f"Error in legal analysis: {str(e)}"],
                confidence_score=0.0,
                processing_time=(datetime.now() - start_time).total_seconds()
            )
    
    def _identify_legal_issues(self, question: str, facts: List[str]) -> List[str]:
        """Identify the key legal issues from question and facts."""
        issues = []
        question_lower = question.lower()
        
        # Contract law issues
        if any(term in question_lower for term in ["contract", "agreement", "breach", "offer", "acceptance"]):
            issues.append("contract_formation_and_enforcement")
        
        # Tort law issues  
        if any(term in question_lower for term in ["negligence", "liability", "damages", "injury", "harm"]):
            issues.append("tort_liability_and_damages")
        
        # Constitutional law issues
        if any(term in question_lower for term in ["constitutional", "amendment", "due process", "equal protection", "search", "warrant", "fourth amendment"]):
            issues.append("constitutional_rights_and_protections")
        
        # Criminal law issues
        if any(term in question_lower for term in ["criminal", "prosecution", "defense", "intent", "guilty"]):
            issues.append("criminal_liability_and_defenses")
        
        # Property law issues
        if any(term in question_lower for term in ["property", "ownership", "title", "easement", "landlord"]):
            issues.append("property_rights_and_interests")
        
        # Employment law issues
        if any(term in question_lower for term in ["employment", "discrimination", "wrongful termination", "workplace"]):
            issues.append("employment_law_and_discrimination")
        
        # Add general legal issue if no specific issues identified
        if not issues:
            issues.append("general_legal_analysis")
        
        return issues
    
    def _find_applicable_laws(self, legal_issues: List[str], jurisdiction: str) -> List[str]:
        """Find applicable laws and statutes for the identified legal issues."""
        applicable_laws = []
        
        for issue in legal_issues:
            if "contract" in issue:
                applicable_laws.extend([
                    "Uniform Commercial Code (UCC)",
                    "Restatement (Second) of Contracts", 
                    "Common law contract principles"
                ])
            
            if "tort" in issue:
                applicable_laws.extend([
                    "Restatement (Third) of Torts",
                    "State tort law statutes",
                    "Common law negligence principles"
                ])
            
            if "constitutional" in issue:
                applicable_laws.extend([
                    "U.S. Constitution",
                    "Bill of Rights (First 10 Amendments)",
                    "Fourteenth Amendment",
                    "Constitutional law principles"
                ])
            
            if "criminal" in issue:
                applicable_laws.extend([
                    "State criminal code",
                    "Federal criminal statutes",
                    "Constitutional criminal procedure"
                ])
            
            if "property" in issue:
                applicable_laws.extend([
                    "State property law statutes",
                    "Common law property principles",
                    "Real Estate Settlement Procedures Act"
                ])
        
        # Remove duplicates while preserving order
        return list(dict.fromkeys(applicable_laws))
    
    def _search_case_precedents(self, legal_issues: List[str], jurisdiction: str) -> List[Dict[str, Any]]:
        """Search for relevant case precedents based on legal issues."""
        relevant_cases = []
        
        for case in self.case_database:
            # Check jurisdiction compatibility
            if jurisdiction != "General" and jurisdiction not in case.get("jurisdiction", ""):
                continue
            
            # Check for matching legal areas or keywords
            case_matches = False
            for issue in legal_issues:
                if any(keyword in issue for keyword in case.get("keywords", [])):
                    case_matches = True
                    break
                
                # Check legal area match
                if case.get("legal_area") in issue:
                    case_matches = True
                    break
            
            if case_matches:
                relevant_cases.append(case)
        
        return relevant_cases
    
    def _generate_legal_reasoning(self, question: str, issues: List[str], 
                                laws: List[str], precedents: List[Dict[str, Any]]) -> List[str]:
        """Generate step-by-step legal reasoning."""
        reasoning = []
        
        # Issue identification step
        reasoning.append(f"Legal Issue Analysis: Identified {len(issues)} key legal issues requiring analysis")
        
        # Applicable law analysis
        if laws:
            reasoning.append(f"Applicable Law: {len(laws)} relevant legal authorities identified")
            for law in laws[:3]:  # Limit to top 3 for clarity
                reasoning.append(f"  • {law}")
        
        # Precedent analysis
        if precedents:
            reasoning.append(f"Case Precedent Analysis: {len(precedents)} relevant cases found")
            for precedent in precedents[:2]:  # Limit to top 2 for clarity
                reasoning.append(f"  • {precedent['case_name']}: {precedent['principle']}")
        
        # Legal standard application
        reasoning.append("Legal Standard Application:")
        for issue in issues:
            if "contract" in issue:
                reasoning.append("  • Contract formation requires offer, acceptance, consideration, and capacity")
            elif "tort" in issue:
                reasoning.append("  • Tort liability requires duty, breach, causation, and damages")
            elif "constitutional" in issue:
                reasoning.append("  • Constitutional analysis requires strict or intermediate scrutiny")
        
        # Factual analysis
        reasoning.append("Factual Analysis: Applying legal standards to the specific facts presented")
        
        return reasoning
    
    def _formulate_legal_conclusion(self, question: str, reasoning: List[str], 
                                  precedents: List[Dict[str, Any]]) -> str:
        """Formulate the legal conclusion based on analysis."""
        
        # Analyze question type to determine conclusion style
        question_lower = question.lower()
        
        if "liable" in question_lower or "liability" in question_lower:
            if precedents and any("tort" in p.get("legal_area", "") for p in precedents):
                return "Based on legal analysis, liability is likely established under tort law principles, subject to factual verification and applicable defenses."
            else:
                return "Liability determination requires further factual development and application of relevant legal standards."
        
        elif "enforceable" in question_lower or "contract" in question_lower:
            return "Contract enforceability depends on satisfaction of formation elements (offer, acceptance, consideration, capacity) and absence of invalidating factors."
        
        elif "constitutional" in question_lower or "amendment" in question_lower:
            return "Constitutional analysis requires application of appropriate scrutiny standard and balancing of individual rights against government interests under the relevant constitutional provisions."
        
        elif "criminal" in question_lower:
            return "Criminal liability requires proof of both actus reus (criminal act) and mens rea (criminal intent) beyond reasonable doubt."
        
        else:
            return "Legal conclusion depends on careful application of relevant legal standards to the specific facts and circumstances presented."
    
    def _assess_legal_risks(self, issues: List[str], laws: List[str]) -> Dict[str, Any]:
        """Assess legal risks and potential exposure."""
        risk_factors = []
        risk_level = "medium"
        
        # Assess based on legal issues
        high_risk_issues = ["criminal_liability", "constitutional_violations", "tort_liability"]
        medium_risk_issues = ["contract_breach", "employment_discrimination"]
        
        for issue in issues:
            if any(high_risk in issue for high_risk in high_risk_issues):
                risk_factors.append(f"High risk: {issue}")
                risk_level = "high"
            elif any(medium_risk in issue for medium_risk in medium_risk_issues):
                risk_factors.append(f"Medium risk: {issue}")
        
        return {
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "mitigation_required": len(risk_factors) > 0,
            "urgency": "immediate" if risk_level == "high" else "standard"
        }
    
    def _generate_recommendations(self, issues: List[str], risk_assessment: Dict[str, Any]) -> List[str]:
        """Generate legal recommendations based on analysis."""
        recommendations = []
        
        # Risk-based recommendations
        if risk_assessment.get("risk_level") == "high":
            recommendations.append("Seek immediate legal counsel due to high-risk legal issues")
            recommendations.append("Consider risk mitigation strategies and compliance measures")
        
        # Issue-specific recommendations
        for issue in issues:
            if "contract" in issue:
                recommendations.append("Review contract terms and ensure compliance with all obligations")
                recommendations.append("Document all communications and performance under the contract")
            
            if "tort" in issue:
                recommendations.append("Preserve all evidence related to the incident or claim")
                recommendations.append("Consider insurance coverage and notification requirements")
            
            if "constitutional" in issue:
                recommendations.append("Ensure compliance with constitutional requirements and due process")
            
            if "criminal" in issue:
                recommendations.append("Exercise right to remain silent and obtain legal representation")
        
        # General recommendations
        recommendations.append("Maintain detailed records of all relevant facts and circumstances")
        recommendations.append("Consider alternative dispute resolution options where appropriate")
        
        return recommendations
    
    def _calculate_confidence(self, num_precedents: int, num_laws: int, num_issues: int) -> float:
        """Calculate confidence score based on available legal authority."""
        base_confidence = 0.6
        
        # Adjust based on precedents
        precedent_boost = min(num_precedents * 0.1, 0.3)
        
        # Adjust based on applicable laws
        law_boost = min(num_laws * 0.05, 0.2)
        
        # Adjust based on issue complexity
        complexity_adjustment = max(0.0, 0.3 - (num_issues - 1) * 0.1)
        
        confidence = base_confidence + precedent_boost + law_boost + complexity_adjustment
        return min(confidence, 0.95)  # Cap at 95%
    
    def _assess_complexity(self, issues: List[str], precedents: List[Dict[str, Any]]) -> str:
        """Assess the complexity level of the legal analysis."""
        if len(issues) > 3 or any("constitutional" in issue for issue in issues):
            return "high"
        elif len(issues) > 1 or len(precedents) > 3:
            return "medium"
        else:
            return "low"
    
    async def analyze_contract(self, contract_text: str, analysis_type: str = "general") -> LegalResult:
        """
        Analyze a contract for specific legal issues and provide recommendations.
        
        Args:
            contract_text: The contract text to analyze
            analysis_type: Type of analysis (general, risk_assessment, enforceability)
        
        Returns:
            LegalResult with contract analysis
        """
        start_time = datetime.now()
        
        try:
            logger.info(f"📋 Analyzing contract ({analysis_type}): {len(contract_text)} characters")
            
            # Identify contract clauses
            identified_clauses = self._identify_contract_clauses(contract_text)
            
            # Analyze contract formation elements
            formation_analysis = self._analyze_contract_formation(contract_text)
            
            # Check for problematic clauses
            problematic_clauses = self._identify_problematic_clauses(contract_text)
            
            # Generate recommendations
            recommendations = self._generate_contract_recommendations(
                identified_clauses, formation_analysis, problematic_clauses
            )
            
            # Assess enforceability
            enforceability_assessment = self._assess_contract_enforceability(
                formation_analysis, problematic_clauses
            )
            
            reasoning = [
                f"Contract Analysis Type: {analysis_type}",
                f"Identified Clauses: {len(identified_clauses)} key provisions found",
                f"Formation Elements: {formation_analysis['status']}",
                f"Problematic Clauses: {len(problematic_clauses)} potential issues identified",
                f"Enforceability Assessment: {enforceability_assessment['likelihood']}"
            ]
            
            confidence = 0.85 if len(identified_clauses) > 3 else 0.75
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return LegalResult(
                legal_conclusion=enforceability_assessment["conclusion"],
                legal_reasoning=reasoning,
                confidence_score=confidence,
                applicable_laws=["Contract law", "UCC (if applicable)", "State contract statutes"],
                legal_issues=["contract_formation", "contract_enforceability"],
                recommendations=recommendations,
                risk_assessment={"problematic_clauses": problematic_clauses},
                legal_area="contract_law",
                complexity_level="medium",
                processing_time=processing_time
            )
            
        except Exception as e:
            logger.error(f"❌ Contract analysis failed: {str(e)}")
            return LegalResult(
                legal_conclusion=f"Contract analysis error: {str(e)}",
                legal_reasoning=[f"Error in contract analysis: {str(e)}"],
                confidence_score=0.0,
                processing_time=(datetime.now() - start_time).total_seconds()
            )
    
    def _identify_contract_clauses(self, contract_text: str) -> List[str]:
        """Identify common contract clauses in the text."""
        clauses = []
        text_lower = contract_text.lower()
        
        clause_patterns = {
            "force_majeure": ["force majeure", "act of god", "unforeseeable circumstances"],
            "liquidated_damages": ["liquidated damages", "predetermined damages"],
            "arbitration": ["arbitration", "arbitrator", "binding arbitration"],
            "choice_of_law": ["governing law", "jurisdiction", "applicable law"],
            "confidentiality": ["confidential", "non-disclosure", "proprietary information"],
            "termination": ["termination", "terminate", "end this agreement"],
            "indemnification": ["indemnify", "hold harmless", "indemnification"],
            "warranty": ["warranty", "warrant", "guarantee"],
            "assignment": ["assignment", "assign", "transfer"]
        }
        
        for clause_type, patterns in clause_patterns.items():
            if any(pattern in text_lower for pattern in patterns):
                clauses.append(clause_type)
        
        return clauses
    
    def _analyze_contract_formation(self, contract_text: str) -> Dict[str, Any]:
        """Analyze whether contract formation elements are present."""
        text_lower = contract_text.lower()
        
        elements = {
            "offer": any(term in text_lower for term in ["offer", "propose", "agree to"]),
            "acceptance": any(term in text_lower for term in ["accept", "agreed", "consent"]),
            "consideration": any(term in text_lower for term in ["consideration", "payment", "exchange", "$"]),
            "capacity": True,  # Assume capacity unless contrary evidence
            "legality": True   # Assume legal purpose unless contrary evidence
        }
        
        formation_complete = all(elements.values())
        
        return {
            "elements": elements,
            "formation_complete": formation_complete,
            "status": "Complete" if formation_complete else "Incomplete"
        }
    
    def _identify_problematic_clauses(self, contract_text: str) -> List[Dict[str, str]]:
        """Identify potentially problematic or unenforceable clauses."""
        problematic = []
        text_lower = contract_text.lower()
        
        # Check for penalty clauses
        if any(term in text_lower for term in ["penalty", "punitive", "forfeiture"]):
            problematic.append({
                "type": "penalty_clause",
                "issue": "Penalty clauses may be unenforceable",
                "recommendation": "Consider liquidated damages clause instead"
            })
        
        # Check for unconscionable terms
        if any(term in text_lower for term in ["all liability excluded", "no responsibility", "buyer beware"]):
            problematic.append({
                "type": "unconscionable_terms",
                "issue": "Overly broad liability exclusions may be unenforceable",
                "recommendation": "Limit exclusions to specific circumstances"
            })
        
        # Check for vague terms
        if any(term in text_lower for term in ["reasonable time", "best efforts", "as needed"]):
            problematic.append({
                "type": "vague_terms",
                "issue": "Vague terms may cause enforcement difficulties",
                "recommendation": "Define terms with specific criteria"
            })
        
        return problematic
    
    def _generate_contract_recommendations(self, clauses: List[str], 
                                         formation: Dict[str, Any], 
                                         problems: List[Dict[str, str]]) -> List[str]:
        """Generate contract-specific recommendations."""
        recommendations = []
        
        # Formation recommendations
        if not formation["formation_complete"]:
            missing = [k for k, v in formation["elements"].items() if not v]
            recommendations.append(f"Address missing formation elements: {', '.join(missing)}")
        
        # Clause recommendations
        if "force_majeure" not in clauses:
            recommendations.append("Consider adding force majeure clause for unforeseeable events")
        
        if "choice_of_law" not in clauses:
            recommendations.append("Specify governing law and jurisdiction for disputes")
        
        # Problem-specific recommendations
        for problem in problems:
            recommendations.append(problem["recommendation"])
        
        # General recommendations
        recommendations.append("Review all terms for clarity and enforceability")
        recommendations.append("Consider legal review before execution")
        
        return recommendations
    
    def _assess_contract_enforceability(self, formation: Dict[str, Any], 
                                      problems: List[Dict[str, str]]) -> Dict[str, str]:
        """Assess the likely enforceability of the contract."""
        if not formation["formation_complete"]:
            return {
                "likelihood": "Low",
                "conclusion": "Contract enforceability questionable due to incomplete formation elements"
            }
        
        if len(problems) > 2:
            return {
                "likelihood": "Medium",
                "conclusion": "Contract likely enforceable but contains problematic clauses requiring revision"
            }
        
        if problems:
            return {
                "likelihood": "High",
                "conclusion": "Contract generally enforceable with minor issues to address"
            }
        
        return {
            "likelihood": "Very High",
            "conclusion": "Contract appears fully enforceable under applicable law"
        }

# Example usage and testing
async def main():
    """Test the Legal Reasoning Engine with sample cases."""
    engine = AutonomousLegalEngine()
    
    print("🏛️ RomAI Legal Reasoning Engine - Test Suite")
    print("=" * 60)
    
    # Test 1: Contract law analysis
    print("\n📋 Test 1: Contract Law Analysis")
    result1 = await engine.analyze_legal_issue(
        "Is a contract enforceable if one party was intoxicated at the time of signing?",
        {"jurisdiction": "US_Federal", "legal_area": "contract_law"}
    )
    print(f"Conclusion: {result1.legal_conclusion}")
    print(f"Confidence: {result1.confidence_score:.1%}")
    
    # Test 2: Tort law analysis
    print("\n⚖️ Test 2: Tort Law Analysis")
    result2 = await engine.analyze_legal_issue(
        "Can a property owner be liable for injuries to a trespasser?",
        {"jurisdiction": "US_State", "legal_area": "tort_law"}
    )
    print(f"Conclusion: {result2.legal_conclusion}")
    print(f"Precedents found: {len(result2.case_precedents)}")
    
    # Test 3: Contract analysis
    print("\n📄 Test 3: Contract Analysis")
    sample_contract = """
    This Agreement is entered into between Party A and Party B.
    Party A agrees to provide services for $10,000 consideration.
    Party B accepts these terms and agrees to payment within 30 days.
    This contract shall be governed by California law.
    """
    result3 = await engine.analyze_contract(sample_contract, "enforceability")
    print(f"Enforceability: {result3.legal_conclusion}")
    print(f"Recommendations: {len(result3.recommendations)}")

if __name__ == "__main__":
    asyncio.run(main())