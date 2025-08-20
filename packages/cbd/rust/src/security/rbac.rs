//! RBAC (Role-Based Access Control) Module
//! 
//! Manages user roles, permissions, and access control:
//! - Role definitions and hierarchies
//! - Permission-based access control
//! - Dynamic permission evaluation
//! - Integration with authentication system

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};
use anyhow::{Result, anyhow};

#[derive(Debug, Clone)]
pub struct RBACManager {
    roles: Arc<RwLock<HashMap<String, Role>>>,
    user_roles: Arc<RwLock<HashMap<String, Vec<String>>>>, // user_id -> role names
    permissions: Arc<RwLock<HashMap<String, Permission>>>,
    role_hierarchy: Arc<RwLock<HashMap<String, Vec<String>>>>, // parent -> children
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Role {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub permissions: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub is_system_role: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Permission {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub resource: String,
    pub action: String,
    pub conditions: Vec<PermissionCondition>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionCondition {
    pub condition_type: ConditionType,
    pub field: String,
    pub operator: ConditionOperator,
    pub value: ConditionValue,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConditionType {
    Field,
    Time,
    Context,
    Resource,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConditionOperator {
    Equals,
    NotEquals,
    GreaterThan,
    LessThan,
    Contains,
    StartsWith,
    EndsWith,
    In,
    NotIn,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConditionValue {
    String(String),
    Number(f64),
    Boolean(bool),
    Array(Vec<String>),
    DateTime(DateTime<Utc>),
}

#[derive(Debug, Clone)]
pub struct AccessRequest {
    pub user_id: String,
    pub resource: String,
    pub action: String,
    pub context: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct AccessDecision {
    pub granted: bool,
    pub reason: String,
    pub matched_permissions: Vec<String>,
    pub evaluated_at: DateTime<Utc>,
}

impl RBACManager {
    pub async fn new() -> Result<Self> {
        let manager = Self {
            roles: Arc::new(RwLock::new(HashMap::new())),
            user_roles: Arc::new(RwLock::new(HashMap::new())),
            permissions: Arc::new(RwLock::new(HashMap::new())),
            role_hierarchy: Arc::new(RwLock::new(HashMap::new())),
        };
        
        // Initialize default roles and permissions
        manager.initialize_default_roles().await?;
        manager.initialize_default_permissions().await?;
        
        Ok(manager)
    }
    
    /// Create a new role
    pub async fn create_role(&self, name: String, permissions: Vec<String>) -> Result<Role> {
        let role = Role {
            id: Uuid::new_v4(),
            name: name.clone(),
            description: format!("Role: {}", name),
            permissions,
            created_at: Utc::now(),
            updated_at: Utc::now(),
            is_system_role: false,
        };
        
        let mut roles = self.roles.write().await;
        if roles.contains_key(&name) {
            return Err(anyhow!("Role already exists: {}", name));
        }
        
        roles.insert(name, role.clone());
        Ok(role)
    }
    
    /// Create a new permission
    pub async fn create_permission(
        &self,
        name: String,
        resource: String,
        action: String,
        conditions: Vec<PermissionCondition>,
    ) -> Result<Permission> {
        let permission = Permission {
            id: Uuid::new_v4(),
            name: name.clone(),
            description: format!("Permission: {} on {}", action, resource),
            resource,
            action,
            conditions,
            created_at: Utc::now(),
        };
        
        let mut permissions = self.permissions.write().await;
        if permissions.contains_key(&name) {
            return Err(anyhow!("Permission already exists: {}", name));
        }
        
        permissions.insert(name, permission.clone());
        Ok(permission)
    }
    
    /// Assign role to user
    pub async fn assign_user_role(&self, user_id: &str, role_name: &str) -> Result<()> {
        // Verify role exists
        let roles = self.roles.read().await;
        if !roles.contains_key(role_name) {
            return Err(anyhow!("Role does not exist: {}", role_name));
        }
        drop(roles);
        
        let mut user_roles = self.user_roles.write().await;
        let user_role_list = user_roles.entry(user_id.to_string()).or_insert_with(Vec::new);
        
        if !user_role_list.contains(&role_name.to_string()) {
            user_role_list.push(role_name.to_string());
        }
        
        Ok(())
    }
    
    /// Remove role from user
    pub async fn remove_user_role(&self, user_id: &str, role_name: &str) -> Result<()> {
        let mut user_roles = self.user_roles.write().await;
        if let Some(user_role_list) = user_roles.get_mut(user_id) {
            user_role_list.retain(|role| role != role_name);
        }
        Ok(())
    }
    
    /// Get user roles
    pub async fn get_user_roles(&self, user_id: &str) -> Result<Vec<Role>> {
        let user_roles = self.user_roles.read().await;
        let role_names = user_roles.get(user_id).cloned().unwrap_or_default();
        drop(user_roles);
        
        let roles = self.roles.read().await;
        let user_role_objects = role_names
            .into_iter()
            .filter_map(|name| roles.get(&name).cloned())
            .collect();
        
        Ok(user_role_objects)
    }
    
    /// Get user permissions (including inherited from roles)
    pub async fn get_user_permissions(&self, user_id: &str) -> Result<Vec<Permission>> {
        let user_roles = self.get_user_roles(user_id).await?;
        let permissions = self.permissions.read().await;
        
        let mut user_permissions = Vec::new();
        let mut seen_permissions = std::collections::HashSet::new();
        
        for role in user_roles {
            for permission_name in role.permissions {
                if seen_permissions.insert(permission_name.clone()) {
                    if let Some(permission) = permissions.get(&permission_name) {
                        user_permissions.push(permission.clone());
                    }
                }
            }
        }
        
        Ok(user_permissions)
    }
    
    /// Check if user has specific permissions
    pub fn check_permissions(&self, user_permissions: &[String], required_permissions: &[String]) -> Result<bool> {
        for required in required_permissions {
            if !user_permissions.contains(required) {
                return Ok(false);
            }
        }
        Ok(true)
    }
    
    /// Evaluate access request
    pub async fn evaluate_access(&self, request: AccessRequest) -> Result<AccessDecision> {
        let user_permissions = self.get_user_permissions(&request.user_id).await?;
        
        let mut matched_permissions = Vec::new();
        let mut access_granted = false;
        
        for permission in user_permissions {
            if self.matches_permission(&permission, &request)? {
                matched_permissions.push(permission.name.clone());
                access_granted = true;
            }
        }
        
        let reason = if access_granted {
            format!("Access granted via permissions: {}", matched_permissions.join(", "))
        } else {
            "No matching permissions found".to_string()
        };
        
        Ok(AccessDecision {
            granted: access_granted,
            reason,
            matched_permissions,
            evaluated_at: Utc::now(),
        })
    }
    
    /// Set role hierarchy (parent-child relationships)
    pub async fn set_role_hierarchy(&self, parent_role: &str, child_roles: Vec<String>) -> Result<()> {
        let mut hierarchy = self.role_hierarchy.write().await;
        hierarchy.insert(parent_role.to_string(), child_roles);
        Ok(())
    }
    
    /// Get effective roles (including inherited roles)
    pub async fn get_effective_roles(&self, user_id: &str) -> Result<Vec<Role>> {
        let direct_roles = self.get_user_roles(user_id).await?;
        let hierarchy = self.role_hierarchy.read().await;
        let roles = self.roles.read().await;
        
        let mut effective_roles = direct_roles.clone();
        let mut processed_roles = std::collections::HashSet::new();
        
        for role in direct_roles {
            self.collect_inherited_roles(
                &role.name,
                &hierarchy,
                &roles,
                &mut effective_roles,
                &mut processed_roles,
            );
        }
        
        // Remove duplicates
        effective_roles.sort_by(|a, b| a.name.cmp(&b.name));
        effective_roles.dedup_by(|a, b| a.name == b.name);
        
        Ok(effective_roles)
    }
    
    /// List all roles
    pub async fn list_roles(&self) -> Result<Vec<Role>> {
        let roles = self.roles.read().await;
        Ok(roles.values().cloned().collect())
    }
    
    /// List all permissions
    pub async fn list_permissions(&self) -> Result<Vec<Permission>> {
        let permissions = self.permissions.read().await;
        Ok(permissions.values().cloned().collect())
    }
    
    /// Delete role
    pub async fn delete_role(&self, role_name: &str) -> Result<()> {
        let mut roles = self.roles.write().await;
        if let Some(role) = roles.get(role_name) {
            if role.is_system_role {
                return Err(anyhow!("Cannot delete system role: {}", role_name));
            }
        }
        
        roles.remove(role_name);
        
        // Remove role assignments
        let mut user_roles = self.user_roles.write().await;
        for user_role_list in user_roles.values_mut() {
            user_role_list.retain(|role| role != role_name);
        }
        
        Ok(())
    }
    
    async fn initialize_default_roles(&self) -> Result<()> {
        let default_roles = vec![
            ("admin", vec!["admin:all".to_string()], true),
            ("user", vec!["vectors:read".to_string(), "vectors:search".to_string()], true),
            ("readonly", vec!["vectors:read".to_string()], true),
            ("power_user", vec![
                "vectors:read".to_string(),
                "vectors:write".to_string(),
                "vectors:search".to_string(),
                "vectors:delete".to_string(),
            ], true),
        ];
        
        let mut roles = self.roles.write().await;
        for (name, permissions, is_system) in default_roles {
            let role = Role {
                id: Uuid::new_v4(),
                name: name.to_string(),
                description: format!("System role: {}", name),
                permissions,
                created_at: Utc::now(),
                updated_at: Utc::now(),
                is_system_role: is_system,
            };
            roles.insert(name.to_string(), role);
        }
        
        Ok(())
    }
    
    async fn initialize_default_permissions(&self) -> Result<()> {
        let default_permissions = vec![
            ("admin:all", "all", "all", vec![]),
            ("vectors:read", "vectors", "read", vec![]),
            ("vectors:write", "vectors", "write", vec![]),
            ("vectors:delete", "vectors", "delete", vec![]),
            ("vectors:search", "vectors", "search", vec![]),
            ("cluster:manage", "cluster", "manage", vec![]),
        ];
        
        let mut permissions = self.permissions.write().await;
        for (name, resource, action, conditions) in default_permissions {
            let permission = Permission {
                id: Uuid::new_v4(),
                name: name.to_string(),
                description: format!("System permission: {} on {}", action, resource),
                resource: resource.to_string(),
                action: action.to_string(),
                conditions,
                created_at: Utc::now(),
            };
            permissions.insert(name.to_string(), permission);
        }
        
        Ok(())
    }
    
    fn matches_permission(&self, permission: &Permission, request: &AccessRequest) -> Result<bool> {
        // Check resource and action match
        if permission.resource != "all" && permission.resource != request.resource {
            return Ok(false);
        }
        
        if permission.action != "all" && permission.action != request.action {
            return Ok(false);
        }
        
        // Evaluate conditions
        for condition in &permission.conditions {
            if !self.evaluate_condition(condition, request)? {
                return Ok(false);
            }
        }
        
        Ok(true)
    }
    
    fn evaluate_condition(&self, condition: &PermissionCondition, request: &AccessRequest) -> Result<bool> {
        let field_value = match condition.condition_type {
            ConditionType::Context => request.context.get(&condition.field),
            ConditionType::Field => match condition.field.as_str() {
                "user_id" => Some(&request.user_id),
                "resource" => Some(&request.resource),
                "action" => Some(&request.action),
                _ => None,
            },
            ConditionType::Time => {
                // Time-based conditions would need current time evaluation
                return Ok(true); // Simplified for now
            },
            ConditionType::Resource => {
                // Resource-specific conditions
                return Ok(true); // Simplified for now
            },
        };
        
        if let Some(value) = field_value {
            self.evaluate_operator(&condition.operator, value, &condition.value)
        } else {
            Ok(false)
        }
    }
    
    fn evaluate_operator(&self, operator: &ConditionOperator, field_value: &str, condition_value: &ConditionValue) -> Result<bool> {
        match (operator, condition_value) {
            (ConditionOperator::Equals, ConditionValue::String(val)) => Ok(field_value == val),
            (ConditionOperator::NotEquals, ConditionValue::String(val)) => Ok(field_value != val),
            (ConditionOperator::Contains, ConditionValue::String(val)) => Ok(field_value.contains(val)),
            (ConditionOperator::StartsWith, ConditionValue::String(val)) => Ok(field_value.starts_with(val)),
            (ConditionOperator::EndsWith, ConditionValue::String(val)) => Ok(field_value.ends_with(val)),
            (ConditionOperator::In, ConditionValue::Array(vals)) => Ok(vals.contains(&field_value.to_string())),
            (ConditionOperator::NotIn, ConditionValue::Array(vals)) => Ok(!vals.contains(&field_value.to_string())),
            _ => Ok(true), // Simplified for unsupported combinations
        }
    }
    
    fn collect_inherited_roles(
        &self,
        role_name: &str,
        hierarchy: &HashMap<String, Vec<String>>,
        roles: &HashMap<String, Role>,
        effective_roles: &mut Vec<Role>,
        processed: &mut std::collections::HashSet<String>,
    ) {
        if processed.contains(role_name) {
            return; // Prevent infinite loops
        }
        processed.insert(role_name.to_string());
        
        if let Some(child_roles) = hierarchy.get(role_name) {
            for child_role_name in child_roles {
                if let Some(child_role) = roles.get(child_role_name) {
                    effective_roles.push(child_role.clone());
                    self.collect_inherited_roles(
                        child_role_name,
                        hierarchy,
                        roles,
                        effective_roles,
                        processed,
                    );
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio_test;
    
    #[tokio::test]
    async fn test_role_creation() {
        let rbac = RBACManager::new().await.unwrap();
        let role = rbac.create_role("test_role".to_string(), vec!["test:permission".to_string()]).await.unwrap();
        
        assert_eq!(role.name, "test_role");
        assert!(role.permissions.contains(&"test:permission".to_string()));
    }
    
    #[tokio::test]
    async fn test_user_role_assignment() {
        let rbac = RBACManager::new().await.unwrap();
        
        // User should have access to default user role
        let user_roles = rbac.get_user_roles("test_user").await.unwrap();
        assert!(user_roles.is_empty()); // No roles assigned initially
        
        // Assign user role
        rbac.assign_user_role("test_user", "user").await.unwrap();
        
        let user_roles = rbac.get_user_roles("test_user").await.unwrap();
        assert_eq!(user_roles.len(), 1);
        assert_eq!(user_roles[0].name, "user");
    }
    
    #[tokio::test]
    async fn test_access_evaluation() {
        let rbac = RBACManager::new().await.unwrap();
        
        // Assign user role
        rbac.assign_user_role("test_user", "user").await.unwrap();
        
        // Test access request
        let request = AccessRequest {
            user_id: "test_user".to_string(),
            resource: "vectors".to_string(),
            action: "read".to_string(),
            context: HashMap::new(),
        };
        
        let decision = rbac.evaluate_access(request).await.unwrap();
        assert!(decision.granted);
        assert!(decision.matched_permissions.contains(&"vectors:read".to_string()));
    }
}
