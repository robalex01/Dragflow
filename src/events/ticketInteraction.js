'use strict';

const EmbedManager = require('../managers/EmbedManager');
const TicketService = require('../services/TicketService');
const { Ticket } = require('../database/models');

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (!['ticket_create', 'ticket_close'].includes(interaction.customId)) return;

    if (interaction.customId === 'ticket_create') {
      await interaction.deferReply({ ephemeral: true });

      const result = await TicketService.createTicket(interaction.guild, interaction.member);

      if (result.error === 'already_open') {
        return interaction.editReply({ content: '❌ Vous avez déjà un ticket ouvert.' });
      }

      return interaction.editReply({ content: `✅ Votre ticket a été créé : ${result.channel}` });
    }

    if (interaction.customId === 'ticket_close') {
      const ticket = await Ticket.findOne({ where: { channelId: interaction.channel.id } });
      if (!ticket) {
        return interaction.reply({ content: "❌ Ce salon n'est pas un ticket valide.", ephemeral: true });
      }
      if (ticket.status === 'closed') {
        return interaction.reply({ content: '❌ Ce ticket est déjà fermé.', ephemeral: true });
      }

      await interaction.reply({ content: '🔒 Fermeture du ticket en cours...', ephemeral: true });
      await TicketService.closeTicket(interaction.channel, ticket, interaction.user);
    }
  },
};
