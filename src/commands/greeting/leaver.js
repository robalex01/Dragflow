'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveChannel } = require('../../utils/resolveChannel');
const GuildConfigService = require('../../services/GuildConfigService');

module.exports = {
  name: 'leaver',
  aliases: [],
  category: 'greeting',
  description: 'Définit rapidement le salon de départ (ou `off` pour désactiver).',
  usage: '<#salon/off>',
  examples: ['#départs', 'off'],
  permission: 'administrator',
  userPermissions: ['ManageGuild'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    if (args[0].toLowerCase() === 'off') {
      await GuildConfigService.update(message.guild.id, { leaveChannelId: null });
      const embed = EmbedManager.success({ title: '👋 Messages de départ désactivés', description: '' });
      return message.channel.send({ embeds: [embed] });
    }

    const channel = resolveChannel(message, args[0]);
    if (!channel) return message.channel.send({ embeds: [EmbedManager.genericError('Salon introuvable.')] });

    await GuildConfigService.update(message.guild.id, { leaveChannelId: channel.id });
    const embed = EmbedManager.success({
      title: '👋 Salon de départ défini',
      description: `Les départs seront annoncés dans ${channel}.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
