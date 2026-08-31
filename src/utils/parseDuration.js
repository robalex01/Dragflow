'use strict';

const ms = require('ms');

const MAX_TIMEOUT_MS = 28 * 24 * 60 * 60 * 1000; // limite Discord pour les timeouts (mute natif)

/**
 * Parse une durée écrite en langage courant (ex: "10m", "2h", "1d", "1h30m")
 * en millisecondes. Retourne null si invalide.
 * Supporte la concaténation simple de segments (ex: "1h30m" -> 1h + 30m).
 */
function parseDuration(input) {
  if (!input) return null;

  // Tente d'abord un parsing direct (ex: "10m", "2h", "1d")
  const direct = ms(input);
  if (typeof direct === 'number' && direct > 0) return direct;

  // Fallback : segments concaténés type "1h30m"
  const regex = /(\d+)\s*(y|mo|w|d|h|m|s)/gi;
  let total = 0;
  let matched = false;
  let match;

  while ((match = regex.exec(input)) !== null) {
    matched = true;
    const value = Number(match[1]);
    const unit = match[2];
    total += ms(`${value}${unit}`);
  }

  return matched && total > 0 ? total : null;
}

function formatDuration(msValue) {
  return ms(msValue, { long: true });
}

module.exports = { parseDuration, formatDuration, MAX_TIMEOUT_MS };
