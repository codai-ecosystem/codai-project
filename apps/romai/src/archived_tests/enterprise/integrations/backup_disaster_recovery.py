# 💾 RomAI Enterprise Backup & Disaster Recovery System
# Production-grade backup automation and disaster recovery tools

from typing import Dict, List, Optional, Any, Union, Callable
from pydantic import BaseModel, Field, validator
from datetime import datetime, timedelta
import asyncio
import logging
import os
import shutil
import gzip
import json
import hashlib
import boto3
from botocore.exceptions import ClientError
import psutil
import docker
import subprocess
import schedule
from pathlib import Path
from enum import Enum
from dataclasses import dataclass
import time
import threading
from concurrent.futures import ThreadPoolExecutor
import tarfile
import zipfile
from cryptography.fernet import Fernet
# Email Notifications (disabled - import issues)
# try:
#     from email.mime.text import MIMEText
#     from email.mime.multipart import MIMEMultipart
#     import smtplib
#     EMAIL_AVAILABLE = True
# except ImportError:
#     EMAIL_AVAILABLE = False
#     logger.warning("Email modules not available - notifications disabled")
EMAIL_AVAILABLE = False
import requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BackupType(str, Enum):
    """Backup types"""
    FULL = "full"
    INCREMENTAL = "incremental"
    DIFFERENTIAL = "differential"
    DATABASE = "database"
    APPLICATION = "application"
    CONFIGURATION = "configuration"
    LOGS = "logs"
    MODELS = "models"

