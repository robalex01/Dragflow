'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { MemberStats, LevelData, InviteData } = require('../../database/models');
const StatsService = require('../../services/StatsService');
const inviteTracker = require('../../services/InviteTrackerService');

async function buildStatLine(guildId, member) {
  const stats = await MemberStats.findOne({ where: { guildId, userId: member.id } });
  const [level] = await LevelData.findOrCreate({ where: { guildId, userId: member.id } });
  const [invites] = await InviteData.findOrCreate({ where: { guildId, userId: member.id } });

  return {
    tag: member.user.tag,
    messages: stats?.messages || 0,
    voice: StatsService.formatVoiceDuration(stats?.voiceSeconds || 0),
    level: level.level,
    invites: inviteTracker.netInvites(invites),
  };
}

module.exports = {
  name: 'compare',
  aliases: ['vs'],
  category: 'statistique',
  description: 'Compare les statistiques de deux membres (ou plus) côte à côte.',
  usage: '@user1 [@user2 ...]',
  examples: ['@Alice @Bob'],
  permission: 'everyone',
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args) {
    const members = [];
    for (const arg of args.slice(0, 4)) {
      const member = await resolveMember(message.guild, arg);
      if (member) members.push(member);
    }

    if (members.length === 0) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Aucun membre valide trouvé.')] });
    }

    const lines = [];
    for (const member of members) {
      const s = await buildStatLine(message.guild.id, member);
      lines.push(
        `**${s.tag}**\n📨 ${s.messages} messages | 🔊 ${s.voice} | 📊 Niveau ${s.level} | 📩 ${s.invites} invit.`
      );
    }

    const embed = EmbedManager.build({ title: '⚖️ Comparaison', description: lines.join('\n\n') });
    return message.channel.send({ embeds: [embed] });
  },
};
