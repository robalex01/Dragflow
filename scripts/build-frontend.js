'use strict';

/**
 * Exécuté automatiquement après chaque `npm install` à la racine (voir
 * package.json > scripts.postinstall). Installe les dépendances du frontend
 * et le build, afin que le dashboard soit toujours à jour après un
 * `git pull` + `npm install` — sans nécessiter de commande supplémentaire
 * sur les hébergeurs qui exécutent uniquement `npm install` puis
 * `node src/index.js` (ex: Wispbyte).
 *
 * Ce script ne fait JAMAIS échouer `npm install` : si le build du frontend
 * échoue pour une raison quelconque, le bot doit pouvoir démarrer quand même
 * (le dashboard affichera alors un message clair au lieu de planter le bot).
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

function run(command) {
  execSync(command, { cwd: FRONTEND_DIR, stdio: 'inherit' });
}

function main() {
  if (!fs.existsSync(path.join(FRONTEND_DIR, 'package.json'))) {
    console.log('[postinstall] Dossier frontend/ introuvable, dashboard web ignoré.');
    return;
  }

  console.log('[postinstall] Installation et build du frontend du dashboard...');

  try {
    run('npm install --no-audit --no-fund');
    run('npm run build');
    console.log('[postinstall] Frontend buildé avec succès (frontend/dist).');
  } catch (error) {
    console.warn(
      '[postinstall] ⚠️  Le build du frontend a échoué. Le bot démarrera quand même, ' +
        'mais le dashboard affichera une page indisponible tant que le build n\'aura pas réussi.'
    );
    console.warn('[postinstall] Détail :', error.message);
  }
}

main();
