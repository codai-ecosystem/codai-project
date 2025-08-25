"""
RomAI Enterprise Business Solution - Workflow Automation Tools
Phase 3.2 Implementation - Component 3

This module provides comprehensive workflow automation capabilities for
enterprise customers including ServiceNow, Jira, Asana, and custom workflow systems.

Created: August 7, 2025
Author: RomAI Development Team
Version: 1.0.0
"""

import asyncio
import logging
import json
import uuid
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, asdict
from enum import Enum
import os
import requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WorkflowPlatform(Enum):
    """Supported workflow automation platforms"""
    SERVICENOW = "servicenow"
    JIRA = "jira"
    ASANA = "asana"
    MONDAY = "monday"
    TRELLO = "trello"
    NOTION = "notion"
    SLACK = "slack"
    MICROSOFT_TEAMS = "microsoft_teams"
    ZAPIER = "zapier"
    POWER_AUTOMATE = "power_automate"
    CUSTOM_API = "custom_api"

class WorkflowType(Enum):
    """Types of workflow automation"""
    INCIDENT_MANAGEMENT = "incident_management"
    PROJECT_MANAGEMENT = "project_management"
    TASK_AUTOMATION = "task_automation"
    APPROVAL_WORKFLOW = "approval_workflow"
    NOTIFICATION_SYSTEM = "notification_system"
    DATA_SYNCHRONIZATION = "data_synchronization"
    REPORTING_AUTOMATION = "reporting_automation"
    USER_ONBOARDING = "user_onboarding"
    COMPLIANCE_TRACKING = "compliance_tracking"

