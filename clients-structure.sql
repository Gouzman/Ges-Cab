-- Diagnostic structure table clients
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'clients'
ORDER BY ordinal_position;

-- Voir un exemple d'enregistrement
SELECT * FROM public.clients LIMIT 1;