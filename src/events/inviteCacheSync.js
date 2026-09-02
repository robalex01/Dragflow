'use strict';

const inviteTracker = require('../services/InviteTrackerService');

module.exports = {
  name: 'inviteCreate',
  once: false,
  async execute(invite) {
    await inviteTracker.cacheGuildInvites(invite.guild);
  },
};