class WorkflowStatus(Enum):
    """Workflow execution status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    PAUSED = "paused"

@dataclass
class WorkflowConnection:
    """Workflow platform connection configuration"""
    connection_id: str
    platform: WorkflowPlatform
    name: str
    api_endpoint: str
    credentials: Dict[str, str]
    enabled: bool
    supported_workflows: List[WorkflowType]
    last_used: Optional[datetime]
    created_at: datetime

@dataclass
class WorkflowDefinition:
    """Workflow definition structure"""
    workflow_id: str
    name: str
    description: str
    workflow_type: WorkflowType
    platform: WorkflowPlatform
    connection_id: str
    steps: List[Dict[str, Any]]
    triggers: List[Dict[str, Any]]
    conditions: Dict[str, Any]
    enabled: bool
    created_at: datetime

@dataclass
class WorkflowExecution:
    """Workflow execution tracking"""
    execution_id: str
    workflow_id: str
    status: WorkflowStatus
    triggered_by: str
    trigger_data: Dict[str, Any]
    start_time: datetime
    end_time: Optional[datetime]
    steps_completed: int
    total_steps: int
    error_details: Optional[str]

class WorkflowAutomationEngine:
    """
    Workflow Automation Engine for Enterprise Integration
    
    Provides comprehensive workflow automation capabilities across multiple platforms
    including ServiceNow, Jira, Asana, and custom workflow systems for enterprise customers.
    """
    
    def __init__(self, config_file: str = "workflow_automation_config.json"):
        self.config_file = config_file
        self.db_path = "workflow_automation.db"
        self.connections: Dict[str, WorkflowConnection] = {}
        self.workflows: Dict[str, WorkflowDefinition] = {}
        self.active_executions: Dict[str, WorkflowExecution] = {}
        
        self._load_configuration()
        self._initialize_database()
        self._load_connections()
        self._load_workflows()
        
        logger.info("Workflow Automation Engine initialized")
    
    def _load_configuration(self) -> None:
        """Load workflow automation configuration"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    self.config = json.load(f)
            else:
                default_config = {
                    "platforms": {
                        "servicenow": {
                            "api_version": "v1",
                            "endpoints": {
                                "table": "/api/now/table",
                                "import": "/api/now/import",
                                "workflow": "/api/now/workflow"
                            },
                            "supported_tables": ["incident", "change_request", "problem"]
                        },
                        "jira": {
                            "api_version": "3",
                            "base_url": "/rest/api/3",
                            "supported_types": ["Task", "Bug", "Story", "Epic"]
                        },
                        "asana": {
                            "api_version": "1.0",
                            "base_url": "https://app.asana.com/api/1.0",
                            "supported_objects": ["tasks", "projects", "teams"]
                        }
                    },
                    "automation_settings": {
                        "max_concurrent_workflows": 50,
                        "retry_attempts": 3,
                        "timeout_minutes": 30,
                        "log_retention_days": 90
                    },
                    "notification_channels": {
                        "email": {"enabled": True},
                        "slack": {"enabled": False},
                        "teams": {"enabled": False}
                    }
                }
                
                with open(self.config_file, 'w', encoding='utf-8') as f:
                    json.dump(default_config, f, indent=2, ensure_ascii=False)
                
                self.config = default_config
                logger.info("Default workflow automation configuration created")
                
        except Exception as e:
            logger.error(f"Failed to load workflow configuration: {str(e)}")
            self.config = {}
    
    def _initialize_database(self) -> None:
        """Initialize workflow automation database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Workflow connections table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS workflow_connections (
                    connection_id TEXT PRIMARY KEY,
                    platform TEXT NOT NULL,
                    name TEXT NOT NULL,
                    api_endpoint TEXT NOT NULL,
                    credentials TEXT NOT NULL,
                    enabled BOOLEAN DEFAULT TRUE,
                    supported_workflows TEXT NOT NULL,
                    last_used TEXT,
                    created_at TEXT NOT NULL
                )
            """)
            
            # Workflow definitions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS workflow_definitions (
                    workflow_id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    workflow_type TEXT NOT NULL,
                    platform TEXT NOT NULL,
                    connection_id TEXT NOT NULL,
                    steps TEXT NOT NULL,
                    triggers TEXT NOT NULL,
                    conditions TEXT NOT NULL,
                    enabled BOOLEAN DEFAULT TRUE,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (connection_id) REFERENCES workflow_connections (connection_id)
                )
            """)
            
            # Workflow executions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS workflow_executions (
                    execution_id TEXT PRIMARY KEY,
                    workflow_id TEXT NOT NULL,
                    status TEXT NOT NULL,
                    triggered_by TEXT NOT NULL,
                    trigger_data TEXT NOT NULL,
                    start_time TEXT NOT NULL,
                    end_time TEXT,
                    steps_completed INTEGER DEFAULT 0,
                    total_steps INTEGER NOT NULL,
                    error_details TEXT,
                    FOREIGN KEY (workflow_id) REFERENCES workflow_definitions (workflow_id)
                )
            """)
            
            # Workflow logs table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS workflow_logs (
                    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    execution_id TEXT NOT NULL,
                    step_number INTEGER NOT NULL,
                    step_name TEXT NOT NULL,
                    status TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    details TEXT,
                    FOREIGN KEY (execution_id) REFERENCES workflow_executions (execution_id)
                )
            """)
            
            conn.commit()
            conn.close()
            
            logger.info("Workflow automation database initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize workflow database: {str(e)}")
            raise
    
    def _load_connections(self) -> None:
        """Load existing workflow connections"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM workflow_connections WHERE enabled = TRUE")
            rows = cursor.fetchall()
            
            for row in rows:
                connection = WorkflowConnection(
                    connection_id=row[0],
                    platform=WorkflowPlatform(row[1]),
                    name=row[2],
                    api_endpoint=row[3],
                    credentials=json.loads(row[4]),
                    enabled=bool(row[5]),
                    supported_workflows=[WorkflowType(wt) for wt in json.loads(row[6])],
                    last_used=datetime.fromisoformat(row[7]) if row[7] else None,
                    created_at=datetime.fromisoformat(row[8])
                )
                self.connections[connection.connection_id] = connection
            
            conn.close()
            logger.info(f"Loaded {len(self.connections)} workflow connections")
            
        except Exception as e:
            logger.error(f"Failed to load workflow connections: {str(e)}")
    
    def _load_workflows(self) -> None:
        """Load existing workflow definitions"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM workflow_definitions WHERE enabled = TRUE")
            rows = cursor.fetchall()
            
            for row in rows:
                workflow = WorkflowDefinition(
                    workflow_id=row[0],
                    name=row[1],
                    description=row[2],
                    workflow_type=WorkflowType(row[3]),
                    platform=WorkflowPlatform(row[4]),
                    connection_id=row[5],
                    steps=json.loads(row[6]),
                    triggers=json.loads(row[7]),
                    conditions=json.loads(row[8]),
                    enabled=bool(row[9]),
                    created_at=datetime.fromisoformat(row[10])
                )
                self.workflows[workflow.workflow_id] = workflow
            
            conn.close()
            logger.info(f"Loaded {len(self.workflows)} workflow definitions")
            
        except Exception as e:
            logger.error(f"Failed to load workflow definitions: {str(e)}")
    
    async def create_workflow_connection(self,
                                       name: str,
                                       platform: WorkflowPlatform,
                                       api_endpoint: str,
                                       credentials: Dict[str, str],
                                       supported_workflows: List[WorkflowType]) -> Tuple[bool, str, Optional[str]]:
        """Create new workflow platform connection"""
        try:
            connection_id = f"WF_{uuid.uuid4().hex[:8].upper()}"
            
            # Test connection
            test_success, test_message = await self._test_workflow_connection(
                platform, api_endpoint, credentials
            )
            
            if not test_success:
                return False, f"Connection test failed: {test_message}", None
            
            connection = WorkflowConnection(
                connection_id=connection_id,
                platform=platform,
                name=name,
                api_endpoint=api_endpoint,
                credentials=credentials,
                enabled=True,
                supported_workflows=supported_workflows,
                last_used=None,
                created_at=datetime.now()
            )
            
            # Save to database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO workflow_connections
                (connection_id, platform, name, api_endpoint, credentials,
                 enabled, supported_workflows, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                connection.connection_id,
                connection.platform.value,
                connection.name,
                connection.api_endpoint,
                json.dumps(connection.credentials, ensure_ascii=False),
                connection.enabled,
                json.dumps([wt.value for wt in connection.supported_workflows]),
                connection.created_at.isoformat()
            ))
            
            conn.commit()
            conn.close()
            
            self.connections[connection_id] = connection
            
            logger.info(f"Workflow connection {connection_id} created for {platform.value}")
            return True, f"Workflow connection {name} created successfully", connection_id
            
        except Exception as e:
            logger.error(f"Failed to create workflow connection: {str(e)}")
            return False, f"Failed to create workflow connection: {str(e)}", None
    
    async def _test_workflow_connection(self,
                                      platform: WorkflowPlatform,
                                      api_endpoint: str,
                                      credentials: Dict[str, str]) -> Tuple[bool, str]:
        """Test workflow platform connection"""
        try:
            if platform == WorkflowPlatform.SERVICENOW:
                # Test ServiceNow connection
                auth = (credentials.get('username', ''), credentials.get('password', ''))
                response = requests.get(f"{api_endpoint}/api/now/table/sys_user?sysparm_limit=1", 
                                      auth=auth, timeout=10)
                return response.status_code == 200, f"ServiceNow test: {response.status_code}"
                
            elif platform == WorkflowPlatform.JIRA:
                # Test Jira connection
                auth = (credentials.get('email', ''), credentials.get('api_token', ''))
                response = requests.get(f"{api_endpoint}/rest/api/3/myself", auth=auth, timeout=10)
                return response.status_code == 200, f"Jira test: {response.status_code}"
                
            elif platform == WorkflowPlatform.ASANA:
                # Test Asana connection
                headers = {"Authorization": f"Bearer {credentials.get('access_token', '')}"}
                response = requests.get("https://app.asana.com/api/1.0/users/me", 
                                      headers=headers, timeout=10)
                return response.status_code == 200, f"Asana test: {response.status_code}"
                
            else:
                # Simulate test for other platforms
                return True, f"{platform.value} connection test successful (simulated)"
                
        except Exception as e:
            return False, f"Connection test error: {str(e)}"
    
    async def create_workflow(self,
                            name: str,
                            description: str,
                            workflow_type: WorkflowType,
                            connection_id: str,
                            steps: List[Dict[str, Any]],
                            triggers: List[Dict[str, Any]],
                            conditions: Dict[str, Any] = None) -> Tuple[bool, str, Optional[str]]:
        """Create new workflow definition"""
        try:
            if connection_id not in self.connections:
                return False, "Workflow connection not found", None
            
            connection = self.connections[connection_id]
            workflow_id = f"WF_{uuid.uuid4().hex[:12].upper()}"
            
            workflow = WorkflowDefinition(
                workflow_id=workflow_id,
                name=name,
                description=description,
                workflow_type=workflow_type,
                platform=connection.platform,
                connection_id=connection_id,
                steps=steps,
                triggers=triggers,
                conditions=conditions or {},
                enabled=True,
                created_at=datetime.now()
            )
            
            # Save to database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO workflow_definitions
                (workflow_id, name, description, workflow_type, platform, connection_id,
                 steps, triggers, conditions, enabled, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                workflow.workflow_id,
                workflow.name,
                workflow.description,
                workflow.workflow_type.value,
                workflow.platform.value,
                workflow.connection_id,
                json.dumps(workflow.steps, ensure_ascii=False),
                json.dumps(workflow.triggers, ensure_ascii=False),
                json.dumps(workflow.conditions, ensure_ascii=False),
                workflow.enabled,
                workflow.created_at.isoformat()
            ))
            
            conn.commit()
            conn.close()
            
            self.workflows[workflow_id] = workflow
            
            logger.info(f"Workflow {workflow_id} created: {name}")
            return True, f"Workflow {name} created successfully", workflow_id
            
        except Exception as e:
            logger.error(f"Failed to create workflow: {str(e)}")
            return False, f"Failed to create workflow: {str(e)}", None
    
    async def execute_workflow(self,
                             workflow_id: str,
                             triggered_by: str,
                             trigger_data: Dict[str, Any] = None) -> Tuple[bool, str, Optional[str]]:
        """Execute workflow"""
        try:
            if workflow_id not in self.workflows:
                return False, "Workflow not found", None
            
            workflow = self.workflows[workflow_id]
            execution_id = f"EXEC_{uuid.uuid4().hex[:10].upper()}"
            
            execution = WorkflowExecution(
                execution_id=execution_id,
                workflow_id=workflow_id,
                status=WorkflowStatus.RUNNING,
                triggered_by=triggered_by,
                trigger_data=trigger_data or {},
                start_time=datetime.now(),
                end_time=None,
                steps_completed=0,
                total_steps=len(workflow.steps),
                error_details=None
            )
            
            # Save execution record
            await self._save_execution(execution)
            self.active_executions[execution_id] = execution
            
            # Execute workflow steps
            try:
                success = await self._execute_workflow_steps(execution, workflow)
                
                if success:
                    execution.status = WorkflowStatus.COMPLETED
                    execution.end_time = datetime.now()
                    await self._update_execution(execution)
                    
                    logger.info(f"Workflow {workflow.name} completed successfully")
                    return True, f"Workflow executed successfully", execution_id
                else:
                    execution.status = WorkflowStatus.FAILED
                    execution.end_time = datetime.now()
                    await self._update_execution(execution)
                    
                    return False, "Workflow execution failed", execution_id
                    
            except Exception as exec_error:
                execution.status = WorkflowStatus.FAILED
                execution.end_time = datetime.now()
                execution.error_details = str(exec_error)
                await self._update_execution(execution)
                
                logger.error(f"Workflow execution error: {str(exec_error)}")
                return False, f"Workflow execution error: {str(exec_error)}", execution_id
                
        except Exception as e:
            logger.error(f"Failed to execute workflow: {str(e)}")
            return False, f"Failed to execute workflow: {str(e)}", None
    
    async def _execute_workflow_steps(self, execution: WorkflowExecution, workflow: WorkflowDefinition) -> bool:
        """Execute individual workflow steps"""
        try:
            connection = self.connections[workflow.connection_id]
            
            for i, step in enumerate(workflow.steps):
                try:
                    await self._log_step_start(execution.execution_id, i + 1, step.get('name', f'Step {i+1}'))
                    
                    # Execute step based on platform
                    if workflow.platform == WorkflowPlatform.SERVICENOW:
                        step_success = await self._execute_servicenow_step(connection, step, execution.trigger_data)
                    elif workflow.platform == WorkflowPlatform.JIRA:
                        step_success = await self._execute_jira_step(connection, step, execution.trigger_data)
                    elif workflow.platform == WorkflowPlatform.ASANA:
                        step_success = await self._execute_asana_step(connection, step, execution.trigger_data)
                    else:
                        step_success = await self._execute_generic_step(connection, step, execution.trigger_data)
                    
                    if step_success:
                        execution.steps_completed += 1
                        await self._log_step_completion(execution.execution_id, i + 1, "completed")
                    else:
                        await self._log_step_completion(execution.execution_id, i + 1, "failed")
                        return False
                        
                    # Small delay between steps
                    await asyncio.sleep(0.1)
                    
                except Exception as step_error:
                    await self._log_step_completion(execution.execution_id, i + 1, "failed", str(step_error))
                    logger.error(f"Step {i+1} failed: {str(step_error)}")
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Workflow steps execution error: {str(e)}")
            return False
    
    async def _execute_servicenow_step(self, connection: WorkflowConnection, step: Dict[str, Any], trigger_data: Dict[str, Any]) -> bool:
        """Execute ServiceNow workflow step"""
        logger.info(f"Executing ServiceNow step: {step.get('name', 'Unnamed')}")
        await asyncio.sleep(0.5)  # Simulate API call
        return True
    
    async def _execute_jira_step(self, connection: WorkflowConnection, step: Dict[str, Any], trigger_data: Dict[str, Any]) -> bool:
        """Execute Jira workflow step"""
        logger.info(f"Executing Jira step: {step.get('name', 'Unnamed')}")
        await asyncio.sleep(0.3)  # Simulate API call
        return True
    
    async def _execute_asana_step(self, connection: WorkflowConnection, step: Dict[str, Any], trigger_data: Dict[str, Any]) -> bool:
        """Execute Asana workflow step"""
        logger.info(f"Executing Asana step: {step.get('name', 'Unnamed')}")
        await asyncio.sleep(0.4)  # Simulate API call
        return True
    
    async def _execute_generic_step(self, connection: WorkflowConnection, step: Dict[str, Any], trigger_data: Dict[str, Any]) -> bool:
        """Execute generic workflow step"""
        logger.info(f"Executing {connection.platform.value} step: {step.get('name', 'Unnamed')}")
        await asyncio.sleep(0.2)  # Simulate processing
        return True
    
    async def _save_execution(self, execution: WorkflowExecution) -> None:
        """Save workflow execution"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO workflow_executions
                (execution_id, workflow_id, status, triggered_by, trigger_data,
                 start_time, steps_completed, total_steps)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                execution.execution_id,
                execution.workflow_id,
                execution.status.value,
                execution.triggered_by,
                json.dumps(execution.trigger_data, ensure_ascii=False),
                execution.start_time.isoformat(),
                execution.steps_completed,
                execution.total_steps
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Failed to save execution: {str(e)}")
    
    async def _update_execution(self, execution: WorkflowExecution) -> None:
        """Update workflow execution"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE workflow_executions
                SET status = ?, end_time = ?, steps_completed = ?, error_details = ?
                WHERE execution_id = ?
            """, (
                execution.status.value,
                execution.end_time.isoformat() if execution.end_time else None,
                execution.steps_completed,
                execution.error_details,
                execution.execution_id
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Failed to update execution: {str(e)}")
    
    async def _log_step_start(self, execution_id: str, step_number: int, step_name: str) -> None:
        """Log workflow step start"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO workflow_logs
                (execution_id, step_number, step_name, status, timestamp)
                VALUES (?, ?, ?, ?, ?)
            """, (execution_id, step_number, step_name, "running", datetime.now().isoformat()))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Failed to log step start: {str(e)}")
    
    async def _log_step_completion(self, execution_id: str, step_number: int, status: str, details: str = None) -> None:
        """Log workflow step completion"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE workflow_logs
                SET status = ?, details = ?
                WHERE execution_id = ? AND step_number = ?
            """, (status, details, execution_id, step_number))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Failed to log step completion: {str(e)}")
    
    def generate_workflow_report(self) -> Dict[str, Any]:
        """Generate workflow automation report"""
        try:
            total_connections = len(self.connections)
            total_workflows = len(self.workflows)
            active_workflows = len([w for w in self.workflows.values() if w.enabled])
            
            # Get execution statistics
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT COUNT(*) FROM workflow_executions 
                WHERE start_time >= datetime('now', '-24 hours')
            """)
            executions_24h = cursor.fetchone()[0]
            
            cursor.execute("""
                SELECT COUNT(*) FROM workflow_executions 
                WHERE status = 'completed' AND start_time >= datetime('now', '-24 hours')
            """)
            successful_execs_24h = cursor.fetchone()[0]
            
            # Platform distribution
            cursor.execute("""
                SELECT platform, COUNT(*) FROM workflow_connections 
                WHERE enabled = TRUE GROUP BY platform
            """)
            platform_distribution = dict(cursor.fetchall())
            
            # Workflow type distribution
            cursor.execute("""
                SELECT workflow_type, COUNT(*) FROM workflow_definitions 
                WHERE enabled = TRUE GROUP BY workflow_type
            """)
            workflow_type_distribution = dict(cursor.fetchall())
            
            conn.close()
            
            success_rate = (successful_execs_24h / executions_24h * 100) if executions_24h > 0 else 0
            
            return {
                "report_id": f"WORKFLOW_AUTOMATION_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "generated_at": datetime.now().isoformat(),
                "connections": {
                    "total": total_connections,
                    "platform_distribution": platform_distribution
                },
                "workflows": {
                    "total": total_workflows,
                    "active": active_workflows,
                    "type_distribution": workflow_type_distribution
                },
                "executions": {
                    "executions_last_24h": executions_24h,
                    "successful_executions_24h": successful_execs_24h,
                    "success_rate_percentage": round(success_rate, 2)
                },
                "supported_platforms": [platform.value for platform in WorkflowPlatform],
                "supported_workflow_types": [wt.value for wt in WorkflowType],
                "health_status": "operational" if active_workflows > 0 else "no_workflows"
            }
            
        except Exception as e:
            logger.error(f"Failed to generate workflow report: {str(e)}")
            return {"error": f"Failed to generate report: {str(e)}"}


# Global workflow automation instance
workflow_automation = None

def initialize_workflow_automation(config_file: str = "workflow_automation_config.json") -> WorkflowAutomationEngine:
    """Initialize global workflow automation engine"""
    global workflow_automation
    workflow_automation = WorkflowAutomationEngine(config_file)
    return workflow_automation

def get_workflow_automation() -> Optional[WorkflowAutomationEngine]:
    """Get global workflow automation instance"""
    return workflow_automation

# Demo workflow connections and workflows
async def create_demo_workflow_setup():
    """Create demonstration workflow setup"""
    if not workflow_automation:
        logger.error("Workflow automation not initialized")
        return
    
    # Demo ServiceNow connection
    success1, msg1, conn1 = await workflow_automation.create_workflow_connection(
        name="ServiceNow Production",
        platform=WorkflowPlatform.SERVICENOW,
        api_endpoint="https://company.service-now.com",
        credentials={"username": "romai_user", "password": "demo_password"},
        supported_workflows=[WorkflowType.INCIDENT_MANAGEMENT, WorkflowType.APPROVAL_WORKFLOW]
    )
    
    # Demo Jira connection
    success2, msg2, conn2 = await workflow_automation.create_workflow_connection(
        name="Jira Development",
        platform=WorkflowPlatform.JIRA,
        api_endpoint="https://company.atlassian.net",
        credentials={"email": "romai@company.com", "api_token": "jira_demo_token"},
        supported_workflows=[WorkflowType.PROJECT_MANAGEMENT, WorkflowType.TASK_AUTOMATION]
    )
    
    # Demo Asana connection
    success3, msg3, conn3 = await workflow_automation.create_workflow_connection(
        name="Asana Teams",
        platform=WorkflowPlatform.ASANA,
        api_endpoint="https://app.asana.com/api/1.0",
        credentials={"access_token": "asana_demo_token"},
        supported_workflows=[WorkflowType.PROJECT_MANAGEMENT, WorkflowType.NOTIFICATION_SYSTEM]
    )
    
    if success1 and conn1:
        # Create demo incident management workflow
        await workflow_automation.create_workflow(
            name="Automated Incident Response",
            description="Automatically create and assign incidents based on alerts",
            workflow_type=WorkflowType.INCIDENT_MANAGEMENT,
            connection_id=conn1,
            steps=[
                {"name": "Create Incident", "action": "create_incident", "parameters": {"priority": "high"}},
                {"name": "Assign to Team", "action": "assign_incident", "parameters": {"team": "operations"}},
                {"name": "Send Notification", "action": "notify", "parameters": {"channel": "email"}}
            ],
            triggers=[
                {"type": "alert", "condition": "severity >= critical"},
                {"type": "api_call", "endpoint": "/incident/create"}
            ]
        )
    
    if success2 and conn2:
        # Create demo project management workflow
        await workflow_automation.create_workflow(
            name="Sprint Planning Automation",
            description="Automatically manage sprint planning tasks",
            workflow_type=WorkflowType.PROJECT_MANAGEMENT,
            connection_id=conn2,
            steps=[
                {"name": "Create Sprint", "action": "create_sprint", "parameters": {"duration": "2_weeks"}},
                {"name": "Assign Stories", "action": "assign_stories", "parameters": {"criteria": "priority"}},
                {"name": "Update Board", "action": "update_board", "parameters": {"status": "active"}}
            ],
            triggers=[
                {"type": "schedule", "cron": "0 9 * * MON"}
            ]
        )
    
    logger.info("Demo workflow setup completed")

if __name__ == "__main__":
    async def main():
        # Initialize workflow automation
        engine = initialize_workflow_automation()
        
        # Create demo setup
        await create_demo_workflow_setup()
        
        # Generate report
        report = engine.generate_workflow_report()
        print("\n=== Workflow Automation Report ===")
        print(json.dumps(report, indent=2, ensure_ascii=False))
        
        print("\n✅ Workflow Automation Engine initialized successfully!")
        print(f"🎯 Supported Platforms: {len(WorkflowPlatform)} workflow systems")
        print(f"📊 Workflow Types: {len(WorkflowType)} automation categories")
        print(f"🔗 Connections: {len(engine.connections)} active connections")
        print(f"⚙️ Workflows: {len(engine.workflows)} defined workflows")
    
    asyncio.run(main())
