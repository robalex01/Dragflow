'use strict';

const { Op } = require('sequelize');
const EmbedManager = require('../managers/EmbedManager');
const { Giveaway, GiveawayParticipant } = require('../database/models');
const { formatDuration } = require('../utils/parseDuration');
const Logger = require('../utils/Logger');

const SWEEP_INTERVAL_MS = 15 * 1000;

function buildGiveawayEmbed(giveaway, participantCount) {
  return EmbedManager.build({
    title: '🎉 Giveaway 🎉',
    description:
      `**${giveaway.prize}**\n\n` +
      `Cliquez sur 🎉 pour participer !\n` +
      `Fin : <t:${Math.floor(new Date(giveaway.endsAt).getTime() / 1000)}:R>\n` +
      `Gagnant(s) : **${giveaway.winnerCount}**\n` +
      `Participants : **${participantCount}**\n` +
      `Organisé par <@${giveaway.hostId}>`,
    footerText: `ID du giveaway : ${giveaway.id}`,
  });
}

function pickWinners(participantIds, count) {
  const pool = [...participantIds];
  const winners = [];
  while (winners.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    winners.push(pool.splice(index, 1)[0]);
  }
  return winners;
}

class GiveawayService {
  static { this.buildGiveawayEmbed = buildGiveawayEmbed; }

  static start(client) {
    this.client = client;
    this.runSweep();
    this.interval = setInterval(() => this.runSweep(), SWEEP_INTERVAL_MS);
    Logger.success('GiveawayService démarré (+gcreate).');
  }

  static async runSweep() {
    try {
      const dueGiveaways = await Giveaway.findAll({
        where: { ended: false, endsAt: { [Op.lte]: new Date() } },
      });

      for (const giveaway of dueGiveaways) {
        await this.end(giveaway);
      }
    } catch (error) {
      Logger.error('Erreur lors du balayage des giveaways.', error);
    }
  }

  static async end(giveaway) {
    const participants = await GiveawayParticipant.findAll({ where: { giveawayId: giveaway.id } });
    const participantIds = participants.map((p) => p.userId);
    const winners = pickWinners(participantIds, giveaway.winnerCount);

    giveaway.ended = true;
    giveaway.winnerIds = winners;
    await giveaway.save();

    const guild = this.client.guilds.cache.get(giveaway.guildId);
    const channel = guild?.channels.cache.get(giveaway.channelId);
    if (!channel) return;

    const resultEmbed = EmbedManager.build({
      title: '🎉 Giveaway terminé 🎉',
      description:
        `**${giveaway.prize}**\n\n` +
        (winners.length > 0
          ? `Félicitations ${winners.map((w) => `<@${w}>`).join(', ')} !`
          : "Personne n'a participé, aucun gagnant."),
      footerText: `ID du giveaway : ${giveaway.id}`,
    });

    if (giveaway.messageId) {
      const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
      if (message) await message.edit({ embeds: [resultEmbed], components: [] }).catch(() => null);
    }

    await channel
      .send({
        content: winners.length > 0 ? winners.map((w) => `<@${w}>`).join(', ') : undefined,
        embeds: [resultEmbed],
      })
      .catch(() => null);
  }

  static stop() {
    if (this.interval) clearInterval(this.interval);
  }
}

module.exports = GiveawayService;
