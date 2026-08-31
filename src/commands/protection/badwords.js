'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { paginate } = require('../../managers/PaginationManager');
const { BadWord } = require('../../database/models');

module.exports = {
  name: 'badwords',
  aliases: ['motsinterdits'],
  category: 'protection',
  description: 'Gère la liste des mots interdits automatiquement supprimés sur ce serveur.',
  usage: '<add/remove/list> [mot]',
  examples: ['add motinterdit', 'remove motinterdit', 'list'],
  permission: 'moderator',
  userPermissions: ['ManageGuild'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args, { client }) {
    const sub = args[0].toLowerCase();
    const guildId = message.guild.id;

    if (sub === 'list') {
      const words = await BadWord.findAll({ where: { guildId }, order: [['word', 'ASC']] });
      if (words.length === 0) {
        return message.channel.send({
          embeds: [EmbedManager.build({ title: '🤬 Mots interdits', description: 'Aucun mot interdit configuré.' })],
        });
      }

      const chunkSize = 30;
      const pages = [];
      for (let i = 0; i < words.length; i += chunkSize) {
        const slice = words.slice(i, i + chunkSize);
        pages.push(
          EmbedManager.build({
            title: '🤬 Mots interdits',
            description: slice.map((w) => `\`${w.word}\``).join(', '),
            client,
            footerText: `Page ${pages.length + 1}/${Math.ceil(words.length / chunkSize)} • ${words.length} mot(s)`,
          })
        );
      }
      return paginate(message, pages);
    }

    if (sub === 'add') {
      const word = args.slice(1).join(' ').toLowerCase();
      if (!word) {
        return message.channel.send({ embeds: [EmbedManager.genericError('Veuillez préciser un mot à ajouter.')] });
      }

      const [, created] = await BadWord.findOrCreate({ where: { guildId, word } });
      const embed = created
        ? EmbedManager.success({ title: '✅ Mot ajouté', description: `\`${word}\` a été ajouté à la liste des mots interdits.` })
        : EmbedManager.genericError('Ce mot est déjà dans la liste.');
      return message.channel.send({ embeds: [embed] });
    }

    if (sub === 'remove') {
      const word = args.slice(1).join(' ').toLowerCase();
      if (!word) {
        return message.channel.send({ embeds: [EmbedManager.genericError('Veuillez préciser un mot à retirer.')] });
      }

      const deleted = await BadWord.destroy({ where: { guildId, word } });
      const embed = deleted
        ? EmbedManager.success({ title: '✅ Mot retiré', description: `\`${word}\` a été retiré de la liste.` })
        : EmbedManager.genericError("Ce mot n'était pas dans la liste.");
      return message.channel.send({ embeds: [embed] });
    }

    return message.channel.send({
      embeds: [EmbedManager.genericError('Sous-commande invalide. Utilisez `add`, `remove` ou `list`.')],
    });
  },
};
