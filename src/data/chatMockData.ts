// Extended mock data for WhatsApp monitoring system with elastic entity structure

// Elastic Entity Structure Interfaces
export interface ElasticEntity {
  id: string;
  name: string;
  type: 'entity' | 'company' | 'department';
  parentId?: string;
  children?: ElasticEntity[];
  level: number;
  path: string; // e.g., "Entity X > Company C1 > Department D1"
  createdAt: string;
  updatedAt: string;
}

export interface E164User {
  id: string;
  e164Number: string; // The basic element - E164 format phone number
  name: string;
  email: string;
  entityId: string; // Which entity they belong to
  entityPath: string; // Full path in elastic structure
  role: 'TenantAdmin' | 'User'; // User role within the system
  registrationStatus: 'pending' | 'registered' | 'cancelled' | 'invited';
  registrationDate?: string;
  cancellationDate?: string;
  lastQRCodeSent?: string;
  whatsappConnected: boolean;
  avatar?: string;
  initials: string;
  isOnline: boolean;
  lastSeen: string;
}

// Enhanced WhatsApp Message Interface
export interface WhatsAppMessage {
  id: string;
  conversationId: string;
  senderE164: string; // E164 number of sender
  receiverE164: string; // E164 number of receiver
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'document';
  status: 'sent' | 'delivered' | 'read';
  isMonitored: boolean; // Whether this message is from a monitored user
  entityPath?: string; // Entity path if sender is registered user
  direction: 'inbound' | 'outbound';
}

export interface WhatsAppConversation {
  id: string;
  participantE164s: string[]; // All E164 numbers in conversation
  lastMessage: string;
  lastMessageTimestamp: string;
  messageCount: number;
  monitoredParticipants: string[]; // E164s that are registered users
  entityPaths: string[]; // Entity paths of monitored participants
}

// Menu and Access Control
export interface MenuStructure {
  id: string;
  name: string;
  path: string;
  icon?: string;
  children?: MenuStructure[];
  accessLevels: ('admin' | 'entity' | 'user')[];
  component?: string;
}

export interface AccessLevel {
  level: 'admin' | 'entity' | 'user';
  description: string;
  maxMembers: number;
  permissions: string[];
}

// Legacy interfaces for backward compatibility
export interface ChatContact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  lastSeen: string;
  isOnline: boolean;
  initials: string;
}

export interface ChatConversation {
  id: string;
  contactId: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isRead: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'audio';
  isIncoming: boolean;
  status: 'sent' | 'delivered' | 'read';
}

// Access Level Definitions
export const accessLevels: AccessLevel[] = [
  {
    level: 'admin',
    description: 'System administrators with full system access across all tenants',
    maxMembers: 25,
    permissions: ['manage_all_tenants', 'manage_system', 'view_all_messages', 'system_config', 'user_management']
  },
  {
    level: 'entity',
    description: 'Tenant administrators who manage sub-tenants (companies/departments) and monitor E164 users',
    maxMembers: -1, // Unlimited
    permissions: ['manage_sub_tenants', 'manage_entity_users', 'monitor_e164_users', 'view_entity_messages', 'send_invitations']
  },
  {
    level: 'user',
    description: 'E164 users (basic elements) with access to own messages and profile',
    maxMembers: -1, // Unlimited
    permissions: ['view_own_messages', 'update_profile', 'whatsapp_connection']
  }
];

// Menu Structure for JOB1
export const menuStructure: MenuStructure[] = [
  {
    id: 'entity-management',
    name: 'Entity Management',
    path: '/entities',
    icon: 'building',
    accessLevels: ['admin', 'entity'],
    children: [
      {
        id: 'entity-structure',
        name: 'Entity Structure',
        path: '/entities/structure',
        icon: 'hierarchy',
        accessLevels: ['admin', 'entity'],
        component: 'EntityStructureComponent'
      },
      {
        id: 'user-management',
        name: 'User Management',
        path: '/entities/users',
        icon: 'users',
        accessLevels: ['admin', 'entity'],
        component: 'UserManagementComponent'
      },
      {
        id: 'registration-status',
        name: 'Registration Status',
        path: '/entities/registration',
        icon: 'user-check',
        accessLevels: ['admin', 'entity'],
        component: 'RegistrationStatusComponent'
      }
    ]
  },
  {
    id: 'communications',
    name: 'Communications',
    path: '/communications',
    icon: 'message-circle',
    accessLevels: ['admin', 'entity', 'user'],
    children: [
      {
        id: 'whatsapp-monitoring',
        name: 'WhatsApp Monitoring',
        path: '/communications/whatsapp',
        icon: 'message-square',
        accessLevels: ['admin', 'entity', 'user'],
        component: 'WhatsAppMonitoringComponent'
      },
      {
        id: 'message-filtering',
        name: 'Message Filtering',
        path: '/communications/filters',
        icon: 'filter',
        accessLevels: ['admin', 'entity'],
        component: 'MessageFilteringComponent'
      }
    ]
  },
  {
    id: 'system',
    name: 'System',
    path: '/system',
    icon: 'settings',
    accessLevels: ['admin'],
    children: [
      {
        id: 'admin-panel',
        name: 'Admin Panel',
        path: '/system/admin',
        icon: 'shield',
        accessLevels: ['admin'],
        component: 'AdminPanelComponent'
      }
    ]
  }
];

