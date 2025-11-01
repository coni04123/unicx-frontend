'use client';

import React from 'react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  suffix?: string;
  loading?: boolean;
}

export default function MetricCard({
  title,
  value,
  change,
  icon: IconComponent,
  iconColor = 'bg-primary-500',
  suffix,
  loading = false,
}: MetricCardProps) {
  const getChangeColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return 'text-success-600';
      case 'decrease':
        return 'text-error-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getChangeIcon = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return <ArrowUpIcon className="h-3 w-3" />;
      case 'decrease':
        return <ArrowDownIcon className="h-3 w-3" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${iconColor} animate-pulse`}>
              <div className="h-6 w-6 bg-white bg-opacity-30 rounded"></div>
            </div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded animate-pulse"></div>
              <div className="h-8 bg-muted rounded animate-pulse w-20"></div>
              <div className="h-3 bg-muted rounded animate-pulse w-24"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${iconColor} text-white`}>
            <IconComponent className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-foreground">
                {value}
                {suffix && <span className="text-lg font-normal text-muted-foreground ml-1">{suffix}</span>}
              </p>
              {change && change.value !== 0 && (
                <Badge 
                  variant={change.type === 'increase' ? 'default' : change.type === 'decrease' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  <div className="flex items-center space-x-1">
                    {getChangeIcon(change.type)}
                    <span>{Math.abs(change.value)}</span>
                  </div>
                </Badge>
              )}
            </div>
            {change && (
              <p className="text-xs text-muted-foreground mt-1">
                {change.period}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
