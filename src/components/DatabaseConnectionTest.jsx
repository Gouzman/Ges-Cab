import { useState, useEffect } from 'react';
import { supabase, checkSupabaseConnection } from '../../lib/customSupabaseClient';

/**
 * Fonction utilitaire pour obtenir la couleur correspondant au statut
 * @param {string} status - Le statut actuel ('success', 'failed', 'partial' ou 'pending')
 * @param {string} successColor - La couleur pour le statut 'success'
 * @param {string} failedColor - La couleur pour le statut 'failed'
 * @param {string} partialColor - La couleur pour le statut 'partial'
 * @param {string} defaultColor - La couleur par défaut
 * @returns {string} - La couleur correspondante
 */
function getStatusColor(status, successColor, failedColor, partialColor, defaultColor) {
  if (status === 'success') return successColor;
  if (status === 'failed') return failedColor;
  if (status === 'partial') return partialColor;
  return defaultColor;
}

/**
 * Composant de test pour vérifier la connexion à la base de données
 * Utiliser ce composant en développement pour s'assurer que la connexion à Supabase fonctionne
 */
function DatabaseConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState('pending');
  const [errorMessage, setErrorMessage] = useState(null);
  const [profileCount, setProfileCount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const connectionDetails = {
    url: import.meta.env.VITE_SUPABASE_URL || 'Non défini',
    hasAnon: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Oui' : 'Non',
    environment: import.meta.env.MODE,
    timeStamp: new Date().toLocaleString()
  };

  // Tester la connexion au chargement du composant
  useEffect(() => {
    testConnection();
  }, []);

  // Fonction de test de la connexion
  async function testConnection() {
    setIsLoading(true);
    setConnectionStatus('pending');
    setErrorMessage(null);
    
    try {
      // Vérifier que la connexion est active
      const { connected, error, message } = await checkSupabaseConnection();
      
      if (!connected) {
        setConnectionStatus('failed');
        setErrorMessage(error?.message || 'Échec de la connexion à Supabase');
        setIsLoading(false);
        return;
      }
      
      // Si on a un message d'avertissement mais que la connexion est établie
      if (message) {
        setConnectionStatus('success');
        setErrorMessage(`Note: ${message}`);
        setProfileCount(0);
        setIsLoading(false);
        return;
      }
      
      // Tester une requête simple
      try {
        const { data, error: queryError } = await supabase
          .from('profiles')
          .select('*');
        
        if (queryError) {
          // Essayer avec une autre table si profiles échoue
          const { data: altData, error: altError } = await supabase
            .from('users')
            .select('*');
          
          if (altError) {
            setConnectionStatus('partial');
            setErrorMessage("Connexion à l'API établie, mais erreur d'accès aux tables");
            setProfileCount(0);
          } else {
            setConnectionStatus('success');
            setProfileCount(altData?.length || 0);
          }
        } else {
          setConnectionStatus('success');
          setProfileCount(data?.length || 0);
        }
      } catch (queryError) {
        // En cas d'erreur dans les requêtes, mais avec une connexion API établie
        setConnectionStatus('partial');
        setErrorMessage(`Erreur lors de la requête: ${queryError.message}`);
        setProfileCount(0);
      }
    } catch (error) {
      setConnectionStatus('failed');
      setErrorMessage(`Exception: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  // Styles pour le composant
  const styles = {
    container: {
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      backgroundColor: 'white',
      maxWidth: '600px',
      margin: '20px auto',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '15px',
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#374151',
      margin: '0',
    },
    statusContainer: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '15px',
      padding: '10px',
      borderRadius: '4px',
      backgroundColor: getStatusColor(connectionStatus, '#f0fdf4', '#fef2f2', '#fff8e6', '#f3f4f6'),
    },
    statusIndicator: {
      height: '12px',
      width: '12px',
      borderRadius: '50%',
      marginRight: '10px',
      backgroundColor: getStatusColor(connectionStatus, '#10b981', '#ef4444', '#eab308', '#9ca3af'),
    },
    statusText: {
      fontWeight: '500',
      color: getStatusColor(connectionStatus, '#059669', '#dc2626', '#b45309', '#4b5563'),
    },
    error: {
      color: '#dc2626',
      padding: '10px',
      borderRadius: '4px',
      backgroundColor: '#fef2f2',
      marginBottom: '15px',
    },
    button: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '8px 16px',
      fontSize: '0.875rem',
      cursor: 'pointer',
      fontWeight: '500',
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      color: '#4b5563',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      padding: '8px 16px',
      fontSize: '0.875rem',
      cursor: 'pointer',
      marginLeft: '8px',
    },
    detailsContainer: {
      marginTop: '15px',
      padding: '10px',
      borderRadius: '4px',
      backgroundColor: '#f3f4f6',
    },
    detailsRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '5px',
    },
    detailsLabel: {
      fontWeight: '500',
      color: '#4b5563',
    },
    detailsValue: {
      color: '#111827',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Test de Connexion à la Base de Données</h2>
        <button 
          style={styles.button} 
          onClick={testConnection} 
          disabled={isLoading}
        >
          {isLoading ? 'Test en cours...' : 'Tester à nouveau'}
        </button>
      </div>
      
      <div style={styles.statusContainer}>
        <div style={styles.statusIndicator}></div>
        <span style={styles.statusText}>
          {connectionStatus === 'pending' && 'Test de connexion en cours...'}
          {connectionStatus === 'success' && 'Connexion établie avec succès'}
          {connectionStatus === 'partial' && 'Connexion partielle établie'}
          {connectionStatus === 'failed' && 'Échec de la connexion'}
        </span>
      </div>
      
      {errorMessage && (
        <div style={styles.error}>
          <strong>Erreur:</strong> {errorMessage}
        </div>
      )}
      
      {connectionStatus === 'success' && (
        <div style={{...styles.statusContainer, backgroundColor: '#f0fdf4'}}>
          <span style={{...styles.statusText, color: '#059669'}}>
            {profileCount !== null && `${profileCount} profil(s) trouvé(s) dans la base de données`}
          </span>
        </div>
      )}
      
      <div style={{marginTop: '15px', display: 'flex', justifyContent: 'flex-end'}}>
        <button 
          style={styles.secondaryButton} 
          onClick={() => setDetailsVisible(!detailsVisible)}
        >
          {detailsVisible ? 'Masquer les détails' : 'Afficher les détails'}
        </button>
      </div>
      
      {detailsVisible && (
        <div style={styles.detailsContainer}>
          <div style={styles.detailsRow}>
            <span style={styles.detailsLabel}>URL Supabase:</span>
            <span style={styles.detailsValue}>{connectionDetails.url}</span>
          </div>
          <div style={styles.detailsRow}>
            <span style={styles.detailsLabel}>Clé Anonyme configurée:</span>
            <span style={styles.detailsValue}>{connectionDetails.hasAnon}</span>
          </div>
          <div style={styles.detailsRow}>
            <span style={styles.detailsLabel}>Environnement:</span>
            <span style={styles.detailsValue}>{connectionDetails.environment}</span>
          </div>
          <div style={styles.detailsRow}>
            <span style={styles.detailsLabel}>Horodatage:</span>
            <span style={styles.detailsValue}>{connectionDetails.timeStamp}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatabaseConnectionTest;