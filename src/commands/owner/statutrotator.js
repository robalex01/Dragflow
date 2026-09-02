'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const StatusRotationService = require('../../services/StatusRotationService');

module.exports = {
  name: 'statutrotator',
  aliases: [],
  category: 'owner',
  description: 'Active ou désactive la rotation automatique du statut du bot toutes les 30 secondes.',
  usage: '<on/off>',
  examples: ['on', 'off'],
  permission: 'owner',
  ownerOnly: true,
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args) {
    const value = args[0].toLowerCase();
    if (!['on', 'off'].includes(value)) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Veuillez préciser `on` ou `off`.')] });
    }

    await StatusRotationService.setEnabled(value === 'on');

    const embed = EmbedManager.success({
      title: '🔄 Rotation de statut',
      description: `La rotation automatique est maintenant **${value === 'on' ? 'activée 🟢' : 'désactivée 🔴'}**.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