// Extended contacts with more realistic data (Legacy compatibility)
export const chatContacts: ChatContact[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    phone: '+1 (555) 0123',
    lastSeen: 'online',
    isOnline: true,
    initials: 'SJ',
  },
  {
    id: '2', 
    name: 'Michael Davis',
    phone: '+1 (555) 0124',
    lastSeen: '5 minutes ago',
    isOnline: false,
    initials: 'MD',
  },
  {
    id: '3',
    name: 'Emily Wilson', 
    phone: '+1 (555) 0125',
    lastSeen: '1 hour ago',
    isOnline: false,
    initials: 'EW',
  },
  {
    id: '4',
    name: 'James Brown',
    phone: '+1 (555) 0126',
    lastSeen: '2 hours ago',
    isOnline: false,
    initials: 'JB',
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    phone: '+1 (555) 0127',
    lastSeen: 'yesterday',
    isOnline: false,
    initials: 'LA',
  },
  {
    id: '6',
    name: 'David Miller',
    phone: '+1 (555) 0128',
    lastSeen: '3 days ago',
    isOnline: false,
    initials: 'DM',
  },
  {
    id: '7',
    name: 'Jessica Taylor',
    phone: '+1 (555) 0129',
    lastSeen: 'online',
    isOnline: true,
    initials: 'JT',
  },
  {
    id: '8',
    name: 'Robert Garcia',
    phone: '+1 (555) 0130',
    lastSeen: '10 minutes ago',
    isOnline: false,
    initials: 'RG',
  },
  {
    id: '9',
    name: 'Enterprise Support Team',
    phone: 'Group',
    lastSeen: '30 minutes ago',
    isOnline: false,
    initials: 'ES',
  },
  {
    id: '10',
    name: 'Amanda White',
    phone: '+1 (555) 0131',
    lastSeen: '1 hour ago',
    isOnline: false,
    initials: 'AW',
  },
  {
    id: '11',
    name: 'Christopher Lee',
    phone: '+1 (555) 0132',
    lastSeen: '2 hours ago',
    isOnline: false,
    initials: 'CL',
  },
  {
    id: '12',
    name: 'Michelle Rodriguez',
    phone: '+1 (555) 0133',
    lastSeen: 'yesterday',
    isOnline: false,
    initials: 'MR',
  },
  {
    id: '13',
    name: 'Kevin Martinez',
    phone: '+1 (555) 0134',
    lastSeen: '5 days ago',
    isOnline: false,
    initials: 'KM',
  },
  {
    id: '14',
    name: 'Nicole Thompson',
    phone: '+1 (555) 0135',
    lastSeen: '1 hour ago',
    isOnline: false,
    initials: 'NT',
  },
  {
    id: '15',
    name: 'Ryan Clark',
    phone: '+1 (555) 0136',
    lastSeen: 'online',
    isOnline: true,
    initials: 'RC',
  },
];

// Elastic Entity Structure Mock Data
export const elasticEntities: ElasticEntity[] = [
  // Entity X (Root Level)
  {
    id: 'entity-x',
    name: 'Entity X',
    type: 'entity',
    level: 0,
    path: 'Entity X',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    children: []
  },
  // Companies under Entity X
  {
    id: 'company-c1',
    name: 'Company C1',
    type: 'company',
    parentId: 'entity-x',
    level: 1,
    path: 'Entity X > Company C1',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    children: []
  },
  {
    id: 'company-c2',
    name: 'Company C2',
    type: 'company',
    parentId: 'entity-x',
    level: 1,
    path: 'Entity X > Company C2',
    createdAt: '2024-01-15T11:30:00Z',
    updatedAt: '2024-01-15T11:30:00Z',
    children: []
  },
  {
    id: 'company-c3',
    name: 'Company C3',
    type: 'company',
    parentId: 'entity-x',
    level: 1,
    path: 'Entity X > Company C3',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    children: []
  },
  // Departments under Company C1
  {
    id: 'dept-c1-sales',
    name: 'Sales Department',
    type: 'department',
    parentId: 'company-c1',
    level: 2,
    path: 'Entity X > Company C1 > Sales Department',
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z',
    children: []
  },
  {
    id: 'dept-c1-marketing',
    name: 'Marketing Department',
    type: 'department',
    parentId: 'company-c1',
    level: 2,
    path: 'Entity X > Company C1 > Marketing Department',
    createdAt: '2024-01-16T09:30:00Z',
    updatedAt: '2024-01-16T09:30:00Z',
    children: []
  },
  {
    id: 'dept-c1-it',
    name: 'IT Department',
    type: 'department',
    parentId: 'company-c1',
    level: 2,
    path: 'Entity X > Company C1 > IT Department',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
    children: []
  },
  // Departments under Company C2
  {
    id: 'dept-c2-operations',
    name: 'Operations Department',
    type: 'department',
    parentId: 'company-c2',
    level: 2,
    path: 'Entity X > Company C2 > Operations Department',
    createdAt: '2024-01-16T11:00:00Z',
    updatedAt: '2024-01-16T11:00:00Z',
    children: []
  },
  {
    id: 'dept-c2-finance',
    name: 'Finance Department',
    type: 'department',
    parentId: 'company-c2',
    level: 2,
    path: 'Entity X > Company C2 > Finance Department',
    createdAt: '2024-01-16T11:30:00Z',
    updatedAt: '2024-01-16T11:30:00Z',
    children: []
  },
  // Departments under Company C3
  {
    id: 'dept-c3-hr',
    name: 'Human Resources',
    type: 'department',
    parentId: 'company-c3',
    level: 2,
    path: 'Entity X > Company C3 > Human Resources',
    createdAt: '2024-01-16T12:00:00Z',
    updatedAt: '2024-01-16T12:00:00Z',
    children: []
  },
  {
    id: 'dept-c3-legal',
    name: 'Legal Department',
    type: 'department',
    parentId: 'company-c3',
    level: 2,
    path: 'Entity X > Company C3 > Legal Department',
    createdAt: '2024-01-16T12:30:00Z',
    updatedAt: '2024-01-16T12:30:00Z',
    children: []
  }
];

