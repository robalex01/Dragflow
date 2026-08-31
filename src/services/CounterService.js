'use strict';

const { Counter } = require('../database/models');
const Logger = require('../utils/Logger');

/**
 * Met à jour le nom des salons-compteurs (+counter) en fonction du nombre
 * de membres/humains/bots/boosters du serveur. Discord limite les changements
 * de nom de salon à 2 par 10 minutes : on évite les appels inutiles en ne
 * renommant que si la valeur affichée a réellement changé.
 */
class CounterService {
  static computeCount(guild, type) {
    switch (type) {
      case 'members':
        return guild.memberCount;
      case 'humans':
        return guild.members.cache.filter((m) => !m.user.bot).size;
      case 'bots':
        return guild.members.cache.filter((m) => m.user.bot).size;
      case 'boosters':
        return guild.premiumSubscriptionCount || 0;
      default:
        return 0;
    }
  }

  static async updateAll(guild) {
    const counters = await Counter.findAll({ where: { guildId: guild.id } });

    for (const counter of counters) {
      const channel = guild.channels.cache.get(counter.channelId);
      if (!channel) continue;

      const count = this.computeCount(guild, counter.type);
      const newName = counter.template.replace('{count}', count);

      if (channel.name !== newName) {
        await channel.setName(newName).catch((error) => {
          Logger.error(`Impossible de mettre à jour le compteur ${counter.id}.`, error);
        });
      }
    }
  }
}

module.exports = CounterService;
