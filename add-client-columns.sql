-- Script rapide pour ajouter les colonnes manquantes à la table clients
-- Exécuter ce code dans l'éditeur SQL de Supabase

ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS first_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS last_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS postal_code TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'France',
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- Mettre à jour les enregistrements existants avec des valeurs par défaut
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