import React from 'react';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(to right bottom, #1a365d, #2563eb)',
      color: 'white',
      fontFamily: 'system-ui'
    }}>
      <div style={{
        padding: '2rem',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '1rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          Test de l'Application
        </h1>
        <p>
          Si vous voyez ce message, React fonctionne correctement !
        </p>
      </div>
    </div>
  );
}

export default App;