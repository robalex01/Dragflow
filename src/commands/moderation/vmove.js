'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { resolveChannel } = require('../../utils/resolveChannel');

module.exports = {
  name: 'vmove',
  aliases: ['vocaldeplacer'],
  category: 'moderation',
  description: 'Déplace un membre vers un autre salon vocal.',
  usage: '<@membre/id> <#salon vocal>',
  examples: ['@Utilisateur #vocal-2'],
  permission: 'moderator',
  userPermissions: ['MoveMembers'],
  botPermissions: ['MoveMembers'],
  cooldown: 3,
  args: { min: 2 },
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

    const destination = resolveChannel(message, args[1]);
    if (!destination || !destination.isVoiceBased()) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Salon vocal de destination introuvable.')] });
    }

    await target.voice.setChannel(destination, `${message.author.tag} : +vmove`);

    const embed = EmbedManager.success({
      title: '🔀 Membre déplacé',
      description: `**${target.user.tag}** a été déplacé vers ${destination}.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
