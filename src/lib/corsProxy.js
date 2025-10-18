/**
 * Module de proxy CORS pour contourner les problèmes de CORS en développement
 * Ce module fournit une fonction pour router les requêtes via un proxy CORS si nécessaire
 */

// URL du proxy CORS public qui peut être utilisé temporairement (UNIQUEMENT pour le développement)
const CORS_PROXY_URL = 'https://corsproxy.io/?';

// Sauvegarde de la fonction fetch originale pour éviter les boucles infinies
const originalFetch = window.fetch.bind(window);

// Garder une trace des requêtes déjà envoyées via proxy pour éviter les boucles
const proxiedRequests = new Set();

/**
 * Détermine si une URL doit être proxy en fonction de l'environnement et des erreurs précédentes
 * @param {string} url - L'URL originale à vérifier
 * @returns {boolean} - Vrai si l'URL doit être proxy
 */
export function shouldUseProxy(url) {
  // Uniquement utiliser le proxy en développement et non en production
  if (!import.meta.env.DEV) return false;
  
  // Ne pas utiliser le proxy pour les ressources locales
  if (url.startsWith('/') || url.startsWith(window.location.origin)) return false;
  
  // Vérifier le localStorage pour voir si ce domaine a déjà échoué avec CORS
  const corsFailedDomains = JSON.parse(localStorage.getItem('cors_failed_domains') || '[]');
  const urlDomain = new URL(url).hostname;
  
  return corsFailedDomains.includes(urlDomain);
}

/**
 * Marque un domaine comme ayant échoué à cause de CORS
 * @param {string} url - L'URL qui a échoué
 */
export function markDomainAsCorsFailure(url) {
  try {
    const urlDomain = new URL(url).hostname;
    const corsFailedDomains = JSON.parse(localStorage.getItem('cors_failed_domains') || '[]');
    
    if (!corsFailedDomains.includes(urlDomain)) {
      corsFailedDomains.push(urlDomain);
      localStorage.setItem('cors_failed_domains', JSON.stringify(corsFailedDomains));
      console.warn(`Domaine ${urlDomain} marqué comme problématique pour CORS. Les prochaines requêtes utiliseront un proxy.`);
    }
  } catch (error) {
    console.error('Erreur lors du marquage du domaine:', error);
  }
}

/**
 * Transforme une URL pour la router via un proxy CORS si nécessaire
 * @param {string} url - L'URL originale
 * @returns {string} - L'URL transformée avec ou sans proxy
 */
export function getProxiedUrl(url) {
  if (shouldUseProxy(url)) {
    return `${CORS_PROXY_URL}${encodeURIComponent(url)}`;
  }
  return url;
}

/**
 * Wrapper pour fetch qui utilise automatiquement un proxy CORS si nécessaire
 * @param {string} url - L'URL à fetcher
 * @param {Object} options - Options pour fetch
 * @param {Boolean} isRetry - Indique si c'est une tentative de retry après échec CORS
 * @returns {Promise<Response>} - La réponse fetch
 */
export async function fetchWithCorsHandling(url, options = {}, isRetry = false) {
  // Créer une clé unique pour cette requête
  const requestKey = url.toString() + JSON.stringify(options);
  
  // Vérifier si cette requête est déjà un retry pour éviter les boucles
  if (proxiedRequests.has(requestKey)) {
    console.warn("Évitement d'une boucle de proxy CORS");
    throw new Error("Boucle de proxy CORS détectée. Impossible de résoudre les problèmes CORS.");
  }

  try {
    // Si c'est déjà un retry ou si l'URL doit utiliser le proxy directement
    if (isRetry || shouldUseProxy(url)) {
      const proxiedUrl = getProxiedUrl(url);
      
      // Marquer cette requête comme déjà proxiée
      proxiedRequests.add(requestKey);
      
      console.log(`Utilisation du proxy CORS pour: ${url}`);
      return originalFetch(proxiedUrl, options);
    }

    // Premier essai normal avec originalFetch pour éviter la boucle d'interception
    return originalFetch(url, options);
  } catch (error) {
    // Si l'erreur semble liée à CORS et que ce n'est pas encore un retry
    if (!isRetry && (error.message.includes('CORS') || error.message.includes('Failed to fetch'))) {
      console.warn(`Problème CORS détecté avec ${url}, tentative avec proxy...`);
      markDomainAsCorsFailure(url);
      
      // Réessayer avec le proxy
      return fetchWithCorsHandling(url, options, true);
    }
    
    throw error;
  }
}

export default {
  shouldUseProxy,
  getProxiedUrl,
  fetchWithCorsHandling,
  markDomainAsCorsFailure
};