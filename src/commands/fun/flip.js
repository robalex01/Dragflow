'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { randomChoice } = require('../../utils/hash');

module.exports = {
  name: 'flip',
  aliases: ['piecefaceoupile', 'coinflip'],
  category: 'fun',
  description: 'Lance une pièce : pile ou face.',
  usage: '',
  examples: [''],
  permission: 'everyone',
  cooldown: 2,
  async execute(message) {
    const result = randomChoice(['Pile', 'Face']);
    const embed = EmbedManager.build({
      title: '🪙 Pile ou Face',
      description: `La pièce retombe sur... **${result}** !`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
