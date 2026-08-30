'use strict';

const { PermissionsBitField } = require('discord.js');
const { config } = require('../config/config');
const { CustomPermission, CommandPermission, GuildMemberFlag } = require('../database/models');

/**
 * Niveaux de permissions de base (hiérarchie interne, du plus bas au plus haut).
 * Les permissions personnalisées créées via +newperm s'ajoutent à ce socle
 * et sont résolues au niveau du serveur (table CustomPermission).
 */
const BASE_PERMISSIONS = ['everyone', 'membre', 'helper', 'moderator', 'administrator', 'manager', 'owner', 'buyer'];

class PermissionManager {
  /**
   * Vrai si l'utilisateur est un owner GLOBAL du bot (défini dans .env, OWNER_IDS).
   */
  static isBotOwner(userId) {
    return config.bot.ownerIds.includes(userId);
  }

  /**
   * Vrai si l'utilisateur est blacklist sur ce serveur (ne peut utiliser aucune commande).
   */
  static async isBlacklisted(guildId, userId) {
    if (this.isBotOwner(userId)) return false;
    const flag = await GuildMemberFlag.findOne({
      where: { guildId, userId, flag: 'blacklist' },
    });
    return Boolean(flag);
  }

  /**
   * Vrai si l'utilisateur est whitelist (peut passer outre certaines protections).
   */
  static async isWhitelisted(guildId, userId) {
    const flag = await GuildMemberFlag.findOne({
      where: { guildId, userId, flag: 'whitelist' },
    });
    return Boolean(flag);
  }

  /**
   * Vrai si l'utilisateur est manager du bot sur ce serveur (+manager).
   */
  static async isManager(guildId, userId) {
    const flag = await GuildMemberFlag.findOne({
      where: { guildId, userId, flag: 'manager' },
    });
    return Boolean(flag);
  }

  /**
   * Récupère la liste des "holders" (rôles/utilisateurs/everyone) d'une permission
   * personnalisée pour un serveur donné.
   */
  static async getPermissionHolders(guildId, permissionName) {
    const perm = await CustomPermission.findOne({
      where: { guildId, name: permissionName.toLowerCase() },
    });
    return perm ? perm.holders : [];
  }

  /**
   * Détermine si un membre possède une permission personnalisée donnée,
   * en tenant compte de ses rôles et de son ID.
   */
  static async memberHasPermission(member, permissionName) {
    const normalized = permissionName.toLowerCase();

    if (normalized === 'everyone') return true;
    if (this.isBotOwner(member.id)) return true;
    if (normalized === 'owner') return this.isBotOwner(member.id);

    if (normalized === 'administrator') {
      return member.permissions.has(PermissionsBitField.Flags.Administrator);
    }

    if (normalized === 'manager') {
      return this.isManager(member.guild.id, member.id);
    }

    const holders = await this.getPermissionHolders(member.guild.id, normalized);
    if (holders.includes('everyone')) return true;
    if (holders.includes(member.id)) return true;

    const memberRoleIds = member.roles.cache.map((r) => r.id);
    return holders.some((h) => memberRoleIds.includes(h));
  }

  /**
   * Résout le nom de permission requis pour exécuter une commande sur un serveur,
   * en tenant compte des éventuelles surcharges (+setperm / +switch).
   * Retombe sur command.permission (valeur par défaut définie dans le fichier commande).
   */
  static async getRequiredPermission(guildId, command) {
    const override = await CommandPermission.findOne({
      where: { guildId, commandName: command.name },
    });
    if (override) return override.permissionName;
    return command.permission || 'everyone';
  }

  /**
   * Vérification complète avant l'exécution d'une commande :
   * 1. Blacklist
   * 2. Permissions Discord natives requises par la commande (userPermissions)
   * 3. Permission personnalisée requise (everyone/membre/.../owner ou perso)
   * 4. Permissions du bot lui-même (botPermissions) pour exécuter l'action
   *
   * Retourne { allowed: boolean, reason?: string }
   */
  static async check(message, command) {
    const { guild, member, channel, client } = message;

    if (await this.isBlacklisted(guild.id, member.id)) {
      return { allowed: false, reason: 'blacklisted' };
    }

    if (command.ownerOnly && !this.isBotOwner(member.id)) {
      return { allowed: false, reason: 'owner_only' };
    }

    if (Array.isArray(command.userPermissions) && command.userPermissions.length > 0) {
      const missing = command.userPermissions.filter(
        (perm) => !member.permissions.has(PermissionsBitField.Flags[perm])
      );
      if (missing.length > 0) {
        return { allowed: false, reason: 'missing_discord_permissions', missing };
      }
    }

    const requiredPermission = await this.getRequiredPermission(guild.id, command);
    const hasCustomPerm = await this.memberHasPermission(member, requiredPermission);
    if (!hasCustomPerm) {
      return { allowed: false, reason: 'missing_custom_permission', permission: requiredPermission };
    }

    if (Array.isArray(command.botPermissions) && command.botPermissions.length > 0) {
      const botMember = guild.members.me;
      const missingBot = command.botPermissions.filter(
        (perm) => !botMember.permissionsIn(channel).has(PermissionsBitField.Flags[perm])
      );
      if (missingBot.length > 0) {
        return { allowed: false, reason: 'missing_bot_permissions', missing: missingBot };
      }
    }

    return { allowed: true };
  }
}

module.exports = { PermissionManager, BASE_PERMISSIONS };
