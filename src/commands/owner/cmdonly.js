'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveChannel } = require('../../utils/resolveChannel');
const GuildConfigService = require('../../services/GuildConfigService');

module.exports = {
  name: 'cmdonly',
  aliases: [],
  category: 'owner',
  description: 'Restreint les commandes du bot à un seul salon (ou `off` pour retirer la restriction).',
  usage: '<#salon/off>',
  examples: ['#bot-commandes', 'off'],
  permission: 'administrator',
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    if (args[0].toLowerCase() === 'off') {
      await GuildConfigService.update(message.guild.id, { cmdOnlyChannelId: null });
      const embed = EmbedManager.success({ title: '✅ Restriction retirée', description: 'Les commandes fonctionnent de nouveau partout.' });
      return message.channel.send({ embeds: [embed] });
    }

    const channel = resolveChannel(message, args[0]);
    if (!channel) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Salon introuvable.')] });
    }

    await GuildConfigService.update(message.guild.id, { cmdOnlyChannelId: channel.id });
    const embed = EmbedManager.success({
      title: '🔒 Commandes restreintes',
      description: `Les commandes ne fonctionneront désormais que dans ${channel} (les administrateurs restent exemptés).`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
