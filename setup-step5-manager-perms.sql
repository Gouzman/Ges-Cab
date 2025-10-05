-- ÉTAPE 5: Permissions complètes pour les gérants existants
-- Exécuter en dernier pour donner les permissions complètes aux gérants

-- Donner les permissions complètes aux gérants existants
INSERT INTO public.user_permissions (user_id, permissions)
SELECT id, '{
    "dashboard": {"visible": true, "actions": {}},
    "tasks": {"visible": true, "actions": {"create": true, "edit": true, "delete": true, "reassign": true}},
    "clients": {"visible": true, "actions": {"create": true, "edit": true, "delete": true}},
    "cases": {"visible": true, "actions": {"create": true, "edit": true, "delete": true}},
    "calendar": {"visible": true, "actions": {"create": true, "edit": true, "delete": true}},
    "documents": {"visible": true, "actions": {"upload": true, "delete": true}},
    "billing": {"visible": true, "actions": {"create": true, "edit": true, "delete": true}},
    "team": {"visible": true, "actions": {"create": true, "edit": true, "delete": true}},
    "reports": {"visible": true, "actions": {}},
    "settings": {"visible": true, "actions": {}}
}'::jsonb
FROM public.profiles 
WHERE function = 'Gerant' OR function = 'Associe Emerite'
ON CONFLICT (user_id) DO UPDATE SET
    permissions = EXCLUDED.permissions;

-- Vérification finale - afficher les permissions créées
SELECT p.name, p.email, p.function, up.permissions
FROM public.profiles p
LEFT JOIN public.user_permissions up ON p.id = up.user_id
WHERE p.function IN ('Gerant', 'Associe Emerite')
ORDER BY p.function, p.name;