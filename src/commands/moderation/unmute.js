'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const InfractionService = require('../../services/InfractionService');
const ModLogService = require('../../services/ModLogService');

module.exports = {
  name: 'unmute',
  aliases: ['demute'],
  category: 'moderation',
  description: 'Retire le mute (timeout) d\'un membre.',
  usage: '<@membre>',
  examples: ['@Utilisateur'],
  permission: 'moderator',
  userPermissions: ['ModerateMembers'],
  botPermissions: ['ModerateMembers'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    const target = await resolveMember(message.guild, args[0]);
    if (!target) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
    }

    if (!target.isCommunicationDisabled()) {
      return message.channel.send({
        embeds: [EmbedManager.genericError("Ce membre n'est pas actuellement muet.")],
      });
    }

    await target.timeout(null, `${message.author.tag} : retrait du mute.`);

    await InfractionService.create({
      guildId: message.guild.id,
      userId: target.id,
      moderatorId: message.author.id,
      type: 'unmute',
      reason: 'Retrait manuel du mute.',
    });

    await ModLogService.send(message.guild, {
      title: '🔊 Mute retiré',
      color: '#2ECC71',
      fields: [
        { name: 'Membre', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
      ],
    });

    const embed = EmbedManager.success({
      title: '🔊 Mute retiré',
      description: `**${target.user.tag}** peut à nouveau écrire et parler.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
