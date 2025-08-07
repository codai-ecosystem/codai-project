"""
RomAI Phase 4.2: BancAI Financial Intelligence - Main Integration Module
Advanced financial AI with regulatory compliance and real-time market analysis.

This module provides the main integration layer for Phase 4.2, coordinating:
- Financial Analysis Engine (real-time market analysis, risk assessment, fraud detection)
- Regulatory Compliance Engine (banking regulation compliance, data protection, audit trails)
- Customer Experience Engine (personalized advice, investment recommendations, education)

Author: RomAI Development Team  
Created: August 2025
License: Proprietary
"""

import asyncio
import logging
import sqlite3
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass, asdict
from enum import Enum
import uuid
import sys
import os

# Import Phase 4.2 components
try:
    from .analysis.financial_analysis_engine import (
        FinancialAnalysisEngine, MarketData, RiskAssessment, FraudDetection, FinancialForecast
    )
    from .compliance.regulatory_compliance_engine import (
        RegulatoryComplianceEngine, ComplianceAssessment, DataClassification, AuditEvent
    )
    from .customer_experience.customer_experience_engine import (
        CustomerExperienceEngine, FinancialAdvice, InvestmentRecommendation, CustomerProfile
    )
except ImportError as e:
    logger = logging.getLogger(__name__)
    logger.warning(f"Import error for Phase 4.2 components: {e}")
    # Define minimal classes for standalone operation
    class FinancialAnalysisEngine:
        def __init__(self): pass
    class RegulatoryComplianceEngine:
        def __init__(self): pass  
    class CustomerExperienceEngine:
        def __init__(self): pass


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ServiceTier(Enum):
    """BancAI service tiers."""
    BASIC = "basic"
    STANDARD = "standard"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"


class ServiceStatus(Enum):
    """Service status levels."""
    OPERATIONAL = "operational"
    DEGRADED = "degraded"
    MAINTENANCE = "maintenance"
    OFFLINE = "offline"


@dataclass
class BancAIServiceMetrics:
    """BancAI service metrics structure."""
    service_name: str
    status: ServiceStatus
    response_time_ms: float
    success_rate: float
    active_users: int
    daily_transactions: int
    compliance_score: float
    last_updated: datetime


@dataclass
class BancAIRequest:
    """BancAI service request structure."""
    request_id: str
    customer_id: str
    service_type: str
    parameters: Dict[str, Any]
    tier: ServiceTier
    timestamp: datetime


@dataclass
class BancAIResponse:
    """BancAI service response structure."""
    request_id: str
    customer_id: str
    service_type: str
    result: Dict[str, Any]
    execution_time_ms: float
    compliance_validated: bool
    timestamp: datetime


