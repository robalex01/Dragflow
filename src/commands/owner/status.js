'use strict';

const EmbedManager = require('../../managers/EmbedManager');

module.exports = {
  name: 'status',
  aliases: [],
  category: 'owner',
  description: 'Affiche le statut/activité actuel du bot.',
  usage: '',
  examples: [''],
  permission: 'owner',
  ownerOnly: true,
  cooldown: 3,
  async execute(message, args, { client }) {
    const activity = client.user.presence.activities[0];

    const embed = EmbedManager.build({
      title: '📡 Statut actuel du bot',
      description: activity ? `**${activity.type}** : ${activity.name}` : 'Aucune activité définie.',
    });
    return message.channel.send({ embeds: [embed] });
  },
};
