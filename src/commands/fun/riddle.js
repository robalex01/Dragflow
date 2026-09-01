'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { randomChoice } = require('../../utils/hash');

const RIDDLES = [
  { q: "Je n'ai pas de voix mais je parle avec toi, je n'ai pas de bouche mais je répète tout ce que j'entends. Qui suis-je ?", a: "L'écho" },
  { q: "Plus j'ai, moins tu vois. Qui suis-je ?", a: "L'obscurité" },
  { q: "Je grandis quand je mange, mais je meurs quand je bois. Qui suis-je ?", a: "Le feu" },
  { q: "On me tue pour me manger, pourtant on ne me trouve pas dans l'assiette. Qui suis-je ?", a: "Le poisson (au sens de la nasse) — ou toute réponse créative acceptée !" },
];

module.exports = {
  name: 'riddle',
  aliases: ['devinette', 'enigme'],
  category: 'fun',
  description: 'Propose une devinette (la réponse est masquée).',
  usage: '',
  examples: [''],
  permission: 'everyone',
  cooldown: 3,
  async execute(message) {
    const riddle = randomChoice(RIDDLES);
    const embed = EmbedManager.build({
      title: '🧩 Devinette',
      description: `${riddle.q}\n\n||**Réponse :** ${riddle.a}||`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
