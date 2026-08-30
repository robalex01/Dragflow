'use strict';

const fs = require('fs');
const path = require('path');
const Logger = require('../utils/Logger');

const EVENTS_DIR = path.join(__dirname, '..', 'events');

/**
 * Convention attendue pour chaque fichier d'événement :
 * {
 *   name: 'messageCreate',   // nom de l'événement Discord.js (ou 'clientReady')
 *   once: false,             // true pour un événement déclenché une seule fois
 *   async execute(...args, client) { ... }
 * }
 */
function loadEvents(client) {
  if (!fs.existsSync(EVENTS_DIR)) {
    Logger.warn(`Dossier d'événements introuvable : ${EVENTS_DIR}`);
    return;
  }

  const files = fs.readdirSync(EVENTS_DIR).filter((f) => f.endsWith('.js'));
  let count = 0;

  for (const file of files) {
    const fullPath = path.join(EVENTS_DIR, file);
    delete require.cache[require.resolve(fullPath)];
    const event = require(fullPath);

    if (!event || !event.name || typeof event.execute !== 'function') {
      Logger.warn(`Fichier d'événement invalide ignoré : ${fullPath}`);
      continue;
    }

    const listener = (...args) => event.execute(...args, client);

    if (event.once) {
      client.once(event.name, listener);
    } else {
      client.on(event.name, listener);
    }

    count += 1;
  }

  Logger.success(`${count} événement(s) chargé(s).`);
}

module.exports = { loadEvents, EVENTS_DIR };
