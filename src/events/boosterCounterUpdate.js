'use strict';

const CounterService = require('../services/CounterService');

module.exports = {
  name: 'guildMemberUpdate',
  once: false,
  async execute(oldMember, newMember) {
    if (oldMember.premiumSince === newMember.premiumSince) return;
    await CounterService.updateAll(newMember.guild).catch(() => null);
  },
};
