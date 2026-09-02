'use strict';

const { resolveChannel } = require('./resolveChannel');
const { Ticket } = require('../database/models');

/**
 * Résout un ticket à partir d'un argument optionnel de salon (mention/id),
 * ou retombe sur le salon courant si aucun argument n'est fourni.
 * Retourne { channel, ticket } ou { error } si introuvable.
 */
async function resolveTicket(message, arg) {
  const channel = arg ? resolveChannel(message, arg) : message.channel;
  if (!channel) return { error: 'channel_not_found' };

  const ticket = await Ticket.findOne({ where: { guildId: message.guild.id, channelId: channel.id } });
  if (!ticket) return { error: 'not_a_ticket' };

  return { channel, ticket };
}

module.exports = { resolveTicket };
