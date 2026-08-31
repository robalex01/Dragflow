'use strict';

const EmbedManager = require('../../managers/EmbedManager');

const URL_REGEX = /^https?:\/\/\S+\.(png|apng|json)(\?.*)?$/i;

module.exports = {
  name: 'sticker',
  aliases: [],
  category: 'moderation',
  description: 'Ajoute un sticker au serveur à partir d\'un lien direct (.png/.apng).',
  usage: '[lien] [nom]',
  examples: ['https://exemple.com/image.png MonSticker'],
  permission: 'moderator',
  userPermissions: ['ManageGuildExpressions'],
  botPermissions: ['ManageGuildExpressions'],
  cooldown: 10,
  args: { min: 1 },
  async execute(message, args) {
    const url = args[0];
    if (!URL_REGEX.test(url)) {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Lien invalide. Utilisez un lien direct vers un fichier .png ou .apng.')],
      });
    }

    const name = (args.slice(1).join(' ') || 'sticker').substring(0, 30).replace(/\s+/g, '_');

    try {
      const sticker = await message.guild.stickers.create({
        file: url,
        name,
        tags: '🙂',
        reason: `Ajouté par ${message.author.tag}`,
      });

      const embed = EmbedManager.success({
        title: '🏷️ Sticker ajouté',
        description: `Le sticker **${sticker.name}** a été ajouté au serveur.`,
        thumbnail: sticker.url,
      });
      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      return message.channel.send({
        embeds: [
          EmbedManager.genericError(
            "Impossible d'ajouter ce sticker (format non supporté, taille trop grande, ou limite du serveur atteinte)."
          ),
        ],
      });
    }
  },
};
