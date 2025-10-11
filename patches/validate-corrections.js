#!/usr/bin/env node

/**
 * Script de validation des corrections appliquées
 */

import fs from 'fs';
import path from 'path';

const VALIDATIONS = [
  {
    file: 'src/main.jsx',
    check: 'const rootElement = document.getElementById',
    description: 'Protection élément root'
  },
  {
    file: 'src/components/ClientCard.jsx',
    check: 'client.created_at',
    description: 'Propriété created_at correcte'
  },
  {
    file: 'src/components/DocumentManager.jsx',
    check: 'if (document.body)',
    description: 'Protection DOM DocumentManager'
  },
  {
    file: 'src/components/TaskCard.jsx',
    check: 'if (document.body)',
    description: 'Protection DOM TaskCard'
  },
  {
    file: 'src/components/TaskForm.jsx',
    check: 'if (document.body)',
    description: 'Protection DOM TaskForm'
  },
  {
    file: 'src/components/Reports.jsx',
    check: 'if (document.body)',
    description: 'Protection DOM Reports'
  }
];

console.log('🧪 VALIDATION DES CORRECTIONS\n');

let allPassed = true;

VALIDATIONS.forEach(({ file, check, description }) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(check)) {
      console.log(`✅ ${description}`);
    } else {
      console.log(`❌ ${description} - ÉCHEC`);
      allPassed = false;
    }
  } else {
    console.log(`⚠️  ${file} - Fichier non trouvé`);
    allPassed = false;
  }
});

console.log('\n' + (allPassed ? '🎉 TOUTES LES VALIDATIONS PASSÉES !' : '❌ CERTAINES VALIDATIONS ONT ÉCHOUÉ'));
process.exit(allPassed ? 0 : 1);
