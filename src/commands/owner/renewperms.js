'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { CommandPermission, CustomPermission } = require('../../database/models');
const { BASE_PERMISSIONS } = require('../../managers/PermissionManager');

module.exports = {
  name: 'renewperms',
  aliases: [],
  category: 'owner',
  description: 'Nettoie les surcharges de permission pointant vers une permission personnalisée supprimée.',
  usage: '',
  examples: [''],
  permission: 'administrator',
  cooldown: 5,
  async execute(message) {
    const overrides = await CommandPermission.findAll({ where: { guildId: message.guild.id } });
    const customPerms = await CustomPermission.findAll({ where: { guildId: message.guild.id } });
    const validNames = new Set([...BASE_PERMISSIONS, ...customPerms.map((p) => p.name)]);

    let removed = 0;
    for (const override of overrides) {
      if (!validNames.has(override.permissionName)) {
        await override.destroy();
        removed++;
      }
    }

    const embed = EmbedManager.success({
      title: '🔐 Permissions rechargées',
      description: `**${removed}** surcharge(s) orpheline(s) nettoyée(s). Le système de permissions est à jour.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
