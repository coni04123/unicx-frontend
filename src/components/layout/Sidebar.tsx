'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { usePermissions } from '@/hooks/usePermissions';
import {
  HomeIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolidIcon,
  BuildingOfficeIcon as BuildingSolidIcon,
  EnvelopeIcon as EnvelopeSolidIcon,
  UsersIcon as UsersSolidIcon,
} from '@heroicons/react/24/solid';

interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
  iconSolid?: React.ComponentType<any>;
  current: boolean;
  badge?: number;
  badgeColor?: 'red' | 'yellow' | 'green' | 'blue';
  children?: Omit<NavigationItem, 'icon' | 'iconSolid' | 'children'>[];
}

export default function Sidebar() {
  const t = useTranslation('navigation');
  const tApp = useTranslation('app');
  const pathname = usePathname();
  const { canAccessRoute } = usePermissions();

  const navigation: NavigationItem[] = [
    {
      name: t('dashboard'),
      href: '/',
      icon: HomeIcon,
      iconSolid: HomeSolidIcon,
      current: pathname === '/',
    },
    {
      name: t('entities'),
      href: '/entities',
      icon: BuildingOfficeIcon,
      iconSolid: BuildingSolidIcon,
      current: pathname.startsWith('/entities'),
    },
    {
      name: t('users'),
      href: '/users',
      icon: UsersIcon,
      iconSolid: UsersSolidIcon,
      current: pathname.startsWith('/users'),
    },
    {
      name: t('communications'),
      href: '/communication',
      icon: EnvelopeIcon,
      iconSolid: EnvelopeSolidIcon,
      current: pathname.startsWith('/communication'),
    },
  ];

  const getBadgeClasses = (color: 'red' | 'yellow' | 'green' | 'blue' | 'gray') => {
    switch (color) {
      case 'red':
        return 'bg-red-100 text-red-600';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-600';
      case 'green':
        return 'bg-green-100 text-green-600';
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      case 'gray':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto sidebar-scroll">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-4 mb-8">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">2</span>
            </div>
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-900">{tApp('name')}</h1>
            <p className="text-xs text-gray-500">{tApp('description')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          // Check if user has permission to access this route
          if (!canAccessRoute(item.href)) {
            return null;
          }

          const IconComponent = item.current ? item.iconSolid : item.icon;
          
          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={`nav-link ${item.current ? 'active' : ''}`}
              >
                {IconComponent && (
                  <IconComponent
                    className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      item.current
                        ? 'text-primary-600'
                        : 'text-gray-400 group-hover:text-primary-600'
                    }`}
                    aria-hidden="true"
                  />
                )}
                <span className="flex-1">{item.name}</span>
                {item.badge && item.badge > 0 && (
                  <span
                    className={`ml-3 inline-block py-0.5 px-2 text-xs rounded-full ${getBadgeClasses(
                      item.badgeColor || 'gray'
                    )}`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
              
              {/* Sub-navigation */}
              {item.children && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children.map((child) => {
                    // Check permission for child routes
                    if (!canAccessRoute(child.href)) {
                      return null;
                    }
                    
                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={`nav-link text-sm ${child.current ? 'active' : ''}`}
                      >
                        <span className="flex-1">{child.name}</span>
                        {child.badge && child.badge > 0 && (
                          <span
                            className={`ml-3 inline-block py-0.5 px-2 text-xs rounded-full ${getBadgeClasses(
                              child.badgeColor || 'gray'
                            )}`}
                          >
                            {child.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Status indicator */}
      {/* <div className="flex-shrink-0 px-2 mt-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse-green"></div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-green-800">{t('system.status')}</p>
              <p className="text-xs text-green-600">{t('system.operational')}</p>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}