// E164 Users (Basic Elements) Mock Data
export const e164Users: E164User[] = [
  // Users in Company C1 - Sales Department
  {
    id: 'user-001',
    e164Number: '+14155551001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@entityx-c1.com',
    entityId: 'dept-c1-sales',
    entityPath: 'Entity X > Company C1 > Sales Department',
    role: 'TenantAdmin', // Sales department admin
    registrationStatus: 'registered',
    registrationDate: '2024-02-01T09:00:00Z',
    whatsappConnected: true,
    initials: 'SJ',
    isOnline: true,
    lastSeen: 'online'
  },
  {
    id: 'user-002',
    e164Number: '+14155551002',
    name: 'Michael Davis',
    email: 'michael.davis@entityx-c1.com',
    entityId: 'dept-c1-sales',
    entityPath: 'Entity X > Company C1 > Sales Department',
    role: 'User', // Regular sales user
    registrationStatus: 'registered',
    registrationDate: '2024-02-01T10:00:00Z',
    whatsappConnected: true,
    initials: 'MD',
    isOnline: false,
    lastSeen: '5 minutes ago'
  },
  // Users in Company C1 - Marketing Department
  {
    id: 'user-003',
    e164Number: '+14155551003',
    name: 'Emily Wilson',
    email: 'emily.wilson@entityx-c1.com',
    entityId: 'dept-c1-marketing',
    entityPath: 'Entity X > Company C1 > Marketing Department',
    role: 'TenantAdmin', // Marketing department admin
    registrationStatus: 'registered',
    registrationDate: '2024-02-02T09:00:00Z',
    whatsappConnected: true,
    initials: 'EW',
    isOnline: false,
    lastSeen: '1 hour ago'
  },
  {
    id: 'user-004',
    e164Number: '+14155551004',
    name: 'James Brown',
    email: 'james.brown@entityx-c1.com',
    entityId: 'dept-c1-marketing',
    entityPath: 'Entity X > Company C1 > Marketing Department',
    role: 'User', // Regular marketing user
    registrationStatus: 'invited',
    lastQRCodeSent: '2024-02-15T14:30:00Z',
    whatsappConnected: false,
    initials: 'JB',
    isOnline: false,
    lastSeen: 'never'
  },
  // Users in Company C1 - IT Department
  {
    id: 'user-005',
    e164Number: '+14155551005',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@entityx-c1.com',
    entityId: 'dept-c1-it',
    entityPath: 'Entity X > Company C1 > IT Department',
    role: 'TenantAdmin', // IT department admin
    registrationStatus: 'registered',
    registrationDate: '2024-02-03T09:00:00Z',
    whatsappConnected: true,
    initials: 'LA',
    isOnline: false,
    lastSeen: 'yesterday'
  },
  // Users in Company C2 - Operations Department
  {
    id: 'user-006',
    e164Number: '+14155551006',
    name: 'David Miller',
    email: 'david.miller@entityx-c2.com',
    entityId: 'dept-c2-operations',
    entityPath: 'Entity X > Company C2 > Operations Department',
    role: 'TenantAdmin', // Operations department admin
    registrationStatus: 'registered',
    registrationDate: '2024-02-04T09:00:00Z',
    whatsappConnected: true,
    initials: 'DM',
    isOnline: false,
    lastSeen: '3 days ago'
  },
  {
    id: 'user-007',
    e164Number: '+14155551007',
    name: 'Jessica Taylor',
    email: 'jessica.taylor@entityx-c2.com',
    entityId: 'dept-c2-operations',
    entityPath: 'Entity X > Company C2 > Operations Department',
    role: 'User', // Operations team member
    registrationStatus: 'registered',
    registrationDate: '2024-02-04T10:00:00Z',
    whatsappConnected: true,
    initials: 'JT',
    isOnline: true,
    lastSeen: 'online'
  },
  // Users in Company C2 - Finance Department
  {
    id: 'user-008',
    e164Number: '+14155551008',
    name: 'Robert Garcia',
    email: 'robert.garcia@entityx-c2.com',
    entityId: 'dept-c2-finance',
    entityPath: 'Entity X > Company C2 > Finance Department',
    role: 'TenantAdmin', // Finance department admin
    registrationStatus: 'cancelled',
    registrationDate: '2024-02-05T09:00:00Z',
    cancellationDate: '2024-02-10T15:00:00Z',
    whatsappConnected: false,
    initials: 'RG',
    isOnline: false,
    lastSeen: '10 days ago'
  },
  // Users in Company C3 - HR Department
  {
    id: 'user-009',
    e164Number: '+14155551009',
    name: 'Amanda White',
    email: 'amanda.white@entityx-c3.com',
    entityId: 'dept-c3-hr',
    entityPath: 'Entity X > Company C3 > Human Resources',
    role: 'TenantAdmin', // HR department admin
    registrationStatus: 'pending',
    whatsappConnected: false,
    initials: 'AW',
    isOnline: false,
    lastSeen: 'never'
  },
  {
    id: 'user-010',
    e164Number: '+14155551010',
    name: 'Christopher Lee',
    email: 'christopher.lee@entityx-c3.com',
    entityId: 'dept-c3-hr',
    entityPath: 'Entity X > Company C3 > Human Resources',
    role: 'User', // HR team member
    registrationStatus: 'registered',
    registrationDate: '2024-02-06T09:00:00Z',
    whatsappConnected: true,
    initials: 'CL',
    isOnline: false,
    lastSeen: '2 hours ago'
  }
];

