-- ÉTAPE 3: Configurer la sécurité RLS
-- Exécuter après l'étape 2

-- Activer RLS sur la table user_permissions
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view own permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Managers can modify permissions" ON public.user_permissions;

-- Créer les nouvelles politiques
CREATE POLICY "Users can view own permissions" ON public.user_permissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Managers can modify permissions" ON public.user_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND (function = 'Gerant' OR function = 'Associe Emerite' OR role = 'Admin')
        )
    );