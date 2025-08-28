#!/usr/bin/env python3
"""
RomAI AGI Backup Automation Scheduler
Phase 3E: Disaster Recovery & Backup Systems

Automated backup scheduling system with cron-like scheduling,
parallel execution, monitoring, and alerting capabilities.
"""

import asyncio
import schedule
import time
import threading
import logging
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from typing import List, Dict, Callable, Optional
from enum import Enum
import json
import smtplib
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
from pathlib import Path

from disaster_recovery_system import (
    DisasterRecoveryManager, BackupType, BackupStatus, BackupRecord
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [%(threadName)s] - %(message)s',
    handlers=[
        logging.FileHandler('backup_scheduler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ScheduleStatus(Enum):
    """Backup schedule status"""
    ACTIVE = "active"
    PAUSED = "paused"  
    DISABLED = "disabled"
    ERROR = "error"

@dataclass
class BackupSchedule:
    """Backup schedule configuration"""
    schedule_id: str
    backup_type: BackupType
    cron_expression: str
    enabled: bool = True
    parallel_allowed: bool = False
    priority: int = 5
    max_duration_minutes: int = 120
    retry_attempts: int = 3
    retry_delay_minutes: int = 15
    alert_on_failure: bool = True
    alert_on_success: bool = False
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None
    status: ScheduleStatus = ScheduleStatus.ACTIVE

@dataclass 
class BackupExecution:
    """Backup execution record"""
    execution_id: str
    schedule_id: str
    backup_type: BackupType
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_seconds: float = 0.0
    status: BackupStatus = BackupStatus.PENDING
    backup_record: Optional[BackupRecord] = None
    error_message: Optional[str] = None
    retry_count: int = 0

class BackupScheduler:
    """Advanced backup scheduling and execution system"""
    
    def __init__(self, config_file: str = "backup_scheduler_config.json"):
        self.config_file = config_file
        self.schedules: List[BackupSchedule] = []
        self.executions: List[BackupExecution] = []
        self.dr_manager = DisasterRecoveryManager()
        self.running = False
        self.scheduler_thread: Optional[threading.Thread] = None
        
        # Load configuration
        self._load_schedules()
        
        # Initialize notification settings
        self.notification_config = self._load_notification_config()

    def _load_schedules(self):
        """Load backup schedules from configuration"""
        default_schedules = [
            {
                "schedule_id": "daily_database_backup",
                "backup_type": "database",
                "cron_expression": "0 2 * * *",  # Daily at 2 AM
                "enabled": True,
                "parallel_allowed": False,
                "priority": 10,
                "max_duration_minutes": 60,
                "retry_attempts": 3,
                "retry_delay_minutes": 15,
                "alert_on_failure": True,
                "alert_on_success": False
            },
            {
                "schedule_id": "daily_application_state_backup",
                "backup_type": "application_state",
                "cron_expression": "0 4 * * *",  # Daily at 4 AM
                "enabled": True,
                "parallel_allowed": True,
                "priority": 8,
                "max_duration_minutes": 90,
                "retry_attempts": 2,
                "retry_delay_minutes": 10,
                "alert_on_failure": True,
                "alert_on_success": False
            },
            {
                "schedule_id": "weekly_configuration_backup",
                "backup_type": "configuration",
                "cron_expression": "0 6 * * 0",  # Weekly on Sunday at 6 AM
                "enabled": True,
                "parallel_allowed": True,
                "priority": 6,
                "max_duration_minutes": 30,
                "retry_attempts": 2,
                "retry_delay_minutes": 5,
                "alert_on_failure": True,
                "alert_on_success": True
            },
            {
                "schedule_id": "weekly_model_data_backup",
                "backup_type": "model_data",
                "cron_expression": "0 8 * * 0",  # Weekly on Sunday at 8 AM
                "enabled": True,
                "parallel_allowed": False,
                "priority": 9,
                "max_duration_minutes": 180,
                "retry_attempts": 3,
                "retry_delay_minutes": 30,
                "alert_on_failure": True,
                "alert_on_success": True
            },
            {
                "schedule_id": "monthly_full_system_backup",
                "backup_type": "full_system", 
                "cron_expression": "0 10 1 * *",  # Monthly on 1st at 10 AM
                "enabled": True,
                "parallel_allowed": False,
                "priority": 10,
                "max_duration_minutes": 300,
                "retry_attempts": 3,
                "retry_delay_minutes": 60,
                "alert_on_failure": True,
                "alert_on_success": True
            }
        ]
        
        if Path(self.config_file).exists():
            try:
                with open(self.config_file, 'r') as f:
                    config_data = json.load(f)
                    schedule_data = config_data.get("schedules", default_schedules)
            except Exception as e:
                logger.warning(f"Failed to load schedule config, using defaults: {e}")
                schedule_data = default_schedules
        else:
            schedule_data = default_schedules
        
        # Convert to BackupSchedule objects
        self.schedules = []
        for sched_data in schedule_data:
            try:
                # Convert backup_type string to enum
                sched_data["backup_type"] = BackupType(sched_data["backup_type"])
                
                # Handle datetime fields
                if "last_run" in sched_data and sched_data["last_run"]:
                    sched_data["last_run"] = datetime.fromisoformat(sched_data["last_run"])
                if "next_run" in sched_data and sched_data["next_run"]:
                    sched_data["next_run"] = datetime.fromisoformat(sched_data["next_run"])
                
                # Handle status enum
                if "status" in sched_data:
                    sched_data["status"] = ScheduleStatus(sched_data["status"])
                
                schedule = BackupSchedule(**sched_data)
                self.schedules.append(schedule)
                
            except Exception as e:
                logger.error(f"Failed to load schedule: {sched_data.get('schedule_id', 'unknown')} - {e}")
        
        logger.info(f"Loaded {len(self.schedules)} backup schedules")

    def _load_notification_config(self) -> Dict:
        """Load notification configuration"""
        return {
            "email_enabled": False,
            "smtp_server": "localhost",
            "smtp_port": 587,
            "smtp_username": "",
            "smtp_password": "",
            "from_email": "backup-system@romai.codai.ro",
            "to_emails": ["admin@romai.codai.ro"],
            "webhook_url": None,
            "slack_webhook": None
        }

    def _save_schedules(self):
        """Save current schedules to configuration file"""
        try:
            schedule_data = []
            for schedule in self.schedules:
                sched_dict = asdict(schedule)
                
                # Convert enums and datetime to serializable formats
                sched_dict["backup_type"] = schedule.backup_type.value
                sched_dict["status"] = schedule.status.value
                
                if schedule.last_run:
                    sched_dict["last_run"] = schedule.last_run.isoformat()
                if schedule.next_run:
                    sched_dict["next_run"] = schedule.next_run.isoformat()
                
                schedule_data.append(sched_dict)
            
            config_data = {
                "schedules": schedule_data,
                "notification_config": self.notification_config
            }
            
            with open(self.config_file, 'w') as f:
                json.dump(config_data, f, indent=2, default=str)
            
            logger.info(f"Saved {len(self.schedules)} schedules to {self.config_file}")
            
        except Exception as e:
            logger.error(f"Failed to save schedules: {e}")

    def add_schedule(self, schedule: BackupSchedule):
        """Add a new backup schedule"""
        # Check for duplicate schedule IDs
        if any(s.schedule_id == schedule.schedule_id for s in self.schedules):
            raise ValueError(f"Schedule ID already exists: {schedule.schedule_id}")
        
        self.schedules.append(schedule)
        self._save_schedules()
        self._register_schedule(schedule)
        
        logger.info(f"Added new backup schedule: {schedule.schedule_id}")

    def remove_schedule(self, schedule_id: str):
        """Remove a backup schedule"""
        self.schedules = [s for s in self.schedules if s.schedule_id != schedule_id]
        self._save_schedules()
        
        # Clear the schedule from the schedule library
        schedule.clear(schedule_id)
        
        logger.info(f"Removed backup schedule: {schedule_id}")

    def enable_schedule(self, schedule_id: str):
        """Enable a backup schedule"""
        for sched in self.schedules:
            if sched.schedule_id == schedule_id:
                sched.enabled = True
                sched.status = ScheduleStatus.ACTIVE
                self._save_schedules()
                self._register_schedule(sched)
                logger.info(f"Enabled backup schedule: {schedule_id}")
                return
        
        logger.warning(f"Schedule not found: {schedule_id}")

    def disable_schedule(self, schedule_id: str):
        """Disable a backup schedule"""
        for sched in self.schedules:
            if sched.schedule_id == schedule_id:
                sched.enabled = False
                sched.status = ScheduleStatus.DISABLED
                self._save_schedules()
                schedule.clear(schedule_id)
                logger.info(f"Disabled backup schedule: {schedule_id}")
                return
        
        logger.warning(f"Schedule not found: {schedule_id}")

    def _register_schedule(self, backup_schedule: BackupSchedule):
        """Register schedule with the scheduler"""
        if not backup_schedule.enabled:
            return
        
        # Parse cron expression to schedule format
        # Note: This is a simplified implementation
        # For production, use a proper cron parser like python-crontab
        cron_parts = backup_schedule.cron_expression.split()
        
        if len(cron_parts) != 5:
            logger.error(f"Invalid cron expression: {backup_schedule.cron_expression}")
            return
        
        minute, hour, day, month, day_of_week = cron_parts
        
        # Create schedule job based on cron expression
        if day_of_week != "*":
            # Weekly schedule
            days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
            if day_of_week.isdigit() and 0 <= int(day_of_week) <= 6:
                day_name = days[int(day_of_week)]
                job = schedule.every().week.at(f"{hour}:{minute.zfill(2)}")
                if hasattr(job, day_name):
                    job = getattr(job, day_name)
        elif day != "*":
            # Monthly schedule (simplified - assumes first of month)
            if day == "1":
                job = schedule.every().month.at(f"{hour}:{minute.zfill(2)}")
            else:
                job = schedule.every().day.at(f"{hour}:{minute.zfill(2)}")
        else:
            # Daily schedule
            job = schedule.every().day.at(f"{hour}:{minute.zfill(2)}")
        
        # Set the job function with the schedule ID
        job.do(self._execute_backup_job, backup_schedule.schedule_id).tag(backup_schedule.schedule_id)
        
        logger.info(f"Registered schedule: {backup_schedule.schedule_id} with cron: {backup_schedule.cron_expression}")

    def _execute_backup_job(self, schedule_id: str):
        """Execute backup job for a specific schedule"""
        backup_schedule = next((s for s in self.schedules if s.schedule_id == schedule_id), None)
        
        if not backup_schedule:
            logger.error(f"Schedule not found for execution: {schedule_id}")
            return
        
        # Check if schedule is enabled
        if not backup_schedule.enabled or backup_schedule.status != ScheduleStatus.ACTIVE:
            logger.info(f"Skipping disabled/inactive schedule: {schedule_id}")
            return
        
        # Check for concurrent execution if not allowed
        if not backup_schedule.parallel_allowed:
            active_executions = [
                e for e in self.executions 
                if e.schedule_id == schedule_id and e.status == BackupStatus.IN_PROGRESS
            ]
            
            if active_executions:
                logger.warning(f"Skipping concurrent execution for schedule: {schedule_id}")
                return
        
        # Create execution record
        execution_id = f"{schedule_id}_{int(time.time())}"
        execution = BackupExecution(
            execution_id=execution_id,
            schedule_id=schedule_id,
            backup_type=backup_schedule.backup_type,
            start_time=datetime.now(),
            status=BackupStatus.PENDING
        )
        
        self.executions.append(execution)
        
        # Execute backup in separate thread
        backup_thread = threading.Thread(
            target=self._run_backup_with_timeout,
            args=(execution, backup_schedule),
            name=f"backup-{execution_id}"
        )
        backup_thread.start()

    def _run_backup_with_timeout(self, execution: BackupExecution, backup_schedule: BackupSchedule):
        """Run backup with timeout and retry logic"""
        logger.info(f"Starting backup execution: {execution.execution_id}")
        
        execution.status = BackupStatus.IN_PROGRESS
        
        for attempt in range(backup_schedule.retry_attempts + 1):
            if attempt > 0:
                logger.info(f"Retry attempt {attempt} for {execution.execution_id}")
                time.sleep(backup_schedule.retry_delay_minutes * 60)
                execution.retry_count = attempt
            
            try:
                # Run backup with timeout
                backup_task = asyncio.create_task(self._execute_backup(execution.backup_type))
                
                # Create new event loop for this thread
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
                try:
                    backup_record = loop.run_until_complete(
                        asyncio.wait_for(backup_task, timeout=backup_schedule.max_duration_minutes * 60)
                    )
                    
                    # Success
                    execution.end_time = datetime.now()
                    execution.duration_seconds = (execution.end_time - execution.start_time).total_seconds()
                    execution.status = backup_record.status
                    execution.backup_record = backup_record
                    
                    # Update schedule
                    backup_schedule.last_run = execution.start_time
                    backup_schedule.status = ScheduleStatus.ACTIVE
                    self._save_schedules()
                    
                    # Send success notification if configured
                    if backup_schedule.alert_on_success:
                        self._send_notification(execution, backup_schedule, success=True)
                    
                    logger.info(f"Backup execution completed successfully: {execution.execution_id}")
                    return
                    
                finally:
                    loop.close()
                    
            except asyncio.TimeoutError:
                error_msg = f"Backup timed out after {backup_schedule.max_duration_minutes} minutes"
                execution.error_message = error_msg
                logger.error(f"Timeout in backup execution: {execution.execution_id} - {error_msg}")
                
            except Exception as e:
                error_msg = str(e)
                execution.error_message = error_msg
                logger.error(f"Error in backup execution: {execution.execution_id} - {error_msg}")
        
        # All attempts failed
        execution.end_time = datetime.now()
        execution.duration_seconds = (execution.end_time - execution.start_time).total_seconds()
        execution.status = BackupStatus.FAILED
        
        # Update schedule status
        backup_schedule.status = ScheduleStatus.ERROR
        self._save_schedules()
        
        # Send failure notification
        if backup_schedule.alert_on_failure:
            self._send_notification(execution, backup_schedule, success=False)
        
        logger.error(f"Backup execution failed after {backup_schedule.retry_attempts + 1} attempts: {execution.execution_id}")

    async def _execute_backup(self, backup_type: BackupType) -> BackupRecord:
        """Execute specific backup type"""
        if backup_type == BackupType.DATABASE:
            return await self.dr_manager.create_database_backup()
        elif backup_type == BackupType.APPLICATION_STATE:
            return await self.dr_manager.create_application_state_backup()
        elif backup_type == BackupType.CONFIGURATION:
            return await self.dr_manager.create_configuration_backup()
        elif backup_type == BackupType.MODEL_DATA:
            # Create model data backup (placeholder implementation)
            return await self.dr_manager.create_application_state_backup()  # Simplified
        elif backup_type == BackupType.FULL_SYSTEM:
            # Create full system backup by combining all types
            db_backup = await self.dr_manager.create_database_backup()
            app_backup = await self.dr_manager.create_application_state_backup()
            config_backup = await self.dr_manager.create_configuration_backup()
            
            # Return the database backup as primary (full system would need custom implementation)
            return db_backup
        else:
            raise ValueError(f"Unsupported backup type: {backup_type}")

    def _send_notification(self, execution: BackupExecution, schedule: BackupSchedule, success: bool):
        """Send backup completion notification"""
        if not self.notification_config.get("email_enabled"):
            return
        
        try:
            subject = f"RomAI Backup {'Success' if success else 'Failed'}: {execution.backup_type.value}"
            
            if success:
                body = f"""
Backup completed successfully!

Schedule: {schedule.schedule_id}
Type: {execution.backup_type.value}
Start Time: {execution.start_time.strftime('%Y-%m-%d %H:%M:%S')}
Duration: {execution.duration_seconds:.2f} seconds
Status: {execution.status.value}

Backup Details:
- File Size: {execution.backup_record.file_size if execution.backup_record else 'Unknown'} bytes
- Checksum: {execution.backup_record.checksum if execution.backup_record else 'Unknown'}
"""
            else:
                body = f"""
Backup failed!

Schedule: {schedule.schedule_id}  
Type: {execution.backup_type.value}
Start Time: {execution.start_time.strftime('%Y-%m-%d %H:%M:%S')}
Duration: {execution.duration_seconds:.2f} seconds
Status: {execution.status.value}
Retry Attempts: {execution.retry_count}

Error Message:
{execution.error_message or 'Unknown error'}

Please investigate and resolve the issue.
"""
            
            # Send email
            self._send_email(subject, body)
            
        except Exception as e:
            logger.error(f"Failed to send notification: {e}")

    def _send_email(self, subject: str, body: str):
        """Send email notification"""
        config = self.notification_config
        
        msg = MimeMultipart()
        msg['From'] = config['from_email']
        msg['To'] = ', '.join(config['to_emails'])
        msg['Subject'] = subject
        
        msg.attach(MimeText(body, 'plain'))
        
        server = smtplib.SMTP(config['smtp_server'], config['smtp_port'])
        
        if config.get('smtp_username'):
            server.starttls()
            server.login(config['smtp_username'], config['smtp_password'])
        
        server.sendmail(config['from_email'], config['to_emails'], msg.as_string())
        server.quit()

    def start_scheduler(self):
        """Start the backup scheduler"""
        if self.running:
            logger.warning("Scheduler is already running")
            return
        
        self.running = True
        
        # Register all enabled schedules
        for backup_schedule in self.schedules:
            if backup_schedule.enabled:
                self._register_schedule(backup_schedule)
        
        # Start scheduler thread
        self.scheduler_thread = threading.Thread(target=self._run_scheduler, name="backup-scheduler")
        self.scheduler_thread.daemon = True
        self.scheduler_thread.start()
        
        logger.info("Backup scheduler started")

    def stop_scheduler(self):
        """Stop the backup scheduler"""
        if not self.running:
            logger.warning("Scheduler is not running")
            return
        
        self.running = False
        schedule.clear()
        
        if self.scheduler_thread and self.scheduler_thread.is_alive():
            self.scheduler_thread.join(timeout=5)
        
        logger.info("Backup scheduler stopped")

    def _run_scheduler(self):
        """Main scheduler loop"""
        logger.info("Scheduler loop started")
        
        while self.running:
            try:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
            except Exception as e:
                logger.error(f"Scheduler loop error: {e}")
                time.sleep(60)
        
        logger.info("Scheduler loop stopped")

    def get_status(self) -> Dict:
        """Get current scheduler status"""
        active_executions = [e for e in self.executions if e.status == BackupStatus.IN_PROGRESS]
        recent_executions = [
            e for e in self.executions 
            if e.start_time > datetime.now() - timedelta(hours=24)
        ]
        
        successful_recent = [e for e in recent_executions if e.status == BackupStatus.COMPLETED]
        failed_recent = [e for e in recent_executions if e.status == BackupStatus.FAILED]
        
        return {
            "scheduler_running": self.running,
            "total_schedules": len(self.schedules),
            "enabled_schedules": len([s for s in self.schedules if s.enabled]),
            "active_executions": len(active_executions),
            "recent_executions_24h": len(recent_executions),
            "successful_recent_24h": len(successful_recent),
            "failed_recent_24h": len(failed_recent),
            "success_rate_24h": (len(successful_recent) / len(recent_executions) * 100) if recent_executions else 0,
            "schedules": [
                {
                    "schedule_id": s.schedule_id,
                    "backup_type": s.backup_type.value,
                    "enabled": s.enabled,
                    "status": s.status.value,
                    "cron_expression": s.cron_expression,
                    "last_run": s.last_run.isoformat() if s.last_run else None,
                    "next_run": s.next_run.isoformat() if s.next_run else None
                }
                for s in self.schedules
            ]
        }

    def save_execution_records(self, filename: str = "backup_execution_records.json"):
        """Save execution records to file"""
        execution_data = []
        
        for execution in self.executions:
            exec_dict = asdict(execution)
            
            # Convert datetime and enum fields
            exec_dict["start_time"] = execution.start_time.isoformat()
            if execution.end_time:
                exec_dict["end_time"] = execution.end_time.isoformat()
            exec_dict["backup_type"] = execution.backup_type.value
            exec_dict["status"] = execution.status.value
            
            # Handle backup record
            if execution.backup_record:
                exec_dict["backup_record"] = asdict(execution.backup_record)
                exec_dict["backup_record"]["backup_type"] = execution.backup_record.backup_type.value
                exec_dict["backup_record"]["status"] = execution.backup_record.status.value
                exec_dict["backup_record"]["timestamp"] = execution.backup_record.timestamp.isoformat()
            
            execution_data.append(exec_dict)
        
        with open(filename, 'w') as f:
            json.dump(execution_data, f, indent=2, default=str)
        
        logger.info(f"Saved {len(self.executions)} execution records to {filename}")

def main():
    """Main scheduler application"""
    scheduler = BackupScheduler()
    
    try:
        logger.info("🕐 RomAI Backup Scheduler Starting...")
        logger.info("=" * 50)
        
        # Load existing execution records
        # scheduler.load_execution_records()  # Implement if needed
        
        # Start scheduler
        scheduler.start_scheduler()
        
        # Print status
        status = scheduler.get_status()
        logger.info(f"📊 Scheduler Status:")
        logger.info(f"  • Total Schedules: {status['total_schedules']}")
        logger.info(f"  • Enabled Schedules: {status['enabled_schedules']}")
        logger.info(f"  • Success Rate (24h): {status['success_rate_24h']:.1f}%")
        
        # Keep running
        try:
            while True:
                time.sleep(300)  # Status update every 5 minutes
                
                status = scheduler.get_status()
                logger.info(f"📊 Status Update - Active: {status['active_executions']}, Success Rate: {status['success_rate_24h']:.1f}%")
                
                # Save execution records periodically
                scheduler.save_execution_records()
                
        except KeyboardInterrupt:
            logger.info("Received shutdown signal")
            
    except Exception as e:
        logger.error(f"Scheduler error: {e}")
        
    finally:
        # Cleanup
        scheduler.stop_scheduler()
        scheduler.save_execution_records()
        logger.info("🛑 Backup Scheduler Stopped")

if __name__ == "__main__":
    main()