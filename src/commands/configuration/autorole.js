'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveRole } = require('../../utils/resolveRole');
const GuildConfigService = require('../../services/GuildConfigService');

module.exports = {
  name: 'autorole',
  aliases: [],
  category: 'configuration',
  description: "Définit le rôle attribué automatiquement à chaque nouveau membre (ou `off` pour désactiver).",
  usage: '<@rôle/off>',
  examples: ['@Membre', 'off'],
  permission: 'administrator',
  userPermissions: ['ManageRoles'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    if (args[0].toLowerCase() === 'off') {
      await GuildConfigService.update(message.guild.id, { autoRoleId: null });
      const embed = EmbedManager.success({ title: '🎭 Auto-role désactivé', description: 'Plus aucun rôle ne sera attribué automatiquement.' });
      return message.channel.send({ embeds: [embed] });
    }

    const role = resolveRole(message.guild, args[0]);
    if (!role) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Rôle introuvable.')] });
    }

    const botMember = message.guild.members.me;
    if (role.position >= botMember.roles.highest.position) {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Ce rôle est supérieur ou égal à celui du bot ; le bot ne pourra pas l\'attribuer.')],
      });
    }

    await GuildConfigService.update(message.guild.id, { autoRoleId: role.id });
    const embed = EmbedManager.success({
      title: '🎭 Auto-role défini',
      description: `Le rôle ${role} sera désormais attribué automatiquement à chaque nouveau membre.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
