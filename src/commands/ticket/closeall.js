'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { Ticket } = require('../../database/models');
const TicketService = require('../../services/TicketService');

module.exports = {
  name: 'closeall',
  aliases: [],
  category: 'ticket',
  description: 'Ferme tous les tickets ouverts du serveur.',
  usage: '',
  examples: [''],
  permission: 'administrator',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  cooldown: 15,
  async execute(message) {
    const openTickets = await Ticket.findAll({ where: { guildId: message.guild.id, status: 'open' } });

    if (openTickets.length === 0) {
      return message.channel.send({ embeds: [EmbedManager.build({ title: '🔒 Aucun ticket ouvert', description: 'Rien à fermer.' })] });
    }

    let count = 0;
    for (const ticket of openTickets) {
      const channel = message.guild.channels.cache.get(ticket.channelId);
      if (channel) {
        await TicketService.closeTicket(channel, ticket, message.author);
        count++;
      }
    }

    const embed = EmbedManager.success({ title: '🔒 Tickets fermés', description: `**${count}** ticket(s) ont été fermés.` });
    return message.channel.send({ embeds: [embed] });
  },
};
