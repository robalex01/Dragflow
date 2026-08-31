'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { CommandPermission } = require('../../database/models');

module.exports = {
  name: 'confperms',
  aliases: [],
  category: 'configuration',
  description: 'Réinitialise toutes les surcharges de permission de commande (+setperm/+switch) de ce serveur.',
  usage: 'reset',
  examples: ['reset'],
  permission: 'owner',
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args) {
    if (args[0].toLowerCase() !== 'reset') {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Utilisez `+confperms reset` pour réinitialiser les surcharges de permissions.')],
      });
    }

    const deleted = await CommandPermission.destroy({ where: { guildId: message.guild.id } });

    const embed = EmbedManager.success({
      title: '🔐 Permissions réinitialisées',
      description: `${deleted} surcharge(s) de permission de commande ont été supprimées. Toutes les commandes utilisent maintenant leur permission par défaut.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
