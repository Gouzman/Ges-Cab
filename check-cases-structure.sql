-- Script pour vérifier la structure actuelle de la table cases
-- Exécuter dans Supabase SQL Editor pour voir les colonnes existantes

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'cases'
ORDER BY ordinal_position;

-- Également voir le contenu actuel
SELECT * FROM public.cases LIMIT 3;