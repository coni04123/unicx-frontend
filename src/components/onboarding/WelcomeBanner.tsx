'use client';

import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { 
  XMarkIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';

export default function WelcomeBanner() {
  const { isOnboardingCompleted, resetOnboarding } = useOnboarding();
  const [isVisible, setIsVisible] = React.useState(true);

  // Don't show if onboarding is completed or banner is dismissed
  if (isOnboardingCompleted || !isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <RocketLaunchIcon className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-primary-900">
              Welcome to 2N5! 🎉
            </h3>
            <p className="text-sm text-primary-700 mt-1">
              Ready to get started? Our guided setup will help you create your entity structure, add users, and send QR invitations in just a few minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
