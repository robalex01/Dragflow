'use strict';

const StatsService = require('../services/StatsService');

module.exports = {
  name: 'guildMemberAdd',
  once: false,
  async execute(member) {
    await StatsService.recordJoin(member.guild.id);
  },
};
