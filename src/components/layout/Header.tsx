'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Fragment } from 'react';
import { Menu, Transition, Popover } from '@headlessui/react';
import {
  BellIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  ExclamationTriangleIcon,
  LanguageIcon,
  CheckIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { currentUser, mockAlerts } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const t = useTranslation('common');
  const tProfile = useTranslation('profile');
  const { user, logout } = useAuth();
  const { roleInfo, role } = usePermissions();
  const { language, setLanguage, languages } = useLanguage();

  const unreadAlerts = mockAlerts.filter(alert => alert.status === 'open');
  const criticalAlerts = unreadAlerts.filter(alert => alert.severity === 'critical');
  
  const currentLanguage = languages.find(l => l.code === language) || languages[0];

  // Get role icon based on user role
  const getRoleIcon = (userRole: string) => {
    switch (userRole) {
      case 'SystemAdmin':
        return <ShieldCheckIcon className="h-4 w-4" />;
      case 'TenantAdmin':
        return <UserGroupIcon className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  // Get role color based on user role
  const getRoleColor = (userRole: string) => {
    switch (userRole) {
      case 'SystemAdmin':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'TenantAdmin':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left section */}
          <div className="flex items-center flex-1">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={onMenuClick}
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center text-sm rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 px-2 py-1">
                <LanguageIcon className="h-5 w-5 mr-1" />
                <span className="text-lg">{currentLanguage.flag}</span>
                <ChevronDownIcon className="h-4 w-4 ml-1" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {languages.map((lang) => (
                    <Menu.Item key={lang.code}>
                      {({ active }) => (
                        <button
                          onClick={() => setLanguage(lang.code)}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } ${
                            language === lang.code ? 'bg-primary-50 text-primary-600' : 'text-gray-900'
                          } flex items-center w-full px-4 py-2 text-sm`}
                        >
                          <span className="text-xl mr-3">{lang.flag}</span>
                          <div className="flex-1 text-left">
                            <p className="font-medium">{lang.nativeName}</p>
                            <p className="text-xs text-gray-500">{lang.name}</p>
                          </div>
                          {language === lang.code && (
                            <CheckIcon className="h-4 w-4 text-primary-600" />
                          )}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Transition>
            </Menu>

            {/* Notifications */}
            {/* <Popover className="relative">
              <Popover.Button className="relative p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-full">
                <BellIcon className="h-6 w-6" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}
                  </span>
                )}
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute right-0 z-10 mt-2 w-96 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">{t('notifications.title')}</h3>
                      {criticalAlerts.length > 0 && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {criticalAlerts.length} {t('notifications.critical')}
                        </span>
                      )}
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {unreadAlerts.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                          {t('notifications.noNew')}
                        </p>
                      ) : (
                        unreadAlerts.slice(0, 5).map((alert) => (
                          <div
                            key={alert.id}
                            className={`p-3 rounded-md border-l-4 ${
                              alert.severity === 'critical'
                                ? 'border-red-400 bg-red-50'
                                : alert.severity === 'high'
                                ? 'border-orange-400 bg-orange-50'
                                : alert.severity === 'medium'
                                ? 'border-yellow-400 bg-yellow-50'
                                : 'border-blue-400 bg-blue-50'
                            }`}
                          >
                            <div className="flex items-start">
                              <ExclamationTriangleIcon
                                className={`h-5 w-5 mt-0.5 ${
                                  alert.severity === 'critical'
                                    ? 'text-red-400'
                                    : alert.severity === 'high'
                                    ? 'text-orange-400'
                                    : alert.severity === 'medium'
                                    ? 'text-yellow-400'
                                    : 'text-blue-400'
                                }`}
                              />
                              <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {alert.title}
                                </p>
                                <p className="text-sm text-gray-700 mt-1">
                                  {alert.description}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(alert.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {unreadAlerts.length > 5 && (
                      <div className="mt-4 text-center">
                        <a
                          href="/messages"
                          className="text-sm text-primary-600 hover:text-primary-500"
                        >
                          {t('notifications.viewAll')}
                        </a>
                      </div>
                    )}
                  </div>
                </Popover.Panel>
              </Transition>
            </Popover> */}

            {/* User menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:bg-gray-50 px-3 py-2 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <div className="text-left">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user?.email?.split('@')[0] || 'User'
                        }
                      </p>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(role)}`}>
                        {getRoleIcon(role)}
                        {/* <span className="ml-1">{roleInfo.label}</span> */}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <EnvelopeIcon className="h-3 w-3" />
                      <span className="truncate max-w-32">{user?.email}</span>
                    </div>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </div>
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-lg bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getRoleColor(role).replace('text-', 'bg-').replace('bg-red-600', 'bg-red-100').replace('bg-orange-600', 'bg-orange-100').replace('bg-blue-600', 'bg-blue-100')}`}>
                        {getRoleIcon(role)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user?.firstName && user?.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : user?.email?.split('@')[0] || 'User'
                          }
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        {/* <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleColor(role)}`}>
                          {getRoleIcon(role)}
                          <span className="ml-1">{roleInfo.label}</span>
                        </div> */}
                      </div>
                    </div>
                  </div>
                  
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="/profile"
                        className={`${
                          active ? 'bg-gray-50' : ''
                        } flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150`}
                      >
                        <UserIcon className="h-4 w-4 mr-3 text-gray-400" />
                        {tProfile('title')}
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={`${
                          active ? 'bg-gray-50' : ''
                        } flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150`}
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3 text-gray-400" />
                        {t('auth.signOut')}
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
}
