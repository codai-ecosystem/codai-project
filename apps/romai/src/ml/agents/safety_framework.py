"""
RomAI Safety Framework

Comprehensive safety and security framework for action orchestration.
Implements multi-layered protection, monitoring, and compliance systems
to ensure safe and responsible AI action execution.

Key Features:
- Action validation and filtering
- Rate limiting and abuse prevention
- Audit logging and compliance tracking
- Romanian cultural sensitivity awareness
- Enterprise security standards
- Real-time monitoring and alerting

Author: RomAI Development Team
Version: 1.0.0
Date: August 25, 2025
"""

import re
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Set, Any, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum
import json

from .action_orchestrator import ActionRequest, ActionType, ActionPriority


class SafetyLevel(Enum):
    """Safety levels for action execution."""
    SAFE = "safe"
    CAUTION = "caution"
    RESTRICTED = "restricted"
    BLOCKED = "blocked"


class ComplianceFramework(Enum):
    """Supported compliance frameworks."""
    GDPR = "gdpr"
    HIPAA = "hipaa"
    SOX = "sox"
    PCI_DSS = "pci_dss"
    ROMANIAN_LAW = "romanian_law"
    GENERAL = "general"


@dataclass
class SafetyViolation:
    """Represents a safety violation."""
    rule_id: str
    severity: str
    message: str
    action_id: str
    user_id: str
    timestamp: datetime = field(default_factory=datetime.now)
    context: Dict[str, Any] = field(default_factory=dict)


@dataclass
class AuditLogEntry:
    """Audit log entry for compliance tracking."""
    id: str
    user_id: str
    session_id: str
    action_type: str
    action_description: str
    safety_level: SafetyLevel
    compliance_checks: List[str]
    violations: List[SafetyViolation]
    approved: bool
    timestamp: datetime = field(default_factory=datetime.now)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


class SafetyRule:
    """Base class for safety rules."""
    
    def __init__(self, rule_id: str, name: str, description: str, severity: str = "medium"):
        self.rule_id = rule_id
        self.name = name
        self.description = description
        self.severity = severity
        
    def check(self, request: ActionRequest) -> Optional[SafetyViolation]:
        """Check if request violates this rule."""
        raise NotImplementedError


class DangerousPatternRule(SafetyRule):
    """Rule to detect dangerous patterns in action requests."""
    
    def __init__(self):
        super().__init__(
            "DANGEROUS_PATTERN",
            "Dangerous Pattern Detection",
            "Detects potentially harmful patterns in action requests"
        )
        
        # Comprehensive pattern library
        self.dangerous_patterns = {
            # System destruction
            r"rm\s+-rf\s+/": "System destruction attempt",
            r"del\s+/[qsf]": "Windows system deletion",
            r"format\s+c:": "Hard drive formatting",
            r"dd\s+if=/dev/zero": "Disk wiping attempt",
            r"shutdown\s+(-s|-r|-h)": "System shutdown command",
            
            # Database attacks
            r"DROP\s+DATABASE": "Database destruction",
            r"DELETE\s+FROM.*WHERE.*1=1": "Mass data deletion",
            r"TRUNCATE\s+TABLE": "Table data removal",
            r"ALTER\s+TABLE.*DROP": "Schema modification",
            
            # Network attacks
            r"nmap\s+.*": "Network scanning",
            r"sqlmap\s+.*": "SQL injection tool",
            r"metasploit": "Penetration testing framework",
            r"nc\s+-l": "Netcat listener setup",
            
            # Code injection
            r"eval\s*\(": "Code evaluation",
            r"exec\s*\(": "Code execution",
            r"__import__": "Dynamic import",
            r"subprocess\.(call|run|Popen)": "System command execution",
            
            # File system attacks
            r"\.\./": "Directory traversal",
            r"/etc/passwd": "Password file access",
            r"/etc/shadow": "Shadow file access",
            r"\.ssh/": "SSH key access",
            
            # Web attacks
            r"<script": "XSS attempt",
            r"javascript:": "JavaScript injection",
            r"onerror\s*=": "Event handler injection",
            r"document\.cookie": "Cookie manipulation"
        }
    
    def check(self, request: ActionRequest) -> Optional[SafetyViolation]:
        """Check for dangerous patterns."""
        # Combine all text from the request
        text_parts = [
            request.description,
            json.dumps(request.parameters),
            str(request.metadata)
        ]
        combined_text = " ".join(text_parts).lower()
        
        for pattern, description in self.dangerous_patterns.items():
            if re.search(pattern, combined_text, re.IGNORECASE):
                return SafetyViolation(
                    rule_id=self.rule_id,
                    severity="high",
                    message=f"Dangerous pattern detected: {description}",
                    action_id=request.id,
                    user_id=request.user_id,
                    context={"pattern": pattern, "description": description}
                )
        
        return None


