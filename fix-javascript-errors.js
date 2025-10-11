#!/usr/bin/env node

/**
 * Script de correction des erreurs JavaScript de production
 * Corrige les problèmes identifiés dans les logs de production
 */

import fs from 'fs';
import path from 'path';

const FIXES = {
  // Problème 1: client.createdAt vs client.created_at
  'ClientCard.jsx': {
    from: 'client.createdAt',
    to: 'client.created_at',
    description: 'Correction du nom de propriété pour la date de création'
  },
  
  // Problème 2: Vérifications DOM nulles
  'DocumentManager.jsx': {
    from: 'document.body.appendChild(a);',
    to: 'if (document.body) { document.body.appendChild(a); }',
    description: 'Protection contre document.body null'
  },
  
  // Problème 3: Vérifications de téléchargement
  'TaskCard.jsx': {
    from: 'document.body.appendChild(a);',  
    to: 'if (document.body) { document.body.appendChild(a); }',
    description: 'Protection pour les téléchargements'
  },
  
  // Problème 4: Vérifications dans TaskForm
  'TaskForm.jsx': {
    from: 'document.body.appendChild(a);',
    to: 'if (document.body) { document.body.appendChild(a); }',
    description: 'Protection pour les uploads'
  }
};

console.log('🔧 Application des corrections JavaScript...\n');

Object.entries(FIXES).forEach(([filename, fix]) => {
  const filePath = path.join('src/components', filename);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes(fix.from)) {
      content = content.replace(new RegExp(fix.from, 'g'), fix.to);
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${filename}: ${fix.description}`);
    } else {
      console.log(`ℹ️  ${filename}: Déjà corrigé ou non trouvé`);
    }
  } else {
    console.log(`⚠️  ${filename}: Fichier non trouvé`);
  }
});

console.log('\n🎯 Corrections spécifiques pour les propriétés manquantes...\n');

// Correction spécifique pour ClientCard PropTypes
const clientCardPath = 'src/components/ClientCard.jsx';
if (fs.existsSync(clientCardPath)) {
  let content = fs.readFileSync(clientCardPath, 'utf8');
  
  // Correction des PropTypes
  if (content.includes('createdAt: PropTypes.string.isRequired')) {
    content = content.replace(
      'createdAt: PropTypes.string.isRequired',
      'created_at: PropTypes.string.isRequired'
    );
    fs.writeFileSync(clientCardPath, content);
    console.log('✅ ClientCard.jsx: PropTypes corrigés pour created_at');
  }
}

console.log('\n🚀 Toutes les corrections JavaScript ont été appliquées !');
console.log('\n📋 Prochaines étapes :');
console.log('1. Appliquer les migrations de base de données');
console.log('2. Tester l\'application en production');
console.log('3. Vérifier les logs d\'erreur');