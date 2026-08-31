'use strict';

const { Op } = require('sequelize');
const { TempAction } = require('../database/models');
const InfractionService = require('./InfractionService');
const ModLogService = require('./ModLogService');
const Logger = require('../utils/Logger');

const SWEEP_INTERVAL_MS = 60 * 1000; // vérifie les actions expirées toutes les minutes

/**
 * Gère les actions temporisées persistantes (tempban, temprole) afin qu'elles
 * survivent à un redémarrage du bot. Un balayage périodique (plutôt qu'un
 * setTimeout par action) évite les limites de setTimeout sur les longues durées
 * (> ~24,8 jours) et garantit l'exécution même après un arrêt prolongé du bot.
 */
class TempActionService {
  static start(client) {
    this.client = client;
    this.runSweep(); // exécution immédiate au démarrage (rattrape les actions manquées)
    this.interval = setInterval(() => this.runSweep(), SWEEP_INTERVAL_MS);
    Logger.success('TempActionService démarré (tempban/temprole).');
  }

  static async runSweep() {
    try {
      const dueActions = await TempAction.findAll({
        where: { executed: false, expiresAt: { [Op.lte]: new Date() } },
      });

      for (const action of dueActions) {
        await this.execute(action);
      }
    } catch (error) {
      Logger.error("Erreur lors du balayage des actions temporisées.", error);
    }
  }

  static async execute(action) {
    const guild = this.client.guilds.cache.get(action.guildId);
    if (!guild) {
      action.executed = true;
      await action.save();
      return;
    }

    try {
      if (action.type === 'tempban') {
        await guild.bans.remove(action.userId, 'Fin du bannissement temporaire.').catch(() => null);
        await InfractionService.create({
          guildId: action.guildId,
          userId: action.userId,
          moderatorId: this.client.user.id,
          type: 'unban',
          reason: 'Fin automatique du bannissement temporaire.',
        });
        await ModLogService.send(guild, {
          title: '⏰ Fin de bannissement temporaire',
          fields: [{ name: 'Utilisateur', value: `<@${action.userId}> (${action.userId})` }],
        });
      } else if (action.type === 'temprole') {
        const member = await guild.members.fetch(action.userId).catch(() => null);
        if (member && action.roleId && member.roles.cache.has(action.roleId)) {
          await member.roles.remove(action.roleId, 'Fin du rôle temporaire.').catch(() => null);
          await ModLogService.send(guild, {
            title: '⏰ Fin de rôle temporaire',
            fields: [
              { name: 'Utilisateur', value: `<@${action.userId}>` },
              { name: 'Rôle', value: `<@&${action.roleId}>` },
            ],
          });
        }
      }
    } catch (error) {
      Logger.error(`Erreur lors de l'exécution de l'action temporisée #${action.id}.`, error);
    }

    action.executed = true;
    await action.save();
  }

  static async schedule({ guildId, userId, type, roleId = null, reason = null, expiresAt }) {
    return TempAction.create({ guildId, userId, type, roleId, reason, expiresAt });
  }

  static stop() {
    if (this.interval) clearInterval(this.interval);
  }
}

module.exports = TempActionService;
