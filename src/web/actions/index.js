'use strict';

const moderationActions = require('./moderationActions');
const configActions = require('./configActions');

const ALL_ACTIONS = [...moderationActions, ...configActions];

const registry = new Map(ALL_ACTIONS.map((action) => [action.key, action]));

function getAction(key) {
  return registry.get(key);
}

function listActions() {
  // Ne jamais exposer la fonction `execute` au frontend — uniquement les métadonnées.
  return ALL_ACTIONS.map(({ execute, ...meta }) => meta);
}

/**
 * Valide les paramètres reçus contre le schéma déclaré de l'action.
 * Ne fait JAMAIS confiance aux données brutes envoyées par le navigateur :
 * chaque champ requis doit être présent, et les types de base sont vérifiés.
 */
function validateParams(action, rawParams) {
  const params = {};
  const errors = [];

  for (const field of action.fields) {
    const value = rawParams?.[field.key];

    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push(`Le champ "${field.label}" est requis.`);
      continue;
    }

    if (value === undefined || value === null || value === '') continue;

    if (field.type === 'number') {
      const num = Number(value);
      if (Number.isNaN(num)) {
        errors.push(`Le champ "${field.label}" doit être un nombre.`);
        continue;
      }
      if (field.min !== undefined && num < field.min) errors.push(`"${field.label}" doit être ≥ ${field.min}.`);
      if (field.max !== undefined && num > field.max) errors.push(`"${field.label}" doit être ≤ ${field.max}.`);
      params[field.key] = num;
      continue;
    }

    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
      errors.push(`Le champ "${field.label}" est invalide.`);
      continue;
    }

    params[field.key] = typeof value === 'string' ? value.slice(0, 2000) : value;
  }

  return { params, errors };
}

module.exports = { getAction, listActions, validateParams };
