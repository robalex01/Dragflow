'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveChannel } = require('../../utils/resolveChannel');
const GuildConfigService = require('../../services/GuildConfigService');

module.exports = {
  name: 'joiner',
  aliases: [],
  category: 'greeting',
  description: 'Définit rapidement le salon de bienvenue (ou `off` pour désactiver).',
  usage: '<#salon/off>',
  examples: ['#arrivées', 'off'],
  permission: 'administrator',
  userPermissions: ['ManageGuild'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    if (args[0].toLowerCase() === 'off') {
      await GuildConfigService.update(message.guild.id, { welcomeChannelId: null });
      const embed = EmbedManager.success({ title: '👋 Messages de bienvenue désactivés', description: '' });
      return message.channel.send({ embeds: [embed] });
    }

    const channel = resolveChannel(message, args[0]);
    if (!channel) return message.channel.send({ embeds: [EmbedManager.genericError('Salon introuvable.')] });

    await GuildConfigService.update(message.guild.id, { welcomeChannelId: channel.id });
    const embed = EmbedManager.success({
      title: '👋 Salon de bienvenue défini',
      description: `Les nouveaux membres seront accueillis dans ${channel}.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
