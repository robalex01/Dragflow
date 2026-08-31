'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { PicOnlyChannel } = require('../../database/models');

module.exports = {
  name: 'piconly',
  aliases: ['imagesonly'],
  category: 'protection',
  description: 'Active ou désactive le mode "images uniquement" sur le salon courant.',
  usage: '<on/off>',
  examples: ['on', 'off'],
  permission: 'moderator',
  userPermissions: ['ManageChannels'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    const value = args[0].toLowerCase();
    if (!['on', 'off'].includes(value)) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Veuillez préciser `on` ou `off`.')] });
    }

    const guildId = message.guild.id;
    const channelId = message.channel.id;

    if (value === 'on') {
      await PicOnlyChannel.findOrCreate({ where: { guildId, channelId } });
    } else {
      await PicOnlyChannel.destroy({ where: { guildId, channelId } });
    }

    const embed = EmbedManager.success({
      title: '🖼️ Mode images uniquement',
      description: `Ce salon accepte ${value === 'on' ? 'désormais uniquement les images' : 'à nouveau tous les messages'}.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
