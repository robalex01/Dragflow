'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveChannel } = require('../../utils/resolveChannel');
const GuildConfigService = require('../../services/GuildConfigService');

module.exports = {
  name: 'logs',
  aliases: [],
  category: 'configuration',
  description: 'Définit le salon de logs de modération (ou `off` pour désactiver).',
  usage: '<#salon/off>',
  examples: ['#logs', 'off'],
  permission: 'administrator',
  userPermissions: ['ManageGuild'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    if (args[0].toLowerCase() === 'off') {
      await GuildConfigService.update(message.guild.id, { logsChannelId: null });
      const embed = EmbedManager.success({ title: '📝 Logs désactivés', description: 'Aucun salon de logs configuré.' });
      return message.channel.send({ embeds: [embed] });
    }

    const channel = resolveChannel(message, args[0]);
    if (!channel) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Salon introuvable.')] });
    }

    await GuildConfigService.update(message.guild.id, { logsChannelId: channel.id });
    const embed = EmbedManager.success({
      title: '📝 Salon de logs défini',
      description: `Les logs de modération seront envoyés dans ${channel}.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
