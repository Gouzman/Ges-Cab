import { createClient } from '@supabase/supabase-js';

/**
 * Configuration Supabase pour l'application Ges-Cab
 * Cette configuration utilise les variables d'environnement définies dans .env.local ou .env.production
 */

// Récupération des configurations depuis les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Options de configuration avancées pour le client Supabase
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    // Configuration des timeouts pour améliorer la fiabilité
    headers: {
      'X-Client-Info': 'ges-cab-app',
    },
    fetch: (url, options) => {
      // Timeout personnalisé pour les requêtes (15 secondes - augmenté pour plus de stabilité)
      const timeout = 15000;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      
      // Ajout de la gestion des erreurs CORS
      const enhancedOptions = {
        ...options,
        signal: controller.signal,
        credentials: 'include', // Inclure les cookies si nécessaire
        mode: 'cors', // Forcer le mode CORS
        headers: {
          ...options.headers,
          'Accept': 'application/json',
        }
      };
      
      const fetchPromise = fetch(url, enhancedOptions)
        .catch(error => {
          if (error.name === 'AbortError') {
            console.error(`⏱️ Requête vers ${url} a expiré après ${timeout/1000}s`);
            throw new Error(`La requête a expiré après ${timeout/1000} secondes.`);
          }
          if (error.message && error.message.includes('CORS')) {
            console.error(`🌐 Erreur CORS détectée pour ${url}. Veuillez vérifier la configuration CORS du serveur.`);
          }
          
          // Si l'erreur concerne api.ges-cab.com, suggérer des alternatives
          if (url.includes('api.ges-cab.com')) {
            console.error(`❌ Impossible de se connecter à api.ges-cab.com`);
            console.info(`💡 Suggestion: Vérifiez que le serveur API est démarré ou utilisez une instance locale Supabase`);
          }
          
          throw error;
        });
      
      return fetchPromise.finally(() => clearTimeout(id));
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    // Configuration pour les fonctionnalités temps réel
    timeout: 30000,
    params: {
      eventsPerSecond: 10,
    },
  },
};

// Création du client Supabase avec logging amélioré
let supabaseInstance;

try {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);
  
  // Log de confirmation (en développement uniquement)
  if (import.meta.env.DEV) {
    console.info(`✅ Client Supabase initialisé avec succès [URL: ${supabaseUrl}]`);
  }
} catch (error) {
  console.error('❌ Erreur lors de l\'initialisation du client Supabase:', error);
  
  // Création d'un client de secours pour éviter les erreurs d'application
  supabaseInstance = createClient(
    'https://api.ges-cab.com',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlc2NhYiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjk4NzQwMDAwfQ.xyz123',
    supabaseOptions
  );
  
  // Notification d'erreur si le mode debug est activé
  if (import.meta.env.VITE_DEBUG_MODE === 'true') {
    alert('Erreur de connexion à la base de données. Veuillez contacter votre administrateur.');
  }
}

// Exportation du client Supabase
export const supabase = supabaseInstance;

/**
 * Hook pour obtenir le statut de connexion à Supabase
 * Utile pour les composants qui ont besoin de vérifier si la connexion est active
 */
export async function checkSupabaseConnection() {
  try {
    // Vérifier d'abord la connexion avec un appel simple à la session
    // C'est plus fiable que d'essayer d'accéder à une table qui pourrait ne pas exister
    const { error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erreur de connexion à Supabase Auth:', sessionError);
      return { connected: false, error: sessionError };
    }
    
    // Essayer d'accéder à la table profiles qui devrait exister
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      // Si la table n'existe pas, essayer une autre table commune
      const { data: altData, error: altError } = await supabase.from('users').select('count').limit(1);
      
      if (altError) {
        console.error('❌ Erreur de connexion à Supabase Data:', error);
        // Même si la table n'existe pas, si nous avons pu nous connecter à auth, considérer que la connexion est OK
        return { connected: true, error: error, message: "Connexion établie mais erreur d'accès aux tables" };
      }
      
      return { connected: true, data: altData };
    }
    
    return { connected: true, data };
  } catch (error) {
    console.error('❌ Exception lors de la vérification de connexion à Supabase:', error);
    return { connected: false, error };
  }
}

/**
 * Fonction utilitaire pour gérer les erreurs Supabase de manière cohérente
 * @param {Object} error - L'objet d'erreur retourné par Supabase
 * @param {String} context - Le contexte dans lequel l'erreur s'est produite
 */
export function handleSupabaseError(error, context = 'opération') {
  if (!error) return;
  
  // Log de l'erreur (toujours)
  console.error(`❌ Erreur Supabase (${context}):`, error);
  
  // Afficher une notification à l'utilisateur si la journalisation des erreurs est activée
  if (import.meta.env.VITE_ERROR_REPORTING === 'true') {
    // Cette fonction dépend de votre système de notification
    // Par exemple, avec react-toastify :
    // toast.error(`Une erreur est survenue lors de ${context}: ${error.message || 'Erreur inconnue'}`);
    
    // Si vous n'avez pas de système de notification, vous pouvez utiliser alert() en développement
    if (import.meta.env.DEV) {
      alert(`Erreur lors de ${context}: ${error.message || 'Erreur inconnue'}`);
    }
  }
  
  return error;
}

/**
 * Fonction pour diagnostiquer les problèmes CORS
 * Cette fonction peut être appelée pour tester la configuration CORS et identifier les problèmes
 * @param {String} endpoint - L'endpoint à tester (par défaut: 'rest/v1/profiles')
 */
export async function diagnoseCorsIssue(endpoint = 'rest/v1/profiles') {
  try {
    console.info('🔍 Diagnostic CORS en cours...');
    
    // Construction de l'URL complète
    const url = `${supabaseUrl}/${endpoint}`;
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
}

// Exporter les fonctions individuellement
export { supabase, checkSupabaseConnection, handleSupabaseError, diagnoseCorsIssue };