import { supabase } from '../lib/customSupabaseClient.js';

/**
 * Composant de test pour vérifier la configuration Supabase
 * Ce composant teste la connexion et l'authentification Supabase
 */
export default function SupabaseConnectionTest() {
  const [testResults, setTestResults] = React.useState({
    loading: true,
    configCheck: null,
    connectionTest: null,
    authTest: null
  });

  React.useEffect(() => {
    runSupabaseTests();
  }, []);

  const runSupabaseTests = async () => {
    console.log('🔍 Démarrage des tests Supabase...');
    
    const results = {
      loading: false,
      configCheck: null,
      connectionTest: null,
      authTest: null
    };

    // Test 1: Vérification de la configuration
    try {
      const config = {
        url: import.meta.env.VITE_SUPABASE_URL,
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        hasValidKey: import.meta.env.VITE_SUPABASE_ANON_KEY && !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('xyz123')
      };
      
      results.configCheck = {
        success: config.url && config.anonKey && config.hasValidKey,
        details: config,
        message: config.hasValidKey ? 'Configuration valide' : 'Clé API invalide détectée'
      };
      
      console.log('✅ Test de configuration:', results.configCheck);
    } catch (error) {
      results.configCheck = {
        success: false,
        error: error.message,
        message: 'Erreur de configuration'
      };
      console.error('❌ Test de configuration échoué:', error);
    }

    // Test 2: Test de connexion basique
    try {
      console.log('🔄 Test de connexion à Supabase...');
      
      // Test simple avec une requête sans authentification
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        results.connectionTest = {
          success: false,
          error: error.message,
          code: error.code,
          message: `Erreur de connexion: ${error.message}`
        };
        console.error('❌ Test de connexion échoué:', error);
      } else {
        results.connectionTest = {
          success: true,
          data: data,
          message: 'Connexion Supabase réussie'
        };
        console.log('✅ Test de connexion réussi:', data);
      }
    } catch (error) {
      results.connectionTest = {
        success: false,
        error: error.message,
        message: `Exception de connexion: ${error.message}`
      };
      console.error('❌ Exception lors du test de connexion:', error);
    }

    // Test 3: Test d'authentification
    try {
      console.log('🔄 Test d\'authentification...');
      
      const { data: session, error } = await supabase.auth.getSession();
      
      results.authTest = {
        success: !error,
        hasSession: !!session?.session,
        error: error?.message,
        message: error ? `Erreur auth: ${error.message}` : 'Service d\'authentification fonctionnel'
      };
      
      console.log('✅ Test d\'authentification:', results.authTest);
    } catch (error) {
      results.authTest = {
        success: false,
        error: error.message,
        message: `Exception auth: ${error.message}`
      };
      console.error('❌ Exception lors du test d\'authentification:', error);
    }

    setTestResults(results);
    
    // Résumé console
    console.log('📊 Résumé des tests Supabase:');
    console.log('  - Configuration:', results.configCheck?.success ? '✅' : '❌');
    console.log('  - Connexion:', results.connectionTest?.success ? '✅' : '❌');
    console.log('  - Authentification:', results.authTest?.success ? '✅' : '❌');
  };

  if (testResults.loading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold text-blue-800">🔍 Test de connexion Supabase en cours...</h3>
        <p className="text-blue-600">Vérification de la configuration et connectivité...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">🧪 Résultats des tests Supabase</h2>
      
      {/* Test de configuration */}
      <div className={`p-3 border rounded-lg ${testResults.configCheck?.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <h3 className="font-semibold flex items-center">
          {testResults.configCheck?.success ? '✅' : '❌'} Configuration
        </h3>
        <p className="text-sm mt-1">{testResults.configCheck?.message}</p>
        {testResults.configCheck?.details && (
          <details className="mt-2 text-xs">
            <summary className="cursor-pointer">Détails</summary>
            <pre className="mt-1 p-2 bg-gray-100 rounded">
              {JSON.stringify(testResults.configCheck.details, null, 2)}
            </pre>
          </details>
        )}
      </div>

      {/* Test de connexion */}
      <div className={`p-3 border rounded-lg ${testResults.connectionTest?.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <h3 className="font-semibold flex items-center">
          {testResults.connectionTest?.success ? '✅' : '❌'} Connexion API
        </h3>
        <p className="text-sm mt-1">{testResults.connectionTest?.message}</p>
        {testResults.connectionTest?.error && (
          <p className="text-xs text-red-600 mt-1">Erreur: {testResults.connectionTest.error}</p>
        )}
      </div>

      {/* Test d'authentification */}
      <div className={`p-3 border rounded-lg ${testResults.authTest?.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <h3 className="font-semibold flex items-center">
          {testResults.authTest?.success ? '✅' : '❌'} Authentification
        </h3>
        <p className="text-sm mt-1">{testResults.authTest?.message}</p>
        {testResults.authTest?.error && (
          <p className="text-xs text-red-600 mt-1">Erreur: {testResults.authTest.error}</p>
        )}
      </div>

      <button
        onClick={runSupabaseTests}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        🔄 Relancer les tests
      </button>
    </div>
  );
}