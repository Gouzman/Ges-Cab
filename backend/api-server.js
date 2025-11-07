import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 3003;

// Configuration CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

app.use(express.json());

// Configuration PostgreSQL
const pool = new Pool({
  user: process.env.PG_USER || 'gouzman',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'ges_cab',
  password: process.env.PG_PASSWORD || '',
  port: process.env.PG_PORT || 5432,
});

// Middleware pour logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==========================================
// ROUTES D'AUTHENTIFICATION LOCALE
// ==========================================

// Route pour vérifier si un utilisateur existe
app.get('/api/auth/check-user', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email requis' 
      });
    }

    // Vérifier dans la table profiles
    const profileQuery = 'SELECT id, email, name FROM profiles WHERE email = $1';
    const profileResult = await pool.query(profileQuery, [email.toLowerCase()]);
    
    // Vérifier dans la table users (pour le mot de passe)
    const userQuery = 'SELECT id, password_hash FROM users WHERE email = $1';
    const userResult = await pool.query(userQuery, [email.toLowerCase()]);
    
    const exists = profileResult.rows.length > 0;
    const hasPassword = userResult.rows.length > 0 && userResult.rows[0].password_hash;
    
    res.json({
      success: true,
      data: {
        exists,
        hasPassword: !!hasPassword,
        userId: exists ? profileResult.rows[0].id : null
      }
    });
  } catch (error) {
    console.error('Erreur vérification utilisateur:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Route pour la connexion
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email et mot de passe requis'
      });
    }

    // Récupérer l'utilisateur depuis la table users
    const userQuery = 'SELECT * FROM users WHERE email = $1';
    const userResult = await pool.query(userQuery, [email.toLowerCase()]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    const user = userResult.rows[0];
    
    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        error: 'Mot de passe non configuré'
      });
    }

    // Vérifier le mot de passe avec bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Mettre à jour la dernière connexion
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE email = $1',
      [email.toLowerCase()]
    );

    // Retourner les données utilisateur (sans le mot de passe)
    const { password_hash, ...userData } = user;
    
    res.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
});

// Routes pour les tâches
app.get('/api/tasks', async (req, res) => {
  try {
    const { user_id } = req.query;
    let query = `
      SELECT id, title, description, priority, status, deadline, assigned_to_id, case_id, 
             attachments, assigned_to_name, assigned_at, created_by_id, 
             created_by_name, created_at, updated_at
      FROM tasks
    `;
    
    const params = [];
    
    if (user_id) {
      query += ' WHERE assigned_to_id = $1';
      params.push(user_id);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ data: result.rows, error: null });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const {
      title, description, priority, status, deadline, assigned_to_id, case_id,
      attachments, assigned_to_name, assigned_at, created_by_id, created_by_name
    } = req.body;

    const query = `
      INSERT INTO tasks (
        title, description, priority, status, deadline, assigned_to_id, case_id,
        attachments, assigned_to_name, assigned_at, created_by_id, created_by_name,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      title, description, priority, status, deadline, assigned_to_id, case_id,
      JSON.stringify(attachments || []), assigned_to_name, assigned_at, 
      created_by_id, created_by_name
    ];

    const result = await pool.query(query, values);
    res.json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const setClauses = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (key === 'attachments') {
        setClauses.push(`${key} = $${paramCount}`);
        values.push(JSON.stringify(updateData[key]));
      } else {
        setClauses.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
      }
      paramCount++;
    });

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE tasks 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    res.json({ data: result.rows, error: null });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM tasks WHERE id = $1';
    await pool.query(query, [id]);
    res.json({ data: null, error: null });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

// Routes pour les profils
app.get('/api/profiles', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM profiles ORDER BY name');
    res.json({ data: result.rows, error: null });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

// Routes pour les dossiers (cases)
app.get('/api/cases', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, title, status FROM cases ORDER BY title');
    res.json({ data: result.rows, error: null });
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

// Routes pour les alertes
app.get('/api/alerts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alerts ORDER BY created_at DESC');
    res.json({ data: result.rows, error: null });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

app.post('/api/alerts', async (req, res) => {
  try {
    const { text, author_id, author_name } = req.body;
    const query = `
      INSERT INTO alerts (text, author_id, author_name, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    const result = await pool.query(query, [text, author_id, author_name]);
    res.json({ data: result.rows[0], error: null });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ data: null, error: error.message });
  }
});

// Route pour récupérer tous les utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, function, role, created_at, last_login FROM users ORDER BY name');
    res.json({ data: result.rows, error: null });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ data: null, error: error.message });
  }
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

// Route de test pour compatibilité
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

const HOST = '0.0.0.0'; // écoute sur toutes les interfaces réseau

app.listen(port, HOST, () => {
  console.log(`🚀 API Server running on http://${HOST}:${port}`);
  console.log(`📊 Health check: http://${HOST}:${port}/api/health`);
});
