'use strict';

const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const Logger = require('../utils/Logger');

const COMMANDS_DIR = path.join(__dirname, '..', 'commands');

/**
 * Convention attendue pour chaque fichier de commande (module.exports) :
 * {
 *   name: 'ban',                       // nom principal, utilisé après le préfixe
 *   aliases: ['banir'],                // alias statiques (en plus des alias DB par serveur)
 *   category: 'moderation',            // dossier parent (calculé automatiquement si absent)
 *   description: '...',
 *   usage: '<@membre/id> [raison]',    // syntaxe affichée dans +help <commande>
 *   examples: ['@Utilisateur spam'],
 *   permission: 'moderator',           // permission personnalisée requise par défaut
 *   userPermissions: ['BanMembers'],   // permissions Discord natives requises (utilisateur)
 *   botPermissions: ['BanMembers'],    // permissions Discord natives requises (bot)
 *   ownerOnly: false,
 *   cooldown: 4,                       // secondes
 *   args: { min: 1 },                  // validations simples des arguments
 *   async execute(message, args, context) { ... }
 * }
 */
function loadCommandsRecursively(dir, collection, categories) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      loadCommandsRecursively(fullPath, collection, categories);
      continue;
    }

    if (!entry.name.endsWith('.js')) continue;

    delete require.cache[require.resolve(fullPath)];
    const command = require(fullPath);

    if (!command || !command.name || typeof command.execute !== 'function') {
      Logger.warn(`Fichier de commande invalide ignoré : ${fullPath}`);
      continue;
    }

    const category = command.category || path.basename(path.dirname(fullPath));
    command.category = category;

    if (collection.has(command.name)) {
      Logger.warn(`Commande dupliquée détectée et écrasée : "${command.name}" (${fullPath})`);
    }

    collection.set(command.name.toLowerCase(), command);

    if (!categories.has(category)) categories.set(category, []);
    categories.get(category).push(command);

    if (Array.isArray(command.aliases)) {
      for (const alias of command.aliases) {
        collection.set(alias.toLowerCase(), command);
      }
    }
  }
}

/**
 * Charge (ou recharge) toutes les commandes dans client.commands et client.categories.
 */
function loadCommands(client) {
  client.commands = new Collection();
  client.categories = new Collection();

  if (!fs.existsSync(COMMANDS_DIR)) {
    Logger.warn(`Dossier de commandes introuvable : ${COMMANDS_DIR}`);
    return;
  }

  loadCommandsRecursively(COMMANDS_DIR, client.commands, client.categories);

  // Nombre de commandes uniques (sans compter les alias qui pointent vers le même objet)
  const uniqueCommands = new Set(client.commands.values());
  Logger.success(
    `${uniqueCommands.size} commande(s) chargée(s) dans ${client.categories.size} catégorie(s).`
  );
}

module.exports = { loadCommands, COMMANDS_DIR };
