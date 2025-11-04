'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  FunnelIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { Message, MessageDirection, MessageStatus, MessageType } from '@/types/messages';
import { Entity } from '@/types/entities';
import AuthenticatedImage from '@/components/common/AuthenticatedImage';
import AuthenticatedVideo from '@/components/common/AuthenticatedVideo';
import AuthenticatedAudio from '@/components/common/AuthenticatedAudio';

interface FilterOptions {
  entityUserNumber?: string;
  entityPath?: string;
  e164Number?: string;
  userId?: string;
  timeRange?: {
    type: 'last_hours' | 'last_days' | 'date_range';
    value?: number;
    startDate?: string;
    endDate?: string;
  };
  messageType?: MessageType | 'all';
  direction?: MessageDirection | 'both';
  registrationStatus?: string;
  isExternal?: boolean;
}

export default function CommunicationPage() {
  const t = useTranslation('communication');
  const tCommon = useTranslation('common');
  const { user: currentUser } = useAuth();
  
  // Loading states
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isLoadingEntities, setIsLoadingEntities] = useState(true);
  const [error, setError] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalMessages, setTotalMessages] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Data
  const [messages, setMessages] = useState<Message[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [allE164Numbers, setAllE164Numbers] = useState<Set<string>>(new Set());
  
  // Entity navigation state
  const [selectedEntityPath, setSelectedEntityPath] = useState<string>('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['entity-x']));
  const [showStructurePanel, setShowStructurePanel] = useState(true);
  
  // WhatsApp monitoring filters
  const [whatsappFilters, setWhatsappFilters] = useState<FilterOptions>({
    entityUserNumber: '',
    entityPath: '',
    e164Number: '',
    timeRange: { type: 'last_days', value: 0 },
    messageType: 'all',
    direction: 'both',
    registrationStatus: 'all',
    isExternal: undefined
  });
  
  // Message content search state
  const [messageContent, setMessageContent] = useState('');
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [showWhatsAppFilters, setShowWhatsAppFilters] = useState(false);

  // Load messages when filters, pagination, or selected entity changes
  useEffect(() => {
    loadMessages();
  }, [currentPage, pageSize, whatsappFilters, selectedEntityPath]);

  // Load entities and users
  useEffect(() => {
    loadEntities();
    loadUsers();
  }, []);

  const loadMessages = async () => {
    try {
      setIsLoadingMessages(true);
      setError('');

      // Build filters
      const filters: any = {
        page: currentPage,
        limit: pageSize,
      };

      // Add tenantId and entityId filters based on user role and selected entity
      if (currentUser?.role !== 'SystemAdmin' && currentUser?.tenantId) {
        filters.tenantId = currentUser.tenantId;
      }

      // Always include entityId filter based on selection or user's entityId
      if (selectedEntityPath) {
        const selectedEntity = findEntityByPath(entities, selectedEntityPath);
        if (selectedEntity) {
          filters.entityId = selectedEntity._id;
          console.log('Selected entity ID:', selectedEntity._id); // Debug log
        } else {
          console.warn('Selected entity not found for path:', selectedEntityPath); // Debug log
        }
      } else if (currentUser?.role !== 'SystemAdmin' && currentUser?.entityId) {
        filters.entityId = currentUser.entityId;
        console.log('Using user entityId:', currentUser.entityId); // Debug log
      }

      if (whatsappFilters.direction && whatsappFilters.direction !== 'both') {
        filters.direction = whatsappFilters.direction;
      }

      if (whatsappFilters.messageType && whatsappFilters.messageType !== 'all') {
        filters.type = whatsappFilters.messageType;
      }

      if (whatsappFilters.e164Number) {
        filters.phoneNumber = whatsappFilters.e164Number;
      }

      if (whatsappFilters.entityUserNumber) {
        filters.from = whatsappFilters.entityUserNumber;
      }

      if (whatsappFilters.isExternal !== undefined) {
        filters.isExternal = whatsappFilters.isExternal;
      }

      if (messageContent) {
        filters.messageContent = messageContent;
      }

      if (whatsappFilters.timeRange) {
        if (whatsappFilters.timeRange.type === 'date_range') {
          if (whatsappFilters.timeRange.startDate) {
            filters.startDate = whatsappFilters.timeRange.startDate;
          }
          if (whatsappFilters.timeRange.endDate) {
            filters.endDate = whatsappFilters.timeRange.endDate;
          }
        } else if (whatsappFilters.timeRange.value) {
          const now = new Date();
          if (whatsappFilters.timeRange.type === 'last_hours') {
            filters.startDate = new Date(now.getTime() - (whatsappFilters.timeRange.value * 60 * 60 * 1000)).toISOString();
          } else {
            filters.startDate = new Date(now.getTime() - (whatsappFilters.timeRange.value * 24 * 60 * 60 * 1000)).toISOString();
          }
          filters.endDate = now.toISOString();
        }
      }

      console.log('Fetching messages with filters:', filters);

      const data = await api.getWhatsAppMessages(filters);
      setMessages(data.messages);
      setTotalMessages(data.total);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);

      // Update E164 numbers set
      const numbersSet = new Set<string>();
      data.messages.forEach(message => {
        numbersSet.add(message.from);
        numbersSet.add(message.to);
      });
      setAllE164Numbers(numbersSet);

    } catch (err: any) {
      console.error('Error loading messages:', err);
      setError(err.message || tCommon('failedToLoad'));
    } finally {
      setIsLoadingMessages(false);
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

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data.users);
    } catch (err: any) {
      console.error('Error loading users:', err);
    }
  };

  // Build entity tree structure
  const buildEntityTree = (entityList: Entity[]): Entity[] => {
    const entityMap = new Map<string, Entity & { children: Entity[] }>();
    const rootEntities: (Entity & { children: Entity[] })[] = [];

    entityList.forEach(entity => {
      entityMap.set(entity._id, { ...entity, children: [] });
    });

    entityList.forEach(entity => {
      const entityNode = entityMap.get(entity._id)!;
      if (entity.parentId) {
        const parent = entityMap.get(entity.parentId);
        if (parent) {
          parent.children.push(entityNode);
        } else {
          rootEntities.push(entityNode);
        }
      } else {
        rootEntities.push(entityNode);
      }
    });

    return rootEntities as Entity[];
  };

  // Removed getEntityIcon as we're using Heroicons directly

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
    setWhatsappFilters(prev => ({ ...prev, entityPath: path }));
  };

  // Helper function to find entity by path (recursive)
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

  // Helper function to find entity by ID
  const findEntityById = (entityId: string): Entity | null => {
    return entities.find(entity => entity._id === entityId) || null;
  };

  // Get users in selected entity path
  const usersInSelectedPath = selectedEntityPath 
    ? users.filter((user: any) => user.entityPath === selectedEntityPath || user.entityPath.startsWith(selectedEntityPath + ' >'))
    : users;

  // Filter WhatsApp messages with advanced filters including selected entity path
  const filteredWhatsAppMessages = messages.filter((message: Message) => {
    // Entity User Number filter
    const matchesEntityUser = !whatsappFilters.entityUserNumber || 
      message.senderE164 === whatsappFilters.entityUserNumber || 
      message.receiverE164 === whatsappFilters.entityUserNumber;

    // Entity Path filter (enhanced with selected path)
    const pathToMatch = selectedEntityPath || whatsappFilters.entityPath;
    const matchesEntityPath = !pathToMatch || 
      (message.entityPath && (
        message.entityPath === pathToMatch || 
        message.entityPath.startsWith(pathToMatch + ' >')
      ));

    // Enhanced E164 Number filter (supports registered and unregistered numbers)
    const matchesE164 = !whatsappFilters.e164Number || 
      (message.senderE164 && message.senderE164.includes(whatsappFilters.e164Number)) || 
      (message.receiverE164 && message.receiverE164.includes(whatsappFilters.e164Number));

    // Enhanced Time range filter with support for date ranges
    let matchesTimeRange = true;
    if (whatsappFilters.timeRange) {
      const msgDate = new Date(message.timestamp || message.sentAt);
      const now = new Date();

      if (whatsappFilters.timeRange.type === 'last_hours' && whatsappFilters.timeRange.value) {
        const startDate = new Date(now.getTime() - (whatsappFilters.timeRange.value * 60 * 60 * 1000));
        matchesTimeRange = msgDate >= startDate;
      } else if (whatsappFilters.timeRange.type === 'last_days' && whatsappFilters.timeRange.value) {
        const startDate = new Date(now.getTime() - (whatsappFilters.timeRange.value * 24 * 60 * 60 * 1000));
        matchesTimeRange = msgDate >= startDate;
      } else if (whatsappFilters.timeRange.type === 'date_range') {
        let startMatches = true;
        let endMatches = true;
        
        if (whatsappFilters.timeRange.startDate) {
          const startDate = new Date(whatsappFilters.timeRange.startDate);
          startMatches = msgDate >= startDate;
        }
        
        if (whatsappFilters.timeRange.endDate) {
          const endDate = new Date(whatsappFilters.timeRange.endDate);
          endDate.setHours(23, 59, 59, 999); // Include the entire end date
          endMatches = msgDate <= endDate;
        }
        
        matchesTimeRange = startMatches && endMatches;
      }
    }

    // Message type filter
    const matchesType = !whatsappFilters.messageType || 
      whatsappFilters.messageType === 'all' || 
      message.type === whatsappFilters.messageType;

    // Direction filter
    const matchesDirection = !whatsappFilters.direction || 
      whatsappFilters.direction === 'both' || 
      message.direction === whatsappFilters.direction;

    // Registration status filter
    let matchesRegistration = true;
    if (whatsappFilters.registrationStatus && whatsappFilters.registrationStatus !== 'all') {
      const senderUser = users.find((u: any) => u.phoneNumber === message.from);
      const receiverUser = users.find((u: any) => u.phoneNumber === message.to);
      
      if (whatsappFilters.registrationStatus === 'registered') {
        matchesRegistration = senderUser !== undefined || receiverUser !== undefined;
      } else {
        // Filter by specific registration status
        matchesRegistration = Boolean((senderUser && senderUser.registrationStatus === whatsappFilters.registrationStatus) ||
                                     (receiverUser && receiverUser.registrationStatus === whatsappFilters.registrationStatus));
      }
    }

    return matchesEntityUser && matchesEntityPath && 
           matchesE164 && matchesTimeRange && matchesType && matchesDirection && matchesRegistration;
  }).sort((a, b) => new Date(b.timestamp || b.sentAt).getTime() - new Date(a.timestamp || a.sentAt).getTime());

  // Render entity tree node
  const renderEntityNode = (entity: Entity, level: number = 0) => {
    const isExpanded = expandedNodes.has(entity._id);
    const hasChildren = entity.children && entity.children.length > 0;
    const isSelected = selectedEntityPath === entity.path;
    const messageCount = messages.filter((msg: Message) => 
      msg.entityPath === entity.path || 
      (msg.entityPath && msg.entityPath.startsWith(entity.path + ' >'))
    ).length;

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
              <div className="flex items-center space-x-2">
                {/* <div className="opacity-0  group-hover:opacity-100 transition-opacity duration-200">
                  {entity.type === 'custom' && entity.customEntityType ? (
                    <span 
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ 
                        backgroundColor: `${entity.customEntityType.color}20`,
                        color: entity.customEntityType.color
                      }}
                    >
                      {entity.customEntityType.title}
                    </span>
                  ) : (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      entity.type === 'entity' 
                        ? 'bg-primary-100 text-primary-700'
                        : entity.type === 'company'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {entity.type}
                    </span>
                  )}
                </div> */}
                {messageCount > 0 && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    isSelected ? 'bg-primary-200 text-primary-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {messageCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {entity.children!.map((child: Entity) => renderEntityNode(child, level + 1))}
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
            <h1 className="text-2xl font-semibold text-gray-900">WhatsApp Communication Monitoring</h1>
            <p className="mt-2 text-sm text-gray-700">
              Navigate through your elastic entity structure and monitor WhatsApp messages
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
              onClick={() => setShowWhatsAppFilters(!showWhatsAppFilters)}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showWhatsAppFilters
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Advanced Filters
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex space-x-6">
          {/* Elastic Structure Panel */}
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
                  {/* Show All Messages Option */}
                  <div
                    className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 ${
                      !selectedEntityPath 
                        ? 'bg-primary-100 text-primary-900 border-l-4 border-primary-500' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    onClick={() => selectEntityPath('')}
                  >
                    <div className="mr-2 flex-shrink-0">
                      <BuildingOfficeIcon className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${!selectedEntityPath ? 'text-primary-900' : 'text-gray-900'}`}>
                          All Messages
                        </span>
                        {/* {messages.length > 0 && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            !selectedEntityPath ? 'bg-primary-200 text-primary-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {messages.length}
                          </span>
                        )} */}
                      </div>
                    </div>
                  </div>
                  
                  {/* Entity Tree */}
                  <div className="space-y-1">
                    {entities.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <BuildingOfficeIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No entities found</p>
                        <p className="text-xs mt-1">Create entities to organize messages</p>
                      </div>
                    ) : (
                      entities.map(entity => renderEntityNode(entity))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages Content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Message Content Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search message content..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          loadMessages();
                        }
                      }}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      onClick={loadMessages}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      <MagnifyingGlassIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {showWhatsAppFilters && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">WhatsApp Advanced Filters</h3>
                  <button
                    onClick={() => {
                      setWhatsappFilters({
                        entityUserNumber: '',
                        entityPath: '',
                        e164Number: '',
                        userId: '',
                        timeRange: { type: 'last_days', value: 0 },
                        messageType: 'all',
                        direction: 'both',
                        registrationStatus: 'all',
                        isExternal: undefined
                      });
                      setSelectedEntityPath('');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Entity User Number Filter */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entity User Number (E164)
                      {selectedEntityPath && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({usersInSelectedPath.length} users)
                        </span>
                      )}
                    </label>
                    <select
                      value={whatsappFilters.entityUserNumber || ''}
                      onChange={(e) => setWhatsappFilters(prev => ({ ...prev, entityUserNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">
                        {selectedEntityPath ? t('allUsersInSelectedEntity') : t('allEntityUsers')}
                      </option>
                      {usersInSelectedPath.map(user => (
                        <option key={user.id} value={user.e164Number}>
                          {user.name} ({user.e164Number})
                        </option>
                      ))}
                    </select>
                  </div> */}


                  {/* Phone Number Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Any E164 Number
                    </label>
                    <input
                      value={whatsappFilters.e164Number || ''}
                      placeholder='Enter E164 Number'
                      onChange={(e) => setWhatsappFilters(prev => ({ ...prev, e164Number: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* External Numbers Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      External Numbers
                    </label>
                    <select
                      value={whatsappFilters.isExternal === undefined ? 'all' : whatsappFilters.isExternal ? 'external' : 'registered'}
                      onChange={(e) => {
                        const value = e.target.value === 'all' ? undefined : e.target.value === 'external';
                        setWhatsappFilters(prev => ({ ...prev, isExternal: value }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Messages</option>
                      <option value="external">External Numbers Only</option>
                      <option value="registered">Registered Users Only</option>
                    </select>
                    <div className="mt-1 text-xs text-gray-500">
                      Filter by external (unregistered) vs registered users
                    </div>
                  </div>

                  {/* Enhanced Time Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Period
                    </label>
                    <div className="space-y-2">
                      <select
                        value={whatsappFilters.timeRange?.type || 'last_days'}
                        onChange={(e) => setWhatsappFilters(prev => ({ 
                          ...prev, 
                          timeRange: { 
                            type: e.target.value as any,
                            value: e.target.value === 'date_range' ? undefined : prev.timeRange?.value,
                            startDate: e.target.value === 'date_range' ? prev.timeRange?.startDate : undefined,
                            endDate: e.target.value === 'date_range' ? prev.timeRange?.endDate : undefined
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="last_hours">Last Hours</option>
                        <option value="last_days">Last Days</option>
                        <option value="date_range">Custom Date Range</option>
                      </select>
                      
                      {whatsappFilters.timeRange?.type === 'date_range' ? (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">From Date</label>
                            <input
                              type="date"
                              value={whatsappFilters.timeRange?.startDate || ''}
                              onChange={(e) => setWhatsappFilters(prev => ({ 
                                ...prev, 
                                timeRange: { ...prev.timeRange!, startDate: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">To Date</label>
                            <input
                              type="date"
                              value={whatsappFilters.timeRange?.endDate || ''}
                              onChange={(e) => setWhatsappFilters(prev => ({ 
                                ...prev, 
                                timeRange: { ...prev.timeRange!, endDate: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={whatsappFilters.timeRange?.value || ''}
                          onChange={(e) => setWhatsappFilters(prev => ({ 
                            ...prev, 
                            timeRange: { ...prev.timeRange!, value: parseInt(e.target.value) || 0 }
                          }))}
                          placeholder={whatsappFilters.timeRange?.type === 'last_hours' ? 'Enter hours' : 'Enter days'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      )}
                    </div>
                  </div>

                  

                  {/* Message Direction Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message Direction
                    </label>
                    <select
                      value={whatsappFilters.direction || 'both'}
                      onChange={(e) => setWhatsappFilters(prev => ({ ...prev, direction: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="both">Both Directions</option>
                      <option value="inbound">Inbound Only</option>
                      <option value="outbound">Outbound Only</option>
                    </select>
                  </div>

                  {/* Message Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message Type
                    </label>
                    <select
                      value={whatsappFilters.messageType || 'all'}
                      onChange={(e) => setWhatsappFilters(prev => ({ ...prev, messageType: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Types</option>
                      <option value="text">Text</option>
                      <option value="image">Image</option>
                      <option value="audio">Audio</option>
                      <option value="video">Video</option>
                      <option value="document">Document</option>
                      <option value="file">File</option>
                    </select>
                  </div>

                  {/* Registration Status Filter */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Status
                    </label>
                    <select
                      value={whatsappFilters.registrationStatus || 'all'}
                      onChange={(e) => setWhatsappFilters(prev => ({ ...prev, registrationStatus: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Users</option>
                      <option value="registered">Any Registered User</option>
                      <option value="pending">Pending Registration</option>
                      <option value="invited">Invited Users</option>
                      <option value="cancelled">Cancelled Registration</option>
                    </select>
                    <div className="mt-1 text-xs text-gray-500">
                      Filter by registration status of message participants
                    </div>
                  </div> */}

                  
                </div>
              </div>
            )}

            {/* WhatsApp Messages Display */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <i className="bi bi-whatsapp text-white text-2xl"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">WhatsApp Messages</h3>
                      <p className="text-sm text-gray-500">Real-time communication history</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {isLoadingMessages ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto mb-2 text-primary-600" />
                    <p>Loading messages...</p>
                  </div>
                ) : error ? (
                  <div className="px-6 py-8 text-center text-red-500">
                    <p>{error}</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No WhatsApp messages found matching your criteria.
                  </div>
                ) : (
                  messages.map((message) => {
                    const senderInfo = users.find(u => u.phoneNumber === message.from);
                    const receiverInfo = users.find(u => u.phoneNumber === message.to);
                    
                    return (
                      <div 
                        key={message._id} 
                        id={`message-${message._id}`}
                        className="px-6 py-4 hover:bg-gray-50/50 transition-colors duration-150"
                      >
                        <div className="flex items-start space-x-4">
                          {/* Direction Indicator */}
                          <div className="flex-shrink-0 pt-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.direction === MessageDirection.OUTBOUND 
                                ? 'bg-blue-50 border border-blue-200' 
                                : 'bg-green-50 border border-green-200'
                            }`}>
                              <i className={`bi ${
                                message.direction === MessageDirection.OUTBOUND 
                                  ? 'bi-telephone-outbound text-blue-600' 
                                  : 'bi-telephone-inbound text-green-600'
                              } text-lg`}></i>
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {/* Message Header */}
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2 flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {message.isExternalNumber 
                                      ? (message.externalSenderName || message.from)
                                      : (senderInfo ? `${senderInfo.firstName} ${senderInfo.lastName}` : message.from)
                                    }
                                  </span>
                                  {/* External Tag */}
                                  {message.isExternalNumber && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                      External
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                    {message.metadata?.senderContactName || message.from}
                                  </span>
                                </div>
                                <span className="text-gray-400 text-sm">→</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    {receiverInfo ? `${receiverInfo.firstName} ${receiverInfo.lastName}` : message.to}
                                  </span>
                                  {/* Registered User Tag */}
                                  {receiverInfo && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Registered
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                    {message.to}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Message Content */}
                            <div className={`rounded-lg p-4 mb-2 ${
                              message.direction === MessageDirection.OUTBOUND
                                ? 'bg-primary-50 ml-12'
                                : 'bg-white border border-gray-100 mr-12'
                            }`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  {/* Reply Reference */}
                                  {message.replyToMessage && (
                                    <div 
                                      className={`mb-3 p-2 rounded border-l-4 cursor-pointer ${
                                        message.direction === MessageDirection.OUTBOUND
                                          ? 'bg-primary-100/50 border-primary-300'
                                          : 'bg-gray-50 border-gray-300'
                                      }`}
                                      onClick={() => {
                                        const replyMsg = messages.find(m => m._id === message.replyToMessageId);
                                        if (replyMsg) {
                                          const element = document.getElementById(`message-${replyMsg._id}`);
                                          if (element) {
                                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            element.classList.add('highlight-message');
                                            setTimeout(() => element.classList.remove('highlight-message'), 2000);
                                          }
                                        }
                                      }}
                                    >
                                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                                        <i className="bi bi-reply-fill"></i>
                                        <span>Reply to {message.replyToMessage.senderName || message.replyToMessage.from}</span>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        {message.replyToMessage.type !== MessageType.TEXT && (
                                          <i className={`bi ${
                                            message.replyToMessage.type === MessageType.IMAGE
                                              ? 'bi-image text-blue-600'
                                              : message.replyToMessage.type === MessageType.VIDEO
                                              ? 'bi-camera-video text-purple-600'
                                              : message.replyToMessage.type === MessageType.AUDIO
                                              ? 'bi-mic text-green-600'
                                              : 'bi-paperclip text-gray-600'
                                          }`}></i>
                                        )}
                                        <p className="text-sm text-gray-700 line-clamp-2">
                                          {message.replyToMessage.content}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Message Type Icon */}
                                  {message.type !== MessageType.TEXT && (
                                    <div className="mb-2">
                                      <span className={`inline-flex items-center space-x-1 text-xs ${
                                        message.direction === MessageDirection.OUTBOUND
                                          ? 'text-primary-700 bg-primary-100'
                                          : 'text-blue-700 bg-blue-50'
                                      } px-2 py-1 rounded-full`}>
                                        <i className={`bi ${
                                          message.type === MessageType.IMAGE
                                            ? 'bi-image'
                                            : message.type === MessageType.VIDEO
                                            ? 'bi-camera-video'
                                            : message.type === MessageType.AUDIO
                                            ? 'bi-mic'
                                            : message.type === MessageType.DOCUMENT
                                            ? 'bi-file-earmark-text'
                                            : 'bi-paperclip'
                                        }`}></i>
                                        <span>{message.type.toLowerCase()}</span>
                                      </span>
                                    </div>
                                  )}

                                  {/* Message Content */}
                                  <p className={`text-sm ${
                                    message.direction === MessageDirection.OUTBOUND
                                      ? 'text-primary-800'
                                      : 'text-gray-800'
                                  }`}>{message.content}</p>

                                  {/* Media Content */}
                                  {message.mediaUrl && (
                                    <div className="mt-3 space-y-2">
                                      <div className={`rounded-lg overflow-hidden ${
                                        message.type === MessageType.IMAGE || message.type === MessageType.VIDEO
                                          ? 'shadow-sm'
                                          : ''
                                      }`}>
                                        {message.type === MessageType.IMAGE ? (
                                          <AuthenticatedImage 
                                            src={message.mediaUrl} 
                                            alt="Message attachment" 
                                            className="max-w-sm w-full object-cover rounded-lg" 
                                          />
                                        ) : message.type === MessageType.VIDEO ? (
                                          <AuthenticatedVideo 
                                            src={message.mediaUrl} 
                                            controls 
                                            className="max-w-sm w-full rounded-lg" 
                                          />
                                        ) : message.type === MessageType.AUDIO ? (
                                          <div className="bg-gray-50 p-3 rounded-lg">
                                            <AuthenticatedAudio 
                                              src={message.mediaUrl} 
                                              controls 
                                              className="w-full max-w-sm" 
                                            />
                                          </div>
                                        ) : (
                                          <a 
                                            href={message.mediaUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${
                                              message.direction === MessageDirection.OUTBOUND
                                                ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                            }`}
                                          >
                                            <i className="bi bi-download"></i>
                                            <span>Download {message.type.toLowerCase()}</span>
                                          </a>
                                        )}
                                      </div>
                                      {message.metadata?.caption && (
                                        <p className="text-sm text-gray-600 italic">
                                          {message.metadata.caption}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Timestamp */}
                                <div className="flex items-start space-x-2 ml-3 self-end">
                                  <span className={`text-xs whitespace-nowrap ${
                                    message.direction === MessageDirection.OUTBOUND
                                      ? 'text-primary-600'
                                      : 'text-gray-500'
                                  }`}>
                                    {new Date(message.sentAt).toLocaleString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
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
                        Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>~
                        <span className="font-medium">{Math.min(currentPage * pageSize, totalMessages)}</span> of{' '}
                        <span className="font-medium">{totalMessages}</span> messages
                      </p>
                      {/* <div className="flex items-center gap-2">
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
                          <option value="10">10</option>
                          <option value="20">20</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                        </select>
                      </div> */}
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
      </div>
    </DashboardLayout>
  );
}
