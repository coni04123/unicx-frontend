/**
 * Role-Based Access Control (RBAC) System
 * Defines permissions for different user roles in the 2N5 platform
 */

export type UserRole = 'SystemAdmin' | 'TenantAdmin' | 'User';

export interface Permission {
  // Dashboard permissions
  viewDashboard: boolean;
  viewAdvancedMetrics: boolean;
  
  // WhatsApp Accounts permissions
  viewWhatsAppAccounts: boolean;
  addWhatsAppAccount: boolean;
  editWhatsAppAccount: boolean;
  deleteWhatsAppAccount: boolean;
  viewAccountDetails: boolean;
  
  // Spy Numbers permissions
  viewSpyNumbers: boolean;
  addSpyNumber: boolean;
  editSpyNumber: boolean;
  deleteSpyNumber: boolean;
  configureSpyNumber: boolean;
  
  
  // Messages permissions
  viewMessages: boolean;
  sendMessage: boolean;
  viewMessageDetails: boolean;
  exportMessages: boolean;
  
  // Entities permissions
  viewEntities: boolean;
  addEntity: boolean;
  editEntity: boolean;
  deleteEntity: boolean;
  manageEntityHierarchy: boolean;
  
  // Sub-tenant management permissions
  viewSubTenants: boolean;
  createSubTenant: boolean;
  editSubTenant: boolean;
  deleteSubTenant: boolean;
  manageSubTenantUsers: boolean;
  monitorSubTenantMessages: boolean;
  
  // Alert and monitoring permissions
  viewAlerts: boolean;
  acknowledgeAlerts: boolean;
  configureAlerts: boolean;
  viewSystemHealth: boolean;

  // Administration permissions
  viewAdministration: boolean;
  manageUsers: boolean;
  manageTenants: boolean;
  viewAuditLogs: boolean;
  manageSystemSettings: boolean;
  viewBilling: boolean;
  manageIntegrations: boolean;
}

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  // SystemAdmin: Full access to everything across all tenants and system management
  SystemAdmin: {
    // Dashboard
    viewDashboard: true,
    viewAdvancedMetrics: true,
    
    // WhatsApp Accounts
    viewWhatsAppAccounts: true,
    addWhatsAppAccount: true,
    editWhatsAppAccount: true,
    deleteWhatsAppAccount: true,
    viewAccountDetails: true,
    
    // Spy Numbers
    viewSpyNumbers: true,
    addSpyNumber: true,
    editSpyNumber: true,
    deleteSpyNumber: true,
    configureSpyNumber: true,
    
    
    // Messages
    viewMessages: true,
    sendMessage: true,
    viewMessageDetails: true,
    exportMessages: true,
    
    // Entities
    viewEntities: true,
    addEntity: true,
    editEntity: true,
    deleteEntity: true,
    manageEntityHierarchy: true,
    
    // Sub-tenant management
    viewSubTenants: true,
    createSubTenant: true,
    editSubTenant: true,
    deleteSubTenant: true,
    manageSubTenantUsers: true,
    monitorSubTenantMessages: true,
    
    // Alert and monitoring
    viewAlerts: true,
    acknowledgeAlerts: true,
    configureAlerts: true,
    viewSystemHealth: true,
    
    // Administration
    viewAdministration: true,
    manageUsers: true,
    manageTenants: true,
    viewAuditLogs: true,
    manageSystemSettings: true,
    viewBilling: true,
    manageIntegrations: true,
  },
  
  // TenantAdmin: Tenant administrator who can manage sub-tenants (companies/departments) and monitor E164 users
  TenantAdmin: {
    // Dashboard
    viewDashboard: true,
    viewAdvancedMetrics: true,
    
    // WhatsApp Accounts
    viewWhatsAppAccounts: true,
    addWhatsAppAccount: true,
    editWhatsAppAccount: true,
    deleteWhatsAppAccount: false, // Cannot delete accounts
    viewAccountDetails: true,
    
    // Spy Numbers
    viewSpyNumbers: true,
    addSpyNumber: true,
    editSpyNumber: true,
    deleteSpyNumber: false, // Cannot delete spy numbers
    configureSpyNumber: true,
    
    
    // Messages
    viewMessages: true,
    sendMessage: true,
    viewMessageDetails: true,
    exportMessages: true,
    
    // Entities
    viewEntities: true,
    addEntity: true,
    editEntity: true,
    deleteEntity: true,
    manageEntityHierarchy: true,
    
    // Sub-tenant management (can manage companies/departments under their tenant)
    viewSubTenants: true,
    createSubTenant: true,
    editSubTenant: true,
    deleteSubTenant: true,
    manageSubTenantUsers: true,
    monitorSubTenantMessages: true,
    
    // Alert and monitoring (tenant-specific)
    viewAlerts: true,
    acknowledgeAlerts: true,
    configureAlerts: true,
    viewSystemHealth: false, // Cannot view system-wide health
    
    // Administration (limited to tenant management)
    viewAdministration: true,
    manageUsers: true, // Only within their tenant
    manageTenants: false, // Cannot manage other tenants
    viewAuditLogs: true, // Only their tenant's logs
    manageSystemSettings: false, // No system-wide settings
    viewBilling: true, // Only their tenant's billing
    manageIntegrations: true,
  },
  
  // User: Basic tenant user with limited permissions
  User: {
    // Dashboard
    viewDashboard: true,
    viewAdvancedMetrics: false, // Limited dashboard view
    
    // WhatsApp Accounts
    viewWhatsAppAccounts: true,
    addWhatsAppAccount: false,
    editWhatsAppAccount: false,
    deleteWhatsAppAccount: false,
    viewAccountDetails: false, // Cannot see sensitive details
    
    // Spy Numbers
    viewSpyNumbers: true,
    addSpyNumber: false,
    editSpyNumber: false,
    deleteSpyNumber: false,
    configureSpyNumber: false,
    
    
    // Messages
    viewMessages: true,
    sendMessage: true, // Can send messages
    viewMessageDetails: true,
    exportMessages: false,
    
    // Entities
    viewEntities: true,
    addEntity: false,
    editEntity: false,
    deleteEntity: false,
    manageEntityHierarchy: false,
    
    // Sub-tenant management (E164 users can only view their own context)
    viewSubTenants: false,
    createSubTenant: false,
    editSubTenant: false,
    deleteSubTenant: false,
    manageSubTenantUsers: false,
    monitorSubTenantMessages: false, // Can only see their own messages
    
    viewAlerts: true,
    acknowledgeAlerts: false, // Cannot acknowledge alerts
    configureAlerts: false,
    viewSystemHealth: false,
    
    // Administration
    viewAdministration: false, // No admin access
    manageUsers: false,
    manageTenants: false,
    viewAuditLogs: false,
    manageSystemSettings: false,
    viewBilling: false,
    manageIntegrations: false,
  },
};

