'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { Ticket } = require('../../database/models');

module.exports = {
  name: 'rename',
  aliases: [],
  category: 'ticket',
  description: 'Renomme le ticket courant.',
  usage: '<nom>',
  examples: ['probleme-facturation'],
  permission: 'moderator',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args) {
    const ticket = await Ticket.findOne({ where: { guildId: message.guild.id, channelId: message.channel.id } });
    if (!ticket) {
      return message.channel.send({ embeds: [EmbedManager.genericError("Ce salon n'est pas un ticket.")] });
    }

    const newName = args.join(' ').substring(0, 90);
    await message.channel.setName(newName, `Renommé par ${message.author.tag}`);

    const embed = EmbedManager.success({ title: '✏️ Ticket renommé', description: `Ce ticket s'appelle maintenant **${newName}**.` });
    return message.channel.send({ embeds: [embed] });
  },
};
