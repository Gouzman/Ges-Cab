import { createClient } from '@supabase/supabase-js';
import { rateLimiter } from './rateLimiter.js';

// Configuration selon l'environnement
const isProduction = import.meta.env.VITE_ENVIRONMENT === 'production';
const isDevelopment = import.meta.env.VITE_ENVIRONMENT === 'development' || import.meta.env.DEV;

console.log('🔧 Environment:', import.meta.env.VITE_ENVIRONMENT || 'development');
console.log('🔧 Is Production:', isProduction);
console.log('🔧 Is Development:', isDevelopment);

// Configuration pour la production (Supabase Cloud)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Configuration pour le développement (API locale)
// Configuration pour le développement (API locale)
const localApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3003';

// Adaptateur pour l'API locale PostgreSQL
class LocalApiAdapter {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  from(tableName) {
    return new LocalQueryBuilder(tableName, this.baseUrl);
  }

  get storage() {
    return {
      from: (bucket) => new LocalStorageAdapter(bucket)
    };
  }

  get auth() {
    return {
      getUser: async () => ({ data: null, error: null }),
      signIn: async () => ({ data: null, error: null }),
      signUp: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null })
    };
  }
}

class LocalQueryBuilder {
  constructor(tableName, baseUrl) {
    this.tableName = tableName;
    this.baseUrl = baseUrl;
    this.selectFields = '*';
    this.whereConditions = {};
    this.orderByClause = '';
    this.limitValue = null;
    this.isSingleQuery = false;
  }

  select(fields = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(column, value) {
    this.whereConditions[column] = value;
    return this;
  }

  not(column, operator, value) {
    // Pour l'instant, on gère seulement le cas "not null"
    if (operator === 'is' && value === null) {
      this.whereConditions[`${column}_not_null`] = true;
    }
    return this;
  }

  order(column, options = {}) {
    const direction = options.ascending === false ? 'desc' : 'asc';
    this.orderByClause = `${column}.${direction}`;
    return this;
  }

  limit(count) {
    this.limitValue = count;
    return this;
  }

  single() {
    this.isSingleQuery = true;
    return this;
  }

  async insert(data) {
    try {
      const response = await fetch(`${this.baseUrl}/api/${this.tableName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Retourner un objet qui a une méthode select() pour compatibilité avec Supabase
      return {
        data: result.data,
        error: result.error,
        select: () => ({
          single: async () => ({ data: result.data, error: result.error })
        })
      };
    } catch (error) {
      console.error('Insert error:', error);
      return { 
        data: null, 
        error,
        select: () => ({
          single: async () => ({ data: null, error })
        })
      };
    }
  }

  async update(data) {
    try {
      // Pour update, nous devons avoir un ID dans les conditions WHERE
      const id = this.whereConditions.id;
      if (!id) {
        return { data: null, error: new Error('ID required for update') };
      }

      const response = await fetch(`${this.baseUrl}/api/${this.tableName}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Update error:', error);
      return { data: null, error };
    }
  }

  async delete() {
    try {
      const id = this.whereConditions.id;
      if (!id) {
        return { data: null, error: new Error('ID required for delete') };
      }

      const response = await fetch(`${this.baseUrl}/api/${this.tableName}/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Delete error:', error);
      return { data: null, error };
    }
  }

  // Méthode pour exécuter une requête GET
  async then(onResolve, onReject) {
    try {
      let url = `${this.baseUrl}/api/${this.tableName}`;
      const params = new URLSearchParams();

      // Ajouter les paramètres de requête
      Object.keys(this.whereConditions).forEach(key => {
        if (key === 'assigned_to_id') {
          params.append('user_id', this.whereConditions[key]);
        }
      });

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (this.isSingleQuery && result.data && result.data.length > 0) {
        result.data = result.data[0];
      }

      return onResolve ? onResolve(result) : result;
    } catch (error) {
      console.error('Query error:', error);
      const errorResult = { data: null, error };
      return onReject ? onReject(errorResult) : errorResult;
    }
  }

  catch(onReject) {
    return this.then(null, onReject);
  }
}

class LocalStorageAdapter {
  constructor(bucket) {
    this.bucket = bucket;
  }

  async upload(path, file) {
    // Simulation d'upload pour le développement
    console.log(`🔄 Simulating file upload: ${path}`);
    return { data: { path }, error: null };
  }

  async download(path) {
    // Simulation de téléchargement
    console.log(`🔄 Simulating file download: ${path}`);
    return { data: new Blob(), error: null };
  }
}

// Créer le client approprié selon l'environnement
let supabase;

if (isProduction && supabaseUrl && supabaseAnonKey) {
  // Production : utiliser Supabase Cloud
  console.log('🔗 Using Supabase Cloud for production');
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  });
  supabase = supabaseClient;
} else {
  // Développement : utiliser l'API locale PostgreSQL
  console.log('🔗 Using Local PostgreSQL API for development');
  console.log('🔗 Local API URL:', localApiUrl);
  supabase = new LocalApiAdapter(localApiUrl);
}

// On assigne à la variable supabase pour la compatibilité
const client = supabase;

/**
 * Vérifie la connexion à la base de données
 * @returns {Promise<Object>} Statut de la connexion
 */
async function checkConnection() {
  try {
    if (isProduction) {
      // Tester la connexion Supabase
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        console.error('❌ Erreur lors de la vérification de connexion Supabase:', error);
        return { connected: false, error };
      }
      
      return { connected: true, data };
    } else {
      // Tester la connexion API locale
      const response = await fetch(`${localApiUrl}/api/health`);
      const result = await response.json();
      
      if (result.status === 'ok') {
        return { connected: true, data: result };
      } else {
        return { connected: false, error: result.message };
      }
    }
  } catch (error) {
    console.error('❌ Exception lors de la vérification de connexion:', error);
    return { connected: false, error };
  }
}



// Exportation du client et des fonctions utilitaires
export { client as supabase, checkConnection };
export { createClient } from '@supabase/supabase-js';

// Pour la compatibilité avec l'ancien code
export default client;