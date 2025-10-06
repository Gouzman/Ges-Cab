/**
 * Utilitaires pour la validation des mots de passe et des emails
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    message: emailRegex.test(email) ? '' : 'Format d\'email invalide'
  };
};

export const validatePassword = (password) => {
  const validations = [
    {
      test: password.length >= 6,
      message: "Au moins 6 caractères",
      severity: 'error'
    },
    {
      test: /[A-Z]/.test(password),
      message: "Une majuscule (A-Z)",
      severity: 'warning'
    },
    {
      test: /[a-z]/.test(password),
      message: "Une minuscule (a-z)",
      severity: 'warning'
    },
    {
      test: /[0-9]/.test(password),
      message: "Un chiffre (0-9)",
      severity: 'warning'
    },
    {
      test: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      message: "Un caractère spécial (!@#$%...)",
      severity: 'info'
    }
  ];

  const passedValidations = validations.filter(v => v.test);
  const failedValidations = validations.filter(v => !v.test);
  
  // Niveau de sécurité basé sur les critères respectés
  let securityLevel = 'weak';
  if (passedValidations.length >= 4) securityLevel = 'strong';
  else if (passedValidations.length >= 3) securityLevel = 'medium';

  return {
    validations,
    passedValidations,
    failedValidations,
    securityLevel,
    isMinimumValid: password.length >= 6, // Minimum pour Supabase
    isStrong: passedValidations.length >= 4
  };
};

export const getPasswordStrengthColor = (securityLevel) => {
  switch (securityLevel) {
    case 'strong': return 'text-green-500';
    case 'medium': return 'text-yellow-500';
    case 'weak': return 'text-red-500';
    default: return 'text-gray-500';
  }
};

export const getPasswordStrengthText = (securityLevel) => {
  switch (securityLevel) {
    case 'strong': return 'Mot de passe fort';
    case 'medium': return 'Mot de passe moyen';
    case 'weak': return 'Mot de passe faible';
    default: return 'Entrez un mot de passe';
  }
};

// Messages d'erreur personnalisés pour Supabase
export const getSupabaseErrorMessage = (error) => {
  if (!error) return null;

  const errorMessage = error.message || error.toString();

  if (errorMessage.includes('User already registered')) {
    return "Un compte avec cet email existe déjà. Essayez de vous connecter.";
  }
  
  if (errorMessage.includes('Invalid login credentials')) {
    return "Email ou mot de passe incorrect. Vérifiez vos identifiants.";
  }
  
  if (errorMessage.includes('Email not confirmed')) {
    return "Votre email n'a pas été confirmé. Vérifiez votre boîte de réception.";
  }
  
  if (errorMessage.includes('Password should be at least')) {
    return "Le mot de passe doit contenir au moins 6 caractères.";
  }
  
  if (errorMessage.includes('Unable to validate email address')) {
    return "Format d'email invalide. Vérifiez votre adresse email.";
  }
  
  if (errorMessage.includes('Too many requests')) {
    return "Trop de tentatives. Attendez quelques minutes avant de réessayer.";
  }
  
  if (errorMessage.includes('Network')) {
    return "Problème de connexion réseau. Vérifiez votre connexion internet.";
  }

  // Message générique pour les autres erreurs
  return errorMessage || "Une erreur inattendue s'est produite.";
};