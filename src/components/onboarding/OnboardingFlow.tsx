'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  CheckCircleIcon,
  BuildingOfficeIcon,
  UsersIcon,
  QrCodeIcon,
  EnvelopeIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  current: boolean;
}

interface OnboardingFlowProps {
  onClose: () => void;
  onComplete: () => void;
}

export default function OnboardingFlow({ onClose, onComplete }: OnboardingFlowProps) {
  const t = useTranslation('common');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    // Step 1: Entity Creation
    entityName: '',
    companyName: '',
    departmentName: '',
    
    // Step 2: E164 Users
    users: [
      { name: '', email: '', e164Number: '', role: 'User' }
    ],
    
    // Step 3: QR Invitations
    sendInvitations: true,
    invitationMessage: 'Welcome to 2N5! Please scan the QR code to connect your WhatsApp account for monitoring.'
  });

  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'entity-setup',
      title: 'Create Entity Structure',
      description: 'Set up your organizational hierarchy',
      icon: BuildingOfficeIcon,
      completed: false,
      current: true
    },
    {
      id: 'add-users',
      title: 'Add E164 Users',
      description: 'Add team members to monitor',
      icon: UsersIcon,
      completed: false,
      current: false
    },
    {
      id: 'send-invitations',
      title: 'Send QR Invitations',
      description: 'Invite users to connect WhatsApp',
      icon: QrCodeIcon,
      completed: false,
      current: false
    }
  ]);

  const currentStep = steps[currentStepIndex];

  const updateStep = (index: number, updates: Partial<OnboardingStep>) => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, ...updates } : step
    ));
  };

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      // Mark current step as completed
      updateStep(currentStepIndex, { completed: true, current: false });
      
      // Move to next step
      const nextIndex = currentStepIndex + 1;
      updateStep(nextIndex, { current: true });
      setCurrentStepIndex(nextIndex);
    } else {
      // Complete onboarding
      updateStep(currentStepIndex, { completed: true, current: false });
      onComplete();
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      // Mark current step as not current
      updateStep(currentStepIndex, { current: false });
      
      // Move to previous step
      const prevIndex = currentStepIndex - 1;
      updateStep(prevIndex, { current: true, completed: false });
      setCurrentStepIndex(prevIndex);
    }
  };

  const addUser = () => {
    setFormData(prev => ({
      ...prev,
      users: [...prev.users, { name: '', email: '', e164Number: '', role: 'User' }]
    }));
  };

  const removeUser = (index: number) => {
    setFormData(prev => ({
      ...prev,
      users: prev.users.filter((_, i) => i !== index)
    }));
  };

  const updateUser = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      users: prev.users.map((user, i) => 
        i === index ? { ...user, [field]: value } : user
      )
    }));
  };

  const canProceed = () => {
    switch (currentStep.id) {
      case 'entity-setup':
        return formData.entityName.trim() !== '';
      case 'add-users':
        return formData.users.some(user => 
          user.name.trim() !== '' && 
          user.email.trim() !== '' && 
          user.e164Number.trim() !== ''
        );
      case 'send-invitations':
        return true; // Always can proceed from last step
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'entity-setup':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <BuildingOfficeIcon className="mx-auto h-16 w-16 text-primary-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Create Your Entity Structure</h3>
              <p className="mt-2 text-sm text-gray-600">
                Set up your organizational hierarchy. This creates the foundation for user management and message monitoring.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entity Name (Required)
                </label>
                <input
                  type="text"
                  value={formData.entityName}
                  onChange={(e) => setFormData(prev => ({ ...prev, entityName: e.target.value }))}
                  placeholder="e.g., Acme Corporation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="e.g., Sales Division"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.departmentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, departmentName: e.target.value }))}
                  placeholder="e.g., Customer Support"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <BuildingOfficeIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">Entity Structure Preview</h4>
                  <div className="mt-2 text-sm text-blue-700">
                    {formData.entityName && (
                      <div className="space-y-1">
                        <div>🏢 {formData.entityName}</div>
                        {formData.companyName && (
                          <div className="ml-4">🏬 {formData.companyName}</div>
                        )}
                        {formData.departmentName && (
                          <div className="ml-8">📋 {formData.departmentName}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'add-users':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <UsersIcon className="mx-auto h-16 w-16 text-primary-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Add E164 Users</h3>
              <p className="mt-2 text-sm text-gray-600">
                Add team members who will be monitored. E164 users are the basic elements of your monitoring system.
              </p>
            </div>
            
            <div className="space-y-4">
              {formData.users.map((user, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">User {index + 1}</h4>
                    {formData.users.length > 1 && (
                      <button
                        onClick={() => removeUser(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={user.name}
                        onChange={(e) => updateUser(index, 'name', e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        onChange={(e) => updateUser(index, 'email', e.target.value)}
                        placeholder="john@company.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        E164 Number
                      </label>
                      <input
                        type="tel"
                        value={user.e164Number}
                        onChange={(e) => updateUser(index, 'e164Number', e.target.value)}
                        placeholder="+1234567890"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        value={user.role}
                        onChange={(e) => updateUser(index, 'role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      >
                        <option value="User">User</option>
                        <option value="TenantAdmin">Tenant Administrator</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addUser}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                + Add Another User
              </button>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-green-800">What happens next?</h4>
                  <p className="mt-1 text-sm text-green-700">
                    These users will be created in your entity structure and can receive QR code invitations to connect their WhatsApp accounts for monitoring.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'send-invitations':
        const validUsers = formData.users.filter(user => 
          user.name.trim() !== '' && 
          user.email.trim() !== '' && 
          user.e164Number.trim() !== ''
        );
        
        return (
          <div className="space-y-6">
            <div className="text-center">
              <QrCodeIcon className="mx-auto h-16 w-16 text-primary-600" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Send QR Code Invitations</h3>
              <p className="mt-2 text-sm text-gray-600">
                Send email invitations with QR codes to allow users to connect their WhatsApp accounts for monitoring.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sendInvitations"
                  checked={formData.sendInvitations}
                  onChange={(e) => setFormData(prev => ({ ...prev, sendInvitations: e.target.checked }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="sendInvitations" className="ml-2 block text-sm text-gray-900">
                  Send QR code invitations to all users
                </label>
              </div>
              
              {formData.sendInvitations && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invitation Message
                  </label>
                  <textarea
                    value={formData.invitationMessage}
                    onChange={(e) => setFormData(prev => ({ ...prev, invitationMessage: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Invitation Summary ({validUsers.length} users)
                </h4>
                <div className="space-y-2">
                  {validUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-900">{user.name}</span>
                      <span className="text-gray-500">{user.email}</span>
                      <span className="text-gray-500">{user.e164Number}</span>
                      {formData.sendInvitations && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          <EnvelopeIcon className="h-3 w-3 mr-1" />
                          Will send
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <QrCodeIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">How QR invitations work</h4>
                  <p className="mt-1 text-sm text-blue-700">
                    Users will receive an email with a unique QR code. They scan it with their WhatsApp to enable monitoring of their messages within your entity structure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Welcome to 2N5!</h2>
              <p className="text-sm text-gray-600 mt-1">Let's get your WhatsApp monitoring system set up</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step.completed 
                      ? 'bg-green-100 text-green-600' 
                      : step.current 
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step.completed ? (
                      <CheckCircleSolidIcon className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      step.current ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRightIcon className="w-5 h-5 text-gray-300" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousStep}
              disabled={currentStepIndex === 0}
              className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                currentStepIndex === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              Previous
            </button>
            
            <div className="text-sm text-gray-500">
              Step {currentStepIndex + 1} of {steps.length}
            </div>
            
            <button
              onClick={goToNextStep}
              disabled={!canProceed()}
              className={`inline-flex items-center px-6 py-2 rounded-md text-sm font-medium ${
                canProceed()
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentStepIndex === steps.length - 1 ? 'Complete Setup' : 'Next'}
              {currentStepIndex < steps.length - 1 && (
                <ChevronRightIcon className="w-4 h-4 ml-2" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
