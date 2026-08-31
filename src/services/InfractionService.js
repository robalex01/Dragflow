'use strict';

const { Infraction } = require('../database/models');

/**
 * Gère la création et la numérotation des infractions (ban, kick, warn, mute...).
 * Le numéro de cas (caseNumber) est propre à chaque (guildId, userId) et sert
 * d'identifiant pour +unwarn <id>.
 */
class InfractionService {
  static async create({ guildId, userId, moderatorId, type, reason }) {
    const lastCase = await Infraction.findOne({
      where: { guildId, userId },
      order: [['caseNumber', 'DESC']],
    });

    const caseNumber = lastCase ? lastCase.caseNumber + 1 : 1;

    return Infraction.create({
      guildId,
      userId,
      moderatorId,
      type,
      reason: reason || 'Aucune raison fournie.',
      caseNumber,
    });
  }

  static async getHistory(guildId, userId) {
    return Infraction.findAll({
      where: { guildId, userId },
      order: [['createdAt', 'DESC']],
    });
  }

  static async getActiveWarns(guildId, userId) {
    return Infraction.findAll({
      where: { guildId, userId, type: 'warn', active: true },
      order: [['caseNumber', 'ASC']],
    });
  }

  static async deactivateWarn(guildId, userId, caseNumber) {
    const warn = await Infraction.findOne({
      where: { guildId, userId, type: 'warn', caseNumber },
    });
    if (!warn) return null;
    warn.active = false;
    await warn.save();
    return warn;
  }

  static async clearWarns(guildId, userId) {
    return Infraction.update(
      { active: false },
      { where: { guildId, userId, type: 'warn' } }
    );
  }
}

module.exports = InfractionService;
