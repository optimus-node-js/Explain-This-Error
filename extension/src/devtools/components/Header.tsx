import React from 'react';

interface HeaderProps {
  errorCount: number;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ errorCount, isLoading }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg font-semibold text-gray-900">
            Explain This Error
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {errorCount} errors
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {isLoading && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Explaining...</span>
            </div>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