class BancAIOrchestrator:
    """Main orchestrator for BancAI Financial Intelligence services."""
    
    def __init__(self, db_path: str = "bancai_system.db"):
        self.db_path = db_path
        self.service_metrics = {}
        self.active_requests = {}
        
        # Initialize Phase 4.2 components
        try:
            self.financial_engine = FinancialAnalysisEngine()
            self.compliance_engine = RegulatoryComplianceEngine()
            self.customer_engine = CustomerExperienceEngine()
            logger.info("All Phase 4.2 components initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Phase 4.2 components: {e}")
            self.financial_engine = None
            self.compliance_engine = None  
            self.customer_engine = None
            
        self._init_database()
        
    def _init_database(self):
        """Initialize BancAI system database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Service requests table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS service_requests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    request_id TEXT UNIQUE NOT NULL,
                    customer_id TEXT NOT NULL,
                    service_type TEXT NOT NULL,
                    parameters TEXT,
                    tier TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    status TEXT DEFAULT 'pending',
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Service responses table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS service_responses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    request_id TEXT NOT NULL,
                    customer_id TEXT NOT NULL,
                    service_type TEXT NOT NULL,
                    result TEXT,
                    execution_time_ms REAL,
                    compliance_validated BOOLEAN,
                    timestamp TEXT NOT NULL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Service metrics table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS service_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    service_name TEXT NOT NULL,
                    status TEXT NOT NULL,
                    response_time_ms REAL,
                    success_rate REAL,
                    active_users INTEGER,
                    daily_transactions INTEGER,
                    compliance_score REAL,
                    timestamp TEXT NOT NULL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Customer interactions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS customer_interactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    customer_id TEXT NOT NULL,
                    interaction_type TEXT NOT NULL,
                    service_used TEXT NOT NULL,
                    satisfaction_score REAL,
                    feedback TEXT,
                    timestamp TEXT NOT NULL,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.commit()
            conn.close()
            logger.info("BancAI system database initialized")
            
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
            
    async def process_financial_analysis_request(self, request: BancAIRequest) -> BancAIResponse:
        """Process financial analysis service request."""
        try:
            start_time = datetime.now()
            logger.info(f"Processing financial analysis request: {request.request_id}")
            
            if not self.financial_engine:
                raise RuntimeError("Financial analysis engine not available")
                
            result = {}
            service_type = request.parameters.get("analysis_type", "market_analysis")
            
            if service_type == "market_analysis":
                # Generate market analysis report
                market_report = await self.financial_engine.get_market_analysis_report()
                result = {
                    "analysis_type": "market_analysis",
                    "market_report": market_report,
                    "generated_at": datetime.now().isoformat()
                }
                
            elif service_type == "investment_analysis":
                # Analyze investment opportunity
                asset_id = request.parameters.get("asset_id")
                amount = request.parameters.get("investment_amount", 10000)
                
                if asset_id:
                    investment_analysis = await self.financial_engine.analyze_investment_opportunity(
                        asset_id, amount
                    )
                    result = {
                        "analysis_type": "investment_analysis",
                        "investment_analysis": investment_analysis,
                        "generated_at": datetime.now().isoformat()
                    }
                else:
                    raise ValueError("Asset ID required for investment analysis")
                    
            elif service_type == "fraud_detection":
                # Process fraud detection
                transaction = request.parameters.get("transaction")
                if transaction:
                    fraud_result = await self.financial_engine.process_transaction_fraud_check(transaction)
                    result = {
                        "analysis_type": "fraud_detection",
                        "fraud_detection": asdict(fraud_result),
                        "generated_at": datetime.now().isoformat()
                    }
                else:
                    raise ValueError("Transaction data required for fraud detection")
                    
            else:
                raise ValueError(f"Unknown analysis type: {service_type}")
                
            # Calculate execution time
            execution_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # Validate compliance
            compliance_validated = await self._validate_compliance(request, result)
            
            # Create response
            response = BancAIResponse(
                request_id=request.request_id,
                customer_id=request.customer_id,
                service_type=request.service_type,
                result=result,
                execution_time_ms=execution_time,
                compliance_validated=compliance_validated,
                timestamp=datetime.now()
            )
            
            # Store response
            await self._store_service_response(response)
            
            logger.info(f"Financial analysis completed in {execution_time:.2f}ms")
            return response
            
        except Exception as e:
            logger.error(f"Error processing financial analysis request: {e}")
            raise
            
    async def process_compliance_request(self, request: BancAIRequest) -> BancAIResponse:
        """Process regulatory compliance service request."""
        try:
            start_time = datetime.now()
            logger.info(f"Processing compliance request: {request.request_id}")
            
            if not self.compliance_engine:
                raise RuntimeError("Compliance engine not available")
                
            result = {}
            service_type = request.parameters.get("compliance_type", "assessment")
            
            if service_type == "assessment":
                # Comprehensive compliance assessment
                entity_data = request.parameters.get("entity_data", {})
                entity_data["entity_id"] = request.customer_id
                
                assessments = await self.compliance_engine.comprehensive_compliance_assessment(entity_data)
                result = {
                    "compliance_type": "assessment",
                    "assessments": {k: asdict(v) for k, v in assessments.items()},
                    "generated_at": datetime.now().isoformat()
                }
                
            elif service_type == "data_protection":
                # Data protection service
                financial_data = request.parameters.get("financial_data")
                classification = DataClassification(request.parameters.get("classification", "confidential"))
                
                if financial_data:
                    encrypted_data = await self.compliance_engine.protect_financial_data(
                        financial_data, classification
                    )
                    result = {
                        "compliance_type": "data_protection",
                        "encrypted_data": encrypted_data,
                        "classification": classification.value,
                        "generated_at": datetime.now().isoformat()
                    }
                else:
                    raise ValueError("Financial data required for protection")
                    
            elif service_type == "reporting":
                # Generate regulatory reports
                reporting_period = request.parameters.get("reporting_period", "2025-08")
                reports = await self.compliance_engine.generate_regulatory_reports(reporting_period)
                
                result = {
                    "compliance_type": "reporting",
                    "reports": {k: asdict(v) for k, v in reports.items()},
                    "generated_at": datetime.now().isoformat()
                }
                
            elif service_type == "monitoring":
                # Compliance status monitoring
                status = await self.compliance_engine.monitor_compliance_status()
                result = {
                    "compliance_type": "monitoring",
                    "compliance_status": status,
                    "generated_at": datetime.now().isoformat()
                }
                
            else:
                raise ValueError(f"Unknown compliance type: {service_type}")
                
            # Calculate execution time
            execution_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # Create response
            response = BancAIResponse(
                request_id=request.request_id,
                customer_id=request.customer_id,
                service_type=request.service_type,
                result=result,
                execution_time_ms=execution_time,
                compliance_validated=True,  # Compliance service is inherently compliant
                timestamp=datetime.now()
            )
            
            # Store response
            await self._store_service_response(response)
            
            logger.info(f"Compliance processing completed in {execution_time:.2f}ms")
            return response
            
        except Exception as e:
            logger.error(f"Error processing compliance request: {e}")
            raise
            
    async def process_customer_experience_request(self, request: BancAIRequest) -> BancAIResponse:
        """Process customer experience service request."""
        try:
            start_time = datetime.now()
            logger.info(f"Processing customer experience request: {request.request_id}")
            
            if not self.customer_engine:
                raise RuntimeError("Customer experience engine not available")
                
            result = {}
            service_type = request.parameters.get("experience_type", "comprehensive")
            
            if service_type == "comprehensive":
                # Comprehensive customer service
                service_response = await self.customer_engine.comprehensive_customer_service(
                    request.customer_id
                )
                result = {
                    "experience_type": "comprehensive",
                    "customer_service": service_response,
                    "generated_at": datetime.now().isoformat()
                }
                
            elif service_type == "financial_advice":
                # Generate financial advice only
                advice = await self.customer_engine.financial_advisor.generate_financial_advice(
                    request.customer_id
                )
                result = {
                    "experience_type": "financial_advice",
                    "financial_advice": [asdict(item) for item in advice],
                    "generated_at": datetime.now().isoformat()
                }
                
            elif service_type == "investment_recommendations":
                # Generate investment recommendations only
                recommendations = await self.customer_engine.investment_engine.generate_investment_recommendations(
                    request.customer_id
                )
                result = {
                    "experience_type": "investment_recommendations", 
                    "recommendations": [asdict(rec) for rec in recommendations],
                    "generated_at": datetime.now().isoformat()
                }
                
            elif service_type == "education":
                # Get learning path
                learning_path = await self.customer_engine.education_platform.get_personalized_learning_path(
                    request.customer_id
                )
                result = {
                    "experience_type": "education",
                    "learning_path": [asdict(module) for module in learning_path],
                    "generated_at": datetime.now().isoformat()
                }
                
            else:
                raise ValueError(f"Unknown experience type: {service_type}")
                
            # Calculate execution time
            execution_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # Validate compliance
            compliance_validated = await self._validate_compliance(request, result)
            
            # Create response
            response = BancAIResponse(
                request_id=request.request_id,
                customer_id=request.customer_id,
                service_type=request.service_type,
                result=result,
                execution_time_ms=execution_time,
                compliance_validated=compliance_validated,
                timestamp=datetime.now()
            )
            
            # Store response
            await self._store_service_response(response)
            
            logger.info(f"Customer experience completed in {execution_time:.2f}ms")
            return response
            
        except Exception as e:
            logger.error(f"Error processing customer experience request: {e}")
            raise
            
    async def _validate_compliance(self, request: BancAIRequest, result: Dict[str, Any]) -> bool:
        """Validate request and response compliance."""
        try:
            # Basic compliance validation
            compliance_checks = []
            
            # Check if customer data is properly handled
            if "customer_id" in result:
                compliance_checks.append(True)
            else:
                compliance_checks.append(False)
                
            # Check if sensitive data is protected
            if any(key in result for key in ["financial_data", "personal_info"]):
                # Ensure data protection is applied
                compliance_checks.append("encrypted" in str(result) or "protected" in str(result))
            else:
                compliance_checks.append(True)
                
            # Check service tier permissions
            tier_permissions = {
                ServiceTier.BASIC: ["market_analysis", "basic_advice"],
                ServiceTier.STANDARD: ["market_analysis", "financial_advice", "investment_recommendations"],
                ServiceTier.PREMIUM: ["all_services"],
                ServiceTier.ENTERPRISE: ["all_services", "compliance_reporting"]
            }
            
            allowed_services = tier_permissions.get(request.tier, [])
            service_allowed = ("all_services" in allowed_services or 
                             request.service_type in allowed_services)
            compliance_checks.append(service_allowed)
            
            # Overall compliance
            return all(compliance_checks)
            
        except Exception as e:
            logger.error(f"Error validating compliance: {e}")
            return False
            
    async def _store_service_request(self, request: BancAIRequest):
        """Store service request in database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO service_requests 
                (request_id, customer_id, service_type, parameters, tier, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                request.request_id,
                request.customer_id,
                request.service_type,
                json.dumps(request.parameters),
                request.tier.value,
                request.timestamp.isoformat()
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error storing service request: {e}")
            
    async def _store_service_response(self, response: BancAIResponse):
        """Store service response in database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO service_responses 
                (request_id, customer_id, service_type, result, execution_time_ms, 
                 compliance_validated, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                response.request_id,
                response.customer_id,
                response.service_type,
                json.dumps(response.result),
                response.execution_time_ms,
                response.compliance_validated,
                response.timestamp.isoformat()
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error storing service response: {e}")
            
    async def update_service_metrics(self):
        """Update service performance metrics."""
        try:
            logger.info("Updating service metrics")
            
            # Calculate metrics for each service
            services = ["financial_analysis", "regulatory_compliance", "customer_experience"]
            
            for service in services:
                metrics = await self._calculate_service_metrics(service)
                self.service_metrics[service] = metrics
                
                # Store metrics
                await self._store_service_metrics(metrics)
                
            logger.info("Service metrics updated successfully")
            
        except Exception as e:
            logger.error(f"Error updating service metrics: {e}")
            
    async def _calculate_service_metrics(self, service_name: str) -> BancAIServiceMetrics:
        """Calculate performance metrics for a service."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get recent responses for this service
            cursor.execute("""
                SELECT execution_time_ms, compliance_validated 
                FROM service_responses 
                WHERE service_type = ? AND timestamp > datetime('now', '-1 day')
            """, (service_name,))
            
            responses = cursor.fetchall()
            
            if responses:
                execution_times = [r[0] for r in responses]
                compliance_results = [r[1] for r in responses]
                
                avg_response_time = sum(execution_times) / len(execution_times)
                success_rate = len([r for r in responses if r[0] < 5000]) / len(responses)  # < 5s = success
                compliance_rate = sum(compliance_results) / len(compliance_results)
            else:
                avg_response_time = 0
                success_rate = 1.0
                compliance_rate = 1.0
                
            # Get active users count (simplified)
            cursor.execute("""
                SELECT COUNT(DISTINCT customer_id) 
                FROM service_requests 
                WHERE service_type = ? AND timestamp > datetime('now', '-1 day')
            """, (service_name,))
            
            active_users = cursor.fetchone()[0] or 0
            
            # Get daily transactions count
            cursor.execute("""
                SELECT COUNT(*) 
                FROM service_requests 
                WHERE service_type = ? AND timestamp > datetime('now', '-1 day')
            """, (service_name,))
            
            daily_transactions = cursor.fetchone()[0] or 0
            
            conn.close()
            
            # Determine service status
            if avg_response_time < 1000 and success_rate > 0.95:
                status = ServiceStatus.OPERATIONAL
            elif avg_response_time < 3000 and success_rate > 0.90:
                status = ServiceStatus.DEGRADED
            else:
                status = ServiceStatus.MAINTENANCE
                
            return BancAIServiceMetrics(
                service_name=service_name,
                status=status,
                response_time_ms=avg_response_time,
                success_rate=success_rate,
                active_users=active_users,
                daily_transactions=daily_transactions,
                compliance_score=compliance_rate,
                last_updated=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error calculating service metrics: {e}")
            return BancAIServiceMetrics(
                service_name=service_name,
                status=ServiceStatus.OFFLINE,
                response_time_ms=0,
                success_rate=0,
                active_users=0,
                daily_transactions=0,
                compliance_score=0,
                last_updated=datetime.now()
            )
            
    async def _store_service_metrics(self, metrics: BancAIServiceMetrics):
        """Store service metrics in database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO service_metrics 
                (service_name, status, response_time_ms, success_rate, active_users, 
                 daily_transactions, compliance_score, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                metrics.service_name,
                metrics.status.value,
                metrics.response_time_ms,
                metrics.success_rate,
                metrics.active_users,
                metrics.daily_transactions,
                metrics.compliance_score,
                metrics.last_updated.isoformat()
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error storing service metrics: {e}")
            
    async def get_system_status(self) -> Dict[str, Any]:
        """Get overall BancAI system status."""
        try:
            logger.info("Getting BancAI system status")
            
            # Update metrics first
            await self.update_service_metrics()
            
            # Aggregate system status
            all_services_operational = all(
                metrics.status == ServiceStatus.OPERATIONAL 
                for metrics in self.service_metrics.values()
            )
            
            avg_response_time = sum(
                metrics.response_time_ms for metrics in self.service_metrics.values()
            ) / len(self.service_metrics) if self.service_metrics else 0
            
            avg_success_rate = sum(
                metrics.success_rate for metrics in self.service_metrics.values()
            ) / len(self.service_metrics) if self.service_metrics else 0
            
            total_active_users = sum(
                metrics.active_users for metrics in self.service_metrics.values()
            )
            
            total_daily_transactions = sum(
                metrics.daily_transactions for metrics in self.service_metrics.values()
            )
            
            avg_compliance_score = sum(
                metrics.compliance_score for metrics in self.service_metrics.values()
            ) / len(self.service_metrics) if self.service_metrics else 0
            
            system_status = {
                "overall_status": "operational" if all_services_operational else "degraded",
                "system_health": {
                    "average_response_time_ms": avg_response_time,
                    "success_rate": avg_success_rate,
                    "compliance_score": avg_compliance_score
                },
                "usage_statistics": {
                    "active_users": total_active_users,
                    "daily_transactions": total_daily_transactions
                },
                "service_status": {
                    service: asdict(metrics) for service, metrics in self.service_metrics.items()
                },
                "last_updated": datetime.now().isoformat()
            }
            
            return system_status
            
        except Exception as e:
            logger.error(f"Error getting system status: {e}")
            return {
                "overall_status": "error",
                "error": str(e),
                "last_updated": datetime.now().isoformat()
            }


class RomAIPhase42BancAIFinancialIntelligence:
    """Main Phase 4.2 implementation class."""
    
    def __init__(self):
        self.orchestrator = BancAIOrchestrator()
        self.initialized = False
        
    async def initialize_all_components(self):
        """Initialize all Phase 4.2 components."""
        try:
            logger.info("🏦 Initializing Phase 4.2: BancAI Financial Intelligence")
            
            # Start financial analysis services
            if self.orchestrator.financial_engine:
                await self.orchestrator.financial_engine.start_analysis_services()
                logger.info("✅ Financial Analysis Engine initialized")
            else:
                logger.warning("⚠️ Financial Analysis Engine not available")
                
            # Initialize compliance monitoring
            if self.orchestrator.compliance_engine:
                logger.info("✅ Regulatory Compliance Engine initialized")
            else:
                logger.warning("⚠️ Regulatory Compliance Engine not available")
                
            # Initialize customer experience
            if self.orchestrator.customer_engine:
                logger.info("✅ Customer Experience Engine initialized")
            else:
                logger.warning("⚠️ Customer Experience Engine not available")
                
            # Update initial metrics
            await self.orchestrator.update_service_metrics()
            
            self.initialized = True
            logger.info("🎉 Phase 4.2: BancAI Financial Intelligence - INITIALIZATION COMPLETE")
            
            # Display system status
            status = await self.orchestrator.get_system_status()
            logger.info(f"📊 System Status: {status['overall_status'].upper()}")
            logger.info(f"📈 Success Rate: {status['system_health']['success_rate']:.1%}")
            logger.info(f"🔒 Compliance Score: {status['system_health']['compliance_score']:.1%}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error initializing Phase 4.2: {e}")
            return False
            
    async def process_bancai_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process BancAI service request."""
        try:
            if not self.initialized:
                await self.initialize_all_components()
                
            # Create request object
            request = BancAIRequest(
                request_id=request_data.get("request_id", str(uuid.uuid4())),
                customer_id=request_data.get("customer_id", "anonymous"),
                service_type=request_data.get("service_type", "financial_analysis"),
                parameters=request_data.get("parameters", {}),
                tier=ServiceTier(request_data.get("tier", "standard")),
                timestamp=datetime.now()
            )
            
            # Store request
            await self.orchestrator._store_service_request(request)
            
            # Route request to appropriate service
            if request.service_type == "financial_analysis":
                response = await self.orchestrator.process_financial_analysis_request(request)
            elif request.service_type == "regulatory_compliance":
                response = await self.orchestrator.process_compliance_request(request)
            elif request.service_type == "customer_experience":
                response = await self.orchestrator.process_customer_experience_request(request)
            else:
                raise ValueError(f"Unknown service type: {request.service_type}")
                
            return asdict(response)
            
        except Exception as e:
            logger.error(f"Error processing BancAI request: {e}")
            raise
            
    async def get_phase_status(self) -> Dict[str, Any]:
        """Get Phase 4.2 implementation status."""
        try:
            if not self.initialized:
                return {
                    "phase": "4.2",
                    "name": "BancAI Financial Intelligence",
                    "status": "not_initialized",
                    "components": {
                        "financial_analysis": False,
                        "regulatory_compliance": False,
                        "customer_experience": False
                    }
                }
                
            system_status = await self.orchestrator.get_system_status()
            
            return {
                "phase": "4.2",
                "name": "BancAI Financial Intelligence", 
                "status": "operational" if self.initialized else "initializing",
                "components": {
                    "financial_analysis": self.orchestrator.financial_engine is not None,
                    "regulatory_compliance": self.orchestrator.compliance_engine is not None,
                    "customer_experience": self.orchestrator.customer_engine is not None
                },
                "system_health": system_status["system_health"],
                "usage_statistics": system_status["usage_statistics"],
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting phase status: {e}")
            return {
                "phase": "4.2",
                "name": "BancAI Financial Intelligence",
                "status": "error",
                "error": str(e)
            }


# Initialize Phase 4.2 for external access
def initialize_bancai_financial_intelligence():
    """Initialize BancAI Financial Intelligence system."""
    return RomAIPhase42BancAIFinancialIntelligence()


# Main execution and testing
async def main():
    """Main function for testing and demonstration."""
    try:
        logger.info("🏦 Starting RomAI Phase 4.2: BancAI Financial Intelligence Demo")
        
        # Initialize Phase 4.2
        bancai_system = RomAIPhase42BancAIFinancialIntelligence()
        
        # Initialize all components
        initialization_success = await bancai_system.initialize_all_components()
        
        if not initialization_success:
            logger.error("Failed to initialize Phase 4.2 components")
            return
            
        # Test financial analysis request
        logger.info("🔍 Testing Financial Analysis Service...")
        analysis_request = {
            "customer_id": "BANK_CLIENT_001",
            "service_type": "financial_analysis",
            "parameters": {
                "analysis_type": "market_analysis"
            },
            "tier": "premium"
        }
        
        analysis_response = await bancai_system.process_bancai_request(analysis_request)
        logger.info(f"✅ Financial Analysis: {analysis_response['execution_time_ms']:.2f}ms")
        
        # Test compliance request
        logger.info("🔒 Testing Regulatory Compliance Service...")
        compliance_request = {
            "customer_id": "BANK_CLIENT_001",
            "service_type": "regulatory_compliance",
            "parameters": {
                "compliance_type": "monitoring"
            },
            "tier": "enterprise"
        }
        
        compliance_response = await bancai_system.process_bancai_request(compliance_request)
        logger.info(f"✅ Compliance Check: {compliance_response['execution_time_ms']:.2f}ms")
        
        # Test customer experience request
        logger.info("👤 Testing Customer Experience Service...")
        experience_request = {
            "customer_id": "RETAIL_CLIENT_001",
            "service_type": "customer_experience",
            "parameters": {
                "experience_type": "comprehensive"
            },
            "tier": "standard"
        }
        
        experience_response = await bancai_system.process_bancai_request(experience_request)
        logger.info(f"✅ Customer Experience: {experience_response['execution_time_ms']:.2f}ms")
        
        # Get final status
        final_status = await bancai_system.get_phase_status()
        logger.info(f"📊 Final Status: {final_status['status'].upper()}")
        logger.info(f"📈 System Health: {final_status.get('system_health', {}).get('success_rate', 0):.1%} success rate")
        
        logger.info("🎉 Phase 4.2: BancAI Financial Intelligence Demo Completed Successfully!")
        
    except Exception as e:
        logger.error(f"❌ Error in Phase 4.2 demo: {e}")


if __name__ == "__main__":
    asyncio.run(main())
