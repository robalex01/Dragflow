'use strict';

const EmbedManager = require('../../managers/EmbedManager');

module.exports = {
  name: 'tts',
  aliases: [],
  category: 'configuration',
  description: 'Envoie un message vocal (Text-To-Speech natif Discord) dans le salon courant.',
  usage: '<message>',
  examples: ['Réunion dans 5 minutes'],
  permission: 'moderator',
  userPermissions: ['SendTTSMessages'],
  botPermissions: ['SendTTSMessages'],
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args) {
    const text = args.join(' ').substring(0, 200);
    await message.delete().catch(() => null);

    const canTTS = message.channel.permissionsFor(message.guild.members.me)?.has('SendTTSMessages');
    if (!canTTS) {
      return message.channel.send({
        embeds: [EmbedManager.genericError("Le bot n'a pas la permission d'envoyer des messages TTS ici.")],
      });
    }

    return message.channel.send({ content: text, tts: true });
  },
};
