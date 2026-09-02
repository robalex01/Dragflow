'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveTicket } = require('../../utils/resolveTicket');
const TicketService = require('../../services/TicketService');

module.exports = {
  name: 'close',
  aliases: [],
  category: 'ticket',
  description: 'Ferme le ticket (courant ou spécifié).',
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
    if (ticket.status === 'closed') {
      return message.channel.send({ embeds: [EmbedManager.genericError('Ce ticket est déjà fermé.')] });
    }

    await TicketService.closeTicket(channel, ticket, message.author);

    if (channel.id !== message.channel.id) {
      const embed = EmbedManager.success({ title: '🔒 Ticket fermé', description: `Le ticket ${channel} a été fermé.` });
      return message.channel.send({ embeds: [embed] });
    }
  },
};
