'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { checkHierarchy, hierarchyErrorMessage } = require('../../utils/hierarchyCheck');

module.exports = {
  name: 'vkick',
  aliases: ['vocalkick'],
  category: 'moderation',
  description: "Expulse un membre du salon vocal dans lequel il se trouve.",
  usage: '<@membre/id>',
  examples: ['@Utilisateur'],
  permission: 'moderator',
  userPermissions: ['MoveMembers'],
  botPermissions: ['MoveMembers'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    const target = await resolveMember(message.guild, args[0]);
    if (!target) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
    }

    if (!target.voice.channel) {
      return message.channel.send({
        embeds: [EmbedManager.genericError("Ce membre n'est pas en salon vocal.")],
      });
    }

    const hierarchy = checkHierarchy(message, target);
    if (!hierarchy.ok) {
      return message.channel.send({
        embeds: [EmbedManager.genericError(hierarchyErrorMessage(hierarchy.reason))],
      });
    }

    await target.voice.disconnect(`${message.author.tag} : +vkick`);

    const embed = EmbedManager.success({
      title: '🔇 Membre expulsé du vocal',
      description: `**${target.user.tag}** a été déconnecté du salon vocal.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
