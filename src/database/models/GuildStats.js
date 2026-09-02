'use strict';

const { DataTypes, Model } = require('sequelize');

class GuildStats extends Model {}

function initGuildStats(sequelize) {
  GuildStats.init(
    {
      guildId: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
      totalJoins: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      totalLeaves: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      // Distribution des messages par heure (0-23), cumulée depuis le début du tracking
      hourlyActivity: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: Array(24).fill(0),
      },
    },
    {
      sequelize,
      modelName: 'GuildStats',
      tableName: 'guild_stats',
      timestamps: true,
    }
  );
  return GuildStats;
}

module.exports = { GuildStats, initGuildStats };
