'use client';

import React from 'react';
import {
  UserIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  MegaphoneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { AuditLog } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ActivityItem {
  id: string;
  type: 'user_action' | 'campaign_update' | 'alert' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface RecentActivityProps {
  auditLogs: any[];
  maxDisplay?: number;
}

export default function RecentActivity({ auditLogs, maxDisplay = 10 }: RecentActivityProps) {
  // Convert audit logs to activity items
const convertAuditLogToActivity = (log: any): ActivityItem => {
    // Add safety checks for the log object
    if (!log || typeof log !== 'object') {
      return {
        id: 'unknown',
        type: 'user_action',
        title: 'Unknown Activity',
        description: 'Activity data is unavailable',
        timestamp: new Date(),
        user: 'System',
        status: 'info',
      };
    }

    const getActivityType = (action: string, resource: string) => {
      if (action === 'login' || action === 'logout') return 'system';
      if (action === 'create' || action === 'update' || action === 'delete') return 'user_action';
      if (resource === 'campaign' || resource === 'message') return 'campaign_update';
      return 'user_action';
    };

    const getStatus = (action: string) => {
      switch (action) {
        case 'create':
        case 'login':
          return 'success';
        case 'delete':
        case 'logout':
          return 'warning';
        case 'update':
          return 'info';
        default:
          return 'info';
      }
    };

    const getTitle = (action: string, resource: string) => {
      const actionText = action ? action.charAt(0).toUpperCase() + action.slice(1) : 'Unknown';
      const resourceText = resource ? resource.charAt(0).toUpperCase() + resource.slice(1) : 'Resource';
      return `${actionText} ${resourceText}`;
    };

    const getDescription = (action: string, resource: string, metadata: any) => {
      if (metadata?.details) return metadata.details;
      const actionStr = action || 'Unknown';
      const resourceStr = resource || 'resource';
      return `${actionStr} operation performed on ${resourceStr}`;
    };

    return {
      id: log.id || 'unknown',
      type: getActivityType(log.action, log.resource),
      title: getTitle(log.action, log.resource),
      description: getDescription(log.action, log.resource, log.metadata),
      timestamp: new Date(log.timestamp || Date.now()),
      user: log.userEmail || log.user || 'System',
      status: getStatus(log.action),
    };
  };

  const activities: ActivityItem[] = Array.isArray(auditLogs) 
    ? auditLogs.slice(0, maxDisplay).map((log) => {
        try {
          return convertAuditLogToActivity(log);
        } catch (error) {
          console.error('Error converting audit log to activity:', error, log);
          return {
            id: 'error',
            type: 'user_action',
            title: 'Error Processing Activity',
            description: 'Failed to process activity data',
            timestamp: new Date(),
            user: 'System',
            status: 'error',
          };
        }
      })
    : [];

  // Don't add mock activities - show empty state instead
  // if (activities.length === 0) {
  //   activities.push(...mockup activities);
  // }

  // Sort activities by timestamp (most recent first)
  const sortedActivities = activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxDisplay);

  const getActivityIcon = (type: ActivityItem['type'], status?: ActivityItem['status']) => {
    switch (type) {
      case 'user_action':
        return <UserIcon className="h-5 w-5" />;
      case 'campaign_update':
        return <MegaphoneIcon className="h-5 w-5" />;
      case 'alert':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'system':
        return status === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ChatBubbleLeftRightIcon className="h-5 w-5" />;
      default:
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
    }
  };

  const getActivityVariant = (status?: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return 'default' as const;
      case 'warning':
        return 'secondary' as const;
      case 'error':
        return 'destructive' as const;
      case 'info':
      default:
        return 'outline' as const;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest system and user activities
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {sortedActivities.length === 0 ? (
          <div className="p-6 text-center">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">No Recent Activity</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Activity will appear here when actions are performed.
            </p>
          </div>
        ) : (
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {sortedActivities.map((activity, index) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index !== sortedActivities.length - 1 && (
                      <span
                        className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-border"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex items-start space-x-3 px-6 py-3 hover:bg-muted/50 transition-colors duration-150">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-background bg-muted text-muted-foreground">
                          {getActivityIcon(activity.type, activity.status)}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <div className="font-medium text-foreground">
                              {activity.title}
                            </div>
                            <p className="mt-1 text-muted-foreground">
                              {activity.description}
                            </p>
                          </div>
                          {activity.status && (
                            <Badge variant={getActivityVariant(activity.status)} className="text-xs">
                              {activity.status}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 flex items-center text-xs text-muted-foreground space-x-2">
                          <span>{formatTimeAgo(activity.timestamp)}</span>
                          {activity.user && (
                            <>
                              <span>•</span>
                              <span>by {activity.user}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
