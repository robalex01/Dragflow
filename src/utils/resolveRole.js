'use strict';

const ROLE_MENTION_REGEX = /^<@&(\d+)>$/;
const ID_REGEX = /^\d{17,20}$/;

/**
 * Résout un rôle du serveur à partir d'une mention, d'un ID, ou d'un nom exact/approché.
 */
function resolveRole(guild, arg) {
  if (!arg) return null;

  const mentionMatch = arg.match(ROLE_MENTION_REGEX);
  const id = mentionMatch ? mentionMatch[1] : ID_REGEX.test(arg) ? arg : null;

  if (id) {
    const role = guild.roles.cache.get(id);
    if (role) return role;
  }

  const lower = arg.toLowerCase();
  return guild.roles.cache.find((r) => r.name.toLowerCase() === lower) || null;
}

module.exports = { resolveRole };
