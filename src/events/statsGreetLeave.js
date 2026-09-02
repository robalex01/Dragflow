'use strict';

const StatsService = require('../services/StatsService');

module.exports = {
  name: 'guildMemberRemove',
  once: false,
  async execute(member) {
    await StatsService.recordLeave(member.guild.id);
  },
};
