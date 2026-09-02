'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveRole } = require('../../utils/resolveRole');
const { InviteReward } = require('../../database/models');

module.exports = {
  name: 'invitereward',
  aliases: [],
  category: 'invite',
  description: "Configure une récompense de rôle à un certain nombre d'invitations.",
  usage: 'add <nombre> <@rôle> / remove <nombre> / list',
  examples: ['add 5 @Parrain', 'remove 5', 'list'],
  permission: 'administrator',
  userPermissions: ['ManageRoles'],
  botPermissions: ['ManageRoles'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    const sub = args[0].toLowerCase();

    if (sub === 'list') {
      const rewards = await InviteReward.findAll({ where: { guildId: message.guild.id }, order: [['invitesRequired', 'ASC']] });
      if (rewards.length === 0) {
        return message.channel.send({
          embeds: [EmbedManager.build({ title: '🎁 Récompenses de parrainage', description: 'Aucune récompense configurée.' })],
        });
      }
      const embed = EmbedManager.build({
        title: '🎁 Récompenses de parrainage',
        fields: rewards.map((r) => ({ name: `${r.invitesRequired} invitation(s)`, value: `<@&${r.roleId}>` })),
      });
      return message.channel.send({ embeds: [embed] });
    }

    if (sub === 'remove') {
      const required = Number(args[1]);
      const deleted = await InviteReward.destroy({ where: { guildId: message.guild.id, invitesRequired: required } });
      const embed = deleted
        ? EmbedManager.success({ title: '🎁 Récompense retirée', description: `La récompense à ${required} invitations a été retirée.` })
        : EmbedManager.genericError('Aucune récompense trouvée pour ce seuil.');
      return message.channel.send({ embeds: [embed] });
    }

    if (sub === 'add') {
      const required = Number(args[1]);
      if (!Number.isInteger(required) || required <= 0) {
        return message.channel.send({ embeds: [EmbedManager.genericError('Veuillez indiquer un nombre entier positif.')] });
      }

      const role = resolveRole(message.guild, args[2]);
      if (!role) return message.channel.send({ embeds: [EmbedManager.genericError('Rôle introuvable.')] });

      await InviteReward.create({ guildId: message.guild.id, invitesRequired: required, roleId: role.id });

      const embed = EmbedManager.success({
        title: '🎁 Récompense configurée',
        description: `Les membres avec **${required}** invitations nettes recevront le rôle ${role}.`,
      });
      return message.channel.send({ embeds: [embed] });
    }

    return message.channel.send({
      embeds: [EmbedManager.genericError('Sous-commande invalide. Utilisez `add`, `remove` ou `list`.')],
    });
  },
};
