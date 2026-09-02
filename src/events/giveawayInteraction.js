'use strict';

const EmbedManager = require('../managers/EmbedManager');
const GiveawayService = require('../services/GiveawayService');
const { Giveaway, GiveawayParticipant } = require('../database/models');

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('giveaway_join_')) return;

    const giveawayId = Number(interaction.customId.replace('giveaway_join_', ''));
    const giveaway = await Giveaway.findByPk(giveawayId);

    if (!giveaway || giveaway.ended) {
      return interaction.reply({ content: '❌ Ce giveaway est terminé.', ephemeral: true });
    }

    const existing = await GiveawayParticipant.findOne({
      where: { giveawayId, userId: interaction.user.id },
    });

    if (existing) {
      await existing.destroy();
      await interaction.reply({ content: '✅ Vous ne participez plus à ce giveaway.', ephemeral: true });
    } else {
      await GiveawayParticipant.create({ giveawayId, userId: interaction.user.id });
      await interaction.reply({ content: '🎉 Vous participez maintenant à ce giveaway !', ephemeral: true });
    }

    const participantCount = await GiveawayParticipant.count({ where: { giveawayId } });
    const embed = GiveawayService.buildGiveawayEmbed(giveaway, participantCount);
    await interaction.message.edit({ embeds: [embed] }).catch(() => null);
  },
};
