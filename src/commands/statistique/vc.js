'use strict';

const EmbedManager = require('../../managers/EmbedManager');

module.exports = {
  name: 'vc',
  aliases: ['vocal'],
  category: 'statistique',
  description: 'Affiche les salons vocaux actuellement actifs et leurs membres.',
  usage: '',
  examples: [''],
  permission: 'everyone',
  cooldown: 3,
  async execute(message) {
    const voiceChannels = message.guild.channels.cache.filter((c) => c.isVoiceBased() && c.members.size > 0);

    if (voiceChannels.size === 0) {
      return message.channel.send({
        embeds: [EmbedManager.build({ title: '🔊 Salons vocaux actifs', description: 'Aucun salon vocal actif en ce moment.' })],
      });
    }

    const fields = voiceChannels.map((c) => ({
      name: `${c.name} (${c.members.size})`,
      value: [...c.members.values()].map((m) => m.displayName).join(', ') || 'Aucun',
    }));

    const embed = EmbedManager.build({ title: '🔊 Salons vocaux actifs', fields });
    return message.channel.send({ embeds: [embed] });
  },
};
