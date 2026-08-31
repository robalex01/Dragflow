'use strict';

const { PermissionsBitField, ChannelType } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');
const { resolveChannel } = require('../../utils/resolveChannel');
const ModLogService = require('../../services/ModLogService');

module.exports = {
  name: 'lock',
  aliases: ['verrouiller'],
  category: 'moderation',
  description: "Verrouille un ou plusieurs salons (empêche @everyone d'envoyer des messages).",
  usage: '[#salon1] [#salon2]',
  examples: ['', '#général #annonces'],
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

    const locked = [];
    for (const channel of channels) {
      if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) continue;
      await channel.permissionOverwrites.edit(message.guild.id, {
        [PermissionsBitField.Flags.SendMessages]: false,
      });
      locked.push(`${channel}`);
    }

    await ModLogService.send(message.guild, {
      title: '🔒 Salon(s) verrouillé(s)',
      fields: [
        { name: 'Salons', value: locked.join(', ') || 'Aucun', inline: true },
        { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
      ],
    });

    const embed = EmbedManager.success({
      title: '🔒 Salon(s) verrouillé(s)',
      description: locked.length > 0 ? locked.join(', ') : 'Aucun salon textuel valide.',
    });
    return message.channel.send({ embeds: [embed] });
  },
};
