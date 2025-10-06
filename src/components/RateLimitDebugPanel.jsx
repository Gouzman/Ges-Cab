import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Activity } from 'lucide-react';
import { useRateLimitMonitor } from '@/hooks/useRateLimitMonitor';

/**
 * Composant de debug pour visualiser l'état du rate limiting
 * Affiché uniquement en développement
 */
const RateLimitDebugPanel = () => {
  const { stats, isBlocked } = useRateLimitMonitor();

  // N'affiche le panel qu'en développement
  if (import.meta.env.VITE_APP_ENV !== 'development') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-4 right-4 bg-cabinet-card border border-cabinet-border rounded-lg p-4 shadow-lg max-w-sm z-50"
    >
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-btn-primary" />
        <h3 className="text-sm font-semibold text-cabinet-text">Rate Limiting</h3>
        {isBlocked && (
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>

      <div className="space-y-2 text-xs text-cabinet-text-secondary">
        <div className="flex items-center justify-between">
          <span>Buckets actifs:</span>
          <span className="font-mono">{stats.activeBuckets}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Limite/minute:</span>
          <span className="font-mono">{stats.config.maxRequests}</span>
        </div>

        {stats.buckets.length > 0 && (
          <div className="mt-3 pt-2 border-t border-cabinet-border">
            <div className="flex items-center gap-1 mb-2">
              <Activity className="w-3 h-3" />
              <span className="font-semibold">Activité récente:</span>
            </div>
            
            {stats.buckets.slice(0, 3).map((bucket, index) => (
              <div key={bucket.key} className="flex items-center justify-between py-1">
                <span className="truncate max-w-20" title={bucket.key}>
                  {bucket.key}
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-mono">{bucket.tokens}</span>
                  <Clock className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RateLimitDebugPanel;