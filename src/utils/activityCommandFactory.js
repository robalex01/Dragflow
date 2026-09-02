'use strict';

const EmbedManager = require('../managers/EmbedManager');

/**
 * Fabrique une commande owner définissant le statut/activité du bot
 * (playing, listen, watch, competing) pour un type d'activité Discord donné.
 */
function createActivityCommand({ name, aliases = [], activityType, label, emoji }) {
  return {
    name,
    aliases,
    category: 'owner',
    description: `Définit le statut du bot en "${label} <texte>" (affecte TOUS les serveurs).`,
    usage: '<activité>',
    examples: ['avec vos commandes'],
    permission: 'owner',
    ownerOnly: true,
    cooldown: 5,
    args: { min: 1 },
    async execute(message, args, { client }) {
      const text = args.join(' ').substring(0, 128);
      client.user.setActivity(text, { type: activityType });

      const embed = EmbedManager.success({
        title: `${emoji} Statut mis à jour`,
        description: `Statut : **${label} ${text}**`,
      });
      return message.channel.send({ embeds: [embed] });
    },
  };
}

module.exports = { createActivityCommand };
