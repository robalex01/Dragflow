'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { resolveMember } = require('../../utils/resolveMember');
const LevelService = require('../../services/LevelService');

module.exports = {
  name: 'addlevel',
  aliases: [],
  category: 'level',
  description: "Ajoute des niveaux à un membre.",
  usage: '<@membre> <nombre>',
  examples: ['@Utilisateur 5'],
  permission: 'moderator',
  cooldown: 3,
  args: { min: 2 },
  async execute(message, args) {
    const target = await resolveMember(message.guild, args[0]);
    if (!target) return message.channel.send({ embeds: [EmbedManager.genericError('Membre introuvable.')] });

    const amount = Number(args[1]);
    if (!Number.isInteger(amount) || amount <= 0) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Veuillez indiquer un nombre entier positif.')] });
    }

    const data = await LevelService.addLevels(message.guild.id, target.id, amount);

    const embed = EmbedManager.success({
      title: '📊 Niveaux ajoutés',
      description: `**${target.user.tag}** est maintenant niveau **${data.level}**.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
