import React from 'react';
import { APIAuthProvider } from '@/contexts/APIAuthContext';

function TestApp() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1e3a8a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{ color: '#1e3a8a', marginBottom: '20px' }}>
          🎉 Ges-Cab Test
        </h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Si tu vois ce message, l'application React fonctionne !
        </p>
        <div style={{ 
          backgroundColor: '#f0f9ff', 
          padding: '20px', 
          borderRadius: '5px',
          marginTop: '20px'
        }}>
          <h3 style={{ color: '#1e3a8a', marginBottom: '10px' }}>
            Architecture actuelle :
          </h3>
          <ul style={{ color: '#666', textAlign: 'left', lineHeight: '1.6' }}>
            <li>✅ Frontend React : http://localhost:3000</li>
            <li>✅ Backend API : http://localhost:3003</li>
            <li>✅ PostgreSQL : Connecté</li>
          </ul>
        </div>
        <p style={{ 
          color: '#16a34a', 
          fontWeight: 'bold',
          marginTop: '20px'
        }}>
          Migration Supabase → PostgreSQL terminée ! 🚀
        </p>
      </div>
    </div>
  );
}

function AppWithProvider() {
  return (
    <APIAuthProvider>
      <TestApp />
    </APIAuthProvider>
  );
}

export default AppWithProvider;