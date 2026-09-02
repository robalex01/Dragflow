'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { MemberStats } = require('../../database/models');
const StatsService = require('../../services/StatsService');

module.exports = {
  name: 'pulse',
  aliases: [],
  category: 'statistique',
  description: 'Affiche un instantané de la santé du serveur.',
  usage: '',
  examples: [''],
  permission: 'everyone',
  cooldown: 5,
  async execute(message, args, { client }) {
    const guild = message.guild;
    const voiceMembers = guild.channels.cache
      .filter((c) => c.isVoiceBased())
      .reduce((acc, c) => acc + c.members.size, 0);

    const allStats = await MemberStats.findAll({ where: { guildId: guild.id } });
    const totalMessages = allStats.reduce((acc, d) => acc + d.messages, 0);
    const totalVoiceSeconds = allStats.reduce((acc, d) => acc + d.voiceSeconds, 0);

    const embed = EmbedManager.build({
      title: `💓 Pulse — ${guild.name}`,
      thumbnail: guild.iconURL(),
      fields: [
        { name: 'Membres', value: `${guild.memberCount}`, inline: true },
        { name: 'En vocal maintenant', value: `${voiceMembers}`, inline: true },
        { name: 'Boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
        { name: 'Salons', value: `${guild.channels.cache.size}`, inline: true },
        { name: 'Rôles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Latence du bot', value: `${Math.round(client.ws.ping)}ms`, inline: true },
        { name: 'Messages trackés (total)', value: `${totalMessages}`, inline: true },
        { name: 'Temps vocal tracké (total)', value: StatsService.formatVoiceDuration(totalVoiceSeconds), inline: true },
      ],
      timestamp: true,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
