'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { MemberStats } = require('../../database/models');
const StatsService = require('../../services/StatsService');

async function statsOverview(message) {
  const guildStats = await StatsService.getOrCreateGuild(message.guild.id);
  const allMembers = await MemberStats.findAll({ where: { guildId: message.guild.id } });
  const totalMessages = allMembers.reduce((acc, d) => acc + d.messages, 0);
  const totalVoiceSeconds = allMembers.reduce((acc, d) => acc + d.voiceSeconds, 0);

  const embed = EmbedManager.build({
    title: `📊 Statistiques — ${message.guild.name}`,
    fields: [
      { name: 'Messages trackés', value: `${totalMessages}`, inline: true },
      { name: 'Temps vocal tracké', value: StatsService.formatVoiceDuration(totalVoiceSeconds), inline: true },
      { name: 'Arrivées', value: `${guildStats.totalJoins}`, inline: true },
      { name: 'Départs', value: `${guildStats.totalLeaves}`, inline: true },
      { name: 'Membres actuels', value: `${message.guild.memberCount}`, inline: true },
    ],
    footerText: 'Sous-commandes : +stats greet / +stats message [@membre] / +stats voice [@membre]',
  });
  return message.channel.send({ embeds: [embed] });
}

async function statsGreet(message) {
  const guildStats = await StatsService.getOrCreateGuild(message.guild.id);
  const embed = EmbedManager.build({
    title: '👋 Statistiques — Arrivées / Départs',
    fields: [
      { name: 'Arrivées totales', value: `${guildStats.totalJoins}`, inline: true },
      { name: 'Départs totaux', value: `${guildStats.totalLeaves}`, inline: true },
      { name: 'Solde net', value: `${guildStats.totalJoins - guildStats.totalLeaves}`, inline: true },
    ],
  });
  return message.channel.send({ embeds: [embed] });
}

async function statsMessage(message, args) {
  const target = args[0] ? await resolveMember(message.guild, args[0]) : message.member;
  if (!target) return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });

  const [data] = await MemberStats.findOrCreate({ where: { guildId: message.guild.id, userId: target.id } });
  const rank = await StatsService.getRank(message.guild.id, target.id, 'messages');

  const embed = EmbedManager.build({
    title: `📨 Messages de ${target.user.username}`,
    fields: [
      { name: 'Total', value: `${data.messages}`, inline: true },
      { name: 'Rang', value: rank.position ? `#${rank.position}/${rank.total}` : 'Non classé', inline: true },
    ],
  });
  return message.channel.send({ embeds: [embed] });
}

async function statsVoice(message, args) {
  const target = args[0] ? await resolveMember(message.guild, args[0]) : message.member;
  if (!target) return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });

  const [data] = await MemberStats.findOrCreate({ where: { guildId: message.guild.id, userId: target.id } });
  const rank = await StatsService.getRank(message.guild.id, target.id, 'voiceSeconds');

  const embed = EmbedManager.build({
    title: `🔊 Temps vocal de ${target.user.username}`,
    fields: [
      { name: 'Total', value: StatsService.formatVoiceDuration(data.voiceSeconds), inline: true },
      { name: 'Rang', value: rank.position ? `#${rank.position}/${rank.total}` : 'Non classé', inline: true },
    ],
  });
  return message.channel.send({ embeds: [embed] });
}

module.exports = {
  name: 'stats',
  aliases: [],
  category: 'statistique',
  description: 'Affiche les statistiques du serveur, ou des sous-statistiques (greet/message/voice).',
  usage: '[greet/message/voice] [@membre]',
  examples: ['', 'greet', 'message @Utilisateur', 'voice @Utilisateur'],
  permission: 'everyone',
  cooldown: 5,
  async execute(message, args) {
    const sub = args[0]?.toLowerCase();

    if (sub === 'greet') return statsGreet(message);
    if (sub === 'message') return statsMessage(message, args.slice(1));
    if (sub === 'voice') return statsVoice(message, args.slice(1));

    return statsOverview(message);
  },
};
