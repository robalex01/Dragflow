'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { CustomPermission, CommandPermission } = require('../../database/models');

module.exports = {
  name: 'delperm',
  aliases: [],
  category: 'owner',
  description: 'Supprime une permission personnalisée de ce serveur.',
  usage: '<permission>',
  examples: ['vip'],
  permission: 'administrator',
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    const name = args[0].toLowerCase();
    const deleted = await CustomPermission.destroy({ where: { guildId: message.guild.id, name } });

    if (!deleted) {
      return message.channel.send({ embeds: [EmbedManager.genericError(`Permission \`${name}\` introuvable.`)] });
    }

    const overridesRemoved = await CommandPermission.destroy({ where: { guildId: message.guild.id, permissionName: name } });

    const embed = EmbedManager.success({
      title: '🔐 Permission supprimée',
      description: `\`${name}\` a été supprimée${overridesRemoved > 0 ? ` (${overridesRemoved} commande(s) repassée(s) à leur permission par défaut)` : ''}.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
