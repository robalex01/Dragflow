'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { paginate } = require('../../managers/PaginationManager');
const { BASE_PERMISSIONS } = require('../../managers/PermissionManager');
const { CustomPermission, CommandPermission } = require('../../database/models');

function resolveHolderDisplay(guild, holderId) {
  if (holderId === 'everyone') return '@everyone';
  const role = guild.roles.cache.get(holderId);
  if (role) return `${role} (rôle)`;
  const member = guild.members.cache.get(holderId);
  if (member) return `${member} (membre)`;
  return `\`${holderId}\` (introuvable)`;
}

module.exports = {
  name: 'perms',
  aliases: ['permissions'],
  category: 'configuration',
  description: 'Affiche les permissions personnalisées configurées sur ce serveur.',
  usage: '',
  examples: [''],
  permission: 'administrator',
  userPermissions: ['ManageGuild'],
  cooldown: 5,
  async execute(message, args, { client }) {
    const guildId = message.guild.id;

    const customPermissions = await CustomPermission.findAll({ where: { guildId } });
    const overrides = await CommandPermission.findAll({ where: { guildId } });

    const pageBase = EmbedManager.build({
      title: '🔐 Permissions de base',
      description:
        'Hiérarchie interne des permissions de base, du plus bas au plus élevé.\n' +
        'Utilisez `+newperm`, `+setperm` et `+switch` pour créer et attribuer des permissions personnalisées (voir catégorie Owner).',
      fields: [
        {
          name: 'Permissions de base',
          value: BASE_PERMISSIONS.map((p) => `\`${p}\``).join(', '),
        },
      ],
      client,
      timestamp: true,
    });

    const customPage = EmbedManager.build({
      title: '🔐 Permissions personnalisées',
      description:
        customPermissions.length > 0
          ? 'Liste des permissions personnalisées créées sur ce serveur et de leurs détenteurs.'
          : "Aucune permission personnalisée n'a encore été créée sur ce serveur.\nUtilisez `+newperm <permission>` pour en créer une.",
      fields: customPermissions.map((perm) => ({
        name: perm.name,
        value:
          perm.holders.length > 0
            ? perm.holders.map((h) => resolveHolderDisplay(message.guild, h)).join(', ')
            : '*Aucun détenteur*',
      })),
      client,
      timestamp: true,
    });

    const overridesPage = EmbedManager.build({
      title: '🔐 Permissions requises par commande (surcharges)',
      description:
        overrides.length > 0
          ? 'Commandes dont la permission par défaut a été modifiée avec `+setperm`/`+switch`.'
          : "Aucune surcharge de permission de commande sur ce serveur.\nLes commandes utilisent leur permission par défaut.",
      fields: overrides.map((o) => ({
        name: `+${o.commandName}`,
        value: `\`${o.permissionName}\``,
        inline: true,
      })),
      client,
      timestamp: true,
    });

    const pages = [pageBase, customPage, overridesPage];
    pages.forEach((embed, index) =>
      embed.setFooter({ text: `Page ${index + 1}/${pages.length}`, iconURL: client.user.displayAvatarURL() })
    );

    await paginate(message, pages);
  },
};
