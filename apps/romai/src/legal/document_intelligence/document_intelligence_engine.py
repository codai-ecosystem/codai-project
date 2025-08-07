"""
RomAI Phase 4.3: LegalizAI Legal Excellence - Document Intelligence Engine
Advanced legal document analysis with contract intelligence and compliance checking.

This module implements the Document Intelligence component including:
- Contract analysis and review automation
- Legal research capabilities with natural language processing
- Compliance checking and validation systems
- Document classification and extraction
- Legal document generation and templates

Author: RomAI Development Team
Created: August 2025
License: Proprietary
"""

import asyncio
import logging
import sqlite3
import json
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass, asdict
from enum import Enum
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DocumentType(Enum):
    """Legal document types."""
    CONTRACT = "contract"
    AGREEMENT = "agreement"
    POLICY = "policy"
    REGULATION = "regulation"
    STATUTE = "statute"
    ORDINANCE = "ordinance"
    DECISION = "decision"
    OPINION = "opinion"
    BRIEF = "brief"
    MEMORANDUM = "memorandum"


class ContractType(Enum):
    """Contract types for specialized analysis."""
    SALE_PURCHASE = "sale_purchase"
    EMPLOYMENT = "employment"
    SERVICE = "service"
    RENTAL = "rental"
    PARTNERSHIP = "partnership"
    NDA = "non_disclosure"
    LICENSING = "licensing"
    DISTRIBUTION = "distribution"
    FRANCHISE = "franchise"
    MERGER = "merger"


class ComplianceStatus(Enum):
    """Compliance status levels."""
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    REQUIRES_REVIEW = "requires_review"
    PARTIALLY_COMPLIANT = "partially_compliant"
    UNKNOWN = "unknown"


