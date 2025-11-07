/**
 * Composants utilitaires pour le formulaire de connexion
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

/**
 * Indicateur de force du mot de passe
 */
export const PasswordStrengthIndicator = ({ passwordValidation, password }) => {
  if (!password) return null;

  // Déterminer la couleur selon le niveau de sécurité
  let colorClass = 'text-red-600';
  let levelText = 'Faible';
  
  if (passwordValidation.securityLevel === 'strong') {
    colorClass = 'text-green-600';
    levelText = 'Forte';
  } else if (passwordValidation.securityLevel === 'medium') {
    colorClass = 'text-yellow-600';
    levelText = 'Moyenne';
  }

  return (
    <div className="space-y-1">
      <div className={`text-sm ${colorClass}`}>
        Sécurité: {levelText}
      </div>
      <div className="space-y-1">
        {passwordValidation.validations.map((validation, index) => {
          // Déterminer la couleur du critère
          let criteriaColor = 'text-gray-500';
          if (validation.test) {
            criteriaColor = 'text-green-600';
          } else if (validation.severity === 'error') {
            criteriaColor = 'text-red-600';
          }

          return (
            <div key={`validation-${validation.message}`} className={`text-xs flex items-center gap-1 ${criteriaColor}`}>
              <span>{validation.test ? '✓' : '✗'}</span>
              {validation.message}
            </div>
          );
        })}
      </div>
    </div>
  );
};

PasswordStrengthIndicator.propTypes = {
  passwordValidation: PropTypes.shape({
    securityLevel: PropTypes.string,
    validations: PropTypes.arrayOf(PropTypes.shape({
      test: PropTypes.bool,
      message: PropTypes.string,
      severity: PropTypes.string,
    })),
  }).isRequired,
  password: PropTypes.string.isRequired,
};

/**
 * Affichage des erreurs de validation
 */
export const ValidationError = ({ error }) => {
  if (!error) return null;

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};

ValidationError.propTypes = {
  error: PropTypes.string,
};

ValidationError.defaultProps = {
  error: null,
};

export default {
  PasswordStrengthIndicator,
  ValidationError,
};