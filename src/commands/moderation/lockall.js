'use strict';

const { PermissionsBitField, ChannelType } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');
const ModLogService = require('../../services/ModLogService');

module.exports = {
  name: 'lockall',
  aliases: [],
  category: 'moderation',
  description: 'Verrouille tous les salons textuels du serveur.',
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
        .edit(message.guild.id, { [PermissionsBitField.Flags.SendMessages]: false })
        .catch(() => null);
      count += 1;
    }

    await ModLogService.send(message.guild, {
      title: '🔒 Tous les salons verrouillés',
      fields: [
        { name: 'Quantité', value: `${count}`, inline: true },
        { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
      ],
    });

    const embed = EmbedManager.success({
      title: '🔒 Verrouillage global',
      description: `**${count}** salon(s) textuel(s) verrouillé(s).`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
