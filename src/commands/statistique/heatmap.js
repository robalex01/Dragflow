'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const StatsService = require('../../services/StatsService');

const BAR_LENGTH = 15;

function buildBar(value, max) {
  if (max === 0) return '░'.repeat(BAR_LENGTH);
  const filled = Math.round((value / max) * BAR_LENGTH);
  return '█'.repeat(filled) + '░'.repeat(BAR_LENGTH - filled);
}

module.exports = {
  name: 'heatmap',
  aliases: ['activityheatmap'],
  category: 'statistique',
  description: "Affiche la distribution des messages par heure de la journée (heure serveur).",
  usage: '',
  examples: [''],
  permission: 'everyone',
  cooldown: 5,
  async execute(message) {
    const guildStats = await StatsService.getOrCreateGuild(message.guild.id);
    const hourly = guildStats.hourlyActivity;
    const max = Math.max(...hourly, 1);

    const lines = hourly.map((count, hour) => {
      const label = `${hour.toString().padStart(2, '0')}h`;
      return `\`${label}\` ${buildBar(count, max)} ${count}`;
    });

    const embed = EmbedManager.build({
      title: '🔥 Heatmap d\'activité (par heure)',
      description: lines.join('\n'),
      footerText: 'Basé sur les messages collectés depuis le début du tracking.',
    });
    return message.channel.send({ embeds: [embed] });
  },
};