// Realistic English conversations
export const chatConversations: ChatConversation[] = [
  {
    id: '1',
    contactId: '7',
    lastMessage: 'Perfect! Is the visual customization included in the quoted price?',
    timestamp: '13:39',
    unreadCount: 0,
    isRead: true,
  },
  {
    id: '2',
    contactId: '1',
    lastMessage: 'Received! I opened it and at first glance...',
    timestamp: '13:43',
    unreadCount: 1,
    isRead: false,
  },
  {
    id: '3',
    contactId: '8',
    lastMessage: 'Hello, would you like to proceed?',
    timestamp: '13:43',
    unreadCount: 0,
    isRead: true,
  },
  {
    id: '4',
    contactId: '9',
    lastMessage: 'What time is the meeting scheduled?',
    timestamp: '13:43',
    unreadCount: 0,
    isRead: true,
  },
  {
    id: '5',
    contactId: '10',
    lastMessage: 'I will close our support session.',
    timestamp: '13:43',
    unreadCount: 1,
    isRead: false,
  },
  {
    id: '6',
    contactId: '11',
    lastMessage: 'Thank you for your trust!',
    timestamp: '13:43',
    unreadCount: 0,
    isRead: true,
  },
  {
    id: '7',
    contactId: '12',
    lastMessage: 'I will think about it and get back to you.',
    timestamp: '13:43',
    unreadCount: 0,
    isRead: true,
  },
  {
    id: '8',
    contactId: '13',
    lastMessage: 'I need to analyze the details better.',
    timestamp: '13:43',
    unreadCount: 0,
    isRead: true,
  },
  {
    id: '9',
    contactId: '2',
    lastMessage: 'Great! When can we schedule this?',
    timestamp: '13:42',
    unreadCount: 2,
    isRead: false,
  },
  {
    id: '10',
    contactId: '3',
    lastMessage: 'Thank you for your attention!',
    timestamp: '13:41',
    unreadCount: 0,
    isRead: true,
  },
  {
    id: '11',
    contactId: '4',
    lastMessage: 'Sounds good, I await your response.',
    timestamp: '13:40',
    unreadCount: 0,
    isRead: true,
  },
  {
    id: '12',
    contactId: '5',
    lastMessage: 'Perfect explanation!',
    timestamp: '13:38',
    unreadCount: 0,
    isRead: true,
  },
  {
    id: '13',
    contactId: '14',
    lastMessage: 'I will review and respond to you.',
    timestamp: '13:35',
    unreadCount: 1,
    isRead: false,
  },
  {
    id: '14',
    contactId: '15',
    lastMessage: 'Yes, you can send the documents.',
    timestamp: '13:30',
    unreadCount: 0,
    isRead: true,
  },
];

// Realistic English messages for Jessica Taylor conversation
export const chatMessages: ChatMessage[] = [
  {
    id: '1',
    conversationId: '1',
    senderId: '7',
    content: 'Hi! I wanted to ask you something first.',
    timestamp: '13:38',
    type: 'text',
    isIncoming: true,
    status: 'read',
  },
  {
    id: '2',
    conversationId: '1',
    senderId: 'me',
    content: 'Jessica, I finished the proposal we discussed. Do you need to adjust any details before I send it?',
    timestamp: '13:38',
    type: 'text',
    isIncoming: false,
    status: 'read',
  },
  {
    id: '3',
    conversationId: '1',
    senderId: 'me',
    content: 'I just wanted to confirm if this proposal already includes post-implementation support.',
    timestamp: '13:39',
    type: 'text',
    isIncoming: false,
    status: 'read',
  },
  {
    id: '4',
    conversationId: '1',
    senderId: 'me',
    content: 'Yes! Support is included. And the timeline remains the same, starting Monday. Everything is detailed.',
    timestamp: '13:39',
    type: 'text',
    isIncoming: false,
    status: 'read',
  },
  {
    id: '5',
    conversationId: '1',
    senderId: '7',
    content: 'Perfect! Is the visual customization included in the quoted price?',
    timestamp: '13:39',
    type: 'text',
    isIncoming: true,
    status: 'read',
  },
  // Additional messages for other conversations
  {
    id: '6',
    conversationId: '2',
    senderId: '1',
    content: 'Received! I opened it and at first glance, I really liked the layout.',
    timestamp: '13:43',
    type: 'text',
    isIncoming: true,
    status: 'delivered',
  },
  {
    id: '7',
    conversationId: '2',
    senderId: '1',
    content: 'I just have a question about integration with our current system.',
    timestamp: '13:44',
    type: 'text',
    isIncoming: true,
    status: 'delivered',
  },
  {
    id: '8',
    conversationId: '3',
    senderId: '8',
    content: 'Hello! How are you?',
    timestamp: '13:40',
    type: 'text',
    isIncoming: true,
    status: 'read',
  },
  {
    id: '9',
    conversationId: '3',
    senderId: 'me',
    content: 'Hi Robert! Everything is great, how about you?',
    timestamp: '13:41',
    type: 'text',
    isIncoming: false,
    status: 'read',
  },
  {
    id: '10',
    conversationId: '3',
    senderId: '8',
    content: 'Hello, would you like to proceed with the project we discussed?',
    timestamp: '13:43',
    type: 'text',
    isIncoming: true,
    status: 'read',
  },
  {
    id: '11',
    conversationId: '4',
    senderId: '9',
    content: 'Team, what time is tomorrow\'s meeting?',
    timestamp: '13:42',
    type: 'text',
    isIncoming: true,
    status: 'read',
  },
  {
    id: '12',
    conversationId: '4',
    senderId: 'me',
    content: 'The meeting is scheduled for 2 PM in the conference room.',
    timestamp: '13:43',
    type: 'text',
    isIncoming: false,
    status: 'read',
  },
  {
    id: '13',
    conversationId: '5',
    senderId: '10',
    content: 'Thank you so much for your attention and excellent service!',
    timestamp: '13:42',
    type: 'text',
    isIncoming: true,
    status: 'read',
  },
  {
    id: '14',
    conversationId: '5',
    senderId: 'me',
    content: 'It was a pleasure helping you! If you have any questions, just reach out.',
    timestamp: '13:42',
    type: 'text',
    isIncoming: false,
    status: 'read',
  },
  {
    id: '15',
    conversationId: '5',
    senderId: '10',
    content: 'I will close our support session here then. See you later!',
    timestamp: '13:43',
    type: 'text',
    isIncoming: true,
    status: 'delivered',
  },
];

