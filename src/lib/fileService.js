import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = process.env.VITE_UPLOAD_DIR || 'uploads';

// Assurer que le répertoire d'upload existe
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export const fileService = {
  async uploadFile(file, subdir = '') {
    await ensureUploadDir();
    
    // Générer un nom de fichier unique
    const fileExt = path.extname(file.name);
    const randomName = crypto.randomBytes(16).toString('hex');
    const fileName = `${randomName}${fileExt}`;
    
    // Créer le sous-répertoire si nécessaire
    const uploadPath = path.join(UPLOAD_DIR, subdir);
    await fs.mkdir(uploadPath, { recursive: true });
    
    // Sauvegarder le fichier
    const filePath = path.join(uploadPath, fileName);
    await fs.writeFile(filePath, file.buffer);
    
    return {
      path: path.join(subdir, fileName),
      name: file.name,
      size: file.size,
      type: file.type
    };
  },

  async deleteFile(filePath) {
    const fullPath = path.join(UPLOAD_DIR, filePath);
    try {
      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      return false;
    }
  },

  async getFileStream(filePath) {
    const fullPath = path.join(UPLOAD_DIR, filePath);
    return fs.readFile(fullPath);
  },

  getPublicUrl(filePath) {
    return `/api/files/${filePath}`;
  }
};

export default fileService;