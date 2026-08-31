'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { resolveRole } = require('../../utils/resolveRole');
const ModLogService = require('../../services/ModLogService');

module.exports = {
  name: 'removerole',
  aliases: ['remr'],
  category: 'moderation',
  description: "Retire un ou plusieurs rôles d'un membre.",
  usage: '<@membre/id> [<@rôle1/id1> <@rôle2/id2> ...]',
  examples: ['@Utilisateur @VIP'],
  permission: 'moderator',
  userPermissions: ['ManageRoles'],
  botPermissions: ['ManageRoles'],
  cooldown: 3,
  args: { min: 2 },
  async execute(message, args) {
    const target = await resolveMember(message.guild, args[0]);
    if (!target) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
    }

    const botMember = message.guild.members.me;
    const removed = [];
    const failed = [];

    for (const roleArg of args.slice(1)) {
      const role = resolveRole(message.guild, roleArg);
      if (!role) {
        failed.push(`\`${roleArg}\` (introuvable)`);
        continue;
      }
      if (role.position >= botMember.roles.highest.position) {
        failed.push(`${role} (rôle supérieur ou égal à celui du bot)`);
        continue;
      }
      if (!target.roles.cache.has(role.id)) {
        failed.push(`${role} (absent)`);
        continue;
      }
      await target.roles.remove(role, `${message.author.tag} : +removerole`);
      removed.push(`${role}`);
    }

    await ModLogService.send(message.guild, {
      title: '➖ Rôles retirés',
      fields: [
        { name: 'Membre', value: `${target.user.tag}`, inline: true },
        { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
        { name: 'Rôles retirés', value: removed.length > 0 ? removed.join(', ') : 'Aucun' },
      ],
    });

    const embed = EmbedManager.build({
      title: '➖ Rôles retirés',
      description: `**Retirés :** ${removed.length > 0 ? removed.join(', ') : 'Aucun'}${
        failed.length > 0 ? `\n**Échecs :** ${failed.join(', ')}` : ''
      }`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
