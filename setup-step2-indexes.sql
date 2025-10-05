-- ÉTAPE 2: Créer les index et fonctions
-- Exécuter après l'étape 1

-- Ajouter des index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_function ON public.profiles(function);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Fonction pour mettre à jour automatiquement la date de modification
CREATE OR REPLACE FUNCTION update_permissions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Pas de colonne updated_at dans user_permissions
    -- La date created_at reste inchangée
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Note: Pas de trigger needed car pas de colonne updated_at