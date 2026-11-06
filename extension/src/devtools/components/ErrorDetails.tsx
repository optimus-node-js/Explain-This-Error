import React, { useState } from 'react';
import type { ErrorContext, Explanation } from '../../types';
import { formatErrorMessage } from '../../shared/utils';

interface ErrorDetailsProps {
  error: ErrorContext;
  explanation: Explanation | undefined;
  onExplainError: (error: ErrorContext) => void;
  onResolveError: (errorId: string) => void;
}

export const ErrorDetails: React.FC<ErrorDetailsProps> = ({
  error,
  explanation,
  onExplainError,
  onResolveError
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'explanation'>('details');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Error Details
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => onExplainError(error)}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {explanation ? 'Re-explain' : 'Explain'}
            </button>
            {!error.metadata.resolved && (
              <button
                onClick={() => onResolveError(error.id)}
                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Mark Resolved
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(error.metadata.severity)}`}>
            {error.metadata.severity}
          </span>
          <span className="text-sm text-gray-500">
            {error.type} • {error.metadata.frequency} occurrence{error.metadata.frequency > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('explanation')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'explanation'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Explanation
            {explanation && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'details' ? (
          <div className="space-y-4">
            {/* Error Message */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Error Message</h3>
              <div className="bg-gray-50 rounded-md p-3">
                <code className="text-sm text-gray-800">{error.error.message}</code>
                <button
                  onClick={() => copyToClipboard(error.error.message)}
                  className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Stack Trace */}
            {error.error.stack && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Stack Trace</h3>
                <div className="bg-gray-50 rounded-md p-3 max-h-40 overflow-y-auto">
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap">{error.error.stack}</pre>
                  <button
                    onClick={() => copyToClipboard(error.error.stack!)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {/* Location */}
            {(error.error.filename || error.error.line) && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Location</h3>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-sm text-gray-800">
                    {error.error.filename}
                    {error.error.line && `:${error.error.line}`}
                    {error.error.column && `:${error.error.column}`}
                  </p>
                </div>
              </div>
            )}

            {/* Context */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Context</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-xs font-medium text-gray-500">URL:</span>
                  <p className="text-sm text-gray-800 break-all">{error.context.url}</p>
                </div>
                {error.context.framework && (
                  <div>
                    <span className="text-xs font-medium text-gray-500">Framework:</span>
                    <p className="text-sm text-gray-800">{error.context.framework}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs font-medium text-gray-500">Timestamp:</span>
                  <p className="text-sm text-gray-800">
                    {new Date(error.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Network Info */}
            {error.context.networkInfo && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Network Request</h3>
                <div className="bg-gray-50 rounded-md p-3 space-y-2">
                  <div>
                    <span className="text-xs font-medium text-gray-500">Method:</span>
                    <span className="ml-2 text-sm text-gray-800">{error.context.networkInfo.method}</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">URL:</span>
                    <p className="text-sm text-gray-800 break-all">{error.context.networkInfo.url}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">Status:</span>
                    <span className="ml-2 text-sm text-gray-800">
                      {error.context.networkInfo.status} {error.context.networkInfo.statusText}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {explanation ? (
              <div className="space-y-4">
                {/* Explanation */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Explanation</h3>
                  <div className="bg-blue-50 rounded-md p-3">
                    <p className="text-sm text-gray-800">{explanation.explanation}</p>
                  </div>
                </div>

                {/* Root Cause */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Root Cause</h3>
                  <div className="bg-yellow-50 rounded-md p-3">
                    <p className="text-sm text-gray-800">{explanation.rootCause}</p>
                  </div>
                </div>

                {/* Fix Snippet */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Suggested Fix</h3>
                  <div className="bg-gray-900 rounded-md p-3">
                    <pre className="text-sm text-green-400 whitespace-pre-wrap">{explanation.fixSnippet}</pre>
                    <button
                      onClick={() => copyToClipboard(explanation.fixSnippet)}
                      className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>

                {/* References */}
                {explanation.references.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">References</h3>
                    <div className="space-y-2">
                      {explanation.references.map((ref, index) => (
                        <a
                          key={index}
                          href={ref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-600 hover:text-blue-800 break-all"
                        >
                          {ref}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confidence */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Confidence</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${explanation.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {Math.round(explanation.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Explanation Yet</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Click "Explain" to get an AI-powered explanation of this error
                </p>
                <button
                  onClick={() => onExplainError(error)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Explain This Error
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

