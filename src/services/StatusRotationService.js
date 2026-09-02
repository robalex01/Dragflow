'use strict';

const { ActivityType } = require('discord.js');
const { BotSettings } = require('../database/models');
const { config } = require('../config/config');
const Logger = require('../utils/Logger');

const ROTATION_INTERVAL_MS = 30 * 1000;

class StatusRotationService {
  static init(client) {
    this.client = client;
    this.index = 0;
    this.enabled = false;

    BotSettings.findOrCreate({ where: { id: 1 } }).then(([settings]) => {
      this.enabled = settings.statusRotatorEnabled;
      if (this.enabled) this.start();
    });
  }

  static getStatuses() {
    const client = this.client;
    return [
      { type: ActivityType.Watching, name: `${config.bot.defaultPrefix}help` },
      { type: ActivityType.Watching, name: `${client.guilds.cache.size} serveurs` },
      { type: ActivityType.Listening, name: `${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} membres` },
    ];
  }

  static start() {
    this.enabled = true;
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => this.tick(), ROTATION_INTERVAL_MS);
    this.tick();
    Logger.success('StatusRotationService démarré.');
  }

  static tick() {
    const statuses = this.getStatuses();
    const status = statuses[this.index % statuses.length];
    this.index += 1;
    this.client.user.setActivity(status.name, { type: status.type });
  }

  static stop() {
    this.enabled = false;
    if (this.interval) clearInterval(this.interval);
  }

  static async setEnabled(enabled) {
    const [settings] = await BotSettings.findOrCreate({ where: { id: 1 } });
    settings.statusRotatorEnabled = enabled;
    await settings.save();

    if (enabled) this.start();
    else this.stop();
  }
}

module.exports = StatusRotationService;
