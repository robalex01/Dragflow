'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const LevelService = require('../../services/LevelService');

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

module.exports = {
  name: 'customrank',
  aliases: [],
  category: 'level',
  description: "Personnalise la couleur de votre carte de rang (+rank).",
  usage: '<#couleur hex>',
  examples: ['#3498DB'],
  permission: 'everyone',
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args) {
    const color = args[0];
    if (!HEX_REGEX.test(color)) {
      return message.channel.send({
        embeds: [EmbedManager.genericError('Couleur invalide. Utilisez un format hexadécimal, ex : `#3498DB`.')],
      });
    }

    const data = await LevelService.getOrCreate(message.guild.id, message.author.id);
    data.rankColor = color;
    await data.save();

    const embed = EmbedManager.success({
      title: '🎨 Couleur de rang mise à jour',
      color,
      description: `Votre carte de rang utilisera désormais la couleur ${color}.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
