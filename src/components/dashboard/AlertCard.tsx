'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Alert } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AlertCardProps {
  alerts: Alert[];
  maxDisplay?: number;
}

export default function AlertCard({ alerts, maxDisplay = 5 }: AlertCardProps) {
  const t = useTranslation('alerts');
  
  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircleIcon className="h-5 w-5 text-error-500" />;
      case 'high':
        return <ExclamationTriangleIcon className="h-5 w-5 text-warning-500" />;
      case 'medium':
        return <ExclamationTriangleIcon className="h-5 w-5 text-warning-400" />;
      case 'low':
        return <InformationCircleIcon className="h-5 w-5 text-info-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getSeverityVariant = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'destructive' as const;
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'secondary' as const;
      case 'low':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getStatusBadge = (status: Alert['status']) => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive">{t('open')}</Badge>;
      case 'acknowledged':
        return <Badge variant="secondary">{t('acknowledged')}</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-success-500">{t('resolved')}</Badge>;
      default:
        return null;
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
    return `${diffInDays}d ago`;
  };

  const openAlerts = alerts.filter(alert => alert.status === 'open');
  const displayAlerts = openAlerts.slice(0, maxDisplay);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Active Alerts</CardTitle>
            <CardDescription>
              {openAlerts.length} total alerts
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {openAlerts.filter(a => a.severity === 'critical').length > 0 && (
              <Badge variant="destructive">
                {openAlerts.filter(a => a.severity === 'critical').length} Critical
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {displayAlerts.length === 0 ? (
          <div className="p-6 text-center">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-success-500" />
            <h3 className="mt-2 text-sm font-medium text-foreground">No Active Alerts</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              All systems are operating normally.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {displayAlerts.map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground truncate">
                        {alert.title}
                      </p>
                      <div className="ml-2 flex-shrink-0">
                        {getStatusBadge(alert.status)}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {alert.description}
                    </p>
                    <div className="mt-2 flex items-center text-xs text-muted-foreground space-x-2">
                      <Badge variant={getSeverityVariant(alert.severity)} className="text-xs">
                        {alert.severity}
                      </Badge>
                      <span className="capitalize">{alert.resourceType.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(alert.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {openAlerts.length > maxDisplay && (
          <div className="px-4 py-3 bg-muted/50 text-center border-t border-border">
            <Button variant="ghost" size="sm" asChild>
              <a href="/messages">
                View all {openAlerts.length} alerts
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
