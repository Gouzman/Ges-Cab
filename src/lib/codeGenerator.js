/**
 * Générateur de codes de confirmation
 * Génère des codes aléatoires à 6 caractères avec lettres et chiffres
 */

/**
 * Génère un code de confirmation aléatoire à 6 caractères
 * Format: mélange de lettres (minuscules) et chiffres avec caractères spéciaux
 * Exemple: "2467e!", "8a3b9z", "4x7c2!"
 * @returns {string} Code de 6 caractères
 */
export const generateConfirmationCode = () => {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%&*';
  
  // Garantir au moins un chiffre, une lettre et optionnellement un caractère spécial
  let code = '';
  
  // Ajouter au moins un chiffre
  code += numbers[Math.floor(Math.random() * numbers.length)];
  
  // Ajouter au moins une lettre
  code += letters[Math.floor(Math.random() * letters.length)];
  
  // Compléter avec un mélange aléatoire (4 caractères restants)
  const allChars = letters + numbers + specialChars;
  for (let i = 0; i < 4; i++) {
    code += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Mélanger les caractères pour éviter un pattern prévisible
  return code.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Valide un code de confirmation
 * @param {string} code - Code à valider
 * @returns {boolean} True si le code est valide
 */
export const validateConfirmationCode = (code) => {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  // Le code doit faire exactement 6 caractères
  if (code.length !== 6) {
    return false;
  }
  
  // Le code doit contenir uniquement des lettres, chiffres et caractères spéciaux autorisés
  const validPattern = /^[a-z0-9!@#$%&*]{6}$/;
  return validPattern.test(code);
};

/**
 * Génère un code de confirmation avec expiration
 * @param {number} expirationMinutes - Minutes avant expiration (défaut: 15)
 * @returns {object} Objet avec le code et la date d'expiration
 */
export const generateConfirmationCodeWithExpiration = (expirationMinutes = 15) => {
  const code = generateConfirmationCode();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);
  
  return {
    code,
    expiresAt: expiresAt.toISOString(),
    isExpired: () => new Date() > new Date(expiresAt)
  };
};