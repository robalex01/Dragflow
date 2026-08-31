'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { checkHierarchy, hierarchyErrorMessage } = require('../../utils/hierarchyCheck');
const ModLogService = require('../../services/ModLogService');

module.exports = {
  name: 'nickname',
  aliases: ['nick', 'pseudo'],
  category: 'moderation',
  description: "Modifie le pseudo d'un membre (ou le retire si aucun pseudo n'est fourni).",
  usage: '<membre/id> <pseudo>',
  examples: ['@Utilisateur NouveauPseudo'],
  permission: 'moderator',
  userPermissions: ['ManageNicknames'],
  botPermissions: ['ManageNicknames'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    const target = await resolveMember(message.guild, args[0]);
    if (!target) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
    }

    const hierarchy = checkHierarchy(message, target);
    if (!hierarchy.ok && target.id !== message.author.id) {
      return message.channel.send({
        embeds: [EmbedManager.genericError(hierarchyErrorMessage(hierarchy.reason))],
      });
    }

    const newNickname = args.slice(1).join(' ') || null;
    if (newNickname && newNickname.length > 32) {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Le pseudo ne peut pas dépasser 32 caractères.')],
      });
    }

    const oldNickname = target.displayName;
    await target.setNickname(newNickname, `${message.author.tag} : +nickname`);

    await ModLogService.send(message.guild, {
      title: '✏️ Pseudo modifié',
      fields: [
        { name: 'Membre', value: `${target.user.tag}`, inline: true },
        { name: 'Ancien pseudo', value: oldNickname, inline: true },
        { name: 'Nouveau pseudo', value: newNickname || '*Retiré*', inline: true },
      ],
    });

    const embed = EmbedManager.success({
      title: '✏️ Pseudo modifié',
      description: newNickname
        ? `Le pseudo de **${target.user.tag}** est maintenant **${newNickname}**.`
        : `Le pseudo de **${target.user.tag}** a été retiré.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
