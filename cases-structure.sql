-- Diagnostic spécifique de la table cases
-- À exécuter dans Supabase SQL Editor

-- Voir la structure complète de la table cases
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'cases'
ORDER BY ordinal_position;

-- Voir un exemple d'enregistrement existant
SELECT * FROM public.cases LIMIT 1;

-- Compter les colonnes
SELECT COUNT(*) as total_columns 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'cases';