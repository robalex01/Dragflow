'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const StatsService = require('../../services/StatsService');
const { MemberStats } = require('../../database/models');

module.exports = {
  name: 'activity',
  aliases: ['top10'],
  category: 'statistique',
  description: 'Classe les 10 membres les plus actifs (messages + temps vocal combinés).',
  usage: '',
  examples: [''],
  permission: 'everyone',
  cooldown: 5,
  async execute(message) {
    const all = await MemberStats.findAll({ where: { guildId: message.guild.id } });

    if (all.length === 0) {
      return message.channel.send({
        embeds: [EmbedManager.build({ title: '⚡ Membres les plus actifs', description: 'Aucune donnée collectée pour le moment.' })],
      });
    }

    const ranked = all
      .map((d) => ({
        userId: d.userId,
        score: d.messages + Math.floor(d.voiceSeconds / 60) * 2,
        messages: d.messages,
        voiceSeconds: d.voiceSeconds,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const description = ranked
      .map(
        (d, i) =>
          `**${i + 1}.** <@${d.userId}> — ${d.messages} messages, ${StatsService.formatVoiceDuration(d.voiceSeconds)} en vocal`
      )
      .join('\n');

    const embed = EmbedManager.build({
      title: '⚡ Membres les plus actifs',
      description,
      footerText: 'Score = messages + (minutes vocal × 2)',
    });
    return message.channel.send({ embeds: [embed] });
  },
};
