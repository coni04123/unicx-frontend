'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface OnboardingContextType {
  isOnboardingCompleted: boolean;
  shouldShowOnboarding: boolean;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if onboarding has been completed
    const onboardingStatus = localStorage.getItem('onboarding-completed');
    const isCompleted = onboardingStatus === 'true';
    
    setIsOnboardingCompleted(isCompleted);
    
    // Show onboarding for new users (or if manually reset)
    setShouldShowOnboarding(!isCompleted);
  }, []);

  const completeOnboarding = () => {
    setIsOnboardingCompleted(true);
    setShouldShowOnboarding(false);
    localStorage.setItem('onboarding-completed', 'true');
  };

  const skipOnboarding = () => {
    setShouldShowOnboarding(false);
    // Don't mark as completed, just hide for this session
  };

  const resetOnboarding = () => {
    setIsOnboardingCompleted(false);
    setShouldShowOnboarding(true);
    localStorage.removeItem('onboarding-completed');
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingCompleted,
        shouldShowOnboarding,
        completeOnboarding,
        skipOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