class PrivacyProtectionRule(SafetyRule):
    """Rule to protect sensitive personal information."""
    
    def __init__(self):
        super().__init__(
            "PRIVACY_PROTECTION",
            "Privacy Protection",
            "Prevents exposure of sensitive personal information",
            severity="high"
        )
        
        # Patterns for sensitive data
        self.sensitive_patterns = {
            r"\b\d{16}\b": "Credit card number",
            r"\b\d{3}-\d{2}-\d{4}\b": "Social security number",
            r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b": "Email address",
            r"\b\d{10,15}\b": "Phone number",
            r"password\s*[=:]\s*\S+": "Password exposure",
            r"api[_-]?key\s*[=:]\s*\S+": "API key exposure",
            r"secret\s*[=:]\s*\S+": "Secret exposure",
            r"token\s*[=:]\s*\S+": "Token exposure"
        }
        
        # Romanian-specific patterns
        self.romanian_sensitive_patterns = {
            r"\b\d{13}\b": "Romanian CNP (Personal Numeric Code)",
            r"\bRO\d{2}[A-Z]{4}\d{16}\b": "Romanian IBAN",
            r"\b\d{2}\.\d{3}\.\d{3}\b": "Romanian CUI (Tax ID)"
        }
        
        self.sensitive_patterns.update(self.romanian_sensitive_patterns)
    
    def check(self, request: ActionRequest) -> Optional[SafetyViolation]:
        """Check for sensitive information exposure."""
        text_parts = [
            request.description,
            json.dumps(request.parameters),
            str(request.metadata)
        ]
        combined_text = " ".join(text_parts)
        
        for pattern, data_type in self.sensitive_patterns.items():
            if re.search(pattern, combined_text, re.IGNORECASE):
                return SafetyViolation(
                    rule_id=self.rule_id,
                    severity="high",
                    message=f"Potential {data_type} detected in request",
                    action_id=request.id,
                    user_id=request.user_id,
                    context={"data_type": data_type, "pattern": pattern}
                )
        
        return None


class RateLimitingRule(SafetyRule):
    """Rule to enforce rate limiting."""
    
    def __init__(self):
        super().__init__(
            "RATE_LIMITING",
            "Rate Limiting",
            "Enforces rate limits to prevent abuse"
        )
        
        # Rate limits per action type (requests per hour)
        self.rate_limits = {
            ActionType.API_CALL: 1000,
            ActionType.FILE_OPERATION: 500,
            ActionType.SYSTEM_COMMAND: 100,
            ActionType.DATABASE_QUERY: 200,
            ActionType.EMAIL_SEND: 50,
            ActionType.WEB_INTERACTION: 300,
            ActionType.NOTIFICATION: 200
        }
        
        # Track requests per user per action type
        self.request_history: Dict[str, List[datetime]] = {}
    
    def check(self, request: ActionRequest) -> Optional[SafetyViolation]:
        """Check rate limits."""
        key = f"{request.user_id}_{request.action_type.value}"
        now = datetime.now()
        hour_ago = now - timedelta(hours=1)
        
        # Initialize if not exists
        if key not in self.request_history:
            self.request_history[key] = []
        
        # Clean old entries
        self.request_history[key] = [
            timestamp for timestamp in self.request_history[key]
            if timestamp > hour_ago
        ]
        
        # Check limit
        limit = self.rate_limits.get(request.action_type, 100)
        current_count = len(self.request_history[key])
        
        if current_count >= limit:
            return SafetyViolation(
                rule_id=self.rule_id,
                severity="medium",
                message=f"Rate limit exceeded: {current_count}/{limit} requests per hour for {request.action_type.value}",
                action_id=request.id,
                user_id=request.user_id,
                context={"current_count": current_count, "limit": limit, "action_type": request.action_type.value}
            )
        
        # Add current request
        self.request_history[key].append(now)
        return None


