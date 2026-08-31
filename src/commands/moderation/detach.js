'use strict';

const { PermissionsBitField } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');

module.exports = {
  name: 'detach',
  aliases: [],
  category: 'moderation',
  description: "Retire la restriction de pièces jointes/liens imposée par +attach.",
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
      [PermissionsBitField.Flags.AttachFiles]: null,
      [PermissionsBitField.Flags.EmbedLinks]: null,
    });

    const embed = EmbedManager.success({
      title: '📎 Restriction retirée',
      description: `**${target.user.tag}** peut à nouveau envoyer des fichiers et liens intégrés dans ${message.channel}.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
