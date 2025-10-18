// Test de connexion Supabase - À exécuter dans la console du navigateur
// Ouvrez http://localhost:3000/, puis F12 (console), puis collez ce code

console.log('🔍 Test de configuration Supabase...');

// Test 1: Vérification des variables d'environnement
const config = {
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  jwtSecret: import.meta.env.VITE_JWT_SECRET
};

console.log('📋 Configuration actuelle:');
console.log('  - URL:', config.url);
console.log('  - Clé ANON (50 premiers chars):', config.anonKey?.substring(0, 50) + '...');
console.log('  - JWT Secret défini:', !!config.jwtSecret);
console.log('  - Clé valide (pas xyz123):', !config.anonKey?.includes('xyz123'));

// Test 2: Import du client Supabase
try {
  // Note: Ce test doit être adapté selon votre structure d'import
  console.log('🔄 Test d\'import du client Supabase...');
  
  // Vous devrez peut-être ajuster le chemin d'import
  const { supabase } = await import('/src/lib/customSupabaseClient.js');
  console.log('✅ Client Supabase importé avec succès');
  
  // Test 3: Test de connexion basique
  console.log('🔄 Test de connexion basique...');
  
  const { data, error } = await supabase
    .from('profiles')
    .select('count')
    .limit(1);
  
  if (error) {
    console.error('❌ Erreur de connexion:', error);
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.error('🚨 PROBLÈME: Erreur 401 - Clés d\'authentification invalides');
    }
  } else {
    console.log('✅ Connexion Supabase réussie!', data);
  }
  
  // Test 4: Test du service d'authentification
  console.log('🔄 Test du service d\'authentification...');
  
  const { data: session, error: authError } = await supabase.auth.getSession();
  
  if (authError) {
    console.error('❌ Erreur d\'authentification:', authError);
  } else {
    console.log('✅ Service d\'authentification fonctionnel');
    console.log('  - Session active:', !!session?.session);
  }
  
} catch (importError) {
  console.error('❌ Erreur d\'import:', importError);
  console.log('💡 Essayez d\'actualiser la page et réessayez');
}

console.log('📊 Test terminé - Vérifiez les résultats ci-dessus');