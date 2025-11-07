import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env.local' });

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 3003;

// Configuration PostgreSQL
const pool = new Pool({
  user: process.env.VITE_PG_USER || 'gouzman',
  password: process.env.VITE_PG_PASSWORD || '',
  host: process.env.VITE_PG_HOST || 'localhost',
  database: process.env.VITE_PG_DATABASE || 'ges_cab',
  port: Number.parseInt(process.env.VITE_PG_PORT) || 5432,
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:3002', 
    'http://localhost:3003', 
    'http://localhost:3004', 
    'http://localhost:3005',
    'http://localhost:3006',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());

// Test de connexion PostgreSQL
pool.on('connect', () => {
  console.log('✅ Connexion PostgreSQL établie');
});

pool.on('error', (err) => {
  console.error('❌ Erreur PostgreSQL:', err);
});

// Routes d'authentification

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email et mot de passe requis' 
      });
    }

    // Chercher l'utilisateur
    const userQuery = 'SELECT * FROM users WHERE email = $1';
    const userResult = await pool.query(userQuery, [email.toLowerCase()]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }

    const user = userResult.rows[0];

    // Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }

    // Créer le token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'ges-cab-secret-key',
      { expiresIn: '7d' }
    );

    // Retourner les données utilisateur (sans le mot de passe)
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword,
      token,
      session: {
        access_token: token,
        user: userWithoutPassword,
        created_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur' 
    });
  }
});

// GET /api/auth/me - Vérifier le token
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ges-cab-secret-key');
    
    // Récupérer les données utilisateur actuelles
    const userQuery = 'SELECT * FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [decoded.userId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    const { password_hash, ...user } = userResult.rows[0];

    res.json({
      success: true,
      user,
      session: {
        access_token: token,
        user,
        created_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    res.status(401).json({ error: 'Token invalide' });
  }
});

// POST /api/auth/signin (alias pour /api/auth/login pour compatibilité frontend)
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email et mot de passe requis' 
      });
    }

    // Chercher l'utilisateur
    const userQuery = 'SELECT * FROM users WHERE email = $1';
    const userResult = await pool.query(userQuery, [email.toLowerCase()]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: 'Email ou mot de passe incorrect' 
      });
    }

    const user = userResult.rows[0];

    // Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false,
        error: 'Email ou mot de passe incorrect' 
      });
    }

    // Créer le token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'ges-cab-secret-key',
      { expiresIn: '7d' }
    );

    // Retourner les données utilisateur (sans le mot de passe)
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword,
      token,
      session: {
        access_token: token,
        user: userWithoutPassword
      }
    });

  } catch (error) {
    console.error('Erreur signin:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  // Côté serveur, pas besoin de stocker les tokens blacklistés pour l'instant
  res.json({ success: true, message: 'Déconnexion réussie' });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test de base de la connexion à la base de données
    await pool.query('SELECT 1');
    res.status(200).json({ 
      status: 'ok', 
      message: 'Backend running', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// Route de test
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as server_time, version() as pg_version');
    res.json({
      success: true,
      message: 'API Backend fonctionnelle',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur API démarré sur http://localhost:${PORT}`);
  console.log(`📊 Base de données: ${process.env.VITE_PG_DATABASE}@${process.env.VITE_PG_HOST}`);
});

// Gestion propre de l'arrêt
process.on('SIGINT', async () => {
  console.log('\n⏹️  Arrêt du serveur...');
  await pool.end();
  process.exit(0);
});