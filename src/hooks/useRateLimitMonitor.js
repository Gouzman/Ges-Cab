import { useState, useEffect } from 'react';
import { rateLimiter } from '@/lib/rateLimiter';

/**
 * Hook React pour surveiller l'état du rate limiting
 * @returns {Object} État et statistiques du rate limiting
 */
export const useRateLimitMonitor = () => {
  const [stats, setStats] = useState(() => rateLimiter.getStats());
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    // Mise à jour périodique des statistiques
    const interval = setInterval(() => {
      setStats(rateLimiter.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const checkRateLimit = (endpoint = 'default') => {
    const allowed = rateLimiter.isAllowed(endpoint);
    setIsBlocked(!allowed);
    return allowed;
  };

  const getRemainingRequests = (endpoint = 'default') => {
    const bucket = rateLimiter.getBucket(endpoint);
    return bucket.tokens;
  };

  return {
    stats,
    isBlocked,
    checkRateLimit,
    getRemainingRequests,
    rateLimiter,
  };
};

export default useRateLimitMonitor;