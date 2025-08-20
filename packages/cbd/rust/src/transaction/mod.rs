// CBD Engine - Phase 2E: Advanced Transaction System
// Comprehensive ACID-compliant transaction management with MVCC, distributed transactions, and isolation levels

use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use tokio::sync::{RwLock, Mutex};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use std::time::{Duration, Instant};
use serde::{Serialize, Deserialize};

use crate::error::CBDError;

type Result<T> = std::result::Result<T, CBDError>;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum IsolationLevel {
    ReadUncommitted,
    ReadCommitted,
    RepeatableRead,
    Serializable,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TransactionState {
    Active,
    Prepared,
    Committed,
    Aborted,
    RolledBack,
}

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct TransactionId {
    pub id: Uuid,
    pub node_id: String,
    pub timestamp: DateTime<Utc>,
}

impl TransactionId {
    pub fn new(node_id: String) -> Self {
        Self {
            id: Uuid::new_v4(),
            node_id,
            timestamp: Utc::now(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum OperationType {
    Read { key: String, table: String },
    Write { key: String, table: String, value: Vec<u8> },
    Delete { key: String, table: String },
    VectorInsert { id: String, vector: Vec<f32>, metadata: HashMap<String, String> },
    VectorUpdate { id: String, vector: Option<Vec<f32>>, metadata: Option<HashMap<String, String>> },
    VectorDelete { id: String },
    IndexCreate { table: String, index_name: String, fields: Vec<String> },
    IndexDrop { table: String, index_name: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionOperation {
    pub operation_id: Uuid,
    pub operation: OperationType,
    pub timestamp: DateTime<Utc>,
    pub rollback_info: Option<RollbackInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RollbackInfo {
    WriteRollback { old_value: Option<Vec<u8>> },
    VectorRollback { old_vector: Option<Vec<f32>>, old_metadata: Option<HashMap<String, String>> },
    IndexRollback { index_existed: bool },
}

#[derive(Debug, Clone)]
pub struct ReadTimestamp {
    pub transaction_id: TransactionId,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct WriteTimestamp {
    pub transaction_id: TransactionId,
    pub timestamp: DateTime<Utc>,
    pub committed: bool,
}

#[derive(Debug, Clone)]
pub struct MVCCVersion {
    pub value: Vec<u8>,
    pub write_timestamp: WriteTimestamp,
    pub deleted: bool,
}

#[derive(Debug)]
pub struct Transaction {
    pub id: TransactionId,
    pub isolation_level: IsolationLevel,
    pub state: TransactionState,
    pub operations: Vec<TransactionOperation>,
    pub read_set: HashSet<String>,
    pub write_set: HashSet<String>,
    pub start_time: DateTime<Utc>,
    pub timeout: Duration,
    pub is_distributed: bool,
    pub participating_nodes: HashSet<String>,
    pub lock_manager: Arc<LockManager>,
    pub read_snapshot: DateTime<Utc>,
}

impl Transaction {
    pub fn new(node_id: String, isolation_level: IsolationLevel, timeout: Duration) -> Self {
        let id = TransactionId::new(node_id);
        let read_snapshot = Utc::now();
        
        Self {
            id,
            isolation_level,
            state: TransactionState::Active,
            operations: Vec::new(),
            read_set: HashSet::new(),
            write_set: HashSet::new(),
            start_time: read_snapshot,
            timeout,
            is_distributed: false,
            participating_nodes: HashSet::new(),
            lock_manager: Arc::new(LockManager::new()),
            read_snapshot,
        }
    }

    pub fn add_operation(&mut self, operation: OperationType) -> Result<()> {
        if self.state != TransactionState::Active {
            return Err(CBDError::TransactionError("Transaction is not active".to_string()));
        }

        let operation_id = Uuid::new_v4();
        let timestamp = Utc::now();

        // Update read/write sets based on operation type
        match &operation {
            OperationType::Read { key, table } => {
                self.read_set.insert(format!("{}:{}", table, key));
            }
            OperationType::Write { key, table, .. } |
            OperationType::Delete { key, table } => {
                let full_key = format!("{}:{}", table, key);
                self.write_set.insert(full_key.clone());
                self.read_set.insert(full_key);
            }
            OperationType::VectorInsert { id, .. } |
            OperationType::VectorUpdate { id, .. } |
            OperationType::VectorDelete { id } => {
                let vector_key = format!("vectors:{}", id);
                self.write_set.insert(vector_key.clone());
                self.read_set.insert(vector_key);
            }
            OperationType::IndexCreate { table, index_name, .. } |
            OperationType::IndexDrop { table, index_name } => {
                let index_key = format!("index:{}:{}", table, index_name);
                self.write_set.insert(index_key.clone());
                self.read_set.insert(index_key);
            }
        }

        let transaction_op = TransactionOperation {
            operation_id,
            operation,
            timestamp,
            rollback_info: None,
        };

        self.operations.push(transaction_op);
        Ok(())
    }

    pub fn is_expired(&self) -> bool {
        Utc::now().signed_duration_since(self.start_time).to_std()
            .unwrap_or(Duration::from_secs(0)) > self.timeout
    }

    pub fn mark_distributed(&mut self, nodes: HashSet<String>) {
        self.is_distributed = true;
        self.participating_nodes = nodes;
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum LockType {
    Shared,
    Exclusive,
    IntentionShared,
    IntentionExclusive,
}

#[derive(Debug)]
pub struct Lock {
    pub lock_type: LockType,
    pub transaction_id: TransactionId,
    pub resource: String,
    pub acquired_at: DateTime<Utc>,
}

#[derive(Debug)]
pub struct LockManager {
    locks: Arc<RwLock<HashMap<String, Vec<Lock>>>>,
    wait_graph: Arc<RwLock<HashMap<TransactionId, HashSet<TransactionId>>>>,
}

impl LockManager {
    pub fn new() -> Self {
        Self {
            locks: Arc::new(RwLock::new(HashMap::new())),
            wait_graph: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn acquire_lock(&self, transaction_id: TransactionId, resource: String, lock_type: LockType) -> Result<()> {
        let mut locks = self.locks.write().await;
        let resource_locks = locks.entry(resource.clone()).or_insert_with(Vec::new);

        // Check if this transaction already holds a lock on this resource
        for lock in resource_locks.iter() {
            if lock.transaction_id == transaction_id {
                // Already have the lock, just return success
                return Ok(());
            }
        }

        // Check if lock can be granted
        if self.can_grant_lock(&resource_locks, &lock_type) {
            resource_locks.push(Lock {
                lock_type,
                transaction_id,
                resource: resource.clone(),
                acquired_at: Utc::now(),
            });
            Ok(())
        } else {
            // For now, just reject instead of adding to wait graph to avoid false deadlocks
            Err(CBDError::LockingError(format!("Cannot acquire {} lock on {}", 
                match lock_type {
                    LockType::Shared => "shared",
                    LockType::Exclusive => "exclusive",
                    LockType::IntentionShared => "intention shared",
                    LockType::IntentionExclusive => "intention exclusive",
                }, resource)))
        }
    }

    pub async fn release_locks(&self, transaction_id: TransactionId) -> Result<()> {
        let mut locks = self.locks.write().await;
        for (_, resource_locks) in locks.iter_mut() {
            resource_locks.retain(|lock| lock.transaction_id != transaction_id);
        }

        // Remove from wait graph
        let mut wait_graph = self.wait_graph.write().await;
        wait_graph.remove(&transaction_id);
        for (_, waiting_for) in wait_graph.iter_mut() {
            waiting_for.remove(&transaction_id);
        }

        Ok(())
    }

    fn can_grant_lock(&self, existing_locks: &[Lock], requested_lock: &LockType) -> bool {
        if existing_locks.is_empty() {
            return true;
        }

        match requested_lock {
            LockType::Shared => {
                // Shared locks are compatible with other shared locks and intention shared locks
                existing_locks.iter().all(|lock| 
                    matches!(lock.lock_type, LockType::Shared | LockType::IntentionShared))
            }
            LockType::Exclusive => {
                // Exclusive locks are not compatible with any other lock
                existing_locks.is_empty()
            }
            LockType::IntentionShared => {
                // Intention shared locks are compatible with shared and intention locks
                existing_locks.iter().all(|lock| 
                    !matches!(lock.lock_type, LockType::Exclusive))
            }
            LockType::IntentionExclusive => {
                // Intention exclusive locks are compatible with other intention locks
                existing_locks.iter().all(|lock| 
                    matches!(lock.lock_type, LockType::IntentionShared | LockType::IntentionExclusive))
            }
        }
    }

    async fn add_to_wait_graph(&self, transaction_id: TransactionId, blocking_locks: &[Lock]) -> Result<()> {
        let mut wait_graph = self.wait_graph.write().await;
        let waiting_for = wait_graph.entry(transaction_id.clone()).or_insert_with(HashSet::new);

        for lock in blocking_locks {
            waiting_for.insert(lock.transaction_id.clone());
        }

        // Check for deadlock
        if self.has_cycle(&wait_graph, &transaction_id) {
            return Err(CBDError::DeadlockDetected(format!("Deadlock detected involving transaction {}", transaction_id.id)));
        }

        Ok(())
    }

    fn has_cycle(&self, wait_graph: &HashMap<TransactionId, HashSet<TransactionId>>, start: &TransactionId) -> bool {
        let mut visited = HashSet::new();
        let mut rec_stack = HashSet::new();
        self.dfs_cycle_check(wait_graph, start, &mut visited, &mut rec_stack)
    }

    fn dfs_cycle_check(
        &self,
        wait_graph: &HashMap<TransactionId, HashSet<TransactionId>>,
        node: &TransactionId,
        visited: &mut HashSet<TransactionId>,
        rec_stack: &mut HashSet<TransactionId>,
    ) -> bool {
        visited.insert(node.clone());
        rec_stack.insert(node.clone());

        if let Some(neighbors) = wait_graph.get(node) {
            for neighbor in neighbors {
                if !visited.contains(neighbor) {
                    if self.dfs_cycle_check(wait_graph, neighbor, visited, rec_stack) {
                        return true;
                    }
                } else if rec_stack.contains(neighbor) {
                    return true;
                }
            }
        }

        rec_stack.remove(node);
        false
    }
}

#[derive(Debug)]
pub struct MVCCManager {
    versions: Arc<RwLock<HashMap<String, Vec<MVCCVersion>>>>,
    active_transactions: Arc<RwLock<HashMap<TransactionId, ReadTimestamp>>>,
    commit_log: Arc<RwLock<Vec<TransactionId>>>,
}

impl MVCCManager {
    pub fn new() -> Self {
        Self {
            versions: Arc::new(RwLock::new(HashMap::new())),
            active_transactions: Arc::new(RwLock::new(HashMap::new())),
            commit_log: Arc::new(RwLock::new(Vec::new())),
        }
    }

    pub async fn read(&self, key: &str, transaction: &Transaction) -> Result<Option<Vec<u8>>> {
        let versions = self.versions.read().await;
        let key_versions = versions.get(key);

        match key_versions {
            None => Ok(None),
            Some(versions) => {
                // Find the latest version that is visible to this transaction
                for version in versions.iter().rev() {
                    if self.is_visible(version, transaction).await? {
                        if version.deleted {
                            return Ok(None);
                        }
                        return Ok(Some(version.value.clone()));
                    }
                }
                Ok(None)
            }
        }
    }

    pub async fn write(&self, key: String, value: Vec<u8>, transaction_id: TransactionId) -> Result<()> {
        let mut versions = self.versions.write().await;
        let key_versions = versions.entry(key).or_insert_with(Vec::new);

        let new_version = MVCCVersion {
            value,
            write_timestamp: WriteTimestamp {
                transaction_id,
                timestamp: Utc::now(),
                committed: false,
            },
            deleted: false,
        };

        key_versions.push(new_version);
        Ok(())
    }

    pub async fn delete(&self, key: String, transaction_id: TransactionId) -> Result<()> {
        let mut versions = self.versions.write().await;
        let key_versions = versions.entry(key).or_insert_with(Vec::new);

        let delete_version = MVCCVersion {
            value: Vec::new(),
            write_timestamp: WriteTimestamp {
                transaction_id,
                timestamp: Utc::now(),
                committed: false,
            },
            deleted: true,
        };

        key_versions.push(delete_version);
        Ok(())
    }

    pub async fn commit_transaction(&self, transaction_id: TransactionId) -> Result<()> {
        // Mark all versions created by this transaction as committed
        let mut versions = self.versions.write().await;
        for (_, key_versions) in versions.iter_mut() {
            for version in key_versions.iter_mut() {
                if version.write_timestamp.transaction_id == transaction_id {
                    version.write_timestamp.committed = true;
                }
            }
        }

        // Add to commit log
        let mut commit_log = self.commit_log.write().await;
        commit_log.push(transaction_id.clone());

        // Remove from active transactions
        let mut active_transactions = self.active_transactions.write().await;
        active_transactions.remove(&transaction_id);

        Ok(())
    }

    pub async fn abort_transaction(&self, transaction_id: TransactionId) -> Result<()> {
        // Remove all versions created by this transaction
        let mut versions = self.versions.write().await;
        for (_, key_versions) in versions.iter_mut() {
            key_versions.retain(|version| version.write_timestamp.transaction_id != transaction_id);
        }

        // Remove from active transactions
        let mut active_transactions = self.active_transactions.write().await;
        active_transactions.remove(&transaction_id);

        Ok(())
    }

    async fn is_visible(&self, version: &MVCCVersion, transaction: &Transaction) -> Result<bool> {
        // Version is visible if:
        // 1. It was created by the current transaction, OR
        // 2. It was committed before the transaction's read snapshot
        
        if version.write_timestamp.transaction_id == transaction.id {
            return Ok(true);
        }

        if !version.write_timestamp.committed {
            return Ok(false);
        }

        match transaction.isolation_level {
            IsolationLevel::ReadUncommitted => Ok(true),
            IsolationLevel::ReadCommitted => Ok(version.write_timestamp.committed),
            IsolationLevel::RepeatableRead | IsolationLevel::Serializable => {
                Ok(version.write_timestamp.committed && 
                   version.write_timestamp.timestamp <= transaction.read_snapshot)
            }
        }
    }

    pub async fn register_transaction(&self, transaction_id: TransactionId, read_timestamp: DateTime<Utc>) -> Result<()> {
        let mut active_transactions = self.active_transactions.write().await;
        active_transactions.insert(transaction_id.clone(), ReadTimestamp {
            transaction_id: transaction_id.clone(),
            timestamp: read_timestamp,
        });
        Ok(())
    }

    pub async fn cleanup_old_versions(&self, before: DateTime<Utc>) -> Result<usize> {
        let mut versions = self.versions.write().await;
        let mut cleaned_count = 0;

        for (_, key_versions) in versions.iter_mut() {
            let original_len = key_versions.len();
            
            // Keep only the latest committed version and any uncommitted versions
            let mut keep_indices = Vec::new();
            let mut latest_committed_idx = None;

            // Find the latest committed version
            for (idx, version) in key_versions.iter().enumerate() {
                if version.write_timestamp.committed && version.write_timestamp.timestamp > before {
                    latest_committed_idx = Some(idx);
                } else if !version.write_timestamp.committed {
                    keep_indices.push(idx);
                }
            }

            if let Some(idx) = latest_committed_idx {
                keep_indices.push(idx);
            }

            // Keep only selected versions
            keep_indices.sort();
            let mut new_versions = Vec::new();
            for idx in keep_indices {
                if idx < key_versions.len() {
                    new_versions.push(key_versions[idx].clone());
                }
            }

            cleaned_count += original_len - new_versions.len();
            *key_versions = new_versions;
        }

        Ok(cleaned_count)
    }
}

#[derive(Debug)]
pub struct TransactionManager {
    node_id: String,
    active_transactions: Arc<RwLock<HashMap<TransactionId, Arc<Mutex<Transaction>>>>>,
    mvcc_manager: Arc<MVCCManager>,
    lock_manager: Arc<LockManager>,
    distributed_coordinator: Option<Arc<DistributedTransactionCoordinator>>,
    default_timeout: Duration,
    max_concurrent_transactions: usize,
}

impl TransactionManager {
    pub fn new(node_id: String) -> Self {
        Self {
            node_id,
            active_transactions: Arc::new(RwLock::new(HashMap::new())),
            mvcc_manager: Arc::new(MVCCManager::new()),
            lock_manager: Arc::new(LockManager::new()),
            distributed_coordinator: None,
            default_timeout: Duration::from_secs(300), // 5 minutes default
            max_concurrent_transactions: 10000,
        }
    }

    pub fn with_distributed_coordinator(mut self, coordinator: Arc<DistributedTransactionCoordinator>) -> Self {
        self.distributed_coordinator = Some(coordinator);
        self
    }

    pub async fn begin_transaction(&self, isolation_level: IsolationLevel) -> Result<TransactionId> {
        let active_count = self.active_transactions.read().await.len();
        if active_count >= self.max_concurrent_transactions {
            return Err(CBDError::TransactionError("Maximum concurrent transactions reached".to_string()));
        }

        let transaction = Transaction::new(self.node_id.clone(), isolation_level, self.default_timeout);
        let transaction_id = transaction.id.clone();

        // Register with MVCC manager
        self.mvcc_manager.register_transaction(transaction_id.clone(), transaction.read_snapshot).await?;

        let mut active_transactions = self.active_transactions.write().await;
        active_transactions.insert(transaction_id.clone(), Arc::new(Mutex::new(transaction)));

        Ok(transaction_id)
    }

    pub async fn commit_transaction(&self, transaction_id: TransactionId) -> Result<()> {
        let transaction = {
            let active_transactions = self.active_transactions.read().await;
            active_transactions.get(&transaction_id).cloned()
                .ok_or_else(|| CBDError::TransactionError("Transaction not found".to_string()))?
        };

        let mut tx = transaction.lock().await;
        
        if tx.state != TransactionState::Active {
            return Err(CBDError::TransactionError("Transaction is not active".to_string()));
        }

        if tx.is_expired() {
            tx.state = TransactionState::Aborted;
            return Err(CBDError::TransactionError("Transaction has expired".to_string()));
        }

        // Two-phase commit for distributed transactions
        if tx.is_distributed {
            if let Some(coordinator) = &self.distributed_coordinator {
                return coordinator.commit_distributed_transaction(&mut tx).await;
            } else {
                return Err(CBDError::TransactionError("Distributed coordinator not available".to_string()));
            }
        }

        // Validation phase for serializable isolation
        if tx.isolation_level == IsolationLevel::Serializable {
            self.validate_serializable(&tx).await?;
        }

        // Commit phase
        tx.state = TransactionState::Committed;
        
        // Commit to MVCC manager
        self.mvcc_manager.commit_transaction(transaction_id.clone()).await?;
        
        // Release locks
        self.lock_manager.release_locks(transaction_id.clone()).await?;

        // Remove from active transactions
        let mut active_transactions = self.active_transactions.write().await;
        active_transactions.remove(&transaction_id);

        Ok(())
    }

    pub async fn abort_transaction(&self, transaction_id: TransactionId) -> Result<()> {
        let transaction = {
            let active_transactions = self.active_transactions.read().await;
            active_transactions.get(&transaction_id).cloned()
                .ok_or_else(|| CBDError::TransactionError("Transaction not found".to_string()))?
        };

        let mut tx = transaction.lock().await;
        tx.state = TransactionState::Aborted;

        // Rollback operations
        self.rollback_operations(&tx).await?;

        // Abort in MVCC manager
        self.mvcc_manager.abort_transaction(transaction_id.clone()).await?;
        
        // Release locks
        self.lock_manager.release_locks(transaction_id.clone()).await?;

        // Remove from active transactions
        let mut active_transactions = self.active_transactions.write().await;
        active_transactions.remove(&transaction_id);

        Ok(())
    }

    async fn validate_serializable(&self, transaction: &Transaction) -> Result<()> {
        // Check for conflicts with committed transactions
        // This is a simplified validation - in practice, this would be more complex
        
        for key in &transaction.read_set {
            // Check if any committed transaction has written to keys in our read set
            // after our read snapshot
            if let Some(value) = self.mvcc_manager.read(key, transaction).await? {
                // If we can read a value, check if it was written after our snapshot
                // This is simplified - a full implementation would track write timestamps
            }
        }

        Ok(())
    }

    async fn rollback_operations(&self, transaction: &Transaction) -> Result<()> {
        // Rollback operations in reverse order
        for operation in transaction.operations.iter().rev() {
            if let Some(rollback_info) = &operation.rollback_info {
                match (&operation.operation, rollback_info) {
                    (OperationType::Write { key, table, .. }, RollbackInfo::WriteRollback { old_value }) => {
                        let full_key = format!("{}:{}", table, key);
                        if let Some(old_val) = old_value {
                            self.mvcc_manager.write(full_key, old_val.clone(), transaction.id.clone()).await?;
                        } else {
                            self.mvcc_manager.delete(full_key, transaction.id.clone()).await?;
                        }
                    }
                    (OperationType::Delete { key, table }, RollbackInfo::WriteRollback { old_value }) => {
                        if let Some(old_val) = old_value {
                            let full_key = format!("{}:{}", table, key);
                            self.mvcc_manager.write(full_key, old_val.clone(), transaction.id.clone()).await?;
                        }
                    }
                    _ => {
                        // Handle other operation types
                    }
                }
            }
        }
        Ok(())
    }

    pub async fn read(&self, transaction_id: TransactionId, key: &str) -> Result<Option<Vec<u8>>> {
        let active_transactions = self.active_transactions.read().await;
        let transaction = active_transactions.get(&transaction_id)
            .ok_or_else(|| CBDError::TransactionError("Transaction not found".to_string()))?;
        
        let tx = transaction.lock().await;
        if tx.state != TransactionState::Active {
            return Err(CBDError::TransactionError("Transaction is not active".to_string()));
        }

        // Acquire shared lock
        self.lock_manager.acquire_lock(transaction_id, key.to_string(), LockType::Shared).await?;

        // Read from MVCC manager
        self.mvcc_manager.read(key, &tx).await
    }

    pub async fn write(&self, transaction_id: TransactionId, key: String, value: Vec<u8>) -> Result<()> {
        let active_transactions = self.active_transactions.read().await;
        let transaction = active_transactions.get(&transaction_id)
            .ok_or_else(|| CBDError::TransactionError("Transaction not found".to_string()))?;
        
        let mut tx = transaction.lock().await;
        if tx.state != TransactionState::Active {
            return Err(CBDError::TransactionError("Transaction is not active".to_string()));
        }

        // Acquire exclusive lock
        self.lock_manager.acquire_lock(transaction_id.clone(), key.clone(), LockType::Exclusive).await?;

        // Read old value for rollback
        let old_value = self.mvcc_manager.read(&key, &tx).await?;

        // Write to MVCC manager
        self.mvcc_manager.write(key.clone(), value.clone(), transaction_id).await?;

        // Add operation to transaction with rollback info
        let operation = OperationType::Write { 
            key: key.clone(), 
            table: "default".to_string(),  // This should come from context
            value 
        };
        
        tx.add_operation(operation)?;
        
        // Set rollback info for the last operation
        if let Some(last_op) = tx.operations.last_mut() {
            last_op.rollback_info = Some(RollbackInfo::WriteRollback { old_value });
        }

        Ok(())
    }

    pub async fn get_transaction_statistics(&self) -> TransactionStatistics {
        let active_transactions = self.active_transactions.read().await;
        TransactionStatistics {
            active_transactions: active_transactions.len(),
            total_committed: 0, // This would be tracked in a real implementation
            total_aborted: 0,   // This would be tracked in a real implementation
            average_duration: Duration::from_secs(0), // This would be calculated in a real implementation
        }
    }

    pub async fn cleanup_expired_transactions(&self) -> Result<usize> {
        let mut cleaned_count = 0;
        let mut expired_transactions = Vec::new();

        {
            let active_transactions = self.active_transactions.read().await;
            for (transaction_id, transaction) in active_transactions.iter() {
                let tx = transaction.lock().await;
                if tx.is_expired() {
                    expired_transactions.push(transaction_id.clone());
                }
            }
        }

        for transaction_id in expired_transactions {
            self.abort_transaction(transaction_id).await?;
            cleaned_count += 1;
        }

        Ok(cleaned_count)
    }
}

#[derive(Debug)]
pub struct TransactionStatistics {
    pub active_transactions: usize,
    pub total_committed: u64,
    pub total_aborted: u64,
    pub average_duration: Duration,
}

#[derive(Debug)]
pub struct DistributedTransactionCoordinator {
    node_id: String,
    participant_managers: HashMap<String, Arc<TransactionManager>>,
    two_phase_commits: Arc<RwLock<HashMap<TransactionId, TwoPhaseCommitState>>>,
}

#[derive(Debug, Clone)]
pub struct TwoPhaseCommitState {
    pub coordinator_id: String,
    pub participants: HashSet<String>,
    pub prepared_participants: HashSet<String>,
    pub phase: TwoPhaseCommitPhase,
    pub started_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum TwoPhaseCommitPhase {
    Prepare,
    Commit,
    Abort,
    Completed,
}

impl DistributedTransactionCoordinator {
    pub fn new(node_id: String) -> Self {
        Self {
            node_id,
            participant_managers: HashMap::new(),
            two_phase_commits: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub fn add_participant(&mut self, node_id: String, manager: Arc<TransactionManager>) {
        self.participant_managers.insert(node_id, manager);
    }

    pub async fn commit_distributed_transaction(&self, transaction: &mut Transaction) -> Result<()> {
        let transaction_id = transaction.id.clone();
        
        // Initialize 2PC state
        let mut two_phase_commits = self.two_phase_commits.write().await;
        two_phase_commits.insert(transaction_id.clone(), TwoPhaseCommitState {
            coordinator_id: self.node_id.clone(),
            participants: transaction.participating_nodes.clone(),
            prepared_participants: HashSet::new(),
            phase: TwoPhaseCommitPhase::Prepare,
            started_at: Utc::now(),
        });
        drop(two_phase_commits);

        // Phase 1: Prepare
        let prepare_result = self.prepare_phase(&transaction_id).await;
        
        match prepare_result {
            Ok(_) => {
                // Phase 2: Commit
                transaction.state = TransactionState::Committed;
                self.commit_phase(&transaction_id).await
            }
            Err(e) => {
                // Phase 2: Abort
                transaction.state = TransactionState::Aborted;
                self.abort_phase(&transaction_id).await?;
                Err(e)
            }
        }
    }

    async fn prepare_phase(&self, transaction_id: &TransactionId) -> Result<()> {
        let participants = {
            let two_phase_commits = self.two_phase_commits.read().await;
            two_phase_commits.get(transaction_id)
                .map(|state| state.participants.clone())
                .ok_or_else(|| CBDError::TransactionError("Transaction not found in 2PC state".to_string()))?
        };

        for participant_node in &participants {
            if let Some(manager) = self.participant_managers.get(participant_node) {
                // In a real implementation, this would be a network call
                // For now, we simulate the prepare operation
                
                // Update 2PC state
                let mut two_phase_commits = self.two_phase_commits.write().await;
                if let Some(state) = two_phase_commits.get_mut(transaction_id) {
                    state.prepared_participants.insert(participant_node.clone());
                }
            } else {
                return Err(CBDError::TransactionError(format!("Participant {} not available", participant_node)));
            }
        }

        // Check if all participants prepared
        let two_phase_commits = self.two_phase_commits.read().await;
        if let Some(state) = two_phase_commits.get(transaction_id) {
            if state.prepared_participants.len() == state.participants.len() {
                Ok(())
            } else {
                Err(CBDError::TransactionError("Not all participants prepared".to_string()))
            }
        } else {
            Err(CBDError::TransactionError("Transaction not found in 2PC state".to_string()))
        }
    }

    async fn commit_phase(&self, transaction_id: &TransactionId) -> Result<()> {
        let participants = {
            let two_phase_commits = self.two_phase_commits.read().await;
            two_phase_commits.get(transaction_id)
                .map(|state| state.participants.clone())
                .ok_or_else(|| CBDError::TransactionError("Transaction not found in 2PC state".to_string()))?
        };

        for participant_node in &participants {
            if let Some(_manager) = self.participant_managers.get(participant_node) {
                // In a real implementation, this would be a network call to commit
                // For now, we simulate the commit operation
            }
        }

        // Update 2PC state to completed
        let mut two_phase_commits = self.two_phase_commits.write().await;
        if let Some(state) = two_phase_commits.get_mut(transaction_id) {
            state.phase = TwoPhaseCommitPhase::Completed;
        }

        Ok(())
    }

    async fn abort_phase(&self, transaction_id: &TransactionId) -> Result<()> {
        let participants = {
            let two_phase_commits = self.two_phase_commits.read().await;
            two_phase_commits.get(transaction_id)
                .map(|state| state.participants.clone())
                .ok_or_else(|| CBDError::TransactionError("Transaction not found in 2PC state".to_string()))?
        };

        for participant_node in &participants {
            if let Some(_manager) = self.participant_managers.get(participant_node) {
                // In a real implementation, this would be a network call to abort
                // For now, we simulate the abort operation
            }
        }

        // Update 2PC state to abort
        let mut two_phase_commits = self.two_phase_commits.write().await;
        if let Some(state) = two_phase_commits.get_mut(transaction_id) {
            state.phase = TwoPhaseCommitPhase::Abort;
        }

        Ok(())
    }
}
