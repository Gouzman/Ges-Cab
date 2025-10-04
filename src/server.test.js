import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Serveur en ligne!' });
});

// Route de connexion simplifiée pour le test
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Pour le test, on accepte n'importe quel email/mot de passe
  const user = { id: 1, email };
  const token = jwt.sign(
    { userId: user.id },
    'secret_temporaire',
    { expiresIn: '24h' }
  );

  res.json({ user, token });
});

app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});