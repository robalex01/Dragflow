'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { randomChoice } = require('../../utils/hash');

const FACTS = [
  "Le miel ne se périme jamais : des pots vieux de 3000 ans ont été retrouvés encore comestibles.",
  "Les poulpes ont trois cœurs et du sang bleu.",
  "Un jour sur Vénus dure plus longtemps qu'une année sur Vénus.",
  "Les bananes sont techniquement des baies, mais pas les fraises.",
  "Le cœur d'une crevette se situe dans sa tête.",
  "Il y a plus d'étoiles dans l'univers observable que de grains de sable sur Terre.",
];

module.exports = {
  name: 'fact',
  aliases: ['fait', 'anecdote'],
  category: 'fun',
  description: 'Partage une anecdote insolite.',
  usage: '',
  examples: [''],
  permission: 'everyone',
  cooldown: 2,
  async execute(message) {
    const embed = EmbedManager.build({ title: '🧐 Le saviez-vous ?', description: randomChoice(FACTS) });
    return message.channel.send({ embeds: [embed] });
  },
};
