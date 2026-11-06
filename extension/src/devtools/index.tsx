import React from 'react';
import { createRoot } from 'react-dom/client';
import DevToolsPanel from './DevToolsPanel';
import '../shared/styles.css';

// Initialize DevTools panel
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<DevToolsPanel />);
}

