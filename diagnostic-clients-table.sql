-- Script de diagnostic et correction de la table clients
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier la structure actuelle de la table clients
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'clients'
ORDER BY ordinal_position;

-- 2. Ajouter toutes les colonnes manquantes
DO $$ 
BEGIN
    -- Vérifier et ajouter la colonne address
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'address') THEN
        ALTER TABLE public.clients ADD COLUMN address TEXT;
    END IF;
    
    -- Vérifier et ajouter la colonne city  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'city') THEN
        ALTER TABLE public.clients ADD COLUMN city TEXT;
    END IF;
    
    -- Vérifier et ajouter la colonne postal_code
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'postal_code') THEN
        ALTER TABLE public.clients ADD COLUMN postal_code TEXT;
    END IF;
    
    -- Vérifier et ajouter la colonne country
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'country') THEN
        ALTER TABLE public.clients ADD COLUMN country TEXT DEFAULT 'France';
    END IF;
    
    -- Vérifier et ajouter la colonne notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'notes') THEN
        ALTER TABLE public.clients ADD COLUMN notes TEXT;
    END IF;
    
    -- Vérifier et ajouter la colonne type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'type') THEN
        ALTER TABLE public.clients ADD COLUMN type TEXT DEFAULT 'individual';
    END IF;
    
    -- Vérifier et ajouter la colonne first_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'first_name') THEN
        ALTER TABLE public.clients ADD COLUMN first_name TEXT;
    END IF;
    
    -- Vérifier et ajouter la colonne last_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'last_name') THEN
        ALTER TABLE public.clients ADD COLUMN last_name TEXT;
    END IF;
END $$;

-- 3. Initialiser les valeurs par défaut pour les colonnes vides
UPDATE public.clients SET 
    address = COALESCE(address, ''),
    city = COALESCE(city, ''),
    postal_code = COALESCE(postal_code, ''),
    country = COALESCE(country, 'France'),
    notes = COALESCE(notes, ''),
    type = COALESCE(type, 'individual'),
    first_name = COALESCE(first_name, ''),
    last_name = COALESCE(last_name, '');

-- 4. Vérifier le résultat
SELECT * FROM public.clients LIMIT 5;