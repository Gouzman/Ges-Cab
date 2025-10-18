import { createClient } from '@supabase/supabase-js';
import { rateLimiter } from './rateLimiter.js';
import corsProxyHelper from './corsProxy.js';

// Configuration sécurisée via variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validation des variables d'environnement
if (!supabaseUrl || !supabaseKey) {
  console.error('Configuration Supabase manquante. Utilisation des valeurs par défaut.');
  console.warn('Cette erreur peut apparaître pendant la construction. En production, les variables devraient être définies.');
}

// Options de configuration améliorées pour le client Supabase
const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: import.meta.env.DEV // Active le debug seulement en développement
  },
  global: {
    headers: {
      'X-Client-Info': `ges-cab/${import.meta.env.VITE_APP_VERSION || '1.0.0'}`
    }
  },
  // Gérer les timeouts pour éviter les problèmes de connexion
  realtime: {
    timeout: 30000, // 30 secondes
  }
};

// Utiliser l'URL locale avec proxy en développement, URL complète en production
const finalSupabaseUrl = import.meta.env.DEV 
  ? `${window.location.origin}/api/supabase`
  : (supabaseUrl || 'https://api.ges-cab.com');

// Configurer le client avec des options spécifiques selon l'environnement
const clientOptions = { ...options };

// En mode développement, ajouter des en-têtes personnalisés
if (import.meta.env.DEV) {
  clientOptions.global = {
    ...clientOptions.global,
    headers: {
      ...clientOptions.global.headers,
      'X-Dev-Mode': 'true'
    }
  };
}

// Client Supabase avec rate limiting intégré
const supabaseClient = createClient(
  finalSupabaseUrl,
  supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlc2NhYiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzYwNDI5NzYwfQ.ooZf1q1eWVOj-3xrFrvR3OazM9RV7i0npZyBxJKp6V4',
  clientOptions
);

// On assigne à la variable supabase pour la compatibilité
const supabase = supabaseClient;

/**
 * Vérifie la connexion à Supabase
 * @returns {Promise<Object>} Statut de la connexion
 */
async function checkSupabaseConnection() {
  try {
    // Tester la connexion avec un appel simple
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erreur lors de la vérification de connexion:', error);
      return { connected: false, error };
    }
    
    return { connected: true, data };
  } catch (error) {
    console.error('❌ Exception lors de la vérification de connexion:', error);
    return { connected: false, error };
  }
}

// Proxy pour intercepter les appels et appliquer le rate limiting
const createRateLimitedProxy = (client) => {
  return new Proxy(client, {
    get(target, prop) {
      if (prop === 'from') {
        return (table) => {
          const tableQuery = target.from(table);
          
          // Applique le rate limiting sur les méthodes de requête
          return new Proxy(tableQuery, {
            get(queryTarget, queryProp) {
              const originalMethod = queryTarget[queryProp];
              
              if (typeof originalMethod === 'function' && 
                  ['select', 'insert', 'update', 'delete', 'upsert'].includes(queryProp)) {
                
                return function(...args) {
                  // Vérification du rate limit avant l'exécution (silencieux)
                  if (!rateLimiter.isAllowed(`${queryProp}_${table}`)) {
                    return Promise.reject(new Error(`Trop de requêtes. Veuillez patienter.`));
                  }
                  
                  return originalMethod.apply(this, args);
                };
              }
              
              return originalMethod;
            }
          });
        };
      }
      
      return target[prop];
    }
  });
};

/**
 * Fonction pour diagnostiquer les problèmes CORS
 * Cette fonction peut être appelée pour tester la configuration CORS et identifier les problèmes
 * @param {String} endpoint - L'endpoint à tester (par défaut: 'rest/v1/profiles')
 */
async function diagnoseCorsIssue(endpoint = 'rest/v1/profiles') {
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

// Exportation du client et des fonctions utilitaires
export { supabase, checkSupabaseConnection, diagnoseCorsIssue, createClient };

// Pour la compatibilité avec l'ancien code
export default supabase;