'use strict';

const { DataTypes, Model } = require('sequelize');

class ChannelStats extends Model {}

function initChannelStats(sequelize) {
  ChannelStats.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      guildId: { type: DataTypes.STRING, allowNull: false },
      channelId: { type: DataTypes.STRING, allowNull: false },
      messages: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {
      sequelize,
      modelName: 'ChannelStats',
      tableName: 'channel_stats',
      timestamps: true,
      indexes: [{ unique: true, fields: ['guildId', 'channelId'] }],
    }
  );
  return ChannelStats;
}

module.exports = { ChannelStats, initChannelStats };
