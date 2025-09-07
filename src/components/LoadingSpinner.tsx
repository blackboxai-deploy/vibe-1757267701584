'use client';

import { UploadStatus } from '@/types/resume';

interface LoadingSpinnerProps {
  status: UploadStatus;
}

export default function LoadingSpinner({ status }: LoadingSpinnerProps) {
  const getStatusColor = () => {
    switch (status.status) {
      case 'uploading': return 'text-blue-600';
      case 'processing': return 'text-yellow-600';
      case 'analyzing': return 'text-purple-600';
      case 'complete': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getProgressColor = () => {
    switch (status.status) {
      case 'uploading': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'analyzing': return 'bg-purple-500';
      case 'complete': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (status.status === 'idle') return null;

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border">
      <div className="flex items-center justify-center mb-4">
        {status.status === 'complete' ? (
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : status.status === 'error' ? (
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 flex items-center justify-center animate-spin">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800"></div>
          </div>
        )}
      </div>

      <div className="text-center mb-4">
        <h3 className={`text-lg font-semibold ${getStatusColor()}`}>
          {status.status === 'uploading' && 'Uploading Resume...'}
          {status.status === 'processing' && 'Processing Document...'}
          {status.status === 'analyzing' && 'Analyzing with AI...'}
          {status.status === 'complete' && 'Analysis Complete!'}
          {status.status === 'error' && 'Error Occurred'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {status.message}
        </p>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ease-out ${getProgressColor()}`}
          style={{ width: `${status.progress}%` }}
        />
      </div>

      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        {status.progress}% Complete
      </div>

      {status.status === 'analyzing' && (
        <div className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
          <p>Our AI is carefully reviewing your resume...</p>
          <p className="mt-1">This may take 30-60 seconds for detailed analysis.</p>
        </div>
      )}
    </div>
  );
}