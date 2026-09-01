'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { randomChoice } = require('../../utils/hash');

const FALLBACK_JOKES = [
  "Pourquoi les plongeurs plongent-ils toujours en arrière et jamais en avant ? Parce que sinon ils tombent dans le bateau.",
  "Qu'est-ce qu'un crocodile qui surveille la pharmacie ? Un pharmacocrodile.",
  "Que dit un mur à un autre mur ? On se rejoint au coin.",
  "Pourquoi les poissons détestent l'ordinateur ? Ils ont peur du net.",
  "Quel est le sport le plus silencieux ? Le para-chute.",
];

module.exports = {
  name: 'joke',
  aliases: ['blague'],
  category: 'fun',
  description: 'Raconte une blague aléatoire.',
  usage: '',
  examples: [''],
  permission: 'everyone',
  cooldown: 3,
  async execute(message) {
    try {
      const response = await fetch('https://official-joke-api.appspot.com/random_joke', {
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error(`Statut HTTP ${response.status}`);
      const data = await response.json();

      const embed = EmbedManager.build({
        title: '😂 Blague (en anglais)',
        description: `${data.setup}\n\n||${data.punchline}||`,
      });
      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      const embed = EmbedManager.build({
        title: '😂 Blague',
        description: randomChoice(FALLBACK_JOKES),
      });
      return message.channel.send({ embeds: [embed] });
    }
  },
};
