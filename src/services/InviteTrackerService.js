'use strict';

const { InviteData, InviteReward } = require('../database/models');
const Logger = require('../utils/Logger');

/**
 * Suit les invitations utilisées pour attribuer les arrivées au bon membre.
 * Maintient un cache mémoire (guildId -> Map<code, uses>) rafraîchi à chaque
 * arrivée de membre et comparé pour déterminer quelle invitation a servi.
 */
class InviteTrackerService {
  constructor() {
    /** @type {Map<string, Map<string, number>>} */
    this.cache = new Map();
  }

  async cacheGuildInvites(guild) {
    try {
      const invites = await guild.invites.fetch();
      const map = new Map(invites.map((inv) => [inv.code, inv.uses || 0]));
      this.cache.set(guild.id, map);
    } catch (error) {
      Logger.error(`Impossible de mettre en cache les invitations de ${guild.id}.`, error);
    }
  }

  async cacheAllGuilds(client) {
    for (const guild of client.guilds.cache.values()) {
      await this.cacheGuildInvites(guild);
    }
    Logger.success(`InviteTrackerService : invitations mises en cache pour ${client.guilds.cache.size} serveur(s).`);
  }

  /**
   * Compare les invitations actuelles à celles en cache pour déterminer
   * laquelle a été utilisée par le nouveau membre, puis met à jour le cache.
   */
  async resolveUsedInvite(guild) {
    const before = this.cache.get(guild.id) || new Map();
    let after;
    try {
      after = await guild.invites.fetch();
    } catch (error) {
      Logger.error(`Impossible de récupérer les invitations de ${guild.id}.`, error);
      return null;
    }

    const afterMap = new Map(after.map((inv) => [inv.code, inv.uses || 0]));
    this.cache.set(guild.id, afterMap);

    for (const invite of after.values()) {
      const previousUses = before.get(invite.code) || 0;
      if ((invite.uses || 0) > previousUses) {
        return invite;
      }
    }

    return null;
  }

  async getOrCreate(guildId, userId) {
    const [data] = await InviteData.findOrCreate({ where: { guildId, userId } });
    return data;
  }

  netInvites(data) {
    return data.invites - data.leaves + data.bonus;
  }

  async checkRewards(guild, userId) {
    const data = await this.getOrCreate(guild.id, userId);
    const net = this.netInvites(data);
    const rewards = await InviteReward.findAll({ where: { guildId: guild.id } });

    for (const reward of rewards) {
      if (net >= reward.invitesRequired) {
        const member = await guild.members.fetch(userId).catch(() => null);
        const role = guild.roles.cache.get(reward.roleId);
        if (member && role && !member.roles.cache.has(role.id)) {
          await member.roles.add(role, 'Récompense de parrainage (+invitereward)').catch(() => null);
        }
      }
    }
  }
}

module.exports = new InviteTrackerService();
