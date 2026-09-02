'use strict';

const { MemberStats, ChannelStats, GuildStats } = require('../database/models');

class StatsService {
  static async getOrCreateMember(guildId, userId) {
    const [data] = await MemberStats.findOrCreate({ where: { guildId, userId } });
    return data;
  }

  static async getOrCreateGuild(guildId) {
    const [data] = await GuildStats.findOrCreate({ where: { guildId } });
    return data;
  }

  static async recordMessage(guildId, userId, channelId) {
    const memberData = await this.getOrCreateMember(guildId, userId);
    memberData.messages += 1;
    memberData.lastMessageAt = new Date();
    await memberData.save();

    const [channelData] = await ChannelStats.findOrCreate({ where: { guildId, channelId } });
    channelData.messages += 1;
    await channelData.save();

    const guildData = await this.getOrCreateGuild(guildId);
    const hour = new Date().getHours();
    const hourly = [...guildData.hourlyActivity];
    hourly[hour] = (hourly[hour] || 0) + 1;
    guildData.hourlyActivity = hourly;
    await guildData.save();
  }

  static async recordJoin(guildId) {
    const data = await this.getOrCreateGuild(guildId);
    data.totalJoins += 1;
    await data.save();
  }

  static async recordLeave(guildId) {
    const data = await this.getOrCreateGuild(guildId);
    data.totalLeaves += 1;
    await data.save();
  }

  static async voiceJoin(guildId, userId) {
    const data = await this.getOrCreateMember(guildId, userId);
    if (!data.voiceJoinedAt) {
      data.voiceJoinedAt = new Date();
      await data.save();
    }
  }

  static async voiceLeave(guildId, userId) {
    const data = await this.getOrCreateMember(guildId, userId);
    if (data.voiceJoinedAt) {
      const seconds = Math.floor((Date.now() - new Date(data.voiceJoinedAt).getTime()) / 1000);
      data.voiceSeconds += Math.max(0, seconds);
      data.voiceJoinedAt = null;
      await data.save();
    }
  }

  static async getRank(guildId, userId, field) {
    const all = await MemberStats.findAll({ where: { guildId }, order: [[field, 'DESC']] });
    const index = all.findIndex((d) => d.userId === userId);
    return { position: index === -1 ? null : index + 1, total: all.length };
  }

  static async getTopChannels(guildId, limit = 10) {
    return ChannelStats.findAll({ where: { guildId }, order: [['messages', 'DESC']], limit });
  }

  static async getTopMembers(guildId, field, limit = 10) {
    return MemberStats.findAll({ where: { guildId }, order: [[field, 'DESC']], limit });
  }

  static formatVoiceDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h${minutes.toString().padStart(2, '0')}`;
    return `${minutes}min`;
  }
}

module.exports = StatsService;
