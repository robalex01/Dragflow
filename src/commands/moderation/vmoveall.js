'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveChannel } = require('../../utils/resolveChannel');

module.exports = {
  name: 'vmoveall',
  aliases: [],
  category: 'moderation',
  description: "Déplace tous les membres du salon vocal courant (ou de l'auteur) vers un autre salon.",
  usage: '<#salon vocal de destination>',
  examples: ['#vocal-2'],
  permission: 'moderator',
  userPermissions: ['MoveMembers'],
  botPermissions: ['MoveMembers'],
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args) {
    const source = message.member.voice.channel;
    if (!source) {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Vous devez être en salon vocal pour utiliser cette commande.')],
      });
    }

    const destination = resolveChannel(message, args[0]);
    if (!destination || !destination.isVoiceBased()) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Salon vocal de destination introuvable.')] });
    }

    const members = [...source.members.values()];
    for (const member of members) {
      await member.voice.setChannel(destination, `${message.author.tag} : +vmoveall`).catch(() => null);
    }

    const embed = EmbedManager.success({
      title: '🔀 Salon vocal déplacé',
      description: `**${members.length}** membre(s) déplacé(s) vers ${destination}.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
