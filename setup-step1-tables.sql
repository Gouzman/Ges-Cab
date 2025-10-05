-- ÉTAPE 1: Créer les tables de base
-- Exécuter cette partie en premier

-- Créer la table des rôles
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer la table des permissions utilisateur
CREATE TABLE IF NOT EXISTS public.user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Insérer les rôles par défaut
INSERT INTO public.roles (name, description) 
VALUES 
    ('Gerant', 'Gérant du cabinet - accès total'),
    ('Associe Emerite', 'Associé émérite - accès étendu'),
    ('Admin', 'Administrateur - accès étendu'),
    ('Avocat', 'Avocat - accès standard'),
    ('Secretaire', 'Secrétaire - accès limité'),
    ('Stagiaire', 'Stagiaire - accès très limité')
ON CONFLICT (name) DO NOTHING;