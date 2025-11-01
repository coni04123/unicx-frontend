'use client';

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission, UserRole } from '@/lib/permissions';

interface PermissionGateProps {
  permission?: keyof Permission;
  role?: UserRole | UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGate({ 
  permission, 
  role, 
  fallback = null, 
  children 
}: PermissionGateProps) {
  const { hasPermission, role: userRole } = usePermissions();

  // Check permission-based access
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check role-based access
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(userRole)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

// Convenience components for common use cases
export function SystemAdminOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate role="SystemAdmin" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function TenantAdminOrSystemAdmin({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate role={['SystemAdmin', 'TenantAdmin']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function UserOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate role="User" fallback={fallback}>
      {children}
    </PermissionGate>
  );
}
