'use client';

import React from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-background to-pistachio-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Logo with animation */}
        <div className="relative">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
            <ChatBubbleLeftRightIcon className="h-10 w-10 text-white" />
          </div>
          
          {/* Loading dots */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-sage-500 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-bottle-500 rounded-full animate-bounce delay-200" />
          </div>
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">2N5</h2>
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>

        {/* Loading bar */}
        <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary via-sage-500 to-bottle-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
