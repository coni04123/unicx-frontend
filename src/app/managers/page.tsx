'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  UserIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

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
}

interface Entity {
  _id: string;
  name: string;
  type: 'entity' | 'company' | 'department' | 'custom' | string;
  customEntityTypeId?: string;
  customEntityType?: {
    _id: string;
    title: string;
    color: string;
  };
  path: string;
  parentId?: string;
  children?: Entity[];
}

interface InviteManagerForm {
  firstName: string;
  lastName: string;
  email: string;
  entityId: string;
}

export default function MonitoringManagersPage() {
  const { user: currentUser } = useAuth();
  const { canManageUsers } = usePermissions();
  const [managers, setManagers] = useState<User[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalManagers, setTotalManagers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Entity tree navigation
  const [selectedEntityPath, setSelectedEntityPath] = useState<string>('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showStructurePanel, setShowStructurePanel] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Form state
  const [inviteForm, setInviteForm] = useState<InviteManagerForm>({
    firstName: '',
    lastName: '',
    email: '',
    entityId: '',
  });
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    loadManagers();
    loadEntities();
  }, []);

  // Reload managers when filters or pagination change
  useEffect(() => {
    loadManagers();
  }, [selectedEntityPath, searchQuery, currentPage, pageSize]);

  const loadManagers = async () => {
    try {
      setError('');
      const filters: any = {
        page: currentPage,
        limit: pageSize,
        role: 'TenantAdmin', // Only fetch managers
      };

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

      // Get managers
      const response = await api.getUsers(filters);
      const { users: fetchedManagers, total, page, totalPages } = response;

      setManagers(fetchedManagers);
      setTotalManagers(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (err: any) {
      console.error('Error loading managers:', err);
      setError(err.message || 'Failed to load managers');
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

  // Count managers in entity path
  const getManagerCountInEntity = (entityPath: string): number => {
    return managers.filter(manager =>
      manager.entityPath === entityPath ||
      (manager.entityPath && manager.entityPath.startsWith(entityPath + ' >'))
    ).length;
  };

  // Render entity tree node
  const renderEntityNode = (entity: Entity, level: number = 0) => {
    const isExpanded = expandedNodes.has(entity._id);
    const hasChildren = entity.children && entity.children.length > 0;
    const isSelected = selectedEntityPath === entity.path;
    const managerCount = getManagerCountInEntity(entity.path);

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

          <div className="mr-2 flex-shrink-0">
            {entity.type === 'custom' && entity.customEntityType ? (
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: entity.customEntityType.color }}
              />
            ) : entity.type === 'entity' ? (
              <BuildingOfficeIcon className="w-4 h-4 text-primary-600" />
            ) : entity.type === 'company' ? (
              <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
            ) : (
              <UserGroupIcon className="w-4 h-4 text-green-600" />
            )}
          </div>

          <div className="flex-1 min-w-0 group">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium truncate ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                {entity.name}
              </span>
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

  const handleInviteManager = async () => {
    if (!inviteForm.firstName || !inviteForm.lastName || !inviteForm.email || !inviteForm.entityId) {
      setError('Please fill in all required fields');
      return;
    }

    setIsInviting(true);
    setError('');
    setSuccess('');

    try {
      const inviteData = {
        firstName: inviteForm.firstName,
        lastName: inviteForm.lastName,
        email: inviteForm.email,
        entityId: inviteForm.entityId,
        role: 'TenantAdmin',
        tenantId: currentUser?.tenantId || '',
      };

      await api.inviteUser(inviteData);

      setSuccess(`Manager "${inviteForm.firstName} ${inviteForm.lastName}" invited successfully!`);

      await loadManagers();

      setInviteForm({
        firstName: '',
        lastName: '',
        email: '',
        entityId: '',
      });
      setShowInviteModal(false);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error inviting manager:', err);
      setError(err.message || 'Failed to invite manager');
    } finally {
      setIsInviting(false);
    }
  };

  const deleteManager = async (managerId: string, managerName: string) => {
    if (!confirm(`Are you sure you want to delete "${managerName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      await api.deleteUser(managerId);
      setSuccess(`Manager "${managerName}" deleted successfully!`);

      await loadManagers();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error deleting manager:', err);
      setError(err.message || 'Failed to delete manager');
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
            {entity.type === 'custom' && entity.customEntityType ? (
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: entity.customEntityType.color }}
              />
            ) : entity.type === 'entity' ? (
              <BuildingOfficeIcon className="w-4 h-4 text-primary-600" />
            ) : entity.type === 'company' ? (
              <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
            ) : (
              <UserGroupIcon className="w-4 h-4 text-green-600" />
            )}
          </div>

          <div className="flex-1 min-w-0 group">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium truncate ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                {entity.name}
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  const filteredManagers = selectedEntityPath
    ? managers.filter(manager =>
        manager.entityPath === selectedEntityPath ||
        (manager.entityPath && manager.entityPath.startsWith(selectedEntityPath + ' >'))
      )
    : managers;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Monitoring Managers</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage monitoring managers and their access to entity structure
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
              Filters
            </button>
            <button
              onClick={() => {
                setInviteForm({
                  firstName: '',
                  lastName: '',
                  email: '',
                  entityId: '',
                });
                setShowInviteModal(true);
              }}
              className="inline-flex items-center px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Manager
            </button>
          </div>
        </div>

        {/* Success Message */}
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
                  {/* Show All Managers Option */}
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
                          All Managers
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Entity Tree */}
                  <div className="space-y-1">
                    {entities.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <BuildingOfficeIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No entities found</p>
                        <p className="text-xs mt-1">Create entities to organize managers</p>
                      </div>
                    ) : (
                      entities.map(entity => renderEntityNode(entity))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Managers Content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  <button
                    onClick={() => {
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
                      Search Managers
                    </label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Managers Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Monitoring Managers</h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{filteredManagers.length}</span> managers
                      {filteredManagers.length !== managers.length && (
                        <span className="text-gray-500"> of {managers.length}</span>
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
                        Manager
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredManagers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          <UserIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No managers found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredManagers.map((manager) => (
                        <tr key={manager._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-700 font-medium text-sm">
                                  {manager.firstName.charAt(0)}{manager.lastName.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {manager.firstName} {manager.lastName}
                                </div>
                                <div className="text-xs text-gray-500">Manager</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{manager.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {manager.entityId?.name || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusBadge(manager.registrationStatus || 'invited')}>
                              {manager.registrationStatus || 'invited'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => deleteManager(manager._id, `${manager.firstName} ${manager.lastName}`)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete manager"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
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
                        <span className="font-medium">{Math.min(currentPage * pageSize, totalManagers)}</span> of{' '}
                        <span className="font-medium">{totalManagers}</span> results
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

        {/* Invite Manager Modal */}
        {showInviteModal && (
          <div className="!mt-[0px] fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-[99999] flex items-center justify-center">
            <div className="relative mx-auto p-5 border-0 w-[500px] shadow-xl rounded-lg bg-white max-h-[90vh] overflow-y-auto">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Add Monitoring Manager
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

                  {/* Info message */}
                  <div className="border rounded-md p-3 bg-blue-50 border-blue-200">
                    <p className="text-sm text-blue-800">
                      Manager will receive invitation via email with login credentials and access to monitor their assigned entity structure.
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
                        entityId: '',
                      });
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInviteManager}
                    disabled={isInviting}
                    className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isInviting ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                        Inviting...
                      </>
                    ) : (
                      <>
                        <EnvelopeIcon className="w-4 h-4 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