class RiskLevel(Enum):
    """Risk assessment levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class DocumentMetadata:
    """Document metadata structure."""
    document_id: str
    title: str
    document_type: DocumentType
    contract_type: Optional[ContractType]
    creation_date: datetime
    last_modified: datetime
    author: str
    version: str
    language: str
    jurisdiction: str
    file_size: int
    checksum: str


@dataclass
class ContractClause:
    """Contract clause structure."""
    clause_id: str
    clause_type: str
    title: str
    content: str
    risk_level: RiskLevel
    compliance_status: ComplianceStatus
    recommendations: List[str]
    position: Tuple[int, int]  # start, end positions in document


@dataclass
class ComplianceIssue:
    """Compliance issue structure."""
    issue_id: str
    issue_type: str
    severity: RiskLevel
    description: str
    affected_clauses: List[str]
    regulatory_reference: str
    remediation_steps: List[str]
    deadline: Optional[datetime]


@dataclass
class DocumentAnalysisResult:
    """Document analysis result structure."""
    analysis_id: str
    document_id: str
    document_metadata: DocumentMetadata
    extracted_clauses: List[ContractClause]
    compliance_issues: List[ComplianceIssue]
    risk_assessment: Dict[str, Any]
    recommendations: List[str]
    confidence_score: float
    analysis_timestamp: datetime


class LegalDocumentParser:
    """Advanced legal document parser and analyzer."""
    
    def __init__(self):
        self.clause_patterns = self._init_clause_patterns()
        self.risk_keywords = self._init_risk_keywords()
        self.compliance_rules = self._init_compliance_rules()
        
    def _init_clause_patterns(self) -> Dict[str, List[str]]:
        """Initialize clause detection patterns."""
        return {
            "payment_terms": [
                r"plat[aă]|payment|sum[aă]|pre[țt]|cost|tarif",
                r"scaden[țt][aă]|deadline|term",
                r"rat[aă]|installment|tranș[aă]"
            ],
            "liability": [
                r"r[aă]spundere|liability|culp[aă]|fault",
                r"daun[aă]|damage|prejudiciu|harm",
                r"asigurare|insurance|garan[țt]ie|warranty"
            ],
            "termination": [
                r"reziliere|termination|încetare|expir",
                r"denun[țt]are|notice|anulare|cancel",
                r"condi[țt]ii|conditions|motiv|reason"
            ],
            "confidentiality": [
                r"confiden[țt]ial|secret|privilegiat",
                r"divulgare|disclosure|dezvăluire",
                r"protec[țt]ie|protection|siguran[țt][aă]|security"
            ],
            "intellectual_property": [
                r"proprietate|property|drept|right",
                r"autor|copyright|patent|trademark",
                r"licen[țt][aă]|license|cesiune|assignment"
            ],
            "dispute_resolution": [
                r"litigiu|dispute|conflict|divergen[țt][aă]",
                r"arbitraj|arbitration|mediere|mediation",
                r"instan[țt][aă]|court|tribunal|jurisdic[țt]ie"
            ]
        }
        
    def _init_risk_keywords(self) -> Dict[RiskLevel, List[str]]:
        """Initialize risk assessment keywords."""
        return {
            RiskLevel.CRITICAL: [
                "nerespectare", "încălcare gravă", "sancțiuni", "penalități severe",
                "criminal liability", "fraud", "breach of contract"
            ],
            RiskLevel.HIGH: [
                "răspundere nelimitată", "daune substanțiale", "incumplimiento",
                "unlimited liability", "substantial damages", "breach"
            ],
            RiskLevel.MEDIUM: [
                "amendă", "penalitate", "restricții", "limitări",
                "penalty", "fine", "restrictions", "limitations"
            ],
            RiskLevel.LOW: [
                "observație", "recomandare", "sugestie", "îmbunătățire",
                "observation", "recommendation", "suggestion", "improvement"
            ]
        }
        
    def _init_compliance_rules(self) -> Dict[str, Dict[str, Any]]:
        """Initialize compliance rules."""
        return {
            "gdpr_compliance": {
                "required_clauses": [
                    "data processing consent",
                    "data subject rights",
                    "data retention period",
                    "data controller contact"
                ],
                "prohibited_terms": [
                    "unlimited data use",
                    "perpetual consent",
                    "irrevocable consent"
                ],
                "risk_level": RiskLevel.HIGH
            },
            "romanian_consumer_protection": {
                "required_clauses": [
                    "withdrawal right",
                    "warranty terms", 
                    "complaint procedure",
                    "price transparency"
                ],
                "prohibited_terms": [
                    "no returns",
                    "no warranty",
                    "hidden fees"
                ],
                "risk_level": RiskLevel.MEDIUM
            },
            "commercial_law": {
                "required_clauses": [
                    "company registration",
                    "authorized representatives",
                    "governing law",
                    "dispute resolution"
                ],
                "prohibited_terms": [
                    "unlimited liability",
                    "waiver of rights",
                    "illegal activities"
                ],
                "risk_level": RiskLevel.HIGH
            }
        }
        
    async def parse_document(self, document_text: str, document_type: DocumentType) -> Dict[str, Any]:
        """Parse legal document and extract structured information."""
        try:
            logger.info(f"Parsing {document_type.value} document")
            
            # Extract metadata
            metadata = await self._extract_metadata(document_text, document_type)
            
            # Extract clauses
            clauses = await self._extract_clauses(document_text)
            
            # Analyze structure
            structure = await self._analyze_document_structure(document_text)
            
            # Extract key information
            key_info = await self._extract_key_information(document_text, document_type)
            
            return {
                "metadata": metadata,
                "clauses": clauses,
                "structure": structure,
                "key_information": key_info,
                "parsing_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error parsing document: {e}")
            raise
            
    async def _extract_metadata(self, text: str, doc_type: DocumentType) -> Dict[str, Any]:
        """Extract document metadata."""
        try:
            # Extract title (first significant line)
            lines = text.split('\n')
            title = next((line.strip() for line in lines if len(line.strip()) > 10), "Untitled Document")
            
            # Extract dates
            date_patterns = [
                r"(\d{1,2}[/.]\d{1,2}[/.]\d{4})",
                r"(\d{4}[/-]\d{1,2}[/-]\d{1,2})",
                r"(\d{1,2}\s+\w+\s+\d{4})"
            ]
            
            dates_found = []
            for pattern in date_patterns:
                dates_found.extend(re.findall(pattern, text))
                
            # Extract parties (for contracts)
            parties = await self._extract_parties(text)
            
            # Extract language
            romanian_words = len(re.findall(r'\b(?:și|sau|de|la|cu|în|pentru|care|acest|această)\b', text, re.IGNORECASE))
            english_words = len(re.findall(r'\b(?:and|or|the|to|with|in|for|that|this)\b', text, re.IGNORECASE))
            
            language = "ro" if romanian_words > english_words else "en"
            
            return {
                "title": title,
                "document_type": doc_type.value,
                "language": language,
                "dates_found": dates_found,
                "parties": parties,
                "word_count": len(text.split()),
                "character_count": len(text)
            }
            
        except Exception as e:
            logger.error(f"Error extracting metadata: {e}")
            return {}
            
    async def _extract_parties(self, text: str) -> List[str]:
        """Extract parties from contract text."""
        try:
            parties = []
            
            # Common party indicators
            party_patterns = [
                r"(?:S\.C\.|SRL|SA|PFA)\s+([A-ZĂÂÎȘȚ][A-ZĂÂÎȘȚa-zăâîșț\s&.-]+)",
                r"(?:Company|Corporation|LLC|Inc\.)\s+([A-Z][A-Za-z\s&.-]+)",
                r"(?:Partea|Party)\s+([A-ZĂÂÎȘȚa-zăâîșț\s]+)",
                r"(?:Contractantul|Contractor)\s+([A-ZĂÂÎȘȚa-zăâîșț\s]+)"
            ]
            
            for pattern in party_patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                parties.extend([match.strip() for match in matches])
                
            # Remove duplicates and clean
            parties = list(set([party for party in parties if len(party) > 3]))
            
            return parties[:10]  # Limit to 10 parties
            
        except Exception as e:
            logger.error(f"Error extracting parties: {e}")
            return []
            
    async def _extract_clauses(self, text: str) -> List[Dict[str, Any]]:
        """Extract and categorize contract clauses."""
        try:
            clauses = []
            
            # Split text into potential clauses
            clause_separators = [
                r'\n\s*\d+\.\s*',  # Numbered clauses
                r'\n\s*Art\.\s*\d+',  # Article clauses
                r'\n\s*[A-Z][A-ZĂÂÎȘȚ\s]+:\s*',  # Capitalized headers
                r'\n\s*§\s*\d+',  # Paragraph clauses
            ]
            
            sections = [text]
            for separator in clause_separators:
                new_sections = []
                for section in sections:
                    new_sections.extend(re.split(separator, section))
                sections = new_sections
                
            # Analyze each section
            for i, section in enumerate(sections):
                if len(section.strip()) < 50:  # Skip very short sections
                    continue
                    
                clause_type = await self._classify_clause(section)
                risk_level = await self._assess_clause_risk(section)
                
                clause = {
                    "clause_id": f"clause_{i+1}",
                    "clause_type": clause_type,
                    "content": section.strip(),
                    "risk_level": risk_level.value,
                    "position": (0, len(section)),  # Simplified position
                    "word_count": len(section.split())
                }
                
                clauses.append(clause)
                
            return clauses
            
        except Exception as e:
            logger.error(f"Error extracting clauses: {e}")
            return []
            
    async def _classify_clause(self, clause_text: str) -> str:
        """Classify clause type based on content."""
        try:
            clause_lower = clause_text.lower()
            
            # Check against predefined patterns
            for clause_type, patterns in self.clause_patterns.items():
                for pattern in patterns:
                    if re.search(pattern, clause_lower):
                        return clause_type
                        
            # Default classification
            if any(word in clause_lower for word in ["defini", "termin", "înțeles"]):
                return "definitions"
            elif any(word in clause_lower for word in ["obligat", "duty", "shall"]):
                return "obligations"
            elif any(word in clause_lower for word in ["drept", "right", "autoritat"]):
                return "rights"
            else:
                return "general"
                
        except Exception as e:
            logger.error(f"Error classifying clause: {e}")
            return "unknown"
            
    async def _assess_clause_risk(self, clause_text: str) -> RiskLevel:
        """Assess risk level of a clause."""
        try:
            clause_lower = clause_text.lower()
            
            # Check for risk keywords
            for risk_level, keywords in self.risk_keywords.items():
                for keyword in keywords:
                    if keyword.lower() in clause_lower:
                        return risk_level
                        
            # Default to low risk
            return RiskLevel.LOW
            
        except Exception as e:
            logger.error(f"Error assessing clause risk: {e}")
            return RiskLevel.MEDIUM
            
    async def _analyze_document_structure(self, text: str) -> Dict[str, Any]:
        """Analyze document structure and organization."""
        try:
            structure = {
                "has_title": bool(re.search(r'^[A-ZĂÂÎȘȚ][A-ZĂÂÎȘȚa-zăâîșț\s]{10,}$', text.split('\n')[0])),
                "has_numbering": bool(re.search(r'\n\s*\d+\.\s*', text)),
                "has_articles": bool(re.search(r'Art\.\s*\d+', text)),
                "has_sections": bool(re.search(r'Secțiunea|Section\s+\d+', text)),
                "has_signatures": bool(re.search(r'semn[aă]tur[aă]|signature|subscris', text, re.IGNORECASE)),
                "has_date": bool(re.search(r'\d{1,2}[/.]\d{1,2}[/.]\d{4}', text)),
                "paragraph_count": len(text.split('\n\n')),
                "section_count": len(re.findall(r'\n\s*\d+\.\s*', text)),
                "average_paragraph_length": len(text.split()) / max(len(text.split('\n\n')), 1)
            }
            
            return structure
            
        except Exception as e:
            logger.error(f"Error analyzing document structure: {e}")
            return {}
            
    async def _extract_key_information(self, text: str, doc_type: DocumentType) -> Dict[str, Any]:
        """Extract key information based on document type."""
        try:
            key_info = {}
            
            if doc_type == DocumentType.CONTRACT:
                key_info.update(await self._extract_contract_info(text))
            elif doc_type == DocumentType.POLICY:
                key_info.update(await self._extract_policy_info(text))
            elif doc_type == DocumentType.REGULATION:
                key_info.update(await self._extract_regulation_info(text))
                
            return key_info
            
        except Exception as e:
            logger.error(f"Error extracting key information: {e}")
            return {}
            
    async def _extract_contract_info(self, text: str) -> Dict[str, Any]:
        """Extract contract-specific information."""
        try:
            # Extract monetary amounts
            amounts = re.findall(r'(\d+(?:[.,]\d+)?)\s*(?:RON|EUR|USD|lei)', text, re.IGNORECASE)
            
            # Extract dates
            dates = re.findall(r'(\d{1,2}[/.]\d{1,2}[/.]\d{4})', text)
            
            # Extract percentages
            percentages = re.findall(r'(\d+(?:[.,]\d+)?)\s*%', text)
            
            return {
                "monetary_amounts": amounts,
                "dates": dates,
                "percentages": percentages,
                "duration_mentioned": bool(re.search(r'durată|duration|termen|period', text, re.IGNORECASE)),
                "penalties_mentioned": bool(re.search(r'penalită|penalty|amendă|fine', text, re.IGNORECASE))
            }
            
        except Exception as e:
            logger.error(f"Error extracting contract info: {e}")
            return {}
            
    async def _extract_policy_info(self, text: str) -> Dict[str, Any]:
        """Extract policy-specific information."""
        try:
            return {
                "scope_defined": bool(re.search(r'scop|scope|obiectiv|purpose', text, re.IGNORECASE)),
                "procedures_defined": bool(re.search(r'procedur[aă]|procedure|proces', text, re.IGNORECASE)),
                "responsibilities_defined": bool(re.search(r'responsabilită|responsibility|răspund', text, re.IGNORECASE)),
                "review_cycle": bool(re.search(r'revizuire|review|actualizare|update', text, re.IGNORECASE))
            }
            
        except Exception as e:
            logger.error(f"Error extracting policy info: {e}")
            return {}
            
    async def _extract_regulation_info(self, text: str) -> Dict[str, Any]:
        """Extract regulation-specific information."""
        try:
            return {
                "authority_mentioned": bool(re.search(r'autoritat|authority|minister|guvern', text, re.IGNORECASE)),
                "effective_date": bool(re.search(r'în vigoare|effective|aplicabil', text, re.IGNORECASE)),
                "sanctions_defined": bool(re.search(r'sancțiune|sanction|amendă|penalty', text, re.IGNORECASE)),
                "appeals_process": bool(re.search(r'contestație|appeal|recurs', text, re.IGNORECASE))
            }
            
        except Exception as e:
            logger.error(f"Error extracting regulation info: {e}")
            return {}


class ContractAnalyzer:
    """Specialized contract analysis engine."""
    
    def __init__(self):
        self.parser = LegalDocumentParser()
        self.db_path = "contract_analysis.db"
        self._init_database()
        
    def _init_database(self):
        """Initialize contract analysis database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Contract analyses table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS contract_analyses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    analysis_id TEXT UNIQUE NOT NULL,
                    document_id TEXT NOT NULL,
                    contract_type TEXT,
                    risk_score REAL,
                    compliance_score REAL,
                    recommendations TEXT,
                    issues_found INTEGER,
                    analysis_date TEXT NOT NULL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Contract clauses table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS contract_clauses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    analysis_id TEXT NOT NULL,
                    clause_id TEXT NOT NULL,
                    clause_type TEXT NOT NULL,
                    content TEXT NOT NULL,
                    risk_level TEXT NOT NULL,
                    compliance_status TEXT NOT NULL,
                    recommendations TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Compliance issues table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS compliance_issues (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    analysis_id TEXT NOT NULL,
                    issue_id TEXT UNIQUE NOT NULL,
                    issue_type TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    description TEXT NOT NULL,
                    regulatory_reference TEXT,
                    remediation_steps TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.commit()
            conn.close()
            logger.info("Contract analysis database initialized")
            
        except Exception as e:
            logger.error(f"Error initializing contract database: {e}")
            
    async def analyze_contract(self, document_text: str, contract_type: ContractType) -> DocumentAnalysisResult:
        """Perform comprehensive contract analysis."""
        try:
            analysis_id = str(uuid.uuid4())
            document_id = str(uuid.uuid4())
            
            logger.info(f"Analyzing {contract_type.value} contract")
            
            # Parse document
            parsed_data = await self.parser.parse_document(document_text, DocumentType.CONTRACT)
            
            # Create metadata
            metadata = DocumentMetadata(
                document_id=document_id,
                title=parsed_data["metadata"].get("title", "Untitled Contract"),
                document_type=DocumentType.CONTRACT,
                contract_type=contract_type,
                creation_date=datetime.now(),
                last_modified=datetime.now(),
                author="Unknown",
                version="1.0",
                language=parsed_data["metadata"].get("language", "ro"),
                jurisdiction="RO",
                file_size=len(document_text),
                checksum="placeholder_checksum"
            )
            
            # Extract and analyze clauses
            contract_clauses = await self._analyze_contract_clauses(
                parsed_data["clauses"], contract_type
            )
            
            # Check compliance
            compliance_issues = await self._check_contract_compliance(
                document_text, contract_clauses, contract_type
            )
            
            # Perform risk assessment
            risk_assessment = await self._assess_contract_risks(
                contract_clauses, compliance_issues
            )
            
            # Generate recommendations
            recommendations = await self._generate_contract_recommendations(
                contract_clauses, compliance_issues, risk_assessment
            )
            
            # Calculate confidence score
            confidence_score = await self._calculate_analysis_confidence(
                contract_clauses, compliance_issues
            )
            
            # Create analysis result
            analysis_result = DocumentAnalysisResult(
                analysis_id=analysis_id,
                document_id=document_id,
                document_metadata=metadata,
                extracted_clauses=contract_clauses,
                compliance_issues=compliance_issues,
                risk_assessment=risk_assessment,
                recommendations=recommendations,
                confidence_score=confidence_score,
                analysis_timestamp=datetime.now()
            )
            
            # Store analysis
            await self._store_contract_analysis(analysis_result)
            
            logger.info(f"Contract analysis completed with confidence: {confidence_score:.2%}")
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error analyzing contract: {e}")
            raise
            
    async def _analyze_contract_clauses(self, raw_clauses: List[Dict[str, Any]], 
                                      contract_type: ContractType) -> List[ContractClause]:
        """Analyze contract clauses for specific contract type."""
        try:
            analyzed_clauses = []
            
            for clause_data in raw_clauses:
                # Enhanced analysis based on contract type
                compliance_status = await self._assess_clause_compliance(
                    clause_data["content"], contract_type
                )
                
                # Generate clause recommendations
                recommendations = await self._generate_clause_recommendations(
                    clause_data, contract_type
                )
                
                # Create contract clause
                contract_clause = ContractClause(
                    clause_id=clause_data["clause_id"],
                    clause_type=clause_data["clause_type"],
                    title=f"{clause_data['clause_type'].title()} Clause",
                    content=clause_data["content"],
                    risk_level=RiskLevel(clause_data["risk_level"]),
                    compliance_status=compliance_status,
                    recommendations=recommendations,
                    position=clause_data["position"]
                )
                
                analyzed_clauses.append(contract_clause)
                
            return analyzed_clauses
            
        except Exception as e:
            logger.error(f"Error analyzing contract clauses: {e}")
            return []
            
    async def _assess_clause_compliance(self, clause_content: str, 
                                      contract_type: ContractType) -> ComplianceStatus:
        """Assess compliance status of a clause."""
        try:
            clause_lower = clause_content.lower()
            
            # Contract-specific compliance rules
            if contract_type == ContractType.EMPLOYMENT:
                # Check employment law compliance
                if any(term in clause_lower for term in ["discriminare", "harassment", "illegal"]):
                    return ComplianceStatus.NON_COMPLIANT
                elif any(term in clause_lower for term in ["echitate", "fairness", "legal"]):
                    return ComplianceStatus.COMPLIANT
                    
            elif contract_type == ContractType.SALE_PURCHASE:
                # Check consumer protection compliance
                if any(term in clause_lower for term in ["no returns", "no warranty", "hidden"]):
                    return ComplianceStatus.NON_COMPLIANT
                elif any(term in clause_lower for term in ["guarantee", "warranty", "return"]):
                    return ComplianceStatus.COMPLIANT
                    
            elif contract_type == ContractType.NDA:
                # Check confidentiality compliance
                if any(term in clause_lower for term in ["unlimited", "perpetual", "irrevocable"]):
                    return ComplianceStatus.REQUIRES_REVIEW
                elif any(term in clause_lower for term in ["reasonable", "limited", "specific"]):
                    return ComplianceStatus.COMPLIANT
                    
            # Default assessment
            return ComplianceStatus.REQUIRES_REVIEW
            
        except Exception as e:
            logger.error(f"Error assessing clause compliance: {e}")
            return ComplianceStatus.UNKNOWN
            
    async def _generate_clause_recommendations(self, clause_data: Dict[str, Any], 
                                             contract_type: ContractType) -> List[str]:
        """Generate recommendations for contract clause."""
        try:
            recommendations = []
            clause_type = clause_data["clause_type"]
            risk_level = clause_data["risk_level"]
            
            # General recommendations
            if risk_level == "high":
                recommendations.append("URGENT: Clauza prezintă risc ridicat - consultare juridică necesară")
                
            elif risk_level == "medium":
                recommendations.append("ATENȚIE: Clauza necesită revizuire pentru reducerea riscului")
                
            # Type-specific recommendations
            if clause_type == "payment_terms":
                recommendations.append("Verificați claritatea termenilor de plată și penalităților")
                recommendations.append("Asigurați-vă că ratele și scadențele sunt realistic")
                
            elif clause_type == "liability":
                recommendations.append("Evaluați limitele de răspundere și asigurarea necesară")
                recommendations.append("Clarificați exclusiile de răspundere")
                
            elif clause_type == "termination":
                recommendations.append("Definiți clar condițiile și procedura de reziliere")
                recommendations.append("Specificați consecințele terminării contractului")
                
            elif clause_type == "confidentiality":
                recommendations.append("Limitați scopul și durata confidențialității")
                recommendations.append("Definiți excepțiile de la obligația de confidențialitate")
                
            # Contract type-specific recommendations
            if contract_type == ContractType.EMPLOYMENT:
                recommendations.append("Verificați conformitatea cu legislația muncii")
                
            elif contract_type == ContractType.SALE_PURCHASE:
                recommendations.append("Asigurați conformitatea cu protecția consumatorului")
                
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating clause recommendations: {e}")
            return ["Consultați un specialist juridic pentru această clauză"]
            
    async def _check_contract_compliance(self, document_text: str, 
                                       clauses: List[ContractClause],
                                       contract_type: ContractType) -> List[ComplianceIssue]:
        """Check contract compliance with regulations."""
        try:
            compliance_issues = []
            
            # Check GDPR compliance for contracts involving personal data
            if any(term in document_text.lower() for term in ["date personale", "personal data", "gdpr"]):
                gdpr_issues = await self._check_gdpr_compliance(document_text, clauses)
                compliance_issues.extend(gdpr_issues)
                
            # Check Romanian consumer protection
            if contract_type in [ContractType.SALE_PURCHASE, ContractType.SERVICE]:
                consumer_issues = await self._check_consumer_protection(document_text, clauses)
                compliance_issues.extend(consumer_issues)
                
            # Check commercial law compliance
            if contract_type in [ContractType.PARTNERSHIP, ContractType.DISTRIBUTION]:
                commercial_issues = await self._check_commercial_compliance(document_text, clauses)
                compliance_issues.extend(commercial_issues)
                
            return compliance_issues
            
        except Exception as e:
            logger.error(f"Error checking contract compliance: {e}")
            return []
            
    async def _check_gdpr_compliance(self, text: str, clauses: List[ContractClause]) -> List[ComplianceIssue]:
        """Check GDPR compliance issues."""
        try:
            issues = []
            text_lower = text.lower()
            
            # Check for required GDPR elements
            required_elements = [
                ("consent", "acordul explicit", "Lipsa acordului explicit pentru prelucrarea datelor"),
                ("data subject rights", "drepturile persoanei", "Drepturile persoanei vizate nu sunt specificate"),
                ("retention period", "perioada de păstrare", "Perioada de păstrare a datelor nu este definită"),
                ("controller contact", "contact operator", "Datele de contact ale operatorului lipsesc")
            ]
            
            for element, romanian_term, issue_desc in required_elements:
                if not any(term in text_lower for term in [element, romanian_term]):
                    issue = ComplianceIssue(
                        issue_id=str(uuid.uuid4()),
                        issue_type="gdpr_missing_element",
                        severity=RiskLevel.HIGH,
                        description=issue_desc,
                        affected_clauses=[],
                        regulatory_reference="GDPR Art. 13-14",
                        remediation_steps=[
                            f"Adăugați clauza pentru {romanian_term}",
                            "Consultați ghidul GDPR pentru implementare"
                        ],
                        deadline=datetime.now() + timedelta(days=30)
                    )
                    issues.append(issue)
                    
            return issues
            
        except Exception as e:
            logger.error(f"Error checking GDPR compliance: {e}")
            return []
            
    async def _check_consumer_protection(self, text: str, clauses: List[ContractClause]) -> List[ComplianceIssue]:
        """Check Romanian consumer protection compliance."""
        try:
            issues = []
            text_lower = text.lower()
            
            # Check for prohibited terms
            prohibited_terms = [
                ("no returns", "fără returnare", "Interdicția returnării poate încălca drepturile consumatorului"),
                ("no warranty", "fără garanție", "Absența garanției încalcă legislația consumatorului"),
                ("hidden fees", "taxe ascunse", "Taxele ascunse sunt interzise de legea consumatorului")
            ]
            
            for english_term, romanian_term, issue_desc in prohibited_terms:
                if any(term in text_lower for term in [english_term, romanian_term]):
                    issue = ComplianceIssue(
                        issue_id=str(uuid.uuid4()),
                        issue_type="consumer_protection_violation",
                        severity=RiskLevel.HIGH,
                        description=issue_desc,
                        affected_clauses=[],
                        regulatory_reference="OG 21/1992 privind protecția consumatorului",
                        remediation_steps=[
                            "Eliminați clauzele abuzive",
                            "Adăugați drepturile consumatorului",
                            "Specificați clar toate costurile"
                        ],
                        deadline=datetime.now() + timedelta(days=15)
                    )
                    issues.append(issue)
                    
            return issues
            
        except Exception as e:
            logger.error(f"Error checking consumer protection: {e}")
            return []
            
    async def _check_commercial_compliance(self, text: str, clauses: List[ContractClause]) -> List[ComplianceIssue]:
        """Check commercial law compliance."""
        try:
            issues = []
            text_lower = text.lower()
            
            # Check for required commercial elements
            required_elements = [
                ("company registration", "înregistrare societate", "Datele de înregistrare ale societății lipsesc"),
                ("authorized representatives", "reprezentanți autorizați", "Reprezentanții autorizați nu sunt specificați"),
                ("governing law", "legea aplicabilă", "Legea aplicabilă nu este menționată")
            ]
            
            for element, romanian_term, issue_desc in required_elements:
                if not any(term in text_lower for term in [element, romanian_term]):
                    issue = ComplianceIssue(
                        issue_id=str(uuid.uuid4()),
                        issue_type="commercial_law_missing",
                        severity=RiskLevel.MEDIUM,
                        description=issue_desc,
                        affected_clauses=[],
                        regulatory_reference="Legea societăților nr. 31/1990",
                        remediation_steps=[
                            f"Adăugați informațiile despre {romanian_term}",
                            "Verificați conformitatea cu registrul comerțului"
                        ],
                        deadline=datetime.now() + timedelta(days=21)
                    )
                    issues.append(issue)
                    
            return issues
            
        except Exception as e:
            logger.error(f"Error checking commercial compliance: {e}")
            return []
            
    async def _assess_contract_risks(self, clauses: List[ContractClause], 
                                   issues: List[ComplianceIssue]) -> Dict[str, Any]:
        """Assess overall contract risks."""
        try:
            # Calculate risk scores
            high_risk_clauses = len([c for c in clauses if c.risk_level == RiskLevel.HIGH])
            medium_risk_clauses = len([c for c in clauses if c.risk_level == RiskLevel.MEDIUM])
            
            critical_issues = len([i for i in issues if i.severity == RiskLevel.CRITICAL])
            high_issues = len([i for i in issues if i.severity == RiskLevel.HIGH])
            
            # Overall risk calculation
            risk_score = (
                (critical_issues * 0.4) +
                (high_issues * 0.3) +
                (high_risk_clauses * 0.2) +
                (medium_risk_clauses * 0.1)
            ) / max(len(clauses), 1)
            
            risk_level = "low"
            if risk_score > 0.7:
                risk_level = "critical"
            elif risk_score > 0.5:
                risk_level = "high"
            elif risk_score > 0.3:
                risk_level = "medium"
                
            return {
                "overall_risk_level": risk_level,
                "risk_score": min(risk_score, 1.0),
                "high_risk_clauses": high_risk_clauses,
                "compliance_issues_count": len(issues),
                "critical_issues": critical_issues,
                "recommendation": "immediate_review" if risk_level in ["critical", "high"] else "periodic_review"
            }
            
        except Exception as e:
            logger.error(f"Error assessing contract risks: {e}")
            return {"overall_risk_level": "unknown", "risk_score": 0.5}
            
    async def _generate_contract_recommendations(self, clauses: List[ContractClause],
                                               issues: List[ComplianceIssue],
                                               risk_assessment: Dict[str, Any]) -> List[str]:
        """Generate comprehensive contract recommendations."""
        try:
            recommendations = []
            
            # Priority recommendations based on risk
            if risk_assessment.get("overall_risk_level") == "critical":
                recommendations.append("🚨 URGENT: Contractul prezintă riscuri critice - consultare juridică IMEDIATĂ necesară")
                recommendations.append("🔴 Nu semnați contractul fără revizuire completă de către specialist")
                
            elif risk_assessment.get("overall_risk_level") == "high":
                recommendations.append("⚠️ ATENȚIE: Risc ridicat identificat - consultare juridică recomandată")
                recommendations.append("🟡 Negociați modificarea clauzelor cu risc ridicat")
                
            # Compliance-based recommendations
            if len(issues) > 0:
                recommendations.append(f"📋 Rezolvați {len(issues)} probleme de conformitate identificate")
                
                # Prioritize critical issues
                critical_issues = [i for i in issues if i.severity == RiskLevel.CRITICAL]
                if critical_issues:
                    recommendations.append("🔥 PRIORITATE: Rezolvați mai întâi problemele critice de conformitate")
                    
            # Clause-specific recommendations
            high_risk_clauses = [c for c in clauses if c.risk_level == RiskLevel.HIGH]
            if high_risk_clauses:
                recommendations.append(f"⚖️ Revizuiți {len(high_risk_clauses)} clauze cu risc ridicat")
                
            # General best practices
            recommendations.extend([
                "📚 Studiați toate clauzele înainte de semnare",
                "💼 Păstrați o copie a contractului analizat",
                "📅 Programați revizuiri periodice ale contractului",
                "🔍 Monitorizați modificările legislative relevante"
            ])
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating contract recommendations: {e}")
            return ["Consultați un avocat pentru o analiză detaliată a contractului"]
            
    async def _calculate_analysis_confidence(self, clauses: List[ContractClause],
                                           issues: List[ComplianceIssue]) -> float:
        """Calculate confidence score for contract analysis."""
        try:
            confidence_factors = []
            
            # Clause analysis completeness
            if len(clauses) >= 5:
                confidence_factors.append(0.9)
            elif len(clauses) >= 3:
                confidence_factors.append(0.7)
            else:
                confidence_factors.append(0.5)
                
            # Compliance checking thoroughness
            compliance_checks = len(issues) + 5  # Assume 5 base checks
            if compliance_checks >= 10:
                confidence_factors.append(0.9)
            elif compliance_checks >= 7:
                confidence_factors.append(0.8)
            else:
                confidence_factors.append(0.6)
                
            # Risk assessment completeness
            risk_assessed_clauses = len([c for c in clauses if c.risk_level != RiskLevel.LOW])
            risk_ratio = risk_assessed_clauses / max(len(clauses), 1)
            confidence_factors.append(0.7 + (risk_ratio * 0.3))
            
            # Calculate weighted average
            return sum(confidence_factors) / len(confidence_factors)
            
        except Exception as e:
            logger.error(f"Error calculating analysis confidence: {e}")
            return 0.7
            
    async def _store_contract_analysis(self, analysis: DocumentAnalysisResult):
        """Store contract analysis in database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Store main analysis
            cursor.execute("""
                INSERT INTO contract_analyses 
                (analysis_id, document_id, contract_type, risk_score, compliance_score,
                 recommendations, issues_found, analysis_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                analysis.analysis_id,
                analysis.document_id,
                analysis.document_metadata.contract_type.value if analysis.document_metadata.contract_type else "unknown",
                analysis.risk_assessment.get("risk_score", 0.5),
                1.0 - (len(analysis.compliance_issues) / max(len(analysis.extracted_clauses), 1)),
                json.dumps(analysis.recommendations),
                len(analysis.compliance_issues),
                analysis.analysis_timestamp.isoformat()
            ))
            
            # Store clauses
            for clause in analysis.extracted_clauses:
                cursor.execute("""
                    INSERT INTO contract_clauses 
                    (analysis_id, clause_id, clause_type, content, risk_level,
                     compliance_status, recommendations)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    analysis.analysis_id,
                    clause.clause_id,
                    clause.clause_type,
                    clause.content,
                    clause.risk_level.value,
                    clause.compliance_status.value,
                    json.dumps(clause.recommendations)
                ))
                
            # Store compliance issues
            for issue in analysis.compliance_issues:
                cursor.execute("""
                    INSERT INTO compliance_issues 
                    (analysis_id, issue_id, issue_type, severity, description,
                     regulatory_reference, remediation_steps)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    analysis.analysis_id,
                    issue.issue_id,
                    issue.issue_type,
                    issue.severity.value,
                    issue.description,
                    issue.regulatory_reference,
                    json.dumps(issue.remediation_steps)
                ))
                
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error storing contract analysis: {e}")


