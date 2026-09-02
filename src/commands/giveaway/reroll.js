'use strict';

const EmbedManager = require('../../managers/EmbedManager');
const { Giveaway, GiveawayParticipant } = require('../../database/models');

module.exports = {
  name: 'reroll',
  aliases: [],
  category: 'giveaway',
  description: 'Retire un nouveau gagnant pour un giveaway déjà terminé.',
  usage: '<id>',
  examples: ['3'],
  permission: 'moderator',
  userPermissions: ['ManageGuild'],
  cooldown: 5,
  args: { min: 1 },
  async execute(message, args) {
    const id = Number(args[0]);
    const giveaway = await Giveaway.findOne({ where: { id, guildId: message.guild.id } });

    if (!giveaway) {
      return message.channel.send({ embeds: [EmbedManager.genericError(`Aucun giveaway #${id} trouvé.`)] });
    }
    if (!giveaway.ended) {
      return message.channel.send({ embeds: [EmbedManager.genericError('Ce giveaway est encore en cours.')] });
    }

    const participants = await GiveawayParticipant.findAll({ where: { giveawayId: id } });
    if (participants.length === 0) {
      return message.channel.send({ embeds: [EmbedManager.genericError("Aucun participant à retirer au sort.")] });
    }

    const winner = participants[Math.floor(Math.random() * participants.length)];
    giveaway.winnerIds = [winner.userId];
    await giveaway.save();

    const embed = EmbedManager.success({
      title: '🔄 Nouveau tirage !',
      description: `Félicitations <@${winner.userId}>, vous remportez **${giveaway.prize}** !`,
    });
    return message.channel.send({ content: `<@${winner.userId}>`, embeds: [embed] });
  },
};
