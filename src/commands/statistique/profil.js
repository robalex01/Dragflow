'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { MemberStats, LevelData } = require('../../database/models');
const StatsService = require('../../services/StatsService');
const LevelService = require('../../services/LevelService');
const inviteTracker = require('../../services/InviteTrackerService');

module.exports = {
  name: 'profil',
  aliases: ['profile'],
  category: 'statistique',
  description: "Affiche le profil complet d'un membre (niveau, invitations, activité).",
  usage: '[@membre]',
  examples: ['@Utilisateur'],
  permission: 'everyone',
  cooldown: 3,
  async execute(message, args) {
    const target = args[0] ? await resolveMember(message.guild, args[0]) : message.member;
    if (!target) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
    }

    const [stats] = await MemberStats.findOrCreate({ where: { guildId: message.guild.id, userId: target.id } });
    const [level] = await LevelData.findOrCreate({ where: { guildId: message.guild.id, userId: target.id } });
    const inviteData = await inviteTracker.getOrCreate(message.guild.id, target.id);
    const rank = await StatsService.getRank(message.guild.id, target.id, 'messages');

    const embed = EmbedManager.build({
      title: `👤 Profil de ${target.user.username}`,
      thumbnail: target.user.displayAvatarURL(),
      fields: [
        { name: "Membre depuis", value: `<t:${Math.floor(target.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: 'Niveau', value: `${level.level}`, inline: true },
        { name: 'Rang messages', value: rank.position ? `#${rank.position}/${rank.total}` : 'Non classé', inline: true },
        { name: 'Messages envoyés', value: `${stats.messages}`, inline: true },
        { name: 'Temps en vocal', value: StatsService.formatVoiceDuration(stats.voiceSeconds), inline: true },
        { name: 'Invitations nettes', value: `${inviteTracker.netInvites(inviteData)}`, inline: true },
      ],
      color: level.rankColor || undefined,
      timestamp: true,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
