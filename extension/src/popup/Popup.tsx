import React, { useState, useEffect } from 'react';
import type { ErrorContext } from '../types';

const Popup: React.FC = () => {
  const [recentErrors, setRecentErrors] = useState<ErrorContext[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentErrors();
  }, []);

  const loadRecentErrors = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_HISTORY' });
      if (response.success) {
        // Show only the 5 most recent unresolved errors
        const unresolved = response.history
          .filter((error: ErrorContext) => !error.metadata.resolved)
          .slice(0, 5);
        setRecentErrors(unresolved);
      }
    } catch (error) {
      console.error('Failed to load recent errors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openDevTools = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'openDevTools' });
      }
    });
  };

  const formatErrorMessage = (error: ErrorContext) => {
    const message = error.error.message;
    return message.length > 60 ? message.substring(0, 60) + '...' : message;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-lg font-semibold">Explain This Error</h1>
        <p className="text-sm text-blue-100 mt-1">
          {recentErrors.length} recent error{recentErrors.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {recentErrors.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Errors</h3>
            <p className="text-sm text-gray-500 mb-4">
              Great job! No errors detected recently.
            </p>
            <button
              onClick={openDevTools}
              className="btn-primary"
            >
              Open DevTools
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-900">Recent Errors</h2>
              <button
                onClick={openDevTools}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                View All
              </button>
            </div>
            
            {recentErrors.map((error) => (
              <div
                key={error.id}
                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  // Open DevTools and focus on this error
                  openDevTools();
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(error.metadata.severity)}`}>
                    {error.metadata.severity}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(error.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-900 font-medium mb-1">
                  {formatErrorMessage(error)}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {error.type} • {error.metadata.frequency}x
                  </span>
                  <span className="text-xs text-blue-600 hover:text-blue-800">
                    Explain →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Click "Explain" for AI-powered solutions
          </div>
          <button
            onClick={() => chrome.tabs.create({ url: 'https://explainthiserror.com' })}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
