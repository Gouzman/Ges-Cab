-- Migration pour ajouter la colonne password_hash à la table profiles
-- Cette migration transforme le système d'authentification pour utiliser un hachage de mot de passe local

-- 1. Ajouter la colonne password_hash si elle n'existe pas
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- 2. Supprimer les colonnes liées aux mots de passe temporaires (optionnel)
-- ALTER TABLE profiles DROP COLUMN IF EXISTS temp_password;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS temp_password_expires_at;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS first_login;

-- 3. Ajouter un index sur l'email pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 4. Commentaires pour documentation
COMMENT ON COLUMN profiles.password_hash IS 'Hash bcrypt du mot de passe utilisateur (auth locale)';

-- 5. Fonction RPC pour vérifier si un utilisateur existe (optionnel, remplace checkUserExists)
CREATE OR REPLACE FUNCTION check_user_exists(p_email TEXT)
RETURNS JSON AS $$
DECLARE
    user_record RECORD;
    result JSON;
BEGIN
    -- Rechercher l'utilisateur par email
    SELECT id, email, password_hash INTO user_record
    FROM profiles 
    WHERE email = p_email;
    
    IF FOUND THEN
        result := json_build_object(
            'exists', true,
            'hasPassword', user_record.password_hash IS NOT NULL,
            'userId', user_record.id
        );
    ELSE
        result := json_build_object(
            'exists', false,
            'hasPassword', false,
            'userId', null
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Fonction RPC pour mettre à jour le hash du mot de passe
CREATE OR REPLACE FUNCTION update_password_hash(
    p_user_id UUID,
    p_password_hash TEXT
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Mettre à jour le hash du mot de passe
    UPDATE profiles 
    SET 
        password_hash = p_password_hash,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    IF FOUND THEN
        result := json_build_object(
            'success', true,
            'message', 'Mot de passe mis à jour avec succès'
        );
    ELSE
        result := json_build_object(
            'success', false,
            'error', 'Utilisateur non trouvé'
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant des permissions pour les fonctions RPC
GRANT EXECUTE ON FUNCTION check_user_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_password_hash(UUID, TEXT) TO authenticated;