class RomanianCulturalSensitivityRule(SafetyRule):
    """Rule to ensure cultural sensitivity in Romanian contexts."""
    
    def __init__(self):
        super().__init__(
            "ROMANIAN_CULTURAL_SENSITIVITY",
            "Romanian Cultural Sensitivity",
            "Ensures respectful handling of Romanian cultural content"
        )
        
        # Sensitive cultural topics that require careful handling
        self.sensitive_topics = {
            "historical_events": [
                "revolution", "communist", "ceausescu", "securitate", 
                "deportation", "collectivization", "iron guard", "legionary"
            ],
            "religious_topics": [
                "orthodox", "church", "patriarch", "monastery", "pilgrimage"
            ],
            "ethnic_minorities": [
                "roma", "hungarian", "german", "minority", "discrimination"
            ],
            "political_figures": [
                "political party", "president", "prime minister", "government"
            ]
        }
        
        self.respectful_language_required = True
    
    def check(self, request: ActionRequest) -> Optional[SafetyViolation]:
        """Check for cultural sensitivity issues."""
        if "romanian" not in request.description.lower() and "romania" not in request.description.lower():
            return None  # Not Romanian-related content
            
        text = f"{request.description} {json.dumps(request.parameters)}".lower()
        
        # Check for sensitive topics without proper context
        for category, topics in self.sensitive_topics.items():
            for topic in topics:
                if topic in text:
                    # Check if there's appropriate contextual language
                    respectful_indicators = [
                        "respectfully", "historically", "culturally", "traditionally",
                        "heritage", "legacy", "commemorate", "honor", "preserve"
                    ]
                    
                    if not any(indicator in text for indicator in respectful_indicators):
                        return SafetyViolation(
                            rule_id=self.rule_id,
                            severity="medium",
                            message=f"Sensitive Romanian cultural topic detected without appropriate context: {category}",
                            action_id=request.id,
                            user_id=request.user_id,
                            context={"category": category, "topic": topic}
                        )
        
        return None


