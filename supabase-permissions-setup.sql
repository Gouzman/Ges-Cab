-- Script SQL pour la gestion des permissions
-- À exécuter dans Supabase SQL Editor

-- 1. Créer la table des rôles (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Créer la table des permissions utilisateur
CREATE TABLE IF NOT EXISTS public.user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- 3. Insérer les rôles par défaut
INSERT INTO public.roles (name, description) 
VALUES 
    ('Gerant', 'Gérant du cabinet - accès total'),
    ('Associe Emerite', 'Associé émérite - accès étendu'),
    ('Admin', 'Administrateur - accès étendu'),
    ('Avocat', 'Avocat - accès standard'),
    ('Secretaire', 'Secrétaire - accès limité'),
    ('Stagiaire', 'Stagiaire - accès très limité')
ON CONFLICT (name) DO NOTHING;

-- 4. Ajouter des index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_function ON public.profiles(function);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 5. Politique RLS (Row Level Security) pour user_permissions
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view own permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Managers can modify permissions" ON public.user_permissions;

-- Politique : Les utilisateurs peuvent voir leurs propres permissions
CREATE POLICY "Users can view own permissions" ON public.user_permissions
    FOR SELECT USING (auth.uid() = user_id);

-- Politique : Seuls les Gérants et Admins peuvent modifier les permissions
CREATE POLICY "Managers can modify permissions" ON public.user_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND (function = 'Gerant' OR function = 'Associe Emerite' OR role = 'Admin')
        )
    );

-- 6. Fonction utilitaire (pas de colonne updated_at dans user_permissions)
CREATE OR REPLACE FUNCTION update_permissions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Pas de colonne updated_at à mettre à jour
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Note: Pas de trigger nécessaire car pas de colonne updated_at

-- 8. Permissions par défaut pour les nouveaux utilisateurs
-- Cette fonction sera appelée automatiquement lors de la création d'un profil
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

-- 9. Trigger pour créer les permissions par défaut
DROP TRIGGER IF EXISTS on_auth_user_created_permissions ON public.profiles;
CREATE TRIGGER on_auth_user_created_permissions
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_permissions();

-- 10. Donner les permissions complètes au premier Gérant
-- (À adapter selon vos besoins)
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
WHERE function = 'Gerant'
ON CONFLICT (user_id) DO UPDATE SET
    permissions = EXCLUDED.permissions;