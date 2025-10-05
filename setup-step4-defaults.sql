-- ÉTAPE 4: Permissions par défaut et triggers
-- Exécuter après l'étape 3

-- Fonction pour créer les permissions par défaut
CREATE OR REPLACE FUNCTION public.handle_new_user_permissions()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_permissions (user_id, permissions)
    VALUES (NEW.id, '{
        "dashboard": {"visible": true, "actions": {}},
        "tasks": {"visible": true, "actions": {"create": false, "edit": false, "delete": false, "reassign": false}},
        "clients": {"visible": true, "actions": {"create": false, "edit": false, "delete": false}},
        "cases": {"visible": true, "actions": {"create": false, "edit": false, "delete": false}},
        "calendar": {"visible": true, "actions": {"create": false, "edit": false, "delete": false}},
        "documents": {"visible": true, "actions": {"upload": false, "delete": false}},
        "billing": {"visible": false, "actions": {"create": false, "edit": false, "delete": false}},
        "team": {"visible": false, "actions": {"create": false, "edit": false, "delete": false}},
        "reports": {"visible": true, "actions": {}},
        "settings": {"visible": false, "actions": {}}
    }'::jsonb)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- Créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created_permissions ON public.profiles;
CREATE TRIGGER on_auth_user_created_permissions
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_permissions();