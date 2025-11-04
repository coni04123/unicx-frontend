'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import WelcomeBanner from '@/components/onboarding/WelcomeBanner';
import MetricCard from '@/components/dashboard/MetricCard';
// import AlertCard from '@/components/dashboard/AlertCard';
// import RecentActivity from '@/components/dashboard/RecentActivity';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { PermissionGate } from '@/components/PermissionGate';
// import { usePermissions } from '@/hooks/usePermissions';
import { api } from '@/lib/api';
import {
  // ChatBubbleLeftRightIcon,
  // EyeIcon,
  EnvelopeIcon,
  // MegaphoneIcon,
  BuildingOfficeIcon,
  UsersIcon,
  // ExclamationTriangleIcon,
  // ChartBarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  currentTenant,
} from '@/data/mockData';

export default function Dashboard() {
  const t = useTranslation('dashboard');
  const tCommon = useTranslation('common');
  // const { shouldShowOnboarding, completeOnboarding, skipOnboarding, resetOnboarding } = useOnboarding();
  // const { roleInfo, canViewAdvancedMetrics } = usePermissions();
  const [metrics, setMetrics] = useState<any>(null);
  // const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Load dashboard metrics and recent activity in parallel
      const [dashboardResponse, activityResponse] = await Promise.all([
        api.getDashboardStats(),
        api.getRecentActivity(10)
      ]);
      
      // Extract data from the response wrappers
      const dashboardData = (dashboardResponse as any).data || dashboardResponse;
      const activityData = (activityResponse as any).data || activityResponse;
      
      // Ensure the data structure is correct
      if (dashboardData && typeof dashboardData === 'object' && 'success' in dashboardData) {
        setMetrics(dashboardData.data);
      } else {
        setMetrics(dashboardData);
      }
      
      // if (activityData && typeof activityData === 'object' && 'success' in activityData) {
      //   setRecentActivity(activityData.data);
      // } else {
      //   setRecentActivity(activityData);
      // }
    } catch (err: any) {
      console.error('Error loading dashboard stats:', err);
      setError(err.message || tCommon('failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Onboarding Flow */}
      {/* {shouldShowOnboarding && (
        <OnboardingFlow
          onClose={skipOnboarding}
          onComplete={completeOnboarding}
        />
      )} */}
      
      <div className="space-y-6">
        {/* Welcome Banner for users who haven't completed onboarding */}
        <WelcomeBanner />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          </div>
        </div>

        {/* Main Metrics */}
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <ArrowPathIcon className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        ) : metrics && metrics.entities && metrics.messages && metrics.users ? (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                title={t('metrics.totalEntities')}
                value={metrics.entities.total}
                change={metrics.entities.change}
                icon={BuildingOfficeIcon}
                iconColor="bg-primary-500"
              />
              <MetricCard
                title={t('metrics.whatsappMessages') + " (24h)"}
                value={metrics.messages.sent24h.toLocaleString()}
                change={metrics.messages.change}
                icon={EnvelopeIcon}
                iconColor="bg-green-500"
              />
              <MetricCard
                title={t('metrics.monitoredUsers')}
                value={metrics.users.monitored.toString()}
                change={metrics.users.change}
                icon={UsersIcon}
                iconColor="bg-blue-500"
              />
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* Entity Overview */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">{t('metrics.entityOverview')}</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('metrics.entities')}</span>
                      <span className="text-sm font-medium text-gray-900">{metrics.entities.entities}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('metrics.companies')}</span>
                      <span className="text-sm font-medium text-gray-900">{metrics.entities.companies}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('metrics.departments')}</span>
                      <span className="text-sm font-medium text-gray-900">{metrics.entities.departments}</span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3">
                      <span className="text-sm font-medium text-gray-900">{t('metrics.totalEntities')}</span>
                      <span className="text-sm font-bold text-primary-600">{metrics.entities.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Communication Overview */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">{t('metrics.communicationOverview')}</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('metrics.messages24h')}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {metrics.messages.sent24h.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('metrics.monitored')}</span>
                      <span className="text-sm font-medium text-green-600">
                        {metrics.messages.inbound.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('metrics.external')}</span>
                      <span className="text-sm font-medium text-orange-600">
                        {metrics.messages.outbound.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3">
                      <span className="text-sm font-medium text-gray-900">{t('metrics.totalMessages')}</span>
                      <span className="text-sm font-bold text-primary-600">{metrics.messages.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : metrics ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
            {t('incomplete')}
          </div>
        ) : null}

        {/* Alerts and Activity */}
        {/* <RecentActivity auditLogs={recentActivity} /> */}
      </div>
    </DashboardLayout>
  );
}
