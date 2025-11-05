'use client';

import { useEffect, useState } from 'react';

interface AuthenticatedAttachmentProps {
  src: string;
  fileName?: string;
  fileType?: string;
  className?: string;
  direction?: 'inbound' | 'outbound';
}

export default function AuthenticatedAttachment({ 
  src, 
  fileName, 
  fileType,
  className = '', 
  direction = 'outbound'
}: AuthenticatedAttachmentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    // If the src is not a proxy URL, use it directly
    if (!src || !src.includes('/api/v1/media/proxy/')) {
      setDownloadUrl(src);
      return;
    }

    // For proxy URLs, we'll use the authenticated URL directly
    // The download will be handled via an authenticated fetch
    setDownloadUrl(src);
  }, [src]);

  const getFileNameFromUrl = (url: string): string | null => {
    try {
      // Try to extract filename from URL
      const urlPath = url.split('?')[0]; // Remove query parameters
      const segments = urlPath.split('/');
      const lastSegment = segments[segments.length - 1];
      
      // If the last segment looks like a filename (has extension), return it
      if (lastSegment && lastSegment.includes('.')) {
        return lastSegment;
      }
      
      // Try to get filename from Content-Disposition header if available
      return null;
    } catch {
      return null;
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!src) return;

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
      let fullUrl = src.startsWith('/') ? `${baseUrl}${src}` : src;
      
      // If fileName prop is provided, add it as query parameter for backend to use in Content-Disposition
      if (fileName) {
        try {
          const urlObj = new URL(fullUrl);
          urlObj.searchParams.set('filename', fileName);
          fullUrl = urlObj.toString();
        } catch {
          // If URL construction fails (relative URL), append query parameter manually
          const separator = fullUrl.includes('?') ? '&' : '?';
          fullUrl = `${fullUrl}${separator}filename=${encodeURIComponent(fileName)}`;
        }
      }

      // Fetch the file with authentication
      const response = await fetch(fullUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status}`);
      }

      // Try to get filename from Content-Disposition header
      const contentDisposition = response.headers.get('content-disposition');
      let downloadFileName = fileName;
      
      if (!downloadFileName && contentDisposition) {
        // Try RFC 2231 encoded filename first (filename*=UTF-8''encoded-filename)
        const rfc2231Match = contentDisposition.match(/filename\*=([^']+)'([^']*)'(.+)/);
        if (rfc2231Match) {
          try {
            downloadFileName = decodeURIComponent(rfc2231Match[3]);
          } catch {
            // If decoding fails, try alternative parsing
          }
        }
        
        // If no RFC 2231 match, try standard filename parameter
        if (!downloadFileName) {
          // Match both filename="value" and filename=value
          const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (fileNameMatch && fileNameMatch[1]) {
            downloadFileName = fileNameMatch[1].replace(/['"]/g, '').trim();
            // Decode URL-encoded filename
            try {
              downloadFileName = decodeURIComponent(downloadFileName);
            } catch {
              // Try unescape for older encoding
              try {
                downloadFileName = unescape(downloadFileName);
              } catch {
                // If all decoding fails, use as is
              }
            }
          }
        }
      }
      
      // If still no filename, try to extract from URL (but this is usually not the original name)
      // Only use URL extraction as last resort
      if (!downloadFileName) {
        const urlFileName = getFileNameFromUrl(fullUrl) || getFileNameFromUrl(src);
        if (urlFileName) {
          // Decode URL-encoded filename from path
          try {
            downloadFileName = decodeURIComponent(urlFileName);
          } catch {
            downloadFileName = urlFileName;
          }
        }
      }
      
      // Fallback to default name if still no filename
      if (!downloadFileName) {
        const extension = fileType?.toLowerCase() || 'bin';
        downloadFileName = `attachment.${extension}`;
      }

      // Convert the response to a blob
      const blob = await response.blob();
      
      // Create an object URL from the blob
      const objectUrl = URL.createObjectURL(blob);
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup: revoke the object URL after a short delay
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 100);
      
      setLoading(false);
    } catch (err) {
      console.error('Error downloading authenticated attachment:', err);
      setError(true);
      setLoading(false);
    }
  };

  const getFileIcon = () => {
    const type = fileType?.toLowerCase() || '';
    if (type.includes('pdf')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
    if (type.includes('word') || type.includes('doc')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
    if (type.includes('excel') || type.includes('xls')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
    // Default file icon
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  };

  const baseClasses = direction === 'outbound'
    ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
    : 'bg-gray-50 text-gray-700 hover:bg-gray-100';

  if (error) {
    return (
      <div className={`${className} inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${baseClasses}`}>
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm">Failed to load attachment</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`${className} inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${baseClasses} ${
        loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          <span className="text-sm">Downloading...</span>
        </>
      ) : (
        <>
          {getFileIcon()}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="text-sm">
            {fileName || `Download ${fileType?.toLowerCase() || 'file'}`}
          </span>
        </>
      )}
    </button>
  );
}
