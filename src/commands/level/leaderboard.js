'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const LevelService = require('../../services/LevelService');
const StatsService = require('../../services/StatsService');
const { InviteData } = require('../../database/models');

module.exports = {
  name: 'leaderboard',
  aliases: ['classement', 'top'],
  category: 'level',
  description: 'Affiche le classement des niveaux, invitations, messages ou temps vocal du serveur.',
  usage: '<level/invite/message/voice>',
  examples: ['level', 'invite', 'message', 'voice'],
  permission: 'everyone',
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args) {
    const type = args[0].toLowerCase();

    if (type === 'level') {
      const top = await LevelService.getLeaderboard(message.guild.id, 10);
      if (top.length === 0) {
        return message.channel.send({ embeds: [EmbedManager.build({ title: '📊 Classement des niveaux', description: 'Aucune donnée.' })] });
      }
      const description = top
        .map((d, i) => `**${i + 1}.** <@${d.userId}> — Niveau ${d.level} (${d.xp} XP)`)
        .join('\n');
      return message.channel.send({ embeds: [EmbedManager.build({ title: '📊 Classement des niveaux', description })] });
    }

    if (type === 'invite') {
      const top = await InviteData.findAll({ where: { guildId: message.guild.id } });
      const sorted = top
        .map((d) => ({ userId: d.userId, net: d.invites - d.leaves + d.bonus }))
        .filter((d) => d.net > 0)
        .sort((a, b) => b.net - a.net)
        .slice(0, 10);

      if (sorted.length === 0) {
        return message.channel.send({ embeds: [EmbedManager.build({ title: '📨 Classement des invitations', description: 'Aucune donnée.' })] });
      }
      const description = sorted.map((d, i) => `**${i + 1}.** <@${d.userId}> — ${d.net} invitation(s)`).join('\n');
      return message.channel.send({ embeds: [EmbedManager.build({ title: '📨 Classement des invitations', description })] });
    }

    if (type === 'message') {
      const top = await StatsService.getTopMembers(message.guild.id, 'messages', 10);
      const filtered = top.filter((d) => d.messages > 0);
      if (filtered.length === 0) {
        return message.channel.send({ embeds: [EmbedManager.build({ title: '📨 Classement des messages', description: 'Aucune donnée.' })] });
      }
      const description = filtered.map((d, i) => `**${i + 1}.** <@${d.userId}> — ${d.messages} message(s)`).join('\n');
      return message.channel.send({ embeds: [EmbedManager.build({ title: '📨 Classement des messages', description })] });
    }

    if (type === 'voice') {
      const top = await StatsService.getTopMembers(message.guild.id, 'voiceSeconds', 10);
      const filtered = top.filter((d) => d.voiceSeconds > 0);
      if (filtered.length === 0) {
        return message.channel.send({ embeds: [EmbedManager.build({ title: '🔊 Classement vocal', description: 'Aucune donnée.' })] });
      }
      const description = filtered
        .map((d, i) => `**${i + 1}.** <@${d.userId}> — ${StatsService.formatVoiceDuration(d.voiceSeconds)}`)
        .join('\n');
      return message.channel.send({ embeds: [EmbedManager.build({ title: '🔊 Classement vocal', description })] });
    }

    return message.channel.send({
      embeds: [EmbedManager.genericError('Utilisez `+leaderboard level`, `invite`, `message` ou `voice`.')],
    });
  },
};
