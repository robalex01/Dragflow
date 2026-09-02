'use strict';

const { DataTypes, Model } = require('sequelize');

class Giveaway extends Model {}

function initGiveaway(sequelize) {
  Giveaway.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      guildId: { type: DataTypes.STRING, allowNull: false },
      channelId: { type: DataTypes.STRING, allowNull: false },
      messageId: { type: DataTypes.STRING, allowNull: true },
      hostId: { type: DataTypes.STRING, allowNull: false },
      prize: { type: DataTypes.STRING(200), allowNull: false },
      winnerCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      endsAt: { type: DataTypes.DATE, allowNull: false },
      ended: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      winnerIds: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    },
    {
      sequelize,
      modelName: 'Giveaway',
      tableName: 'giveaways',
      timestamps: true,
    }
  );
  return Giveaway;
}

module.exports = { Giveaway, initGiveaway };
