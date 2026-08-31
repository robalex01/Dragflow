'use strict';

const { PermissionsBitField, ChannelType } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');
const ModLogService = require('../../services/ModLogService');

module.exports = {
  name: 'unhideall',
  aliases: [],
  category: 'moderation',
  description: 'Révèle tous les salons textuels à @everyone.',
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
        .edit(message.guild.id, { [PermissionsBitField.Flags.ViewChannel]: null })
        .catch(() => null);
      count += 1;
    }

    await ModLogService.send(message.guild, {
      title: '👁️ Tous les salons révélés',
      fields: [{ name: 'Quantité', value: `${count}` }, { name: 'Modérateur', value: `${message.author.tag}` }],
    });

    const embed = EmbedManager.success({
      title: '👁️ Révélation globale',
      description: `**${count}** salon(s) révélé(s).`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
