'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveChannel } = require('../../utils/resolveChannel');

module.exports = {
  name: 'sync',
  aliases: ['synchroniser'],
  category: 'moderation',
  description: 'Synchronise les permissions d\'un salon avec celles de sa catégorie.',
  usage: '<#salon/id>',
  examples: ['#salon-exemple'],
  permission: 'administrator',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args) {
    const channel = resolveChannel(message, args[0]);
    if (!channel) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Salon introuvable.')] });
    }

    if (!channel.parent) {
      return message.channel.send({
        embeds: [EmbedManager.genericError("Ce salon n'appartient à aucune catégorie.")],
      });
    }

    await channel.lockPermissions();

    const embed = EmbedManager.success({
      title: '🔄 Permissions synchronisées',
      description: `Les permissions de ${channel} ont été synchronisées avec la catégorie **${channel.parent.name}**.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
