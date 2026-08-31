'use strict';

const CHANNEL_MENTION_REGEX = /^<#(\d+)>$/;
const ID_REGEX = /^\d{17,20}$/;

/**
 * Résout un salon du serveur à partir d'une mention ou d'un ID.
 * Si aucun argument n'est fourni, retourne le salon courant du message.
 */
function resolveChannel(message, arg) {
  if (!arg) return message.channel;

  const mentionMatch = arg.match(CHANNEL_MENTION_REGEX);
  const id = mentionMatch ? mentionMatch[1] : ID_REGEX.test(arg) ? arg : null;

  if (id) {
    const channel = message.guild.channels.cache.get(id);
    if (channel) return channel;
  }

  return null;
}

module.exports = { resolveChannel };
