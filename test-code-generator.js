// Test du générateur de code de confirmation
import { generateConfirmationCode, validateConfirmationCode, generateConfirmationCodeWithExpiration } from './src/lib/codeGenerator.js';

console.log('=== Test du Générateur de Code de Confirmation ===\n');

// Test 1: Génération de codes multiples
console.log('1. Génération de 10 codes différents:');
for (let i = 0; i < 10; i++) {
  const code = generateConfirmationCode();
  console.log(`   Code ${i + 1}: ${code} (longueur: ${code.length})`);
}

// Test 2: Validation des codes
console.log('\n2. Tests de validation:');
const testCodes = [
  '2467e!',  // Valide
  '8a3b9z',  // Valide
  '4x7c2!',  // Valide
  '12345',   // Invalide (trop court)
  '1234567', // Invalide (trop long)
  '123abc',  // Valide
  'ABCDEF',  // Invalide (majuscules)
  '!@#$%^',  // Invalide (que des caractères spéciaux)
  '',        // Invalide (vide)
  null       // Invalide (null)
];

testCodes.forEach((code, index) => {
  const isValid = validateConfirmationCode(code);
  console.log(`   Code "${code}": ${isValid ? '✅ Valide' : '❌ Invalide'}`);
});

// Test 3: Génération avec expiration
console.log('\n3. Test de génération avec expiration:');
const codeWithExpiration = generateConfirmationCodeWithExpiration(5); // 5 minutes
console.log(`   Code: ${codeWithExpiration.code}`);
console.log(`   Expire à: ${codeWithExpiration.expiresAt}`);
console.log(`   Est expiré: ${codeWithExpiration.isExpired()}`);

// Test 4: Vérification de l'unicité
console.log('\n4. Test d\'unicité (génération de 1000 codes):');
const codes = new Set();
let duplicates = 0;

for (let i = 0; i < 1000; i++) {
  const code = generateConfirmationCode();
  if (codes.has(code)) {
    duplicates++;
  }
  codes.add(code);
}

console.log(`   Codes générés: 1000`);
console.log(`   Codes uniques: ${codes.size}`);
console.log(`   Doublons: ${duplicates}`);
console.log(`   Taux d'unicité: ${((codes.size / 1000) * 100).toFixed(2)}%`);

// Test 5: Analyse des caractères utilisés
console.log('\n5. Analyse des caractères dans 100 codes:');
let hasNumbers = 0;
let hasLetters = 0;
let hasSpecialChars = 0;

for (let i = 0; i < 100; i++) {
  const code = generateConfirmationCode();
  if (/\d/.test(code)) hasNumbers++;
  if (/[a-z]/.test(code)) hasLetters++;
  if (/[!@#$%&*]/.test(code)) hasSpecialChars++;
}

console.log(`   Codes avec chiffres: ${hasNumbers}/100 (${hasNumbers}%)`);
console.log(`   Codes avec lettres: ${hasLetters}/100 (${hasLetters}%)`);
console.log(`   Codes avec caractères spéciaux: ${hasSpecialChars}/100 (${hasSpecialChars}%)`);

console.log('\n=== Tests terminés ===');