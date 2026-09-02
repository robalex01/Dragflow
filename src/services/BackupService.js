'use strict';

const { Backup, GuildConfig } = require('../database/models');
const Logger = require('../utils/Logger');

const AUTO_BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // vérifie une fois par jour
const SWEEP_CHECK_MS = 60 * 60 * 1000; // vérifie toutes les heures si une sauvegarde quotidienne est due

class BackupService {
  /**
   * Crée un instantané de la structure du serveur (salons, catégories, rôles)
   * — pas les messages. Sert de sauvegarde de configuration, pas de contenu.
   */
  static async createBackup(guild) {
    const roles = guild.roles.cache
      .filter((r) => r.id !== guild.id)
      .map((r) => ({
        name: r.name,
        color: r.color,
        permissions: r.permissions.bitfield.toString(),
        position: r.position,
        hoist: r.hoist,
        mentionable: r.mentionable,
      }));

    const channels = guild.channels.cache.map((c) => ({
      name: c.name,
      type: c.type,
      parentId: c.parentId,
      position: c.position,
    }));

    const data = {
      guildName: guild.name,
      roles,
      channels,
      createdAt: new Date().toISOString(),
    };

    return Backup.create({ guildId: guild.id, data });
  }

  static async listBackups(guildId, limit = 10) {
    return Backup.findAll({ where: { guildId }, order: [['createdAt', 'DESC']], limit });
  }

  static start(client) {
    this.client = client;
    this.interval = setInterval(() => this.runSweep(), SWEEP_CHECK_MS);
    Logger.success('BackupService démarré (+autobackup).');
  }

  static async runSweep() {
    try {
      const guildsWithAutoBackup = await GuildConfig.findAll({ where: { autoBackupEnabled: true } });

      for (const config of guildsWithAutoBackup) {
        const guild = this.client.guilds.cache.get(config.guildId);
        if (!guild) continue;

        const lastBackup = await Backup.findOne({ where: { guildId: guild.id }, order: [['createdAt', 'DESC']] });
        const lastTime = lastBackup ? new Date(lastBackup.createdAt).getTime() : 0;

        if (Date.now() - lastTime >= AUTO_BACKUP_INTERVAL_MS) {
          await this.createBackup(guild);
          Logger.info(`Sauvegarde automatique créée pour ${guild.name} (${guild.id}).`);
        }
      }
    } catch (error) {
      Logger.error('Erreur lors du balayage des sauvegardes automatiques.', error);
    }
  }

  static stop() {
    if (this.interval) clearInterval(this.interval);
  }
}

module.exports = BackupService;
