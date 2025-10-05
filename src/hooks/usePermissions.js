import { useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { checkPermission, isAdmin, canManagePermissions, getUserAccessLevel } from '@/lib/permissions';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = useCallback((module, action = null) => {
    return checkPermission(user?.permissions, module, action);
  }, [user?.permissions]);

  const hasModuleAccess = useCallback((module) => {
    return hasPermission(module);
  }, [hasPermission]);

  const canPerformAction = useCallback((module, action) => {
    return hasPermission(module, action);
  }, [hasPermission]);

  const userIsAdmin = useCallback(() => {
    return isAdmin(user);
  }, [user]);

  const userCanManagePermissions = useCallback(() => {
    return canManagePermissions(user);
  }, [user]);

  const userAccessLevel = useCallback(() => {
    return getUserAccessLevel(user);
  }, [user]);

  return {
    hasPermission,
    hasModuleAccess,
    canPerformAction,
    userIsAdmin,
    userCanManagePermissions,
    userAccessLevel,
    currentUser: user
  };
};

export default usePermissions;