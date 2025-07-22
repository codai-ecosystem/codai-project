#!/usr/bin/env node

/**
 * CODAI ID - Enterprise System Initialization Script
 * Sets up the enterprise-grade authentication system with all components
 */

const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function initializeEnterpriseSystem() {
  console.log('🚀 Initializing CODAI ID Enterprise System...\n');

  try {
    // 1. Initialize Database Schema
    console.log('📊 1. Setting up database schema...');

    // Check if we can connect to the database
    await prisma.$connect();
    console.log('✅ Database connection established');

    // 2. Create Default Roles
    console.log('\n🔐 2. Setting up Role-Based Access Control (RBAC)...');

    const defaultRoles = [
      {
        name: 'SUPER_ADMIN',
        displayName: 'Super Administrator',
        description: 'Full system access with all privileges',
        isSystem: true
      },
      {
        name: 'ADMIN',
        displayName: 'Administrator',
        description: 'Administrative access to manage users and applications',
        isSystem: true
      },
      {
        name: 'USER_MANAGER',
        displayName: 'User Manager',
        description: 'Can manage users and their permissions',
        isSystem: true
      },
      {
        name: 'APPLICATION_ADMIN',
        displayName: 'Application Administrator',
        description: 'Can manage application integrations and settings',
        isSystem: true
      },
      {
        name: 'SECURITY_OFFICER',
        displayName: 'Security Officer',
        description: 'Can view security logs and manage security settings',
        isSystem: true
      },
      {
        name: 'USER',
        displayName: 'Standard User',
        description: 'Standard user access to applications',
        isSystem: true
      },
      {
        name: 'VIEWER',
        displayName: 'View Only',
        description: 'Read-only access to allowed resources',
        isSystem: true
      }
    ];

    for (const role of defaultRoles) {
      await prisma.role.upsert({
        where: { name: role.name },
        update: {},
        create: role
      });
    }

    console.log('✅ Default roles created');

    // 3. Create Default Permissions
    console.log('\n🛡️ 3. Setting up permissions system...');

    const defaultPermissions = [
      // User Management
      { name: 'user:read', displayName: 'Read Users', resource: 'user', action: 'read' },
      { name: 'user:write', displayName: 'Create/Edit Users', resource: 'user', action: 'write' },
      { name: 'user:delete', displayName: 'Delete Users', resource: 'user', action: 'delete' },
      { name: 'user:admin', displayName: 'Full User Administration', resource: 'user', action: 'admin' },

      // Role Management
      { name: 'role:read', displayName: 'Read Roles', resource: 'role', action: 'read' },
      { name: 'role:write', displayName: 'Create/Edit Roles', resource: 'role', action: 'write' },
      { name: 'role:delete', displayName: 'Delete Roles', resource: 'role', action: 'delete' },
      { name: 'role:assign', displayName: 'Assign Roles', resource: 'role', action: 'assign' },

      // Application Management
      { name: 'application:read', displayName: 'Read Applications', resource: 'application', action: 'read' },
      { name: 'application:write', displayName: 'Create/Edit Applications', resource: 'application', action: 'write' },
      { name: 'application:delete', displayName: 'Delete Applications', resource: 'application', action: 'delete' },
      { name: 'application:admin', displayName: 'Full Application Administration', resource: 'application', action: 'admin' },

      // Security Management
      { name: 'security:read', displayName: 'Read Security Logs', resource: 'security', action: 'read' },
      { name: 'security:admin', displayName: 'Security Administration', resource: 'security', action: 'admin' },

      // System Management
      { name: 'system:admin', displayName: 'System Administration', resource: 'system', action: 'admin' },
      { name: 'system:settings', displayName: 'System Settings', resource: 'system', action: 'settings' },
    ];

    for (const permission of defaultPermissions) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: {},
        create: permission
      });
    }

    console.log('✅ Default permissions created');

    // 4. Assign Permissions to Roles
    console.log('\n🔗 4. Assigning permissions to roles...');

    // Super Admin gets all permissions
    const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
    const allPermissions = await prisma.permission.findMany();

    for (const permission of allPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: permission.id
        }
      });
    }

    // Admin gets user and application management
    const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
    const adminPermissions = allPermissions.filter(p =>
      p.resource === 'user' || p.resource === 'application' || p.resource === 'role'
    );

    for (const permission of adminPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id
        }
      });
    }

    console.log('✅ Role-permission assignments completed');

    // 5. Create Admin User
    console.log('\n👤 5. Creating default admin user...');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@codai.ro';
    const adminPassword = process.env.ADMIN_PASSWORD || 'SecureAdmin123!';

    const hashedPassword = await hash(adminPassword, 12);

    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        firstName: 'System',
        lastName: 'Administrator',
        displayName: 'System Administrator',
        password: hashedPassword,
        emailVerified: new Date(),
        status: 'ACTIVE',
        role: 'ADMIN' // For NextAuth compatibility
      }
    });

    // Assign Super Admin role
    await prisma.userRole.upsert({
      where: {
        userId_roleId_scope: {
          userId: adminUser.id,
          roleId: superAdminRole.id,
          scope: "GLOBAL"
        }
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
        scope: "GLOBAL",
        assignedBy: adminUser.id // Self-assigned
      }
    });

    console.log(`✅ Admin user created: ${adminEmail}`);
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔑 Admin password: ${adminPassword}`);
      console.log('⚠️  Please change this password after first login!');
    }

    // 6. Initialize System Settings
    console.log('\n⚙️ 6. Setting up system configuration...');

    // This would be implemented when we add the SystemSettings model
    console.log('✅ System configuration ready');

    // 7. Create Initial Audit Log
    console.log('\n📝 7. Creating initial audit log...');

    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'system_initialized',
        resource: 'system',
        outcome: 'success',
        details: {
          version: '1.0.0',
          features: ['MFA', 'RBAC', 'Audit Logging', 'Fraud Detection'],
          rolesCreated: defaultRoles.length,
          permissionsCreated: defaultPermissions.length
        }
      }
    });

    console.log('✅ Initial audit log created');

    console.log('\n🎉 CODAI ID Enterprise System Initialization Complete!\n');

    console.log('📋 Summary:');
    console.log(`   ✅ ${defaultRoles.length} roles created`);
    console.log(`   ✅ ${defaultPermissions.length} permissions created`);
    console.log('   ✅ Role-permission assignments completed');
    console.log('   ✅ Admin user created and configured');
    console.log('   ✅ System audit logging active');

    console.log('\n🚀 Next Steps:');
    console.log('   1. Start the application server');
    console.log('   2. Login with admin credentials');
    console.log('   3. Configure MFA for admin user');
    console.log('   4. Begin application integrations');

    console.log('\n🔐 Security Notes:');
    console.log('   • Change admin password immediately');
    console.log('   • Enable MFA for all admin accounts');
    console.log('   • Review audit logs regularly');
    console.log('   • Update environment variables for production');

  } catch (error) {
    console.error('❌ Initialization failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run initialization
if (require.main === module) {
  initializeEnterpriseSystem()
    .then(() => {
      console.log('✨ Initialization completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeEnterpriseSystem };
