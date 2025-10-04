import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import './index.css';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  
  root.render(
    <StrictMode>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </StrictMode>
  );
} else {
  console.error("Élément 'root' non trouvé!");
}