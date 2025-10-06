/**
 * Service de Rate Limiting côté client
 * Implémente un système de token bucket pour limiter les requêtes
 */

class RateLimiter {
  constructor() {
    this.buckets = new Map(); // Stockage des buckets par clé
    this.config = {
      maxRequests: parseInt(import.meta.env.VITE_API_RATE_LIMIT) || 50,
      windowMs: parseInt(import.meta.env.VITE_RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
      refillRate: 1000, // Refill toutes les secondes
    };
  }

  /**
   * Vérifie si une requête est autorisée
   * @param {string} key - Identifiant unique (ex: endpoint + userId)
   * @returns {boolean} - true si autorisé, false sinon
   */
  isAllowed(key = 'default') {
    const now = Date.now();
    const bucket = this.getBucket(key);

    // Refill du bucket basé sur le temps écoulé
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(timePassed / this.config.refillRate);
    
    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(
        bucket.tokens + tokensToAdd,
        this.config.maxRequests
      );
      bucket.lastRefill = now;
    }

    // Vérifier si des tokens sont disponibles
    if (bucket.tokens > 0) {
      bucket.tokens--;
      return true;
    }

    // Log de la tentative bloquée
    if (import.meta.env.VITE_APP_ENV === 'development') {
      console.warn(`🚫 Rate limit atteint pour: ${key}. Prochaine requête autorisée dans ${this.getRetryAfter(bucket)}ms`);
    }

    return false;
  }

  /**
   * Obtient ou crée un bucket pour une clé
   * @param {string} key 
   * @returns {Object}
   */
  getBucket(key) {
    if (!this.buckets.has(key)) {
      this.buckets.set(key, {
        tokens: this.config.maxRequests,
        lastRefill: Date.now(),
        createdAt: Date.now(),
      });
    }
    return this.buckets.get(key);
  }

  /**
   * Calcule le temps d'attente avant la prochaine requête
   * @param {Object} bucket 
   * @returns {number}
   */
  getRetryAfter(bucket) {
    return this.config.refillRate - (Date.now() - bucket.lastRefill);
  }

  /**
   * Nettoyage périodique des buckets anciens
   */
  cleanup() {
    const now = Date.now();
    const maxAge = this.config.windowMs * 2; // 2x la fenêtre de temps

    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.createdAt > maxAge) {
        this.buckets.delete(key);
      }
    }
  }

  /**
   * Obtient les statistiques de rate limiting
   * @returns {Object}
   */
  getStats() {
    return {
      activeBuckets: this.buckets.size,
      config: this.config,
      buckets: Array.from(this.buckets.entries()).map(([key, bucket]) => ({
        key,
        tokens: bucket.tokens,
        lastRefill: bucket.lastRefill,
      })),
    };
  }
}

// Instance globale du rate limiter
export const rateLimiter = new RateLimiter();

// Nettoyage automatique toutes les 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Wrapper pour les appels Supabase avec rate limiting
 * @param {Function} supabaseCall - Fonction Supabase à appeler
 * @param {string} endpoint - Identifiant de l'endpoint pour le rate limiting
 * @returns {Promise}
 */
export async function withRateLimit(supabaseCall, endpoint = 'default') {
  // Vérification du rate limit
  if (!rateLimiter.isAllowed(endpoint)) {
    const error = new Error(`Rate limit dépassé pour ${endpoint}`);
    error.name = 'RateLimitError';
    error.retryAfter = rateLimiter.getRetryAfter(rateLimiter.getBucket(endpoint));
    throw error;
  }

  // Exécution de l'appel
  try {
    const result = await supabaseCall();
    return result;
  } catch (error) {
    // En cas d'erreur, on ne consomme pas le token (remboursement)
    const bucket = rateLimiter.getBucket(endpoint);
    bucket.tokens = Math.min(bucket.tokens + 1, rateLimiter.config.maxRequests);
    throw error;
  }
}

export default rateLimiter;