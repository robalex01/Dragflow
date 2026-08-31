'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { checkHierarchy, hierarchyErrorMessage } = require('../../utils/hierarchyCheck');
const InfractionService = require('../../services/InfractionService');
const ModLogService = require('../../services/ModLogService');

module.exports = {
  name: 'kick',
  aliases: ['expulser'],
  category: 'moderation',
  description: 'Expulse un membre du serveur.',
  usage: '<@membre/id> [raison]',
  examples: ['@Utilisateur non respect du règlement'],
  permission: 'moderator',
  userPermissions: ['KickMembers'],
  botPermissions: ['KickMembers'],
  cooldown: 4,
  args: { min: 1 },
  async execute(message, args) {
    const target = await resolveMember(message.guild, args[0]);
    const reason = args.slice(1).join(' ') || 'Aucune raison fournie.';

    if (!target) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
    }

    const hierarchy = await checkHierarchy(message, target);
    if (!hierarchy.ok) {
      return message.channel.send({
        embeds: [EmbedManager.genericError(hierarchyErrorMessage(hierarchy.reason))],
      });
    }

    await target.kick(`${message.author.tag} : ${reason}`);

    await InfractionService.create({
      guildId: message.guild.id,
      userId: target.id,
      moderatorId: message.author.id,
      type: 'kick',
      reason,
    });

    await ModLogService.send(message.guild, {
      title: '👢 Membre expulsé',
      color: '#E67E22',
      fields: [
        { name: 'Membre', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
        { name: 'Raison', value: reason },
      ],
    });

    const embed = EmbedManager.success({
      title: '👢 Membre expulsé',
      description: `**${target.user.tag}** a été expulsé du serveur.\n**Raison :** ${reason}`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
