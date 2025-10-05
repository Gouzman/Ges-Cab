-- Script de nettoyage - À exécuter si vous avez besoin de repartir de zéro
-- ⚠️ ATTENTION : Ce script supprime TOUTES les données de permissions !

-- 1. Supprimer les triggers
DROP TRIGGER IF EXISTS on_auth_user_created_permissions ON public.profiles;
DROP TRIGGER IF EXISTS update_user_permissions_updated_at ON public.user_permissions;

-- 2. Supprimer les fonctions
DROP FUNCTION IF EXISTS public.handle_new_user_permissions();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_permissions_timestamp();

-- 3. Supprimer les politiques RLS
DROP POLICY IF EXISTS "Users can view own permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Managers can modify permissions" ON public.user_permissions;

-- 4. Supprimer les tables (dans l'ordre des dépendances)
DROP TABLE IF EXISTS public.user_permissions CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- 5. Vérification finale
SELECT 'Nettoyage terminé - vous pouvez maintenant relancer l''installation' as status;

-- 6. Afficher les tables restantes pour vérification
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('roles', 'user_permissions');