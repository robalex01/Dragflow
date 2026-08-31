'use strict';

const { PermissionsBitField } = require('discord.js');
const GuildConfigService = require('./GuildConfigService');

/**
 * Centralise la lecture/écriture des réglages de protection (GuildConfig.protectionSettings)
 * et détermine si un membre est exempté des protections automatiques
 * (modérateurs avec ManageMessages/ManageGuild, ou owner du bot).
 */
class ProtectionService {
  static async getSettings(guildId) {
    const guildConfig = await GuildConfigService.getOrCreate(guildId);
    return guildConfig.protectionSettings || {};
  }

  static async isEnabled(guildId, key) {
    const settings = await this.getSettings(guildId);
    return Boolean(settings[key]);
  }

  static async setEnabled(guildId, key, value) {
    const settings = await this.getSettings(guildId);
    settings[key] = value;
    return GuildConfigService.update(guildId, { protectionSettings: settings });
  }

  static async getAntileakSettings(guildId) {
    const settings = await this.getSettings(guildId);
    return settings.antileak || { token: true, ipv4: false, email: false, phone: false };
  }

  static async setAntileakSetting(guildId, subKey, value) {
    const settings = await this.getSettings(guildId);
    settings.antileak = { ...(settings.antileak || {}), [subKey]: value };
    return GuildConfigService.update(guildId, { protectionSettings: settings });
  }

  static async setSecurityLevel(guildId, level) {
    const settings = await this.getSettings(guildId);
    settings.securityLevel = level;

    if (level === 'low') {
      Object.assign(settings, { antispam: false, antilink: false, antiinvite: false, firewall: false, imgmod: false });
    } else if (level === 'medium') {
      Object.assign(settings, { antispam: true, antilink: true, antiinvite: true, firewall: false, imgmod: false });
    } else if (level === 'max') {
      Object.assign(settings, {
        antispam: true,
        antilink: true,
        antiinvite: true,
        antialt: true,
        firewall: true,
        imgmod: true,
        raidmode: true,
      });
    }

    return GuildConfigService.update(guildId, { protectionSettings: settings });
  }

  /**
   * Un membre est exempté des protections automatiques s'il peut gérer les
   * messages ou le serveur (considéré comme staff), ou s'il est owner du bot.
   */
  static isExempt(member) {
    if (!member) return true;
    return (
      member.permissions.has(PermissionsBitField.Flags.ManageMessages) ||
      member.permissions.has(PermissionsBitField.Flags.ManageGuild) ||
      member.permissions.has(PermissionsBitField.Flags.Administrator)
    );
  }
}

module.exports = ProtectionService;
