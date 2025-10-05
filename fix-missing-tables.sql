-- Ajouter les tables et colonnes manquantes
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- Table events pour le calendrier
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    all_day BOOLEAN DEFAULT FALSE,
    location TEXT,
    case_id UUID,
    created_by UUID,
    attendees UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter les colonnes manquantes à la table tasks
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS time_spent INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';

-- Désactiver RLS pour la table events
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;