import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import filesRouter from './api/files.js';
import downloadRouter from './server/routes/download.js';
import dbRouter from './server/routes/db.js';
import authRouter from './server/routes/auth/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    const user = jwt.verify(token, process.env.VITE_JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token invalide' });
  }
};

// Routes d'authentification
app.use('/api/auth', authRouter);

// Routes protégées par authentification
app.use('/api/download', authenticateToken, downloadRouter);
app.use('/api/db', authenticateToken, dbRouter);

// Exemple de route protégée
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Cette route est protégée', user: req.user });
});

// Routes des fichiers
app.use('/api/files', authenticateToken, filesRouter);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur' });
});

app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});