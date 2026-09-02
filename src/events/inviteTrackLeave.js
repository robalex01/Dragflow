'use strict';

const inviteTracker = require('../services/InviteTrackerService');
const { InviteJoin } = require('../database/models');

module.exports = {
  name: 'guildMemberRemove',
  once: false,
  async execute(member) {
    const joinRecord = await InviteJoin.findOne({
      where: { guildId: member.guild.id, memberId: member.id },
      order: [['createdAt', 'DESC']],
    });

    if (joinRecord?.inviterId) {
      const data = await inviteTracker.getOrCreate(member.guild.id, joinRecord.inviterId);
      data.leaves += 1;
      await data.save();
    }
  },
};
