-- Script de seed pour créer un utilisateur test administrateur
-- Compatible avec la structure Ges-Cab PostgreSQL direct

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED UTILISATEUR ADMINISTRATEUR TEST
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Créer l'utilisateur administrateur principal
-- Adapté à la structure de table profiles existante

-- Vérifier d'abord si l'utilisateur existe déjà
DO $$
DECLARE
    existing_user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO existing_user_count 
    FROM profiles 
    WHERE email = 'elie.gouzou@gmail.com';
    
    IF existing_user_count = 0 THEN
        -- Insérer l'utilisateur administrateur
        INSERT INTO profiles (
            email,
            nom,
            prenom,
            full_name,
            function,
            role,
            password_hash,
            first_login,
            temp_password,
            temp_password_expires_at,
            active,
            created_at,
            updated_at
        ) VALUES (
            'elie.gouzou@gmail.com',
            'Gouzou',
            'Elie',
            'Elie Gouzou',
            'Direction',
            'admin',
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LXUhoH.eG3MP.hdm6', -- "admin123" hashé
            false, -- Pas de première connexion requise
            NULL,  -- Pas de mot de passe temporaire
            NULL,  -- Pas d'expiration
            true,  -- Compte actif
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Utilisateur administrateur créé : elie.gouzou@gmail.com';
        RAISE NOTICE 'Mot de passe par défaut : admin123';
        
    ELSE
        RAISE NOTICE 'Utilisateur elie.gouzou@gmail.com existe déjà';
    END IF;
END $$;

-- 2. Créer quelques utilisateurs de test supplémentaires
DO $$
DECLARE
    admin_id INTEGER;
BEGIN
    -- Récupérer l'ID de l'admin
    SELECT id INTO admin_id FROM profiles WHERE email = 'elie.gouzou@gmail.com';
    
    -- Utilisateur test 1 : Avocat
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'avocat.test@ges-cab.local') THEN
        INSERT INTO profiles (
            email,
            nom,
            prenom,
            full_name,
            function,
            role,
            first_login,
            temp_password,
            temp_password_expires_at,
            active,
            created_by,
            created_at,
            updated_at
        ) VALUES (
            'avocat.test@ges-cab.local',
            'Dupont',
            'Marie',
            'Marie Dupont',
            'Avocat',
            'user',
            true,  -- Première connexion requise
            'TEMP2024', -- Mot de passe temporaire
            NOW() + INTERVAL '7 days', -- Expire dans 7 jours
            true,
            admin_id,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Utilisateur test créé : avocat.test@ges-cab.local (mot de passe temporaire : TEMP2024)';
    END IF;
    
    -- Utilisateur test 2 : Secrétaire
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'secretaire.test@ges-cab.local') THEN
        INSERT INTO profiles (
            email,
            nom,
            prenom,
            full_name,
            function,
            role,
            first_login,
            temp_password,
            temp_password_expires_at,
            active,
            created_by,
            created_at,
            updated_at
        ) VALUES (
            'secretaire.test@ges-cab.local',
            'Martin',
            'Jean',
            'Jean Martin',
            'Secretaire',
            'user',
            true,  -- Première connexion requise
            'SECRET2024', -- Mot de passe temporaire
            NOW() + INTERVAL '7 days', -- Expire dans 7 jours
            true,
            admin_id,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Utilisateur test créé : secretaire.test@ges-cab.local (mot de passe temporaire : SECRET2024)';
    END IF;
    
END $$;

-- 3. Créer un utilisateur avec structure alternative (si la table utilise le schéma Supabase)
DO $$
BEGIN
    -- Vérifier si la colonne 'name' existe (structure Supabase)
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'name'
        AND table_schema = 'public'
    ) THEN
        -- Utiliser la structure Supabase
        IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'elie.gouzou@gmail.com') THEN
            INSERT INTO profiles (
                name,
                email,
                role,
                is_active,
                created_at,
                updated_at
            ) VALUES (
                'Elie Gouzou (Direction)',
                'elie.gouzou@gmail.com',
                'admin',
                true,
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Utilisateur administrateur créé avec structure Supabase : elie.gouzou@gmail.com';
        END IF;
    END IF;
END $$;

-- 4. Afficher un résumé des utilisateurs créés
SELECT 
    COALESCE(email, '') as email,
    COALESCE(full_name, name, nom || ' ' || prenom, '') as nom_complet,
    COALESCE(function, role, '') as fonction,
    role,
    CASE 
        WHEN first_login = true THEN 'Première connexion requise'
        WHEN password_hash IS NOT NULL THEN 'Mot de passe défini'
        ELSE 'À configurer'
    END as statut_auth,
    active,
    created_at
FROM profiles
ORDER BY created_at DESC;

-- 5. Informations importantes
DO $$
BEGIN
    RAISE NOTICE '══════════════════════════════════════════════════════════';
    RAISE NOTICE 'UTILISATEURS CRÉÉS - INFORMATIONS DE CONNEXION';
    RAISE NOTICE '══════════════════════════════════════════════════════════';
    RAISE NOTICE 'ADMIN :';
    RAISE NOTICE '  Email    : elie.gouzou@gmail.com';
    RAISE NOTICE '  Password : admin123';
    RAISE NOTICE '  Rôle     : admin';
    RAISE NOTICE '';
    RAISE NOTICE 'TESTS :';
    RAISE NOTICE '  Email    : avocat.test@ges-cab.local';
    RAISE NOTICE '  Temp PWD : TEMP2024';
    RAISE NOTICE '  Rôle     : user (Avocat)';
    RAISE NOTICE '';
    RAISE NOTICE '  Email    : secretaire.test@ges-cab.local';
    RAISE NOTICE '  Temp PWD : SECRET2024';
    RAISE NOTICE '  Rôle     : user (Secrétaire)';
    RAISE NOTICE '══════════════════════════════════════════════════════════';
END $$;