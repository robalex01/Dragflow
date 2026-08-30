'use strict';

/**
 * Correspondance entre le nom technique d'un dossier de catégorie (src/commands/<nom>)
 * et son libellé affiché dans +help. Toute catégorie non listée ici est affichée
 * avec son nom capitalisé par défaut (voir getCategoryLabel).
 */
const CATEGORY_LABELS = {
  moderation: 'Modération',
  owner: 'Owner',
  information: 'Information',
  utile: 'Utile',
  configuration: 'Configuration',
  protection: 'Protection',
  fun: 'Fun',
  statistique: 'Statistique',
  ticket: 'Ticket',
  game: 'Game',
  giveaway: 'Giveaway',
  level: 'Level',
  invite: 'Invite',
  custom: 'Custom',
  reactionroles: 'Rôles Réactions',
  greeting: 'Bienvenue / Départ',
};

function getCategoryLabel(categoryKey) {
  if (CATEGORY_LABELS[categoryKey]) return CATEGORY_LABELS[categoryKey];
  return categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
}

module.exports = { CATEGORY_LABELS, getCategoryLabel };
