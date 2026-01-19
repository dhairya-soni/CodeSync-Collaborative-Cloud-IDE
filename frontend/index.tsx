import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Fix for "ResizeObserver loop completed with undelivered notifications"
// This is a common, non-breaking warning triggered by Monaco/Chrome in complex layouts.
window.addEventListener('error', (e) => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.' || 
      e.message === 'ResizeObserver loop limit exceeded') {
    e.stopImmediatePropagation();
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);