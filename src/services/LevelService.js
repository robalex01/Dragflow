'use strict';

const { LevelData } = require('../database/models');
const { randomInt } = require('../utils/hash');

const XP_COOLDOWN_MS = 60 * 1000;
const XP_MIN = 15;
const XP_MAX = 25;

/**
 * Calcule l'XP nécessaire pour passer du niveau `level` au niveau `level + 1`.
 * Formule progressive classique : plus le niveau est élevé, plus il faut d'XP.
 */
function xpRequiredForLevel(level) {
  return 5 * level * level + 50 * level + 100;
}

class LevelService {
  static async getOrCreate(guildId, userId) {
    const [data] = await LevelData.findOrCreate({ where: { guildId, userId } });
    return data;
  }

  /**
   * Ajoute de l'XP à un membre suite à un message, avec un cooldown anti-spam.
   * Retourne { leveledUp, newLevel } si le membre vient de monter de niveau.
   */
  static async addXpFromMessage(guildId, userId) {
    const data = await this.getOrCreate(guildId, userId);

    const now = Date.now();
    const lastMessage = data.lastMessageAt ? new Date(data.lastMessageAt).getTime() : 0;
    if (now - lastMessage < XP_COOLDOWN_MS) return null;

    data.lastMessageAt = new Date();
    data.xp += randomInt(XP_MIN, XP_MAX);

    let leveledUp = false;
    while (data.xp >= xpRequiredForLevel(data.level)) {
      data.xp -= xpRequiredForLevel(data.level);
      data.level += 1;
      leveledUp = true;
    }

    await data.save();
    return leveledUp ? { leveledUp: true, newLevel: data.level } : null;
  }

  static async addLevels(guildId, userId, amount) {
    const data = await this.getOrCreate(guildId, userId);
    data.level = Math.max(0, data.level + amount);
    data.xp = 0;
    await data.save();
    return data;
  }

  static async getRank(guildId, userId) {
    const all = await LevelData.findAll({ where: { guildId }, order: [['level', 'DESC'], ['xp', 'DESC']] });
    const index = all.findIndex((d) => d.userId === userId);
    return { position: index === -1 ? null : index + 1, total: all.length };
  }

  static async getLeaderboard(guildId, limit = 10) {
    return LevelData.findAll({
      where: { guildId },
      order: [['level', 'DESC'], ['xp', 'DESC']],
      limit,
    });
  }

  static xpRequiredForLevel = xpRequiredForLevel;
}

module.exports = LevelService;
