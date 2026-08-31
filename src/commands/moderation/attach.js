'use strict';

const { PermissionsBitField } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');

module.exports = {
  name: 'attach',
  aliases: [],
  category: 'moderation',
  description: "Empêche un membre d'envoyer des fichiers/images/liens intégrés dans le salon courant.",
  usage: '<@membre/id>',
  examples: ['@Utilisateur'],
  permission: 'moderator',
  userPermissions: ['ManageRoles'],
  botPermissions: ['ManageRoles'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    const target = await resolveMember(message.guild, args[0]);
    if (!target) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
    }

    await message.channel.permissionOverwrites.edit(target.id, {
      [PermissionsBitField.Flags.AttachFiles]: false,
      [PermissionsBitField.Flags.EmbedLinks]: false,
    });

    const embed = EmbedManager.success({
      title: '📎 Pièces jointes restreintes',
      description: `**${target.user.tag}** ne peut plus envoyer de fichiers ni de liens intégrés dans ${message.channel}.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