class ComplianceChecker:
    """Handles compliance checking for various frameworks."""
    
    def __init__(self):
        self.frameworks = {
            ComplianceFramework.GDPR: self._check_gdpr,
            ComplianceFramework.HIPAA: self._check_hipaa,
            ComplianceFramework.SOX: self._check_sox,
            ComplianceFramework.PCI_DSS: self._check_pci_dss,
            ComplianceFramework.ROMANIAN_LAW: self._check_romanian_law,
            ComplianceFramework.GENERAL: self._check_general
        }
    
    def check_compliance(self, request: ActionRequest, frameworks: List[ComplianceFramework]) -> List[str]:
        """Check compliance against specified frameworks."""
        violations = []
        
        for framework in frameworks:
            if framework in self.frameworks:
                framework_violations = self.frameworks[framework](request)
                violations.extend(framework_violations)
        
        return violations
    
    def _check_gdpr(self, request: ActionRequest) -> List[str]:
        """Check GDPR compliance."""
        violations = []
        
        # Check for personal data processing without consent
        personal_data_keywords = ["email", "phone", "address", "name", "personal", "individual"]
        text = f"{request.description} {json.dumps(request.parameters)}".lower()
        
        if any(keyword in text for keyword in personal_data_keywords):
            if "consent" not in text and "legitimate_interest" not in text:
                violations.append("GDPR: Personal data processing without documented legal basis")
        
        return violations
    
    def _check_hipaa(self, request: ActionRequest) -> List[str]:
        """Check HIPAA compliance."""
        violations = []
        
        health_keywords = ["medical", "health", "patient", "diagnosis", "treatment", "prescription"]
        text = f"{request.description} {json.dumps(request.parameters)}".lower()
        
        if any(keyword in text for keyword in health_keywords):
            if "encrypted" not in text and "secure" not in text:
                violations.append("HIPAA: Health information processed without proper security measures")
        
        return violations
    
    def _check_sox(self, request: ActionRequest) -> List[str]:
        """Check SOX compliance."""
        violations = []
        
        financial_keywords = ["financial", "accounting", "audit", "revenue", "expense", "transaction"]
        text = f"{request.description} {json.dumps(request.parameters)}".lower()
        
        if any(keyword in text for keyword in financial_keywords):
            if "audit_trail" not in request.metadata:
                violations.append("SOX: Financial data processing without audit trail")
        
        return violations
    
    def _check_pci_dss(self, request: ActionRequest) -> List[str]:
        """Check PCI DSS compliance."""
        violations = []
        
        payment_keywords = ["card", "payment", "transaction", "merchant", "cardholder"]
        text = f"{request.description} {json.dumps(request.parameters)}".lower()
        
        if any(keyword in text for keyword in payment_keywords):
            if "encrypted" not in text and "tokenized" not in text:
                violations.append("PCI DSS: Payment data processed without proper protection")
        
        return violations
    
    def _check_romanian_law(self, request: ActionRequest) -> List[str]:
        """Check Romanian law compliance."""
        violations = []
        
        # Romanian data protection law (similar to GDPR but with local specifics)
        if "cnp" in request.description.lower() or "cod numeric personal" in request.description.lower():
            violations.append("Romanian Law: CNP (Personal Numeric Code) requires special protection")
        
        return violations
    
    def _check_general(self, request: ActionRequest) -> List[str]:
        """Check general compliance requirements."""
        violations = []
        
        # Basic security requirements
        if request.action_type in [ActionType.SYSTEM_COMMAND, ActionType.FILE_OPERATION]:
            if not request.user_id:
                violations.append("General: High-risk actions require authenticated user")
        
        return violations


