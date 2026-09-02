'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveTicket } = require('../../utils/resolveTicket');
const TicketService = require('../../services/TicketService');

module.exports = {
  name: 'delete',
  aliases: [],
  category: 'ticket',
  description: 'Supprime définitivement un ticket (courant ou spécifié), avec transcript envoyé aux logs.',
  usage: '[#ticket]',
  examples: [''],
  permission: 'administrator',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  cooldown: 5,
  async execute(message, args) {
    const { channel, ticket, error } = await resolveTicket(message, args[0]);

    if (error === 'channel_not_found') {
      return message.channel.send({ embeds: [EmbedManager.genericError('Salon introuvable.')] });
    }
    if (error === 'not_a_ticket') {
      return message.channel.send({ embeds: [EmbedManager.genericError("Ce salon n'est pas un ticket.")] });
    }

    const embed = EmbedManager.warning({
      title: '🗑️ Suppression du ticket',
      description: 'Ce salon sera supprimé dans 5 secondes...',
    });
    await channel.send({ embeds: [embed] });

    setTimeout(async () => {
      await TicketService.deleteTicket(channel, ticket);
    }, 5000);
  },
};
