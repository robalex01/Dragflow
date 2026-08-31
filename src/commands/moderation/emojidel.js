'use strict';

const EmbedManager = require('../../managers/EmbedManager');

const CUSTOM_EMOJI_REGEX = /^<a?:(\w+):(\d+)>$/;

module.exports = {
  name: 'emojidel',
  aliases: ['delemoji'],
  category: 'moderation',
  description: 'Supprime un ou plusieurs emojis du serveur.',
  usage: 'emoji1 emoji2 ...',
  examples: ['😀 😁'],
  permission: 'moderator',
  userPermissions: ['ManageGuildExpressions'],
  botPermissions: ['ManageGuildExpressions'],
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args) {
    const removed = [];
    const failed = [];

    for (const arg of args) {
      const match = arg.match(CUSTOM_EMOJI_REGEX);
      const emoji = match
        ? message.guild.emojis.cache.get(match[2])
        : message.guild.emojis.cache.find((e) => e.toString() === arg || e.name === arg);

      if (!emoji) {
        failed.push(arg);
        continue;
      }

      await emoji.delete(`Supprimé par ${message.author.tag}`).catch(() => null);
      removed.push(`\`${emoji.name}\``);
    }

    const embed = EmbedManager.build({
      title: '🗑️ Emojis supprimés',
      description: `**Supprimés :** ${removed.length > 0 ? removed.join(', ') : 'Aucun'}${
        failed.length > 0 ? `\n**Introuvables :** ${failed.join(', ')}` : ''
      }`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
