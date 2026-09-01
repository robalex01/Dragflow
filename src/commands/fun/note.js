'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { hashToPercent } = require('../../utils/hash');

module.exports = {
  name: 'note',
  aliases: ['rate'],
  category: 'fun',
  description: 'Donne une note sur 10 à ce que vous lui soumettez (pour le fun).',
  usage: '<args...>',
  examples: ['la pizza ananas'],
  permission: 'everyone',
  cooldown: 2,
  args: { min: 1 },
  async execute(message, args) {
    const subject = args.join(' ');
    const score = Math.round(hashToPercent(subject.toLowerCase()) / 10);

    const embed = EmbedManager.build({
      title: '⭐ Notation',
      description: `Je donne à **${subject}** la note de **${score}/10** !`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