// WhatsApp Conversations with Enhanced Monitoring
export const whatsappConversations: WhatsAppConversation[] = [
  {
    id: 'conv-001',
    participantE164s: ['+14155551007', '+14155559999'],
    lastMessage: 'Perfect! Is the visual customization included in the quoted price?',
    lastMessageTimestamp: '2024-02-20T13:39:00Z',
    messageCount: 5,
    monitoredParticipants: ['+14155551007'],
    entityPaths: ['Entity X > Company C2 > Operations Department']
  },
  {
    id: 'conv-002',
    participantE164s: ['+14155551001', '+14155558888'],
    lastMessage: 'Received! I opened it and at first glance, I really liked the layout.',
    lastMessageTimestamp: '2024-02-20T13:43:00Z',
    messageCount: 3,
    monitoredParticipants: ['+14155551001'],
    entityPaths: ['Entity X > Company C1 > Sales Department']
  },
  {
    id: 'conv-003',
    participantE164s: ['+14155551002', '+14155551003'],
    lastMessage: 'Can we schedule the marketing review meeting?',
    lastMessageTimestamp: '2024-02-20T13:45:00Z',
    messageCount: 8,
    monitoredParticipants: ['+14155551002', '+14155551003'],
    entityPaths: ['Entity X > Company C1 > Sales Department', 'Entity X > Company C1 > Marketing Department']
  },
  {
    id: 'conv-004',
    participantE164s: ['+14155551005', '+14155557777'],
    lastMessage: 'The server maintenance is scheduled for tonight.',
    lastMessageTimestamp: '2024-02-20T13:50:00Z',
    messageCount: 12,
    monitoredParticipants: ['+14155551005'],
    entityPaths: ['Entity X > Company C1 > IT Department']
  }
];

