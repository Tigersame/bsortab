import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Ensure critical globals for crypto libs
if (typeof window !== 'undefined') {
  (window as any).global = window;
  if (!(window as any).Buffer) {
    const b = (window as any).buffer;
    if (b && b.Buffer) (window as any).Buffer = b.Buffer;
  }
  if (!(window as any).process) {
    (window as any).process = { env: { NODE_ENV: 'production' } };
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}