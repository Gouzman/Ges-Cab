-- Script de diagnostic complet de la base de données
-- À exécuter dans Supabase SQL Editor

-- 1. Lister toutes les tables existantes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Structure de la table cases
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'cases'
ORDER BY ordinal_position;

-- 3. Structure de la table clients
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'clients'
ORDER BY ordinal_position;

-- 4. Structure de la table events
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'events'
ORDER BY ordinal_position;

-- 5. Contenu échantillon
SELECT 'cases' as table_name, count(*) as row_count FROM public.cases
UNION ALL
SELECT 'clients', count(*) FROM public.clients
UNION ALL
SELECT 'events', count(*) FROM public.events
UNION ALL
SELECT 'tasks', count(*) FROM public.tasks;