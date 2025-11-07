import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SimpleAuthProvider } from './contexts/SimpleAuthContext';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <SimpleAuthProvider>
        <App />
      </SimpleAuthProvider>
    </React.StrictMode>
  );
} else {
  console.error('Root element not found');
}