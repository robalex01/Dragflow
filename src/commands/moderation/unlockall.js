'use strict';

const { PermissionsBitField, ChannelType } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');
const ModLogService = require('../../services/ModLogService');

module.exports = {
  name: 'unlockall',
  aliases: [],
  category: 'moderation',
  description: 'Déverrouille tous les salons textuels du serveur.',
  usage: '',
  examples: [''],
  permission: 'administrator',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  cooldown: 10,
  async execute(message) {
    const textChannels = message.guild.channels.cache.filter(
      (c) => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement
    );

    let count = 0;
    for (const channel of textChannels.values()) {
      await channel.permissionOverwrites
        .edit(message.guild.id, { [PermissionsBitField.Flags.SendMessages]: null })
        .catch(() => null);
      count += 1;
    }

    await ModLogService.send(message.guild, {
      title: '🔓 Tous les salons déverrouillés',
      fields: [
        { name: 'Quantité', value: `${count}`, inline: true },
        { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
      ],
    });

    const embed = EmbedManager.success({
      title: '🔓 Déverrouillage global',
      description: `**${count}** salon(s) textuel(s) déverrouillé(s).`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
