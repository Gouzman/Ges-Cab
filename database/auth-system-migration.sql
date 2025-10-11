-- Modifications de la base de données pour le nouveau système d'authentification

-- 1. Ajouter les colonnes nécessaires à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS first_login BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS temp_password VARCHAR(255),
ADD COLUMN IF NOT EXISTS temp_password_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 2. Créer une fonction pour générer des mots de passe temporaires
CREATE OR REPLACE FUNCTION generate_temp_password()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    temp_pwd TEXT := '';
    i INT;
BEGIN
    FOR i IN 1..8 LOOP
        temp_pwd := temp_pwd || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN temp_pwd;
END;
$$ LANGUAGE plpgsql;

-- 3. Fonction pour créer un utilisateur par l'admin
CREATE OR REPLACE FUNCTION admin_create_user(
    p_email TEXT,
    p_full_name TEXT,
    p_function TEXT,
    p_role TEXT DEFAULT 'user',
    p_admin_id UUID
)
RETURNS JSON AS $$
DECLARE
    temp_pwd TEXT;
    new_user_id UUID;
    result JSON;
BEGIN
    -- Générer un mot de passe temporaire
    temp_pwd := generate_temp_password();
    
    -- Insérer dans la table profiles
    INSERT INTO profiles (
        email, 
        full_name, 
        function, 
        role,
        first_login,
        temp_password,
        temp_password_expires_at,
        created_by
    ) VALUES (
        p_email,
        p_full_name,
        p_function,
        p_role,
        true,
        temp_pwd,
        NOW() + INTERVAL '7 days',
        p_admin_id
    ) RETURNING id INTO new_user_id;
    
    -- Retourner le résultat avec le mot de passe temporaire
    result := json_build_object(
        'success', true,
        'user_id', new_user_id,
        'temp_password', temp_pwd,
        'email', p_email
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Fonction pour vérifier et valider le mot de passe temporaire
CREATE OR REPLACE FUNCTION validate_temp_password(
    p_email TEXT,
    p_temp_password TEXT
)
RETURNS JSON AS $$
DECLARE
    profile_record RECORD;
    result JSON;
BEGIN
    -- Récupérer le profil utilisateur
    SELECT * INTO profile_record
    FROM profiles 
    WHERE email = p_email 
    AND temp_password = p_temp_password
    AND temp_password_expires_at > NOW()
    AND first_login = true;
    
    IF FOUND THEN
        result := json_build_object(
            'success', true,
            'user_id', profile_record.id,
            'full_name', profile_record.full_name,
            'function', profile_record.function,
            'role', profile_record.role
        );
    ELSE
        result := json_build_object(
            'success', false,
            'error', 'Mot de passe temporaire invalide ou expiré'
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Fonction pour finaliser la première connexion
CREATE OR REPLACE FUNCTION complete_first_login(
    p_email TEXT,
    p_password TEXT,
    p_keep_temp_password BOOLEAN DEFAULT false
)
RETURNS JSON AS $$
DECLARE
    profile_record RECORD;
    new_auth_user_id UUID;
    result JSON;
BEGIN
    -- Récupérer le profil
    SELECT * INTO profile_record
    FROM profiles 
    WHERE email = p_email AND first_login = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Utilisateur non trouvé ou déjà activé');
    END IF;
    
    -- Créer l'utilisateur dans auth.users via l'API Supabase
    -- (Cette partie sera gérée côté client car on ne peut pas créer directement dans auth.users depuis une fonction)
    
    -- Mettre à jour le profil
    UPDATE profiles 
    SET 
        first_login = false,
        temp_password = NULL,
        temp_password_expires_at = NULL,
        updated_at = NOW()
    WHERE email = p_email;
    
    result := json_build_object(
        'success', true,
        'message', 'Première connexion complétée avec succès'
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Fonction pour réinitialiser le mot de passe (mot de passe oublié)
CREATE OR REPLACE FUNCTION reset_user_password(
    p_email TEXT
)
RETURNS JSON AS $$
DECLARE
    temp_pwd TEXT;
    profile_record RECORD;
    result JSON;
BEGIN
    -- Vérifier que l'utilisateur existe
    SELECT * INTO profile_record FROM profiles WHERE email = p_email;
    
    IF NOT FOUND THEN
        -- Pour des raisons de sécurité, on ne révèle pas si l'email existe
        RETURN json_build_object(
            'success', true,
            'message', 'Si cet email existe, un nouveau mot de passe a été envoyé'
        );
    END IF;
    
    -- Générer un nouveau mot de passe temporaire
    temp_pwd := generate_temp_password();
    
    -- Mettre à jour le profil
    UPDATE profiles 
    SET 
        temp_password = temp_pwd,
        temp_password_expires_at = NOW() + INTERVAL '24 hours',
        first_login = false -- L'utilisateur n'est plus en première connexion
    WHERE email = p_email;
    
    result := json_build_object(
        'success', true,
        'temp_password', temp_pwd,
        'email', p_email,
        'message', 'Nouveau mot de passe temporaire généré'
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Vue pour les administrateurs (liste des utilisateurs)
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
    id,
    email,
    full_name,
    function,
    role,
    first_login,
    CASE 
        WHEN temp_password_expires_at > NOW() THEN 'Actif'
        WHEN temp_password_expires_at IS NOT NULL AND temp_password_expires_at <= NOW() THEN 'Expiré'
        ELSE 'Aucun'
    END as temp_password_status,
    created_at,
    updated_at
FROM profiles
ORDER BY created_at DESC;

-- 8. Politique de sécurité RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux admins de voir tous les profils
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND (p.role = 'admin' OR p.function IN ('Gerant', 'Associe Emerite'))
        )
    );

-- Politique pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Politique pour permettre aux admins de créer des utilisateurs
CREATE POLICY "Admins can create users" ON profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND (p.role = 'admin' OR p.function IN ('Gerant', 'Associe Emerite'))
        )
    );

-- Politique pour permettre aux admins de modifier les utilisateurs
CREATE POLICY "Admins can update users" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND (p.role = 'admin' OR p.function IN ('Gerant', 'Associe Emerite'))
        )
    );

-- Politique pour permettre aux utilisateurs de modifier leur propre profil
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

COMMENT ON TABLE profiles IS 'Table des profils utilisateurs avec gestion des mots de passe temporaires';
COMMENT ON COLUMN profiles.first_login IS 'Indique si c''est la première connexion de l''utilisateur';
COMMENT ON COLUMN profiles.temp_password IS 'Mot de passe temporaire généré par l''admin';
COMMENT ON COLUMN profiles.temp_password_expires_at IS 'Date d''expiration du mot de passe temporaire';
COMMENT ON COLUMN profiles.created_by IS 'ID de l''administrateur qui a créé ce compte';