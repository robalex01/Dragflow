'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveChannel } = require('../../utils/resolveChannel');
const { parseDuration, formatDuration } = require('../../utils/parseDuration');
const ModLogService = require('../../services/ModLogService');

const MAX_SLOWMODE_MS = 6 * 60 * 60 * 1000; // 6h, limite Discord

module.exports = {
  name: 'slowmode',
  aliases: ['lenteur'],
  category: 'moderation',
  description: "Définit le mode lent d'un salon (0 pour désactiver).",
  usage: '<durée/0> [#salon/id]',
  examples: ['10s', '0'],
  permission: 'moderator',
  userPermissions: ['ManageChannels'],
  botPermissions: ['ManageChannels'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    const channel = args[1] ? resolveChannel(message, args[1]) : message.channel;
    if (!channel) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Salon introuvable.')] });
    }

    let durationMs = 0;
    if (args[0] !== '0') {
      durationMs = parseDuration(args[0]);
      if (!durationMs) {
        return message.channel.send({
          embeds: [EmbedManager.genericError('Durée invalide. Exemple : `10s`, `1m`, ou `0` pour désactiver.')],
        });
      }
      if (durationMs > MAX_SLOWMODE_MS) durationMs = MAX_SLOWMODE_MS;
    }

    await channel.setRateLimitPerUser(Math.floor(durationMs / 1000), `${message.author.tag} : +slowmode`);

    const embed = EmbedManager.success({
      title: '🐌 Mode lent mis à jour',
      description:
        durationMs > 0
          ? `Le mode lent de ${channel} est maintenant de **${formatDuration(durationMs)}**.`
          : `Le mode lent de ${channel} a été désactivé.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
