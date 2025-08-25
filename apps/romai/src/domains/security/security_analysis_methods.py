"""
Security Analysis Methods - Part 2 of Security Intelligence Engine
Advanced security analysis, threat evaluation, and vulnerability assessment methods

This module contains the core analysis methods for the Security Intelligence Engine
to maintain modularity and avoid length limitations.
"""

from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timezone, timedelta
import logging

logger = logging.getLogger(__name__)

class SecurityAnalysisMethods:
    """Security analysis methods for the Security Intelligence Engine"""
    
    def _extract_security_info(self, query: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Extract security information from query and context"""
        security_info = {
            'asset_type': None,
            'threat_actors': [],
            'attack_vectors': [],
            'vulnerabilities': [],
            'compliance_requirements': [],
            'industry_sector': None,
            'criticality_level': 'medium',
            'existing_controls': [],
            'incident_type': None
        }
        
        # Extract from context if available
        if context:
            security_info.update(context.get('security_info', {}))
        
        query_lower = query.lower()
        
        # Extract asset types
        asset_types = ['web application', 'network', 'database', 'server', 'endpoint', 'cloud', 'mobile']
        for asset in asset_types:
            if asset in query_lower:
                security_info['asset_type'] = asset
                break
        
        # Extract threat actors
        threat_actors = ['apt', 'ransomware', 'insider', 'cybercriminal', 'nation state', 'hacktivist']
        for actor in threat_actors:
            if actor in query_lower:
                security_info['threat_actors'].append(actor)
        
        # Extract attack vectors
        attack_vectors = ['phishing', 'malware', 'sql injection', 'xss', 'ddos', 'social engineering']
        for vector in attack_vectors:
            if vector in query_lower:
                security_info['attack_vectors'].append(vector)
        
        # Extract compliance requirements
        compliance_keywords = ['gdpr', 'iso 27001', 'nist', 'pci dss', 'hipaa', 'sox']
        for compliance in compliance_keywords:
            if compliance in query_lower:
                security_info['compliance_requirements'].append(compliance)
        
        return security_info
    
    def _determine_threat_level(self, query: str, security_info: Dict[str, Any]) -> 'ThreatLevel':
        """Determine the threat severity level"""
        from . import ThreatLevel
        
        query_lower = query.lower()
        
        # Critical level indicators
        critical_indicators = ['critical', 'emergency', 'breach', 'ransomware', 'data theft', 'system down']
        if any(indicator in query_lower for indicator in critical_indicators):
            return ThreatLevel.CRITICAL
        
        # High level indicators
        high_indicators = ['urgent', 'high risk', 'exploit', 'vulnerability', 'attack detected']
        if any(indicator in query_lower for indicator in high_indicators):
            return ThreatLevel.HIGH
        
        # Medium level indicators
        medium_indicators = ['moderate', 'potential', 'suspicious', 'anomaly', 'warning']
        if any(indicator in query_lower for indicator in medium_indicators):
            return ThreatLevel.MEDIUM
        
        # Low level indicators
        low_indicators = ['low risk', 'informational', 'minor', 'advisory', 'recommendation']
        if any(indicator in query_lower for indicator in low_indicators):
            return ThreatLevel.LOW
        
        # Check threat actors for severity
        if 'apt' in security_info.get('threat_actors', []) or 'nation state' in security_info.get('threat_actors', []):
            return ThreatLevel.HIGH
        elif 'ransomware' in security_info.get('threat_actors', []):
            return ThreatLevel.CRITICAL
        
        return ThreatLevel.MEDIUM  # Default to medium
    
    def _identify_security_framework(self, query: str, security_info: Dict[str, Any]) -> 'SecurityFramework':
        """Identify the most applicable security framework"""
        from . import SecurityFramework
        
        query_lower = query.lower()
        
        # Framework-specific keywords
        framework_keywords = {
            SecurityFramework.NIST_CYBERSECURITY: ['nist', 'cybersecurity framework', 'identify protect detect'],
            SecurityFramework.ISO_27001: ['iso 27001', 'information security management', 'isms'],
            SecurityFramework.CIS_CONTROLS: ['cis controls', 'center for internet security'],
            SecurityFramework.OWASP_TOP_10: ['owasp', 'web application', 'top 10'],
            SecurityFramework.MITRE_ATTACK: ['mitre', 'att&ck', 'tactics techniques'],
            SecurityFramework.SANS_TOP_25: ['sans', 'software errors', 'cwe'],
            SecurityFramework.GDPR_SECURITY: ['gdpr', 'data protection', 'privacy'],
            SecurityFramework.ROMANIAN_CYBER_STRATEGY: ['romania', 'romanian', 'dnsc', 'cert-ro']
        }
        
        # Score each framework
        framework_scores = {}
        for framework, keywords in framework_keywords.items():
            score = sum(1 for keyword in keywords if keyword in query_lower)
            if score > 0:
                framework_scores[framework] = score
        
        # Check compliance requirements
        compliance_requirements = security_info.get('compliance_requirements', [])
        if 'gdpr' in compliance_requirements:
            return SecurityFramework.GDPR_SECURITY
        elif 'iso 27001' in compliance_requirements:
            return SecurityFramework.ISO_27001
        elif 'nist' in compliance_requirements:
            return SecurityFramework.NIST_CYBERSECURITY
        
        # Return highest scoring framework or default to NIST
        if framework_scores:
            return max(framework_scores, key=framework_scores.get)
        else:
            return SecurityFramework.NIST_CYBERSECURITY
    
    async def _evaluate_threats(self, query: str, security_domain: 'SecurityDomain', security_info: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate threats based on domain and context"""
        
        threat_evaluation = {
            'primary_threats': [],
            'threat_actors': security_info.get('threat_actors', []),
            'attack_likelihood': 'medium',
            'potential_impact': 'moderate',
            'threat_intelligence': {},
            'indicators_of_compromise': []
        }
        
        # Domain-specific threat evaluation
        if security_domain.value == 'threat_detection':
            threat_evaluation['primary_threats'].extend([
                'Advanced persistent threats targeting sensitive data',
                'Malware infections and command-and-control communications',
                'Insider threats and privileged access abuse',
                'Zero-day exploits and unknown attack vectors'
            ])
            
        elif security_domain.value == 'vulnerability_assessment':
            threat_evaluation['primary_threats'].extend([
                'Unpatched software vulnerabilities',
                'Misconfigurations exposing attack surfaces',
                'Weak authentication and access controls',
                'Third-party component vulnerabilities'
            ])
            
        elif security_domain.value == 'incident_response':
            threat_evaluation['primary_threats'].extend([
                'Active security incidents requiring immediate response',
                'Data breaches and exfiltration attempts',
                'System compromises and lateral movement',
                'Ransomware attacks and service disruptions'
            ])
        
        # Assess threat intelligence
        threat_evaluation['threat_intelligence'] = {
            'recent_campaigns': 'Analysis of recent threat campaigns and TTPs',
            'attribution': 'Threat actor attribution and motivation assessment',
            'predictive_analysis': 'Forecast of likely attack scenarios and trends'
        }
        
        return threat_evaluation
    
    async def _assess_vulnerabilities(self, security_domain: 'SecurityDomain', security_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Assess vulnerabilities based on asset type and context"""
        
        vulnerabilities = []
        asset_type = security_info.get('asset_type', 'general')
        
        # Asset-specific vulnerability assessments
        if asset_type == 'web application':
            vulnerabilities.extend([
                {
                    'vulnerability': 'SQL Injection',
                    'severity': 'High',
                    'description': 'Input validation flaws allowing database manipulation',
                    'cvss_score': 8.1,
                    'remediation': 'Implement parameterized queries and input validation'
                },
                {
                    'vulnerability': 'Cross-Site Scripting (XSS)',
                    'severity': 'Medium',
                    'description': 'Client-side code injection vulnerabilities',
                    'cvss_score': 6.1,
                    'remediation': 'Implement output encoding and CSP headers'
                },
                {
                    'vulnerability': 'Broken Authentication',
                    'severity': 'High',
                    'description': 'Weak session management and authentication flaws',
                    'cvss_score': 7.5,
                    'remediation': 'Implement strong authentication and session controls'
                }
            ])
            
        elif asset_type == 'network':
            vulnerabilities.extend([
                {
                    'vulnerability': 'Unencrypted Communications',
                    'severity': 'Medium',
                    'description': 'Network traffic transmitted without encryption',
                    'cvss_score': 5.9,
                    'remediation': 'Implement TLS/SSL encryption for all communications'
                },
                {
                    'vulnerability': 'Weak Network Segmentation',
                    'severity': 'High',
                    'description': 'Inadequate network isolation and access controls',
                    'cvss_score': 7.2,
                    'remediation': 'Implement network segmentation and micro-segmentation'
                }
            ])
            
        elif asset_type == 'cloud':
            vulnerabilities.extend([
                {
                    'vulnerability': 'Misconfigured Storage Buckets',
                    'severity': 'Critical',
                    'description': 'Publicly accessible cloud storage with sensitive data',
                    'cvss_score': 9.1,
                    'remediation': 'Review and secure cloud storage configurations'
                },
                {
                    'vulnerability': 'Excessive IAM Permissions',
                    'severity': 'High',
                    'description': 'Overprivileged accounts and service principals',
                    'cvss_score': 7.8,
                    'remediation': 'Implement least privilege access controls'
                }
            ])
        
        return vulnerabilities[:6]  # Return top 6 vulnerabilities
    
    async def _conduct_risk_analysis(self, security_domain: 'SecurityDomain', security_info: Dict[str, Any], threat_level: 'ThreatLevel') -> Dict[str, Any]:
        """Conduct comprehensive security risk analysis"""
        
        risk_analysis = {
            'overall_risk_level': threat_level.value,
            'business_impact': self._assess_business_impact(security_info),
            'likelihood_assessment': self._assess_likelihood(security_info),
            'risk_factors': self._identify_risk_factors(security_info),
            'mitigation_priority': self._prioritize_risks(threat_level),
            'cost_benefit_analysis': self._analyze_cost_benefit(security_info)
        }
        
        return risk_analysis
    
    def _assess_business_impact(self, security_info: Dict[str, Any]) -> Dict[str, str]:
        """Assess potential business impact of security risks"""
        return {
            'financial_impact': 'Potential financial losses from incidents and recovery costs',
            'operational_impact': 'Service disruptions and business process interruptions',
            'reputational_impact': 'Brand damage and customer confidence erosion',
            'regulatory_impact': 'Compliance violations and regulatory penalties',
            'competitive_impact': 'Loss of competitive advantage and market position'
        }
    
    def _assess_likelihood(self, security_info: Dict[str, Any]) -> str:
        """Assess likelihood of threat exploitation"""
        threat_actors = security_info.get('threat_actors', [])
        
        if 'apt' in threat_actors or 'nation state' in threat_actors:
            return 'High - Advanced threat actors with sophisticated capabilities'
        elif 'ransomware' in threat_actors or 'cybercriminal' in threat_actors:
            return 'Medium-High - Opportunistic attackers targeting valuable assets'
        elif 'insider' in threat_actors:
            return 'Medium - Internal threats with privileged access'
        else:
            return 'Medium - General threat landscape and attack trends'
    
    def _identify_risk_factors(self, security_info: Dict[str, Any]) -> List[str]:
        """Identify key risk factors"""
        return [
            'Asset criticality and business importance',
            'Threat actor sophistication and motivation',
            'Vulnerability exploitability and attack surface',
            'Existing security controls and defense effectiveness',
            'Incident response capabilities and recovery time',
            'Regulatory and compliance requirements'
        ]
    
    def _prioritize_risks(self, threat_level: 'ThreatLevel') -> List[str]:
        """Prioritize risk mitigation based on threat level"""
        if threat_level.value == 'critical':
            return [
                'Immediate containment and incident response',
                'Emergency patching and vulnerability remediation',
                'Enhanced monitoring and threat detection',
                'Business continuity and disaster recovery activation'
            ]
        elif threat_level.value == 'high':
            return [
                'Urgent security control implementation',
                'Accelerated vulnerability remediation',
                'Increased security monitoring and alerting',
                'Staff awareness and training enhancement'
            ]
        else:
            return [
                'Systematic vulnerability management',
                'Regular security assessments and testing',
                'Continuous security improvement programs',
                'Long-term security strategy development'
            ]
    
    def _analyze_cost_benefit(self, security_info: Dict[str, Any]) -> Dict[str, str]:
        """Analyze cost-benefit of security investments"""
        return {
            'prevention_costs': 'Investment in security controls and preventive measures',
            'detection_costs': 'Security monitoring and incident detection capabilities',
            'response_costs': 'Incident response and recovery operational expenses',
            'potential_losses': 'Estimated losses from successful security incidents',
            'roi_calculation': 'Return on investment for security improvement initiatives'
        }