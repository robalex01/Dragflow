'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const { resolveRole } = require('../../utils/resolveRole');
const { parseDuration, formatDuration } = require('../../utils/parseDuration');
const ModLogService = require('../../services/ModLogService');
const TempActionService = require('../../services/TempActionService');

module.exports = {
  name: 'temprole',
  aliases: ['rtemp'],
  category: 'moderation',
  description: 'Attribue un rôle temporaire à un membre.',
  usage: '<@membre/id> <durée> <@rôle/id> [raison]',
  examples: ['@Utilisateur 1d @Event'],
  permission: 'moderator',
  userPermissions: ['ManageRoles'],
  botPermissions: ['ManageRoles'],
  cooldown: 3,
  args: { min: 3 },
  async execute(message, args) {
    const target = await resolveMember(message.guild, args[0]);
    if (!target) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });
    }

    const durationMs = parseDuration(args[1]);
    if (!durationMs) {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Durée invalide. Exemple : `1d`, `12h`.')],
      });
    }

    const role = resolveRole(message.guild, args[2]);
    if (!role) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Rôle introuvable.')] });
    }

    const botMember = message.guild.members.me;
    if (role.position >= botMember.roles.highest.position) {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Ce rôle est supérieur ou égal à celui du bot.')],
      });
    }

    const reason = args.slice(3).join(' ') || 'Aucune raison fournie.';
    const expiresAt = new Date(Date.now() + durationMs);

    await target.roles.add(role, `${message.author.tag} : temprole (${formatDuration(durationMs)})`);

    await TempActionService.schedule({
      guildId: message.guild.id,
      userId: target.id,
      type: 'temprole',
      roleId: role.id,
      reason,
      expiresAt,
    });

    await ModLogService.send(message.guild, {
      title: '⏳ Rôle temporaire attribué',
      fields: [
        { name: 'Membre', value: `${target.user.tag}`, inline: true },
        { name: 'Rôle', value: `${role}`, inline: true },
        { name: 'Durée', value: formatDuration(durationMs), inline: true },
        { name: 'Modérateur', value: `${message.author.tag}` },
      ],
    });

    const embed = EmbedManager.success({
      title: '⏳ Rôle temporaire attribué',
      description: `**${target.user.tag}** a reçu le rôle ${role} pour **${formatDuration(durationMs)}**.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
