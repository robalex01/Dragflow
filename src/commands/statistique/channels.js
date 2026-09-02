'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const StatsService = require('../../services/StatsService');

module.exports = {
  name: 'channels',
  aliases: ['topchannels'],
  category: 'statistique',
  description: 'Classe les salons les plus actifs du serveur (nombre de messages).',
  usage: '',
  examples: [''],
  permission: 'everyone',
  cooldown: 5,
  async execute(message) {
    const top = await StatsService.getTopChannels(message.guild.id, 10);

    if (top.length === 0) {
      return message.channel.send({
        embeds: [EmbedManager.build({ title: '📈 Salons les plus actifs', description: 'Aucune donnée collectée pour le moment.' })],
      });
    }

    const description = top
      .map((c, i) => `**${i + 1}.** <#${c.channelId}> — ${c.messages} message(s)`)
      .join('\n');

    const embed = EmbedManager.build({ title: '📈 Salons les plus actifs', description });
    return message.channel.send({ embeds: [embed] });
  },
};
