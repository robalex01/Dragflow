'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const GuildConfigService = require('../../services/GuildConfigService');

module.exports = {
  name: 'renew',
  aliases: ['refresh', 'rafraichir'],
  category: 'moderation',
  description:
    "Force le rafraîchissement du cache de configuration du serveur (préfixe, couleur, protections...).",
  usage: '',
  examples: [''],
  permission: 'administrator',
  cooldown: 10,
  async execute(message) {
    GuildConfigService.invalidate(message.guild.id);
    await GuildConfigService.getOrCreate(message.guild.id);

    const embed = EmbedManager.success({
      title: '🔄 Configuration rafraîchie',
      description:
        "Le cache de configuration de ce serveur a été vidé et rechargé depuis la base de données.",
    });
    return message.channel.send({ embeds: [embed] });
  },
};
