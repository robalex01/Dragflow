'use strict';

const inviteTracker = require('../services/InviteTrackerService');
const { InviteJoin } = require('../database/models');

module.exports = {
  name: 'guildMemberAdd',
  once: false,
  async execute(member) {
    const usedInvite = await inviteTracker.resolveUsedInvite(member.guild);
    const inviterId = usedInvite?.inviter?.id || null;

    await InviteJoin.create({
      guildId: member.guild.id,
      memberId: member.id,
      inviterId,
      inviteCode: usedInvite?.code || null,
    });

    if (inviterId) {
      const data = await inviteTracker.getOrCreate(member.guild.id, inviterId);
      data.invites += 1;
      await data.save();
      await inviteTracker.checkRewards(member.guild, inviterId);
    }
  },
};
