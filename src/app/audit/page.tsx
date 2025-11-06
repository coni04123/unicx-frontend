'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  GlobeAltIcon,
  UserIcon,
  DocumentTextIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface AuditLog {
  _id: string;
  method: string;
  url: string;
  path: string;
  queryParams?: Record<string, any> | null;
  requestBody?: Record<string, any> | null;
  requestHeaders?: Record<string, any> | null;
  statusCode: number;
  responseBody?: Record<string, any> | null;
  responseHeaders?: Record<string, any> | null;
  userId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  tenantId?: {
    _id: string;
    name: string;
  } | null;
  userEmail?: string;
  userRole?: string;
  ipAddress: string;
  userAgent?: string;
  status: 'success' | 'error' | 'failed';
  errorMessage?: string;
  errorStack?: string;
  duration: number;
  createdAt: string;
}

export default function AuditLogPage() {
  const { user: currentUser } = useAuth();
  
  // State
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    userId: '',
    tenantId: '',
    method: '',
    path: '',
    statusCode: '',
    status: '',
    ipAddress: '',
    startDate: '',
    endDate: '',
    search: '',
  });
  
  // Expanded log details
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  // Load logs when filters or pagination changes
  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, filters]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      setError('');

      const filterParams: any = {
        page: currentPage,
        limit: pageSize,
      };

      // Add filters - only include non-empty values
      if (filters.userId && filters.userId.trim()) filterParams.userId = filters.userId.trim();
      if (filters.tenantId && filters.tenantId.trim()) filterParams.tenantId = filters.tenantId.trim();
      if (filters.method && filters.method.trim()) filterParams.method = filters.method.trim();
      if (filters.path && filters.path.trim()) filterParams.path = filters.path.trim();
      if (filters.statusCode && filters.statusCode.trim()) {
        const statusCodeNum = parseInt(filters.statusCode.trim(), 10);
        if (!isNaN(statusCodeNum)) filterParams.statusCode = statusCodeNum;
      }
      if (filters.status && filters.status.trim()) filterParams.status = filters.status.trim();
      if (filters.ipAddress && filters.ipAddress.trim()) filterParams.ipAddress = filters.ipAddress.trim();
      if (filters.startDate && filters.startDate.trim()) filterParams.startDate = filters.startDate.trim();
      if (filters.endDate && filters.endDate.trim()) filterParams.endDate = filters.endDate.trim();
      if (filters.search && filters.search.trim()) filterParams.search = filters.search.trim();

      const data = await api.getAuditLogs(filterParams);
      setLogs(data.logs);
      setTotalLogs(data.total);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
    } catch (err: any) {
      console.error('Error loading audit logs:', err);
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      userId: '',
      tenantId: '',
      method: '',
      path: '',
      statusCode: '',
      status: '',
      ipAddress: '',
      startDate: '',
      endDate: '',
      search: '',
    });
    setCurrentPage(1);
  };

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    const statusMap: Record<string, { classes: string; label: string }> = {
      'success': { classes: 'bg-green-100 text-green-800', label: 'Success' },
      'error': { classes: 'bg-yellow-100 text-yellow-800', label: 'Error' },
      'failed': { classes: 'bg-red-100 text-red-800', label: 'Failed' },
    };
    
    const statusInfo = statusMap[status] || { classes: 'bg-gray-100 text-gray-800', label: status };
    return { classes: `${baseClasses} ${statusInfo.classes}`, label: statusInfo.label };
  };

  const getMethodBadge = (method: string) => {
    const baseClasses = "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold";
    const methodMap: Record<string, { classes: string }> = {
      'GET': { classes: 'bg-blue-100 text-blue-800' },
      'POST': { classes: 'bg-green-100 text-green-800' },
      'PUT': { classes: 'bg-yellow-100 text-yellow-800' },
      'PATCH': { classes: 'bg-orange-100 text-orange-800' },
      'DELETE': { classes: 'bg-red-100 text-red-800' },
    };
    
    const methodInfo = methodMap[method] || { classes: 'bg-gray-100 text-gray-800' };
    return `${baseClasses} ${methodInfo.classes}`;
  };

  const getStatusCodeBadge = (statusCode: number) => {
    const baseClasses = "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold";
    if (statusCode >= 200 && statusCode < 300) {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else if (statusCode >= 300 && statusCode < 400) {
      return `${baseClasses} bg-blue-100 text-blue-800`;
    } else if (statusCode >= 400 && statusCode < 500) {
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    } else {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Audit Logs</h1>
            <p className="mt-2 text-sm text-gray-700">
              Monitor and track all API requests and responses
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
                showFilters || hasActiveFilters
                  ? 'bg-primary-100 text-primary-700 border border-primary-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-500 text-white text-xs">
                  {Object.values(filters).filter(v => v !== '').length}
                </span>
              )}
            </button>
            <button
              onClick={loadLogs}
              className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm transition-all"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filter Audit Logs</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                >
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Clear All
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <MagnifyingGlassIcon className="w-4 h-4 inline mr-1" />
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search across URL, path, email, IP address, or error messages..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  HTTP Method
                </label>
                <select
                  value={filters.method}
                  onChange={(e) => handleFilterChange('method', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="">All Methods</option>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Status Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status Code
                </label>
                <input
                  type="number"
                  value={filters.statusCode}
                  onChange={(e) => handleFilterChange('statusCode', e.target.value)}
                  placeholder="e.g., 200, 404, 500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Path */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Path
                </label>
                <input
                  type="text"
                  value={filters.path}
                  onChange={(e) => handleFilterChange('path', e.target.value)}
                  placeholder="Filter by API path..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>

              {/* IP Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <GlobeAltIcon className="w-4 h-4 inline mr-1" />
                  IP Address
                </label>
                <input
                  type="text"
                  value={filters.ipAddress}
                  onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
                  placeholder="Filter by IP address..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>

              {/* User ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <UserIcon className="w-4 h-4 inline mr-1" />
                  User ID
                </label>
                <input
                  type="text"
                  value={filters.userId}
                  onChange={(e) => handleFilterChange('userId', e.target.value)}
                  placeholder="Filter by user ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <ClockIcon className="w-4 h-4 inline mr-1" />
                  Start Date
                </label>
                <input
                  type="datetime-local"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <ClockIcon className="w-4 h-4 inline mr-1" />
                  End Date
                </label>
                <input
                  type="datetime-local"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Audit Logs</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Showing {logs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
                  {Math.min(currentPage * pageSize, totalLogs)} of {totalLogs} logs
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="px-6 py-12 text-center">
              <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto mb-2 text-primary-600" />
              <p className="text-gray-500">Loading audit logs...</p>
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No audit logs found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Path
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => {
                      const isExpanded = expandedLogs.has(log._id);
                      const statusBadge = getStatusBadge(log.status);
                      
                      return (
                        <React.Fragment key={log._id}>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={getMethodBadge(log.method)}>
                                {log.method}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 font-mono max-w-md truncate" title={log.path}>
                                {log.path}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <span className={statusBadge.classes}>
                                  {statusBadge.label}
                                </span>
                                <span className={getStatusCodeBadge(log.statusCode)}>
                                  {log.statusCode}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {log.userId ? (
                                <div className="text-sm">
                                  <div className="text-gray-900">
                                    {log.userId.firstName} {log.userId.lastName}
                                  </div>
                                  <div className="text-gray-500 text-xs">
                                    {log.userId.email}
                                  </div>
                                </div>
                              ) : log.userEmail ? (
                                <div className="text-sm text-gray-900">{log.userEmail}</div>
                              ) : (
                                <span className="text-sm text-gray-400">Anonymous</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                              {log.ipAddress}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDuration(log.duration)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => toggleLogExpansion(log._id)}
                                className="text-primary-600 hover:text-primary-800 flex items-center"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUpIcon className="w-4 h-4 mr-1" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <ChevronDownIcon className="w-4 h-4 mr-1" />
                                    Show
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={8} className="px-6 py-4 bg-gray-50">
                                <div className="space-y-4">
                                  {/* Request Details */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Request Details</h4>
                                    <div className="bg-white rounded-lg p-4 space-y-2 text-xs font-mono">
                                      <div><strong>URL:</strong> {log.url}</div>
                                      {log.queryParams && Object.keys(log.queryParams).length > 0 && (
                                        <div>
                                          <strong>Query Params:</strong>
                                          <pre className="mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                                            {JSON.stringify(log.queryParams, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                      {log.requestBody && Object.keys(log.requestBody).length > 0 && (
                                        <div>
                                          <strong>Request Body:</strong>
                                          <pre className="mt-1 bg-gray-50 p-2 rounded overflow-x-auto max-h-40">
                                            {JSON.stringify(log.requestBody, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Response Details */}
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Response Details</h4>
                                    <div className="bg-white rounded-lg p-4 space-y-2 text-xs font-mono">
                                      {log.responseBody && Object.keys(log.responseBody).length > 0 && (
                                        <div>
                                          <strong>Response Body:</strong>
                                          <pre className="mt-1 bg-gray-50 p-2 rounded overflow-x-auto max-h-40">
                                            {JSON.stringify(log.responseBody, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Error Details */}
                                  {log.errorMessage && (
                                    <div>
                                      <h4 className="text-sm font-semibold text-red-900 mb-2">Error Details</h4>
                                      <div className="bg-red-50 rounded-lg p-4 text-xs">
                                        <div className="text-red-800 font-semibold mb-1">{log.errorMessage}</div>
                                        {log.errorStack && (
                                          <pre className="text-red-700 mt-2 overflow-x-auto max-h-40">
                                            {log.errorStack}
                                          </pre>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Additional Info */}
                                  <div className="grid grid-cols-2 gap-4 text-xs">
                                    {log.userAgent && (
                                      <div>
                                        <strong>User Agent:</strong>
                                        <div className="text-gray-600 mt-1 break-words">{log.userAgent}</div>
                                      </div>
                                    )}
                                    {log.tenantId && (
                                      <div>
                                        <strong>Tenant:</strong>
                                        <div className="text-gray-600 mt-1">{log.tenantId.name}</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
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
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(currentPage * pageSize, totalLogs)}</span> of{' '}
                        <span className="font-medium">{totalLogs}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeftIcon className="h-5 w-5" />
                        </button>
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
                          <ChevronRightIcon className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