class SafetyFramework:
    """Main safety framework orchestrating all safety checks."""
    
    def __init__(self):
        self.rules: List[SafetyRule] = []
        self.compliance_checker = ComplianceChecker()
        self.audit_log: List[AuditLogEntry] = []
        self.violation_history: List[SafetyViolation] = []
        
        # Initialize default rules
        self._initialize_default_rules()
        
        # Setup logging
        self.logger = logging.getLogger(__name__)
        handler = logging.FileHandler("romai_safety.log")
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
    
    def _initialize_default_rules(self):
        """Initialize the default set of safety rules."""
        self.rules = [
            DangerousPatternRule(),
            PrivacyProtectionRule(),
            RateLimitingRule(),
            RomanianCulturalSensitivityRule()
        ]
    
    def add_rule(self, rule: SafetyRule):
        """Add a custom safety rule."""
        self.rules.append(rule)
        self.logger.info(f"Added safety rule: {rule.name}")
    
    def remove_rule(self, rule_id: str):
        """Remove a safety rule."""
        self.rules = [rule for rule in self.rules if rule.rule_id != rule_id]
        self.logger.info(f"Removed safety rule: {rule_id}")
    
    def evaluate_safety(
        self, 
        request: ActionRequest, 
        compliance_frameworks: List[ComplianceFramework] = None
    ) -> Tuple[SafetyLevel, List[SafetyViolation]]:
        """Evaluate the safety of an action request."""
        violations = []
        
        # Run all safety rules
        for rule in self.rules:
            violation = rule.check(request)
            if violation:
                violations.append(violation)
                self.violation_history.append(violation)
        
        # Check compliance if frameworks specified
        compliance_violations = []
        if compliance_frameworks:
            compliance_violations = self.compliance_checker.check_compliance(request, compliance_frameworks)
        
        # Determine safety level
        safety_level = self._determine_safety_level(violations, compliance_violations)
        
        # Log audit entry
        audit_entry = AuditLogEntry(
            id=self._generate_audit_id(),
            user_id=request.user_id,
            session_id=request.session_id,
            action_type=request.action_type.value,
            action_description=request.description,
            safety_level=safety_level,
            compliance_checks=[fw.value for fw in (compliance_frameworks or [])],
            violations=violations,
            approved=safety_level in [SafetyLevel.SAFE, SafetyLevel.CAUTION]
        )
        
        self.audit_log.append(audit_entry)
        
        # Log results
        self.logger.info(
            f"Safety evaluation: {safety_level.value} | "
            f"Action: {request.action_type.value} | "
            f"User: {request.user_id} | "
            f"Violations: {len(violations)} | "
            f"Compliance: {len(compliance_violations)}"
        )
        
        return safety_level, violations
    
    def _determine_safety_level(self, violations: List[SafetyViolation], compliance_violations: List[str]) -> SafetyLevel:
        """Determine the overall safety level based on violations."""
        if not violations and not compliance_violations:
            return SafetyLevel.SAFE
        
        # Check for high-severity violations
        high_severity_count = sum(1 for v in violations if v.severity == "high")
        if high_severity_count > 0 or len(compliance_violations) > 2:
            return SafetyLevel.BLOCKED
        
        # Check for medium-severity violations
        medium_severity_count = sum(1 for v in violations if v.severity == "medium")
        if medium_severity_count > 2 or len(compliance_violations) > 0:
            return SafetyLevel.RESTRICTED
        
        # Low-severity violations or single compliance issue
        return SafetyLevel.CAUTION
    
    def _generate_audit_id(self) -> str:
        """Generate a unique audit ID."""
        timestamp = datetime.now().isoformat()
        return hashlib.md5(timestamp.encode()).hexdigest()[:16]
    
    def get_user_violation_history(self, user_id: str, days: int = 30) -> List[SafetyViolation]:
        """Get violation history for a specific user."""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        return [
            violation for violation in self.violation_history
            if violation.user_id == user_id and violation.timestamp > cutoff_date
        ]
    
    def get_safety_statistics(self) -> Dict[str, Any]:
        """Get safety framework statistics."""
        total_evaluations = len(self.audit_log)
        
        if total_evaluations == 0:
            return {"total_evaluations": 0}
        
        # Safety level distribution
        safety_levels = {}
        for entry in self.audit_log:
            level = entry.safety_level.value
            safety_levels[level] = safety_levels.get(level, 0) + 1
        
        # Violation statistics
        violation_types = {}
        for violation in self.violation_history:
            rule_id = violation.rule_id
            violation_types[rule_id] = violation_types.get(rule_id, 0) + 1
        
        # Top violating users
        user_violations = {}
        for violation in self.violation_history:
            user_id = violation.user_id
            user_violations[user_id] = user_violations.get(user_id, 0) + 1
        
        return {
            "total_evaluations": total_evaluations,
            "safety_level_distribution": safety_levels,
            "violation_types": violation_types,
            "top_violating_users": sorted(user_violations.items(), key=lambda x: x[1], reverse=True)[:10],
            "approval_rate": sum(1 for entry in self.audit_log if entry.approved) / total_evaluations
        }
    
    def export_audit_log(self, start_date: datetime = None, end_date: datetime = None) -> List[Dict[str, Any]]:
        """Export audit log for compliance reporting."""
        entries = self.audit_log
        
        if start_date:
            entries = [entry for entry in entries if entry.timestamp >= start_date]
        if end_date:
            entries = [entry for entry in entries if entry.timestamp <= end_date]
        
        return [
            {
                "id": entry.id,
                "timestamp": entry.timestamp.isoformat(),
                "user_id": entry.user_id,
                "session_id": entry.session_id,
                "action_type": entry.action_type,
                "action_description": entry.action_description,
                "safety_level": entry.safety_level.value,
                "compliance_checks": entry.compliance_checks,
                "violations": [
                    {
                        "rule_id": v.rule_id,
                        "severity": v.severity,
                        "message": v.message
                    } for v in entry.violations
                ],
                "approved": entry.approved
            }
            for entry in entries
        ]


