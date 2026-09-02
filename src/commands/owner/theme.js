'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const runtimeSettings = require('../../state/botRuntimeSettings');

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

module.exports = {
  name: 'theme',
  aliases: [],
  category: 'owner',
  description: "Définit la couleur par défaut des embeds du bot (affecte TOUS les serveurs).",
  usage: '[#couleur/off]',
  examples: ['#9B59B6', 'off'],
  permission: 'owner',
  ownerOnly: true,
  cooldown: 5,
  async execute(message, args) {
    if (args.length === 0) {
      const current = runtimeSettings.get().embedColor;
      const embed = EmbedManager.build({ title: '🎨 Thème actuel', description: current || '*Couleur par défaut (`#3498DB`).*' });
      return message.channel.send({ embeds: [embed] });
    }

    if (args[0].toLowerCase() === 'off') {
      await runtimeSettings.setEmbedColor(null);
      const embed = EmbedManager.success({ title: '🎨 Thème réinitialisé', description: 'La couleur par défaut a été restaurée.' });
      return message.channel.send({ embeds: [embed] });
    }

    if (!HEX_REGEX.test(args[0])) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Couleur invalide. Utilisez un format hexadécimal, ex : `#9B59B6`.')] });
    }

    await runtimeSettings.setEmbedColor(args[0]);
    const embed = EmbedManager.success({ title: '🎨 Thème mis à jour', color: args[0], description: `La couleur par défaut est maintenant ${args[0]}.` });
    return message.channel.send({ embeds: [embed] });
  },
};
