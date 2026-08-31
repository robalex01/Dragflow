'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveRole } = require('../../utils/resolveRole');

module.exports = {
  name: 'tagrole',
  aliases: ['mentionrole'],
  category: 'configuration',
  description: 'Mentionne un rôle (même non-mentionnable) avec un message.',
  usage: '<@rôle/id> <message>',
  examples: ['@Annonces Réunion ce soir à 20h'],
  permission: 'moderator',
  userPermissions: ['ManageRoles'],
  botPermissions: ['ManageRoles', 'MentionEveryone'],
  cooldown: 5,
  args: { min: 2 },
  async execute(message, args) {
    const role = resolveRole(message.guild, args[0]);
    if (!role) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Rôle introuvable.')] });
    }

    const text = args.slice(1).join(' ');
    const wasMentionable = role.mentionable;

    if (!wasMentionable) await role.setMentionable(true, 'Tagrole temporaire.').catch(() => null);

    await message.channel.send({ content: `${role} ${text}`, allowedMentions: { roles: [role.id] } });

    if (!wasMentionable) await role.setMentionable(false, 'Fin du tagrole.').catch(() => null);

    await message.delete().catch(() => null);
  },
};
