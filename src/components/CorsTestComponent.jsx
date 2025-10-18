import React, { useState, useEffect } from 'react';
import { supabase, createClient } from '../lib/customSupabaseClient';

/**
 * Composant de diagnostic de connexion Supabase
 * Vérifie la configuration CORS et teste la connectivité
 */
const CorsTestComponent = () => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fonction locale pour vérifier la configuration CORS
  const checkCorsConfiguration = async (endpoint = 'rest/v1/profiles') => {
    try {
      console.info('🔍 Diagnostic CORS en cours...');
      
      // URL de l'API Supabase
      const apiUrl = import.meta.env.VITE_SUPABASE_URL || 'https://api.ges-cab.com';
      
      // Construction de l'URL complète
      const url = `${apiUrl}/${endpoint}`;
      console.log(`Tentative de connexion à: ${url}`);
      
      // 1. Effectuer une requête OPTIONS pour vérifier le préflight
      const preflightResponse = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });
      
      console.log('Réponse préflight:', preflightResponse.status, preflightResponse.ok);
      
      // Vérifier les en-têtes CORS
      const corsHeaders = {
        'Access-Control-Allow-Origin': preflightResponse.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': preflightResponse.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': preflightResponse.headers.get('Access-Control-Allow-Headers')
      };
      
      console.log('En-têtes CORS:', corsHeaders);
      
      // Vérifier si les en-têtes nécessaires sont présents
      const corsConfigured = corsHeaders['Access-Control-Allow-Origin'] !== null;
      
      if (!corsConfigured) {
        console.error('❌ Configuration CORS incomplète. Exécutez le script fix-cors-supabase.sh');
        return {
          success: false,
          message: 'Configuration CORS manquante',
          headers: corsHeaders
        };
      }
      
      return {
        success: true,
        message: 'Configuration CORS valide',
        headers: corsHeaders
      };
    } catch (error) {
      console.error('❌ Erreur lors du diagnostic CORS:', error);
      return {
        success: false,
        message: `Erreur de diagnostic: ${error.message}`,
        error
      };
    }
  };

  // Fonction pour tester l'accès aux profils
  const testProfilesAccess = async (apiUrl, anonKey) => {
    try {
      // Utiliser le client personnalisé si des paramètres sont fournis
      const testClient = apiUrl && anonKey
        ? createClient(apiUrl, anonKey)
        : supabase;
        
      console.log(`Test de connexion avec ${apiUrl ? 'paramètres URL' : 'client par défaut'}`);
        
      const { data, error } = await testClient
        .from('profiles')
        .select('id, email')
        .limit(1);
        
      return {
        success: !error,
        message: error ? `Erreur: ${error.message}` : `Succès: ${data?.length || 0} résultats`,
        data: data
      };
    } catch (err) {
      return {
        success: false, 
        message: `Exception: ${err.message}`,
        error: err
      };
    }
  };
  
  // Fonction pour tester l'authentification
  const testAuthentication = async (apiUrl, anonKey) => {
    try {
      const testClient = apiUrl && anonKey
        ? createClient(apiUrl, anonKey)
        : supabase;
        
      const { data: authData, error: authError } = await testClient.auth.getSession();
      
      let sessionStatus = authData?.session ? "active" : "inactive";
      
      return {
        success: !authError,
        message: authError 
          ? `Erreur d'authentification: ${authError.message}` 
          : `Session ${sessionStatus}`,
        authenticated: !!authData?.session
      };
    } catch (authErr) {
      return {
        success: false,
        message: `Exception d'authentification: ${authErr.message}`,
        authenticated: false
      };
    }
  };

  // Fonction principale de test
  const runTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Récupérer les paramètres d'URL pour un test personnalisé
      const urlParams = new URLSearchParams(window.location.search);
      const apiUrl = urlParams.get('api');
      const anonKey = urlParams.get('anon');
      
  // Test 1: Diagnostic CORS via méthode locale
  const corsResult = await checkCorsConfiguration();
  
  // Tester un contournement avec fetch direct pour voir si le problème est spécifique à Supabase
  try {
    const fetchTest = await fetch(`${import.meta.env.VITE_SUPABASE_URL || 'https://api.ges-cab.com'}/rest/v1/profiles?select=id`, {
      method: 'GET',
      headers: {
        'apikey': supabase.supabaseKey,
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors'
    });
    console.log('Test fetch direct:', fetchTest.status, fetchTest.ok);
  } catch (error) {
    console.error('Erreur fetch direct:', error);
  }
  
  // Test 2: Essayer de récupérer un profil (si CORS OK)
  let profilesResult = { success: false, message: 'Non testé' };
  if (corsResult.success) {
    profilesResult = await testProfilesAccess(apiUrl, anonKey);
  }      // Test 3: Vérifier la session d'authentification
      const authResult = await testAuthentication(apiUrl, anonKey);
      
      setTestResults({
        timestamp: new Date().toISOString(),
        cors: corsResult,
        profiles: profilesResult,
        auth: authResult,
        environment: {
          api: import.meta.env.VITE_SUPABASE_URL,
          origin: window.location.origin
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Exécuter le test automatiquement au chargement du composant
  useEffect(() => {
    runTest();
  }, []);
  
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Diagnostic de Connexion Supabase</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          <strong>Erreur:</strong> {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center">
          <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Test en cours...</span>
        </div>
      ) : (
        testResults && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Test effectué le {new Date(testResults.timestamp).toLocaleString()}
            </div>
            
            {/* Environnement */}
            <div className="bg-gray-50 p-3 rounded">
              <h3 className="font-medium">Environnement</h3>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div>API Supabase:</div>
                <div className="font-mono">{testResults.environment.api}</div>
                <div>Origine:</div>
                <div className="font-mono">{testResults.environment.origin}</div>
              </div>
            </div>
            
            {/* Test CORS */}
            <div className={`p-3 rounded ${testResults.cors.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className="font-medium flex items-center">
                <div 
                  className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    testResults.cors.success ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                Configuration CORS
              </h3>
              <div className="mt-2 text-sm">
                <p>{testResults.cors.message}</p>
                {testResults.cors.headers && (
                  <details className="mt-2">
                    <summary className="cursor-pointer">Détails des en-têtes</summary>
                    <pre className="mt-2 bg-gray-800 text-white p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(testResults.cors.headers, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
            
            {/* Test Profiles */}
            <div className={`p-3 rounded ${testResults.profiles.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className="font-medium flex items-center">
                <div 
                  className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    testResults.profiles.success ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                Accès aux Données
              </h3>
              <p className="mt-2 text-sm">{testResults.profiles.message}</p>
            </div>
            
            {/* Test Auth */}
            <div className={`p-3 rounded ${testResults.auth.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className="font-medium flex items-center">
                <div 
                  className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    testResults.auth.success ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                Service d'Authentification
              </h3>
              <p className="mt-2 text-sm">{testResults.auth.message}</p>
            </div>
            
            <div className="mt-4">
              <button 
                onClick={runTest}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Test en cours...' : 'Relancer le test'}
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default CorsTestComponent;