import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../.env.local');

dotenv.config({ path: envPath });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function rotateKeys() {
  try {
    console.log('🔄 Rotation des clés en cours...');
    
    // Vérification de la connexion
    const { error: testError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (testError) throw new Error('Échec de la vérification de connexion Supabase');

    // Rotation de la clé anon
    const { data: newKeys, error: rotateError } = await supabase.rpc('rotate_service_key', {
      service_role_key: SUPABASE_SERVICE_ROLE_KEY
    });

    if (rotateError) throw rotateError;

    // Mise à jour du fichier .env.local
    const envContent = await fs.promises.readFile(envPath, 'utf8');
    const updatedContent = envContent.replace(
      /VITE_SUPABASE_ANON_KEY=.*/,
      `VITE_SUPABASE_ANON_KEY=${newKeys.anon_key}`
    );
    
    await fs.promises.writeFile(envPath, updatedContent, 'utf8');
    
    console.log('✅ Clés rotées avec succès');
    console.log('📝 Fichier .env.local mis à jour');
    console.log('🔑 Nouvelle clé anon:', newKeys.anon_key);
    console.log('⚠️ Assurez-vous de déployer les nouvelles clés sur tous les environnements !');
  } catch (error) {
    console.error('❌ Erreur lors de la rotation des clés:', error.message);
    process.exit(1);
  }
}

rotateKeys();