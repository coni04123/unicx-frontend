// Core entity types
export interface Entity {
  id: string;
  name: string;
  type: 'customer' | 'company' | 'group' | 'sub-group';
  parentId?: string;
  identifier?: string; // E164, CPF, CNPJ, etc.
  identifierType?: 'e164' | 'cpf' | 'cnpj' | 'custom';
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  children?: Entity[];
  metadata?: Record<string, any>;
}

// WhatsApp Account types
export interface WhatsAppAccount {
  id: string;
  name: string;
  phoneNumber: string;
  type: 'business' | 'messenger';
  status: 'active' | 'blocked' | 'suspended' | 'pending';
  lastHealthCheck: Date;
  healthCheckStatus: 'healthy' | 'warning' | 'critical';
  apiToken: string;
  businessInfo?: {
    businessId: string;
    displayName: string;
    category: string;
  };
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  messagesSent24h: number;
  messagesReceived24h: number;
}

// Spy Number types
export interface SpyNumber {
  id: string;
  phoneNumber: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  groupsMonitored: number;
  messagesIntercepted24h: number;
  lastActivity: Date;
  tenantId: string;
  createdAt: Date;
  assignedGroups: string[];
  alertConfig: {
    missingFromGroup: boolean;
    inactivity: boolean;
    inactivityThresholdHours: number;
  };
}

// Group types
export interface Group {
  id: string;
  name: string;
  whatsappGroupId?: string;
  participantCount: number;
  spyNumbersAssigned: string[];
  status: 'monitored' | 'unmonitored' | 'error';
  lastMessage: Date;
  messagesCount24h: number;
  tenantId: string;
  createdAt: Date;
  participants: GroupParticipant[];
  entityId?: string; // Link to entity hierarchy
}

export interface GroupParticipant {
  phoneNumber: string;
  name?: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  isSpyNumber: boolean;
}

// Message types
export interface Message {
  id: string;
  from: string;
  to: string; // Group ID or individual number
  content: string;
  messageType: 'text' | 'image' | 'document' | 'audio' | 'video';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  groupId?: string;
  campaignId?: string;
  spyNumberId?: string;
  tenantId: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: number; // for audio/video
  };
}

// Campaign types
export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed';
  targetType: 'entities' | 'groups' | 'custom';
  targets: string[]; // Entity IDs, Group IDs, or phone numbers
  messageTemplate: string;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  totalMessages: number;
  sentMessages: number;
  deliveredMessages: number;
  failedMessages: number;
  tenantId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  whatsappAccountId: string;
}

// User and Auth types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  tenantId: string;
  permissions: Permission[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  resource: string; // 'whatsapp_accounts', 'spy_numbers', 'entities', etc.
  actions: string[]; // ['read', 'write', 'delete', 'admin']
}

// Tenant types
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'suspended' | 'trial';
  subscriptionPlan: 'basic' | 'pro' | 'enterprise';
  limits: {
    whatsappAccounts: number;
    spyNumbers: number;
    messagesPerMonth: number;
    usersCount: number;
  };
  usage: {
    whatsappAccounts: number;
    spyNumbers: number;
    messagesSentThisMonth: number;
    activeUsers: number;
  };
  createdAt: Date;
  updatedAt: Date;
  contactEmail: string;
}

// Audit Log types
export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  result: 'success' | 'failure';
}

// Alert types
export interface Alert {
  id: string;
  tenantId: string;
  type: 'account_blocked' | 'spy_missing' | 'health_check_failed' | 'high_failure_rate' | 'quota_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  resourceType: 'whatsapp_account' | 'spy_number' | 'group' | 'campaign' | 'system';
  resourceId?: string;
  status: 'open' | 'acknowledged' | 'resolved';
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  acknowledgedBy?: string;
  resolvedBy?: string;
}

// Dashboard metrics types
export interface DashboardMetrics {
  tenantId: string;
  whatsappAccounts: {
    total: number;
    active: number;
    blocked: number;
    health: {
      healthy: number;
      warning: number;
      critical: number;
    };
  };
  spyNumbers: {
    total: number;
    active: number;
    groupsMonitored: number;
    messagesIntercepted24h: number;
  };
  messages: {
    sent24h: number;
    received24h: number;
    delivered24h: number;
    failed24h: number;
    deliveryRate: number;
  };
  entities: {
    total: number;
    customers: number;
    companies: number;
    groups: number;
  };
  alerts: {
    open: number;
    critical: number;
  };
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter and Search types
export interface FilterOptions {
  tenantId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}
