/**
 * Utilitaire pour les connexions directes à PostgreSQL (optionnel)
 * Ce module n'est utilisé que pour les opérations spéciales qui nécessitent
 * un accès direct à la base de données (migrations, requêtes complexes, etc.)
 * 
 * Pour les opérations courantes, utilisez toujours le client Supabase:
 * import { supabase } from '@/lib/customSupabaseClient';
 */

import pg from 'pg';
const { Pool } = pg;

// Configuration depuis les variables d'environnement
const dbConfig = {
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  port: import.meta.env.VITE_DB_PORT || 5433, // Par défaut, utilise le port local du tunnel SSH
  database: import.meta.env.VITE_DB_NAME || 'ges_cab_prod',
  user: import.meta.env.VITE_DB_USER || 'supabase_admin',
  password: import.meta.env.VITE_DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false // Nécessaire si le serveur utilise un certificat auto-signé
  },
  max: 5, // Nombre maximum de connexions dans le pool
  idleTimeoutMillis: 30000, // Délai d'inactivité avant de fermer une connexion
};

// Crée un pool de connexions
const pool = new Pool(dbConfig);

// Gestionnaire d'erreur pour le pool de connexions
pool.on('error', (err) => {
  console.error('Erreur inattendue sur le client PostgreSQL inactif', err);
  // En production, vous pourriez vouloir redémarrer le pool ou notifier les administrateurs
});

/**
 * Exécute une requête SQL directement sur la base de données.
 * À utiliser avec précaution, uniquement lorsque l'API Supabase n'est pas suffisante.
 * 
 * @param {string} query - La requête SQL à exécuter
 * @param {Array} params - Les paramètres de la requête (pour éviter les injections SQL)
 * @returns {Promise<Object>} - Résultat de la requête
 */
export async function executeQuery(query, params = []) {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête SQL:', error);
    throw error;
  } finally {
    if (client) client.release();
  }
}

/**
 * Ferme toutes les connexions du pool.
 * À appeler lors de la fermeture de l'application si nécessaire.
 */
export async function closePool() {
  try {
    await pool.end();
  } catch (error) {
    console.error('Erreur lors de la fermeture du pool de connexions:', error);
  }
}

export default {
  executeQuery,
  closePool,
  pool, // Exposé uniquement pour des cas d'utilisation avancés
};
