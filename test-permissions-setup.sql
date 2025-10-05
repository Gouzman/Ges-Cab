-- SCRIPT DE TEST - Vérification du système de permissions
-- Exécuter après avoir complété toutes les étapes de setup

-- 1. Vérifier que les tables existent
SELECT 'Tables créées:' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('roles', 'user_permissions', 'profiles');

-- 2. Vérifier les rôles
SELECT 'Rôles disponibles:' as status;
SELECT name, description FROM public.roles ORDER BY name;

-- 3. Vérifier les index
SELECT 'Index créés:' as status;
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('user_permissions', 'profiles') 
AND schemaname = 'public';

-- 4. Vérifier les politiques RLS
SELECT 'Politiques RLS:' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'user_permissions';

-- 5. Vérifier les triggers
SELECT 'Triggers actifs:' as status;
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('user_permissions', 'profiles');

-- 6. Vérifier les permissions des utilisateurs
SELECT 'Permissions utilisateurs:' as status;
SELECT 
    p.name,
    p.email,
    p.function,
    p.role,
    CASE 
        WHEN up.permissions IS NOT NULL THEN 'Permissions configurées'
        ELSE 'Aucune permission'
    END as permission_status,
    up.created_at as permissions_created_at
FROM public.profiles p
LEFT JOIN public.user_permissions up ON p.id = up.user_id
ORDER BY p.function, p.name;

-- 7. Test de la fonction de permissions par défaut
SELECT 'Test permissions par défaut:' as status;
SELECT 
    COUNT(*) as total_users,
    COUNT(up.user_id) as users_with_permissions,
    ROUND((COUNT(up.user_id) * 100.0 / COUNT(*)), 2) as percentage_configured
FROM public.profiles p
LEFT JOIN public.user_permissions up ON p.id = up.user_id;

-- 8. Vérifier la structure des permissions
SELECT 'Structure des permissions (exemple):' as status;
SELECT 
    p.name,
    jsonb_pretty(up.permissions) as permissions_structure
FROM public.profiles p
JOIN public.user_permissions up ON p.id = up.user_id
WHERE p.function = 'Gerant'
LIMIT 1;

-- 9. Test d'accès aux données (simulation)
SELECT 'Test simulation accès données:' as status;
SELECT 
    'dashboard' as module,
    CASE 
        WHEN up.permissions->'dashboard'->>'visible' = 'true' THEN 'Accessible'
        ELSE 'Bloqué'
    END as access_status
FROM public.user_permissions up
JOIN public.profiles p ON p.id = up.user_id
WHERE p.function = 'Gerant'
LIMIT 1;

SELECT 'Setup terminé avec succès!' as final_status;