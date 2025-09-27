import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Remplacez '__VOTRE_URL_SUPABASE__' et '__VOTRE_CLE_ANON_SUPABASE__'
// par les URL et clé Anon de votre projet Supabase "GeSuT".
// Vous pouvez trouver ces informations dans les paramètres de votre projet Supabase,
// sous "API Settings".
const supabaseUrl = '__VOTRE_URL_SUPABASE__';
const supabaseAnonKey = '__VOTRE_CLE_ANON_SUPABASE__';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);