// Helper functions for permission checking
export function hasPermission(role: UserRole, permission: keyof Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (!rolePermissions) {
    console.warn(`Unknown role: ${role}. Defaulting to User permissions.`);
    return ROLE_PERMISSIONS['User'][permission];
  }
  return rolePermissions[permission];
}

export function getUserPermissions(role: UserRole): Permission {
  const rolePermissions = ROLE_PERMISSIONS[role];
  if (!rolePermissions) {
    console.warn(`Unknown role: ${role}. Defaulting to User permissions.`);
    return ROLE_PERMISSIONS['User'];
  }
  return rolePermissions;
}

// Check if user can access a specific route
export function canAccessRoute(role: UserRole, route: string): boolean {
  // Handle unknown roles
  if (!ROLE_PERMISSIONS[role]) {
    console.warn(`Unknown role: ${role}. Using User permissions for route access.`);
    role = 'User';
  }

  switch (route) {
    case '/':
      return hasPermission(role, 'viewDashboard');
    case '/whatsapp-accounts':
      return hasPermission(role, 'viewWhatsAppAccounts');
    case '/spy-numbers':
      return hasPermission(role, 'viewSpyNumbers');
    case '/messages':
    case '/communications':
    case '/communications/whatsapp':
    case '/communications/filters':
      return hasPermission(role, 'viewMessages');
    case '/entities':
    case '/entities/users':
    case '/entities/structure':
    case '/entities/registration':
      return hasPermission(role, 'viewEntities');
    case '/administration':
      return hasPermission(role, 'viewAdministration');
    default:
      return true; // Allow access to other routes by default
  }
}

// Get role display information
export function getRoleInfo(role: UserRole) {
  const roleInfo = {
    SystemAdmin: {
      label: 'System Administrator',
      description: 'Full system access across all tenants and system management',
      color: 'bg-error-500 text-white',
      badgeColor: 'destructive' as const,
    },
    TenantAdmin: {
      label: 'Tenant Administrator',
      description: 'Manages tenant and sub-tenants (companies/departments), monitors E164 users',
      color: 'bg-warning-500 text-white',
      badgeColor: 'secondary' as const,
    },
    User: {
      label: 'E164 User',
      description: 'Basic element user with limited access to own messages and profile',
      color: 'bg-primary text-white',
      badgeColor: 'default' as const,
    },
  };
  
  const info = roleInfo[role];
  if (!info) {
    console.warn(`Unknown role: ${role}. Returning default User role info.`);
    return roleInfo.User;
  }
  
  return info;
}
