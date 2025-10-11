-- Correction des erreurs de production - Ges-Cab
-- ================================================

-- 1. Créer la table app_metadata si elle n'existe pas
CREATE TABLE IF NOT EXISTS app_metadata (
    id INTEGER PRIMARY KEY DEFAULT 1,
    task_categories JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer une ligne par défaut si la table est vide
INSERT INTO app_metadata (id, task_categories) 
VALUES (1, '[
    {"value": "juridique", "label": "Juridique"},
    {"value": "commercial", "label": "Commercial"},
    {"value": "administratif", "label": "Administratif"},
    {"value": "contentieux", "label": "Contentieux"},
    {"value": "conseil", "label": "Conseil"}
]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 2. Ajouter les colonnes manquantes à la table profiles si nécessaire
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Mettre à jour la colonne name avec full_name si elle est vide
UPDATE profiles 
SET name = full_name 
WHERE name IS NULL AND full_name IS NOT NULL;

-- 3. Créer la table clients si elle n'existe pas
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 4. Politique RLS pour app_metadata
ALTER TABLE app_metadata ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous les utilisateurs authentifiés
DROP POLICY IF EXISTS "Allow authenticated users to read app_metadata" ON app_metadata;
CREATE POLICY "Allow authenticated users to read app_metadata" ON app_metadata
    FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour permettre la mise à jour aux admins
DROP POLICY IF EXISTS "Allow admins to update app_metadata" ON app_metadata;
CREATE POLICY "Allow admins to update app_metadata" ON app_metadata
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND (p.role = 'admin' OR p.function IN ('Gerant', 'Associe Emerite'))
        )
    );

-- 5. Politique RLS pour clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture aux utilisateurs authentifiés
DROP POLICY IF EXISTS "Users can view clients" ON clients;
CREATE POLICY "Users can view clients" ON clients
    FOR SELECT USING (auth.role() = 'authenticated');

-- Politique pour permettre la création aux utilisateurs avec permissions
DROP POLICY IF EXISTS "Users can create clients" ON clients;
CREATE POLICY "Users can create clients" ON clients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politique pour permettre la mise à jour aux utilisateurs avec permissions
DROP POLICY IF EXISTS "Users can update clients" ON clients;
CREATE POLICY "Users can update clients" ON clients
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Politique pour permettre la suppression aux utilisateurs avec permissions
DROP POLICY IF EXISTS "Users can delete clients" ON clients;
CREATE POLICY "Users can delete clients" ON clients
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND (p.role = 'admin' OR p.function IN ('Gerant', 'Associe Emerite'))
        )
    );

-- 6. Créer un trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger aux tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_metadata_updated_at ON app_metadata;
CREATE TRIGGER update_app_metadata_updated_at
    BEFORE UPDATE ON app_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Vérifier et corriger les données existantes
-- Mettre à jour les timestamps manquants
UPDATE profiles 
SET created_at = NOW(), updated_at = NOW() 
WHERE created_at IS NULL;

-- 8. Créer une vue pour debug et monitoring
CREATE OR REPLACE VIEW debug_user_access AS
SELECT 
    auth.uid() as current_user_id,
    p.id,
    p.email,
    p.full_name,
    p.function,
    p.role,
    CASE 
        WHEN p.role = 'admin' OR p.function IN ('Gerant', 'Associe Emerite') THEN 'admin'
        ELSE 'user'
    END as effective_role
FROM profiles p
WHERE p.id = auth.uid();

COMMENT ON TABLE app_metadata IS 'Métadonnées de l''application (catégories, configuration)';
COMMENT ON TABLE clients IS 'Table des clients du cabinet';
COMMENT ON VIEW debug_user_access IS 'Vue de debug pour vérifier les accès utilisateur';