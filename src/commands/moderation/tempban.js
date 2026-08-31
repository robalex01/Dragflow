'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { checkHierarchy, hierarchyErrorMessage } = require('../../utils/hierarchyCheck');
const { parseDuration, formatDuration } = require('../../utils/parseDuration');
const InfractionService = require('../../services/InfractionService');
const ModLogService = require('../../services/ModLogService');
const TempActionService = require('../../services/TempActionService');

module.exports = {
  name: 'tempban',
  aliases: ['banniretemp'],
  category: 'moderation',
  description: 'Bannit temporairement un membre pour une durée donnée.',
  usage: '<@membre/id> <durée> [raison]',
  examples: ['@Utilisateur 7d comportement toxique'],
  permission: 'moderator',
  userPermissions: ['BanMembers'],
  botPermissions: ['BanMembers'],
  cooldown: 4,
  args: { min: 2 },
  async execute(message, args) {
    const target = await resolveMember(message.guild, args[0]);
    if (!target) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
    }

    const durationMs = parseDuration(args[1]);
    if (!durationMs) {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Durée invalide. Exemple : `7d`, `12h`, `30m`.')],
      });
    }

    const hierarchy = checkHierarchy(message, target);
    if (!hierarchy.ok) {
      return message.channel.send({
        embeds: [EmbedManager.genericError(hierarchyErrorMessage(hierarchy.reason))],
      });
    }

    const reason = args.slice(2).join(' ') || 'Aucune raison fournie.';
    const expiresAt = new Date(Date.now() + durationMs);

    await target.ban({ reason: `${message.author.tag} : ${reason} (temporaire, ${formatDuration(durationMs)})` });

    await TempActionService.schedule({
      guildId: message.guild.id,
      userId: target.id,
      type: 'tempban',
      reason,
      expiresAt,
    });

    await InfractionService.create({
      guildId: message.guild.id,
      userId: target.id,
      moderatorId: message.author.id,
      type: 'tempban',
      reason: `${reason} (durée : ${formatDuration(durationMs)})`,
    });

    await ModLogService.send(message.guild, {
      title: '⏳ Bannissement temporaire',
      color: '#E74C3C',
      fields: [
        { name: 'Membre', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Durée', value: formatDuration(durationMs), inline: true },
        { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
        { name: 'Raison', value: reason },
      ],
    });

    const embed = EmbedManager.success({
      title: '⏳ Bannissement temporaire appliqué',
      description: `**${target.user.tag}** a été banni pour **${formatDuration(durationMs)}**.\n**Raison :** ${reason}`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
