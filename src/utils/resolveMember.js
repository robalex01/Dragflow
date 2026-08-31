'use strict';

const MENTION_REGEX = /^<@!?(\d+)>$/;
const ID_REGEX = /^\d{17,20}$/;

/**
 * Résout un GuildMember à partir d'un argument utilisateur : mention, ID brut,
 * ou correspondance approximative sur le pseudo/tag (dernier recours).
 * Retourne null si rien n'est trouvé.
 */
async function resolveMember(guild, arg) {
  if (!arg) return null;

  const mentionMatch = arg.match(MENTION_REGEX);
  const id = mentionMatch ? mentionMatch[1] : ID_REGEX.test(arg) ? arg : null;

  if (id) {
    const member = await guild.members.fetch(id).catch(() => null);
    if (member) return member;
  }

  const lower = arg.toLowerCase();
  const cached = guild.members.cache.find(
    (m) =>
      m.user.username.toLowerCase() === lower ||
      m.displayName.toLowerCase() === lower ||
      m.user.tag.toLowerCase() === lower
  );

  return cached || null;
}

module.exports = { resolveMember, MENTION_REGEX, ID_REGEX };
