'use strict';

const figlet = require('figlet');
const EmbedManager = require('../../managers/EmbedManager');

module.exports = {
  name: 'ascii',
  aliases: [],
  category: 'fun',
  description: 'Convertit un texte en art ASCII.',
  usage: '<texte>',
  examples: ['Dragflow'],
  permission: 'everyone',
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args) {
    const text = args.join(' ').substring(0, 20);

    figlet.text(text, { font: 'Standard' }, async (error, result) => {
      if (error || !result) {
        const embed = EmbedManager.genericError("Impossible de générer l'art ASCII pour ce texte.");
        return message.channel.send({ embeds: [embed] });
      }

      const output = result.length > 1900 ? result.substring(0, 1900) : result;
      return message.channel.send({ content: `\`\`\`\n${output}\n\`\`\`` });
    });
  },
};
