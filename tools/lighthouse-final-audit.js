#!/usr/bin/env node

/**
 * Audit Lighthouse Final - Ges-Cab
 * Test complet de performance sur le build optimisé
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

console.log('🚀 AUDIT LIGHTHOUSE FINAL - GES-CAB');
console.log('🎯 Test du build optimisé sur localhost:4173');
console.log('📊 Objectif: Score 90+/100 en performance\n');

const reportDir = path.join(projectRoot, 'tools', 'reports');
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportPath = path.join(reportDir, `lighthouse-${timestamp}.json`);
const htmlReportPath = path.join(reportDir, `lighthouse-${timestamp}.html`);

async function runLighthouse() {
  console.log('🔍 Exécution de l\'audit Lighthouse...\n');
  
  try {
    // Commande Lighthouse optimisée pour CI
    const lighthouseCmd = `lighthouse http://localhost:4173 \\
      --output json \\
      --output html \\
      --output-path ${reportPath.replace('.json', '')} \\
      --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage --disable-background-timer-throttling --disable-backgrounding-occluded-windows" \\
      --throttling-method=devtools \\
      --preset=desktop \\
      --view \\
      --quiet`;
    
    console.log('⚡ Analyse en cours...');
    
    execSync(lighthouseCmd, { 
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 60000 // 60s timeout
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erreur Lighthouse:', error.message);
    return false;
  }
}

// Fonctions utilitaires pour réduire la complexité cognitive
function getScoreEmoji(score) {
  if (score >= 90) return '🟢';
  if (score >= 70) return '🟡';
  return '🔴';
}

function getScoreStatus(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Bon';
  return 'À améliorer';
}

function getMetricStatus(key, value, target) {
  if (key === 'cumulative-layout-shift') {
    if (value <= target) return '🟢';
    if (value <= target * 2) return '🟡';
    return '🔴';
  }
  
  if (value <= target) return '🟢';
  if (value <= target * 1.5) return '🟡';
  return '🔴';
}

function analyzeReport() {
  if (!fs.existsSync(reportPath)) {
    console.log('❌ Rapport JSON non trouvé');
    return;
  }
  
  try {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    const categories = report.lhr.categories;
    const audits = report.lhr.audits;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSULTATS LIGHTHOUSE FINAL:');
    console.log('='.repeat(80));
    
    // Scores par catégorie
    console.log('\n🏆 SCORES PAR CATÉGORIE:');
    Object.entries(categories).forEach(([, category]) => {
      const score = Math.round(category.score * 100);
      const emoji = getScoreEmoji(score);
      const status = getScoreStatus(score);
      
      console.log(`   ${emoji} ${category.title}: ${score}/100 (${status})`);
    });
    
    // Métriques Core Web Vitals
    console.log('\n⚡ CORE WEB VITALS:');
    
    const metrics = [
      { key: 'first-contentful-paint', name: 'FCP', target: 1000 },
      { key: 'largest-contentful-paint', name: 'LCP', target: 2500 },
      { key: 'interactive', name: 'TTI', target: 2000 },
      { key: 'cumulative-layout-shift', name: 'CLS', target: 0.1 },
      { key: 'speed-index', name: 'SI', target: 1300 }
    ];
    
    metrics.forEach(({ key, name, target }) => {
      if (audits[key]) {
        const value = audits[key].numericValue;
        const displayValue = audits[key].displayValue;
        const status = getMetricStatus(key, value, target);
        const targetDisplay = key === 'cumulative-layout-shift' ? target : target + 'ms';
        
        console.log(`   ${status} ${name}: ${displayValue} (cible: ${targetDisplay})`);
      }
    });
    
    // Opportunités d'optimisation
    console.log('\n💡 PRINCIPALES OPPORTUNITÉS:');
    const opportunities = [
      'unused-css-rules',
      'unused-javascript',
      'render-blocking-resources',
      'unminified-css',
      'unminified-javascript'
    ];
    
    let hasOpportunities = false;
    opportunities.forEach(auditKey => {
      if (audits[auditKey] && audits[auditKey].score < 0.9) {
        const audit = audits[auditKey];
        console.log(`   ⚠️  ${audit.title}: ${audit.displayValue || 'À optimiser'}`);
        hasOpportunities = true;
      }
    });
    
    if (!hasOpportunities) {
      console.log('   🎉 Aucune opportunité majeure détectée !');
    }
    
    // Performance score
    const perfScore = Math.round(categories.performance.score * 100);
    console.log('\n🎯 RÉSULTAT FINAL:');
    
    if (perfScore >= 90) {
      console.log(`   🏆 OBJECTIF ATTEINT ! Score Performance: ${perfScore}/100`);
      console.log("   🎉 Excellent ! L'application est hautement optimisée.");
    } else if (perfScore >= 70) {
      console.log(`   🟡 OBJECTIF PROCHE ! Score Performance: ${perfScore}/100`);
      console.log('   💪 Bon travail ! Quelques optimisations supplémentaires possibles.');
    } else {
      console.log(`   🔴 OBJECTIF NON ATTEINT ! Score Performance: ${perfScore}/100`);
      console.log('   🚀 Des optimisations supplémentaires sont nécessaires.');
    }
    
    console.log(`\n📋 Rapports sauvegardés:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlReportPath}`);
    
    console.log('\n='.repeat(80));
    
  } catch (error) {
    console.error('❌ Erreur analyse rapport:', error.message);
    throw error; // Re-lancer l'erreur plutôt que de l'ignorer silencieusement
  }
}

async function main() {
  console.log('🎯 Vérification du serveur preview...');
  
  try {
    // Vérifier que le serveur répond
    execSync('curl -f http://localhost:4173 > /dev/null 2>&1', { timeout: 5000 });
    console.log('✅ Serveur preview accessible\n');
  } catch (error) {
    console.log('❌ Serveur preview non accessible');
    console.log('💡 Démarrez-le avec: npm run preview');
    process.exit(1);
  }
  
  const success = await runLighthouse();
  
  if (success) {
    console.log('✅ Audit Lighthouse terminé');
    analyzeReport();
  } else {
    console.log("❌ Échec de l'audit Lighthouse");
    console.log('\n💡 Vérifications:');
    console.log('   • Le serveur preview tourne (npm run preview)');
    console.log('   • Le port 4173 est accessible');
    console.log('   • Google Chrome est installé');
  }
}

main().catch(console.error);
