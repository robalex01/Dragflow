'use strict';

const StatsService = require('../services/StatsService');

module.exports = {
  name: 'voiceStateUpdate',
  once: false,
  async execute(oldState, newState) {
    const guildId = (newState.guild || oldState.guild).id;
    const userId = newState.id || oldState.id;
    if (!userId) return;

    const wasInVoice = Boolean(oldState.channelId);
    const isInVoice = Boolean(newState.channelId);

    // Rejoint un salon vocal pour la première fois (n'était dans aucun salon avant)
    if (!wasInVoice && isInVoice) {
      await StatsService.voiceJoin(guildId, userId);
    }

    // Quitte complètement le vocal (aucun nouveau salon)
    if (wasInVoice && !isInVoice) {
      await StatsService.voiceLeave(guildId, userId);
    }
  },
};
