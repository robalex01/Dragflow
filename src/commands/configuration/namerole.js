'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveRole } = require('../../utils/resolveRole');

module.exports = {
  name: 'namerole',
  aliases: ['renamerole'],
  category: 'configuration',
  description: "Renomme un rôle du serveur.",
  usage: '<@rôle/id> <nouveau nom>',
  examples: ['@Membre Membres Actifs'],
  permission: 'administrator',
  userPermissions: ['ManageRoles'],
  botPermissions: ['ManageRoles'],
  cooldown: 3,
  args: { min: 2 },
  async execute(message, args) {
    const role = resolveRole(message.guild, args[0]);
    if (!role) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Rôle introuvable.')] });
    }

    const botMember = message.guild.members.me;
    if (role.position >= botMember.roles.highest.position) {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Ce rôle est supérieur ou égal à celui du bot.')],
      });
    }

    const oldName = role.name;
    const newName = args.slice(1).join(' ').substring(0, 100);
    await role.setName(newName, `Renommé par ${message.author.tag}`);

    const embed = EmbedManager.success({
      title: '✏️ Rôle renommé',
      description: `\`${oldName}\` a été renommé en **${newName}**.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
