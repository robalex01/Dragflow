'use strict';

const EmbedManager = require('../../managers/EmbedManager');

const URL_REGEX = /^https?:\/\/\S+$/i;
const CUSTOM_EMOJI_REGEX = /^<a?:\w+:(\d+)>$/;

module.exports = {
  name: 'emojiadd',
  aliases: ['addemoji'],
  category: 'moderation',
  description: "Ajoute un emoji au serveur à partir d'un emoji existant ou d'un lien direct.",
  usage: '<emoji> | <url> [nom]',
  examples: ['😀 rire', 'https://exemple.com/image.png mon_emoji'],
  permission: 'moderator',
  userPermissions: ['ManageGuildExpressions'],
  botPermissions: ['ManageGuildExpressions'],
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args) {
    const input = args[0];
    let attachment;
    let defaultName = args[1] || 'emoji';

    const customMatch = input.match(CUSTOM_EMOJI_REGEX);
    if (customMatch) {
      const extension = input.startsWith('<a:') ? 'gif' : 'png';
      attachment = `https://cdn.discordapp.com/emojis/${customMatch[1]}.${extension}`;
      const nameMatch = input.match(/^<a?:(\w+):/);
      if (nameMatch) defaultName = args[1] || nameMatch[1];
    } else if (URL_REGEX.test(input)) {
      attachment = input;
    } else {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Fournissez un emoji Discord existant ou un lien direct vers une image.')],
      });
    }

    const name = defaultName.substring(0, 32).replace(/[^a-zA-Z0-9_]/g, '_');

    try {
      const emoji = await message.guild.emojis.create({
        attachment,
        name,
        reason: `Ajouté par ${message.author.tag}`,
      });

      const embed = EmbedManager.success({
        title: '😀 Emoji ajouté',
        description: `${emoji} a été ajouté sous le nom \`${emoji.name}\`.`,
      });
      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      return message.channel.send({
        embeds: [
          EmbedManager.genericError(
            "Impossible d'ajouter cet emoji (format non supporté, taille trop grande, ou limite d'emojis atteinte)."
          ),
        ],
      });
    }
  },
};
