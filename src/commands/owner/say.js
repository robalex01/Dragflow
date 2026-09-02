'use strict';

const EmbedManager = require('../../managers/EmbedManager');

module.exports = {
  name: 'say',
  aliases: [],
  category: 'owner',
  description: 'Fait envoyer un message au bot dans le salon courant.',
  usage: '<texte>',
  examples: ['Bienvenue à tous !'],
  permission: 'administrator',
  botPermissions: ['SendMessages'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    const text = args.join(' ').substring(0, 2000);
    await message.delete().catch(() => null);
    return message.channel.send({ content: text });
  },
};
