/**
 * Utilitaires pour la gestion des différents types de comptes
 */

/**
 * Détermine le type de compte basé sur les propriétés utilisateur
 * @param {Object} user - Données utilisateur
 * @returns {string} Type de compte: 'admin-created', 'self-created', 'unknown'
 */
export const getAccountType = (user) => {
  if (!user) return 'unknown';
  
  // Si créé par un admin (a un created_by)
  if (user.created_by) {
    return 'admin-created';
  }
  
  // Si première connexion et pas de created_by = auto-créé
  if (user.first_login === true && !user.created_by) {
    return 'self-created';
  }
  
  // Compte existant sans indication claire
  return 'unknown';
};

/**
 * Détermine si un utilisateur doit utiliser le système de mot de passe temporaire
 * @param {Object} user - Données utilisateur
 * @returns {boolean} True si doit utiliser le système temporaire
 */
export const shouldUseTempPassword = (user) => {
  return getAccountType(user) === 'admin-created';
};

/**
 * Détermine si un utilisateur doit utiliser le système de code de confirmation
 * @param {Object} user - Données utilisateur
 * @returns {boolean} True si doit utiliser le système de confirmation
 */
export const shouldUseConfirmationCode = (user) => {
  return getAccountType(user) === 'self-created';
};

/**
 * Messages personnalisés selon le type de compte
 */
export const getAccountMessages = (accountType) => {
  const messages = {
    'admin-created': {
      welcome: "Bienvenue ! Votre compte a été créé par un administrateur.",
      passwordInfo: "Vous avez reçu un mot de passe temporaire par email.",
      nextStep: "Saisissez votre mot de passe temporaire pour continuer."
    },
    'self-created': {
      welcome: "Bienvenue ! Merci de vous être inscrit.",
      passwordInfo: "Un code de confirmation a été envoyé à votre email.",
      nextStep: "Vérifiez votre email et saisissez le code de confirmation."
    },
    'unknown': {
      welcome: "Bienvenue !",
      passwordInfo: "Connexion standard.",
      nextStep: "Saisissez votre mot de passe pour vous connecter."
    }
  };
  
  return messages[accountType] || messages.unknown;
};