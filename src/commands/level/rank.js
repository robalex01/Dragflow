'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const LevelService = require('../../services/LevelService');

function progressBar(current, total, length = 20) {
  const filled = Math.round((current / total) * length);
  return '█'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, length - filled));
}

module.exports = {
  name: 'rank',
  aliases: ['niveau'],
  category: 'level',
  description: "Affiche la carte de rang (niveau/XP) d'un membre.",
  usage: '[@membre]',
  examples: ['@Utilisateur'],
  permission: 'everyone',
  cooldown: 3,
  async execute(message, args) {
    const target = args[0] ? await resolveMember(message.guild, args[0]) : message.member;
    if (!target) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
    }

    const data = await LevelService.getOrCreate(message.guild.id, target.id);
    const required = LevelService.xpRequiredForLevel(data.level);
    const rank = await LevelService.getRank(message.guild.id, target.id);

    const embed = EmbedManager.build({
      title: `📊 Rang de ${target.user.username}`,
      color: data.rankColor || undefined,
      thumbnail: target.user.displayAvatarURL(),
      fields: [
        { name: 'Niveau', value: `${data.level}`, inline: true },
        { name: 'Rang', value: rank.position ? `#${rank.position}/${rank.total}` : 'Non classé', inline: true },
        { name: 'XP', value: `${data.xp}/${required}`, inline: true },
        { name: 'Progression', value: `\`${progressBar(data.xp, required)}\`` },
      ],
    });
    return message.channel.send({ embeds: [embed] });
  },
};
