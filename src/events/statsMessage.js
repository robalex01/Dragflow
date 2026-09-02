'use strict';

const StatsService = require('../services/StatsService');

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message) {
    if (message.author.bot || !message.guild) return;
    await StatsService.recordMessage(message.guild.id, message.author.id, message.channel.id);
  },
};
