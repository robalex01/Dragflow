'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveChannel } = require('../../utils/resolveChannel');
const GuildConfigService = require('../../services/GuildConfigService');

module.exports = {
  name: 'suggestion',
  aliases: ['suggestions'],
  category: 'configuration',
  description: 'Définit le salon utilisé pour les suggestions (ou `off` pour désactiver).',
  usage: '<#salon/off>',
  examples: ['#suggestions', 'off'],
  permission: 'administrator',
  userPermissions: ['ManageGuild'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    if (args[0].toLowerCase() === 'off') {
      await GuildConfigService.update(message.guild.id, { suggestionChannelId: null });
      const embed = EmbedManager.success({ title: '💡 Suggestions désactivées', description: 'Aucun salon configuré.' });
      return message.channel.send({ embeds: [embed] });
    }

    const channel = resolveChannel(message, args[0]);
    if (!channel) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Salon introuvable.')] });
    }

    await GuildConfigService.update(message.guild.id, { suggestionChannelId: channel.id });
    const embed = EmbedManager.success({
      title: '💡 Salon de suggestions défini',
      description: `Les suggestions seront envoyées dans ${channel}.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