// WhatsApp Messages with Enhanced Monitoring
export const whatsappMessages: WhatsAppMessage[] = [
  // Conversation between Jessica Taylor (monitored) and external contact
  {
    id: 'msg-001',
    conversationId: 'conv-001',
    senderE164: '+14155551007',
    receiverE164: '+14155559999',
    content: 'Hi! I wanted to ask you something about the proposal.',
    timestamp: '2024-02-20T13:38:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C2 > Operations Department',
    direction: 'outbound'
  },
  {
    id: 'msg-002',
    conversationId: 'conv-001',
    senderE164: '+14155559999',
    receiverE164: '+14155551007',
    content: 'Sure, what would you like to know?',
    timestamp: '2024-02-20T13:38:30Z',
    type: 'text',
    status: 'read',
    isMonitored: false,
    direction: 'inbound'
  },
  {
    id: 'msg-003',
    conversationId: 'conv-001',
    senderE164: '+14155551007',
    receiverE164: '+14155559999',
    content: 'I just wanted to confirm if this proposal already includes post-implementation support.',
    timestamp: '2024-02-20T13:39:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C2 > Operations Department',
    direction: 'outbound'
  },
  // Internal conversation between two monitored users
  {
    id: 'msg-004',
    conversationId: 'conv-003',
    senderE164: '+14155551002',
    receiverE164: '+14155551003',
    content: 'Hi Emily, do you have time for a quick marketing sync?',
    timestamp: '2024-02-20T13:40:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > Sales Department',
    direction: 'outbound'
  },
  {
    id: 'msg-005',
    conversationId: 'conv-003',
    senderE164: '+14155551003',
    receiverE164: '+14155551002',
    content: 'Of course! I have 15 minutes now if that works.',
    timestamp: '2024-02-20T13:41:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > Marketing Department',
    direction: 'inbound'
  },
  {
    id: 'msg-006',
    conversationId: 'conv-003',
    senderE164: '+14155551002',
    receiverE164: '+14155551003',
    content: 'Perfect! Can we schedule the marketing review meeting for next week?',
    timestamp: '2024-02-20T13:45:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > Sales Department',
    direction: 'outbound'
  },
  // IT Department conversation
  {
    id: 'msg-007',
    conversationId: 'conv-004',
    senderE164: '+14155551005',
    receiverE164: '+14155557777',
    content: 'Hello, I need to inform you about tonight\'s server maintenance.',
    timestamp: '2024-02-20T13:48:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > IT Department',
    direction: 'outbound'
  },
  {
    id: 'msg-008',
    conversationId: 'conv-004',
    senderE164: '+14155557777',
    receiverE164: '+14155551005',
    content: 'What time will it start?',
    timestamp: '2024-02-20T13:49:00Z',
    type: 'text',
    status: 'read',
    isMonitored: false,
    direction: 'inbound'
  },
  {
    id: 'msg-009',
    conversationId: 'conv-004',
    senderE164: '+14155551005',
    receiverE164: '+14155557777',
    content: 'The server maintenance is scheduled for tonight at 11 PM EST.',
    timestamp: '2024-02-20T13:50:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > IT Department',
    direction: 'outbound'
  },
  // Sales team client conversation
  {
    id: 'msg-010',
    conversationId: 'conv-005',
    senderE164: '+14155551002',
    receiverE164: '+14155556666',
    content: 'Good morning! I hope you had a chance to review our proposal for the digital transformation project.',
    timestamp: '2024-02-20T09:15:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > Sales Department',
    direction: 'outbound'
  },
  {
    id: 'msg-011',
    conversationId: 'conv-005',
    senderE164: '+14155556666',
    receiverE164: '+14155551002',
    content: 'Yes, I reviewed it. The scope looks comprehensive, but I have some questions about the timeline.',
    timestamp: '2024-02-20T09:32:00Z',
    type: 'text',
    status: 'read',
    isMonitored: false,
    direction: 'inbound'
  },
  {
    id: 'msg-012',
    conversationId: 'conv-005',
    senderE164: '+14155551002',
    receiverE164: '+14155556666',
    content: 'Of course! We estimated 6 months for full implementation, but we can adjust phases based on your priorities.',
    timestamp: '2024-02-20T09:45:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > Sales Department',
    direction: 'outbound'
  },
  {
    id: 'msg-013',
    conversationId: 'conv-005',
    senderE164: '+14155556666',
    receiverE164: '+14155551002',
    content: 'That sounds reasonable. Can we schedule a call with the technical team to discuss integration details?',
    timestamp: '2024-02-20T10:12:00Z',
    type: 'text',
    status: 'read',
    isMonitored: false,
    direction: 'inbound'
  },
  {
    id: 'msg-014',
    conversationId: 'conv-005',
    senderE164: '+14155551002',
    receiverE164: '+14155556666',
    content: 'Absolutely! I\'ll coordinate with our CTO. Are you available Thursday afternoon?',
    timestamp: '2024-02-20T10:28:00Z',
    type: 'text',
    status: 'delivered',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > Sales Department',
    direction: 'outbound'
  },
  // HR Department internal communication
  {
    id: 'msg-015',
    conversationId: 'conv-006',
    senderE164: '+14155551009',
    receiverE164: '+14155551010',
    content: 'Hi David, can you help me with the new employee onboarding checklist?',
    timestamp: '2024-02-20T11:20:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C2 > Human Resources',
    direction: 'outbound'
  },
  {
    id: 'msg-016',
    conversationId: 'conv-006',
    senderE164: '+14155551010',
    receiverE164: '+14155551009',
    content: 'Sure! I updated it last week. Let me send you the latest version.',
    timestamp: '2024-02-20T11:25:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C2 > Human Resources',
    direction: 'inbound'
  },
  {
    id: 'msg-017',
    conversationId: 'conv-006',
    senderE164: '+14155551010',
    receiverE164: '+14155551009',
    content: 'onboarding_checklist_v2.3.pdf',
    timestamp: '2024-02-20T11:26:00Z',
    type: 'document',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C2 > Human Resources',
    direction: 'inbound'
  },
  // Finance Department budget discussion
  {
    id: 'msg-018',
    conversationId: 'conv-007',
    senderE164: '+14155551011',
    receiverE164: '+14155555555',
    content: 'I need to discuss the Q2 budget allocation for the marketing campaigns.',
    timestamp: '2024-02-20T14:30:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C3 > Finance Department',
    direction: 'outbound'
  },
  {
    id: 'msg-019',
    conversationId: 'conv-007',
    senderE164: '+14155555555',
    receiverE164: '+14155551011',
    content: 'What\'s the current utilization rate? We need to ensure we\'re on track.',
    timestamp: '2024-02-20T14:45:00Z',
    type: 'text',
    status: 'read',
    isMonitored: false,
    direction: 'inbound'
  },
  {
    id: 'msg-020',
    conversationId: 'conv-007',
    senderE164: '+14155551011',
    receiverE164: '+14155555555',
    content: 'We\'re at 78% utilization. I recommend increasing the digital advertising budget by 15%.',
    timestamp: '2024-02-20T15:00:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C3 > Finance Department',
    direction: 'outbound'
  },
  // Operations team urgent issue
  {
    id: 'msg-021',
    conversationId: 'conv-008',
    senderE164: '+14155551007',
    receiverE164: '+14155551008',
    content: 'URGENT: Production server is showing high CPU usage. Can you check immediately?',
    timestamp: '2024-02-20T16:15:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C2 > Operations Department',
    direction: 'outbound'
  },
  {
    id: 'msg-022',
    conversationId: 'conv-008',
    senderE164: '+14155551008',
    receiverE164: '+14155551007',
    content: 'On it! Checking the logs now. Looks like there\'s a memory leak in the payment service.',
    timestamp: '2024-02-20T16:18:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C2 > Operations Department',
    direction: 'inbound'
  },
  {
    id: 'msg-023',
    conversationId: 'conv-008',
    senderE164: '+14155551007',
    receiverE164: '+14155551008',
    content: 'Should we restart the service? We have a backup ready.',
    timestamp: '2024-02-20T16:22:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C2 > Operations Department',
    direction: 'outbound'
  },
  {
    id: 'msg-024',
    conversationId: 'conv-008',
    senderE164: '+14155551008',
    receiverE164: '+14155551007',
    content: 'Yes, let\'s do a rolling restart. I\'ll monitor the metrics.',
    timestamp: '2024-02-20T16:25:00Z',
    type: 'text',
    status: 'delivered',
    isMonitored: true,
    entityPath: 'Entity X > Company C2 > Operations Department',
    direction: 'inbound'
  },
  // Marketing campaign coordination
  {
    id: 'msg-025',
    conversationId: 'conv-009',
    senderE164: '+14155551003',
    receiverE164: '+14155554444',
    content: 'Hi! We\'re launching the new product campaign next week. Can you help with the social media assets?',
    timestamp: '2024-02-20T10:30:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > Marketing Department',
    direction: 'outbound'
  },
  {
    id: 'msg-026',
    conversationId: 'conv-009',
    senderE164: '+14155554444',
    receiverE164: '+14155551003',
    content: 'Absolutely! What\'s the target audience and key messaging?',
    timestamp: '2024-02-20T10:45:00Z',
    type: 'text',
    status: 'read',
    isMonitored: false,
    direction: 'inbound'
  },
  {
    id: 'msg-027',
    conversationId: 'conv-009',
    senderE164: '+14155551003',
    receiverE164: '+14155554444',
    content: 'Target: 25-40 professionals. Key message: "Streamline your workflow with AI-powered automation"',
    timestamp: '2024-02-20T11:00:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > Marketing Department',
    direction: 'outbound'
  },
  {
    id: 'msg-028',
    conversationId: 'conv-009',
    senderE164: '+14155554444',
    receiverE164: '+14155551003',
    content: 'Perfect! I\'ll create mockups for LinkedIn, Twitter, and Instagram. Need them by Friday?',
    timestamp: '2024-02-20T11:15:00Z',
    type: 'text',
    status: 'read',
    isMonitored: false,
    direction: 'inbound'
  },
  {
    id: 'msg-029',
    conversationId: 'conv-009',
    senderE164: '+14155551003',
    receiverE164: '+14155554444',
    content: 'Friday would be perfect! Also, can you include video thumbnails for YouTube ads?',
    timestamp: '2024-02-20T11:30:00Z',
    type: 'text',
    status: 'delivered',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > Marketing Department',
    direction: 'outbound'
  },
  // Legal department contract review
  {
    id: 'msg-030',
    conversationId: 'conv-010',
    senderE164: '+14155551012',
    receiverE164: '+14155553333',
    content: 'Good afternoon. I need your review on the new vendor contract. It\'s quite urgent.',
    timestamp: '2024-02-20T14:00:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C3 > Legal Department',
    direction: 'outbound'
  },
  {
    id: 'msg-031',
    conversationId: 'conv-010',
    senderE164: '+14155553333',
    receiverE164: '+14155551012',
    content: 'I can review it today. What are the main concern areas?',
    timestamp: '2024-02-20T14:15:00Z',
    type: 'text',
    status: 'read',
    isMonitored: false,
    direction: 'inbound'
  },
  {
    id: 'msg-032',
    conversationId: 'conv-010',
    senderE164: '+14155551012',
    receiverE164: '+14155553333',
    content: 'Mainly the liability clauses and data protection terms. The contract value is $2.5M.',
    timestamp: '2024-02-20T14:30:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C3 > Legal Department',
    direction: 'outbound'
  },
  {
    id: 'msg-033',
    conversationId: 'conv-010',
    senderE164: '+14155553333',
    receiverE164: '+14155551012',
    content: 'Understood. I\'ll prioritize this. Can you send me the draft contract?',
    timestamp: '2024-02-20T14:45:00Z',
    type: 'text',
    status: 'read',
    isMonitored: false,
    direction: 'inbound'
  },
  {
    id: 'msg-034',
    conversationId: 'conv-010',
    senderE164: '+14155551012',
    receiverE164: '+14155553333',
    content: 'vendor_contract_draft_v1.2.pdf',
    timestamp: '2024-02-20T14:50:00Z',
    type: 'document',
    status: 'delivered',
    isMonitored: true,
    entityPath: 'Entity X > Company C3 > Legal Department',
    direction: 'outbound'
  },
  // Customer support conversation
  {
    id: 'msg-035',
    conversationId: 'conv-011',
    senderE164: '+14155551004',
    receiverE164: '+14155552222',
    content: 'Hi! Thank you for contacting our support. How can I help you today?',
    timestamp: '2024-02-20T12:00:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > Sales Department',
    direction: 'outbound'
  },
  {
    id: 'msg-036',
    conversationId: 'conv-011',
    senderE164: '+14155552222',
    receiverE164: '+14155551004',
    content: 'I\'m having trouble with the login process. It keeps saying "invalid credentials" even with correct info.',
    timestamp: '2024-02-20T12:05:00Z',
    type: 'text',
    status: 'read',
    isMonitored: false,
    direction: 'inbound'
  },
  {
    id: 'msg-037',
    conversationId: 'conv-011',
    senderE164: '+14155551004',
    receiverE164: '+14155552222',
    content: 'I understand how frustrating that must be. Let me help you troubleshoot. Can you try clearing your browser cache first?',
    timestamp: '2024-02-20T12:08:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > Sales Department',
    direction: 'outbound'
  },
  {
    id: 'msg-038',
    conversationId: 'conv-011',
    senderE164: '+14155552222',
    receiverE164: '+14155551004',
    content: 'I tried that already. Still the same issue.',
    timestamp: '2024-02-20T12:15:00Z',
    type: 'text',
    status: 'read',
    isMonitored: false,
    direction: 'inbound'
  },
  {
    id: 'msg-039',
    conversationId: 'conv-011',
    senderE164: '+14155551004',
    receiverE164: '+14155552222',
    content: 'No problem. Let me reset your password. You should receive an email shortly with instructions.',
    timestamp: '2024-02-20T12:20:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > Sales Department',
    direction: 'outbound'
  },
  {
    id: 'msg-040',
    conversationId: 'conv-011',
    senderE164: '+14155552222',
    receiverE164: '+14155551004',
    content: 'Great! I received the email and was able to log in. Thank you so much!',
    timestamp: '2024-02-20T12:28:00Z',
    type: 'text',
    status: 'delivered',
    isMonitored: false,
    direction: 'inbound'
  },
  // Recent messages with different timestamps (today)
  {
    id: 'msg-041',
    conversationId: 'conv-012',
    senderE164: '+14155551006',
    receiverE164: '+14155551013',
    content: 'Morning team! Ready for today\'s sprint planning?',
    timestamp: '2024-02-21T09:00:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > IT Department',
    direction: 'outbound'
  },
  {
    id: 'msg-042',
    conversationId: 'conv-012',
    senderE164: '+14155551013',
    receiverE164: '+14155551006',
    content: 'Absolutely! I\'ve prepared the user stories for the new authentication module.',
    timestamp: '2024-02-21T09:05:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > IT Department',
    direction: 'inbound'
  },
  {
    id: 'msg-043',
    conversationId: 'conv-012',
    senderE164: '+14155551006',
    receiverE164: '+14155551013',
    content: 'Perfect! How many story points are we looking at?',
    timestamp: '2024-02-21T09:10:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > IT Department',
    direction: 'outbound'
  },
  {
    id: 'msg-044',
    conversationId: 'conv-012',
    senderE164: '+14155551013',
    receiverE164: '+14155551006',
    content: 'I estimate about 34 story points for the full module. We can break it into 3 sprints.',
    timestamp: '2024-02-21T09:15:00Z',
    type: 'text',
    status: 'delivered',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > IT Department',
    direction: 'inbound'
  },
  // Image and media messages
  {
    id: 'msg-045',
    conversationId: 'conv-013',
    senderE164: '+14155551003',
    receiverE164: '+14155551002',
    content: 'Check out these campaign mockups!',
    timestamp: '2024-02-21T10:30:00Z',
    type: 'image',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > Marketing Department',
    direction: 'outbound'
  },
  {
    id: 'msg-046',
    conversationId: 'conv-013',
    senderE164: '+14155551002',
    receiverE164: '+14155551003',
    content: 'These look amazing! I especially love the color scheme in the third one.',
    timestamp: '2024-02-21T10:35:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > Sales Department',
    direction: 'inbound'
  },
  {
    id: 'msg-047',
    conversationId: 'conv-013',
    senderE164: '+14155551003',
    receiverE164: '+14155551002',
    content: 'Thanks! Should we go with that one for the main campaign?',
    timestamp: '2024-02-21T10:40:00Z',
    type: 'text',
    status: 'delivered',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > Marketing Department',
    direction: 'outbound'
  },
  // Audio message example
  {
    id: 'msg-048',
    conversationId: 'conv-014',
    senderE164: '+14155551005',
    receiverE164: '+14155551006',
    content: 'Voice message about server configuration',
    timestamp: '2024-02-21T11:00:00Z',
    type: 'audio',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > IT Department',
    direction: 'outbound'
  },
  {
    id: 'msg-049',
    conversationId: 'conv-014',
    senderE164: '+14155551006',
    receiverE164: '+14155551005',
    content: 'Got it! I\'ll implement those changes after the maintenance window.',
    timestamp: '2024-02-21T11:05:00Z',
    type: 'text',
    status: 'delivered',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > IT Department',
    direction: 'inbound'
  },
  // External client communication
  {
    id: 'msg-050',
    conversationId: 'conv-015',
    senderE164: '+14155551001',
    receiverE164: '+14155558888',
    content: 'Hi Sarah! Following up on our meeting yesterday. Do you have any questions about the implementation timeline?',
    timestamp: '2024-02-21T14:00:00Z',
    type: 'text',
    status: 'read',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > Sales Department',
    direction: 'outbound'
  },
  {
    id: 'msg-051',
    conversationId: 'conv-015',
    senderE164: '+14155558888',
    receiverE164: '+14155551001',
    content: 'Hi John! Yes, I wanted to clarify the training schedule for our team.',
    timestamp: '2024-02-21T14:15:00Z',
    type: 'text',
    status: 'read',
    isMonitored: false,
    direction: 'inbound'
  },
  {
    id: 'msg-052',
    conversationId: 'conv-015',
    senderE164: '+14155551001',
    receiverE164: '+14155558888',
    content: 'Of course! We can schedule the training sessions in weeks 2-3 of implementation. Each session will be 2 hours.',
    timestamp: '2024-02-21T14:30:00Z',
    type: 'text',
    status: 'sent',
    isMonitored: true,
    entityPath: 'Entity X > Company C1 > Sales Department',
    direction: 'outbound'
  }
];

