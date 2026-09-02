'use strict';

const inviteTracker = require('../services/InviteTrackerService');
const GiveawayService = require('../services/GiveawayService');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    await inviteTracker.cacheAllGuilds(client);
    GiveawayService.start(client);
  },
};
