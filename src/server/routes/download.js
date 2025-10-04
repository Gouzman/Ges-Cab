import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

router.get('/:filepath', (req, res) => {
  try {
    const filePath = req.params.filepath;
    // Vérifier que le chemin est sécurisé (ne permet pas de remonter dans l'arborescence)
    const normalizedPath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(process.env.VITE_UPLOAD_DIR || 'uploads', normalizedPath);
    
    res.download(fullPath, path.basename(filePath), (err) => {
      if (err) {
        console.error('Erreur lors du téléchargement:', err);
        res.status(404).json({ error: 'Fichier non trouvé' });
      }
    });
  } catch (error) {
    console.error('Erreur lors du traitement de la requête:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;