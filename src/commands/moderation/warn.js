'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { checkHierarchy, hierarchyErrorMessage } = require('../../utils/hierarchyCheck');
const InfractionService = require('../../services/InfractionService');
const ModLogService = require('../../services/ModLogService');

module.exports = {
  name: 'warn',
  aliases: ['avertir'],
  category: 'moderation',
  description: 'Avertit un membre du serveur.',
  usage: '<@membre/id> [raison]',
  examples: ['@Utilisateur langage inapproprié'],
  permission: 'helper',
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    const target = await resolveMember(message.guild, args[0]);
    const reason = args.slice(1).join(' ') || 'Aucune raison fournie.';

    if (!target) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
    }

    const hierarchy = checkHierarchy(message, target);
    if (!hierarchy.ok) {
      return message.channel.send({
        embeds: [EmbedManager.genericError(hierarchyErrorMessage(hierarchy.reason))],
      });
    }

    const infraction = await InfractionService.create({
      guildId: message.guild.id,
      userId: target.id,
      moderatorId: message.author.id,
      type: 'warn',
      reason,
    });

    await ModLogService.send(message.guild, {
      title: '⚠️ Membre averti',
      color: '#F1C40F',
      fields: [
        { name: 'Membre', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
        { name: 'Cas #', value: `${infraction.caseNumber}`, inline: true },
        { name: 'Raison', value: reason },
      ],
    });

    await target.send({
      embeds: [
        EmbedManager.warning({
          title: `⚠️ Avertissement — ${message.guild.name}`,
          description: `Vous avez reçu un avertissement.\n**Raison :** ${reason}`,
        }),
      ],
    }).catch(() => null);

    const embed = EmbedManager.warning({
      title: '⚠️ Membre averti',
      description: `**${target.user.tag}** a reçu l'avertissement **#${infraction.caseNumber}**.\n**Raison :** ${reason}`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
