import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../../db/index.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { rows } = await db.query(
      'SELECT id, email, full_name, profile_picture_url, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Ne pas envoyer le hash du mot de passe au client
    delete user.password_hash;

    const token = jwt.sign(
      { userId: user.id },
      process.env.VITE_JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ user, token });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
});

router.get('/validate', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.VITE_JWT_SECRET);
    const { rows } = await db.query(
      'SELECT id, email, full_name, profile_picture_url FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ user: rows[0] });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide' });
    }
    console.error('Erreur de validation:', error);
    res.status(500).json({ message: 'Erreur du serveur' });
  }
});

router.post('/logout', (req, res) => {
  // Pour un système plus sécurisé, vous pourriez vouloir blacklister le token
  res.json({ message: 'Déconnexion réussie' });
});

export default router;