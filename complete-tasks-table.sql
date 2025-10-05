-- Script final pour compléter la table tasks
-- Exécuter dans l'éditeur SQL de Supabase

-- Ajouter toutes les colonnes manquantes à la table tasks
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_by_id UUID,
ADD COLUMN IF NOT EXISTS assigned_to_name TEXT,
ADD COLUMN IF NOT EXISTS created_by_name TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS case_id UUID;

-- Mettre à jour les colonnes existantes si nécessaire
UPDATE public.tasks SET 
  assigned_at = created_at,
  created_by_id = assigned_to_id,
  assigned_to_name = 'Admin',
  created_by_name = 'Admin',
  category = 'General'
WHERE assigned_at IS NULL OR created_by_id IS NULL OR assigned_to_name IS NULL OR created_by_name IS NULL OR category IS NULL;

-- Créer quelques tâches d'exemple pour tester
INSERT INTO public.tasks (title, description, status, priority, assigned_to_id, created_by_id, category)
VALUES 
  ('Réviser dossier Alpha', 'Analyser les documents du client Alpha', 'En cours', 'Haute', '85cf7b41-6dac-4460-b69d-a7378b0ea100', '85cf7b41-6dac-4460-b69d-a7378b0ea100', 'Révision'),
  ('Préparer plaidoirie', 'Préparer les arguments pour l''audience', 'À faire', 'Haute', '85cf7b41-6dac-4460-b69d-a7378b0ea100', '85cf7b41-6dac-4460-b69d-a7378b0ea100', 'Plaidoirie'),
  ('Rédiger contrat', 'Rédiger le contrat de prestation', 'À faire', 'Moyenne', '85cf7b41-6dac-4460-b69d-a7378b0ea100', '85cf7b41-6dac-4460-b69d-a7378b0ea100', 'Rédaction')
ON CONFLICT DO NOTHING;

-- Créer quelques clients d'exemple
INSERT INTO public.clients (name, email, phone, company)
VALUES 
  ('Société Alpha', 'contact@alpha.com', '01.23.45.67.89', 'Alpha Corp'),
  ('Entreprise Beta', 'info@beta.fr', '01.98.76.54.32', 'Beta SARL'),
  ('Cabinet Gamma', 'admin@gamma.org', '01.11.22.33.44', 'Gamma Associés')
ON CONFLICT DO NOTHING;

-- Créer quelques dossiers d'exemple
INSERT INTO public.cases (title, status, priority)
VALUES 
  ('Dossier Alpha - Contentieux commercial', 'Ouvert', 'Haute'),
  ('Dossier Beta - Conseil juridique', 'En cours', 'Moyenne'),
  ('Dossier Gamma - Audit compliance', 'À faire', 'Basse')
ON CONFLICT DO NOTHING;