'use strict';

const { DataTypes, Model } = require('sequelize');

class Infraction extends Model {}

function initInfraction(sequelize) {
  Infraction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      guildId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // Numéro d'infraction, propre à chaque (guildId, userId), utilisé pour +unwarn <id>
      caseNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      moderatorId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('ban', 'tempban', 'unban', 'kick', 'warn', 'mute', 'unmute'),
        allowNull: false,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Pour les warns : false si retiré via +unwarn
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Infraction',
      tableName: 'infractions',
      timestamps: true,
    }
  );

  return Infraction;
}

module.exports = { Infraction, initInfraction };
