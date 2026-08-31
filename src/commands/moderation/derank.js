'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { checkHierarchy, hierarchyErrorMessage } = require('../../utils/hierarchyCheck');
const ModLogService = require('../../services/ModLogService');

module.exports = {
  name: 'derank',
  aliases: [],
  category: 'moderation',
  description: "Retire tous les rôles gérables par le bot d'un membre.",
  usage: '<@membre/id>',
  examples: ['@Utilisateur'],
  permission: 'moderator',
  userPermissions: ['ManageRoles'],
  botPermissions: ['ManageRoles'],
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args) {
    const target = await resolveMember(message.guild, args[0]);
    if (!target) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
    }

    const hierarchy = await checkHierarchy(message, target);
    if (!hierarchy.ok) {
      return message.channel.send({
        embeds: [EmbedManager.genericError(hierarchyErrorMessage(hierarchy.reason))],
      });
    }

    const botMember = message.guild.members.me;
    const removableRoles = target.roles.cache.filter(
      (r) => r.id !== message.guild.id && r.position < botMember.roles.highest.position
    );

    await target.roles.remove(removableRoles, `${message.author.tag} : +derank`);

    await ModLogService.send(message.guild, {
      title: '🗑️ Rôles retirés (derank)',
      fields: [
        { name: 'Membre', value: `${target.user.tag}`, inline: true },
        { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
        { name: 'Rôles retirés', value: `${removableRoles.size}` },
      ],
    });

    const embed = EmbedManager.success({
      title: '🗑️ Derank effectué',
      description: `**${removableRoles.size}** rôle(s) retiré(s) de **${target.user.tag}**.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
