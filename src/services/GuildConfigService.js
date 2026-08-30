'use strict';

const { GuildConfig } = require('../database/models');
const { config } = require('../config/config');
const Logger = require('../utils/Logger');

/**
 * Centralise l'accès à la configuration d'un serveur (prefix, couleur, logs, ...)
 * avec un cache mémoire pour éviter des requêtes SQL répétées à chaque message.
 */
class GuildConfigService {
  constructor() {
    /** @type {Map<string, import('../database/models/GuildConfig').GuildConfig>} */
    this.cache = new Map();
  }

  async getOrCreate(guildId) {
    if (this.cache.has(guildId)) {
      return this.cache.get(guildId);
    }

    const [guildConfig] = await GuildConfig.findOrCreate({
      where: { guildId },
      defaults: {
        guildId,
        prefix: config.bot.defaultPrefix,
        embedColor: config.embeds.color,
      },
    });

    this.cache.set(guildId, guildConfig);
    return guildConfig;
  }

  async getPrefix(guildId) {
    const guildConfig = await this.getOrCreate(guildId);
    return guildConfig.prefix || config.bot.defaultPrefix;
  }

  async setPrefix(guildId, newPrefix) {
    const guildConfig = await this.getOrCreate(guildId);
    guildConfig.prefix = newPrefix;
    await guildConfig.save();
    this.cache.set(guildId, guildConfig);
    Logger.info(`Préfixe du serveur ${guildId} changé pour "${newPrefix}".`);
    return guildConfig;
  }

  async getEmbedColor(guildId) {
    const guildConfig = await this.getOrCreate(guildId);
    return guildConfig.embedColor || config.embeds.color;
  }

  async update(guildId, patch) {
    const guildConfig = await this.getOrCreate(guildId);
    Object.assign(guildConfig, patch);
    await guildConfig.save();
    this.cache.set(guildId, guildConfig);
    return guildConfig;
  }

  invalidate(guildId) {
    this.cache.delete(guildId);
  }
}

module.exports = new GuildConfigService();
