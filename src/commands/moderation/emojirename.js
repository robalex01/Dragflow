'use strict';

const EmbedManager = require('../../managers/EmbedManager');

const CUSTOM_EMOJI_REGEX = /^<a?:(\w+):(\d+)>$/;

module.exports = {
  name: 'emojirename',
  aliases: ['renameemoji'],
  category: 'moderation',
  description: 'Renomme un emoji du serveur.',
  usage: ':emoji: nouveau_nom',
  examples: ['😀 rire_fort'],
  permission: 'moderator',
  userPermissions: ['ManageGuildExpressions'],
  botPermissions: ['ManageGuildExpressions'],
  cooldown: 5,
  args: { min: 2 },
  async execute(message, args) {
    const match = args[0].match(CUSTOM_EMOJI_REGEX);
    const emoji = match
      ? message.guild.emojis.cache.get(match[2])
      : message.guild.emojis.cache.find((e) => e.toString() === args[0] || e.name === args[0]);

    if (!emoji) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Emoji introuvable sur ce serveur.')] });
    }

    const newName = args[1].substring(0, 32).replace(/[^a-zA-Z0-9_]/g, '_');
    const oldName = emoji.name;
    await emoji.setName(newName, `Renommé par ${message.author.tag}`);

    const embed = EmbedManager.success({
      title: '✏️ Emoji renommé',
      description: `\`${oldName}\` a été renommé en \`${newName}\`.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
