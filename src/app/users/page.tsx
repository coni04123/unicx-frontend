'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { api } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import WhatsAppHealthBadge from '@/components/whatsapp/WhatsAppHealthBadge';
import {
  PlusIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  QrCodeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MapPinIcon,
  ArrowDownTrayIcon,
  CheckIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

interface WhatsAppHealthStatus {
  lastCheck: string;
  lastStatus: 'success' | 'failed' | 'warning';
  consecutiveFailures: number;
  successRate: number;
  recentChecks: number;
  alertTriggered: boolean;
}

interface WhatsAppSession {
  status: string;
  qrCode?: string;
  qrCodeExpiresAt?: string;
  sessionId: string;
  lastActivityAt?: string;
  connectedAt?: string;
  disconnectedAt?: string;
  whatsappName?: string;
  messagesSent: number;
  messagesReceived: number;
  messagesDelivered: number;
  messagesFailed: number;
  healthStatus?: WhatsAppHealthStatus;
}

interface User {
  _id: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  registrationStatus: string;
  entityId: {
    _id: string;
    name: string;
    path: string;
    type: string;
  };
  entityPath: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  whatsappSession?: WhatsAppSession;
}

interface Entity {
  _id: string;
  name: string;
  type: string;
  path: string;
  parentId?: string;
  children?: Entity[];
}

interface InviteUserForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  entityId: string;
  role: string;
}

