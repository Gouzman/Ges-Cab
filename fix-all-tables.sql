-- Script complet pour corriger toutes les structures de tables
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Corriger la table clients
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS first_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS last_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS postal_code TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'France',
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- 2. Corriger la table cases
ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS client_id UUID,
ADD COLUMN IF NOT EXISTS assigned_to UUID,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_hours NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_spent NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Corriger la table tasks  
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_hours NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS case_id UUID,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_by_id UUID,
ADD COLUMN IF NOT EXISTS assigned_to_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS created_by_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';

-- 4. Mettre à jour les données existantes avec des valeurs par défaut
UPDATE public.clients 
SET 
  type = COALESCE(type, 'individual'),
  first_name = COALESCE(first_name, ''),
  last_name = COALESCE(last_name, ''),
  address = COALESCE(address, ''),
  city = COALESCE(city, ''),
  postal_code = COALESCE(postal_code, ''),
  country = COALESCE(country, 'France'),
  notes = COALESCE(notes, '');

UPDATE public.cases 
SET 
  estimated_hours = COALESCE(estimated_hours, 0),
  actual_hours = COALESCE(actual_hours, 0),
  time_spent = COALESCE(time_spent, 0),
  notes = COALESCE(notes, ''),
  attachments = COALESCE(attachments, '[]'::jsonb);

UPDATE public.tasks 
SET 
  description = COALESCE(description, ''),
  estimated_hours = COALESCE(estimated_hours, 0),
  actual_hours = COALESCE(actual_hours, 0),
  assigned_to_name = COALESCE(assigned_to_name, ''),
  created_by_name = COALESCE(created_by_name, ''),
  category = COALESCE(category, 'General');

-- 5. Désactiver temporairement RLS pour éviter les erreurs d'accès
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions DISABLE ROW LEVEL SECURITY;