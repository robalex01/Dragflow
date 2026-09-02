'use strict';

const { DataTypes, Model } = require('sequelize');

class MemberStats extends Model {}

function initMemberStats(sequelize) {
  MemberStats.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      guildId: { type: DataTypes.STRING, allowNull: false },
      userId: { type: DataTypes.STRING, allowNull: false },
      messages: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      voiceSeconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      lastMessageAt: { type: DataTypes.DATE, allowNull: true },
      // Horodatage de connexion vocale en cours (null si pas en vocal actuellement)
      voiceJoinedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: 'MemberStats',
      tableName: 'member_stats',
      timestamps: true,
      indexes: [{ unique: true, fields: ['guildId', 'userId'] }],
    }
  );
  return MemberStats;
}

module.exports = { MemberStats, initMemberStats };
