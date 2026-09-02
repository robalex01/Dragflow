'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { Ticket } = require('../../database/models');
const TicketService = require('../../services/TicketService');

module.exports = {
  name: 'deleteall',
  aliases: [],
  category: 'ticket',
  description: 'Supprime définitivement tous les tickets fermés du serveur.',
  usage: '',
  examples: [''],
  permission: 'owner',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  cooldown: 15,
  async execute(message) {
    const closedTickets = await Ticket.findAll({ where: { guildId: message.guild.id, status: 'closed' } });

    if (closedTickets.length === 0) {
      return message.channel.send({
        embeds: [EmbedManager.build({ title: '🗑️ Aucun ticket fermé', description: 'Rien à supprimer.' })],
      });
    }

    const embed = EmbedManager.warning({
      title: '🗑️ Suppression en masse',
      description: `**${closedTickets.length}** ticket(s) fermé(s) vont être supprimés définitivement...`,
    });
    await message.channel.send({ embeds: [embed] });

    let count = 0;
    for (const ticket of closedTickets) {
      const channel = message.guild.channels.cache.get(ticket.channelId);
      if (channel) {
        await TicketService.deleteTicket(channel, ticket);
        count++;
      } else {
        await ticket.destroy();
      }
    }

    const doneEmbed = EmbedManager.success({ title: '🗑️ Suppression terminée', description: `**${count}** ticket(s) supprimé(s).` });
    await message.channel.send({ embeds: [doneEmbed] }).catch(() => null);
  },
};