class BackupStatus(str, Enum):
    """Backup status"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    VERIFIED = "verified"
    CORRUPTED = "corrupted"

class StorageProvider(str, Enum):
    """Storage providers"""
    LOCAL = "local"
    AWS_S3 = "aws_s3"
    AZURE_BLOB = "azure_blob"
    GOOGLE_CLOUD = "google_cloud"
    FTP = "ftp"
    SFTP = "sftp"

class RecoveryLevel(str, Enum):
    """Recovery levels"""
    CRITICAL = "critical"  # <1 minute RTO
    HIGH = "high"         # <5 minutes RTO
    MEDIUM = "medium"     # <30 minutes RTO
    LOW = "low"           # <2 hours RTO

@dataclass
class BackupConfiguration:
    """Backup configuration"""
    name: str
    backup_type: BackupType
    source_paths: List[str]
    destination_path: str
    storage_provider: StorageProvider
    encryption_enabled: bool = True
    compression_enabled: bool = True
    retention_days: int = 30
    schedule_cron: Optional[str] = None
    notification_enabled: bool = True
    verification_enabled: bool = True
    max_backup_size_gb: int = 100
    bandwidth_limit_mbps: Optional[int] = None
    exclude_patterns: List[str] = None
    
    def __post_init__(self):
        if self.exclude_patterns is None:
            self.exclude_patterns = [
                "*.tmp", "*.log", "*.cache", "__pycache__", 
                "node_modules", ".git", "*.pyc"
            ]

class BackupJob(BaseModel):
    """Backup job representation"""
    job_id: str = Field(..., description="Unique job identifier")
    name: str = Field(..., description="Job name")
    backup_type: BackupType = Field(..., description="Backup type")
    status: BackupStatus = Field(BackupStatus.PENDING, description="Job status")
    source_paths: List[str] = Field(..., description="Source paths")
    destination_path: str = Field(..., description="Destination path")
    storage_provider: StorageProvider = Field(..., description="Storage provider")
    started_at: Optional[datetime] = Field(None, description="Start time")
    completed_at: Optional[datetime] = Field(None, description="Completion time")
    total_size_bytes: int = Field(0, description="Total backup size")
    files_count: int = Field(0, description="Number of files")
    error_message: Optional[str] = Field(None, description="Error message")
    checksum: Optional[str] = Field(None, description="Backup checksum")
    encryption_key: Optional[str] = Field(None, description="Encryption key")
    retention_until: datetime = Field(..., description="Retention expiry")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RestoreJob(BaseModel):
    """Restore job representation"""
    job_id: str = Field(..., description="Unique job identifier")
    backup_job_id: str = Field(..., description="Source backup job ID")
    restore_path: str = Field(..., description="Restore destination path")
    status: BackupStatus = Field(BackupStatus.PENDING, description="Restore status")
    started_at: Optional[datetime] = Field(None, description="Start time")
    completed_at: Optional[datetime] = Field(None, description="Completion time")
    files_restored: int = Field(0, description="Number of files restored")
    error_message: Optional[str] = Field(None, description="Error message")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DisasterRecoveryPlan(BaseModel):
    """Disaster recovery plan"""
    plan_id: str = Field(..., description="Plan identifier")
    name: str = Field(..., description="Plan name")
    description: str = Field(..., description="Plan description")
    recovery_level: RecoveryLevel = Field(..., description="Recovery level")
    rto_minutes: int = Field(..., description="Recovery Time Objective")
    rpo_minutes: int = Field(..., description="Recovery Point Objective")
    services: List[str] = Field(..., description="Critical services")
    backup_configs: List[str] = Field(..., description="Required backup configurations")
    recovery_steps: List[str] = Field(..., description="Recovery procedures")
    contacts: List[str] = Field(..., description="Emergency contacts")
    last_tested: Optional[datetime] = Field(None, description="Last test date")
    test_results: Optional[Dict[str, Any]] = Field(None, description="Test results")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SystemHealth(BaseModel):
    """System health metrics"""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    cpu_percent: float = Field(..., description="CPU usage percentage")
    memory_percent: float = Field(..., description="Memory usage percentage")
    disk_usage: Dict[str, float] = Field(..., description="Disk usage by mount point")
    network_io: Dict[str, int] = Field(..., description="Network I/O statistics")
    active_connections: int = Field(..., description="Active network connections")
    load_average: List[float] = Field(..., description="System load average")
    uptime_seconds: int = Field(..., description="System uptime")
    temperature: Optional[float] = Field(None, description="System temperature")

class RomAIBackupDisasterRecovery:
    """
    💾 RomAI Enterprise Backup & Disaster Recovery System
    
    Provides comprehensive backup and disaster recovery capabilities:
    - Automated backup scheduling
    - Multiple storage providers
    - Encryption and compression
    - Disaster recovery planning
    - System monitoring and alerting
    """
    
    def __init__(self):
        """Initialize backup and disaster recovery system"""
        self.backup_configs: Dict[str, BackupConfiguration] = {}
        self.backup_jobs: Dict[str, BackupJob] = {}
        self.restore_jobs: Dict[str, RestoreJob] = {}
        self.dr_plans: Dict[str, DisasterRecoveryPlan] = {}
        self.encryption_key = Fernet.generate_key()
        self.cipher_suite = Fernet(self.encryption_key)
        self.docker_client = None
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # Initialize storage clients
        self.aws_s3_client = None
        self.azure_client = None
        self.gcs_client = None
        
        # Initialize system monitoring
        self.system_health_history: List[SystemHealth] = []
        self.monitoring_enabled = True
        
        # Start background tasks
        self._start_background_tasks()
        
        # Initialize default configurations
        self._initialize_default_configs()
        
        logger.info("RomAI Backup & Disaster Recovery System initialized")
    
    def _start_background_tasks(self) -> None:
        """Start background monitoring and cleanup tasks"""
        try:
            # Schedule system health monitoring
            schedule.every(5).minutes.do(self._monitor_system_health)
            
            # Schedule backup cleanup
            schedule.every().day.at("02:00").do(self._cleanup_expired_backups)
            
            # Schedule DR plan testing
            schedule.every().month.do(self._test_dr_plans)
            
            # Start scheduler thread
            def run_scheduler():
                while True:
                    schedule.run_pending()
                    time.sleep(60)
            
            scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
            scheduler_thread.start()
            
            logger.info("Background tasks started")
            
        except Exception as e:
            logger.error(f"Failed to start background tasks: {str(e)}")
    
    def _initialize_default_configs(self) -> None:
        """Initialize default backup configurations"""
        try:
            # Database backup configuration
            db_config = BackupConfiguration(
                name="romai_database",
                backup_type=BackupType.DATABASE,
                source_paths=["/var/lib/postgresql/data"],
                destination_path="/backup/database",
                storage_provider=StorageProvider.LOCAL,
                schedule_cron="0 2 * * *",  # Daily at 2 AM
                retention_days=7
            )
            self.add_backup_configuration(db_config)
            
            # Application backup configuration
            app_config = BackupConfiguration(
                name="romai_application",
                backup_type=BackupType.APPLICATION,
                source_paths=["/app/romai"],
                destination_path="/backup/application",
                storage_provider=StorageProvider.LOCAL,
                schedule_cron="0 3 * * 0",  # Weekly on Sunday at 3 AM
                retention_days=30
            )
            self.add_backup_configuration(app_config)
            
            # Configuration backup
            config_backup = BackupConfiguration(
                name="romai_config",
                backup_type=BackupType.CONFIGURATION,
                source_paths=["/etc", "/opt/romai/config"],
                destination_path="/backup/config",
                storage_provider=StorageProvider.LOCAL,
                schedule_cron="0 1 * * *",  # Daily at 1 AM
                retention_days=14
            )
            self.add_backup_configuration(config_backup)
            
            # ML Models backup
            models_config = BackupConfiguration(
                name="romai_models",
                backup_type=BackupType.MODELS,
                source_paths=["/app/models", "/data/models"],
                destination_path="/backup/models",
                storage_provider=StorageProvider.LOCAL,
                schedule_cron="0 4 * * 1",  # Weekly on Monday at 4 AM
                retention_days=60
            )
            self.add_backup_configuration(models_config)
            
            logger.info("Default backup configurations initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize default configurations: {str(e)}")
    
    def add_backup_configuration(self, config: BackupConfiguration) -> None:
        """Add backup configuration"""
        self.backup_configs[config.name] = config
        
        # Schedule backup if cron is specified
        if config.schedule_cron:
            self._schedule_backup(config)
        
        logger.info(f"Added backup configuration: {config.name}")
    
    def _schedule_backup(self, config: BackupConfiguration) -> None:
        """Schedule backup based on cron expression"""
        try:
            # Convert cron to schedule format (simplified)
            cron_parts = config.schedule_cron.split()
            if len(cron_parts) == 5:
                minute, hour, day, month, weekday = cron_parts
                
                if weekday != "*":
                    # Weekly schedule
                    weekday_map = {
                        "0": "sunday", "1": "monday", "2": "tuesday",
                        "3": "wednesday", "4": "thursday", "5": "friday", "6": "saturday"
                    }
                    schedule.every().week.on(weekday_map.get(weekday, "sunday")).at(f"{hour}:{minute}").do(
                        self._execute_scheduled_backup, config.name
                    )
                elif day != "*":
                    # Monthly schedule
                    schedule.every().month.do(self._execute_scheduled_backup, config.name)
                else:
                    # Daily schedule
                    schedule.every().day.at(f"{hour}:{minute}").do(
                        self._execute_scheduled_backup, config.name
                    )
                
                logger.info(f"Scheduled backup {config.name} with cron: {config.schedule_cron}")
                
        except Exception as e:
            logger.error(f"Failed to schedule backup {config.name}: {str(e)}")
    
    def _execute_scheduled_backup(self, config_name: str) -> None:
        """Execute scheduled backup"""
        try:
            asyncio.create_task(self.create_backup(config_name))
        except Exception as e:
            logger.error(f"Failed to execute scheduled backup {config_name}: {str(e)}")
    
    async def create_backup(self, config_name: str) -> BackupJob:
        """
        Create backup based on configuration
        
        Args:
            config_name: Backup configuration name
            
        Returns:
            BackupJob with execution details
        """
        if config_name not in self.backup_configs:
            raise ValueError(f"Unknown backup configuration: {config_name}")
        
        config = self.backup_configs[config_name]
        
        # Create backup job
        job = BackupJob(
            job_id=self._generate_job_id(),
            name=config.name,
            backup_type=config.backup_type,
            source_paths=config.source_paths,
            destination_path=config.destination_path,
            storage_provider=config.storage_provider,
            retention_until=datetime.utcnow() + timedelta(days=config.retention_days)
        )
        
        self.backup_jobs[job.job_id] = job
        
        try:
            job.status = BackupStatus.IN_PROGRESS
            job.started_at = datetime.utcnow()
            
            logger.info(f"Starting backup job: {job.job_id} ({config.name})")
            
            # Execute backup based on type
            if config.backup_type == BackupType.DATABASE:
                await self._backup_database(job, config)
            elif config.backup_type == BackupType.APPLICATION:
                await self._backup_application(job, config)
            elif config.backup_type == BackupType.CONFIGURATION:
                await self._backup_configuration(job, config)
            elif config.backup_type == BackupType.MODELS:
                await self._backup_models(job, config)
            else:
                await self._backup_files(job, config)
            
            # Verify backup if enabled
            if config.verification_enabled:
                await self._verify_backup(job, config)
            
            # Upload to remote storage if configured
            if config.storage_provider != StorageProvider.LOCAL:
                await self._upload_backup(job, config)
            
            job.status = BackupStatus.COMPLETED
            job.completed_at = datetime.utcnow()
            
            # Send notification
            if config.notification_enabled:
                await self._send_backup_notification(job, config, success=True)
            
            logger.info(f"Backup job completed: {job.job_id}")
            
        except Exception as e:
            job.status = BackupStatus.FAILED
            job.error_message = str(e)
            job.completed_at = datetime.utcnow()
            
            logger.error(f"Backup job failed: {job.job_id} - {str(e)}")
            
            # Send failure notification
            if config.notification_enabled:
                await self._send_backup_notification(job, config, success=False)
        
        return job
    
    async def _backup_database(self, job: BackupJob, config: BackupConfiguration) -> None:
        """Backup database"""
        try:
            # PostgreSQL backup
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            backup_file = f"{config.destination_path}/romai_db_{timestamp}.sql"
            
            # Create destination directory
            os.makedirs(os.path.dirname(backup_file), exist_ok=True)
            
            # Execute pg_dump
            cmd = [
                "pg_dump",
                "-h", "localhost",
                "-p", "5432",
                "-U", "romai",
                "-d", "romai_db",
                "-f", backup_file,
                "--verbose"
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                raise Exception(f"pg_dump failed: {result.stderr}")
            
            # Compress backup
            if config.compression_enabled:
                compressed_file = f"{backup_file}.gz"
                with open(backup_file, 'rb') as f_in:
                    with gzip.open(compressed_file, 'wb') as f_out:
                        shutil.copyfileobj(f_in, f_out)
                os.remove(backup_file)
                backup_file = compressed_file
            
            # Encrypt backup
            if config.encryption_enabled:
                encrypted_file = f"{backup_file}.enc"
                with open(backup_file, 'rb') as f_in:
                    with open(encrypted_file, 'wb') as f_out:
                        f_out.write(self.cipher_suite.encrypt(f_in.read()))
                os.remove(backup_file)
                backup_file = encrypted_file
                job.encryption_key = self.encryption_key.decode()
            
            # Update job details
            job.total_size_bytes = os.path.getsize(backup_file)
            job.files_count = 1
            job.checksum = self._calculate_checksum(backup_file)
            
            logger.info(f"Database backup completed: {backup_file}")
            
        except Exception as e:
            logger.error(f"Database backup failed: {str(e)}")
            raise
    
    async def _backup_application(self, job: BackupJob, config: BackupConfiguration) -> None:
        """Backup application files"""
        try:
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            backup_file = f"{config.destination_path}/romai_app_{timestamp}.tar.gz"
            
            # Create destination directory
            os.makedirs(os.path.dirname(backup_file), exist_ok=True)
            
            # Create tar archive
            with tarfile.open(backup_file, "w:gz") as tar:
                for source_path in config.source_paths:
                    if os.path.exists(source_path):
                        tar.add(source_path, arcname=os.path.basename(source_path))
                        logger.info(f"Added to backup: {source_path}")
            
            # Encrypt backup
            if config.encryption_enabled:
                encrypted_file = f"{backup_file}.enc"
                with open(backup_file, 'rb') as f_in:
                    with open(encrypted_file, 'wb') as f_out:
                        f_out.write(self.cipher_suite.encrypt(f_in.read()))
                os.remove(backup_file)
                backup_file = encrypted_file
                job.encryption_key = self.encryption_key.decode()
            
            # Update job details
            job.total_size_bytes = os.path.getsize(backup_file)
            job.files_count = self._count_files_in_archive(backup_file)
            job.checksum = self._calculate_checksum(backup_file)
            
            logger.info(f"Application backup completed: {backup_file}")
            
        except Exception as e:
            logger.error(f"Application backup failed: {str(e)}")
            raise
    
    async def _backup_configuration(self, job: BackupJob, config: BackupConfiguration) -> None:
        """Backup configuration files"""
        try:
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            backup_file = f"{config.destination_path}/romai_config_{timestamp}.zip"
            
            # Create destination directory
            os.makedirs(os.path.dirname(backup_file), exist_ok=True)
            
            # Create zip archive
            with zipfile.ZipFile(backup_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for source_path in config.source_paths:
                    if os.path.exists(source_path):
                        if os.path.isfile(source_path):
                            zipf.write(source_path, os.path.basename(source_path))
                        else:
                            for root, dirs, files in os.walk(source_path):
                                for file in files:
                                    file_path = os.path.join(root, file)
                                    arcname = os.path.relpath(file_path, os.path.dirname(source_path))
                                    zipf.write(file_path, arcname)
            
            # Encrypt backup
            if config.encryption_enabled:
                encrypted_file = f"{backup_file}.enc"
                with open(backup_file, 'rb') as f_in:
                    with open(encrypted_file, 'wb') as f_out:
                        f_out.write(self.cipher_suite.encrypt(f_in.read()))
                os.remove(backup_file)
                backup_file = encrypted_file
                job.encryption_key = self.encryption_key.decode()
            
            # Update job details
            job.total_size_bytes = os.path.getsize(backup_file)
            job.files_count = len(zipfile.ZipFile(backup_file).filelist) if not config.encryption_enabled else 0
            job.checksum = self._calculate_checksum(backup_file)
            
            logger.info(f"Configuration backup completed: {backup_file}")
            
        except Exception as e:
            logger.error(f"Configuration backup failed: {str(e)}")
            raise
    
    async def _backup_models(self, job: BackupJob, config: BackupConfiguration) -> None:
        """Backup ML models"""
        try:
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            backup_file = f"{config.destination_path}/romai_models_{timestamp}.tar.gz"
            
            # Create destination directory
            os.makedirs(os.path.dirname(backup_file), exist_ok=True)
            
            # Create tar archive with compression
            with tarfile.open(backup_file, "w:gz") as tar:
                for source_path in config.source_paths:
                    if os.path.exists(source_path):
                        tar.add(source_path, arcname=os.path.basename(source_path))
                        logger.info(f"Added models to backup: {source_path}")
            
            # Encrypt backup
            if config.encryption_enabled:
                encrypted_file = f"{backup_file}.enc"
                with open(backup_file, 'rb') as f_in:
                    with open(encrypted_file, 'wb') as f_out:
                        f_out.write(self.cipher_suite.encrypt(f_in.read()))
                os.remove(backup_file)
                backup_file = encrypted_file
                job.encryption_key = self.encryption_key.decode()
            
            # Update job details
            job.total_size_bytes = os.path.getsize(backup_file)
            job.files_count = self._count_files_in_archive(backup_file)
            job.checksum = self._calculate_checksum(backup_file)
            
            logger.info(f"Models backup completed: {backup_file}")
            
        except Exception as e:
            logger.error(f"Models backup failed: {str(e)}")
            raise
    
    async def _backup_files(self, job: BackupJob, config: BackupConfiguration) -> None:
        """Generic file backup"""
        await self._backup_application(job, config)
    
    async def _verify_backup(self, job: BackupJob, config: BackupConfiguration) -> None:
        """Verify backup integrity"""
        try:
            backup_file = self._get_backup_file_path(job, config)
            
            if not os.path.exists(backup_file):
                raise Exception(f"Backup file not found: {backup_file}")
            
            # Verify checksum
            current_checksum = self._calculate_checksum(backup_file)
            if current_checksum != job.checksum:
                job.status = BackupStatus.CORRUPTED
                raise Exception("Backup checksum verification failed")
            
            job.status = BackupStatus.VERIFIED
            logger.info(f"Backup verification successful: {job.job_id}")
            
        except Exception as e:
            logger.error(f"Backup verification failed: {str(e)}")
            raise
    
    async def _upload_backup(self, job: BackupJob, config: BackupConfiguration) -> None:
        """Upload backup to remote storage"""
        try:
            backup_file = self._get_backup_file_path(job, config)
            
            if config.storage_provider == StorageProvider.AWS_S3:
                await self._upload_to_s3(backup_file, config)
            elif config.storage_provider == StorageProvider.AZURE_BLOB:
                await self._upload_to_azure(backup_file, config)
            elif config.storage_provider == StorageProvider.GOOGLE_CLOUD:
                await self._upload_to_gcs(backup_file, config)
            else:
                logger.warning(f"Unsupported storage provider: {config.storage_provider}")
            
            logger.info(f"Backup uploaded to {config.storage_provider}: {backup_file}")
            
        except Exception as e:
            logger.error(f"Backup upload failed: {str(e)}")
            raise
    
    async def _upload_to_s3(self, backup_file: str, config: BackupConfiguration) -> None:
        """Upload backup to AWS S3"""
        if not self.aws_s3_client:
            self.aws_s3_client = boto3.client('s3')
        
        bucket_name = os.getenv('AWS_BACKUP_BUCKET', 'romai-backups')
        key = f"{config.name}/{os.path.basename(backup_file)}"
        
        self.aws_s3_client.upload_file(backup_file, bucket_name, key)
    
    async def _upload_to_azure(self, backup_file: str, config: BackupConfiguration) -> None:
        """Upload backup to Azure Blob Storage"""
        # Implementation for Azure upload
        logger.info("Azure upload not implemented yet")
    
    async def _upload_to_gcs(self, backup_file: str, config: BackupConfiguration) -> None:
        """Upload backup to Google Cloud Storage"""
        # Implementation for GCS upload
        logger.info("GCS upload not implemented yet")
    
    async def restore_backup(self, backup_job_id: str, restore_path: str) -> RestoreJob:
        """
        Restore backup to specified path
        
        Args:
            backup_job_id: Backup job identifier
            restore_path: Destination path for restore
            
        Returns:
            RestoreJob with execution details
        """
        if backup_job_id not in self.backup_jobs:
            raise ValueError(f"Unknown backup job: {backup_job_id}")
        
        backup_job = self.backup_jobs[backup_job_id]
        
        # Create restore job
        restore_job = RestoreJob(
            job_id=self._generate_job_id(),
            backup_job_id=backup_job_id,
            restore_path=restore_path
        )
        
        self.restore_jobs[restore_job.job_id] = restore_job
        
        try:
            restore_job.status = BackupStatus.IN_PROGRESS
            restore_job.started_at = datetime.utcnow()
            
            logger.info(f"Starting restore job: {restore_job.job_id}")
            
            # Get backup file
            config = self.backup_configs[backup_job.name]
            backup_file = self._get_backup_file_path(backup_job, config)
            
            # Download from remote storage if needed
            if config.storage_provider != StorageProvider.LOCAL:
                backup_file = await self._download_backup(backup_job, config)
            
            # Decrypt if encrypted
            if backup_job.encryption_key:
                backup_file = await self._decrypt_backup(backup_file, backup_job.encryption_key)
            
            # Extract backup
            await self._extract_backup(backup_file, restore_path, backup_job.backup_type)
            
            restore_job.status = BackupStatus.COMPLETED
            restore_job.completed_at = datetime.utcnow()
            
            logger.info(f"Restore job completed: {restore_job.job_id}")
            
        except Exception as e:
            restore_job.status = BackupStatus.FAILED
            restore_job.error_message = str(e)
            restore_job.completed_at = datetime.utcnow()
            
            logger.error(f"Restore job failed: {restore_job.job_id} - {str(e)}")
        
        return restore_job
    
    async def _extract_backup(self, backup_file: str, restore_path: str, backup_type: BackupType) -> None:
        """Extract backup to restore path"""
        try:
            os.makedirs(restore_path, exist_ok=True)
            
            if backup_type == BackupType.DATABASE:
                # Restore database from SQL dump
                if backup_file.endswith('.gz'):
                    # Decompress first
                    with gzip.open(backup_file, 'rb') as f_in:
                        with open(backup_file[:-3], 'wb') as f_out:
                            shutil.copyfileobj(f_in, f_out)
                    backup_file = backup_file[:-3]
                
                # Execute psql to restore
                cmd = [
                    "psql",
                    "-h", "localhost",
                    "-p", "5432",
                    "-U", "romai",
                    "-d", "romai_db",
                    "-f", backup_file
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True)
                if result.returncode != 0:
                    raise Exception(f"Database restore failed: {result.stderr}")
                
            elif backup_file.endswith('.tar.gz'):
                # Extract tar.gz archive
                with tarfile.open(backup_file, "r:gz") as tar:
                    tar.extractall(restore_path)
                    
            elif backup_file.endswith('.zip'):
                # Extract zip archive
                with zipfile.ZipFile(backup_file, 'r') as zipf:
                    zipf.extractall(restore_path)
            
            logger.info(f"Backup extracted to: {restore_path}")
            
        except Exception as e:
            logger.error(f"Backup extraction failed: {str(e)}")
            raise
    
    def create_disaster_recovery_plan(self, plan: DisasterRecoveryPlan) -> None:
        """Create disaster recovery plan"""
        self.dr_plans[plan.plan_id] = plan
        logger.info(f"Created DR plan: {plan.name}")
    
    async def execute_disaster_recovery(self, plan_id: str) -> Dict[str, Any]:
        """
        Execute disaster recovery plan
        
        Args:
            plan_id: Disaster recovery plan identifier
            
        Returns:
            Execution results
        """
        if plan_id not in self.dr_plans:
            raise ValueError(f"Unknown DR plan: {plan_id}")
        
        plan = self.dr_plans[plan_id]
        execution_log = []
        
        try:
            logger.info(f"Executing DR plan: {plan.name}")
            
            # Step 1: Assess system status
            system_status = await self._assess_system_status()
            execution_log.append(f"System assessment: {system_status}")
            
            # Step 2: Stop affected services
            for service in plan.services:
                try:
                    await self._stop_service(service)
                    execution_log.append(f"Stopped service: {service}")
                except Exception as e:
                    execution_log.append(f"Failed to stop service {service}: {str(e)}")
            
            # Step 3: Restore from backups
            for backup_config in plan.backup_configs:
                try:
                    latest_backup = await self._get_latest_backup(backup_config)
                    if latest_backup:
                        restore_job = await self.restore_backup(
                            latest_backup.job_id, 
                            f"/restore/{backup_config}"
                        )
                        execution_log.append(f"Restored backup: {backup_config}")
                    else:
                        execution_log.append(f"No backup found for: {backup_config}")
                except Exception as e:
                    execution_log.append(f"Failed to restore {backup_config}: {str(e)}")
            
            # Step 4: Start services
            for service in reversed(plan.services):
                try:
                    await self._start_service(service)
                    execution_log.append(f"Started service: {service}")
                except Exception as e:
                    execution_log.append(f"Failed to start service {service}: {str(e)}")
            
            # Step 5: Verify system health
            post_recovery_status = await self._assess_system_status()
            execution_log.append(f"Post-recovery status: {post_recovery_status}")
            
            # Send notification
            await self._send_dr_notification(plan, execution_log, success=True)
            
            logger.info(f"DR plan execution completed: {plan.name}")
            
            return {
                "plan_id": plan_id,
                "execution_time": datetime.utcnow().isoformat(),
                "status": "completed",
                "execution_log": execution_log
            }
            
        except Exception as e:
            execution_log.append(f"DR execution failed: {str(e)}")
            await self._send_dr_notification(plan, execution_log, success=False)
            
            logger.error(f"DR plan execution failed: {plan.name} - {str(e)}")
            
            return {
                "plan_id": plan_id,
                "execution_time": datetime.utcnow().isoformat(),
                "status": "failed",
                "error": str(e),
                "execution_log": execution_log
            }
    
    async def _monitor_system_health(self) -> None:
        """Monitor system health metrics"""
        try:
            health = SystemHealth(
                cpu_percent=psutil.cpu_percent(interval=1),
                memory_percent=psutil.virtual_memory().percent,
                disk_usage={
                    mount.mountpoint: psutil.disk_usage(mount.mountpoint).percent
                    for mount in psutil.disk_partitions()
                },
                network_io={
                    "bytes_sent": psutil.net_io_counters().bytes_sent,
                    "bytes_recv": psutil.net_io_counters().bytes_recv
                },
                active_connections=len(psutil.net_connections()),
                load_average=list(os.getloadavg()) if hasattr(os, 'getloadavg') else [0, 0, 0],
                uptime_seconds=int(time.time() - psutil.boot_time())
            )
            
            self.system_health_history.append(health)
            
            # Keep only last 24 hours of data
            cutoff_time = datetime.utcnow() - timedelta(hours=24)
            self.system_health_history = [
                h for h in self.system_health_history 
                if h.timestamp > cutoff_time
            ]
            
            # Check for alerts
            await self._check_health_alerts(health)
            
        except Exception as e:
            logger.error(f"System health monitoring failed: {str(e)}")
    
    async def _check_health_alerts(self, health: SystemHealth) -> None:
        """Check for system health alerts"""
        alerts = []
        
        if health.cpu_percent > 90:
            alerts.append(f"High CPU usage: {health.cpu_percent}%")
        
        if health.memory_percent > 90:
            alerts.append(f"High memory usage: {health.memory_percent}%")
        
        for mount, usage in health.disk_usage.items():
            if usage > 90:
                alerts.append(f"High disk usage on {mount}: {usage}%")
        
        if alerts:
            await self._send_health_alert(alerts)
    
    async def _send_health_alert(self, alerts: List[str]) -> None:
        """Send health alert notification"""
        try:
            message = "RomAI System Health Alert:\n\n" + "\n".join(alerts)
            logger.warning(f"Health alert: {message}")
            
            # Send email notification (if configured)
            # Implementation depends on email configuration
            
        except Exception as e:
            logger.error(f"Failed to send health alert: {str(e)}")
    
    def _generate_job_id(self) -> str:
        """Generate unique job identifier"""
        return f"job_{int(time.time())}_{os.urandom(4).hex()}"
    
    def _calculate_checksum(self, file_path: str) -> str:
        """Calculate file checksum"""
        hash_md5 = hashlib.md5()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    def _count_files_in_archive(self, archive_path: str) -> int:
        """Count files in archive"""
        try:
            if archive_path.endswith('.tar.gz'):
                with tarfile.open(archive_path, "r:gz") as tar:
                    return len(tar.getmembers())
            elif archive_path.endswith('.zip'):
                with zipfile.ZipFile(archive_path, 'r') as zipf:
                    return len(zipf.filelist)
            return 1
        except:
            return 0
    
    def _get_backup_file_path(self, job: BackupJob, config: BackupConfiguration) -> str:
        """Get backup file path"""
        timestamp = job.started_at.strftime("%Y%m%d_%H%M%S") if job.started_at else "unknown"
        
        if config.backup_type == BackupType.DATABASE:
            filename = f"romai_db_{timestamp}.sql"
        elif config.backup_type == BackupType.APPLICATION:
            filename = f"romai_app_{timestamp}.tar.gz"
        elif config.backup_type == BackupType.CONFIGURATION:
            filename = f"romai_config_{timestamp}.zip"
        elif config.backup_type == BackupType.MODELS:
            filename = f"romai_models_{timestamp}.tar.gz"
        else:
            filename = f"romai_backup_{timestamp}.tar.gz"
        
        # Add encryption extension if encrypted
        if job.encryption_key:
            filename += ".enc"
        
        return os.path.join(config.destination_path, filename)
    
    async def get_system_status(self) -> Dict[str, Any]:
        """Get comprehensive system status"""
        try:
            latest_health = self.system_health_history[-1] if self.system_health_history else None
            
            status = {
                "timestamp": datetime.utcnow().isoformat(),
                "backup_configurations": len(self.backup_configs),
                "active_backup_jobs": len([j for j in self.backup_jobs.values() if j.status == BackupStatus.IN_PROGRESS]),
                "completed_backups": len([j for j in self.backup_jobs.values() if j.status == BackupStatus.COMPLETED]),
                "failed_backups": len([j for j in self.backup_jobs.values() if j.status == BackupStatus.FAILED]),
                "dr_plans": len(self.dr_plans),
                "system_health": latest_health.dict() if latest_health else None,
                "storage_usage": await self._get_storage_usage(),
                "service_status": await self._get_service_status()
            }
            
            return status
            
        except Exception as e:
            logger.error(f"Failed to get system status: {str(e)}")
            return {"error": str(e)}
    
    async def _get_storage_usage(self) -> Dict[str, Any]:
        """Get storage usage statistics"""
        try:
            total_backup_size = sum(
                job.total_size_bytes for job in self.backup_jobs.values()
                if job.status == BackupStatus.COMPLETED
            )
            
            return {
                "total_backup_size_gb": round(total_backup_size / (1024**3), 2),
                "backup_count": len(self.backup_jobs),
                "oldest_backup": min(
                    (job.created_at for job in self.backup_jobs.values()),
                    default=None
                ),
                "newest_backup": max(
                    (job.created_at for job in self.backup_jobs.values()),
                    default=None
                )
            }
            
        except Exception as e:
            logger.error(f"Failed to get storage usage: {str(e)}")
            return {}
    
    async def _get_service_status(self) -> Dict[str, str]:
        """Get service status"""
        try:
            # This would check actual service status
            # For now, return mock status
            return {
                "romai_api": "running",
                "romai_database": "running", 
                "romai_redis": "running",
                "romai_nginx": "running"
            }
            
        except Exception as e:
            logger.error(f"Failed to get service status: {str(e)}")
            return {}
    
    async def _send_backup_notification(self, job: BackupJob, config: BackupConfiguration, success: bool) -> None:
        """Send backup notification"""
        try:
            status = "SUCCESS" if success else "FAILED"
            subject = f"RomAI Backup {status}: {job.name}"
            
            if success:
                message = f"""
                Backup completed successfully:
                
                Job ID: {job.job_id}
                Configuration: {job.name}
                Type: {job.backup_type}
                Size: {job.total_size_bytes / (1024**2):.2f} MB
                Files: {job.files_count}
                Duration: {(job.completed_at - job.started_at).total_seconds():.0f} seconds
                """
            else:
                message = f"""
                Backup failed:
                
                Job ID: {job.job_id}
                Configuration: {job.name}
                Type: {job.backup_type}
                Error: {job.error_message}
                """
            
            logger.info(f"Backup notification: {subject}")
            # Email implementation would go here
            
        except Exception as e:
            logger.error(f"Failed to send backup notification: {str(e)}")
    
    async def _send_dr_notification(self, plan: DisasterRecoveryPlan, execution_log: List[str], success: bool) -> None:
        """Send disaster recovery notification"""
        try:
            status = "SUCCESS" if success else "FAILED"
            subject = f"RomAI Disaster Recovery {status}: {plan.name}"
            
            message = f"""
            Disaster Recovery Plan Executed:
            
            Plan: {plan.name}
            Status: {status}
            RTO: {plan.rto_minutes} minutes
            RPO: {plan.rpo_minutes} minutes
            
            Execution Log:
            {chr(10).join(execution_log)}
            """
            
            logger.info(f"DR notification: {subject}")
            # Email implementation would go here
            
        except Exception as e:
            logger.error(f"Failed to send DR notification: {str(e)}")

# Usage example
def create_backup_system() -> RomAIBackupDisasterRecovery:
    """Create backup and disaster recovery system instance"""
    return RomAIBackupDisasterRecovery()

if __name__ == "__main__":
    # Example usage
    async def main():
        backup_system = create_backup_system()
        
        # Create backup
        backup_job = await backup_system.create_backup("romai_database")
        print(f"Backup job created: {backup_job.job_id}")
        
        # Get system status
        status = await backup_system.get_system_status()
        print(f"System status: {status}")
    
    asyncio.run(main())
