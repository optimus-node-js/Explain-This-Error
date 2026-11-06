import React, { useState, useEffect } from 'react';
import type { ErrorContext, Explanation, FilterState } from '../types';
import { ErrorList } from './components/ErrorList';
import { ErrorDetails } from './components/ErrorDetails';
import { FilterBar } from './components/FilterBar';
import { Header } from './components/Header';

const DevToolsPanel: React.FC = () => {
  const [errors, setErrors] = useState<ErrorContext[]>([]);
  const [explanations, setExplanations] = useState<Map<string, Explanation>>(new Map());
  const [selectedError, setSelectedError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    severity: 'all',
    resolved: 'all',
    search: ''
  });

  useEffect(() => {
    // Load initial error history
    loadErrorHistory();
    
    // Set up message listener for new errors
    const messageListener = (message: any) => {
      if (message.type === 'DEVTOOLS_MESSAGE') {
        handleDevToolsMessage(message.payload);
      }
    };
    
    chrome.runtime.onMessage.addListener(messageListener);
    
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const loadErrorHistory = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_HISTORY' });
      if (response.success) {
        setErrors(response.history);
      }
    } catch (error) {
      console.error('Failed to load error history:', error);
    }
  };

  const handleDevToolsMessage = (payload: any) => {
    switch (payload.type) {
      case 'ERROR_ADDED':
        setErrors(prev => [payload.error, ...prev]);
        break;
      case 'ERROR_RESOLVED':
        setErrors(prev => 
          prev.map(error => 
            error.id === payload.errorId 
              ? { ...error, metadata: { ...error.metadata, resolved: true } }
              : error
          )
        );
        break;
    }
  };

  const handleExplainError = async (error: ErrorContext) => {
    setIsLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'EXPLAIN_ERROR',
        payload: { error }
      });
      
      if (response.success) {
        const explanation: Explanation = {
          id: `exp_${Date.now()}`,
          errorId: error.id,
          explanation: response.explanation.explanation,
          rootCause: response.explanation.rootCause,
          fixSnippet: response.explanation.fixSnippet,
          references: response.explanation.references,
          confidence: response.explanation.confidence,
          aiModel: 'gpt-4',
          createdAt: Date.now()
        };
        
        setExplanations(prev => new Map(prev).set(error.id, explanation));
      }
    } catch (error) {
      console.error('Failed to explain error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveError = async (errorId: string) => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'RESOLVE_ERROR',
        payload: { errorId }
      });
      
      if (response.success) {
        setErrors(prev => 
          prev.map(error => 
            error.id === errorId 
              ? { ...error, metadata: { ...error.metadata, resolved: true } }
              : error
          )
        );
      }
    } catch (error) {
      console.error('Failed to resolve error:', error);
    }
  };

  const filteredErrors = errors.filter(error => {
    if (filters.type !== 'all' && error.type !== filters.type) return false;
    if (filters.severity !== 'all' && error.metadata.severity !== filters.severity) return false;
    if (filters.resolved !== 'all') {
      const isResolved = error.metadata.resolved;
      if (filters.resolved === 'resolved' && !isResolved) return false;
      if (filters.resolved === 'unresolved' && isResolved) return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesMessage = error.error.message.toLowerCase().includes(searchLower);
      const matchesUrl = error.context.url.toLowerCase().includes(searchLower);
      if (!matchesMessage && !matchesUrl) return false;
    }
    return true;
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header 
        errorCount={filteredErrors.length}
        isLoading={isLoading}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r border-gray-200 flex flex-col">
          <FilterBar 
            filters={filters}
            onFiltersChange={setFilters}
          />
          <ErrorList
            errors={filteredErrors}
            selectedError={selectedError}
            onSelectError={setSelectedError}
            onExplainError={handleExplainError}
            onResolveError={handleResolveError}
            explanations={explanations}
          />
        </div>
        
        <div className="w-1/2 flex flex-col">
          {selectedError ? (
            <ErrorDetails
              error={errors.find(e => e.id === selectedError)!}
              explanation={explanations.get(selectedError)}
              onExplainError={handleExplainError}
              onResolveError={handleResolveError}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select an error to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevToolsPanel;
