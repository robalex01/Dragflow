'use strict';

const { PermissionsBitField, ChannelType } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');
const ModLogService = require('../../services/ModLogService');

module.exports = {
  name: 'hideall',
  aliases: [],
  category: 'moderation',
  description: 'Cache tous les salons textuels à @everyone.',
  usage: '',
  examples: [''],
  permission: 'administrator',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  cooldown: 10,
  async execute(message) {
    const textChannels = message.guild.channels.cache.filter((c) => c.type === ChannelType.GuildText);

    let count = 0;
    for (const channel of textChannels.values()) {
      await channel.permissionOverwrites
        .edit(message.guild.id, { [PermissionsBitField.Flags.ViewChannel]: false })
        .catch(() => null);
      count += 1;
    }

    await ModLogService.send(message.guild, {
      title: '🙈 Tous les salons cachés',
      fields: [{ name: 'Quantité', value: `${count}` }, { name: 'Modérateur', value: `${message.author.tag}` }],
    });

    const embed = EmbedManager.success({
      title: '🙈 Masquage global',
      description: `**${count}** salon(s) caché(s).`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
