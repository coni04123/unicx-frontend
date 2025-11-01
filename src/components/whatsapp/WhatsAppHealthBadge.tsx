'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Tooltip } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
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

interface WhatsAppHealthBadgeProps {
  healthStatus?: WhatsAppHealthStatus;
  onTriggerCheck?: () => void;
  isLoading?: boolean;
  canTriggerCheck?: boolean;
}

export default function WhatsAppHealthBadge({
  healthStatus,
  onTriggerCheck,
  isLoading,
  canTriggerCheck = false,
}: WhatsAppHealthBadgeProps) {
  const t = useTranslation('whatsapp');

  if (!healthStatus) {
    return (
      <Badge variant="outline" className="text-xs">
        <ShieldExclamationIcon className="h-3.5 w-3.5 mr-1" />
        {t('health.noData')}
      </Badge>
    );
  }

  const getStatusColor = (): 'default' | 'destructive' | 'secondary' | 'outline' => {
    if (healthStatus.alertTriggered) return 'destructive';
    if (healthStatus.lastStatus === 'failed') return 'destructive';
    if (healthStatus.lastStatus === 'warning') return 'secondary';
    return 'default';
  };

  const getStatusIcon = () => {
    if (healthStatus.alertTriggered) {
      return <ExclamationTriangleIcon className="h-3.5 w-3.5 mr-1" />;
    }
    if (healthStatus.lastStatus === 'failed') {
      return <ShieldExclamationIcon className="h-3.5 w-3.5 mr-1" />;
    }
    if (healthStatus.lastStatus === 'warning') {
      return <ShieldExclamationIcon className="h-3.5 w-3.5 mr-1" />;
    }
    return <ShieldCheckIcon className="h-3.5 w-3.5 mr-1" />;
  };

  const getStatusText = () => {
    if (healthStatus.alertTriggered) {
      return t('health.blocked');
    }
    if (healthStatus.consecutiveFailures > 0) {
      return t('health.failureCount');
    }
    return t('health.healthy');
  };

  const getTooltipContent = () => {
    const lastCheckDate = new Date(healthStatus.lastCheck).toLocaleString();
    const nextCheckDate = new Date(new Date(healthStatus.lastCheck).getTime() + 5 * 60 * 1000).toLocaleString();

    return (
      <div className="space-y-1 text-xs">
        <p>{t('health.lastCheck')}: {lastCheckDate}</p>
        <p>{t('health.nextCheck')}: {nextCheckDate}</p>
        <p>{t('health.successRate')}: {healthStatus.successRate}%</p>
        {healthStatus.consecutiveFailures > 0 && (
          <p className="text-red-500">
            {t('health.consecutiveFailures')}: {healthStatus.consecutiveFailures}
          </p>
        )}
        {healthStatus.alertTriggered && (
          <p className="text-red-500 font-semibold">
            {t('health.alertTriggered')}
          </p>
        )}
        {canTriggerCheck && (
          <p className="text-gray-400 italic">
            {t('health.clickToCheck')}
          </p>
        )}
      </div>
    );
  };

  const handleClick = () => {
    if (canTriggerCheck && onTriggerCheck && !isLoading) {
      onTriggerCheck();
    }
  };

  return (
    <Tooltip content={getTooltipContent()}>
      <Badge
        variant={getStatusColor()}
        className={`text-xs cursor-${canTriggerCheck ? 'pointer' : 'default'} ${isLoading ? 'opacity-50' : ''}`}
        onClick={handleClick}
      >
        {isLoading ? (
          <BoltIcon className="h-3.5 w-3.5 mr-1 animate-pulse" />
        ) : (
          getStatusIcon()
        )}
        {getStatusText()}
      </Badge>
    </Tooltip>
  );
}
