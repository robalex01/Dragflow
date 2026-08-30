'use strict';

const EmbedManager = require('../../managers/EmbedManager');

module.exports = {
  name: 'ping',
  aliases: ['latence', 'pong'],
  category: 'information',
  description: 'Affiche la latence du bot et de l\'API Discord.',
  usage: '',
  examples: [''],
  permission: 'everyone',
  cooldown: 3,
  async execute(message, args, { client }) {
    const sent = await message.channel.send({
      embeds: [
        EmbedManager.build({
          title: '🏓 Ping',
          description: 'Calcul de la latence en cours...',
        }),
      ],
    });

    const roundTrip = sent.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);

    const embed = EmbedManager.build({
      title: '🏓 Pong !',
      fields: [
        { name: 'Latence du message', value: `\`${roundTrip}ms\``, inline: true },
        { name: 'Latence API Discord', value: `\`${apiLatency}ms\``, inline: true },
      ],
      client,
      footerText: 'SoulBot Clone',
      timestamp: true,
    });

    await sent.edit({ embeds: [embed] });
  },
};
