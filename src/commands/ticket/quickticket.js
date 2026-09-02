'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const TicketService = require('../../services/TicketService');

module.exports = {
  name: 'quickticket',
  aliases: ['qt'],
  category: 'ticket',
  description: "Crée immédiatement un ticket pour vous, sans passer par le panel.",
  usage: '',
  examples: [''],
  permission: 'everyone',
  cooldown: 10,
  async execute(message) {
    const result = await TicketService.createTicket(message.guild, message.member);

    if (result.error === 'already_open') {
      return message.channel.send({ embeds: [EmbedManager.genericError('Vous avez déjà un ticket ouvert.')] });
    }

    const embed = EmbedManager.success({
      title: '🎫 Ticket créé',
      description: `Votre ticket a été créé : ${result.channel}`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
