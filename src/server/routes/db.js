import express from 'express';
import { db } from '../db/index.js';

const router = express.Router();

// Middleware de validation des requêtes SQL
// Note: Ceci est une implémentation basique, il faudrait ajouter plus de sécurité en production
const validateQuery = (req, res, next) => {
  const { sql, params } = req.body;

  if (!sql) {
    return res.status(400).json({ error: 'La requête SQL est requise' });
  }

  // Vérifiez que la requête SQL est autorisée
  const allowedQueries = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE'
  ];

  const isAllowed = allowedQueries.some(query => 
    sql.trim().toUpperCase().startsWith(query)
  );

  if (!isAllowed) {
    return res.status(403).json({ error: 'Type de requête non autorisé' });
  }

  next();
};

router.post('/query', validateQuery, async (req, res) => {
  try {
    const { sql, params } = req.body;
    const result = await db.query(sql, params);
    res.json(result);
  } catch (error) {
    console.error('Erreur de base de données:', error);
    res.status(500).json({ 
      error: 'Erreur lors de l\'exécution de la requête',
      details: error.message
    });
  }
});

export default router;