'use strict';

const EmbedManager = require('../../managers/EmbedManager');

module.exports = {
  name: 'cat',
  aliases: ['chat'],
  category: 'fun',
  description: 'Envoie une image aléatoire de chat.',
  usage: '',
  examples: [''],
  permission: 'everyone',
  cooldown: 3,
  async execute(message) {
    try {
      const response = await fetch('https://api.thecatapi.com/v1/images/search', {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) throw new Error(`Statut HTTP ${response.status}`);
      const data = await response.json();
      const imageUrl = data?.[0]?.url;

      if (!imageUrl) throw new Error('Réponse API invalide');

      const embed = EmbedManager.build({ title: '🐱 Miaou !', image: imageUrl });
      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      const embed = EmbedManager.genericError(
        "Impossible de récupérer une image de chat pour le moment (service externe indisponible)."
      );
      return message.channel.send({ embeds: [embed] });
    }
  },
};
