'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveChannel } = require('../../utils/resolveChannel');

module.exports = {
  name: 'vkickall',
  aliases: [],
  category: 'moderation',
  description: "Expulse tous les membres d'un salon vocal.",
  usage: '<#salon/id>',
  examples: ['#vocal-général'],
  permission: 'moderator',
  userPermissions: ['MoveMembers'],
  botPermissions: ['MoveMembers'],
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args) {
    const channel = resolveChannel(message, args[0]);
    if (!channel || !channel.isVoiceBased()) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Salon vocal introuvable.')] });
    }

    const members = [...channel.members.values()];
    for (const member of members) {
      await member.voice.disconnect(`${message.author.tag} : +vkickall`).catch(() => null);
    }

    const embed = EmbedManager.success({
      title: '🔇 Salon vocal vidé',
      description: `**${members.length}** membre(s) expulsé(s) de ${channel}.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
