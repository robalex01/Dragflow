'use strict';

const { Op } = require('sequelize');
const { RecurringMessage } = require('../database/models');
const Logger = require('../utils/Logger');

const SWEEP_INTERVAL_MS = 30 * 1000;

/**
 * Envoie les messages récurrents (+recurmsg) dont l'intervalle est écoulé.
 * Un balayage périodique (plutôt qu'un setInterval par message) permet de
 * gérer un nombre arbitraire de messages récurrents sans fuite de timers,
 * et de survivre à un redémarrage du bot (lastSentAt est persisté en DB).
 */
class RecurringMessageService {
  static start(client) {
    this.client = client;
    this.interval = setInterval(() => this.runSweep(), SWEEP_INTERVAL_MS);
    Logger.success('RecurringMessageService démarré (+recurmsg).');
  }

  static async runSweep() {
    try {
      const messages = await RecurringMessage.findAll();
      const now = Date.now();

      for (const msg of messages) {
        const lastSent = msg.lastSentAt ? new Date(msg.lastSentAt).getTime() : 0;
        if (now - lastSent < Number(msg.intervalMs)) continue;

        const guild = this.client.guilds.cache.get(msg.guildId);
        const channel = guild?.channels.cache.get(msg.channelId);

        if (channel && channel.isTextBased()) {
          await channel.send({ content: msg.content }).catch(() => null);
        }

        msg.lastSentAt = new Date();
        await msg.save();
      }
    } catch (error) {
      Logger.error('Erreur lors du balayage des messages récurrents.', error);
    }
  }

  static stop() {
    if (this.interval) clearInterval(this.interval);
  }
}

module.exports = RecurringMessageService;