# Global safety framework instance
_safety_framework_instance = None


def get_safety_framework() -> SafetyFramework:
    """Get the global safety framework instance."""
    global _safety_framework_instance
    if _safety_framework_instance is None:
        _safety_framework_instance = SafetyFramework()
    return _safety_framework_instance


if __name__ == "__main__":
    # Example usage and testing
    def test_safety_framework():
        """Test the safety framework."""
        print("🛡️ Testing RomAI Safety Framework")
        
        safety = get_safety_framework()
        
        # Test 1: Safe request
        print("\n1. Testing safe request...")
        safe_request = ActionRequest(
            action_type=ActionType.CALCULATION,
            description="Calculate the area of a circle with radius 5",
            parameters={"expression": "3.14159 * 5 * 5"},
            user_id="test_user_1"
        )
        
        safety_level, violations = safety.evaluate_safety(safe_request)
        print(f"Safety Level: {safety_level.value}")
        print(f"Violations: {len(violations)}")
        
        # Test 2: Dangerous request
        print("\n2. Testing dangerous request...")
        dangerous_request = ActionRequest(
            action_type=ActionType.SYSTEM_COMMAND,
            description="Delete all system files",
            parameters={"command": "rm -rf /"},
            user_id="test_user_2"
        )
        
        safety_level, violations = safety.evaluate_safety(dangerous_request)
        print(f"Safety Level: {safety_level.value}")
        print(f"Violations: {len(violations)}")
        for violation in violations:
            print(f"  - {violation.message}")
        
        # Test 3: Privacy violation
        print("\n3. Testing privacy violation...")
        privacy_request = ActionRequest(
            action_type=ActionType.EMAIL_SEND,
            description="Send user data including credit card 4532123456789012",
            parameters={"to": "test@example.com", "data": "sensitive information"},
            user_id="test_user_3"
        )
        
        safety_level, violations = safety.evaluate_safety(privacy_request)
        print(f"Safety Level: {safety_level.value}")
        print(f"Violations: {len(violations)}")
        for violation in violations:
            print(f"  - {violation.message}")
        
        # Test 4: Romanian cultural content
        print("\n4. Testing Romanian cultural sensitivity...")
        cultural_request = ActionRequest(
            action_type=ActionType.CULTURAL_ANALYSIS,
            description="Analyze Romanian revolution without proper historical context",
            parameters={"topic": "revolution"},
            user_id="test_user_4"
        )
        
        safety_level, violations = safety.evaluate_safety(cultural_request)
        print(f"Safety Level: {safety_level.value}")
        print(f"Violations: {len(violations)}")
        for violation in violations:
            print(f"  - {violation.message}")
        
        # Test 5: GDPR compliance
        print("\n5. Testing GDPR compliance...")
        gdpr_request = ActionRequest(
            action_type=ActionType.DATA_PROCESSING,
            description="Process personal email addresses for marketing",
            parameters={"emails": ["user@example.com"]},
            user_id="test_user_5"
        )
        
        safety_level, violations = safety.evaluate_safety(
            gdpr_request,
            compliance_frameworks=[ComplianceFramework.GDPR]
        )
        print(f"Safety Level: {safety_level.value}")
        print(f"Violations: {len(violations)}")
        
        # Get statistics
        print("\n6. Safety Statistics:")
        stats = safety.get_safety_statistics()
        for key, value in stats.items():
            print(f"  {key}: {value}")
        
        print("\n✅ Safety Framework testing completed!")
    
    # Run the test
    test_safety_framework()