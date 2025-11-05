'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  PlusIcon,
  BuildingOfficeIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  TrashIcon,
  UserGroupIcon,
  ArrowPathIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

interface CustomEntityType {
  _id: string;
  title: string;
  color: string;
  userId: string;
}

interface Entity {
  _id: string;
  name: string;
  type: 'entity' | 'company' | 'department' | 'custom';
  customEntityTypeId?: string;
  customEntityType?: {
    _id: string;
    title: string;
    color: string;
  };
  parentId?: string;
  level: number;
  path: string;
  tenantId: string;
  isActive: boolean;
  isExpanded: boolean;
  createdAt: string;
  updatedAt: string;
  children?: Entity[];
}

interface CreateEntityForm {
  name: string;
  type: 'entity' | 'company' | 'department' | 'custom';
  customEntityTypeId?: string;
  parentId: string;
  isRootEntity: boolean;
}

interface EditEntityForm {
  _id: string;
  name: string;
  type: 'entity' | 'company' | 'department' | 'custom';
  customEntityTypeId?: string;
}

interface CreateEntityTypeForm {
  title: string;
  color: string;
}

export default function EntityStructurePage() {
  const { user } = useAuth();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [entityTypes, setEntityTypes] = useState<CustomEntityType[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateEntityTypeModal, setShowCreateEntityTypeModal] = useState(false);
  const [showEditEntityTypeModal, setShowEditEntityTypeModal] = useState(false);
  const [editingEntityTypeId, setEditingEntityTypeId] = useState<string | null>(null);
  const [deleteEntityId, setDeleteEntityId] = useState('');
  const [deleteEntityName, setDeleteEntityName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [createForm, setCreateForm] = useState<CreateEntityForm>({
    name: '',
    type: 'entity',
    parentId: '',
    isRootEntity: true,
  });
  const [editForm, setEditForm] = useState<EditEntityForm>({
    _id: '',
    name: '',
    type: 'entity',
  });
  const [createEntityTypeForm, setCreateEntityTypeForm] = useState<CreateEntityTypeForm>({
    title: '',
    color: '#14a800',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingEntityType, setIsCreatingEntityType] = useState(false);
  const [isEditingEntityType, setIsEditingEntityType] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Load entities and entity types on mount
  useEffect(() => {
    loadEntities();
    loadEntityTypes();
  }, []);


  const loadEntities = async () => {
      try {
        setIsLoading(true);
      setError('');
      const data = await api.getEntities({
        ancestorId: user?.entityId
      });
      // Set entities with their backend state
      setEntities(data);
      } catch (err: any) {
      console.error('Error loading entities:', err);
      setError(err.message || 'Failed to load entities');
      } finally {
        setIsLoading(false);
      }
    };

  const loadEntityTypes = async () => {
    try {
      const data = await api.getEntityTypes();
      setEntityTypes(data);
    } catch (err: any) {
      console.error('Error loading entity types:', err);
    }
  };

  // Build hierarchical structure
  const buildHierarchy = (entities: Entity[]): Entity[] => {
    const entityMap = new Map<string, Entity>();
    const rootEntities: Entity[] = [];

    // Create a map of all entities
    entities.forEach(entity => {
      entityMap.set(entity._id, { ...entity, children: [] });
    });

    // Build the hierarchy
    entities.forEach(entity => {
      const entityWithChildren = entityMap.get(entity._id)!;
      if (entity.parentId) {
        const parent = entityMap.get(entity.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(entityWithChildren);
        } else {
          rootEntities.push(entityWithChildren);
        }
      } else {
        rootEntities.push(entityWithChildren);
      }
    });

    return rootEntities;
  };

  const hierarchicalEntities = buildHierarchy(entities);

  // Filter function for entities
  const filterEntities = (entities: Entity[], query: string): Entity[] => {
    if (!query.trim()) {
      return entities;
    }

    const lowerQuery = query.toLowerCase();

    // Filter entities by name, type, or custom entity type title only
    return entities.filter(entity => {
      const matchesName = entity.name.toLowerCase().includes(lowerQuery);
      const matchesType = entity.type.toLowerCase().includes(lowerQuery);
      const matchesCustomType = entity.customEntityType?.title.toLowerCase().includes(lowerQuery);

      return matchesName || matchesType || matchesCustomType;
    });
  };

  // Filter entities based on search query using useMemo for performance
  const filteredEntities = useMemo(() => {
    return filterEntities(entities, searchQuery);
  }, [entities, searchQuery]);

  // Auto-expand entities that match the search
  useEffect(() => {
    if (searchQuery.trim()) {
      const expandIds = new Set<string>();
      filteredEntities.forEach(entity => {
        if (entity.parentId) {
          expandIds.add(entity.parentId);
        }
      });
      // Update frontend state only for UI expansion (without triggering backend calls)
      setEntities(prev => {
        const updated = prev.map(e => {
          if (expandIds.has(e._id) && !e.isExpanded) {
            return { ...e, isExpanded: true };
          }
          return e;
        });
        return updated;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const displayEntities = searchQuery.trim() ? filteredEntities : entities;
  const hierarchicalDisplayEntities = searchQuery.trim() ? [] : buildHierarchy(entities);

  // Render entity as flat list item (for search results)
  const renderEntityListItem = (entity: Entity) => {
    const isMatched = searchQuery.trim() ? 
      (entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       entity.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
       entity.customEntityType?.title.toLowerCase().includes(searchQuery.toLowerCase())) : false;

    return (
      <div key={entity._id} className="select-none">
        <div
          className={`flex items-center py-2 px-3 rounded-lg transition-colors ${
            isMatched ? 'bg-primary-50 border border-primary-200' : 'hover:bg-gray-50'
          }`}
        >
          {/* Entity Icon */}
          <div className="mr-3">
            {entity.type === 'custom' && entity.customEntityType ? (
              <div
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: entity.customEntityType.color }}
              />
            ) : entity.type === 'entity' ? (
              <BuildingOfficeIcon className="w-5 h-5 text-primary-600" />
            ) : entity.type === 'company' ? (
              <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
            ) : (
              <UserGroupIcon className="w-5 h-5 text-green-600" />
            )}
          </div>

          {/* Entity Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{entity.name}</span>
              {entity.type === 'custom' && entity.customEntityType ? (
                <span 
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${entity.customEntityType.color}20`,
                    color: entity.customEntityType.color
                  }}
                >
                  {entity.customEntityType.title}
                </span>
              ) : (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  entity.type === 'entity' 
                    ? 'bg-primary-100 text-primary-700'
                    : entity.type === 'company'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {entity.type}
                </span>
              )}
              {!entity.parentId && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  Root
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {entity.path} • Level: {entity.level} • Created: {new Date(entity.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            {canManageEntity(entity) && (
              <>
                <button
                  onClick={() => openCreateChildModal(entity)}
                  className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
                  title="Add child entity"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEditModal(entity)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit entity"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openDeleteModal(entity._id, entity.name)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete entity"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const toggleExpanded = async (entity: Entity) => {
    try {
      // Update in backend
      await api.updateEntity(entity._id, { isExpanded: !entity.isExpanded });
      
      // Update in frontend state
      setEntities(prev => prev.map(e => 
        e._id === entity._id ? { ...e, isExpanded: !e.isExpanded } : e
      ));
    } catch (err) {
      console.error('Error toggling entity expanded state:', err);
    }
  };

  const handleCreateEntity = async () => {
    if (!createForm.name) {
      setError('Please enter an entity name');
      return;
    }

    if (!createForm.isRootEntity && !createForm.parentId) {
      setError('Please select a parent entity');
      return;
    }

    if (createForm.type === 'custom' && !createForm.customEntityTypeId) {
      setError('Please select a custom entity type');
      return;
    }

    setIsCreating(true);
    setError('');
    setSuccess('');

    try {
      await api.createEntity({
        name: createForm.name,
        type: createForm.type,
        customEntityTypeId: createForm.type === 'custom' ? createForm.customEntityTypeId : undefined,
        parentId: createForm.isRootEntity ? undefined : createForm.parentId
      });

      setSuccess(`Entity "${createForm.name}" created successfully!`);
      
      // Reload entities
      await loadEntities();
      
      // Auto-expand the parent node
      if (!createForm.isRootEntity && createForm.parentId) {
        setEntities(prev => prev.map(e => 
          e._id === createForm.parentId ? { ...e, isExpanded: true } : e
        ));
      }
      
      // Reset form and close modal
      setCreateForm({
        name: '',
        type: 'entity',
        parentId: '',
        isRootEntity: true,
      });
      setShowCreateModal(false);
      await loadEntityTypes(); // Reload entity types in case new one was created
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error creating entity:', err);
      setError(err.message || 'Failed to create entity');
    } finally {
      setIsCreating(false);
    }
  };

  const openCreateChildModal = (parentEntity: Entity) => {
    setCreateForm({
      name: '',
      type: 'entity',
      parentId: parentEntity._id,
      isRootEntity: false,
    });
    setShowCreateModal(true);
    setError('');
  };

  const openCreateRootModal = () => {
    setCreateForm({
      name: '',
      type: 'entity',
      parentId: '',
      isRootEntity: true,
    });
    setShowCreateModal(true);
    setError('');
  };

  const openEditModal = (entity: Entity) => {
    setEditForm({
      _id: entity._id,
      name: entity.name,
      type: entity.type,
      customEntityTypeId: entity.customEntityTypeId,
    });
    setShowEditModal(true);
    setError('');
  };

  const handleCreateEntityType = async () => {
    if (!createEntityTypeForm.title.trim()) {
      setError('Please enter a title');
      return;
    }

    setIsCreatingEntityType(true);
    setError('');

    try {
      await api.createEntityType(createEntityTypeForm);
      setSuccess(`Entity type "${createEntityTypeForm.title}" created successfully!`);
      await loadEntityTypes();
      setCreateEntityTypeForm({ title: '', color: '#14a800' });
      setShowCreateEntityTypeModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error creating entity type:', err);
      setError(err.message || 'Failed to create entity type');
    } finally {
      setIsCreatingEntityType(false);
    }
  };

  const openEditEntityTypeModal = (entityTypeId: string) => {
    const entityType = entityTypes.find(et => et._id === entityTypeId);
    if (entityType) {
      setEditingEntityTypeId(entityTypeId);
      setCreateEntityTypeForm({
        title: entityType.title,
        color: entityType.color,
      });
      setShowEditEntityTypeModal(true);
      setError('');
    }
  };

  const handleEditEntityType = async () => {
    if (!editingEntityTypeId) return;
    
    if (!createEntityTypeForm.title.trim()) {
      setError('Please enter a title');
      return;
    }

    setIsEditingEntityType(true);
    setError('');

    try {
      await api.updateEntityType(editingEntityTypeId, createEntityTypeForm);
      setSuccess(`Entity type "${createEntityTypeForm.title}" updated successfully!`);
      await loadEntityTypes();
      await loadEntities(); // Refresh entity structure to reflect updated entity type
      setCreateEntityTypeForm({ title: '', color: '#14a800' });
      setEditingEntityTypeId(null);
      setShowEditEntityTypeModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating entity type:', err);
      setError(err.message || 'Failed to update entity type');
    } finally {
      setIsEditingEntityType(false);
    }
  };

  const handleEditEntity = async () => {
    if (!editForm.name) {
      setError('Please enter an entity name');
      return;
    }

    if (editForm.type === 'custom' && !editForm.customEntityTypeId) {
      setError('Please select a custom entity type');
      return;
    }

    setIsEditing(true);
    setError('');
    setSuccess('');

    try {
      await api.updateEntity(editForm._id, {
        name: editForm.name,
        type: editForm.type,
        customEntityTypeId: editForm.type === 'custom' ? editForm.customEntityTypeId : undefined,
      });

      setSuccess(`Entity "${editForm.name}" updated successfully!`);
      
      // Reload entities
      await loadEntities();
      
      // Reset form and close modal
      setEditForm({
        _id: '',
        name: '',
        type: 'entity',
      });
      setShowEditModal(false);
      await loadEntityTypes(); // Reload entity types
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating entity:', err);
      setError(err.message || 'Failed to update entity');
    } finally {
      setIsEditing(false);
    }
  };

  const openDeleteModal = (entityId: string, entityName: string) => {
    setDeleteEntityId(entityId);
    setDeleteEntityName(entityName);
    setShowDeleteModal(true);
    setError('');
  };

  const handleDeleteEntity = async () => {
    try {
      setError('');
      setIsDeleting(true);
      await api.deleteEntity(deleteEntityId);
      setSuccess(`Entity "${deleteEntityName}" deleted successfully!`);
      
      // Reload entities
      await loadEntities();
      
      // Reset state and close modal
      setDeleteEntityId('');
      setDeleteEntityName('');
      setShowDeleteModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error deleting entity:', err);
      let errorMessage = 'Failed to delete entity.';
      
      // Handle specific error cases
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message?.includes('children')) {
        errorMessage = 'Cannot delete entity with child entities. Please delete child entities first.';
      } else if (err.message?.includes('users')) {
        errorMessage = 'Cannot delete entity with assigned users. Please reassign or remove users first.';
      } else if (err.message?.includes('permission')) {
        errorMessage = 'You do not have permission to delete this entity.';
      }
      
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if user can manage an entity (for TenantAdmin)
  const canManageEntity = (entity: Entity): boolean => {
    // SystemAdmin can manage all entities
    if (user?.role === 'SystemAdmin') {
      return true;
    }

    // TenantAdmin can only manage entities under their entity hierarchy
    if (user?.role === 'TenantAdmin') {
      // User can manage their own entity
      if (entity._id === user.entityId) {
        return true;
      }

      // User can manage entities that have their entityId in the path
      // This means the entity is under their hierarchy
      if (entity.path && user.entityPath) {
        return entity.path.startsWith(user.entityPath + ' >') || entity.path.startsWith(user.entityPath);
      }

      return false;
    }

    return false;
  };

  const renderEntity = (entity: Entity, depth: number = 0) => {
    const hasChildren = entity.children && entity.children.length > 0;
    const isMatched = searchQuery.trim() ? 
      (entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       entity.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
       entity.customEntityType?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       entity.path.toLowerCase().includes(searchQuery.toLowerCase())) : false;

    return (
      <div key={entity._id} className="select-none">
        <div
          className={`flex items-center py-2 px-3 rounded-lg transition-colors ${
            isMatched ? 'bg-primary-50 border border-primary-200' : 'hover:bg-gray-50'
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={() => toggleExpanded(entity)}
            className="mr-2 p-1 hover:bg-gray-200 rounded"
            disabled={!hasChildren}
          >
            {hasChildren ? (
              entity.isExpanded ? (
                <ChevronDownIcon className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-gray-600" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>

          {/* Entity Icon */}
          <div className="mr-3">
            {entity.type === 'custom' && entity.customEntityType ? (
              <div
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: entity.customEntityType.color }}
              />
            ) : entity.type === 'entity' ? (
              <BuildingOfficeIcon className="w-5 h-5 text-primary-600" />
            ) : entity.type === 'company' ? (
              <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
            ) : (
              <UserGroupIcon className="w-5 h-5 text-green-600" />
            )}
          </div>

          {/* Entity Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{entity.name}</span>
              {entity.type === 'custom' && entity.customEntityType ? (
                <span 
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${entity.customEntityType.color}20`,
                    color: entity.customEntityType.color
                  }}
                >
                  {entity.customEntityType.title}
                </span>
              ) : (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  entity.type === 'entity' 
                    ? 'bg-primary-100 text-primary-700'
                    : entity.type === 'company'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {entity.type}
                </span>
              )}
              {!entity.parentId && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  Root
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Level: {entity.level} • Created: {new Date(entity.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            {canManageEntity(entity) && (
              <>
                <button
                  onClick={() => openCreateChildModal(entity)}
                  className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
                  title="Add child entity"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEditModal(entity)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit entity name"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openDeleteModal(entity._id, entity.name)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete entity"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Render Children */}
        {entity.isExpanded && hasChildren && (
          <div>
            {entity.children?.map(child => renderEntity(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Entity Structure</h1>
          <p className="mt-2 text-sm text-gray-700">
              Manage your elastic entity hierarchy with unlimited nesting levels. Create root entities, companies, and departments.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadEntities}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={openCreateRootModal}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Root Entity
            </button>
          </div>
        </div>

        {/* Success Message - Only show success on background, errors show in modals */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {/* Entity Tree */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Hierarchical Structure</h3>
              {searchQuery.trim() && (
                <span className="text-sm text-gray-500">
                  {filteredEntities.length} {filteredEntities.length === 1 ? 'result' : 'results'}
                </span>
              )}
            </div>
            {/* Search Bar */}
            <div className="mt-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search entities by name or type..."
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto mb-2" />
                Loading entities...
              </div>
            ) : hierarchicalDisplayEntities.length === 0 && !searchQuery.trim() ? (
              <div className="text-center py-8 text-gray-500">
                <BuildingOfficeIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-lg font-medium">No entities yet</p>
                <p className="text-sm mt-1">Create your first root entity to get started</p>
                <button
                  onClick={openCreateRootModal}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create Root Entity
                </button>
              </div>
            ) : searchQuery.trim() && filteredEntities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BuildingOfficeIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-lg font-medium">No entities found</p>
                <p className="text-sm mt-1">Try adjusting your search: "{searchQuery}"</p>
              </div>
            ) : searchQuery.trim() ? (
              // Flat list for search results
              <div className="space-y-1">
                {filteredEntities.map(entity => renderEntityListItem(entity))}
              </div>
            ) : (
              // Tree structure for normal view
              hierarchicalDisplayEntities.map(entity => renderEntity(entity))
            )}
          </div>
        </div>

        {/* Create Entity Modal */}
        {showCreateModal && (
          <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-screen w-screen z-[9999] flex items-start justify-center pt-20">
            <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white mb-20">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {createForm.isRootEntity ? 'Create Root Entity' : 'Add Child Entity'}
                </h3>
                
                {/* Error message inside modal */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                    {error}
                        </div>
                )}
                
                <div className="space-y-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entity Name *
                    </label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Entity X, Acme Corp, Sales Dept"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entity Type *
                    </label>
                    <select
                      value={createForm.type}
                      onChange={(e) => {
                        const newType = e.target.value as any;
                        setCreateForm({ 
                          ...createForm, 
                          type: newType,
                          customEntityTypeId: newType === 'custom' ? createForm.customEntityTypeId : undefined
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="entity">Entity</option>
                      <option value="company">Company</option>
                      <option value="department">Department</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  {createForm.type === 'custom' && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Custom Entity Type *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateEntityTypeModal(true);
                            setError('');
                          }}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          + Create New
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                          <select
                            value={createForm.customEntityTypeId || ''}
                            onChange={(e) => setCreateForm({ ...createForm, customEntityTypeId: e.target.value })}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
                          >
                            <option value="">Select custom type...</option>
                            {entityTypes.map((et) => (
                              <option key={et._id} value={et._id}>
                                {et.title}
                              </option>
                            ))}
                          </select>
                          {createForm.customEntityTypeId && (
                            <div 
                              className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm pointer-events-none"
                              style={{ backgroundColor: entityTypes.find(et => et._id === createForm.customEntityTypeId)?.color || '#14a800' }}
                            />
                          )}
                        </div>
                        {createForm.customEntityTypeId && (
                          <button
                            type="button"
                            onClick={() => openEditEntityTypeModal(createForm.customEntityTypeId!)}
                            className="px-3 py-2 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors flex items-center"
                            title="Edit entity type"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {!createForm.isRootEntity && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Entity
                      </label>
                      <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
                        {entities.find(e => e._id === createForm.parentId)?.name || 'Unknown'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setError('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateEntity}
                    disabled={isCreating}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isCreating ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Entity'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Entity Modal */}
        {showEditModal && (
          <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-screen w-screen z-[9999] flex items-start justify-center pt-20">
            <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white mb-20">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Edit Entity
                </h3>
                
                {/* Error message inside modal */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                    {error}
              </div>
                )}
                
                <div className="space-y-4">
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entity Name *
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Entity X, Acme Corp, Sales Dept"
                    />
              </div>

              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entity Type *
                    </label>
                    <select
                      value={editForm.type}
                      onChange={(e) => {
                        const newType = e.target.value as any;
                        setEditForm({ 
                          ...editForm, 
                          type: newType,
                          customEntityTypeId: newType === 'custom' ? editForm.customEntityTypeId : undefined
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="entity">Entity</option>
                      <option value="company">Company</option>
                      <option value="department">Department</option>
                      <option value="custom">Custom</option>
                    </select>
              </div>

              {editForm.type === 'custom' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Custom Entity Type *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateEntityTypeModal(true);
                        setError('');
                      }}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      + Create New
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <select
                        value={editForm.customEntityTypeId || ''}
                        onChange={(e) => setEditForm({ ...editForm, customEntityTypeId: e.target.value })}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
                      >
                        <option value="">Select custom type...</option>
                        {entityTypes.map((et) => (
                          <option key={et._id} value={et._id}>
                            {et.title}
                          </option>
                        ))}
                      </select>
                      {editForm.customEntityTypeId && (
                        <div 
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm pointer-events-none"
                          style={{ backgroundColor: entityTypes.find(et => et._id === editForm.customEntityTypeId)?.color || '#14a800' }}
                        />
                      )}
                    </div>
                    {editForm.customEntityTypeId && (
                      <button
                        type="button"
                        onClick={() => openEditEntityTypeModal(editForm.customEntityTypeId!)}
                        className="px-3 py-2 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors flex items-center"
                        title="Edit entity type"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
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
                    onClick={handleEditEntity}
                    disabled={isEditing}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isEditing ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Entity'
                    )}
                  </button>
              </div>
            </div>
          </div>
        </div>
         )}

         {/* Delete Entity Modal */}
         {showDeleteModal && (
           <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-screen w-screen z-[9999] flex items-start justify-center pt-20">
             <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white mb-20">
               <div className="mt-3">
                 <h3 className="text-lg font-medium text-gray-900 mb-4">
                   Delete Entity
                 </h3>
                 
                 {/* Error message inside modal */}
                 {error && (
                   <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                     {error}
                   </div>
                 )}
                 
                 <div className="mb-6">
                   <p className="text-gray-700">
                     Are you sure you want to delete "{deleteEntityName}"? This action cannot be undone.
                   </p>
                 </div>

                 <div className="flex items-center justify-end space-x-3">
                   <button
                     onClick={() => {
                       setShowDeleteModal(false);
                       setError('');
                     }}
                     className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                   >
                     Cancel
                   </button>
                   <button
                     onClick={handleDeleteEntity}
                     disabled={isDeleting}
                     className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                   >
                     {isDeleting ? (
                       <>
                         <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                         Deleting...
                       </>
                     ) : (
                       'Delete Entity'
                     )}
                   </button>
                 </div>
               </div>
             </div>
           </div>
         )}

        {/* Create Entity Type Modal */}
        {showCreateEntityTypeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <BuildingOfficeIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Create Custom Entity Type
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Define a new entity classification
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateEntityTypeModal(false);
                      setError('');
                      setCreateEntityTypeForm({ title: '', color: '#14a800' });
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-md">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-6">
                  {/* Title Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createEntityTypeForm.title}
                      onChange={(e) => setCreateEntityTypeForm({ ...createEntityTypeForm, title: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                      placeholder="e.g., Team, Division, Region"
                    />
                    <p className="mt-1.5 text-xs text-gray-500">
                      This name will appear when selecting entity types
                    </p>
                  </div>

                  {/* Color Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Color <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <input
                          type="color"
                          value={createEntityTypeForm.color}
                          onChange={(e) => setCreateEntityTypeForm({ ...createEntityTypeForm, color: e.target.value })}
                          className="h-12 w-16 border-2 border-gray-200 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        />
                        <div 
                          className="absolute inset-0 rounded-lg border-2 border-white shadow-sm pointer-events-none"
                          style={{ backgroundColor: createEntityTypeForm.color }}
                        />
                      </div>
                      <input
                        type="text"
                        value={createEntityTypeForm.color}
                        onChange={(e) => setCreateEntityTypeForm({ ...createEntityTypeForm, color: e.target.value })}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all font-mono text-sm"
                        placeholder="#14a800"
                      />
                    </div>
                    <div className="mt-3 flex items-center space-x-2">
                      <div className="flex-1 h-8 rounded-md border-2 border-gray-200 overflow-hidden">
                        <div 
                          className="w-full h-full flex items-center justify-center text-xs font-medium text-white"
                          style={{ backgroundColor: createEntityTypeForm.color }}
                        >
                          Preview
                        </div>
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">
                      This color will be used for entity type indicators
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateEntityTypeModal(false);
                    setError('');
                    setCreateEntityTypeForm({ title: '', color: '#14a800' });
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEntityType}
                  disabled={isCreatingEntityType}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-sm hover:shadow-md"
                >
                  {isCreatingEntityType ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>Create Type</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Entity Type Modal */}
        {showEditEntityTypeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <BuildingOfficeIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Edit Custom Entity Type
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Update entity type details
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditEntityTypeModal(false);
                      setError('');
                      setCreateEntityTypeForm({ title: '', color: '#14a800' });
                      setEditingEntityTypeId(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-md">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-6">
                  {/* Title Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createEntityTypeForm.title}
                      onChange={(e) => setCreateEntityTypeForm({ ...createEntityTypeForm, title: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                      placeholder="e.g., Team, Division, Region"
                    />
                    <p className="mt-1.5 text-xs text-gray-500">
                      This name will appear when selecting entity types
                    </p>
                  </div>

                  {/* Color Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Color <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <input
                          type="color"
                          value={createEntityTypeForm.color}
                          onChange={(e) => setCreateEntityTypeForm({ ...createEntityTypeForm, color: e.target.value })}
                          className="h-12 w-16 border-2 border-gray-200 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        />
                        <div 
                          className="absolute inset-0 rounded-lg border-2 border-white shadow-sm pointer-events-none"
                          style={{ backgroundColor: createEntityTypeForm.color }}
                        />
                      </div>
                      <input
                        type="text"
                        value={createEntityTypeForm.color}
                        onChange={(e) => setCreateEntityTypeForm({ ...createEntityTypeForm, color: e.target.value })}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all font-mono text-sm"
                        placeholder="#14a800"
                      />
                    </div>
                    <div className="mt-3 flex items-center space-x-2">
                      <div className="flex-1 h-8 rounded-md border-2 border-gray-200 overflow-hidden">
                        <div 
                          className="w-full h-full flex items-center justify-center text-xs font-medium text-white"
                          style={{ backgroundColor: createEntityTypeForm.color }}
                        >
                          Preview
                        </div>
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">
                      This color will be used for entity type indicators
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditEntityTypeModal(false);
                    setError('');
                    setCreateEntityTypeForm({ title: '', color: '#14a800' });
                    setEditingEntityTypeId(null);
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditEntityType}
                  disabled={isEditingEntityType}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-sm hover:shadow-md"
                >
                  {isEditingEntityType ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>Update Type</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
       </div>
     </DashboardLayout>
   );
 }