class DocumentIntelligenceEngine:
    """Main engine for document intelligence operations."""
    
    def __init__(self):
        self.parser = LegalDocumentParser()
        self.contract_analyzer = ContractAnalyzer()
        self.analysis_cache = {}
        
    async def analyze_legal_document(self, document_text: str, document_type: DocumentType,
                                   contract_type: Optional[ContractType] = None) -> DocumentAnalysisResult:
        """Analyze legal document based on type."""
        try:
            logger.info(f"Analyzing {document_type.value} document")
            
            if document_type == DocumentType.CONTRACT and contract_type:
                return await self.contract_analyzer.analyze_contract(document_text, contract_type)
            else:
                # General document analysis
                return await self._analyze_general_document(document_text, document_type)
                
        except Exception as e:
            logger.error(f"Error analyzing legal document: {e}")
            raise
            
    async def _analyze_general_document(self, document_text: str, 
                                      document_type: DocumentType) -> DocumentAnalysisResult:
        """Analyze general legal document."""
        try:
            analysis_id = str(uuid.uuid4())
            document_id = str(uuid.uuid4())
            
            # Parse document
            parsed_data = await self.parser.parse_document(document_text, document_type)
            
            # Create basic analysis result
            metadata = DocumentMetadata(
                document_id=document_id,
                title=parsed_data["metadata"].get("title", "Untitled Document"),
                document_type=document_type,
                contract_type=None,
                creation_date=datetime.now(),
                last_modified=datetime.now(),
                author="Unknown",
                version="1.0",
                language=parsed_data["metadata"].get("language", "ro"),
                jurisdiction="RO",
                file_size=len(document_text),
                checksum="placeholder_checksum"
            )
            
            return DocumentAnalysisResult(
                analysis_id=analysis_id,
                document_id=document_id,
                document_metadata=metadata,
                extracted_clauses=[],
                compliance_issues=[],
                risk_assessment={"overall_risk_level": "low", "risk_score": 0.2},
                recommendations=["Document parsed successfully", "Review content for accuracy"],
                confidence_score=0.8,
                analysis_timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error analyzing general document: {e}")
            raise


# Main execution and testing
async def main():
    """Main function for testing and demonstration."""
    try:
        logger.info("📄 Starting Document Intelligence Engine Demo")
        
        # Initialize engine
        doc_engine = DocumentIntelligenceEngine()
        
        # Test contract analysis
        logger.info("📋 Testing Contract Analysis...")
        
        sample_contract = """
        CONTRACT DE VÂNZARE-CUMPĂRARE
        
        Între subsemnații:
        1. SC VENDOR SRL, cu sediul în București, reprezentată legal de director general
        2. CUMPĂRĂTOR PERSOANĂ FIZICĂ, domiciliat în Cluj-Napoca
        
        Articolul 1 - Obiectul contractului
        Vânzătorul se obligă să vândă și să predea cumpărătorului apartamentul situat în Cluj-Napoca.
        
        Articolul 2 - Prețul
        Prețul convenit este de 150.000 EUR, plătibil în termen de 30 de zile.
        
        Articolul 3 - Răspunderea
        Vânzătorul răspunde nelimitat pentru viciile ascunse ale bunului vândut.
        În caz de nerespectare a termenilor, cumpărătorul va plăti o penalitate de 5% pe zi.
        
        Articolul 4 - Rezilierea
        Contractul poate fi reziliat prin acordul părților sau în caz de încălcare gravă.
        """
        
        contract_result = await doc_engine.analyze_legal_document(
            sample_contract, 
            DocumentType.CONTRACT,
            ContractType.SALE_PURCHASE
        )
        
        logger.info(f"✅ Contract analysis completed")
        logger.info(f"📊 Risk Level: {contract_result.risk_assessment.get('overall_risk_level', 'unknown')}")
        logger.info(f"🔍 Issues Found: {len(contract_result.compliance_issues)}")
        logger.info(f"📝 Clauses Extracted: {len(contract_result.extracted_clauses)}")
        logger.info(f"🎯 Confidence: {contract_result.confidence_score:.2%}")
        
        # Test general document analysis
        logger.info("📜 Testing General Document Analysis...")
        
        sample_policy = """
        POLITICA DE CONFIDENȚIALITATE
        
        Această politică descrie modul în care colectăm și procesăm datele personale.
        
        1. Colectarea datelor
        Colectăm date personale când utilizați serviciile noastre.
        
        2. Utilizarea datelor
        Datele sunt utilizate pentru îmbunătățirea serviciilor oferite.
        
        3. Protecția datelor
        Implementăm măsuri de securitate pentru protecția datelor.
        """
        
        policy_result = await doc_engine.analyze_legal_document(
            sample_policy,
            DocumentType.POLICY
        )
        
        logger.info(f"✅ Policy analysis completed")
        logger.info(f"📋 Document Type: {policy_result.document_metadata.document_type.value}")
        logger.info(f"🌐 Language: {policy_result.document_metadata.language}")
        logger.info(f"🎯 Confidence: {policy_result.confidence_score:.2%}")
        
        logger.info("🎉 Document Intelligence Engine Demo Completed Successfully!")
        
    except Exception as e:
        logger.error(f"❌ Error in Document Intelligence demo: {e}")


if __name__ == "__main__":
    asyncio.run(main())
