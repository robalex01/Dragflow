'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveRole } = require('../../utils/resolveRole');
const ModLogService = require('../../services/ModLogService');

module.exports = {
  name: 'massrole',
  aliases: [],
  category: 'moderation',
  description: "Ajoute ou retire un rôle à tous les membres du serveur.",
  usage: '<add/remove> <@rôle/id>',
  examples: ['add @Membre', 'remove @Ancien'],
  permission: 'administrator',
  userPermissions: ['ManageRoles'],
  botPermissions: ['ManageRoles'],
  cooldown: 15,
  args: { min: 2 },
  async execute(message, args) {
    const action = args[0].toLowerCase();
    if (!['add', 'remove'].includes(action)) {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Action invalide. Utilisez `add` ou `remove`.')],
      });
    }

    const role = resolveRole(message.guild, args[1]);
    if (!role) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Rôle introuvable.')] });
    }

    const botMember = message.guild.members.me;
    if (role.position >= botMember.roles.highest.position) {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Ce rôle est supérieur ou égal à celui du bot.')],
      });
    }

    const processingEmbed = EmbedManager.build({
      title: '⏳ Traitement en cours...',
      description: `Application du rôle ${role} en cours sur tous les membres. Cela peut prendre du temps.`,
    });
    const statusMessage = await message.channel.send({ embeds: [processingEmbed] });

    const members = await message.guild.members.fetch();
    let count = 0;

    for (const member of members.values()) {
      if (member.user.bot) continue;
      try {
        if (action === 'add' && !member.roles.cache.has(role.id)) {
          await member.roles.add(role, `${message.author.tag} : +massrole add`);
          count += 1;
        } else if (action === 'remove' && member.roles.cache.has(role.id)) {
          await member.roles.remove(role, `${message.author.tag} : +massrole remove`);
          count += 1;
        }
      } catch {
        // Ignoré : hiérarchie insuffisante sur ce membre précis, on continue les autres.
      }
    }

    await ModLogService.send(message.guild, {
      title: '🧑‍🤝‍🧑 Mass role appliqué',
      fields: [
        { name: 'Action', value: action, inline: true },
        { name: 'Rôle', value: `${role}`, inline: true },
        { name: 'Membres affectés', value: `${count}`, inline: true },
      ],
    });

    const embed = EmbedManager.success({
      title: '🧑‍🤝‍🧑 Mass role terminé',
      description: `Le rôle ${role} a été ${action === 'add' ? 'ajouté à' : 'retiré de'} **${count}** membre(s).`,
    });
    return statusMessage.edit({ embeds: [embed] });
  },
};
