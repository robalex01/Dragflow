'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const GiveawayService = require('../../services/GiveawayService');
const { Giveaway } = require('../../database/models');

module.exports = {
  name: 'gend',
  aliases: [],
  category: 'giveaway',
  description: 'Termine immédiatement un giveaway et tire les gagnants.',
  usage: '<giveawayID>',
  examples: ['3'],
  permission: 'moderator',
  userPermissions: ['ManageGuild'],
  cooldown: 3,
  args: { min: 1 },
  async execute(message, args) {
    const id = Number(args[0]);
    const giveaway = await Giveaway.findOne({ where: { id, guildId: message.guild.id } });

    if (!giveaway) {
      return message.channel.send({ embeds: [EmbedManager.genericError(`Aucun giveaway #${id} trouvé.`)] });
    }
    if (giveaway.ended) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Ce giveaway est déjà terminé.')] });
    }

    await GiveawayService.end(giveaway);

    const embed = EmbedManager.success({
      title: '🎉 Giveaway terminé',
      description: `Le giveaway **#${id}** a été terminé manuellement.`,
    });
    return message.channel.send({ embeds: [embed] });
  },
};
