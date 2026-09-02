'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveTicket } = require('../../utils/resolveTicket');

module.exports = {
  name: 'claim',
  aliases: [],
  category: 'ticket',
  description: 'Réclame la prise en charge du ticket (courant ou spécifié).',
  usage: '[#salon]',
  examples: ['', '#ticket-12'],
  permission: 'moderator',
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
      return message.channel.send({ embeds: [EmbedManager.genericError('Ce ticket est fermé.')] });
    }
    if (ticket.claimedBy) {
      return message.channel.send({
        embeds: [EmbedManager.genericError(`Ce ticket est déjà pris en charge par <@${ticket.claimedBy}>.`)],
      });
    }

    ticket.claimedBy = message.author.id;
    await ticket.save();

    const embed = EmbedManager.success({
      title: '🙋 Ticket pris en charge',
      description: `${message.author} prend en charge ce ticket.`,
    });
    return channel.send({ embeds: [embed] });
  },
};
