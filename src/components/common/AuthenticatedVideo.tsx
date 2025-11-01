'use client';

import { useEffect, useState } from 'react';

interface AuthenticatedVideoProps {
  src: string;
  className?: string;
  controls?: boolean;
}

export default function AuthenticatedVideo({ src, className, controls = true }: AuthenticatedVideoProps) {
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // If the src is not a proxy URL, use it directly
    if (!src || !src.includes('/api/v1/media/proxy/')) {
      setVideoSrc(src);
      setLoading(false);
      return;
    }

    const loadVideo = async () => {
      try {
        setLoading(true);
        setError(false);

        // Get the access token from localStorage
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          console.error('No access token found');
          setError(true);
          setLoading(false);
          return;
        }

        // Construct the full URL from the relative path
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://unicx-integration.vercel.app/api/v1';
        // Extract the base URL without the /api/v1 suffix
        const baseUrl = apiBaseUrl.replace(/\/api\/v1$/, '');
        const fullUrl = src.startsWith('/') ? `${baseUrl}${src}` : src;

        // Fetch the video with authentication
        const response = await fetch(fullUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load video: ${response.status}`);
        }

        // Convert the response to a blob
        const blob = await response.blob();
        
        // Create an object URL from the blob
        const objectUrl = URL.createObjectURL(blob);
        setVideoSrc(objectUrl);
        setLoading(false);
      } catch (err) {
        console.error('Error loading authenticated video:', err);
        setError(true);
        setLoading(false);
      }
    };

    loadVideo();

    // Cleanup: revoke the object URL when component unmounts
    return () => {
      if (videoSrc && videoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [src]);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 text-gray-500`}>
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm">Failed to load video</p>
        </div>
      </div>
    );
  }

  return <video src={videoSrc} className={className} controls={controls} />;
}

