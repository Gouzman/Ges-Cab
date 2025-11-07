/**
 * Composant de connexion PostgreSQL pour Ges-Cab
 * Gère les cas de première connexion et connexion normale
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { validateEmail, validatePassword } from '../lib/authValidation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { PasswordStrengthIndicator, ValidationError } from './LoginFormComponents';

export const LoginForm = ({ onSuccess }) => {
  const { signIn, completeFirstSignIn, resetUserPassword } = usePostgreSQLAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFirstLogin, setShowFirstLogin] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [tempPassword, setTempPassword] = useState('');

  // Validation en temps réel
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'email':
        {
          const emailValidation = validateEmail(value);
          if (!emailValidation.isValid && value) {
            newErrors.email = emailValidation.message;
          } else {
            delete newErrors.email;
          }
        }
        break;
      
      case 'password':
        if (!value && !showFirstLogin) {
          newErrors.password = 'Mot de passe requis';
        } else {
          delete newErrors.password;
        }
        break;
      
      case 'newPassword':
        if (showFirstLogin) {
          const passwordValidation = validatePassword(value);
          if (!passwordValidation.isValid && value) {
            newErrors.newPassword = 'Mot de passe trop faible';
          } else {
            delete newErrors.newPassword;
          }
        }
        break;
      
      case 'confirmPassword':
        if (showFirstLogin && value !== formData.newPassword) {
          newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await signIn(formData.email, formData.password);
      
      if (!result.error) {
        if (result.requiresPasswordChange) {
          setShowFirstLogin(true);
          setTempPassword(formData.password);
        } else {
          onSuccess?.();
        }
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFirstLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await completeFirstSignIn(
        formData.email, 
        tempPassword, 
        formData.newPassword
      );
      
      if (!result.error) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Erreur de première connexion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await resetUserPassword(formData.email);
      setShowPasswordReset(false);
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (error) {
      console.error('Erreur de réinitialisation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Formulaire de réinitialisation
  if (showPasswordReset) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center">
            <Lock className="h-5 w-5" />
            Mot de passe oublié
          </CardTitle>
          <CardDescription>
            Entrez votre email pour recevoir un nouveau mot de passe temporaire
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="votre-email@exemple.com"
                  required
                />
              </div>
              {errors.email && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.email}</AlertDescription>
                </Alert>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || errors.email}
            >
              {isSubmitting ? 'Envoi en cours...' : 'Réinitialiser le mot de passe'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setShowPasswordReset(false)}
            >
              Retour à la connexion
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Formulaire de première connexion
  if (showFirstLogin) {
    const newPasswordValidation = validatePassword(formData.newPassword);

    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center gap-2 justify-center">
            <Lock className="h-5 w-5" />
            Première connexion
          </CardTitle>
          <CardDescription>
            Définissez votre nouveau mot de passe pour sécuriser votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFirstLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  placeholder="Nouveau mot de passe"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <PasswordStrengthIndicator 
                passwordValidation={newPasswordValidation} 
                password={formData.newPassword} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  placeholder="Confirmer le mot de passe"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <ValidationError error={errors.confirmPassword} />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !newPasswordValidation.isValid || errors.confirmPassword}
            >
              {isSubmitting ? 'Mise à jour...' : 'Définir le mot de passe'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Formulaire de connexion normal
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center gap-2 justify-center">
          <Lock className="h-5 w-5" />
          Connexion Ges-Cab
        </CardTitle>
        <CardDescription>
          Connectez-vous à votre compte de gestion de cabinet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10"
                placeholder="votre-email@exemple.com"
                required
              />
            </div>
            <ValidationError error={errors.email} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="password"
                name="password"
                type={showPassword.current ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10 pr-10"
                placeholder="Mot de passe"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <ValidationError error={errors.password} />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || Object.keys(errors).length > 0}
          >
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setShowPasswordReset(true)}
          >
            Mot de passe oublié ?
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Validation des props
LoginForm.propTypes = {
  onSuccess: PropTypes.func,
};

LoginForm.defaultProps = {
  onSuccess: null,
};

export default LoginForm;