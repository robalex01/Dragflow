'use strict';

/**
 * Génère un pourcentage (0-100) déterministe à partir d'une chaîne (ex: un ID
 * utilisateur ou une paire d'IDs). Utilisé par les commandes fun type "lovecalc"
 * afin que le résultat reste identique à chaque appel pour la même paire.
 */
function hashToPercent(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 101;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
  return array[randomInt(0, array.length - 1)];
}

module.exports = { hashToPercent, randomInt, randomChoice };
