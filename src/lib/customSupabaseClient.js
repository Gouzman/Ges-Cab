import { createClient } from '@supabase/supabase-js';
import { rateLimiter } from './rateLimiter.js';

// Configuration sécurisée via variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validation des variables d'environnement
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Configuration Supabase manquante. Vérifiez que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définis dans votre fichier .env.local'
  );
}

// Client Supabase avec rate limiting intégré
const supabaseClient = createClient(supabaseUrl, supabaseKey);

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

// Export du client avec rate limiting
export const supabase = createRateLimitedProxy(supabaseClient);

// Export du client original pour les cas spéciaux
export const supabaseRaw = supabaseClient;