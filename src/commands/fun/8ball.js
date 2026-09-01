'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { randomChoice } = require('../../utils/hash');

const ANSWERS = [
  "Oui, c'est certain.", "C'est décidément vrai.", "Sans aucun doute.",
  "Oui, définitivement.", "Vous pouvez compter dessus.", "À mon avis, oui.",
  "Les perspectives sont bonnes.", "Signe indiquant oui.", "Probablement.",
  "Réponse floue, réessayez.", "Redemandez plus tard.", "Mieux vaut ne pas vous le dire maintenant.",
  "Impossible de le prédire maintenant.", "Concentrez-vous et redemandez.",
  "N'y comptez pas.", "Ma réponse est non.", "Mes sources disent non.",
  "Les perspectives ne sont pas bonnes.", "Très douteux.",
];

module.exports = {
  name: '8ball',
  aliases: ['boulemagique'],
  category: 'fun',
  description: 'Pose une question à la boule magique.',
  usage: '<question>',
  examples: ['Vais-je réussir mon examen ?'],
  permission: 'everyone',
  cooldown: 2,
  args: { min: 1 },
  async execute(message, args) {
    const question = args.join(' ');
    const embed = EmbedManager.build({
      title: '🎱 Boule magique',
      fields: [
        { name: 'Question', value: question },
        { name: 'Réponse', value: randomChoice(ANSWERS) },
      ],
    });
    return message.channel.send({ embeds: [embed] });
  },
};
