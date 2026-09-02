'use strict';

const { DataTypes, Model } = require('sequelize');

class GiveawayParticipant extends Model {}

function initGiveawayParticipant(sequelize) {
  GiveawayParticipant.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      giveawayId: { type: DataTypes.INTEGER, allowNull: false },
      userId: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      modelName: 'GiveawayParticipant',
      tableName: 'giveaway_participants',
      timestamps: true,
      indexes: [{ unique: true, fields: ['giveawayId', 'userId'] }],
    }
  );
  return GiveawayParticipant;
}

module.exports = { GiveawayParticipant, initGiveawayParticipant };
