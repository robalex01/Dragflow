'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { CommandPermission, CustomPermission } = require('../../database/models');

module.exports = {
  name: 'resetperms',
  aliases: [],
  category: 'owner',
  description: 'Réinitialise entièrement le système de permissions de ce serveur (supprime toutes les personnalisations).',
  usage: '',
  examples: [''],
  permission: 'administrator',
  cooldown: 10,
  async execute(message) {
    const permsDeleted = await CustomPermission.destroy({ where: { guildId: message.guild.id } });
    const overridesDeleted = await CommandPermission.destroy({ where: { guildId: message.guild.id } });

    const embed = EmbedManager.success({
      title: '🔐 Permissions réinitialisées',
      description: `**${permsDeleted}** permission(s) personnalisée(s) et **${overridesDeleted}** surcharge(s) de commande supprimées. Toutes les commandes utilisent leur permission par défaut.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
