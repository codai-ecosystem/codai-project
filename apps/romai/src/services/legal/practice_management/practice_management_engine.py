"""
RomAI Phase 4.3: LegalizAI Legal Excellence - Practice Management Engine
Advanced legal practice management with case management and client communication.

This module implements the Practice Management component including:
- Comprehensive case management with timeline tracking
- Client communication and relationship management
- Billing and time tracking automation
- Legal workflow and task automation
- Document and evidence management

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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CaseStatus(Enum):
    """Legal case status types."""
    ACTIVE = "active"
    PENDING = "pending"
    CLOSED = "closed"
    SUSPENDED = "suspended"
    APPEAL = "appeal"
    SETTLED = "settled"
    DISMISSED = "dismissed"


class CaseType(Enum):
    """Legal case types."""
    CIVIL = "civil"
    CRIMINAL = "criminal"
    COMMERCIAL = "commercial"
    ADMINISTRATIVE = "administrative"
    FAMILY = "family"
    LABOR = "labor"
    INTELLECTUAL_PROPERTY = "intellectual_property"
    REAL_ESTATE = "real_estate"
    BANKRUPTCY = "bankruptcy"
    TAX = "tax"


class ClientType(Enum):
    """Client types."""
    INDIVIDUAL = "individual"
    COMPANY = "company"
    ORGANIZATION = "organization"
    GOVERNMENT = "government"


class TaskPriority(Enum):
    """Task priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TaskStatus(Enum):
    """Task status types."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    OVERDUE = "overdue"


@dataclass
class LegalClient:
    """Legal client structure."""
    client_id: str
    name: str
    client_type: ClientType
    contact_info: Dict[str, str]
    registration_number: Optional[str]
    tax_number: Optional[str]
    address: str
    phone: str
    email: str
    preferred_language: str
    billing_address: Optional[str]
    payment_terms: str
    client_since: datetime
    last_contact: datetime
    total_cases: int
    active_cases: int
    notes: str


@dataclass
class LegalCase:
    """Legal case structure."""
    case_id: str
    case_number: str
    title: str
    case_type: CaseType
    status: CaseStatus
    client_id: str
    opposing_party: str
    court: Optional[str]
    judge: Optional[str]
    case_value: Optional[float]
    currency: str
    description: str
    created_date: datetime
    start_date: datetime
    expected_end_date: Optional[datetime]
    actual_end_date: Optional[datetime]
    last_update: datetime
    assigned_lawyers: List[str]
    documents: List[str]
    tasks: List[str]
    billable_hours: float
    total_fees: float
    notes: str


@dataclass
class LegalTask:
    """Legal task structure."""
    task_id: str
    case_id: str
    title: str
    description: str
    task_type: str
    priority: TaskPriority
    status: TaskStatus
    assigned_to: str
    created_by: str
    created_date: datetime
    due_date: datetime
    completed_date: Optional[datetime]
    estimated_hours: float
    actual_hours: float
    dependencies: List[str]
    attachments: List[str]
    notes: str


@dataclass
class TimeEntry:
    """Time tracking entry structure."""
    entry_id: str
    case_id: str
    task_id: Optional[str]
    lawyer_id: str
    activity_description: str
    start_time: datetime
    end_time: datetime
    duration_hours: float
    billable: bool
    hourly_rate: float
    total_amount: float
    date_recorded: datetime
    invoice_id: Optional[str]
    notes: str


@dataclass
class LegalDocument:
    """Legal document structure."""
    document_id: str
    case_id: str
    title: str
    document_type: str
    file_path: str
    file_size: int
    created_date: datetime
    modified_date: datetime
    created_by: str
    access_level: str
    tags: List[str]
    version: str
    checksum: str
    notes: str


class CaseManager:
    """Comprehensive case management system."""
    
    def __init__(self, db_path: str = "legal_practice.db"):
        self.db_path = db_path
        self._init_database()
        
    def _init_database(self):
        """Initialize practice management database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Clients table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS clients (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    client_id TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    client_type TEXT NOT NULL,
                    contact_info TEXT,
                    registration_number TEXT,
                    tax_number TEXT,
                    address TEXT,
                    phone TEXT,
                    email TEXT,
                    preferred_language TEXT DEFAULT 'ro',
                    billing_address TEXT,
                    payment_terms TEXT DEFAULT '30_days',
                    client_since TEXT NOT NULL,
                    last_contact TEXT,
                    total_cases INTEGER DEFAULT 0,
                    active_cases INTEGER DEFAULT 0,
                    notes TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Cases table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS cases (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    case_id TEXT UNIQUE NOT NULL,
                    case_number TEXT UNIQUE NOT NULL,
                    title TEXT NOT NULL,
                    case_type TEXT NOT NULL,
                    status TEXT NOT NULL,
                    client_id TEXT NOT NULL,
                    opposing_party TEXT,
                    court TEXT,
                    judge TEXT,
                    case_value REAL,
                    currency TEXT DEFAULT 'RON',
                    description TEXT,
                    created_date TEXT NOT NULL,
                    start_date TEXT NOT NULL,
                    expected_end_date TEXT,
                    actual_end_date TEXT,
                    last_update TEXT NOT NULL,
                    assigned_lawyers TEXT,
                    documents TEXT,
                    tasks TEXT,
                    billable_hours REAL DEFAULT 0.0,
                    total_fees REAL DEFAULT 0.0,
                    notes TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (client_id) REFERENCES clients (client_id)
                )
            """)
            
            # Tasks table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_id TEXT UNIQUE NOT NULL,
                    case_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT,
                    task_type TEXT NOT NULL,
                    priority TEXT NOT NULL,
                    status TEXT NOT NULL,
                    assigned_to TEXT NOT NULL,
                    created_by TEXT NOT NULL,
                    created_date TEXT NOT NULL,
                    due_date TEXT NOT NULL,
                    completed_date TEXT,
                    estimated_hours REAL DEFAULT 0.0,
                    actual_hours REAL DEFAULT 0.0,
                    dependencies TEXT,
                    attachments TEXT,
                    notes TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (case_id) REFERENCES cases (case_id)
                )
            """)
            
            # Time entries table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS time_entries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    entry_id TEXT UNIQUE NOT NULL,
                    case_id TEXT NOT NULL,
                    task_id TEXT,
                    lawyer_id TEXT NOT NULL,
                    activity_description TEXT NOT NULL,
                    start_time TEXT NOT NULL,
                    end_time TEXT NOT NULL,
                    duration_hours REAL NOT NULL,
                    billable BOOLEAN DEFAULT 1,
                    hourly_rate REAL NOT NULL,
                    total_amount REAL NOT NULL,
                    date_recorded TEXT NOT NULL,
                    invoice_id TEXT,
                    notes TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (case_id) REFERENCES cases (case_id)
                )
            """)
            
            # Documents table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS documents (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    document_id TEXT UNIQUE NOT NULL,
                    case_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    document_type TEXT NOT NULL,
                    file_path TEXT NOT NULL,
                    file_size INTEGER,
                    created_date TEXT NOT NULL,
                    modified_date TEXT NOT NULL,
                    created_by TEXT NOT NULL,
                    access_level TEXT DEFAULT 'restricted',
                    tags TEXT,
                    version TEXT DEFAULT '1.0',
                    checksum TEXT,
                    notes TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (case_id) REFERENCES cases (case_id)
                )
            """)
            
            conn.commit()
            conn.close()
            logger.info("Practice management database initialized")
            
        except Exception as e:
            logger.error(f"Error initializing practice database: {e}")
            
    async def create_client(self, client_data: Dict[str, Any]) -> LegalClient:
        """Create new legal client."""
        try:
            client_id = str(uuid.uuid4())
            
            client = LegalClient(
                client_id=client_id,
                name=client_data["name"],
                client_type=ClientType(client_data.get("client_type", "individual")),
                contact_info=client_data.get("contact_info", {}),
                registration_number=client_data.get("registration_number"),
                tax_number=client_data.get("tax_number"),
                address=client_data.get("address", ""),
                phone=client_data.get("phone", ""),
                email=client_data.get("email", ""),
                preferred_language=client_data.get("preferred_language", "ro"),
                billing_address=client_data.get("billing_address"),
                payment_terms=client_data.get("payment_terms", "30_days"),
                client_since=datetime.now(),
                last_contact=datetime.now(),
                total_cases=0,
                active_cases=0,
                notes=client_data.get("notes", "")
            )
            
            # Store in database
            await self._store_client(client)
            
            logger.info(f"Created client: {client.name}")
            return client
            
        except Exception as e:
            logger.error(f"Error creating client: {e}")
            raise
            
    async def create_case(self, case_data: Dict[str, Any]) -> LegalCase:
        """Create new legal case."""
        try:
            case_id = str(uuid.uuid4())
            case_number = f"CASE-{datetime.now().strftime('%Y%m%d')}-{case_id[:8].upper()}"
            
            case = LegalCase(
                case_id=case_id,
                case_number=case_number,
                title=case_data["title"],
                case_type=CaseType(case_data["case_type"]),
                status=CaseStatus.ACTIVE,
                client_id=case_data["client_id"],
                opposing_party=case_data.get("opposing_party", ""),
                court=case_data.get("court"),
                judge=case_data.get("judge"),
                case_value=case_data.get("case_value"),
                currency=case_data.get("currency", "RON"),
                description=case_data.get("description", ""),
                created_date=datetime.now(),
                start_date=datetime.now(),
                expected_end_date=case_data.get("expected_end_date"),
                actual_end_date=None,
                last_update=datetime.now(),
                assigned_lawyers=case_data.get("assigned_lawyers", []),
                documents=[],
                tasks=[],
                billable_hours=0.0,
                total_fees=0.0,
                notes=case_data.get("notes", "")
            )
            
            # Store in database
            await self._store_case(case)
            
            # Update client statistics
            await self._update_client_case_count(case.client_id, increment=True)
            
            logger.info(f"Created case: {case.case_number}")
            return case
            
        except Exception as e:
            logger.error(f"Error creating case: {e}")
            raise
            
    async def create_task(self, task_data: Dict[str, Any]) -> LegalTask:
        """Create new legal task."""
        try:
            task_id = str(uuid.uuid4())
            
            task = LegalTask(
                task_id=task_id,
                case_id=task_data["case_id"],
                title=task_data["title"],
                description=task_data.get("description", ""),
                task_type=task_data.get("task_type", "general"),
                priority=TaskPriority(task_data.get("priority", "medium")),
                status=TaskStatus.PENDING,
                assigned_to=task_data["assigned_to"],
                created_by=task_data["created_by"],
                created_date=datetime.now(),
                due_date=task_data["due_date"],
                completed_date=None,
                estimated_hours=task_data.get("estimated_hours", 0.0),
                actual_hours=0.0,
                dependencies=task_data.get("dependencies", []),
                attachments=task_data.get("attachments", []),
                notes=task_data.get("notes", "")
            )
            
            # Store in database
            await self._store_task(task)
            
            logger.info(f"Created task: {task.title}")
            return task
            
        except Exception as e:
            logger.error(f"Error creating task: {e}")
            raise
            
    async def log_time_entry(self, time_data: Dict[str, Any]) -> TimeEntry:
        """Log time entry for case/task."""
        try:
            entry_id = str(uuid.uuid4())
            
            start_time = time_data["start_time"]
            end_time = time_data["end_time"]
            duration = (end_time - start_time).total_seconds() / 3600  # Convert to hours
            
            hourly_rate = time_data.get("hourly_rate", 100.0)
            total_amount = duration * hourly_rate if time_data.get("billable", True) else 0.0
            
            time_entry = TimeEntry(
                entry_id=entry_id,
                case_id=time_data["case_id"],
                task_id=time_data.get("task_id"),
                lawyer_id=time_data["lawyer_id"],
                activity_description=time_data["activity_description"],
                start_time=start_time,
                end_time=end_time,
                duration_hours=duration,
                billable=time_data.get("billable", True),
                hourly_rate=hourly_rate,
                total_amount=total_amount,
                date_recorded=datetime.now(),
                invoice_id=None,
                notes=time_data.get("notes", "")
            )
            
            # Store in database
            await self._store_time_entry(time_entry)
            
            # Update case billable hours and fees
            await self._update_case_billing(time_entry.case_id, duration, total_amount)
            
            logger.info(f"Logged time entry: {duration:.2f}h for case {time_entry.case_id}")
            return time_entry
            
        except Exception as e:
            logger.error(f"Error logging time entry: {e}")
            raise
            
    async def get_case_overview(self, case_id: str) -> Dict[str, Any]:
        """Get comprehensive case overview."""
        try:
            # Get case details
            case = await self._get_case_by_id(case_id)
            if not case:
                raise ValueError(f"Case not found: {case_id}")
                
            # Get client details
            client = await self._get_client_by_id(case["client_id"])
            
            # Get case tasks
            tasks = await self._get_case_tasks(case_id)
            
            # Get case documents
            documents = await self._get_case_documents(case_id)
            
            # Get time entries
            time_entries = await self._get_case_time_entries(case_id)
            
            # Calculate statistics
            total_time = sum(entry["duration_hours"] for entry in time_entries)
            total_fees = sum(entry["total_amount"] for entry in time_entries if entry["billable"])
            
            pending_tasks = len([t for t in tasks if t["status"] == "pending"])
            overdue_tasks = len([t for t in tasks if t["status"] == "overdue"])
            
            overview = {
                "case": case,
                "client": client,
                "statistics": {
                    "total_time_hours": total_time,
                    "total_fees": total_fees,
                    "total_tasks": len(tasks),
                    "pending_tasks": pending_tasks,
                    "overdue_tasks": overdue_tasks,
                    "total_documents": len(documents)
                },
                "recent_activity": {
                    "tasks": tasks[:5],  # Last 5 tasks
                    "time_entries": time_entries[:5],  # Last 5 time entries
                    "documents": documents[:5]  # Last 5 documents
                },
                "next_deadlines": await self._get_upcoming_deadlines(case_id)
            }
            
            return overview
            
        except Exception as e:
            logger.error(f"Error getting case overview: {e}")
            raise
            
    async def get_dashboard_data(self) -> Dict[str, Any]:
        """Get practice management dashboard data."""
        try:
            # Get summary statistics
            stats = await self._get_practice_statistics()
            
            # Get recent cases
            recent_cases = await self._get_recent_cases(limit=5)
            
            # Get upcoming deadlines
            upcoming_deadlines = await self._get_all_upcoming_deadlines(limit=10)
            
            # Get time tracking summary
            time_summary = await self._get_time_tracking_summary()
            
            # Get revenue summary
            revenue_summary = await self._get_revenue_summary()
            
            dashboard = {
                "practice_statistics": stats,
                "recent_cases": recent_cases,
                "upcoming_deadlines": upcoming_deadlines,
                "time_tracking": time_summary,
                "revenue_summary": revenue_summary,
                "alerts": await self._get_practice_alerts(),
                "last_updated": datetime.now().isoformat()
            }
            
            return dashboard
            
        except Exception as e:
            logger.error(f"Error getting dashboard data: {e}")
            return {}
            
    async def _store_client(self, client: LegalClient):
        """Store client in database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO clients 
                (client_id, name, client_type, contact_info, registration_number,
                 tax_number, address, phone, email, preferred_language,
                 billing_address, payment_terms, client_since, last_contact,
                 total_cases, active_cases, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                client.client_id, client.name, client.client_type.value,
                json.dumps(client.contact_info), client.registration_number,
                client.tax_number, client.address, client.phone, client.email,
                client.preferred_language, client.billing_address, client.payment_terms,
                client.client_since.isoformat(), client.last_contact.isoformat(),
                client.total_cases, client.active_cases, client.notes
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error storing client: {e}")
            
    async def _store_case(self, case: LegalCase):
        """Store case in database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO cases 
                (case_id, case_number, title, case_type, status, client_id,
                 opposing_party, court, judge, case_value, currency, description,
                 created_date, start_date, expected_end_date, actual_end_date,
                 last_update, assigned_lawyers, documents, tasks,
                 billable_hours, total_fees, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                case.case_id, case.case_number, case.title, case.case_type.value,
                case.status.value, case.client_id, case.opposing_party, case.court,
                case.judge, case.case_value, case.currency, case.description,
                case.created_date.isoformat(), case.start_date.isoformat(),
                case.expected_end_date.isoformat() if case.expected_end_date else None,
                case.actual_end_date.isoformat() if case.actual_end_date else None,
                case.last_update.isoformat(), json.dumps(case.assigned_lawyers),
                json.dumps(case.documents), json.dumps(case.tasks),
                case.billable_hours, case.total_fees, case.notes
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error storing case: {e}")
            
    async def _store_task(self, task: LegalTask):
        """Store task in database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO tasks 
                (task_id, case_id, title, description, task_type, priority,
                 status, assigned_to, created_by, created_date, due_date,
                 completed_date, estimated_hours, actual_hours, dependencies,
                 attachments, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                task.task_id, task.case_id, task.title, task.description,
                task.task_type, task.priority.value, task.status.value,
                task.assigned_to, task.created_by, task.created_date.isoformat(),
                task.due_date.isoformat(), 
                task.completed_date.isoformat() if task.completed_date else None,
                task.estimated_hours, task.actual_hours, json.dumps(task.dependencies),
                json.dumps(task.attachments), task.notes
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error storing task: {e}")
            
    async def _store_time_entry(self, time_entry: TimeEntry):
        """Store time entry in database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO time_entries 
                (entry_id, case_id, task_id, lawyer_id, activity_description,
                 start_time, end_time, duration_hours, billable, hourly_rate,
                 total_amount, date_recorded, invoice_id, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                time_entry.entry_id, time_entry.case_id, time_entry.task_id,
                time_entry.lawyer_id, time_entry.activity_description,
                time_entry.start_time.isoformat(), time_entry.end_time.isoformat(),
                time_entry.duration_hours, time_entry.billable, time_entry.hourly_rate,
                time_entry.total_amount, time_entry.date_recorded.isoformat(),
                time_entry.invoice_id, time_entry.notes
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error storing time entry: {e}")
            
    async def _get_case_by_id(self, case_id: str) -> Optional[Dict[str, Any]]:
        """Get case by ID from database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM cases WHERE case_id = ?", (case_id,))
            row = cursor.fetchone()
            
            if row:
                columns = [description[0] for description in cursor.description]
                case_dict = dict(zip(columns, row))
                
                # Parse JSON fields
                case_dict["assigned_lawyers"] = json.loads(case_dict["assigned_lawyers"]) if case_dict["assigned_lawyers"] else []
                case_dict["documents"] = json.loads(case_dict["documents"]) if case_dict["documents"] else []
                case_dict["tasks"] = json.loads(case_dict["tasks"]) if case_dict["tasks"] else []
                
                conn.close()
                return case_dict
                
            conn.close()
            return None
            
        except Exception as e:
            logger.error(f"Error getting case by ID: {e}")
            return None
            
    async def _get_client_by_id(self, client_id: str) -> Optional[Dict[str, Any]]:
        """Get client by ID from database."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM clients WHERE client_id = ?", (client_id,))
            row = cursor.fetchone()
            
            if row:
                columns = [description[0] for description in cursor.description]
                client_dict = dict(zip(columns, row))
                
                # Parse JSON fields
                client_dict["contact_info"] = json.loads(client_dict["contact_info"]) if client_dict["contact_info"] else {}
                
                conn.close()
                return client_dict
                
            conn.close()
            return None
            
        except Exception as e:
            logger.error(f"Error getting client by ID: {e}")
            return None
            
    async def _get_case_tasks(self, case_id: str) -> List[Dict[str, Any]]:
        """Get all tasks for a case."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM tasks WHERE case_id = ? ORDER BY created_date DESC", (case_id,))
            rows = cursor.fetchall()
            
            tasks = []
            if rows:
                columns = [description[0] for description in cursor.description]
                for row in rows:
                    task_dict = dict(zip(columns, row))
                    
                    # Parse JSON fields
                    task_dict["dependencies"] = json.loads(task_dict["dependencies"]) if task_dict["dependencies"] else []
                    task_dict["attachments"] = json.loads(task_dict["attachments"]) if task_dict["attachments"] else []
                    
                    tasks.append(task_dict)
                    
            conn.close()
            return tasks
            
        except Exception as e:
            logger.error(f"Error getting case tasks: {e}")
            return []
            
    async def _get_case_documents(self, case_id: str) -> List[Dict[str, Any]]:
        """Get all documents for a case."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM documents WHERE case_id = ? ORDER BY created_date DESC", (case_id,))
            rows = cursor.fetchall()
            
            documents = []
            if rows:
                columns = [description[0] for description in cursor.description]
                for row in rows:
                    doc_dict = dict(zip(columns, row))
                    
                    # Parse JSON fields
                    doc_dict["tags"] = json.loads(doc_dict["tags"]) if doc_dict["tags"] else []
                    
                    documents.append(doc_dict)
                    
            conn.close()
            return documents
            
        except Exception as e:
            logger.error(f"Error getting case documents: {e}")
            return []
            
    async def _get_case_time_entries(self, case_id: str) -> List[Dict[str, Any]]:
        """Get all time entries for a case."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM time_entries WHERE case_id = ? ORDER BY date_recorded DESC", (case_id,))
            rows = cursor.fetchall()
            
            time_entries = []
            if rows:
                columns = [description[0] for description in cursor.description]
                for row in rows:
                    time_dict = dict(zip(columns, row))
                    time_entries.append(time_dict)
                    
            conn.close()
            return time_entries
            
        except Exception as e:
            logger.error(f"Error getting case time entries: {e}")
            return []
            
    async def _update_client_case_count(self, client_id: str, increment: bool = True):
        """Update client case count."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            if increment:
                cursor.execute("""
                    UPDATE clients 
                    SET total_cases = total_cases + 1, active_cases = active_cases + 1,
                        last_contact = ?
                    WHERE client_id = ?
                """, (datetime.now().isoformat(), client_id))
            else:
                cursor.execute("""
                    UPDATE clients 
                    SET active_cases = active_cases - 1,
                        last_contact = ?
                    WHERE client_id = ?
                """, (datetime.now().isoformat(), client_id))
                
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error updating client case count: {e}")
            
    async def _update_case_billing(self, case_id: str, hours: float, amount: float):
        """Update case billing information."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE cases 
                SET billable_hours = billable_hours + ?, 
                    total_fees = total_fees + ?,
                    last_update = ?
                WHERE case_id = ?
            """, (hours, amount, datetime.now().isoformat(), case_id))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Error updating case billing: {e}")
            
    async def _get_upcoming_deadlines(self, case_id: str) -> List[Dict[str, Any]]:
        """Get upcoming deadlines for a case."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get tasks with upcoming deadlines
            cursor.execute("""
                SELECT task_id, title, due_date, priority, status
                FROM tasks 
                WHERE case_id = ? AND status IN ('pending', 'in_progress')
                  AND due_date >= date('now')
                ORDER BY due_date ASC
                LIMIT 5
            """, (case_id,))
            
            rows = cursor.fetchall()
            deadlines = []
            
            if rows:
                columns = [description[0] for description in cursor.description]
                for row in rows:
                    deadline_dict = dict(zip(columns, row))
                    deadlines.append(deadline_dict)
                    
            conn.close()
            return deadlines
            
        except Exception as e:
            logger.error(f"Error getting upcoming deadlines: {e}")
            return []
            
    async def _get_practice_statistics(self) -> Dict[str, Any]:
        """Get practice-wide statistics."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get client count
            cursor.execute("SELECT COUNT(*) FROM clients")
            total_clients = cursor.fetchone()[0]
            
            # Get case counts by status
            cursor.execute("SELECT status, COUNT(*) FROM cases GROUP BY status")
            case_status_counts = dict(cursor.fetchall())
            
            # Get total billable hours this month
            current_month = datetime.now().strftime('%Y-%m')
            cursor.execute("""
                SELECT SUM(duration_hours), SUM(total_amount)
                FROM time_entries 
                WHERE billable = 1 AND date_recorded LIKE ?
            """, (f"{current_month}%",))
            
            month_result = cursor.fetchone()
            monthly_hours = month_result[0] or 0
            monthly_revenue = month_result[1] or 0
            
            # Get pending tasks count
            cursor.execute("SELECT COUNT(*) FROM tasks WHERE status = 'pending'")
            pending_tasks = cursor.fetchone()[0]
            
            conn.close()
            
            return {
                "total_clients": total_clients,
                "case_counts": case_status_counts,
                "monthly_hours": monthly_hours,
                "monthly_revenue": monthly_revenue,
                "pending_tasks": pending_tasks
            }
            
        except Exception as e:
            logger.error(f"Error getting practice statistics: {e}")
            return {}
            
    async def _get_recent_cases(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Get recently created cases."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT case_id, case_number, title, case_type, status, client_id, created_date
                FROM cases 
                ORDER BY created_date DESC 
                LIMIT ?
            """, (limit,))
            
            rows = cursor.fetchall()
            cases = []
            
            if rows:
                columns = [description[0] for description in cursor.description]
                for row in rows:
                    case_dict = dict(zip(columns, row))
                    cases.append(case_dict)
                    
            conn.close()
            return cases
            
        except Exception as e:
            logger.error(f"Error getting recent cases: {e}")
            return []
            
    async def _get_all_upcoming_deadlines(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get all upcoming deadlines across all cases."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT t.task_id, t.title, t.due_date, t.priority, t.status,
                       c.case_number, c.title as case_title
                FROM tasks t
                JOIN cases c ON t.case_id = c.case_id
                WHERE t.status IN ('pending', 'in_progress')
                  AND t.due_date >= date('now')
                ORDER BY t.due_date ASC
                LIMIT ?
            """, (limit,))
            
            rows = cursor.fetchall()
            deadlines = []
            
            if rows:
                columns = [description[0] for description in cursor.description]
                for row in rows:
                    deadline_dict = dict(zip(columns, row))
                    deadlines.append(deadline_dict)
                    
            conn.close()
            return deadlines
            
        except Exception as e:
            logger.error(f"Error getting all upcoming deadlines: {e}")
            return []
            
    async def _get_time_tracking_summary(self) -> Dict[str, Any]:
        """Get time tracking summary."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Today's hours
            today = datetime.now().strftime('%Y-%m-%d')
            cursor.execute("""
                SELECT SUM(duration_hours), COUNT(*)
                FROM time_entries 
                WHERE date_recorded LIKE ?
            """, (f"{today}%",))
            
            today_result = cursor.fetchone()
            today_hours = today_result[0] or 0
            today_entries = today_result[1] or 0
            
            # This week's hours
            week_start = (datetime.now() - timedelta(days=datetime.now().weekday())).strftime('%Y-%m-%d')
            cursor.execute("""
                SELECT SUM(duration_hours), SUM(total_amount)
                FROM time_entries 
                WHERE billable = 1 AND date_recorded >= ?
            """, (week_start,))
            
            week_result = cursor.fetchone()
            week_hours = week_result[0] or 0
            week_revenue = week_result[1] or 0
            
            conn.close()
            
            return {
                "today_hours": today_hours,
                "today_entries": today_entries,
                "week_hours": week_hours,
                "week_revenue": week_revenue
            }
            
        except Exception as e:
            logger.error(f"Error getting time tracking summary: {e}")
            return {}
            
    async def _get_revenue_summary(self) -> Dict[str, Any]:
        """Get revenue summary."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # This month's revenue
            current_month = datetime.now().strftime('%Y-%m')
            cursor.execute("""
                SELECT SUM(total_amount), COUNT(*)
                FROM time_entries 
                WHERE billable = 1 AND date_recorded LIKE ?
            """, (f"{current_month}%",))
            
            month_result = cursor.fetchone()
            monthly_revenue = month_result[0] or 0
            monthly_entries = month_result[1] or 0
            
            # This year's revenue
            current_year = datetime.now().strftime('%Y')
            cursor.execute("""
                SELECT SUM(total_amount)
                FROM time_entries 
                WHERE billable = 1 AND date_recorded LIKE ?
            """, (f"{current_year}%",))
            
            yearly_revenue = cursor.fetchone()[0] or 0
            
            # Outstanding fees (unbilled)
            cursor.execute("""
                SELECT SUM(total_amount)
                FROM time_entries 
                WHERE billable = 1 AND invoice_id IS NULL
            """, ())
            
            outstanding_fees = cursor.fetchone()[0] or 0
            
            conn.close()
            
            return {
                "monthly_revenue": monthly_revenue,
                "monthly_entries": monthly_entries,
                "yearly_revenue": yearly_revenue,
                "outstanding_fees": outstanding_fees
            }
            
        except Exception as e:
            logger.error(f"Error getting revenue summary: {e}")
            return {}
            
    async def _get_practice_alerts(self) -> List[Dict[str, Any]]:
        """Get practice management alerts."""
        try:
            alerts = []
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Overdue tasks
            cursor.execute("""
                SELECT COUNT(*) FROM tasks 
                WHERE status IN ('pending', 'in_progress') AND due_date < date('now')
            """)
            overdue_tasks = cursor.fetchone()[0]
            
            if overdue_tasks > 0:
                alerts.append({
                    "type": "warning",
                    "message": f"{overdue_tasks} task(s) overdue",
                    "action": "Review and update overdue tasks"
                })
                
            # Cases without activity in 30 days
            cursor.execute("""
                SELECT COUNT(*) FROM cases 
                WHERE status = 'active' AND last_update < date('now', '-30 days')
            """)
            inactive_cases = cursor.fetchone()[0]
            
            if inactive_cases > 0:
                alerts.append({
                    "type": "info",
                    "message": f"{inactive_cases} case(s) without recent activity",
                    "action": "Review case status and schedule follow-up"
                })
                
            # Unbilled time entries older than 30 days
            cursor.execute("""
                SELECT COUNT(*) FROM time_entries 
                WHERE billable = 1 AND invoice_id IS NULL 
                  AND date_recorded < date('now', '-30 days')
            """)
            unbilled_entries = cursor.fetchone()[0]
            
            if unbilled_entries > 0:
                alerts.append({
                    "type": "warning",
                    "message": f"{unbilled_entries} unbilled time entries over 30 days old",
                    "action": "Generate invoices for outstanding time"
                })
                
            conn.close()
            return alerts
            
        except Exception as e:
            logger.error(f"Error getting practice alerts: {e}")
            return []


