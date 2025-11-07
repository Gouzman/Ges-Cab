import React from 'react';
import { PostgreSQLAuthProvider } from '@/contexts/PostgreSQLAuthContext';

function SimpleApp() {
  return (
    <PostgreSQLAuthProvider>
      <div className="min-h-screen bg-blue-500 flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow">
          <h1 className="text-2xl font-bold text-gray-800">
            🎉 Ges-Cab - Test Simple
          </h1>
          <p className="text-gray-600 mt-4">
            Si tu vois ce message, l'application fonctionne !
          </p>
        </div>
      </div>
    </PostgreSQLAuthProvider>
  );
}

export default SimpleApp;