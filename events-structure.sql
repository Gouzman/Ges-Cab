-- Diagnostic structure table events
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'events'
ORDER BY ordinal_position;

-- Voir un exemple si il y en a
SELECT * FROM public.events LIMIT 1;