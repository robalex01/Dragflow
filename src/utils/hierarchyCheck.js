'use strict';

/**
 * Vérifie qu'une action de modération peut être appliquée à un membre cible,
 * en tenant compte de la hiérarchie des rôles (exécutant ET bot) et des cas protégés
 * (propriétaire du serveur, soi-même, le bot lui-même).
 *
 * @returns {{ ok: boolean, reason?: string }}
 * reason possibles : 'self', 'bot_itself', 'guild_owner', 'hierarchy_user', 'hierarchy_bot'
 */
function checkHierarchy(message, targetMember) {
  const { guild, member: executor, client } = message;

  if (targetMember.id === executor.id) {
    return { ok: false, reason: 'self' };
  }

  if (targetMember.id === client.user.id) {
    return { ok: false, reason: 'bot_itself' };
  }

  if (targetMember.id === guild.ownerId) {
    return { ok: false, reason: 'guild_owner' };
  }

  const executorIsOwner = executor.id === guild.ownerId;

  if (!executorIsOwner) {
    if (targetMember.roles.highest.position >= executor.roles.highest.position) {
      return { ok: false, reason: 'hierarchy_user' };
    }
  }

  const botMember = guild.members.me;
  if (targetMember.roles.highest.position >= botMember.roles.highest.position) {
    return { ok: false, reason: 'hierarchy_bot' };
  }

  return { ok: true };
}

function hierarchyErrorMessage(reason) {
  const messages = {
    self: 'Vous ne pouvez pas effectuer cette action sur vous-même.',
    bot_itself: 'Vous ne pouvez pas effectuer cette action sur le bot.',
    guild_owner: 'Vous ne pouvez pas effectuer cette action sur le propriétaire du serveur.',
    hierarchy_user:
      "Ce membre possède un rôle égal ou supérieur au vôtre, vous ne pouvez pas effectuer cette action.",
    hierarchy_bot:
      "Ce membre possède un rôle égal ou supérieur au rôle du bot, le bot ne peut pas effectuer cette action.",
  };
  return messages[reason] || "Cette action n'est pas autorisée sur ce membre.";
}

module.exports = { checkHierarchy, hierarchyErrorMessage };
