'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { checkHierarchy, hierarchyErrorMessage } = require('../../utils/hierarchyCheck');
const { parseDuration, formatDuration, MAX_TIMEOUT_MS } = require('../../utils/parseDuration');
const InfractionService = require('../../services/InfractionService');
const ModLogService = require('../../services/ModLogService');

module.exports = {
  name: 'mute',
  aliases: ['timeout'],
  category: 'moderation',
  description: 'Rend muet un membre pour une durée donnée (timeout Discord natif).',
  usage: '<@membre> <durée>',
  examples: ['@Utilisateur 10m'],
  permission: 'moderator',
  userPermissions: ['ModerateMembers'],
  botPermissions: ['ModerateMembers'],
  cooldown: 3,
  args: { min: 2 },
  async execute(message, args) {
    const target = await resolveMember(message.guild, args[0]);
    if (!target) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
    }

    let durationMs = parseDuration(args[1]);
    if (!durationMs) {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Durée invalide. Exemple : `10m`, `2h`, `1d`.')],
      });
    }
    if (durationMs > MAX_TIMEOUT_MS) durationMs = MAX_TIMEOUT_MS;

    const hierarchy = checkHierarchy(message, target);
    if (!hierarchy.ok) {
      return message.channel.send({
        embeds: [EmbedManager.genericError(hierarchyErrorMessage(hierarchy.reason))],
      });
    }

    const reason = args.slice(2).join(' ') || 'Aucune raison fournie.';

    await target.timeout(durationMs, `${message.author.tag} : ${reason}`);

    await InfractionService.create({
      guildId: message.guild.id,
      userId: target.id,
      moderatorId: message.author.id,
      type: 'mute',
      reason: `${reason} (durée : ${formatDuration(durationMs)})`,
    });

    await ModLogService.send(message.guild, {
      title: '🔇 Membre muet',
      color: '#95A5A6',
      fields: [
        { name: 'Membre', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Durée', value: formatDuration(durationMs), inline: true },
        { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
        { name: 'Raison', value: reason },
      ],
    });

    const embed = EmbedManager.success({
      title: '🔇 Membre rendu muet',
      description: `**${target.user.tag}** est muet pendant **${formatDuration(durationMs)}**.\n**Raison :** ${reason}`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
