'use strict';

const { MENTION_REGEX, ID_REGEX } = require('./resolveMember');

/**
 * Résout un utilisateur Discord (pas nécessairement présent sur le serveur),
 * utile pour +unban, +tempban sur un ID hors serveur, etc.
 */
async function resolveUser(client, arg) {
  if (!arg) return null;

  const mentionMatch = arg.match(MENTION_REGEX);
  const id = mentionMatch ? mentionMatch[1] : ID_REGEX.test(arg) ? arg : null;
  if (!id) return null;

  return client.users.fetch(id).catch(() => null);
}

module.exports = { resolveUser };
