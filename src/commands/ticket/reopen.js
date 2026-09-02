'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveTicket } = require('../../utils/resolveTicket');
const TicketService = require('../../services/TicketService');

module.exports = {
  name: 'reopen',
  aliases: [],
  category: 'ticket',
  description: 'Rouvre un ticket fermé (courant ou spécifié).',
  usage: '[#ticket]',
  examples: [''],
  permission: 'moderator',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  cooldown: 3,
  async execute(message, args) {
    const { channel, ticket, error } = await resolveTicket(message, args[0]);

    if (error === 'channel_not_found') {
      return message.channel.send({ embeds: [EmbedManager.genericError('Salon introuvable.')] });
    }
    if (error === 'not_a_ticket') {
      return message.channel.send({ embeds: [EmbedManager.genericError("Ce salon n'est pas un ticket.")] });
    }
    if (ticket.status === 'open') {
      return message.channel.send({ embeds: [EmbedManager.genericError('Ce ticket est déjà ouvert.')] });
    }

    await TicketService.reopenTicket(channel, ticket);

    const embed = EmbedManager.success({ title: '🔓 Ticket rouvert', description: `Le ticket ${channel} a été rouvert.` });
    return channel.send({ embeds: [embed] });
  },
};
