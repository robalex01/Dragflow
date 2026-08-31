'use strict';

const { PermissionsBitField } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');
const { resolveChannel } = require('../../utils/resolveChannel');
const ModLogService = require('../../services/ModLogService');

module.exports = {
  name: 'hide',
  aliases: ['cacher'],
  category: 'moderation',
  description: "Cache un ou plusieurs salons à @everyone.",
  usage: '[#salon1] [#salon2]',
  examples: [''],
  permission: 'moderator',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  cooldown: 3,
  async execute(message, args) {
    const channels =
      args.length > 0
        ? args.map((a) => resolveChannel(message, a)).filter(Boolean)
        : [message.channel];

    if (channels.length === 0) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Salon(s) introuvable(s).')] });
    }

    for (const channel of channels) {
      await channel.permissionOverwrites.edit(message.guild.id, {
        [PermissionsBitField.Flags.ViewChannel]: false,
      });
    }

    await ModLogService.send(message.guild, {
      title: '🙈 Salon(s) caché(s)',
      fields: [
        { name: 'Salons', value: channels.map((c) => `${c}`).join(', '), inline: true },
        { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
      ],
    });

    const embed = EmbedManager.success({
      title: '🙈 Salon(s) caché(s)',
      description: channels.map((c) => `${c}`).join(', '),
    });
    return message.channel.send({ embeds: [embed] });
  },
};
