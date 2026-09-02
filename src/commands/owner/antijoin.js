'use strict';

const { PermissionsBitField } = require('discord.js');
const EmbedManager = require('../../managers/EmbedManager');

module.exports = {
  name: 'antijoin',
  aliases: [],
  category: 'owner',
  description: "Révoque toutes les invitations et empêche @everyone d'en créer de nouvelles, bloquant les arrivées.",
  usage: '<on/off>',
  examples: ['on', 'off'],
  permission: 'administrator',
  userPermissions: ['ManageGuild', 'ManageRoles'],
  botPermissions: ['ManageGuild', 'ManageRoles'],
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args) {
    const value = args[0].toLowerCase();
    if (!['on', 'off'].includes(value)) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Veuillez préciser `on` ou `off`.')] });
    }

    if (value === 'on') {
      const invites = await message.guild.invites.fetch().catch(() => null);
      let revoked = 0;
      if (invites) {
        for (const invite of invites.values()) {
          await invite.delete('AntiJoin activé.').catch(() => null);
          revoked++;
        }
      }

      await message.guild.roles.everyone
        .setPermissions(message.guild.roles.everyone.permissions.remove(PermissionsBitField.Flags.CreateInstantInvite))
        .catch(() => null);

      const embed = EmbedManager.success({
        title: '🚫 AntiJoin activé',
        description: `**${revoked}** invitation(s) révoquée(s). Les membres ne peuvent plus créer de nouvelles invitations.\n⚠️ Les invitations supprimées ne peuvent pas être restaurées automatiquement.`,
      });
      return message.channel.send({ embeds: [embed] });
    }

    await message.guild.roles.everyone
      .setPermissions(message.guild.roles.everyone.permissions.add(PermissionsBitField.Flags.CreateInstantInvite))
      .catch(() => null);

    const embed = EmbedManager.success({
      title: '✅ AntiJoin désactivé',
      description: 'Les membres peuvent de nouveau créer des invitations.',
    });
    return message.channel.send({ embeds: [embed] });
  },
};
