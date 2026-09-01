'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { randomInt } = require('../../utils/hash');

module.exports = {
  name: 'roll',
  aliases: ['de', 'dice'],
  category: 'fun',
  description: 'Lance un dé virtuel jusqu\'à une limite donnée.',
  usage: '<limite>',
  examples: ['100'],
  permission: 'everyone',
  cooldown: 2,
  args: { min: 1 },
  async execute(message, args) {
    const limit = Number(args[0]);
    if (!Number.isInteger(limit) || limit < 2 || limit > 1000000) {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Veuillez indiquer un nombre entier entre 2 et 1 000 000.')],
      });
    }

    const result = randomInt(1, limit);
    const embed = EmbedManager.build({
      title: '🎲 Lancer de dé',
      description: `Vous avez obtenu **${result}** sur ${limit} !`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
