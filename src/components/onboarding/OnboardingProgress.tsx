'use client';

import React from 'react';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

interface OnboardingProgressProps {
  className?: string;
  showLabels?: boolean;
}

export default function OnboardingProgress({ 
  className = "", 
  showLabels = false 
}: OnboardingProgressProps) {
  // This would typically come from a context or API
  const steps = [
    { id: 'entity', label: 'Entity Structure', completed: true },
    { id: 'users', label: 'E164 Users', completed: true },
    { id: 'invitations', label: 'QR Invitations', completed: false },
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  if (completedSteps === totalSteps) {
    return null; // Don't show if everything is completed
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">Setup Progress</h4>
        <span className="text-xs text-gray-500">
          {completedSteps}/{totalSteps} completed
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div 
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {showLabels && (
        <div className="space-y-2">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center text-sm">
              {step.completed ? (
                <CheckCircleSolidIcon className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
              )}
              <span className={step.completed ? 'text-gray-900' : 'text-gray-500'}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