// Filter Options for WhatsApp Monitoring
export interface FilterOptions {
  entityUserNumber?: string;
  entityPath?: string;
  e164Number?: string;
  timeRange?: {
    type: 'last_hours' | 'last_days' | 'date_range';
    value?: number;
    startDate?: string;
    endDate?: string;
  };
  messageType?: 'text' | 'image' | 'file' | 'audio' | 'video' | 'document' | 'all';
  direction?: 'inbound' | 'outbound' | 'both';
  registrationStatus?: 'registered' | 'pending' | 'cancelled' | 'invited' | 'all';
}

// Helper Functions for Entity Management
export const getEntityHierarchy = (entityId: string): ElasticEntity[] => {
  const hierarchy: ElasticEntity[] = [];
  let currentEntity = elasticEntities.find(e => e.id === entityId);
  
  while (currentEntity) {
    hierarchy.unshift(currentEntity);
    if (currentEntity.parentId) {
      currentEntity = elasticEntities.find(e => e.id === currentEntity!.parentId);
    } else {
      break;
    }
  }
  
  return hierarchy;
};

export const getUsersByEntityPath = (entityPath: string): E164User[] => {
  return e164Users.filter(user => user.entityPath.includes(entityPath));
};

export const getRegistrationStats = () => {
  const stats = {
    registered: e164Users.filter(u => u.registrationStatus === 'registered').length,
    pending: e164Users.filter(u => u.registrationStatus === 'pending').length,
    invited: e164Users.filter(u => u.registrationStatus === 'invited').length,
    cancelled: e164Users.filter(u => u.registrationStatus === 'cancelled').length,
    total: e164Users.length
  };
  
  return stats;
};

export const getMonitoredMessagesCount = (filters: FilterOptions = {}): number => {
  let messages = whatsappMessages.filter(msg => msg.isMonitored);
  
  if (filters.entityPath) {
    messages = messages.filter(msg => 
      msg.entityPath && msg.entityPath.includes(filters.entityPath!)
    );
  }
  
  if (filters.e164Number) {
    messages = messages.filter(msg => 
      msg.senderE164 === filters.e164Number || msg.receiverE164 === filters.e164Number
    );
  }
  
  if (filters.direction && filters.direction !== 'both') {
    messages = messages.filter(msg => msg.direction === filters.direction);
  }
  
  return messages.length;
};
