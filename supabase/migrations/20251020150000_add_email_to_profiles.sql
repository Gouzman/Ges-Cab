-- Migration: Ajout de la colonne email dans la table profiles
-- Date: 2025-10-20
-- Description: Ajoute la colonne email manquante dans la table profiles

-- Ajouter la colonne email
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Créer un index sur l'email pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Fonction pour synchroniser l'email depuis auth.users
CREATE OR REPLACE FUNCTION sync_email_to_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Si un nouveau profil est créé, copier l'email depuis auth.users
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles 
        SET email = (SELECT email FROM auth.users WHERE id = NEW.id)
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour synchroniser automatiquement l'email
DROP TRIGGER IF EXISTS trigger_sync_email_to_profile ON profiles;
CREATE TRIGGER trigger_sync_email_to_profile
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_email_to_profile();

-- Mettre à jour les profils existants avec leurs emails
UPDATE profiles 
SET email = (SELECT email FROM auth.users WHERE auth.users.id = profiles.id)
WHERE email IS NULL;

-- Ajouter des commentaires
COMMENT ON COLUMN profiles.email IS 'Email de l''utilisateur synchronisé depuis auth.users';
COMMENT ON FUNCTION sync_email_to_profile() IS 'Synchronise automatiquement l''email depuis auth.users vers profiles';