class PracticeManagementEngine:
    """Main engine for legal practice management."""
    
    def __init__(self):
        self.case_manager = CaseManager()
        self.initialized = False
        
    async def initialize_practice_management(self):
        """Initialize practice management system."""
        try:
            logger.info("⚖️ Initializing Legal Practice Management System")
            
            # Verify database connectivity
            dashboard = await self.case_manager.get_dashboard_data()
            
            self.initialized = True
            logger.info("✅ Practice Management System initialized successfully")
            
            # Display system status
            stats = dashboard.get("practice_statistics", {})
            logger.info(f"📊 Total Clients: {stats.get('total_clients', 0)}")
            logger.info(f"📁 Active Cases: {stats.get('case_counts', {}).get('active', 0)}")
            logger.info(f"⏰ Pending Tasks: {stats.get('pending_tasks', 0)}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error initializing practice management: {e}")
            return False
            
    async def comprehensive_practice_service(self, client_id: str) -> Dict[str, Any]:
        """Provide comprehensive practice management service."""
        try:
            if not self.initialized:
                await self.initialize_practice_management()
                
            # Get client information
            client = await self.case_manager._get_client_by_id(client_id)
            if not client:
                raise ValueError(f"Client not found: {client_id}")
                
            # Get client's cases
            conn = sqlite3.connect(self.case_manager.db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM cases WHERE client_id = ? ORDER BY created_date DESC", (client_id,))
            cases = cursor.fetchall()
            
            client_cases = []
            if cases:
                columns = [description[0] for description in cursor.description]
                client_cases = [dict(zip(columns, case)) for case in cases]
                
            conn.close()
            
            # Calculate client statistics
            active_cases = len([c for c in client_cases if c["status"] == "active"])
            total_fees = sum(c["total_fees"] for c in client_cases)
            total_hours = sum(c["billable_hours"] for c in client_cases)
            
            service_response = {
                "client_information": client,
                "case_summary": {
                    "total_cases": len(client_cases),
                    "active_cases": active_cases,
                    "total_fees": total_fees,
                    "total_hours": total_hours,
                    "recent_cases": client_cases[:3]
                },
                "service_recommendations": [
                    "Regular case status updates recommended",
                    "Monthly billing review suggested",
                    "Document management review needed",
                    "Communication preferences optimization"
                ],
                "next_actions": [
                    "Schedule case review meeting",
                    "Prepare monthly billing statement", 
                    "Update case documentation",
                    "Review outstanding tasks"
                ]
            }
            
            return service_response
            
        except Exception as e:
            logger.error(f"Error providing comprehensive practice service: {e}")
            raise


# Main execution and testing
async def main():
    """Main function for testing and demonstration."""
    try:
        logger.info("⚖️ Starting Practice Management Engine Demo")
        
        # Initialize practice management
        practice_engine = PracticeManagementEngine()
        await practice_engine.initialize_practice_management()
        
        # Create sample client
        logger.info("👤 Creating sample client...")
        client_data = {
            "name": "SC TECH SOLUTIONS SRL",
            "client_type": "company",
            "registration_number": "J40/12345/2020",
            "tax_number": "RO12345678",
            "address": "Str. Tehnologiei 123, București",
            "phone": "+40-21-123-4567",
            "email": "contact@techsolutions.ro",
            "notes": "Client specializat în tehnologie"
        }
        
        client = await practice_engine.case_manager.create_client(client_data)
        logger.info(f"✅ Client created: {client.name}")
        
        # Create sample case
        logger.info("📁 Creating sample case...")
        case_data = {
            "title": "Contract de dezvoltare software - litigiu",
            "case_type": "commercial",
            "client_id": client.client_id,
            "opposing_party": "SC COMPETITOR SRL",
            "court": "Tribunalul București",
            "case_value": 50000.0,
            "description": "Litigiu privind nerespectarea contractului de dezvoltare software"
        }
        
        case = await practice_engine.case_manager.create_case(case_data)
        logger.info(f"✅ Case created: {case.case_number}")
        
        # Create sample tasks
        logger.info("📋 Creating sample tasks...")
        task_data = {
            "case_id": case.case_id,
            "title": "Pregătire documentație preliminară",
            "task_type": "document_preparation",
            "priority": "high",
            "assigned_to": "lawyer_001",
            "created_by": "admin",
            "due_date": datetime.now() + timedelta(days=7),
            "estimated_hours": 8.0
        }
        
        task = await practice_engine.case_manager.create_task(task_data)
        logger.info(f"✅ Task created: {task.title}")
        
        # Log time entry
        logger.info("⏰ Logging time entry...")
        time_data = {
            "case_id": case.case_id,
            "task_id": task.task_id,
            "lawyer_id": "lawyer_001",
            "activity_description": "Analiză contractuală și pregătire documentație",
            "start_time": datetime.now() - timedelta(hours=3),
            "end_time": datetime.now(),
            "hourly_rate": 150.0,
            "billable": True
        }
        
        time_entry = await practice_engine.case_manager.log_time_entry(time_data)
        logger.info(f"✅ Time logged: {time_entry.duration_hours:.2f}h")
        
        # Get case overview
        logger.info("📊 Getting case overview...")
        case_overview = await practice_engine.case_manager.get_case_overview(case.case_id)
        
        logger.info(f"📈 Case Statistics:")
        logger.info(f"  - Total time: {case_overview['statistics']['total_time_hours']:.2f}h")
        logger.info(f"  - Total fees: {case_overview['statistics']['total_fees']:.2f} RON")
        logger.info(f"  - Total tasks: {case_overview['statistics']['total_tasks']}")
        
        # Get dashboard data
        logger.info("🎛️ Getting dashboard data...")
        dashboard = await practice_engine.case_manager.get_dashboard_data()
        
        logger.info(f"📊 Practice Statistics:")
        logger.info(f"  - Total clients: {dashboard['practice_statistics']['total_clients']}")
        logger.info(f"  - Monthly revenue: {dashboard['practice_statistics']['monthly_revenue']:.2f} RON")
        logger.info(f"  - Pending tasks: {dashboard['practice_statistics']['pending_tasks']}")
        
        # Test comprehensive service
        logger.info("🏢 Testing comprehensive practice service...")
        service_response = await practice_engine.comprehensive_practice_service(client.client_id)
        
        logger.info(f"✅ Service provided for: {service_response['client_information']['name']}")
        logger.info(f"📁 Active cases: {service_response['case_summary']['active_cases']}")
        logger.info(f"💰 Total fees: {service_response['case_summary']['total_fees']:.2f} RON")
        
        logger.info("🎉 Practice Management Engine Demo Completed Successfully!")
        
    except Exception as e:
        logger.error(f"❌ Error in Practice Management demo: {e}")


if __name__ == "__main__":
    asyncio.run(main())
