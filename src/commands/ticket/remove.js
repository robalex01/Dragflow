'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { Ticket } = require('../../database/models');

module.exports = {
  name: 'remove',
  aliases: [],
  category: 'ticket',
  description: 'Retire un membre du ticket courant.',
  usage: '<@membre/id>',
  examples: ['@Utilisateur'],
  permission: 'moderator',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    const ticket = await Ticket.findOne({ where: { guildId: message.guild.id, channelId: message.channel.id } });
    if (!ticket) {
      return message.channel.send({ embeds: [EmbedManager.genericError("Ce salon n'est pas un ticket.")] });
    }

    const target = await resolveMember(message.guild, args[0]);
    if (!target) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
    }

    if (target.id === ticket.ownerId) {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Impossible de retirer le propriétaire du ticket. Utilisez `+close` à la place.')],
      });
    }

    await message.channel.permissionOverwrites.delete(target.id);

    const embed = EmbedManager.success({
      title: '➖ Membre retiré',
      description: `${target} a été retiré de ce ticket.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
