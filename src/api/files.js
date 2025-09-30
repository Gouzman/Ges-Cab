import express from 'express';
import { fileService } from '../lib/fileService.js';
import { db } from '../lib/db.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Point d'API pour télécharger un fichier
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const fileInfo = await fileService.uploadFile(req.file);
    res.json(fileInfo);
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement du fichier' });
  }
});

// Point d'API pour télécharger un fichier
router.get('/:filePath(*)', async (req, res) => {
  try {
    const filePath = req.params.filePath;
    const fileData = await fileService.getFileStream(filePath);
    
    // Définir le type de contenu en fonction de l'extension
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.send(fileData);
  } catch (error) {
    console.error('Erreur lors de la récupération du fichier:', error);
    res.status(404).json({ error: 'Fichier non trouvé' });
  }
});

// Point d'API pour supprimer un fichier
router.delete('/:filePath(*)', async (req, res) => {
  try {
    const filePath = req.params.filePath;
    const success = await fileService.deleteFile(filePath);
    
    if (success) {
      res.json({ message: 'Fichier supprimé avec succès' });
    } else {
      res.status(404).json({ error: 'Fichier non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du fichier' });
  }
});

export default router;