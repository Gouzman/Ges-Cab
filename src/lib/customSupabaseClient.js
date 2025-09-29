import { createClient } from '@supabase/supabase-js';

// Vérification de la présence des variables d'environnement requises
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL manquante dans les variables d\'environnement');
}

if (!SUPABASE_ANON_KEY) {
  throw new Error('VITE_SUPABASE_ANON_KEY manquante dans les variables d\'environnement');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fonction utilitaire pour vérifier la connexion (utilisée au démarrage)
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) throw error;
    console.info('✅ Connexion Supabase établie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion Supabase:', error.message);
    return false;
  }
};