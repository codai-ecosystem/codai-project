"""
RomAI Backup and Disaster Recovery Package Initialization
========================================================

This package provides comprehensive backup and disaster recovery capabilities
for RomAI Multi-Domain AGI with automated backup orchestration, encrypted
storage, multi-region replication, and Romanian compliance-aware data
protection.

Backup Components:
- RomAIBackupDisasterRecovery: Core backup and DR orchestration
- BackupConfiguration: Configurable backup settings
- BackupJob: Individual backup task management
- DisasterRecoveryPlan: Comprehensive recovery strategies
- RecoveryPoint: Point-in-time recovery capabilities

Backup Features:
- Multi-tier backup strategy (hot, warm, cold)
- Automated scheduling with intelligent frequency
- Encrypted storage with Azure Key Vault integration
- Multi-region replication for disaster recovery
- Incremental and full backup support
- Backup verification and integrity checking

Disaster Recovery:
- Automated failover and failback procedures
- RTO (Recovery Time Objective) optimization
- RPO (Recovery Point Objective) minimization
- Geographic redundancy across EU regions
- Business continuity planning
- Compliance-aware recovery procedures

Romanian Compliance:
- GDPR data protection requirements
- ANSPDCP (Romanian DPA) compliance
- EU data residency enforcement
- Audit trail for all backup operations
- Automated retention policy enforcement

Usage:
    from romai.production.backup import (
        RomAIBackupDisasterRecovery,
        BackupConfiguration,
        BackupJob
    )
    
    # Initialize backup system
    backup_system = RomAIBackupDisasterRecovery()
    await backup_system.initialize()
    
    # Create backup job
    backup_result = await backup_system.create_backup_job()

Author: RomAI Excellence Team
Version: 1.0.0
"""

from .romai_backup_disaster_recovery import (
    RomAIBackupDisasterRecovery,
    BackupConfiguration,
    BackupJob,
    BackupRecord,
    BackupStatus,
    DisasterRecoveryPlan,
    RecoveryPoint,
    FailoverStatus,
    BackupSchedule,
    BackupType,
    RecoveryStrategy,
    BackupError,
    RecoveryError
)

# Package exports
__all__ = [
    "RomAIBackupDisasterRecovery",
    "BackupConfiguration",
    "BackupJob", 
    "BackupRecord",
    "BackupStatus",
    "DisasterRecoveryPlan",
    "RecoveryPoint",
    "FailoverStatus",
    "BackupSchedule",
    "BackupType", 
    "RecoveryStrategy",
    "BackupError",
    "RecoveryError"
]

__version__ = "1.0.0"
__author__ = "RomAI Excellence Team"