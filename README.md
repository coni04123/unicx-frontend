# 2N5 - WhatsApp Business Management Platform

A comprehensive Next.js application for managing WhatsApp Business accounts, spy numbers, and messaging campaigns with multi-tenant support.

## 🚀 Features

### ✅ Completed Features

- **Dashboard** - Overview with metrics, alerts, and quick actions
- **WhatsApp Accounts** - Account management with health monitoring
- **Spy Numbers** - Group surveillance and configuration
- **Entity Management** - Hierarchical entity structure with unlimited nesting
- **Campaigns** - Messaging campaign management and monitoring
- **Monitoring** - System health, performance metrics, and alerts
- **Administration** - User management, roles, permissions, and audit logs
- **Multi-tenant** - Tenant switching and isolated data views
- **Internationalization** - Ready for multiple languages (English implemented)

### 🎨 Design Features

- **Green-focused light theme** as requested
- **Modern UI** with Tailwind CSS
- **Responsive design** for all screen sizes
- **Accessible components** with proper ARIA labels
- **Professional charts and metrics** with real-time updates

### 🗃️ Data Structure

Comprehensive mockup data includes:
- 4 WhatsApp accounts with health status
- 3 spy numbers with group monitoring
- Hierarchical entities (customers, companies, groups)
- 3 campaigns with realistic progress tracking
- Multiple users with different roles
- Audit logs and system alerts
- Performance metrics and monitoring data

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd D:\Projects\2N5\2n5-mockup
   ```

2. **Install dependencies**:
   ```bash
   # If using PowerShell, you may need to change execution policy first:
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   
   # Then install dependencies:
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## 📱 Application Structure

### Main Pages

1. **Dashboard** (`/`) - System overview with key metrics
2. **WhatsApp Accounts** (`/whatsapp-accounts`) - Account management
3. **Spy Numbers** (`/spy-numbers`) - Surveillance configuration
4. **Entities** (`/entities`) - Hierarchical entity management
5. **Messages** (`/messages`) - WhatsApp message monitoring
6. **Administration** (`/administration`) - User and role management

### Key Components

- **DashboardLayout** - Main application wrapper
- **Header** - Navigation with tenant switcher and notifications
- **Sidebar** - Main navigation menu
- **MetricCard** - Reusable metrics display
- **AlertCard** - System alerts and notifications

## 🌍 Multi-tenant Features

- **Tenant Switching** in the header dropdown
- **Data Isolation** - All data filtered by tenant ID
- **Usage Metrics** - Tenant-specific limits and usage tracking
- **Subscription Plans** - Different service tiers

## 🎯 Key Functionalities Demonstrated

### WhatsApp Account Management
- Health check monitoring
- Account status tracking (active, blocked, suspended)
- Message volume statistics
- Business vs Messenger account types

### Spy Number Surveillance
- Group monitoring capabilities
- Alert configurations (missing from group, inactivity)
- Message interception tracking
- Real-time activity status

### Entity Hierarchy
- Unlimited nesting levels
- Tree view with expand/collapse
- Entity types: customers, companies, groups, sub-groups
- Identifier support (E164, CPF, CNPJ, custom)
- Parent-child relationships

### Message Management
- WhatsApp message monitoring and filtering
- Entity-based message organization
- Real-time message tracking
- Advanced search and filtering capabilities

### System Administration
- System health indicators
- Performance charts and metrics
- Resource usage monitoring (CPU, memory, disk)
- Alert management with severity levels
- WhatsApp service-specific metrics

### Administration
- User management with roles and permissions
- Role-based access control (RBAC)
- Audit log tracking
- System settings configuration

## 🛡️ Security Features

- **JWT Authentication** (simulated)
- **Role-based permissions** 
- **Audit logging** for all actions
- **Data encryption** indicators
- **Multi-tenant isolation**

## 🌐 Internationalization

- **next-intl** integration
- **English** language implemented
- **Ready for additional languages**: Spanish, French, Portuguese, Arabic
- **Translation files** in `/messages/` directory

## 🎨 Design System

### Color Palette
- **Primary Green**: #22c55e (Tailwind green-500)
- **Accent Green**: #10b981 (Tailwind emerald-500) 
- **Secondary Gray**: #64748b (Tailwind slate-500)
- **Success/Warning/Error** color variants

### Component Library
- Custom CSS classes in `globals.css`
- Tailwind utility classes
- Reusable button variants
- Card components
- Badge and status indicators
- Form elements with consistent styling

## 📊 Mock Data

All data is comprehensive and realistic:
- **Real business scenarios** represented
- **Proper relationships** between entities
- **Realistic metrics** and statistics
- **Time-based data** with proper timestamps
- **Multi-tenant data** structure

## 🚀 Production Readiness

The application demonstrates:
- **Scalable architecture** with component separation
- **Type safety** with TypeScript throughout
- **Performance optimization** with Next.js features
- **SEO-friendly** structure
- **Error handling** patterns
- **Loading states** and user feedback
- **Responsive design** for all devices

## 🔧 Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable components
│   ├── dashboard/       # Dashboard-specific components
│   └── layout/          # Layout components
├── data/                # Mock data
├── types/               # TypeScript type definitions
└── i18n.ts             # Internationalization config

messages/                # Translation files
├── en.json             # English translations
└── [locale].json       # Additional language files
```

This application provides a complete demonstration of a modern WhatsApp business management platform with all the requested features implemented using Next.js, TypeScript, and a beautiful green-focused design.
