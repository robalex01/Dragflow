'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { resolveRole } = require('../../utils/resolveRole');
const ModLogService = require('../../services/ModLogService');

module.exports = {
  name: 'addrole',
  aliases: ['addr'],
  category: 'moderation',
  description: 'Ajoute un ou plusieurs rôles à un membre.',
  usage: '<@membre/id> [<@rôle1/id1> <@rôle2/id2> ...]',
  examples: ['@Utilisateur @Membre @VIP'],
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
    const added = [];
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
      if (target.roles.cache.has(role.id)) {
        failed.push(`${role} (déjà présent)`);
        continue;
      }
      await target.roles.add(role, `${message.author.tag} : +addrole`);
      added.push(`${role}`);
    }

    await ModLogService.send(message.guild, {
      title: '➕ Rôles ajoutés',
      fields: [
        { name: 'Membre', value: `${target.user.tag}`, inline: true },
        { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
        { name: 'Rôles ajoutés', value: added.length > 0 ? added.join(', ') : 'Aucun' },
      ],
    });

    const embed = EmbedManager.build({
      title: '➕ Rôles ajoutés',
      description: `**Ajoutés :** ${added.length > 0 ? added.join(', ') : 'Aucun'}${
        failed.length > 0 ? `\n**Échecs :** ${failed.join(', ')}` : ''
      }`,
      color: added.length > 0 ? undefined : undefined,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