interface EditUserForm {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  entityId: string;
  role: string;
}

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const { canManageUsers } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegeneratingQR, setIsRegeneratingQR] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserQR, setSelectedUserQR] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<EditUserForm>({
    _id: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    entityId: '',
    role: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  // Entity tree navigation
  const [selectedEntityPath, setSelectedEntityPath] = useState<string>('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showStructurePanel, setShowStructurePanel] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roleFilter, setRoleFilter] = useState<string>(searchParams.get('role') || 'TenantAdmin'); // 'TenantAdmin' or 'User' or ''

  // Update URL when role filter changes
  const updateRoleFilter = (role: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('role', role);
    router.push(`?${params.toString()}`);
    setRoleFilter(role);
  };
  const [whatsappFilter, setWhatsappFilter] = useState<string>('');
  const [healthCheckLoading, setHealthCheckLoading] = useState<string | null>(null);
  
  // Determine if we're viewing tenant admins only
  const isViewingTenantAdmins = roleFilter === 'TenantAdmin';
  const isViewingUsers = roleFilter === 'User';

  // Form state
  const [inviteForm, setInviteForm] = useState<InviteUserForm>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    entityId: '',
    role: 'User',
  });
  const [isInviting, setIsInviting] = useState(false);

  // Handle health check trigger
  const handleTriggerHealthCheck = async (userId: string) => {
    try {
      setHealthCheckLoading(userId);
      await api.triggerUserHealthCheck(userId);
      
      // Refresh user's health status
      const response = await api.getUserHealthStatus(userId);
      
      // Update user's health status in the list
      setUsers(users.map(user => {
        if (user._id === userId && user.whatsappSession) {
          return {
            ...user,
            whatsappSession: {
              ...user.whatsappSession,
              healthStatus: response.data,
            },
          };
        }
        return user;
      }));

      setSuccess('Health check completed');
    } catch (error: any) {
      setError(error.message || 'Failed to trigger health check');
    } finally {
      setHealthCheckLoading(null);
    }
  };

  // EventSource for WhatsApp events
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/whatsapp/events?token=${token}`, {
      withCredentials: true
    });

    eventSource.onmessage = (event) => {
      const whatsappEvent = JSON.parse(event.data);
      const { type, sessionId, data } = whatsappEvent;

      setUsers(prevUsers => prevUsers.map(user => {
        // Only update if this event is for this user's session
        if (!user.whatsappSession || user.whatsappSession.sessionId !== sessionId) return user;

        const updatedUser = { ...user };
        switch (type) {
          case 'status':
            updatedUser.whatsappSession = {
              ...user.whatsappSession,
              status: data.status
            };
            break;
          case 'qr':
            updatedUser.whatsappSession = {
              ...user.whatsappSession,
              qrCode: data.qrCode,
              qrCodeExpiresAt: data.expiresAt,
              status: 'qr_required'
            };
            break;
          case 'health':
            updatedUser.whatsappSession = {
              ...user.whatsappSession,
              healthStatus: data
            };
            break;
        }
        return updatedUser as User;
      }));

      // If QR modal is open and event is for the selected user, update modal state
      if (selectedUserQR?.whatsappSession?.sessionId === sessionId) {
        setSelectedUserQR(prev => {
          if (!prev || !prev.whatsappSession) return prev;

          const updatedUser = { ...prev };
          switch (type) {
            case 'status':
              updatedUser.whatsappSession = {
                ...prev.whatsappSession,
                status: data.status
              };
              break;
            case 'qr':
              updatedUser.whatsappSession = {
                ...prev.whatsappSession,
                qrCode: data.qrCode,
                qrCodeExpiresAt: data.expiresAt,
                status: 'qr_required'
              };
              break;
            case 'health':
              updatedUser.whatsappSession = {
                ...prev.whatsappSession,
                healthStatus: data
              };
              break;
            default:
              return prev;
          }
          return updatedUser as User;
        });
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
    };

    // Load initial data
    loadUsers();
    loadEntities();
    loadStats();

    return () => {
      eventSource.close();
    };
  }, []);

  // Reload users when filters or pagination change
  useEffect(() => {
    loadUsers();
  }, [statusFilter, roleFilter, selectedEntityPath, whatsappFilter, searchQuery, currentPage, pageSize]);

  const loadUsers = async () => {
    try {
      setError('');
      const filters: any = {
        page: currentPage,
        limit: pageSize,
      };
      
      if (statusFilter) filters.registrationStatus = statusFilter;
      if (roleFilter) filters.role = roleFilter;
      if (whatsappFilter) filters.whatsappConnectionStatus = whatsappFilter;
      if (searchQuery) filters.search = searchQuery;
      
      // If entity is selected, filter by it
      if (selectedEntityPath) {
        const selectedEntity = findEntityByPath(entities, selectedEntityPath);
        if (selectedEntity) {
          filters.entityId = selectedEntity._id;
        }
      } else if (currentUser?.entityId) {
        filters.entityId = currentUser.entityId;
      }

      // Get users
      const response = await api.getUsers(filters);
      const { users: fetchedUsers, total, page, totalPages } = response;

      // Get health status for each user with active WhatsApp session
      const usersWithHealth = await Promise.all(
        fetchedUsers.map(async (user) => {
          if (user.whatsappSession?.status === 'ready') {
            try {
              const healthResponse = await api.getUserHealthStatus(user._id);
              return {
                ...user,
                whatsappSession: {
                  ...user.whatsappSession,
                  healthStatus: healthResponse.data,
                },
              };
            } catch (error) {
              console.error(`Failed to get health status for user ${user._id}:`, error);
              return user;
            }
          }
          return user;
        })
      );

      // Get WhatsApp sessions for users with phone numbers
      const usersWithSessions = await Promise.all(
        usersWithHealth.map(async (user) => {
          if (user.phoneNumber) {
            try {
              const sessionId = `whatsapp-${user.phoneNumber.slice(1)}`;
              const sessionStatus = await api.getWhatsAppSessionStatus(sessionId);
              return {
                ...user,
                whatsappSession: sessionStatus
              };
            } catch (err) {
              console.warn(`Failed to get WhatsApp session for user ${user._id}:`, err);
              return user;
            }
          }
          return user;
        })
      );

      setUsers(usersWithSessions);
      setTotalUsers(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEntities = async () => {
    try {
      // Only fetch entities under user's entityId for non-system admins
      const data = await api.getEntities({
        ancestorId: currentUser?.role === 'SystemAdmin' ? undefined : currentUser?.entityId
      });
      
      const tree = buildEntityTree(data);
      setEntities(tree);
      
      // Auto-expand root entities
      const rootEntities = data.filter((e: Entity) => !e.parentId);
      setExpandedNodes(new Set(rootEntities.map((e: Entity) => e._id)));
    } catch (err: any) {
      console.error('Error loading entities:', err);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.getUserStats();
      setStats(data);
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  };

  // Build entity tree structure
  const buildEntityTree = (entityList: any[]): Entity[] => {
    const entityMap = new Map<string, Entity>();
    const rootEntities: Entity[] = [];

    entityList.forEach(entity => {
      entityMap.set(entity._id, { ...entity, children: [] });
    });

    entityList.forEach(entity => {
      const entityNode = entityMap.get(entity._id)!;
      if (entity.parentId) {
        const parent = entityMap.get(entity.parentId);
        if (parent && parent.children) {
          parent.children.push(entityNode);
        } else {
          rootEntities.push(entityNode);
        }
      } else {
        rootEntities.push(entityNode);
      }
    });

    return rootEntities;
  };

  const findEntityByPath = (entityList: Entity[], path: string): Entity | null => {
    for (const entity of entityList) {
      if (entity.path === path) return entity;
      if (entity.children) {
        const found = findEntityByPath(entity.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'entity': return 'bi bi-building';
      case 'company': return 'bi bi-building-fill';
      case 'department': return 'bi bi-folder2-open';
      default: return 'bi bi-folder';
    }
  };

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const selectEntityPath = (path: string) => {
    setSelectedEntityPath(path);
    setCurrentPage(1);
  };

  // Count users in entity path
  const getUserCountInEntity = (entityPath: string): number => {
    return users.filter(user => 
      user.entityPath === entityPath || 
      (user.entityPath && user.entityPath.startsWith(entityPath + ' >'))
    ).length;
  };

  // Render entity tree node
  const renderEntityNode = (entity: Entity, level: number = 0) => {
    const isExpanded = expandedNodes.has(entity._id);
    const hasChildren = entity.children && entity.children.length > 0;
    const isSelected = selectedEntityPath === entity.path;
    const userCount = getUserCountInEntity(entity.path);

    return (
      <div key={entity._id} className="select-none">
        <div
          className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 ${
            isSelected 
              ? 'bg-primary-100 text-primary-900 border-l-4 border-primary-500' 
              : 'hover:bg-gray-50 text-gray-700'
          }`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={() => selectEntityPath(entity.path)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeExpansion(entity._id);
              }}
              className="mr-2 p-0.5 rounded hover:bg-gray-200 transition-colors"
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5 mr-2" />}
          
          <i className={`${getEntityIcon(entity.type)} mr-2 text-gray-600`}></i>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium truncate ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                {entity.name}
              </span>
              {/* {userCount > 0 && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 ${
                  isSelected ? 'bg-primary-200 text-primary-800' : 'bg-green-100 text-green-800'
                }`}>
                  {userCount}
                </span>
              )} */}
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {entity.children!.map(child => renderEntityNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleInviteUser = async () => {
    // Validate required fields based on role
    if (inviteForm.role === 'TenantAdmin') {
      // Tenant Admins don't need phone number
      if (!inviteForm.firstName || !inviteForm.lastName || !inviteForm.email || !inviteForm.entityId) {
        setError('Please fill in all required fields');
        return;
      }
    } else {
      // Regular Users need phone number
      if (!inviteForm.firstName || !inviteForm.lastName || !inviteForm.email || !inviteForm.phoneNumber || !inviteForm.entityId) {
        setError('Please fill in all required fields');
        return;
      }

      if (!inviteForm.phoneNumber.startsWith('+')) {
        setError('Phone number must be in E.164 format (e.g., +1234567890)');
        return;
      }
    }

    setIsInviting(true);
    setError('');
    setSuccess('');

    try {
      // Prepare invite data - exclude phoneNumber for TenantAdmin if empty
      const inviteData: any = {
        firstName: inviteForm.firstName,
        lastName: inviteForm.lastName,
        email: inviteForm.email,
        entityId: inviteForm.entityId,
        role: inviteForm.role,
        tenantId: currentUser?.tenantId || '',
      };
      
      // Only include phoneNumber if it's provided (for Users)
      if (inviteForm.phoneNumber) {
        inviteData.phoneNumber = inviteForm.phoneNumber;
      }
      
      await api.inviteUser(inviteData);

      setSuccess(`User "${inviteForm.firstName} ${inviteForm.lastName}" invited successfully!`);
      
      await loadUsers();
      await loadStats();
      
      setInviteForm({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        entityId: '',
        role: 'User',
      });
      setShowInviteModal(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error inviting user:', err);
      setError(err.message || 'Failed to invite user');
    } finally {
      setIsInviting(false);
    }
  };

  const handleEditUser = async () => {
    if (!editForm.firstName || !editForm.lastName || !editForm.email || !editForm.entityId) {
      setError('Please fill in all required fields');
      return;
    }

    setIsEditing(true);
    setError('');
    setSuccess('');

    try {
      await api.updateUser(editForm._id, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        entityId: editForm.entityId,
        phoneNumber: editForm.phoneNumber || undefined
      });

      setSuccess(`User "${editForm.firstName} ${editForm.lastName}" updated successfully!`);
      await loadUsers();
      setShowEditModal(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user');
    } finally {
      setIsEditing(false);
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      await api.deleteUser(userId);
      setSuccess(`User "${userName}" deleted successfully!`);
      
      await loadUsers();
      await loadStats();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Failed to delete user');
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'registered':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'invited':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'connected':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'disconnected':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'connecting':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getRoleBadge = (role: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (role) {
      case 'SystemAdmin':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'TenantAdmin':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'User':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Helper function to find entity by ID (recursive)
  const findEntityById = (entityId: string, entityList: Entity[] = entities): Entity | null => {
    for (const entity of entityList) {
      if (entity._id === entityId) {
        return entity;
      }
      if (entity.children && entity.children.length > 0) {
        const found = findEntityById(entityId, entity.children);
        if (found) return found;
      }
    }
    return null;
  };

  // Render entity node for modal selection (tree structure)
  const renderModalEntityNode = (entity: Entity, level: number = 0): JSX.Element => {
    const isExpanded = expandedNodes.has(entity._id);
    const hasChildren = entity.children && entity.children.length > 0;
    const isSelected = inviteForm.entityId === entity._id;

    return (
      <div key={entity._id}>
        <div
          className={`flex items-center py-2.5 px-3 cursor-pointer transition-all duration-200 ${
            isSelected 
              ? 'bg-primary-50 border-l-4 border-primary-500' 
              : 'hover:bg-gray-50'
          }`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={() => setInviteForm({ ...inviteForm, entityId: entity._id })}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeExpansion(entity._id);
              }}
              className="mr-2 p-0.5 rounded hover:bg-gray-200 transition-colors"
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5 mr-2" />}
          
          <div className="mr-2 flex-shrink-0">
            {entity.type === 'entity' ? (
              <BuildingOfficeIcon className="w-4 h-4 text-primary-600" />
            ) : entity.type === 'company' ? (
              <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
            ) : (
              <UserGroupIcon className="w-4 h-4 text-green-600" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium truncate ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                {entity.name}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded ml-2 ${
                entity.type === 'entity' 
                  ? 'bg-primary-100 text-primary-700'
                  : entity.type === 'company'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {entity.type}
              </span>
            </div>
          </div>
          
          {isSelected && (
            <CheckIcon className="w-5 h-5 text-primary-600 ml-2 flex-shrink-0" />
          )}
        </div>

        {/* Render Children */}
        {isExpanded && hasChildren && (
          <div>
            {entity.children?.map(child => renderModalEntityNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const showQRCode = (user: User) => {
    setSelectedUserQR(user);
    setShowQRModal(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  const filteredUsers = selectedEntityPath 
    ? users.filter(user => 
        user.entityPath === selectedEntityPath || 
        (user.entityPath && user.entityPath.startsWith(selectedEntityPath + ' >'))
      )
    : users;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
            <p className="mt-2 text-sm text-gray-700">
              Navigate through entity structure and manage users with WhatsApp connections
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowStructurePanel(!showStructurePanel)}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showStructurePanel
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <BuildingOfficeIcon className="w-4 h-4 mr-2" />
              Entity Structure
            </button>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showAdvancedFilters
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Advanced Filters
            </button>
          </div>
        </div>

        {/* Role Filter Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => updateRoleFilter('TenantAdmin')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  roleFilter === 'TenantAdmin'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserIcon className={`inline-block w-5 h-5 mr-2 ${roleFilter === 'TenantAdmin' ? 'text-blue-500' : 'text-gray-400'}`} />
                Tenant Admins
              </button>
              <button
                onClick={() => updateRoleFilter('User')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  roleFilter === 'User'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserGroupIcon className={`inline-block w-5 h-5 mr-2 ${roleFilter === 'User' ? 'text-green-500' : 'text-gray-400'}`} />
                Users
              </button>
            </nav>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setInviteForm({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phoneNumber: '',
                    entityId: '',
                    role: roleFilter === 'TenantAdmin' ? 'TenantAdmin' : 'User',
                  });
                  setShowInviteModal(true);
                }}
                className={`inline-flex items-center px-4 py-2 text-sm text-white rounded-md transition-colors ${
                  roleFilter === 'TenantAdmin'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                {roleFilter === 'TenantAdmin' ? 'Create Tenant Admin' : 'Invite User'}
              </button>
            </div>
          </div>
        </div>

        {/* Success Message - Only show success on background, errors show in modals */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {/* Main Content Layout */}
        <div className="flex space-x-6">
          {/* Entity Structure Panel */}
          {showStructurePanel && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <BuildingOfficeIcon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Entity Structure</h3>
                        <p className="text-sm text-gray-600">Navigate and filter</p>
                      </div>
                    </div>
                    {selectedEntityPath && (
                      <button
                        onClick={() => selectEntityPath('')}
                        className="text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-4 max-h-[600px] overflow-y-auto">
                  {/* Show All Users Option */}
                  <div
                    className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 ${
                      !selectedEntityPath 
                        ? 'bg-primary-100 text-primary-900 border-l-4 border-primary-500' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    onClick={() => selectEntityPath('')}
                  >
                    <i className="bi bi-globe mr-2 text-gray-600"></i>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${!selectedEntityPath ? 'text-primary-900' : 'text-gray-900'}`}>
                          All Users
                        </span>
                        {/* <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          !selectedEntityPath ? 'bg-primary-200 text-primary-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {users.length}
                        </span> */}
                      </div>
                    </div>
                  </div>
                  
                  {/* Entity Tree */}
                  <div className="space-y-1">
                    {entities.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <BuildingOfficeIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No entities found</p>
                        <p className="text-xs mt-1">Create entities to organize users</p>
                      </div>
                    ) : (
                      entities.map(entity => renderEntityNode(entity))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                  <button
                    onClick={() => {
                      setStatusFilter('');
                      setWhatsappFilter('');
                      setSearchQuery('');
                      setSelectedEntityPath('');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Users
                    </label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  {/* Registration Status Filter */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Status</option>
                      <option value="registered">Registered</option>
                      <option value="invited">Invited</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div> */}

                  {/* WhatsApp Status Filter - Only show for Users, not Tenant Admins */}
                  {!isViewingTenantAdmins && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Status
                      </label>
                      <select
                        value={whatsappFilter}
                        onChange={(e) => setWhatsappFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">All Status</option>
                        <option value="connected">Connected</option>
                        <option value="disconnected">Disconnected</option>
                        <option value="connecting">Connecting</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Users</h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{filteredUsers.length}</span> users
                      {filteredUsers.length !== users.length && (
                        <span className="text-gray-500"> of {users.length}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {isViewingTenantAdmins ? 'Tenant Admin' : 'User'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      {/* Show Contact only for Users, not Tenant Admins */}
                      {!isViewingTenantAdmins && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      {/* Show WhatsApp & QR Code only for Users, not Tenant Admins */}
                      {!isViewingTenantAdmins && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            WhatsApp
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            QR Code
                          </th>
                        </>
                      )}
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={isViewingTenantAdmins ? 5 : 8} className="px-6 py-12 text-center text-gray-500">
                          <UserIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No {isViewingTenantAdmins ? 'tenant admins' : isViewingUsers ? 'users' : 'users'} found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-primary-700 font-medium text-sm">
                                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {user.role === 'TenantAdmin' ? 'Tenant Admin' : user.role}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </td>
                          {/* Show Contact only for Users, not Tenant Admins */}
                          {!isViewingTenantAdmins && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{user.phoneNumber || 'N/A'}</div>
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col space-y-2">
                              <span className={getStatusBadge(isViewingTenantAdmins ? (user.registrationStatus || 'invited') : (user.whatsappSession?.status || 'disconnected'))}>
                                {isViewingTenantAdmins ? (user.registrationStatus || 'invited') : (user.whatsappSession?.status || 'disconnected')}
                              </span>
                              {!isViewingTenantAdmins && user.whatsappSession?.status === 'ready' && (
                                <WhatsAppHealthBadge
                                  healthStatus={user.whatsappSession.healthStatus}
                                  onTriggerCheck={() => handleTriggerHealthCheck(user._id)}
                                  isLoading={healthCheckLoading === user._id}
                                  canTriggerCheck={canManageUsers}
                                />
                              )}
                            </div>
                          </td>
                          {/* Show WhatsApp & QR Code only for Users, not Tenant Admins */}
                          {!isViewingTenantAdmins && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col space-y-1">
                                  {user.whatsappSession?.whatsappName && (
                                    <span className="text-xs text-gray-500">
                                      {user.whatsappSession.whatsappName}
                                    </span>
                                  )}
                                  {user.whatsappSession?.lastActivityAt && (
                                    <span className="text-xs text-gray-400">
                                      Last active: {new Date(user.whatsappSession.lastActivityAt).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <button
                                  onClick={() => showQRCode(user)}
                                  className="inline-flex items-center text-blue-600 hover:text-blue-900"
                                  title="View QR Code"
                                >
                                  <QrCodeIcon className="w-5 h-5" />
                                </button>
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3">
                              {/* <button
                                onClick={() => {
                                  setEditForm({
                                    _id: user._id,
                                    firstName: user.firstName,
                                    lastName: user.lastName,
                                    email: user.email,
                                    entityId: user.entityId ? (typeof user.entityId === 'object' ? user.entityId._id : user.entityId) : '',
                                    role: user.role,
                                    phoneNumber: user.phoneNumber || ''
                                  });
                                  setShowEditModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit user"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button> */}
                              <button
                                onClick={() => deleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete user"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(currentPage * pageSize, totalUsers)}</span> of{' '}
                        <span className="font-medium">{totalUsers}</span> results
                      </p>
                      <div className="flex items-center gap-2">
                        <label htmlFor="pageSize" className="text-sm text-gray-700">
                          Per page:
                        </label>
                        <select
                          id="pageSize"
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="25">25</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        
                        {/* Page Numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNum
                                  ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invite User Modal */}
        {showInviteModal && (
          <div className="!mt-[0px] fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-[99999] flex items-center justify-center">
            <div className="relative mx-auto p-5 border-0 w-[500px] shadow-xl rounded-lg bg-white max-h-[90vh] overflow-y-auto">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {inviteForm.role === 'TenantAdmin' ? 'Create Tenant Admin' : 'Invite User'}
                </h3>
                
                {/* Error message inside modal */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={inviteForm.firstName}
                        onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={inviteForm.lastName}
                        onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="john.doe@example.com"
                    />
                  </div>

                  {/* Phone Number only for Users, not Tenant Admins */}
                  {inviteForm.role !== 'TenantAdmin' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number (E.164 format) *
                      </label>
                      <input
                        type="tel"
                        value={inviteForm.phoneNumber}
                        onChange={(e) => setInviteForm({ ...inviteForm, phoneNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="+1234567890"
                      />
                      <p className="text-xs text-gray-500 mt-1">Must start with + and country code</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entity *
                    </label>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                        <p className="text-xs text-gray-600">
                          {inviteForm.entityId 
                            ? `Selected: ${findEntityById(inviteForm.entityId)?.name || 'Unknown'}`
                            : 'Select an entity from the tree below'}
                        </p>
                      </div>
                      <div className="max-h-60 overflow-y-auto bg-white">
                        {entities.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <BuildingOfficeIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No entities available</p>
                          </div>
                        ) : (
                          entities.map(entity => renderModalEntityNode(entity))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info message based on role */}
                  <div className={`border rounded-md p-3 ${
                    inviteForm.role === 'TenantAdmin' 
                      ? 'bg-purple-50 border-purple-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <p className={`text-sm ${
                      inviteForm.role === 'TenantAdmin' 
                        ? 'text-purple-800' 
                        : 'text-blue-800'
                    }`}>
                      {inviteForm.role === 'TenantAdmin' 
                        ? (<>
                            Tenant Admin will receive invitation via email with login credentials.
                          </>) 
                        : (<>
                            User will receive invitation with QR code via email for WhatsApp connection setup.
                          </>)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowInviteModal(false);
                      setError('');
                      setInviteForm({
                        firstName: '',
                        lastName: '',
                        email: '',
                        phoneNumber: '',
                        entityId: '',
                        role: 'User',
                      });
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInviteUser}
                    disabled={isInviting}
                    className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 flex items-center ${
                      inviteForm.role === 'TenantAdmin'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isInviting ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                        {inviteForm.role === 'TenantAdmin' ? 'Creating...' : 'Inviting...'}
                      </>
                    ) : (
                      <>
                        <EnvelopeIcon className="w-4 h-4 mr-2" />
                        {inviteForm.role === 'TenantAdmin' ? 'Create Admin' : 'Send Invitation'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-[99999] flex items-center justify-center">
            <div className="relative mx-auto p-5 border-0 w-[500px] shadow-xl rounded-lg bg-white max-h-[90vh] overflow-y-auto">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Edit User
                  </h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setError('');
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>

                {/* Error message inside modal */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="john.doe@example.com"
                    />
                  </div>

                  {/* Phone Number - Optional for TenantAdmin */}
                  {editForm.role !== 'TenantAdmin' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number (E.164 format)
                        {editForm.role === 'User' && ' *'}
                      </label>
                      <input
                        type="tel"
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="+1234567890"
                      />
                      <p className="text-xs text-gray-500 mt-1">Must start with + and country code</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entity *
                    </label>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                        <p className="text-xs text-gray-600">
                          {editForm.entityId 
                            ? `Selected: ${findEntityById(editForm.entityId)?.name || 'Unknown'}`
                            : 'Select an entity from the tree below'}
                        </p>
                      </div>
                      <div className="max-h-60 overflow-y-auto bg-white">
                        {entities.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <BuildingOfficeIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No entities available</p>
                          </div>
                        ) : (
                          entities.map(entity => renderModalEntityNode(entity))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setError('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditUser}
                    disabled={isEditing}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isEditing ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        {showQRModal && selectedUserQR && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-[99999] flex items-center justify-center">
            <div className="relative mx-auto p-5 border-0 w-[500px] shadow-xl rounded-lg bg-white max-h-[90vh] overflow-y-auto">
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      WhatsApp QR Code
                    </h3>
                    <button
                      onClick={() => {
                        setShowQRModal(false);
                        setError('');
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                  
                  {/* Error message inside modal */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                      {error}
                    </div>
                  )}
                
                <div className="text-center py-6">
                  <div className="flex-shrink-0 h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary-700 font-medium text-2xl">
                      {selectedUserQR.firstName.charAt(0)}{selectedUserQR.lastName.charAt(0)}
                    </span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-1">
                    {selectedUserQR.firstName} {selectedUserQR.lastName}
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">{selectedUserQR.email}</p>
                  <p className="text-sm text-gray-600 mb-6">{selectedUserQR.phoneNumber}</p>

                  {/* WhatsApp QR Code */}
                  {selectedUserQR.whatsappSession?.qrCode ? (
                    <div className="border rounded-lg p-8 mb-6">
                      {/* Display actual QR code image */}
                      <img 
                        src={selectedUserQR.whatsappSession.qrCode.startsWith('data:') 
                          ? selectedUserQR.whatsappSession.qrCode 
                          : `data:image/png;base64,${selectedUserQR.whatsappSession.qrCode}`}
                        alt="WhatsApp QR Code"
                        className="w-48 h-48 mx-auto"
                      />
                      <div className="mt-4 text-sm text-gray-600">
                        <p>Scan with WhatsApp to connect</p>
                        {selectedUserQR.whatsappSession.qrCodeExpiresAt && (
                          <p className="text-xs mt-1">
                            Expires: {new Date(selectedUserQR.whatsappSession.qrCodeExpiresAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="border-4 border-dashed border-gray-300 rounded-lg p-8 mb-6">
                      <QrCodeIcon className="w-48 h-48 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500 mt-4">
                        {selectedUserQR.whatsappSession?.status === 'ready' 
                          ? 'User is already connected to WhatsApp'
                          : 'No active QR code available'}
                      </p>
                    </div>
                  )}

                  {/* WhatsApp Connection Status */}
                  <div className="text-left bg-gray-50 p-4 rounded-lg space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">WhatsApp Connection</h5>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <span className={getStatusBadge(selectedUserQR.whatsappSession?.status || 'disconnected')}>
                          {selectedUserQR.whatsappSession?.status || 'disconnected'}
                        </span>
                      </div>
                      {selectedUserQR.whatsappSession?.whatsappName && (
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600">WhatsApp Name</span>
                          <span className="text-sm text-gray-800">{selectedUserQR.whatsappSession.whatsappName}</span>
                        </div>
                      )}
                      {selectedUserQR.whatsappSession?.lastActivityAt && (
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600">Last Activity</span>
                          <span className="text-sm text-gray-800">
                            {new Date(selectedUserQR.whatsappSession.lastActivityAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {selectedUserQR.whatsappSession?.status === 'ready' && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Message Statistics</h5>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-green-50 p-2 rounded">
                            <div className="text-xs text-green-600">Sent</div>
                            <div className="text-sm font-medium text-green-800">
                              {selectedUserQR.whatsappSession.messagesSent}
                            </div>
                          </div>
                          <div className="bg-blue-50 p-2 rounded">
                            <div className="text-xs text-blue-600">Received</div>
                            <div className="text-sm font-medium text-blue-800">
                              {selectedUserQR.whatsappSession.messagesReceived}
                            </div>
                          </div>
                          <div className="bg-purple-50 p-2 rounded">
                            <div className="text-xs text-purple-600">Delivered</div>
                            <div className="text-sm font-medium text-purple-800">
                              {selectedUserQR.whatsappSession.messagesDelivered}
                            </div>
                          </div>
                          <div className="bg-red-50 p-2 rounded">
                            <div className="text-xs text-red-600">Failed</div>
                            <div className="text-sm font-medium text-red-800">
                              {selectedUserQR.whatsappSession.messagesFailed}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                  {selectedUserQR.whatsappSession?.status !== 'ready' && (
                    <button
                      onClick={async () => {
                        try {
                          setError('');
                          setIsRegeneratingQR(true);
                          
                          // Get new QR code
                          const qrData = await api.regenerateQRCode(selectedUserQR._id);
                          
                          // Update the selected user with new QR code
                          setSelectedUserQR(prev => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              whatsappSession: {
                                ...prev.whatsappSession,
                                qrCode: qrData.qrCode,
                                qrCodeExpiresAt: new Date(qrData.expiresAt).toISOString(),
                                sessionId: qrData.sessionId,
                                status: 'qr_required', // Set correct status
                                messagesSent: prev.whatsappSession?.messagesSent || 0,
                                messagesReceived: prev.whatsappSession?.messagesReceived || 0,
                                messagesDelivered: prev.whatsappSession?.messagesDelivered || 0,
                                messagesFailed: prev.whatsappSession?.messagesFailed || 0
                              }
                            };
                          });

                          // Refresh the users list to update status
                          await loadUsers();
                          
                          // Show success message
                          setSuccess('QR code regenerated successfully');
                          setTimeout(() => setSuccess(''), 3000);
                        } catch (err: any) {
                          setError(err.message || 'Failed to regenerate QR code');
                        } finally {
                          setIsRegeneratingQR(false);
                        }
                      }}
                      disabled={isRegeneratingQR}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    >
                      {isRegeneratingQR ? (
                        <>
                          <ArrowPathIcon className="w-4 h-4 inline mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <ArrowPathIcon className="w-4 h-4 inline mr-2" />
                          Generate New QR Code
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
