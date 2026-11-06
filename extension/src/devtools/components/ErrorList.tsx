import React from 'react';
import type { ErrorContext, Explanation } from '../../types';
import { formatErrorMessage } from '../../shared/utils';

interface ErrorListProps {
  errors: ErrorContext[];
  selectedError: string | null;
  onSelectError: (errorId: string) => void;
  onExplainError: (error: ErrorContext) => void;
  onResolveError: (errorId: string) => void;
  explanations: Map<string, Explanation>;
}

export const ErrorList: React.FC<ErrorListProps> = ({
  errors,
  selectedError,
  onSelectError,
  onExplainError,
  onResolveError,
  explanations
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'console': return '🖥️';
      case 'network': return '🌐';
      default: return '❓';
    }
  };

  if (errors.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">🎉</div>
          <p>No errors detected</p>
          <p className="text-sm">Start coding to see errors here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {errors.map((error) => {
        const isSelected = selectedError === error.id;
        const hasExplanation = explanations.has(error.id);
        const isResolved = error.metadata.resolved;
        
        return (
          <div
            key={error.id}
            className={`border-b border-gray-100 p-3 cursor-pointer hover:bg-gray-50 ${
              isSelected ? 'bg-blue-50 border-blue-200' : ''
            } ${isResolved ? 'opacity-60' : ''}`}
            onClick={() => onSelectError(error.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm">{getTypeIcon(error.type)}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(error.metadata.severity)}`}>
                    {error.metadata.severity}
                  </span>
                  {error.metadata.frequency > 1 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {error.metadata.frequency}x
                    </span>
                  )}
                  {isResolved && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">
                      ✓ Resolved
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-900 font-medium truncate">
                  {formatErrorMessage(error)}
                </p>
                
                <p className="text-xs text-gray-500 truncate mt-1">
                  {new URL(error.context.url).hostname}
                </p>
                
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(error.timestamp).toLocaleTimeString()}
                </p>
              </div>
              
              <div className="flex flex-col space-y-1 ml-2">
                {hasExplanation && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="Has explanation" />
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onExplainError(error);
                  }}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  title="Explain this error"
                >
                  Explain
                </button>
                
                {!isResolved && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onResolveError(error.id);
                    }}
                    className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 focus:outline-none focus:ring-1 focus:ring-green-500"
                    title="Mark as resolved"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

